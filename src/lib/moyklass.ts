const BASE_URL = 'https://api.moyklass.com/v1';

export interface MoyKlassConfig {
  apiKey: string;
  filialId?: number;
}

export class MoyKlassClient {
  private apiKey: string;
  private accessToken: string | null = null;
  private useDirectAuth: boolean = false;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async getAccessToken(): Promise<string | null> {
    if (this.accessToken || this.useDirectAuth) return this.accessToken;

    try {
      // Corrected endpoint from documentation: /company/auth/getToken
      const response = await fetch(`${BASE_URL}/company/auth/getToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ apiKey: this.apiKey })
      });

      if (response.status === 404) {
        console.warn('MoyKlass: /company/auth/getToken not found, trying legacy /auth');
        // Attempt legacy auth as a last resort
        const legacyResp = await fetch(`${BASE_URL}/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: this.apiKey })
        });

        if (legacyResp.status === 404) {
          console.log('MoyKlass: No auth endpoint found, switching to direct API key auth');
          this.useDirectAuth = true;
          return null;
        }

        if (!legacyResp.ok) throw new Error(`Legacy Auth Failed: ${legacyResp.statusText}`);
        const data = await legacyResp.json();
        this.accessToken = data.accessToken;
        return this.accessToken;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`MoyKlass Auth Failed: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.accessToken;
      return this.accessToken;
    } catch (err: any) {
      console.error('MoyKlass Auth Error:', err.message);
      // Fallback to direct auth if we're hitting 404s or other auth-related errors
      if (err.message?.includes('404') || err.message?.includes('Not Found')) {
          this.useDirectAuth = true;
          return null;
      }
      throw err;
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    await this.getAccessToken();

    const headers: Record<string, string> = {
      ...options.headers as any,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.useDirectAuth) {
      headers['x-api-key'] = this.apiKey;
    } else if (this.accessToken) {
      headers['x-access-token'] = this.accessToken;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`MoyKlass API Error: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  // Clients (Users)
  async findUserByContact(contact: string) {
    const users = await this.request(`/users?search=${encodeURIComponent(contact)}`);
    return users.length > 0 ? users[0] : null;
  }

  async createUser(userData: { name: string; email?: string; phone?: string }) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // Lessons and Records
  async getLessons(params: { from: string; to: string; filialId?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/lessons?${query}`);
  }

  async createRecord(lessonId: number, userId: number, options: { statusId?: number } = {}) {
    return this.request(`/lessons/${lessonId}/records`, {
      method: 'POST',
      body: JSON.stringify({ userId, ...options })
    });
  }

  // Utility
  async getCompany() {
    return this.request('/company');
  }

  async getFilials() {
    return this.request('/filials');
  }
}
