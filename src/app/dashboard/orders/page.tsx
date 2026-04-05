"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Eye,
  Trash2,
  Edit2,
  X,
  ShoppingBag,
  Loader2,
  Package,
} from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
  productId: string;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Order {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  amount: number;
  order_status: "pending" | "dispatched" | "fulfilled";
  payment_status: "pending" | "failed" | "completed";
  delivery_date: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getOrderStatusColor(status: string) {
  switch (status) {
    case "fulfilled":
      return "bg-green-100 text-green-800";
    case "dispatched":
      return "bg-blue-100 text-blue-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getPaymentStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// ── Items Modal ───────────────────────────────────────────────────────────────
function OrderItemsModal({
  order,
  productMap,
  onClose,
}: {
  order: Order;
  productMap: Map<string, Product>;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const totalItems = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-xl">
              <ShoppingBag className="text-green-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Order Items
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {order.name} · {totalItems} item{totalItems !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 -mt-1 -mr-1"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Items Table */}
        <div className="p-6 space-y-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Product
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wide text-center">
                  Qty
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wide text-right">
                  Subtotal
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item, i) => {
                const product = productMap.get(item.productId);
                const subtotal = product ? product.price * item.quantity : null;
                return (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-100 rounded-lg">
                          <Package size={14} className="text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {product?.name ?? "Unknown Product"}
                          </p>
                          {product?.price && (
                            <p className="text-xs text-gray-400">
                              KES {product.price.toLocaleString()} each
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-semibold text-gray-900">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-gray-900">
                      {subtotal != null
                        ? `KES ${subtotal.toLocaleString()}`
                        : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Total */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-600">Order Total</p>
            <p className="text-lg font-bold text-gray-900">
              KES {(order.amount ?? 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Edit Order Modal ──────────────────────────────────────────────────────────
function EditOrderModal({
  order,
  onClose,
  onSave,
}: {
  order: Order;
  onClose: () => void;
  onSave: (id: string, values: Partial<Order>) => Promise<void>;
}) {
  const [values, setValues] = useState({
    name: order.name,
    email: order.email,
    phone: order.phone ?? "",
    order_status: order.order_status,
    payment_status: order.payment_status,
    delivery_date: order.delivery_date ? order.delivery_date.slice(0, 10) : "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(order.id, {
      ...values,
      phone: values.phone || null,
      delivery_date: values.delivery_date
        ? new Date(values.delivery_date).toISOString()
        : null,
    });
    setIsSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Edit2 className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Edit Order
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {order.id.slice(0, 8)}...
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Customer Name
            </label>
            <Input
              value={values.name}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
              disabled={isSaving}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              type="email"
              value={values.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              disabled={isSaving}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <Input
              value={values.phone}
              onChange={(e) => setValues({ ...values, phone: e.target.value })}
              disabled={isSaving}
              placeholder="Optional"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Order Status
            </label>
            <select
              value={values.order_status}
              onChange={(e) =>
                setValues({
                  ...values,
                  order_status: e.target.value as Order["order_status"],
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              disabled={isSaving}
            >
              <option value="pending">Pending</option>
              <option value="dispatched">Dispatched</option>
              <option value="fulfilled">Fulfilled</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Payment Status
            </label>
            <select
              value={values.payment_status}
              onChange={(e) =>
                setValues({
                  ...values,
                  payment_status: e.target.value as Order["payment_status"],
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              disabled={isSaving}
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Delivery Date
            </label>
            <Input
              type="date"
              value={values.delivery_date}
              onChange={(e) =>
                setValues({ ...values, delivery_date: e.target.value })
              }
              disabled={isSaving}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productMap, setProductMap] = useState<Map<string, Product>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/products"),
      ]);

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders ?? []);
      } else {
        toast.error("Failed to load orders.");
      }

      if (productsRes.ok) {
        const data = await productsRes.json();
        const map = new Map<string, Product>();
        (data.products ?? []).forEach((p: Product) => map.set(p.id, p));
        setProductMap(map);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (id: string, values: Partial<Order>) => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to update order.");
        return;
      }
      setOrders(orders.map((o) => (o.id === id ? { ...o, ...values } : o)));
      setEditingOrder(null);
      toast.success("Order updated successfully!");
    } catch (error) {
      console.error("Failed to update order:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      const response = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to delete order.");
        return;
      }
      setOrders(orders.filter((o) => o.id !== id));
      toast.success("Order deleted successfully.");
    } catch (error) {
      console.error("Failed to delete order:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Orders</h1>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-8 text-center text-gray-600">No orders found</Card>
      ) : (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-semibold text-gray-700">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="px-6 font-semibold text-gray-900">
                    Customer
                  </TableHead>
                  <TableHead className="px-6 font-semibold text-gray-900">
                    Phone
                  </TableHead>
                  <TableHead className="px-6 font-semibold text-gray-900">
                    Amount
                  </TableHead>
                  <TableHead className="px-6 font-semibold text-gray-900">
                    Order Status
                  </TableHead>
                  <TableHead className="px-6 font-semibold text-gray-900">
                    Payment
                  </TableHead>
                  <TableHead className="px-6 font-semibold text-gray-900">
                    Date
                  </TableHead>
                  <TableHead className="px-6 font-semibold text-gray-900 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Customer */}
                    <TableCell className="px-6 py-4">
                      <p className="font-medium text-gray-900">{order.name}</p>
                      <p className="text-sm text-gray-500">{order.email}</p>
                    </TableCell>

                    {/* Phone */}
                    <TableCell className="px-6 py-4 text-sm text-gray-600">
                      {order.phone ?? "—"}
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="px-6 py-4 font-semibold text-gray-900">
                      KES {(order.amount ?? 0).toLocaleString()}
                    </TableCell>

                    {/* Order Status */}
                    <TableCell className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.order_status)}`}
                      >
                        {order.order_status}
                      </span>
                    </TableCell>

                    {/* Payment Status */}
                    <TableCell className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}
                      >
                        {order.payment_status}
                      </span>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* 👁 View items */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingOrder(order)}
                          className="text-gray-500 hover:text-gray-700"
                          title="View items"
                        >
                          <Eye size={16} />
                        </Button>
                        {/* ✏ Edit */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingOrder(order)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Edit order"
                        >
                          <Edit2 size={16} />
                        </Button>
                        {/* 🗑 Delete */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(order.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete order"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Items popup modal */}
      {viewingOrder && (
        <OrderItemsModal
          order={viewingOrder}
          productMap={productMap}
          onClose={() => setViewingOrder(null)}
        />
      )}

      {/* Edit modal */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
