interface Item {
  name: string;
  quantity: number;
  price: string;
}

export const purchaseTemplate = (fullName: string, items: Item[], total: string) => {
  const rows = items.map(item => `
    <tr>
      <td>${item.name}</td><td>${item.quantity}</td><td>${item.price}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; color: #333; background-color: #f9f9f9; }
    .container { max-width: 650px; background: white; margin: auto; padding: 20px; border-radius: 8px; }
    .header { font-size: 20px; color: #27ae60; margin-bottom: 10px; }
    .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .table th, .table td { border: 1px solid #ddd; padding: 8px; }
    .footer { font-size: 13px; color: #999; text-align: center; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Thank You for Your Purchase!</div>
    <p>Hi ${fullName},</p>
    <p>We've received your order. Here's a summary:</p>
    <table class="table">
      <thead>
        <tr>
          <th>Product</th><th>Quantity</th><th>Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p><strong>Total:</strong> ${total}</p>
    <p>You’ll receive another email when your items are shipped.</p>
    <div class="footer">Need help? Contact support anytime.</div>
  </div>
</body>
</html>
`;
};
