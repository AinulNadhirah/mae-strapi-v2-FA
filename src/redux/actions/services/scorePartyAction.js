export const SCORE_PARTY_LOADING = () => ({});

export const SCORE_PARTY_ERROR = (error) => ({
    error: error,
});

export const SCORE_PARTY_SUCCESS = (
    data,
    statusCode,
    statusDesc,
    requestMsgRefNo,
    customerRiskRatingCode,
    customerRiskRatingValue,
    manualRiskRatingCode,
    manualRiskRatingValue,
    assessmentId,
    nextReviewDate,
    sanctionsTaggingCode,
    sanctionsTaggingValue,
    numOfWatchlistHits,
    universalCifNo,
    sourceOfFundCountry,
    pepDeclaration
) => ({
    data: data,
    statusCode: statusCode,
    statusDesc: statusDesc,
    requestMsgRefNo: requestMsgRefNo,
    customerRiskRatingCode: customerRiskRatingCode,
    customerRiskRatingValue: customerRiskRatingValue,
    manualRiskRatingCode: manualRiskRatingCode,
    manualRiskRatingValue: manualRiskRatingValue,
    assessmentId: assessmentId,
    nextReviewDate: nextReviewDate,
    sanctionsTaggingCode: sanctionsTaggingCode,
    sanctionsTaggingValue: sanctionsTaggingValue,
    numOfWatchlistHits: numOfWatchlistHits,
    universalCifNo: universalCifNo,
    sourceOfFundCountry: sourceOfFundCountry,
    pepDeclaration: pepDeclaration,
});

export const SCORE_PARTY_CLEAR = () => ({});
