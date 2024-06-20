import { NextResponse } from 'next/server';
import { checkSubscription } from '@/lib/subscription';

export async function GET() {
  const isPro = await checkSubscription();
  return NextResponse.json({ isPro });
}
