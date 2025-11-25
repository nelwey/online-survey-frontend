import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, useWatch, type Control } from 'react-hook-form';
import { useUser } from '@/contexts/UserContext';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateSurvey } from '@/hooks/use-surveys';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Save } from 'lucide-react';
import type { Question } from '@/types/survey';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const questionSchema = z.object({
  type: z.enum(['text', 'multiple-choice', 'single-choice', 'rating', 'yes-no']),
  question: z.string().min(1, 'Вопрос обязателен'),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  minRating: z.number().optional(),
  maxRating: z.number().optional(),
});

const surveySchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1, 'Добавьте хотя бы один вопрос'),
  isPublished: z.boolean().default(true),
});

type SurveyFormData = z.input<typeof surveySchema>;

export function CreateSurveyPage() {
  const navigate = useNavigate();
  const createSurvey = useCreateSurvey();
  const { isAuthenticated } = useUser();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/create');
    }
  }, [isAuthenticated, navigate]);

  const form = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      title: '',
      description: '',
      questions: [],
      isPublished: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  const control = form.control as Control<SurveyFormData>;

  const addQuestion = (type: Question['type']) => {
    const baseQuestion: Partial<Question> = {
      type,
      question: '',
      required: false,
    };

    if (type === 'multiple-choice' || type === 'single-choice') {
      baseQuestion.options = [''];
    } else if (type === 'rating') {
      baseQuestion.minRating = 1;
      baseQuestion.maxRating = 5;
    }

    append(baseQuestion as any);
  };

  const onSubmit = async (data: SurveyFormData) => {
    const surveyData = {
      ...data,
      questions: data.questions.map((q) => ({
        ...q,
        options: q.type === 'multiple-choice' || q.type === 'single-choice' 
          ? (q.options?.filter(opt => opt.trim() !== '') || [])
          : undefined,
      })),
    };

    try {
      const survey = await createSurvey.mutateAsync(surveyData);
      navigate(`/surveys/${survey.id}`);
    } catch (error) {
      console.error('Error creating survey:', error);
    }
  };

  // Show loading or nothing while checking authentication
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Создать новый опрос</h2>
        <p className="text-muted-foreground mt-1">
          Создайте опрос с различными типами вопросов
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название опроса *</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите название опроса" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Описание опроса (необязательно)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Опубликовать сразу</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Опрос будет доступен для прохождения
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Вопросы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Добавьте вопросы к опросу
                </div>
              ) : (
                fields.map((field, index) => (
                  <QuestionFormField
                    key={field.id}
                    index={index}
                    control={form.control}
                    onRemove={() => remove(index)}
                  />
                ))
              )}

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addQuestion('text')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Текст
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addQuestion('single-choice')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Один вариант
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addQuestion('multiple-choice')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Несколько вариантов
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addQuestion('rating')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Оценка
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addQuestion('yes-no')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Да/Нет
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={createSurvey.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {createSurvey.isPending ? 'Сохранение...' : 'Создать опрос'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function QuestionFormField({
  index,
  control,
  onRemove,
}: {
  index: number;
  control: Control<SurveyFormData>;
  onRemove: () => void;
}) {
  const questionType = useWatch({
    control,
    name: `questions.${index}.type`,
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Вопрос {index + 1}</CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name={`questions.${index}.type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Тип вопроса</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="text">Текст</SelectItem>
                  <SelectItem value="single-choice">Один вариант</SelectItem>
                  <SelectItem value="multiple-choice">Несколько вариантов</SelectItem>
                  <SelectItem value="rating">Оценка</SelectItem>
                  <SelectItem value="yes-no">Да/Нет</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`questions.${index}.question`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Текст вопроса *</FormLabel>
              <FormControl>
                <Input placeholder="Введите вопрос" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {(questionType === 'multiple-choice' || questionType === 'single-choice') && (
          <OptionsField control={control} questionIndex={index} />
        )}

        {questionType === 'rating' && (
          <RatingField control={control} questionIndex={index} />
        )}

        <FormField
          control={control}
          name={`questions.${index}.required`}
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <FormLabel>Обязательный вопрос</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

function OptionsField({ control, questionIndex }: { control: Control<SurveyFormData>; questionIndex: number }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${questionIndex}.options` as any,
  });

  return (
    <div className="space-y-2">
      <Label>Варианты ответов</Label>
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2">
          <FormField
            control={control}
            name={`questions.${questionIndex}.options.${index}`}
            render={({ field: inputField }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    placeholder={`Вариант ${index + 1}`}
                    {...inputField}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {fields.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append('')}
      >
        <Plus className="h-4 w-4 mr-2" />
        Добавить вариант
      </Button>
    </div>
  );
}

function RatingField({ control, questionIndex }: { control: Control<SurveyFormData>; questionIndex: number }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name={`questions.${questionIndex}.minRating`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Минимальная оценка</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`questions.${questionIndex}.maxRating`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Максимальная оценка</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
