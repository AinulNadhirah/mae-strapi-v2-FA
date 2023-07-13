import {
    validatAddress,
    validateCity,
    validatePostalCode,
    validateOfficeMobileNumber,
    validateAddress,
} from "@screens/ASB/Financing/AsbFinanceValidation";

import {
    EMPLOYMENT_ADDRESS_LINE_ONE_ACTION,
    EMPLOYMENT_ADDRESS_LINE_TWO_ACTION,
    EMPLOYMENT_ADDRESS_LINE_THREE_ACTION,
    EMPLOYMENT_POSTAL_CODE_ACTION,
    EMPLOYMENT_STATE_ACTION,
    EMPLOYMENT_COUNTRY_ACTION,
    EMPLOYMENT_CITY_ACTION,
    GET_STATE_DROPDOWN_ITEMS_ACTION,
    GET_COUNTRY_DROPDOWN_ITEMS_ACTION,
    RESIDENTIAL_DETAILS_CONFIRMATION_ACTION,
    RESIDENTIAL_CONTINUE_BUTTON_DISABLED_ACTION,
    RESIDENTIAL_DETAILS_CLEAR,
    EMPLOYMENT_ADDRESS_LINE_ONE_MASK_ACTION,
    EMPLOYMENT_ADDRESS_LINE_TWO_MASK_ACTION,
    EMPLOYMENT_ADDRESS_LINE_THREE_MASK_ACTION,
    EMPLOYMENT_MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
    EMPLOYMENT_MOBILE_NUMBER_WITH_EXTENSION_ACTION,
    EMPLOYMENT_MOBILE_NUMBER_MASK_ACTION,
    EMPLOYMENT_POSTAL_CODE_MASK_ACTION,
    EMPLOYMENT_CITY_MASK_ACTION,
} from "@redux/actions/ASBFinance/occupationInformation2Action";

const initialState = {
    addressLineOne: null,
    addressLineTwo: null,
    addressLineThree: null,
    postalCode: null,
    stateIndex: null,
    stateValue: null,
    countryIndex: null,
    countryValue: null,
    city: null,
    mobileNumberWithoutExtension: null,
    mobileNumberWithExtension: null,

    stateDropdownItems: [],
    countryDropdownItems: [],
    isResidentialContinueButtonEnabled: false,
    isFromConfirmationScreenForResidentialDetails: false,
    addressLineOneErrorMessage: null,
    addressLineTwoErrorMessage: null,
    addressLineThreeErrorMessage: null,
    postalCodeErrorMessage: null,
    cityErrorMessage: null,
    mobileNumberErrorMessage: null,

    isAddressLineOneMaskingOn: false,
    isAddressLineTwoMaskingOn: false,
    isAddressLineThreeMaskingOn: false,
    isMobileNumberMaskingOn: false,
    isPostalCodeMaskingOn: false,
    isCityMaskingOn: false,
};

