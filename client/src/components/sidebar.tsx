import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/cpx-research";
import { useAuth } from "@/lib/auth";
import { CheckCircle, Coins, User, Banknote, Share } from "lucide-react";
import type { Transaction } from "@shared/schema";

export default function Sidebar() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery<{ transactions: Transaction[] }>({
    queryKey: ["/api/transactions"],
  });

  const withdrawMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest("POST", "/api/withdraw", { amount });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Penarikan berhasil",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal menarik dana",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const transactions = transactionsData?.transactions || [];
  const recentTransactions = transactions.slice(0, 3);

  const handleWithdraw = () => {
    const balance = parseFloat(user?.balance || "0");
    if (balance < 50000) {
      toast({
        title: "Saldo tidak mencukupi",
        description: "Minimum penarikan Rp 50.000",
        variant: "destructive",
      });
      return;
    }
    
    // For demo, withdraw available balance
    withdrawMutation.mutate(balance);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'SurveyKu - Platform Survey Berbayar',
        text: 'Bergabung dengan SurveyKu dan dapatkan penghasilan dari survey!',
        url: window.location.origin,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin);
      toast({
        title: "Link berhasil disalin",
        description: "Link referral telah disalin ke clipboard",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Recent Activity */}
      <Card>
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-medium">Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {transactionsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Belum ada aktivitas
            </p>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === 'earning' ? 'bg-secondary/20' : 'bg-accent/20'
                    }`}>
                      {transaction.type === 'earning' ? (
                        <CheckCircle className="h-4 w-4 text-secondary" />
                      ) : (
                        <Coins className="h-4 w-4 text-accent" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.type === 'earning' ? 'Survey selesai' : 'Penarikan dana'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.createdAt!).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className={`text-sm font-medium ${
                    transaction.type === 'earning' ? 'text-secondary' : 'text-gray-600'
                  }`}>
                    {transaction.type === 'earning' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Earnings Breakdown */}
      <Card>
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-medium">Breakdown Penghasilan</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Bulan ini</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(user.totalEarnings)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-4">
              <span className="text-sm font-medium text-gray-900">Total</span>
              <span className="text-sm font-bold text-secondary">
                {formatCurrency(user.totalEarnings)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdraw Section */}
      <Card>
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-medium">Penarikan Dana</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary mb-2">
              {formatCurrency(user.balance)}
            </div>
            <p className="text-sm text-gray-600 mb-4">Saldo dapat ditarik</p>
            <Button 
              className="w-full bg-secondary text-white hover:bg-secondary/90"
              onClick={handleWithdraw}
              disabled={withdrawMutation.isPending || parseFloat(user.balance) < 50000}
            >
              <Banknote className="mr-2 h-4 w-4" />
              {withdrawMutation.isPending ? "Memproses..." : "Tarik Dana"}
            </Button>
            <p className="text-xs text-gray-500 mt-2">Minimum penarikan Rp 50.000</p>
          </div>
        </CardContent>
      </Card>

      {/* Referral Program */}
      <Card className="bg-gradient-to-r from-primary to-blue-600 text-white">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-2">Program Referral</h3>
          <p className="text-sm mb-4 text-blue-100">
            Ajak teman dan dapatkan 10% dari penghasilan mereka!
          </p>
          <Button 
            variant="secondary"
            className="bg-white text-primary hover:bg-gray-100"
            onClick={handleShare}
          >
            <Share className="mr-2 h-4 w-4" />
            Bagikan Link
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
