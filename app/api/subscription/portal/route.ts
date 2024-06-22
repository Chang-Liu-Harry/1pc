import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prismadb from '@/lib/prismadb';
import { auth } from '@clerk/nextjs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userSubscription = await prismadb.userSubscription.findUnique({
      where: { userId },
    });

    if (!userSubscription || !userSubscription.stripeCustomerId) {
      return NextResponse.json({ error: 'Subscription not found or invalid' }, { status: 404 });
    }

    const settingsUrl = `${req.nextUrl.origin}/settings`;

    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: userSubscription.stripeCustomerId,
      return_url: settingsUrl,
    });

    return NextResponse.json({ url: stripeSession.url }, { status: 200 });
  } catch (error) {
    console.error('Error creating Stripe Customer Portal session:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
