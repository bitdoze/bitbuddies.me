/**
 * Type definitions derived from Convex schema
 * These types mirror the database schema for type-safe development
 */

import type { Id } from "../../convex/_generated/dataModel";

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export const USER_ROLES = ["user", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const SUBSCRIPTION_TIERS = ["free", "basic", "premium"] as const;
export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];

export const SUBSCRIPTION_STATUSES = [
	"active",
	"cancelled",
	"expired",
	"trial",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const SUBSCRIPTION_EVENTS = [
	"created",
	"updated",
	"cancelled",
	"expired",
	"renewed",
] as const;
export type SubscriptionEvent = (typeof SUBSCRIPTION_EVENTS)[number];

export const CONTENT_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type ContentLevel = (typeof CONTENT_LEVELS)[number];

export const ACCESS_LEVELS = [
	"public",
	"authenticated",
	"subscription",
] as const;
export type AccessLevel = (typeof ACCESS_LEVELS)[number];

export const REQUIRED_TIERS = ["basic", "premium"] as const;
export type RequiredTier = (typeof REQUIRED_TIERS)[number];

export const VIDEO_PROVIDERS = ["youtube", "bunny"] as const;
export type VideoProvider = (typeof VIDEO_PROVIDERS)[number];

export const CONTENT_TYPES = ["course", "workshop"] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const ASSET_TYPES = ["image", "attachment"] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

export const ENROLLMENT_STATUSES = ["active", "completed", "dropped"] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
	_id: Id<"users">;
	_creationTime: number;
	clerkId: string;
	email: string;
	role: UserRole;
	isActive: boolean;
	lastLoginAt?: number;
	createdAt: number;
	updatedAt: number;
}

export interface Profile {
	_id: Id<"profiles">;
	_creationTime: number;
	userId: Id<"users">;
	firstName?: string;
	lastName?: string;
	displayName?: string;
	bio?: string;
	avatarUrl?: string;
	website?: string;
	twitter?: string;
	linkedin?: string;
	github?: string;
	emailNotifications: boolean;
	updatedAt: number;
}

// ============================================================================
// SUBSCRIPTION TYPES
// ============================================================================

export interface Subscription {
	_id: Id<"subscriptions">;
	_creationTime: number;
	userId: Id<"users">;
	tier: SubscriptionTier;
	status: SubscriptionStatus;
	stripeCustomerId?: string;
	stripeSubscriptionId?: string;
	priceId?: string;
	currency?: string;
	amount?: number;
	startDate: number;
	endDate?: number;
	trialEndDate?: number;
	cancelledAt?: number;
	createdAt: number;
	updatedAt: number;
}

export interface SubscriptionHistory {
	_id: Id<"subscriptionHistory">;
	_creationTime: number;
	userId: Id<"users">;
	subscriptionId: Id<"subscriptions">;
	tier: SubscriptionTier;
	status: SubscriptionStatus;
	event: SubscriptionEvent;
	amount?: number;
	currency?: string;
	eventDate: number;
	createdAt: number;
}

// ============================================================================
// COURSE & LESSON TYPES
// ============================================================================

export interface Course {
	_id: Id<"courses">;
	_creationTime: number;
	title: string;
	slug: string;
	description: string;
	shortDescription?: string;
	coverAssetId?: Id<"mediaAssets">;
	level: ContentLevel;
	duration?: number;
	category?: string;
	tags: string[];
	accessLevel: AccessLevel;
	requiredTier?: RequiredTier;
	isPublished: boolean;
	isFeatured: boolean;
	instructorId: Id<"users">;
	instructorName?: string;
	enrollmentCount: number;
	completionCount: number;
	isDeleted: boolean;
	deletedAt?: number;
	publishedAt?: number;
	createdAt: number;
	updatedAt: number;
}

export interface MediaAsset {
	_id: Id<"mediaAssets">;
	_creationTime: number;
	storageId: Id<"_storage">;
	url?: string;
	mimeType: string;
	filesize: number;
	altText?: string;
	caption?: string;
	assetType: AssetType;
	createdBy?: Id<"users">;
	createdAt: number;
	updatedAt: number;
}

export interface LessonAttachment {
	_id: Id<"lessonAttachments">;
	_creationTime: number;
	lessonId: Id<"lessons">;
	assetId: Id<"mediaAssets">;
	displayName: string;
	sortOrder: number;
	createdAt: number;
	updatedAt: number;
}

export interface Lesson {
	_id: Id<"lessons">;
	_creationTime: number;
	courseId: Id<"courses">;
	title: string;
	slug: string;
	description?: string;
	content?: string;
	videoProvider?: VideoProvider;
	videoId?: string;
	videoUrl?: string;
	videoDuration?: number;
	order: number;
	isPublished: boolean;
	isFree: boolean;
	isDeleted: boolean;
	deletedAt?: number;
	publishedAt?: number;
	createdAt: number;
	updatedAt: number;
}

// ============================================================================
// WORKSHOP TYPES
// ============================================================================

export interface Workshop {
	_id: Id<"workshops">;
	_creationTime: number;
	title: string;
	slug: string;
	description: string;
	shortDescription?: string;
	coverAssetId?: Id<"mediaAssets">;
	content: string;
	duration?: number;
	level: ContentLevel;
	category?: string;
	tags: string[];
	isLive: boolean;
	startDate?: number;
	endDate?: number;
	maxParticipants?: number;
	currentParticipants: number;
	videoProvider?: VideoProvider;
	videoId?: string;
	videoUrl?: string;
	accessLevel: AccessLevel;
	requiredTier?: RequiredTier;
	isPublished: boolean;
	isFeatured: boolean;
	instructorId: Id<"users">;
	instructorName?: string;
	enrollmentCount: number;
	isDeleted: boolean;
	deletedAt?: number;
	publishedAt?: number;
	createdAt: number;
	updatedAt: number;
}

