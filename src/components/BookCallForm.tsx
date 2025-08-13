import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export default function BookCallForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    company: '',
    timeframe: '',
    projectType: '',
    budget: '',
    message: ''
  })

  const API_URL = 'https://cloudintelligence.africa'

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
      const response = await fetch(`${API_URL}/book-call`, {
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
          contact: '',
          company: '',
          timeframe: '',
          projectType: '',
          budget: '',
          message: ''
        })
      }, 5000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit form')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto bg-black/30 backdrop-blur-md border-white/30 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-white text-2xl">Schedule Your Call</CardTitle>
        <CardDescription className="text-white/80">
          Tell us about your project and we'll schedule a consultation call within 24 hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-xl mb-3">Call Scheduled!</h3>
            <p className="text-white/80 text-base mb-2">Thank you for your interest.</p>
            <p className="text-white/70 text-sm">We'll contact you within 24 hours to schedule your consultation call.</p>
          </div>
        ) : (
          <div className="space-y-5 dark-form">
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white font-medium text-sm">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="bg-black/40 border-white/40 text-white placeholder:text-white/70 focus:border-white/60 focus:bg-black/50 focus:ring-white/20"
                  placeholder="Your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact" className="text-white font-medium text-sm">Email or Phone *</Label>
                <Input
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={(e) => handleInputChange('contact', e.target.value)}
                  required
                  className="bg-black/40 border-white/40 text-white placeholder:text-white/70 focus:border-white/60 focus:bg-black/50 focus:ring-white/20"
                  placeholder="Best way to reach you"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company" className="text-white font-medium text-sm">Company</Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="bg-black/40 border-white/40 text-white placeholder:text-white/70 focus:border-white/60 focus:bg-black/50 focus:ring-white/20"
                placeholder="Your company name"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectType" className="text-white font-medium text-sm">Project Type</Label>
                <Select onValueChange={(value) => handleInputChange('projectType', value)} value={formData.projectType}>
                  <SelectTrigger className="bg-black/40 border-white/40 text-white focus:border-white/60 focus:bg-black/50 focus:ring-white/20">
                    <SelectValue placeholder="Select project type" className="text-white/70" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/40 text-white">
                    <SelectItem value="ai-agents">AI Agents</SelectItem>
                    <SelectItem value="machine-learning">Machine Learning</SelectItem>
                    <SelectItem value="web-applications">Web Applications</SelectItem>
                    <SelectItem value="data-engineering">Data Engineering</SelectItem>
                    <SelectItem value="cloud-architecture">Cloud Architecture</SelectItem>
                    <SelectItem value="consultation">General Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeframe" className="text-white font-medium text-sm">Timeframe</Label>
                <Select onValueChange={(value) => handleInputChange('timeframe', value)} value={formData.timeframe}>
                  <SelectTrigger className="bg-black/40 border-white/40 text-white focus:border-white/60 focus:bg-black/50 focus:ring-white/20">
                    <SelectValue placeholder="Project timeline" className="text-white/70" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/40 text-white">
                    <SelectItem value="asap">ASAP</SelectItem>
                    <SelectItem value="1-month">Within 1 month</SelectItem>
                    <SelectItem value="3-months">Within 3 months</SelectItem>
                    <SelectItem value="6-months">Within 6 months</SelectItem>
                    <SelectItem value="planning">Just planning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-white font-medium text-sm">Budget Range</Label>
              <Select onValueChange={(value) => handleInputChange('budget', value)} value={formData.budget}>
                <SelectTrigger className="bg-black/40 border-white/40 text-white focus:border-white/60 focus:bg-black/50 focus:ring-white/20">
                  <SelectValue placeholder="Select budget range" className="text-white/70" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/40 text-white">
                  <SelectItem value="under-10k">Under $10K</SelectItem>
                  <SelectItem value="10k-50k">$10K - $50K</SelectItem>
                  <SelectItem value="50k-100k">$50K - $100K</SelectItem>
                  <SelectItem value="100k-500k">$100K - $500K</SelectItem>
                  <SelectItem value="500k-plus">$500K+</SelectItem>
                  <SelectItem value="discuss">Prefer to discuss</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message" className="text-white font-medium text-sm">Project Details</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={4}
                className="bg-black/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:bg-black/30 resize-none"
                placeholder="Tell us about your project goals, challenges, and what you'd like to discuss during the call..."
              />
            </div>
            
            <Button 
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-base transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Scheduling Call...
                </>
              ) : (
                'Schedule My Call'
              )}
            </Button>
            
            <p className="text-white/60 text-xs text-center mt-4">
              By submitting this form, you agree to be contacted by our team regarding your project inquiry.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}