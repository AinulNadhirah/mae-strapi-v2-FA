export const zestCreateAccountBody = (action) => {
    return {
        customerName: action.customerName ?? null,
        idNo: action.idNo ?? null,
        idType: action.idType ?? null,
        birthDate: action.birthDate ?? null,
        mobileNo: action.mobileNo ?? null,
        customerEmail: action.customerEmail ?? null,
        preOrPostFlag: action.preOrPostFlag ?? null,
        idImg: action.idImg ?? null,
        selfieImg: action.selfieImg ?? null,
        citizenship: action.citizenship ?? null,
        pdpa: action.pdpa ?? null,
        transactionType: action.transactionType ?? null,
        referalCode: action.referalCode ?? null,
        addr1: action.addr1 ?? null,
        addr2: action.addr2 ?? null,
        addr3: action.addr3 ?? null,
        addr4: action.addr4 ?? null,
        custStatus: action.custStatus ?? null,
        m2uIndicator: action.m2uIndicator ?? null,
        pan: action.pan ?? null,
        gcif: action.gcif ?? null,
        postCode: action.postCode ?? null,
        uscitizenSelected: action.uscitizenSelected ?? null,
        fatcaUSTaxID: action.fatcaUSTaxID ?? null,
        state: action.state ?? null,
        stateValue: action.stateValue ?? null,
        fatcaStateValue: action.fatcaStateValue ?? null,
        fatcaTin: action.fatcaTin ?? null,
        crsCitizenSelected: action.crsCitizenSelected ?? null,
        crsState: action.crsState ?? null,
        crsStateValue: action.crsStateValue ?? null,
        crsTin: action.crsTin ?? null,
        ekycRefId: action.ekycRefId ?? null,
        empType: action.empType ?? null,
        employerName: action.employerName ?? null,
        occupation: action.occupation ?? null,
        sector: action.sector ?? null,
        gender: action.gender ?? null,
        genderValue: action.genderValue ?? null,
        trinityFlag: action.trinityFlag ?? null,
        passportExpiry: action.passportExpiry ?? null,
        issuedCountry: action.issuedCountry ?? null,
        issuedCountryValue: action.issuedCountryValue ?? null,
        nationality: action.nationality ?? null,
        title: action.title ?? null,
        titleValue: action.titleValue ?? null,
        customerType: action.customerType ?? null,
        userId: action.userId ?? null,
        race: action.race ?? null,
        pep: action.pep ?? null,
        city: action.city ?? null,
        monthlyIncomeRange: action.monthlyIncomeRange ?? null,
        sourceOfFundCountry: action.sourceOfFundCountry ?? null,
        sourceOfFundCountryValue: action.sourceOfFundCountryValue ?? null,
        sourceOfFund: action.sourceOfFund ?? null,
        sourceOfFundValue: action.sourceOfFundValue ?? null,
        sourceOfWealth: action.sourceOfWealth ?? null,
        sourceOfWealthValue: action.sourceOfWealthValue ?? null,
        riskRating: action.riskRating ?? null,
        declarePdpaPromotion: action.declarePdpaPromotion ?? null,
        tc: action.tc ?? null,
        financialObjective: action.financialObjective ?? null,
        purpose: action.purpose ?? null,
        preferredBRState: action.preferredBRState ?? null,
        preferredBRStateValue: action.preferredBRStateValue ?? null,
        preferredBRDistrict: action.preferredBRDistrict ?? null,
        preferredBRDistrictValue: action.preferredBRDistrictValue ?? null,
        preferredBranch: action.preferredBranch ?? null,
        preferredBranchValue: action.preferredBranchValue ?? null,
        saFormSecurities: action.saFormSecurities ?? null,
        saFormInvestmentRisk: action.saFormInvestmentRisk ?? null,
        saFormInvestmentExp: action.saFormInvestmentExp ?? null,
        saFormInvestmentNature: action.saFormInvestmentNature ?? null,
        saFormInvestmentTerm: action.saFormInvestmentTerm ?? null,
        saFormProductFeature: action.saFormProductFeature ?? null,
        saFormPIDM: action.saFormPIDM ?? null,
        saFormSuitability: action.saFormSuitability ?? null,
        onBoardingStatusInfo: action.onBoardingStatusInfo ?? null,
        isZestI: action.isZestI ?? null,
        from: action.from ?? null,
        staffInd: action.staffInd ?? null,
    };
};

export const onBoardDetails = (action) => {
    return {
        fullName: action.customerName ?? null,
        mobileNumber: action.mobileNo ?? null,
    };
};

