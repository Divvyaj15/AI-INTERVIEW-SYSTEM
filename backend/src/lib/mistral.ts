import { Mistral } from '@mistralai/mistralai'

if (!process.env.MISTRAL_API_KEY) {
  throw new Error('Missing MISTRAL_API_KEY env var')
}

/** Mistral API expects e.g. `mistral-small-latest`, not `mistral/mistral-small-latest`. */
function normalizeMistralModelId(raw: string): string {
  const id = raw.trim()
  return id.replace(/^(mistral|mistralai)\//i, '')
}

export const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY })
export const LLM_MODEL = normalizeMistralModelId(process.env.LLM_MODEL ?? 'mistral-large-latest')