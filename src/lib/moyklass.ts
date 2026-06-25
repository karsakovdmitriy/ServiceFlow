const BASE_URL = 'https://api.moyklass.com/v1';

export interface MoyKlassConfig {
  apiKey: string;
  filialId?: number;
}

export class MoyKlassClient {
  private apiKey: string;
  private accessToken: string | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken) return this.accessToken;

    const response = await fetch(`${BASE_URL}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: this.apiKey })
    });

    if (!response.ok) {
      throw new Error(`MoyKlass Auth Failed: ${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.accessToken;
    return this.accessToken!;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = await this.getAccessToken();
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        'x-access-token': token
      }
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
