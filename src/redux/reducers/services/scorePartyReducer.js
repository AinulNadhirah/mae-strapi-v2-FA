import {
    SCORE_PARTY_LOADING,
    SCORE_PARTY_ERROR,
    SCORE_PARTY_SUCCESS,
    SCORE_PARTY_CLEAR,
} from "@redux/actions/services/scorePartyAction";

// Reducer Default Value
const initialState = {
    status: "idle",
    error: null,
    data: null,
    statusCode: null,
    statusDesc: null,
    requestMsgRefNo: null,
    customerRiskRatingCode: null,
    customerRiskRatingValue: null,
    manualRiskRatingCode: null,
    manualRiskRatingValue: null,
    assessmentId: null,
    nextReviewDate: null,
    sanctionsTaggingCode: null,
    sanctionsTaggingValue: null,
    numOfWatchlistHits: null,
    universalCifNo: null,
    sourceOfFundCountry: null,
    pepDeclaration: null,
};

// Reducer
function scorePartyReducer(state = initialState, action) {
    switch (action.type) {
        case SCORE_PARTY_LOADING:
            return {
                ...state,
                status: "loading",
                error: null,
            };

        case SCORE_PARTY_ERROR:
            return {
                ...state,
                status: "error",
                error: action.error,
            };

        case SCORE_PARTY_SUCCESS:
            return {
                ...state,
                status: "success",
                data: action.data,
                statusCode: action.statusCode,
                statusDesc: action.statusDesc,
                requestMsgRefNo: action.requestMsgRefNo,
                customerRiskRatingCode: action.customerRiskRatingCode,
                customerRiskRatingValue: action.customerRiskRatingValue,
                manualRiskRatingCode: action.manualRiskRatingCode,
                manualRiskRatingValue: action.manualRiskRatingValue,
                assessmentId: action.assessmentId,
                nextReviewDate: action.nextReviewDate,
                sanctionsTaggingCode: action.sanctionsTaggingCode,
                sanctionsTaggingValue: action.sanctionsTaggingValue,
                numOfWatchlistHits: action.numOfWatchlistHits,
                universalCifNo: action.universalCifNo,
                sourceOfFundCountry: action.sourceOfFundCountry,
                pepDeclaration: action.pepDeclaration,
            };

        case SCORE_PARTY_CLEAR:
            return {
                ...state,
                status: "idle",
                error: null,
                data: null,
                statusCode: null,
                statusDesc: null,
                requestMsgRefNo: null,
                customerRiskRatingCode: null,
                customerRiskRatingValue: null,
                manualRiskRatingCode: null,
                manualRiskRatingValue: null,
                assessmentId: null,
                nextReviewDate: null,
                sanctionsTaggingCode: null,
                sanctionsTaggingValue: null,
                numOfWatchlistHits: null,
                universalCifNo: null,
                sourceOfFundCountry: null,
                pepDeclaration: null,
            };

        default:
            return state;
    }
}

export default scorePartyReducer;
