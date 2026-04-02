import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const { data: offers, error } = await supabase
      .from('special_offers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      offers: offers || [],
    });
  } catch (error) {
    console.error('Failed to fetch offers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      product_id,
      discount_percentage,
      valid_from,
      valid_to,
    } = body;

    if (!product_id || !discount_percentage || !valid_from || !valid_to) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: offer, error } = await supabase
      .from('special_offers')
      .insert([
        {
          product_id,
          discount_percentage,
          valid_from,
          valid_to,
          active: true,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    console.error('Failed to create offer:', error);
    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500 }
    );
  }
}
