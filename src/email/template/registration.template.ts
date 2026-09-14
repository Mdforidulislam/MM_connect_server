export const registrationTemplate = (fullName: string, currentYear: number) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; }
    .header { background-color: #4CAF50; padding: 10px; color: white; text-align: center; }
    .content { padding: 20px; }
    .footer { font-size: 12px; color: #888; text-align: center; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Welcome to Our Platform</div>
    <div class="content">
      <p>Hello ${fullName},</p>
      <p>Thank you for registering with us! We're excited to have you onboard.</p>
      <p>You can now log in and start using our services.</p>
      <p>Best regards,<br/>The Team</p>
    </div>
    <div class="footer">© ${currentYear} Our Company</div>
  </div>
</body>
</html>
`;
