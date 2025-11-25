import { useParams, Link } from 'react-router-dom';
import { useSurvey } from '@/hooks/use-surveys';
import { useSurveyResponses, useSurveyStats } from '@/hooks/use-survey-responses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BarChart3, Users, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function SurveyResultsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: survey, isLoading: surveyLoading } = useSurvey(id);
  const { data: stats, isLoading: statsLoading } = useSurveyStats(id);
  const { data: responses, isLoading: responsesLoading } = useSurveyResponses(id);

  if (surveyLoading || statsLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="max-w-6xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>
            Опрос не найден
          </AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link to="/">Вернуться на главную</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{survey.title}</h2>
            <p className="text-muted-foreground mt-1">Результаты опроса</p>
          </div>
        </div>
        <Button asChild>
          <Link to={`/surveys/${survey.id}`}>Пройти опрос</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Всего ответов</CardDescription>
            <CardTitle className="text-3xl">
              {stats?.totalResponses || responses?.length || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              <span className="text-sm">Респонденты</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Вопросов в опросе</CardDescription>
            <CardTitle className="text-3xl">{survey.questions.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-muted-foreground">
              <FileText className="h-4 w-4 mr-2" />
              <span className="text-sm">Вопросы</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Завершено</CardDescription>
            <CardTitle className="text-3xl">
              {responsesLoading ? '...' : (responses?.length || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-muted-foreground">
              <BarChart3 className="h-4 w-4 mr-2" />
              <span className="text-sm">Статистика</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {!stats || !stats.questionStats || stats.questionStats.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Пока нет ответов на этот опрос. Статистика появится после получения ответов.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {stats.questionStats.map((questionStat, index) => {
            const question = survey.questions.find((q) => q.id === questionStat.questionId);
            if (!question) return null;

            return (
              <Card key={questionStat.questionId}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {index + 1}. {questionStat.question}
                  </CardTitle>
                  <CardDescription>Тип: {getQuestionTypeLabel(question.type)}</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderQuestionStats(questionStat, question)}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {responses && responses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Все ответы</CardTitle>
            <CardDescription>Подробные ответы всех респондентов</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {responses.map((response, index) => (
                <Card key={response.id} className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Ответ #{index + 1}</CardTitle>
                    <CardDescription>
                      {new Date(response.submittedAt).toLocaleString('ru-RU')}
                      {response.respondentName && ` • ${response.respondentName}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {(response.respondentEmail || response.respondentAge !== undefined) && (
                      <div className="text-xs text-muted-foreground">
                        {response.respondentEmail && (
                          <div>Email: {response.respondentEmail}</div>
                        )}
                        {response.respondentAge !== undefined && (
                          <div>Возраст: {response.respondentAge}</div>
                        )}
                      </div>
                    )}
                    {response.answers.map((answer, ansIndex) => {
                      const question = survey.questions.find((q) => q.id === answer.questionId);
                      if (!question) return null;

                      return (
                        <div key={ansIndex} className="flex gap-2">
                          <span className="font-medium min-w-[200px]">{question.question}:</span>
                          <span className="text-muted-foreground">
                            {Array.isArray(answer.answer)
                              ? answer.answer.join(', ')
                              : String(answer.answer)}
                          </span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function renderQuestionStats(stat: { questionId: string; question: string; type: string; responses: Record<string, number>; averageRating?: number }, question: { type: string }) {
  if (question.type === 'rating' && stat.averageRating !== undefined) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold">{stat.averageRating.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground">Средняя оценка</div>
        </div>
        {Object.keys(stat.responses).length > 0 && (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={Object.entries(stat.responses).map(([key, value]) => ({ name: key, value }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  }

  if (question.type === 'multiple-choice' || question.type === 'single-choice' || question.type === 'yes-no') {
    const data = Object.entries(stat.responses).map(([name, value]) => ({
      name,
      value,
    }));

    if (data.length === 0) return <p className="text-muted-foreground">Нет ответов</p>;

    return (
      <div className="space-y-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-4">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">{item.name}</span>
              <span className="font-semibold">{String(item.value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-muted-foreground">
      Текстовые ответы отображаются в разделе &quot;Все ответы&quot;
    </div>
  );
}

function getQuestionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'text': 'Текст',
    'multiple-choice': 'Несколько вариантов',
    'single-choice': 'Один вариант',
    'rating': 'Оценка',
    'yes-no': 'Да/Нет',
  };
  return labels[type] || type;
}
