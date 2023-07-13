import {
    validatAddressDebitCard,
    validateCity,
    validatePostalCode,
} from "@screens/ZestCASA/ZestCASAValidation";

import {
    DEBIT_CARD_ADDRESS_LINE_ONE_ACTION,
    DEBIT_CARD_ADDRESS_LINE_TWO_ACTION,
    DEBIT_CARD_ADDRESS_LINE_THREE_ACTION,
    DEBIT_CARD_POSTAL_CODE_ACTION,
    DEBIT_CARD_STATE_ACTION,
    DEBIT_CARD_CITY_ACTION,
    DEBIT_CARD_GET_STATE_DROPDOWN_ITEMS_ACTION,
    DEBIT_CARD_RESIDENTIAL_DETAILS_CLEAR,
    DEBIT_CARD_ADDRESS_LINE_ONE_MASK_ACTION,
    DEBIT_CARD_ADDRESS_LINE_TWO_MASK_ACTION,
    DEBIT_CARD_TERMS_CONDITION,
    DEBIT_CARD_RESIDENTIAL_CONTINUE_BUTTON_DISABLED_ACTION,
} from "@redux/actions/ZestCASA/debitCardResidentialDetailsAction";

const initialState = {
    addressLineOne: null,
    addressLineTwo: null,
    addressLineThree: null,
    postalCode: null,
    stateIndex: null,
    stateValue: null,
    city: null,

    stateDropdownItems: [],
    addressLineOneErrorMessage: null,
    addressLineTwoErrorMessage: null,
    postalCodeErrorMessage: null,
    cityErrorMessage: null,

    isAddressLineOneMaskingOn: false,
    isAddressLineTwoMaskingOn: false,
    isTermsConditionAgree: false,
    isDebitCardResidentialContinueButtonEnabled: false,
};

// Personal details reducer
export default function debitCardresidentialDetailsReducer(state = initialState, action) {
    switch (action.type) {
        case DEBIT_CARD_GET_STATE_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                stateDropdownItems: action.stateDropdownItems,
            };

        case DEBIT_CARD_ADDRESS_LINE_ONE_ACTION:
            return {
                ...state,
                addressLineOne: action.addressLineOne,
                addressLineOneErrorMessage: validatAddressDebitCard(action.addressLineOne),
            };

        case DEBIT_CARD_ADDRESS_LINE_TWO_ACTION:
            return {
                ...state,
                addressLineTwo: action.addressLineTwo,
                addressLineTwoErrorMessage: validatAddressDebitCard(action.addressLineTwo),
            };

        case DEBIT_CARD_ADDRESS_LINE_THREE_ACTION:
            return {
                ...state,
                addressLineThree: action.addressLineTwo,
            };

        case DEBIT_CARD_POSTAL_CODE_ACTION:
            return {
                ...state,
                postalCode: action.postalCode,
                postalCodeErrorMessage: validatePostalCode(action.postalCode),
            };

        case DEBIT_CARD_STATE_ACTION:
            return {
                ...state,
                stateIndex: action.stateIndex,
                stateValue: action.stateValue,
            };

        case DEBIT_CARD_CITY_ACTION:
            return {
                ...state,
                city: action.city,
                cityErrorMessage: validateCity(action.city),
            };

        case DEBIT_CARD_RESIDENTIAL_CONTINUE_BUTTON_DISABLED_ACTION:
            console.log(checkDebitCardResidentialDetailsContinueButtonStatus(state));
            return {
                ...state,
                isDebitCardResidentialContinueButtonEnabled:
                    checkDebitCardResidentialDetailsContinueButtonStatus(state),
            };

        case DEBIT_CARD_ADDRESS_LINE_ONE_MASK_ACTION:
            return {
                ...state,
                isAddressLineOneMaskingOn: action.isAddressLineOneMaskingOn,
            };

        case DEBIT_CARD_ADDRESS_LINE_TWO_MASK_ACTION:
            return {
                ...state,
                isAddressLineTwoMaskingOn: action.isAddressLineTwoMaskingOn,
            };

        case DEBIT_CARD_TERMS_CONDITION:
            return {
                ...state,
                isTermsConditionAgree: action.isTermsConditionAgree,
            };

        case DEBIT_CARD_RESIDENTIAL_DETAILS_CLEAR:
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
                addressLineOneErrorMessage: null,
                addressLineTwoErrorMessage: null,
                postalCodeErrorMessage: null,
                cityErrorMessage: null,

                isAddressLineOneMaskingOn: false,
                isAddressLineTwoMaskingOn: false,
                isDebitCardResidentialContinueButtonEnabled: false,
                isTermsConditionAgree: false,
            };

        default:
            return state;
    }
}

// Check residential identity continue button status
export const checkDebitCardResidentialDetailsContinueButtonStatus = (state) => {
    console.log(state.addressLineOne);
    console.log(state.addressLineTwo);
    console.log(state.postalCode);
    console.log(state.stateIndex);
    console.log(state.city);
    console.log(state.addressLineOneErrorMessage);
    console.log(state.addressLineTwoErrorMessage);
    console.log(state.postalCodeErrorMessage);
    console.log(state.cityErrorMessage);
    console.log(state.isTermsConditionAgree);

    return (
        state.addressLineOne &&
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
        state.postalCodeErrorMessage === null &&
        state.cityErrorMessage === null &&
        state.isTermsConditionAgree
    );
};
