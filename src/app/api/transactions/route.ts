import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    let query = supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: transactions, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      transactions: transactions || [],
    });
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { order_id, amount, payment_method, mpesa_request_id } = body;

    if (!order_id || !amount || !payment_method) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { data: transaction, error } = await supabase
      .from("transactions")
      .insert([
        {
          order_id,
          amount,
          payment_method,
          status: "pending",
          mpesa_request_id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 },
    );
  }
}
