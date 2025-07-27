import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useChatApi } from '../hooks/useChatApi';
import ReactMarkdown from 'react-markdown';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [sessionHash, setSessionHash] = useState('');
  const [emailValidating, setEmailValidating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isTyping,
    isConnected,
    error,
    messageCount,
    messageLimit,
    isSessionExpired,
    sendMessage: sendApiMessage,
    retryMessage,
    clearError,
    markAsRead,
    loadMessageCount,
    resetMessageCount,
    clearChatAndStartFresh,
    loadChatHistory,
  } = useChatApi();

  // Load email, JWT token, and chat state from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('chat-email');
    const savedJwtToken = localStorage.getItem('chat-session-hash'); // Now contains JWT token
    const savedChatOpenState = localStorage.getItem('chat-window-open');

    // Restore chat window open state
    if (savedChatOpenState === 'true') {
      setIsOpen(true);
    }

    if (savedEmail && savedJwtToken) {
      setEmail(savedEmail);
      setSessionHash(savedJwtToken);
      loadMessageCount(); // Load message count for this session
      loadChatHistory(savedJwtToken); // Load chat history from backend
    } else if (savedEmail) {
      // Email exists but no token - prepopulate and show email form
      setEmail(savedEmail);
      setShowEmailInput(true);
    } else {
      setShowEmailInput(true);
    }
  }, [loadMessageCount, loadChatHistory]);

  // Email validation function
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  // Generate browser hash for API (same logic as useChatApi)
  const generateBrowserHash = async (): Promise<string> => {
    try {
      // Use same FingerprintJS logic
      const FingerprintJS = await import('@fingerprintjs/fingerprintjs');
      const fp = await FingerprintJS.default.load();
      const result = await fp.get();
      return result.visitorId;
    } catch (error) {
      console.error('FingerprintJS error, using fallback:', error);
      // Fallback browser fingerprint
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

      const encoder = new TextEncoder();
      const data = encoder.encode(fingerprint);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      return hashHex.substring(0, 32);
    }
  };

  // Validate email with API and get JWT token
  const validateEmailWithAPI = async (emailToValidate: string) => {
    if (!isValidEmail(emailToValidate)) return;

    setEmailValidating(true);
    try {
      const browserHash = await generateBrowserHash();

      const response = await fetch('http://localhost:8001/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailToValidate.trim(),
          browser_hash: browserHash
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Email validation failed');
      }

      const data = await response.json();

      // Store JWT token and email
      setSessionHash(data.access_token); // Now storing JWT token instead of session hash
      localStorage.setItem('chat-email', emailToValidate.trim());
      localStorage.setItem('chat-session-hash', data.access_token); // Store JWT token
      localStorage.setItem('chat-email-hash', data.email_hash); // Store email hash for session tracking
      resetMessageCount(); // Reset message count for new session
      setShowEmailInput(false);

    } catch (error: any) {
      console.error('Email validation error:', error);
      // Show error in the main chat error area
      clearError(); // Clear any existing errors first
      // Set error through a timeout to ensure it shows
      setTimeout(() => {
        // You might need to update useChatApi to accept external errors
        alert(`Email validation failed: ${error.message}`); // Temporary - will improve this
      }, 100);
    } finally {
      setEmailValidating(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    // Check if JWT token is available
    if (!sessionHash.trim()) {
      setShowEmailInput(true);
      return;
    }

    // Clear input immediately before sending
    const messageToSend = inputValue;
    setInputValue('');

    await sendApiMessage(messageToSend, sessionHash);
  };

  const handleEmailSubmit = async () => {
    if (isValidEmail(email)) {
      await validateEmailWithAPI(email);
    }
  };

  const handleStartNewSession = () => {
    // Clear chat and session data but keep email if it exists
    clearChatAndStartFresh();

    // Load saved email if available, otherwise clear
    const savedEmail = localStorage.getItem('chat-email');
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      setEmail('');
    }

    setSessionHash('');
    setShowEmailInput(true);
  };

  // Save chat window state to localStorage
  const saveChatOpenState = (isOpenState: boolean) => {
    localStorage.setItem('chat-window-open', isOpenState.toString());
  };

  // Handle opening chat window
  const handleOpenChat = () => {
    setIsOpen(true);
    saveChatOpenState(true);
  };

  // Handle closing chat window
  const handleCloseChat = () => {
    setIsOpen(false);
    saveChatOpenState(false);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isOpen) {
      markAsRead();
    }
  }, [isOpen, markAsRead]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Calculate message limit warning states
  const remainingMessages = messageLimit - messageCount;
  const isNearLimit = remainingMessages <= 10; // Yellow warning
  const isAtLimit = remainingMessages <= 3; // Red warning
  const isLimitReached = messageCount >= messageLimit;

  // Suggestion prompts for marketing bot
  const suggestionPrompts = [
    {
      id: 'services',
      text: 'What services do you offer?',
      icon: '🔧'
    },
    {
      id: 'pricing',
      text: 'Tell me about your pricing',
      icon: '💰'
    },
    {
      id: 'portfolio',
      text: 'Show me your portfolio',
      icon: '📁'
    },
    {
      id: 'contact',
      text: 'How can I get in touch?',
      icon: '📞'
    },
    {
      id: 'ai-solutions',
      text: 'What AI solutions do you provide?',
      icon: '🤖'
    },
    {
      id: 'cloud',
      text: 'Tell me about cloud infrastructure',
      icon: '☁️'
    }
  ];

  // Handle suggestion button click
  const handleSuggestionClick = async (suggestion: typeof suggestionPrompts[0]) => {
    if (!sessionHash.trim()) {
      setShowEmailInput(true);
      return;
    }

    // Clear any existing input and send the suggestion text
    setInputValue('');
    await sendApiMessage(suggestion.text, sessionHash);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 hidden md:block">
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          onClick={handleOpenChat}
          className="h-14 w-14 rounded-full bg-brand-primary hover:bg-brand-secondary shadow-lg transition-all duration-300 hover:scale-105"
          size="icon"
          aria-label="Open chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
            />
          </svg>
        </Button>
      )}

      {/* Chat Container */}
      {isOpen && (
        <Card className="w-88 lg:w-[26rem] h-[26rem] lg:h-[550px] shadow-2xl animate-in slide-in-from-right-2 slide-in-from-bottom-2 duration-300">
          {/* Chat Header */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 bg-brand-primary text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <h3 className="font-semibold text-sm">Chat with cloudy</h3>
              {!isConnected && <span className="text-xs opacity-75">(Offline)</span>}
            </div>
            <div className="flex items-center space-x-1">
              {/* Reset Button */}
              {!showEmailInput && !isSessionExpired && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStartNewSession}
                  className="h-6 px-2 text-xs text-white hover:bg-white/20"
                  aria-label="Reset chat"
                >
                  Reset
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseChat}
                className="h-6 w-6 text-white hover:bg-white/20"
                aria-label="Close chat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col h-full p-0 relative">
            {/* Error Message - Absolute positioned to prevent layout shift */}
            {error && (
              <div className="absolute top-2 left-4 right-4 z-10 bg-destructive/90 backdrop-blur-sm border-l-4 border-destructive p-2 rounded-r shadow-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white pr-2">{error}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearError}
                    className="h-6 w-6 text-white hover:bg-white/20 flex-shrink-0"
                  >
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className="overflow-y-auto p-4 space-y-3" style={{ height: 'calc(100% - 125px)' }}>
              {/* Show suggestion buttons when no messages */}
              {messages.length === 0 && !showEmailInput && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Hi! What would you like to know about Cloud Intelligence?
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {suggestionPrompts.map((suggestion) => (
                      <Button
                        key={suggestion.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="flex items-center justify-start space-x-2 h-auto py-2 px-3 text-xs hover:bg-brand-primary/5 hover:border-brand-primary/20"
                        disabled={!sessionHash.trim() || isLimitReached}
                      >
                        <span className="text-sm">{suggestion.icon}</span>
                        <span className="text-left">{suggestion.text}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${message.sender === 'user'
                      ? 'bg-brand-primary text-white'
                      : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    {message.sender === 'user' ? (
                      <p>{message.text}</p>
                    ) : (
                      <div className="prose prose-sm max-w-none prose-p:my-2 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-strong:text-inherit prose-code:text-inherit [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        <ReactMarkdown
                          components={{
                            // Customize link rendering to open in new tab
                            a: ({ node, ...props }) => (
                              <a {...props} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline" />
                            ),
                            // Customize code blocks
                            pre: ({ node, ...props }) => (
                              <pre {...props} className="bg-black/10 p-2 rounded text-xs overflow-x-auto my-2" />
                            ),
                            // Customize inline code
                            code: ({ node, inline, ...props }: any) => (
                              inline ?
                                <code {...props} className="bg-black/10 px-1 py-0.5 rounded text-xs" /> :
                                <code {...props} />
                            ),
                            // Customize paragraphs for better spacing
                            p: ({ node, ...props }) => (
                              <p {...props} className="mb-2 last:mb-0" />
                            ),
                            // Customize lists
                            ul: ({ node, ...props }) => (
                              <ul {...props} className="list-disc list-inside space-y-1 my-2" />
                            ),
                            ol: ({ node, ...props }) => (
                              <ol {...props} className="list-decimal list-inside space-y-1 my-2" />
                            ),
                            li: ({ node, ...props }) => (
                              <li {...props} className="leading-relaxed" />
                            ),
                            // Handle line breaks
                            br: ({ node, ...props }) => (
                              <br {...props} />
                            ),
                          }}
                        >
                          {message.text}
                        </ReactMarkdown>
                      </div>
                    )}
                    {message.status === 'sending' && (
                      <div className="text-xs opacity-60 mt-1">Sending...</div>
                    )}
                    {message.status === 'error' && !message.isValidationError && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => retryMessage(message.id)}
                        className="text-xs mt-1 h-auto p-1 text-white/80 hover:text-white"
                      >
                        Retry
                      </Button>
                    )}
                    {/* Show attribution and timestamp for each message */}
                    {email && !showEmailInput && (
                      <div className={`text-xs mt-1 flex ${message.sender === 'user'
                        ? 'justify-end text-white/60'
                        : 'justify-between text-muted-foreground/60'
                        }`}>
                        {message.sender === 'support' && (
                          <span>☁️🧠 cloudy</span>
                        )}
                        <span className={message.sender === 'user' ? 'text-right' : ''}>
                          {message.sender === 'user' && `${email} • `}
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Email Input Overlay - Full window overlay */}
            {showEmailInput && (
              <div className="absolute inset-0 z-20 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6">
                <div className="w-full max-w-sm mx-auto bg-card border rounded-lg shadow-lg p-6">
                  <div className="space-y-4">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 mx-auto bg-brand-primary rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="h-6 w-6 text-white"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold">
                        {email ? 'Start New Session' : 'Email Required'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {email
                          ? 'Confirm your email to start a new chat session.'
                          : 'Please enter your email address for attribution and security purposes.'
                        }
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="chat-email" className="text-sm font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="chat-email"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleEmailSubmit();
                          }
                        }}
                        className="text-sm"
                        required
                        autoFocus
                      />
                      {email && !isValidEmail(email) && (
                        <p className="text-xs text-destructive">Please enter a valid email address</p>
                      )}
                    </div>

                    <Button
                      onClick={handleEmailSubmit}
                      disabled={!isValidEmail(email) || emailValidating}
                      className="w-full bg-brand-primary hover:bg-brand-secondary disabled:opacity-50"
                    >
                      {emailValidating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Validating...
                        </>
                      ) : (
                        'Continue to Chat'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Session Expired Overlay */}
            {isSessionExpired && (
              <div className="absolute inset-0 z-30 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6">
                <div className="w-full max-w-sm mx-auto bg-card border rounded-lg shadow-lg p-6">
                  <div className="space-y-4">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 mx-auto bg-red-500 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="h-6 w-6 text-white"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-red-600">Session Expired</h3>
                      <p className="text-sm text-muted-foreground">
                        Your chat session has expired for security reasons. Please start a new conversation.
                      </p>
                    </div>

                    <Button
                      onClick={handleStartNewSession}
                      className="w-full bg-brand-primary hover:bg-brand-secondary"
                    >
                      Start New Session
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t p-2 flex-shrink-0">
              {/* Message limit reached warning */}
              {isLimitReached && !showEmailInput && (
                <div className="mb-1 p-1.5 bg-red-50 border border-red-200 rounded text-center">
                  <p className="text-xs text-red-700 font-medium">
                    Message limit reached (50/50)
                  </p>
                  <p className="text-xs text-red-600">
                    Please start a new conversation by changing your email
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                <Input
                  placeholder={
                    showEmailInput
                      ? "Enter email first"
                      : isSessionExpired
                        ? "Session expired"
                        : isLimitReached
                          ? "Message limit reached"
                          : "Type your message..."
                  }
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 text-sm"
                  disabled={!isConnected || showEmailInput || isLimitReached || isSessionExpired}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || !isConnected || !sessionHash.trim() || showEmailInput || isLimitReached || isSessionExpired}
                  size="icon"
                  className="bg-brand-primary hover:bg-brand-secondary disabled:opacity-50"
                  aria-label="Send message"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
