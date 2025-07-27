import { useState, useCallback } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

// Initialize FingerprintJS agent
let fpPromise: Promise<any> | null = null;

// Generate browser fingerprint using FingerprintJS (industry standard)
async function generateBrowserHash(): Promise<string> {
  try {
    // Initialize FingerprintJS agent only once
    if (!fpPromise) {
      fpPromise = FingerprintJS.load();
    }
    
    const fp = await fpPromise;
    const result = await fp.get();
    
    // FingerprintJS returns a stable, 20-character visitor ID
    return result.visitorId;
  } catch (error) {
    console.error('FingerprintJS error, falling back to basic hash:', error);
    
    // Fallback to basic fingerprinting if FingerprintJS fails
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('Browser fingerprint fallback', 10, 10);
    const canvasHash = canvas.toDataURL();
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.platform,
      navigator.hardwareConcurrency || '0',
      canvasHash
    ].join('|');
    
    // Use Web Crypto API for robust hashing
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Return first 32 characters to ensure it meets API requirements (10-64 chars)
    return hashHex.substring(0, 32);
  }
}

const API_BASE_URL = 'http://localhost:8001';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'error';
  isValidationError?: boolean; // Track if error is due to validation (non-retryable)
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  isConnected: boolean;
  error: string | null;
  messageCount: number;
  messageLimit: number;
  isSessionExpired: boolean;
}

