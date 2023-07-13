import { validateMobileNumber, validateEmailAddress } from "@screens/ZestCASA/ZestCASAValidation";

import {
    TITLE_ACTION,
    GENDER_ACTION,
    RACE_ACTION,
    MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
    MOBILE_NUMBER_WITH_EXTENSION_ACTION,
    MOBILE_NUMBER_MASK_ACTION,
    EMAIL_ADDRESS_ACTION,
    POLITICAL_EXPOSURE_ACTION,
    GET_TITLE_DROPDOWN_ITEMS_ACTION,
    GET_RACE_DROPDOWN_ITEMS_ACTION,
    PERSONAL_DETAILS_CONFIRMATION_ACTION,
    PERSONAL_CONTINUE_BUTTON_DISABLED_ACTION,
    PERSONAL_DETAILS_CLEAR,
    EMAIL_MASK_ACTION,
} from "@redux/actions/ZestCASA/personalDetailsAction";

// Personal details default value
const initialState = {
    titleIndex: null,
    titleValue: null,
    gender: null,
    genderValue: null,
    raceIndex: null,
    raceValue: null,
    mobileNumberWithoutExtension: null,
    mobileNumberWithExtension: null,
    emailAddress: null,
    politicalExposure: null,

    titleDropdownItems: [],
    raceDropdownItems: [],
    mobileNumberErrorMessage: null,
    emailAddressErrorMessage: null,
    isPersonalContinueButtonEnabled: false,
    isFromConfirmationScreenForPersonalDetails: false,

    isMobileNumberMaskingOn: false,
};

// Personal details reducer
export default function personalDetailsReducer(state = initialState, action) {
    switch (action.type) {
        case GET_TITLE_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                titleDropdownItems: action.titleDropdownItems,
            };

        case GET_RACE_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                raceDropdownItems: action.raceDropdownItems,
            };

        case TITLE_ACTION:
            return {
                ...state,
                titleIndex: action.titleIndex,
                titleValue: action.titleValue,
            };

        case GENDER_ACTION:
            return {
                ...state,
                gender: action.gender,
                genderValue: action.genderValue,
            };

        case RACE_ACTION:
            return {
                ...state,
                raceIndex: action.raceIndex,
                raceValue: action.raceValue,
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

        case MOBILE_NUMBER_MASK_ACTION:
            return {
                ...state,
                isMobileNumberMaskingOn: action.isMobileNumberMaskingOn,
            };

        case EMAIL_ADDRESS_ACTION:
            return {
                ...state,
                emailAddress: action.emailAddress,
                emailAddressErrorMessage: validateEmailAddress(action.emailAddress),
            };

        case POLITICAL_EXPOSURE_ACTION:
            return {
                ...state,
                politicalExposure: action.politicalExposure,
            };

        case PERSONAL_DETAILS_CONFIRMATION_ACTION:
            return {
                ...state,
                isFromConfirmationScreenForPersonalDetails:
                    action.isFromConfirmationScreenForPersonalDetails,
            };

        case PERSONAL_CONTINUE_BUTTON_DISABLED_ACTION:
            return {
                ...state,
                isPersonalContinueButtonEnabled: checkPersonalDetailsContinueButtonStatus(state),
            };

        case PERSONAL_DETAILS_CLEAR:
            return {
                ...state,
                titleIndex: null,
                titleValue: null,
                gender: null,
                genderValue: null,
                raceIndex: null,
                raceValue: null,
                mobileNumberWithoutExtension: null,
                mobileNumberWithExtension: null,
                emailAddress: null,
                politicalExposure: null,

                titleDropdownItems: [],
                raceDropdownItems: [],
                mobileNumberErrorMessage: null,
                emailAddressErrorMessage: null,
                isPersonalContinueButtonEnabled: false,

                isMobileNumberMaskingOn: false,
            };

        case EMAIL_MASK_ACTION:
            return {
                ...state,
                isEmailMaskingOn: action.isEmailMaskingOn,
            };

        default:
            return state;
    }
}

// Check personal identity continue button status
export const checkPersonalDetailsContinueButtonStatus = (state) => {
    return (
        state.titleIndex !== null &&
        state.titleValue &&
        state.gender &&
        state.raceIndex !== null &&
        state.raceValue &&
        state.mobileNumberWithoutExtension &&
        state.mobileNumberWithoutExtension.trim().length > 0 &&
        state.emailAddress &&
        state.emailAddress.trim().length > 0 &&
        state.politicalExposure !== null &&
        state.mobileNumberErrorMessage === null &&
        state.emailAddressErrorMessage === null
    );
};
