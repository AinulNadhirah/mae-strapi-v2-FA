import { ActionButton } from "@components/Buttons/FunctionEntryPointButton";

import { RESUME_CLEAR } from "@redux/actions/ASBFinance/resumeAction";

const initialState = {
    stpDetails: null,
};

export default function resumeReducer(state = initialState, action) {
    switch (action.type) {
        case "RESUME_SUCCESS":
            console.log("action", action.data);
            return {
                ...state,
                stpDetails: action.data,
                loanInformation: action.loanInformation,
            };
        case "RESUME_UPDATE":
            return {
                ...state,
                stpDetails: updateAmount(state, action),
            };
        case RESUME_CLEAR:
            return {
                ...state,
                stpDetails: null,
                loanInformation: null,
            };

        default:
            return state;
    }
}

function updateAmount(state, action) {
    let updateStpDetail = state.stpDetails;
    if (updateStpDetail) {
        if (action.screenNo === "2") {
            updateStpDetail.stpLoanAmount = action.stpLoanAmount;
            updateStpDetail.stpCertificatesNum = action.stpCertificatesNum;
            updateStpDetail.stpTenure = action.stpTenure;
            updateStpDetail.stpTypeOfLoan = action.stpTypeOfLoan;
            updateStpDetail.stpPlInsrnce = action.stpPlInsrnce;
            updateStpDetail.stpCustomerDob = action.stpCustomerDob;
        }
        if (action.screenNo === "3") {
            updateStpDetail.stpGrossIncome = action.stpGrossIncome;
            updateStpDetail.stpOtherCommitments = action.stpOtherCommitments;
            updateStpDetail.stpState = action.stpState;
            updateStpDetail.stpArea = action.stpArea;
            updateStpDetail.stpBranch = action.stpBranch;
        }
        if (action.screenNo === "4") {
            updateStpDetail.stpStaffId = action.stpStaffId;
        }
        if (action.screenNo === "7") {
            updateStpDetail.stpIsUsaCitizen = action.stpIsUsaCitizen;
        }

        if (action.screenNo === "8") {
            updateStpDetail.stpDeclarePdpa = action.stpDeclarePdpa;
        }

        if (action.screenNo === "10") {
            updateStpDetail.stpEmail = action.stpEmail;
            updateStpDetail.stpHomeAddress1 = action.stpHomeAddress1;
            updateStpDetail.stpHomeAddress2 = action.stpHomeAddress2;
            updateStpDetail.stpHomeAddress3 = action.stpHomeAddress3;
            updateStpDetail.stpHomePostcode = action.stpHomePostcode;
            updateStpDetail.stpHomeCity = action.stpHomeCity;
            updateStpDetail.stpMobileContactNumber = action.stpMobileContactNumber;
            updateStpDetail.stpMaritalStatusDesc = action.stpMaritalStatusDesc;
            updateStpDetail.stpMaritalStatusCode = action.stpMaritalStatusCode;
            updateStpDetail.stpEducationCode = action.stpEducationCode;
            updateStpDetail.stpEducationDesc = action.stpEducationDesc;
            updateStpDetail.stpHomeCountry = action.stpHomeCountry;
            updateStpDetail.stpHomeStateCode = action.stpHomeStateCode;
            updateStpDetail.stpHomeStateDesc = action.stpHomeStateDesc;
        }
        if (action.screenNo === "11") {
            updateStpDetail.stpEmployerName = action.stpEmployerName;
            updateStpDetail.stpOccupationDesc = action.stpOccupationDesc;
            updateStpDetail.stpOccupationSectorCode = action.stpOccupationSectorCode;
            updateStpDetail.stpEmploymentTypeDesc = action.stpEmploymentTypeDesc;
        }
        if (action.screenNo === "12") {
            updateStpDetail.stpMobileContactNumber = action.stpMobileContactNumber;
            updateStpDetail.stpEmployerAddress1 = action.stpEmployerAddress1;
            updateStpDetail.stpEmployerAddress2 = action.stpEmployerAddress2;
            updateStpDetail.stpEmployerAddress3 = action.stpEmployerAddress3;
            updateStpDetail.stpEmployerPostcode = action.stpEmployerPostcode;
            updateStpDetail.stpEmployerCity = action.stpEmployerCity;
            updateStpDetail.stpEmployerStateDesc = action.stpEmployerStateDesc;
            updateStpDetail.stpEmployerStateCode = action.stpEmployerStateCode;
            updateStpDetail.stpEmployerCountry = action.stpEmployerCountry;
            updateStpDetail.stpEmployerContactNumber = action.stpEmployerContactNumber;
        }
        console.log("[updateStpDetail]", updateStpDetail);
        return updateStpDetail;
    } else {
        console.log("[updateStpDetail] ELSE", action);
        return {
            stpLoanAmount: action.stpLoanAmount,
            stpCertificatesNum: action.stpCertificatesNum,
            stpTenure: action.stpTenure,
            stpTypeOfLoan: action.stpTypeOfLoan,
            stpPlInsrnce: action.stpPlInsrnce,
            stpGrossIncome: action.stpGrossIncome,
            stpOtherCommitments: action.stpOtherCommitments,
            stpState: action.stpState,
            stpArea: action.stpArea,
            stpBranch: action.stpBranch,
            stpStaffId: action.stpStaffId,
            stpIsUsaCitizen: action.stpIsUsaCitizen,
            stpDeclarePdpa: action.stpDeclarePdpa,
            stpEmail: action.stpEmail,
            stpHomeAddress1: action.stpHomeAddress1,
            stpHomeAddress2: action.stpHomeAddress2,
            stpHomeAddress3: action.stpHomeAddress3,
            stpHomePostcode: action.stpHomePostcode,
            stpHomeCity: action.stpHomeCity,
            stpMobileContactNumber: action.stpMobileContactNumber,
            stpMaritalStatusDesc: action.stpMaritalStatusDesc,
            stpMaritalStatusCode: action.stpMaritalStatusCode,
            stpEducationCode: action.stpEducationCode,
            stpEducationDesc: action.stpEducationDesc,
            stpEmployerStateDesc: action.stpEmployerStateDesc,
            stpEmployerStateCode: action.stpEmployerStateCode,
            stpHomeCountry: action.stpHomeCountry,
            // 11
            stpEmployerName: action.stpEmployerName,
            stpOccupationDesc: action.stpOccupationDesc,
            stpOccupationSectorCode: action.stpOccupationSectorCode,
            stpEmploymentTypeDesc: action.stpEmploymentTypeDesc,
            stpEmployerAddress1: action.stpEmployerAddress1,
            stpEmployerAddress2: action.stpEmployerAddress2,
            stpEmployerAddress3: action.stpEmployerAddress3,
            stpEmployerPostcode: action.stpEmployerPostcode,
            stpEmployerCity: action.stpEmployerCity,
            stpEmployerCountry: action.stpEmployerCountry,
            stpHomeStateCode: action.stpHomeStateCode,
            stpHomeStateDesc: action.stpHomeStateDesc,
            stpEmployerContactNumber: action.stpEmployerContactNumber,
        };
    }
}
