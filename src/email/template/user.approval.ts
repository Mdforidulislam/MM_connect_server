export interface WelcomeApprovalEmailParams {
  userName?: string;
  userEmail?: string;
  applicationName?: string;
  approvalLink?: string;
  supportEmail?: string;
}

/**
 * Generate professional Welcome / Customer Approval email
 */
export const generateWelcomeApprovalEmail = ({
  userName = "Valued User",
  userEmail = "your email",
  applicationName = "MMCONNECT ENGINEERING SERVICES",
  approvalLink = "https://mmconnect.co.uk",
  supportEmail = "sales@mmengservices.co.uk"
}: WelcomeApprovalEmailParams) => {

  const subject = `Welcome to MMCONNECT from MM Eng. Services Ltd – Your Access has been approved`;

  const text = `
Hello ${userName},

Congratulations! Your account (${userEmail}) has been successfully approved to access ${applicationName}.

You can start exploring the application immediately by clicking the link below:
${approvalLink}

If you did not request this access or have any questions, please contact our support team at ${supportEmail}.

We’re excited to have you onboard!

Best regards,
The ${applicationName} Team
`;

  const html = `
<div style="font-family: Arial, sans-serif; line-height:1.6; color:#333; max-width:600px; margin:auto; padding:20px; border:1px solid #e0e0e0; border-radius:8px;">
  <h1 style="color:#4CAF50; margin-bottom:10px;">🎉 Welcome to ${applicationName}!</h1>
  <p>Hi <strong>${userName}</strong>,</p>
  <p>Congratulations! Your account (<strong>${userEmail}</strong>) has been successfully approved and you now have full access to <strong>${applicationName}</strong>.</p>
  
  <p style="margin-top:20px;">Click the button below to start using the application:</p>
  <a href="${approvalLink}" style="display:inline-block; padding:12px 24px; background-color:#4CAF50; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">Access ${applicationName}</a>

  <p style="margin-top:20px;">If you did not request this access or need assistance, please contact our support team at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>

  <hr style="margin:30px 0; border-color:#ddd;" />
  <p style="font-size:14px; color:#666;">Thank you for joining <strong>${applicationName}</strong>! We’re excited to have you onboard.</p>
  <p style="font-size:14px; color:#666;">— The ${applicationName} Team</p>
</div>
`;

  return { subject, text, html };
};