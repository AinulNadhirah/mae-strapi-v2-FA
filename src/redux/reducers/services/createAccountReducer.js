import {
    CREATE_ACCOUNT_LOADING,
    CREATE_ACCOUNT_ERROR,
    CREATE_ACCOUNT_SUCCESS,
    CREATE_ACCOUNT_CLEAR,
    ZEST_CASA_CREATE_ACCOUNT_BODY,
} from "@redux/actions/services/createAccountAction";
import {
    zestCreateAccountBody,
    onBoardDetails,
    onBoardDetails2,
    onBoardDetails3,
    onBoardDetails4,
} from "@redux/utilities/actionUtilities";

// Reducer Default Value
const initialState = {
    status: "idle",
    error: null,
    data: null,
    body: {},
    onBoardDetails: {},
    onBoardDetails2: {},
    onBoardDetails3: {},
    onBoardDetails4: {},
    idNo: null,
    mobileNo: null,
    accessNo: null,
    acctCode: null,
    acctNo: null,
    acctType: null,
    assessmentId: null,
    customerRiskRating: null,
    customerRiskRatingValue: null,
    debitCardNo: null,
    expiryDate: null,
    inviteCode: null,
    nameScreenFlag: null,
    nextReviewDate: null,
    numOfWatchlistHits: null,
    primBitMap: null,
    refNo: null,
    s2w: null,
    sanctionsTagging: null,
    sanctionsTaggingValue: null,
    screeningId: null,
    statusCode: null,
    statusDesc: null,
    gcif: null,
    universalCifNo: null,
};

// Reducer
function createAccountReducer(state = initialState, action) {
    switch (action.type) {
        case CREATE_ACCOUNT_LOADING:
            return {
                ...state,
                status: "loading",
            };

        case CREATE_ACCOUNT_ERROR:
            return {
                ...state,
                status: "error",
                error: action.error,
            };

        case CREATE_ACCOUNT_SUCCESS:
            return {
                ...state,
                status: "success",
                data: action.data,
                accessNo: action.accessNo,
                acctCode: action.acctCode,
                acctNo: action.acctNo,
                acctType: action.acctType,
                assessmentId: action.assessmentId,
                customerRiskRating: action.customerRiskRating,
                customerRiskRatingValue: action.customerRiskRatingValue,
                debitCardNo: action.debitCardNo,
                expiryDate: action.expiryDate,
                inviteCode: action.inviteCode,
                nameScreenFlag: action.nameScreenFlag,
                nextReviewDate: action.nextReviewDate,
                numOfWatchlistHits: action.numOfWatchlistHits,
                primBitMap: action.primBitMap,
                refNo: action.refNo,
                s2w: action.s2w,
                sanctionsTagging: action.sanctionsTagging,
                sanctionsTaggingValue: action.sanctionsTaggingValue,
                screeningId: action.screeningId,
                statusCode: action.statusCode,
                statusDesc: action.statusDesc,
                gcif: action.gcif,
                universalCifNo: action.universalCifNo,
            };

        case CREATE_ACCOUNT_CLEAR:
            return {
                ...state,
                status: "idle",
                error: null,
                data: null,
                body: {},
                onBoardDetails: {},
                onBoardDetails2: {},
                onBoardDetails3: {},
                onBoardDetails4: {},
                idNo: null,
                mobileNo: null,
                accessNo: null,
                acctCode: null,
                acctNo: null,
                acctType: null,
                assessmentId: null,
                customerRiskRating: null,
                customerRiskRatingValue: null,
                debitCardNo: null,
                expiryDate: null,
                inviteCode: null,
                nameScreenFlag: null,
                nextReviewDate: null,
                numOfWatchlistHits: null,
                primBitMap: null,
                refNo: null,
                s2w: null,
                sanctionsTagging: null,
                sanctionsTaggingValue: null,
                screeningId: null,
                statusCode: null,
                statusDesc: null,
                gcif: null,
                universalCifNo: null,
            };

        case ZEST_CASA_CREATE_ACCOUNT_BODY:
            return {
                ...state,
                idNo: action.state.idNo,
                mobileNo: action.state.mobileNo,
                body: zestCreateAccountBody(action.state),
                onBoardDetails: onBoardDetails(action.state),
                onBoardDetails2: onBoardDetails2(action.state),
                onBoardDetails3: onBoardDetails3(action.state),
                onBoardDetails4: onBoardDetails4(action.state),
            };

        default:
            return state;
    }
}

export default createAccountReducer;
