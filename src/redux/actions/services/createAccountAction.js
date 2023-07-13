export const CREATE_ACCOUNT_LOADING = () => ({});

export const CREATE_ACCOUNT_ERROR = (error) => ({
    error: error,
});

export const CREATE_ACCOUNT_SUCCESS = (
    data,
    accessNo,
    acctCode,
    acctNo,
    acctType,
    assessmentId,
    customerRiskRating,
    customerRiskRatingValue,
    debitCardNo,
    expiryDate,
    inviteCode,
    nameScreenFlag,
    nextReviewDate,
    numOfWatchlistHits,
    primBitMap,
    refNo,
    s2w,
    sanctionsTagging,
    sanctionsTaggingValue,
    screeningId,
    statusCode,
    statusDesc,
    gcif,
    universalCifNo
) => ({
    data: data,
    accessNo: accessNo,
    acctCode: acctCode,
    acctNo: acctNo,
    acctType: acctType,
    assessmentId: assessmentId,
    customerRiskRating: customerRiskRating,
    customerRiskRatingValue: customerRiskRatingValue,
    debitCardNo: debitCardNo,
    expiryDate: expiryDate,
    inviteCode: inviteCode,
    nameScreenFlag: nameScreenFlag,
    nextReviewDate: nextReviewDate,
    numOfWatchlistHits: numOfWatchlistHits,
    primBitMap: primBitMap,
    refNo: refNo,
    s2w: s2w,
    sanctionsTagging: sanctionsTagging,
    sanctionsTaggingValue: sanctionsTaggingValue,
    screeningId: screeningId,
    statusCode: statusCode,
    statusDesc: statusDesc,
    gcif: gcif,
    universalCifNo: universalCifNo,
});

export const CREATE_ACCOUNT_CLEAR = () => ({});

export const ZEST_CASA_CREATE_ACCOUNT_BODY = (state) => ({
    state,
});
