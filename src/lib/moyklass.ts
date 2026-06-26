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

    const endpoints = ['/company/auth/getToken', '/auth', '/company/auth'];
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

        const request_body = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
        const response_body = response ? (typeof response === 'string' ? response : JSON.stringify(response)) : null;

        await supabase.from('integration_logs').insert({
            profile_id: this.profileId,
            entity_type: 'moyklass',
            method,
            endpoint,
            request_body,
            response_body,
            status_code: status,
            success
        });
    } catch (e) {
        console.error('Logging to Supabase failed:', e);
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    let responseData: any;
    let status = 0;
    let success = false;

    try {
        const token = await this.getAccessToken();

        const headers: Record<string, string> = {
          ...options.headers as any,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'ServiceFlow/1.0',
          'x-access-token': token
        };

        const url = `${BASE_URL}${endpoint}`;
        if (options.body) {
            console.log(`MoyKlass: [${options.method || 'GET'}] ${endpoint} Body:`, options.body);
        }

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
        await this.logRequest(options.method || 'GET', endpoint, options.body, responseData, status, success);
    }
  }

  // Clients (Users)
  async findUserByContact(contact: string) {
    const response = await this.request(`/company/users?search=${encodeURIComponent(contact)}`);
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
    return response.lessons || [];
  }

  async createRecord(lessonId: number, userId: number, options: { statusId?: number, classId?: number, filialId?: number } = {}) {
    const lid = Math.trunc(Number(lessonId));
    const uid = Math.trunc(Number(userId));
    const sid = options.statusId ? Math.trunc(Number(options.statusId)) : 1;
    const cid = options.classId ? Math.trunc(Number(options.classId)) : undefined;

    // API v1 exhibits high variability. We prioritize endpoints proven to work in logs.
    // Fixed: lessonRecords (singular-ish) successfully parsed body with camelCase.
    const attempts: { endpoint: string; method?: string; body: any }[] = [
        { endpoint: '/company/lessonRecords', body: { lessonId: lid, userId: uid, statusId: sid } },
        { endpoint: '/company/lessonRecords', body: { lessonId: lid, userId: uid, statusId: sid, classId: cid } },
        { endpoint: '/company/lessonRecords', body: [{ lessonId: lid, userId: uid, statusId: sid }] },
        // Centralized plural records
        { endpoint: '/company/lessons/records', body: [{ userId: uid, lessonId: lid, statusId: sid }] },
        { endpoint: '/company/lessons/records', body: { userId: uid, lessonId: lid, statusId: sid } },
        // Path-based
        { endpoint: `/company/lessons/${lid}/records`, body: { userId: uid, statusId: sid } }
    ];

    let lastError: any;
    for (const attempt of attempts) {
        try {
            console.log(`MoyKlass: Attempting record creation at ${attempt.endpoint} (Method: ${attempt.method || 'POST'})...`);
            const res = await this.request(attempt.endpoint, {
                method: attempt.method || 'POST',
                body: JSON.stringify(attempt.body)
            });
            console.log(`MoyKlass: Record creation successful at ${attempt.endpoint}`);
            return res;
        } catch (e: any) {
            lastError = e;
            console.log(`MoyKlass: Attempt at ${attempt.endpoint} failed: ${e.message}`);

            // If record already exists, treat as success
            if (e.message?.toLowerCase().includes('already exists') || e.message?.toLowerCase().includes('exist')) {
                console.log(`MoyKlass: Record already exists at ${attempt.endpoint}. Success.`);
                return { success: true, alreadyExists: true };
            }
            continue;
        }
    }
    throw lastError;
  }

  async createLesson(lessonData: {
    date: string;
    beginTime: string;
    endTime: string;
    filialId: number;
    roomId: number;
    classId: number;
    teacherIds?: number[];
    userId?: number;
    lessonRecord?: { statusId: number };
  }) {
    return this.request('/company/lessons', {
      method: 'POST',
      body: JSON.stringify(lessonData)
    });
  }

  // Utility
  async getCompany() {
    return this.request('/company');
  }

  async getFilials() {
    const response = await this.request('/company/filials');
    return Array.isArray(response) ? response : (response.filials || []);
  }

  async getManagers() {
    const response = await this.request('/company/managers');
    return Array.isArray(response) ? response : (response.managers || []);
  }

  async getManager(managerId: number) {
    return this.request(`/company/managers/${managerId}`);
  }

  async getClasses() {
    const response = await this.request('/company/classes');
    return Array.isArray(response) ? response : (response.classes || []);
  }

  async getClass(classId: number) {
    return this.request(`/company/classes/${classId}`);
  }

  async getJoinStatuses() {
    const endpoints = ['/company/joinStatuses', '/company/join-statuses'];
    for (const endpoint of endpoints) {
        try {
            const response = await this.request(endpoint);
            return Array.isArray(response) ? response : (response.statuses || response.joinStatuses || []);
        } catch (e) {}
    }
    return [];
  }

  async createJoin(userId: number, classId: number, options: { filialId?: number, statusId?: number } = {}): Promise<{ success: boolean, alreadyExists?: boolean, error?: string }> {
    const uid = Math.trunc(Number(userId));
    const cid = Math.trunc(Number(classId));
    const fid = options.filialId ? Math.trunc(Number(options.filialId)) : undefined;
    const sid = options.statusId ? Math.trunc(Number(options.statusId)) : 1;

    // API v1 strictly requires camelCase (userId, classId, statusId).
    // /company/joins is the standard endpoint for Class enrollment.
    const attempts = [
        { endpoint: '/company/joins', body: { userId: uid, classId: cid, statusId: sid } },
        { endpoint: '/company/joins', body: { userId: uid, classId: cid, statusId: sid, filialId: fid } },
        { endpoint: '/company/records', body: { userId: uid, classId: cid, statusId: sid } }
    ];

    for (const attempt of attempts) {
        try {
            console.log(`MoyKlass: Attempting Join creation at ${attempt.endpoint}...`);
            await this.request(attempt.endpoint, {
                method: 'POST',
                body: JSON.stringify(attempt.body)
            });
            console.log(`MoyKlass: Join successful at ${attempt.endpoint}`);
            return { success: true };
        } catch (e: any) {
            const msg = e.message || '';
            console.log(`MoyKlass: Join attempt at ${attempt.endpoint} failed: ${msg}`);

            // Handle case-insensitive errors from different API versions
            const lowerMsg = msg.toLowerCase();
            if (lowerMsg.includes('already exists') || lowerMsg.includes('exist')) {
                return { success: true, alreadyExists: true };
            }
            if (lowerMsg.includes('end status') || lowerMsg.includes('terminal') || lowerMsg.includes('cant be in end')) {
                return { success: false, error: 'terminal_status' };
            }
        }
    }
    return { success: false, error: 'failed_all_attempts' };
  }

  async getRooms() {
    const response = await this.request('/company/rooms');
    return Array.isArray(response) ? response : (response.rooms || []);
  }
}
