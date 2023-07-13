import PropTypes from "prop-types";
import { connect } from "react-redux";

import { GET_ACCOUNT_LIST_CLEAR } from "@redux/actions/services/getAccountListAction";
import { fetchAccountList } from "@redux/services/apiGetAccountList";

const mapStateToProps = function (state) {
    const { getAccountListReducer } = state;

    return {
        statusGetAccountList: getAccountListReducer.status,
        errorGetAccountList: getAccountListReducer.error,
        dataGetAccountList: getAccountListReducer.data,
        total: getAccountListReducer.total,
        totalMfca: getAccountListReducer.totalMfca,
        name: getAccountListReducer.name,
        maeAvailable: getAccountListReducer.maeAvailable,
        jointAccAvailable: getAccountListReducer.jointAccAvailable,
        productGroupings: getAccountListReducer.productGroupings,
        accountListings: getAccountListReducer.accountListings,
        zestAccountListings: getAccountListReducer.accountListings,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getAccountList: (data, callback) => {
            dispatch(fetchAccountList(data, callback));
        },
        clearGetAccountListReducer: () => dispatch({ type: GET_ACCOUNT_LIST_CLEAR }),
    };
};

const getAccountListStateTypes = (mapStateToProps.propTypes = {
    statusGetAccountList: PropTypes.string,
    errorGetAccountList: PropTypes.object,
    dataGetAccountList: PropTypes.object,
    total: PropTypes.string,
    totalMfca: PropTypes.string,
    name: PropTypes.string,
    maeAvailable: PropTypes.string,
    jointAccAvailable: PropTypes.string,
    productGroupings: PropTypes.string,
    accountListings: PropTypes.string,
    zestAccountListings: PropTypes.array,
});

const getAccountListDispatchTypes = (mapDispatchToProps.propTypes = {
    getAccountList: PropTypes.func,
    clearGetAccountListReducer: PropTypes.func,
});

export const getAccountListServicePropTypes = {
    ...getAccountListStateTypes,
    ...getAccountListDispatchTypes,
};

const getAccountListServiceProps = connect(mapStateToProps, mapDispatchToProps);
export default getAccountListServiceProps;
