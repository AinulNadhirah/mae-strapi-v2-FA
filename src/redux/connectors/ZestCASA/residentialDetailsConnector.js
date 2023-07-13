import { connect } from "react-redux";

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

const mapStateToProps = function (state) {
    const { zestCasaReducer } = state;
    const { residentialDetailsReducer } = zestCasaReducer;

    return {
        // Local reducer
        addressLineOne: residentialDetailsReducer.addressLineOne,
        addressLineTwo: residentialDetailsReducer.addressLineTwo,
        addressLineThree: residentialDetailsReducer.addressLineThree,
        postalCode: residentialDetailsReducer.postalCode,
        stateIndex: residentialDetailsReducer.stateIndex,
        stateValue: residentialDetailsReducer.stateValue,
        city: residentialDetailsReducer.city,

        stateDropdownItems: residentialDetailsReducer.stateDropdownItems,
        isResidentialContinueButtonEnabled:
            residentialDetailsReducer.isResidentialContinueButtonEnabled,
        isFromConfirmationScreenForResidentialDetails:
            residentialDetailsReducer.isFromConfirmationScreenForResidentialDetails,
        addressLineOneErrorMessage: residentialDetailsReducer.addressLineOneErrorMessage,
        addressLineTwoErrorMessage: residentialDetailsReducer.addressLineTwoErrorMessage,
        addressLineThreeErrorMessage: residentialDetailsReducer.addressLineThreeErrorMessage,
        postalCodeErrorMessage: residentialDetailsReducer.postalCodeErrorMessage,
        cityErrorMessage: residentialDetailsReducer.cityErrorMessage,

        isAddressLineOneMaskingOn: residentialDetailsReducer.isAddressLineOneMaskingOn,
        isAddressLineTwoMaskingOn: residentialDetailsReducer.isAddressLineTwoMaskingOn,
        isAddressLineThreeMaskingOn: residentialDetailsReducer.isAddressLineThreeMaskingOn,
        isCityMaskingOn: residentialDetailsReducer.isCityMaskingOn,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getStateDropdownItems: (value) =>
            dispatch({
                type: GET_STATE_DROPDOWN_ITEMS_ACTION,
                stateDropdownItems: value,
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
        updateCity: (value) => dispatch({ type: CITY_ACTION, city: value }),
        updateConfirmationScreenStatusForResidentialDetails: (value) =>
            dispatch({
                type: RESIDENTIAL_DETAILS_CONFIRMATION_ACTION,
                isFromConfirmationScreenForResidentialDetails: value,
            }),
        checkButtonEnabled: (
            userStatus,
            mobileNumber,
            mobileNumberErrorMessage,
            emailAddress,
            emailAddressErrorMessage
        ) =>
            dispatch({
                type: RESIDENTIAL_CONTINUE_BUTTON_DISABLED_ACTION,
                userStatus,
                mobileNumber,
                mobileNumberErrorMessage,
                emailAddress,
                emailAddressErrorMessage,
            }),
        updateAddressLineOneMaskFlag: (value) =>
            dispatch({ type: ADDRESS_LINE_ONE_MASK_ACTION, isAddressLineOneMaskingOn: value }),
        updateAddressLineTwoMaskFlag: (value) =>
            dispatch({ type: ADDRESS_LINE_TWO_MASK_ACTION, isAddressLineTwoMaskingOn: value }),
        updateAddressLineThreeMaskFlag: (value) =>
            dispatch({ type: ADDRESS_LINE_THREE_MASK_ACTION, isAddressLineThreeMaskingOn: value }),
        updateCityMaskFlag: (value) =>
            dispatch({
                type: CITY_MASK_ACTION,
                isCityMaskingOn: value,
            }),
        clearResidentialReducer: () => dispatch({ type: RESIDENTIAL_DETAILS_CLEAR }),
    };
};

const residentialDetailsProps = connect(mapStateToProps, mapDispatchToProps);
export default residentialDetailsProps;
