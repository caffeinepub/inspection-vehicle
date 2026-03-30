import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import LoginScreen from "./components/LoginScreen";
import ProfileSetup from "./components/ProfileSetup";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import Dashboard from "./pages/Dashboard";
import InspectionDetail from "./pages/InspectionDetail";
import NewInspection from "./pages/NewInspection";

export type AppPage =
  | { name: "dashboard" }
  | { name: "new-inspection" }
  | { name: "inspection-detail"; inspectionId: string };

function AppContent() {
  const { identity, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isInitializing = loginStatus === "logging-in";
  const [currentPage, setCurrentPage] = useState<AppPage>({
    name: "dashboard",
  });

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  const showProfileSetup =
    isAuthenticated &&
    !profileLoading &&
    profileFetched &&
    userProfile === null;

  const navigate = (page: AppPage) => setCurrentPage(page);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        currentPage={currentPage}
        navigate={navigate}
        userProfile={userProfile}
      />
      <main className="flex-1">
        {currentPage.name === "dashboard" && <Dashboard navigate={navigate} />}
        {currentPage.name === "new-inspection" && (
          <NewInspection navigate={navigate} />
        )}
        {currentPage.name === "inspection-detail" && (
          <InspectionDetail
            inspectionId={currentPage.inspectionId}
            navigate={navigate}
          />
        )}
      </main>
      <Footer />
      {showProfileSetup && <ProfileSetup />}
      <Toaster />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