// Occupation Information2 reducer
export default function occupationInformation2Reducer(state = initialState, action) {
    switch (action.type) {
        case GET_STATE_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                stateDropdownItems: action.stateDropdownItems,
            };

        case GET_COUNTRY_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                countryDropdownItems: action.countryDropdownItems,
            };

        case EMPLOYMENT_ADDRESS_LINE_ONE_ACTION:
            return {
                ...state,
                addressLineOne: action.addressLineOne,
                addressLineOneErrorMessage: validatAddress(action.addressLineOne),
            };

        case EMPLOYMENT_ADDRESS_LINE_TWO_ACTION:
            return {
                ...state,
                addressLineTwo: action.addressLineTwo,
                addressLineTwoErrorMessage: validatAddress(action.addressLineTwo),
            };

        case EMPLOYMENT_ADDRESS_LINE_THREE_ACTION:
            return {
                ...state,
                addressLineThree: action.addressLineThree,
                addressLineThreeErrorMessage: validateAddress(action.addressLineThree),
            };

        case EMPLOYMENT_POSTAL_CODE_ACTION:
            return {
                ...state,
                postalCode: action.postalCode,
                postalCodeErrorMessage: validatePostalCode(action.postalCode),
            };

        case EMPLOYMENT_STATE_ACTION:
            return {
                ...state,
                stateIndex: action.stateIndex,
                stateValue: action.stateValue,
            };

        case EMPLOYMENT_COUNTRY_ACTION:
            return {
                ...state,
                countryIndex: action.countryIndex,
                countryValue: action.countryValue,
            };

        case EMPLOYMENT_CITY_ACTION:
            return {
                ...state,
                city: action.city,
                cityErrorMessage: validateCity(action.city),
            };

        case RESIDENTIAL_DETAILS_CONFIRMATION_ACTION:
            return {
                ...state,
                isFromConfirmationScreenForResidentialDetails:
                    action.isFromConfirmationScreenForResidentialDetails,
            };

        case EMPLOYMENT_MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION:
            return {
                ...state,
                mobileNumberWithoutExtension: action.mobileNumberWithoutExtension,
                mobileNumberErrorMessage: validateOfficeMobileNumber(
                    action.mobileNumberWithoutExtension
                ),
                // mobileNumberErrorMessage: action.mobileNumberWithoutExtension
                //     ? validateMobileNumber(action.mobileNumberWithoutExtension)
                //     : action.mobileNumberWithoutExtension,
            };

        case EMPLOYMENT_MOBILE_NUMBER_WITH_EXTENSION_ACTION:
            return {
                ...state,
                mobileNumberWithExtension: action.mobileNumberWithExtension,
            };

        case EMPLOYMENT_MOBILE_NUMBER_MASK_ACTION:
            return {
                ...state,
                isMobileNumberMaskingOn: action.isMobileNumberMaskingOn,
            };

        case RESIDENTIAL_CONTINUE_BUTTON_DISABLED_ACTION:
            return {
                ...state,
                isResidentialContinueButtonEnabled: checkResidentialDetailsContinueButtonStatus(
                    state,
                    // action.userStatus,
                    // action.mobileNumber,
                    action.mobileNumberErrorMessage
                ),
            };

        case EMPLOYMENT_ADDRESS_LINE_ONE_MASK_ACTION:
            return {
                ...state,
                isAddressLineOneMaskingOn: action.isAddressLineOneMaskingOn,
            };

        case EMPLOYMENT_ADDRESS_LINE_TWO_MASK_ACTION:
            return {
                ...state,
                isAddressLineTwoMaskingOn: action.isAddressLineTwoMaskingOn,
            };

        case EMPLOYMENT_ADDRESS_LINE_THREE_MASK_ACTION:
            return {
                ...state,
                isAddressLineThreeMaskingOn: action.isAddressLineThreeMaskingOn,
            };

        case EMPLOYMENT_POSTAL_CODE_MASK_ACTION:
            return {
                ...state,
                isPostalCodeMaskingOn: action.isPostalCodeMaskingOn,
            };

        case EMPLOYMENT_CITY_MASK_ACTION:
            return {
                ...state,
                isCityMaskingOn: action.isCityMaskingOn,
            };

        case RESIDENTIAL_DETAILS_CLEAR:
            return {
                ...state,
                addressLineOne: null,
                addressLineTwo: null,
                addressLineThree: null,
                postalCode: null,
                stateIndex: null,
                stateValue: null,
                countryIndex: null,
                countryValue: null,
                city: null,
                mobileNumberWithoutExtension: null,
                mobileNumberWithExtension: null,

                stateDropdownItems: [],
                countryDropdownItems: [],
                isResidentialContinueButtonEnabled: false,
                addressLineOneErrorMessage: null,
                addressLineTwoErrorMessage: null,
                addressLineThreeErrorMessage: null,
                postalCodeErrorMessage: null,
                cityErrorMessage: null,
                mobileNumberErrorMessage: null,

                isAddressLineOneMaskingOn: false,
                isAddressLineTwoMaskingOn: false,
                isAddressLineThreeMaskingOn: false,
                isMobileNumberMaskingOn: false,
                isPostalCodeMaskingOn: false,
                isCityMaskingOn: false,
            };

        default:
            return state;
    }
}

// Check residential identity continue button status
export const checkResidentialDetailsContinueButtonStatus = (state, mobileNumberErrorMessage) => {
    return (
        state.addressLineOne &&
        state.addressLineOne.trim().length > 0 &&
        state.addressLineTwo &&
        state.addressLineTwo.trim().length > 0 &&
        state.postalCode &&
        state.postalCode.trim().length > 0 &&
        // mobileNumberWithoutExtension &&
        // mobileNumberWithoutExtension.trim().length > 0 &&
        state.stateIndex !== null &&
        state.stateValue &&
        state.countryIndex !== null &&
        state.countryValue &&
        state.city &&
        state.city.trim().length > 0 &&
        state.addressLineOneErrorMessage === null &&
        state.addressLineTwoErrorMessage === null &&
        // state.addressLineThreeErrorMessage === null &&
        state.postalCodeErrorMessage === null &&
        state.cityErrorMessage === null &&
        state.mobileNumberWithoutExtension &&
        state.mobileNumberWithoutExtension.trim().length > 0 &&
        state.mobileNumberErrorMessage === null &&
        mobileNumberErrorMessage === null
    );
};
