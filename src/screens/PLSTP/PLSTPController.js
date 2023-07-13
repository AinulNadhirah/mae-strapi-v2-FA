import {
    PLSTP_EMPLOYMENT_DETAILS,
    PLSTP_OTHER_DETAILS,
    PLSTP_TNC,
    PLSTP_CONFIRMATION,
    PLSTP_UPLOAD_DOCS,
    PLSTP_INCOME_DETAILS,
    PLSTP_CREDIT_CHECK,
    PLSTP_LOAN_APPLICATION,
    PLSTP_REPAYMENT_DETAILS,
    PLSTP_PERSONAL_DETAILS,
} from "@navigation/navigationConstant";

import {
    plstpPrequalCheck2,
    pl2FA,
    PLFinalSubmit,
    plstpResumeInquiry,
    plstpResumeData,
    plstpResumeCounter,
} from "@services";

import { checks2UFlow } from "@utils/dataModel/utility";

export const hasCommas = (number) => {
    let numStr = number.toString();
    return numStr.includes(",");
};

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

export const divideBy = (value, divideByVal) => {
    return value % divideByVal == 0 ? true : false;
};

export const minLoanAmount = (value, percentileVal) => {
    return value - (percentileVal / 100) * value;
};

export const validateLoanPercentage = (maxAmount, minAmount) => {
    const percentageReminder = ((maxAmount - minAmount) / maxAmount) * 100;
    return percentageReminder;
};

export const percentage = (percent, total) => {
    return (percent / 100) * total;
};

export const maskEmail = (email) => {
    if (email.includes("*")) return email;
    const userName = email.split("@");
    const maskedEmail = `${maskData(userName[0], userName[0].length > 7 ? 2 : 1)}@${userName[1]}`;
    return maskedEmail;
};

export const maskMobile = (mobile) => {
    if (mobile.includes("****")) return mobile;
    return maskData(mobile, mobile.length - 4);
};

/*
* for masking city text
* if text is already masked, it returns same text otherwise returns masked text
* example 1 : if input is 'Kualalumpur' output is 'Kualal*****'
* example 2: if input is 'Kualal*****' output is 'Kualal*****'
*/
export const maskCity = (city) => {
    if (city.includes("**")) return city;
    return maskDetailsData(city, city.length > 7 ? 5 : 3);
};

export const maskPostCode = (postcode) => {
    if (postcode.includes("**")) return postcode;
    return maskDetailsData(postcode, 3);
};

export const maskAddress = (homeAddress) => {
    if (homeAddress.includes("***")) return homeAddress;
    const maskedAddress = maskDetailsData(homeAddress, homeAddress.length > 7 ? 5 : 3);
    return maskedAddress;
};

export const shortStpRefNum = (refNo) => {
    if (!refNo) return refNo;
    return refNo.substr(refNo.length - 10);
};

