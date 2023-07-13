import {
    m2uEnrollment,
    maeCustomerInquiry,
    maeCreateAccount,
    updateAddressDetails,
    resumeApplication,
} from "@services";

import { CAPTURE_DOCS_BASE64 } from "@constants/data";

export const enrollmentCall = (filledUserDetails, mobileSDKData) => {
    // const { deviceInformation, deviceId } = deviceInfo;
    const params = {
        grantType: "PASSWORD",
        tokenType: "PASSWORD",
        username: filledUserDetails.usernameDetails.username,
        passwd: filledUserDetails.usernameDetails.password,
        mobileSDKData,
    };
    console.log(params);

    return m2uEnrollment(params, true)
        .then((response) => {
            console.log("[MAEOnboardController][enrollmentCall] >> Success");
            if (response && response.data) {
                // IdleManager.updateTimeStamp();
                return response;
            }
        })
        .catch((error) => {
            console.log("[MAEOnboardController][enrollmentCall] >> Failure");
            return error;
        });
};

export const resumeMAE = (params) => {
    return resumeApplication(params)
        .then((response) => {
            console.log("[MAEOnboardController][resumeMAE] >> Success");
            if (response && response.data) {
                return response;
            }
        })
        .catch((error) => {
            console.log("[MAEOnboardController][resumeMAE] >> Failure");
            return error;
        });
};

export const updateAddress = (filledUserDetails) => {
    const { onBoardDetails3, MAEOnboardEmploymentDetails } = filledUserDetails;
    const params = {
        addr1: onBoardDetails3?.addressLine1,
        addr2: onBoardDetails3?.addressLine2,
        addr3: onBoardDetails3?.city,
        addr4: onBoardDetails3?.stateCode,
        postCode: onBoardDetails3?.postcode,
        empType: MAEOnboardEmploymentDetails?.employeeTypeid || "",
        employerName: MAEOnboardEmploymentDetails?.employerName || "",
        occupation: MAEOnboardEmploymentDetails?.occupationid || "",
        sector: MAEOnboardEmploymentDetails?.sectorid || "",
    };
    console.log(params);

    return updateAddressDetails(params)
        .then((response) => {
            console.log("[MAEOnboardController][updateAddress] >> Success");
            if (response && response.data) {
                return response?.data?.result;
            }
        })
        .catch((error) => {
            console.log("[MAEOnboardController][updateAddress] >> Failure");
            return error;
        });
};

export const maeETBCustEnq = (path) => {
    console.log("[MAEOnboardController][maeETBCustEnq]");
    const data = {
        idType: "",
        birthDate: "",
        preOrPostFlag: "postlogin",
        icNo: "",
    };
    return maeCustomerInquiry(data, path)
        .then((response) => {
            console.log("[MAEOnboardController][maeETBCustEnq] >> Success");
            return response?.data?.result;
        })
        .catch((error) => {
            console.log("[MAEOnboardController][maeETBCustEnq] >> Failure");
            return error;
        });
};

export const ETBFilledUserDetails = (response, from) => {
    const onBoardDetails = {
        fullName: response.customerName,
        mobileNumber: response.mobileNo,
    };
    const onBoardDetails2 = {
        idNo: response.idNo,
        userDOB: response.birthDate,
        maeCustomerInquiry: response,
        from,
        selectedIDCode: response.idType,
    };
    const onBoardDetails3 = {
        addressLine1: response.addr1,
        addressLine2: response.addr1,
        city: response.addr3,
        stateCode: response.addr4,
        postcode: response.postCode,
    };
    return {
        onBoardDetails,
        onBoardDetails2,
        onBoardDetails3,
    };
};

