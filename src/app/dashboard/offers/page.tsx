"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Loader2,
  Edit2,
  Trash2,
  Tag,
  ToggleLeft,
  ToggleRight,
  Percent,
  CalendarRange,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Offer {
  id: string;
  product_id: string;
  product?: Product;
  discount_percentage: number;
  valid_from: string;
  valid_to: string;
  active: boolean;
}

const EMPTY_CREATE = {
  product_id: "",
  discount_percentage: "",
  valid_from: "",
  valid_to: "",
};

const EMPTY_EDIT = {
  product_id: "",
  discount_percentage: "",
  valid_from: "",
  valid_to: "",
  active: true,
};

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  sub,
  icon,
  accent,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">
              {value}
            </p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className={`p-2.5 rounded-xl ${accent}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Offer form (shared for create + edit) ────────────────────────────────────
function OfferForm({
  title,
  form,
  setForm,
  products,
  isSubmitting,
  showActive,
  onSubmit,
  onCancel,
  submitLabel,
  accentClass,
}: {
  title: string;
  form: typeof EMPTY_EDIT;
  setForm: (f: typeof EMPTY_EDIT) => void;
  products: Product[];
  isSubmitting: boolean;
  showActive: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitLabel: string;
  accentClass: string;
}) {
  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4 pt-2">
        {/* Product */}
        <div className="space-y-1.5">
          <Label>Product *</Label>
          <Select
            value={form.product_id}
            onValueChange={(v) => setForm({ ...form, product_id: v })}
            disabled={isSubmitting}
            required
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} — KSh {p.price.toLocaleString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Discount */}
        <div className="space-y-1.5">
          <Label>Discount % *</Label>
          <div className="relative">
            <Input
              type="number"
              value={form.discount_percentage}
              onChange={(e) =>
                setForm({ ...form, discount_percentage: e.target.value })
              }
              placeholder="e.g. 15"
              step="0.01"
              min="0"
              max="100"
              required
              disabled={isSubmitting}
              className="pr-10"
            />
            <Percent
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Valid From *</Label>
            <Input
              type="datetime-local"
              value={form.valid_from}
              onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Valid To *</Label>
            <Input
              type="datetime-local"
              value={form.valid_to}
              onChange={(e) => setForm({ ...form, valid_to: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Active toggle — only in edit mode */}
        {showActive && (
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <Switch
              id="active-toggle"
              checked={form.active}
              onCheckedChange={(v) => setForm({ ...form, active: v })}
              disabled={isSubmitting}
            />
            <Label htmlFor="active-toggle" className="cursor-pointer">
              Mark as{" "}
              <span
                className={
                  form.active ? "text-green-600 font-semibold" : "text-gray-500"
                }
              >
                {form.active ? "Active" : "Inactive"}
              </span>
            </Label>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-11"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className={`flex-1 h-11 ${accentClass}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  const [createForm, setCreateForm] = useState(EMPTY_EDIT);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);

  useEffect(() => {
    fetchOffersAndProducts();
  }, []);

  const fetchOffersAndProducts = async () => {
    try {
      const [offersRes, productsRes] = await Promise.all([
        fetch("/api/offers"),
        fetch("/api/products"),
      ]);
      if (offersRes.ok) setOffers((await offersRes.json()).offers || []);
      if (productsRes.ok)
        setProducts((await productsRes.json()).products || []);
    } catch {
      toast.error("Failed to load offers. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  };

  // CREATE
  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createForm,
          discount_percentage: parseFloat(createForm.discount_percentage),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create offer.");
        return;
      }
      setOffers([data, ...offers]);
      setCreateForm(EMPTY_EDIT);
      setShowCreateDialog(false);
      toast.success("Offer created successfully!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // EDIT click
  const handleEditClick = (offer: Offer) => {
    setEditingOffer(offer);
    setEditForm({
      product_id: offer.product_id,
      discount_percentage: offer.discount_percentage.toString(),
      valid_from: offer.valid_from.slice(0, 16),
      valid_to: offer.valid_to.slice(0, 16),
      active: offer.active,
    });
  };

  // UPDATE
  const handleUpdateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/offers/${editingOffer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          discount_percentage: parseFloat(editForm.discount_percentage),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update offer.");
        return;
      }
      setOffers(offers.map((o) => (o.id === data.id ? data : o)));
      setEditingOffer(null);
      toast.success("Offer updated successfully!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // TOGGLE
  const handleToggleActive = async (
    offerId: string,
    currentActive: boolean,
  ) => {
    try {
      const res = await fetch(`/api/offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to toggle offer.");
        return;
      }
      setOffers(offers.map((o) => (o.id === offerId ? data : o)));
      toast.success(
        `Offer marked as ${!currentActive ? "active" : "inactive"}.`,
      );
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  // DELETE
  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    try {
      const res = await fetch(`/api/offers/${offerId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to delete offer.");
        return;
      }
      setOffers(offers.filter((o) => o.id !== offerId));
      toast.success("Offer deleted successfully.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const activeOffers = offers.filter((o) => o.active);
  const discountTotal = activeOffers.reduce(
    (sum, o) => sum + o.discount_percentage,
    0,
  );
  const expiredOffers = offers.filter((o) => new Date(o.valid_to) < new Date());

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading offers...</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Special Offers
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage discounts and promotions
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-green-600 hover:bg-green-700 h-9"
          >
            <Plus size={16} className="mr-2" />
            Create Offer
          </Button>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Offers"
            value={offers.length.toString()}
            sub="All time"
            icon={<Tag size={18} className="text-blue-600" />}
            accent="bg-blue-50"
          />
          <StatCard
            title="Active Offers"
            value={activeOffers.length.toString()}
            sub="Currently running"
            icon={<Sparkles size={18} className="text-green-600" />}
            accent="bg-green-50"
          />
          <StatCard
            title="Total Discount"
            value={`${discountTotal.toFixed(1)}%`}
            sub="Sum across active offers"
            icon={<Percent size={18} className="text-violet-600" />}
            accent="bg-violet-50"
          />
          <StatCard
            title="Expired Offers"
            value={expiredOffers.length.toString()}
            sub="Past valid_to date"
            icon={<CalendarRange size={18} className="text-amber-600" />}
            accent="bg-amber-50"
          />
        </div>

        {/* ── Table ── */}
        {offers.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <Tag size={36} className="mx-auto text-muted-foreground mb-3" />
            <p className="font-medium text-gray-700">No offers yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Create your first offer to start running promotions.
            </p>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(true)}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              <Plus className="mr-2 h-4 w-4" /> Create your first offer
            </Button>
          </Card>
        ) : (
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader className="px-6 py-4 border-b bg-gray-50/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  {offers.length} offer{offers.length !== 1 ? "s" : ""}
                </CardTitle>
                <div className="flex gap-1.5">
                  <Badge
                    variant="outline"
                    className="text-xs bg-green-50 text-green-700 border-green-200"
                  >
                    {activeOffers.length} active
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs bg-gray-50 text-gray-600 border-gray-200"
                  >
                    {offers.length - activeOffers.length} inactive
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/40 hover:bg-gray-50/40">
                    <TableHead className="px-6 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Product
                    </TableHead>
                    <TableHead className="px-6 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Discount
                    </TableHead>
                    <TableHead className="px-6 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Valid From
                    </TableHead>
                    <TableHead className="px-6 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Valid To
                    </TableHead>
                    <TableHead className="px-6 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </TableHead>
                    <TableHead className="px-6 text-xs font-semibold uppercase tracking-wide text-gray-500 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.map((offer) => {
                    const isExpired = new Date(offer.valid_to) < new Date();
                    return (
                      <TableRow
                        key={offer.id}
                        className="hover:bg-gray-50/60 transition-colors group"
                      >
                        {/* Product */}
                        <TableCell className="px-6 py-4 font-medium text-gray-900">
                          {offer.product?.name || "Unknown Product"}
                        </TableCell>

                        {/* Discount */}
                        <TableCell className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className="bg-violet-50 text-violet-700 border-violet-200 font-semibold"
                          >
                            {offer.discount_percentage}% off
                          </Badge>
                        </TableCell>

                        {/* Valid From */}
                        <TableCell className="px-6 py-4 text-sm text-gray-600">
                          {new Date(offer.valid_from).toLocaleDateString(
                            "en-KE",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </TableCell>

                        {/* Valid To */}
                        <TableCell className="px-6 py-4 text-sm text-gray-600">
                          <span className={isExpired ? "text-red-500" : ""}>
                            {new Date(offer.valid_to).toLocaleDateString(
                              "en-KE",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                          {isExpired && (
                            <Badge
                              variant="outline"
                              className="ml-2 text-xs bg-red-50 text-red-600 border-red-200"
                            >
                              Expired
                            </Badge>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className={
                              offer.active
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-gray-100 text-gray-500 border-gray-200"
                            }
                          >
                            {offer.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Toggle */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleToggleActive(offer.id, offer.active)
                                  }
                                  className={`h-8 w-8 ${offer.active ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
                                >
                                  {offer.active ? (
                                    <ToggleRight size={16} />
                                  ) : (
                                    <ToggleLeft size={16} />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {offer.active ? "Deactivate" : "Activate"}
                              </TooltipContent>
                            </Tooltip>

                            {/* Edit */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditClick(offer)}
                                  className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                >
                                  <Edit2 size={14} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>

                            {/* Delete */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteOffer(offer.id)}
                                  className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* ── Create Dialog ── */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <OfferForm
            title="Create New Offer"
            form={createForm}
            setForm={setCreateForm}
            products={products}
            isSubmitting={isSubmitting}
            showActive={false}
            onSubmit={handleAddOffer}
            onCancel={() => setShowCreateDialog(false)}
            submitLabel="Create Offer"
            accentClass="bg-green-600 hover:bg-green-700"
          />
        </Dialog>

        {/* ── Edit Dialog ── */}
        <Dialog
          open={!!editingOffer}
          onOpenChange={(o) => !o && setEditingOffer(null)}
        >
          <OfferForm
            title="Edit Offer"
            form={editForm}
            setForm={setEditForm}
            products={products}
            isSubmitting={isSubmitting}
            showActive={true}
            onSubmit={handleUpdateOffer}
            onCancel={() => setEditingOffer(null)}
            submitLabel="Save Changes"
            accentClass="bg-blue-600 hover:bg-blue-700"
          />
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
