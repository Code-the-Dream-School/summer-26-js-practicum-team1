#!/usr/bin/env node
/**
 * Smoke-test acceptance email delivery with current .env settings.
 *
 * Usage:
 *   node scripts/send-test-email.js you@example.com
 *
 * Requires EMAIL_DELIVERY_MODE=smtp (Gmail App Password) or sendgrid for a real inbox.
 * With mode=log, prints the payload to the console instead.
 */
require('dotenv').config();

const {
  sendAcceptanceEmail,
  getEmailConfig,
} = require('../src/services/emailDelivery.service');

async function main() {
  const to = process.argv[2] || process.env.EMAIL_TO_OVERRIDE;
  if (!to) {
    console.error(
      'Usage: node scripts/send-test-email.js you@example.com\n' +
        'Or set EMAIL_TO_OVERRIDE in .env'
    );
    process.exit(1);
  }

  const config = getEmailConfig();
  console.log(
    JSON.stringify(
      {
        mode: config.mode,
        emailFrom: config.emailFrom,
        to,
        hasSendgridKey: Boolean(config.sendgridApiKey),
        hasSmtpAuth: Boolean(config.smtp?.user && config.smtp?.pass),
      },
      null,
      2
    )
  );

  await sendAcceptanceEmail({
    to,
    payload: {
      volunteerName: 'Emma Garcia',
      requestTitle: 'Need help picking up groceries',
      acceptedAt: new Date().toISOString(),
    },
  });

  console.log('Done. Check inbox (or console log if mode=log).');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
