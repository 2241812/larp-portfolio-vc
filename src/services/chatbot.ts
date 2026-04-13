import { resumeData } from '@/data/resumeData';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

/**
 * Training data extracted from portfolio content
 */
export const CHATBOT_TRAINING_DATA = {
  personality: {
    name: resumeData.personalInfo.name,
    title: resumeData.personalInfo.title,
    location: resumeData.personalInfo.location,
    email: resumeData.personalInfo.email,
    phone: resumeData.personalInfo.phone,
  },
  education: {
    university: resumeData.education.university,
    degree: resumeData.education.degree,
    gpa: resumeData.education.gpa,
    classOf: resumeData.education.classOf,
  },
  skills: resumeData.skills,
  projects: resumeData.projects,
};

/**
 * Pattern-based response rules for common questions
 */
export const CHATBOT_RULES = [
  // Greeting patterns
  {
    patterns: ['hello', 'hi', 'hey', 'greetings', 'howdy'],
    responses: [
      `Hi! I'm a chatbot representing ${CHATBOT_TRAINING_DATA.personality.name}. How can I help you learn about this portfolio?`,
      `Hello! Welcome to the portfolio. Feel free to ask me anything about skills, projects, or experience!`,
      `Hey there! I'm here to answer questions about the portfolio. What would you like to know?`,
    ],
  },

  // Name/Identity
  {
    patterns: ['who', 'name', 'yourself', 'are you'],
    responses: [
      `I'm ${CHATBOT_TRAINING_DATA.personality.name}, a ${CHATBOT_TRAINING_DATA.personality.title}. I'm based in ${CHATBOT_TRAINING_DATA.personality.location}.`,
      `My name is ${CHATBOT_TRAINING_DATA.personality.name}. I'm a Computer Science student at Saint Louis University, currently working as an AI Development Intern.`,
    ],
  },

  // Education
  {
    patterns: ['education', 'university', 'school', 'degree', 'studied', 'gpa'],
    responses: [
      `I'm studying a ${CHATBOT_TRAINING_DATA.education.degree} at ${CHATBOT_TRAINING_DATA.education.university}. I'm graduating in ${CHATBOT_TRAINING_DATA.education.classOf} with a ${CHATBOT_TRAINING_DATA.education.gpa} GPA.`,
      `Currently a student at SLU (Saint Louis University) pursuing a degree in Computer Science. Expected graduation: ${CHATBOT_TRAINING_DATA.education.classOf}.`,
    ],
  },

  // Skills - General
  {
    patterns: ['skills', 'what do you know', 'expertise', 'technologies', 'languages'],
    responses: [
      `I work with multiple programming languages: Python, JavaScript, TypeScript, Go, C++, C#, Java, and more. I'm also experienced with frameworks like React, Django, and Unity 3D, plus infrastructure tools like Docker and CI/CD pipelines.`,
      `My main skills include Python, JavaScript/Node.js, Go, and various frameworks. I'm also knowledgeable in containerization, AI/ML workflows, and microservices architecture.`,
    ],
  },

  // Specific Skills
  {
    patterns: ['python', 'programming language'],
    responses: [
      `Python is one of my primary languages. I use it for AI workflows, automation, and general development. I'm experienced with frameworks like Django and FastAPI.`,
    ],
  },
  {
    patterns: ['javascript', 'typescript', 'web development', 'frontend', 'react', 'node'],
    responses: [
      `I'm skilled in modern JavaScript/TypeScript for both frontend and backend development. I work with React, Node.js, and Next.js for building web applications.`,
    ],
  },
  {
    patterns: ['docker', 'containerization', 'devops', 'infrastructure'],
    responses: [
      `I have hands-on experience with Docker for containerization and environment isolation. I've set up microservices architectures, CI/CD pipelines, and used Docker Compose for multi-container applications.`,
    ],
  },
  {
    patterns: ['ai', 'machine learning', 'ml', 'tensorflow', 'pytorch', 'artificial intelligence'],
    responses: [
      `I'm experienced in AI and machine learning workflows. I've worked with TensorFlow, PyTorch, and scikit-learn for building AI models, including computer vision and natural language processing projects.`,
    ],
  },
  {
    patterns: ['game', 'unity', '3d', 'ar', 'augmented reality'],
    responses: [
      `I've worked with Unity 3D for game development and AR Foundation for building augmented reality experiences. I have experience in game mechanics, physics simulation, and cross-platform deployment.`,
    ],
  },

  // Projects
  {
    patterns: ['projects', 'portfolio', 'project', 'built', 'created', 'developed'],
    responses: [
      `I've worked on several interesting projects including an OpenCode VSCode environment setup, a Python workflow automator (MultiTask_ContextSwitch), a hand sign recognition system, and various web applications. Each project showcases different technical skills!`,
      `My projects range from AI-powered systems to full-stack web applications. Check out the portfolio section for detailed descriptions and links to each project.`,
    ],
  },

  // Contact
  {
    patterns: ['contact', 'reach out', 'email', 'phone', 'get in touch', 'message'],
    responses: [
      `You can reach me at ${CHATBOT_TRAINING_DATA.personality.email} or call ${CHATBOT_TRAINING_DATA.personality.phone}. I'm always happy to discuss projects and opportunities!`,
      `Feel free to contact me via email at ${CHATBOT_TRAINING_DATA.personality.email}. I'd love to hear about potential collaborations!`,
    ],
  },

  // Experience
  {
    patterns: ['experience', 'work', 'job', 'intern', 'professional'],
    responses: [
      `I'm currently working as an AI Development Intern, where I'm gaining hands-on experience in AI workflows and development. My projects showcase diverse experience across AI, web development, and infrastructure.`,
    ],
  },

  // Location
  {
    patterns: ['where', 'location', 'based', 'city', 'country'],
    responses: [
      `I'm based in ${CHATBOT_TRAINING_DATA.personality.location}. I'm open to remote opportunities and collaborations!`,
    ],
  },

  // Goodbye
  {
    patterns: ['bye', 'goodbye', 'see you', 'exit', 'quit'],
    responses: [
      `Thanks for visiting! Feel free to explore the portfolio and reach out if you have any questions.`,
      `Goodbye! Don't hesitate to contact me if you'd like to discuss opportunities or projects.`,
    ],
  },

  // Help
  {
    patterns: ['help', 'what can you do', 'commands', 'features'],
    responses: [
      `I can help you learn about my skills, projects, education, and experience. You can ask about specific technologies, projects, or how to get in contact. What would you like to know?`,
    ],
  },

  // Fallback for unknown
  {
    patterns: [],
    responses: [
      `I'm not entirely sure about that. Feel free to ask about my skills, projects, education, or how to get in touch!`,
      `That's a great question! For more details, feel free to explore the portfolio sections or reach out directly.`,
      `I don't have specific information about that, but I'm happy to help with other questions about the portfolio!`,
    ],
    isDefault: true,
  },
];

