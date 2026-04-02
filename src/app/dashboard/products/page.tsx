"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Trash2, Plus, X, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  category?: string;
  low_stock_threshold: number;
  created_at: string;
  image_url?: string | null;
}

type FormMode = "add" | "edit" | null;

export default function ProductsPage() {
  const supabase = createClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false); // Track if user wants to delete image

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    category: "",
    low_stock_threshold: "10",
    image_url: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      stock_quantity: "",
      category: "",
      low_stock_threshold: "10",
      image_url: "",
    });
    setImageFile(null);
    setEditingProductId(null);
    setFormMode(null);
    setRemoveImage(false);
  };

  const openAddForm = () => {
    resetForm();
    setFormMode("add");
  };

  const openEditForm = (product: Product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      category: product.category || "",
      low_stock_threshold: product.low_stock_threshold.toString(),
      image_url: product.image_url || "",
    });
    setImageFile(null);
    setRemoveImage(false);
    setFormMode("edit");
  };

  const closeForm = () => {
    resetForm();
  };

  // Helper to extract storage path from Supabase URL
  const getStoragePathFromUrl = (url: string): string | null => {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/");
      const bucketIndex = pathParts.indexOf("product-images");
      if (bucketIndex !== -1 && pathParts[bucketIndex + 1]) {
        return pathParts.slice(bucketIndex + 1).join("/");
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl: string | null = null;

    try {
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`;
        const { error } = await supabase.storage
          .from("product-images")
          .upload(fileName, imageFile);

        if (error) {
          console.error("Upload error:", error);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productForm.name,
          description: productForm.description || null,
          category: productForm.category || null,
          price: parseFloat(productForm.price),
          stock_quantity: parseInt(productForm.stock_quantity),
          low_stock_threshold: parseInt(productForm.low_stock_threshold),
          image_url: imageUrl,
        }),
      });

      if (response.ok) {
        const product = await response.json();
        setProducts([product, ...products]);
        resetForm();
      }
    } catch (error) {
      console.error("Failed to add product:", error);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductId) return;

    try {
      let newImageUrl: string | null = productForm.image_url || null;
      const oldImageUrl = productForm.image_url;
      const BUCKET = "product-images";

      // Case 1: User selected a new image file (replace existing)
      if (imageFile) {
        // Delete old image if exists
        if (oldImageUrl) {
          const oldPath = getStoragePathFromUrl(oldImageUrl);
          if (oldPath) {
            const { error: deleteError } = await supabase.storage
              .from(BUCKET)
              .remove([oldPath]);

            if (deleteError) {
              console.error("Failed to delete old image:", deleteError);
            }
          }
        }

        // Upload new image
        const fileName = `${Date.now()}-${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw uploadError;
        }

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
        newImageUrl = data.publicUrl;
      }
      // Case 2: User clicked "Remove Image" (delete without replacement)
      else if (removeImage && oldImageUrl) {
        const oldPath = getStoragePathFromUrl(oldImageUrl);
        if (oldPath) {
          const { error: deleteError } = await supabase.storage
            .from(BUCKET)
            .remove([oldPath]);

          if (deleteError) {
            console.error("Failed to delete image:", deleteError);
          }
        }
        newImageUrl = null; // Clear the URL
      }
    

      // Send PATCH request
      const response = await fetch(`/api/products/${editingProductId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productForm.name,
          description: productForm.description || null,
          price: Number(productForm.price) || 0,
          stock_quantity: Number(productForm.stock_quantity) || 0,
          category: productForm.category || null,
          low_stock_threshold: Number(productForm.low_stock_threshold) || 0,
          image_url: newImageUrl, // null if removed, new URL if replaced, old URL if unchanged
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update product");
      }

      const updatedProduct = await response.json();

      // Update local state
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProductId ? updatedProduct : p)),
      );

      resetForm();
    } catch (error) {
      console.error("Update product failed:", error);
      alert(
        error instanceof Error ? error.message : "Failed to update product",
      );
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      // Get product to find image
      const product = products.find((p) => p.id === productId);

      // Delete image from storage if exists
      if (product?.image_url) {
        const path = getStoragePathFromUrl(product.image_url);
        if (path) {
          await supabase.storage.from("product-images").remove([path]);
        }
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== productId));
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const handleRemoveImageClick = () => {
    setRemoveImage(true);
    setImageFile(null);
    setProductForm((prev) => ({ ...prev, image_url: "" }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setRemoveImage(false); // Cancel removal if new file selected
    }
  };

  const getLowStockStatus = (product: Product) => {
    if (product.stock_quantity < product.low_stock_threshold) {
      return { color: "text-red-600", label: "Low Stock" };
    }
    return { color: "text-green-600", label: "In Stock" };
  };

  const getFormTitle = () => {
    if (formMode === "add") return "Add New Product";
    if (formMode === "edit") return "Edit Product";
    return "";
  };

  const getSubmitButtonText = () => {
    if (formMode === "add") return "Add Product";
    if (formMode === "edit") return "Update Product";
    return "";
  };

  const handleSubmit =
    formMode === "add" ? handleAddProduct : handleUpdateProduct;

  // Check if we should show current image (editing, has url, not marked for removal, no new file selected)
  const showCurrentImage =
    formMode === "edit" && productForm.image_url && !removeImage && !imageFile;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <Button
          onClick={openAddForm}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus size={18} className="mr-2" />
          Add Product
        </Button>
      </div>

      {/* Add/Edit Form Modal */}
      {formMode && (
        <Card className="p-6 bg-gray-50 border-2 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {getFormTitle()}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeForm}
              className="text-gray-500"
            >
              <X size={20} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Image Preview with Remove Option */}
            {showCurrentImage && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Image
                </label>
                <div className="flex items-start gap-4">
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={productForm.image_url}
                      alt="Current product"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveImageClick}
                    className="mt-0"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Remove Image
                  </Button>
                </div>
              </div>
            )}

            {/* Show message if image was removed but not yet saved */}
            {removeImage && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
                Image will be removed when you click Update Product
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <Input
                  type="text"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  placeholder="e.g. Fresh Tomatoes"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Input
                  type="text"
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm({ ...productForm, category: e.target.value })
                  }
                  placeholder="e.g. Vegetables"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    description: e.target.value,
                  })
                }
                placeholder="Product description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows={3}
              />
            </div>

            {/* File Input - Show if no current image or if replacing */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formMode === "edit" && productForm.image_url
                  ? "Replace Image (optional)"
                  : "Product Image (optional)"}
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={removeImage} // Disable if marked for removal
              />
              {imageFile && (
                <p className="text-sm text-green-600 mt-1">
                  New image selected: {imageFile.name}
                </p>
              )}
              {removeImage && (
                <p className="text-sm text-red-600 mt-1">
                  Current image will be deleted
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (KES) *
                </label>
                <Input
                  type="number"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({ ...productForm, price: e.target.value })
                  }
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock *
                </label>
                <Input
                  type="number"
                  value={productForm.stock_quantity}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      stock_quantity: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Low Stock Alert
                </label>
                <Input
                  type="number"
                  value={productForm.low_stock_threshold}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      low_stock_threshold: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {getSubmitButtonText()}
              </Button>
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Products Table */}
      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : products.length === 0 ? (
        <Card className="p-8 text-center text-gray-600">No products found</Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => {
                const status = getLowStockStatus(product);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <ImageIcon size={20} className="text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {product.name}
                          </p>
                          {product.description && (
                            <p className="text-sm text-gray-500">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {product.category || "-"}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      KES {product.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {product.stock_quantity}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditForm(product)}
                          className="text-blue-600"
                        >
                          <Edit2 size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600"
                        >
                          <Trash2 size={18} />
                        </Button>
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
