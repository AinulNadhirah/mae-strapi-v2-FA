import {
    validateIdentityNumber,
    validateFullName,
    validatePassportNumber,
    activateAccountValidateIdentityNumber,
} from "@screens/ZestCASA/ZestCASAValidation";

import {
    ID_TYPE_ACTION,
    ID_NUMBER_ACTION,
    FULL_NAME_ACTION,
    PASSPORT_EXPIRY_DATE_ACTION,
    DATE_OF_BIRTH_ACTION,
    GET_NATIONALITY_DROPDOWN_ITEMS_ACTION,
    NATIONALITY_ACTION,
    IDENTITY_CONTINUE_BUTTON_DISABLED_ACTION,
    IDENTITY_DETAILS_CLEAR,
    PASSPORT_NUMBER_ACTION,
    ACTIVATE_ACCOUNT_IDENTITY_CONTINUE_BUTTON_DISABLED_ACTION,
    ACTIVATE_ACCOUNT_ID_NUMBER_ACTION,
} from "@redux/actions/ZestCASA/identityDetailsAction";

// Identity details default value
const initialState = {
    identityType: null,
    identityNumber: null,
    fullName: null,
    passportExpiryDate: null,
    dateOfBirth: null,
    nationalityIndex: null,
    nationalityValue: null,

    nationalityDropdownItems: [],
    identityNumberErrorMessage: null,
    fullNameErrorMessage: null,
    isIdentityContinueButtonEnabled: false,
    passportNumber: null,
    isValidPassportError: null,

    dateOfBirthDateObject: null,
    passportExpiryDateObject: null,
    uscitizenSelected: false,

    isActivationAccountIdentityContinueButtonEnabled: false,
};

// Identity details reducer
export default function identityDetailsReducer(state = initialState, action) {
    switch (action.type) {
        case GET_NATIONALITY_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                nationalityDropdownItems: action.nationalityDropdownItems,
            };

        case ID_TYPE_ACTION:
            return {
                ...state,
                identityType: action.identityType,
            };

        case PASSPORT_NUMBER_ACTION:
            return {
                ...state,
                passportNumber: action.passportNumber,
                isValidPassportError: validatePassportNumber(action.passportNumber),
            };

        case ID_NUMBER_ACTION:
            return {
                ...state,
                identityNumber: action.identityNumber,
                identityNumberErrorMessage: validateIdentityNumber(
                    action.identityNumber,
                    action.isZest
                ),
            };

        case ACTIVATE_ACCOUNT_ID_NUMBER_ACTION:
            return {
                ...state,
                identityNumber: action.identityNumber,
                identityNumberErrorMessage: activateAccountValidateIdentityNumber(
                    action.identityNumber
                ),
            };

        case FULL_NAME_ACTION:
            return {
                ...state,
                fullName: action.fullName,
                fullNameErrorMessage: validateFullName(action.fullName),
            };

        case PASSPORT_EXPIRY_DATE_ACTION:
            return {
                ...state,
                passportExpiryDate: action.passportExpiryDate,
                passportExpiryDateObject: action.passportExpiryDateObject,
            };

        case DATE_OF_BIRTH_ACTION:
            return {
                ...state,
                dateOfBirth: action.dateOfBirth,
                dateOfBirthDateObject: action.dateOfBirthDateObject,
            };

        case NATIONALITY_ACTION:
            return {
                ...state,
                nationalityIndex: action.nationalityIndex,
                nationalityValue: action.nationalityValue,
                uscitizenSelected: action.nationalityIndex == "226" ? true : false,
            };

        case IDENTITY_CONTINUE_BUTTON_DISABLED_ACTION:
            return {
                ...state,
                isIdentityContinueButtonEnabled: checkIdentityDetailsContinueButtonStatus(state),
            };

        case ACTIVATE_ACCOUNT_IDENTITY_CONTINUE_BUTTON_DISABLED_ACTION:
            return {
                ...state,
                isActivationAccountIdentityContinueButtonEnabled:
                    checkctivationAccountIdentityContinueButtonStatus(state),
            };

        case IDENTITY_DETAILS_CLEAR:
            return {
                ...state,
                identityType: null,
                identityNumber: null,
                fullName: null,
                passportExpiryDate: null,
                dateOfBirth: null,
                nationalityIndex: null,
                nationalityValue: null,
                passportNumber: null,
                isValidPassportError: null,
                identityNumberErrorMessage: null,
                nationalityDropdownItems: [],
                identityTypeErrorMessage: null,
                fullNameErrorMessage: null,
                isIdentityContinueButtonEnabled: false,
                dateOfBirthDateObject: null,
                isActivationAccountIdentityContinueButtonEnabled: false,
            };

        default:
            return state;
    }
}

// Button enable or disable check
export const checkIdentityDetailsContinueButtonStatus = (state) => {
    return state.identityType === 1
        ? state.identityNumber &&
              state.identityNumber.trim().length > 0 &&
              state.fullName &&
              state.fullName.trim().length > 0 &&
              state.identityNumberErrorMessage === null &&
              state.fullNameErrorMessage === null
        : state.passportNumber &&
              state.passportNumber.trim().length > 0 &&
              state.fullName &&
              state.fullName.trim().length > 0 &&
              state.passportExpiryDate &&
              state.dateOfBirth &&
              state.nationalityIndex !== null &&
              state.nationalityValue &&
              state.identityNumberErrorMessage === null &&
              state.fullNameErrorMessage === null &&
              state.isValidPassportError === null;
};

// Button enable or disable check
export const checkctivationAccountIdentityContinueButtonStatus = (state) => {
    return (
        state.identityNumber &&
        state.identityNumber.trim().length > 0 &&
        state.identityNumberErrorMessage == null
    );
};
