import PropTypes from "prop-types";
import { connect } from "react-redux";

import { AUTHORISE_FPX_TRANSACTION_CLEAR } from "@redux/actions/services/authoriseFPXTransactionAction";
import { authoriseFPXTransaction } from "@redux/services/apiAuthoriseFPXTransaction";
import { authoriseFPXTransactionPremier } from "@redux/services/Premier/apiAuthoriseFPXTransaction";

const mapStateToProps = function (state) {
    const { authoriseFPXTransactionReducer } = state;

    return {
        statusAuthoriseFPXTransaction: authoriseFPXTransactionReducer.status,
        errorAuthoriseFPXTransaction: authoriseFPXTransactionReducer.error,
        dataAuthoriseFPXTransaction: authoriseFPXTransactionReducer.data,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        authoriseFPXTransaction: (data, callback) => {
            dispatch(authoriseFPXTransaction(data, callback));
        },
        authoriseFPXTransactionPremier: (data, callback) => {
            dispatch(authoriseFPXTransactionPremier(data, callback));
        },
        clearAuthoriseFPXTransactionReducer: () =>
            dispatch({ type: AUTHORISE_FPX_TRANSACTION_CLEAR }),
    };
};

const authoriseFPXTransactionStateTypes = (mapStateToProps.propTypes = {
    statusAuthoriseFPXTransaction: PropTypes.string,
    errorAuthoriseFPXTransaction: PropTypes.object,
    dataAuthoriseFPXTransaction: PropTypes.object,
});

const authoriseFPXTransactionDispatchTypes = (mapDispatchToProps.propTypes = {
    authoriseFPXTransaction: PropTypes.func,
    clearAuthoriseFPXTransactionReducer: PropTypes.func,
});

export const authoriseFPXTransactionServicePropTypes = {
    ...authoriseFPXTransactionStateTypes,
    ...authoriseFPXTransactionDispatchTypes,
};

const authoriseFPXTransactionServiceProps = connect(mapStateToProps, mapDispatchToProps);
export default authoriseFPXTransactionServiceProps;
