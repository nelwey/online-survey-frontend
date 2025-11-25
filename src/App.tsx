import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { queryClient } from '@/lib/queryClient';
import { UserProvider } from '@/contexts/UserContext';
import { Layout } from '@/components/layout';
import { HomePage } from '@/pages/home';
import { CreateSurveyPage } from '@/pages/create-survey';
import { TakeSurveyPage } from '@/pages/take-survey';
import { SurveyResultsPage } from '@/pages/survey-results';
import { UserDashboardPage } from '@/pages/user-dashboard';
import { LoginPage } from '@/pages/login';
import { RegisterPage } from '@/pages/register';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="create" element={<CreateSurveyPage />} />
              <Route path="surveys/:id" element={<TakeSurveyPage />} />
              <Route path="surveys/:id/results" element={<SurveyResultsPage />} />
              <Route path="dashboard" element={<UserDashboardPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
            </Route>
          </Routes>
          <Toaster />
        </BrowserRouter>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;