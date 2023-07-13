import numeral from "numeral";

import { applicationDetailsGetApi } from "@services";

import { resumeAction } from "@redux/actions/ASBFinance/resumeAction";

const {
    SETTINGS_MODULE,
    APPLY_LOANS,
    ASB_CONSENT,
    APPLICATION_FINANCE_DETAILS,
    CURRENT_LOCATION,
    BANK_OFFICER,
    SELECTACCOUNT,
    FATCADECLARATION,
    PERSONAL_INFORMATION,
    OCCUPATION_INFORMATION,
    OCCUPATION_INFORMATION2,
    ASB_DECLARATION,
    APPLICATIONCONFIRMATION,

    JOINT_APPLICANT,
    RECEIVED_DOCUMENT_SCREEN,
    APPROVEDFINANCEDETAILS,
    APPLICATIONCONFIRMAUTH,
    ADDITIONALDETAILSINCOME,
    ASB_STACK,
} = require("@navigation/navigationConstant");

export function navigatePDF(navigation, props) {
    navigation.navigate(SETTINGS_MODULE, {
        screen: "PdfSetting",
        params: props,
    });
}

export const addCommas = (number) => {
    if (!number) return number;
    let numStr = number.toString();
    numStr = numStr.replace(/,/g, "");
    const pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(numStr)) numStr = numStr.replace(pattern, "$1,$2");
    return numStr;
};

export const removeCommas = (amount) => {
    if (!amount) return amount;
    return hasCommas(amount) ? Number(amount.replace(/,/g, "")) : Number(amount);
};

export const hasCommas = (number) => {
    const numStr = number.toString();
    return numStr.includes(",");
};

export const getMaximunLength = (fieldIndex, currentFiledIndex) => {
    return fieldIndex === currentFiledIndex ? 9 : 12;
};

export const formatValue = (fieldIndex, currentFiledIndex, value) => {
    return fieldIndex === currentFiledIndex
        ? addCommas(value)
        : addCommas(value)
        ? numeral(value).format(",0.00")
        : "";
};

export const goBackHomeScreen = (navigation) => {
    navigation.navigate(APPLY_LOANS);
};

