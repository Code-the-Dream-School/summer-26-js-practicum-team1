const { CLIENT_URL } = require('../utils/constants');

const EMAIL_FROM =
  process.env.EMAIL_FROM || 'Neighborhood Helper <noreply@localhost>';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const EMAIL_DELIVERY_MODE =
  process.env.EMAIL_DELIVERY_MODE || (SENDGRID_API_KEY ? 'sendgrid' : 'log');

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

function parseFromAddress(from) {
  const match = from.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    return { email: match[2].trim(), name: match[1].trim() };
  }

  return { email: from.trim() };
}

function buildAcceptanceEmail({ payload }) {
  const dashboardUrl = `${String(CLIENT_URL).replace(/\/$/, '')}/requester-dashboard`;
  const acceptedLabel = formatAcceptedAt(payload.acceptedAt);
  const timeSuffix = acceptedLabel ? ` on ${acceptedLabel}` : '';

  const subject = `${payload.volunteerName} accepted your help request`;
  const text = [
    `Good news! ${payload.volunteerName} accepted your request "${payload.requestTitle}"${timeSuffix}.`,
    '',
    `Sign in to view details: ${dashboardUrl}`,
  ].join('\n');

  const html = [
    `<p>Good news! <strong>${escapeHtml(payload.volunteerName)}</strong> accepted your request <strong>&quot;${escapeHtml(payload.requestTitle)}&quot;</strong>${timeSuffix ? ` on ${escapeHtml(acceptedLabel)}` : ''}.</p>`,
    `<p><a href="${dashboardUrl}">View your request</a></p>`,
  ].join('');

  return { subject, text, html, dashboardUrl };
}

async function sendViaSendGrid({ to, subject, text, html }) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: parseFromAddress(EMAIL_FROM),
      subject,
      content: [
        { type: 'text/plain', value: text },
        { type: 'text/html', value: html },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `SendGrid error ${response.status}: ${body.slice(0, 200)}`
    );
  }
}

async function sendEmail({ to, subject, text, html }) {
  if (EMAIL_DELIVERY_MODE === 'log') {
    console.log(
      JSON.stringify({
        event: 'email_delivery_log',
        to,
        subject,
        text,
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  if (EMAIL_DELIVERY_MODE === 'sendgrid') {
    if (!SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is not configured');
    }

    await sendViaSendGrid({ to, subject, text, html });
    return;
  }

  throw new Error(`Unsupported EMAIL_DELIVERY_MODE: ${EMAIL_DELIVERY_MODE}`);
}

async function sendAcceptanceEmail({ to, payload }) {
  const message = buildAcceptanceEmail({ payload });
  await sendEmail({ to, ...message });
}

module.exports = {
  buildAcceptanceEmail,
  sendAcceptanceEmail,
  sendEmail,
};
