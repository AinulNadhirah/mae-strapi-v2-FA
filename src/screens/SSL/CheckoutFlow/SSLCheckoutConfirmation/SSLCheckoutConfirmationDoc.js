/* eslint-disable no-unused-vars */

// S2U registered on other device (in this case physical, RMBP app)
let response = {
    flow: "S2U",
    secure2uValidateData: {
        app_id: "M2U",
        SECURE2U_SERVICE_ENABLE: true,
        function_code: "FN00015",
        action_flow: "S2U",
        device_name: "Tyleripong",
        device_status: true,
        hardware_id: "885FDAAA-8B8C-4ADC-A47D-BC3027CA5970",
        mdip_id: "e897d4aa-e38b-4f1c-b14e-6af166f1720f",
        registration_attempts: 0,
        s2u_enabled: true,
        updateGCM: true,
        updateMutliOTP: false,
        updatePublicKey: false,
        SECURE2U_DATA: {},
        updateMultiOTP: false,
        pull: "N",
        s2u_registered: false,
    },
};
// S2U registered on current device
response = {
    flow: "S2U",
    secure2uValidateData: {
        app_id: "MYA",
        SECURE2U_SERVICE_ENABLE: true,
        function_code: "FN00015",
        action_flow: "S2U",
        device_name: "iPhone12ProMax",
        device_status: true,
        hardware_id: "6F24BC1F-CDA6-4D30-9996-F7106F50D2B9",
        mdip_id: "38f386fe-1b32-4ac1-9b27-23577a248cb2",
        registration_attempts: 3,
        s2u_enabled: true,
        updateGCM: false,
        updateMutliOTP: false,
        updatePublicKey: false,
        SECURE2U_DATA: {},
        updateMultiOTP: false,
        pull: "Y",
        s2u_registered: true,
    },
};
// S2U registration successful
response = {
    auth: "success",
    flow: "S2UReg",
    secure2uValidateData: {
        app_id: "MYA",
        SECURE2U_SERVICE_ENABLE: true,
        function_code: "FN00015",
        action_flow: "S2U",
        device_name: "iPhone12ProMax",
        device_status: true,
        hardware_id: "6F24BC1F-CDA6-4D30-9996-F7106F50D2B9",
        mdip_id: "cc099c24-3b80-429f-918c-2337f7cedfc9",
        registration_attempts: 2,
        s2u_enabled: true,
        updateGCM: false,
        updateMutliOTP: false,
        updatePublicKey: false,
        SECURE2U_DATA: {},
        updateMultiOTP: false,
        pull: "Y",
        s2u_registered: true,
    },
    flowType: "S2UReg",
};

// S2U sign successful returned value (s2uModal transactionStatus, s2uSignRespone)
// transactionStatus -> true or false
const s2uSignRespone = {
    status: "M000",
    code: "200",
    text: "Authorized",
    statusCode: "M000",
    statusDescription: "Successful",
    payload: {
        transactionId: "181009908Q",
        RequestDt: "20211026",
        RequestTime: "091933",
        PAN: "0000007000315605",
        ApplID: "MYA",
        CustId: "000476930",
        HardwareId: "",
        CustName: "MAYA THREE",
        PhoneNum: "013-8564589",
        TokenNum: "00000070003156050038442287680080",
        ApprovalStatus: "00",
        PayeeName: "MAYA THREE",
        Amt: "+000000000001234",
        FrAcctId: "0140125642390000",
        ToAcctId: "1121031313190000",
        PayeeType: "",
        PayeeCode: "",
        BillingAcct: "",
        BillReferenceNo: "",
        EffectiveDate: "000000",
        CurCodeValue: "MYR",
        FromAcctBal: "+000000000196082",
        SeqNo: "+0000000",
        SerCharge: "",
        ValuDate: "",
        AprrovalCode: "",
        RechargeCode: "",
        SerialNo: "",
        LoginName: "",
        Password: "",
        MMERefNo: "",
        ToAcctCurCodeValue: "",
        ToAcctBal: "",
        ReversalInd: "",
        GSTAmt: "",
        TotalAmt: "",
        WUPointEarned: "",
        WUTransactionID: "",
        WUMoneyControlDate: "",
        WUMTCN: "",
        WUReturnDateTime: "",
        FILLER: "",
    },
    additionalStatusDescription: null,
    asnbTransferReceipt: {
        fundPrice: null,
        unitAllocated: null,
        saleChargePercentage: null,
        saleChargeRm: null,
        sstAmount: "0.00",
    },
    bakongReferenceNo: null,
    mbbRefNo: null,
    dateTime: null,
    pinBlock: null,
    maeCustRisk: null,
    serverDate: "26 Oct 2021",
    formattedTransactionRefNumber: "181009908Q",
};

