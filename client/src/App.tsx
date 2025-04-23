import { useState } from "react";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/lib/protected-route";
import { useIsMobile } from "@/hooks/use-mobile";

// Layout
import Sidebar from "@/components/ui/sidebar";

// Pages
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import AgendaPage from "@/pages/agenda-page";
import PatientsPage from "@/pages/patients-page";
import MedicalRecordPage from "@/pages/medical-record-page";
import RemindersPage from "@/pages/reminders-page";
import NotFound from "@/pages/not-found";

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col md:flex-row min-h-screen w-screen overflow-hidden">
        {/* Protected routes render the sidebar */}
        <Switch>
          <Route path="/auth">
            {/* Auth page doesn't use sidebar */}
          </Route>
          <Route>
            <Sidebar 
              isMobileOpen={isMobileMenuOpen} 
              onMobileClose={closeMobileMenu} 
            />
          </Route>
        </Switch>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          {/* Mobile top nav for protected routes */}
          <Switch>
            <Route path="/auth">
              {/* Auth page doesn't use top nav */}
            </Route>
            <Route>
              {isMobile && (
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h1 className="font-heading text-xl font-bold text-primary-600 dark:text-primary-400">Atenda+</h1>
                  <button 
                    onClick={toggleMobileMenu}
                    className="text-gray-500 dark:text-gray-400 focus:outline-none"
                  >
                    <span className="material-icons-round">menu</span>
                  </button>
                </div>
              )}
            </Route>
          </Switch>

          {/* Routes */}
          <Switch>
            <Route path="/auth" component={AuthPage} />
            <ProtectedRoute path="/" component={DashboardPage} />
            <ProtectedRoute path="/agenda" component={AgendaPage} />
            <ProtectedRoute path="/patients" component={PatientsPage} />
            <ProtectedRoute path="/medical-record/:patientId?" component={MedicalRecordPage} />
            <ProtectedRoute path="/reminders" component={RemindersPage} />
            <Route component={NotFound} />
          </Switch>
        </main>

        <Toaster />
      </div>
    </TooltipProvider>
  );
}

export default App;
