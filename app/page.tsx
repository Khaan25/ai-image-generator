'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AlertCircle, Loader2, X, HelpCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const promptOptions = [
  { label: 'Surreal Landscape', value: 'Create a surreal landscape with floating islands and bioluminescent plants' },
  { label: 'Cyberpunk Portrait', value: 'Design a cyberpunk-style portrait with neon lights and futuristic implants' },
  { label: 'Steampunk Invention', value: 'Illustrate a complex steampunk invention with gears, pipes, and brass components' },
  { label: 'Cosmic Event', value: 'Depict a cosmic event with swirling galaxies, nebulae, and a distant space station' },
  { label: 'Underwater City', value: 'Visualize an advanced underwater city with bio-luminescent architecture and sea life' },
]

const promptTips = [
  'Be specific and descriptive in your prompts.',
  'Include details about style, mood, lighting, and composition.',
  'Mention specific artists or art styles for inspiration.',
  'Use adjectives to describe textures, colors, and materials.',
  'Specify the perspective or point of view you want.',
]

export default function ImageGenerator() {
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [prompt, setPrompt] = useState<string>('')

  async function handleSubmit() {
    setResult(null)
    setError(null)

    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()
      console.log('data :', data)

      if (data.error) {
        setError(data.error)
      }

      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  function handlePromptChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setPrompt(e.target.value)
  }

  function handleOptionClick(option: string) {
    setPrompt(prev => (prev ? `${prev}\n${option}` : option))
  }

  function handleClear() {
    setPrompt('')
    setResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            AI Image Generator
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <HelpCircle className="h-4 w-4" />
                    <span className="sr-only">Prompt tips</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <ul className="list-disc pl-4">
                    {promptTips.map((tip, index) => (
                      <li key={index} className="text-sm">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription>Enter a detailed prompt to generate an image using AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Textarea value={prompt} onChange={handlePromptChange} placeholder="Describe the image you want to generate in detail..." className="min-h-[100px] pr-8" />
            {prompt && (
              <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => setPrompt('')} aria-label="Clear prompt">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {promptOptions.map(option => (
              <Button key={option.label} variant="secondary" size="sm" onClick={() => handleOptionClick(option.value)}>
                {option.label}
              </Button>
            ))}
          </div>
          {result && (
            <div className="mt-4">
              <Image src={result} alt="Generated Image" width={512} height={512} className="w-full h-auto sm:size-[312px] mx-auto object-cover rounded-md" />
            </div>
          )}
          <div className="flex justify-between">
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Image'
              )}
            </Button>
            <Button onClick={handleClear} variant="outline">
              Clear All
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
