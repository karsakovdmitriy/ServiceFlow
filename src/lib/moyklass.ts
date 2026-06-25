const BASE_URL = 'https://api.moyklass.com/v1';

export interface MoyKlassConfig {
  apiKey: string;
  filialId?: number;
}

export class MoyKlassClient {
  private apiKey: string;
  private accessToken: string | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey?.trim() || '';
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken) return this.accessToken;

    const response = await fetch(`${BASE_URL}/company/auth/getToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TrainerSpace/1.0'
      },
      body: JSON.stringify({ apiKey: this.apiKey })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || response.statusText;
      throw new Error(`MoyKlass Auth Failed (${response.status}): ${message}`);
    }

    const data = await response.json();
    if (!data.accessToken) {
      throw new Error('MoyKlass Auth Response: No accessToken received');
    }

    this.accessToken = data.accessToken;
    return this.accessToken!;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = await this.getAccessToken();

    const headers: Record<string, string> = {
      ...options.headers as any,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'TrainerSpace/1.0',
      'x-access-token': token
    };

    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorMessage = response.statusText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch (e) {}

      throw new Error(`MoyKlass API Error (${response.status}) on ${endpoint}: ${errorMessage}`);
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
    try {
      // Try direct filials endpoint first
      return await this.request('/filials');
    } catch (err: any) {
      if (err.message?.includes('404')) {
        console.log('MoyKlass: /filials not found, trying /company fallback');
        // Some MoyKlass API setups return filials as part of the company info
        const company = await this.getCompany();
        if (company && company.filials) return company.filials;

        // If still not found, try alternative filials path common in some systems
        try {
            return await this.request('/company/filials');
        } catch (e) {}
      }
      throw err;
    }
  }
}
