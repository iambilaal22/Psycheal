export interface UserProfile {
  uid: string;
  email: string;
  nickname: string;
  premium: boolean;
  joinedAt: string;
  checkInStreak: number;
  lastCheckInDate?: string;
  dailyGoalMinutes: number;
}

export interface MoodRecord {
  id: string;
  date: string; // ISO String (yyyy-MM-dd)
  score: number; // 1 to 10
  energy: number; // 1 to 10
  sleep: number; // hours
  notes: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string; // ISO String
  moodScore: number;
  aiFeedback?: string; // Thoughtful reflections
}

export interface ChatMessage {
  sender: "user" | "assistant";
  text: string;
  timestamp: string; // ISO String
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string; // ISO String
}

export interface WellnessTask {
  id: string;
  title: string;
  completed: boolean;
  notes?: string;
}

export interface WellnessPlan {
  id: string;
  title: string;
  description: string;
  category: "Mindfulness" | "CBT" | "Anxiety Grounding" | "Self-Reflection";
  durationDays: number;
  isActive: boolean;
  createdAt: string;
  tasks: WellnessTask[];
}

export interface CommunityMessage {
  id: string;
  authorName: string;
  text: string;
  timestamp: string;
  hearts: number;
  category: "Support" | "Gratitude" | "Reflection" | "Grounding";
}
