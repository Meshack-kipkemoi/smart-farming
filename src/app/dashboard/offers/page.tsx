"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Trash2, Plus, ToggleLeft, X, Loader2 } from "lucide-react";
import { toast } from "sonner"; // ✅ Sonner import

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

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  const [createForm, setCreateForm] = useState({
    product_id: "",
    discount_percentage: "",
    valid_from: "",
    valid_to: "",
  });

  const [editForm, setEditForm] = useState({
    product_id: "",
    discount_percentage: "",
    valid_from: "",
    valid_to: "",
    active: true,
  });

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
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load offers. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- CREATE OFFER ---
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

      // ✅ Always parse the response body to get error messages
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create offer.");
        return;
      }

      setOffers([data, ...offers]);
      setCreateForm({
        product_id: "",
        discount_percentage: "",
        valid_from: "",
        valid_to: "",
      });
      setShowCreateForm(false);
      toast.success("Offer created successfully!");
    } catch (error) {
      console.error("Failed to add offer:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- EDIT OFFER ---
  const handleEditClick = (offer: Offer) => {
    setEditingOffer(offer);
    setEditForm({
      product_id: offer.product_id,
      discount_percentage: offer.discount_percentage.toString(),
      valid_from: offer.valid_from.slice(0, 16),
      valid_to: offer.valid_to.slice(0, 16),
      active: offer.active,
    });
    setShowCreateForm(false);
  };

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

      // ✅ Always parse the response body to get error messages
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to update offer.");
        return;
      }

      setOffers(offers.map((o) => (o.id === data.id ? data : o)));
      setEditingOffer(null);
      toast.success("Offer updated successfully!");
    } catch (error) {
      console.error("Failed to update offer:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => setEditingOffer(null);

  // --- TOGGLE ACTIVE ---
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
    } catch (error) {
      console.error("Failed to toggle offer:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  // --- DELETE ---
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
    } catch (error) {
      console.error("Failed to delete offer:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const activeOffers = offers.filter((o) => o.active);
  const discountTotal = activeOffers.reduce(
    (sum, o) => sum + o.discount_percentage,
    0,
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading offers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Special Offers</h1>
        {!editingOffer && (
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus size={18} className="mr-2" />
            {showCreateForm ? "Cancel" : "Create Offer"}
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-gray-600 text-sm font-medium">Total Offers</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {offers.length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm font-medium">Active Offers</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {activeOffers.length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm font-medium">Total Discount %</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {discountTotal.toFixed(1)}%
          </p>
        </Card>
      </div>

      {/* --- CREATE FORM --- */}
      {showCreateForm && (
        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-green-900">
              Create New Offer
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowCreateForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleAddOffer}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product *
                </label>
                <select
                  value={createForm.product_id}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, product_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select a product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - KSh {p.price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount % *
                </label>
                <Input
                  type="number"
                  value={createForm.discount_percentage}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      discount_percentage: e.target.value,
                    })
                  }
                  placeholder="e.g. 15"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid From *
                </label>
                <Input
                  type="datetime-local"
                  value={createForm.valid_from}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, valid_from: e.target.value })
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid To *
                </label>
                <Input
                  type="datetime-local"
                  value={createForm.valid_to}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, valid_to: e.target.value })
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
              <CardFooter className="col-span-1 md:col-span-2 px-0 pt-2">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Creating...
                    </>
                  ) : (
                    "Create Offer"
                  )}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      )}

      {/* --- EDIT FORM --- */}
      {editingOffer && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-blue-900">
              Edit Offer
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleUpdateOffer}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product *
                </label>
                <select
                  value={editForm.product_id}
                  onChange={(e) =>
                    setEditForm({ ...editForm, product_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select a product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - KSh {p.price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount % *
                </label>
                <Input
                  type="number"
                  value={editForm.discount_percentage}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      discount_percentage: e.target.value,
                    })
                  }
                  step="0.01"
                  min="0"
                  max="100"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid From *
                </label>
                <Input
                  type="datetime-local"
                  value={editForm.valid_from}
                  onChange={(e) =>
                    setEditForm({ ...editForm, valid_from: e.target.value })
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid To *
                </label>
                <Input
                  type="datetime-local"
                  value={editForm.valid_to}
                  onChange={(e) =>
                    setEditForm({ ...editForm, valid_to: e.target.value })
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex items-center gap-2 col-span-1 md:col-span-2">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={editForm.active}
                  onChange={(e) =>
                    setEditForm({ ...editForm, active: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="edit-active"
                  className="text-sm font-medium text-gray-700"
                >
                  Mark as Active
                </label>
              </div>
              <CardFooter className="col-span-1 md:col-span-2 px-0 pt-2">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Saving...
                    </>
                  ) : (
                    "Update Offer"
                  )}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      )}

      {/* --- OFFERS TABLE --- */}
      {offers.length === 0 ? (
        <Card className="p-8 text-center text-gray-600">
          <p className="mb-2">No offers created yet.</p>
          <Button
            variant="outline"
            onClick={() => setShowCreateForm(true)}
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            <Plus className="mr-2 h-4 w-4" /> Create your first offer
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Valid From
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Valid To
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {offers.map((offer) => (
                  <tr
                    key={offer.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {offer.product?.name || "Unknown Product"}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {offer.discount_percentage}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(offer.valid_from).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(offer.valid_to).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          offer.active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {offer.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleToggleActive(offer.id, offer.active)
                          }
                          className={
                            offer.active
                              ? "text-green-600 hover:text-green-700"
                              : "text-gray-500 hover:text-gray-700"
                          }
                          title="Toggle Active"
                        >
                          <ToggleLeft size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(offer)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
