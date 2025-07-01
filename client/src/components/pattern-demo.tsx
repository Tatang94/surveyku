import React, { useState } from "react";
import PatternLock from "@/components/pattern-lock";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Check, X } from "lucide-react";

export default function PatternDemo() {
  const [currentPattern, setCurrentPattern] = useState<number[]>([]);
  const [savedPattern, setSavedPattern] = useState<number[]>([]);
  const [mode, setMode] = useState<'create' | 'confirm' | 'complete'>('create');
  const [resetTrigger, setResetTrigger] = useState(false);
  const [message, setMessage] = useState('');

  const handlePatternChange = (pattern: number[]) => {
    setCurrentPattern(pattern);
  };

  const handlePatternComplete = (pattern: number[]) => {
    if (mode === 'create') {
      setSavedPattern(pattern);
      setMode('confirm');
      setMessage('Ulangi pola untuk konfirmasi');
      setResetTrigger(prev => !prev);
    } else if (mode === 'confirm') {
      if (JSON.stringify(pattern) === JSON.stringify(savedPattern)) {
        setMode('complete');
        setMessage('Pola berhasil dibuat!');
      } else {
        setMessage('Pola tidak cocok. Coba lagi.');
        setResetTrigger(prev => !prev);
      }
    }
  };

  const resetDemo = () => {
    setCurrentPattern([]);
    setSavedPattern([]);
    setMode('create');
    setMessage('');
    setResetTrigger(prev => !prev);
  };

  const getStatusColor = () => {
    if (mode === 'complete') return 'bg-green-100 text-green-800';
    if (mode === 'confirm') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = () => {
    if (mode === 'complete') return 'Selesai';
    if (mode === 'confirm') return 'Konfirmasi';
    return 'Buat Pola';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>Demo Pola Password</span>
              <Badge className={getStatusColor()}>
                {getStatusText()}
              </Badge>
            </CardTitle>
            <CardDescription>
              {mode === 'create' && 'Gambar pola dengan menghubungkan minimal 4 titik'}
              {mode === 'confirm' && 'Ulangi pola yang sama untuk konfirmasi'}
              {mode === 'complete' && 'Pola password berhasil dibuat'}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetDemo}
            className="flex items-center space-x-1"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <PatternLock
            size={280}
            gridSize={3}
            onPatternChange={handlePatternChange}
            onPatternComplete={handlePatternComplete}
            disabled={mode === 'complete'}
            showPath={true}
            minLength={4}
            resetTrigger={resetTrigger}
          />
        </div>

        {message && (
          <div className={cn(
            "flex items-center justify-center space-x-2 p-3 rounded-lg text-sm font-medium",
            mode === 'complete' ? "bg-green-50 text-green-700" : 
            message.includes('tidak cocok') ? "bg-red-50 text-red-700" : 
            "bg-blue-50 text-blue-700"
          )}>
            {mode === 'complete' ? (
              <Check className="h-4 w-4" />
            ) : message.includes('tidak cocok') ? (
              <X className="h-4 w-4" />
            ) : null}
            <span>{message}</span>
          </div>
        )}

        {savedPattern.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Status Pola:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Pola Asli:</span>
                <span className="font-mono">{savedPattern.join('-')}</span>
              </div>
              {mode === 'confirm' && currentPattern.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Pola Konfirmasi:</span>
                  <span className="font-mono">{currentPattern.join('-')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Cara Menggunakan:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Sentuh dan seret untuk menghubungkan titik-titik</li>
            <li>• Minimal 4 titik harus terhubung</li>
            <li>• Setiap titik hanya bisa digunakan sekali</li>
            <li>• Lepas sentuhan untuk menyelesaikan pola</li>
            <li>• Ulangi pola yang sama untuk konfirmasi</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}