export interface User {
  id: string;
  username: string;
  email?: string;
  name?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UserStats {
  userId: string;
  totalSurveysCreated: number;
  totalResponsesSubmitted: number;
  surveysCreated: Array<{
    id: string;
    title: string;
    createdAt: string;
    totalResponses: number;
  }>;
  surveysAnswered: Array<{
    surveyId: string;
    surveyTitle: string;
    respondedAt: string;
  }>;
}
