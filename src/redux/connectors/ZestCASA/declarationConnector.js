import { connect } from "react-redux";

import {
    AGREE_TO_BE_CONTACTED_ACTION,
    DECLARATION_CONTINUE_BUTTON_DISABLED_ACTION,
    DECLARATION_CLEAR,
} from "@redux/actions/ZestCASA/declarationAction";

const mapStateToProps = function (state) {
    const { zestCasaReducer } = state;
    const { declarationReducer } = zestCasaReducer;

    return {
        // Local reducer
        isAgreeToBeContacted: declarationReducer.isAgreeToBeContacted,
        privacyPolicy: declarationReducer.privacyPolicy,
        fatcaStateDeclaration: declarationReducer.fatcaStateDeclaration,
        termsAndConditions: declarationReducer.termsAndConditions,
        isDeclarationContinueButtonEnabled: declarationReducer.isDeclarationContinueButtonEnabled,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateAgreeToBeContacted: (value) =>
            dispatch({
                type: AGREE_TO_BE_CONTACTED_ACTION,
                isAgreeToBeContacted: value,
            }),
        checkButtonEnabled: () => dispatch({ type: DECLARATION_CONTINUE_BUTTON_DISABLED_ACTION }),
        clearDeclarationReducer: () => dispatch({ type: DECLARATION_CLEAR }),
    };
};

const declarationProps = connect(mapStateToProps, mapDispatchToProps);
export default declarationProps;
