import { connect } from "react-redux";

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

const mapStateToProps = function (state) {
    const { zestCasaReducer } = state;
    const { personalDetailsReducer } = zestCasaReducer;

    return {
        // Local reducer
        titleIndex: personalDetailsReducer.titleIndex,
        titleValue: personalDetailsReducer.titleValue,
        gender: personalDetailsReducer.gender,
        raceIndex: personalDetailsReducer.raceIndex,
        raceValue: personalDetailsReducer.raceValue,
        mobileNumberWithoutExtension: personalDetailsReducer.mobileNumberWithoutExtension,
        mobileNumberWithExtension: personalDetailsReducer.mobileNumberWithExtension,
        isMobileNumberMaskingOn: personalDetailsReducer.isMobileNumberMaskingOn,
        emailAddress: personalDetailsReducer.emailAddress,
        politicalExposure: personalDetailsReducer.politicalExposure,
        titleDropdownItems: personalDetailsReducer.titleDropdownItems,
        raceDropdownItems: personalDetailsReducer.raceDropdownItems,
        mobileNumberErrorMessage: personalDetailsReducer.mobileNumberErrorMessage,
        emailAddressErrorMessage: personalDetailsReducer.emailAddressErrorMessage,
        isPersonalContinueButtonEnabled: personalDetailsReducer.isPersonalContinueButtonEnabled,
        isFromConfirmationScreenForPersonalDetails:
            personalDetailsReducer.isFromConfirmationScreenForPersonalDetails,
        isEmailMaskingOn: personalDetailsReducer.isEmailMaskingOn,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getTitleDropdownItems: (value) =>
            dispatch({
                type: GET_TITLE_DROPDOWN_ITEMS_ACTION,
                titleDropdownItems: value,
            }),
        getRaceDropdownItems: (value) =>
            dispatch({
                type: GET_RACE_DROPDOWN_ITEMS_ACTION,
                raceDropdownItems: value,
            }),
        updateTitle: (index, value) =>
            dispatch({ type: TITLE_ACTION, titleIndex: index, titleValue: value }),
        updateGender: (gender, genderValue) =>
            dispatch({ type: GENDER_ACTION, gender: gender, genderValue: genderValue }),
        updateRace: (index, value) =>
            dispatch({ type: RACE_ACTION, raceIndex: index, raceValue: value }),
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
        updateEmailAddress: (value) =>
            dispatch({ type: EMAIL_ADDRESS_ACTION, emailAddress: value }),
        updateEmailMaskFlag: (value) =>
            dispatch({ type: EMAIL_MASK_ACTION, isEmailMaskingOn: value }),
        updatePoliticalExposure: (value) =>
            dispatch({ type: POLITICAL_EXPOSURE_ACTION, politicalExposure: value }),
        updateConfirmationScreenStatusForPersonalDetails: (value) =>
            dispatch({
                type: PERSONAL_DETAILS_CONFIRMATION_ACTION,
                isFromConfirmationScreenForPersonalDetails: value,
            }),
        checkButtonEnabled: () => dispatch({ type: PERSONAL_CONTINUE_BUTTON_DISABLED_ACTION }),
        clearPersonalReducer: () => dispatch({ type: PERSONAL_DETAILS_CLEAR }),
    };
};

const personalDetailsProps = connect(mapStateToProps, mapDispatchToProps);
export default personalDetailsProps;
