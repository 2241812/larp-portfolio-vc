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
  skillDescriptions: resumeData.skillDescriptions,
  projects: resumeData.projects,
};

/**
 * Pattern-based response rules for common questions
 */
export const CHATBOT_RULES = [
  // Greeting patterns
  {
    patterns: ['hello', 'hi', 'hey', 'greetings', 'howdy', 'halo', 'good morning', 'good afternoon'],
    responses: [
      `Hi! I'm ${CHATBOT_TRAINING_DATA.personality.name}, a ${CHATBOT_TRAINING_DATA.personality.title.split('·')[0].trim()}. What would you like to know?`,
      `Hey! 👋 Thanks for stopping by. Feel free to ask me anything about my skills, projects, or experience!`,
      `Hello! Great to meet you. What can I tell you about myself?`,
    ],
  },

  // Name/Identity
  {
    patterns: ['who are you', 'your name', 'tell me about yourself', 'introduce yourself', 'who is this', 'what is your name'],
    responses: [
      `I'm ${CHATBOT_TRAINING_DATA.personality.name}, a ${CHATBOT_TRAINING_DATA.personality.title}. I'm based in ${CHATBOT_TRAINING_DATA.personality.location} and passionate about AI development, web technologies, and solving real-world problems through code.`,
      `I'm ${CHATBOT_TRAINING_DATA.personality.name}. I'm a student at ${CHATBOT_TRAINING_DATA.education.university.split('|')[0].trim()} studying ${CHATBOT_TRAINING_DATA.education.degree}, and I'm currently working as an AI Development Intern. Expected graduation: ${CHATBOT_TRAINING_DATA.education.classOf}.`,
    ],
  },

  // Education
  {
    patterns: ['education', 'university', 'school', 'degree', 'studied', 'gpa', 'college', 'graduated', 'studied at'],
    responses: [
      `I'm studying ${CHATBOT_TRAINING_DATA.education.degree} at ${CHATBOT_TRAINING_DATA.education.university.split('|')[0].trim()}. I'm graduating in ${CHATBOT_TRAINING_DATA.education.classOf} with a ${CHATBOT_TRAINING_DATA.education.gpa} GPA.`,
      `I'm at ${CHATBOT_TRAINING_DATA.education.university.split('|')[0].trim()} (SLU) pursuing a degree in Computer Science. I should be done in ${CHATBOT_TRAINING_DATA.education.classOf}!`,
    ],
  },

  // Skills - General
  {
    patterns: ['skills', 'what do you know', 'expertise', 'technologies', 'languages', 'programming languages', 'what can you do', 'proficient in'],
    responses: [
      () => {
        const langs = CHATBOT_TRAINING_DATA.skills.programming.slice(0, 5).join(', ');
        const frameworks = CHATBOT_TRAINING_DATA.skills.frameworks.join(', ');
        return `I'm skilled in multiple programming languages including ${langs} and more. I also work with ${frameworks}. I have experience in microservices, containerization with Docker, and CI/CD pipelines.`;
      },
      () => {
        const competencies = CHATBOT_TRAINING_DATA.skills.coreCompetencies.join(', ');
        return `My core competencies include: ${competencies}. I'm proficient in both frontend and backend technologies!`;
      },
    ],
  },

  // Specific Programming Languages
  {
    patterns: ['python', 'python skills', 'python experience'],
    responses: [
      () => CHATBOT_TRAINING_DATA.skillDescriptions.Python || `Python is one of my primary languages. I use it for AI workflows, automation, data processing, and general development.`,
    ],
  },
  {
    patterns: ['javascript', 'typescript', 'node.js', 'node', 'web development', 'frontend', 'react', 'full stack'],
    responses: [
      () => `I'm skilled in modern JavaScript/TypeScript (${CHATBOT_TRAINING_DATA.skillDescriptions['JavaScript (ES6+)']}). I work with Node.js for backend and modern frameworks for building web applications.`,
      `JavaScript and TypeScript are core to my web development stack. I'm experienced in both frontend and backend JavaScript development!`,
    ],
  },
  {
    patterns: ['docker', 'containerization', 'devops', 'infrastructure', 'containers', 'compose'],
    responses: [
      () => CHATBOT_TRAINING_DATA.skillDescriptions.Docker || `I have hands-on experience with Docker for containerization. I've set up microservices, Docker Compose for multi-container apps, and CI/CD pipelines.`,
    ],
  },
  {
    patterns: ['artificial intelligence', 'ai', 'machine learning', 'ml', 'tensorflow', 'pytorch', 'neural network', 'deep learning'],
    responses: [
      `I'm experienced in AI and machine learning workflows. I work with frameworks like TensorFlow and PyTorch for building models, including computer vision and NLP projects.`,
      `AI/ML is a key area of expertise. I've built systems ranging from hand sign recognition to AI workflow integration in production environments.`,
    ],
  },
  {
    patterns: ['game development', 'unity', '3d', 'ar', 'augmented reality', 'game', 'graphics'],
    responses: [
      () => `${CHATBOT_TRAINING_DATA.skillDescriptions['Unity 3D']} I also have experience with ${CHATBOT_TRAINING_DATA.skillDescriptions['AR Foundation']}`,
    ],
  },
  {
    patterns: ['go', 'golang'],
    responses: [
      () => CHATBOT_TRAINING_DATA.skillDescriptions.Go || `Go is an efficient, statically typed language I use for concurrent programming and microservices development.`,
    ],
  },

  // Projects
  {
    patterns: ['projects', 'portfolio', 'what have you built', 'created', 'developed', 'project experience', 'showcase'],
    responses: [
      () => {
        const projects = CHATBOT_TRAINING_DATA.projects.slice(0, 3).map(p => p.title).join(', ');
        return `I've built quite a few projects: ${projects}, and more! Each one taught me something new. Want to hear about a specific one?`;
      },
      () => {
        const recentProjects = CHATBOT_TRAINING_DATA.projects.slice(0, 2)
          .map(p => `"${p.title}" (${p.role})`)
          .join(' and ');
        return `Some of my recent work includes ${recentProjects}. Happy to dive deeper into any of them!`;
      },
    ],
  },

  // Specific Project Questions
  {
    patterns: ['opencode', 'vscode', 'container', 'docker', 'environment setup'],
    responses: [
      () => {
        const project = CHATBOT_TRAINING_DATA.projects.find(p => p.title.includes('OpenCode'));
        return project ? `One of my projects was: ${project.description} Pretty cool for dev workflows!` : 'I worked on a containerized development environment setup!';
      },
    ],
  },
  {
    patterns: ['hand sign', 'recognition', 'computer vision', 'cnn', 'webcam'],
    responses: [
      () => {
        const project = CHATBOT_TRAINING_DATA.projects.find(p => p.title.includes('Hand Sign'));
        return project ? `I built this: ${project.description} It was a fun way to apply AI to real-world problems!` : 'I created a computer vision system for hand sign recognition!';
      },
    ],
  },
  {
    patterns: ['multitask', 'automation', 'workflow', 'pyqt6', 'focus', 'window management'],
    responses: [
      () => {
        const project = CHATBOT_TRAINING_DATA.projects.find(p => p.title.includes('MultiTask'));
        return project ? `I built an automation tool: ${project.description} Check it out on GitHub: ${project.link}` : 'I created a Python workflow automator with PyQt6!';
      },
    ],
  },

  // Contact
  {
    patterns: ['contact', 'reach out', 'email', 'phone', 'get in touch', 'message', 'how to contact', 'reach'],
    responses: [
      `You can reach me at ${CHATBOT_TRAINING_DATA.personality.email} or call ${CHATBOT_TRAINING_DATA.personality.phone}. I'm always happy to discuss projects and opportunities!`,
      `Feel free to contact me via email at ${CHATBOT_TRAINING_DATA.personality.email}. I'm based in ${CHATBOT_TRAINING_DATA.personality.location} and open to collaborations!`,
    ],
  },

  // Experience
  {
    patterns: ['experience', 'work', 'job', 'intern', 'professional', 'employment', 'background'],
    responses: [
      `I'm working as an AI Development Intern right now, which has been an amazing learning experience. I work on AI workflows, development, and infrastructure—basically a bit of everything!`,
      `My background spans AI development, full-stack web development, containerization with Docker, and system automation. I love building projects that solve real problems!`,
    ],
  },

  // Location
  {
    patterns: ['where are you', 'location', 'based', 'city', 'country', 'from', 'region'],
    responses: [
      `I'm based in ${CHATBOT_TRAINING_DATA.personality.location}. I'm always open to remote opportunities and collaborations with people worldwide!`,
      `I'm located in ${CHATBOT_TRAINING_DATA.personality.location}, but I'm very interested in remote work and connecting with teams globally!`,
    ],
  },

  // Goodbye
  {
    patterns: ['bye', 'goodbye', 'see you', 'exit', 'quit', 'farewell', 'thanks'],
    responses: [
      `Thanks for chatting! Feel free to explore the portfolio and reach out if you want to collaborate or discuss opportunities.`,
      `Goodbye! Don't hesitate to contact me—I'm always open to new projects and conversations!`,
      `See you! Feel free to check out my GitHub or reach out via email anytime.`,
    ],
  },

  // Help
  {
    patterns: ['help', 'what can you do', 'commands', 'features', 'how do i', 'how can i'],
    responses: [
      `I can tell you about my skills, projects, education, experience, and how to get in touch. Ask me about specific technologies, my work, or anything else you'd like to know!`,
    ],
  },

  // Fallback for unknown
  {
    patterns: [],
    responses: [
      `That's an interesting question! I might not have all the details on that, but feel free to ask about my skills, projects, or experience!`,
      `I'm not sure about that one, but I'm happy to discuss my background, what I've built, or opportunities to work together.`,
      `Great question! While I might not have the exact answer, feel free to reach out directly or explore the portfolio for more details.`,
    ],
    isDefault: true,
  },
];

