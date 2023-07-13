// GET https://search.maybanksandbox.com/samasamalokal/search
export const request = {
    q: "nasi",
    loc: "3.977425, 102.120733",
    start: 0, // startingIndex
    rows: 10, // pageSize
};
export const response = {
    response_header: {
        found: 32, // totalNumberOfIndex
        next_start: 10, // next starting index
    },
    results: [
        {
            merchantId: "MBUAT12053900",
            shopName: "Nasi Lemak",
            logo: "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205399_Logo.png",
            open: true,
            pills: {
                deliveryTypePills: [
                    {
                        id: 2,
                        name: "Self-Pickup",
                        type: "Self-Pickup",
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
            price: {
                price: 1,
                description: "$",
            },
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
                    categoryId: 129,
                    categoryName: "Lokal Raya Delicacies",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            menuTypes: [
                {
                    id: null,
                    categoryId: 87,
                    categoryName: "Chinese",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 99,
                    categoryName: "Fresh Fruits and Vegetables",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 130,
                    categoryName: "Set Meals",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            categoryId: 1,
            cuisine: " Chinese Fresh Fruits and Vegetables Set Meals",
            outletAddress: "NO. 777, Seri Kembangan Selangor Malaysia",
            city: "Selangor",
            lat: 3.026099,
            long: 101.753128,
            merchantPicture:
                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205399.png",
            outlet_address: "NO. 777, Seri Kembangan Selangor Malaysia",
            products: [],
            openTimings: {
                Monday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Tuesday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Wednesday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Friday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Saturday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Sunday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Thursday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
            },
        },
        {
            merchantId: "MBUAasdgfadfgafhsdgfhdfghdfgT12053900",
            shopName: "Nasi Lemak",
            logo: "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205399_Logo.png",
            open: true,
            pills: {
                deliveryTypePills: [
                    {
                        id: 2,
                        name: "Self-Pickup",
                        type: "Self-Pickup",
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
            price: {
                price: 1,
                description: "$",
            },
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
                    categoryId: 129,
                    categoryName: "Lokal Raya Delicacies",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            menuTypes: [
                {
                    id: null,
                    categoryId: 87,
                    categoryName: "Chinese",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 99,
                    categoryName: "Fresh Fruits and Vegetables",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 130,
                    categoryName: "Set Meals",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            categoryId: 1,
            cuisine: " Chinese Fresh Fruits and Vegetables Set Meals",
            outletAddress: "NO. 777, Seri Kembangan Selangor Malaysia",
            city: "Selangor",
            lat: 3.026099,
            long: 101.753128,
            merchantPicture:
                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205399.png",
            outlet_address: "NO. 777, Seri Kembangan Selangor Malaysia",
            products: [],
            openTimings: {
                Monday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Tuesday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Wednesday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Friday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Saturday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Sunday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Thursday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
            },
        },
        {
            merchantId: "MsdfadfhgsweBUAT12053900",
            shopName: "Nasi Lemak",
            logo: "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205399_Logo.png",
            open: true,
            pills: {
                deliveryTypePills: [
                    {
                        id: 2,
                        name: "Self-Pickup",
                        type: "Self-Pickup",
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
            price: {
                price: 1,
                description: "$",
            },
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
                    categoryId: 129,
                    categoryName: "Lokal Raya Delicacies",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            menuTypes: [
                {
                    id: null,
                    categoryId: 87,
                    categoryName: "Chinese",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 99,
                    categoryName: "Fresh Fruits and Vegetables",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 130,
                    categoryName: "Set Meals",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            categoryId: 1,
            cuisine: " Chinese Fresh Fruits and Vegetables Set Meals",
            outletAddress: "NO. 777, Seri Kembangan Selangor Malaysia",
            city: "Selangor",
            lat: 3.026099,
            long: 101.753128,
            merchantPicture:
                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205399.png",
            outlet_address: "NO. 777, Seri Kembangan Selangor Malaysia",
            products: [],
            openTimings: {
                Monday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Tuesday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Wednesday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Friday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Saturday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Sunday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Thursday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
            },
        },
        {
            merchantId: "MBUAT120adafwhjkl53900",
            shopName: "Nasi Lemak",
            logo: "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205399_Logo.png",
            open: true,
            pills: {
                deliveryTypePills: [
                    {
                        id: 2,
                        name: "Self-Pickup",
                        type: "Self-Pickup",
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
            price: {
                price: 1,
                description: "$",
            },
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
                    categoryId: 129,
                    categoryName: "Lokal Raya Delicacies",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            menuTypes: [
                {
                    id: null,
                    categoryId: 87,
                    categoryName: "Chinese",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 99,
                    categoryName: "Fresh Fruits and Vegetables",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 130,
                    categoryName: "Set Meals",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            categoryId: 1,
            cuisine: " Chinese Fresh Fruits and Vegetables Set Meals",
            outletAddress: "NO. 777, Seri Kembangan Selangor Malaysia",
            city: "Selangor",
            lat: 3.026099,
            long: 101.753128,
            merchantPicture:
                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205399.png",
            outlet_address: "NO. 777, Seri Kembangan Selangor Malaysia",
            products: [],
            openTimings: {
                Monday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Tuesday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Wednesday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Friday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Saturday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Sunday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Thursday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
            },
        },
        {
            merchantId: "MBUAT1205390shdfgsdfgh0",
            shopName: "Nasi Lemak",
            logo: "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205399_Logo.png",
            open: true,
            pills: {
                deliveryTypePills: [
                    {
                        id: 2,
                        name: "Self-Pickup",
                        type: "Self-Pickup",
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
            price: {
                price: 1,
                description: "$",
            },
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
                    categoryId: 129,
                    categoryName: "Lokal Raya Delicacies",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            menuTypes: [
                {
                    id: null,
                    categoryId: 87,
                    categoryName: "Chinese",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 99,
                    categoryName: "Fresh Fruits and Vegetables",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 130,
                    categoryName: "Set Meals",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            categoryId: 1,
            cuisine: " Chinese Fresh Fruits and Vegetables Set Meals",
            outletAddress: "NO. 777, Seri Kembangan Selangor Malaysia",
            city: "Selangor",
            lat: 3.026099,
            long: 101.753128,
            merchantPicture:
                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205399.png",
            outlet_address: "NO. 777, Seri Kembangan Selangor Malaysia",
            products: [],
            openTimings: {
                Monday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Tuesday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Wednesday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Friday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Saturday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Sunday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Thursday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
            },
        },
        {
            merchantId: "MBasdfasdfaUAT12053900",
            shopName: "Nasi Lemak",
            logo: "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205399_Logo.png",
            open: true,
            pills: {
                deliveryTypePills: [
                    {
                        id: 2,
                        name: "Self-Pickup",
                        type: "Self-Pickup",
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
            price: {
                price: 1,
                description: "$",
            },
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
                    categoryId: 129,
                    categoryName: "Lokal Raya Delicacies",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            menuTypes: [
                {
                    id: null,
                    categoryId: 87,
                    categoryName: "Chinese",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 99,
                    categoryName: "Fresh Fruits and Vegetables",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 130,
                    categoryName: "Set Meals",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            categoryId: 1,
            cuisine: " Chinese Fresh Fruits and Vegetables Set Meals",
            outletAddress: "NO. 777, Seri Kembangan Selangor Malaysia",
            city: "Selangor",
            lat: 3.026099,
            long: 101.753128,
            merchantPicture:
                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205399.png",
            outlet_address: "NO. 777, Seri Kembangan Selangor Malaysia",
            products: [],
            openTimings: {
                Monday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Tuesday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Wednesday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Friday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Saturday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Sunday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Thursday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
            },
        },
        {
            merchantId: "MBccccssgghaUAT12053900",
            shopName: "Nasi Lemak",
            logo: "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205399_Logo.png",
            open: true,
            pills: {
                deliveryTypePills: [
                    {
                        id: 2,
                        name: "Self-Pickup",
                        type: "Self-Pickup",
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
            price: {
                price: 1,
                description: "$",
            },
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
                    categoryId: 129,
                    categoryName: "Lokal Raya Delicacies",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            menuTypes: [
                {
                    id: null,
                    categoryId: 87,
                    categoryName: "Chinese",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 99,
                    categoryName: "Fresh Fruits and Vegetables",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 130,
                    categoryName: "Set Meals",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            categoryId: 1,
            cuisine: " Chinese Fresh Fruits and Vegetables Set Meals",
            outletAddress: "NO. 777, Seri Kembangan Selangor Malaysia",
            city: "Selangor",
            lat: 3.026099,
            long: 101.753128,
            merchantPicture:
                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205399.png",
            outlet_address: "NO. 777, Seri Kembangan Selangor Malaysia",
            products: [],
            openTimings: {
                Monday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Tuesday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Wednesday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Friday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Saturday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Sunday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Thursday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
            },
        },
        {
            merchantId: "MBU11dfdsfAT12053900",
            shopName: "Nasi Lemak",
            logo: "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205399_Logo.png",
            open: true,
            pills: {
                deliveryTypePills: [
                    {
                        id: 2,
                        name: "Self-Pickup",
                        type: "Self-Pickup",
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
            price: {
                price: 1,
                description: "$",
            },
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
                    categoryId: 129,
                    categoryName: "Lokal Raya Delicacies",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            menuTypes: [
                {
                    id: null,
                    categoryId: 87,
                    categoryName: "Chinese",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 99,
                    categoryName: "Fresh Fruits and Vegetables",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 130,
                    categoryName: "Set Meals",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            categoryId: 1,
            cuisine: " Chinese Fresh Fruits and Vegetables Set Meals",
            outletAddress: "NO. 777, Seri Kembangan Selangor Malaysia",
            city: "Selangor",
            lat: 3.026099,
            long: 101.753128,
            merchantPicture:
                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205399.png",
            outlet_address: "NO. 777, Seri Kembangan Selangor Malaysia",
            products: [],
            openTimings: {
                Monday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Tuesday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Wednesday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Friday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Saturday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Sunday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Thursday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
            },
        },
        {
            merchantId: "MBUAT120539asdfuhbiw00",
            shopName: "Nasi Lemak",
            logo: "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205399_Logo.png",
            open: true,
            pills: {
                deliveryTypePills: [
                    {
                        id: 2,
                        name: "Self-Pickup",
                        type: "Self-Pickup",
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
            price: {
                price: 1,
                description: "$",
            },
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
                    categoryId: 129,
                    categoryName: "Lokal Raya Delicacies",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            menuTypes: [
                {
                    id: null,
                    categoryId: 87,
                    categoryName: "Chinese",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 99,
                    categoryName: "Fresh Fruits and Vegetables",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 130,
                    categoryName: "Set Meals",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            categoryId: 1,
            cuisine: " Chinese Fresh Fruits and Vegetables Set Meals",
            outletAddress: "NO. 777, Seri Kembangan Selangor Malaysia",
            city: "Selangor",
            lat: 3.026099,
            long: 101.753128,
            merchantPicture:
                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205399.png",
            outlet_address: "NO. 777, Seri Kembangan Selangor Malaysia",
            products: [],
            openTimings: {
                Monday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Tuesday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Wednesday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Friday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Saturday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Sunday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Thursday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
            },
        },
        {
            merchantId: "MBUAadfabhoiuybT12053900",
            shopName: "Nasi Lemak",
            logo: "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205399_Logo.png",
            open: true,
            pills: {
                deliveryTypePills: [
                    {
                        id: 2,
                        name: "Self-Pickup",
                        type: "Self-Pickup",
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
            price: {
                price: 1,
                description: "$",
            },
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
                    categoryId: 129,
                    categoryName: "Lokal Raya Delicacies",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            menuTypes: [
                {
                    id: null,
                    categoryId: 87,
                    categoryName: "Chinese",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 99,
                    categoryName: "Fresh Fruits and Vegetables",
                    cuisineId: null,
                    cuisineType: null,
                },
                {
                    id: null,
                    categoryId: 130,
                    categoryName: "Set Meals",
                    cuisineId: null,
                    cuisineType: null,
                },
            ],
            categoryId: 1,
            cuisine: " Chinese Fresh Fruits and Vegetables Set Meals",
            outletAddress: "NO. 777, Seri Kembangan Selangor Malaysia",
            city: "Selangor",
            lat: 3.026099,
            long: 101.753128,
            merchantPicture:
                "https://test.vts.maybank.com.my:8553/api/v1/mobile/Images/MBUAT1205399.png",
            outlet_address: "NO. 777, Seri Kembangan Selangor Malaysia",
            products: [],
            openTimings: {
                Monday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Tuesday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Wednesday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Friday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Saturday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Sunday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
                Thursday: {
                    startTime: "1:00",
                    endTime: "23:30",
                },
            },
        },
    ],
};
