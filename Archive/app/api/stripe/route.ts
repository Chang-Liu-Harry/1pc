import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse, NextRequest } from "next/server";
import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

const settingsUrl = absoluteUrl("/settings");

const priceMapping: Record<string, any> = {
 "12_month": {
    currency: "USD",
    product_data: {
      name: "OnepieceAI.Chat Annual Subscription",
      description: "Yearly Access ",
    },
    unit_amount: 7198, // $71.98 for 12 months upfront (5.99 * 12 * 100)
    recurring: {
      interval: "year",
      interval_count: 1,
    },
  },
  "3_month": {
    currency: "USD",
    product_data: {
      name: "OnepieceAI.Chat Quarterly Subscription",
      description: "Quarterly Access ",
    },
    unit_amount: 2997, // $29.97 for 3 months upfront (9.99 * 3 * 100)
    recurring: {
      interval: "month",
      interval_count: 3,
    },
  },
  "1_month": {
    currency: "USD",
    product_data: {
      name: "OnepieceAI.Chat Monthly Subscription",
      description: "Monthly Access ",
    },
    unit_amount: 1299, // $12.99 for 1 month (12.99 * 100)
    recurring: {
      interval: "month",
    },
  },
};

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized: Missing user ID", { status: 401 });
    }

    let user;
    try {
      user = await currentUser();
    } catch (error) {
      console.error("[Clerk] Error fetching current user:", error);
      return new NextResponse("Error fetching current user", { status: 500 });
    }

    if (!user) {
      return new NextResponse("Unauthorized: User not found", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const planId = searchParams.get('planId'); // Get the planId from query parameters

    if (!planId) {
      return new NextResponse("Invalid plan ID", { status: 400 });
    }

    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId,
      },
    });

    if (userSubscription && userSubscription.stripeCustomerId && process.env.NODE_ENV === 'production') {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: settingsUrl,
      });

      return new NextResponse(JSON.stringify({ url: stripeSession.url }));
    }

    const priceData = priceMapping[planId];
    if (!priceData) {
      return new NextResponse("Invalid plan ID", { status: 400 });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: settingsUrl,
      cancel_url: settingsUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: user.emailAddresses[0].emailAddress,
      line_items: [
        {
          price_data: priceData,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
    });

    return new NextResponse(JSON.stringify({ url: stripeSession.url }));
  } catch (error) {
    console.error("[STRIPE] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
