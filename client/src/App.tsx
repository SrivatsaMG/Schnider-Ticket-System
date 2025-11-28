import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardPage from "@/pages/dashboard";
import ProfilePage from "@/pages/profile";
import AdminDashboardPage from "@/pages/admin-dashboard";
import AdminUsersPage from "@/pages/admin-users";
import AdminPlantsPage from "@/pages/admin-plants";
import AdminCreateUserPage from "@/pages/admin-create-user";
import ManagerCreateEmployeePage from "@/pages/manager-create-employee";
import TicketsPage from "@/pages/tickets";
import CreateTicketPage from "@/pages/create-ticket";
import TicketDetailPage from "@/pages/ticket-detail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/admin-dashboard" component={AdminDashboardPage} />
      <Route path="/admin-users" component={AdminUsersPage} />
      <Route path="/admin-plants" component={AdminPlantsPage} />
      <Route path="/admin-create-user" component={AdminCreateUserPage} />
      <Route path="/manager-create-employee" component={ManagerCreateEmployeePage} />
      <Route path="/tickets" component={TicketsPage} />
      <Route path="/create-ticket" component={CreateTicketPage} />
      <Route path="/ticket/:id" component={TicketDetailPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
