type AdminNotificationTemplateProps = {
  adminName?: string
  user: {
    name: string
    email: string
    role?: string
    registeredAt?: Date
  }
}

export function generateAdminNotificationTemplate(
  { adminName = "Admin", user }: AdminNotificationTemplateProps
) {
  const subject = `🚀 New User Registered: ${user.name}`

  const text = `
Hi ${adminName},

A new user has registered on your application.

User details:
- Name: ${user.name}
- Email: ${user.email}
${user.role ? `- Role: ${user.role}` : ""}
${user.registeredAt ? `- Registered At: ${user.registeredAt.toLocaleString()}` : ""}

Please check your admin dashboard for more details.
  `.trim()

  const htmlContent = `
  <div style="background-color:#f4f6f8; padding:30px; font-family:Arial, Helvetica, sans-serif; color:#333;">
    <table width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; margin:0 auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
      <tr>
        <td style="background:linear-gradient(135deg,#4f46e5,#3b82f6); padding:20px; text-align:center; color:#fff;">
          <h1 style="margin:0; font-size:22px;">New User Registration</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <p style="font-size:16px; margin-bottom:16px;">Hi <strong>${adminName}</strong>,</p>
          <p style="font-size:15px; margin-bottom:20px;">A new user has just registered on your application. Below are the details:</p>
          
          <table width="100%" cellpadding="8" cellspacing="0" style="background:#f9fafb; border-radius:8px; margin-bottom:20px; border:1px solid #e5e7eb;">
            <tr>
              <td style="font-weight:bold; width:120px;">Name:</td>
              <td>${user.name}</td>
            </tr>
            <tr>
              <td style="font-weight:bold;">Email:</td>
              <td>${user.email}</td>
            </tr>
            ${user.role ? `
            <tr>
              <td style="font-weight:bold;">Role:</td>
              <td>${user.role}</td>
            </tr>` : ""}
            ${user.registeredAt ? `
            <tr>
              <td style="font-weight:bold;">Registered At:</td>
              <td>${user.registeredAt.toLocaleString()}</td>
            </tr>` : ""}
          </table>

          <p style="margin-bottom:24px; font-size:14px;">Please check your admin dashboard for more details.</p>
          <p style="text-align:center;">
            <a href="https://mmconnect.co.uk/login" 
               style="background:#3b82f6; color:#fff; text-decoration:none; padding:12px 24px; border-radius:6px; font-weight:bold; display:inline-block;">
              Open Admin Dashboard
            </a>
          </p>
        </td>
      </tr>
      <tr>
        <td style="background:#f9fafb; padding:16px; text-align:center; font-size:12px; color:#6b7280;">
          This is an automated notification. Please Approve or Reject the user.
        </td>
      </tr>
    </table>
  </div>
  `.trim()

  return { subject, text, htmlContent }
}
