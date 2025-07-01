import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterData } from "@shared/schema";
import { useRegister } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import PasswordStrength from "@/components/password-strength";
import PasswordPatternGuide from "@/components/password-pattern-guide";

export default function Register() {
  const register = useRegister();
  
  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      country: "ID",
      zipCode: "",
    },
  });

  const watchPassword = form.watch("password");

  const onSubmit = (data: RegisterData) => {
    register.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">SurveyKu</h1>
          <p className="mt-2 text-gray-600">Daftar dan mulai menghasilkan dari survey</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Registrasi */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Buat Akun Baru</CardTitle>
                <CardDescription>
                  Lengkapi data diri Anda untuk mendapatkan survey yang sesuai
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama Depan</FormLabel>
                            <FormControl>
                              <Input placeholder="Nama depan" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama Belakang</FormLabel>
                            <FormControl>
                              <Input placeholder="Nama belakang" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Username unik Anda" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="nama@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Masukkan password yang kuat" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                            {watchPassword && (
                              <PasswordStrength password={watchPassword} className="mt-2" />
                            )}
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Konfirmasi Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Ulangi password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tanggal Lahir</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Jenis Kelamin</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih jenis kelamin" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Laki-laki</SelectItem>
                                <SelectItem value="female">Perempuan</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kode Pos</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="12345" 
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={register.isPending}
                    >
                      {register.isPending ? "Memproses..." : "Daftar Sekarang"}
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Sudah punya akun?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                      Masuk di sini
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Password Pattern Guide */}
          <div className="lg:col-span-1">
            <PasswordPatternGuide />
          </div>
        </div>
      </div>
    </div>
  );
}