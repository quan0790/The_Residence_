import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useRental } from '@/contexts/RentalContext';

export const PaymentAnalytics = () => {
  const { payments, units, tenants } = useRental();

  // Generate last 6 months data
  const generateMonthlyData = () => {
    const months = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      // Calculate collected rent for this month
      const monthPayments = payments.filter(p => p.month === monthKey);
      const collected = monthPayments.reduce((sum, p) => sum + p.amount, 0);
      
      // Calculate expected rent (all tenants * their unit rent)
      const expected = tenants.reduce((sum, tenant) => {
        const unit = units.find(u => u.id === tenant.unitId);
        return sum + (unit?.rentAmount || 0);
      }, 0);
      
      months.push({
        month: monthName,
        collected,
        expected,
        shortfall: Math.max(0, expected - collected),
      });
    }
    
    return months;
  };

  const data = generateMonthlyData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Trends</CardTitle>
        <CardDescription>6-month rent collection overview</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="month" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              formatter={(value: number) => `$${value.toFixed(2)}`}
            />
            <Legend />
            <Bar dataKey="collected" fill="hsl(var(--primary))" name="Collected" radius={[4, 4, 0, 0]} />
            <Bar dataKey="shortfall" fill="hsl(var(--destructive))" name="Shortfall" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
