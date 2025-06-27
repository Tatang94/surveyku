import { useAuth, useLogout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/cpx-research";
import { Wallet, User, LogOut } from "lucide-react";

export default function Header() {
  const { user } = useAuth();
  const logout = useLogout();

  if (!user) return null;

  const userInitials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary">SurveyKu</h1>
            </div>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <a href="#" className="text-gray-900 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
              <a href="#" className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Survey</a>
              <a href="#" className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Riwayat</a>
              <a href="#" className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Profil</a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Balance Display */}
            <div className="balance-display flex items-center space-x-2">
              <Wallet className="h-4 w-4" />
              <span className="text-sm font-medium">Saldo:</span>
              <span className="text-lg font-bold">{formatCurrency(user.balance)}</span>
            </div>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logout.mutate()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
