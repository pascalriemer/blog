'use client'

import React, { useState, FormEvent } from 'react'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (honeypot) {
      console.log('Honeypot triggered - likely bot submission')
      setStatus('success')
      setName('')
      setEmail('')
      setMessage('')
      setHoneypot('')
      
      setTimeout(() => {
        setStatus('idle')
      }, 5000)
      return
    }

    if (!name || !email || !message) {
      setStatus('error')
      setErrorMessage('All fields are required')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address')
      return
    }

    setStatus('loading')
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message,
          _honeypot: honeypot
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }
      
      setStatus('success')
      setName('')
      setEmail('')
      setMessage('')
      setHoneypot('')
      
      setTimeout(() => {
        setStatus('idle')
      }, 5000)
      
    } catch (error) {
      console.error('Error sending message:', error)
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send message. Please try again later.')
    }
  }

  return (
    <div className="mt-16 border-t border-neutral-200 dark:border-neutral-800 pt-8">
      <h2 className="text-xl font-semibold tracking-tighter mb-4">Contact Me</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="antispam" aria-hidden="true">
          <label htmlFor="_honeypot" className="antispam">
            Skip this field
          </label>
          <input
            id="_honeypot"
            name="_honeypot"
            type="text"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            autoComplete="off"
            tabIndex={-1}
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 
                    bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-colors"
            placeholder="Your name"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 
                    bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-colors"
            placeholder="your.email@example.com"
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 
                    bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-colors resize-none"
            placeholder="Your message..."
          />
        </div>
        
        <div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center"
          >
            {status === 'loading' ? (
              <React.Fragment>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </React.Fragment>
            ) : 'Send Message'}
          </button>
        </div>
        
        {status === 'error' && (
          <div className="text-red-500 text-sm mt-2">
            {errorMessage}
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-green-500 text-sm mt-2">
            Message sent successfully! I'll get back to you soon.
          </div>
        )}

        <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-4">
          I will get back to you as soon as possible.
        </div>
      </form>
    </div>
  )
} 