"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Edit2, Trash2, Plus, ToggleLeft } from "lucide-react";

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
  const [showForm, setShowForm] = useState(false);
  const [newOffer, setNewOffer] = useState({
    product_id: "",
    discount_percentage: "",
    valid_from: "",
    valid_to: "",
  });

  useEffect(() => {
    fetchOffersAndProducts();
  }, []);

  const fetchOffersAndProducts = async () => {
    try {
      const [offersResponse, productsResponse] = await Promise.all([
        fetch("/api/offers"),
        fetch("/api/products"),
      ]);

      if (offersResponse.ok) {
        const data = await offersResponse.json();
        setOffers(data.offers);
      }

      if (productsResponse.ok) {
        const data = await productsResponse.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newOffer,
          discount_percentage: parseFloat(newOffer.discount_percentage),
        }),
      });

      if (response.ok) {
        const offer = await response.json();
        const product = products.find((p) => p.id === newOffer.product_id);
        setOffers([{ ...offer, product }, ...offers]);
        setNewOffer({
          product_id: "",
          discount_percentage: "",
          valid_from: "",
          valid_to: "",
        });
        setShowForm(false);
      }
    } catch (error) {
      console.error("Failed to add offer:", error);
    }
  };

  const handleToggleActive = async (
    offerId: string,
    currentActive: boolean,
  ) => {
    try {
      const response = await fetch(`/api/offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (response.ok) {
        setOffers(
          offers.map((o) =>
            o.id === offerId ? { ...o, active: !currentActive } : o,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to toggle offer:", error);
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm("Are you sure?")) return;

    try {
      const response = await fetch(`/api/offers/${offerId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setOffers(offers.filter((o) => o.id !== offerId));
      }
    } catch (error) {
      console.error("Failed to delete offer:", error);
    }
  };

  const activeOffers = offers.filter((o) => o.active);
  const discountTotal = activeOffers.reduce(
    (sum, o) => sum + o.discount_percentage,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Special Offers</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus size={18} className="mr-2" />
          Create Offer
        </Button>
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

      {showForm && (
        <Card className="p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Create New Offer
          </h2>
          <form onSubmit={handleAddOffer} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product *
                </label>
                <select
                  value={newOffer.product_id}
                  onChange={(e) =>
                    setNewOffer({ ...newOffer, product_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
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
                  value={newOffer.discount_percentage}
                  onChange={(e) =>
                    setNewOffer({
                      ...newOffer,
                      discount_percentage: e.target.value,
                    })
                  }
                  placeholder="e.g. 10"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid From *
                </label>
                <Input
                  type="datetime-local"
                  value={newOffer.valid_from}
                  onChange={(e) =>
                    setNewOffer({ ...newOffer, valid_from: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid To *
                </label>
                <Input
                  type="datetime-local"
                  value={newOffer.valid_to}
                  onChange={(e) =>
                    setNewOffer({ ...newOffer, valid_to: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Create Offer
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-8">Loading offers...</div>
      ) : offers.length === 0 ? (
        <Card className="p-8 text-center text-gray-600">
          No offers created yet. Create your first offer!
        </Card>
      ) : (
        <Card className="overflow-hidden">
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
                <tr key={offer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {offer.product?.name || "Unknown"}
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
                          offer.active ? "text-green-600" : "text-gray-600"
                        }
                      >
                        <ToggleLeft size={18} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit2 size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleDeleteOffer(offer.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
