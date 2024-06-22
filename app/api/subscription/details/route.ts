import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prismadb from '@/lib/prismadb';
import { auth } from '@clerk/nextjs';

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userSubscription = await prismadb.userSubscription.findUnique({
      where: { userId },
    });

    if (!userSubscription || !userSubscription.stripeCustomerId || !userSubscription.stripeSubscriptionId) {
      return NextResponse.json({ error: 'Subscription not found or invalid' }, { status: 404 });
    }

    const stripeCustomer = await stripe.customers.retrieve(userSubscription.stripeCustomerId);
    const stripeSubscription = await stripe.subscriptions.retrieve(userSubscription.stripeSubscriptionId);

    return NextResponse.json({ customer: stripeCustomer, subscription: stripeSubscription }, { status: 200 });
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
