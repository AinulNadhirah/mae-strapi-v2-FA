import PropTypes from "prop-types";
import { connect } from "react-redux";

import { GET_BANK_LIST_CLEAR } from "@redux/actions/services/getBankListAction";
import { fetchBankList } from "@redux/services/apiGetBankList";

const mapStateToProps = function (state) {
    const { getBankListReducer } = state;

    return {
        statusGetBankList: getBankListReducer.status,
        errorGetBankList: getBankListReducer.error,
        dataGetBankList: getBankListReducer.data,
        cardDetails: getBankListReducer.cardDetails,
        bankDetails: getBankListReducer.bankDetails,
        applicantType: getBankListReducer.applicantType,
        m2uInd: getBankListReducer.m2uInd,
        fpxBuyerEmail: getBankListReducer.fpxBuyerEmail,
        bpgFlag: getBankListReducer.bpgFlag,
        customerType: getBankListReducer.customerType,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getBankList: (data, callback) => {
            dispatch(fetchBankList(data, callback));
        },
        clearGetBankListReducer: () => dispatch({ type: GET_BANK_LIST_CLEAR }),
    };
};

const getBankListStateTypes = (mapStateToProps.propTypes = {
    statusGetBankList: PropTypes.string,
    errorGetBankList: PropTypes.string,
    dataGetBankList: PropTypes.object,
    cardDetails: PropTypes.array,
    bankDetails: PropTypes.array,
    applicantType: PropTypes.string,
    m2uInd: PropTypes.string,
    fpxBuyerEmail: PropTypes.string,
    bpgFlag: PropTypes.string,
    customerType: PropTypes.string,
});

const getBankListDispatchTypes = (mapDispatchToProps.propTypes = {
    getBankList: PropTypes.func,
    clearGetBankListReducer: PropTypes.func,
});

export const getBankListServicePropTypes = {
    ...getBankListStateTypes,
    ...getBankListDispatchTypes,
};

const getBankListServiceProps = connect(mapStateToProps, mapDispatchToProps);
export default getBankListServiceProps;
