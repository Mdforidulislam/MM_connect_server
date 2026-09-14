import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2023-10-16',
});

export class SuscriptionStripe {
  constructor() {}

  /**
   * creae subscriptionPlan + price
   */
  async createSubscriptionPlan(data: {
    name: string;
    discription?: string;
    amount: number;
    interval: 'month' | 'year';
    currency?: string;
    matadata?: any;
  }): Promise<{productId: string; priceId: string}> {
    const { name, amount, interval, currency = 'usd' , discription } = data;

    // 1. Create Product
    const product = await stripe.products.create({
      name,
      description: discription ? discription : '',
      metadata: { ...data.matadata },
    });

    const price = await stripe.prices.create({
                unit_amount: amount * 100,
                currency: currency,
                recurring: { interval: interval },
                product: product?.id,
                metadata: {
                    ...data.matadata 
                }
    });


    return {
      productId: product.id,
      priceId: price.id
    };
  };


 async updateSubscriptionPlan(data: {
  oldPriceId: string;
  name?: string;
  description?: string;
  amount?: number;
  interval?: 'month' | 'year';
  currency?: string;
  metadata?: Record<string, any>;
}) {
  const {
    oldPriceId,
    name,
    description,
    amount,
    interval = 'month', 
    currency = 'usd',   
    metadata = {},      
  } = data;


  try {
 
    const price = await stripe.prices.retrieve(oldPriceId);
    const productId = typeof price.product === 'string' ? price.product : price.product.id;


    // Sanitize metadata
      const sanitizedMetadata: Record<string, string> = {};
      for (const key in metadata) {
        const value = metadata[key];
        sanitizedMetadata[key] = typeof value === 'string' ? value : JSON.stringify(value);
      }

    // STEP 2: Update product
    const updatePayload: Stripe.ProductUpdateParams = {
      ...(name && { name }),
      ...(description && { description }),
      ...(Object.keys(sanitizedMetadata).length > 0 && { metadata: sanitizedMetadata }),
    };

    const updatedProduct = await stripe.products.update(productId, updatePayload);

    let newPriceId: string | undefined = undefined;
    let oldPriceArchived = false;

    // STEP 3: Create new price if amount provided
    if (amount) {
     const newPrice = await stripe.prices.create({
            unit_amount: Math.round(amount * 100),
            currency,
            recurring: { interval },
            product: productId,
            ...(Object.keys(sanitizedMetadata).length > 0 && { metadata: sanitizedMetadata }),
      });

      newPriceId = newPrice.id;

      // STEP 4: Archive old price
      await stripe.prices.update(oldPriceId, { active: false });
      oldPriceArchived = true;
    }

    return {
      productId,
      newPriceId,
      oldPriceArchived,
      updatedProduct,
    };
  } catch (error: any) {
    console.error(' Stripe API error:', error.message);
    if (error?.raw) {
      console.error('Error details:', {
        type: error.raw.type,
        param: error.raw.param,
        code: error.raw.code,
        message: error.raw.message,
      });
    }
    throw new Error('Stripe updateSubscriptionPlan failed');
  }
}


/**
 * Delete subscriptionPlan 
 * @param productId 
 * @param priceId 
 * @returns true
 * 
 **/

    async deleteSubscriptionPlan (productId: string, priceId: string){
        await stripe.products.update(productId,{active:false});
        await stripe.prices.update(productId,{active: false});

        return {delete: true}
    }


  /**
    * Create a customer + subscription (for new user)
   */

  async createSubscription(data: {
    email: string;
    name?: string;
    phone?: string;
    description?: string;
    priceId: string;
    metadata?: any;
    subscriptionType?: "sesstion" | "subscription";
  }) {
    const { email, name, priceId, phone , description ,  metadata ,subscriptionType = "sesstion"} = data;

   //  create customer and subscription
    const customer = await stripe.customers.create({
      email,
      name,
      phone,
      description:  description ? description : 'Pro Plan Subscriber',
      metadata: { ...metadata},
    });


    function sanitizeMetadata(data: any): Record<string, string> {
         const safe: Record<string, string> = {};

          if (data && typeof data === 'object') {
            for (const key in data) {
              const value = data[key];
              safe[key] = typeof value === 'string' ? value : JSON.stringify(value);
            }
          };
          return safe;
    }

    if(subscriptionType === "sesstion") {
      const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:3000/cancel`,
            customer: customer?.id,
            client_reference_id: priceId,
            allow_promotion_codes: true,
            subscription_data: {
                metadata: {
                  ...metadata
                }
            },
            metadata: {
              ...metadata
            }
    });

    return {
      sessionId: session.id,
      customerId: customer.id,
      sessionUrl: session.url
    };
    } 
    
  }


  /**
   * Update subscriptionPlan 
   */

    async updateSubscription(data: {
    subscriptionId?: string;
    newPriceId: string;
    customerId: string
  }) {

    const { subscriptionId } = data;
    const latesSubsription = await stripe.subscriptions.retrieve(subscriptionId);
    if(!latesSubsription) {
      return {message:"Your subscritipon not availbe"}
    }

    const sesstion = await stripe.billingPortal.sessions.create({
      customer: latesSubsription.customer as string,
      return_url: ""
    })

    return {
     renualURL:  sesstion.url
    }
  }



  /**
   *  Cancel an existing subscription
   */

  async cancelSubscription(data: { subscriptionId: string }) {

    const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(data.subscriptionId);
    const currentPeriodStart: number = subscription.created;
    const priceId: string = subscription.items.data[0].price.id;
    const price: Stripe.Price = await stripe.prices.retrieve(priceId);
    const amountPaid: number = price.unit_amount;

    // Cancel subscription
    const canceled: Stripe.Subscription = await stripe.subscriptions.cancel(data.subscriptionId);

    let refundDetails: { refundId: string; amount: number; status: string } | null = null;
    
    if (refundDetails) {
      const totalDays = 30;
      const startDate = new Date(currentPeriodStart * 1000);
      const today = new Date();
      const daysUsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = totalDays - daysUsed;
      const refundAmount = Math.round((amountPaid / totalDays) * daysRemaining);

      if (refundAmount > 0) {
        const latestInvoiceId = typeof subscription.latest_invoice === 'string'
          ? subscription.latest_invoice
          : subscription.latest_invoice?.id;

        if (!latestInvoiceId) {
          throw new Error('No latest invoice found for subscription');
        }

        const refund: Stripe.Refund = await stripe.refunds.create({
          amount: refundAmount,
          charge: latestInvoiceId,
        });

        refundDetails = {
          refundId: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
        };
      }
    }
  }
 



}
