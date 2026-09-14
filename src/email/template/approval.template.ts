export const approvalTemplate = (fullName: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f5f5f5; color: #333; }
    .container { background-color: #fff; margin: 20px auto; padding: 20px; border-radius: 8px; max-width: 600px; }
    .header { background-color: #007BFF; color: white; padding: 10px 20px; border-radius: 8px 8px 0 0; }
    .footer { font-size: 12px; text-align: center; color: #aaa; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Your Account Has Been Approved</div>
    <div class="content">
      <p>Hi ${fullName},</p>
      <p>Your account has been reviewed and approved. You now have full access to our platform.</p>
      <p>Cheers,<br/>The Team</p>
    </div>
    <div class="footer">This is an automated email, please do not reply.</div>
  </div>
</body>
</html>
`;
