import { maeCustomerInfo, checkOperationTime, getChipMasterData } from "@services/index";

import { MAE_CARD_MGMT_LIST, MAE_CARD_DETAILS } from "@constants/data";
import { COMMON_ERROR_MSG, UNBLOCK_MAE_CARD_DESC } from "@constants/strings";

import { chiptdes } from "@libs/chiptdes";

import { hex2dec, dec2hex } from "@utils/convertBase";
import {
    leadingOrDoubleSpaceRegex,
    addressCharRegex,
    cityCharRegex,
    maeOnlyNumberRegex,
    employerNameSpclCharRegex,
} from "@utils/dataModel";
import { isEmpty } from "@utils/dataModel/utility";

export const validateAddressOne = (value, action) => {
    console.log("[CardManagementController] >> [validateAddressOne]");

    // Validation messages specific to Replacement/Renewal
    if (action === "MAE_CRD_RPM") {
        // Empty check
        if (!value) {
            return {
                isValid: false,
                message: "Please enter your address details.",
            };
        }

        // Min length check
        if (value.length < 5) {
            return {
                isValid: false,
                message: "Address Line 1 must be more than 5 characters.",
            };
        }

        // Check for leading or double spaces
        if (!leadingOrDoubleSpaceRegex(value)) {
            return {
                isValid: false,
                message: "Please remove invalid special characters.",
            };
        }

        // Address Line 1 Special Char check
        if (!addressCharRegex(value)) {
            return {
                isValid: false,
                message: "Please remove invalid special characters.",
            };
        }

        // Return true if no validation error
        return {
            isValid: true,
        };
    } else {
        // Empty check
        if (!value) {
            return {
                isValid: false,
                message: "Please enter input in Address Line 1.",
            };
        }

        // Min length check
        if (value.length < 5) {
            return {
                isValid: false,
                message: "Address Line 1 must be more than 5 characters.",
            };
        }

        // Check for leading or double spaces
        if (!leadingOrDoubleSpaceRegex(value)) {
            return {
                isValid: false,
                message: "Address Line 1 must not contain leading/double spaces.",
            };
        }

        // Address Line 1 Special Char check
        if (!addressCharRegex(value)) {
            return {
                isValid: false,
                message: "Please remove invalid special characters.",
            };
        }

        // Return true if no validation error
        return {
            isValid: true,
        };
    }
};

export const validateAddressTwo = (value, action) => {
    console.log("[CardManagementController] >> [validateAddressTwo]");

    // Validation messages specific to Replacement/Renewal
    if (action === "MAE_CRD_RPM") {
        // Empty check
        if (!value) {
            return {
                isValid: false,
                message: "Please enter your address details.",
            };
        }

        // Min length check
        if (value.length < 5) {
            return {
                isValid: false,
                message: "Address Line 1 must be more than 5 characters.",
            };
        }

        // Check for leading or double spaces
        if (!leadingOrDoubleSpaceRegex(value)) {
            return {
                isValid: false,
                message: "Please remove invalid special characters.",
            };
        }

        // Address Line 1 Special Char check
        if (!addressCharRegex(value)) {
            return {
                isValid: false,
                message: "Please remove invalid special characters.",
            };
        }

        // Return true if no validation error
        return {
            isValid: true,
        };
    } else {
        // Empty check
        if (!value) {
            return {
                isValid: false,
                message: "Please enter input in Address Line 2.",
            };
        }

        // Min length check
        if (value.length < 5) {
            return {
                isValid: false,
                message: "Address Line 2 must be more than 5 characters.",
            };
        }

        // Check for leading or double spaces
        if (!leadingOrDoubleSpaceRegex(value)) {
            return {
                isValid: false,
                message: "Address Line 2 must not contain leading/double spaces.",
            };
        }

        // Address Line 1 Special Char check
        if (!addressCharRegex(value)) {
            return {
                isValid: false,
                message: "Please remove invalid special characters.",
            };
        }

        // Return true if no validation error
        return {
            isValid: true,
        };
    }
};

