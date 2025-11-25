import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Plus, FileText, Home, User } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export function Layout() {
  const location = useLocation();
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <h1 className="text-xl font-bold">Online Surveys</h1>
          </Link>
          <nav className="flex items-center gap-4">
            <Button
              variant={location.pathname === '/' ? 'default' : 'ghost'}
              asChild
            >
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Главная
              </Link>
            </Button>
            <Button
              variant={location.pathname === '/create' ? 'default' : 'ghost'}
              asChild
            >
              <Link to="/create">
                <Plus className="h-4 w-4 mr-2" />
                Создать опрос
              </Link>
            </Button>
            {user ? (
              <Button
                variant={location.pathname === '/dashboard' ? 'default' : 'ghost'}
                asChild
              >
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  {user.username}
                </Link>
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate('/register')}
                >
                  <User className="h-4 w-4 mr-2" />
                  Регистрация
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/login')}
                >
                  Войти
                </Button>
              </div>
            )}
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
