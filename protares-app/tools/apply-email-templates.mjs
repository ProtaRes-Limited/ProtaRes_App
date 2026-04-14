/**
 * Applies branded ProtaRes email templates to Supabase Auth.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx node apply-email-templates.mjs
 */

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const REF = 'dloyziwowuupyesuwlfg';

if (!TOKEN) {
  console.error('Set SUPABASE_ACCESS_TOKEN env var');
  process.exit(1);
}

// ── Shared email wrapper ─────────────────────────────────────────────
// NHS Blue primary (#005EB8), dark text (#212B32), pale grey bg (#F0F4F5)

function wrap(body) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#F0F4F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F4F5;padding:32px 16px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(33,43,50,0.08)">
<!-- Header -->
<tr><td style="background-color:#005EB8;padding:28px 32px;text-align:center">
<h1 style="margin:0;color:#FFFFFF;font-size:26px;font-weight:700;letter-spacing:-0.3px">ProtaRes</h1>
<p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;font-weight:400">Emergency Response Coordination</p>
</td></tr>
<!-- Body -->
<tr><td style="padding:32px 32px 24px">
${body}
</td></tr>
<!-- Footer -->
<tr><td style="padding:20px 32px 28px;border-top:1px solid #D8DDE0;text-align:center">
<p style="margin:0;font-size:12px;color:#768692;line-height:18px">ProtaRes Ltd &middot; NHS DTAC Aligned<br>This is an automated message. Do not reply to this email.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function btn(url, label) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0"><tr><td>
<a href="${url}" target="_blank" style="display:inline-block;background-color:#005EB8;color:#FFFFFF;font-size:16px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;letter-spacing:0.2px">${label}</a>
</td></tr></table>`;
}

function code(token) {
  return `<div style="margin:24px 0;background-color:#F0F4F5;border:2px solid #D8DDE0;border-radius:8px;padding:20px;text-align:center">
<p style="margin:0 0 8px;font-size:13px;color:#768692;font-weight:500">Your verification code</p>
<p style="margin:0;font-size:32px;font-weight:700;color:#005EB8;letter-spacing:6px;font-family:monospace">${token}</p>
</div>`;
}

function greeting() {
  return `<p style="margin:0 0 16px;font-size:16px;color:#212B32;line-height:24px">Hello,</p>`;
}

function paragraph(text) {
  return `<p style="margin:0 0 16px;font-size:15px;color:#4C6272;line-height:24px">${text}</p>`;
}

function heading(text) {
  return `<h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#212B32">${text}</h2>`;
}

function securityAlert(icon, text) {
  return `<div style="margin:0 0 20px;padding:16px;background-color:#FBE6E4;border-left:4px solid #DA291C;border-radius:4px">
<p style="margin:0;font-size:14px;color:#DA291C;font-weight:600">${icon} ${text}</p>
</div>`;
}

function infoBox(text) {
  return `<div style="margin:16px 0;padding:16px;background-color:#E1EEFA;border-left:4px solid #005EB8;border-radius:4px">
<p style="margin:0;font-size:14px;color:#003087;line-height:20px">${text}</p>
</div>`;
}

// ── Templates ────────────────────────────────────────────────────────

