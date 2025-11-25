import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { User, FileText, MessageSquare, TrendingUp, ArrowRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export function UserDashboardPage() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: () => apiClient.getUserStats(user!.id),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-16 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">Ошибка при загрузке статистики</p>
            <Button onClick={() => window.location.reload()}>Попробовать снова</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Личный кабинет</h2>
          <p className="text-muted-foreground mt-1">
            Добро пожаловать, <span className="font-semibold">{user.username}</span>!
          </p>
        </div>
        <Button variant="outline" onClick={logout}>
          Выйти
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Создано опросов</CardDescription>
            <CardTitle className="text-3xl">{stats?.totalSurveysCreated || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-muted-foreground">
              <FileText className="h-4 w-4 mr-2" />
              <span className="text-sm">Опросы</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Отправлено ответов</CardDescription>
            <CardTitle className="text-3xl">{stats?.totalResponsesSubmitted || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-muted-foreground">
              <MessageSquare className="h-4 w-4 mr-2" />
              <span className="text-sm">Ответы</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Активность</CardDescription>
            <CardTitle className="text-3xl">
              {(stats?.totalSurveysCreated || 0) + (stats?.totalResponsesSubmitted || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-2" />
              <span className="text-sm">Всего</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Created Surveys */}
      <Card>
        <CardHeader>
          <CardTitle>Мои опросы</CardTitle>
          <CardDescription>Опросы, которые вы создали</CardDescription>
        </CardHeader>
        <CardContent>
          {!stats?.surveysCreated || stats.surveysCreated.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Вы еще не создали ни одного опроса</p>
              <Button asChild className="mt-4">
                <Link to="/create">Создать опрос</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.surveysCreated.map((survey) => (
                <div
                  key={survey.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{survey.title}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(survey.createdAt), 'd MMM yyyy')}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {survey.totalResponses} ответов
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/surveys/${survey.id}/results`}>Результаты</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link to={`/surveys/${survey.id}`}>
                        Открыть
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Answered Surveys */}
      <Card>
        <CardHeader>
          <CardTitle>Мои ответы</CardTitle>
          <CardDescription>Опросы, на которые вы ответили</CardDescription>
        </CardHeader>
        <CardContent>
          {!stats?.surveysAnswered || stats.surveysAnswered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Вы еще не ответили ни на один опрос</p>
              <Button asChild className="mt-4">
                <Link to="/">Найти опросы</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.surveysAnswered.map((survey) => (
                <div
                  key={survey.surveyId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{survey.surveyTitle}</h4>
                    <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Отвечено {format(new Date(survey.respondedAt), 'd MMM yyyy')}
                    </div>
                  </div>
                  <Button size="sm" asChild>
                    <Link to={`/surveys/${survey.surveyId}/results`}>
                      Посмотреть результаты
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
