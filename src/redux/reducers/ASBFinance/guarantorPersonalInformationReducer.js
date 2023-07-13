import {
    validatAddress,
    validateCity,
    validatePostalCode,
    validateEmailAddress,
    validateMobileNumber,
} from "@screens/ASB/Financing/AsbFinanceValidation";

import {
    GUARANTOR_ADDRESS_LINE_ONE_ACTION,
    GUARANTOR_ADDRESS_LINE_TWO_ACTION,
    GUARANTOR_ADDRESS_LINE_THREE_ACTION,
    GUARANTOR_POSTAL_CODE_ACTION,
    GUARANTOR_STATE_ACTION,
    GUARANTOR_MARITAL_ACTION,
    GUARANTOR_EDUCATION_ACTION,
    GUARANTOR_COUNTRY_ACTION,
    GUARANTOR_CITY_ACTION,
    GUARANTOR_GET_STATE_DROPDOWN_ITEMS_ACTION,
    GUARANTOR_GET_MARITAL_DROPDOWN_ITEMS_ACTION,
    GUARANTOR_GET_EDUCATION_DROPDOWN_ITEMS_ACTION,
    GUARANTOR_GET_COUNTRY_DROPDOWN_ITEMS_ACTION,
    GUARANTOR_PERSONAL_CONTINUE_BUTTON_DISABLED_ACTION,
    GUARANTOR_RESIDENTIAL_DETAILS_CLEAR,
    GUARANTOR_ADDRESS_LINE_ONE_MASK_ACTION,
    GUARANTOR_ADDRESS_LINE_TWO_MASK_ACTION,
    GUARANTOR_ADDRESS_LINE_THREE_MASK_ACTION,
    GUARANTOR_EMAIL_ADDRESS_ACTION,
    GUARANTOR_MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
    GUARANTOR_MOBILE_NUMBER_WITH_EXTENSION_ACTION,
    GUARANTOR_MOBILE_NUMBER_MASK_ACTION,
    GUARANTOR_RACE_ACTION,
    GUARANTOR_GET_RACE_DROPDOWN_ITEMS_ACTION,
    GUARANTOR_POSTAL_CODE_MASK_ACTION,
    GUARANTOR_EMAIL_MASK_ACTION,
    GUARANTOR_CITY_MASK_ACTION,
    GUARANTOR_IS_STATE_ENABLED_ACTION,
    GUARANTOR_EMPLOYMENT_DEATILS_2_CONTINUE_BUTTON_DISABLED_ACTION,
} from "@redux/actions/ASBFinance/guarantorPersonalInformationAction";

import { ASB_NATIVE } from "@constants/strings";

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
    addressLineOneErrorMessage: null,
    addressLineTwoErrorMessage: null,
    addressLineThreeErrorMessage: null,
    postalCodeErrorMessage: null,
    cityErrorMessage: null,
    mobileNumberErrorMessage: null,
    race: null,
    emailAddressErrorMessage: null,

    isAddressLineOneMaskingOn: false,
    isAddressLineTwoMaskingOn: false,
    isAddressLineThreeMaskingOn: false,
    isMobileNumberMaskingOn: false,
    isPostalCodeMaskingOn: false,
    isEmailMaskingOn: false,
    isCityMaskingOn: false,
    isStateDropdownEnabled: false,
    isPersonalInformationContinueButtonEnabled: false,
    isEmploeymentDetails2ContinueButtonEnabled: false,
};

