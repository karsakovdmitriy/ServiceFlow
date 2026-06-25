import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://api.moyklass.com/v1';

export interface MoyKlassConfig {
  apiKey: string;
  filialId?: number;
}

export class MoyKlassClient {
  private apiKey: string;
  private accessToken: string | null = null;
  private profileId: string | null = null;

  constructor(apiKey: string, profileId: string | null = null) {
    this.apiKey = apiKey?.trim() || '';
    this.profileId = profileId;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken) return this.accessToken;

    // TZ says POST /auth, but the image showed /company/auth/getToken.
    // We'll try both, prioritizing the one from the image as it's likely more current.
    const endpoints = ['/company/auth/getToken', '/auth'];
    let lastError: any;

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'ServiceFlow/1.0'
                },
                body: JSON.stringify({ apiKey: this.apiKey })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.accessToken) {
                    this.accessToken = data.accessToken;
                    return this.accessToken!;
                }
            }
        } catch (e) {
            lastError = e;
        }
    }

    throw new Error(`MoyKlass Auth Failed: ${lastError?.message || 'Unable to obtain accessToken'}`);
  }

  private async logRequest(method: string, endpoint: string, body: any, response: any, status: number, success: boolean) {
    if (!this.profileId) return;

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        await supabase.from('integration_logs').insert({
            profile_id: this.profileId,
            entity_type: 'moyklass',
            method,
            endpoint,
            request_body: body ? JSON.stringify(body) : null,
            response_body: response ? JSON.stringify(response) : null,
            status_code: status,
            success
        });
    } catch (e) {
        console.error('Logging to Supabase failed:', e);
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = await this.getAccessToken();

    const headers: Record<string, string> = {
      ...options.headers as any,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'ServiceFlow/1.0',
      'x-access-token': token
    };

    const url = `${BASE_URL}${endpoint}`;
    let responseData: any;
    let status = 0;
    let success = false;

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        status = response.status;
        const text = await response.text();
        try {
            responseData = JSON.parse(text);
        } catch (e) {
            responseData = text;
        }

        if (!response.ok) {
            throw new Error(`MoyKlass API Error (${status}) on ${endpoint}: ${responseData?.message || response.statusText}`);
        }

        success = true;
        return responseData;
    } catch (error: any) {
        responseData = responseData || { message: error.message };
        throw error;
    } finally {
        await this.logRequest(options.method || 'GET', endpoint, options.body ? JSON.parse(options.body as string) : null, responseData, status, success);
    }
  }

  // Clients (Users)
  async findUserByContact(contact: string) {
    const response = await this.request(`/company/users?search=${encodeURIComponent(contact)}`);
    // API v1 usually returns { users: [], stats: {} }
    const users = Array.isArray(response) ? response : (response.users || []);
    return users.length > 0 ? users[0] : null;
  }

  async createUser(userData: { name: string; email?: string; phone?: string }) {
    return this.request('/company/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // Lessons and Records
  async getLessons(params: { from: string; to: string; filialId?: number }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await this.request(`/company/lessons?${query}`);
    // Documentation shows response format: { "lessons": [...], "stats": { "totalItems": 5 } }
    return response.lessons || [];
  }

  async createRecord(lessonId: number, userId: number, options: { statusId?: number } = {}) {
    return this.request(`/company/lessons/${lessonId}/records`, {
      method: 'POST',
      body: JSON.stringify({ userId, ...options })
    });
  }

  // Utility
  async getCompany() {
    return this.request('/company');
  }

  async getFilials() {
    return this.request('/company/filials');
  }
}
