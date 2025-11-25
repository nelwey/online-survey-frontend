import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { SubmitSurveyResponseInput, SurveyResponse, SurveyStats } from '@/types/survey';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useSubmitSurveyResponse = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: SubmitSurveyResponseInput) => apiClient.submitSurveyResponse(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['surveys', variables.surveyId, 'responses'] });
      queryClient.invalidateQueries({ queryKey: ['surveys', variables.surveyId, 'stats'] });
      toast.success('Ваши ответы успешно отправлены!');
      navigate(`/surveys/${variables.surveyId}/results`);
    },
    onError: (error: Error) => {
      toast.error(`Ошибка при отправке ответов: ${error.message}`);
    },
  });
};

export const useSurveyResponses = (surveyId: string | undefined) => {
  return useQuery({
    queryKey: ['surveys', surveyId, 'responses'],
    queryFn: () => apiClient.getSurveyResponses(surveyId!),
    enabled: !!surveyId,
  });
};

export const useSurveyStats = (surveyId: string | undefined) => {
  return useQuery({
    queryKey: ['surveys', surveyId, 'stats'],
    queryFn: () => apiClient.getSurveyStats(surveyId!),
    enabled: !!surveyId,
  });
};
