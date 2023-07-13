import { connect } from "react-redux";

import { DRAFT_USER_ACCOUNT_INQUIRY_CLEAR } from "@redux/actions/services/draftUserAccountInquiryAction";
import { draftUserAccountInquiry } from "@redux/services/apiDraftUserAccountInquiry";
import { draftUserAccountInquiryPremier } from "@redux/services/Premier/apiDraftUserAccountInquiry";

const mapStateToProps = function (state) {
    const { draftUserAccountInquiryReducer } = state;

    return {
        hasDebitCard: draftUserAccountInquiryReducer?.hasDebitCard,
        custStatus: draftUserAccountInquiryReducer?.custStatus,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        draftUserInquery: (subUrl, dataReducer, callback, isZestI, m2uIndicator) =>
            dispatch(draftUserAccountInquiry(subUrl, dataReducer, callback, isZestI, m2uIndicator)),
            draftUserInqueryPremier: (subUrl, dataReducer, callback, isZestI, m2uIndicator) =>
            dispatch(draftUserAccountInquiryPremier(subUrl, dataReducer, callback, isZestI, m2uIndicator)),
        darftUserClearAll: () => dispatch({ type: DRAFT_USER_ACCOUNT_INQUIRY_CLEAR }),
    };
};

const draftUserInqueryProps = connect(mapStateToProps, mapDispatchToProps);
export default draftUserInqueryProps;
