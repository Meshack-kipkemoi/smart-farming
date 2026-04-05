import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient(); // ✅ initialized per-request, not module-level

    // Get total orders
    const { count: totalOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    // Get total revenue
    const { data: orders } = await supabase
      .from("orders")
      .select("total_amount");

    const totalRevenue =
      orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

    // Get total products
    const { count: totalProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    // Get low stock items
    const { data: lowStockProducts } = await supabase
      .from("products")
      .select("id")
      .lt("stock_quantity", "low_stock_threshold");

    const lowStockCount = lowStockProducts?.length || 0;

    // Generate sample revenue data (last 7 days)
    const revenueData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        amount: Math.floor(Math.random() * 50000) + 20000,
      };
    }).reverse();

    // Generate sample order data (last 7 days)
    const orderData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        count: Math.floor(Math.random() * 15) + 5,
      };
    }).reverse();

    return NextResponse.json({
      totalOrders: totalOrders || 0,
      totalRevenue: Math.round(totalRevenue),
      totalProducts: totalProducts || 0,
      lowStockCount,
      revenueData,
      orderData,
    });
  } catch (error) {
    console.error("Failed to fetch metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 },
    );
  }
}
