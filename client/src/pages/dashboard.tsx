import { useAuth } from "@/lib/auth";
import Header from "@/components/header";
import StatsOverview from "@/components/stats-overview";
import AvailableSurveys from "@/components/available-surveys";
import Sidebar from "@/components/sidebar";

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
      
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold text-primary mb-4">SurveyKu</h3>
              <p className="text-sm text-gray-600">Platform survey berbayar terpercaya untuk mendapatkan penghasilan tambahan dengan mudah.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Bantuan</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-primary">FAQ</a></li>
                <li><a href="#" className="hover:text-primary">Cara Kerja</a></li>
                <li><a href="#" className="hover:text-primary">Kontak Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-primary">Syarat & Ketentuan</a></li>
                <li><a href="#" className="hover:text-primary">Kebijakan Privasi</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Kontak</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Email: support@surveyku.com</li>
                <li>WhatsApp: +62 812-3456-7890</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">&copy; 2024 SurveyKu. Semua hak cipta dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