// Personal details reducer
export default function guarantorPersonalInformationReducer(state = initialState, action) {
    switch (action.type) {
        case GUARANTOR_GET_STATE_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                stateDropdownItems: action.stateDropdownItems,
            };

        case GUARANTOR_GET_MARITAL_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                maritalDropdownItems: action.maritalDropdownItems,
            };

        case GUARANTOR_GET_EDUCATION_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                educationDropdownItems: action.educationDropdownItems,
            };

        case GUARANTOR_GET_COUNTRY_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                countryDropdownItems: action.countryDropdownItems,
            };

        case GUARANTOR_GET_RACE_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                raceDropdownItems: action.raceDropdownItems,
            };

        case GUARANTOR_ADDRESS_LINE_ONE_ACTION:
            console.log("GUARANTOR_ADDRESS_LINE_ONE_ACTION", validatAddress(action.addressLineOne));
            return {
                ...state,
                addressLineOne: action.addressLineOne,
                addressLineOneErrorMessage: validatAddress(action.addressLineOne),
            };

        case GUARANTOR_ADDRESS_LINE_TWO_ACTION:
            return {
                ...state,
                addressLineTwo: action.addressLineTwo,
                addressLineTwoErrorMessage: validatAddress(action.addressLineTwo),
            };

        case GUARANTOR_ADDRESS_LINE_THREE_ACTION:
            return {
                ...state,
                addressLineThree: action.addressLineThree,
                addressLineThreeErrorMessage: validatAddress(action.addressLineThree),
            };

        case GUARANTOR_POSTAL_CODE_ACTION:
            return {
                ...state,
                postalCode: action.postalCode,
                postalCodeErrorMessage: validatePostalCode(action.postalCode),
            };

        case GUARANTOR_STATE_ACTION:
            return {
                ...state,
                stateIndex: action.stateIndex,
                stateValue: action.stateValue,
            };

        case GUARANTOR_MARITAL_ACTION:
            return {
                ...state,
                maritalIndex: action.maritalIndex,
                maritalValue: action.maritalValue,
            };

        case GUARANTOR_EDUCATION_ACTION:
            return {
                ...state,
                educationIndex: action.educationIndex,
                educationValue: action.educationValue,
            };

        case GUARANTOR_COUNTRY_ACTION:
            return {
                ...state,
                countryIndex: action.countryIndex,
                countryValue: action.countryValue,
            };

        case GUARANTOR_RACE_ACTION:
            return {
                ...state,
                raceIndex: action.raceIndex,
                raceValue: action.raceValue,
            };

        case GUARANTOR_CITY_ACTION:
            return {
                ...state,
                city: action.city,
                cityErrorMessage: validateCity(action.city),
            };

        case GUARANTOR_EMAIL_ADDRESS_ACTION:
            return {
                ...state,
                emailAddress: action.emailAddress,
                emailAddressErrorMessage: validateEmailAddress(action.emailAddress),
            };

        case GUARANTOR_MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION:
            return {
                ...state,
                mobileNumberWithoutExtension: action.mobileNumberWithoutExtension,
                mobileNumberErrorMessage: validateMobileNumber(action.mobileNumberWithoutExtension),
            };

        case GUARANTOR_MOBILE_NUMBER_WITH_EXTENSION_ACTION:
            return {
                ...state,
                mobileNumberWithExtension: action.mobileNumberWithExtension,
            };

        case GUARANTOR_MOBILE_NUMBER_MASK_ACTION:
            return {
                ...state,
                isMobileNumberMaskingOn: action.isMobileNumberMaskingOn,
            };

        case GUARANTOR_PERSONAL_CONTINUE_BUTTON_DISABLED_ACTION:
            return {
                ...state,
                isPersonalInformationContinueButtonEnabled:
                    checkPersonalDetailsContinueButtonStatus(state, action.raceData),
            };

        case GUARANTOR_EMPLOYMENT_DEATILS_2_CONTINUE_BUTTON_DISABLED_ACTION:
            return {
                ...state,
                isEmploeymentDetails2ContinueButtonEnabled:
                    checkEmployemntDetails2ContinueButtonStatus(state),
            };

        case GUARANTOR_ADDRESS_LINE_ONE_MASK_ACTION:
            return {
                ...state,
                isAddressLineOneMaskingOn: action.isAddressLineOneMaskingOn,
            };

        case GUARANTOR_ADDRESS_LINE_TWO_MASK_ACTION:
            return {
                ...state,
                isAddressLineTwoMaskingOn: action.isAddressLineTwoMaskingOn,
            };

        case GUARANTOR_ADDRESS_LINE_THREE_MASK_ACTION:
            return {
                ...state,
                isAddressLineThreeMaskingOn: action.isAddressLineThreeMaskingOn,
            };

        case GUARANTOR_POSTAL_CODE_MASK_ACTION:
            return {
                ...state,
                isPostalCodeMaskingOn: action.isPostalCodeMaskingOn,
            };

        case GUARANTOR_EMAIL_MASK_ACTION:
            return {
                ...state,
                isEmailMaskingOn: action.isEmailMaskingOn,
            };

        case GUARANTOR_CITY_MASK_ACTION:
            return {
                ...state,
                isCityMaskingOn: action.isCityMaskingOn,
            };

        case GUARANTOR_IS_STATE_ENABLED_ACTION:
            return {
                ...state,
                isStateDropdownEnabled: action.isStateDropdownEnabled,
            };

        case GUARANTOR_RESIDENTIAL_DETAILS_CLEAR:
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
                isPersonalInformationContinueButtonEnabled: false,
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
                isStateDropdownEnabled: false,
                isEmploeymentDetails2ContinueButtonEnabled: false,
            };

        default:
            return state;
    }
}