export const onClickOkay = async (props, isApplyDashboard, dispatch) => {
    if (isApplyDashboard) {
        props.actionMasterData();
    }
    try {
        const body = {
            msgBody: {
                logonInfo: "Y",
            },
        };
        const response = await applicationDetailsGetApi(body, true);
        if (response) {
            const responseData = response?.data?.result?.msgBody?.stpApp;

            const stpScreenResume = responseData?.stpScreenResume;
            const stpReferenceNo = responseData?.stpReferenceNo;
            const stpAssessmentId = responseData?.stpAssessmentId;
            const stpDeclarePdpa = responseData?.stpDeclarePdpa;
            if (response?.data?.message === "Success") {
                const stpData = response?.data?.result?.msgBody?.stpApp;
                const stpDataMsgHeader = response?.data?.result?.msgHeader;

                const loanInformation = {
                    stpId: stpData?.stpUserId,
                    downpayment: 0,
                    financingType: "C",
                    loanFinancingAmountRM: parseInt(removeCommas(stpData?.stpLoanAmount)),
                    loanTenure: parseInt(stpData?.stpTenure),
                };
                const stpEligibilityResponse = JSON.parse(
                    response?.data?.result?.msgBody?.stpApp?.stpEligibilityResponse
                );

                const resumeResponse = JSON.stringify(response?.data?.result?.msgBody?.stpApp);
                const eligibilityData = JSON.parse(responseData?.stpEligibilityResponse);
                const resumeData = JSON.parse(resumeResponse);
                // Dispatch
                if (isApplyDashboard) {
                    props.resumeAction(resumeData, loanInformation, eligibilityData);
                } else {
                    dispatch(resumeAction(resumeData, loanInformation, eligibilityData));
                }

                // Check condition
                if (stpDeclarePdpa && stpScreenResume === "8" && stpAssessmentId === null) {
                    props.navigation.navigate(ASB_STACK, {
                        screen: APPLICATIONCONFIRMATION,
                        params: {
                            screenName: APPLICATIONCONFIRMATION,
                        },
                    });
                } else if (stpScreenResume === null && stpReferenceNo) {
                    props.navigation.navigate(ASB_STACK, {
                        screen: ASB_CONSENT,
                        params: {
                            screenName: ASB_CONSENT,
                        },
                    });
                }
                if (responseData?.stpStatus) {
                    if (responseData.stpStatus == "NSTPAPPSUB") {
                        props.navigation.navigate(ASB_STACK, {
                            screen: JOINT_APPLICANT,
                        });
                        return;
                    } else if (responseData.stpStatus == "NSTPDOCUPL") {
                        props.navigation.navigate(ASB_STACK, {
                            screen: RECEIVED_DOCUMENT_SCREEN,
                            params: {
                                screenName: RECEIVED_DOCUMENT_SCREEN,
                            },
                        });
                        return;
                    } else if (responseData.stpStatus == "NSTPFO") {
                        props.navigation.navigate(ASB_STACK, {
                            screen: APPROVEDFINANCEDETAILS,
                            params: {
                                screenName: APPROVEDFINANCEDETAILS,
                            },
                        });
                        return;
                    }
                }

                switch (stpScreenResume) {
                    case "1":
                        props.navigation.navigate(ASB_STACK, {
                            screen: ASB_CONSENT,
                            params: {
                                screenName: ASB_CONSENT,
                                stpDetails: stpData,
                            },
                        });
                        break;
                    case "2":
                        props.navigation.navigate(ASB_STACK, {
                            screen: APPLICATION_FINANCE_DETAILS,
                            params: {
                                screenName: APPLICATION_FINANCE_DETAILS,
                                stpDetails: stpData,
                                stpDataMsgHeader,
                            },
                        });
                        break;
                    case "3":
                        props.navigation.navigate(ASB_STACK, {
                            screen: CURRENT_LOCATION,
                            params: {
                                screenName: CURRENT_LOCATION,
                                stpDetails: stpData,
                            },
                        });
                        break;
                    case "4":
                        props.navigation.navigate(ASB_STACK, {
                            screen: BANK_OFFICER,
                            params: {
                                screenName: BANK_OFFICER,
                                stpDetails: stpData,
                                loanInformation,
                            },
                        });
                        break;
                    case "5":
                        // code block
                        if (stpEligibilityResponse?.overallValidationResult === "GREEN") {
                            props.navigation.navigate(ASB_STACK, {
                                screen: BANK_OFFICER,
                                params: {
                                    screenName: BANK_OFFICER,
                                    stpDetails: stpData,
                                    loanInformation,
                                },
                            });
                        } else {
                            props.navigation.navigate(ASB_STACK, {
                                screen: FATCADECLARATION,
                                params: {
                                    screenName: FATCADECLARATION,
                                    stpDetails: stpData,
                                },
                            });
                        }
                        break;
                    case "6":
                        props.navigation.navigate(ASB_STACK, {
                            screen: SELECTACCOUNT,
                            params: {
                                screenName: SELECTACCOUNT,
                                stpDetails: stpData,
                            },
                        });
                        break;
                    case "7":
                        props.navigation.navigate(ASB_STACK, {
                            screen: FATCADECLARATION,
                            params: {
                                screenName: FATCADECLARATION,
                                stpDetails: stpData,
                            },
                        });
                        break;
                    case "8":
                        console.log("***ASB_DECLARATION");
                        props.navigation.navigate(ASB_STACK, {
                            screen: ASB_DECLARATION,
                            params: {
                                screenName: ASB_DECLARATION,
                                stpDetails: stpData,
                            },
                        });
                        break;
                    case "9":
                        props.navigation.navigate(ASB_STACK, {
                            screen: APPLICATIONCONFIRMATION,
                            params: {
                                screenName: APPLICATIONCONFIRMATION,
                                stpDetails: stpData,
                            },
                        });
                        break;
                    case "10":
                        props.navigation.navigate(ASB_STACK, {
                            screen: PERSONAL_INFORMATION,
                            params: {
                                screenName: PERSONAL_INFORMATION,
                                stpDetails: stpData,
                            },
                        });
                        break;

                    case "11":
                        props.navigation.navigate(ASB_STACK, {
                            screen: OCCUPATION_INFORMATION,
                            params: {
                                screenName: OCCUPATION_INFORMATION,
                                stpDetails: stpData,
                            },
                        });
                        break;
                    case "12":
                        props.navigation.navigate(ASB_STACK, {
                            screen: OCCUPATION_INFORMATION2,
                            params: {
                                screenName: OCCUPATION_INFORMATION2,
                                stpDetails: stpData,
                            },
                        });
                        break;
                    case "13":
                        props.navigation.navigate(ASB_STACK, {
                            screen: ADDITIONALDETAILSINCOME,
                            params: {
                                screenName: ADDITIONALDETAILSINCOME,
                                stpDetails: stpData,
                            },
                        });
                        break;
                    case "14":
                        props.navigation.navigate(ASB_STACK, {
                            screen: APPLICATIONCONFIRMAUTH,
                            params: {
                                screenName: APPLICATIONCONFIRMAUTH,
                                stpDetails: stpData,
                            },
                        });
                        break;
                    default:
                        break;
                }
            } else if (stpScreenResume === null && stpReferenceNo) {
                props.navigation.navigate(ASB_STACK, {
                    screen: ASB_CONSENT,
                    params: {
                        screenName: ASB_CONSENT,
                    },
                });
            }
        }
    } catch (error) {}
    // });
};
