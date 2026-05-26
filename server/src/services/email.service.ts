import nodemailer from 'nodemailer';

// Escape HTML to prevent injection in email templates
const escapeHtml = (str: string): string =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

const createTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('EMAIL_USER and EMAIL_PASS environment variables are required to send email');
    }

    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // use STARTTLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: true,
        },
    });
};

export const sendVerificationEmail = async (
    email: string,
    name: string,
    token: string
): Promise<void> => {
    const transporter = createTransporter();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verificationLink = `${clientUrl}/verify-email/${token}`;
    const safeName = escapeHtml(name);

    const mailOptions = {
        from: `"Student Showcase" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '✉️ Verify Your Email - Student Showcase',
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#7c3aed,#ec4899);padding:40px 40px 30px;text-align:center;">
                            <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Student Showcase</h1>
                            <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Project Showcase Platform</p>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="color:#1a1a2e;margin:0 0 16px;font-size:22px;">Welcome, ${safeName}! 👋</h2>
                            <p style="color:#4a4a68;line-height:1.6;margin:0 0 24px;font-size:15px;">
                                Thank you for signing up. Please verify your email address by clicking the button below.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding:8px 0 24px;">
                                        <a href="${verificationLink}" 
                                           style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:600;letter-spacing:0.5px;">
                                            Verify My Email
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="color:#6b6b80;font-size:13px;line-height:1.5;margin:0 0 16px;">
                                If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            <p style="color:#7c3aed;font-size:13px;word-break:break-all;background:#f8f4ff;padding:12px;border-radius:6px;margin:0 0 24px;">
                                ${verificationLink}
                            </p>
                            <p style="color:#6b6b80;font-size:13px;margin:0;">
                                This link expires in <strong>24 hours</strong>.
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color:#f8f8fb;padding:24px 40px;text-align:center;border-top:1px solid #eee;">
                            <p style="color:#9999aa;font-size:12px;margin:0;">
                                If you didn't create an account, please ignore this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
    };

    await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (
    email: string,
    name: string,
    token: string
): Promise<void> => {
    const transporter = createTransporter();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${clientUrl}/reset-password/${token}`;
    const safeName = escapeHtml(name);

    const mailOptions = {
        from: `"Student Showcase" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔑 Reset Your Password - Student Showcase',
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#7c3aed,#ec4899);padding:40px 40px 30px;text-align:center;">
                            <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Student Showcase</h1>
                            <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Password Reset Request</p>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="color:#1a1a2e;margin:0 0 16px;font-size:22px;">Hi, ${safeName}! 🔐</h2>
                            <p style="color:#4a4a68;line-height:1.6;margin:0 0 24px;font-size:15px;">
                                We received a request to reset your password. Click the button below to set a new password.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding:8px 0 24px;">
                                        <a href="${resetLink}" 
                                           style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:600;letter-spacing:0.5px;">
                                            Reset My Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="color:#6b6b80;font-size:13px;line-height:1.5;margin:0 0 16px;">
                                If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            <p style="color:#7c3aed;font-size:13px;word-break:break-all;background:#f8f4ff;padding:12px;border-radius:6px;margin:0 0 24px;">
                                ${resetLink}
                            </p>
                            <p style="color:#6b6b80;font-size:13px;margin:0;">
                                This link expires in <strong>1 hour</strong>.
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color:#f8f8fb;padding:24px 40px;text-align:center;border-top:1px solid #eee;">
                            <p style="color:#9999aa;font-size:12px;margin:0;">
                                If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
    };

    await transporter.sendMail(mailOptions);
};

export const sendProjectSubmittedEmail = async (
    adminEmail: string,
    studentName: string,
    projectName: string
): Promise<void> => {
    const transporter = createTransporter();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const safeStudentName = escapeHtml(studentName);
    const safeProjectName = escapeHtml(projectName);

    const mailOptions = {
        from: `"Student Showcase" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `📋 New Project Submitted - ${safeProjectName}`,
        html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 0;">
        <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <tr><td style="background:linear-gradient(135deg,#7c3aed,#ec4899);padding:40px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:28px;">New Project Submission 📋</h1>
                </td></tr>
                <tr><td style="padding:40px;">
                    <p style="color:#4a4a68;font-size:15px;margin:0 0 8px;"><strong>Student:</strong> ${safeStudentName}</p>
                    <p style="color:#4a4a68;font-size:15px;margin:0 0 24px;"><strong>Project:</strong> ${safeProjectName}</p>
                    <table width="100%"><tr><td align="center">
                        <a href="${clientUrl}/admin/dashboard" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:600;">Review in Admin Panel</a>
                    </td></tr></table>
                </td></tr>
            </table>
        </td></tr>
    </table>
</body></html>`,
    };
    await transporter.sendMail(mailOptions);
};

export const sendProjectApprovalEmail = async (
    studentEmail: string,
    studentName: string,
    projectName: string,
    status: 'approved' | 'rejected',
    remarks?: string
): Promise<void> => {
    const transporter = createTransporter();
    const isApproved = status === 'approved';
    const safeStudentName = escapeHtml(studentName);
    const safeProjectName = escapeHtml(projectName);
    const safeRemarks = remarks ? escapeHtml(remarks) : '';

    const mailOptions = {
        from: `"Student Showcase" <${process.env.EMAIL_USER}>`,
        to: studentEmail,
        subject: `${isApproved ? '✅' : '❌'} Project "${safeProjectName}" ${isApproved ? 'Approved' : 'Rejected'}`,
        html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 0;">
        <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <tr><td style="background:linear-gradient(135deg,${isApproved ? '#10b981,#059669' : '#ef4444,#dc2626'});padding:40px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:28px;">Project ${isApproved ? 'Approved ✅' : 'Rejected ❌'}</h1>
                </td></tr>
                <tr><td style="padding:40px;">
                    <h2 style="color:#1a1a2e;margin:0 0 16px;font-size:22px;">Hi, ${safeStudentName}!</h2>
                    <p style="color:#4a4a68;font-size:15px;margin:0 0 16px;">Your project <strong>"${safeProjectName}"</strong> has been <strong>${isApproved ? 'approved' : 'rejected'}</strong>.</p>
                    ${safeRemarks ? `<p style="color:#4a4a68;font-size:14px;background:#f8f4ff;padding:12px;border-radius:6px;margin:0 0 16px;"><strong>Remarks:</strong> ${safeRemarks}</p>` : ''}
                    <p style="color:#6b6b80;font-size:13px;margin:0;">${isApproved ? 'Your project is now visible on the public browse page!' : 'Please review the remarks and consider re-uploading.'}</p>
                </td></tr>
            </table>
        </td></tr>
    </table>
</body></html>`,
    };
    await transporter.sendMail(mailOptions);
};

export const sendProjectAssignedEmail = async (
    instructorEmail: string,
    instructorName: string,
    studentName: string,
    projectName: string
): Promise<void> => {
    const transporter = createTransporter();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const safeInstructorName = escapeHtml(instructorName);
    const safeStudentName = escapeHtml(studentName);
    const safeProjectName = escapeHtml(projectName);

    const mailOptions = {
        from: `"Student Showcase" <${process.env.EMAIL_USER}>`,
        to: instructorEmail,
        subject: `📚 New Project Assigned - ${safeProjectName}`,
        html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 0;">
        <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <tr><td style="background:linear-gradient(135deg,#7c3aed,#ec4899);padding:40px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:28px;">New Project Assigned 📚</h1>
                </td></tr>
                <tr><td style="padding:40px;">
                    <h2 style="color:#1a1a2e;margin:0 0 16px;font-size:22px;">Hi, ${safeInstructorName}!</h2>
                    <p style="color:#4a4a68;font-size:15px;margin:0 0 8px;"><strong>Project:</strong> ${safeProjectName}</p>
                    <p style="color:#4a4a68;font-size:15px;margin:0 0 24px;"><strong>Student:</strong> ${safeStudentName}</p>
                    <table width="100%"><tr><td align="center">
                        <a href="${clientUrl}/instructor/dashboard" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:600;">View in Dashboard</a>
                    </td></tr></table>
                </td></tr>
            </table>
        </td></tr>
    </table>
</body></html>`,
    };
    await transporter.sendMail(mailOptions);
};

export const sendInstructorApprovalEmail = async (
    email: string,
    name: string
): Promise<void> => {
    const transporter = createTransporter();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const safeName = escapeHtml(name);

    const mailOptions = {
        from: `"Student Showcase" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '✅ Your Instructor Account Has Been Approved!',
        html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 0;">
        <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <tr><td style="background:linear-gradient(135deg,#10b981,#059669);padding:40px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:28px;">Account Approved ✅</h1>
                </td></tr>
                <tr><td style="padding:40px;">
                    <h2 style="color:#1a1a2e;margin:0 0 16px;font-size:22px;">Congratulations, ${safeName}! 🎉</h2>
                    <p style="color:#4a4a68;font-size:15px;margin:0 0 16px;">Your instructor account on <strong>Student Showcase</strong> has been approved by the admin.</p>
                    <p style="color:#4a4a68;font-size:15px;margin:0 0 24px;">You can now log in and start managing student projects assigned to you.</p>
                    <table width="100%"><tr><td align="center">
                        <a href="${clientUrl}/login" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:600;">Log In Now</a>
                    </td></tr></table>
                </td></tr>
                <tr><td style="background-color:#f8f8fb;padding:24px 40px;text-align:center;border-top:1px solid #eee;">
                    <p style="color:#9999aa;font-size:12px;margin:0;">Student Showcase — Project Showcase Platform</p>
                </td></tr>
            </table>
        </td></tr>
    </table>
</body></html>`,
    };
    await transporter.sendMail(mailOptions);
};

export const sendInstructorRejectionEmail = async (
    email: string,
    name: string
): Promise<void> => {
    const transporter = createTransporter();
    const safeName = escapeHtml(name);

    const mailOptions = {
        from: `"Student Showcase" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '❌ Your Instructor Account Registration',
        html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 0;">
        <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <tr><td style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:40px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:28px;">Registration Declined ❌</h1>
                </td></tr>
                <tr><td style="padding:40px;">
                    <h2 style="color:#1a1a2e;margin:0 0 16px;font-size:22px;">Hi, ${safeName}</h2>
                    <p style="color:#4a4a68;font-size:15px;margin:0 0 16px;">We regret to inform you that your instructor account registration on <strong>Student Showcase</strong> has been declined by the admin.</p>
                    <p style="color:#6b6b80;font-size:13px;margin:0;">If you believe this was a mistake, please contact the system administrator.</p>
                </td></tr>
                <tr><td style="background-color:#f8f8fb;padding:24px 40px;text-align:center;border-top:1px solid #eee;">
                    <p style="color:#9999aa;font-size:12px;margin:0;">Student Showcase — Project Showcase Platform</p>
                </td></tr>
            </table>
        </td></tr>
    </table>
</body></html>`,
    };
    await transporter.sendMail(mailOptions);
};
