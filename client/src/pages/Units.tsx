import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useRental } from "@/contexts/RentalContext";
import { useSettings } from "@/contexts/SettingsContext";
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
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Unit } from "@/types/rental";

const Units = () => {
  const { units, addUnit, updateUnit, deleteUnit, tenants } = useRental();
  const { settings } = useSettings();
  const currency = settings.currency;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState({ unitNumber: "", type: "", rentAmount: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "occupied" | "vacant">("all");

  // Reset form
  const resetForm = () => {
    setFormData({ unitNumber: "", type: "", rentAmount: "" });
    setEditingUnit(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rentAmountNum = parseFloat(formData.rentAmount);
    if (isNaN(rentAmountNum) || rentAmountNum < 0) {
      return toast.error("Please enter a valid rent amount");
    }

    try {
      if (editingUnit) {
        await updateUnit(editingUnit.id, {
          unitNumber: formData.unitNumber,
          type: formData.type,
          rentAmount: rentAmountNum,
        });
        toast.success("Unit updated successfully");
      } else {
        await addUnit({
          unitNumber: formData.unitNumber,
          type: formData.type,
          rentAmount: rentAmountNum,
          status: "vacant",
        });
        toast.success("Unit added successfully");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save unit");
    }

    resetForm();
    setIsAddOpen(false);
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData({
      unitNumber: unit.unitNumber ?? "",
      type: unit.type ?? "",
      rentAmount: unit.rentAmount?.toString() ?? "",
    });
    setIsAddOpen(true);
  };

  const handleDelete = async (id: string) => {
    const unit = units.find((u) => u.id === id);
    if (!unit) return toast.error("Unit not found");
    if (unit.status === "occupied") return toast.error("Cannot delete occupied unit.");

    try {
      await deleteUnit(id);
      toast.success("Unit deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete unit");
    }
  };

  const filteredUnits = units
    .filter((unit) => {
      if (filterStatus !== "all" && unit.status !== filterStatus) return false;
      const term = searchTerm.toLowerCase();
      return (
        (unit.unitNumber ?? "").toLowerCase().includes(term) ||
        (unit.type ?? "").toLowerCase().includes(term)
      );
    })
    .sort((a, b) => (a.unitNumber ?? "").localeCompare(b.unitNumber ?? ""));

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header + Add Unit */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Units</h2>
            <p className="text-muted-foreground">Manage your rental properties</p>
          </div>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> {editingUnit ? "Edit Unit" : "Add Unit"}
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingUnit ? "Edit Unit" : "Add New Unit"}</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="unitNumber">Unit Number</Label>
                  <Input
                    id="unitNumber"
                    value={formData.unitNumber}
                    onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="unitType">Unit Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData({ ...formData, type: v })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Studio">Studio</SelectItem>
                      <SelectItem value="1BD">1BD</SelectItem>
                      <SelectItem value="2BD">2BD</SelectItem>
                      <SelectItem value="3BD">3BD</SelectItem>
                      <SelectItem value="Penthouse">Penthouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="rentAmount">Rent Amount ({currency})</Label>
                  <Input
                    id="rentAmount"
                    type="number"
                    value={formData.rentAmount}
                    onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  {editingUnit ? "Update Unit" : "Add Unit"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by unit number or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Units</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="vacant">Vacant</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Units Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUnits.map((unit) => {
            const tenant = tenants.find((t) => t.unitId === unit.id);
            const formattedRent = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency,
            }).format(unit.rentAmount ?? 0);

            return (
              <Card key={unit.id}>
                <CardHeader>
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>Unit {unit.unitNumber ?? "N/A"}</CardTitle>
                      <CardDescription>{unit.type ?? "N/A"}</CardDescription>
                    </div>
                    <Badge variant={unit.status === "occupied" ? "default" : "secondary"}>
                      {unit.status ?? "vacant"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div>
                    <p className="text-sm text-muted-foreground">Rent</p>
                    <p className="text-xl font-bold">{formattedRent}</p>

                    {tenant && (
                      <div>
                        <p className="text-sm text-muted-foreground">Tenant</p>
                        <p className="text-sm font-medium">{tenant.name ?? "N/A"}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(unit)}>
                        <Pencil className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(unit.id)}>
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Units;
