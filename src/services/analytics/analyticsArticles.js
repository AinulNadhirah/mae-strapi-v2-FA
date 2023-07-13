import { showErrorToast } from "@components/Toast";

import { logEvent } from "@services/analytics";

import {
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FA_PARTNER_KLIA,
    FA_TAB_NAME,
    FA_SELECT_ACTION,
    FA_SEARCH_SCREEN,
    FILTER,
    FA_ACTION_NAME,
    FA_SELECT_ARTICLE,
    FA_FIELD_INFORMATION,
    FA_ADD_FAVOURITE,
    ARTICLES,
    ARTICLE,
    FA_SELECT_MENU,
    FA_NOT_INTERESTED_IN_THIS,
    FA_OPEN_MENU,
    FA_APPLY_FILTER,
    FA_SEARCH_FILTER,
} from "@constants/strings";

function wrapTryCatch(object) {
    var key, method;

    for (key in object) {
        method = object[key];
        if (typeof method === "function") {
            object[key] = (function (method, key) {
                return function () {
                    try {
                        return method.apply(this, arguments);
                    } catch (e) {
                        showErrorToast({ message: e.message });
                    }
                };
            })(method, key);
        }
    }
    return object;
}

let FAArticleScreen = {
    onScreen(title) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: `Article_${title.split(" ").join("")}`,
        });
    },
    onPressFilter() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_SEARCH_SCREEN,
            [FA_ACTION_NAME]: FILTER,
        });
    },
    onSelectArticle(title) {
        logEvent(FA_SELECT_ARTICLE, {
            [FA_SCREEN_NAME]: FA_SEARCH_SCREEN,
            [FA_FIELD_INFORMATION]: title,
        });
    },
    onAddToFavouriteSearch(title) {
        logEvent(FA_ADD_FAVOURITE, {
            [FA_SCREEN_NAME]: FA_SEARCH_SCREEN,
            [FA_FIELD_INFORMATION]: title,
        });
    },
    cardBodyPress(origin, title) {
        const isFeatured = origin === "Featured" ? "Featured" : "Latest";
        logEvent(FA_SELECT_ARTICLE, {
            [FA_SCREEN_NAME]: ARTICLES,
            [FA_FIELD_INFORMATION]: `${isFeatured} ${ARTICLE}: ${title}`,
        });
    },
    onAddToFavouriteArticle(title) {
        logEvent(FA_ADD_FAVOURITE, {
            [FA_SCREEN_NAME]: FA_SEARCH_SCREEN,
            [FA_FIELD_INFORMATION]: title,
        });
    },
    onSearchPress() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: ARTICLES,
            [FA_ACTION_NAME]: FA_SEARCH_SCREEN,
        });
    },
    onSelectNotInterested(title) {
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: `Article_${title}`,
            [FA_ACTION_NAME]: FA_NOT_INTERESTED_IN_THIS,
        });
    },
    onRequestLikeAricle(title) {
        logEvent(FA_ADD_FAVOURITE, {
            [FA_SCREEN_NAME]: `Article_${title.split(" ").join("")}`,
        });
    },
    onMorePressed(title) {
        logEvent(FA_OPEN_MENU, {
            [FA_SCREEN_NAME]: `Article_${title.split(" ").join("")}`,
        });
    },
    onCTAPressed(title, cta) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: `Article_${title.split(" ").join("")}`,
            [FA_ACTION_NAME]: cta?.title || "",
        });
    },
    onFilterApply(sortValue, filterValue) {
        logEvent(FA_APPLY_FILTER, {
            [FA_SCREEN_NAME]: FA_SEARCH_FILTER,
            [FA_FIELD_INFORMATION]: `sort by: ${sortValue}, filter by: ${filterValue}`,
        });
    },
};

FAArticleScreen = wrapTryCatch(FAArticleScreen);

export { FAArticleScreen };
