import PropTypes from "prop-types";
import { connect } from "react-redux";

import { SCORE_PARTY_CLEAR } from "@redux/actions/services/scorePartyAction";
import { fetchScorePartyPremier } from "@redux/services/Premier/apiScoreParty";
import { fetchScoreParty } from "@redux/services/apiScoreParty";

const mapStateToProps = function (state) {
    const { scorePartyReducer } = state;

    return {
        statusScoreParty: scorePartyReducer.status,
        errorScoreParty: scorePartyReducer.error,
        dataScoreParty: scorePartyReducer.data,
        requestMsgRefNo: scorePartyReducer.requestMsgRefNo,
        customerRiskRatingCode: scorePartyReducer.customerRiskRatingCode,
        customerRiskRatingValue: scorePartyReducer.customerRiskRatingValue,
        manualRiskRatingCode: scorePartyReducer.manualRiskRatingCode,
        manualRiskRatingValue: scorePartyReducer.manualRiskRatingValue,
        assessmentId: scorePartyReducer.assessmentId,
        nextReviewDate: scorePartyReducer.nextReviewDate,
        sanctionsTaggingCode: scorePartyReducer.sanctionsTaggingCode,
        sanctionsTaggingValue: scorePartyReducer.sanctionsTaggingValue,
        numOfWatchlistHits: scorePartyReducer.numOfWatchlistHits,
        universalCifNo: scorePartyReducer.universalCifNo,
        sourceOfFundCountry: scorePartyReducer.sourceOfFundCountry,
        pepDeclaration: scorePartyReducer.pepDeclaration,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getScoreParty: (data, callback) => {
            dispatch(fetchScoreParty(data, callback));
        },
        getScorePartyPremier: (data, callback) => {
            dispatch(fetchScorePartyPremier(data, callback));
        },
        clearScorePartyReducer: () => dispatch({ type: SCORE_PARTY_CLEAR }),
    };
};

const scorePartyStateTypes = (mapStateToProps.propTypes = {
    statusScoreParty: PropTypes.string,
    errorScoreParty: PropTypes.string,
    dataScoreParty: PropTypes.object,
    requestMsgRefNo: PropTypes.string,
    customerRiskRatingCode: PropTypes.string,
    customerRiskRatingValue: PropTypes.string,
    manualRiskRatingCode: PropTypes.string,
    manualRiskRatingValue: PropTypes.string,
    assessmentId: PropTypes.string,
    nextReviewDate: PropTypes.string,
    sanctionsTaggingCode: PropTypes.string,
    sanctionsTaggingValue: PropTypes.string,
    numOfWatchlistHits: PropTypes.number,
    universalCifNo: PropTypes.string,
    sourceOfFundCountry: PropTypes.string,
    pepDeclaration: PropTypes.string,
});

const scorePartyDispatchTypes = (mapDispatchToProps.propTypes = {
    getScoreParty: PropTypes.func,
    clearScorePartyReducer: PropTypes.func,
});

export const scorePartyServicePropTypes = {
    ...scorePartyStateTypes,
    ...scorePartyDispatchTypes,
};

const scorePartyServiceProps = connect(mapStateToProps, mapDispatchToProps);
export default scorePartyServiceProps;
