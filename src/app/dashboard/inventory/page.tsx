'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Save, X, AlertTriangle } from 'lucide-react';

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditValues({
      stock_quantity: product.stock_quantity,
      low_stock_threshold: product.low_stock_threshold,
    });
  };

  const handleSave = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      });

      if (response.ok) {
        setProducts(
          products.map((p) =>
            p.id === productId
              ? { ...p, ...editValues }
              : p
          )
        );
        setEditingId(null);
      }
    } catch (error) {
      console.error('Failed to update inventory:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  const lowStockProducts = products.filter(
    (p) => p.stock_quantity < p.low_stock_threshold
  );

  const totalValue = products.reduce(
    (sum, p) => sum + p.stock_quantity * p.price,
    0
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-gray-600 text-sm font-medium">Total Products</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{products.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm font-medium">Low Stock Items</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {lowStockProducts.length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm font-medium">Total Inventory Value</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            KES {totalValue.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <Card className="p-6 bg-orange-50 border border-orange-200">
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-orange-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h2 className="font-semibold text-orange-900">Low Stock Alert</h2>
              <p className="text-orange-800 text-sm mt-1">
                {lowStockProducts.length} product(s) are below the low stock threshold:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-orange-800">
                {lowStockProducts.map((p) => (
                  <li key={p.id}>
                    • {p.name} - {p.stock_quantity} units (threshold: {p.low_stock_threshold})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-8">Loading inventory...</div>
      ) : products.length === 0 ? (
        <Card className="p-8 text-center text-gray-600">
          No products in inventory
        </Card>
      ) : (
        <Card className="overflow-hidden">
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
                const isEditing = editingId === product.id;
                const isLowStock = product.stock_quantity < product.low_stock_threshold;
                const stock = editValues.stock_quantity ?? product.stock_quantity;
                const threshold = editValues.low_stock_threshold ?? product.low_stock_threshold;

                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={stock}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              stock_quantity: parseInt(e.target.value),
                            })
                          }
                          className="w-20"
                        />
                      ) : (
                        <span className="text-gray-900 font-medium">{stock}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={threshold}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              low_stock_threshold: parseInt(e.target.value),
                            })
                          }
                          className="w-20"
                        />
                      ) : (
                        <span className="text-gray-900">{threshold}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      KES {(stock * product.price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          isLowStock
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {isLowStock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSave(product.id)}
                              className="text-green-600"
                            >
                              <Save size={18} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancel}
                              className="text-gray-600"
                            >
                              <X size={18} />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit2 size={18} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
