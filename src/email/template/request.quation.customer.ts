export interface ProductItem {
  brand: string;
  partNumber: string;
  qty: number;
  unitPrice: number;
  leadTimeUnite: number;
  leadTimeType: string;
  countryCodeOrigin: string;
  uniteWeight: string;
}

export interface RFQConfirmationEmailParams {
  customerName?: string;
  customerEmail?: string;
  quotationReference?: string;
  applicationName?: string;
  productList: ProductItem[];
  supportEmail?: string;
  shippingCost?: number;
  companyName?: string;
  currency?: string;
  refferenceNumber?: string;
  teamMemberName?: string;
  teamMemberEmail?: string;
}

/**
 * Generate a professional RFQ Confirmation Email for Client
 */
export const generateRFQConfirmationEmail = ({
  companyName = "Our Company",
  refferenceNumber = "Number",
  teamMemberName = "Customer",
  teamMemberEmail = "your email",
  quotationReference = "RFQ-REF-0000",
  productList = [],
  supportEmail = "sales@mmengservices.co.uk",
  shippingCost = 0,
  currency = "EUR"
}: RFQConfirmationEmailParams) => {

  const subject = `RFQ CONFIRMATION - ${quotationReference}`;
  const totalPrice = productList.reduce((sum, p) => sum + p.qty * p.unitPrice, 0);

  const htmlProducts = productList.map((p, i) => `
    <tr style="background-color:${i % 2 === 0 ? '#f9f9f9' : '#fff'}">
      <td style="padding:8px; border:1px solid #ddd;">${p.brand}</td>
      <td style="padding:8px; border:1px solid #ddd;">${p.partNumber}</td>
      <td style="padding:8px; border:1px solid #ddd; text-align:center;">${p.qty}</td>
      <td style="padding:8px; border:1px solid #ddd; text-align:right;">${p.unitPrice.toFixed(2)}</td>
      <td style="padding:8px; border:1px solid #ddd; text-align:right;">${(p.qty * p.unitPrice).toFixed(2)}</td>
      <td style="padding:8px; border:1px solid #ddd; text-align:center;">${p.leadTimeUnite} ${p.leadTimeType}</td>
      <td style="padding:8px; border:1px solid #ddd; text-align:center;">${p.countryCodeOrigin}</td>
      <td style="padding:8px; border:1px solid #ddd; text-align:center;">${p.uniteWeight}</td>
      <td style="padding:8px; border:1px solid #ddd; text-align:center;">${currency}</td>
    </tr>
  `).join('');

  const html = `
<div style="font-family: Arial, sans-serif; max-width:700px; margin:auto; padding:20px; border:1px solid #e0e0e0; border-radius:10px; color:#333; background-color:#fafafa;">

  <h2 style="color:#2E7D32; margin-bottom:5px;">RFQ Confirmation</h2>

  <p style="font-size:16px;">Hi,</p>
  <p><strong>COMPANY NAME:</strong> ${companyName}</p>
  <p><strong>REFERENCE ID:</strong> ${refferenceNumber}</p>
  <p><strong>TEAM MEMBER NAME:</strong> ${teamMemberName}</p>
  <p><strong>EMAIL:</strong> ${teamMemberEmail}</p>
  
  <p style="font-size:16px;">A request for quotation (<strong>${quotationReference}</strong>) has been received and reviewed.</p>
  
  <p style="font-size:16px; background-color:#e8f5e9; padding:12px; border-left:4px solid #2E7D32; margin:15px 0;">
    Our sales team will review your requirements and send you a detailed quote with pricing and lead times within 24-48 hours.
  </p>

  <p style="font-size:16px; font-weight:bold; margin-top:20px;">Here is the list of products:</p>

  <table style="width:100%; border-collapse:collapse; margin-top:15px; font-size:14px;">
    <thead style="background-color:#2E7D32; color:#fff;">
      <tr>
        <th style="padding:10px; border:1px solid #ddd;">Brand</th>
        <th style="padding:10px; border:1px solid #ddd;">Part Number</th>
        <th style="padding:10px; border:1px solid #ddd;">Qty</th>
        <th style="padding:10px; border:1px solid #ddd;">Unit Price</th>
        <th style="padding:10px; border:1px solid #ddd;">Total Unit Price</th>
        <th style="padding:10px; border:1px solid #ddd;">Lead Time</th>
        <th style="padding:10px; border:1px solid #ddd;">Origin</th>
        <th style="padding:10px; border:1px solid #ddd;">Weight</th>
        <th style="padding:10px; border:1px solid #ddd;">Currency</th>
      </tr>
    </thead>

    <tbody>
      ${htmlProducts}
      <tr style="background-color:#e0f2f1; font-weight:bold;">
        <td colspan="4" style="padding:8px; border:1px solid #ddd; text-align:right;">Total</td>
        <td style="padding:8px; border:1px solid #ddd; text-align:right;">${totalPrice.toFixed(2)} ${currency}</td>
        <td colspan="4" style="border:1px solid #ddd;"></td>
      </tr>
    </tbody>
  
  </table>

  <div style="margin-top:25px; padding:15px; background-color:#f5f5f5; border-radius:6px;">
    <p style="font-weight:bold; margin-bottom:10px;">Need immediate assistance?</p>
    <p style="margin:5px 0;">📞 Call us: +44 1274 288777</p>
    <p style="margin:5px 0;">✉️ Email: ${supportEmail}</p>
  </div>

</div>
`;

  return { subject, html };
};