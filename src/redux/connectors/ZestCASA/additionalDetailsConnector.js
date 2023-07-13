import { connect } from "react-redux";

import {
    PRIMARY_INCOME_ACTION,
    PRIMARY_WEALTH_ACTION,
    ADDITIONAL_DETAILS_CONTINUE_BUTTON_DISABLED_ACTION,
    ADDITIONAL_DETAILS_CLEAR,
    ADDITIONAL_DETAILS_CONFIRMATION_ACTION,
} from "@redux/actions/ZestCASA/additionalDetailsAction";

const mapStateToProps = function (state) {
    const { zestCasaReducer } = state;
    const { additionalDetailsReducer } = zestCasaReducer;

    return {
        // Local reducer
        primaryIncomeIndex: additionalDetailsReducer.primaryIncomeIndex,
        primaryIncomeValue: additionalDetailsReducer.primaryIncomeValue,
        primaryWealthIndex: additionalDetailsReducer.primaryWealthIndex,
        primaryWealthValue: additionalDetailsReducer.primaryWealthValue,
        isFromConfirmationScreenForAdditionalDetails:
            additionalDetailsReducer.isFromConfirmationScreenForAdditionalDetails,
        isAdditionalDetailsContinueButtonEnabled:
            additionalDetailsReducer.isAdditionalDetailsContinueButtonEnabled,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updatePrimaryIncome: (index, value) =>
            dispatch({
                type: PRIMARY_INCOME_ACTION,
                primaryIncomeIndex: index,
                primaryIncomeValue: value,
            }),
        updatePrimaryWealth: (index, value) =>
            dispatch({
                type: PRIMARY_WEALTH_ACTION,
                primaryWealthIndex: index,
                primaryWealthValue: value,
            }),
        updateConfirmationScreenStatusForAdditionalDetails: (value) =>
            dispatch({
                type: ADDITIONAL_DETAILS_CONFIRMATION_ACTION,
                isFromConfirmationScreenForAdditionalDetails: value,
            }),
        checkButtonEnabled: () =>
            dispatch({ type: ADDITIONAL_DETAILS_CONTINUE_BUTTON_DISABLED_ACTION }),
        clearAdditionalDetailsReducer: () => dispatch({ type: ADDITIONAL_DETAILS_CLEAR }),
    };
};

const additionalDetailsProps = connect(mapStateToProps, mapDispatchToProps);
export default additionalDetailsProps;
