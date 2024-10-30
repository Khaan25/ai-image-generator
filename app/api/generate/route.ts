import { redis } from '@/lib/redis'
import { unkey } from '@/lib/unkey'
import OpenAI from 'openai'
import { nanoid } from 'nanoid'
import { NextRequest, NextResponse } from 'next/server'

const unkeyApiKey = process.env.UNKEY_API_KEY

if (!unkeyApiKey) {
  throw new Error('UNKEY_API_KEY is not set')
}

const getClientIp = (req: NextRequest): string => {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  return ip.startsWith('::ffff:') ? ip.slice(7) : ip
}

export async function POST(request: NextRequest) {
  // Get the client's IP address
  const ip = getClientIp(request)

  // Check the rate limit
  const rateLimitResponse = await unkey.limit(ip, { cost: 2 })

  // If the rate limit is exceeded, respond with an error
  if (!rateLimitResponse.success) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please try again in 30 minutes.' }, { status: 429 })
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set')
  }

  const requestBody = await request.json()

  if (!requestBody || typeof requestBody !== 'object' || requestBody === null) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const prompt = requestBody.prompt

    // Initialize the OpenAI client
    const openAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    // Generate content using the OpenAI API
    const result = await openAI.images.generate({
      prompt: prompt,
      n: 1,
      size: '512x512',
    })

    const image = result.data[0].url

    if (!image) {
      return NextResponse.json({ error: 'No image generated' }, { status: 400 })
    }

    // Save to Database
    const shortCode = nanoid(6)
    const images = (await redis.get('ai-image')) as Record<string, string>

    if (images) {
      images[shortCode] = image
      await redis.set('ai-image', JSON.stringify(images))
    } else {
      await redis.set(
        'ai-image',
        JSON.stringify({
          [shortCode]: image,
        })
      )
    }

    return NextResponse.json({ result: image }, { status: 200 })
  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json({ error: 'Error generating image. Please try again.' }, { status: 500 })
  }
}
