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

    if (!userSubscription || !userSubscription.stripeSubscriptionId) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    console.log('Canceling subscription with ID:', userSubscription.stripeSubscriptionId);

    await stripe.subscriptions.cancel(userSubscription.stripeSubscriptionId);

    await prismadb.userSubscription.update({
      where: { userId },
      data: { stripeSubscriptionId: null, stripeCurrentPeriodEnd: null },
    });

    return NextResponse.json({ message: 'Subscription canceled successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
