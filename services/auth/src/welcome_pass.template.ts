export const welcomeTemplate = (name: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Welcome to JobBoard</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

                    <!-- Header -->
                    <tr>
                        <td style="background-color:#4F46E5;padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:26px;letter-spacing:1px;">Welcome to JobBoard 🎉</h1>
                            <p style="margin:6px 0 0;color:#c7d2fe;font-size:13px;">Your Career, Your Future</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="margin:0 0 16px;color:#111827;font-size:22px;">Hi, ${name} 👋</h2>
                            <p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.6;">
                                Welcome aboard! We're thrilled to have you join JobBoard. 
                                Your account has been successfully created and you're all set to explore opportunities.
                            </p>
                            <ul style="color:#6b7280;font-size:15px;line-height:2;padding-left:20px;">
                                <li>Browse thousands of job listings</li>
                                <li>Apply with a single click</li>
                                <li>Track your applications in real-time</li>
                            </ul>

                            <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${process.env.CLIENT_URL}"
                                           style="display:inline-block;padding:14px 36px;background-color:#4F46E5;color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.5px;">
                                            Get Started
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                            <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;">
                                © ${new Date().getFullYear()} JobBoard. All rights reserved.
                            </p>
                            <p style="margin:0;color:#9ca3af;font-size:12px;">
                                Questions? Reach us at 
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