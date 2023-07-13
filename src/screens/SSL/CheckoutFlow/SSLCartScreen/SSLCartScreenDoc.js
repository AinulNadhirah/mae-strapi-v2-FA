/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
// URL POST /wallet/v1/ssl/deliveryCharges
let product = {}; // existing backend returned product object
let deliveryChargesReq = {
    merchantId: "MBUAT1205394",
    deliveryType: 3,
    categoryId: "7",
    addressDetail: {
        addressLine1: "2",
        addressLine2: "Jalan brp 6/9a", // addressLine2 is optional now
        city: "Bukit rahman putra",
        state: "SELANGOR",
        postcode: "40160",
    },
    products: [
        {
            totalWeight: 2, // new
            productId: "MKPRD1000599",
            name: "Watermelon",
            totalAmt: "1.00", // new
            quantity: 1, // new
            size: "244cm x 91cm x 122cm",
            ...product, // return all product attribute back to backend
        },
    ],
    totalWeight: "2.00", // total weight of all products
};

export const deliveryChargesRes = {
    message: "success",
    code: 200,
    challenge: null,
    result: {
        code: 200,
        status: "QR000",
        text: "success",
        transactionRefNo: "MC11111117180919875M",
        deliveryRecpName: null,
        deliveryServiceCode: "GE-KV-SSL-TEST",
        deliveryAvailable: true,
        deliveryCharge: 0.0, // Cart screen - display this
        originalCharge: 0.0, // Cart screen - show only mbbFreeDelivery = true, strikethrough, left of deliveryCharge
        discountCharge: 0.0, // not being used
        deliveryType: "1", // used in findRider screen. will take precedence over user selected deliveryType
        deliveryDistance: "24.87", // not being used
        deliveryText: "", // Might return FREE. If so, we display FREE for deliveryCharges' value (right side lbl)
        mbbFreeDelivery: false, // Cart screen - if true, show strikethrough originalCharge deliveryCharge
        showDeliveryCharge: 1, // Cart screen 1 = show,
        riderFoundInterval: 120, // needed for findRider screen
        apiRiderFoundInterval: 30, // needed for findRider screen
        riderFoundRetry: 3, // needed for findRider screen
        deliveryQuotationInfo: {
            deliveryOutOfCoverage: false,
            from: {
                lat: 3.1036618,
                lon: 101.6426866,
            },
            to: {
                lat: 3.2258269,
                lon: 101.5573661,
            },
            distance: 24,
            bikeUsed: true,
        },
        deliveryOutOfCoverage: false, // Cart screen - prompt out of coverage
        deliveryCoverage: false,
        deliveryServiceName: "Grab Express", // Cart screen - display this
        deliveryDisclaimer:
            "*This delivery is powered by Delyva. Kindly take note that Maybank does not impose a price mark up for your purchases and delivery fees.", // Cart screen - display this
        deliveryNote: "", // Prompt user if not empty - Additional Delivery fee msg
        deliveryProcess: null,
    },
};

// Get previous email & full name (selectedDeliveryId === 4 , email)
// GET fnb/v1/ssl/order/previous-recipient
let recipient = {
    id: null,
    name: "Deepika",
    email: "Cutydpk@gmail.com",
};

