"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, AlertTriangle, Loader2, X, Package, Save } from "lucide-react";
import { toast } from "sonner";
interface Product {
  id: string;
  name: string;
  stock_quantity: number;
  low_stock_threshold: number;
  price: number;
}
function EditInventoryModal({
  product,
  onClose,
  onSave,
}: {
  product: Product;
  onClose: () => void;
  onSave: (
    id: string,
    values: { stock_quantity: number; low_stock_threshold: number },
  ) => Promise<void>;
}) {
  const [values, setValues] = useState({
    stock_quantity: product.stock_quantity,
    low_stock_threshold: product.low_stock_threshold,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (values.stock_quantity < 0) {
      toast.error("Stock quantity cannot be negative.");
      return;
    }
    if (values.low_stock_threshold < 0) {
      toast.error("Low stock threshold cannot be negative.");
      return;
    }
    setIsSaving(true);
    await onSave(product.id, values);
    setIsSaving(false);
  };

  const isLowStock = values.stock_quantity < values.low_stock_threshold;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Package className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Edit Inventory
              </h2>
              <p className="text-sm text-gray-500 mt-0.5 max-w-[220px] truncate">
                {product.name}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Stock Quantity */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Stock Quantity
            </label>
            <div className="relative">
              <Input
                type="number"
                value={values.stock_quantity}
                onChange={(e) =>
                  setValues({
                    ...values,
                    stock_quantity: parseInt(e.target.value) || 0,
                  })
                }
                className="pr-16 h-11"
                min="0"
                disabled={isSaving}
                autoFocus
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                units
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Was: {product.stock_quantity} units
            </p>
          </div>

          {/* Low Stock Threshold */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Low Stock Threshold
            </label>
            <div className="relative">
              <Input
                type="number"
                value={values.low_stock_threshold}
                onChange={(e) =>
                  setValues({
                    ...values,
                    low_stock_threshold: parseInt(e.target.value) || 0,
                  })
                }
                className="pr-16 h-11"
                min="0"
                disabled={isSaving}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                units
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Alert triggers when stock falls below this number
            </p>
          </div>

          {/* Live Preview */}
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-2.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Live Preview
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Inventory Value</span>
              <span className="font-semibold text-gray-900">
                KES {(values.stock_quantity * product.price).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Stock Status</span>
              <span
                className={`font-medium ${isLowStock ? "text-red-600" : "text-green-600"}`}
              >
                {isLowStock ? "⚠ Will be Low Stock" : "✓ Will be In Stock"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default EditInventoryModal;
