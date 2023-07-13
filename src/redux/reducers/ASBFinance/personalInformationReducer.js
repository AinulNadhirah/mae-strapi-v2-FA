import {
    validatAddress,
    validateCity,
    validatePostalCode,
    validateEmailAddress,
    validateMobileNumber,
} from "@screens/ASB/Financing/AsbFinanceValidation";

import {
    ADDRESS_LINE_ONE_ACTION,
    ADDRESS_LINE_TWO_ACTION,
    ADDRESS_LINE_THREE_ACTION,
    POSTAL_CODE_ACTION,
    STATE_ACTION,
    MARITAL_ACTION,
    EDUCATION_ACTION,
    COUNTRY_ACTION,
    CITY_ACTION,
    GET_STATE_DROPDOWN_ITEMS_ACTION,
    GET_MARITAL_DROPDOWN_ITEMS_ACTION,
    GET_EDUCATION_DROPDOWN_ITEMS_ACTION,
    GET_COUNTRY_DROPDOWN_ITEMS_ACTION,
    RESIDENTIAL_DETAILS_CONFIRMATION_ACTION,
    RESIDENTIAL_CONTINUE_BUTTON_DISABLED_ACTION,
    RESIDENTIAL_DETAILS_CLEAR,
    ADDRESS_LINE_ONE_MASK_ACTION,
    ADDRESS_LINE_TWO_MASK_ACTION,
    ADDRESS_LINE_THREE_MASK_ACTION,
    EMAIL_ADDRESS_ACTION,
    MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
    MOBILE_NUMBER_WITH_EXTENSION_ACTION,
    MOBILE_NUMBER_MASK_ACTION,
    RACE_ACTION,
    GET_RACE_DROPDOWN_ITEMS_ACTION,
    POSTAL_CODE_MASK_ACTION,
    EMAIL_MASK_ACTION,
    CITY_MASK_ACTION,
} from "@redux/actions/ASBFinance/personalInformationAction";

const initialState = {
    addressLineOne: null,
    addressLineTwo: null,
    addressLineThree: null,
    postalCode: null,
    stateIndex: null,
    stateValue: null,
    maritalIndex: null,
    maritalValue: null,
    educationIndex: null,
    educationValue: null,
    countryIndex: null,
    countryValue: null,
    city: null,
    emailAddress: null,
    mobileNumberWithoutExtension: null,
    mobileNumberWithExtension: null,
    raceIndex: null,
    raceValue: null,

    stateDropdownItems: [],
    maritalDropdownItems: [],
    educationDropdownItems: [],
    countryDropdownItems: [],
    raceDropdownItems: [],
    isResidentialContinueButtonEnabled: false,
    isFromConfirmationScreenForResidentialDetails: false,
    addressLineOneErrorMessage: null,
    addressLineTwoErrorMessage: null,
    addressLineThreeErrorMessage: null,
    postalCodeErrorMessage: null,
    cityErrorMessage: null,
    mobileNumberErrorMessage: null,
    race: null,

    isAddressLineOneMaskingOn: false,
    isAddressLineTwoMaskingOn: false,
    isAddressLineThreeMaskingOn: false,
    isMobileNumberMaskingOn: false,
    isPostalCodeMaskingOn: false,
    isEmailMaskingOn: false,
    isCityMaskingOn: false,
};