export const validateCity = (value, action) => {
    console.log("[CardManagementController] >> [validateCity]");

    // Validation messages specific to Replacement/Renewal
    if (action === "MAE_CRD_RPM") {
        // Empty check
        if (!value) {
            return {
                isValid: false,
                message: "Please enter your city.",
            };
        }

        // Min length check
        if (value.length < 5) {
            return {
                isValid: false,
                message: "City must be more than 5 characters.",
            };
        }

        // Check for leading or double spaces
        if (!leadingOrDoubleSpaceRegex(value)) {
            return {
                isValid: false,
                message: "Please remove invalid special characters.",
            };
        }

        // Address Line 1 Special Char check
        if (!addressCharRegex(value)) {
            return {
                isValid: false,
                message: "Please remove invalid special characters.",
            };
        }

        // Return true if no validation error
        return {
            isValid: true,
        };
    } else {
        // Empty check
        if (!value) {
            return {
                isValid: false,
                message: "Please enter a city.",
            };
        }

        // Min length check
        if (value.length < 5) {
            return {
                isValid: false,
                message: "City must be more than 5 characters.",
            };
        }

        // Check for leading or double spaces
        if (!leadingOrDoubleSpaceRegex(value)) {
            return {
                isValid: false,
                message: "City must not contain leading/double spaces.",
            };
        }

        if (!cityCharRegex(value)) {
            return {
                isValid: false,
                message: "Please remove invalid special characters.",
            };
        }

        // Return true if no validation error
        return {
            isValid: true,
        };
    }
};

export const validatePostcode = (value, action) => {
    console.log("[CardManagementController] >> [validatePostcode]");

    // Validation messages specific to Replacement/Renewal
    if (action === "MAE_CRD_RPM") {
        // Empty check
        if (!value) {
            return {
                isValid: false,
                message: "Please enter your postcode.",
            };
        }

        // Check there are no other characters except numbers
        if (!maeOnlyNumberRegex(value)) {
            return {
                isValid: false,
                message: "Your postcode must not contain alphabets or special characters.",
            };
        }

        // Min length check
        if (value.length < 5) {
            return {
                isValid: false,
                message: "Postcode should not be less than 5 characters",
            };
        }

        // Return true if no validation error
        return {
            isValid: true,
        };
    } else {
        // Empty check
        if (!value) {
            return {
                isValid: false,
                message: "Please enter your postcode.",
            };
        }

        // Check there are no other characters except numbers
        if (!maeOnlyNumberRegex(value)) {
            return {
                isValid: false,
                message: "Your postcode must not contain alphabets or special characters.",
            };
        }

        // Min length check
        if (value.length < 5) {
            return {
                isValid: false,
                message: "Postcode should not be less than 5 characters",
            };
        }

        // Return true if no validation error
        return {
            isValid: true,
        };
    }
};

export const validateEmpName = (value) => {
    console.log("[CardManagementController] >> [validateEmpName]");

    // Check for leading or double spaces
    if (!leadingOrDoubleSpaceRegex(value)) {
        // err = err1;
        return {
            isValid: false,
            message: "Employer name must not contain leading/double spaces.",
        };
    }

    // Employer Name Special Char check
    if (!employerNameSpclCharRegex(value)) {
        // err = err2;
        return {
            isValid: false,
            message: "Employer name must not contain special characters.",
        };
    }

    // Return true if no validation error
    return {
        isValid: true,
    };
};

export const massageGCIFData = (data, idType, icNo) => {
    console.log("[CardManagementController] >> [massageGCIFData]");

    const genderVal = icNo % 2 ? "002" : "001";
    return {
        ...data,

        // Address
        addressOne: data?.address1 ?? "",
        addressTwo: data?.address2 ?? "",
        city: data?.address3 ?? "",
        postcode: data?.postCode ?? "",
        gender: idType == "01" ? genderVal : null,

        // Employment
        empName: data?.employerName ?? "",
        empType: data?.empType ?? null,
        monthInc: data?.monthlyIncome ?? null,
        occupation: data?.occupation ?? null,
        sector: data?.occupationSector ?? null,
    };
};

