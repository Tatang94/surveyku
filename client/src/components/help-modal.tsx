import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, MessageCircle, Phone, Mail, Shield, FileText, User, DollarSign, Clock, Award } from "lucide-react";

interface HelpModalProps {
  children?: React.ReactNode;
}

export default function HelpModal({ children }: HelpModalProps) {
  const [open, setOpen] = useState(false);

  const faqs = [
    {
      category: "Umum",
      icon: <User className="h-4 w-4" />,
      questions: [
        {
          q: "Apa itu SurveyKu?",
          a: "SurveyKu adalah platform survei online yang memungkinkan Anda mendapatkan penghasilan dengan mengisi survei dari perusahaan-perusahaan terpercaya."
        },
        {
          q: "Bagaimana cara kerja platform ini?",
          a: "1. Daftar dan lengkapi profil Anda\n2. Pilih survei yang sesuai dengan profil\n3. Isi survei dengan jujur dan lengkap\n4. Dapatkan reward setelah survei selesai\n5. Tarik penghasilan Anda"
        },
        {
          q: "Apakah gratis untuk bergabung?",
          a: "Ya, pendaftaran dan penggunaan platform SurveyKu sepenuhnya gratis. Anda tidak perlu membayar apapun."
        }
      ]
    },
    {
      category: "Penghasilan",
      icon: <DollarSign className="h-4 w-4" />,
      questions: [
        {
          q: "Berapa penghasilan yang bisa didapat?",
          a: "Penghasilan bervariasi tergantung jenis survei, biasanya Rp 5.000 - Rp 50.000 per survei. Semakin lengkap profil Anda, semakin banyak survei yang tersedia."
        },
        {
          q: "Kapan saya mendapat pembayaran?",
          a: "Pembayaran otomatis masuk ke saldo Anda setelah survei selesai dan diverifikasi, biasanya dalam 1-24 jam."
        },
        {
          q: "Berapa minimum penarikan?",
          a: "Minimum penarikan adalah Rp 50.000. Anda bisa menarik dana setelah saldo mencapai minimum tersebut."
        },
        {
          q: "Bagaimana cara menarik penghasilan?",
          a: "Klik tombol 'Tarik Dana' di sidebar dashboard. Dana akan ditransfer ke rekening bank yang Anda daftarkan dalam 1-3 hari kerja."
        }
      ]
    },
    {
      category: "Survei",
      icon: <Award className="h-4 w-4" />,
      questions: [
        {
          q: "Mengapa saya tidak mendapat survei?",
          a: "Pastikan profil Anda lengkap 100%. Survei ditargetkan berdasarkan demografi, sehingga profil yang lengkap meningkatkan peluang mendapat survei."
        },
        {
          q: "Berapa lama waktu mengisi survei?",
          a: "Durasi survei bervariasi dari 5-30 menit. Informasi durasi dan reward selalu ditampilkan sebelum memulai survei."
        },
        {
          q: "Apa yang harus dilakukan jika survei error?",
          a: "Jika mengalami masalah teknis, tutup dan buka kembali survei. Jika masih bermasalah, hubungi support dengan menyertakan screenshot."
        }
      ]
    },
    {
      category: "Akun",
      icon: <Shield className="h-4 w-4" />,
      questions: [
        {
          q: "Bagaimana cara mengubah profil?",
          a: "Masuk ke menu Profil di header atau sidebar, lalu update informasi yang diperlukan. Pastikan data yang dimasukkan akurat."
        },
        {
          q: "Lupa password, bagaimana reset?",
          a: "Hubungi support melalui WhatsApp atau email dengan menyertakan email yang terdaftar untuk bantuan reset password."
        },
        {
          q: "Apakah data saya aman?",
          a: "Ya, kami menggunakan enkripsi SSL dan tidak membagikan data pribadi kepada pihak ketiga tanpa persetujuan Anda."
        }
      ]
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <HelpCircle className="h-4 w-4 mr-2" />
            Bantuan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Pusat Bantuan SurveyKu
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="cara-kerja">Cara Kerja</TabsTrigger>
            <TabsTrigger value="kontak">Kontak</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            <TabsContent value="faq" className="space-y-4">
              <div className="grid gap-4">
                {faqs.map((category, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {category.icon}
                        {category.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {category.questions.map((faq, qIdx) => (
                        <div key={qIdx} className="space-y-2">
                          <h4 className="font-medium text-sm">{faq.q}</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">{faq.a}</p>
                          {qIdx < category.questions.length - 1 && <Separator />}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="cara-kerja" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Panduan Lengkap Menggunakan SurveyKu</CardTitle>
                  <CardDescription>Ikuti langkah-langkah berikut untuk memaksimalkan penghasilan Anda</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="flex gap-4">
                      <Badge variant="secondary" className="min-w-[30px] h-6">1</Badge>
                      <div>
                        <h4 className="font-medium">Daftar Akun</h4>
                        <p className="text-sm text-muted-foreground">Buat akun dengan email valid dan lengkapi profil Anda dengan data yang akurat</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <Badge variant="secondary" className="min-w-[30px] h-6">2</Badge>
                      <div>
                        <h4 className="font-medium">Lengkapi Profil</h4>
                        <p className="text-sm text-muted-foreground">Isi semua informasi profil hingga 100%. Profil lengkap mendapat lebih banyak survei</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <Badge variant="secondary" className="min-w-[30px] h-6">3</Badge>
                      <div>
                        <h4 className="font-medium">Pilih Survei</h4>
                        <p className="text-sm text-muted-foreground">Browse survei yang tersedia di dashboard. Perhatikan durasi dan reward sebelum memulai</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <Badge variant="secondary" className="min-w-[30px] h-6">4</Badge>
                      <div>
                        <h4 className="font-medium">Isi Survei</h4>
                        <p className="text-sm text-muted-foreground">Jawab semua pertanyaan dengan jujur dan lengkap. Jangan terburu-buru</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <Badge variant="secondary" className="min-w-[30px] h-6">5</Badge>
                      <div>
                        <h4 className="font-medium">Terima Reward</h4>
                        <p className="text-sm text-muted-foreground">Setelah survei selesai, reward otomatis masuk ke saldo Anda</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <Badge variant="secondary" className="min-w-[30px] h-6">6</Badge>
                      <div>
                        <h4 className="font-medium">Tarik Penghasilan</h4>
                        <p className="text-sm text-muted-foreground">Minimal Rp 50.000 bisa ditarik ke rekening bank Anda</p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">💡 Tips Sukses:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Cek platform setiap hari untuk survei baru</li>
                      <li>• Jawab dengan jujur, konsistensi jawaban dipantau</li>
                      <li>• Lengkapi profil 100% untuk maksimal survei</li>
                      <li>• Fokus saat mengisi, jangan sambil melakukan aktivitas lain</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="kontak" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Hubungi Tim Support</CardTitle>
                  <CardDescription>Kami siap membantu Anda 24/7</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <Mail className="h-8 w-8 text-blue-600" />
                      <div className="flex-1">
                        <h4 className="font-medium">Email Support</h4>
                        <p className="text-sm text-muted-foreground">Response time: 1-24 jam</p>
                        <p className="text-sm font-mono">tatangtaryaedi.tte@gmail.com</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open('mailto:tatangtaryaedi.tte@gmail.com?subject=Bantuan SurveyKu')}
                      >
                        Kirim Email
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <MessageCircle className="h-8 w-8 text-green-600" />
                      <div className="flex-1">
                        <h4 className="font-medium">WhatsApp Support</h4>
                        <p className="text-sm text-muted-foreground">Response time: Langsung</p>
                        <p className="text-sm font-mono">+62 896-6359-6711</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open('https://wa.me/6289663596711?text=Halo, saya butuh bantuan dengan SurveyKu')}
                      >
                        Chat WA
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">📞 Jam Operasional Support:</h4>
                    <div className="text-sm text-green-800 space-y-1">
                      <p><strong>WhatsApp:</strong> 24/7 (Respons cepat 08:00-22:00 WIB)</p>
                      <p><strong>Email:</strong> Senin-Minggu, 24 jam</p>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">⚡ Untuk Respons Cepat:</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Sertakan screenshot jika ada error</li>
                      <li>• Cantumkan email akun Anda</li>
                      <li>• Jelaskan masalah dengan detail</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="legal" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Syarat & Ketentuan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-medium">1. Penerimaan Syarat</h4>
                      <p className="text-muted-foreground">Dengan menggunakan layanan SurveyKu, Anda menyetujui syarat dan ketentuan yang berlaku.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">2. Kualifikasi Pengguna</h4>
                      <p className="text-muted-foreground">Pengguna harus berusia minimal 18 tahun dan memberikan informasi yang akurat saat pendaftaran.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">3. Penggunaan Platform</h4>
                      <p className="text-muted-foreground">Pengguna dilarang melakukan kecurangan, spam, atau aktivitas yang merugikan platform dan pengguna lain.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">4. Pembayaran</h4>
                      <p className="text-muted-foreground">Pembayaran dilakukan sesuai ketentuan yang berlaku. Minimum penarikan Rp 50.000.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">5. Penangguhan Akun</h4>
                      <p className="text-muted-foreground">Kami berhak menangguhkan akun yang melanggar ketentuan atau memberikan data tidak valid.</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Kebijakan Privasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-medium">Pengumpulan Data</h4>
                      <p className="text-muted-foreground">Kami mengumpulkan informasi profil untuk mencocokkan Anda dengan survei yang relevan.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Penggunaan Data</h4>
                      <p className="text-muted-foreground">Data digunakan untuk targeting survei, pembayaran, dan peningkatan layanan platform.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Keamanan Data</h4>
                      <p className="text-muted-foreground">Kami menggunakan enkripsi SSL dan tidak membagikan data pribadi tanpa persetujuan.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Hak Pengguna</h4>
                      <p className="text-muted-foreground">Anda berhak meminta akses, koreksi, atau penghapusan data pribadi Anda.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Masih butuh bantuan? Hubungi support kami
          </p>
          <Button onClick={() => setOpen(false)} variant="outline" size="sm">
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}