/**
 * SSL Payment flow TAC:
 * 1.  /wallet/v1/ssl/verifyPayment
 * 2.  /2fa/v1/tac
 * 3.  /wallet/v1/ssl/SSLPayment
 */
const verifyPaymentReq = {
    transactionRefNo: "", // If Promo applied, pass this. Else null
    paymentRefNo: "", // Empty
    fromAccountNo: "114011000017",
    fullAccountNo: "1140110000170000000",
    rquid: null,
    fromAccountType: "S",
    fromAccountCode: "11",
    toAccountNo: "", // If promo applied, merchantDetailVOList.merchantAccountNo else null
    payerName: "", // customer name
    payeeName: "", // merchant name
    payeeCustomerKey: "",
    pymtType: null, // If promo applied, "paymentType". Else null
    twoFAType: null, // Empty
    tacValue: "", // Empty
    authMode: "P", // Hardcode P?
    messageAuthCode: "", // Empty
    orderDetailVO: {
        merchantId: "MBUAT1205413",
        promoCode: "ivenssl1",
        merchantName: "DaneMerchant002",
        subTotalAmount: "2.00",
        totalPaymentAmount: "2.00",
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
        totalWeight: "1.00",
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
        ],
    },
    mobileSDKData: {
        deviceDetail: "Android",
        deviceId: "LYA",
        deviceModel: "LYA-L29",
        deviceName: "HUAWEI Mate 20 Pro",
        devicePrint: "string",
        osType: "android",
        osVersion: "29",
        rsaKey: "BEB59080EB1092C28FE71A50BD762131",
        hardwareID: "87059c47-263a-47f8-a6f2-2d5cf87ad6d9",
        screenSize: "1440x2860",
        languages: "en",
        multitaskingSupported: true,
        timestamp: "",
        geoLocationInfo: {
            Latitude: "3.0789311",
            Longitude: "101.6541895",
            Status: "0",
            Timestamp: "1626404335011",
            HorizontalAccuracy: "15",
        },
        emulator: 0,
        osId: "5755a07a212e7930",
        compromised: 0,
        sdkVersion: "4.1",
    },
};
const verifyPaymentRes = {
    message: "success",
    code: 200,
    challenge: null,
    result: {
        transactionRefNumber: null,
        rquid: "MC11111117180936582Q",
        paymentRefNumber: "180936582Q",
        orderId: null,
        deliveryOrderId: null,
        statusCode: "200",
        statusDescription: "success",
        serverDate: "17 Sep 2021, 10:46 AM",
    },
};

// 2. /2fa/v1/tac
const tacReq = {
    fundTransferType: "SSL_PAYMENT",
    accCode: "11",
    toAcctNo: "M2UT262791274050080801", // If has promo code, send merchant's acc number. If no promo, send user's acc number
};
const tacResFail = {
    errors: [
        {
            code: 200,
            message:
                "You have already submitted a TAC request earlier.To avoid multiple TAC requests, please wait a few minutes for your TAC to be sent to you before making another request.",
            field: null,
            serverDate: "18 Sep 2021",
            refId: "180938324M",
            transactionRefNumber: "N/A",
        },
    ],
};
const tacResSuccess = {
    statusCode: "0",
    statusDesc: "Success",
    token: "641139",
    smsSentStatus: 1,
    responseStatus: "0000",
    smsMessage: "SSL_PAYMENT",
    tacMobileUpdate: "",
    s2uTransactionId: null,
    tacMobileNo: "0162385469",
    tokenSuccessful: true,
};

