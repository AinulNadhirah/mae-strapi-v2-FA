/* eslint-disable no-unused-vars */

// POST /fnb/v1/samasamalokal/preLogin/sslLanding <- FnB use this if L0
// POST /fnb/v1/samasamalokal/postLogin/sslLanding
const request = {
    longitude: "101.6938113",
    latitude: "3.181899",
};
const response = {
    message: "success",
    code: 200,
    challenge: null,
    result: {
        code: 200,
        status: "QR000",
        text: "success",
        totalPage: null,
        totalRecord: null,
        pageSize: null,
        currentPage: null,
        data: {
            discoverPromotion: [
                {
                    title: "Discover Sama-Sama Lokal",
                    desc: "Use SHOPMYSSL promo code before 31st August",
                    btnLabel: "Lets Go",
                    banner: "Images/discoverPromotion.png",
                },
            ],
            subCategoryL2List: [
                {
                    categoryId: 70,
                    categoryName: "Asian",
                    categoryBanner: null,
                    subCategoryL3List: null,
                },
            ],
            subCategoryL3List: [
                {
                    categoryId: 86,
                    categoryName: "Halal",
                    categoryBanner: null,
                },
            ],
            subCategories: null,
            promotionList: [
                {
                    categoryId: 73,
                    categoryName: "Vegetarian",
                    categoryBanner: "https://test.vts.maybank.com.my:8553/api/v1/mobile/",
                },
            ],
            orderAgainList: [
                {
                    merchantId: "MBUAT1001259",
                    shopName: "TestFix009",
                    logo: "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1001259_Logo.png",
                    isOpen: true,
                    openMessage: "",
                    distance: "9.25 KM",
                    deliveryType: "1,2",
                    pills: {
                        deliveryTypePills: [
                            {
                                id: 1,
                                name: "Delivery",
                                color: "#ff0000",
                                status: true,
                            },
                            {
                                id: 2,
                                name: "Self-Pickup",
                                color: "#f4b1ff",
                                status: true,
                            },
                        ],
                        promotionPills: [],
                        promo: false,
                    },
                    categoryId: 11,
                    sectionDetails: [
                        {
                            categoryId: 79,
                            categoryName: "Support Ramadhan",
                        },
                        {
                            categoryId: 80,
                            categoryName: "Support Lokal Hawkers",
                        },
                        {
                            categoryId: 81,
                            categoryName: "Support Lokal Grocers",
                        },
                        {
                            categoryId: 129,
                            categoryName: "Lokal Raya Delicacies",
                        },
                    ],
                    menuTypeDetails: [
                        {
                            categoryId: 87,
                            categoryName: "Chinese",
                        },
                        {
                            categoryId: 88,
                            categoryName: "Malay",
                        },
                        {
                            categoryId: 89,
                            categoryName: "Indian",
                        },
                        {
                            categoryId: 95,
                            categoryName: "Kuih-mueh",
                        },
                        {
                            categoryId: 96,
                            categoryName: "Drinks",
                        },
                        {
                            categoryId: 99,
                            categoryName: "Fresh Fruits and Vegetables",
                        },
                        {
                            categoryId: 100,
                            categoryName: "Organic Foods",
                        },
                        {
                            categoryId: 101,
                            categoryName: "Meats, Seafoods & Frozen Foods",
                        },
                        {
                            categoryId: 130,
                            categoryName: "Set Meals",
                        },
                        {
                            categoryId: 131,
                            categoryName: "Lauk",
                        },
                    ],
                    orderMethod: 2,
                    isFavourite: false,
                },
            ],
            trendingNowList: [],
            popularNearYouList: [
                {
                    merchantId: "MBUAT1000872",
                    shopName: "TEST123",
                    logo: "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1000872_Logo_.png",
                    isOpen: true,
                    openMessage: "",
                    distance: "4.20 KM",
                    deliveryType: "1",
                    pills: {
                        deliveryTypePills: [
                            {
                                id: 1,
                                name: "Delivery",
                                color: "#ff0000",
                                status: true,
                            },
                        ],
                        promotionPills: [],
                        promo: false,
                    },
                    categoryId: 1,
                    sectionDetails: [
                        {
                            categoryId: 79,
                            categoryName: "Support Ramadhan",
                        },
                        {
                            categoryId: 80,
                            categoryName: "Support Lokal Hawkers",
                        },
                    ],
                    menuTypeDetails: [
                        {
                            categoryId: 94,
                            categoryName: "Lauk",
                        },
                        {
                            categoryId: 95,
                            categoryName: "Kuih-mueh",
                        },
                    ],
                    orderMethod: 1,
                    isFavourite: false,
                },
            ],
            letUsKnowList: [
                {
                    title: "Looking to set up your online shop on Sama-Sama Lokal?",
                    url: "www.maybank.com/letusknow",
                    btnLable: "Let Us Know",
                },
            ],
        },
    },
};
export interface SSLLandingData {
    /** FnB Banner*/
    discoverPromotion: {
        title: string,
        desc: string,
        btnLabel: string,
        banner: string,
    }[];
    /** SSLLanding Grid - What would you like to order */
    subCategoryL2List: {
        categoryId: Number,
        categoryName: String,
        categoryBanner: String,
        subCategoryL3List: null, // null as of now
    }[];
    /** FnB- What are you craving */
    subCategoryL3List: {
        categoryId: Number,
        categoryName: String,
        categoryBanner: String,
    }[];
    // not needing this atm
    subCategories: null;
    /** SSLLanding - Promotions */
    promotionList: {
        categoryId: Number,
        categoryName: String,
        categoryBanner: String,
    }[];
    /** FnB - orderAgain */
    orderAgainList: [];
    /** SSLLanding - Popular Near You */
    popularNearYouList: [];
}

// Before
export const SSLLandingV1 = {
    discoverPromotion: [],
    subCategoryL2List: [],
    subCategoryL3List: [],
    promotionList: [],
    orderAgainList: [],
    popularNearYouList: [],
};

// After

// 2 version - L0 and L1
export const SSLLandingV2 = {
    discoverPromotion: [],
    orderAgainList: [], // L2 will return this
    popularNearYouList: [],
};
export const API_L2 = {
    // L0
    subCategoryL2List: [],
};
export const API_L3 = {
    // L0
    subCategoryL3List: [],
};
export const API_PROMO = {
    // L0
    promotionList: [],
};
