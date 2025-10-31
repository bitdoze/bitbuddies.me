/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as contactMessages from "../contactMessages.js";
import type * as contactMessagesActions from "../contactMessagesActions.js";
import type * as courses from "../courses.js";
import type * as enrollments from "../enrollments.js";
import type * as mediaAssets from "../mediaAssets.js";
import type * as posts from "../posts.js";
import type * as subscriptions from "../subscriptions.js";
import type * as todos from "../todos.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";
import type * as workshopAttachments from "../workshopAttachments.js";
import type * as workshops from "../workshops.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  contactMessages: typeof contactMessages;
  contactMessagesActions: typeof contactMessagesActions;
  courses: typeof courses;
  enrollments: typeof enrollments;
  mediaAssets: typeof mediaAssets;
  posts: typeof posts;
  subscriptions: typeof subscriptions;
  todos: typeof todos;
  users: typeof users;
  utils: typeof utils;
  workshopAttachments: typeof workshopAttachments;
  workshops: typeof workshops;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
