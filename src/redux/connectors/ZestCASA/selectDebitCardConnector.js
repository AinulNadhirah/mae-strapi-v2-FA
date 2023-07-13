import { connect } from "react-redux";

import {
    SELECT_DEBIT_CARD_ACTION,
    SELECT_DEBIT_CARD_CONTINUE_BUTTON_DISABLED_ACTION,
    SELECT_DEBIT_CARD_CLEAR,
} from "@redux/actions/ZestCASA/selectDebitCardAction";

const mapStateToProps = function (state) {
    const { zestCasaReducer } = state;
    const { selectDebitCardReducer } = zestCasaReducer;

    return {
        // Local reducer
        debitCardIndex: selectDebitCardReducer.debitCardIndex,
        debitCardValue: selectDebitCardReducer.debitCardValue,
        isSelectDebitCardContinueButtonEnabled:
            selectDebitCardReducer.isSelectDebitCardContinueButtonEnabled,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateDebitCard: (index, value) =>
            dispatch({
                type: SELECT_DEBIT_CARD_ACTION,
                debitCardIndex: index,
                debitCardValue: value,
            }),
        checkButtonEnabled: () =>
            dispatch({ type: SELECT_DEBIT_CARD_CONTINUE_BUTTON_DISABLED_ACTION }),
        clearSelectDebitCardReducer: () => dispatch({ type: SELECT_DEBIT_CARD_CLEAR }),
    };
};

const selectDebitCardProps = connect(mapStateToProps, mapDispatchToProps);
export default selectDebitCardProps;
