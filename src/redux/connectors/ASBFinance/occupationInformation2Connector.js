import { connect } from "react-redux";

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
    EMPLOYMENT_CITY_MASK_ACTION,
    EMPLOYMENT_POSTAL_CODE_MASK_ACTION,
} from "@redux/actions/ASBFinance/occupationInformation2Action";

const mapStateToProps = function (state) {
    const { asbFinanceReducer } = state;
    const { occupationInformation2Reducer } = asbFinanceReducer;

    return {
        // Local reducer
        addressLineOne: occupationInformation2Reducer.addressLineOne,
        addressLineTwo: occupationInformation2Reducer.addressLineTwo,
        addressLineThree: occupationInformation2Reducer.addressLineThree,
        postalCode: occupationInformation2Reducer.postalCode,
        stateIndex: occupationInformation2Reducer.stateIndex,
        stateValue: occupationInformation2Reducer.stateValue,
        countryIndex: occupationInformation2Reducer.countryIndex,
        countryValue: occupationInformation2Reducer.countryValue,
        city: occupationInformation2Reducer.city,
        mobileNumberWithoutExtension: occupationInformation2Reducer.mobileNumberWithoutExtension,
        mobileNumberWithExtension: occupationInformation2Reducer.mobileNumberWithExtension,

        stateDropdownItems: occupationInformation2Reducer.stateDropdownItems,
        countryDropdownItems: occupationInformation2Reducer.countryDropdownItems,
        isResidentialContinueButtonEnabled:
            occupationInformation2Reducer.isResidentialContinueButtonEnabled,
        isFromConfirmationScreenForResidentialDetails:
            occupationInformation2Reducer.isFromConfirmationScreenForResidentialDetails,
        addressLineOneErrorMessage: occupationInformation2Reducer.addressLineOneErrorMessage,
        addressLineTwoErrorMessage: occupationInformation2Reducer.addressLineTwoErrorMessage,
        addressLineThreeErrorMessage: occupationInformation2Reducer.addressLineThreeErrorMessage,
        postalCodeErrorMessage: occupationInformation2Reducer.postalCodeErrorMessage,
        cityErrorMessage: occupationInformation2Reducer.cityErrorMessage,
        mobileNumberErrorMessage: occupationInformation2Reducer.mobileNumberErrorMessage,

        isAddressLineOneMaskingOn: occupationInformation2Reducer.isAddressLineOneMaskingOn,
        isAddressLineTwoMaskingOn: occupationInformation2Reducer.isAddressLineTwoMaskingOn,
        isAddressLineThreeMaskingOn: occupationInformation2Reducer.isAddressLineThreeMaskingOn,
        isMobileNumberMaskingOn: occupationInformation2Reducer.isMobileNumberMaskingOn,
        isPostalCodeMaskingOn: occupationInformation2Reducer.isPostalCodeMaskingOn,
        isCityMaskingOn: occupationInformation2Reducer.isCityMaskingOn,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getStateDropdownItems: (value) =>
            dispatch({
                type: GET_STATE_DROPDOWN_ITEMS_ACTION,
                stateDropdownItems: value,
            }),

        getCountryDropdownItems: (value) =>
            dispatch({
                type: GET_COUNTRY_DROPDOWN_ITEMS_ACTION,
                countryDropdownItems: value,
            }),
        updateAddressLineOne: (value) =>
            dispatch({ type: EMPLOYMENT_ADDRESS_LINE_ONE_ACTION, addressLineOne: value }),
        updateAddressLineTwo: (value) =>
            dispatch({ type: EMPLOYMENT_ADDRESS_LINE_TWO_ACTION, addressLineTwo: value }),
        updateAddressLineThree: (value) =>
            dispatch({ type: EMPLOYMENT_ADDRESS_LINE_THREE_ACTION, addressLineThree: value }),
        updatePostalCode: (value) =>
            dispatch({ type: EMPLOYMENT_POSTAL_CODE_ACTION, postalCode: value }),
        updateState: (index, value) =>
            dispatch({ type: EMPLOYMENT_STATE_ACTION, stateIndex: index, stateValue: value }),

        updateCountry: (index, value) =>
            dispatch({ type: EMPLOYMENT_COUNTRY_ACTION, countryIndex: index, countryValue: value }),
        updateCity: (value) => dispatch({ type: EMPLOYMENT_CITY_ACTION, city: value }),
        updateConfirmationScreenStatusForResidentialDetails: (value) =>
            dispatch({
                type: RESIDENTIAL_DETAILS_CONFIRMATION_ACTION,
                isFromConfirmationScreenForResidentialDetails: value,
            }),
        checkButtonEnabled: (userStatus, mobileNumber, mobileNumberErrorMessage) =>
            dispatch({
                type: RESIDENTIAL_CONTINUE_BUTTON_DISABLED_ACTION,
                userStatus: userStatus,
                mobileNumber: mobileNumber,
                mobileNumberErrorMessage: mobileNumberErrorMessage,
            }),
        updateAddressLineOneMaskFlag: (value) =>
            dispatch({
                type: EMPLOYMENT_ADDRESS_LINE_ONE_MASK_ACTION,
                isAddressLineOneMaskingOn: value,
            }),
        updateAddressLineTwoMaskFlag: (value) =>
            dispatch({
                type: EMPLOYMENT_ADDRESS_LINE_TWO_MASK_ACTION,
                isAddressLineTwoMaskingOn: value,
            }),
        updateAddressLineThreeMaskFlag: (value) =>
            dispatch({
                type: EMPLOYMENT_ADDRESS_LINE_THREE_MASK_ACTION,
                isAddressLineThreeMaskingOn: value,
            }),
        updateMobileNumberWithoutExtension: (value) =>
            dispatch({
                type: EMPLOYMENT_MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
                mobileNumberWithoutExtension: value,
            }),
        updateMobileNumberWithExtension: (value) =>
            dispatch({
                type: EMPLOYMENT_MOBILE_NUMBER_WITH_EXTENSION_ACTION,
                mobileNumberWithExtension: value,
            }),
        updateMobileNumberMaskFlag: (value) =>
            dispatch({
                type: EMPLOYMENT_MOBILE_NUMBER_MASK_ACTION,
                isMobileNumberMaskingOn: value,
            }),
        updatePostalCodeMaskFlag: (value) =>
            dispatch({
                type: EMPLOYMENT_POSTAL_CODE_MASK_ACTION,
                isPostalCodeMaskingOn: value,
            }),
        updateCityMaskFlag: (value) =>
            dispatch({
                type: EMPLOYMENT_CITY_MASK_ACTION,
                isCityMaskingOn: value,
            }),
        clearResidentialReducer: () => dispatch({ type: RESIDENTIAL_DETAILS_CLEAR }),
    };
};

const occupationInformation2Props = connect(mapStateToProps, mapDispatchToProps);
export default occupationInformation2Props;
