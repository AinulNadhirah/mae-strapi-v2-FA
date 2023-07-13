/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */

/**
 * 1. Very logic and feature heavy screen.
 * 2. SSLMerchantDetails We delegate tasks to :
 *      - MerchantDetail into MerchantDetailsCollapsibleHeader
 *      - productData in ScreenFlatList
 */
export interface SSLMerchantDetailData {
    merchantId: String;
    shopName: String; // display as title
    logo: String; // merchantListing logo
    open: Boolean; // using this
    openMessage: String; // if has openMessage, means store is closed
    distance: String;
    deliveryTypes: Number[]; // 1 - 3rdPartyDelivery, 2-selfpickup, 3-merchantdelivery, 4-email/voucher
    pills: {
        deliveryTypePills: [
            {
                id: Number, // 1,3 - delivery. Biz don't wanna show 3rdparty or merchant
                name: String, // Biz wanna show this value to user instead
            }
        ],
        promotionPills: [
            {
                id: Number,
                title: String,
                shortDesc: String, // outside banner show title + short desc
                longDesc: String, // on user tap show title + long desc
                tncLink: String,
            }
        ],
        promo: true, // Used in merchantListing Promotion label. Not being used here
    };
    categoryId: Number; // Value so far is 1. Is being used by backend, might need to send when call order API
    price: {
        price: Number,
        description: String, // display this
    };
    sectionIds: "[1248]"; // no idea. Not being used
    menuTypeIds: "[1250]"; // no idea. Not being used
    sections: [
        // L2 - Not using
        {
            categoryId: Number,
            categoryName: String,
        }
    ];
    menuTypes: [
        // L3 - Using this
        {
            categoryId: Number,
            categoryName: String,
        }
    ];
    orderMethod: 2; // 2 means can order online. So far all is 2
    favourite: Boolean;
    businessContactNo: String;
    businessDescription: String;
    outletAddress: String; // not using
    city: String; // not using
    merchantPicture: String; // banner url
    tncLink: String;
    website: String; // using this
    email: String; // not using
    openTimings: {
        day: String,
        startTime: String,
        endTime: String,
    }[];
    mbbFreeDelivery: false; // free delivery pill showing in RMBP
    introduction: null; // not used
    orderLimit: Number; // basket order limit. In integer
    deliveryRateList: []; // need to confirm with Udit what's this. Might not be needed
    products: SSLProductItemData[];
    promotions: null; // not using
    orderBtn: true; // not using
    merchantDeepLinkUrl: String; // share url
    location: null; // not using
    productName: null; // not using
    priceRange: 1; // not using
    merchantLogo: null; // not using
    latitude: null; // not using
    longitude: null; // not using
    socialMedia: ""; // not using
    mkp: Boolean; // mkp: true === SSL merchant
    maya: Boolean; // not using
}

export interface TimeData {
    day: String;
    startTime: String;
    endTime: String;
}
export interface SSLProductItemData {
    icon: String; // icon for listing
    productId: String;
    name: String;
    imagePaths: String[]; // banner images
    priceAmount: 10;
    currency: String;
    suitableBike: Boolean;
    sku: "-";
    shortDesc: String;
    longDesc: String;
    size: String;
    weight: Number;
    totalWeight: Number;
    avail: Boolean;
}