export const onBoardDetails2 = (action) => {
    return {
        idNo: action.idNo ?? null,
        userDOB: action.birthDate ?? null,
        maeCustomerInquiry: "response" ?? null,
        selectedIDCode: action.idNo ?? null,
        selectedIDType: action.selectedIDType ?? null,
        from: action.onBoardDetails2From ?? null,
        isZestI: action.isZestI ?? null,
        isPM1: action.isPM1 ?? null,
        isPMA: action.isPMA ?? null,
        isKawanku: action.isKawanku ?? null,
        isKawankuSavingsI: action.isKawankuSavingsI ?? null,
    };
};

export const onBoardDetails3 = (action) => {
    return {
        addressLine1: action.addr1 ?? null,
        addressLine2: action.addr2 ?? null,
        addressLine3: action.addr3 ?? null,
        city: action.city ?? null,
        stateCode: action.state ?? null,
        postcode: action.postCode ?? null,
    };
};

export const onBoardDetails4 = (action) => {
    return {
        emailAddress: action.customerEmail ?? null,
        inviteCode: "" ?? null,
    };
};

export const zestActivateAccountBody = (action) => {
    return {
        idType: action.idType ?? null,
        customerEmail: action.customerEmail ?? action.emailAddress,
        customerName: action.customerName ?? action.employerName,
        mobileNo: action.mobileNo ?? null,
        idNo: action.idNo ?? null,
        preOrPostFlag: action.preOrPostFlag ?? null,
        nationality: action.nationality ?? null,
        pdpa: action.pdpa ?? null,
        transactionType: action.transactionType ?? null,
        referalCode: action.referalCode ?? null,
        addr1: action.addr1 ?? null,
        addr2: action.addr2 ?? null,
        addr3: action.addr3 ?? null,
        custStatus: action.custStatus ?? null,
        m2uIndicator: action.m2uIndicator ?? null,
        pan: action.accessNo ?? null,
        postCode: action.postCode ?? null,
        state: action.state ?? null,
        stateValue: action.stateValue ?? null,
        fatcaStateValue: action.fatcaStateValue ?? null,
        ekycRefId: action.ekycRefId ?? null,
        empType: action.empType ?? null,
        empTypeValue: action.empTypeValue ?? null,
        occupation: action.occupation ?? null,
        occupationValue: action.occupationValue ?? null,
        employerName: action.employerName ?? null,
        sector: action.sector ?? null,
        sectorValue: action.sectorValue ?? null,
        gender: action.gender ?? null,
        genderValue: action.genderValue ?? null,
        passportExpiry: action.passportExpiry ?? null,
        issuedCountry: action.issuedCountry ?? null,
        issuedCountryValue: action.issuedCountryValue ?? null,
        title: action.title ?? null,
        titleValue: action.titleValue ?? null,
        race: action.race ?? null,
        raceValue: action.raceValue ?? null,
        pep: action.pep ?? "No",
        city: action.city ?? null,
        monthlyIncomeRange: action.monthlyIncomeRange ?? null,
        monthlyIncomeRangeValue: action.monthlyIncomeRangeValue ?? null,
        sourceOfFundCountry: action.sourceOfFundCountry ?? null,
        sourceOfFundCountryValue: action.sourceOfFundCountryValue ?? null,
        riskRating: action.riskRating ?? null,
        declarePdpaPromotion: action.declarePdpaPromotion ?? null,
        tc: action.tc ?? null,
        purpose: action.purpose ?? null,
        preferredBRDistrict: action.preferredBRDistrict ?? null,
        preferredBRState: action.preferredBRState ?? null,
        preferredBranch: action.preferredBranch ?? null,
        preferredBranchValue: action.preferredBranchValue ?? null,
        saFormInvestmentExp: action.saFormInvestmentExp ?? null,
        saFormInvestmentNature: action.saFormInvestmentNature ?? null,
        saFormInvestmentRisk: action.saFormInvestmentRisk ?? null,
        saFormInvestmentTerm: action.saFormInvestmentTerm ?? null,
        saFormPIDM: action.saFormPIDM ?? null,
        saFormProductFeature: action.saFormProductFeature ?? null,
        saFormSecurities: action.saFormSecurities ?? null,
        saFormSuitability: action.saFormSuitability ?? null,
        onBoardingStatusInfo: action.onBoardingStatusInfo ?? null,
        isZestI: action.isZestI ?? null,
        customerRiskRating: action.customerRiskRating ?? null,
        customerRiskRatingValue: action.customerRiskRatingValue ?? null,
        accountNumber: action.acctNo ?? null,
        assessmentId: action.assessmentId ?? null,
        screeningId: action.screeningId ?? null,
        sanctionsTagging: action.sanctionsTagging ?? null,
        sanctionsTaggingValue: action.sanctionsTaggingValue ?? null,
        gcif: action.gcif ?? null,
        universalCifNo: action.universalCifNo ?? null,
        primBitMap: action.primBitMap ?? null,
        numOfWatchlistHits: action.numOfWatchlistHits ?? null,
        sourceOfFund: action.sourceOfFund ?? null,
        sourceOfFundValue: action.sourceOfFundValue ?? null,
        sourceOfWealth: action.sourceOfWealth ?? null,
        sourceOfWealthValue: action.sourceOfWealthValue ?? null,
        nextReviewDate: action.nextReviewDate ?? null,
        finanicalObjective: action.finanicalObjective ?? null,
        finanicalObjectiveValue: action.finanicalObjectiveValue ?? null,
        staffInd: action.staffInd ?? null,
        // For ETB Only
        homeAddrIdentifier: action.homeAddrIdentifier ?? null,
        existingCasaAccount: action.existingCasaAccount ?? null,
        fromAccountCode: action.fromAccountCode ?? null,
        mobIdentifer: action.mobIdentifer ?? null,
        transferAmount: action.transferAmount ?? null,
        txRefNo: action.txRefNo ?? null,
    };
};

