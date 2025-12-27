import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoadingFallback } from "@/components/LoadingFallback";

// Lazy load all pages for better performance
const Onboarding = lazy(() => import("./pages/Onboarding"));
const ConnectAccounts = lazy(() => import("./pages/ConnectAccounts"));
const Simulator = lazy(() => import("./pages/Simulator"));
const Results = lazy(() => import("./pages/Results"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const Success = lazy(() => import("./pages/Success"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const BankConnections = lazy(() => import("./pages/BankConnections"));
const Profile = lazy(() => import("./pages/Profile"));
const TaxDashboard = lazy(() => import("./pages/TaxDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/connect" element={<ConnectAccounts />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/results" element={<Results />} />
            <Route path="/success" element={<Success />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bank-connections"
              element={
                <ProtectedRoute>
                  <BankConnections />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/taxes"
              element={
                <ProtectedRoute>
                  <TaxDashboard />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
