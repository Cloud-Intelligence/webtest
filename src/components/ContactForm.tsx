import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => setSubmitted(false), 3000)
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
          <form onSubmit={handleSubmit} className="space-y-4 dark-form">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white font-medium text-sm">Name</Label>
              <Input
                id="name"
                name="name"
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
                required
                className="bg-black/40 border-white/40 text-white placeholder:text-white/70 focus:border-white/60 focus:bg-black/50 focus:ring-white/20"
                placeholder="Enter your email or phone number"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-brand-primary hover:bg-brand-secondary text-white"
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
          </form>
        )}
      </CardContent>
    </Card>
  )
}