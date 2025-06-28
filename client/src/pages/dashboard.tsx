import { useAuth } from "@/lib/auth";
import Header from "@/components/header";
import StatsOverview from "@/components/stats-overview";
import AvailableSurveys from "@/components/available-surveys";
import Sidebar from "@/components/sidebar";
import Footer from "@/components/footer";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <StatsOverview />
        </div>
        
        <div className="px-4 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <AvailableSurveys />
            </div>
            <div>
              <Sidebar />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
