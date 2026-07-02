export interface BuilderInput {
  budget: number;
  teamSize: number;
  departments: string[]; // "Engineering" | "Design" | "Marketing" | "Research" | "Operations"
  goals: string[]; // "Coding" | "Research" | "Meetings" | "Presentations" | "Documentation" | "Image Generation" | "Video"
  existingTools?: string[];
}

export interface RecommendedTool {
  name: string;
  plan: string;
  monthlyPrice: number; // per seat
  seats: number;
  totalCost: number;
  reason: string;
  category: string;
}

export interface StackBuilderResult {
  recommendedStack: RecommendedTool[];
  totalCost: number;
  remainingBudget: number;
  alternativeStack: RecommendedTool[];
  justification: string;
  upgradeSuggestions: string[];
}

export function buildStack(input: BuilderInput): StackBuilderResult {
  const { budget, teamSize, departments, goals } = input;

  // 1. Distribute seats to departments realistically
  const deptSeats: Record<string, number> = {};
  const activeDepts = departments.length > 0 ? departments : ["Engineering"]; // fallback

  if (activeDepts.length === 1) {
    deptSeats[activeDepts[0]] = teamSize;
  } else {
    // Relative weights for departments
    const weights: Record<string, number> = {
      Engineering: 0.6,
      Design: 0.15,
      Marketing: 0.15,
      Research: 0.05,
      Operations: 0.05,
    };

    let totalWeight = 0;
    activeDepts.forEach((d) => {
      totalWeight += weights[d] || 0.1;
    });

    let assigned = 0;
    activeDepts.forEach((d, index) => {
      if (index === activeDepts.length - 1) {
        // Last department gets the remainder
        deptSeats[d] = Math.max(1, teamSize - assigned);
      } else {
        const weight = weights[d] || 0.1;
        const share = Math.max(1, Math.round(teamSize * (weight / totalWeight)));
        deptSeats[d] = share;
        assigned += share;
      }
    });

    // Adjust in case of rounding mismatch
    const currentSum = Object.values(deptSeats).reduce((a, b) => a + b, 0);
    if (currentSum !== teamSize) {
      const diff = teamSize - currentSum;
      // Add or subtract from the largest department
      const largestDept = Object.keys(deptSeats).reduce((a, b) => (deptSeats[a] > deptSeats[b] ? a : b));
      deptSeats[largestDept] = Math.max(1, deptSeats[largestDept] + diff);
    }
  }

  // Helper to check if department/goal is active
  const hasDept = (d: string) => activeDepts.includes(d);
  const hasGoal = (g: string) => goals.includes(g);

  // 2. Recommend tools based on budget, departments, and goals
  const recommendedStack: RecommendedTool[] = [];
  const alternativeStack: RecommendedTool[] = [];
  const upgradeSuggestions: string[] = [];

  // Define recommendations
  // --- DEVELOPMENT ---
  if (hasDept("Engineering") || hasGoal("Coding")) {
    const engSeats = deptSeats["Engineering"] || Math.max(1, Math.round(teamSize * 0.5));
    
    // Primary: Cursor Pro ($20) + GitHub Copilot Business ($19)
    recommendedStack.push({
      name: "Cursor",
      plan: "Pro",
      monthlyPrice: 20,
      seats: engSeats,
      totalCost: 20 * engSeats,
      reason: "Provides deep codebase intelligence and multi-file code editing for developers.",
      category: "Development"
    });

    recommendedStack.push({
      name: "GitHub Copilot",
      plan: "Business",
      monthlyPrice: 19,
      seats: engSeats,
      totalCost: 19 * engSeats,
      reason: "Offers ultra-fast in-editor autocomplete and inline code suggestions.",
      category: "Development"
    });

    // Alternative: Stepping down to just GitHub Copilot Business, or Windsurf
    alternativeStack.push({
      name: "Windsurf",
      plan: "Pro",
      monthlyPrice: 15,
      seats: engSeats,
      totalCost: 15 * engSeats,
      reason: "An alternative agentic IDE at a slightly lower price point.",
      category: "Development"
    });
  }

  // --- DESIGN & CREATIVE ---
  if (hasDept("Design") || hasGoal("Image Generation") || hasGoal("Video")) {
    const designSeats = deptSeats["Design"] || Math.max(1, Math.round(teamSize * 0.2));
    
    recommendedStack.push({
      name: "v0",
      plan: "Pro",
      monthlyPrice: 20,
      seats: designSeats,
      totalCost: 20 * designSeats,
      reason: "Speeds up frontend UI iterations by generating React and Tailwind components directly.",
      category: "Design"
    });

    // Only buy Midjourney for a portion of the team
    const mjSeats = Math.max(1, Math.round(designSeats * 0.5));
    recommendedStack.push({
      name: "Midjourney",
      plan: "Standard",
      monthlyPrice: 30,
      seats: mjSeats,
      totalCost: 30 * mjSeats,
      reason: "Standard creative plan for high-quality assets and concepts.",
      category: "Design"
    });

    alternativeStack.push({
      name: "Midjourney",
      plan: "Basic",
      monthlyPrice: 10,
      seats: mjSeats,
      totalCost: 10 * mjSeats,
      reason: "A budget-friendly image generator subscription with limited fast rendering hours.",
      category: "Design"
    });
  }

  // --- GENERAL ASSISTANTS (WRITING, DOCS, OUTLINES) ---
  const generalSeats = teamSize; // Everyone benefits from a general assistant
  
  if (hasDept("Marketing") || hasDept("Operations") || hasGoal("Documentation") || hasGoal("Presentations")) {
    // Primary: Claude Pro ($20/mo) for general high-quality writing and reasoning
    recommendedStack.push({
      name: "Claude",
      plan: "Pro",
      monthlyPrice: 20,
      seats: generalSeats,
      totalCost: 20 * generalSeats,
      reason: "Excellent for writing, drafting documentation, and complex reasoning tasks.",
      category: "Writing"
    });

    alternativeStack.push({
      name: "ChatGPT",
      plan: "Plus",
      monthlyPrice: 20,
      seats: generalSeats,
      totalCost: 20 * generalSeats,
      reason: "General conversational chatbot with high message limits and GPT-4o.",
      category: "Writing"
    });
  } else {
    // If no writing-heavy departments, just recommend ChatGPT Plus for general tasks
    recommendedStack.push({
      name: "ChatGPT",
      plan: "Plus",
      monthlyPrice: 20,
      seats: Math.max(1, Math.round(generalSeats * 0.5)), // partial coverage
      totalCost: 20 * Math.max(1, Math.round(generalSeats * 0.5)),
      reason: "Versatile general-purpose chatbot for miscellaneous administrative and coding queries.",
      category: "Writing"
    });
  }

  // --- RESEARCH & WEB SEARCH ---
  if (hasDept("Research") || hasGoal("Research")) {
    const researchSeats = deptSeats["Research"] || Math.max(1, Math.round(teamSize * 0.2));
    
    recommendedStack.push({
      name: "Perplexity",
      plan: "Pro",
      monthlyPrice: 20,
      seats: researchSeats,
      totalCost: 20 * researchSeats,
      reason: "Combines real-time web search with source citations for fast, verified research.",
      category: "Research"
    });

    alternativeStack.push({
      name: "Gemini",
      plan: "Advanced",
      monthlyPrice: 20,
      seats: researchSeats,
      totalCost: 20 * researchSeats,
      reason: "Google integration with a large context window for researching extensive documents.",
      category: "Research"
    });
  }

  // --- MEETINGS ---
  if (hasGoal("Meetings")) {
    // Otter.ai for transcription
    const meetingSeats = Math.max(1, Math.round(teamSize * 0.3)); // only core active meeting participants
    recommendedStack.push({
      name: "Otter.ai",
      plan: "Pro",
      monthlyPrice: 17,
      seats: meetingSeats,
      totalCost: 17 * meetingSeats,
      reason: "Automates meeting transcription and key action item lists.",
      category: "Meetings"
    });
  }

  // --- OPERATIONS / ZAPIER ---
  if (hasDept("Operations")) {
    const opsSeats = deptSeats["Operations"] || 1;
    recommendedStack.push({
      name: "Zapier Central",
      plan: "Included",
      monthlyPrice: 20,
      seats: opsSeats,
      totalCost: 20 * opsSeats,
      reason: "Integrates AI reasoning directly into operational APIs and databases.",
      category: "Operations"
    });
  }

  // 3. Optimize cost if it exceeds budget
  let totalCost = recommendedStack.reduce((sum, item) => sum + item.totalCost, 0);

  if (totalCost > budget && budget > 0) {
    // Optimize: Downgrade or remove low priority items
    // First, let's look at reducing seats to only essential users
    for (const item of recommendedStack) {
      if (item.name === "Cursor" && item.seats > 1) {
        // Limit Cursor seats to 70% of developers (others can use free editors or Copilot)
        const oldSeats = item.seats;
        item.seats = Math.max(1, Math.round(oldSeats * 0.7));
        item.totalCost = item.seats * item.monthlyPrice;
        upgradeSuggestions.push(`Purchase additional Cursor Pro seats for the remaining ${oldSeats - item.seats} developer(s) as budget grows.`);
      }
      if (item.name === "Claude" && item.seats > 1) {
        // Limit Claude seats to 50% of the team (others can share or use free options)
        const oldSeats = item.seats;
        item.seats = Math.max(1, Math.round(oldSeats * 0.5));
        item.totalCost = item.seats * item.monthlyPrice;
        upgradeSuggestions.push(`Roll out Claude Pro to the remaining ${oldSeats - item.seats} team members once budget expands.`);
      }
    }
    
    totalCost = recommendedStack.reduce((sum, item) => sum + item.totalCost, 0);
    
    // If still over budget, swap out premium tools for alternatives
    if (totalCost > budget) {
      const cursorIndex = recommendedStack.findIndex((item) => item.name === "Cursor");
      if (cursorIndex !== -1) {
        // Remove Cursor, developers use VS Code + Copilot
        const removed = recommendedStack.splice(cursorIndex, 1)[0];
        upgradeSuggestions.push(`Adopt Cursor ($20/seat) as your primary IDE once the monthly budget allows for an extra $${removed.totalCost}/mo.`);
      }
    }
    
    totalCost = recommendedStack.reduce((sum, item) => sum + item.totalCost, 0);

    // If STILL over budget, reduce all seat allocations to minimum (1 seat)
    if (totalCost > budget) {
      recommendedStack.forEach((item) => {
        item.seats = 1;
        item.totalCost = item.monthlyPrice;
      });
      totalCost = recommendedStack.reduce((sum, item) => sum + item.totalCost, 0);
    }
  }

  // 4. Generate alternative stack if empty
  if (alternativeStack.length === 0) {
    alternativeStack.push({
      name: "ChatGPT",
      plan: "Plus",
      monthlyPrice: 20,
      seats: teamSize,
      totalCost: 20 * teamSize,
      reason: "Universal chat workspace serving general purposes.",
      category: "Writing"
    });
  } else {
    // Set seats for alternatives properly
    alternativeStack.forEach((alt) => {
      const match = recommendedStack.find((rec) => rec.category === alt.category);
      alt.seats = match ? match.seats : 1;
      alt.totalCost = alt.seats * alt.monthlyPrice;
    });
  }

  // Deduplicate alternative items and filter out recommended items
  const finalAlternativeStack = alternativeStack.filter(
    (alt) => !recommendedStack.some((rec) => rec.name === alt.name && rec.plan === alt.plan)
  );

  // Remaining budget
  const remainingBudget = budget - totalCost;

  // Justification
  let justification = "";
  if (totalCost <= budget) {
    justification = `This stack is fully optimized for a team of ${teamSize} across ${activeDepts.join(
      ", "
    )} with a healthy surplus of $${remainingBudget.toFixed(0)}/mo. We've focused spending on developer productivity (Cursor + Copilot) and general writing workflows (Claude) while allocating dedicated search capabilities (Perplexity) only to active researchers.`;
  } else {
    justification = `Due to a tight budget of $${budget}/mo, we optimized the stack by narrowing licenses to key contributors. General assistants are limited to core writers, and developer licenses have been scaled down. Swapping Cursor for VS Code + Copilot keeps the team operational within bounds.`;
  }

  // Upgrade suggestions fallback
  if (upgradeSuggestions.length === 0) {
    upgradeSuggestions.push("Introduce meeting transcription automation (Otter.ai) to increase team alignment.");
    upgradeSuggestions.push("Integrate custom operational workflows with APIs (OpenAI API Direct) for background integrations.");
  }

  return {
    recommendedStack,
    totalCost,
    remainingBudget,
    alternativeStack: finalAlternativeStack,
    justification,
    upgradeSuggestions,
  };
}
