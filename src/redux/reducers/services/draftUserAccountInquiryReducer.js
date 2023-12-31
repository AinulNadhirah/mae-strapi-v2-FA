import {
    DRAFT_USER_ACCOUNT_INQUIRY_LOADING,
    DRAFT_USER_ACCOUNT_INQUIRY_ERROR,
    DRAFT_USER_ACCOUNT_INQUIRY_SUCCESS,
    DRAFT_USER_ACCOUNT_INQUIRY_UPDATE_ACCOUNT_NUMBER,
    DRAFT_USER_ACCOUNT_INQUIRY_CLEAR,
} from "@redux/actions/services/draftUserAccountInquiryAction";

// Reducer Default Value
const initialState = {
    status: "idle",
    statusCode: null,
    statusDesc: null,
    error: null,
    data: null,
    custStatus: null,
    branchApprovalStatusCode: null,
    m2uIndicator: null,
    idNo: null,
    mobileNo: null,
    accessNo: null,
    acctNo: null,
    addr1: null,
    addr2: null,
    addr3: null,
    addr4: null,
    idType: null,
    birthDate: null,
    customerName: null,
    postCode: null,
    m2uAccessNo: null,
    gcif: null,
    onlineRegUrl: null,
    maeInd: null,
    resumeStageInd: null,
    rsaIndicator: null,
    localCifNo: null,
    customerRiskRating: null,
    screeningStatus: null,
    title: null,
    nationality: null,
    bodInd: null,
    staffInd: null,
    saDailyInd: null,
    saTermInd: null,
    deChequeHostStatus: null,
    onBoardingStatusInfo: null,
    onboardingIndicatorCode: null,
    emailAddress: null,
    pep: null,
    gender: null,
    race: null,
    state: null,
    stateValue: null,
    city: null,
    empType: null,
    empTypeValue: null,
    employerName: null,
    occupation: null,
    occupationValue: null,
    sector: null,
    sectorValue: null,
    monthlyIncomeRange: null,
    monthlyIncomeRangeValue: null,
    pan: null,
    purpose: null,
    purposeValue: null,
    preferredBRState: null,
    preferredBRDistrict: null,
    preferredBranch: null,
    finanicalObjective: null,
    finanicalObjectiveValue: null,
    saFormSecurities: null,
    saFormInvestmentRisk: null,
    saFormInvestmentExp: null,
    saFormInvestmentNature: null,
    saFormInvestmentTerm: null,
    saFormProductFeature: null,
    saFormPIDM: null,
    saFormSuitability: null,
    userStatus: null,
    sourceOfFund: null,
    sourceOfFundValue: null,
    viewPartyResult: null,

    // View party initial values
    approvalStatusCode: null,
    approvalStatusValue: null,
    businessSizeCode: null,
    businessSizeValue: null,
    cifCountryOfOnboarding: null,
    cifNo: null,
    citizenshipCode: null,
    citizenshipValue: null,
    consentForMarketing: null,
    countryOfBirthCode: null,
    countryOfBirthValue: null,
    countryOfOnboarding: null,
    countryOfOnboardingCode: null,
    countryOfOnboardingValue: null,
    countryOfPermanentResidenceCode: null,
    countryOfPermanentResidenceValue: null,
    createdBy: null,
    createdDate: null,
    custIdentifier: null,
    customerSegmentCode: null,
    customerSegmentValue: null,
    dateOfBirth: null,
    educationCode: null,
    educationValue: null,
    employmentPhoneNumber: null,
    employmentTypeCode: null,
    employmentTypeValue: null,
    entityTypeCode: null,
    entityTypeValue: null,
    genderCode: null,
    genderValue: null,
    grossIncomeRangeCode: null,
    grossIncomeRangeValue: null,
    homeAddr1: null,
    homeAddr2: null,
    homeAddr3: null,
    homeAddrFormat: null,
    homeAddrIdentifier: null,
    homeAddrTypeCode: null,
    homeAddrTypeValue: null,
    homeBranchCode: null,
    homeCity: null,
    homeCountryCode: null,
    homeCountryValue: null,
    homePhoneIdentifier: null,
    homePhoneNumber: null,
    homePhonePrefix: null,
    homePostCode: null,
    homeStateCode: null,
    homeStateValue: null,
    idExpiryDate: null,
    idIssuedCountryCode: null,
    idIssuedCountryValue: null,
    idTypeCode: null,
    idTypeValue: null,
    industrySectorCode: null,
    industrySectorValue: null,
    lastUpdatedBy: null,
    lastUpdatedDate: null,
    legalStructureCode: null,
    legalStructureValue: null,
    maritalStatusCode: null,
    maritalStatusValue: null,
    marketSegmentCode: null,
    marketSegmentValue: null,
    marketSubSegmentCode: null,
    marketSubSegmentValue: null,
    marketSubSubSegmentCode: null,
    marketSubSubSegmentValue: null,
    mobAreaCode: null,
    mobCountryCode: null,
    mobDispCountryCode: null,
    mobDispCountryValue: null,
    mobIdentifer: null,
    mobPhoneNumber: null,
    mobPrimeInd: null,
    noOfPhones: null,
    noOfProducts: null,
    occupationCode: null,
    occupationSectorCode: null,
    occupationSectorValue: null,
    officeAddr1: null,
    officeAddr2: null,
    officeAddr3: null,
    officeAddrFormat: null,
    officeAddrIdentifier: null,
    officeAddrTypeCode: null,
    officeAddrTypeValue: null,
    officeCity: null,
    officeCountryCode: null,
    officeCountryValue: null,
    officePhoneIdentifier: null,
    officePhoneNumber: null,
    officePhonePrefix: null,
    officePostCode: null,
    officeStateCode: null,
    officeStateValue: null,
    onboardingChannelCode: null,
    onboardingChannelValue: null,
    onboardingStatusCode: null,
    onboardingStatusValue: null,
    onboardingTypeCode: null,
    onboardingTypeValue: null,
    partyClassCode: null,
    partyClassLegacyCode: null,
    partyClassLegacyValue: null,
    partyClassValue: null,
    partyGroupCode: null,
    partyGroupValue: null,
    pepDeclare: null,
    phoneTypeCode: null,
    phoneTypeValue: null,
    primaryDocument: null,
    products: null,
    raceCode: null,
    raceValue: null,
    registeredName: null,
    religionCode: null,
    religionValue: null,
    residentStatusCode: null,
    residentStatusValue: null,
    salutationCode: null,
    salutationValue: null,
    screeningHits: null,
    screeningId: null,
    screeningStatusCode: null,
    screeningStatusValue: null,
    sourceOfFundCountry: null,
    sourceOfFundCountryValue: null,
    sourceSystem: null,
    type: null,

    // Score party initial values
    requestMsgRefNo: null,
    customerRiskRatingValue: null,
    manualRiskRatingCode: null,
    manualRiskRatingValue: null,
    assessmentId: null,
    nextReviewDate: null,
    sanctionsTagging: null,
    sanctionsTaggingValue: null,
    numOfWatchlistHits: null,
    universalCifNo: null,
    pepDeclaration: null,
    isZestI: null,
    hasDebitCard: null,
};

