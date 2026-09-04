const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { CLIENT_URL } = require('../utils/constants');

const EMAIL_LOGO_PATH = path.join(__dirname, '../../assets/email-logo.png');
const EMAIL_LOGO_CID = 'nh-logo';

function getEmailLogoAttachment() {
  if (!fs.existsSync(EMAIL_LOGO_PATH)) {
    return null;
  }

  return {
    filename: 'email-logo.png',
    path: EMAIL_LOGO_PATH,
    cid: EMAIL_LOGO_CID,
    contentType: 'image/png',
  };
}

function getEmailLogoBase64() {
  if (!fs.existsSync(EMAIL_LOGO_PATH)) {
    return null;
  }

  return fs.readFileSync(EMAIL_LOGO_PATH).toString('base64');
}

function getEmailConfig() {
  const sendgridApiKey = process.env.SENDGRID_API_KEY || '';
  const smtpUser = process.env.SMTP_USER || '';
  const smtpPass = process.env.SMTP_PASS || '';
  const mode =
    process.env.EMAIL_DELIVERY_MODE ||
    (sendgridApiKey ? 'sendgrid' : smtpUser && smtpPass ? 'smtp' : 'log');

  const smtpPort = Number(process.env.SMTP_PORT || 465);

  return {
    mode,
    sendgridApiKey,
    emailFrom:
      process.env.EMAIL_FROM ||
      (smtpUser
        ? `Neighborhood Helper <${smtpUser}>`
        : 'Neighborhood Helper <noreply@localhost>'),
    emailToOverride: (process.env.EMAIL_TO_OVERRIDE || '').trim(),
    clientUrl: String(
      process.env.CLIENT_URL || CLIENT_URL || 'http://localhost:5173'
    ).replace(/\/$/, ''),
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: smtpPort,
      secure:
        process.env.SMTP_SECURE != null
          ? process.env.SMTP_SECURE === 'true'
          : smtpPort === 465,
      user: smtpUser,
      pass: smtpPass,
    },
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatAcceptedAt(iso) {
  if (!iso) {
    return '';
  }

  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function initialsFromName(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function parseFromAddress(from) {
  const match = from.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    return { email: match[2].trim(), name: match[1].trim() };
  }

  return { email: from.trim() };
}

function buildAcceptanceEmail({ payload }) {
  const { clientUrl } = getEmailConfig();
  const dashboardUrl = `${clientUrl}/requester-dashboard`;
  const acceptedLabel = formatAcceptedAt(payload.acceptedAt);
  const timeSuffix = acceptedLabel ? ` on ${acceptedLabel}` : '';
  const volunteerName = String(payload.volunteerName || '');
  const requestTitle = String(payload.requestTitle || '');
  const initials = initialsFromName(volunteerName);

  const subject = `${volunteerName} accepted your help request`;
  const text = [
    `Good news! ${volunteerName} accepted your request "${requestTitle}"${timeSuffix}.`,
    '',
    `Sign in to view details: ${dashboardUrl}`,
  ].join('\n');

  const safeVolunteer = escapeHtml(volunteerName);
  const safeTitle = escapeHtml(requestTitle);
  const safeAccepted = escapeHtml(acceptedLabel);
  const safeInitials = escapeHtml(initials);
  const logoBase64 = getEmailLogoBase64();
  // Data URI so the real app logo renders in clients and in local HTML preview.
  // SMTP/SendGrid still attach the same file inline (cid) as a reliable fallback.
  const logoSrc = logoBase64
    ? `data:image/png;base64,${logoBase64}`
    : `cid:${EMAIL_LOGO_CID}`;
  const logoImg = logoBase64
    ? `<img src="${logoSrc}" width="32" height="32" alt="Neighborhood Helper" style="display:block;width:32px;height:32px;border:0;" />`
    : `<img src="cid:${EMAIL_LOGO_CID}" width="32" height="32" alt="Neighborhood Helper" style="display:block;width:32px;height:32px;border:0;" />`;

  // Table-based layout for email clients; forest/sage matches app theme.
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#eef4f0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#171717;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef4f0;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e7e5e0;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:20px 28px 12px;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:middle;width:32px;">${logoImg}</td>
                  <td style="padding-left:10px;font-size:16px;font-weight:700;color:#171717;vertical-align:middle;">Neighborhood Helper</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 8px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#1e5631;border-radius:10px;">
                <tr>
                  <td style="padding:22px;">
                    <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#8fd4a0;">Accepted</p>
                    <h1 style="margin:0;font-size:22px;line-height:1.3;font-weight:700;color:#ffffff;">A volunteer accepted your request</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 8px;font-size:16px;line-height:1.55;color:#171717;">
              Good news! <strong>${safeVolunteer}</strong> accepted your help request.
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eaf3ec;border:1px solid #d7e8dd;border-radius:10px;">
                <tr>
                  <td style="padding:14px 16px;width:44px;vertical-align:middle;">
                    <div style="width:44px;height:44px;border-radius:22px;background:#1e5631;color:#ffffff;font-size:14px;font-weight:700;text-align:center;line-height:44px;">${safeInitials}</div>
                  </td>
                  <td style="padding:14px 16px 14px 0;vertical-align:middle;">
                    <p style="margin:0 0 2px;font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#345a41;">Your volunteer</p>
                    <p style="margin:0;font-size:16px;font-weight:700;color:#143d23;">${safeVolunteer}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f8f6;border:1px solid #e7e5e0;border-radius:10px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0 0 6px;font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#6b6b6b;">Help request</p>
                    <p style="margin:0;font-size:17px;font-weight:700;color:#171717;">${safeTitle}</p>
                    ${
                      acceptedLabel
                        ? `<p style="margin:10px 0 0;padding-top:10px;border-top:1px solid #e7e5e0;font-size:13px;color:#6b6b6b;"><strong style="color:#1e5631;">When</strong> · ${safeAccepted}</p>`
                        : ''
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 28px 8px;font-size:14px;line-height:1.55;color:#6b6b6b;">
              Sign in to view details, message your volunteer, and track the request on your dashboard.
            </td>
          </tr>
          <tr>
            <td style="padding:12px 28px 28px;">
              <a href="${dashboardUrl}" style="display:inline-block;background:#1e5631;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:8px;">View your request</a>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 22px;border-top:1px solid #e7e5e0;background:#f8f8f6;font-size:12px;line-height:1.55;color:#9c9c98;">
              You’re receiving this because a volunteer accepted your help request on Neighborhood Helper.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html, dashboardUrl };
}

async function sendViaSendGrid({
  to,
  subject,
  text,
  html,
  emailFrom,
  sendgridApiKey,
  logoAttachment,
}) {
  const payload = {
    personalizations: [{ to: [{ email: to }] }],
    from: parseFromAddress(emailFrom),
    subject,
    content: [
      { type: 'text/plain', value: text },
      { type: 'text/html', value: html },
    ],
  };

  if (logoAttachment) {
    payload.attachments = [
      {
        content: fs.readFileSync(logoAttachment.path).toString('base64'),
        filename: logoAttachment.filename,
        type: logoAttachment.contentType,
        disposition: 'inline',
        content_id: logoAttachment.cid,
      },
    ];
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sendgridApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `SendGrid error ${response.status}: ${body.slice(0, 200)}`
    );
  }
}

async function sendViaSmtp({
  to,
  subject,
  text,
  html,
  emailFrom,
  smtp,
  logoAttachment,
}) {
  if (!smtp.user || !smtp.pass) {
    throw new Error('SMTP_USER and SMTP_PASS are required for smtp mode');
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  const mail = {
    from: emailFrom,
    to,
    subject,
    text,
    html,
  };

  if (logoAttachment) {
    mail.attachments = [
      {
        filename: logoAttachment.filename,
        path: logoAttachment.path,
        cid: logoAttachment.cid,
        contentType: logoAttachment.contentType,
        contentDisposition: 'inline',
      },
    ];
  }

  await transporter.sendMail(mail);
}

function resolveRecipient(to) {
  const { emailToOverride } = getEmailConfig();
  if (emailToOverride) {
    return { to: emailToOverride, overriddenFrom: to };
  }
  return { to, overriddenFrom: null };
}

function logSent({ provider, to, overriddenFrom, subject }) {
  console.log(
    JSON.stringify({
      event: 'email_delivery_sent',
      provider,
      to,
      overriddenFrom,
      subject,
      timestamp: new Date().toISOString(),
    })
  );
}

async function sendEmail({ to, subject, text, html }) {
  const config = getEmailConfig();
  const resolved = resolveRecipient(to);
  const logoAttachment = getEmailLogoAttachment();

  if (config.mode === 'log') {
    console.log(
      JSON.stringify({
        event: 'email_delivery_log',
        to: resolved.to,
        overriddenFrom: resolved.overriddenFrom,
        subject,
        text,
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  if (config.mode === 'sendgrid') {
    if (!config.sendgridApiKey) {
      throw new Error('SENDGRID_API_KEY is not configured');
    }

    await sendViaSendGrid({
      to: resolved.to,
      subject,
      text,
      html,
      emailFrom: config.emailFrom,
      sendgridApiKey: config.sendgridApiKey,
      logoAttachment,
    });

    logSent({
      provider: 'sendgrid',
      to: resolved.to,
      overriddenFrom: resolved.overriddenFrom,
      subject,
    });
    return;
  }

  if (config.mode === 'smtp') {
    await sendViaSmtp({
      to: resolved.to,
      subject,
      text,
      html,
      emailFrom: config.emailFrom,
      smtp: config.smtp,
      logoAttachment,
    });

    logSent({
      provider: 'smtp',
      to: resolved.to,
      overriddenFrom: resolved.overriddenFrom,
      subject,
    });
    return;
  }

  throw new Error(`Unsupported EMAIL_DELIVERY_MODE: ${config.mode}`);
}

async function sendAcceptanceEmail({ to, payload }) {
  const message = buildAcceptanceEmail({ payload });
  await sendEmail({ to, ...message });
}

module.exports = {
  buildAcceptanceEmail,
  sendAcceptanceEmail,
  sendEmail,
  getEmailConfig,
};