export const latestMerchantSample = {
    message: "success",
    code: 200,
    challenge: null,
    result: {
        code: 200,
        status: "QR000",
        text: "success",
        message: null,
        merchantDetail: {
            merchantId: "MBUAT1205505",
            shopName: "digi 09 mdel",
            logo: "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205505_Logo.png",
            open: true,
            openMessage: "",
            distance: "2.10 KM",
            deliveryTypes: [1, 2],
            pills: {
                deliveryTypePills: [
                    {
                        id: 1,
                        name: "Delivery",
                        type: "Delivery",
                        color: null,
                        status: true,
                    },
                    {
                        id: 2,
                        name: "Pickup",
                        type: "Pickup",
                        color: null,
                        status: true,
                    },
                ],
                promotionPills: [],
                promo: true,
            },
            categoryId: 1,
            price: {
                price: 1,
                description: "$",
            },
            sectionIds: "[61]",
            menuTypeIds: "[273,205,206,31,274,210,211,212,272,224,266]",
            sections: [
                {
                    id: null,
                    categoryId: 61,
                    categoryName: "[30% OFF] Beverages, Snacks & Desserts",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            menuTypes: [
                {
                    id: null,
                    categoryId: 31,
                    categoryName: "Beverages",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 205,
                    categoryName: "Chocolate",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 206,
                    categoryName: "Juice & Smoothies",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 210,
                    categoryName: "Ice Cream",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 211,
                    categoryName: "Cakes",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 212,
                    categoryName: "Cookies",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 224,
                    categoryName: "Italian",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 266,
                    categoryName: "Snacks",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 272,
                    categoryName: "Dessert/Bakery",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 273,
                    categoryName: "Coffee & Tea",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 274,
                    categoryName: "Bubble Tea",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            orderMethod: 2,
            mkp: true,
            maya: false,
            averageRating: 0,
            totalReview: 0,
            rating: [],
            businessContactNo: "0163218058",
            businessDescription: "buss deasp",
            outletAddress:
                "Maybank Tower, Jalan Tun Perak, Bukit Bintang, Wilayah Persekutuan Kuala Lumpur",
            city: "WP Kuala Lumpur",
            merchantPicture:
                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205505.png",
            tncLink: "",
            website: "",
            email: "iven.lai@maybank.com",
            openTimings: [
                {
                    day: "Monday",
                    startTime: "1:41 AM",
                    endTime: "11:41 PM",
                },
                {
                    day: "Tuesday",
                    startTime: "1:41 AM",
                    endTime: "11:42 PM",
                },
                {
                    day: "Wednesday",
                    startTime: "1:42 AM",
                    endTime: "11:42 PM",
                },
                {
                    day: "Thursday",
                    startTime: "3:41 AM",
                    endTime: "11:41 PM",
                },
                {
                    day: "Friday",
                    startTime: "12:06 AM",
                    endTime: "11:59 PM",
                },
            ],
            mbbFreeDelivery: null,
            introduction: null,
            orderLimit: 10000,
            deliveryRateList: [
                {
                    km: 1,
                    price: 2,
                },
                {
                    km: 5,
                    price: 6,
                },
                {
                    km: 10,
                    price: 12,
                },
            ],
            promotions: ",2,3,67,72,75,76,77,",
            orderBtn: true,
            merchantDeepLinkUrl:
                "Hey, check out this store on Sama-Sama Lokal - digi 09 mdel and lend a helping hand to our locals!\n\n https://test.vts.maybank.com.my:8553/api/v1/mobile/ssl/maeuat/MBUAT1205505/digi09mdel",
            cuisine:
                " Beverages Chocolate Juice & Smoothies Ice Cream Cakes Cookies Italian Snacks Dessert/Bakery Coffee & Tea Bubble Tea",
            productName: null,
            priceRange: null,
            merchantLogo: null,
            latitude: 3.147273,
            longitude: 101.699535,
            socialMedia: null,
            prepTime: null,
            isHalal: null,
            tax_processing_fee: null,
            tax_processing_fee_amount: null,
            tooltip_description: null,
            isSst: null,
            sstPercentage: null,
            optionCategory: [
                {
                    optionCategoryId: 222,
                    name: "something is nice",
                    displayOrder: 1,
                    active: false,
                    products: [],
                },
                {
                    optionCategoryId: 247,
                    name: "Hard Rock",
                    displayOrder: 1,
                    active: true,
                    products: [
                        {
                            productId: "MKPRD1279251",
                            name: "bountiful",
                            imagePaths: [
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1279251.jpeg",
                            ],
                            logo: "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1279251.jpeg",
                            priceAmount: 13,
                            shortDesc: "beautiful",
                            currency: "RM",
                            avail: true,
                            weight: 1,
                            productDeepLinkUrl:
                                "Hey, I'd like to share with you bountiful from digi 09 mdel I found on Sama-Sama Lokal. Check them out and lend a helping hand to our locals!\n\n https://test.vts.maybank.com.my:8553/api/v1/mobile/ssl/mae/MBUAT1205505/digi09mdel/MKPRD1279251",
                        },
                        {
                            productId: "MKPRD1279330",
                            name: "Digital financing v1",
                            imagePaths: [
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1279330.png",
                            ],
                            logo: "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1279330.png",
                            priceAmount: 106.74,
                            shortDesc:
                                "Use the edit icon to pin, add or delete clips.Use the edit icon to pin, add or delete clips.Use the edit icon to pin, add or delete clips. Tap on a clip to paste it in the text box.Welcome to Gboard clipboard, any text you copy will be saved here.Tap on a clip to paste it in the text box.Welcome to Gboard clipboard, any text you copy will be saved here.Tap on a clip to paste it in the text box.Welcome to Gboard clipboard, any text you copy will be saved here.",
                            currency: "RM",
                            avail: true,
                            weight: 1,
                            productDeepLinkUrl:
                                "Hey, I'd like to share with you Digital financing v1 from digi 09 mdel I found on Sama-Sama Lokal. Check them out and lend a helping hand to our locals!\n\n https://test.vts.maybank.com.my:8553/api/v1/mobile/ssl/mae/MBUAT1205505/digi09mdel/MKPRD1279330",
                        },
                    ],
                },
                {
                    optionCategoryId: 286,
                    name: "Sweet test",
                    displayOrder: 1,
                    active: false,
                    products: [],
                },
                {
                    optionCategoryId: 333,
                    name: "Sweet Candies",
                    displayOrder: 1,
                    active: true,
                    products: [
                        {
                            productId: "MKPRD1279245",
                            name: "Drinkho",
                            imagePaths: [
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1279245.jpeg",
                            ],
                            logo: "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1279245.jpeg",
                            priceAmount: 12,
                            shortDesc: "nice to drink leh",
                            currency: "RM",
                            avail: true,
                            weight: 1,
                            productDeepLinkUrl:
                                "Hey, I'd like to share with you Drinkho from digi 09 mdel I found on Sama-Sama Lokal. Check them out and lend a helping hand to our locals!\n\n https://test.vts.maybank.com.my:8553/api/v1/mobile/ssl/mae/MBUAT1205505/digi09mdel/MKPRD1279245",
                        },
                    ],
                },
            ],
        },
    },
};

export const merchantSample = {
    merchantId: "MBUAT1205412",
    shopName: "DaneMerchant001",
    logo: "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205412_Logo_.jpeg",
    open: true,
    openMessage: "",
    distance: "6.77 KM",
    deliveryTypes: [3, 2],
    pills: {
        deliveryTypePills: [
            {
                id: 2,
                name: "Self-Pickup",
                type: "Self-Pickup",
                color: null,
                status: false,
            },
            {
                id: 3,
                name: "Delivery",
                type: "Delivery",
                color: null,
                status: false,
            },
        ],
        promotionPills: [
            {
                id: 2,
                title: "Offer title 1",
                shortDesc: "15% off on minimum order value or RM30!",
                longDesc:
                    "Enjoy 15% off on min. order value of RM30! Use code: UMAIYA15 (Max Cap: RM20). T&C Apply.",
                tncLink:
                    "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/tnc/general_term_and_condition.page",
            },
        ],
        promo: true,
    },
    categoryId: 10,
    price: {
        price: 1,
        description: "$",
    },
    sectionIds: "[80,81,110,1248]",
    menuTypeIds: "[86,87,88,89]",
    sections: [
        {
            id: null,
            categoryId: 80,
            categoryName: "Support Lokal Hawkers",
            cuisineId: null,
            cuisineType: null,
        },
        {
            id: null,
            categoryId: 81,
            categoryName: "Support Lokal Grocers",
            cuisineId: null,
            cuisineType: null,
        },
        {
            id: null,
            categoryId: 110,
            categoryName: "Support Lokal Markets",
            cuisineId: null,
            cuisineType: null,
        },
        {
            id: null,
            categoryId: 1248,
            categoryName: "Cuti-Cuti Malaysia",
            cuisineId: null,
            cuisineType: null,
        },
    ],
    menuTypes: [
        {
            id: null,
            categoryId: 86,
            categoryName: "Halal",
            cuisineId: null,
            cuisineType: null,
        },
        {
            id: null,
            categoryId: 87,
            categoryName: "Chinese",
            cuisineId: null,
            cuisineType: null,
        },
        {
            id: null,
            categoryId: 88,
            categoryName: "Malay",
            cuisineId: null,
            cuisineType: null,
        },
        {
            id: null,
            categoryId: 89,
            categoryName: "Indian",
            cuisineId: null,
            cuisineType: null,
        },
    ],
    orderMethod: 2,
    favourite: false,
    mkp: true,
    maya: false,
    businessContactNo: "0125405196",
    businessDescription:
        "Italian cuisines are one of the most popular cuisines around the world. Moreover, it is widely available in India too. Dishes like pizza, pasta, and lasagna are favourite dishes of many people, and people like them a lot. Besides, cafés like Dominos and Pizza cabin are accessible everywhere on the nation. Each dish is load with cheddar, which upgrades the flavour of these Italian dishes. Indian cuisine –Whether veg or non-veg the dishes are in curry form. Moreover, Indian cuisine has so many..",
    outletAddress: "Berjaya Times Square, sefsefse, Imbi, Federal Territory of Kuala Lumpur",
    city: "Selangor",
    merchantPicture:
        "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205412_Picture_.jpeg",
    tncLink: "www.google.com",
    website: "",
    email: "abc@gg.com",
    openTimings: [
        {
            day: "Saturday",
            startTime: "9:00 AM",
            endTime: "6:00 PM",
        },
        {
            day: "Sunday",
            startTime: "9:00 AM",
            endTime: "6:00 PM",
        },
        {
            day: "Thursday",
            startTime: "9:00 AM",
            endTime: "9:00 PM",
        },
        {
            day: "Friday",
            startTime: "12:00AM",
            endTime: "11:59PM",
        },
        {
            day: "Tuesday",
            startTime: "12:00AM",
            endTime: "11:59PM",
        },
        {
            day: "Monday",
            startTime: "12:00AM",
            endTime: "11:59PM",
        },
        {
            day: "Wednesday",
            startTime: "9:00 AM",
            endTime: "11:00 PM",
        },
    ],
    mbbFreeDelivery: true,
    introduction: null,
    orderLimit: 100,
    deliveryRateList: [],
    products: [
        {
            icon: "https://d1sag4ddilekf6.cloudfront.net/compressed/items/MYITE20201009024530044942/photo/d0aa7c63_ORBURGER04.jpg",
            productId: "Testing Qty 2",
            name: "Testing Qty 2",
            imagePaths: [
                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
            ],
            priceAmount: 7.55,
            currency: "RM",
            suitableBike: false,
            sku: "-",
            shortDesc: "DeluxeRoom3D2N1",
            longDesc: "",
            size: "NaNcm x NaNcm x NaNcm",
            weight: 0,
            totalWeight: null,
            quantity: 2,
            avail: true,
        },
        {
            icon: "https://d1sag4ddilekf6.cloudfront.net/compressed/items/MYITE20201009024530044942/photo/d0aa7c63_ORBURGER04.jpg",
            productId: "Testing Item 1",
            name: "Testing Item 1",
            imagePaths: [
                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
            ],
            priceAmount: 7.5,
            currency: "RM",
            suitableBike: false,
            sku: "-",
            shortDesc: "DeluxeRoom3D2N1",
            longDesc: "",
            size: "NaNcm x NaNcm x NaNcm",
            weight: 0,
            totalWeight: null,
            quantity: 1000,
            avail: true,
        },
        {
            icon: "https://d1sag4ddilekf6.cloudfront.net/compressed/items/MYITE20201009024530044942/photo/d0aa7c63_ORBURGER04.jpg",
            productId: "Testing Expensive Soft",
            name: "Testing Expensive Soft",
            imagePaths: [
                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
            ],
            priceAmount: 150,
            currency: "RM",
            suitableBike: false,
            sku: "-",
            shortDesc: "DeluxeRoom3D2N1",
            longDesc: "",
            size: "NaNcm x NaNcm x NaNcm",
            weight: 0,
            totalWeight: null,
            quantity: 10000,
            avail: true,
        },
        {
            icon: "https://d1sag4ddilekf6.cloudfront.net/compressed/items/MYITE20201009024530044942/photo/d0aa7c63_ORBURGER04.jpg",
            productId: "Testing Expensive Hard",
            name: "Testing Expensive Hard",
            imagePaths: [
                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
            ],
            priceAmount: 999999999,
            currency: "RM",
            suitableBike: false,
            sku: "-",
            shortDesc: "DeluxeRoom3D2N1",
            longDesc: "",
            size: "NaNcm x NaNcm x NaNcm",
            weight: 0,
            totalWeight: null,
            quantity: 10000,
            avail: true,
        },
    ],
    promotions: null,
    orderBtn: true,
    merchantDeepLinkUrl:
        "Check out my store on Sama-Sama Lokal - DaneMerchant001. Every purchase you make count!\n\n https://test.vts.maybank.com.my:8553/api/v1/mobile/ssl/m2u/MBUAT1205412/DaneMerchant001",
    location: null,
    productName: null,
    priceRange: 1,
    merchantLogo: null,
    latitude: 3.147,
    longitude: 101.69,
    socialMedia: "www.google.com",
};

/** Add/Remove Favourite */
// POST: /fnb/v1/samasamalokal/postLogin/addAndRemoveFavourite
const req = {
    action: "REM", // "REM" or "ADD"
    merchantId: "MBUAT1205414",
};
const response = {
    message: "success",
    code: 200,
    challenge: null,
    result: {
        code: 200,
        status: "QR000",
        text: "success",
        merchantDetail: null,
    },
};

export const merchantDetailSampleResponse = {
    message: "success",
    code: 200,
    challenge: null,
    result: {
        code: 200,
        status: "QR000",
        text: "success",
        message: null,
        merchantDetail: {
            merchantId: "MBUAT1001232",
            shopName: "testfix004",
            logo: "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1001232_Logo_.png",
            open: false,
            openMessage: "Closed, opening on Monday at 5:37 AM",
            distance: "",
            deliveryTypes: [2, 4],
            pills: {
                deliveryTypePills: [
                    {
                        id: 2,
                        name: "Pickup",
                        type: "Pickup",
                        color: null,
                        status: true,
                    },
                    {
                        id: 4,
                        name: "Email",
                        type: "Email",
                        color: null,
                        status: true,
                    },
                ],
                promotionPills: null,
                promo: false,
            },
            categoryId: 1,
            price: {
                price: 1,
                description: "$",
            },
            sectionIds: "[72]",
            menuTypeIds: "[null]",
            sections: [
                {
                    id: null,
                    categoryId: 72,
                    categoryName: "[30% OFF] Sports Apparel & Equipment",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            menuTypes: null,
            orderMethod: 2,
            mkp: false,
            maya: false,
            averageRating: 0,
            totalReview: 0,
            rating: [],
            businessContactNo: "0125405196",
            businessDescription: "testfix004",
            outletAddress: "menara maybank",
            city: "WP Kuala Lumpur",
            merchantPicture:
                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1001232_Picture_.png",
            tncLink: "",
            website: "",
            email: "sweekwan.chow@maybank.com",
            openTimings: [
                {
                    day: "Monday",
                    startTime: "5:37 AM",
                    endTime: "6:37 PM",
                },
                {
                    day: "Friday",
                    startTime: "5:37 AM",
                    endTime: "6:37 PM",
                },
            ],
            mbbFreeDelivery: true,
            introduction: null,
            orderLimit: null,
            deliveryRateList: [
                {
                    km: 1,
                    price: 2,
                },
                {
                    km: 5,
                    price: 6,
                },
                {
                    km: 10,
                    price: 12,
                },
            ],
            promotions: ",2,3,",
            orderBtn: true,
            merchantDeepLinkUrl:
                "Hey, check out this store on Sama-Sama Lokal - testfix004 and lend a helping hand to our locals!\n\n https://test.vts.maybank.com.my:8553/api/v1/mobile/ssl/maeuat/MBUAT1001232/testfix004",
            cuisine: null,
            productName: null,
            priceRange: null,
            merchantLogo: null,
            latitude: null,
            longitude: null,
            socialMedia: null,
            optionCategory: [
                {
                    optionCategoryId: 91,
                    name: "Delete",
                    displayOrder: 1,
                    active: false,
                    products: [
                        {
                            icon: "https://d1sag4ddilekf6.cloudfront.net/compressed/items/MYITE20201009024530044942/photo/d0aa7c63_ORBURGER04.jpg",
                            productId: "Testing Expensive Soft",
                            name: "delete",
                            imagePaths: [
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                            ],
                            priceAmount: 150,
                            currency: "RM",
                            suitableBike: false,
                            sku: "-",
                            shortDesc: "DeluxeRoom3D2N1",
                            longDesc: "",
                            size: "NaNcm x NaNcm x NaNcm",
                            weight: 0,
                            totalWeight: null,
                            quantity: 10000,
                            avail: true,
                        },
                        {
                            icon: "https://d1sag4ddilekf6.cloudfront.net/compressed/items/MYITE20201009024530044942/photo/d0aa7c63_ORBURGER04.jpg",
                            productId: "Testing Expensive Hard",
                            name: "delete",
                            imagePaths: [
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                            ],
                            priceAmount: 999999999,
                            currency: "RM",
                            suitableBike: false,
                            sku: "-",
                            shortDesc: "DeluxeRoom3D2N1",
                            longDesc: "",
                            size: "NaNcm x NaNcm x NaNcm",
                            weight: 0,
                            totalWeight: null,
                            quantity: 10000,
                            avail: true,
                        },
                    ],
                },
                {
                    optionCategoryId: 142,
                    name: "New Category",
                    displayOrder: 1,
                    active: true,
                    products: [
                        {
                            icon: "https://d1sag4ddilekf6.cloudfront.net/compressed/items/MYITE20201009024530044942/photo/d0aa7c63_ORBURGER04.jpg",
                            productId: "Testing Expensive Hard",
                            name: "new category",
                            imagePaths: [
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                            ],
                            priceAmount: 999999999,
                            currency: "RM",
                            suitableBike: false,
                            sku: "-",
                            shortDesc: "DeluxeRoom3D2N1",
                            longDesc: "",
                            size: "NaNcm x NaNcm x NaNcm",
                            weight: 0,
                            totalWeight: null,
                            quantity: 10000,
                            avail: true,
                        },
                    ],
                },
                {
                    optionCategoryId: 143,
                    name: "Category",
                    displayOrder: 1,
                    active: true,
                    products: [
                        {
                            icon: "https://d1sag4ddilekf6.cloudfront.net/compressed/items/MYITE20201009024530044942/photo/d0aa7c63_ORBURGER04.jpg",
                            productId: "Testing Qty 2",
                            name: "category",
                            imagePaths: [
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                            ],
                            priceAmount: 7.55,
                            currency: "RM",
                            suitableBike: false,
                            sku: "-",
                            shortDesc: "DeluxeRoom3D2N1",
                            longDesc: "",
                            size: "NaNcm x NaNcm x NaNcm",
                            weight: 0,
                            totalWeight: null,
                            quantity: 2,
                            avail: true,
                        },
                        {
                            icon: "https://d1sag4ddilekf6.cloudfront.net/compressed/items/MYITE20201009024530044942/photo/d0aa7c63_ORBURGER04.jpg",
                            productId: "Testing Expensive Soft",
                            name: "Category",
                            imagePaths: [
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                            ],
                            priceAmount: 150,
                            currency: "RM",
                            suitableBike: false,
                            sku: "-",
                            shortDesc: "DeluxeRoom3D2N1",
                            longDesc: "",
                            size: "NaNcm x NaNcm x NaNcm",
                            weight: 0,
                            totalWeight: null,
                            quantity: 10000,
                            avail: true,
                        },
                        {
                            icon: "https://d1sag4ddilekf6.cloudfront.net/compressed/items/MYITE20201009024530044942/photo/d0aa7c63_ORBURGER04.jpg",
                            productId: "Testing Expensive Hard",
                            name: "Category",
                            imagePaths: [
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                            ],
                            priceAmount: 999999999,
                            currency: "RM",
                            suitableBike: false,
                            sku: "-",
                            shortDesc: "DeluxeRoom3D2N1",
                            longDesc: "",
                            size: "NaNcm x NaNcm x NaNcm",
                            weight: 0,
                            totalWeight: null,
                            quantity: 10000,
                            avail: true,
                        },
                    ],
                },
                {
                    optionCategoryId: 209,
                    name: "test",
                    displayOrder: 1,
                    active: false,
                    products: [
                        {
                            icon: "https://d1sag4ddilekf6.cloudfront.net/compressed/items/MYITE20201009024530044942/photo/d0aa7c63_ORBURGER04.jpg",
                            productId: "Testing Qty 2",
                            name: "test",
                            imagePaths: [
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                            ],
                            priceAmount: 7.55,
                            currency: "RM",
                            suitableBike: false,
                            sku: "-",
                            shortDesc: "DeluxeRoom3D2N1",
                            longDesc: "",
                            size: "NaNcm x NaNcm x NaNcm",
                            weight: 0,
                            totalWeight: null,
                            quantity: 2,
                            avail: true,
                        },
                    ],
                },
                {
                    optionCategoryId: 299,
                    name: "naming",
                    displayOrder: 1,
                    active: false,
                    products: [
                        {
                            icon: "https://d1sag4ddilekf6.cloudfront.net/compressed/items/MYITE20201009024530044942/photo/d0aa7c63_ORBURGER04.jpg",
                            productId: "naming",
                            name: "test",
                            imagePaths: [
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                            ],
                            priceAmount: 7.55,
                            currency: "RM",
                            suitableBike: false,
                            sku: "-",
                            shortDesc: "DeluxeRoom3D2N1",
                            longDesc: "",
                            size: "NaNcm x NaNcm x NaNcm",
                            weight: 0,
                            totalWeight: null,
                            quantity: 2,
                            avail: true,
                        },
                        {
                            icon: "https://d1sag4ddilekf6.cloudfront.net/compressed/items/MYITE20201009024530044942/photo/d0aa7c63_ORBURGER04.jpg",
                            productId: "naming",
                            name: "test",
                            imagePaths: [
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                            ],
                            priceAmount: 7.55,
                            currency: "RM",
                            suitableBike: false,
                            sku: "-",
                            shortDesc: "DeluxeRoom3D2N1",
                            longDesc: "",
                            size: "NaNcm x NaNcm x NaNcm",
                            weight: 0,
                            totalWeight: null,
                            quantity: 2,
                            avail: true,
                        },
                        {
                            icon: "https://d1sag4ddilekf6.cloudfront.net/compressed/items/MYITE20201009024530044942/photo/d0aa7c63_ORBURGER04.jpg",
                            productId: "naming",
                            name: "test",
                            imagePaths: [
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                            ],
                            priceAmount: 7.55,
                            currency: "RM",
                            suitableBike: false,
                            sku: "-",
                            shortDesc: "DeluxeRoom3D2N1",
                            longDesc: "",
                            size: "NaNcm x NaNcm x NaNcm",
                            weight: 0,
                            totalWeight: null,
                            quantity: 2,
                            avail: true,
                        },
                        {
                            icon: "https://d1sag4ddilekf6.cloudfront.net/compressed/items/MYITE20201009024530044942/photo/d0aa7c63_ORBURGER04.jpg",
                            productId: "naming",
                            name: "test",
                            imagePaths: [
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                            ],
                            priceAmount: 7.55,
                            currency: "RM",
                            suitableBike: false,
                            sku: "-",
                            shortDesc: "DeluxeRoom3D2N1",
                            longDesc: "",
                            size: "NaNcm x NaNcm x NaNcm",
                            weight: 0,
                            totalWeight: null,
                            quantity: 2,
                            avail: true,
                        },
                        {
                            icon: "https://d1sag4ddilekf6.cloudfront.net/compressed/items/MYITE20201009024530044942/photo/d0aa7c63_ORBURGER04.jpg",
                            productId: "naming",
                            name: "test",
                            imagePaths: [
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                            ],
                            priceAmount: 7.55,
                            currency: "RM",
                            suitableBike: false,
                            sku: "-",
                            shortDesc: "DeluxeRoom3D2N1",
                            longDesc: "",
                            size: "NaNcm x NaNcm x NaNcm",
                            weight: 0,
                            totalWeight: null,
                            quantity: 2,
                            avail: true,
                        },
                        {
                            icon: "https://d1sag4ddilekf6.cloudfront.net/compressed/items/MYITE20201009024530044942/photo/d0aa7c63_ORBURGER04.jpg",
                            productId: "naming",
                            name: "test",
                            imagePaths: [
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                            ],
                            priceAmount: 7.55,
                            currency: "RM",
                            suitableBike: false,
                            sku: "-",
                            shortDesc: "DeluxeRoom3D2N1",
                            longDesc: "",
                            size: "NaNcm x NaNcm x NaNcm",
                            weight: 0,
                            totalWeight: null,
                            quantity: 2,
                            avail: true,
                        },
                        {
                            icon: "https://d1sag4ddilekf6.cloudfront.net/compressed/items/MYITE20201009024530044942/photo/d0aa7c63_ORBURGER04.jpg",
                            productId: "naming",
                            name: "test",
                            imagePaths: [
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MKPRD1000578.png",
                            ],
                            priceAmount: 7.55,
                            currency: "RM",
                            suitableBike: false,
                            sku: "-",
                            shortDesc: "DeluxeRoom3D2N1",
                            longDesc: "",
                            size: "NaNcm x NaNcm x NaNcm",
                            weight: 0,
                            totalWeight: null,
                            quantity: 2,
                            avail: true,
                        },
                    ],
                },
            ],
        },
    },
};
