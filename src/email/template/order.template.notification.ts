
/**
 * ---------------------------------------------------------
 * Interface for Order Email Parameters both Customer and Admin Template 
 * ---------------------------------------------------------
 */

interface OrderEmailParams {
  customerName?: string;
  customerEmail?: string;
  orderReference?: string;
  applicationName?: string;
  shippingCost?: number;
  productList?: {
    sku: string;
    brand: string;
    description: string;
    quantity: number;
    unitPrice: number;
    currency: string;
    leadTime: string;
  }[];
  supportEmail?: string;
  currency?: string;
  shippmentAddress?: string;
  customerReference?: string
}

/**
 * ---------------------------------------------------------
 * This Email Template use for Sending Oder confirmation to Customer 
 * @param param0 
 * @returns 
 * ---------------------------------------------------------
 */

export const generateOrderConfirmationEmail = ({
  customerName = "Customer",
  shippingCost = 0,
  customerEmail = "your email",
  orderReference = "ORD-REF-0000",
  applicationName = "MMCONNECT B2B",
  productList = [],
  shippmentAddress = "Not Provided",
  supportEmail = "sales@mmengservices.co.uk",
  customerReference = ""
}: OrderEmailParams) => {

  const subject = `Order Request - ${orderReference}`;

  const totalPrice = productList.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);

  // Plain text version
  const textProducts = productList.map(p =>
    `${p.brand} | ${p.description} | SKU: ${p.sku} | Qty: ${p.quantity} | Unit: ${p.unitPrice.toFixed(2)} ${p.currency} | Lead Time: ${p.leadTime ?? 'N/A'}`
  ).join('\n');

  const text = `
    Hello ${customerName},

    Thank you for your order request (${orderReference}).

    Note: Our sales team will review your request and send an official order confirmation within 24-48 hours.
    Please note that pricing and lead times are subject to verification and may be updated in your final order confirmation.

    Products:
    ${textProducts}

    Total Price: ${totalPrice.toFixed(2)} USD

    If you have any questions, contact us at ${supportEmail}.

    Best regards,
    ${applicationName} Team
  `;

  // HTML version
  const htmlProducts = productList.map((p, i) => `
    <tr style="background-color:${i % 2 === 0 ? '#f9f9f9' : '#fff'}">
      <td style="padding:8px; border:1px solid #ddd;">${p.brand}</td>
      <td style="padding:8px; border:1px solid #ddd;">${p.sku}</td>
      <td style="padding:8px; border:1px solid #ddd; text-align:center;">${p.quantity}</td>
      <td style="padding:8px; border:1px solid #ddd; text-align:right;">${p.unitPrice.toFixed(2)} ${p.currency}</td>
      <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:bold; color:#2E7D32;">
        ${p.leadTime ?? 'N/A'}
      </td>
      <td style="padding:8px; border:1px solid #ddd; text-align:right;">${(p.quantity * p.unitPrice).toFixed(2)} ${p.currency}</td>
    </tr>
  `).join('');

  const html = `
<div style="font-family: Arial, sans-serif; max-width:700px; margin:auto; padding:20px; border:1px solid #e0e0e0; border-radius:10px; background-color:#fafafa;">

  <!-- Title: Order REQUEST -->
  <h2 style="color:#2E7D32; margin-bottom:10px;">
    ORDER REQUEST
  </h2>

  <p style="font-size:16px;">Hi <strong>${customerName}</strong>,</p>
  <p style="font-size:16px;">PO Ref: (<strong>${customerReference}</strong>)</p>
  <p style="font-size:16px;">We have received your order <strong>request</strong>. (<strong>${orderReference}</strong>). Here are the details:</p>

  <!-- Alert Box -->
  <div>
    <strong>Our sales team will review your request and send an official order confirmation within 24-48 hours.</strong>
    Please note that pricing and lead times are subject to verification and may be updated in your final order confirmation.
  </div>

  <table style="width:100%; border-collapse:collapse; margin-top:15px; font-size:14px;">
    <thead style="background-color:#2E7D32; color:#fff;">
      <tr>
        <th style="padding:10px; border:1px solid #ddd;">Brand</th>
        <th style="padding:10px; border:1px solid #ddd;">SKU</th>
        <th style="padding:10px; border:1px solid #ddd;">Qty</th>
        <th style="padding:10px; border:1px solid #ddd;">Unit Price</th>
        <th style="padding:10px; border:1px solid #ddd;">Lead time</th>
        <th style="padding:10px; border:1px solid #ddd;">Total Unit Price</th>
      </tr>
    </thead>
    <tbody>
      ${htmlProducts}
      ${
        shippmentAddress === "uk"
          ? `
          <tr style="background-color:#f1f8e9; font-weight:bold;">
            <td colspan="5" style="padding:8px; border:1px solid #ddd;">Shipping Cost</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:right;">
              ${shippingCost.toFixed(2)} ${productList[0].currency}
            </td>
          </tr>
          <tr style="background-color:#f1f8e9; font-weight:bold;">
            <td colspan="5" style="padding:8px; border:1px solid #ddd;">Vat 20%</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:right;">
              ${((totalPrice / 100) * 20).toFixed(2)} ${productList[0].currency}
            </td>
          </tr>
          <tr style="background-color:#e0f2f1; font-weight:bold;">
            <td colspan="5" style="padding:8px; border:1px solid #ddd;">Total</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:right;">
              ${(totalPrice + shippingCost + ((totalPrice / 100) * 20)).toFixed(2)} ${productList[0].currency}
            </td>
          </tr>
          `
          : `
          <tr style="background-color:#f1f8e9; font-weight:bold;">
            <td colspan="5" style="padding:8px; border:1px solid #ddd;">Shipping Cost</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:right;">
              ${"00"} ${productList[0].currency}
            </td>
          </tr>
          <tr style="background-color:#e0f2f1; font-weight:bold;">
            <td colspan="5" style="padding:8px; border:1px solid #ddd;">Total</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:right;">
              ${totalPrice.toFixed(2)} ${productList[0].currency}
            </td>
          </tr>
          `
      }
    </tbody>
  </table>

  <p style="margin-top:20px; font-size:15px;">For any questions, contact our support at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>

  <div style="text-align:center; margin-top:25px;">
    <a href="https://mmconnect.co.uk/order-history" style="display:inline-block; padding:12px 25px; background-color:#2E7D32; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">View Your Order</a>
  </div>

  <p style="margin-top:20px; font-size:14px; color:#555;">Thank you for choosing <strong>${applicationName}</strong>! We appreciate your business.</p>
</div>
`;

  return { subject, text, html };
};
/**
 * ---------------------------------------------------------
 * This Email Template use for Sending Oder Notification to Admin
 * @param param0 
 * @returns
 * --------------------------------------------------------- 
 */