export const massageMasterData = (data, idType) => {
    console.log("[CardManagementController] >> [massageMasterData]");

    // Empty checking
    if (!data) return data;

    const {
        stateData,
        title,
        residentialcountryforeigner,
        permanentresidentcountry,
        employmentType,
        incomeRange,
        occupation,
        sector,
    } = data;

    // State Data Key-Val
    let stateKeyVal = {};
    if (stateData) {
        stateData.forEach((ele) => {
            const { value, display } = ele;
            stateKeyVal[value] = display;
        });
    }

    // Title Key-Val
    let titleKeyVal = {};
    if (title) {
        title.forEach((ele) => {
            const { value, display } = ele;
            titleKeyVal[value] = display;
        });
    }

    // Choose country data based on idType
    const countryData = idType == "05" ? residentialcountryforeigner : permanentresidentcountry;

    // Country Data Key-Val
    let countryDataKeyVal = {};
    if (countryData) {
        countryData.forEach((ele) => {
            const { value, display } = ele;
            countryDataKeyVal[value] = display;
        });
    }

    // Employment Type Key-Val
    let empTypeKeyVal = {};
    if (employmentType) {
        employmentType.forEach((ele) => {
            const { value, display } = ele;
            empTypeKeyVal[value] = display;
        });
    }

    // Employment Type Updated Array
    const employmentTypeArray = employmentType.map((item) => {
        return {
            ...item,
            name: item?.display ?? "",
        };
    });

    // Monthly Income Key-Val
    let monthlyIncomeKeyVal = {};
    if (incomeRange) {
        incomeRange.forEach((ele) => {
            const { value, display } = ele;
            monthlyIncomeKeyVal[value] = display;
        });
    }

    // Monthly Income Updated Array
    const incomeRangeArray = incomeRange.map((item) => {
        return {
            ...item,
            name: item?.display ?? "",
        };
    });

    // Occupation Key-Val
    let occupationKeyVal = {};
    if (occupation) {
        occupation.forEach((ele) => {
            const { value, display } = ele;
            occupationKeyVal[value] = display;
        });
    }

    // Occupation Updated Array
    const occupationArray = occupation.map((item) => {
        return {
            ...item,
            name: item?.display ?? "",
        };
    });

    // Sector Key-Val
    let sectorKeyVal = {};
    if (sector) {
        sector.forEach((ele) => {
            const { value, display } = ele;
            sectorKeyVal[value] = display;
        });
    }

    // Sector Updated Array
    const sectorArray = sector.map((item) => {
        return {
            ...item,
            name: item?.display ?? "",
        };
    });

    return {
        ...data,
        employmentType: employmentTypeArray,
        empTypeKeyVal,
        occupation: occupationArray,
        occupationKeyVal,
        sector: sectorArray,
        sectorKeyVal,
        incomeRange: incomeRangeArray,
        monthlyIncomeKeyVal,
        stateKeyVal,
        titleKeyVal,
        countryData,
        countryDataKeyVal,
    };
};

