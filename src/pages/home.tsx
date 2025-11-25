import { Link } from 'react-router-dom';
import { useSurveys } from '@/hooks/use-surveys';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Users, ArrowRight, FileText } from 'lucide-react';
import { format } from 'date-fns';

export function HomePage() {
  const { data: surveys, isLoading, error } = useSurveys();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <p className="text-destructive mb-4 font-medium">Ошибка при загрузке опросов</p>
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'Не удалось подключиться к серверу'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Обновить страницу
              </Button>
              <Button asChild>
                <Link to="/create">Создать опрос</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle empty surveys
  if (!surveys || surveys.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Все опросы</h2>
            <p className="text-muted-foreground mt-1">
              Создавайте и проходите онлайн-опросы
            </p>
          </div>
          <Button asChild>
            <Link to="/create">Создать опрос</Link>
          </Button>
        </div>
        
        <Card className="py-12">
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">Опросы пока не созданы</p>
            <Button asChild>
              <Link to="/create">Создать первый опрос</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Все опросы</h2>
          <p className="text-muted-foreground mt-1">
            Создавайте и проходите онлайн-опросы
          </p>
        </div>
        <Button asChild>
          <Link to="/create">
            Создать опрос
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {surveys.map((survey) => (
            <Card key={survey.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-2">{survey.title}</CardTitle>
                {survey.description && (
                  <CardDescription className="line-clamp-2">
                    {survey.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{survey.questions.length} вопросов</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(survey.createdAt), 'd MMM yyyy')}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button asChild variant="default" className="flex-1">
                  <Link to={`/surveys/${survey.id}`}>
                    Пройти опрос
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to={`/surveys/${survey.id}/results`}>
                    Результаты
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
      </div>
    </div>
  );
}
