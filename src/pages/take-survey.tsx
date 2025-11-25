import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm, type Resolver } from 'react-hook-form';
import { useUser } from '@/contexts/UserContext';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Separator } from '@/components/ui/separator';
import { useSurvey } from '@/hooks/use-surveys';
import { useSubmitSurveyResponse } from '@/hooks/use-survey-responses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Answer } from '@/types/survey';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function TakeSurveyPage() {
  const { id } = useParams<{ id: string }>();
  const { data: survey, isLoading, error } = useSurvey(id);
  const submitResponse = useSubmitSurveyResponse();
  const { user } = useUser();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const buildSchema = () => {
    if (!survey) return z.object({});

    const schemaFields: Record<string, z.ZodTypeAny> = {};

    survey.questions.forEach((question, index) => {
      if (question.required) {
        if (question.type === 'text') {
          schemaFields[`question_${index}`] = z.string().min(1, 'Это поле обязательно');
        } else if (question.type === 'multiple-choice') {
          schemaFields[`question_${index}`] = z.array(z.string()).min(1, 'Выберите хотя бы один вариант');
        } else if (question.type === 'single-choice' || question.type === 'yes-no') {
          schemaFields[`question_${index}`] = z.string().min(1, 'Выберите вариант');
        } else if (question.type === 'rating') {
          schemaFields[`question_${index}`] = z.number().min(1, 'Оцените вопрос');
        }
      }
    });

    // Respondent info
    schemaFields.respondentName = z.string().min(1, 'Введите имя');
    schemaFields.respondentEmail = z
      .string()
      .email('Неверный email')
      .optional()
      .or(z.literal(''));
    schemaFields.respondentAge = z.string().optional().transform((val) => {
      if (!val || val === '') return undefined;
      const num = parseInt(val);
      return isNaN(num) ? undefined : num;
    });

    return z.object(schemaFields);
  };

  const schema = buildSchema();

  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema) as unknown as Resolver<Record<string, unknown>>,
    mode: 'onChange',
    defaultValues: {
      respondentName: '',
      respondentEmail: '',
      respondentAge: '',
    },
  });

  const onSubmit = async (data: Record<string, unknown>) => {
    if (!survey) return;

    const answers: Answer[] = survey.questions.map((question, index) => {
      const key = `question_${index}`;
      const answerValue = data[key];
      return {
        questionId: question.id,
        answer: answerValue as string | string[] | number || '',
      };
    });

    await submitResponse.mutateAsync({
      surveyId: survey.id,
      userId: user?.id,
      answers,
      respondentName: String(data.respondentName || ''),
      respondentEmail: data.respondentEmail ? String(data.respondentEmail) : undefined,
      respondentAge:
        typeof data.respondentAge === 'number' ? data.respondentAge : undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="max-w-3xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>
            Ошибка при загрузке опроса. Возможно, он не существует или был удален.
          </AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link to="/">Вернуться на главную</Link>
        </Button>
      </div>
    );
  }

  const currentQuestion = survey.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const renderQuestion = () => {
    const questionKey = `question_${currentQuestionIndex}`;
    const question = currentQuestion;

    if (question.type === 'text') {
      return (
        <FormField
          control={form.control}
          name={questionKey}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Введите ваш ответ"
                  className="min-h-[120px]"
                  {...field}
                  value={String(field.value || '')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (question.type === 'multiple-choice' && question.options) {
      return (
        <FormField
          control={form.control}
          name={questionKey}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="space-y-3">
                  {(question.options || []).map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${questionKey}-${optIndex}`}
                        checked={Array.isArray(field.value) && (field.value as string[]).includes(option)}
                        onCheckedChange={(checked) => {
                          const currentValue = Array.isArray(field.value) ? field.value : [];
                          if (checked) {
                            field.onChange([...currentValue, option]);
                          } else {
                            field.onChange(currentValue.filter((v) => v !== option));
                          }
                        }}
                      />
                      <Label
                        htmlFor={`${questionKey}-${optIndex}`}
                        className="cursor-pointer flex-1"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (question.type === 'single-choice' && question.options) {
      return (
        <FormField
          control={form.control}
          name={questionKey}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                  <RadioGroup
                  value={String(field.value || '')}
                  onValueChange={field.onChange}
                >
                  {(question.options || []).map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`${questionKey}-${optIndex}`} />
                      <Label
                        htmlFor={`${questionKey}-${optIndex}`}
                        className="cursor-pointer flex-1"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (question.type === 'rating') {
      const min = question.minRating || 1;
      const max = question.maxRating || 5;
      
      return (
        <FormField
          control={form.control}
          name={questionKey}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="space-y-4">
                  <Slider
                    value={[typeof field.value === 'number' ? field.value : min]}
                    onValueChange={(value) => field.onChange(value[0])}
                    min={min}
                    max={max}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{min}</span>
                    <span className="text-lg font-semibold">{typeof field.value === 'number' ? field.value : min}</span>
                    <span>{max}</span>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (question.type === 'yes-no') {
      return (
        <FormField
          control={form.control}
          name={questionKey}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                  <RadioGroup
                  value={String(field.value || '')}
                  onValueChange={field.onChange}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id={`${questionKey}-yes`} />
                    <Label htmlFor={`${questionKey}-yes`} className="cursor-pointer">
                      Да
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id={`${questionKey}-no`} />
                    <Label htmlFor={`${questionKey}-no`} className="cursor-pointer">
                      Нет
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    return null;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{survey.title}</CardTitle>
              {survey.description && (
                <CardDescription className="mt-2">{survey.description}</CardDescription>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Вопрос {currentQuestionIndex + 1} из {survey.questions.length}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">
                    {currentQuestion.question}
                    {currentQuestion.required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </h3>
                </div>
                {renderQuestion()}
              </div>

              {/* Optional respondent information - show only on last question */}
              {isLastQuestion && (
                <>
                  <Separator className="my-6" />
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground">
                      Информация о респонденте (необязательно)
                    </h4>
                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="respondentName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Имя</FormLabel>
                            <FormControl>
                              <Input placeholder="Ваше имя" required {...field} value={String(field.value || '')} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="respondentEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="your@email.com"
                                {...field}
                                value={String(field.value || '')}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="respondentAge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Возраст</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="25"
                                min="1"
                                max="150"
                                {...field}
                                value={String(field.value || '')}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-between pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={isFirstQuestion}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад
                </Button>

                {!isLastQuestion ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((prev) => Math.min(survey.questions.length - 1, prev + 1))}
                  >
                    Далее
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={submitResponse.isPending}>
                    {submitResponse.isPending ? 'Отправка...' : 'Отправить ответы'}
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