const templates = {
  // AUTH: Confirm sign up
  mailer_subjects_confirmation: 'Verify your ProtaRes account',
  mailer_templates_confirmation_content: wrap(
    heading('Verify your email') +
    greeting() +
    paragraph('Thank you for creating a ProtaRes account. Please verify your email address to activate your account and start responding to emergencies.') +
    btn('{{ .ConfirmationURL }}', 'Verify my email') +
    paragraph('If the button doesn\'t work, copy and paste this link into your browser:') +
    `<p style="margin:0 0 16px;font-size:13px;color:#768692;word-break:break-all">{{ .ConfirmationURL }}</p>` +
    infoBox('This link expires in 1 hour. If you didn\'t create a ProtaRes account, you can safely ignore this email.')
  ),

  // AUTH: Password recovery
  mailer_subjects_recovery: 'Reset your ProtaRes password',
  mailer_templates_recovery_content: wrap(
    heading('Reset your password') +
    greeting() +
    paragraph('We received a request to reset the password for your ProtaRes account. Click the button below to choose a new password.') +
    btn('{{ .ConfirmationURL }}', 'Reset password') +
    paragraph('If the button doesn\'t work, copy and paste this link into your browser:') +
    `<p style="margin:0 0 16px;font-size:13px;color:#768692;word-break:break-all">{{ .ConfirmationURL }}</p>` +
    infoBox('This link expires in 1 hour. If you didn\'t request a password reset, please ignore this email — your account is safe.')
  ),

  // AUTH: Invite user
  mailer_subjects_invite: 'You\'ve been invited to join ProtaRes',
  mailer_templates_invite_content: wrap(
    heading('You\'re invited') +
    greeting() +
    paragraph('You\'ve been invited to join ProtaRes — an NHS-aligned emergency response coordination platform for verified healthcare professionals and trained first aiders.') +
    btn('{{ .ConfirmationURL }}', 'Accept invitation') +
    paragraph('If the button doesn\'t work, copy and paste this link into your browser:') +
    `<p style="margin:0 0 16px;font-size:13px;color:#768692;word-break:break-all">{{ .ConfirmationURL }}</p>` +
    infoBox('Every second counts. Once you\'re set up, you can verify your credentials and start responding to nearby emergencies.')
  ),

  // AUTH: Magic link
  mailer_subjects_magic_link: 'Your ProtaRes sign-in link',
  mailer_templates_magic_link_content: wrap(
    heading('Sign in to ProtaRes') +
    greeting() +
    paragraph('Click the button below to sign in to your ProtaRes account. No password required.') +
    btn('{{ .ConfirmationURL }}', 'Sign in to ProtaRes') +
    paragraph('If the button doesn\'t work, copy and paste this link into your browser:') +
    `<p style="margin:0 0 16px;font-size:13px;color:#768692;word-break:break-all">{{ .ConfirmationURL }}</p>` +
    infoBox('This link expires in 1 hour and can only be used once. If you didn\'t request this, you can safely ignore it.')
  ),

  // AUTH: Email change confirmation
  mailer_subjects_email_change: 'Confirm your new email address',
  mailer_templates_email_change_content: wrap(
    heading('Confirm email change') +
    greeting() +
    paragraph('You\'ve requested to change the email address on your ProtaRes account from <strong>{{ .Email }}</strong> to a new address. Please confirm this change by clicking the button below.') +
    btn('{{ .ConfirmationURL }}', 'Confirm email change') +
    paragraph('If the button doesn\'t work, copy and paste this link into your browser:') +
    `<p style="margin:0 0 16px;font-size:13px;color:#768692;word-break:break-all">{{ .ConfirmationURL }}</p>` +
    securityAlert('&#9888;', 'If you did not request this change, please secure your account immediately by resetting your password.')
  ),

  // AUTH: Reauthentication
  mailer_subjects_reauthentication: 'ProtaRes security verification',
  mailer_templates_reauthentication_content: wrap(
    heading('Security verification') +
    greeting() +
    paragraph('You\'re performing a sensitive action on your ProtaRes account. Enter the verification code below to continue.') +
    code('{{ .Token }}') +
    infoBox('This code expires in 10 minutes. If you didn\'t initiate this action, please change your password immediately.')
  ),

  // SECURITY: Password changed
  mailer_subjects_password_changed_notification: 'Your ProtaRes password was changed',
  mailer_templates_password_changed_notification_content: wrap(
    heading('Password changed') +
    greeting() +
    paragraph('The password for your ProtaRes account (<strong>{{ .Email }}</strong>) was successfully changed on {{ .Timestamp }}.') +
    securityAlert('&#128274;', 'If you did not make this change, your account may be compromised. Reset your password immediately and contact us.') +
    infoBox('For your security, we recommend using a unique password with at least 10 characters, including letters and numbers.')
  ),

  // SECURITY: Email changed
  mailer_subjects_email_changed_notification: 'Your ProtaRes email address was changed',
  mailer_templates_email_changed_notification_content: wrap(
    heading('Email address changed') +
    greeting() +
    paragraph('The email address for your ProtaRes account has been changed from <strong>{{ .Email }}</strong> to a new address on {{ .Timestamp }}.') +
    securityAlert('&#128274;', 'If you did not make this change, your account may be compromised. Contact support immediately.') +
    paragraph('If you made this change, no action is needed.')
  ),

  // SECURITY: Phone changed
  mailer_subjects_phone_changed_notification: 'Your ProtaRes phone number was changed',
  mailer_templates_phone_changed_notification_content: wrap(
    heading('Phone number changed') +
    greeting() +
    paragraph('The phone number associated with your ProtaRes account (<strong>{{ .Email }}</strong>) was changed on {{ .Timestamp }}.') +
    paragraph('Your phone number is used for SMS fallback alerts when push notifications can\'t reach you during an emergency.') +
    securityAlert('&#128274;', 'If you did not make this change, please review your account security settings immediately.')
  ),

  // SECURITY: MFA factor enrolled
  mailer_subjects_mfa_factor_enrolled_notification: 'New security factor added to your ProtaRes account',
  mailer_templates_mfa_factor_enrolled_notification_content: wrap(
    heading('New security factor added') +
    greeting() +
    paragraph('A new multi-factor authentication method (<strong>{{ .FactorType }}</strong>) has been added to your ProtaRes account (<strong>{{ .Email }}</strong>) on {{ .Timestamp }}.') +
    infoBox('Multi-factor authentication adds an extra layer of security to your account, helping protect patient-facing emergency response data.') +
    securityAlert('&#128274;', 'If you did not add this security factor, please remove it from your account settings and change your password immediately.')
  ),

  // SECURITY: MFA factor unenrolled
  mailer_subjects_mfa_factor_unenrolled_notification: 'A security factor was removed from your ProtaRes account',
  mailer_templates_mfa_factor_unenrolled_notification_content: wrap(
    heading('Security factor removed') +
    greeting() +
    paragraph('A multi-factor authentication method (<strong>{{ .FactorType }}</strong>) has been removed from your ProtaRes account (<strong>{{ .Email }}</strong>) on {{ .Timestamp }}.') +
    securityAlert('&#128274;', 'If you did not remove this factor, your account may be compromised. Please secure your account immediately by changing your password and re-enabling MFA.') +
    infoBox('We strongly recommend keeping at least one multi-factor method enabled to protect access to your ProtaRes credentials and response history.')
  ),
};

// ── Apply ────────────────────────────────────────────────────────────

async function apply() {
  console.log(`Applying ${Object.keys(templates).length / 2} email templates to project ${REF}…\n`);

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${REF}/config/auth`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templates),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error(`FAILED: HTTP ${res.status}\n${text}`);
    process.exit(1);
  }

  const data = await res.json();

  // Verify each subject was applied
  let success = 0;
  for (const [key, expected] of Object.entries(templates)) {
    if (key.includes('subjects')) {
      const actual = data[key];
      if (actual === expected) {
        console.log(`  ✓ ${key}`);
        success++;
      } else {
        console.log(`  ✗ ${key} — mismatch`);
      }
    }
  }
  console.log(`\nDone. ${success} subjects verified.`);
}

apply();
