import { databaseService, DBMemory } from './database.js';

export class MemoryService {
  /**
   * Retrieves long-term memories for a user and compiles a clean text block
   * suitable for injection into system instructions or system prompts.
   */
  async compileContextForPrompt(userId: string): Promise<string> {
    try {
      const memories = await databaseService.getMemories(userId);
      if (memories.length === 0) {
        return "";
      }

      // Format distinct classes of memories
      const preferences = memories.filter(m => m.category === 'preference').map(m => `- ${m.memoryText}`);
      const goals = memories.filter(m => m.category === 'goal').map(m => `- ${m.memoryText}`);
      const habits = memories.filter(m => m.category === 'habit').map(m => `- ${m.memoryText}`);
      const summaries = memories.filter(m => m.category === 'summary').map(m => `- ${m.memoryText}`);

      let contextBlock = "\n\n=== LONG-TERM PERSONALIZED USER MEMORY (RECALL) ===\n";
      contextBlock += "These are verified preference traits and background goals recalled from previous conversations. Adapt your tone, advice, and guidance to match them seamlessly:\n";
      
      if (preferences.length > 0) {
        contextBlock += `\nUser Preferences & Communication Style:\n${preferences.join('\n')}\n`;
      }
      if (goals.length > 0) {
        contextBlock += `\nActive Therapeutic & Well-being Goals:\n${goals.join('\n')}\n`;
      }
      if (habits.length > 0) {
        contextBlock += `\nBehavioral Habits & Coping Mechanisms:\n${habits.join('\n')}\n`;
      }
      if (summaries.length > 0) {
        contextBlock += `\nSummarized insights from recent wellness discussions:\n${summaries.join('\n')}\n`;
      }
      contextBlock += "=====================================================\n";

      return contextBlock;
    } catch (err) {
      console.error("Failed to compile memory context:", err);
      return "";
    }
  }

  /**
   * Auto-extracts new insights or preferences from conversation exchanges
   * and saves them securely in the database.
   */
  async autoExtractAndStore(userId: string, userText: string, aiText: string): Promise<DBMemory[]> {
    const memoriesCreated: DBMemory[] = [];
    const text = userText.toLowerCase();

    // 1. Heuristic Preference extraction
    if (text.includes("i prefer") || text.includes("i like") || text.includes("speak to me") || text.includes("talk to me")) {
      const extraction = `User expressed preferences on conversation style: "${userText.slice(0, 80)}"`;
      const memory = await databaseService.saveMemory({
        id: `mem_${Date.now()}_pref`,
        userId,
        memoryText: extraction,
        category: 'preference',
        strength: 4,
        createdAt: new Date().toISOString()
      });
      memoriesCreated.push(memory);
    }

    // 2. Goals extraction
    if (text.includes("my goal") || text.includes("working on") || text.includes("i want to achieve") || text.includes("trying to")) {
      const extraction = `User wellness focus: "${userText.slice(0, 80)}"`;
      const memory = await databaseService.saveMemory({
        id: `mem_${Date.now()}_goal`,
        userId,
        memoryText: extraction,
        category: 'goal',
        strength: 4,
        createdAt: new Date().toISOString()
      });
      memoriesCreated.push(memory);
    }

    // 3. Habits extraction
    if (text.includes("i usually") || text.includes("every day") || text.includes("daily") || text.includes("i practice")) {
      const extraction = `Observed user routine: "${userText.slice(0, 80)}"`;
      const memory = await databaseService.saveMemory({
        id: `mem_${Date.now()}_habit`,
        userId,
        memoryText: extraction,
        category: 'habit',
        strength: 3,
        createdAt: new Date().toISOString()
      });
      memoriesCreated.push(memory);
    }

    return memoriesCreated;
  }

  /**
   * Adds a manual memory trace
   */
  async createManualMemory(userId: string, text: string, category: 'preference' | 'goal' | 'habit' | 'personality' | 'summary'): Promise<DBMemory> {
    return databaseService.saveMemory({
      id: `mem_${Date.now()}_man`,
      userId,
      memoryText: text,
      category,
      strength: 5,
      createdAt: new Date().toISOString()
    });
  }

  /**
   * Retrieves all memories for dashboard consumption
   */
  async getAllMemoriesForUser(userId: string): Promise<DBMemory[]> {
    return databaseService.getMemories(userId);
  }

  /**
   * Deletes a specific memory trace
   */
  async deleteMemory(userId: string, memoryId: string): Promise<boolean> {
    return databaseService.deleteMemory(userId, memoryId);
  }
}

export const memoryService = new MemoryService();