// Personal details reducer
export default function personalInformationReducer(state = initialState, action) {
    // console.log("personalInformationReducer -> ", action);
    switch (action.type) {
        case GET_STATE_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                stateDropdownItems: action.stateDropdownItems,
            };

        case GET_MARITAL_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                maritalDropdownItems: action.maritalDropdownItems,
            };

        case GET_EDUCATION_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                educationDropdownItems: action.educationDropdownItems,
            };

        case GET_COUNTRY_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                countryDropdownItems: action.countryDropdownItems,
            };

        case GET_RACE_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                raceDropdownItems: action.raceDropdownItems,
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

        case MARITAL_ACTION:
            return {
                ...state,
                maritalIndex: action.maritalIndex,
                maritalValue: action.maritalValue,
            };

        case EDUCATION_ACTION:
            return {
                ...state,
                educationIndex: action.educationIndex,
                educationValue: action.educationValue,
            };

        case COUNTRY_ACTION:
            return {
                ...state,
                countryIndex: action.countryIndex,
                countryValue: action.countryValue,
            };

        case RACE_ACTION:
            return {
                ...state,
                raceIndex: action.raceIndex,
                raceValue: action.raceValue,
            };

        case CITY_ACTION:
            return {
                ...state,
                city: action.city,
                cityErrorMessage: validateCity(action.city),
            };

        case EMAIL_ADDRESS_ACTION:
            return {
                ...state,
                emailAddress: action.emailAddress,
                emailAddressErrorMessage: validateEmailAddress(action.emailAddress),
            };

        case RESIDENTIAL_DETAILS_CONFIRMATION_ACTION:
            return {
                ...state,
                isFromConfirmationScreenForResidentialDetails:
                    action.isFromConfirmationScreenForResidentialDetails,
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

        case RESIDENTIAL_CONTINUE_BUTTON_DISABLED_ACTION:
            console.log("action.race", action.race);
            return {
                ...state,
                isResidentialContinueButtonEnabled: checkResidentialDetailsContinueButtonStatus(
                    state,
                    action.userStatus,
                    action.mobileNumber,
                    action.mobileNumberErrorMessage,
                    action.race
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

        case POSTAL_CODE_MASK_ACTION:
            return {
                ...state,
                isPostalCodeMaskingOn: action.isPostalCodeMaskingOn,
            };

        case EMAIL_MASK_ACTION:
            return {
                ...state,
                isEmailMaskingOn: action.isEmailMaskingOn,
            };

        case CITY_MASK_ACTION:
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
                maritalIndex: null,
                maritalValue: null,
                educationIndex: null,
                educationValue: null,
                countryIndex: null,
                countryValue: null,
                city: null,
                emailAddress: null,
                mobileNumberWithoutExtension: null,
                mobileNumberWithExtension: null,
                raceIndex: null,
                raceValue: null,

                stateDropdownItems: [],
                maritalDropdownItems: [],
                educationDropdownItems: [],
                countryDropdownItems: [],
                raceDropdownItems: [],
                isResidentialContinueButtonEnabled: false,
                addressLineOneErrorMessage: null,
                addressLineTwoErrorMessage: null,
                addressLineThreeErrorMessage: null,
                postalCodeErrorMessage: null,
                cityErrorMessage: null,
                emailAddressErrorMessage: null,
                mobileNumberErrorMessage: null,
                race: null,

                isAddressLineOneMaskingOn: false,
                isAddressLineTwoMaskingOn: false,
                isAddressLineThreeMaskingOn: false,
                isMobileNumberMaskingOn: false,
                isPostalCodeMaskingOn: false,
                isEmailMaskingOn: false,
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
    race
) => {
    console.log("checkResidentialDetailsContinueButtonStatus", race);
    return race != "NATIVE"
        ? state.addressLineOne &&
              state.addressLineOne.trim().length > 0 &&
              state.addressLineTwo &&
              state.addressLineTwo.trim().length > 0 &&
              state.postalCode &&
              state.postalCode.trim().length > 0 &&
              mobileNumber &&
              mobileNumber.trim().length > 0 &&
              state.stateIndex !== null &&
              state.stateValue &&
              state.maritalIndex !== null &&
              state.maritalValue &&
              state.educationIndex !== null &&
              state.educationValue &&
              state.countryIndex !== null &&
              state.countryValue &&
              //   state.raceIndex !== null &&
              //   state.raceValue &&
              state.city &&
              state.city.trim().length > 0 &&
              state.emailAddress &&
              state.emailAddressErrorMessage === null &&
              state.addressLineOneErrorMessage === null &&
              state.addressLineTwoErrorMessage === null &&
              state.addressLineThreeErrorMessage === null &&
              state.postalCodeErrorMessage === null &&
              state.cityErrorMessage === null &&
              state.mobileNumberWithoutExtension &&
              state.mobileNumberWithoutExtension.trim().length > 0 &&
              state.mobileNumberErrorMessage === null &&
              mobileNumberErrorMessage === null
        : state.addressLineOne &&
              state.addressLineOne.trim().length > 0 &&
              state.addressLineTwo &&
              state.addressLineTwo.trim().length > 0 &&
              state.postalCode &&
              state.postalCode.trim().length > 0 &&
              mobileNumber &&
              mobileNumber.trim().length > 0 &&
              state.emailAddress &&
              state.emailAddress.trim().length > 0 &&
              state.stateIndex !== null &&
              state.stateValue &&
              state.maritalIndex !== null &&
              state.maritalValue &&
              state.educationIndex !== null &&
              state.educationValue &&
              state.countryIndex !== null &&
              state.countryValue &&
              state.raceIndex !== null &&
              state.raceValue &&
              state.city &&
              state.city.trim().length > 0 &&
              state.addressLineOneErrorMessage === null &&
              state.addressLineTwoErrorMessage === null &&
              state.addressLineThreeErrorMessage === null &&
              state.postalCodeErrorMessage === null &&
              state.cityErrorMessage === null &&
              state.mobileNumberWithoutExtension &&
              state.mobileNumberWithoutExtension.trim().length > 0 &&
              state.mobileNumberErrorMessage === null &&
              mobileNumberErrorMessage === null &&
              state.emailAddressErrorMessage === null;
};
