import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "./lib/auth";
import { useState, useEffect } from "react";
import SplashScreen from "@/components/splash-screen";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Register from "@/pages/register";

function Router() {
  const { user, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash screen for minimum 5 seconds or until auth check is complete
    const minTimeout = setTimeout(() => {
      if (!isLoading) {
        setShowSplash(false);
      }
    }, 5000);

    return () => clearTimeout(minTimeout);
  }, [isLoading]);

  // Hide splash when auth is loaded and minimum time has passed
  useEffect(() => {
    if (!isLoading && !showSplash) {
      setShowSplash(false);
    }
  }, [isLoading, showSplash]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {user ? (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
        </>
      ) : (
        <>
          <Route path="/" component={Login} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
        </>
      )}
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