// ============================================================================
// POST TYPES
// ============================================================================

export interface Post {
	_id: Id<"posts">;
	_creationTime: number;
	title: string;
	slug: string;
	excerpt?: string;
	content: string;
	coverAssetId?: Id<"mediaAssets">;
	category?: string;
	tags: string[];
	readTime?: number;
	accessLevel: AccessLevel;
	requiredTier?: RequiredTier;
	isPublished: boolean;
	isFeatured: boolean;
	authorId: Id<"users">;
	authorName?: string;
	viewCount: number;
	likeCount: number;
	metaTitle?: string;
	metaDescription?: string;
	isDeleted: boolean;
	deletedAt?: number;
	publishedAt?: number;
	createdAt: number;
	updatedAt: number;
}

// ============================================================================
// ENROLLMENT & PROGRESS TYPES
// ============================================================================

export interface Enrollment {
	_id: Id<"enrollments">;
	_creationTime: number;
	userId: Id<"users">;
	contentType: ContentType;
	courseId?: Id<"courses">;
	workshopId?: Id<"workshops">;
	status: EnrollmentStatus;
	progressPercentage: number;
	completedLessons: number;
	totalLessons: number;
	enrolledAt: number;
	completedAt?: number;
	lastAccessedAt?: number;
	createdAt: number;
	updatedAt: number;
}

export interface Progress {
	_id: Id<"progress">;
	_creationTime: number;
	enrollmentId: Id<"enrollments">;
	userId: Id<"users">;
	lessonId: Id<"lessons">;
	isCompleted: boolean;
	completionPercentage: number;
	watchedDuration?: number;
	startedAt: number;
	completedAt?: number;
	lastWatchedAt?: number;
	createdAt: number;
	updatedAt: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for content that can be enrolled in (courses or workshops)
 */
export type EnrollableContent = Course | Workshop;

/**
 * Type for content with access control
 */
export interface AccessControlled {
	accessLevel: AccessLevel;
	requiredTier?: RequiredTier;
	isPublished: boolean;
	isDeleted: boolean;
}

/**
 * Type for user with profile data combined
 */
export interface UserWithProfile extends User {
	profile?: Profile;
}

/**
 * Type for enrollment with content details
 */
export interface EnrollmentWithContent extends Enrollment {
	course?: Course;
	workshop?: Workshop;
}

/**
 * Type for course with lessons
 */
export interface CourseWithLessons extends Course {
	lessons: Lesson[];
}

/**
 * Type for enrollment with progress details
 */
export interface EnrollmentWithProgress extends Enrollment {
	progress: Progress[];
}

/**
 * Type for lesson with progress
 */
export interface LessonWithProgress extends Lesson {
	progress?: Progress;
}

// ============================================================================
// FORM INPUT TYPES
// ============================================================================

export interface CreateCourseInput {
	title: string;
	slug: string;
	description: string;
	shortDescription?: string;
	level: ContentLevel;
	category?: string;
	tags: string[];
	accessLevel: AccessLevel;
	requiredTier?: RequiredTier;
}

export interface CreateLessonInput {
	courseId: Id<"courses">;
	title: string;
	slug: string;
	description?: string;
	content?: string;
	videoProvider?: VideoProvider;
	videoId?: string;
	order: number;
	isFree?: boolean;
}

export interface CreateWorkshopInput {
	title: string;
	slug: string;
	description: string;
	shortDescription?: string;
	content: string;
	level: ContentLevel;
	category?: string;
	tags: string[];
	isLive: boolean;
	startDate?: number;
	maxParticipants?: number;
	accessLevel: AccessLevel;
	requiredTier?: RequiredTier;
}

export interface CreatePostInput {
	title: string;
	slug: string;
	excerpt?: string;
	content: string;
	category?: string;
	tags: string[];
	accessLevel: AccessLevel;
	requiredTier?: RequiredTier;
	metaTitle?: string;
	metaDescription?: string;
}

export interface UpdateProfileInput {
	firstName?: string;
	lastName?: string;
	displayName?: string;
	bio?: string;
	website?: string;
	twitter?: string;
	linkedin?: string;
	github?: string;
	emailNotifications?: boolean;
}

// ============================================================================
// FILTER & QUERY TYPES
// ============================================================================

export interface ContentFilter {
	category?: string;
	level?: ContentLevel;
	tags?: string[];
	accessLevel?: AccessLevel;
	isPublished?: boolean;
	isFeatured?: boolean;
	search?: string;
}

export interface PaginationParams {
	limit?: number;
	offset?: number;
	cursor?: string;
}

export interface SortParams {
	field: string;
	order: "asc" | "desc";
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	hasMore: boolean;
	nextCursor?: string;
}

export interface EnrollmentStats {
	totalEnrollments: number;
	activeEnrollments: number;
	completedEnrollments: number;
	averageProgress: number;
}

export interface CourseStats {
	totalLessons: number;
	totalDuration: number;
	enrollmentCount: number;
	completionCount: number;
	completionRate: number;
}

export interface UserStats {
	enrolledCourses: number;
	completedCourses: number;
	enrolledWorkshops: number;
	totalProgress: number;
}
