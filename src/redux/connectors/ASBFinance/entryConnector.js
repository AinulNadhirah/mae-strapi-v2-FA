import { connect } from "react-redux";

import { IS_ASB_FINANCE_ACTION, ENTRY_CLEAR } from "@redux/actions/ASBFinance/entryAction";

const mapStateToProps = function (state) {
    // console.log("[ASB Finance] -> [Entry Connector state", state);
    const { asbFinanceReducer } = state;
    const { entryReducer } = asbFinanceReducer;

    return {
        // Local reducer
        //isAsb: entryReducer.isAsb,
        isAsb: entryReducer,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateIsAsb: (value) => dispatch({ type: IS_ASB_FINANCE_ACTION, isAsb: value }),
        clearEntryReducer: () => dispatch({ type: ENTRY_CLEAR }),
    };
};

const entryProps = connect(mapStateToProps, mapDispatchToProps);
export default entryProps;
