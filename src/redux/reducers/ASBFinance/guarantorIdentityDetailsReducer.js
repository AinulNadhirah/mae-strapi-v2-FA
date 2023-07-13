import {
    validateIdentityNumber,
    validateFullName,
    validateMobileNumber,
    validateEmailAddress,
} from "@screens/ASB/Financing/AsbFinanceValidation";

import {
    ID_NUMBER_ACTION,
    FULL_NAME_ACTION,
    RELATIONSHIP_ACTION,
    MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
    MOBILE_NUMBER_WITH_EXTENSION_ACTION,
    EMAIL_ADDRESS_ACTION,
    GUARANTOR_IDENTITY_CONTINUE_BUTTON_ENABLE_ACTION,
    GUARANTOR_IDENTITY_DETAILS_CLEAR,
} from "@redux/actions/ASBFinance/guarantorIdentityDetailsAction";

// Identity details default value
const initialState = {
    identityNumber: null,
    fullName: null,
    relationshipIndex: null,
    relationshipValue: null,
    mobileNumberWithoutExtension: null,
    mobileNumberWithExtension: null,
    emailAddress: null,

    identityNumberErrorMessage: null,
    fullNameErrorMessage: null,
    mobileNumberErrorMessage: null,
    emailAddressErrorMessage: null,

    isGuarantorIdentityContinueButtonEnabled: false,
};

// Identity details reducer
export default function guarantorIdentityDetailsReducer(state = initialState, action) {
    switch (action.type) {
        case ID_NUMBER_ACTION:
            return {
                ...state,
                identityNumber: action.identityNumber,
                identityNumberErrorMessage: validateIdentityNumber(action.identityNumber),
            };

        case FULL_NAME_ACTION:
            return {
                ...state,
                fullName: action.fullName,
                fullNameErrorMessage: validateFullName(action.fullName),
            };

        case RELATIONSHIP_ACTION:
            return {
                ...state,
                relationshipIndex: action.relationshipIndex,
                relationshipValue: action.relationshipValue,
            };

        case MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION:
            return {
                ...state,
                mobileNumberWithoutExtension: action.mobileNumberWithoutExtension,
                mobileNumberErrorMessage: validateMobileNumber(action.mobileNumberWithoutExtension),
            };

        case MOBILE_NUMBER_WITH_EXTENSION_ACTION:
            return {
                ...state,
                mobileNumberWithExtension: action.mobileNumberWithExtension,
            };

        case EMAIL_ADDRESS_ACTION:
            return {
                ...state,
                emailAddress: action.emailAddress,
                emailAddressErrorMessage: validateEmailAddress(action.emailAddress),
            };

        case GUARANTOR_IDENTITY_CONTINUE_BUTTON_ENABLE_ACTION:
            return {
                ...state,
                isGuarantorIdentityContinueButtonEnabled:
                    checGuarantorkIdentityDetailsContinueButtonStatus(state),
            };

        case GUARANTOR_IDENTITY_DETAILS_CLEAR:
            return {
                ...state,
                identityNumber: null,
                fullName: null,
                relationshipIndex: null,
                relationshipValue: null,
                mobileNumberWithoutExtension: null,
                mobileNumberWithExtension: null,
                emailAddress: null,
                identityNumberErrorMessage: null,
                fullNameErrorMessage: null,
                mobileNumberErrorMessage: null,
                emailAddressErrorMessage: null,
                isGuarantorIdentityContinueButtonEnabled: false,
            };

        default:
            return state;
    }
}

// Button enable or disable check
export const checGuarantorkIdentityDetailsContinueButtonStatus = (state) => {
    return (
        state.identityNumber?.trim()?.length > 0 &&
        state.fullName?.trim()?.length > 0 &&
        state.relationshipValue &&
        state.mobileNumberWithoutExtension?.trim()?.length > 0 &&
        state.emailAddress?.trim()?.length > 0 &&
        state.identityNumberErrorMessage === null &&
        state.fullNameErrorMessage === null &&
        state.mobileNumberErrorMessage === null &&
        state.emailAddressErrorMessage === null
    );
};
