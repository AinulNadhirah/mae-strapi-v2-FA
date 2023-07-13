// NavigationService.js
import { createRef } from "react";
import { StackActions, CommonActions, TabActions } from "@react-navigation/native";

export const navigationRef = createRef();
export const isMountedRef = createRef();

// navigate
function navigate(name, params) {
    isMountedRef.current && navigationRef.current && navigationRef.current.navigate(name, params);
}

/**
 * BREAKING:
 * NavigationActions no longer accepting `action` props. It now relies on `screen` params
 * to do so. This service usage doesn't change but now when using this service,
 * the initialRoute in the stack will NOT MOUNT and doesn't exist in the stack
 */
function navigateToModule(modulename, routename, params) {
    const navigateToModule = CommonActions.navigate(modulename, {
        screen: routename,
        params,
    });

    isMountedRef.current &&
        navigationRef.current &&
        navigationRef.current.dispatch(navigateToModule);
}

function reset(index, routes) {
    isMountedRef.current &&
        navigationRef.current &&
        navigationRef.current.resetRoot({
            index,
            routes,
        });
}

function resetModifiedStack(navState) {
    if (isMountedRef.current && navigationRef.current) {
        navState &&
            navigationRef.current.resetRoot({
                ...navState,
            });
    }
}

/**
 *
 * This will behave differently from previous version.
 * It will reset the nav stack, and then navigate to the given module
 */
function resetAndNavigateToModule(moduleName, routeName, params) {
    if (isMountedRef.current && navigationRef.current) {
        let mergedState = {
            index: 0,
            routes: [
                {
                    name: moduleName,
                    params,
                },
            ],
        };

        if (routeName) {
            mergedState.routes[0].state = {
                index: 0,
                routes: [
                    {
                        name: routeName,
                        params,
                    },
                ],
            };
        }

        navigationRef.current.resetRoot({
            ...mergedState,
        });
    }
}

/**
 * Reset everything and start from dashboard
 */
function resetRoot() {
    if (isMountedRef.current && navigationRef.current) {
        const state = navigationRef.current.getRootState();

        console.log(state);
    }
    // isMountedRef.current && navigationRef.current && resetAndNavigateToModule(TAB_NAVIGATOR);
}

/**
 *
 * @param {String} routeName The route to navigate to (Required)
 * @param {String} moduleName The module of which the routeName exists. This will ensure it know which stack to look into (Optional)
 * @param {Object} params Params to be supplied when the screen navigated
 */
function replaceStack(routeName, moduleName, params) {
    let replaceStack;

    if (moduleName) {
        replaceStack = StackActions.replace(moduleName, {
            screen: routeName,
            params,
        });
    } else {
        replaceStack = StackActions.replace(routeName, params);
    }

    if (isMountedRef.current && navigationRef.current) {
        navigationRef.current.dispatch(replaceStack);
    }
}

/**
 * Specific for jumping to tab. Not for stack usage
 * @param {*} name tab name
 * @param {*} params parameters
 */
function jumpTo(name, params) {
    const jumpToActions = TabActions.jumpTo(name, params);

    isMountedRef.current && navigationRef.current && navigationRef.current.dispatch(jumpToActions);
}

function getNavigationObj() {
    return navigationRef;
}

// add other navigation functions that you need and export them

export default {
    navigate,
    navigateToModule,
    replaceStack,
    reset,
    resetModifiedStack,
    resetAndNavigateToModule,
    resetRoot,
    jumpTo,
    getNavigationObj,
};
