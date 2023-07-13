import { connect } from "react-redux";

import {
    ID_TYPE_ACTION,
    ID_NUMBER_ACTION,
    FULL_NAME_ACTION,
    PASSPORT_EXPIRY_DATE_ACTION,
    DATE_OF_BIRTH_ACTION,
    NATIONALITY_ACTION,
    GET_NATIONALITY_DROPDOWN_ITEMS_ACTION,
    IDENTITY_CONTINUE_BUTTON_DISABLED_ACTION,
    IDENTITY_DETAILS_CLEAR,
    PASSPORT_NUMBER_ACTION,
} from "@redux/actions/ZestCASA/identityDetailsAction";

const mapStateToProps = function (state) {
    const { zestCasaReducer } = state;
    const { identityDetailsReducer } = zestCasaReducer;

    return {
        // Local reducer
        identityType: identityDetailsReducer.identityType,
        identityNumber: identityDetailsReducer.identityNumber,
        fullName: identityDetailsReducer.fullName,
        passportExpiryDate: identityDetailsReducer.passportExpiryDate,
        dateOfBirth: identityDetailsReducer.dateOfBirth,
        nationalityIndex: identityDetailsReducer.nationalityIndex,
        nationalityValue: identityDetailsReducer.nationalityValue,
        identityNumberErrorMessage: identityDetailsReducer.identityNumberErrorMessage,
        fullNameErrorMessage: identityDetailsReducer.fullNameErrorMessage,
        isIdentityContinueButtonEnabled: identityDetailsReducer.isIdentityContinueButtonEnabled,
        nationalityDropdownItems: identityDetailsReducer.nationalityDropdownItems,
        passportNumber: identityDetailsReducer.passportNumber,
        isValidPassportError: identityDetailsReducer.isValidPassportError,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getNationalityDropdownItems: (value) =>
            dispatch({
                type: GET_NATIONALITY_DROPDOWN_ITEMS_ACTION,
                nationalityDropdownItems: value,
            }),
        updateIdentityType: (value) => dispatch({ type: ID_TYPE_ACTION, identityType: value }),
        updatePassportNumber: (value) =>
            dispatch({ type: PASSPORT_NUMBER_ACTION, passportNumber: value }),

        updateIdentityNumber: (idValue, isZest) =>
            dispatch({ type: ID_NUMBER_ACTION, identityNumber: idValue, isZest: isZest }),
        updateFullName: (value) => dispatch({ type: FULL_NAME_ACTION, fullName: value }),
        updatePassportExpiryDate: (value, passportExpiryDateObject) =>
            dispatch({
                type: PASSPORT_EXPIRY_DATE_ACTION,
                passportExpiryDate: value,
                passportExpiryDateObject: passportExpiryDateObject,
            }),
        updateDateOfBirth: (value, dateOfBirthDateObject) =>
            dispatch({
                type: DATE_OF_BIRTH_ACTION,
                dateOfBirth: value,
                dateOfBirthDateObject: dateOfBirthDateObject,
            }),
        updateNationality: (index, value) =>
            dispatch({
                type: NATIONALITY_ACTION,
                nationalityIndex: index,
                nationalityValue: value,
            }),
        checkButtonEnable: () => dispatch({ type: IDENTITY_CONTINUE_BUTTON_DISABLED_ACTION }),
        clearIdentityReducer: () => dispatch({ type: IDENTITY_DETAILS_CLEAR }),
    };
};

const identityDetailsProps = connect(mapStateToProps, mapDispatchToProps);
export default identityDetailsProps;
