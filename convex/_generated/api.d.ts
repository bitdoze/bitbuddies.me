/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as affiliateLinks from "../affiliateLinks.js";
import type * as chapters from "../chapters.js";
import type * as contactMessages from "../contactMessages.js";
import type * as contactMessagesActions from "../contactMessagesActions.js";
import type * as courses from "../courses.js";
import type * as crons from "../crons.js";
import type * as enrollments from "../enrollments.js";
import type * as lessonAttachments from "../lessonAttachments.js";
import type * as lessons from "../lessons.js";
import type * as linkCategories from "../linkCategories.js";
import type * as linkClicks from "../linkClicks.js";
import type * as mediaAssets from "../mediaAssets.js";
import type * as posts from "../posts.js";
import type * as progress from "../progress.js";
import type * as subscriptions from "../subscriptions.js";
import type * as todos from "../todos.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";
import type * as workshopAttachments from "../workshopAttachments.js";
import type * as workshops from "../workshops.js";
import type * as youtubeChannels from "../youtubeChannels.js";
import type * as youtubeVideos from "../youtubeVideos.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  affiliateLinks: typeof affiliateLinks;
  chapters: typeof chapters;
  contactMessages: typeof contactMessages;
  contactMessagesActions: typeof contactMessagesActions;
  courses: typeof courses;
  crons: typeof crons;
  enrollments: typeof enrollments;
  lessonAttachments: typeof lessonAttachments;
  lessons: typeof lessons;
  linkCategories: typeof linkCategories;
  linkClicks: typeof linkClicks;
  mediaAssets: typeof mediaAssets;
  posts: typeof posts;
  progress: typeof progress;
  subscriptions: typeof subscriptions;
  todos: typeof todos;
  users: typeof users;
  utils: typeof utils;
  workshopAttachments: typeof workshopAttachments;
  workshops: typeof workshops;
  youtubeChannels: typeof youtubeChannels;
  youtubeVideos: typeof youtubeVideos;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