export const getApplyPLSTPNavParams = (maeCustomerInfo) => {
    console.log("[PLSTPController] >> [getApplyPLSTPNavParams]");

    const demo = false;
    if (demo) {
        return {
            customerInfo: {
                //GrossIncome
                myKadNum: "",
                monthlyGrossInc: "25000",
                ietGrossIncome: "24000",
                ietNetIncome: "24000",
                //Credit reference
                cra: true,
                //loan application
                loanType: "Maybank Islamic",
                loanTypeValue: "015",
                amountNeed: "60000", //"8000",
                minAmount: "30000", //"6000",
                tenure: "6 years",
                tenureValue: "6",
                purpose: "Home Renovation",
                purposeValue: "5",
                payout: "564016970628",
                payoutName: "Savings Account",
                payoutValue: "0",

                //Repayment details
                loanInteret: "",
                monthlyInstalment: "",
                premiumAmount: "",
                personalCarePlan: false,
                carePlanAmount: "",
                amountReceive: "",

                //Personal details
                title: "CAPTAIN",
                titleValue: "CPP",
                maritalStatus: "MARRIED",
                maritalStatusValue: "M",
                education: "MASTERS",
                educationValue: "MST",
                residential: "Own",
                residentialValue: "W",
                emailAddress: "umadhevi@maybank.com",
                maskedEmail: "",
                mobile: "0123321051",
                maskedMobile: "",
                homeAddress1: "No 81",
                homeAddress2: "jalan",
                homeAddress3: "damansara",
                maskedAddr1: "",
                maskedAddr2: "",
                maskedAddr3: "",
                city: "TAMPIN",
                stateField: "NEGERI SEMBILAN",
                stateValue: "458008",
                postcode: "59000",

                //Employment details
                employerName: "ABC bhd",
                occupation: "MEDICAL DOCTORS",
                occupationValue: "2210",
                employmentType: "GOVERNMENT EMPLOYEE",
                employmentTypeValue: "GMP",
                sector: "FUND MANAGEMENT",
                sectorValue: "K100009",
                businessClassification: "Government",
                businessClassificationValue: "G",
                lengthOfServiceYear: "1",
                lengthOfServiceYearValue: "1",
                lengthOfServiceMonth: "2",
                lengthOfServiceMonthValue: "2",
                termOfEmployment: "Permanent",
                termOfEmploymentValue: "P",

                //Employment Address
                officeAddress1: "15 jalan",
                officeAddress2: "Gasing",
                officeAddress3: "test",
                maskedOfcAddr1: "",
                maskedOfcAddr2: "",
                maskedOfcAddr3: "",
                officeCity: "Kuala Lumpur",
                maskedOfcCity: "",
                officeState: "WILAYAH PERSEKUTUAN KUALA LUMPUR",
                officeStateValue: "458001",
                officePostcode: "50050",
                officePhoneNum: "0123321051",
                maskedOfcMobile: "",
                mailingAddress: "Home",
                mailingAddressValue: "H",

                //High/Low Risk
                otherCommitment: "17200", //"100",
                primaryIncome: "",
                primaryIncomeValue: "",
                sourceOfWealth: "",
                sourceOfWealthValue: "",
                sourceOfIncome: "",
                sourceOfIncomeValue: "",
                netIncome: "2000",

                //TNC
                group: true,
                pdp: "Y",
                fatca: true,
                crs: true,
                pdi: true,
                ea: true,

                //Decline
                shortRefNo: "7180813062",
                dateTime: "18 Jun 2021, 2:41 PM",
            },
            masterData: {},
            age: 28,
            gcifData: {},
            submissionResponse: {
                stpRefNo: "7180716799",
            },
            finalCarlosResponse: {
                monthlyInstalment: "2000",
                loanInterest: "8",
                loanTenure: "3",
                reqLoanAmount: "100000",
                premiumAmount: "2000",
                disbursedAmount: "998000",
                disbursedAccount: "1122334444",
                disbursedAccountName: "Savings Account",
                approvedAmount: "60000",
            },
            isResumeFlow: false,
            stpRefNum: "",
            editFrom: "",
            prequal2Status: false,
            isSAL: false,
            customerRiskRating: "",
        };
    } else {
        return {
            customerInfo: {
                //GrossIncome
                myKadNum: "",
                monthlyGrossInc: "",
                ietGrossIncome: "",
                ietNetIncome: "",
                //Credit reference
                cra: false,
                //loan application
                loanType: "",
                loanTypeValue: "",
                amountNeed: "",
                minAmount: "",
                tenure: "",
                tenureValue: "",
                purpose: "",
                purposeValue: "",
                payout: "",
                payoutName: "",
                payoutValue: "",

                //Repayment details
                loanInteret: "",
                monthlyInstalment: "",
                premiumAmount: "",
                personalCarePlan: false,
                carePlanAmount: "",
                amountReceive: "",

                //Personal details
                title: "",
                titleValue: "",
                maritalStatus: "",
                maritalStatusValue: "",
                education: "",
                educationValue: "",
                residential: "",
                residentialValue: "",
                emailAddress: "",
                maskedEmail: "",
                mobile: "",
                maskedMobile: "",
                homeAddress1: "",
                homeAddress2: "",
                homeAddress3: "",
                maskedAddr1: "",
                maskedAddr2: "",
                maskedAddr3: "",
                city: "",
                stateField: "",
                stateValue: "",
                postcode: "",

                //Employment details
                employerName: "",
                occupation: "",
                occupationValue: "",
                employmentType: "",
                employmentTypeValue: "",
                sector: "",
                sectorValue: "",
                businessClassification: "",
                businessClassificationValue: "",
                lengthOfServiceYear: "",
                lengthOfServiceYearValue: "",
                lengthOfServiceMonth: "",
                lengthOfServiceMonthValue: "",
                termOfEmployment: "",
                termOfEmploymentValue: "",

                //Employment Address
                officeAddress1: "",
                officeAddress2: "",
                officeAddress3: "",
                maskedOfcAddr1: "",
                maskedOfcAddr2: "",
                maskedOfcAddr3: "",
                officeCity: "",
                maskedOfcCity: "",
                officeState: "",
                officeStateValue: "",
                officePostcode: "",
                officePhoneNum: "",
                maskedOfcMobile: "",
                mailingAddress: "",
                mailingAddressValue: "",

                //High/Low Risk
                otherCommitment: "",
                primaryIncome: "",
                primaryIncomeValue: "",
                sourceOfWealth: "",
                sourceOfWealthValue: "",
                sourceOfIncome: "",
                sourceOfIncomeValue: "",
                netIncome: "",

                //TNC
                group: false,
                pdp: "",
                fatca: false,
                crs: false,
                pdi: false,
                ea: false,

                //Decline
                shortRefNo: "",
                dateTime: "",
            },
            masterData: {},
            age: 0,
            gcifData: {},
            isResumeFlow: false,
            submissionResponse: {},
            finalCarlosResponse: {},
            stpRefNum: "",
            editFrom: "",
            prequal2Status: false,
            isSAL: false,
            customerRiskRating: "",
        };
    }
};