export const generateAdminOrderNotificationEmail = ({
  customerName = 'Customer',
  customerEmail = 'customer@email.com',
  orderReference = 'ORD-REF-0000',
  poNumber = 'PO-0000',
  applicationName = 'MMCONNECT B2B',
  productList = [],
  supportEmail = 'sales@mmengservices.co.uk',
  currency,
  shippingCost = 0,
  shippmentAddress = 'Not Provided'
}: OrderEmailParams & { poNumber?: string }) => {
  const subject = `New Order Received - ${orderReference}`;

  // Calculate total price
  const totalPrice = productList.reduce(
    (sum, p) => sum + p.quantity * p.unitPrice,
    0,
  );

  // Plain text version
  const textProducts = productList
    .map(
      (p) =>
        `${p.brand} | ${p.description} | SKU: ${p.sku} | Qty: ${p.quantity} | Unit: ${p.unitPrice.toFixed(2)} ${p.currency}`,
    )
    .join('\n');

  const text = `
      Hello Admin,
      A new order has been placed.
      Order Reference: ${orderReference}
      PO Number: ${poNumber}
      Customer: ${customerName} (${customerEmail})
      Products:
      ${textProducts}
      Total Price: ${totalPrice.toFixed(2)} ${currency ?? productList[0]?.currency}
      Please follow up accordingly.
      - ${applicationName} System
`;

  // HTML version
  const htmlProducts = productList
    .map(
      (p, i) => `
    <tr style="background-color:${i % 2 === 0 ? '#f9f9f9' : '#fff'}">
      <td style="padding:8px; border:1px solid #ddd;">${p.brand}</td>
      <td style="padding:8px; border:1px solid #ddd;">${p.sku}</td>
      <td style="padding:8px; border:1px solid #ddd; text-align:center;">${p.quantity}</td>
      <td style="padding:8px; border:1px solid #ddd; text-align:right;">${p.unitPrice.toFixed(2)} ${p.currency}</td>
      <td style="padding:8px; border:1px solid #ddd; text-align:right;">${(p.quantity * p.unitPrice).toFixed(2)} ${p.currency}</td>
    </tr>
  `,
    )
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width:700px; margin:auto; padding:20px; border:1px solid #e0e0e0; border-radius:10px; background-color:#fafafa;">
      <h2 style="color:#1565C0; margin-bottom:10px;">New Order Notification</h2>
      <p style="font-size:16px;">A new order has been placed on <strong>${applicationName}</strong>.</p>

      <p style="font-size:15px;">
        <strong>Order Reference:</strong> ${orderReference}<br/>
        <strong>PO Number:</strong> ${poNumber}<br/>
        <strong>Customer:</strong> ${customerName}<br/>
        <strong>Email:</strong> <a href="mailto:${customerEmail}">${customerEmail}</a>
      </p>

      <table style="width:100%; border-collapse:collapse; margin-top:15px; font-size:14px;">
        <thead style="background-color:#1565C0; color:#fff;">
          <tr>
            <th style="padding:10px; border:1px solid #ddd;">Brand</th>
            <th style="padding:10px; border:1px solid #ddd;">SKU</th>
            <th style="padding:10px; border:1px solid #ddd;">Qty</th>
            <th style="padding:10px; border:1px solid #ddd;">Unit Price</th>
            <th style="padding:10px; border:1px solid #e0d3d3ff;">Total Unit Price</th>
          </tr>
        </thead>
        <tbody>
          ${htmlProducts}
          ${
            shippmentAddress === "uk"
              ? `
                <tr style="background-color:#fff; font-weight:bold;">
                  <td colspan="4" style="padding:8px; border:1px solid #ddd;">Shipping Cost</td>
                  <td style="padding:8px; border:1px solid #ddd; text-align:right;">
                    ${shippingCost.toFixed(2)} ${productList[0].currency}
                  </td>
                </tr>

                <tr style="background-color:#fff; font-weight:bold;">
                  <td colspan="4" style="padding:8px; border:1px solid #ddd;">Total</td>
                  <td style="padding:8px; border:1px solid #ddd; text-align:right;">
                    ${(totalPrice + shippingCost).toFixed(2)} ${productList[0].currency}
                  </td>
                </tr>
              `
              : `
                <tr style="background-color:#f1f8e9; font-weight:bold;">
                  <td colspan="4" style="padding:8px; border:1px solid #ddd;">Shipping Cost</td>
                  <td style="padding:8px; border:1px solid #ddd; text-align:right;">
                    ${"00"}  ${productList[0].currency}
                  </td>
                </tr>

                <tr style="background-color:#fff; font-weight:bold;">
                  <td colspan="4" style="padding:8px; border:1px solid #ddd;">Total</td>
                  <td style="padding:8px; border:1px solid #ddd; text-align:right;">
                    ${totalPrice.toFixed(2)} ${productList[0].currency}
                  </td>
                </tr>
              `
            }
        </tbody>
      </table>

      <p style="margin-top:20px; font-size:15px;">Please review this order and take the necessary next steps.</p>

      <div style="text-align:center; margin-top:25px;">
        <a href="https://mmconnect.co.uk/dashboard/order" style="display:inline-block; padding:12px 25px; background-color:#1565C0; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">View Order in Dashboard</a>
      </div>

      <p style="margin-top:20px; font-size:14px; color:#555;">This is an automated notification from <strong>${applicationName}</strong>.</p>
    </div>
`;

  return { subject, text, html };
};