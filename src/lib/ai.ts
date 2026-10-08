export type AiSettings = {
  apiKey: string
  baseUrl: string
  model: string
}

export const DEFAULT_AI_SETTINGS: Omit<AiSettings, 'apiKey'> = {
  baseUrl: 'https://api.groq.com/openai/v1',
  model: 'llama-3.1-8b-instant',
}

const STORAGE_KEY = 'axiom-ai-settings'

export function loadAiSettings(): AiSettings {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return { apiKey: '', ...DEFAULT_AI_SETTINGS }
    const parsed = JSON.parse(raw) as Partial<AiSettings>
    return {
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : '',
      baseUrl:
        typeof parsed.baseUrl === 'string' && parsed.baseUrl
          ? parsed.baseUrl
          : DEFAULT_AI_SETTINGS.baseUrl,
      model:
        typeof parsed.model === 'string' && parsed.model
          ? parsed.model
          : DEFAULT_AI_SETTINGS.model,
    }
  } catch {
    return { apiKey: '', ...DEFAULT_AI_SETTINGS }
  }
}

export function saveAiSettings(settings: AiSettings) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    /* ignore */
  }
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim()
  const match = trimmed.match(/^```(?:[\w+-]*)?\n([\s\S]*?)```$/m)
  if (match) return match[1].trimEnd()
  return trimmed.replace(/^```(?:[\w+-]*)?\n?/, '').replace(/\n?```$/, '')
}

export async function generateCodeStream(options: {
  settings: AiSettings
  userPrompt: string
  signal?: AbortSignal
  onToken: (fullText: string) => void
}): Promise<string> {
  const { settings, userPrompt, signal, onToken } = options
  const base = settings.baseUrl.replace(/\/$/, '')

  const response = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${settings.apiKey}`,
      'Content-Type': 'application/json',
    },
    signal,
    body: JSON.stringify({
      model: settings.model,
      stream: true,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You are AXIOM, an expert coding assistant. Reply with only the code for the request. Prefer TypeScript/React when relevant. No markdown fences unless necessary. No long explanations.',
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new Error(
      errText
        ? `API ${response.status}: ${errText.slice(0, 180)}`
        : `API error ${response.status}`,
    )
  }

  if (!response.body) {
    throw new Error('No response body')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let full = ''
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const data = trimmed.slice(5).trim()
      if (data === '[DONE]') continue
      try {
        const json = JSON.parse(data) as {
          choices?: { delta?: { content?: string } }[]
        }
        const token = json.choices?.[0]?.delta?.content ?? ''
        if (token) {
          full += token
          onToken(full)
        }
      } catch {
        /* skip partial JSON */
      }
    }
  }

  const cleaned = stripCodeFences(full)
  onToken(cleaned)
  return cleaned
}
