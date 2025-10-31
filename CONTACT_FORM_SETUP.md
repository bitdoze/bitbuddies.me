# Contact Form Email Setup Guide

## Quick Start

The contact form is ready to use and will save messages to the database. To enable email notifications, follow these steps:

## Step 1: Add Environment Variables

Add these variables to your `.env.local` file:

```bash
# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@bitbuddies.me
SMTP_FROM_NAME=BitBuddies
EMAIL_TO=admin@bitbuddies.me
```

**Note**: `EMAIL_TO` is where contact form submissions will be sent (your admin email).

## Step 2: Choose an Email Service

### Option A: Gmail (Quick Setup for Testing)

1. Use your Gmail account
2. Enable 2-Factor Authentication
3. Generate an App Password: https://myaccount.google.com/apppasswords
4. Use the app password as `SMTP_PASSWORD`

```bash
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourgmail@gmail.com
SMTP_PASSWORD=your-16-digit-app-password
SMTP_FROM=yourgmail@gmail.com
SMTP_FROM_NAME=BitBuddies
EMAIL_TO=yourgmail@gmail.com
```

### Option B: SendGrid (Recommended for Production)

1. Sign up at https://sendgrid.com (free tier: 100 emails/day)
2. Get API key from Settings → API Keys
3. Update `convex/contactMessagesActions.ts` with SendGrid API:

```typescript
const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`
  },
  body: JSON.stringify({
    personalizations: [{
      to: [{ email: emailTo }],
      subject: emailSubject
    }],
    from: {
      email: smtpFrom,
      name: smtpFromName || "BitBuddies"
    },
    reply_to: {
      email: message.email,
      name: message.name
    },
    content: [{
      type: "text/plain",
      value: emailBody
    }]
  })
});

if (!response.ok) {
  throw new Error(`SendGrid API error: ${response.statusText}`);
}
```

Environment variables:
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
EMAIL_TO=admin@bitbuddies.me
```

### Option C: Resend (Modern, Developer-Friendly)

1. Sign up at https://resend.com (free tier: 3,000 emails/month)
2. Get API key
3. Update `convex/contactMessagesActions.ts`:

```typescript
const response = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.RESEND_API_KEY}`
  },
  body: JSON.stringify({
    from: `${smtpFromName || "BitBuddies"} <${smtpFrom}>`,
    to: [emailTo],
    subject: emailSubject,
    text: emailBody,
    reply_to: message.email
  })
});

if (!response.ok) {
  throw new Error(`Resend API error: ${response.statusText}`);
}
```

Environment variables:
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
SMTP_FROM=onboarding@resend.dev  # or your verified domain
EMAIL_TO=admin@bitbuddies.me
```

### Option D: Postmark (Transactional Email Specialist)

1. Sign up at https://postmarkapp.com (free tier: 100 emails/month)
2. Get Server API token
3. Update `convex/contactMessagesActions.ts`:

```typescript
const response = await fetch("https://api.postmarkapp.com/email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Postmark-Server-Token": process.env.POSTMARK_SERVER_TOKEN
  },
  body: JSON.stringify({
    From: `${smtpFromName || "BitBuddies"} <${smtpFrom}>`,
    To: emailTo,
    Subject: emailSubject,
    TextBody: emailBody,
    ReplyTo: message.email,
    MessageStream: "outbound"
  })
});

if (!response.ok) {
  throw new Error(`Postmark API error: ${response.statusText}`);
}
```

Environment variables:
```bash
POSTMARK_SERVER_TOKEN=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
SMTP_FROM=noreply@bitbuddies.me  # must be verified domain
EMAIL_TO=admin@bitbuddies.me
```

## Step 3: Deploy to Convex

After adding environment variables and updating the code:

```bash
# Push environment variables to Convex
bun convex env set SMTP_SERVER smtp.gmail.com
bun convex env set SMTP_PORT 587
bun convex env set SMTP_USER your-email@gmail.com
bun convex env set SMTP_PASSWORD your-password
bun convex env set SMTP_FROM noreply@bitbuddies.me
bun convex env set SMTP_FROM_NAME BitBuddies
bun convex env set EMAIL_TO admin@bitbuddies.me

# Or for API-based services:
bun convex env set SENDGRID_API_KEY your-api-key
bun convex env set EMAIL_TO admin@bitbuddies.me
```

## Step 4: Test the Contact Form

1. Navigate to `/contact`
2. Fill out and submit the form
3. Check:
   - Database: Convex dashboard → `contactMessages` table
   - Email: Check your `EMAIL_TO` inbox
   - Logs: Check Convex logs for email status

## Current Implementation

The current code in `convex/contactMessagesActions.ts` logs email details to console but doesn't send actual emails. This is intentional to avoid accidental emails during development.

**What works now:**
- ✅ Form validation
- ✅ Saves to database
- ✅ Success/error feedback
- ✅ Auto-fills user info if logged in
- ✅ Logs email content to console

**To enable actual email sending:**
1. Choose an email service from above
2. Update the TODO section in `contactMessagesActions.ts`
3. Replace console.log with actual API call
4. Test thoroughly

## Viewing Contact Messages

### Admin Interface (TODO)

Create an admin page at `/admin/contact-messages`:

```typescript
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

function ContactMessagesAdmin() {
  const messages = useQuery(api.contactMessages.list, { status: "new" });

  return (
    <div>
      <h1>Contact Messages</h1>
      {messages?.map(msg => (
        <div key={msg._id}>
          <h3>{msg.subject}</h3>
          <p>From: {msg.name} ({msg.email})</p>
          <p>{msg.message}</p>
          <p>Status: {msg.status}</p>
        </div>
      ))}
    </div>
  );
}
```

### Direct Database Access

Use Convex dashboard:
1. Go to https://dashboard.convex.dev
2. Select your project
3. Click "Data" → "contactMessages" table
4. View all submissions

## Troubleshooting

### Emails Not Sending

1. **Check Convex Logs**: Dashboard → Logs
2. **Verify Environment Variables**: `bun convex env list`
3. **Test Email Service**: Use their web interface/dashboard
4. **Check Error Field**: Query messages and check `emailError` field

### Common Issues

**"SMTP configuration missing"**
- Solution: Add all required environment variables to Convex

**"Authentication failed"**
- Gmail: Use App Password, not regular password
- Other: Verify API key is correct

**"Sender not verified"**
- Solution: Verify your domain/email with the service
- Or use their sandbox domain for testing

**Messages saved but no email**
- Check: `emailSent` field should be `true`
- Check: `emailError` field for error details
- Check: Convex action logs

## Security Best Practices

1. **Never commit credentials**: Use environment variables
2. **Rate limiting**: Consider adding rate limiting to prevent spam
3. **CAPTCHA**: Add reCAPTCHA for production
4. **Input validation**: Already implemented (email format, required fields)
5. **Email verification**: Verify sender email addresses

## Recommended Production Setup

For production, we recommend:

1. **Email Service**: Resend or SendGrid
2. **Rate Limiting**: Max 5 submissions per hour per IP
3. **CAPTCHA**: Google reCAPTCHA v3
4. **Monitoring**: Set up alerts for failed emails
5. **Admin Dashboard**: Create interface to manage messages

## Support

If you encounter issues:
1. Check Convex logs for errors
2. Verify all environment variables are set
3. Test email service separately
4. Review this guide and code comments

For email service specific issues, refer to their documentation:
- SendGrid: https://docs.sendgrid.com
- Resend: https://resend.com/docs
- Postmark: https://postmarkapp.com/developer
- AWS SES: https://docs.aws.amazon.com/ses
