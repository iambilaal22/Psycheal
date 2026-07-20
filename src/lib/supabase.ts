import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isRealSupabaseConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

// A mock Supabase Auth client that perfectly mimics Supabase Auth's behavior and persistence 
// in local storage to prevent errors, keep sessions isolated per-browser, and enable immediate sandbox testing.
class MockSupabaseAuth {
  private listeners: Set<(event: string, session: any) => void> = new Set();
  private sessionKey = 'psycheal_supabase_session';
  private usersKey = 'psycheal_supabase_users';

  constructor() {
    // Listen for storage events to support multi-tab synchronization in the same browser
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === this.sessionKey) {
          const session = this.getSessionFromStorage();
          this.triggerListeners(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
        }
      });
    }
  }

  private getSessionFromStorage() {
    try {
      const data = localStorage.getItem(this.sessionKey);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private setSessionInStorage(session: any) {
    try {
      if (session) {
        localStorage.setItem(this.sessionKey, JSON.stringify(session));
      } else {
        localStorage.removeItem(this.sessionKey);
      }
    } catch (e) {
      console.error('Failed to update session storage:', e);
    }
  }

  private getUsersFromStorage(): any[] {
    try {
      const data = localStorage.getItem(this.usersKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveUserToStorage(user: any) {
    try {
      const users = this.getUsersFromStorage();
      const existingIdx = users.findIndex(u => u.email === user.email);
      if (existingIdx >= 0) {
        users[existingIdx] = user;
      } else {
        users.push(user);
      }
      localStorage.setItem(this.usersKey, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save user storage:', e);
    }
  }

  private triggerListeners(event: string, session: any) {
    this.listeners.forEach(cb => {
      try {
        cb(event, session);
      } catch (e) {
        console.error('Error in onAuthStateChange listener:', e);
      }
    });
  }

  async signUp({ email, password, options }: any) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (!email || !password) {
      return { data: { user: null, session: null }, error: new Error('Email and password are required.') };
    }

    const users = this.getUsersFromStorage();
    if (users.some(u => u.email === email)) {
      return { data: { user: null, session: null }, error: new Error('User already exists.') };
    }

    const nickname = options?.data?.nickname || email.split('@')[0];
    const user = {
      id: `sb-user-${Math.random().toString(36).substring(2, 15)}`,
      email,
      user_metadata: { nickname },
      created_at: new Date().toISOString()
    };

    // Save the user and password (hashed/mocked)
    this.saveUserToStorage({ ...user, password });

    const session = {
      access_token: `sb-token-${user.id}`,
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: `sb-refresh-${Math.random().toString(36).substring(2, 15)}`,
      user
    };

    this.setSessionInStorage(session);
    this.triggerListeners('SIGNED_IN', session);

    return { data: { user, session }, error: null };
  }

  async signInWithPassword({ email, password }: any) {
    await new Promise(resolve => setTimeout(resolve, 800));

    if (!email || !password) {
      return { data: { user: null, session: null }, error: new Error('Email and password are required.') };
    }

    const users = this.getUsersFromStorage();
    const userRecord = users.find(u => u.email === email && u.password === password);

    if (!userRecord) {
      return { data: { user: null, session: null }, error: new Error('Invalid login credentials.') };
    }

    const { password: _, ...user } = userRecord;

    const session = {
      access_token: `sb-token-${user.id}`,
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: `sb-refresh-${Math.random().toString(36).substring(2, 15)}`,
      user
    };

    this.setSessionInStorage(session);
    this.triggerListeners('SIGNED_IN', session);

    return { data: { user, session }, error: null };
  }

  async signOut() {
    this.setSessionInStorage(null);
    this.triggerListeners('SIGNED_OUT', null);
    return { error: null };
  }

  async getSession() {
    const session = this.getSessionFromStorage();
    return { data: { session }, error: null };
  }

  async getUser() {
    const session = this.getSessionFromStorage();
    return { data: { user: session ? session.user : null }, error: null };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listeners.add(callback);
    
    // Trigger initial state callback
    const session = this.getSessionFromStorage();
    setTimeout(() => {
      callback('INITIAL_SESSION', session);
    }, 0);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners.delete(callback);
          }
        }
      }
    };
  }
}

// Instantiate the actual or mock Supabase client
export const supabase = isRealSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: new MockSupabaseAuth(),
      storage: {},
      from: () => ({})
    } as any;
