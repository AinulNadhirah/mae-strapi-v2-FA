// The section header follows our UI
export const FILTER_SECTION_SORTBY = "sortBy";
export const FILTER_SECTION_DISTANCE = "distance";
export const FILTER_SECTION_PRICE = "price";
export const FILTER_SECTION_PROMO = "promo";
export const FILTER_SECTION_MODE = "mode";
export const FILTER_SECTION_L3 = "categoryL3List";
export const FILTER_SECTION_OTHERS = "others";

/**
 * 1. defaultSelectedFilterIds - default state
 * 2. oriSelectedFilterIds - screen's original state*
 * 3. selectedFilterIds - current state on screen (user toggle any filters)
 *
 *   *screen's original state might b different than defaultSelectedFilterIds. Depending on entry point, e.g: (Favourite) entry point - ori state will always has isFavourite selected. (Halal) entry point will always has isHalal selected. If user click on "Clear All", screen will reset to this original state.
 */

// Each key correspond to a section in filter screen (refer to UI)
export const defaultSelectedFilterIds = {
    sortBy: "Nearest", // -> Nearest / TopRating / Price Low to High / Price High to Low
    distance: -1, // -> -1 / 1 / 2 / 3 / 4
    price: [], // -> [1,2,3,4]
    promo: [], // -> ["Promo Code", "Discount"] // Only promo code is using, discount BE not ready
    mode: [], // -> [1,2,3,4]
    categoryL3List: [], // -> [234, 334, 678 , ...]
    others: [], // -> [1,2,3]
};

// Sample of mapping of selectedFilterIds to API request payload
// eslint-disable-next-line no-unused-vars
const mappingToAPI = {
    // We send { sortBy : TopRating / Price Low to High / Price High to Low } - default (empty value) is sort by nearest
    [FILTER_SECTION_SORTBY]: "Nearest",
    // We send { radius : 1 / 2 / 3 / 4 } - default (empty value) is all distance
    [FILTER_SECTION_DISTANCE]: -1,
    // We send { price: [] }. Backend accept array of values
    [FILTER_SECTION_PRICE]: [],
    // We send { promo: true }
    [FILTER_SECTION_PROMO]: [],
    // We send { deliveryId: [] } // Backend accepts array of value
    [FILTER_SECTION_MODE]: [],
    // We send { menuType: [] } // Backend accepts array of value
    [FILTER_SECTION_L3]: [], // [234, 334, 678 , ...]
    // value 1 - { ratingAbove: 4 } 2 - { isHalal: true } 3 - { isFavourite: true}
    [FILTER_SECTION_OTHERS]: [], // [1,2,3]
};
