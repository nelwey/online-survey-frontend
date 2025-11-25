import type {
  Survey,
  CreateSurveyInput,
  SubmitSurveyResponseInput,
  SurveyResponse,
  SurveyStats,
} from '@/types/survey';
import type { User, UserStats } from '@/types/user';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch {
        // If response is not JSON, use default message
      }
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }

    return response.json();
  }

  // Survey endpoints
  async getSurveys(): Promise<Survey[]> {
    return this.request<Survey[]>('/surveys');
  }

  async getSurvey(id: string): Promise<Survey> {
    return this.request<Survey>(`/surveys/${id}`);
  }

  async createSurvey(data: CreateSurveyInput): Promise<Survey> {
    return this.request<Survey>('/surveys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSurvey(id: string, data: Partial<CreateSurveyInput>): Promise<Survey> {
    return this.request<Survey>(`/surveys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSurvey(id: string): Promise<void> {
    return this.request<void>(`/surveys/${id}`, {
      method: 'DELETE',
    });
  }

  // Survey responses
  async submitSurveyResponse(data: SubmitSurveyResponseInput): Promise<SurveyResponse> {
    return this.request<SurveyResponse>('/surveys/responses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSurveyResponses(surveyId: string): Promise<SurveyResponse[]> {
    return this.request<SurveyResponse[]>(`/surveys/${surveyId}/responses`);
  }

  async getSurveyStats(surveyId: string): Promise<SurveyStats> {
    return this.request<SurveyStats>(`/surveys/${surveyId}/stats`);
  }

  // User endpoints
  async getUser(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async register(data: { username: string; email: string; password: string; name?: string }): Promise<{ token: string; user: User }> {
    return this.request<{ token: string; user: User }>('/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { usernameOrEmail: string; password: string }): Promise<{ token: string; user: User }> {
    return this.request<{ token: string; user: User }>('/users/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserStats(userId: string): Promise<UserStats> {
    return this.request<UserStats>(`/users/${userId}/stats`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);