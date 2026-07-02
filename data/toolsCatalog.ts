export interface ToolCatalogItem {
  name: string;
  pricing: string;
  website: string;
  category: "Development" | "Writing" | "Research" | "Design" | "Operations" | "Meetings";
  bestFor: string;
  pros: string[];
  cons: string[];
  monthlyPrice: number;
  rating: number;
  description: string;
}

export const toolsCatalog: ToolCatalogItem[] = [
  {
    name: "ChatGPT",
    pricing: "$20/mo (Plus), $25/mo (Team, billed annually)",
    website: "https://chatgpt.com",
    category: "Writing",
    bestFor: "General-purpose conversation, writing, brainstorming, and data analysis.",
    pros: ["Large knowledge base", "Strong reasoning capabilities", "Advanced data analysis tools", "DALL-E image generation"],
    cons: ["Can be generic in code generation", "Knowledge cutoff limitations", "Privacy concerns on basic tier"],
    monthlyPrice: 20,
    rating: 4.8,
    description: "OpenAI's flagship conversational assistant powered by GPT-4o, ideal for writing, brainstorming, analysis, and general task automation."
  },
  {
    name: "Claude",
    pricing: "$20/mo (Pro), $25/mo (Team, billed annually)",
    website: "https://claude.ai",
    category: "Writing",
    bestFor: "Complex reasoning, writing, coding support, and analyzing long documents.",
    pros: ["Exceptional reasoning and coding skills", "Large context window (200k+)", "Artifacts feature for interactive previews", "More natural writing voice"],
    cons: ["Shorter message limits under high load", "No integrated web search", "No built-in image generator"],
    monthlyPrice: 20,
    rating: 4.9,
    description: "Anthropic's conversational assistant renowned for high-quality writing, deep reasoning capabilities, coding aptitude, and large document context handling."
  },
  {
    name: "Cursor",
    pricing: "$20/mo (Pro), $40/mo (Business)",
    website: "https://cursor.com",
    category: "Development",
    bestFor: "Advanced code editing, codebase-wide querying, and autocompletion.",
    pros: ["Deep codebase indexing", "In-editor multi-file edits (Composer)", "Sleek Fork of VS Code", "Supports Claude 3.5 Sonnet and GPT-4o"],
    cons: ["Requires transition from VS Code", "Subscription separate from other IDEs", "No free unlimited model access"],
    monthlyPrice: 20,
    rating: 4.95,
    description: "The AI-first code editor built around VS Code. Enables natural language instructions to edit multiple files, explain legacy codebases, and autocomplete logic."
  },
  {
    name: "GitHub Copilot",
    pricing: "$10/mo (Individual), $19/mo (Business), $39/mo (Enterprise)",
    website: "https://github.com/features/copilot",
    category: "Development",
    bestFor: "Inline code autocomplete, chat inside multiple IDEs.",
    pros: ["Extremely fast inline completions", "Works in JetBrains, VS Code, Visual Studio", "Backed by corporate compliance", "Enterprise knowledge base search"],
    cons: ["Less powerful for codebase-wide edits than Cursor", "Autocomplete can sometimes be repetitive", "Basic chat UI"],
    monthlyPrice: 10,
    rating: 4.7,
    description: "The pioneer AI programmer from GitHub, providing inline code suggestions, docstring generation, and in-editor chat across a variety of IDEs."
  },
  {
    name: "Gemini",
    pricing: "$20/mo (Advanced), $30/mo (Business)",
    website: "https://gemini.google.com",
    category: "Research",
    bestFor: "Google Workspace integration, large video/document analysis.",
    pros: ["Massive 1M+ token context window", "Native integration with Google Docs, Gmail, Drive", "Superb speed", "Multimodal input including video"],
    cons: ["Reasoning can occasionally hallucinate detail", "Workspace integration requires permission management"],
    monthlyPrice: 20,
    rating: 4.6,
    description: "Google's conversational AI integrated into the Google ecosystem, utilizing Gemini 1.5 Pro to analyze vast amounts of text, audio, and video."
  },
  {
    name: "Perplexity",
    pricing: "$20/mo (Pro)",
    website: "https://perplexity.ai",
    category: "Research",
    bestFor: "Real-time search, research, and citations.",
    pros: ["Real-time web search with source citation", "Access to multiple underlying models (Claude, GPT)", "Collections for shared workspaces", "File analysis with web searching"],
    cons: ["Slower response times due to live searching", "Summarization can occasionally merge conflicting sources"],
    monthlyPrice: 20,
    rating: 4.85,
    description: "An AI-powered search engine that answers questions with real-time web references, structured summaries, and interactive model options."
  },
  {
    name: "Midjourney",
    pricing: "$10/mo (Basic), $30/mo (Standard), $60/mo (Pro)",
    website: "https://midjourney.com",
    category: "Design",
    bestFor: "High-quality, artistic image generation and concept art.",
    pros: ["Industry-leading image quality and aesthetics", "Powerful model controls", "Consistent web interface and Discord bot options"],
    cons: ["Steep learning curve for prompting syntax", "Pricing gets high for fast generation hours", "No vector export"],
    monthlyPrice: 10,
    rating: 4.75,
    description: "The premier AI image generator that turns text prompts into detailed, highly realistic, or stylized digital artwork."
  },
  {
    name: "v0",
    pricing: "Free, $20/mo (Pro)",
    website: "https://v0.dev",
    category: "Design",
    bestFor: "Generative UI, React/Tailwind frontend code generation.",
    pros: ["Instant react/html/css code creation", "Interactive visual preview", "Supports shadcn/ui components", "Fast iterations"],
    cons: ["Limited to frontend code", "Can output outdated dependencies occasionally"],
    monthlyPrice: 20,
    rating: 4.8,
    description: "Vercel's generative UI system that designs modern React and Tailwind components from simple text prompts, allowing direct preview and copy-paste."
  },
  {
    name: "Windsurf",
    pricing: "Free, $15/mo (Pro), $35/mo (Teams)",
    website: "https://codeium.com/windsurf",
    category: "Development",
    bestFor: "AI-driven coding workflow with agentic features.",
    pros: ["Fast agentic coding loops", "Flow-state inline editing", "Strong codebase indexing", "Lower price point than some IDEs"],
    cons: ["Newer platform with fewer extensions than VS Code marketplace"],
    monthlyPrice: 15,
    rating: 4.65,
    description: "Codeium's agentic IDE designed to work in absolute sync with developers, offering terminal execution and file editing capabilities natively."
  },
  {
    name: "Otter.ai",
    pricing: "$16.99/mo (Pro), $30/mo (Business)",
    website: "https://otter.ai",
    category: "Meetings",
    bestFor: "Meeting transcripts, action items, and live notes.",
    pros: ["Highly accurate transcriptions", "Integrates with Zoom, Teams, Meet", "Creates useful action item summaries", "Searchable meeting history"],
    cons: ["Transcription can struggle with accents or crosstalk", "Requires calendar integrations for full automation"],
    monthlyPrice: 17,
    rating: 4.5,
    description: "An AI meeting assistant that records audio, writes notes, captures action items, and generates searchable transcripts in real-time."
  },
  {
    name: "Zapier Central",
    pricing: "Included in Zapier Pro (Starts at $20/mo)",
    website: "https://zapier.com/central",
    category: "Operations",
    bestFor: "Workflow automation, linking AI with 6,000+ app integrations.",
    pros: ["Huge ecosystem of app integrations", "Natural language instructions to build triggers", "Persistent AI workspace bots"],
    cons: ["Requires Zapier configuration", "Can get expensive with high execution volumes"],
    monthlyPrice: 20,
    rating: 4.4,
    description: "Zapier's natural language automation center, allowing users to build AI bots that communicate with thousands of enterprise systems to run workflows."
  }
];
