export interface Question {
  id: string;
  type: 'text' | 'multiple-choice' | 'single-choice' | 'rating' | 'yes-no';
  question: string;
  required?: boolean;
  options?: string[]; // For multiple-choice and single-choice
  minRating?: number; // For rating questions
  maxRating?: number; // For rating questions
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
  userId?: string;
  authorId?: string;
  authorName?: string;
  isPublished?: boolean;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  answers: Answer[];
  submittedAt: string;
  respondentName?: string;
  respondentEmail?: string;
  respondentAge?: number;
}

export interface Answer {
  questionId: string;
  answer: string | string[] | number; // Can be text, array of choices, or rating number
}

export interface SurveyStats {
  surveyId: string;
  totalResponses: number;
  questionStats: QuestionStat[];
}

export interface QuestionStat {
  questionId: string;
  question: string;
  type: Question['type'];
  responses: {
    [key: string]: number; // For choice questions: option -> count
  };
  averageRating?: number; // For rating questions
}

export interface CreateSurveyInput {
  title: string;
  description?: string;
  questions: Omit<Question, 'id'>[];
  userId?: string;
  isPublished?: boolean;
}

export interface SubmitSurveyResponseInput {
  surveyId: string;
  userId?: string;
  answers: Answer[];
  respondentName?: string;
  respondentEmail?: string;
  respondentAge?: number;
}
