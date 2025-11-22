import { useEffect } from "react";
import Layout from "@/components/Layout";
import { DashboardStats } from "@/components/DashboardStats";
import { PaymentAnalytics } from "@/components/PaymentAnalytics";
import { EmailReminderDialog } from "@/components/EmailReminderDialog";
import { useRental } from "@/contexts/RentalContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { downloadCSV } from '@/lib/csv';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { units, tenants } = useRental();
  const navigate = useNavigate();

  // ✅ Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleExportPayments = () => {
    const paymentData = tenants
      .filter(t => t.rentPaid)
      .map(tenant => {
        const unit = units.find(u => u.id === tenant.unitId);
        return {
          Tenant: tenant.name || 'Unknown',
          Unit: unit?.unitNumber || 'N/A',
          Amount: unit?.rentAmount.toFixed(2) || '0.00',
          Status: 'Paid',
        };
      });
    
    downloadCSV(paymentData, 'payment_report');
    toast.success('Payment report exported successfully');
  };

  const totalUnits = units.length;
  const occupiedUnits = units.filter(u => u.status === 'occupied').length;
  const vacantUnits = units.filter(u => u.status === 'vacant').length;

  const today = new Date().getDate();
  const upcomingRentDue = tenants.filter(tenant => {
    if (tenant.rentPaid) return false;
    const dueDate = tenant.rentDueDate;
    const daysUntilDue = dueDate >= today ? dueDate - today : (30 - today) + dueDate;
    return daysUntilDue <= 7;
  }).length;

  const unpaidTenants = tenants.filter(t => !t.rentPaid);

  const totalMonthlyRent = tenants.reduce((sum, tenant) => {
    const unit = units.find(u => u.id === tenant.unitId);
    return sum + (unit?.rentAmount || 0);
  }, 0);

  const collectedRent = tenants
    .filter(t => t.rentPaid)
    .reduce((sum, tenant) => {
      const unit = units.find(u => u.id === tenant.unitId);
      return sum + (unit?.rentAmount || 0);
    }, 0);

  const unpaidTenantList = unpaidTenants.slice(0, 5).map((tenant) => {
    const unit = units.find(u => u.id === tenant.unitId);
    const key = tenant.id ?? `${tenant.name}-${unit?.id}`;
    return (
      <div key={key} className="flex justify-between items-center gap-2">
        <div className="flex-1">
          <p className="text-sm font-medium">{tenant.name}</p>
          <p className="text-xs text-muted-foreground">Unit {unit?.unitNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive">Due: Day {tenant.rentDueDate}</Badge>
          {unit && <EmailReminderDialog tenant={tenant} unit={unit} />}
        </div>
      </div>
    );
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">Overview of your rental properties</p>
          </div>
          <Button onClick={handleLogout} variant="destructive">Logout</Button>
        </div>

        <DashboardStats
          totalUnits={totalUnits}
          occupiedUnits={occupiedUnits}
          vacantUnits={vacantUnits}
          upcomingRentDue={upcomingRentDue}
        />

        <PaymentAnalytics />

        <div className="grid gap-4 md:grid-cols-2">
          {/* Monthly Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Collection Summary</CardTitle>
              <CardDescription>Current month rent collection status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Expected</span>
                  <span className="text-lg font-semibold">${totalMonthlyRent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Collected</span>
                  <span className="text-lg font-semibold text-green-600">${collectedRent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="text-lg font-semibold text-orange-600">${(totalMonthlyRent - collectedRent).toFixed(2)}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all"
                    style={{ width: `${totalMonthlyRent > 0 ? (collectedRent / totalMonthlyRent) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rent Reminders */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Rent Reminders</CardTitle>
                  <CardDescription>Tenants with unpaid rent</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportPayments}
                  disabled={unpaidTenants.length === 0}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {unpaidTenants.length === 0 ? (
                <p className="text-sm text-muted-foreground">All rent payments are up to date!</p>
              ) : (
                <div className="space-y-3">{unpaidTenantList}</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
