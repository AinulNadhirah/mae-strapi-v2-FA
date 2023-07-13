import { connect } from "react-redux";

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

const mapStateToProps = function (state) {
    const { asbFinanceReducer } = state;
    const { personalInformationReducer } = asbFinanceReducer;

    return {
        // Local reducer
        addressLineOne: personalInformationReducer.addressLineOne,
        addressLineTwo: personalInformationReducer.addressLineTwo,
        addressLineThree: personalInformationReducer.addressLineThree,
        postalCode: personalInformationReducer.postalCode,
        stateIndex: personalInformationReducer.stateIndex,
        stateValue: personalInformationReducer.stateValue,
        maritalIndex: personalInformationReducer.maritalIndex,
        maritalValue: personalInformationReducer.maritalValue,
        educationIndex: personalInformationReducer.educationIndex,
        educationValue: personalInformationReducer.educationValue,
        countryIndex: personalInformationReducer.countryIndex,
        countryValue: personalInformationReducer.countryValue,
        city: personalInformationReducer.city,
        emailAddress: personalInformationReducer.emailAddress,
        mobileNumberWithoutExtension: personalInformationReducer.mobileNumberWithoutExtension,
        mobileNumberWithExtension: personalInformationReducer.mobileNumberWithExtension,
        raceIndex: personalInformationReducer.raceIndex,
        raceValue: personalInformationReducer.raceValue,

        stateDropdownItems: personalInformationReducer.stateDropdownItems,
        maritalDropdownItems: personalInformationReducer.maritalDropdownItems,
        educationDropdownItems: personalInformationReducer.educationDropdownItems,
        countryDropdownItems: personalInformationReducer.countryDropdownItems,
        raceDropdownItems: personalInformationReducer.raceDropdownItems,
        isResidentialContinueButtonEnabled:
            personalInformationReducer.isResidentialContinueButtonEnabled,
        isFromConfirmationScreenForResidentialDetails:
            personalInformationReducer.isFromConfirmationScreenForResidentialDetails,
        addressLineOneErrorMessage: personalInformationReducer.addressLineOneErrorMessage,
        addressLineTwoErrorMessage: personalInformationReducer.addressLineTwoErrorMessage,
        addressLineThreeErrorMessage: personalInformationReducer.addressLineThreeErrorMessage,
        postalCodeErrorMessage: personalInformationReducer.postalCodeErrorMessage,
        cityErrorMessage: personalInformationReducer.cityErrorMessage,
        emailAddressErrorMessage: personalInformationReducer.emailAddressErrorMessage,
        mobileNumberErrorMessage: personalInformationReducer.mobileNumberErrorMessage,

        isAddressLineOneMaskingOn: personalInformationReducer.isAddressLineOneMaskingOn,
        isAddressLineTwoMaskingOn: personalInformationReducer.isAddressLineTwoMaskingOn,
        isAddressLineThreeMaskingOn: personalInformationReducer.isAddressLineThreeMaskingOn,
        isMobileNumberMaskingOn: personalInformationReducer.isMobileNumberMaskingOn,
        isPostalCodeMaskingOn: personalInformationReducer.isPostalCodeMaskingOn,
        isEmailMaskingOn: personalInformationReducer.isEmailMaskingOn,
        isCityMaskingOn: personalInformationReducer.isCityMaskingOn,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getStateDropdownItems: (value) =>
            dispatch({
                type: GET_STATE_DROPDOWN_ITEMS_ACTION,
                stateDropdownItems: value,
            }),

        getMaritalDropdownItems: (value) =>
            dispatch({
                type: GET_MARITAL_DROPDOWN_ITEMS_ACTION,
                maritalDropdownItems: value,
            }),
        getEducationDropdownItems: (value) =>
            dispatch({
                type: GET_EDUCATION_DROPDOWN_ITEMS_ACTION,
                educationDropdownItems: value,
            }),
        getCountryDropdownItems: (value) =>
            dispatch({
                type: GET_COUNTRY_DROPDOWN_ITEMS_ACTION,
                countryDropdownItems: value,
            }),
        getRaceDropdownItems: (value) =>
            dispatch({
                type: GET_RACE_DROPDOWN_ITEMS_ACTION,
                raceDropdownItems: value,
            }),
        updateAddressLineOne: (value) =>
            dispatch({ type: ADDRESS_LINE_ONE_ACTION, addressLineOne: value }),
        updateAddressLineTwo: (value) =>
            dispatch({ type: ADDRESS_LINE_TWO_ACTION, addressLineTwo: value }),
        updateAddressLineThree: (value) =>
            dispatch({ type: ADDRESS_LINE_THREE_ACTION, addressLineThree: value }),
        updatePostalCode: (value) => dispatch({ type: POSTAL_CODE_ACTION, postalCode: value }),
        updateState: (index, value) =>
            dispatch({ type: STATE_ACTION, stateIndex: index, stateValue: value }),
        updateMarital: (index, value) =>
            dispatch({ type: MARITAL_ACTION, maritalIndex: index, maritalValue: value }),
        updateEducation: (index, value) =>
            dispatch({ type: EDUCATION_ACTION, educationIndex: index, educationValue: value }),
        updateCountry: (index, value) =>
            dispatch({ type: COUNTRY_ACTION, countryIndex: index, countryValue: value }),
        updateRace: (index, value) =>
            dispatch({ type: RACE_ACTION, raceIndex: index, raceValue: value }),
        updateCity: (value) => dispatch({ type: CITY_ACTION, city: value }),
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
            dispatch({ type: ADDRESS_LINE_ONE_MASK_ACTION, isAddressLineOneMaskingOn: value }),
        updateAddressLineTwoMaskFlag: (value) =>
            dispatch({ type: ADDRESS_LINE_TWO_MASK_ACTION, isAddressLineTwoMaskingOn: value }),
        updateAddressLineThreeMaskFlag: (value) =>
            dispatch({ type: ADDRESS_LINE_THREE_MASK_ACTION, isAddressLineThreeMaskingOn: value }),
        updateEmailAddress: (value) =>
            dispatch({ type: EMAIL_ADDRESS_ACTION, emailAddress: value }),
        updateMobileNumberWithoutExtension: (value) =>
            dispatch({
                type: MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
                mobileNumberWithoutExtension: value,
            }),
        updateMobileNumberWithExtension: (value) =>
            dispatch({
                type: MOBILE_NUMBER_WITH_EXTENSION_ACTION,
                mobileNumberWithExtension: value,
            }),
        updateMobileNumberMaskFlag: (value) =>
            dispatch({ type: MOBILE_NUMBER_MASK_ACTION, isMobileNumberMaskingOn: value }),
        updatePostalCodeMaskFlag: (value) =>
            dispatch({ type: POSTAL_CODE_MASK_ACTION, isPostalCodeMaskingOn: value }),
        updateEmailMaskFlag: (value) =>
            dispatch({ type: EMAIL_MASK_ACTION, isEmailMaskingOn: value }),
        updateCityMaskFlag: (value) => dispatch({ type: CITY_MASK_ACTION, isCityMaskingOn: value }),
        clearResidentialReducer: () => dispatch({ type: RESIDENTIAL_DETAILS_CLEAR }),
    };
};

const personalInformationProps = connect(mapStateToProps, mapDispatchToProps);
export default personalInformationProps;
