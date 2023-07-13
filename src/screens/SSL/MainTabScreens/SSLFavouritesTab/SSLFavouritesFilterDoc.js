/* eslint-disable no-unused-vars */

/**
 * 1. Favourites Tab - We get 2 data: Favourites Near You (Horizontal) and My Favourites (Vertical)
 * 2. On click Favourites Near You -> View All -> navigate to SSLMerchantListing (without filter pill)
 * 3. On click My Favourites -> View All -> navigate to SSLMerchantListing (with filter pill)
 * 4. On click any merchant -> SSLMerchantDetails
 */
import { SSLMerchantListItem } from "@utils/dataModel/interface/SSL/SSLMerchantListItemData";

/** 1. Favourites Tab - We get 2 data: Favourites Near You (Horizontal) and My Favourites (Vertical) */
// POST: /fnb/v1/samasamalokal/postLogin/favouriteLanding
var request = {
    longitude: "101.6938113",
    latitude: "3.181899",
};
interface favouriteLandingResponse {
    /** Favourites Near You */
    merchantNearby: SSLMerchantListItem[];
    /** My Favourites */
    merchantList: SSLMerchantListItem[];
}
var sampleResponse = {
    code: 200,
    status: "QR000",
    text: "Favourite Merchant List",
    totalPage: null,
    totalRecord: null,
    pageSize: null,
    currentPage: null,
    filterParameterVO: null,
    merchantList: [
        {
            merchantId: "MBUAT1000872",
            shopName: "TEST123",
            logo: "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1000872_Logo_.png",
            open: true,
            openMessage: "",
            distance: "4.08 KM",
            deliveryTypes: [1],
            pills: {
                deliveryTypePills: [
                    {
                        id: 1,
                        name: "Delivery",
                        type: "Delivery",
                        color: null,
                        status: false,
                    },
                ],
                promotionPills: null,
                promo: true,
            },
            categoryId: 1,
            price: {
                price: 1,
                description: "$",
            },
            sectionIds: null,
            menuTypeIds: null,
            sections: [
                {
                    id: null,
                    categoryId: 79,
                    categoryName: "Support Ramadhan",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 80,
                    categoryName: "Support Lokal Hawkers",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            menuTypes: [
                {
                    id: null,
                    categoryId: 94,
                    categoryName: "Lauk",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 95,
                    categoryName: "Kuih-mueh",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            orderMethod: 1,
            favourite: false,
            mkp: true,
            maya: null,
        },
    ],
    merchantNearby: [
        {
            merchantId: "MBUAT1000872",
            shopName: "TEST123",
            logo: "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1000872_Logo_.png",
            open: true,
            openMessage: "",
            distance: "4.08 KM",
            deliveryTypes: [1],
            pills: {
                deliveryTypePills: [
                    {
                        id: 1,
                        name: "Delivery",
                        type: "Delivery",
                        color: null,
                        status: false,
                    },
                ],
                promotionPills: null,
                promo: true,
            },
            categoryId: 1,
            price: {
                price: 1,
                description: "$",
            },
            sectionIds: null,
            menuTypeIds: null,
            sections: [
                {
                    id: null,
                    categoryId: 79,
                    categoryName: "Support Ramadhan",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 80,
                    categoryName: "Support Lokal Hawkers",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            menuTypes: [
                {
                    id: null,
                    categoryId: 94,
                    categoryName: "Lauk",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 95,
                    categoryName: "Kuih-mueh",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            orderMethod: 1,
            favourite: false,
            mkp: true,
            maya: null,
        },
    ],
};

/** 2. On click Favourites Near You -> View All -> navigate to SSLMerchantListing */
// POST: /fnb/v1/samasamalokal/postLogin/favouriteFilter
request = {
    longitude: "101.6938113",
    latitude: "3.181899",
    page: 1,
    pageSize: 10,
    // ...and other filter params
};
interface favouriteFilterNearbyResponse {
    totalPage: Number;
    currentPage: Number;
    filterParameterVO: {};
    merchantNearby: SSLMerchantListItem[];
}

/** 3. On click My Favourites -> View All -> navigate to SSLMerchantListing */
// POST: /fnb/v1/samasamalokal/postLogin/favouriteFilter
request = {
    longitude: "101.6938113",
    latitude: "3.181899",
    page: 1,
    pageSize: 10,
    // ...and other filter params
};
interface favouriteFilterMyResponse {
    totalPage: Number;
    currentPage: Number;
    filterParameterVO: {};
    merchantList: SSLMerchantListItem[];
}

/**
 * {type:"recent"} is
 * Recently Added Section (In BRD) - List of my favourite, sorted by date
 * It is being removed cuz too similar to My Favourites (which is sorted by distance)
 */