export const createMAE = (filledUserDetails, isOnboard, trinityFlag, isZoloz) => {
    console.log("[MAEOnboardController][createMAE]");
    const {
        onBoardDetails,
        onBoardDetails2,
        onBoardDetails3,
        MAEOnboardEmploymentDetails,
        onBoardDetails4,
        tncData,
        documentImages,
        selfieImages,
        docData,
        pepDeclaration,
    } = filledUserDetails;

    //Gender : M - Lelaki  F - Perempuan
    //Gender check is only for NTB Customers
    let gender = "";
    let countryCode = "";
    let expiryDate = "";
    if (isZoloz) {
        gender = __DEV__ ? "M" : docData?.SEX; // === "M" ? "M" : "F";
        expiryDate = __DEV__
            ? "2029 10 30"
            : docData?.EXPIRY_DATE
            ? docData?.EXPIRY_DATE.replace(/\//g, " ")
            : "";
        countryCode = __DEV__ ? "IND" : docData?.COUNTRY_CODE;
    } else {
        if (docData?.sex === "M" || docData?.sex === "LELAKI") {
            gender = "M";
        } else if (docData?.sex === "F" || docData?.sex === "PEREMPUAN") {
            gender = "F";
        }
        expiryDate = docData?.expiration_date;
        countryCode = docData?.issuing_org;
    }
    //expiration_date = "2029 10 30"
    //issuing_org = "IND"
    const preOrPostFlag = onBoardDetails2.from === "NewMAE" ? "prelogin" : "postlogin";
    const data = {
        addr1: onBoardDetails3?.addressLine1,
        addr2: onBoardDetails3?.addressLine2,
        addr3: onBoardDetails3?.city,
        addr4: onBoardDetails3?.stateCode,
        birthDate: onBoardDetails2?.userDOB,
        customerName: onBoardDetails?.fullName,
        citizenship: onBoardDetails2?.passportCountryCode,
        customerEmail: onBoardDetails4?.emailAddress,
        crsCitizenSelected: "", //tncData?.radioCRSYesChecked ? "Y" : "N",
        crsState: "", //tncData?.taxCRSCountry,
        crsStateValue: "", //tncData?.taxCRSCountryCode,
        crsTin: "", //tncData.crsTINNum,
        custStatus: onBoardDetails2?.maeCustomerInquiry?.custStatus,
        fatcaUSTaxID: "", //tncData?.usTaxID,
        fatcaStateValue: "", //tncData?.taxCountryCode,
        fatcaTin: "", //tncData?.fatcaTINNum,
        gcif: onBoardDetails2?.maeCustomerInquiry?.gcif,
        idNo: onBoardDetails2?.idNo,
        idType: onBoardDetails2?.selectedIDCode,
        idImg: __DEV__ ? CAPTURE_DOCS_BASE64 : documentImages?.idFrontImgData,
        mobileNo: onBoardDetails?.mobileNumber,
        m2uIndicator: onBoardDetails2?.maeCustomerInquiry?.m2uIndicator,
        ocrData: "",
        preOrPostFlag,
        pdpa: tncData?.radioPDPAYesChecked ? "Y" : "N",
        postCode: onBoardDetails3?.postcode,
        selfieImg: __DEV__ ? CAPTURE_DOCS_BASE64 : selfieImages?.selfieImgData,
        state: "", //tncData?.taxCountry,
        referalCode: onBoardDetails4?.inviteCode,
        transactionType: "MAE_ACCT_ENROL",
        uscitizenSelected: "", //tncData?.radioUSYesChecked ? "Y" : "N",
        ekycRefId: filledUserDetails?.ekycRefId || "",
        empType: MAEOnboardEmploymentDetails?.employeeTypeid || "",
        employerName: MAEOnboardEmploymentDetails?.employerName || "",
        occupation: MAEOnboardEmploymentDetails?.occupationid || "",
        sector: MAEOnboardEmploymentDetails?.sectorid || "",
        gender,
        passportExpiry: expiryDate,
        issuedCountry: countryCode,
        pepDeclaration: pepDeclaration?.pepDeclaration,
    };
    const pointing = trinityFlag === "Y" ? "v2" : "v1";
    let url = `mae/api/${pointing}/createAccountETB`;
    if (onBoardDetails2.from === "NewMAE" || onBoardDetails2.from === "ETBWithLoan/FD") {
        url = `mae/ntb/api/${pointing}/createAccount`;
    }
    // const url = onBoardDetails2.from == ("NewMAE" || "ETBWithLoan/FD") ? "mae/ntb/api/v1/createAccount" : "mae/api/v1/createAccountETB";
    return maeCreateAccount(data, url)
        .then((response) => {
            return response;
        })
        .catch((error) => {
            console.log(`is Error`, error);
            return error.message;
        });
};
