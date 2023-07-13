// Only applicable with screen that only calls one API.

/**
 * First time enter screen, user will see:
 * 1. Show shimmering
 * 2. If network success
 *      - if has data, show it
 *      - if no data, show empty placeholder
 * 3. If network error
 *      - show error place holder.
 *
 * After API is called and data is loaded,
 * 1. No need show error or shimmer placeholder. On screen data has the highest priority.
 * 2. If pagination API has error, show error banner instead of error placeholder
 */
export const SCREEN_SUCCESS = "SCREEN_SUCCESS";
export const SCREEN_SHIMMER = "SCREEN_SHIMMER";
export const SCREEN_ERROR = "SCREEN_ERROR";
