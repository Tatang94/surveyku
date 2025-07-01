import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, EyeOff } from "lucide-react";

interface PasswordPatternGuideProps {
  className?: string;
}

export default function PasswordPatternGuide({ className }: PasswordPatternGuideProps) {
  const [showExamples, setShowExamples] = React.useState(false);

  const passwordExamples = [
    { text: "MyPass123!", strength: "Sangat Kuat", color: "bg-green-100 text-green-800" },
    { text: "SecureKey@2024", strength: "Sangat Kuat", color: "bg-green-100 text-green-800" },
    { text: "Dream#House99", strength: "Sangat Kuat", color: "bg-green-100 text-green-800" }
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">Panduan Pola Sandi</CardTitle>
        </div>
        <CardDescription>
          Ikuti panduan ini untuk membuat password yang aman dan kuat
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Password Requirements */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center space-x-2">
            <Lock className="h-4 w-4" />
            <span>Persyaratan Password:</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Minimal 8 karakter</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>1 huruf besar (A-Z)</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>1 huruf kecil (a-z)</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>1 angka (0-9)</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>1 karakter khusus</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Tanpa spasi</span>
            </div>
          </div>
        </div>

        {/* Special Characters */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Karakter Khusus yang Diizinkan:</h4>
          <div className="p-3 bg-gray-50 rounded-lg">
            <code className="text-sm font-mono text-gray-700">
              ! @ # $ % ^ & * ( ) , . ? " : {`{`} {`}`} | &lt; &gt;
            </code>
          </div>
        </div>

        {/* Examples Toggle */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            {showExamples ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showExamples ? "Sembunyikan" : "Lihat"} contoh password kuat</span>
          </button>
          
          {showExamples && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Contoh Password Kuat:</h4>
              {passwordExamples.map((example, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <code className="text-sm font-mono">{example.text}</code>
                  <Badge className={example.color}>{example.strength}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Tips */}
        <div className="space-y-2 pt-3 border-t">
          <h4 className="font-medium text-gray-900">Tips Keamanan:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Gunakan kombinasi kata yang mudah diingat dengan angka dan simbol</li>
            <li>• Jangan gunakan informasi pribadi (nama, tanggal lahir, dll)</li>
            <li>• Hindari password yang umum seperti "123456" atau "password"</li>
            <li>• Gunakan password yang berbeda untuk setiap akun</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}