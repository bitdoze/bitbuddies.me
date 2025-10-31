import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
	// ============================================================================
	// USERS & AUTHENTICATION
	// ============================================================================

	/**
	 * Users table - synced from Clerk
	 * Extended with application-specific data
	 */
	users: defineTable({
		// Clerk user ID (primary identifier)
		clerkId: v.string(),
		email: v.string(),
		// User role for access control
		role: v.union(v.literal('user'), v.literal('admin')),
		// Account status
		isActive: v.boolean(),
		// Timestamps
		lastLoginAt: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index('by_clerk_id', ['clerkId'])
		.index('by_email', ['email'])
		.index('by_role', ['role']),

	/**
	 * User profiles - extended user information
	 */
	profiles: defineTable({
		userId: v.id('users'),
		// Personal information
		firstName: v.optional(v.string()),
		lastName: v.optional(v.string()),
		displayName: v.optional(v.string()),
		bio: v.optional(v.string()),
		avatarUrl: v.optional(v.string()),
		// Contact & social
		website: v.optional(v.string()),
		twitter: v.optional(v.string()),
		linkedin: v.optional(v.string()),
		github: v.optional(v.string()),
		// Preferences
		emailNotifications: v.boolean(),
		// Timestamps
		updatedAt: v.number(),
	})
		.index('by_user_id', ['userId'])
		.index('by_display_name', ['displayName']),

	// ============================================================================
	// SUBSCRIPTIONS
	// ============================================================================

	/**
	 * Active subscriptions - current subscription status per user
	 */
	subscriptions: defineTable({
		userId: v.id('users'),
		// Subscription tier
		tier: v.union(
			v.literal('free'),
			v.literal('basic'),
			v.literal('premium'),
		),
		// Status
		status: v.union(
			v.literal('active'),
			v.literal('cancelled'),
			v.literal('expired'),
			v.literal('trial'),
		),
		// Payment details
		stripeCustomerId: v.optional(v.string()),
		stripeSubscriptionId: v.optional(v.string()),
		// Billing
		priceId: v.optional(v.string()),
		currency: v.optional(v.string()),
		amount: v.optional(v.number()),
		// Dates
		startDate: v.number(),
		endDate: v.optional(v.number()),
		trialEndDate: v.optional(v.number()),
		cancelledAt: v.optional(v.number()),
		// Timestamps
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index('by_user_id', ['userId'])
		.index('by_status', ['status'])
		.index('by_stripe_subscription_id', ['stripeSubscriptionId'])
		.index('by_tier', ['tier']),

	/**
	 * Subscription history - historical record of all subscriptions
	 */
	subscriptionHistory: defineTable({
		userId: v.id('users'),
		subscriptionId: v.id('subscriptions'),
		tier: v.union(
			v.literal('free'),
			v.literal('basic'),
			v.literal('premium'),
		),
		status: v.union(
			v.literal('active'),
			v.literal('cancelled'),
			v.literal('expired'),
			v.literal('trial'),
		),
		// Event details
		event: v.union(
			v.literal('created'),
			v.literal('updated'),
			v.literal('cancelled'),
			v.literal('expired'),
			v.literal('renewed'),
		),
		// Payment snapshot
		amount: v.optional(v.number()),
		currency: v.optional(v.string()),
		// Timestamps
		eventDate: v.number(),
		createdAt: v.number(),
	})
		.index('by_user_id', ['userId'])
		.index('by_subscription_id', ['subscriptionId'])
		.index('by_event_date', ['eventDate']),

	// ============================================================================
	// ASSETS & MEDIA
	// ============================================================================

	/**
	 * Media assets - shared storage metadata for images/files
	 */
	mediaAssets: defineTable({
		storageId: v.id("_storage"),
		url: v.optional(v.string()), // Public URL when available
		mimeType: v.string(),
		filesize: v.number(), // Bytes
		altText: v.optional(v.string()),
		caption: v.optional(v.string()),
		assetType: v.union(
			v.literal("image"),
			v.literal("attachment"),
		),
		createdBy: v.optional(v.id("users")),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_storage_id", ["storageId"])
		.index("by_asset_type", ["assetType"]),

	// ============================================================================
	// COURSES & LESSONS
	// ============================================================================

	/**
	 * Courses - main course content
	 */
	courses: defineTable({
		// Basic info
		title: v.string(),
		slug: v.string(),
		description: v.string(),
		shortDescription: v.optional(v.string()),
		// Cover image stored as media asset
		coverAssetId: v.optional(v.id("mediaAssets")),
		// Content details
		level: v.union(
			v.literal("beginner"),
			v.literal("intermediate"),
			v.literal("advanced"),
		),
		duration: v.optional(v.number()), // Total duration in minutes
		category: v.optional(v.string()),
		tags: v.array(v.string()),
		// Access control
		accessLevel: v.union(
			v.literal("public"),
			v.literal("authenticated"),
			v.literal("subscription"),
		),
		requiredTier: v.optional(
			v.union(v.literal("basic"), v.literal("premium")),
		),
		// Status
		isPublished: v.boolean(),
		isFeatured: v.boolean(),
		// Instructor
		instructorId: v.id("users"),
		instructorName: v.optional(v.string()),
		// Stats
		enrollmentCount: v.number(),
		completionCount: v.number(),
		// Soft delete
		isDeleted: v.boolean(),
		deletedAt: v.optional(v.number()),
		// Timestamps
		publishedAt: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_slug", ["slug"])
		.index("by_instructor_id", ["instructorId"])
		.index("by_published", ["isPublished"])
		.index("by_access_level", ["accessLevel"])
		.index("by_category", ["category"])
		.index("by_is_deleted", ["isDeleted"])
		.index("by_featured", ["isFeatured"])
		.searchIndex("search_title", {
			searchField: "title",
			filterFields: ["isPublished", "isDeleted"],
		}),

	/**
	 * Chapters - groups of lessons within courses
	 */
	chapters: defineTable({
		courseId: v.id("courses"),
		// Basic info
		title: v.string(),
		description: v.optional(v.string()),
		// Ordering
		order: v.number(), // Position within course
		// Status
		isPublished: v.boolean(),
		// Soft delete
		isDeleted: v.boolean(),
		deletedAt: v.optional(v.number()),
		// Timestamps
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_course_id", ["courseId"])
		.index("by_course_and_order", ["courseId", "order"])
		.index("by_is_deleted", ["isDeleted"]),

	/**
	 * Lessons - individual lessons within courses
	 */
	lessons: defineTable({
		courseId: v.id("courses"),
		chapterId: v.optional(v.id("chapters")),
		// Basic info
		title: v.string(),
		slug: v.string(),
		description: v.optional(v.string()),
		// Content
		content: v.optional(v.string()), // HTML content
		// Video embed (YouTube or Bunny Stream)
		videoProvider: v.optional(
			v.union(v.literal("youtube"), v.literal("bunny")),
		),
		videoId: v.optional(v.string()), // YouTube video ID or Bunny video ID
		videoUrl: v.optional(v.string()), // Full embed URL
		videoDuration: v.optional(v.number()), // Duration in seconds
		// Ordering
		order: v.number(), // Position within course
		// Status
		isPublished: v.boolean(),
		isFree: v.boolean(), // Preview lesson available without enrollment
		// Soft delete
		isDeleted: v.boolean(),
		deletedAt: v.optional(v.number()),
		// Timestamps
		publishedAt: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_course_id", ["courseId"])
		.index("by_chapter_id", ["chapterId"])
		.index("by_course_and_order", ["courseId", "order"])
		.index("by_chapter_and_order", ["chapterId", "order"])
		.index("by_slug", ["slug"])
		.index("by_published", ["isPublished"])
		.index("by_is_deleted", ["isDeleted"]),

	/**
	 * Lesson attachments - downloadable resources linked to lessons
	 */
	lessonAttachments: defineTable({
		lessonId: v.id("lessons"),
		assetId: v.id("mediaAssets"),
		displayName: v.string(),
		sortOrder: v.number(),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_lesson_id", ["lessonId"])
		.index("by_asset_id", ["assetId"]),

	// ============================================================================
	// WORKSHOPS
	// ============================================================================

	/**
	 * Workshops - standalone workshop content
	 */
	workshops: defineTable({
		// Basic info
		title: v.string(),
		slug: v.string(),
		description: v.string(),
		shortDescription: v.optional(v.string()),
		// Image stored in Convex storage
		coverAssetId: v.optional(v.id("mediaAssets")),
		// Content
		content: v.string(), // HTML content
		// Workshop details
		duration: v.optional(v.number()), // Duration in minutes
		level: v.union(
			v.literal("beginner"),
			v.literal("intermediate"),
			v.literal("advanced"),
		),
		category: v.optional(v.string()),
		tags: v.array(v.string()),
		// Event details (if workshop is live/scheduled)
		isLive: v.boolean(),
		startDate: v.optional(v.number()),
		endDate: v.optional(v.number()),
		maxParticipants: v.optional(v.number()),
		currentParticipants: v.number(),
		// Video recording (if available after live event)
		videoProvider: v.optional(
			v.union(v.literal("youtube"), v.literal("bunny")),
		),
		videoId: v.optional(v.string()),
		videoUrl: v.optional(v.string()),
		// Access control
		accessLevel: v.union(
			v.literal("public"),
			v.literal("authenticated"),
			v.literal("subscription"),
		),
		requiredTier: v.optional(
			v.union(v.literal("basic"), v.literal("premium")),
		),
		// Status
		isPublished: v.boolean(),
		isFeatured: v.boolean(),
		// Instructor
		instructorId: v.id("users"),
		instructorName: v.optional(v.string()),
		// Stats
		enrollmentCount: v.number(),
		// Soft delete
		isDeleted: v.boolean(),
		deletedAt: v.optional(v.number()),
		// Timestamps
		publishedAt: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_slug", ["slug"])
		.index("by_instructor_id", ["instructorId"])
		.index("by_published", ["isPublished"])
		.index("by_access_level", ["accessLevel"])
		.index("by_category", ["category"])
		.index("by_is_deleted", ["isDeleted"])
		.index("by_featured", ["isFeatured"])
		.index("by_live", ["isLive"])
		.index("by_start_date", ["startDate"])
		.searchIndex("search_title", {
			searchField: "title",
			filterFields: ["isPublished", "isDeleted"],
		}),

	/**
	 * Workshop attachments - downloadable resources linked to workshops
	 */
	workshopAttachments: defineTable({
		workshopId: v.id("workshops"),
		assetId: v.id("mediaAssets"),
		displayName: v.string(),
		sortOrder: v.number(),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_workshop_id", ["workshopId"])
		.index("by_asset_id", ["assetId"]),

	// ============================================================================
	// POSTS (BLOG)
	// ============================================================================

	/**
	 * Posts - blog posts with HTML content
	 */
	posts: defineTable({
		// Basic info
		title: v.string(),
		slug: v.string(),
		excerpt: v.optional(v.string()),
		// Content
		content: v.string(), // HTML content with images
		// Featured image stored in Convex storage
		coverAssetId: v.optional(v.id("mediaAssets")),
		// Metadata
		category: v.optional(v.string()),
		tags: v.array(v.string()),
		readTime: v.optional(v.number()), // Estimated read time in minutes
		// Access control
		accessLevel: v.union(
			v.literal("public"),
			v.literal("authenticated"),
			v.literal("subscription"),
		),
		requiredTier: v.optional(
			v.union(v.literal("basic"), v.literal("premium")),
		),
		// Status
		isPublished: v.boolean(),
		isFeatured: v.boolean(),
		// Author
		authorId: v.id("users"),
		authorName: v.optional(v.string()),
		// Stats
		viewCount: v.number(),
		likeCount: v.number(),
		// SEO
		metaTitle: v.optional(v.string()),
		metaDescription: v.optional(v.string()),
		// Soft delete
		isDeleted: v.boolean(),
		deletedAt: v.optional(v.number()),
		// Timestamps
		publishedAt: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_slug", ["slug"])
		.index("by_author_id", ["authorId"])
		.index("by_published", ["isPublished"])
		.index("by_access_level", ["accessLevel"])
		.index("by_category", ["category"])
		.index("by_is_deleted", ["isDeleted"])
		.index("by_featured", ["isFeatured"])
		.index("by_published_at", ["publishedAt"])
		.searchIndex("search_title", {
			searchField: "title",
			filterFields: ["isPublished", "isDeleted"],
		}),

	// ============================================================================
	// ENROLLMENTS & PROGRESS
	// ============================================================================

	/**
	 * Enrollments - user enrollments in courses and workshops
	 */
	enrollments: defineTable({
		userId: v.id('users'),
		// Content reference (either course or workshop)
		contentType: v.union(v.literal('course'), v.literal('workshop')),
		courseId: v.optional(v.id('courses')),
		workshopId: v.optional(v.id('workshops')),
		// Enrollment status
		status: v.union(
			v.literal('active'),
			v.literal('completed'),
			v.literal('dropped'),
		),
		// Progress tracking
		progressPercentage: v.number(), // 0-100
		completedLessons: v.number(),
		totalLessons: v.number(),
		// Dates
		enrolledAt: v.number(),
		completedAt: v.optional(v.number()),
		lastAccessedAt: v.optional(v.number()),
		// Timestamps
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index('by_user_id', ['userId'])
		.index('by_course_id', ['courseId'])
		.index('by_workshop_id', ['workshopId'])
		.index('by_user_and_course', ['userId', 'courseId'])
		.index('by_user_and_workshop', ['userId', 'workshopId'])
		.index('by_status', ['status'])
		.index('by_content_type', ['contentType']),

	/**
	 * Progress - detailed lesson completion tracking
	 */
	progress: defineTable({
		enrollmentId: v.id('enrollments'),
		userId: v.id('users'),
		lessonId: v.id('lessons'),
		// Progress details
		isCompleted: v.boolean(),
		completionPercentage: v.number(), // 0-100 for video watched percentage
		watchedDuration: v.optional(v.number()), // Seconds watched
		// Dates
		startedAt: v.number(),
		completedAt: v.optional(v.number()),
		lastWatchedAt: v.optional(v.number()),
		// Timestamps
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index('by_enrollment_id', ['enrollmentId'])
		.index('by_user_id', ['userId'])
		.index('by_lesson_id', ['lessonId'])
		.index('by_user_and_lesson', ['userId', 'lessonId'])
		.index('by_enrollment_and_lesson', ['enrollmentId', 'lessonId'])
		.index('by_completed', ['isCompleted']),

	// ============================================================================
	// DEMO / SAMPLE TABLES
	// ============================================================================

	/**
	 * Todos - demo table for showcasing Convex in the demo route
	 */
	todos: defineTable({
		text: v.string(),
		completed: v.boolean(),
		createdAt: v.number(),
	}).index('by_created_at', ['createdAt']),

	// ============================================================================
	// CONTACT MESSAGES
	// ============================================================================

	/**
	 * Contact messages - messages submitted through the contact form
	 */
	contactMessages: defineTable({
		// Sender information
		name: v.string(),
		email: v.string(),
		subject: v.string(),
		message: v.string(),
		// Status tracking
		status: v.union(
			v.literal('new'),
			v.literal('read'),
			v.literal('replied'),
			v.literal('archived'),
		),
		// Email sending status
		emailSent: v.boolean(),
		emailError: v.optional(v.string()),
		// Optional user reference (if logged in)
		userId: v.optional(v.id('users')),
		// Admin notes
		adminNotes: v.optional(v.string()),
		repliedAt: v.optional(v.number()),
		repliedBy: v.optional(v.id('users')),
		// Timestamps
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index('by_status', ['status'])
		.index('by_email', ['email'])
		.index('by_user_id', ['userId'])
		.index('by_created_at', ['createdAt']),
})