// Verify Promo Code
// POST:/wallet/v1/sama2lokal/createSSLOrder
// We cache product, delivery, promo together. Each time product is changed, we re-call all the Apis
let createSSLOrderReq = {
    transactionRefNo: "MC11111117180915569M", // null if first time call. 2nd time use back response's transactionRefNo
    orderDetailVO: {
        merchantId: "MBUAT1205413", // mandatory
        merchantName: "DaneMerchant002", // mandatory
        subTotalAmount: "2.00", // mandatory
        totalPaymentAmount: "2.00", // mandatory
        isMkp: true, // mandatory
        deliveryType: 2, // mandatory
        deliveryChargeDetail: {
            // 1, 3 send
            deliveryServiceCode: "GE-KV-SSL-TEST",
            deliveryAvailable: true,
            deliveryCharge: 0.0,
            originalCharge: 0.0,
            discountCharge: 0.0,
            deliveryType: "1",
            deliveryDistance: "23.48",
            deliveryText: "",
            mbbFreeDelivery: false,
            showDeliveryCharge: 1,
            riderFoundInterval: 120,
            apiRiderFoundInterval: 30,
            riderFoundRetry: 3,
            deliveryQuotationInfo: {
                deliveryOutOfCoverage: false,
                from: {
                    lat: 3.1036618,
                    lon: 101.6426866,
                },
                to: {
                    lat: 3.2258269,
                    lon: 101.5573661,
                },
                distance: 23.48,
                bikeUsed: true,
            },
            deliveryOutOfCoverage: false,
            deliveryCoverage: false,
            deliveryServiceName: "Grab Express",
            deliveryDisclaimer:
                "*This delivery is powered by Delyva. Kindly take note that Maybank does not impose a price mark up for your purchases and delivery fees.",
            deliveryNote: "",
        },
        promoCode: "", // promo code here
        totalWeight: "1.00", // mandatory
        recipientName: "Tesla", // receipient name
        addressDetail: {
            email: "abc@gmail.com",
            contactNo: "0105088976", //hardcode contactNo for now, in the future remove it
            // ...address
        },
        products: [
            // mandatory
            {
                productId: "MKPRD1000665",
                unitPrice: "2.00",
                size: "12cm x 12cm x 12cm",
                name: "Menu 1",
                totalAmt: "2.00",
                quantity: 1,
                weight: 1,
                totalWeight: 1,
                isAvail: true,
            },
        ],
    },
    mobileSDKData: {
        deviceDetail: "Android",
        deviceId: "sdm710",
        deviceModel: "SM-T725",
        deviceName: "Galaxy Tab S5e",
        devicePrint: "string",
        osType: "android",
        osVersion: "29",
        rsaKey: "110C844C28DCD30D3555B993B214E67B",
        hardwareID: "3ebc22b3-4fad-452b-8ee1-3e7d9da9818f",
        screenSize: "1600x2452",
        languages: "en",
        multitaskingSupported: true,
        timestamp: "",
        geoLocationInfo: {
            Latitude: "3.2128194",
            Longitude: "101.6730086",
            Status: "0",
            Timestamp: "1618759383177",
            HorizontalAccuracy: "13",
        },
        emulator: 0,
        osId: "42db773f21d8fc32",
        compromised: 0,
        sdkVersion: "4.1",
    },
};
let createSSLOrderRes = {
    message: "success",
    code: 200,
    challenge: null,
    result: {
        code: 200,
        status: "QR000",
        text: "Success",
        merchantDetailVOList: [
            {
                merchantAccountNo: "112103131319",
                netAmount: "2.00",
                finalAmount: "2.00",
                discountAmount: "0.00",
                bankCode: "588734",
                bankName: "MALAYAN BANKING BERH",
                orderTransactionRefNo: "MBUAT111111111437407",
                businessName: "DaneMerchant002",
                paymentType: "002",
                payeeCode: "MBUAT1205413",
                promoVerifiedKey: null,
                promoType: null,
            },
        ],
        orderVO: {
            orderId: "MBBOR111111111217446",
            deliveryOrderId: null,
            customerId: "160000007000429485",
            products: [
                {
                    productId: "MKPRD1000665",
                    name: "Menu 1",
                    imagePaths: null,
                    logo: null,
                    unitPrice: 2.0,
                    totalAmt: 2.0,
                    currency: null,
                    suitableBike: false,
                    sku: null,
                    shortDesc: null,
                    longDesc: null,
                    size: "12cm x 12cm x 12cm",
                    weight: 1.0,
                    totalWeight: 1.0,
                    quantity: 1,
                    avail: false,
                },
                {
                    productId: "MKPRD1000725",
                    name: "Nasi Lemak",
                    imagePaths: null,
                    logo: null,
                    unitPrice: 14.0,
                    totalAmt: 14.0,
                    currency: null,
                    suitableBike: false,
                    sku: null,
                    shortDesc: null,
                    longDesc: null,
                    size: "1 cm x1 cm x1cm",
                    weight: 0.01,
                    totalWeight: 0.01,
                    quantity: 1,
                    avail: false,
                },
            ],
        },
    },
};

let createSSLOrderResponseWRefNo = {
    transactionRefNo: "MBUAT111111111437543",
    orderDetailVO: {
        merchantId: "MBUAT1205413",
        promoCode: "ivenssl1",
        merchantName: "DaneMerchant002",
        subTotalAmount: "16.00",
        totalPaymentAmount: "16.00",
        isMkp: true,
        deliveryType: 2,
        deliveryChargeDetail: {
            deliveryServiceCode: "GE-KV-SSL-TEST",
            deliveryAvailable: true,
            deliveryCharge: 0.0,
            originalCharge: 0.0,
            discountCharge: 0.0,
            deliveryType: "1",
            deliveryDistance: "23.48",
            deliveryText: "",
            mbbFreeDelivery: false,
            showDeliveryCharge: 1,
            riderFoundInterval: 120,
            apiRiderFoundInterval: 30,
            riderFoundRetry: 3,
            deliveryQuotationInfo: {
                deliveryOutOfCoverage: false,
                from: {
                    lat: 3.1036618,
                    lon: 101.6426866,
                },
                to: {
                    lat: 3.2258269,
                    lon: 101.5573661,
                },
                distance: 23.48,
                bikeUsed: true,
            },
            deliveryOutOfCoverage: false,
            deliveryCoverage: false,
            deliveryServiceName: "Grab Express",
            deliveryDisclaimer:
                "*This delivery is powered by Delyva. Kindly take note that Maybank does not impose a price mark up for your purchases and delivery fees.",
            deliveryNote: "",
        },
        recipientName: "Tesla",
        addressDetail: {
            email: "abc@gmail.com",
            contactNo: "0105088976",
        },
        products: [
            {
                productId: "MKPRD1000665",
                unitPrice: "2.00",
                size: "12cm x 12cm x 12cm",
                name: "Menu 1",
                totalAmt: "2.00",
                quantity: 1,
                weight: 1,
                totalWeight: 1,
                isAvail: true,
            },
            {
                productId: "MKPRD1000725",
                name: "Nasi Lemak",
                unitPrice: "14.00",
                totalAmt: "14.00",
                size: "1 cm x1 cm x1cm",
                weight: 0.01,
                totalWeight: 0.01,
                quantity: 1,
                isAvail: true,
            },
        ],
        totalWeight: "1.01",
    },
};

let error = {
    message: "Unsuccessful",
    code: 400,
    challenge: null,
    result: {
        code: 0,
        status: "9999",
        text: "Promo already applied",
        merchantDetailVOList: null,
        orderVO: null,
    },
};
