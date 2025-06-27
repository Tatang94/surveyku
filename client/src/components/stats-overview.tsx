import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/cpx-research";
import { DollarSign, CheckCircle, TrendingUp, List } from "lucide-react";

interface Stats {
  totalEarnings: string;
  completedSurveys: number;
  completionRate: number;
  availableSurveys: number;
}

export default function StatsOverview() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      title: "Total Penghasilan",
      value: formatCurrency(stats?.totalEarnings || "0"),
      icon: DollarSign,
      bgColor: "bg-secondary/20",
      iconColor: "text-secondary",
    },
    {
      title: "Survey Selesai",
      value: stats?.completedSurveys || 0,
      icon: CheckCircle,
      bgColor: "bg-primary/20",
      iconColor: "text-primary",
    },
    {
      title: "Tingkat Penyelesaian",
      value: `${stats?.completionRate || 0}%`,
      icon: TrendingUp,
      bgColor: "bg-accent/20",
      iconColor: "text-accent",
    },
    {
      title: "Survey Tersedia",
      value: stats?.availableSurveys || 0,
      icon: List,
      bgColor: "bg-blue-500/20",
      iconColor: "text-blue-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="stats-card">
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 ${item.bgColor} rounded-full flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${item.iconColor}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">{item.title}</dt>
                  <dd className="text-lg font-medium text-gray-900">{item.value}</dd>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