export const getProductName = (arr, val) => {
    if (!val) return "";
    const payout = arr.find((element) => element.id == val);
    return payout.productName || "";
};

export const massagePLSTPGcifData = (resumeData) => {
    console.log("[PLSTPController] >> [massagePLSTPGcifData]");
    const { stpRefNumber, masterDataVO, stpData, gcifDataVO } = resumeData;
    const masterData = massagePLSTPMasterData(masterDataVO);
    const {
        loanTypeKeyVal,
        tenureKeyVal,
        purposeKeyVal,
        payoutKeyVal,
        titleKeyVal,
        maritalStatusKeyVal,
        educationKeyVal,
        residentialKeyVal,
        stateKeyVal,
        occupationKeyVal,
        employmentTypeKeyVal,
        occupationSectorKeyVal,
        businessClassificationKeyVal,
        lengthOfServiceYearKeyVal,
        lengthOfServiceMonthKeyVal,
        termOfEmploymentKeyVal,
        payout,
    } = masterData;
    if (gcifDataVO?.mobileNum) {
        if (gcifDataVO.mobileNum.startsWith(0)) {
            gcifDataVO.mobileNum = gcifDataVO.mobileNum.substring(1);
        }
    }
    if (gcifDataVO?.officePhoneNumber) {
        if (gcifDataVO.officePhoneNumber.startsWith(0)) {
            gcifDataVO.officePhoneNumber = gcifDataVO.officePhoneNumber.substring(1);
        }
    }
    return {
        customerInfo: {
            //GrossIncome
            monthlyGrossInc: Math.trunc(stpData?.monthlyGrossInc) || "",
            ietGrossIncome: Math.trunc(stpData?.ietGrossIncome) || "",
            ietNetIncome: Math.trunc(stpData?.ietNetIncome) || "",
            //Credit reference
            cra: stpData?.cra || false,
            //loan application
            loanType: stpData?.loanType?.id ? loanTypeKeyVal[stpData?.loanType?.id] : "",
            loanTypeValue: stpData?.loanType?.id || "",
            amountNeed: Math.trunc(stpData?.amountNeed) || "",
            minAmount: Math.trunc(stpData?.minAmount) || "",
            tenure: stpData?.tenure?.id ? tenureKeyVal[stpData?.tenure?.id] : "",
            tenureValue: stpData?.tenure?.id || "",
            purpose: stpData?.purpose?.id ? purposeKeyVal[stpData?.purpose?.id] : "",
            purposeValue: stpData?.purpose?.id || "",
            payout: stpData?.payout?.id ? payoutKeyVal[stpData?.payout?.id] : "",
            payoutValue: stpData?.payout?.id || "",
            payoutName: getProductName(payout, stpData?.payout?.id),

            //Repayment details
            loanInteret: stpData?.loanInteret || "",
            monthlyInstalment: stpData?.monthlyInstalment || "",
            premiumAmount: stpData?.premiumAmount || "",
            personalCarePlan: stpData?.personalCarePlan || false,
            carePlanAmount: stpData?.carePlanAmount || "",
            amountReceive: stpData?.amountReceive || "",

            //Personal details
            title: stpData?.title?.id ? titleKeyVal[stpData?.title?.id] : "",
            titleValue: stpData?.title?.id || "",
            maritalStatus: gcifDataVO?.maritalStatus?.id
                ? maritalStatusKeyVal[gcifDataVO?.maritalStatus?.id]
                : "",
            maritalStatusValue: gcifDataVO?.maritalStatus?.id || "",
            education: gcifDataVO?.education?.id ? educationKeyVal[gcifDataVO?.education?.id] : "",
            educationValue: gcifDataVO?.education?.id || "",
            residential: gcifDataVO?.residentialStatus?.id
                ? residentialKeyVal[gcifDataVO?.residentialStatus?.id]
                : "",
            residentialValue: gcifDataVO?.residentialStatus?.id || "",
            emailAddress: gcifDataVO?.emailAddress || "",
            maskedEmail: gcifDataVO?.emailAddress ? maskEmail(gcifDataVO?.emailAddress) : "",
            mobile: gcifDataVO?.mobileNum || "",
            maskedMobile: gcifDataVO?.mobileNum ? maskMobile(gcifDataVO?.mobileNum) : "",
            homeAddress1: gcifDataVO?.homeAddress?.addressLine1 || "",
            homeAddress2: gcifDataVO?.homeAddress?.addressLine2 || "",
            homeAddress3: gcifDataVO?.homeAddress?.addressLine3 || "",
            maskedAddr1: gcifDataVO?.homeAddress?.addressLine1
                ? maskAddress(gcifDataVO?.homeAddress?.addressLine1)
                : "",
            maskedAddr2: gcifDataVO?.homeAddress?.addressLine2
                ? maskAddress(gcifDataVO?.homeAddress?.addressLine2)
                : "",
            maskedAddr3: gcifDataVO?.homeAddress?.addressLine3
                ? maskAddress(gcifDataVO?.homeAddress?.addressLine3)
                : "",
            city: gcifDataVO?.homeAddress?.city || "",
            maskedCity: gcifDataVO?.homeAddress?.city
                ? maskAddress(gcifDataVO?.homeAddress?.city)
                : "",
            stateField: gcifDataVO?.homeAddress?.state?.id
                ? stateKeyVal[gcifDataVO?.homeAddress?.state?.id]
                : "",
            stateValue: gcifDataVO?.homeAddress?.state?.id || "",
            postcode: gcifDataVO?.homeAddress?.postCode || "",

            //Employment details
            employerName: gcifDataVO?.employerName || "",
            occupation: gcifDataVO?.occupation?.id
                ? occupationKeyVal[gcifDataVO?.occupation?.id]
                : "",
            occupationValue: gcifDataVO?.occupation?.id || "",
            employmentType: gcifDataVO?.employmentType?.id
                ? employmentTypeKeyVal[gcifDataVO?.employmentType?.id]
                : "",
            employmentTypeValue: gcifDataVO?.employmentType?.id || "",
            sector: gcifDataVO?.sector?.id ? occupationSectorKeyVal[gcifDataVO?.sector?.id] : "",
            sectorValue: gcifDataVO?.sector?.id || "",
            businessClassification: gcifDataVO?.businessClassification?.id
                ? businessClassificationKeyVal[gcifDataVO?.businessClassification?.id]
                : "",
            businessClassificationValue: gcifDataVO?.businessClassification?.id || "",
            lengthOfServiceYear: gcifDataVO?.lengthOfServiceYear?.id
                ? lengthOfServiceYearKeyVal[gcifDataVO?.lengthOfServiceYear?.id]
                : "",
            lengthOfServiceYearValue: gcifDataVO?.lengthOfServiceYear?.id || "",
            lengthOfServiceMonth: gcifDataVO?.lengthOfServiceMonth?.id
                ? lengthOfServiceMonthKeyVal[gcifDataVO?.lengthOfServiceMonth?.id]
                : "",
            lengthOfServiceMonthValue: gcifDataVO?.lengthOfServiceMonth?.id || "",
            termOfEmployment: gcifDataVO?.termOfEmployment?.id
                ? termOfEmploymentKeyVal[gcifDataVO?.termOfEmployment?.id]
                : "",
            termOfEmploymentValue: gcifDataVO?.termOfEmployment?.id || "",

            //Employment Address
            officeAddress1: gcifDataVO?.officeAddress?.addressLine1 || "",
            officeAddress2: gcifDataVO?.officeAddress?.addressLine2 || "",
            officeAddress3: gcifDataVO?.officeAddress?.addressLine3 || "",
            maskedOfcAddr1: gcifDataVO?.officeAddress?.addressLine1
                ? maskAddress(gcifDataVO?.officeAddress?.addressLine1)
                : "",
            maskedOfcAddr2: gcifDataVO?.officeAddress?.addressLine2
                ? maskAddress(gcifDataVO?.officeAddress?.addressLine2)
                : "",
            maskedOfcAddr3: gcifDataVO?.officeAddress?.addressLine3
                ? maskAddress(gcifDataVO?.officeAddress?.addressLine3)
                : "",
            officeCity: gcifDataVO?.officeAddress?.city || "",
            maskedOfcCity: gcifDataVO?.officeAddress?.city
                ? maskAddress(gcifDataVO?.officeAddress?.city)
                : "",
            officeState: gcifDataVO?.officeAddress?.state?.id
                ? stateKeyVal[gcifDataVO?.officeAddress?.state?.id]
                : "",
            officeStateValue: gcifDataVO?.officeAddress?.state?.id || "",
            officePostcode: gcifDataVO?.officeAddress?.postCode || "",
            officePhoneNum: gcifDataVO?.officePhoneNumber || "",
            maskedOfcMobile: gcifDataVO?.officePhoneNumber
                ? maskMobile(gcifDataVO?.officePhoneNumber)
                : "",
            mailingAddress: stpData?.preferredMailingAddressCode?.type || "",
            mailingAddressValue: stpData?.preferredMailingAddressCode?.id || "",

            //High/Low Risk
            otherCommitment:
                stpData?.otherCommitment !== "0" ? Math.trunc(stpData?.otherCommitment) : "0" || "",
            primaryIncome: stpData?.primaryIncome?.type || "",
            primaryIncomeValue: stpData?.primaryIncome?.id || "",
            sourceOfWealth: stpData?.sourceOfWealth?.type || "",
            sourceOfWealthValue: stpData?.sourceOfWealth?.id || "",
            sourceOfIncome: stpData?.retirementIncomeSource?.type || "",
            sourceOfIncomeValue: stpData?.retirementIncomeSource?.id || "",
            netIncome: stpData?.netIncome !== "0" ? Math.trunc(stpData?.netIncome) : "0" || "",

            //TNC
            group: stpData?.group || false,
            pdp: stpData?.pdp || "",
            fatca: stpData?.fatca || false,
            crs: stpData?.crs || false,
            pdi: stpData?.pdi || false,
            ea: stpData?.ea || false,

            //Decline
            shortRefNo: stpData?.shortRefNo || shortStpRefNum(stpRefNumber),
            dateTime: stpData?.dateTime || "",
        },
        masterData: masterData || {},
        gcifData: gcifDataVO || {},
        age: gcifDataVO?.age || 0,
        submissionResponse: {},
        isResumeFlow: true,
        finalCarlosResponse: {},
        stpRefNum: stpRefNumber || "",
        editFrom: stpData?.editFrom || "",
        prequal2Status: stpData?.prequal2Status || false,
        isSAL: stpData?.isSAL || false,
        customerRiskRating: stpData?.customerRiskRating || "",
    };
};

