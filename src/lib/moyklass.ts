const BASE_URL_V1 = 'https://api.moyklass.com/v1';
const BASE_URL_V2 = 'https://api.moyklass.com/v2';

export interface MoyKlassConfig {
  apiKey: string;
  filialId?: number;
}

export class MoyKlassClient {
  private apiKey: string;
  private accessToken: string | null = null;
  private apiVersion: 'v1' | 'v2' = 'v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async getAccessToken(): Promise<string | null> {
    if (this.accessToken || this.apiVersion === 'v2') return this.accessToken;

    try {
      const response = await fetch(`${BASE_URL_V1}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ apiKey: this.apiKey })
      });

      if (response.status === 404) {
        console.log('MoyKlass: v1 /auth not found, switching to v2');
        this.apiVersion = 'v2';
        return null;
      }

      if (!response.ok) {
        throw new Error(`MoyKlass Auth Failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.accessToken;
      return this.accessToken;
    } catch (err) {
      console.error('MoyKlass Auth Error:', err);
      // Fallback to v2 on any connection/auth error that might be version related
      this.apiVersion = 'v2';
      return null;
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = await this.getAccessToken();
    const baseUrl = this.apiVersion === 'v1' ? BASE_URL_V1 : BASE_URL_V2;

    const headers: Record<string, string> = {
      ...options.headers as any,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.apiVersion === 'v1' && token) {
      headers['x-access-token'] = token;
    } else if (this.apiVersion === 'v2') {
      headers['x-api-key'] = this.apiKey;
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`MoyKlass API Error (${this.apiVersion}): ${error.message || response.statusText}`);
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
