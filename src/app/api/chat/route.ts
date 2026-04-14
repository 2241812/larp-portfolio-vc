import { NextRequest, NextResponse } from 'next/server';
import { resumeData } from '@/data/resumeData';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  userMessage: string;
}

// Build context from portfolio data
function buildPortfolioContext(): string {
  const { personalInfo, education, skills, projects } = resumeData;

  const skillsList = [
    `Programming: ${skills.programming.join(', ')}`,
    `Frameworks: ${skills.frameworks.join(', ')}`,
    `Infrastructure: ${skills.infrastructure.join(', ')}`,
    `Core Competencies: ${skills.coreCompetencies.join(', ')}`,
  ].join('\n');

  const projectsList = projects
    .slice(0, 5)
    .map(p => `- ${p.title} (${p.role}): ${p.description}`)
    .join('\n');

  return `
You are Narciso, a CS student and AI Development Intern. Here's your professional profile:

**Personal Info:**
- Name: ${personalInfo.name}
- Title: ${personalInfo.title}
- Location: ${personalInfo.location}
- Email: ${personalInfo.email}

**Education:**
- University: ${education.university}
- Degree: ${education.degree}
- Expected Graduation: ${education.classOf}
- GPA: ${education.gpa}

**Skills:**
${skillsList}

**Recent Projects:**
${projectsList}

**Personality & Approach:**
- Passionate about AI development and web technologies
- Solve real-world problems through code
- Open to remote opportunities and collaborations
- Always learning and building portfolio projects

When answering questions:
1. Answer as Narciso (use "I", "me", "my")
2. Be conversational and authentic
3. Reference specific skills, projects, or experience when relevant
4. If asked about something technical, explain briefly but knowledgeably
5. Keep responses concise (2-3 sentences unless more detail is needed)
6. Be helpful and friendly
`;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { messages, userMessage } = body;

    if (!userMessage?.trim()) {
      return NextResponse.json(
        { error: 'User message is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('OPENROUTER_API_KEY not set');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Build conversation history with portfolio context
    const portfolioContext = buildPortfolioContext();
    const systemMessage = {
      role: 'user' as const,
      content: portfolioContext,
    };

    // Prepare messages for OpenRouter
    const openrouterMessages: ChatMessage[] = [
      systemMessage,
      ...messages,
      { role: 'user' as const, content: userMessage },
    ];

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://narcisoiiijavier.vercel.app/',
        'X-OpenRouter-Title': 'Narciso Portfolio Chatbot',
      },
      body: JSON.stringify({
        model: 'liquid/lfm-2.5-1.2b-thinking:free',
        messages: openrouterMessages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate response', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage =
      data.choices?.[0]?.message?.content || 'I encountered an issue generating a response.';

    return NextResponse.json({
      success: true,
      message: assistantMessage,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
