import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginCredentials } from "@shared/schema";
import { useLogin } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link } from "wouter";
import PatternLock from "@/components/pattern-lock";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Login() {
  const login = useLogin();
  
  const [step, setStep] = useState<'username' | 'pattern'>('username');
  const [resetTrigger, setResetTrigger] = useState(false);
  const [loginError, setLoginError] = useState<string>("");
  
  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      pattern: "",
    },
  });

  const handleUsernameNext = () => {
    const username = form.getValues('username');
    if (username.length >= 3) {
      setStep('pattern');
      setLoginError("");
    }
  };

  const handlePatternComplete = (patternArray: number[]) => {
    const patternString = patternArray.join('-');
    form.setValue('pattern', patternString);
    
    const formData = form.getValues();
    login.mutate(formData, {
      onError: (error) => {
        setLoginError("Username atau pola password salah");
        setResetTrigger(prev => !prev);
      }
    });
  };

  const goBack = () => {
    setStep('username');
    setLoginError("");
    form.setValue('pattern', "");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">SurveyKu</h1>
          <p className="mt-2 text-gray-600">Masuk dengan username dan pola gambar</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Masuk ke Akun</CardTitle>
            <CardDescription>
              {step === 'username' && 'Masukkan username Anda'}
              {step === 'pattern' && 'Gambar pola password Anda'}
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
                            placeholder="Masukkan username" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
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
                    <h3 className="font-medium text-gray-900 mb-2">
                      Masuk sebagai: {form.getValues('username')}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Gambar pola password Anda
                    </p>
                  </div>

                  {loginError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {loginError}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex justify-center">
                    <PatternLock
                      size={280}
                      gridSize={3}
                      onPatternComplete={handlePatternComplete}
                      showPath={true}
                      minLength={4}
                      resetTrigger={resetTrigger}
                      disabled={login.isPending}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      onClick={goBack}
                      className="flex-1"
                      disabled={login.isPending}
                    >
                      Kembali
                    </Button>
                  </div>

                  {login.isPending && (
                    <div className="text-center text-sm text-gray-600">
                      Memproses login...
                    </div>
                  )}
                </div>
              )}
            
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Belum punya akun?{" "}
                  <Link href="/register" className="text-primary hover:underline">
                    Daftar di sini
                  </Link>
                </p>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}