export const constructCardApplicationParams = (data, gcifData, customerType) => {
    console.log("[CardManagementController] >> [constructCardApplicationParams]");
    /*
     Need to enable for sept release
    const isValid = customerType === "10" || (data?.isETB && gcifData?.scoringInd === "N");*/
    const isValid = customerType === "10";
    if (gcifData) {
        return {
            // Address Screen Data
            address1: data?.addressOne ?? "",
            address2: data?.addressTwo ?? "",
            address3: data?.city ?? "",
            address4: "",
            postalCode: data?.postcode ?? "",
            state: data?.stateValue ?? "",
            city: data?.city ?? "",

            // Personal Screen Data
            title: gcifData?.title ?? "",
            gender: gcifData?.gender ?? "",
            race: gcifData?.race ?? "",
            residentialCountry: gcifData?.residentialCountry ?? "",
            purpose: gcifData?.purpose ?? "",

            // Employment Screen Data
            empType: isValid ? data?.empType ?? "" : gcifData?.empType ?? "",
            employerName: isValid ? data?.employerName ?? "" : gcifData?.employerName ?? "",
            monthlyIncome: isValid ? data?.monthlyIncome ?? "" : gcifData?.monthlyIncome ?? "",
            occupation: isValid ? data?.occupation ?? "" : gcifData?.occupation ?? "",
            occupationSector: isValid
                ? data?.occupationSector ?? ""
                : gcifData?.occupationSector ?? "",

            // PEP Screen Data
            pepDeclaration: data?.pepDeclaration ?? "",
            sourceOfFundCountry: data?.sourceOfFundCountry ?? "",

            // High Risk Screen Data
            sourceOfFundOrigin: data?.sourceOfFundOrigin ?? "",
            sourceOfWealthOrigin: data?.sourceOfWealthOrigin ?? "",

            // Others
            maeAcctNo: data.cardDetails?.maeAcctNo ?? "",
            transactionType: "applymaecard",
            ekycRefId: data?.ekycRefId ?? "",
            mobileSDKData: data?.mobileSDKData ?? {},
        };
    } else {
        return {
            // Address Screen Data
            address1: data?.addressOne ?? "",
            address2: data?.addressTwo ?? "",
            address3: data?.city ?? "",
            address4: "",
            postalCode: data?.postcode ?? "",
            state: data?.stateValue ?? "",
            city: data?.city ?? "",

            // Personal Screen Data
            title: data?.titleValue ?? "",
            gender: data?.gender ?? "",
            race: data?.ethnicityValue ?? "",
            residentialCountry: data?.countryResValue ?? "",
            purpose: data?.purposeValue ?? "",

            // Employment Screen Data
            empType: data?.empType ?? "",
            employerName: data?.employerName ?? "",
            monthlyIncome: data?.monthlyIncome ?? "",
            occupation: data?.occupation ?? "",
            occupationSector: data?.occupationSector ?? "",

            // PEP Screen Data
            pepDeclaration: data?.pepDeclaration ?? "",
            sourceOfFundCountry: data?.sourceOfFundCountry ?? "",

            // High Risk Screen Data
            sourceOfFundOrigin: data?.sourceOfFundOrigin ?? "",
            sourceOfWealthOrigin: data?.sourceOfWealthOrigin ?? "",

            // Others
            maeAcctNo: data.cardDetails?.maeAcctNo ?? "",
            transactionType: "applymaecard",
            ekycRefId: data?.ekycRefId ?? "",
            mobileSDKData: data?.mobileSDKData ?? {},
        };
    }
};

export const formatCreditCardNumber = (cardNo, accountType, accountCode) => {
    console.log("[CardManagementController] >> [formatCreditCardNumber]");

    const amexCodeList = [
        "34",
        "3D",
        "3E",
        "3F",
        "3I",
        "3J",
        "3K",
        "3L",
        "3U",
        "3V",
        "4A",
        "4C",
        "4K",
    ];
    let cardNumber = cardNo;
    const firstFiveChars = cardNumber.substring(0, 5);

    if (
        accountType === "R " ||
        accountType === "R" ||
        firstFiveChars === "37918" ||
        firstFiveChars === "37796" ||
        firstFiveChars === "37516" ||
        firstFiveChars === "37554"
    ) {
        cardNumber = cardNumber.substring(0, 15);
        return cardNumber;
    } else {
        if (accountCode in amexCodeList) {
            cardNumber = cardNumber.substring(0, 15);
            return cardNumber;
        } else {
            cardNumber = cardNumber.substring(0, 16);
            return cardNumber;
        }
    }
};

