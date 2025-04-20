
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StatsCardsProps {
  stats: {
    total: number;
    interviews: number;
    h1bEligible: number;
    successRate: number;
  };
}

const StatsCards = ({ stats }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Total Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.interviews}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">H1B Eligible</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.h1bEligible}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="text-3xl font-bold">{stats.successRate}%</div>
            <Progress value={stats.successRate} className="h-2 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
