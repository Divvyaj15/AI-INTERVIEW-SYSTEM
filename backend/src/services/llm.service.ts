import { mistral, LLM_MODEL } from '../lib/mistral.js'

interface LLMOptions {
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
}

export async function llmCall(
  userPrompt: string,
  systemPrompt: string,
  options: LLMOptions = {}
): Promise<string> {
  const { temperature = 0.7, maxTokens = 1500, jsonMode = false } = options

  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await mistral.chat.complete({
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature,
        maxTokens,
        ...(jsonMode && { responseFormat: { type: 'json_object' } }),
      })

      const content = response.choices?.[0]?.message?.content
      if (!content) throw new Error('Empty LLM response')

      return typeof content === 'string' ? content : JSON.stringify(content)
    } catch (err) {
      lastError = err as Error
      console.warn(`[LLM] Attempt ${attempt} failed: ${lastError.message}`)

      if (attempt < maxRetries) {
        await sleep(attempt * 1000)
      }
    }
  }

  throw new Error(`LLM call failed after ${maxRetries} retries: ${lastError?.message}`)
}

export async function llmCallJSON<T>(
  userPrompt: string,
  systemPrompt: string,
  options: LLMOptions = {}
): Promise<T> {
  const raw = await llmCall(userPrompt, systemPrompt, { ...options, jsonMode: true })

  try {
    const cleaned = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned) as T
  } catch {
    throw new Error(`Failed to parse LLM JSON response: ${raw.slice(0, 200)}`)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}