export const get_pinBlockEncrypt = (pin, card, tpk, chipMasterData) => {
    console.log("[CardManagementController] >> [get_pinBlockEncrypt]");

    // var me = this;
    let len, pinblocklen, pinlen;
    let pinblock = "";
    let cardBlock = "";
    let pinBlockArr = "";
    let pinBlockWithCard = "";
    pinlen = Number(chipMasterData.pinLength);
    pinblocklen = get_pinblocklen(chipMasterData);
    len = 2 + pinlen;

    if (isEmpty(pinlen) && isEmpty(pinblocklen)) {
        return pinBlockWithCard;
    }

    if (!tpk) {
        return pinBlockWithCard;
    }

    if (!pin && !card) {
        return pinBlockWithCard;
    }

    tpk = _decrypt_hsmtpk(tpk);
    if (!tpk) return pinBlockWithCard;

    //---- block formation F-----
    const fblock = new Array(pinblocklen - len + 1).join("F");

    //---- pinblock formation with pinlen,pinentered,remaining spaces filled with F-----
    pinblock = "0" + pinlen + pin + fblock;

    //---- example ------
    //pin = '06999999FFFFFFFF'
    //card = '0000400000123456'

    cardBlock = "0000" + card.substr(-13, 12);

    pinBlockArr = [];
    for (i in pinblock) {
        let pinhex = hex2dec(pinblock[i]);
        let cardhex = hex2dec(cardBlock[i]);

        if (pinhex.length == 3) pinhex = "0" + pinhex;
        if (cardhex.length == 3) cardhex = "0" + cardhex;

        let con = dec2hex(pinhex ^ cardhex);
        con = con.toUpperCase();

        pinBlockArr.push(con);
    }

    //------ pinblock XOR cardnum -------
    pinBlockWithCard = pinBlockArr.join("");
    if (pinBlockWithCard.length <= 15) {
        pinBlockWithCard = "0" + pinBlockWithCard;
    }
    //---- pinblock encrypt with tpk ------
    pinBlockWithCard = chiptdes.do_tdes(true, pinBlockWithCard, tpk);

    return pinBlockWithCard;
};

export const get_pinblocklen = (chipMasterData) => {
    console.log("[CardManagementController] >> [get_pinblocklen]");

    if (!isEmpty(chipMasterData)) {
        const num = Number(chipMasterData.pinBlkLength);
        return num;
    } else {
        return "";
    }
};

export const _decrypt_hsmtpk = (val) => {
    console.log("[CardManagementController] >> [_decrypt_hsmtpk]");
    const decrypt = val; // This is a placeholder for encryption/decryption to be done in future.
    return decrypt;
};