// Check residential identity continue button status
export const checkPersonalDetailsContinueButtonStatus = (state, raceData) => {
    return raceData === ASB_NATIVE
        ? state.addressLineOne?.trim()?.length > 0 &&
              state.addressLineTwo?.trim()?.length > 0 &&
              state.postalCode?.trim()?.length > 0 &&
              state.stateValue &&
              state.maritalValue &&
              state.educationValue &&
              state.countryValue &&
              state.raceValue &&
              state.city?.trim()?.length > 0 &&
              state.emailAddress?.trim()?.length > 0 &&
              state.addressLineOneErrorMessage === null &&
              state.addressLineTwoErrorMessage === null &&
              state.addressLineThreeErrorMessage === null &&
              state.postalCodeErrorMessage === null &&
              state.cityErrorMessage === null &&
              state.mobileNumberWithoutExtension?.trim()?.length > 0 &&
              state.mobileNumberErrorMessage === null &&
              state.emailAddressErrorMessage === null
        : state.addressLineOne?.trim()?.length > 0 &&
              state.addressLineTwo?.trim()?.length > 0 &&
              state.postalCode?.trim()?.length > 0 &&
              state.stateValue &&
              state.maritalValue &&
              state.educationValue &&
              state.countryValue &&
              state.city?.trim()?.length > 0 &&
              state.emailAddress?.trim()?.length > 0 &&
              state.addressLineOneErrorMessage === null &&
              state.addressLineTwoErrorMessage === null &&
              state.addressLineThreeErrorMessage === null &&
              state.postalCodeErrorMessage === null &&
              state.cityErrorMessage === null &&
              state.mobileNumberWithoutExtension?.trim()?.length > 0 &&
              state.mobileNumberErrorMessage === null &&
              state.emailAddressErrorMessage === null;
};

export const checkEmployemntDetails2ContinueButtonStatus = (state) => {
    return (
        state.addressLineOne?.trim()?.length > 0 &&
        state.addressLineTwo?.trim()?.length > 0 &&
        state.postalCode?.trim()?.length > 0 &&
        state.stateValue &&
        state.countryValue &&
        state.city?.trim()?.length > 0 &&
        state.addressLineOneErrorMessage === null &&
        state.addressLineTwoErrorMessage === null &&
        state.addressLineThreeErrorMessage === null &&
        state.postalCodeErrorMessage === null &&
        state.cityErrorMessage === null &&
        state.mobileNumberWithoutExtension?.trim()?.length > 0 &&
        state.mobileNumberErrorMessage === null
    );
};
