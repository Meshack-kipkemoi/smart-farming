"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import EditInventoryModal from "@/app/dashboard/inventory/EditInventoryModal";
interface Product {
  id: string;
  name: string;
  stock_quantity: number;
  low_stock_threshold: number;
  price: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      } else {
        toast.error("Failed to load inventory.");
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load inventory. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (
    productId: string,
    values: { stock_quantity: number; low_stock_threshold: number },
  ) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to update inventory.");
        return;
      }

      const productName = products.find((p) => p.id === productId)?.name;
      setProducts(
        products.map((p) => (p.id === productId ? { ...p, ...values } : p)),
      );
      setEditingProduct(null);
      toast.success(`${productName ?? "Product"} updated successfully!`);
    } catch (error) {
      console.error("Failed to update inventory:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const lowStockProducts = products.filter(
    (p) => p.stock_quantity < p.low_stock_threshold,
  );

  const totalValue = products.reduce(
    (sum, p) => sum + p.stock_quantity * p.price,
    0,
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-gray-600 text-sm font-medium">Total Products</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {products.length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm font-medium">Low Stock Items</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {lowStockProducts.length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm font-medium">
            Total Inventory Value
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            KES {totalValue.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <Card className="p-6 bg-orange-50 border border-orange-200">
          <div className="flex items-start gap-4">
            <AlertTriangle
              className="text-orange-600 flex-shrink-0 mt-1"
              size={24}
            />
            <div>
              <h2 className="font-semibold text-orange-900">Low Stock Alert</h2>
              <p className="text-orange-800 text-sm mt-1">
                {lowStockProducts.length} product(s) are below the low stock
                threshold:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-orange-800">
                {lowStockProducts.map((p) => (
                  <li key={p.id}>
                    • {p.name} — {p.stock_quantity} units (threshold:{" "}
                    {p.low_stock_threshold})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">
            Loading inventory...
          </span>
        </div>
      ) : products.length === 0 ? (
        <Card className="p-8 text-center text-gray-600">
          No products in inventory
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Low Stock Threshold
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Value (KES)
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
                {products.map((product) => {
                  const isLowStock =
                    product.stock_quantity < product.low_stock_threshold;
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {product.stock_quantity}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {product.low_stock_threshold}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        KES{" "}
                        {(
                          product.stock_quantity * product.price
                        ).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            isLowStock
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {isLowStock ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingProduct(product)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit2 size={16} className="mr-1.5" />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit Modal — rendered at root level so it overlays everything */}
      {editingProduct && (
        <EditInventoryModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
