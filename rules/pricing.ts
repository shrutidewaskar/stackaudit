export const pricingCatalog: Record<string, Record<string, number>> = {
  ChatGPT: {
    Plus: 20,
    Team: 30,
    Enterprise: 60,
    "API Direct": 0,
  },
  Claude: {
    Free: 0,
    Pro: 20,
    Max: 100,
    Team: 30,
    Enterprise: 60,
    "API Direct": 0,
  },
  Cursor: {
    Hobby: 0,
    Pro: 20,
    Business: 40,
    Enterprise: 100,
  },
  "GitHub Copilot": {
    Individual: 10,
    Business: 19,
    Enterprise: 39,
  },
  Gemini: {
    Pro: 20,
    Ultra: 50,
    API: 0,
  },
  "Anthropic API": {
    "Direct API": 0,
  },
  "OpenAI API": {
    "Direct API": 0,
  },
  Windsurf: {
    Free: 0,
    Pro: 15,
    Teams: 35,
  },
};

export function getPlanPrice(tool: string, plan: string) {
  return pricingCatalog[tool]?.[plan] ?? null;
}