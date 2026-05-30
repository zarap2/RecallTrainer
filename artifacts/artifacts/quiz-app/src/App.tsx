import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import InstructorDashboard from "@/pages/instructor-dashboard";
import StudentQuizEntry from "@/pages/student-quiz-entry";
import ActiveSession from "@/pages/active-session";
import SessionResults from "@/pages/session-results";
import LeaderboardPage from "@/pages/leaderboard-page";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/instructor" component={InstructorDashboard} />
      <Route path="/quiz/:quizId" component={StudentQuizEntry} />
      <Route path="/session/:sessionId" component={ActiveSession} />
      <Route path="/session/:sessionId/results" component={SessionResults} />
      <Route path="/quiz/:quizId/leaderboard" component={LeaderboardPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
