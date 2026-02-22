export const resetPasswordTemplate = (name: string, resetLink: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color:#4F46E5;padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:26px;letter-spacing:1px;">JobBoard</h1>
                            <p style="margin:6px 0 0;color:#c7d2fe;font-size:13px;">Your Career, Your Future</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="margin:0 0 16px;color:#111827;font-size:22px;">Hi, ${name} 👋</h2>
                            <p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.6;">
                                We received a request to reset the password for your account. 
                                Click the button below to reset it. This link will expire in 
                                <strong style="color:#111827;">15 minutes</strong>.
                            </p>

                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${resetLink}"
                                           style="display:inline-block;padding:14px 36px;background-color:#4F46E5;color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.5px;">
                                            Reset My Password
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0 0 12px;color:#6b7280;font-size:14px;line-height:1.6;">
                                If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            <p style="margin:0 0 24px;word-break:break-all;">
                                <a href="${resetLink}" style="color:#4F46E5;font-size:13px;">${resetLink}</a>
                            </p>

                            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />

                            <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6;">
                                If you didn't request a password reset, you can safely ignore this email. 
                                Your password will remain unchanged.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                            <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;">
                                © ${new Date().getFullYear()} JobBoard. All rights reserved.
                            </p>
                            <p style="margin:0;color:#9ca3af;font-size:12px;">
                                If you have any issues, contact us at 
                                <a href="mailto:support@jobboard.com" style="color:#4F46E5;text-decoration:none;">support@jobboard.com</a>
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;