export const retrieveMAECardData = async (getModel) => {
    console.log("[CardManagementController] >> [retrieveMAECardData]");

    const urlParams = "?countryCode=MY&checkMaeAcctBalance=true";
    const httpResp = await maeCustomerInfo(urlParams, true).catch((error) => {
        console.log("[CardManagementController][maeCustomerInfo] >> Exception: ", error);
    });
    const data = httpResp?.data ?? null;
    if (!data) return { isError: true, errorMsg: COMMON_ERROR_MSG };

    const { code, message, result } = data;
    if (code == 200 && result) {
        // Error checking for card details
        const cardDetails = result?.debitInq ?? null;
        if (!cardDetails)
            return { isError: true, errorMsg: "Failed to retrieve card details in response" };

        // Static data retrieved from response
        const cardStatus = cardDetails?.cardStatus ?? null;
        const cardNextAction = cardDetails?.cardNextAction ?? null;
        const ovrSeasFlg = cardDetails?.ovrSeasFlg ?? null;
        const ovrSeasFlgStDt = cardDetails?.ovrSeasFlgStDt ?? null;
        const ovrSeasFlgEndDt = cardDetails?.ovrSeasFlgEndDt ?? null;

        // Dynamic fields to be changed based on data in response
        let isCardFrozen = false;
        let isOverseasActivated = false;
        let replaceRequested = false;
        let overseasStartDate = "";
        let overseasEndDate = "";
        let type = "PHYSICAL_CARD_MGMT";

        // Overseas Debit Status Check
        if (ovrSeasFlg == "Y") {
            isOverseasActivated = true;

            if (!isEmpty(ovrSeasFlgStDt)) {
                overseasStartDate = getOverseasFormattedDate(ovrSeasFlgStDt);
            }
            if (!isEmpty(ovrSeasFlgEndDt)) {
                overseasEndDate = getOverseasFormattedDate(ovrSeasFlgEndDt);
            }
        }

        // Update flags based on the indicators in response
        switch (cardStatus) {
            case "000":
                switch (cardNextAction) {
                    case "001":
                        // Virtual Card
                        console.log(
                            "[CardManagementController][retrieveMAECardData] >> Virtual Card. User can apply for physical card"
                        );
                        type = "VIRTUAL_CARD_MGMT";
                        break;
                    case "005":
                        // Card Replacement Status Check
                        console.log(
                            "[CardManagementController][retrieveMAECardData] >> Card replacement in progress"
                        );
                        replaceRequested = true;
                        break;
                    default:
                        break;
                }
                break;
            case "024":
                console.log("[CardManagementController][retrieveMAECardData] >> Card is frozen");
                isCardFrozen = true;
                break;
            default:
                // TODO: Handle exception case
                break;
        }

        // Get massaged Card Management List data
        const cardMgmtListData = massageCardMgmtListData(
            isCardFrozen,
            replaceRequested,
            isOverseasActivated,
            overseasStartDate,
            overseasEndDate,
            type,
            getModel
        );

        // Return the final object with data
        return {
            isError: false,
            errorMsg: "",
            maeCustomerInfo: result,
            cardDetails: cardDetails,
            type,
            data: cardMgmtListData,
            isCardFrozen: isCardFrozen,
        };
    } else {
        return { isError: true, errorMsg: message || COMMON_ERROR_MSG };
    }
};

export const getOverseasFormattedDate = (date) => {
    console.log("[CardManagementController] >> [getOverseasFormattedDate]");

    // Check all error scenarios
    if (isEmpty(date) || isNaN(date) || String(date).length != 8) {
        return "";
    }

    date = String(date);

    const yyyy = date.substr(0, 4);
    const mm = date.substr(4, 2);
    const dd = date.substr(6, 2);
    const dateObj = new Date(`${yyyy}-${mm}-${dd}`);

    return `${dateObj.getDate()} ${dateObj.toDateString().split(" ")[1]} ${dateObj.getFullYear()}`;
};

