import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { CreateSurveyInput } from '@/types/survey';
import { toast } from 'sonner';

export const useSurveys = () => {
  return useQuery({
    queryKey: ['surveys'],
    queryFn: () => apiClient.getSurveys(),
  });
};

export const useSurvey = (id: string | undefined) => {
  return useQuery({
    queryKey: ['surveys', id],
    queryFn: () => apiClient.getSurvey(id!),
    enabled: !!id,
  });
};

export const useCreateSurvey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSurveyInput) => apiClient.createSurvey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Опрос успешно создан!');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка при создании опроса: ${error.message}`);
    },
  });
};

export const useUpdateSurvey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSurveyInput> }) =>
      apiClient.updateSurvey(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      queryClient.invalidateQueries({ queryKey: ['surveys', variables.id] });
      toast.success('Опрос успешно обновлен!');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка при обновлении опроса: ${error.message}`);
    },
  });
};

export const useDeleteSurvey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteSurvey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Опрос успешно удален!');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка при удалении опроса: ${error.message}`);
    },
  });
};
