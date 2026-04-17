import { gemini, EMBEDDING_MODEL } from '../lib/geminiEmbeddings.js'

export async function generateEmbedding(text: string): Promise<number[]> {
  const cleaned = text.replace(/\n+/g, ' ').trim()
  return embedWithFallback(cleaned)
}

export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  const cleaned = texts.map(t => t.replace(/\n+/g, ' ').trim())
  return Promise.all(cleaned.map((input) => embedWithFallback(input)))
}

async function embedWithFallback(input: string): Promise<number[]> {
  const candidateModels = [EMBEDDING_MODEL, 'gemini-embedding-001', 'text-embedding-004', 'embedding-001']
  const tried = new Set<string>()
  let lastError: Error | null = null

  for (const candidate of candidateModels) {
    const model = candidate.trim()
    if (!model || tried.has(model)) continue
    tried.add(model)

    try {
      const response = await gemini.models.embedContent({
        model,
        contents: input,
      })
      const values = response.embeddings?.[0]?.values

      if (!values || !Array.isArray(values)) {
        throw new Error(`Empty embedding response for model "${model}"`)
      }

      return values
    } catch (error) {
      lastError = error as Error
      const message = (error as Error).message ?? ''
      if (!message.includes('404') && !message.includes('not found')) {
        throw lastError
      }
    }
  }

  throw new Error(
    `No valid Gemini embedding model found. Tried: ${Array.from(tried).join(', ')}. Last error: ${lastError?.message ?? 'unknown error'}`
  )
}