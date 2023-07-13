import moment from "moment";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { StyleSheet, View, ScrollView, Platform, Image, FlatList } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { checkS2UStatus } from "@screens/Premier/helpers/premierHelpers";

import {
    ZEST_CASA_EDIT_CASA_TRANSFER_AMOUNT,
    ZEST_CASA_OTP_VERIFICATION,
    ZEST_CASA_SELECT_CASA,
    ZEST_CASA_STACK,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import BorderedAvatar from "@components/Avatars/BorderedAvatar";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import {
    SELECT_CASA_ACTION,
    SELECT_CASA_CLEAR,
    SELECT_CASA_CONTINUE_BUTTON_DISABLED_ACTION,
} from "@redux/actions/ZestCASA/selectCASAAction";
import { ZEST_CASA_ACTIVATE_ACCOUNT_BODY } from "@redux/actions/services/activateAccountAction";
import { zestActivateAccountBody } from "@redux/utilities/actionUtilities";

import { YELLOW, DISABLED, SEPARATOR_GRAY, ROYAL_BLUE } from "@constants/colors";
import { S2U_PULL } from "@constants/data";
import { FN_FUND_TRANSFER_ZESTI, FN_FUND_TRANSFER_M2U_PREMIUM } from "@constants/fundConstants";
import { INSUFFICIENT_BALANCE } from "@constants/premierStrings";
import {
    AGREE,
    CONFIRMATION,
    CURRENCY,
    DATE,
    M2U_PREMIER,
    NO,
    PAY_NOW,
    TRANSFER_FROM,
    YES,
    ZEST,
    ACCOUNT,
} from "@constants/strings";
import {
    MYKAD_CODE,
    PASSPORT_CODE,
    PRE_QUAL_POST_LOGIN_FLAG,
    ZEST_CASA_CLEAR_ALL,
    ZESTI_STP_VERIFY,
} from "@constants/zestCasaConfiguration";

import * as DataModel from "@utils/dataModel";

import Assets from "@assets";

import { entryPropTypes } from "./ZestCASAEntry";
import { CASAAccountSelector } from "./components/CASAAccountSelector";
import {
    TRANSFER_M2UPREMIER_REVIEWDEATILS,
    TRANSFER_ZESTI_REVIEWDEATILS,
} from "./helpers/AnalyticsEventConstants";

const ZestCASASelectCASA = (props) => {
    const { navigation, route } = props;
    const params = route?.params ?? {};

    // Hooks to access reducer data
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const identityDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.identityDetailsReducer
    );
    const personalDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.personalDetailsReducer
    );
    const residentialDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.residentialDetailsReducer
    );
    const employmentDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.employmentDetailsReducer
    );
    const declarationReducer = useSelector((state) => state.zestCasaReducer.declarationReducer);
    const suitabilityAssessmentReducer = useSelector(
        (state) => state.zestCasaReducer.suitabilityAssessmentReducer
    );
    const accountDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.accountDetailsReducer
    );
    const additionalDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.additionalDetailsReducer
    );
    const selectCASAReducer = useSelector((state) => state.zestCasaReducer.selectCASAReducer);
    const editCASATransferAmountReducer = useSelector(
        (state) => state.zestCasaReducer.editCASATransferAmountReducer
    );
    const masterDataReducer = useSelector((state) => state.masterDataReducer);
    const getAccountListReducer = useSelector((state) => state.getAccountListReducer);
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    const scorePartyReducer = useSelector((state) => state.scorePartyReducer);

    const { accountListings } = getAccountListReducer ?? [];
    const { isZest } = entryReducer;
    const { zestActivationAmountETB, m2uPremierActivationAmountETB } = masterDataReducer;
    const { isSelectCASAContinueButtonEnabled, accountIndex, accountCode, accountNumber } =
        selectCASAReducer;
    const { validTransferAmount } = editCASATransferAmountReducer;

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    useEffect(() => {
        init();
        console.log("selectCASAReducer--", selectCASAReducer);
    }, []);

    useEffect(() => {
        dispatch({ type: SELECT_CASA_CONTINUE_BUTTON_DISABLED_ACTION });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountIndex, accountCode, accountNumber]);

    const init = async () => {
        console.log("[ZestCASASelectCASA] >> [init]");
        const firstAccount = accountListings[0];
        const accountCode = firstAccount.code;
        const accountNumberWithPaddingRemoved = firstAccount.number.substring(0, 12);

        dispatch({
            type: SELECT_CASA_ACTION,
            accountIndex: 0,
            accountCode,
            accountNumber: accountNumberWithPaddingRemoved,
        });
    };

    function onCloseTap() {
        console.log("[ZestCASASelectCASA] >> [onCloseTap]");
        dispatch({ type: SELECT_CASA_CLEAR });
        dispatch({ type: ZEST_CASA_CLEAR_ALL });
        navigation.popToTop();
        navigation.goBack();
    }

    function onAmountTextDidTap() {
        console.log("[ZestCASASelectCASA] >> [onAmountTextDidTap]");
        navigation.navigate(ZEST_CASA_EDIT_CASA_TRANSFER_AMOUNT);
    }

    function onPayNowButtonDidTap() {
        console.log("[ZestCASASelectCASA] >> [onPayNowButtonDidTap]");
        const selectedAccount = accountListings[accountIndex];
        const selectedAccTransferAmount = transferAmount();
        if (
            selectedAccount?.value >= Number(validTransferAmount) &&
            selectedAccount?.value >= Number(selectedAccTransferAmount)
        ) {
            if (isSelectCASAContinueButtonEnabled) {
                dispatchActivateAccountBody((state) => {
                    const dataActivateAccount = zestActivateAccountBody(state);
                    const s2uBody = {
                        totalAmount: selectedAccTransferAmount,
                        MAEAcctNo: DataModel.spaceBetweenChar(accountNumber),
                        fromProductName: selectedAccount ? selectedAccount.name : null,
                        productName: isZest ? ZEST + " " + ACCOUNT : M2U_PREMIER,
                        activateAccountReq: {
                            ...dataActivateAccount,
                            productName: accountTypeTitle(),
                        },
                        otpInput: JSON.stringify({
                            mobileNo: state?.mobileNo,
                            idNumber: state?.idNo,
                            otp: "",
                            transactionType: ZESTI_STP_VERIFY,
                            preOrPostFlag: PRE_QUAL_POST_LOGIN_FLAG,
                            idNo: state?.idNo,
                            productName: accountTypeTitle(),
                        }),
                    };
                    const extraData = {
                        fundConstant: isZest
                            ? FN_FUND_TRANSFER_ZESTI
                            : FN_FUND_TRANSFER_M2U_PREMIUM,
                        stack: ZEST_CASA_STACK,
                        screen: ZEST_CASA_SELECT_CASA,
                    };
                    checkS2UStatus(
                        navigation.navigate,
                        params,
                        (type, mapperData, timeStamp) => {
                            if (type === S2U_PULL) {
                                navigation.navigate(ZEST_CASA_OTP_VERIFICATION, {
                                    s2u: true,
                                    mapperData,
                                    timeStamp,
                                });
                            } else {
                                navigation.navigate(ZEST_CASA_OTP_VERIFICATION, { s2u: false });
                            }
                        },
                        extraData,
                        s2uBody
                    );
                });
            }
        } else {
            showErrorToast({
                message: INSUFFICIENT_BALANCE,
            });
        }
    }

    function dispatchActivateAccountBody(callback) {
        const body = {
            idType: idType(),
            customerEmail: prePostQualReducer.customerEmail ?? prePostQualReducer.emailAddress,
            customerName: identityDetailsReducer?.fullName ?? prePostQualReducer?.customerName,
            mobileNo: personalDetailsReducer.mobileNumberWithExtension,
            idNo: prePostQualReducer.idNo,
            preOrPostFlag: PRE_QUAL_POST_LOGIN_FLAG,
            nationality: prePostQualReducer.countryOfBirthValue,
            pdpa: declarationReducer.privacyPolicy,
            addr1: residentialDetailsReducer.addressLineOne,
            addr2: residentialDetailsReducer.addressLineTwo,
            addr3: residentialDetailsReducer.addressLineThree,
            custStatus: prePostQualReducer.custStatus,
            m2uIndicator: prePostQualReducer.m2uIndicator,
            postCode: residentialDetailsReducer.postalCode,
            state: residentialDetailsReducer.stateValue?.value,
            stateValue: residentialDetailsReducer.stateValue?.name,
            fatcaStateValue: declarationReducer.fatcaStateDeclaration,
            empType: employmentDetailsReducer.employmentTypeValue?.value,
            empTypeValue: employmentDetailsReducer.employmentTypeValue?.name,
            occupation: employmentDetailsReducer.occupationValue?.value,
            occupationValue: employmentDetailsReducer.occupationValue?.name,
            employerName: employmentDetailsReducer.employerName,
            sector: employmentDetailsReducer.sectorValue?.value,
            sectorValue: employmentDetailsReducer.sectorValue?.name,
            gender: prePostQualReducer.genderCode,
            genderValue: prePostQualReducer.genderValue,
            passportExpiry:
                identityDetailsReducer.identityType === 1 ? "" : prePostQualReducer.idExpiryDate,
            issuedCountry: prePostQualReducer.idIssuedCountryCode,
            issuedCountryValue: prePostQualReducer.idIssuedCountryValue,
            title: prePostQualReducer.title ?? prePostQualReducer.salutationCode,
            titleValue: prePostQualReducer.titleValue ?? prePostQualReducer.salutationValue,
            customerType: prePostQualReducer.type,
            race: prePostQualReducer.raceCode,
            raceValue: prePostQualReducer.raceValue,
            pep: prePostQualReducer.pep ?? prePostQualReducer.pepDeclare,
            city: residentialDetailsReducer.city,
            monthlyIncomeRange: employmentDetailsReducer.monthlyIncomeValue?.value,
            monthlyIncomeRangeValue: employmentDetailsReducer.monthlyIncomeValue?.name,
            sourceOfFundCountry: employmentDetailsReducer.incomeSourceValue?.value,
            sourceOfFundCountryValue: employmentDetailsReducer.incomeSourceValue?.name,
            declarePdpaPromotion: declarationReducer.isAgreeToBeContacted,
            tc: declarationReducer.termsAndConditions,
            purpose: accountDetailsReducer.accountPurposeValue?.value,
            preferredBRDistrict: accountDetailsReducer.branchDistrictValue?.value,
            preferredBRState: accountDetailsReducer.branchStateValue?.value,
            preferredBranch: accountDetailsReducer.branchValue?.branchCode,
            preferredBranchValue: accountDetailsReducer.branchValue?.name,
            saFormInvestmentExp:
                prePostQualReducer.saFormInvestmentExp ??
                suitabilityAssessmentReducer.hasInvestmentExperience
                    ? YES
                    : NO,
            saFormInvestmentNature:
                prePostQualReducer.saFormInvestmentNature ??
                suitabilityAssessmentReducer.hasUnderstoodInvestmentAccount
                    ? YES
                    : NO,
            saFormInvestmentRisk:
                prePostQualReducer.saFormInvestmentRisk ??
                suitabilityAssessmentReducer.hasRelevantKnowledge
                    ? YES
                    : NO,
            saFormInvestmentTerm:
                prePostQualReducer.saFormInvestmentTerm ??
                suitabilityAssessmentReducer.hasUnderstoodAccountTerms
                    ? YES
                    : NO,
            saFormSecurities:
                prePostQualReducer.saFormSecurities ??
                suitabilityAssessmentReducer.hasDealtWithSecurities
                    ? YES
                    : NO,
            saFormPIDM: prePostQualReducer.saFormPIDM ?? AGREE,
            saFormProductFeature: prePostQualReducer.saFormProductFeature ?? AGREE,
            saFormSuitability: prePostQualReducer.saFormSuitability ?? AGREE,
            onBoardingStatusInfo: prePostQualReducer.onBoardingStatusInfo,
            isZestI: isZest,
            customerRiskRating: scorePartyReducer.customerRiskRatingCode,
            customerRiskRatingValue: scorePartyReducer.customerRiskRatingValue,
            assessmentId: scorePartyReducer.assessmentId,
            screeningId: prePostQualReducer.screeningId,
            sanctionsTagging: scorePartyReducer.sanctionsTaggingCode,
            sanctionsTaggingValue: scorePartyReducer.sanctionsTaggingValue,
            gcif: prePostQualReducer.gcif,
            universalCifNo: prePostQualReducer.universalCifNo,
            numOfWatchlistHits: scorePartyReducer.numOfWatchlistHits,
            sourceOfFund: additionalDetailsReducer.primaryIncomeValue?.value,
            sourceOfFundValue: additionalDetailsReducer.primaryIncomeValue?.name,
            sourceOfWealth: additionalDetailsReducer.primaryWealthValue?.value,
            sourceOfWealthValue: additionalDetailsReducer.primaryWealthValue?.name,
            nextReviewDate: scorePartyReducer.nextReviewDate,
            finanicalObjective:
                prePostQualReducer.finanicalObjective ??
                suitabilityAssessmentReducer.financialObjectiveValue?.value,
            finanicalObjectiveValue:
                prePostQualReducer.finanicalObjectiveValue ??
                suitabilityAssessmentReducer.financialObjectiveValue?.name,
            homeAddrIdentifier: prePostQualReducer.homeAddrIdentifier,
            existingCasaAccount: selectCASAReducer.accountNumber,
            fromAccountCode: selectCASAReducer.accountCode,
            mobIdentifer: prePostQualReducer.mobIdentifer,
            transferAmount: transferAmount(),
        };
        dispatch({
            type: ZEST_CASA_ACTIVATE_ACCOUNT_BODY,
            state: body,
        });

        if (callback) {
            callback(body);
        }
    }

    function onAccountTileDidTap(index, accountCode, accountNumber) {
        console.log("[ZestCASASelectCASA] >> [onAccountTileDidTap]");
        dispatch({
            type: SELECT_CASA_ACTION,
            accountIndex: index,
            accountCode,
            accountNumber,
        });
    }

    function keyExtractor(item) {
        return `${item.number}`;
    }

    const formattedCurrentDate = () => moment(new Date()).format("DD MMM YYYY");

    const accountTypeTitle = () => (isZest ? ZEST : M2U_PREMIER);

    const transferAmountWithCurrencyCode = () => {
        if (validTransferAmount) {
            return `${CURRENCY}${validTransferAmount}`;
        } else {
            return `${CURRENCY}${
                isZest
                    ? zestActivationAmountETB ?? "50.00"
                    : m2uPremierActivationAmountETB ?? "500.00"
            }`;
        }
    };

    const transferAmount = () => {
        if (validTransferAmount) {
            return validTransferAmount;
        } else {
            return isZest
                ? zestActivationAmountETB ?? "50.00"
                : m2uPremierActivationAmountETB ?? "500.00";
        }
    };

    const idType = () =>
        prePostQualReducer.idType ?? identityDetailsReducer.identityType == 1
            ? MYKAD_CODE
            : PASSPORT_CODE;

    const analyticScreenName = isZest
        ? TRANSFER_ZESTI_REVIEWDEATILS
        : TRANSFER_M2UPREMIER_REVIEWDEATILS;

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName={analyticScreenName}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={20}
                                    textAlign="center"
                                    text={CONFIRMATION}
                                />
                            }
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KeyboardAwareScrollView
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                            >
                                <View style={Style.formContainer}>
                                    <View style={Style.contentContainer}>
                                        <View style={Style.bankIconAlignment}>
                                            <BorderedAvatar
                                                width={64}
                                                height={64}
                                                borderRadius={32}
                                            >
                                                <Image
                                                    style={Style.avatarImage}
                                                    source={Assets.MAYBANK}
                                                />
                                            </BorderedAvatar>
                                        </View>
                                        <SpaceFiller height={10} />
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            textAlign="center"
                                            text={accountTypeTitle()}
                                        />
                                        <SpaceFiller height={16} />
                                        <TouchableOpacity onPress={onAmountTextDidTap}>
                                            <Typo
                                                fontSize={24}
                                                fontWeight="700"
                                                lineHeight={31}
                                                textAlign="center"
                                                color={ROYAL_BLUE}
                                                text={transferAmountWithCurrencyCode()}
                                            />
                                        </TouchableOpacity>
                                        <SpaceFiller height={16} />
                                        <View style={Style.rowedContainer}>
                                            <View style={Style.descriptionBox}>
                                                <Typo
                                                    fontSize={12}
                                                    fontWeight="400"
                                                    lineHeight={18}
                                                    textAlign="left"
                                                    text={DATE}
                                                />
                                            </View>
                                            <View style={Style.dataBox}>
                                                <Typo
                                                    fontSize={12}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    text={formattedCurrentDate()}
                                                />
                                            </View>
                                        </View>
                                        <SpaceFiller height={16} />
                                        <View style={Style.separator} />
                                        <SpaceFiller height={16} />
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            textAlign="left"
                                            text={TRANSFER_FROM}
                                        />
                                    </View>
                                    {accountListings && accountListings.length > 0 && (
                                        <React.Fragment>
                                            <FlatList
                                                data={accountListings}
                                                renderItem={renderAccountSelectorItem}
                                                horizontal={true}
                                                showsHorizontalScrollIndicator={false}
                                                keyExtractor={keyExtractor}
                                                contentContainerStyle={Style.flatlistContainer}
                                            />
                                        </React.Fragment>
                                    )}
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={isSelectCASAContinueButtonEnabled ? 1 : 0.5}
                                    backgroundColor={
                                        isSelectCASAContinueButtonEnabled ? YELLOW : DISABLED
                                    }
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={PAY_NOW}
                                        />
                                    }
                                    onPress={onPayNowButtonDidTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );

    function renderAccountSelectorItem({ index, item }) {
        const accountNumberWithPaddingRemoved = item.number.substring(0, 12);

        return (
            <CASAAccountSelector
                accountCode={item.code}
                accountName={item.name}
                accountBalance={item.balance}
                accountNumber={accountNumberWithPaddingRemoved}
                accountIndex={index}
                selectedIndex={accountIndex}
                onAccountTileDidTap={onAccountTileDidTap}
            />
        );
    }
};

const Style = StyleSheet.create({
    avatarImage: {
        borderRadius: 32,
        height: 64,
        width: 64,
    },
    bankIconAlignment: {
        alignItems: "center",
    },

    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },

    dataBox: {
        width: 160,
    },

    descriptionBox: {
        width: 153,
    },

    flatlistContainer: {
        paddingHorizontal: 24,
    },

    formContainer: {
        marginBottom: 40,
    },

    rowedContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    separator: {
        backgroundColor: SEPARATOR_GRAY,
        height: 1,
        width: "100%",
    },
});

export const selectCASAPropTypes = (ZestCASASelectCASA.propTypes = {
    ...entryPropTypes,

    item: PropTypes.object,
    index: PropTypes.number,
    isSecure2uVisible: PropTypes.bool,
});

export default ZestCASASelectCASA;