export const massagePLSTPMasterData = (data) => {
    console.log("[PLSTPController] >> [massagePLSTPMasterData] ");

    // Empty checking
    if (!data) return data;

    const {
        typeOfLoan,
        tenure,
        purposeOfLoan,
        residenceStatus,
        preferredMailingAddress,
        casaAccounts,
        mdmEnums,
        businessClassification,
        termOfEmployment,
        lengthOfServiceYear,
        lengthOfServiceMonth,
        retirementIncomeSource,
    } = data;

    const {
        title,
        education,
        maritalStatus,
        state,
        occupation,
        occupationSector,
        employmentType,
        sourceOfWealth,
        residentialStatus,
        sourceOfFund,
    } = mdmEnums;

    //residentialStatus Data Key-Val
    let residentialStatusKeyVal = {};
    if (residentialStatus) {
        residentialStatus.forEach((ele) => {
            const { id, type } = ele;
            residentialStatusKeyVal[id] = type;
        });
    }

    //sourceOfWealth Data Key-Val
    let sourceOfWealthKeyVal = {};
    if (sourceOfWealth) {
        sourceOfWealth.forEach((ele) => {
            const { id, type } = ele;
            sourceOfWealthKeyVal[id] = type;
        });
    }
    // sourceOfWealth Updated Array
    const sourceOfWealthArray = sourceOfWealth.map((item) => {
        return {
            ...item,
            name: item?.type ?? "",
        };
    });

    //sourceOfFund Data Key-Val
    let sourceOfFundKeyVal = {};
    if (sourceOfFund) {
        sourceOfFund.forEach((ele) => {
            const { id, type } = ele;
            sourceOfFundKeyVal[id] = type;
        });
    }
    // sourceOfFund Updated Array
    const sourceOfFundArray = sourceOfFund.map((item) => {
        return {
            ...item,
            name: item?.type ?? "",
        };
    });

    //sourceOfIncome Data Key-Val
    const sourceOfIncome = retirementIncomeSource;
    let sourceOfIncomeKeyVal = {};
    if (sourceOfIncome) {
        sourceOfIncome.forEach((ele) => {
            const { id, type } = ele;
            sourceOfIncomeKeyVal[id] = type;
        });
    }
    // sourceOfIncome Updated Array
    const sourceOfIncomeArray = sourceOfIncome.map((item) => {
        return {
            ...item,
            name: item?.type ?? "",
        };
    });

    //employmentType Data Key-Val
    let employmentTypeKeyVal = {};
    if (employmentType) {
        employmentType.forEach((ele) => {
            const { id, type } = ele;
            employmentTypeKeyVal[id] = type;
        });
    }
    // employmentType Updated Array
    const employmentTypeArray = employmentType.map((item) => {
        return {
            ...item,
            name: item?.type ?? "",
        };
    });

    //occupationSector Data Key-Val
    let occupationSectorKeyVal = {};
    if (occupationSector) {
        occupationSector.forEach((ele) => {
            const { id, type } = ele;
            occupationSectorKeyVal[id] = type;
        });
    }
    // occupationSector Updated Array
    const occupationSectorArray = occupationSector.map((item) => {
        return {
            ...item,
            name: item?.type ?? "",
        };
    });

    //occupation Data Key-Val
    let occupationKeyVal = {};
    if (occupation) {
        occupation.forEach((ele) => {
            const { id, type } = ele;
            occupationKeyVal[id] = type;
        });
    }
    // occupation Updated Array
    const occupationArray = occupation.map((item) => {
        return {
            ...item,
            name: item?.type ?? "",
        };
    });

    //lengthOfServiceMonth Data Key-Val
    let lengthOfServiceMonthKeyVal = {};
    if (lengthOfServiceMonth) {
        lengthOfServiceMonth.forEach((ele) => {
            const { id, type } = ele;
            lengthOfServiceMonthKeyVal[id] = type;
        });
    }
    // lengthOfServiceMonth Updated Array
    const lengthOfServiceMonthArray = lengthOfServiceMonth.map((item) => {
        return {
            ...item,
            name: item?.type ?? "",
        };
    });

    //lengthOfServiceYear Data Key-Val
    let lengthOfServiceYearKeyVal = {};
    if (lengthOfServiceYear) {
        lengthOfServiceYear.forEach((ele) => {
            const { id, type } = ele;
            lengthOfServiceYearKeyVal[id] = type;
        });
    }
    // lengthOfServiceYear Updated Array
    const lengthOfServiceYearArray = lengthOfServiceYear.map((item) => {
        return {
            ...item,
            name: item?.type ?? "",
        };
    });

    //termOfEmployment Data Key-Val
    let termOfEmploymentKeyVal = {};
    if (termOfEmployment) {
        termOfEmployment.forEach((ele) => {
            const { id, type } = ele;
            termOfEmploymentKeyVal[id] = type;
        });
    }
    // termOfEmployment Updated Array
    const termOfEmploymentArray = termOfEmployment.map((item) => {
        return {
            ...item,
            name: item?.type ?? "",
        };
    });

    //businessClassification Data Key-Val
    let businessClassificationKeyVal = {};
    if (businessClassification) {
        businessClassification.forEach((ele) => {
            const { id, type } = ele;
            businessClassificationKeyVal[id] = type;
        });
    }
    // businessClassification Updated Array
    const businessClassificationArray = businessClassification.map((item) => {
        return {
            ...item,
            name: item?.type ?? "",
        };
    });

    //Payout Data Key-Val
    let payoutKeyVal = {};
    if (casaAccounts) {
        casaAccounts.forEach((ele) => {
            const { id, acctId } = ele;
            payoutKeyVal[id] = acctId;
        });
    }
    // Payout Updated Array
    const payoutArray = casaAccounts.map((item) => {
        return {
            ...item,
            name: item?.productName + "\n" + item?.acctId ?? "",
            acctId: item?.acctId ?? "",
        };
    });

    // Type of Loan Data Key-Val
    let loanTypeKeyVal = {};
    if (typeOfLoan) {
        typeOfLoan.forEach((ele) => {
            const { id, type } = ele;
            loanTypeKeyVal[id] = type;
        });
    }

    // Loan type Updated Array
    const typeOfLoanArray = typeOfLoan.map((item) => {
        return {
            ...item,
            name: item?.type ?? "",
        };
    });

    // Tenure Data Key-Val
    let tenureKeyVal = {};
    if (tenure) {
        tenure.forEach((ele) => {
            const { id, type } = ele;
            tenureKeyVal[id] = type;
        });
    }

    // Tenure Updated Array
    const tenureArray = tenure.map((item) => {
        return {
            ...item,
            name: item?.type ?? "",
        };
    });

    // purpose Data Key-Val
    let purposeKeyVal = {};
    if (purposeOfLoan) {
        purposeOfLoan.forEach((ele) => {
            const { id, type } = ele;
            purposeKeyVal[id] = type;
        });
    }

    // Purpose Updated Array
    const purposeArray = purposeOfLoan.map((item) => {
        return {
            ...item,
            name: item?.type ?? "",
        };
    });

    // Title Data Key-Val
    let titleKeyVal = {};
    if (title) {
        title.forEach((ele) => {
            const { id, type } = ele;
            titleKeyVal[id] = type;
        });
    }

    // Title Array
    const titleArray = title.map((item) => {
        return {
            ...item,
            name: item?.type ?? "",
        };
    });

    // Marital Status Data Key-Val
    let maritalStatusKeyVal = {};
    if (maritalStatus) {
        maritalStatus.forEach((ele) => {
            const { id, type } = ele;
            maritalStatusKeyVal[id] = type;
        });
    }

    // Marital Status Array
    const maritalStatusArray = maritalStatus.map((item) => {
        return {
            ...item,
            name: item?.type ?? "",
        };
    });

    // Education Data Key-Val
    let educationKeyVal = {};
    if (education) {
        education.forEach((ele) => {
            const { id, type } = ele;
            educationKeyVal[id] = type;
        });
    }

    // Education Data Array
    const educationArray = education.map((item) => {
        return {
            ...item,
            name: item?.type ?? "",
        };
    });

    // Residence Status Data Key-Val
    let residentialKeyVal = {};
    if (residenceStatus) {
        residenceStatus.forEach((ele) => {
            const { id, type } = ele;
            residentialKeyVal[id] = type;
        });
    }

    // Residence Status Data Array
    const residentStatusArray = residenceStatus.map((item) => {
        return {
            ...item,
            name: item?.type ?? "",
        };
    });

    // State List Data Key-Val
    let stateKeyVal = {};
    if (state) {
        state.forEach((ele) => {
            const { id, type } = ele;
            stateKeyVal[id] = type;
        });
    }

    // state Data Array
    const stateListArray = state.map((item) => {
        return {
            ...item,
            name: item?.type ?? "",
        };
    });

    // Mailing Data Key-Val
    let preferredMailingAddressKeyVal = {};
    if (preferredMailingAddress) {
        preferredMailingAddress.forEach((ele) => {
            const { id, type } = ele;
            preferredMailingAddressKeyVal[id] = type;
        });
    }

    // Mailing Updated Array
    const mailingArray = preferredMailingAddress.map((item) => {
        return {
            ...item,
            name: item?.type ?? "",
        };
    });

    return {
        ...data,
        loanTypeKeyVal,
        tenureKeyVal,
        purposeKeyVal,
        titleKeyVal,
        maritalStatusKeyVal,
        educationKeyVal,
        stateKeyVal,
        payoutKeyVal,
        businessClassificationKeyVal,
        termOfEmploymentKeyVal,
        lengthOfServiceMonthKeyVal,
        lengthOfServiceYearKeyVal,
        preferredMailingAddressKeyVal,
        residentialKeyVal,
        occupationKeyVal,
        occupationSectorKeyVal,
        employmentTypeKeyVal,
        sourceOfWealthKeyVal,
        sourceOfFundKeyVal,
        sourceOfIncomeKeyVal,
        residentialStatusKeyVal,
        typeOfLoan: typeOfLoanArray,
        purposeOfLoan: purposeArray,
        tenure: tenureArray,
        preferredMailingAddress: mailingArray,
        state: stateListArray,
        residenceStatus: residentStatusArray,
        education: educationArray,
        title: titleArray,
        maritalStatus: maritalStatusArray,
        payout: payoutArray,
        businessClassification: businessClassificationArray,
        termOfEmployment: termOfEmploymentArray,
        lengthOfServiceMonth: lengthOfServiceMonthArray,
        lengthOfServiceYear: lengthOfServiceYearArray,
        occupation: occupationArray,
        occupationSector: occupationSectorArray,
        employmentType: employmentTypeArray,
        sourceOfWealth: sourceOfWealthArray,
        sourceOfFund: sourceOfFundArray,
        sourceOfIncomeArr: sourceOfIncomeArray,
    };
};