export const constructCardApplicationParams = (data, residentialDetailsReducer, reducer) => {
    console.log("[CardManagementController] >> [constructCardApplicationParams]");
    /*
     Need to enable for sept release
    const isValid = customerType === "10" || (data?.isETB && gcifData?.scoringInd === "N"); */
    return {
        // Address Screen Data
        address1: residentialDetailsReducer.addressLineOne ?? "",
        address2: residentialDetailsReducer.addressLineTwo ?? "",
        address3: residentialDetailsReducer.addressLineThree ?? "",
        address4: "",
        postalCode: residentialDetailsReducer.postalCode ?? "",
        state: residentialDetailsReducer.stateValue?.value ?? "",
        city: residentialDetailsReducer.city ?? "",

        // Personal Screen Data
        title: reducer?.title ?? "",
        gender: reducer?.gender ?? "",
        race: reducer?.race ?? "",
        residentialCountry: reducer?.nationality ?? "",
        purpose: reducer?.purpose ?? "",

        // Employment Screen Data
        empType: data?.empType ?? "",
        employerName: data?.employerName ?? "",
        monthlyIncome: data?.monthlyIncome ?? "",
        occupation: data?.occupation ?? "",
        occupationSector: data?.occupationSector ?? "",

        // PEP Screen Data
        pepDeclaration: reducer?.pep ?? "",
        sourceOfFundCountry: reducer?.sourceOfFund ?? "",

        // High Risk Screen Data
        sourceOfFundOrigin: reducer?.sourceOfFundOrigin ?? "",
        sourceOfWealthOrigin: reducer?.sourceOfWealthOrigin ?? "",

        // Others
        maeAcctNo: data.cardDetails?.maeAcctNo ?? "",
        transactionType: "applymaecard",
        ekycRefId: data?.ekycRefId ?? "",
        mobileSDKData: data?.mobileSDKData ?? {},
    };
};

export const applyDebitCardBody = (action, selectDebitCardReducer, tac, accountNumber) => {
    return {
        MAEAcctNo: `${accountNumber}      ${selectDebitCardReducer?.debitCardValue?.obj?.plasticType}`,
        Add1: action?.addressLineOne,
        Add2: action?.addressLineTwo,
        Add3: action?.city,
        Add4: action?.stateValue?.name,
        PosCod: action?.postalCode,
        Gender: "",
        Race: "",
        Occ: "",
        OccSec: "",
        MonthlyInc: "",
        Title: "",
        EmpTyp: "",
        EmpNam: "",
        ResCountry: "",
        TACLen: "00",
        TAC: tac,
        ActionCode: "000",
    };
};

export const activateDebitCardBody = (
    tac,
    accountNumber,
    pinBlock,
    hsmTpk,
    debitCardLast8Digit
) => {
    return {
        AcctId: accountNumber,
        TACLength: "06",
        TAC: tac,
        PINBlock: pinBlock,
        clearTPK: hsmTpk,
        debitCardLastEightDigit: debitCardLast8Digit,
    };
};
