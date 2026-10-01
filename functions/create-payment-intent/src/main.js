import Stripe from "stripe";

export default async ({ req, res, error }) => {
  // createExecution from a signed-in client sets this header
  const userId = req.headers["x-appwrite-user-id"];
  if (!userId) return res.json({ error: "Unauthorized" }, 401);

  const { amount } = req.bodyJson ?? {};

  // Amount is in cents; Stripe's minimum charge is 50 cents
  if (!Number.isInteger(amount) || amount < 50) {
    return res.json({ error: "Invalid amount" }, 400);
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: { userId },
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (e) {
    error(e.message);
    return res.json({ error: "Could not start the payment." }, 500);
  }
};