export const massageCardMgmtListData = (
    isCardFrozen,
    replaceRequested,
    isOverseasActivated,
    overseasStartDate,
    overseasEndDate,
    type,
    getModel
) => {
    console.log("[CardManagementController] >> [massageCardMgmtListData]");

    if (type === "VIRTUAL_CARD_MGMT") {
        return MAE_CARD_DETAILS;
    } else {
        const { autoTopupEnable } = getModel("autoTopup");
        console.log(autoTopupEnable);
        let itemsToAdd = [...MAE_CARD_MGMT_LIST];
        if (autoTopupEnable) {
            itemsToAdd.push({
                id: 5,
                itemId: "AUTOTOPUP",
                action: "MAE_CRD_AUTO_TOPUP", // MAE_CRD_RPM | MAE_CRD_RPM_INPROG
                header: "Auto Top Up",
                subText: null,
                iconType: "arrow",
                iconState: "",
                disabled: false,
            });
        }
        // Purchase limit option
        itemsToAdd.push({
            id: 6,
            serviceType: "Purchase Limit",
            itemId: "MAE_PURCHASE_LIMIT",
            action: "MAE_PURCHASE_LIMIT",
            header: "Purchase Limit",
            subText: null,
            iconType: "arrow",
            iconState: "",
            disabled: false,
        });
        const cardMgmtListData = itemsToAdd.map((item) => {
            const { itemId, action, subText, iconState } = item;

            switch (itemId) {
                case "FREEZE_UNFREEZE":
                    return {
                        ...item,
                        iconState: isCardFrozen ? "ON" : "OFF",
                        subText: isCardFrozen
                            ? UNBLOCK_MAE_CARD_DESC
                            : subText,
                        action: isCardFrozen ? "MAE_CARD_UNFREEZE" : action,
                    };
                    break;
                case "OVERSEAS":
                    let updatedSubText = "Your overseas debit is activated";
                    if (!isEmpty(overseasStartDate) && !isEmpty(overseasEndDate)) {
                        updatedSubText = "From " + overseasStartDate + " - " + overseasEndDate;
                    }

                    return {
                        ...item,
                        disabled: isCardFrozen,
                        action: isOverseasActivated ? "MAE_CRD_OVERSEAS_DACTIVATE" : action,
                        subText: isOverseasActivated ? updatedSubText : subText,
                        iconState: isOverseasActivated ? "ON" : iconState,
                    };
                    break;
                case "PC_PIN":
                    return {
                        ...item,
                        disabled: isCardFrozen,
                    };
                    break;
                case "REPLACE":
                    return {
                        ...item,
                        disabled: isCardFrozen,
                        action: replaceRequested ? "MAE_CRD_RPM_INPROG" : action,
                        subText: replaceRequested
                            ? "Your request for card replacement/renewal is being processed"
                            : subText,
                    };
                    break;
                default:
                    return {
                        ...item,
                    };
                    break;
            }
        });

        return cardMgmtListData;
    }
};

export const checkServerOperationTime = async (type, showLoader = true) => {
    console.log("[CardManagementController] >> [checkServerOperationTime]");

    try {
        const params = {
            requestType: type,
        };
        const response = await checkOperationTime(showLoader, params);
        return response.data.result;
    } catch (error) {
        // Default response
        return {
            statusCode: "9999",
            statusDesc: "Server communication error",
        };
    }
};

export const fetchChipMasterData = async (cardNo) => {
    console.log("[CardManagementController] >> [fetchChipMasterData]");

    // Default resp
    const defaultResp = {
        statusCode: "9999",
        statusDesc: COMMON_ERROR_MSG,
    };

    try {
        // Call API to fetch Chip Master Data
        const httpResp = await getChipMasterData(
            {
                cardNumber: cardNo,
            },
            true
        );

        const result = httpResp?.data?.result ?? null;
        if (!result) return defaultResp;

        const { statusCode, statusDesc } = result;
        if (statusCode === "0000") {
            return result;
        } else {
            return {
                statusCode: "9999",
                statusDesc: statusDesc || COMMON_ERROR_MSG,
            };
        }
    } catch (error) {
        console.log(
            "[CardManagementController][fetchChipMasterData] >> Exception: " + error.message
        );

        return defaultResp;
    }
};

export const getApplyMAECardNavParams = (maeCustomerInfo, trinityFlag) => {
    console.log("[CardManagementController] >> [getApplyMAECardNavParams]");

    return {
        cardDetails: maeCustomerInfo?.debitInq ?? null,
        applicantType: maeCustomerInfo?.applicantType ?? null,
        idType: maeCustomerInfo?.idType ?? null,
        customerType: maeCustomerInfo?.customerType ?? null,
        icNo: maeCustomerInfo?.icNo ?? null,
        m2uIndicator: maeCustomerInfo?.m2uIndicator ?? null,
        maeAcctBalance: maeCustomerInfo?.maeAcctBalance ?? null,
        eKycStatus: maeCustomerInfo?.ekycStatus ?? null,
        residentCountry: maeCustomerInfo?.residentCntry ?? null,
        serviceCharge: maeCustomerInfo?.svcChrg ?? 0,
        retryCntExceed: maeCustomerInfo?.retryCntExceed ?? null,
        trinityFlag,
    };
};
