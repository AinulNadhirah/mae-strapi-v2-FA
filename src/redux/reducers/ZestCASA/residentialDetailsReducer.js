import {
    validatAddress,
    validateCity,
    validatePostalCode,
} from "@screens/ZestCASA/ZestCASAValidation";

import {
    ADDRESS_LINE_ONE_ACTION,
    ADDRESS_LINE_TWO_ACTION,
    ADDRESS_LINE_THREE_ACTION,
    POSTAL_CODE_ACTION,
    STATE_ACTION,
    CITY_ACTION,
    GET_STATE_DROPDOWN_ITEMS_ACTION,
    RESIDENTIAL_DETAILS_CONFIRMATION_ACTION,
    RESIDENTIAL_CONTINUE_BUTTON_DISABLED_ACTION,
    RESIDENTIAL_DETAILS_CLEAR,
    ADDRESS_LINE_ONE_MASK_ACTION,
    ADDRESS_LINE_TWO_MASK_ACTION,
    ADDRESS_LINE_THREE_MASK_ACTION,
    CITY_MASK_ACTION,
} from "@redux/actions/ZestCASA/residentialDetailsAction";

const initialState = {
    addressLineOne: null,
    addressLineTwo: null,
    addressLineThree: null,
    postalCode: null,
    stateIndex: null,
    stateValue: null,
    city: null,

    stateDropdownItems: [],
    isResidentialContinueButtonEnabled: false,
    isFromConfirmationScreenForResidentialDetails: false,
    addressLineOneErrorMessage: null,
    addressLineTwoErrorMessage: null,
    addressLineThreeErrorMessage: null,
    postalCodeErrorMessage: null,
    cityErrorMessage: null,

    isAddressLineOneMaskingOn: false,
    isAddressLineTwoMaskingOn: false,
    isAddressLineThreeMaskingOn: false,
};

// Personal details reducer
export default function residentialDetailsReducer(state = initialState, action) {
    switch (action.type) {
        case GET_STATE_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                stateDropdownItems: action.stateDropdownItems,
            };

        case ADDRESS_LINE_ONE_ACTION:
            return {
                ...state,
                addressLineOne: action.addressLineOne,
                addressLineOneErrorMessage: validatAddress(action.addressLineOne),
            };

        case ADDRESS_LINE_TWO_ACTION:
            return {
                ...state,
                addressLineTwo: action.addressLineTwo,
                addressLineTwoErrorMessage: validatAddress(action.addressLineTwo),
            };

        case ADDRESS_LINE_THREE_ACTION:
            return {
                ...state,
                addressLineThree: action.addressLineThree,
                addressLineThreeErrorMessage: validatAddress(action.addressLineThree),
            };

        case POSTAL_CODE_ACTION:
            return {
                ...state,
                postalCode: action.postalCode,
                postalCodeErrorMessage: validatePostalCode(action.postalCode),
            };

        case STATE_ACTION:
            return {
                ...state,
                stateIndex: action.stateIndex,
                stateValue: action.stateValue,
            };

        case CITY_ACTION:
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

        case RESIDENTIAL_CONTINUE_BUTTON_DISABLED_ACTION:
            return {
                ...state,
                isResidentialContinueButtonEnabled: checkResidentialDetailsContinueButtonStatus(
                    state,
                    action.userStatus,
                    action.mobileNumber,
                    action.mobileNumberErrorMessage,
                    action.emailAddress,
                    action.emailAddressErrorMessage
                ),
            };

        case ADDRESS_LINE_ONE_MASK_ACTION:
            return {
                ...state,
                isAddressLineOneMaskingOn: action.isAddressLineOneMaskingOn,
            };

        case ADDRESS_LINE_TWO_MASK_ACTION:
            return {
                ...state,
                isAddressLineTwoMaskingOn: action.isAddressLineTwoMaskingOn,
            };

        case ADDRESS_LINE_THREE_MASK_ACTION:
            return {
                ...state,
                isAddressLineThreeMaskingOn: action.isAddressLineThreeMaskingOn,
            };

        case CITY_MASK_ACTION:
           return {
                ...state,
                isCityMaskingOn: action.isCityMaskingOn
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
                city: null,

                stateDropdownItems: [],
                isResidentialContinueButtonEnabled: false,
                addressLineOneErrorMessage: null,
                addressLineTwoErrorMessage: null,
                addressLineThreeErrorMessage: null,
                postalCodeErrorMessage: null,
                cityErrorMessage: null,

                isAddressLineOneMaskingOn: false,
                isAddressLineTwoMaskingOn: false,
                isAddressLineThreeMaskingOn: false,
                isCityMaskingOn: false,
            };

        default:
            return state;
    }
}

// Check residential identity continue button status
export const checkResidentialDetailsContinueButtonStatus = (
    state,
    userStatus,
    mobileNumber,
    mobileNumberErrorMessage,
    emailAddress,
    emailAddressErrorMessage,
) => {
    return userStatus
        ? state.addressLineOne &&
              state.addressLineOne.trim().length > 0 &&
              state.addressLineTwo &&
              state.addressLineTwo.trim().length > 0 &&
              state.postalCode &&
              state.postalCode.trim().length > 0 &&
              mobileNumber &&
              mobileNumber.trim().length > 0 &&
              emailAddress &&
              emailAddress.trim().length > 0 &&
              state.stateIndex !== null &&
              state.stateValue &&
              state.city &&
              state.city.trim().length > 0 &&
              state.addressLineOneErrorMessage === null &&
              state.addressLineTwoErrorMessage === null &&
              state.addressLineThreeErrorMessage === null &&
              state.postalCodeErrorMessage === null &&
              state.cityErrorMessage === null &&
              mobileNumberErrorMessage === null &&
              emailAddressErrorMessage === null
        : state.addressLineOne &&
              state.addressLineOne.trim().length > 0 &&
              state.addressLineTwo &&
              state.addressLineTwo.trim().length > 0 &&
              state.postalCode &&
              state.postalCode.trim().length > 0 &&
              state.stateIndex !== null &&
              state.stateValue &&
              state.city &&
              state.city.trim().length > 0 &&
              state.addressLineOneErrorMessage === null &&
              state.addressLineTwoErrorMessage === null &&
              state.addressLineThreeErrorMessage === null &&
              state.postalCodeErrorMessage === null &&
              state.cityErrorMessage === null;
};
