import { connect } from "react-redux";

import {
    SELECT_FPX_BANK_ACTION,
    SELECT_FPX_BANK_CLEAR,
} from "@redux/actions/ZestCASA/selectFPXBankAction";

const mapStateToProps = function (state) {
    const { zestCasaReducer } = state;
    const { selectFPXBankReducer } = zestCasaReducer;

    return {
        // Local reducer
        bankDetails: selectFPXBankReducer.bankDetails,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateFBXBank: (value) =>
            dispatch({
                type: SELECT_FPX_BANK_ACTION,
                bankDetails: value,
            }),
        clearSelectFPXBankReducer: () => dispatch({ type: SELECT_FPX_BANK_CLEAR }),
    };
};

const selectFPXBankProps = connect(mapStateToProps, mapDispatchToProps);
export default selectFPXBankProps;
