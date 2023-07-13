import PropTypes from "prop-types";
import { connect } from "react-redux";

import { ACTIVATE_ACCOUNT_CLEAR } from "@redux/actions/services/activateAccountAction";
import { activateAccount } from "@redux/services/apiActivateAccount";

const mapStateToProps = function (state) {
    const { activateAccountReducer } = state;

    return {
        statusActivateAccount: activateAccountReducer.status,
        errorActivateAccount: activateAccountReducer.error,
        dataActivateAccount: activateAccountReducer.data,
        bodyActivateAccount: activateAccountReducer.body,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        activateAccount: (data, callback) => {
            dispatch(activateAccount(data, callback));
        },
        clearActivateAccountReducer: () => dispatch({ type: ACTIVATE_ACCOUNT_CLEAR }),
    };
};

const activateAccountStateTypes = (mapStateToProps.propTypes = {
    statusActivateAccount: PropTypes.string,
    errorActivateAccount: PropTypes.object,
    dataActivateAccount: PropTypes.object,
    bodyActivateAccount: PropTypes.object,
});

const activateAccountDispatchTypes = (mapDispatchToProps.propTypes = {
    activateAccount: PropTypes.func,
    clearActivateAccountReducer: PropTypes.func,
});

export const activateAccountServicePropTypes = {
    ...activateAccountStateTypes,
    ...activateAccountDispatchTypes,
};

const activateAccountServiceProps = connect(mapStateToProps, mapDispatchToProps);
export default activateAccountServiceProps;
