import React, { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { useRental } from "@/contexts/RentalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search, CheckCircle, Download } from "lucide-react";
import { toast } from "sonner";
import { Tenant as TenantType } from "@/types/rental";
import { downloadCSV } from "@/lib/csv";
import { EmailReminderDialog } from "@/components/EmailReminderDialog";

type TenantForm = {
  name: string;
  email: string;
  phone: string;
  unitId?: string;
  rentDueDate: string;
  depositPaid?: string;
  notes?: string;
};

const Tenants: React.FC = () => {
  const { units, tenants, addTenant, updateTenant, deleteTenant, markRentPaid, updateUnit } =
    useRental();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "unpaid">("all");
  const [formData, setFormData] = useState<TenantForm>({
    name: "",
    email: "",
    phone: "",
    unitId: "",
    rentDueDate: "1",
    depositPaid: "0",
    notes: "",
  });

  const resetForm = () =>
    setFormData({
      name: "",
      email: "",
      phone: "",
      unitId: "",
      rentDueDate: "1",
      depositPaid: "0",
      notes: "",
    });

  const sortedUnits = useMemo(
    () => [...units].sort((a, b) => a.unitNumber.localeCompare(b.unitNumber)),
    [units]
  );

  const filteredTenants = useMemo(() => {
    return tenants
      .filter((tenant) => {
        if (filterStatus === "paid" && !tenant.rentPaid) return false;
        if (filterStatus === "unpaid" && tenant.rentPaid) return false;
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        return (
          tenant.name.toLowerCase().includes(s) ||
          tenant.email.toLowerCase().includes(s) ||
          (tenant.phone || "").toLowerCase().includes(s)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tenants, filterStatus, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!editingTenant && tenants.some((t) => t.email.toLowerCase() === formData.email.toLowerCase())) {
        return toast.error("A tenant with this email already exists.");
      }

      const newUnitId = formData.unitId ? String(formData.unitId) : undefined;

      if (editingTenant) {
        const oldUnitId = editingTenant.unitId ? String(editingTenant.unitId) : undefined;

        await updateTenant(editingTenant.id, {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          rentDueDate: Number(formData.rentDueDate),
          depositPaid: Number(formData.depositPaid ?? 0),
          notes: formData.notes ?? "",
          unitId: newUnitId === undefined ? null : newUnitId,
        } as any);

        // Reassign units safely
        if (oldUnitId !== newUnitId) {
          if (oldUnitId) await updateUnit(oldUnitId, { tenantId: null, status: "vacant" });
          if (newUnitId) await updateUnit(newUnitId, { tenantId: editingTenant.id, status: "occupied" });
        }

        toast.success("Tenant updated successfully");
        setEditingTenant(null);
        setIsAddOpen(false);
        resetForm();
        return;
      }

      // CREATE TENANT
      const createdTenant = await addTenant({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        unitId: newUnitId,
        rentDueDate: Number(formData.rentDueDate),
        rentPaid: false,
        lastPaymentDate: null,
      });

      if (newUnitId && createdTenant?.id) {
        await updateUnit(newUnitId, { tenantId: createdTenant.id, status: "occupied" });
      }

      toast.success("Tenant added");
      setIsAddOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("handleSubmit error", err);
      toast.error(err?.message || "Failed to save tenant");
    }
  };

  const handleEdit = (tenant: TenantType) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone ?? "",
      unitId: tenant.unitId ? String(tenant.unitId) : "",
      rentDueDate: tenant.rentDueDate?.toString() || "1",
      depositPaid: ((tenant as any).depositPaid ?? 0).toString(),
      notes: ((tenant as any).notes ?? ""),
    });
    setIsAddOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const tenant = tenants.find((t) => t.id === id);
      if (tenant?.unitId) await updateUnit(String(tenant.unitId), { tenantId: null, status: "vacant" });
      await deleteTenant(id);
      toast.success("Tenant removed");
    } catch (err) {
      console.error("handleDelete error", err);
      toast.error("Failed to remove tenant");
    }
  };

  const handleMarkPaid = async (tenant: TenantType) => {
    try {
      const unit = units.find((u) => u.id === tenant.unitId);
      if (!unit) return toast.error("Unit not found");
      await markRentPaid(tenant.id, unit.rentAmount);
      toast.success("Rent marked as paid");
    } catch (err) {
      console.error("handleMarkPaid error", err);
      toast.error("Failed to mark rent paid");
    }
  };

  const handleExportTenants = () => {
    const data = filteredTenants.map((tenant) => {
      const unit = units.find((u) => u.id === tenant.unitId);
      return {
        Name: tenant.name,
        Email: tenant.email,
        Phone: tenant.phone,
        Unit: unit?.unitNumber || "N/A",
        Type: unit?.type || "N/A",
        Rent: unit?.rentAmount?.toFixed?.(2) ?? "0.00",
        Due: `Day ${tenant.rentDueDate}`,
        Status: tenant.rentPaid ? "Paid" : "Unpaid",
        "Last Payment": tenant.lastPaymentDate
          ? new Date(tenant.lastPaymentDate).toLocaleDateString()
          : "N/A",
      };
    });
    downloadCSV(data, "tenant_list");
    toast.success("Exported successfully");
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header & Add */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Tenants</h2>
            <p className="text-muted-foreground">Manage tenants and rent payments</p>
          </div>

          <div className="flex gap-2">
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {editingTenant ? "Edit Tenant" : "Add Tenant"}
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTenant ? "Edit Tenant" : "Add Tenant"}</DialogTitle>
                  <DialogDescription>
                    {editingTenant ? "Update tenant details." : "Fill in tenant details."}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name, Email, Phone */}
                  <div><Label>Name</Label><Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                  <div><Label>Email</Label><Input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
                  <div><Label>Phone</Label><Input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>

                  {/* Assign Unit */}
                  <div>
                    <Label>Assign Unit</Label>
                    <Select
                      value={formData.unitId || "unassigned"}
                      onValueChange={(v) =>
                        setFormData({ ...formData, unitId: v === "unassigned" ? "" : String(v) })
                      }
                    >
                      <SelectTrigger><SelectValue placeholder="Select a unit" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {sortedUnits.map((u) => {
                          const isOccupied = u.status === "occupied";
                          const isCurrentTenantUnit = u.id === formData.unitId;
                          return (
                            <SelectItem
                              key={u.id}
                              value={String(u.id)}
                              disabled={isOccupied && !isCurrentTenantUnit}
                            >
                              Unit {u.unitNumber} — {u.type} {isOccupied && !isCurrentTenantUnit ? "(occupied)" : "(vacant)"}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rent Due Day */}
                  <div>
                    <Label>Rent Due Day</Label>
                    <Select value={formData.rentDueDate} onValueChange={(v) => setFormData({ ...formData, rentDueDate: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => <SelectItem key={i} value={(i+1).toString()}>Day {i+1}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Deposit & Notes */}
                  <div><Label>Deposit Paid ($)</Label><Input type="number" value={formData.depositPaid} onChange={(e) => setFormData({ ...formData, depositPaid: e.target.value })} /></div>
                  <div><Label>Notes</Label><Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>

                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1" type="submit">{editingTenant ? "Save Changes" : "Add Tenant"}</Button>
                    <Button type="button" variant="outline" className="flex-1" onClick={() => { resetForm(); setEditingTenant(null); setIsAddOpen(false); }}>Cancel</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={handleExportTenants}>
              <Download className="h-4 w-4 mr-2" />Export CSV
            </Button>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email, phone..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as "all" | "paid" | "unpaid")}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tenant Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTenants.map((tenant) => {
            const unit = units.find((u) => u.id === tenant.unitId);
            return (
              <Card key={tenant.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{tenant.name}</CardTitle>
                      <CardDescription>{unit ? `Unit ${unit.unitNumber}` : "No unit assigned"}</CardDescription>
                    </div>
                    <Badge variant={tenant.rentPaid ? "default" : "destructive"}>
                      {tenant.rentPaid ? "Paid" : "Unpaid"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Contact</p>
                      <p className="text-sm">{tenant.email}</p>
                      <p className="text-sm">{tenant.phone}</p>
                    </div>

                    {unit && (
                      <div>
                        <p className="text-sm text-muted-foreground">Rent</p>
                        <p className="text-sm">${unit.rentAmount?.toFixed?.(2)}</p>
                        <p className="text-sm">Due: Day {tenant.rentDueDate}</p>
                      </div>
                    )}

                    {tenant.lastPaymentDate && (
                      <div>
                        <p className="text-sm text-muted-foreground">Last Payment</p>
                        <p className="text-sm">{new Date(tenant.lastPaymentDate).toLocaleDateString()}</p>
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap pt-2">
                      {!tenant.rentPaid && unit && (
                        <>
                          <EmailReminderDialog tenant={tenant} unit={unit} />
                          <Button size="sm" className="flex-1" onClick={() => handleMarkPaid(tenant)}>
                            <CheckCircle className="h-3 w-3 mr-1" /> Mark Paid
                          </Button>
                        </>
                      )}

                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(tenant)}>
                        <Pencil className="h-3 w-3 mr-1" /> Edit
                      </Button>

                      <Button size="sm" variant="destructive" onClick={() => handleDelete(tenant.id)}>
                        <Trash2 className="h-3 w-3 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTenants.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">No tenants found.</CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Tenants;
