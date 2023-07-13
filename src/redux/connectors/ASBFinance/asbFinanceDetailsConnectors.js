import { connect } from "react-redux";

import {
    UPDATE_APPLICATION_FINANCE_DETAILS,
    GET_APPLICATION_FINANCE_DETAILS,
} from "@redux/actions/ASBFinance/asbFinanceDetailsAction";

const mapStateToProps = function (state) {
    const { asbFinanceReducer } = state;
    const { asbFinanceDetailsReducer } = asbFinanceReducer;

    return {
        // Local reducer
        applicationFinanceDetails: asbFinanceDetailsReducer.applicationFinanceDetails,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getApplicationDetails: () =>
            dispatch({
                type: GET_APPLICATION_FINANCE_DETAILS,
            }),

        updateApplicationDetails: (value) =>
            dispatch({
                type: UPDATE_APPLICATION_FINANCE_DETAILS,
                applicationFinanceDetails: value,
            }),
    };
};

const applicationDetailsProps = connect(mapStateToProps, mapDispatchToProps);
export default applicationDetailsProps;
