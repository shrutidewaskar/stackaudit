import { IntentType } from "./types";

export class IntentService {
  detectIntent(message: string): IntentType {
    const text = message.toLowerCase();

    if (text.includes("hello") || text.includes("hi") || text.includes("hey") || text.includes("greetings")) {
      return "Greeting";
    }
    if (text.includes("help") || text.includes("support") || text.includes("how to use") || text.includes("what is this")) {
      return "Help";
    }
    if (text.includes("reduce") || text.includes("save") || text.includes("optimize") || text.includes("redundant") || text.includes("cut") || text.includes("expense") || text.includes("cost")) {
      return "Optimization";
    }
    if (text.includes("hire") || text.includes("hiring") || text.includes("growth") || text.includes("simulate") || text.includes("scale") || text.includes("team size")) {
      return "Planning";
    }
    if (text.includes("compare") || text.includes("versus") || text.includes("vs") || text.includes("claude") || text.includes("gpt") || text.includes("alternative")) {
      return "Comparison";
    }
    if (text.includes("forecast") || text.includes("annual") || text.includes("projection") || text.includes("budget") || text.includes("saving")) {
      return "Forecasting";
    }
    if (text.includes("buy") || text.includes("procure") || text.includes("negotiate") || text.includes("enterprise") || text.includes("license")) {
      return "Procurement";
    }

    return "Exploration";
  }
}

export const intentService = new IntentService();