/**
 * Calculate similarity between two strings using simple keyword matching
 */
function calculateSimilarity(input: string, pattern: string): number {
  const inputWords = input.toLowerCase().split(/\s+/);
  const patternWords = pattern.toLowerCase().split(/\s+/);

  if (patternWords.length === 0) return 0;

  const matches = inputWords.filter((word) =>
    patternWords.some((p) => p.includes(word) || word.includes(p))
  ).length;

  return matches / patternWords.length;
}

/**
 * Find the best matching rule for user input
 */
function findBestRule(
  userInput: string
) {
  const lowerInput = userInput.toLowerCase();

  // Find rules with matching patterns or keywords
  let bestRule = null;
  let bestScore = 0;

  for (const rule of CHATBOT_RULES) {
    if (rule.isDefault) continue; // Skip default rule for now

    for (const pattern of rule.patterns) {
      const similarity = calculateSimilarity(lowerInput, pattern);
      if (similarity > bestScore) {
        bestScore = similarity;
        bestRule = rule;
      }
    }
  }

  // If no good match found, use default rule
  if (!bestRule || bestScore < 0.3) {
    bestRule = CHATBOT_RULES.find((r) => r.isDefault);
  }

  return { rule: bestRule, score: bestScore };
}

/**
 * Select a random response from rule responses
 */
function selectResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Generate chatbot response
 */
export function generateResponse(userInput: string): string {
  if (!userInput.trim()) {
    return "Please say something! What would you like to know about the portfolio?";
  }

  const { rule } = findBestRule(userInput);

  if (!rule || rule.responses.length === 0) {
    return "I'm not sure how to respond to that. Please try another question!";
  }

  return selectResponse(rule.responses);
}

/**
 * Simple in-memory conversation history manager
 */
export class ConversationManager {
  private history: Message[] = [];
  private maxHistory = 50; // Keep last 50 messages

  addMessage(role: 'user' | 'assistant', content: string): Message {
    const message: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      content,
      role,
      timestamp: new Date(),
    };

    this.history.push(message);

    // Keep history manageable
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }

    return message;
  }

  getHistory(): Message[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }

  getContext(): string {
    return this.history
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');
  }
}
