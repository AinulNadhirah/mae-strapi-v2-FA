import { duitnowServices } from "@services";
import { GASettingsScreen } from "@services/analytics/analyticsSettings";

export const getDuitNowAPICall = (params) => {
    console.log("[DuitNowController] >> [getDuitNowAPICall] ");
    return duitnowServices(params)
        .then((response) => {
            if (response && response.data) {
                return response;
            }
        })
        .catch((error) => {
            return error;
        });
};

export const getDuitNowGADetails = (serviceType, isSuccess = false) => {
    switch (serviceType) {
        case "DEREGISTER":
            GASettingsScreen.onDeregisterDuitNow(isSuccess);
            break;
        case "SUSPEND":
            console.log("coming here suspend");
            GASettingsScreen.onDeactivateDuitNow(isSuccess);
            break;
        case "ACTIVATE":
            GASettingsScreen.onActivateDuitNow(isSuccess);
            break;
        default:
            break;
    }
};

export const getServiceParams = (screenParams, accountDetails, tac) => {
    console.log("[DuitNowController] >> [getServiceParams] ");
    return {
        pan: "",
        actionForceExpire: "000",
        noOfTrx: 1,
        proxyBankCode: "MBBEMYKL",
        registrationRequests: [
            {
                accHolderName: "",
                accHolderType: accountDetails.accountTypeCode || "",
                accName: accountDetails.accountType || "",
                accNo: accountDetails.accountNo || "",
                accType: accountDetails.accountTypeCode || "",
                proxyIdNo: accountDetails.idVal || "",
                proxyIdType: accountDetails.proxyTypeCode || "",
                regRefNo: accountDetails.regRefNo || "",
                regStatus: "",
            },
        ],
        secondaryId: screenParams.proxyDetails.proxyDetails.secondaryId || "",
        secondaryIdType: screenParams.proxyDetails.proxyDetails.secondaryIdType || "",
        service: screenParams?.serviceType,
        tac,
    };
};

export const getParams = (tacNumber, screenParams) => {
    console.log("[DuitnowConfirmation] >> [getParams]");
    const { selectedAccInfo, selectedProxyInfo, proxyDetails, type } = screenParams;
    return {
        pan: "",
        actionForceExpire: "000",
        noOfTrx: 1,
        proxyBankCode: "MBBEMYKL",
        registrationRequests: [
            {
                accHolderName: "",
                accHolderType: "S",
                accName: selectedAccInfo.name || "",
                accNo: selectedAccInfo?.number?.substring(0, 12).replace(/\s/g, "") || "",
                accType: "S",
                proxyIdNo: selectedProxyInfo?.isregisteredProxy
                    ? selectedProxyInfo?.idVal || ""
                    : selectedProxyInfo?.value || "",
                proxyIdType: selectedProxyInfo?.proxyTypeCode || "",
                regRefNo: selectedProxyInfo?.regRefNo || "",
                regStatus: "",
            },
        ],
        secondaryId: proxyDetails?.secondaryId || "",
        secondaryIdType: proxyDetails?.secondaryIdType || "",
        service:
            type === "SelectAccount"
                ? "REGISTER"
                : selectedProxyInfo?.maybank
                    ? "UPDATE"
                    : "TRANSFER",
        tac: type === "SelectAccount" ? "" : tacNumber,
    };
};
