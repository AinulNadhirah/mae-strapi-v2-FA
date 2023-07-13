import { logEvent } from "@services/analytics";

import {
    FA_ACTION_NAME,
    FA_ADD_FAVOURITE,
    FA_APPLY_FILTER,
    FA_FEATURED_DEALS,
    FA_FIELD_INFORMATION,
    FA_FILTER_ACTION,
    FA_FILTER_BY,
    FA_LATEST_DEALS,
    FA_NEW_SEARCH,
    FA_NOT_INTERESTED_IN_THIS,
    FA_OPEN_MENU,
    FA_PROMOTION,
    FA_PROMOTIONS,
    FA_SCREEN_NAME,
    FA_SEARCH,
    FA_SEARCH_FILTER,
    FA_SEARCH_PROMO,
    FA_SEARCH_SCREEN,
    FA_SEARCH_TERM,
    FA_SELECT_ACTION,
    FA_SELECT_MENU,
    FA_SELECT_PROMOTION,
    FA_SORT_TYPE,
    FA_VIEW_SCREEN,
} from "@constants/strings";

export const FAPromotionsScreen = {
    cardBodyPress: function (from, title) {
        const promoType = from === "Featured" ? FA_FEATURED_DEALS : FA_LATEST_DEALS;
        logEvent(FA_SELECT_PROMOTION, {
            [FA_SCREEN_NAME]: FA_PROMOTIONS,
            [FA_FIELD_INFORMATION]: promoType + title.substring(0, 84),
        });
    },

    onLikePress: function (title) {
        logEvent(FA_ADD_FAVOURITE, {
            [FA_SCREEN_NAME]: FA_PROMOTIONS,
            [FA_FIELD_INFORMATION]: title.substring(0, 100),
        });
    },

    onSearchPress: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PROMOTIONS,
            [FA_ACTION_NAME]: FA_SEARCH_PROMO,
        });
    },
};

export const FASearchPromotions = {
    onScreen: function (searchValue) {
        logEvent(FA_SEARCH, {
            [FA_SCREEN_NAME]: FA_SEARCH_SCREEN,
            [FA_SEARCH_TERM]: searchValue,
        });
    },

    onSelectPromotion: function (title) {
        logEvent(FA_SELECT_PROMOTION, {
            [FA_SCREEN_NAME]: FA_SEARCH_SCREEN,
            [FA_FIELD_INFORMATION]: title.substring(0, 100),
        });
    },

    onLikePress: function (title) {
        logEvent(FA_ADD_FAVOURITE, {
            [FA_SCREEN_NAME]: FA_SEARCH_SCREEN,
            [FA_FIELD_INFORMATION]: title.substring(0, 90),
        });
    },

    onPressFilter: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_SEARCH_SCREEN,
            [FA_ACTION_NAME]: FA_FILTER_ACTION,
        });
    },

    onNewSearch: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_SEARCH_SCREEN,
            [FA_ACTION_NAME]: FA_NEW_SEARCH,
        });
    },
};

export const FASearchAndFilter = {
    onScreen: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SEARCH_FILTER,
        });
    },

    onApplyFilter: function (sort, category) {
        const sortBy =
            sort === "&sort=seenUser,desc"
                ? "Popularity"
                : sort === "&sort=updatedDate,desc"
                ? "Latest"
                : "Oldest";
        logEvent(FA_APPLY_FILTER, {
            [FA_SCREEN_NAME]: FA_SEARCH_FILTER,
            [FA_FIELD_INFORMATION]: FA_SORT_TYPE + sortBy + ", " + FA_FILTER_BY + category,
        });
    },
};

export const FAPromotionDetailsScreen = {
    onScreen: function (title) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_PROMOTION + title.substring(0, 90),
        });
    },

    onTopMenuIcon: function (title) {
        logEvent(FA_OPEN_MENU, {
            [FA_SCREEN_NAME]: FA_PROMOTION + title.substring(0, 90),
        });
    },

    onLikePress: function (title) {
        logEvent(FA_ADD_FAVOURITE, {
            [FA_SCREEN_NAME]: FA_PROMOTION + title.substring(0, 90),
        });
    },

    onCTAPress: function (title, action) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PROMOTION + title.substring(0, 90),
            [FA_ACTION_NAME]: action,
        });
    },

    onTopMenuItemPress: function (title) {
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: FA_PROMOTION + title.substring(0, 90),
            [FA_ACTION_NAME]: FA_NOT_INTERESTED_IN_THIS,
        });
    },
};
