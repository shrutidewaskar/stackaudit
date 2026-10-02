export const AIConfig = {
  provider: process.env.AI_PROVIDER || "mock", // 'mock' | 'gemini'
  
  // Google Cloud Vertex AI settings
  vertex: {
    vertexai: true,
    project: process.env.GOOGLE_CLOUD_PROJECT || "stackaudit-dev",
    location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1"
  },

  // Model parameters
  model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  temperature: 0.1,
  maxOutputTokens: 2048,
  
  // Telemetry constraints
  contextSizeLimitKb: 500
};
