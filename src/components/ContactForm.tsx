import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    contact: ''
  })

  const API_URL = 'https://cloudintellligence.africa'

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.contact.trim()) {
      setError('Name and contact information are required')
      return
    }

    setIsSubmitting(true)
    setError('')
    
    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json() as { error?: string; success?: boolean; message?: string }

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong')
      }

      setSubmitted(true)
      
      setTimeout(() => {
        setSubmitted(false)
        setFormData({
          name: '',
          contact: ''
        })
      }, 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit form')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-black/30 backdrop-blur-md border-white/30 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-white">Get In Touch</CardTitle>
        <CardDescription className="text-white/80">
          Ready to get started? Contact our team to learn how Cloud Intelligence can transform your business operations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Message Sent!</h3>
            <p className="text-white/80 text-sm">We'll get back to you soon.</p>
          </div>
        ) : (
          <div className="space-y-4 dark-form">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-white font-medium text-sm">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="bg-black/40 border-white/40 text-white placeholder:text-white/70 focus:border-white/60 focus:bg-black/50 focus:ring-white/20"
                placeholder="Enter your name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact" className="text-white font-medium text-sm">Email or Phone</Label>
              <Input
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
                required
                className="bg-black/40 border-white/40 text-white placeholder:text-white/70 focus:border-white/60 focus:bg-black/50 focus:ring-white/20"
                placeholder="Enter your email or phone number"
              />
            </div>
            
            <Button 
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}