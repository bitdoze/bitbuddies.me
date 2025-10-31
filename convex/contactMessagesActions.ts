import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Send email notification for a contact message
 * This action handles SMTP email sending
 */
export const sendEmail = internalAction({
	args: {
		messageId: v.id("contactMessages"),
	},
	handler: async (ctx, args) => {
		// Fetch the message directly from database
		const message = await ctx.runQuery(internal.contactMessagesActions.getMessage, {
			messageId: args.messageId,
		});

		if (!message) {
			console.error("Message not found");
			return;
		}

		// Get SMTP configuration from environment variables
		const smtpServer = process.env.SMTP_SERVER;
		const smtpPort = process.env.SMTP_PORT;
		const smtpUser = process.env.SMTP_USER;
		const smtpPassword = process.env.SMTP_PASSWORD;
		const smtpFrom = process.env.SMTP_FROM;
		const smtpFromName = process.env.SMTP_FROM_NAME;
		const emailTo = process.env.EMAIL_TO || process.env.SMTP_FROM;

		// Check if SMTP is configured
		if (!smtpServer || !smtpPort || !smtpUser || !smtpPassword || !smtpFrom || !emailTo) {
			console.error("SMTP configuration missing - email not sent");
			// Update message with error
			await ctx.runMutation(internal.contactMessagesActions.updateEmailStatus, {
				messageId: args.messageId,
				emailSent: false,
				emailError: "SMTP configuration missing",
			});
			return;
		}

		try {
			// Prepare email content
			const emailSubject = `[BitBuddies Contact] ${message.subject}`;
			const emailBody = `
New contact form submission from BitBuddies.me

Name: ${message.name}
Email: ${message.email}
Subject: ${message.subject}

Message:
${message.message}

---
Submitted at: ${new Date(message.createdAt).toLocaleString()}
Message ID: ${args.messageId}
			`.trim();

			// For now, just log the email details
			// In production, you would integrate with an email service API
			// such as SendGrid, Postmark, Resend, AWS SES, etc.

			console.log("Email would be sent:", {
				to: emailTo,
				from: `${smtpFromName || "BitBuddies"} <${smtpFrom}>`,
				subject: emailSubject,
				body: emailBody,
			});

			// TODO: Integrate with actual email service
			// Example with SendGrid, Resend, or similar:
			// const response = await fetch("https://api.emailservice.com/send", {
			//   method: "POST",
			//   headers: {
			//     "Content-Type": "application/json",
			//     "Authorization": `Bearer ${process.env.EMAIL_API_KEY}`
			//   },
			//   body: JSON.stringify({
			//     from: { email: smtpFrom, name: smtpFromName },
			//     to: [{ email: smtpFrom }],
			//     subject: emailSubject,
			//     text: emailBody,
			//     replyTo: { email: message.email, name: message.name }
			//   })
			// });

			// Update message as sent
			await ctx.runMutation(internal.contactMessagesActions.updateEmailStatus, {
				messageId: args.messageId,
				emailSent: true,
			});
		} catch (error) {
			console.error("Error sending email:", error);
			// Update message with error
			await ctx.runMutation(internal.contactMessagesActions.updateEmailStatus, {
				messageId: args.messageId,
				emailSent: false,
				emailError: error instanceof Error ? error.message : "Unknown error",
			});
		}
	},
});

/**
 * Internal query to get a message by ID
 */
export const getMessage = internalQuery({
	args: {
		messageId: v.id("contactMessages"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.messageId);
	},
});

/**
 * Internal mutation to update email status
 */
export const updateEmailStatus = internalMutation({
	args: {
		messageId: v.id("contactMessages"),
		emailSent: v.boolean(),
		emailError: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const updates: {
			emailSent: boolean;
			updatedAt: number;
			emailError?: string;
		} = {
			emailSent: args.emailSent,
			updatedAt: Date.now(),
		};

		if (args.emailError !== undefined) {
			updates.emailError = args.emailError;
		}

		await ctx.db.patch(args.messageId, updates);
	},
});
