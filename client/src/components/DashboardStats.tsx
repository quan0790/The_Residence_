import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Home, DoorOpen, AlertCircle } from 'lucide-react';

interface StatsProps {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  upcomingRentDue: number;
}

export const DashboardStats = ({ totalUnits, occupiedUnits, vacantUnits, upcomingRentDue }: StatsProps) => {
  const stats = [
    {
      key: 'total-units',
      title: 'Total Units',
      value: totalUnits,
      icon: <Building2 className="h-4 w-4 text-muted-foreground" />,
      description: null,
    },
    {
      key: 'occupied-units',
      title: 'Occupied Units',
      value: occupiedUnits,
      icon: <Home className="h-4 w-4 text-muted-foreground" />,
      description: totalUnits > 0 ? `${Math.round((occupiedUnits / totalUnits) * 100)}% occupancy` : '0% occupancy',
    },
    {
      key: 'vacant-units',
      title: 'Vacant Units',
      value: vacantUnits,
      icon: <DoorOpen className="h-4 w-4 text-muted-foreground" />,
      description: null,
    },
    {
      key: 'rent-due-soon',
      title: 'Rent Due Soon',
      value: upcomingRentDue,
      icon: <AlertCircle className="h-4 w-4 text-muted-foreground" />,
      description: 'Next 7 days',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map(stat => (
        <Card key={stat.key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.description && <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