// 3. /wallet/v1/ssl/SSLPayment
const SSLPaymentReq = {
    transactionRefNo: "MC11111117180935675Q",
    paymentRefNo: "180935675Q", // get from above result.paymentRefNumber
    fromAccountNo: "114011000017",
    fullAccountNo: "1140110000170000000",
    rquid: "", // get from above result.rquid
    fromAccountType: "S",
    fromAccountCode: "11",
    toAccountNo: "",
    payerName: "",
    payeeName: "",
    payeeCustomerKey: "",
    pymtType: "",
    twoFAType: "TAC",
    tacValue: "449194",
    authMode: "P",
    messageAuthCode: "",
    orderDetailVO: {
        customerId: "160000007000429485",
        merchantId: "MBUAT1205413",
        promoCode: "ivenssl1",
        merchantName: "DaneMerchant002",
        subTotalAmount: "2.00",
        totalPaymentAmount: "2.00",
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
        totalWeight: "1.00",
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
        ],
    },
    mobileSDKData: {
        deviceDetail: "Android",
        deviceId: "LYA",
        deviceModel: "LYA-L29",
        deviceName: "HUAWEI Mate 20 Pro",
        devicePrint: "string",
        osType: "android",
        osVersion: "29",
        rsaKey: "BEB59080EB1092C28FE71A50BD762131",
        hardwareID: "87059c47-263a-47f8-a6f2-2d5cf87ad6d9",
        screenSize: "1440x2860",
        languages: "en",
        multitaskingSupported: true,
        timestamp: "",
        geoLocationInfo: {
            Latitude: "3.0789311",
            Longitude: "101.6541895",
            Status: "0",
            Timestamp: "1626404335011",
            HorizontalAccuracy: "15",
        },
        emulator: 0,
        osId: "5755a07a212e7930",
        compromised: 0,
        sdkVersion: "4.1",
    },
};
const SSLPaymentRes = {
    message: "success",
    code: 200,
    challenge: null,
    result: {
        transactionRefNumber: null,
        serverDate: null,
        pollingToken: null,
        pollingStart: null,
        pollingStatus: null,
        onHold: false,
        rsaStatus: null,
        challenge: null,
        formattedTransactionRefNumber: null,
        statusCode: null, // (statusCode === "S" || statusCode === "0" || statusCode === "0000" <- transaction amount is zero) <-- success. Else fail
        statusDescription: "Success",
        additionalStatusDescription: null,
        additionalStatus: null,
        paymentRef: "180935675Q",
        trxRef: "180935675Q",
        trxDateTime: "2021-09-15T12:17:45.378+0000",
        payeeName: null,
        amount: 0.0,
        payeeAccountNo: null,
        success: true,
        qrCategory: null,
        qrText: null,
        s2w: null,
        recepientPan: null,
        payAmount: "0.00",
        trxDateTimeFomat: "15 Sep 2021, 8:17 PM",
    },
};

/** Below are 2 example of error response from API.
 * For SSLPaymentFailWrongTAC response , it falls under the format where APIManager.js rejects with 
 * reject({
        status: error.response.status,
        error: errorObj,
        message: errorObj.error?.message,
    });

    but SSLPaymentFailInsufficientFunc (or other error), it falls nder the format where APIManager.js rejects with 
    
    if (Array.isArray(errorObj.errors)) {
        if (promptError) {
            let errors = errorObj.errors.map(
                (error) => error.message
            );
            // StateManager.updateErrorMessages(errors);
            showErrorToast({
                message: errors[0],
            });
        }
        reject({
            status: error.response.status,
            error: errorObj.errors[0],
            message: errorObj.errors[0].message,
        });
    }

    Hence the difference in format. We need to cater for both .. 
 */
const SSLPaymentFailWrongTAC = {
    status: 400,
    error: {
        message: "Unsuccessful",
        code: 400,
        challenge: null,
        result: null,
        error: {
            transactionRefNumber: null,
            serverDate: "13 Oct 2021, 8:10 PM",
            pollingToken: null,
            pollingStart: null,
            pollingStatus: null,
            onHold: false,
            rsaStatus: null,
            challenge: null,
            formattedTransactionRefNumber: null,
            statusCode: null,
            statusDescription: "Wrong TAC entered.",
            additionalStatusDescription: null,
            additionalStatus: null,
            paymentRef: null,
            trxRef: null,
            trxDateTime: null,
            payeeName: null,
            amount: 0,
            payeeAccountNo: null,
            success: false,
            qrCategory: null,
            qrText: null,
            s2w: null,
            recepientPan: null,
            orderTransactionRefNo: null,
            rquid: null,
            orderId: null,
            deliveryOrderId: null,
            merchantName: null,
            deliveryTypeVO: null,
            processOrderStatus: null,
            orderDetailVO: null,
            payAmount: "0.00",
            trxDateTimeFomat: "",
        },
    },
    message: "Unsuccessful",
};
const SSLPaymentFailInsufficientFunc = {
    status: 400,
    error: {
        code: 9999,
        message:
            "The system is currently unavailable due to communication error. Please perform the request again.",
        field: null,
        serverDate: "N/A",
        refId: "N/A",
        transactionRefNumber: "N/A",
    },
    message:
        "The system is currently unavailable due to communication error. Please perform the request again.",
};
