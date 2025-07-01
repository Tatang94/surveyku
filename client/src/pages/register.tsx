import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterData } from "@shared/schema";
import { useRegister } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link } from "wouter";
import PatternLock from "@/components/pattern-lock";
import PatternDemo from "@/components/pattern-demo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function Register() {
  const register = useRegister();
  
  const [pattern, setPattern] = useState<string>("");
  const [confirmPattern, setConfirmPattern] = useState<string>("");
  const [step, setStep] = useState<'username' | 'pattern' | 'confirm'>('username');
  const [resetTrigger, setResetTrigger] = useState(false);
  
  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      pattern: "",
      confirmPattern: "",
    },
  });

  const handleUsernameNext = () => {
    const username = form.getValues('username');
    if (username.length >= 3) {
      setStep('pattern');
    }
  };

  const handlePatternComplete = (patternArray: number[]) => {
    const patternString = patternArray.join('-');
    setPattern(patternString);
    form.setValue('pattern', patternString);
    setStep('confirm');
    setResetTrigger(prev => !prev);
  };

  const handleConfirmPatternComplete = (patternArray: number[]) => {
    const patternString = patternArray.join('-');
    setConfirmPattern(patternString);
    form.setValue('confirmPattern', patternString);
    
    if (patternString === pattern) {
      // Patterns match, ready to submit
      const formData = form.getValues();
      register.mutate(formData);
    } else {
      // Patterns don't match, reset
      setTimeout(() => {
        setResetTrigger(prev => !prev);
        setConfirmPattern("");
        form.setValue('confirmPattern', "");
      }, 1000);
    }
  };

  const goBack = () => {
    if (step === 'confirm') {
      setStep('pattern');
      setConfirmPattern("");
      form.setValue('confirmPattern', "");
    } else if (step === 'pattern') {
      setStep('username');
      setPattern("");
      setConfirmPattern("");
      form.setValue('pattern', "");
      form.setValue('confirmPattern', "");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">SurveyKu</h1>
          <p className="mt-2 text-gray-600">Daftar dengan username dan pola gambar</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Registrasi */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Buat Akun Baru</CardTitle>
                <CardDescription>
                  {step === 'username' && 'Masukkan username unik Anda'}
                  {step === 'pattern' && 'Buat pola gambar untuk password'}
                  {step === 'confirm' && 'Ulangi pola yang sama untuk konfirmasi'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...form}>
                  {/* Step Username */}
                  {step === 'username' && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Masukkan username unik" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                            <p className="text-sm text-gray-500">
                              Username 3-20 karakter, hanya huruf, angka, dan underscore
                            </p>
                          </FormItem>
                        )}
                      />
                      <Button 
                        onClick={handleUsernameNext}
                        className="w-full"
                        disabled={form.watch('username').length < 3}
                      >
                        Lanjut ke Pola Password
                      </Button>
                    </div>
                  )}

                {/* Step Pattern */}
                {step === 'pattern' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="font-medium text-gray-900 mb-2">Buat Pola Password</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Gambar pola dengan menghubungkan minimal 4 titik
                      </p>
                    </div>
                    
                    <div className="flex justify-center">
                      <PatternLock
                        size={280}
                        gridSize={3}
                        onPatternComplete={handlePatternComplete}
                        showPath={true}
                        minLength={4}
                        resetTrigger={resetTrigger}
                      />
                    </div>

                    <div className="flex space-x-3">
                      <Button 
                        variant="outline" 
                        onClick={goBack}
                        className="flex-1"
                      >
                        Kembali
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step Confirm */}
                {step === 'confirm' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="font-medium text-gray-900 mb-2">Konfirmasi Pola</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Ulangi pola yang sama untuk konfirmasi
                      </p>
                    </div>

                    {confirmPattern && confirmPattern !== pattern && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Pola tidak cocok! Coba lagi.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="flex justify-center">
                      <PatternLock
                        size={280}
                        gridSize={3}
                        onPatternComplete={handleConfirmPatternComplete}
                        showPath={true}
                        minLength={4}
                        resetTrigger={resetTrigger}
                      />
                    </div>

                    <div className="flex space-x-3">
                      <Button 
                        variant="outline" 
                        onClick={goBack}
                        className="flex-1"
                      >
                        Kembali
                      </Button>
                    </div>

                    {register.isPending && (
                      <div className="text-center text-sm text-gray-600">
                        Memproses registrasi...
                      </div>
                    )}
                  </div>
                )}
                
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Sudah punya akun?{" "}
                      <Link href="/login" className="text-primary hover:underline">
                        Masuk di sini
                      </Link>
                    </p>
                  </div>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          {/* Demo Pattern */}
          <div>
            <PatternDemo />
          </div>
        </div>
      </div>
    </div>
  );
}