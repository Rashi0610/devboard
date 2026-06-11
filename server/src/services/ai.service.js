import Groq from 'groq-sdk'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

export const triageTask = async (title, description) => {
  const completion = await client.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: [
      {
        role: 'system',
        content: `You are a project manager. Analyze the task and return ONLY a valid JSON object with no extra text, no markdown, no backticks. Format: {"priority": "low|medium|high|urgent", "labels": ["label1", "label2"], "storyPoints": number}`
      },
      {
        role: 'user',
        content: `Task title: ${title}\nDescription: ${description || 'No description provided'}`
      }
    ]
  })

  const raw = completion.choices[0].message.content
  return JSON.parse(raw)
}