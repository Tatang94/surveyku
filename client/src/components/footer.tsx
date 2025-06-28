import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, MessageCircle, Shield, FileText, HelpCircle, Phone } from "lucide-react";
import HelpModal from "@/components/help-modal";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SurveyKu</h3>
            <p className="text-sm text-gray-600 mb-4">
              Platform survei terpercaya untuk mendapatkan penghasilan tambahan dari rumah.
            </p>
            <div className="flex space-x-2">
              <HelpModal>
                <Button variant="outline" size="sm">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Bantuan
                </Button>
              </HelpModal>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Menu Cepat</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-primary">Dashboard</a></li>
              <li><a href="#" className="hover:text-primary">Survei Tersedia</a></li>
              <li><a href="#" className="hover:text-primary">Riwayat Penghasilan</a></li>
              <li><a href="#" className="hover:text-primary">Profil Saya</a></li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Bantuan</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <HelpModal>
                  <button className="hover:text-primary flex items-center">
                    <HelpCircle className="h-3 w-3 mr-1" />
                    FAQ
                  </button>
                </HelpModal>
              </li>
              <li>
                <HelpModal>
                  <button className="hover:text-primary">Cara Kerja</button>
                </HelpModal>
              </li>
              <li>
                <button 
                  onClick={() => window.open('https://wa.me/6289663596711?text=Halo, saya butuh bantuan dengan SurveyKu')}
                  className="hover:text-primary flex items-center"
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  WhatsApp Support
                </button>
              </li>
              <li>
                <button 
                  onClick={() => window.open('mailto:tatangtaryaedi.tte@gmail.com?subject=Bantuan SurveyKu')}
                  className="hover:text-primary flex items-center"
                >
                  <Mail className="h-3 w-3 mr-1" />
                  Email Support
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Kontak & Legal</h4>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                <p className="font-medium">Email:</p>
                <p className="text-xs">tatangtaryaedi.tte@gmail.com</p>
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-medium">WhatsApp:</p>
                <p className="text-xs">+62 896-6359-6711</p>
              </div>
              <Separator />
              <ul className="space-y-1 text-xs text-gray-500">
                <li>
                  <HelpModal>
                    <button className="hover:text-primary flex items-center">
                      <FileText className="h-3 w-3 mr-1" />
                      Syarat & Ketentuan
                    </button>
                  </HelpModal>
                </li>
                <li>
                  <HelpModal>
                    <button className="hover:text-primary flex items-center">
                      <Shield className="h-3 w-3 mr-1" />
                      Kebijakan Privasi
                    </button>
                  </HelpModal>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <Separator className="my-6" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-gray-500">
            © 2025 SurveyKu. Semua hak dilindungi.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="text-xs text-gray-500">
              Support 24/7
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.open('https://wa.me/6289663596711?text=Halo, saya butuh bantuan dengan SurveyKu')}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.open('mailto:tatangtaryaedi.tte@gmail.com?subject=Bantuan SurveyKu')}
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}