export const maskData = (str, len) => {
    let maskedData = str.replace(/([a-zA-Z0-9\._@`'‘’,-/\s])/g, "*");
    maskedData = str.substring(0, len) + maskedData.substring(len, str.length);

    return maskedData;
};

export const maskDetailsData = (str, len) => {
    let maskedData = str.replace(/[a-zA-Z0-9\._@`'‘’,-/\s]/g, "*");
    maskedData = maskedData.substring(0, str.length - len) + str.substring(str.length - len);
    return maskedData;
};

//Prequal Check 2 API
export const prequalCheck2 = async (data) => {
    try {
        const response = await plstpPrequalCheck2(data);
        if (response && response.status === 200) return response;
        return null;
    } catch (error) {
        return null;
    }
};

//S2U API
export const s2uFa = (data) => {
    return pl2FA(data)
        .then((response) => {
            console.log("[PLSTPController][s2uFa] >> Success");
            return response;
        })
        .catch((error) => {
            console.log("[PLSTPController][s2uFa] >> Failure");
            return error;
        });
};

export const plstpInqCheck = async () => {
    try {
        const response = await plstpResumeInquiry();
        if (response && response.status === 200) return response;
        return null;
    } catch (error) {
        return null;
    }
};

export const getBannerImage = (result) => {
    let stpType = "Apply";
    switch (result.statusCode) {
        case "01": //Resume
            stpType = "Resume";
            break;
        case "10": //Counter Offer
            stpType = "CounterOffer";
            break;
        case "100": //PLSTP OFF
            stpType = "TurnedOff";
            break;
        default:
            stpType = "Apply";
    }

    return stpType;
};

export const getResumeData = async () => {
    try {
        const response = await plstpResumeData();
        if (response && response.status === 200) return response;
        return null;
    } catch (error) {
        return null;
    }
};

export const getCounterOfferData = async (data) => {
    try {
        const response = await plstpResumeCounter(data);
        if (response && response.status === 200) return response;
        return null;
    } catch (error) {
        return null;
    }
};

export const resumeFlow = async (plstpResumeResult, resumeData, getModel, updateModel) => {
    const initData = massagePLSTPGcifData(resumeData);
    const screenCode = plstpResumeResult?.screenCode;
    let screenName = "";
    let s2uData = {};
    switch (screenCode) {
        case "NL01":
            screenName = initData.isSAL ? PLSTP_LOAN_APPLICATION : PLSTP_CREDIT_CHECK;
            break;
        case "NL02":
            screenName = PLSTP_LOAN_APPLICATION;
            break;
        case "NL03":
            screenName = PLSTP_REPAYMENT_DETAILS;
            break;
        case "NL04":
            screenName = PLSTP_PERSONAL_DETAILS;
            break;
        case "NL05":
            screenName = PLSTP_EMPLOYMENT_DETAILS;
            break;
        case "NL06":
            screenName = PLSTP_OTHER_DETAILS;
            break;
        case "NL07":
            screenName = PLSTP_TNC;
            break;
        case "NL08":
            s2uData = await getS2UStatus(getModel, updateModel);
            screenName = s2uData?.flow === "S2UReg" ? PLSTP_TNC : PLSTP_CONFIRMATION;
            break;
        case "NL09":
            screenName = PLSTP_UPLOAD_DOCS;
            break;
        default:
            screenName = PLSTP_INCOME_DETAILS;
    }

    return { screenName, initData, s2uData };
};

//Check S2U Flow
export const getS2UStatus = async (getModel, updateModel) => {
    try {
        return await checks2UFlow(43, getModel, updateModel);
    } catch (error) {
        return { secure2uValidateData: { s2u_enabled: false }, flow: "TAC" };
    }
};

//Final Submission API
export const finalSubmitAPI = (data) => {
    return PLFinalSubmit(data)
        .then((response) => {
            console.log("[PLSTPController][finalSubmit] >> Success");
            return response;
        })
        .catch((error) => {
            console.log("[PLSTPController][finalSubmit] >> Failure");
            return error;
        });
};

export const mobileNumberFormat = (mobileNo) => {
    // return nothing if no value
  if (!mobileNo) return mobileNo; 
  return `${mobileNo.slice(0, 3)} ${mobileNo.slice(3, 5)} ${mobileNo.slice(5, 12)}`;
}