// Reducer
function draftUserAccountInquiryReducer(state = initialState, action) {
    switch (action.type) {
        case DRAFT_USER_ACCOUNT_INQUIRY_LOADING:
            return {
                ...state,
                status: "loading",
            };

        case DRAFT_USER_ACCOUNT_INQUIRY_ERROR:
            return {
                ...state,
                status: "error",
                error: action.error,
            };

        case DRAFT_USER_ACCOUNT_INQUIRY_SUCCESS:
            return {
                ...state,
                status: "success",
                statusCode: action.statusCode,
                statusDesc: action.statusDesc,
                data: action.data,
                custStatus: action.custStatus,
                branchApprovalStatusCode: action.branchApprovalStatusCode,
                m2uIndicator: action.m2uIndicator,
                idNo: action.idNo,
                mobileNo: action.mobileNo,
                accessNo: action.accessNo,
                addr1: action.addr1,
                addr2: action.addr2,
                addr3: action.addr3,
                addr4: action.addr4,
                idType: action.idType,
                birthDate: action.birthDate,
                customerName: action.customerName,
                postCode: action.postCode,
                m2uAccessNo: action.m2uAccessNo,
                gcif: action.gcif,
                onlineRegUrl: action.onlineRegUrl,
                maeInd: action.maeInd,
                resumeStageInd: action.resumeStageInd,
                rsaIndicator: action.rsaIndicator,
                localCifNo: action.localCifNo,
                screeningStatus: action.screeningStatus,
                title: action.title,
                nationality: action.nationality,
                bodInd: action.bodInd,
                staffInd: action.staffInd,
                saDailyInd: action.saDailyInd,
                saTermInd: action.saTermInd,
                deChequeHostStatus: action.deChequeHostStatus,
                onBoardingStatusInfo: action.onBoardingStatusInfo,
                onboardingIndicatorCode: action.onboardingIndicatorCode,
                emailAddress: action.emailAddress,
                pep: action.pep,
                gender: action.gender,
                race: action.race,
                state: action.state,
                stateValue: action.stateValue,
                city: action.city,
                empType: action.empType,
                empTypeValue: action.empTypeValue,
                employerName: action.employerName,
                occupation: action.occupation,
                occupationValue: action.occupationValue,
                sector: action.sector,
                sectorValue: action.sectorValue,
                monthlyIncomeRange: action.monthlyIncomeRange,
                monthlyIncomeRangeValue: action.monthlyIncomeRangeValue,
                pan: action.accessNo,
                purpose: action.purpose,
                purposeValue: action.purposeValue,
                preferredBRState: action.preferredBRState,
                preferredBRDistrict: action.preferredBRDistrict,
                preferredBranch: action.preferredBranch,
                finanicalObjective: action.finanicalObjective,
                finanicalObjectiveValue: action.finanicalObjectiveValue,
                saFormSecurities: action.saFormSecurities,
                saFormInvestmentRisk: action.saFormInvestmentRisk,
                saFormInvestmentExp: action.saFormInvestmentExp,
                saFormInvestmentNature: action.saFormInvestmentNature,
                saFormInvestmentTerm: action.saFormInvestmentTerm,
                saFormProductFeature: action.saFormProductFeature,
                saFormPIDM: action.saFormPIDM,
                saFormSuitability: action.saFormSuitability,
                sourceOfFund: action.sourceOfFund,
                sourceOfFundValue: action.sourceOfFundValue,
                viewPartyResult: action.viewPartyResult,
                screeningId: action.screeningId,

                // View party results
                approvalStatusCode: action.viewPartyResult?.approvalStatusCode,
                approvalStatusValue: action.viewPartyResult?.approvalStatusValue,
                businessSizeCode: action.viewPartyResult?.businessSizeCode,
                businessSizeValue: action.viewPartyResult?.businessSizeValue,
                cifCountryOfOnboarding: action.viewPartyResult?.cifCountryOfOnboarding,
                cifNo: action.viewPartyResult?.cifNo,
                citizenshipCode: action.viewPartyResult?.citizenshipCode,
                citizenshipValue: action.viewPartyResult?.citizenshipValue,
                consentForMarketing: action.viewPartyResult?.consentForMarketing,
                countryOfBirthCode: action.viewPartyResult?.countryOfBirthCode,
                countryOfBirthValue: action.viewPartyResult?.countryOfBirthValue,
                countryOfOnboarding: action.viewPartyResult?.countryOfOnboarding,
                countryOfOnboardingCode: action.viewPartyResult?.countryOfOnboardingCode,
                countryOfOnboardingValue: action.viewPartyResult?.countryOfOnboardingValue,
                countryOfPermanentResidenceCode:
                    action.viewPartyResult?.countryOfPermanentResidenceCode,
                countryOfPermanentResidenceValue:
                    action.viewPartyResult?.countryOfPermanentResidenceValue,
                createdBy: action.viewPartyResult?.createdBy,
                createdDate: action.viewPartyResult?.createdDate,
                custIdentifier: action.viewPartyResult?.custIdentifier,
                customerSegmentCode: action.viewPartyResult?.customerSegmentCode,
                customerSegmentValue: action.viewPartyResult?.customerSegmentValue,
                dateOfBirth: action.viewPartyResult?.dateOfBirth,
                educationCode: action.viewPartyResult?.educationCode,
                educationValue: action.viewPartyResult?.educationValue,
                employmentPhoneNumber: action.viewPartyResult?.employmentPhoneNumber,
                employmentTypeCode: action.viewPartyResult?.employmentTypeCode,
                employmentTypeValue: action.viewPartyResult?.employmentTypeValue,
                entityTypeCode: action.viewPartyResult?.entityTypeCode,
                entityTypeValue: action.viewPartyResult?.entityTypeValue,
                genderCode: action.viewPartyResult?.genderCode,
                genderValue: action.viewPartyResult?.genderValue,
                grossIncomeRangeCode: action.viewPartyResult?.grossIncomeRangeCode,
                grossIncomeRangeValue: action.viewPartyResult?.grossIncomeRangeValue,
                homeAddr1: action.viewPartyResult?.homeAddr1,
                homeAddr2: action.viewPartyResult?.homeAddr2,
                homeAddr3: action.viewPartyResult?.homeAddr3,
                homeAddrFormat: action.viewPartyResult?.homeAddrFormat,
                homeAddrIdentifier: action.viewPartyResult?.homeAddrIdentifier,
                homeAddrTypeCode: action.viewPartyResult?.homeAddrTypeCode,
                homeAddrTypeValue: action.viewPartyResult?.homeAddrTypeValue,
                homeBranchCode: action.viewPartyResult?.homeBranchCode,
                homeCity: action.viewPartyResult?.homeCity,
                homeCountryCode: action.viewPartyResult?.homeCountryCode,
                homeCountryValue: action.viewPartyResult?.homeCountryValue,
                homePhoneIdentifier: action.viewPartyResult?.homePhoneIdentifier,
                homePhoneNumber: action.viewPartyResult?.homePhoneNumber,
                homePhonePrefix: action.viewPartyResult?.homePhonePrefix,
                homePostCode: action.viewPartyResult?.homePostCode,
                homeStateCode: action.viewPartyResult?.homeStateCode,
                homeStateValue: action.viewPartyResult?.homeStateValue,
                idExpiryDate: action.viewPartyResult?.idExpiryDate,
                idIssuedCountryCode: action.viewPartyResult?.idIssuedCountryCode,
                idIssuedCountryValue: action.viewPartyResult?.idIssuedCountryValue,
                idTypeCode: action.viewPartyResult?.idTypeCode,
                idTypeValue: action.viewPartyResult?.idTypeValue,
                industrySectorCode: action.viewPartyResult?.industrySectorCode,
                industrySectorValue: action.viewPartyResult?.industrySectorValue,
                lastUpdatedBy: action.viewPartyResult?.lastUpdatedBy,
                lastUpdatedDate: action.viewPartyResult?.lastUpdatedDate,
                legalStructureCode: action.viewPartyResult?.legalStructureCode,
                legalStructureValue: action.viewPartyResult?.legalStructureValue,
                maritalStatusCode: action.viewPartyResult?.maritalStatusCode,
                maritalStatusValue: action.viewPartyResult?.maritalStatusValue,
                marketSegmentCode: action.viewPartyResult?.marketSegmentCode,
                marketSegmentValue: action.viewPartyResult?.marketSegmentValue,
                marketSubSegmentCode: action.viewPartyResult?.marketSubSegmentCode,
                marketSubSegmentValue: action.viewPartyResult?.marketSubSegmentValue,
                marketSubSubSegmentCode: action.viewPartyResult?.marketSubSubSegmentCode,
                marketSubSubSegmentValue: action.viewPartyResult?.marketSubSubSegmentValue,
                mobAreaCode: action.viewPartyResult?.mobAreaCode,
                mobCountryCode: action.viewPartyResult?.mobCountryCode,
                mobDispCountryCode: action.viewPartyResult?.mobDispCountryCode,
                mobDispCountryValue: action.viewPartyResult?.mobDispCountryValue,
                mobIdentifer: action.viewPartyResult?.mobIdentifer,
                mobPhoneNumber: action.viewPartyResult?.mobPhoneNumber,
                mobPrimeInd: action.viewPartyResult?.mobPrimeInd,
                noOfPhones: action.viewPartyResult?.noOfPhones,
                noOfProducts: action.viewPartyResult?.noOfProducts,
                occupationCode: action.viewPartyResult?.occupationCode,
                occupationSectorCode: action.viewPartyResult?.occupationSectorCode,
                occupationSectorValue: action.viewPartyResult?.occupationSectorValue,
                officeAddr1: action.viewPartyResult?.officeAddr1,
                officeAddr2: action.viewPartyResult?.officeAddr2,
                officeAddr3: action.viewPartyResult?.officeAddr3,
                officeAddrFormat: action.viewPartyResult?.officeAddrFormat,
                officeAddrIdentifier: action.viewPartyResult?.officeAddrIdentifier,
                officeAddrTypeCode: action.viewPartyResult?.officeAddrTypeCode,
                officeAddrTypeValue: action.viewPartyResult?.officeAddrTypeValue,
                officeCity: action.viewPartyResult?.officeCity,
                officeCountryCode: action.viewPartyResult?.officeCountryCode,
                officeCountryValue: action.viewPartyResult?.officeCountryValue,
                officePhoneIdentifier: action.viewPartyResult?.officePhoneIdentifier,
                officePhoneNumber: action.viewPartyResult?.officePhoneNumber,
                officePhonePrefix: action.viewPartyResult?.officePhonePrefix,
                officePostCode: action.viewPartyResult?.officePostCode,
                officeStateCode: action.viewPartyResult?.officeStateCode,
                officeStateValue: action.viewPartyResult?.officeStateValue,
                onboardingChannelCode: action.viewPartyResult?.onboardingChannelCode,
                onboardingChannelValue: action.viewPartyResult?.onboardingChannelValue,
                onboardingStatusCode: action.viewPartyResult?.onboardingStatusCode,
                onboardingStatusValue: action.viewPartyResult?.onboardingStatusValue,
                onboardingTypeCode: action.viewPartyResult?.onboardingTypeCode,
                onboardingTypeValue: action.viewPartyResult?.onboardingTypeValue,
                partyClassCode: action.viewPartyResult?.partyClassCode,
                partyClassLegacyCode: action.viewPartyResult?.partyClassLegacyCode,
                partyClassLegacyValue: action.viewPartyResult?.partyClassLegacyValue,
                partyClassValue: action.viewPartyResult?.partyClassValue,
                partyGroupCode: action.viewPartyResult?.partyGroupCode,
                partyGroupValue: action.viewPartyResult?.partyGroupValue,
                pepDeclare: action.viewPartyResult?.pepDeclare,
                phoneTypeCode: action.viewPartyResult?.phoneTypeCode,
                phoneTypeValue: action.viewPartyResult?.phoneTypeValue,
                primaryDocument: action.viewPartyResult?.primaryDocument,
                products: action.viewPartyResult?.products,
                raceCode: action.viewPartyResult?.raceCode,
                raceValue: action.viewPartyResult?.raceValue,
                registeredName: action.viewPartyResult?.registeredName,
                religionCode: action.viewPartyResult?.religionCode,
                religionValue: action.viewPartyResult?.religionValue,
                residentStatusCode: action.viewPartyResult?.residentStatusCode,
                residentStatusValue: action.viewPartyResult?.residentStatusValue,
                salutationCode: action.viewPartyResult?.salutationCode,
                salutationValue: action.viewPartyResult?.salutationValue,
                screeningHits: action.viewPartyResult?.screeningHits,
                screeningStatusCode: action.viewPartyResult?.screeningStatusCode,
                screeningStatusValue: action.viewPartyResult?.screeningStatusValue,
                sourceOfFundCountry: action.viewPartyResult?.sourceOfFundCountry,
                sourceOfFundCountryValue: action.viewPartyResult?.sourceOfFundCountryValue,
                sourceSystem: action.viewPartyResult?.sourceSystem,
                type: action.viewPartyResult?.type,
                isZestI: action.isZestI,

                // Score party results
                requestMsgRefNo: action.scorePartyResult?.requestMsgRefNo,
                customerRiskRating: action.scorePartyResult?.customerRiskRatingCode,
                customerRiskRatingValue: action.scorePartyResult?.customerRiskRatingValue,
                manualRiskRatingCode: action.scorePartyResult?.manualRiskRatingCode,
                manualRiskRatingValue: action.scorePartyResult?.manualRiskRatingValue,
                assessmentId: action.scorePartyResult?.assessmentId,
                nextReviewDate: action.scorePartyResult?.nextReviewDate,
                sanctionsTagging: action.scorePartyResult?.sanctionsTaggingCode,
                sanctionsTaggingValue: action.scorePartyResult?.sanctionsTaggingValue,
                numOfWatchlistHits: action.scorePartyResult?.numOfWatchlistHits,
                universalCifNo: action.scorePartyResult?.universalCifNo,
                pepDeclaration: action.scorePartyResult?.pepDeclaration,
                hasDebitCard: action.hasDebitCard,
            };

        case DRAFT_USER_ACCOUNT_INQUIRY_UPDATE_ACCOUNT_NUMBER:
            return {
                ...state,
                acctNo: action.acctNo,
            };

        case DRAFT_USER_ACCOUNT_INQUIRY_CLEAR:
            return {
                ...state,
                status: "idle",
                statusCode: null,
                statusDesc: null,
                error: null,
                data: null,
                custStatus: null,
                branchApprovalStatusCode: null,
                m2uIndicator: null,
                idNo: null,
                mobileNo: null,
                accessNo: null,
                acctNo: null,
                addr1: null,
                addr2: null,
                addr3: null,
                addr4: null,
                idType: null,
                birthDate: null,
                customerName: null,
                postCode: null,
                m2uAccessNo: null,
                gcif: null,
                onlineRegUrl: null,
                maeInd: null,
                resumeStageInd: null,
                rsaIndicator: null,
                localCifNo: null,
                universalCifNo: null,
                customerRiskRating: null,
                screeningStatus: null,
                title: null,
                nationality: null,
                bodInd: null,
                staffInd: null,
                saDailyInd: null,
                saTermInd: null,
                deChequeHostStatus: null,
                onBoardingStatusInfo: null,
                onboardingIndicatorCode: null,
                emailAddress: null,
                pep: null,
                gender: null,
                race: null,
                state: null,
                stateValue: null,
                city: null,
                empType: null,
                empTypeValue: null,
                employerName: null,
                occupation: null,
                occupationValue: null,
                sector: null,
                sectorValue: null,
                monthlyIncomeRange: null,
                monthlyIncomeRangeValue: null,
                pan: null,
                purpose: null,
                purposeValue: null,
                preferredBRState: null,
                preferredBRDistrict: null,
                preferredBranch: null,
                finanicalObjective: null,
                finanicalObjectiveValue: null,
                saFormSecurities: null,
                saFormInvestmentRisk: null,
                saFormInvestmentExp: null,
                saFormInvestmentNature: null,
                saFormInvestmentTerm: null,
                saFormProductFeature: null,
                saFormPIDM: null,
                saFormSuitability: null,
                userStatus: null,
                sourceOfFund: null,
                sourceOfFundValue: null,
                viewPartyResult: null,

                approvalStatusCode: null,
                approvalStatusValue: null,
                businessSizeCode: null,
                businessSizeValue: null,
                cifCountryOfOnboarding: null,
                cifNo: null,
                citizenshipCode: null,
                citizenshipValue: null,
                consentForMarketing: null,
                countryOfBirthCode: null,
                countryOfBirthValue: null,
                countryOfOnboarding: null,
                countryOfOnboardingCode: null,
                countryOfOnboardingValue: null,
                countryOfPermanentResidenceCode: null,
                countryOfPermanentResidenceValue: null,
                createdBy: null,
                createdDate: null,
                custIdentifier: null,
                customerSegmentCode: null,
                customerSegmentValue: null,
                dateOfBirth: null,
                educationCode: null,
                educationValue: null,
                employmentPhoneNumber: null,
                employmentTypeCode: null,
                employmentTypeValue: null,
                entityTypeCode: null,
                entityTypeValue: null,
                genderCode: null,
                genderValue: null,
                grossIncomeRangeCode: null,
                grossIncomeRangeValue: null,
                homeAddr1: null,
                homeAddr2: null,
                homeAddr3: null,
                homeAddrFormat: null,
                homeAddrIdentifier: null,
                homeAddrTypeCode: null,
                homeAddrTypeValue: null,
                homeBranchCode: null,
                homeCity: null,
                homeCountryCode: null,
                homeCountryValue: null,
                homePhoneIdentifier: null,
                homePhoneNumber: null,
                homePhonePrefix: null,
                homePostCode: null,
                homeStateCode: null,
                homeStateValue: null,
                idExpiryDate: null,
                idIssuedCountryCode: null,
                idIssuedCountryValue: null,
                idTypeCode: null,
                idTypeValue: null,
                industrySectorCode: null,
                industrySectorValue: null,
                lastUpdatedBy: null,
                lastUpdatedDate: null,
                legalStructureCode: null,
                legalStructureValue: null,
                maritalStatusCode: null,
                maritalStatusValue: null,
                marketSegmentCode: null,
                marketSegmentValue: null,
                marketSubSegmentCode: null,
                marketSubSegmentValue: null,
                marketSubSubSegmentCode: null,
                marketSubSubSegmentValue: null,
                mobAreaCode: null,
                mobCountryCode: null,
                mobDispCountryCode: null,
                mobDispCountryValue: null,
                mobIdentifer: null,
                mobPhoneNumber: null,
                mobPrimeInd: null,
                noOfPhones: null,
                noOfProducts: null,
                occupationCode: null,
                occupationSectorCode: null,
                occupationSectorValue: null,
                officeAddr1: null,
                officeAddr2: null,
                officeAddr3: null,
                officeAddrFormat: null,
                officeAddrIdentifier: null,
                officeAddrTypeCode: null,
                officeAddrTypeValue: null,
                officeCity: null,
                officeCountryCode: null,
                officeCountryValue: null,
                officePhoneIdentifier: null,
                officePhoneNumber: null,
                officePhonePrefix: null,
                officePostCode: null,
                officeStateCode: null,
                officeStateValue: null,
                onboardingChannelCode: null,
                onboardingChannelValue: null,
                onboardingStatusCode: null,
                onboardingStatusValue: null,
                onboardingTypeCode: null,
                onboardingTypeValue: null,
                partyClassCode: null,
                partyClassLegacyCode: null,
                partyClassLegacyValue: null,
                partyClassValue: null,
                partyGroupCode: null,
                partyGroupValue: null,
                pepDeclare: null,
                phoneTypeCode: null,
                phoneTypeValue: null,
                primaryDocument: null,
                products: null,
                raceCode: null,
                raceValue: null,
                registeredName: null,
                religionCode: null,
                religionValue: null,
                residentStatusCode: null,
                residentStatusValue: null,
                salutationCode: null,
                salutationValue: null,
                screeningHits: null,
                screeningId: null,
                screeningStatusCode: null,
                screeningStatusValue: null,
                sourceOfFundCountry: null,
                sourceOfFundCountryValue: null,
                sourceSystem: null,
                type: null,
                isZestI: null,
                sanctionsTagging: null,
                hasDebitCard: null,
                numOfWatchlistHits: null,
            };

        default:
            return state;
    }
}

export default draftUserAccountInquiryReducer;
