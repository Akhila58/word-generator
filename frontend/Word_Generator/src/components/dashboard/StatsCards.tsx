
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CheckCircle, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  hasWords: boolean;
}

const StatsCards = ({ hasWords }: StatsCardsProps) => {
  const today = new Date();
  const stats = [
    {
      title: "Today's Status",
      value: hasWords ? "Generated" : "Pending",
      icon: CheckCircle,
      color: hasWords ? "text-green-600" : "text-orange-600",
      bgColor: hasWords ? "bg-green-50" : "bg-orange-50",
      description: hasWords ? "Words ready to use" : "Generate today's words"
    },
    {
      title: "Current Date",
      value: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: today.toLocaleDateString('en-US', { weekday: 'long' })
    },
    {
      title: "Daily Refresh",
      value: "Available",
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      description: "New words every day"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className={`text-lg font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stat.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;
