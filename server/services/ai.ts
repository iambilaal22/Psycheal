import { GoogleGenAI, Type } from '@google/genai';

export interface AIProvider {
  generateText(messages: any[], systemInstruction?: string): Promise<string>;
  generateStructured(messages: any[], systemInstruction: string, schema: any): Promise<any>;
}

// 1. Google Gemini Provider
export class GeminiProvider implements AIProvider {
  private aiClient: GoogleGenAI;

  constructor() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY_MISSING");
    }
    this.aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  async generateText(messages: any[], systemInstruction?: string): Promise<string> {
    // Format messages for @google/genai
    const contents = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const modelsToTry = ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await this.aiClient.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });
        return response.text || '';
      } catch (err: any) {
        console.warn(`Gemini generation failed for model ${modelName}, trying fallback if available. Error:`, err.message || err);
        lastError = err;
      }
    }
    throw lastError || new Error("Gemini generation failed on all fallback models");
  }

  async generateStructured(messages: any[], systemInstruction: string, schema: any): Promise<any> {
    // Format messages for @google/genai
    const contents = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const modelsToTry = ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await this.aiClient.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: schema,
            temperature: 0.7,
          }
        });
        return JSON.parse(response.text || '{}');
      } catch (err: any) {
        console.warn(`Gemini structured generation failed for model ${modelName}, trying fallback if available. Error:`, err.message || err);
        lastError = err;
      }
    }
    throw lastError || new Error("Gemini structured generation failed on all fallback models");
  }
}

// 2. Self-Hosted Open Weight Model Provider (Gemma / Llama / Qwen via OpenAI-compatible endpoints)
export class OpenWeightProvider implements AIProvider {
  private apiUrl: string;
  private apiKey: string;
  private modelName: string;

  constructor() {
    this.apiUrl = process.env.OPEN_WEIGHT_MODEL_API_URL || 'https://api.openai.com/v1'; // fallback
    this.apiKey = process.env.OPEN_WEIGHT_MODEL_API_KEY || '';
    this.modelName = process.env.OPEN_WEIGHT_MODEL_NAME || 'gemma2-9b-it';
  }

  async generateText(messages: any[], systemInstruction?: string): Promise<string> {
    const formattedMessages = [];
    if (systemInstruction) {
      formattedMessages.push({ role: 'system', content: systemInstruction });
    }
    messages.forEach(msg => {
      formattedMessages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    });

    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: formattedMessages,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Open-Weight Provider returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (err: any) {
      console.error("OpenWeightProvider Error:", err);
      throw err;
    }
  }

  async generateStructured(messages: any[], systemInstruction: string, schema: any): Promise<any> {
    const formattedMessages = [
      { role: 'system', content: `${systemInstruction}\n\nIMPORTANT: You must return valid JSON that conforms exactly to the following JSON schema: ${JSON.stringify(schema)}` }
    ];
    messages.forEach(msg => {
      formattedMessages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    });

    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: formattedMessages,
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`Open-Weight Provider failed: ${response.statusText}`);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content || '{}';
      return JSON.parse(rawText);
    } catch (err) {
      console.error("OpenWeightProvider Structured Output Error:", err);
      throw err;
    }
  }
}

// 3. Unified AI Service with Provider Selection
export class AIService {
  private activeProvider: AIProvider | null = null;
  private providerType: 'gemini' | 'openweight' = 'gemini';

  constructor() {
    this.initializeProvider();
  }

  initializeProvider() {
    const configProvider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
    try {
      if (configProvider === 'open_weight_model') {
        // Validate required variables if open_weight_model is selected
        if (!process.env.OPEN_WEIGHT_MODEL_API_URL) {
          throw new Error("OPEN_WEIGHT_MODEL_API_URL is required when AI_PROVIDER is set to open_weight_model");
        }
        if (!process.env.OPEN_WEIGHT_MODEL_NAME) {
          throw new Error("OPEN_WEIGHT_MODEL_NAME is required when AI_PROVIDER is set to open_weight_model");
        }
        this.activeProvider = new OpenWeightProvider();
        this.providerType = 'openweight';
        console.log("AI Service successfully initialized with Open-Weight Model Provider.");
      } else {
        this.activeProvider = new GeminiProvider();
        this.providerType = 'gemini';
        console.log("AI Service successfully initialized with Google Gemini Provider.");
      }
    } catch (err: any) {
      console.warn(`WARNING: Failed to initialize active provider (${configProvider}). Fallback to lazy creation or mock state:`, err.message);
      this.activeProvider = null;
    }
  }

  getProvider(): AIProvider {
    if (!this.activeProvider) {
      // Lazy retry or default to Gemini
      try {
        const configProvider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
        if (configProvider === 'open_weight_model') {
          if (!process.env.OPEN_WEIGHT_MODEL_API_URL) {
            throw new Error("OPEN_WEIGHT_MODEL_API_URL is required when AI_PROVIDER is set to open_weight_model");
          }
          if (!process.env.OPEN_WEIGHT_MODEL_NAME) {
            throw new Error("OPEN_WEIGHT_MODEL_NAME is required when AI_PROVIDER is set to open_weight_model");
          }
          this.activeProvider = new OpenWeightProvider();
          this.providerType = 'openweight';
        } else {
          this.activeProvider = new GeminiProvider();
          this.providerType = 'gemini';
        }
      } catch (err: any) {
        throw new Error("AI_PROVIDER_UNCONFIGURED");
      }
    }
    return this.activeProvider;
  }

  getProviderType(): 'gemini' | 'openweight' {
    return this.providerType;
  }

  async generate(messages: any[], systemInstruction?: string): Promise<string> {
    return this.getProvider().generateText(messages, systemInstruction);
  }

  async generateStructured(messages: any[], systemInstruction: string, schema: any): Promise<any> {
    return this.getProvider().generateStructured(messages, systemInstruction, schema);
  }
}

export const aiService = new AIService();