/**
 * Calculate similarity between two strings using keyword matching
 * More forgiving matching with lower score requirements
 */
function calculateSimilarity(input: string, pattern: string): number {
  const inputWords = input.toLowerCase().split(/\s+/);
  const patternWords = pattern.toLowerCase().split(/\s+/);

  if (patternWords.length === 0) return 0;

  // Count word matches (more flexible - substring matching)
  const matches = inputWords.filter((word) =>
    patternWords.some((p) => 
      p === word || 
      p.includes(word) || 
      word.includes(p) ||
      (word.length > 3 && p.length > 3 && p.startsWith(word.substring(0, 3)))
    )
  ).length;

  return matches / patternWords.length;
}

/**
 * Find the best matching rule for user input with improved matching
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

  // If no good match found, use default rule (lowered threshold from 0.3 to 0.2)
  if (!bestRule || bestScore < 0.2) {
    bestRule = CHATBOT_RULES.find((r) => r.isDefault);
  }

  return { rule: bestRule, score: bestScore };
}

/**
 * Select a random response from rule responses
 * Handles both string and function responses
 */
function selectResponse(responses: (string | (() => string))[]): string {
  const selected = responses[Math.floor(Math.random() * responses.length)];
  
  // If response is a function, call it to generate dynamic content
  if (typeof selected === 'function') {
    return selected();
  }
  
  return selected;
}

/**
 * Generate chatbot response with improved matching and context awareness
 */
export function generateResponse(userInput: string, _context?: ConversationManager): string {
  if (!userInput.trim()) {
    return "Please say something! What would you like to know about the portfolio?";
  }

  const { rule } = findBestRule(userInput);

  if (!rule || rule.responses.length === 0) {
    return "I'm not sure how to respond to that. Feel free to ask about my skills, projects, education, or how to get in contact!";
  }

  try {
    return selectResponse(rule.responses);
  } catch (error) {
    console.error('Error generating response:', error);
    return "I encountered an issue generating a response. Please try asking again!";
  }
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
