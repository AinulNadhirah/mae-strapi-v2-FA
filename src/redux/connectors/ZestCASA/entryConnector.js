import { connect } from "react-redux";

import {
    IS_ZEST_ACTION,
    IS_PM1_ACTION,
    IS_PMA_ACTION,
    ENTRY_CLEAR,
    IS_KAWANKU_SAVINGS_ACTION,
    IS_KAWANKU_SAVINGS_I_ACTION,
} from "@redux/actions/ZestCASA/entryAction";

const mapStateToProps = function (state) {
    const { zestCasaReducer } = state;
    const { entryReducer } = zestCasaReducer;

    return {
        // Local reducer
        isZest: entryReducer.isZest,
        isPM1: entryReducer.isPM1,
        isPMA: entryReducer.isPMA,
        isKawanku: entryReducer.isKawanku,
        isKawankuSavingsI: entryReducer.isKawankuSavingsI,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateIsZest: (value) => dispatch({ type: IS_ZEST_ACTION, isZest: value }),
        updateIsPM1: (value) => dispatch({ type: IS_PM1_ACTION, isPM1: value }),
        updateIsPMA: (value) => dispatch({ type: IS_PMA_ACTION, isPMA: value }),
        clearEntryReducer: () => dispatch({ type: ENTRY_CLEAR }),
        updateIsKawanku: (value) => dispatch({ type: IS_KAWANKU_SAVINGS_ACTION, isKawanku: value }),
        updateIsKawankuSavingsI: (value) =>
            dispatch({ type: IS_KAWANKU_SAVINGS_I_ACTION, isKawankuSavingsI: value }),
    };
};

const entryProps = connect(mapStateToProps, mapDispatchToProps);
export default entryProps;
