const Imap = require('imap');
const { simpleParser } = require('mailparser');
const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // Handle different port configurations
        const port = parseInt(process.env.SUPPORT_EMAIL_PORT) || 993;

        // Port 587 is typically SMTP STARTTLS, convert to IMAP
        // Port 465 is SMTP SSL, convert to IMAP SSL (993)
        // Port 143 is IMAP STARTTLS
        // Port 993 is IMAP SSL
        let imapPort = port;
        let useSSL = false;
        let useSTARTTLS = false;

        if (port === 587) {
            // SMTP STARTTLS -> IMAP STARTTLS
            imapPort = 143;
            useSTARTTLS = true;
        } else if (port === 465) {
            // SMTP SSL -> IMAP SSL
            imapPort = 993;
            useSSL = true;
        } else if (port === 993) {
            useSSL = true;
        } else if (port === 143) {
            useSTARTTLS = true;
        }

        console.log('🔧 Email config setup:', {
            originalPort: port,
            imapPort: imapPort,
            useSSL: useSSL,
            useSTARTTLS: useSTARTTLS,
            host: process.env.SUPPORT_EMAIL_HOST
        });

        this.imapConfig = {
            user: process.env.SUPPORT_EMAIL || process.env.SMTP_USER || 'support@ile.africa',
            password: process.env.SUPPORT_EMAIL_PASSWORD || process.env.SMTP_PASS,
            host: process.env.SUPPORT_EMAIL_HOST || process.env.SMTP_HOST || 'mail.ile.africa',
            port: imapPort,
            tls: useSSL,
            secure: useSSL,
            requireTLS: useSTARTTLS,
            tlsOptions: {
                // Enable TLS certificate verification in production (prevents MITM attacks)
                rejectUnauthorized: process.env.NODE_ENV === 'production' || process.env.TLS_REJECT_UNAUTHORIZED !== 'false',
                servername: process.env.SUPPORT_EMAIL_HOST || process.env.SMTP_HOST || 'mail.ile.africa'
            },
            authTimeout: 30000,
            connTimeout: 30000,
            keepalive: false
        };

        // SMTP Configuration for sending emails
        this.smtpConfig = {
            host: process.env.SUPPORT_EMAIL_HOST || process.env.SMTP_HOST || 'mail.ile.africa',
            port: parseInt(process.env.SUPPORT_EMAIL_PORT || process.env.SMTP_PORT) || 587,
            secure: (parseInt(process.env.SUPPORT_EMAIL_PORT || process.env.SMTP_PORT) === 465), // true for 465, false for other ports
            auth: {
                user: process.env.SUPPORT_EMAIL || process.env.SMTP_USER || 'support@ile.africa',
                pass: process.env.SUPPORT_EMAIL_PASSWORD || process.env.SMTP_PASS
            },
            tls: {
                // Enable TLS certificate verification in production (prevents MITM attacks)
                rejectUnauthorized: process.env.NODE_ENV === 'production' || process.env.TLS_REJECT_UNAUTHORIZED !== 'false'
            }
        };

        // Create reusable transporter object
        this.transporter = nodemailer.createTransport(this.smtpConfig);
    }

    async fetchEmails(limit = 50, folder = 'INBOX') {
        return new Promise((resolve, reject) => {
            console.log('🔧 Attempting to connect to email server:', {
                host: this.imapConfig.host,
                port: this.imapConfig.port,
                user: this.imapConfig.user
            });

            const imap = new Imap(this.imapConfig);
            const emails = [];

            imap.once('ready', () => {
                console.log('✅ Email connection established successfully');
                imap.openBox(folder, true, (err, box) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    // Fetch latest emails
                    const fetchOptions = {
                        bodies: '',
                        struct: true,
                        envelope: true
                    };

                    const totalMessages = box.messages.total;
                    const start = Math.max(1, totalMessages - limit + 1);
                    const range = `${start}:${totalMessages}`;

                    const fetch = imap.seq.fetch(range, fetchOptions);

                    fetch.on('message', (msg, seqno) => {
                        let emailData = {
                            id: seqno.toString(),
                            seqno: seqno,
                            flags: [],
                            date: null,
                            from: null,
                            to: null,
                            subject: null,
                            body: null,
                            html: null,
                            attachments: []
                        };

                        msg.on('body', (stream, info) => {
                            simpleParser(stream, (err, parsed) => {
                                if (err) {
                                    console.error('Error parsing email:', err);
                                    return;
                                }

                                emailData.date = parsed.date;
                                emailData.from = parsed.from;
                                emailData.to = parsed.to;
                                emailData.subject = parsed.subject;
                                emailData.body = parsed.text;
                                emailData.html = parsed.html;
                                emailData.attachments = parsed.attachments || [];
                            });
                        });

                        msg.on('attributes', (attrs) => {
                            emailData.flags = attrs.flags;
                            emailData.date = attrs.date;
                            emailData.envelope = attrs.envelope;
                        });

                        msg.once('end', () => {
                            emails.push(emailData);
                        });
                    });

                    fetch.once('error', (err) => {
                        reject(err);
                    });

                    fetch.once('end', () => {
                        imap.end();
                    });
                });
            });

            imap.once('error', (err) => {
                console.error('❌ Email connection error:', err);
                reject(err);
            });

            imap.once('end', () => {
                console.log('📧 Email fetch completed, found', emails.length, 'emails');
                // Sort emails by date (newest first)
                emails.sort((a, b) => new Date(b.date) - new Date(a.date));
                resolve(emails);
            });

            imap.connect();
        });
    }

    async getFolders() {
        return new Promise((resolve, reject) => {
            const imap = new Imap(this.imapConfig);

            imap.once('ready', () => {
                imap.getBoxes((err, boxes) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    imap.end();
                    resolve(boxes);
                });
            });

            imap.once('error', (err) => {
                reject(err);
            });

            imap.connect();
        });
    }

    async markAsRead(seqno, folder = 'INBOX') {
        return new Promise((resolve, reject) => {
            const imap = new Imap(this.imapConfig);

            imap.once('ready', () => {
                imap.openBox(folder, false, (err, box) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    imap.seq.addFlags(seqno, '\\Seen', (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        imap.end();
                        resolve(true);
                    });
                });
            });

            imap.once('error', (err) => {
                reject(err);
            });

            imap.connect();
        });
    }

    formatEmailsForFrontend(emails) {
        return emails.map((email, index) => {
            const fromAddress = email.envelope?.from?.[0] || email.from?.value?.[0];
            const toAddress = email.envelope?.to?.[0] || email.to?.value?.[0];

            return {
                id: email.id || index.toString(),
                subject: email.envelope?.subject || email.subject || 'No Subject',
                content: email.body || 'No content available',
                html: email.html,
                from: {
                    id: fromAddress?.address || 'unknown',
                    name: fromAddress?.name || fromAddress?.address || 'Unknown Sender',
                    email: fromAddress?.address || 'unknown@unknown.com',
                    avatar: null
                },
                to: {
                    id: 'support@ile.africa',
                    name: 'Ile Africa Support',
                    email: 'support@ile.africa',
                    avatar: null
                },
                label: this.categorizeEmail(email.envelope?.subject || email.subject || ''),
                createdAt: email.date || email.envelope?.date || new Date(),
                read: !email.flags || !email.flags.includes('\\Recent'),
                starred: email.flags && email.flags.includes('\\Flagged'),
                important: this.isImportant(email.envelope?.subject || email.subject || ''),
                deleted: false,
                attachments: email.attachments?.map(att => ({
                    filename: att.filename,
                    contentType: att.contentType,
                    size: att.size
                })) || []
            };
        });
    }

    categorizeEmail(subject) {
        // Simplify - put all emails in Primary for now
        return 'Primary';
    }

    isImportant(subject) {
        const importantKeywords = ['urgent', 'important', 'critical', 'emergency', 'security', 'account', 'suspended'];
        return importantKeywords.some(keyword => subject.toLowerCase().includes(keyword));
    }

    // Generate 6-digit OTP
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Send OTP email
    async sendOTP(email, otp) {
        try {
            console.log(`📧 Sending OTP ${otp} to ${email}`);

            // Staging Bypass: Don't wait for real SMTP send to avoid UI hangs
            if (process.env.NODE_ENV === 'staging') {
                console.log(`[STAGING] Bypassing real SMTP send for ${email}. Default OTP 123456 or generated OTP will work.`);
                return { success: true, messageId: 'staging-bypass-' + Date.now() };
            }

            const mailOptions = {
                from: `"CasperID Security" <${process.env.SUPPORT_EMAIL || process.env.SMTP_USER}>`,
                to: email,
                subject: 'Your CasperID Verification Code',
                html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9ff;">
                        <div style="background: white; border-radius: 16px; padding: 40px; text-align: center; border: 1px solid #e5e7eb;">
                            <div style="width: 64px; height: 64px; background: #8652e2; border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                                <div style="color: white; font-size: 32px; font-weight: bold;">🔐</div>
                            </div>
                            
                            <h1 style="color: #1f2937; margin: 0 0 16px 0; font-size: 28px; font-weight: 800;">Verify Your Identity</h1>
                            
                            <p style="color: #6b7280; margin: 0 0 32px 0; font-size: 16px; line-height: 1.5;">
                                Enter this verification code in your CasperID app to continue setting up your secure digital identity.
                            </p>
                            
                            <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; margin: 32px 0; display: inline-block;">
                                <div style="color: #374151; font-size: 14px; font-weight: 600; margin-bottom: 8px;">VERIFICATION CODE</div>
                                <div style="font-family: 'SF Mono', Monaco, monospace; font-size: 32px; font-weight: 800; color: #8652e2; letter-spacing: 8px;">${otp}</div>
                            </div>
                            
                            <p style="color: #9ca3af; font-size: 14px; margin: 24px 0 0 0;">
                                This code expires in 10 minutes. Never share this code with anyone.
                            </p>
                            
                            <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 24px;">
                                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                    Powered by CasperID Security Standard<br>
                                    If you didn't request this code, please ignore this email.
                                </p>
                            </div>
                        </div>
                    </div>
                `,
                text: `Your CasperID verification code is: ${otp}\n\nThis code expires in 10 minutes. Never share this code with anyone.\n\nIf you didn't request this code, please ignore this email.`
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ OTP email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Failed to send OTP email:', error);
            throw error;
        }
    }

    // Verify SMTP connection
    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ SMTP server connection verified successfully');
            return true;
        } catch (error) {
            console.error('❌ SMTP server connection failed:', error);
            return false;
        }
    }

    async sendJobApplication({ jobTitle, applicantEmail, applicantName, applicantId, profileData, tier, topSkills }) {
        try {
            console.log(`📧 Sending Job Application for ${jobTitle} from ${applicantEmail}`);

            const profileUrl = `${process.env.FRONTEND_URL}/profile/${applicantId}`;
            const tierLabel = tier === 'layer_3' ? 'Fully Verified Identity' :
                tier === 'layer_2' ? 'Liveness Verified' :
                    tier === 'layer_1' ? 'Email Verified' : 'Unverified';
            const tierColor = tier === 'layer_3' ? '#059669' :
                tier === 'layer_2' ? '#2563eb' :
                    tier === 'layer_1' ? '#ca8a04' : '#6b7280';

            const mailOptions = {
                from: `"CasperID Careers" <${process.env.SUPPORT_EMAIL}>`,
                to: 'careers@casperid.com', // Send to careers team
                replyTo: applicantEmail,
                subject: `New Application: ${jobTitle} - ${applicantName}`,
                html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9ff;">
                        <div style="background: white; border-radius: 24px; padding: 40px; border: 1px solid #e5e7eb; shadow: 0 4px 6px rgba(0,0,0,0.05);">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
                                <h2 style="color: #1f2937; margin: 0; font-size: 24px; font-weight: 800;">New Job Application</h2>
                                <span style="background-color: ${tierColor}15; color: ${tierColor}; padding: 6px 12px; border-radius: 12px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">${tierLabel}</span>
                            </div>

                            <div style="background-color: #f9fafb; padding: 20px; border-radius: 16px; margin-bottom: 32px;">
                                <p style="color: #6b7280; font-size: 12px; font-weight: 700; text-transform: uppercase; margin: 0 0 4px 0;">Applying for</p>
                                <p style="color: #1f2937; font-size: 18px; font-weight: 800; margin: 0;">${jobTitle}</p>
                            </div>
                            
                            <h3 style="color: #1f2937; font-size: 16px; font-weight: 800; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Applicant Profile</h3>
                            
                            <div style="display: flex; gap: 20px; margin-bottom: 24px;">
                                <div style="flex: 1;">
                                    <table style="width: 100%; border-collapse: collapse;">
                                        <tr>
                                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;">Name</td>
                                            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${applicantName}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email</td>
                                            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${applicantEmail}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">CasperID</td>
                                            <td style="padding: 8px 0; color: #8652e2; font-size: 14px; font-weight: 800;">${applicantId || 'N/A'}</td>
                                        </tr>
                                        ${profileData?.headline ? `
                                        <tr>
                                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Headline</td>
                                            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${profileData.headline}</td>
                                        </tr>` : ''}
                                    </table>
                                </div>
                            </div>

                            ${topSkills && topSkills.length > 0 ? `
                            <div style="margin-bottom: 32px;">
                                <p style="color: #6b7280; font-size: 12px; font-weight: 700; text-transform: uppercase; margin: 0 0 12px 0;">Top Skills</p>
                                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                    ${topSkills.map(skill => `
                                        <span style="background-color: #f3f4f6; color: #374151; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; margin-right: 4px; margin-bottom: 4px; display: inline-block;">${skill}</span>
                                    `).join('')}
                                </div>
                            </div>` : ''}

                            <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 16px; margin-top: 32px;">
                                <a href="${profileUrl}" style="background-color: #8652e2; color: white; padding: 16px 24px; border-radius: 12px; text-decoration: none; font-weight: 800; text-align: center; display: block; shadow: 0 10px 15px -3px rgba(134, 82, 226, 0.3);">View Full Profile</a>
                                <div style="margin-top: 12px; text-align: center;">
                                    <a href="mailto:${applicantEmail}" style="color: #6b7280; text-decoration: none; font-size: 13px; font-weight: 600;">Reply via Email</a>
                                </div>
                            </div>

                            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f3f4f6; text-align: center;">
                                <p style="color: #9ca3af; font-size: 11px; margin: 0;">This application was verified and secured by CasperID Protocol.</p>
                            </div>
                        </div>
                    </div>
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Job Application email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Failed to send Job Application email:', error);
            throw error;
        }
    }

    async sendAffiliateApplication({ applicantEmail, applicantName, applicantId, location }) {
        try {
            console.log(`📧 Sending Affiliate Application from ${applicantEmail}`);

            const mailOptions = {
                from: `"CasperID Partners" <${process.env.SUPPORT_EMAIL}>`,
                to: 'careers@casperid.com',
                replyTo: applicantEmail,
                subject: `New Affiliate Application - ${applicantName}`,
                html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9ff;">
                        <div style="background: white; border-radius: 16px; padding: 40px; border: 1px solid #e5e7eb;">
                            <div style="text-align: center; margin-bottom: 24px;">
                                <span style="background-color: #ecfdf5; color: #059669; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: bold; text-transform: uppercase;">New Partner Lead</span>
                            </div>
                            <h2 style="color: #1f2937; margin: 0 0 16px 0; text-align: center;">Affiliate Program Application</h2>
                            
                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                            
                            <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 12px;">Applicant Details</h3>
                            <ul style="list-style: none; padding: 0; color: #4b5563;">
                                <li style="margin-bottom: 8px;"><strong>Name:</strong> ${applicantName}</li>
                                <li style="margin-bottom: 8px;"><strong>Email:</strong> ${applicantEmail}</li>
                                <li style="margin-bottom: 8px;"><strong>CasperID:</strong> ${applicantId || 'N/A'}</li>
                                <li style="margin-bottom: 8px;"><strong>Location/Region:</strong> ${location || 'Not Specified'}</li>
                            </ul>

                            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-top: 24px;">
                                <p style="margin: 0; font-size: 14px; color: #6b7280;">This user has applied via the "Relationship Manager" landing page.</p>
                            </div>

                            <div style="margin-top: 32px; text-align: center;">
                                <a href="mailto:${applicantEmail}" style="background-color: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Approve & Reply</a>
                            </div>
                        </div>
                    </div>
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Affiliate Application email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Failed to send Affiliate Application email:', error);
            throw error;
        }
    }

    async sendVerificationRejectionEmail(email, { reason, requestId }) {
        try {
            console.log(`📧 Sending verification rejection email to ${email}`);

            const mailOptions = {
                from: `"CasperID Verification" <${this.smtpConfig.auth.user}>`,
                to: email,
                subject: 'Your CasperID Verification Request Update',
                html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9ff;">
                        <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 30px; border-radius: 12px 12px 0 0;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Verification Update</h1>
                        </div>

                        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                                We've reviewed your Layer 3 (Full KYC) verification request and unfortunately, we were unable to approve it at this time.
                            </p>

                            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                                <h3 style="color: #991b1b; margin: 0 0 8px 0; font-size: 14px;">Reason for Rejection:</h3>
                                <p style="color: #7f1d1d; margin: 0; font-size: 14px;">${reason}</p>
                            </div>

                            <p style="color: #374151; font-size: 14px; line-height: 1.6;">
                                <strong>What you can do:</strong>
                            </p>
                            <ul style="color: #374151; font-size: 14px; line-height: 1.8;">
                                <li>Review the rejection reason above</li>
                                <li>Ensure your document is clear and all information is visible</li>
                                <li>Make sure the document is not expired</li>
                                <li>Try submitting again with a valid document</li>
                            </ul>

                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                                    Request ID: ${requestId}<br>
                                    If you believe this was an error, please contact support.
                                </p>
                            </div>
                        </div>

                        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
                            © ${new Date().getFullYear()} CasperID. All rights reserved.
                        </p>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Verification rejection email sent to ${email}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to send verification rejection email:', error);
            throw error;
        }
    }
}

module.exports = new EmailService();