export function useChatApi() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isTyping: false,
    isConnected: true,
    error: null,
    messageCount: 0,
    messageLimit: 50,
    isSessionExpired: false,
  });

  // Load chat history from backend
  const loadChatHistory = useCallback(async (jwtToken: string) => {
    try {
      const browserHash = await generateBrowserHash();
      
      const response = await fetch(`${API_BASE_URL}/chat/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
          'X-Browser-Hash': browserHash,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setChatState(prev => ({ ...prev, isSessionExpired: true }));
          return;
        }
        throw new Error('Failed to load chat history');
      }

      const data = await response.json();
      
      // Convert backend messages to our frontend format
      const loadedMessages: Message[] = [];
      
      // Process each message from history first
      data.messages.forEach((msg: any) => {
        // Add user message
        loadedMessages.push({
          id: msg.id,
          text: msg.message,
          sender: 'user',
          timestamp: new Date(msg.timestamp),
          status: 'sent',
        });
        
        // Add assistant response if exists
        if (msg.response) {
          loadedMessages.push({
            id: `${msg.id}-response`,
            text: msg.response,
            sender: 'support',
            timestamp: new Date(new Date(msg.timestamp).getTime() + 1000), // 1 second after user message
            status: 'delivered',
          });
        }
      });
      
      // Sort messages by timestamp
      loadedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      // Update state with loaded messages and count
      setChatState(prev => ({
        ...prev,
        messages: loadedMessages,
        messageCount: data.total_count || 0,
      }));
      
      // Save message count to localStorage
      const savedEmailHash = localStorage.getItem('chat-email-hash');
      if (savedEmailHash && data.total_count) {
        localStorage.setItem(`chat-message-count-${savedEmailHash}`, data.total_count.toString());
      }
      
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // Don't show error to user, just continue with empty chat
    }
  }, []);

  // Load message count from localStorage on component mount
  const loadMessageCount = useCallback(() => {
    const savedEmailHash = localStorage.getItem('chat-email-hash');
    if (savedEmailHash) {
      const savedCount = localStorage.getItem(`chat-message-count-${savedEmailHash}`);
      if (savedCount) {
        const count = parseInt(savedCount, 10);
        if (!isNaN(count) && count >= 0) {
          setChatState(prev => ({ ...prev, messageCount: count }));
        }
      }
    }
  }, []);

  // Save message count to localStorage
  const saveMessageCount = useCallback((count: number) => {
    const savedEmailHash = localStorage.getItem('chat-email-hash');
    if (savedEmailHash) {
      localStorage.setItem(`chat-message-count-${savedEmailHash}`, count.toString());
    }
  }, []);

  // Reset message count for new session
  const resetMessageCount = useCallback(() => {
    setChatState(prev => ({ ...prev, messageCount: 0 }));
    const savedEmailHash = localStorage.getItem('chat-email-hash');
    if (savedEmailHash) {
      localStorage.removeItem(`chat-message-count-${savedEmailHash}`);
    }
  }, []);

  // Clear chat and start fresh
  const clearChatAndStartFresh = useCallback(() => {
    setChatState({
      messages: [],
      isTyping: false,
      isConnected: true,
      error: null,
      messageCount: 0,
      messageLimit: 50,
      isSessionExpired: false,
    });
    
    // Clear session data but keep validated email for convenience
    localStorage.removeItem('chat-session-hash');
    localStorage.removeItem('chat-email-hash');
    
    // Clear message count for any existing sessions
    const savedEmailHash = localStorage.getItem('chat-email-hash');
    if (savedEmailHash) {
      localStorage.removeItem(`chat-message-count-${savedEmailHash}`);
    }
  }, []);

  const sendMessage = useCallback(async (text: string, jwtToken: string) => {
    if (!text.trim() || !jwtToken.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    };

    // Add user message immediately and increment count
    setChatState(prev => {
      const newCount = prev.messageCount + 1;
      saveMessageCount(newCount);
      return {
        ...prev,
        messages: [...prev.messages, userMessage],
        messageCount: newCount,
        error: null,
      };
    });

    try {
      const browserHash = await generateBrowserHash();
      
      // Send message to actual API with JWT authentication
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
          'X-Browser-Hash': browserHash,
        },
        body: JSON.stringify({
          message: text,
          honeypot: ''
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let apiError = 'Failed to send message';
        let isValidationError = false;
        
        // Handle different API error response formats
        if (errorData.error) {
          apiError = errorData.error;
        } else if (errorData.detail) {
          // Handle FastAPI validation errors
          if (Array.isArray(errorData.detail)) {
            // Pydantic validation errors
            isValidationError = true; // Mark as validation error
            const validationErrors = errorData.detail.map((err: any) => {
              if (err.type === 'string_too_long') {
                return `${err.loc ? err.loc.join('.') : 'Field'} is too long (max ${err.ctx?.max_length || 'allowed'} characters)`;
              } else if (err.type === 'string_too_short') {
                return `${err.loc ? err.loc.join('.') : 'Field'} is too short (min ${err.ctx?.min_length || 'required'} characters)`;
              } else if (err.type === 'value_error') {
                return err.msg || 'Invalid value';
              } else {
                return err.msg || `Validation error: ${err.type}`;
              }
            });
            apiError = validationErrors.join(', ');
          } else if (typeof errorData.detail === 'string') {
            apiError = errorData.detail;
            // Check for message limit error
            if (response.status === 429 && apiError.includes('Message limit exceeded')) {
              // Don't increment count on limit error - revert the increment
              setChatState(prev => {
                const revertedCount = Math.max(0, prev.messageCount - 1);
                saveMessageCount(revertedCount);
                return {
                  ...prev,
                  messageCount: revertedCount,
                };
              });
            }
          }
        } else if (errorData.message) {
          apiError = errorData.message;
        }
        
        const error = new Error(apiError);
        (error as any).isValidationError = isValidationError;
        throw error;
      }

      // Mark message as sent
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        ),
      }));

      // Get actual API response
      const data = await response.json();
      
      // Simulate typing indicator for support response
      setChatState(prev => ({ ...prev, isTyping: true }));

      // Add support response from API
      setTimeout(() => {
        const supportMessage: Message = {
          id: data.message_id || `support-${Date.now()}`,
          text: data.response || 'Thanks for your message! Our team will get back to you shortly.',
          sender: 'support',
          timestamp: new Date(),
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, supportMessage],
          isTyping: false,
        }));
      }, 1000);

    } catch (error: any) {
      console.error('Chat API error:', error);
      
      // Check for session expiry first
      if (error.message?.includes('401') || error.message?.includes('Unauthorized') || error.message?.includes('Session not found') || error.message?.includes('Session expired')) {
        // Set session expired state instead of just showing error
        setChatState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === userMessage.id ? { ...msg, status: 'error' } : msg
          ),
          isSessionExpired: true,
          error: null, // Clear error since we'll show the session expired UI
          isTyping: false,
        }));
        return; // Exit early to prevent setting error message
      }
      
      // Use the actual API error message if available, otherwise provide user-friendly fallbacks
      let errorMessage = error.message || 'Failed to send message. Please try again.';
      const isValidationError = error.isValidationError || false;
      
      // Provide more specific error messages for common cases
      if (error.message?.includes('Message limit exceeded')) {
        errorMessage = 'You\'ve reached the 50 message limit for this session. Please start a new conversation.';
      } else if (error.message?.includes('rate limit') || error.message?.includes('Rate limit')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Connection error. Please check your internet and try again.';
      }
      // For email validation errors, keep the original API message as it's specific
      
      // Handle error state
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === userMessage.id ? { ...msg, status: 'error', isValidationError } : msg
        ),
        error: errorMessage,
        isTyping: false,
      }));
    }
  }, []);

  const retryMessage = useCallback(async (messageId: string) => {
    const message = chatState.messages.find(msg => msg.id === messageId);
    if (!message) return;

    // Get JWT token from localStorage for retry
    const jwtToken = localStorage.getItem('chat-session-hash');
    if (!jwtToken) {
      setChatState(prev => ({
        ...prev,
        error: 'Session expired. Please re-enter your email.',
      }));
      return;
    }

    // Mark the existing message as sending
    setChatState(prev => ({
      ...prev,
      messages: prev.messages.map(msg =>
        msg.id === messageId ? { ...msg, status: 'sending' } : msg
      ),
      error: null,
    }));

    try {
      const browserHash = await generateBrowserHash();
      
      // Retry with actual API using JWT authentication
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
          'X-Browser-Hash': browserHash,
        },
        body: JSON.stringify({
          message: message.text,
          honeypot: ''
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let apiError = 'Failed to send message';
        
        // Handle different API error response formats
        if (errorData.error) {
          apiError = errorData.error;
        } else if (errorData.detail) {
          // Handle FastAPI validation errors
          if (Array.isArray(errorData.detail)) {
            // Pydantic validation errors
            const validationErrors = errorData.detail.map((err: any) => {
              if (err.type === 'string_too_long') {
                return `${err.loc ? err.loc.join('.') : 'Field'} is too long (max ${err.ctx?.max_length || 'allowed'} characters)`;
              } else if (err.type === 'string_too_short') {
                return `${err.loc ? err.loc.join('.') : 'Field'} is too short (min ${err.ctx?.min_length || 'required'} characters)`;
              } else if (err.type === 'value_error') {
                return err.msg || 'Invalid value';
              } else {
                return err.msg || `Validation error: ${err.type}`;
              }
            });
            apiError = validationErrors.join(', ');
          } else if (typeof errorData.detail === 'string') {
            apiError = errorData.detail;
          }
        } else if (errorData.message) {
          apiError = errorData.message;
        }
        
        throw new Error(apiError);
      }

      // Mark the existing message as sent
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === messageId ? { ...msg, status: 'sent' } : msg
        ),
      }));

      // Get actual API response
      const data = await response.json();
      
      // Simulate typing indicator for support response
      setChatState(prev => ({ ...prev, isTyping: true }));

      // Add support response from API
      setTimeout(() => {
        const supportMessage: Message = {
          id: data.message_id || `support-${Date.now()}`,
          text: data.response || 'Thanks for your message! Our team will get back to you shortly.',
          sender: 'support',
          timestamp: new Date(),
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, supportMessage],
          isTyping: false,
        }));
      }, 1000);

    } catch (error: any) {
      console.error('Retry API error:', error);
      
      // Check for session expiry first
      if (error.message?.includes('401') || error.message?.includes('Unauthorized') || error.message?.includes('Session not found') || error.message?.includes('Session expired')) {
        // Set session expired state
        setChatState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === messageId ? { ...msg, status: 'error' } : msg
          ),
          isSessionExpired: true,
          error: null, // Clear error since we'll show the session expired UI
          isTyping: false,
        }));
        return; // Exit early to prevent setting error message
      }
      
      // Use the actual API error message if available, otherwise provide user-friendly fallbacks
      let errorMessage = error.message || 'Failed to send message. Please try again.';
      
      // Provide more specific error messages for common cases
      if (error.message?.includes('Message limit exceeded')) {
        errorMessage = 'You\'ve reached the 50 message limit for this session. Please start a new conversation.';
      } else if (error.message?.includes('rate limit') || error.message?.includes('Rate limit')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Connection error. Please check your internet and try again.';
      }
      // For email validation errors, keep the original API message as it's specific
      
      // Handle error state for the existing message
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === messageId ? { ...msg, status: 'error' } : msg
        ),
        error: errorMessage,
        isTyping: false,
      }));
    }
  }, [chatState.messages]);

  const clearError = useCallback(() => {
    setChatState(prev => ({ ...prev, error: null }));
  }, []);

  const markAsRead = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      messages: prev.messages.map(msg =>
        msg.sender === 'support' ? { ...msg, status: 'delivered' } : msg
      ),
    }));
  }, []);

  return {
    ...chatState,
    sendMessage,
    retryMessage,
    clearError,
    markAsRead,
    loadMessageCount,
    resetMessageCount,
    clearChatAndStartFresh,
    loadChatHistory,
  };
}