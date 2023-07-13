import React from "react";
import { StyleSheet, View, ScrollView, Platform, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import {
    accountBasedOnModuleFlag,
    getAnalyticScreenName,
} from "@screens/Premier/helpers/premierHelpers";

import {
    ACCOUNTS_SCREEN,
    APPLY_MAE_SCREEN,
    SETTINGS_MODULE,
    PREMIER_ACTIVATE_ACCOUNT,
    PREMIER_BRANCH_ACTIVATION,
    PREMIER_ACTIVATION_SUCCESS,
    DASHBOARD,
    MAE_MODULE_STACK,
    PREMIER_ACTIVATION_PENDING,
} from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { logEvent } from "@services/analytics";

import { DRAFT_USER_ACCOUNT_INQUIRY_UPDATE_ACCOUNT_NUMBER } from "@redux/actions/services/draftUserAccountInquiryAction";
import { draftUserAccountInquiryPremier } from "@redux/services/Premier/apiDraftUserAccountInquiry";
import { onBoardDetails, onBoardDetails3, onBoardDetails4 } from "@redux/utilities/actionUtilities";

import { ROYAL_BLUE, TRANSPARENT } from "@constants/colors";
import {
    HIGH_RISK_CUSTOMER_CODE,
    M2U_SCREEN_SCORE_EXCEPTION,
    MYKAD_CODE,
    MYKAD_ID_TYPE,
    PREMIER_PRE_QUAL_POST_LOGIN_FLAG,
    PREMIER_CLEAR_ALL,
} from "@constants/premierConfiguration";
import {
    KAWANKU_SAVINGS_PRODUCT_NAME,
    KAWANKU_SAVINGSI_PRODUCT_NAME,
    PM1ENTRYREDUCER,
    PMAENTRYREDUCER,
} from "@constants/premierStrings";
import { PREMIER_RESUME_NTB_ACCOUNT_INQUIRY } from "@constants/premierUrl";
import {
    ACCOUNT,
    ACCOUNT_ACTIVATION,
    APPLICATION_SUCCESSFUL,
    CLICK_CONTINUE_PROCEED,
    CONTINUE,
    EZYQ,
    FA_ACTION_NAME,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    LATER,
    PENDING_ACTIVATION,
    YOU_HAVE_A,
    ZEST_CASA_VISIT_BRANCH_DESCRIPTION,
} from "@constants/strings";
import { EZYQ_URL } from "@constants/url";

import { isPureHuawei } from "@utils/checkHMSAvailability";
import { retrieveuserDOB } from "@utils/momentUtils";

import { entryPropTypes } from "./PM1IntroScreen";
import { APPLY_M2U_COMPLETED, MAKE_AN_APPOINTMENT } from "./helpers/AnalyticsEventConstants";

const PremierActivationPending = (props) => {
    const { navigation } = props;
    const { getModel } = useModelController();
    const { isZoloz } = getModel("misc");
    // Hooks to access reducer data
    const identityDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.identityDetailsReducer
    );
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    const getAccountListReducer = useSelector((state) => state.getAccountListReducer);
    const draftUserAccountInquiryReducer = useSelector(
        (state) => state.draftUserAccountInquiryReducer
    );

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    const { accountListings } = getAccountListReducer ?? [];
    const { identityNumber } = identityDetailsReducer;
    const { customerStatus, gcif, userStatus, universalCifNo, m2uIndicator } = prePostQualReducer;
    const { pan } = draftUserAccountInquiryReducer;
    const account = accountBasedOnModuleFlag(getProductName(entryReducer), accountListings);
    const accountNumber = account?.number.substring(0, 12);

    function getProductName(entryReducer) {
        if (entryReducer.isPM1) {
            return PM1ENTRYREDUCER;
        } else if (entryReducer.isPMA) {
            return PMAENTRYREDUCER;
        } else if (entryReducer.isKawanku) {
            return KAWANKU_SAVINGS_PRODUCT_NAME;
        } else if (entryReducer.isKawankuSavingsI) {
            return KAWANKU_SAVINGSI_PRODUCT_NAME;
        }
    }
    function onBackTap() {
        console.log("[PremierActivationPending] >> [onBackTap]");
        dispatch({ type: PREMIER_CLEAR_ALL });
        navigation.navigate(DASHBOARD);
    }

    function onContinueButtonDidTap() {
        console.log("[PremierActivationPending] >> [onDoneButtonDidTap]");

        dispatch({ type: DRAFT_USER_ACCOUNT_INQUIRY_UPDATE_ACCOUNT_NUMBER, acctNo: accountNumber });
        callDraftUserAccountInquiryService();
    }

    function onLaterButtonDidTap() {
        console.log("[PremierActivationPending] >> [onCancelButtonDidTap]");
        dispatch({ type: PREMIER_CLEAR_ALL });
        navigation.navigate(DASHBOARD);
    }

    function onBookAppointmentButtonDidTap() {
        console.log("[PremierActivationPending] >> [onBookAppointmentButtonDidTap]");
        const title = EZYQ;
        const url = `${EZYQ_URL}?serviceNum=2`;

        const props = {
            title,
            source: url,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }

    async function callDraftUserAccountInquiryService() {
        const accountInquiryBody = {
            idType: MYKAD_CODE,
            birthDate: "",
            preOrPostFlag: PREMIER_PRE_QUAL_POST_LOGIN_FLAG,
            icNo: identityNumber,
            universalCifNo,
            gcif,
            acctNo: accountNumber,
            customerStatus,
            productName: getProductName(entryReducer),
        };

        dispatch(
            draftUserAccountInquiryPremier(
                PREMIER_RESUME_NTB_ACCOUNT_INQUIRY,
                accountInquiryBody,
                (result, error) => {
                    if (result) {
                        const { scorePartyResult = {} } = result;
                        if (
                            scorePartyResult.customerRiskRatingCode === HIGH_RISK_CUSTOMER_CODE ||
                            scorePartyResult.numOfWatchlistHits > 0 ||
                            (isPureHuawei && !isZoloz)
                        ) {
                            navigation.navigate(PREMIER_ACTIVATION_SUCCESS, {
                                title: APPLICATION_SUCCESSFUL,
                                description: ZEST_CASA_VISIT_BRANCH_DESCRIPTION,
                                isHighRiskUser: true,
                                isHighRiskUserResume: true,
                                onBookAppointmentButtonDidTap: () => {
                                    logEvent(FA_SELECT_ACTION, {
                                        [FA_SCREEN_NAME]: APPLY_M2U_COMPLETED,
                                        [FA_ACTION_NAME]: MAKE_AN_APPOINTMENT,
                                    });
                                    onBookAppointmentButtonDidTap();
                                },
                                analyticScreenName: APPLY_M2U_COMPLETED,
                                needFormAnalytics: true,
                            });
                        } else {
                            const createFilledUserDetailsObjectHeader =
                                createFilledUserDetailsObject(result.idNo);
                            const { ekycDone } = result;
                            navigateBasedOnEKYCFlag(ekycDone, createFilledUserDetailsObjectHeader);
                        }
                    } else {
                        if (error && error?.code === M2U_SCREEN_SCORE_EXCEPTION) {
                            navigation.navigate(PREMIER_BRANCH_ACTIVATION, {
                                onMaybeLaterButtonDidTap: () => {
                                    navigation.popToTop();
                                    navigation.goBack();
                                },
                            });
                        }
                    }
                },
                m2uIndicator
            )
        );
    }

    function createFilledUserDetailsObject(identityNumber) {
        const { fullName } = getModel("user");

        const onBoardDetails2 = {
            idNo: identityNumber,
            userDOB: retrieveuserDOB(identityNumber.substring(0, 6)),
            maeCustomerInquiry: null,
            selectedIDCode: identityNumber,
            selectedIDType: MYKAD_ID_TYPE,
            from: userStatus,
            isPM1: entryReducer.isPM1,
            isPMA: entryReducer.isPMA,
            isKawanku: entryReducer.isKawanku,
            isKawankuSavingsI: entryReducer.isKawankuSavingsI,
            productName: getProductName(entryReducer),
        };

        const details = {
            entryScreen: ACCOUNTS_SCREEN,
            onBoardDetails: onBoardDetails(draftUserAccountInquiryReducer),
            onBoardDetails2,
            onBoardDetails3: onBoardDetails3(draftUserAccountInquiryReducer),
            onBoardDetails4: onBoardDetails4(draftUserAccountInquiryReducer),
            accountNumber,
            pan,
        };

        const onBoardDetailsWithoutFullName = details.onBoardDetails;

        const onBoardDetailsWithFullName = {
            ...onBoardDetailsWithoutFullName,
            fullName,
        };

        return {
            ...details,
            onBoardDetails: onBoardDetailsWithFullName,
        };
    }

    function getSceneCode(onBoardDetails2) {
        if (onBoardDetails2?.isPM1) {
            return "PM1";
        } else if (onBoardDetails2?.isPMA) {
            return "PMAI";
        } else if (onBoardDetails2?.isKawanku) {
            return "KAWANKU";
        } else if (onBoardDetails2?.isKawankuSavingsI) {
            return "SAI";
        }
    }

    function navigateBasedOnEKYCFlag(eKYCFlag, createFilledUserDetailsObjectHeader) {
        if (eKYCFlag) {
            navigation.navigate(PREMIER_ACTIVATE_ACCOUNT);
        } else if (isPureHuawei && !isZoloz) {
            navigation.navigate(PREMIER_ACTIVATION_SUCCESS, {
                title: APPLICATION_SUCCESSFUL,
                description: ZEST_CASA_VISIT_BRANCH_DESCRIPTION,
                isHighRiskUser: true,
                isHighRiskUserResume: true,
                onBookAppointmentButtonDidTap: () => {
                    logEvent(FA_SELECT_ACTION, {
                        [FA_SCREEN_NAME]: APPLY_M2U_COMPLETED,
                        [FA_ACTION_NAME]: MAKE_AN_APPOINTMENT,
                    });
                    onBookAppointmentButtonDidTap();
                },
                analyticScreenName: APPLY_M2U_COMPLETED,
                needFormAnalytics: true,
            });
        } else {
            const filledUserDetails = createFilledUserDetailsObjectHeader;
            const {
                onBoardDetails,
                onBoardDetails2,
                entryStack,
                entryScreen,
                entryParams,
                pan,
                accountNumber,
            } = filledUserDetails;
            const eKycParams = {
                selectedIDType: onBoardDetails2?.selectedIDType,
                entryStack,
                entryScreen,
                entryParams,
                from: onBoardDetails2?.from,
                idNo: onBoardDetails2?.idNo,
                fullName: onBoardDetails?.fullName,
                pan,
                accountNumber,
                reqType: "E01",
                isNameCheck: false,
                sceneCode: getSceneCode(onBoardDetails2),
                isPM1: entryReducer.isPM1,
                isPMA: entryReducer.isPMA,
                isKawanku: entryReducer?.isKawanku,
                isKawankuSavingsI: entryReducer?.isKawankuSavingsI,
            };
            navigation.navigate(MAE_MODULE_STACK, {
                screen: APPLY_MAE_SCREEN,
                params: {
                    filledUserDetails,
                    eKycParams,
                },
            });
        }
    }

    const analyticScreenName = getAnalyticScreenName(entryReducer, PREMIER_ACTIVATION_PENDING, "");

    const screenDescription = () =>
        `${YOU_HAVE_A} ${ACCOUNT.toLowerCase()}: ${accountNumber} ${PENDING_ACTIVATION.toLowerCase()}. ${CLICK_CONTINUE_PROCEED}.`;

    return (
        <ScreenContainer backgroundType="color" analyticScreenName={analyticScreenName}>
            <ScreenLayout
                header={
                    <HeaderLayout headerLeftElement={<HeaderBackButton onPress={onBackTap} />} />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                useSafeArea
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    <KeyboardAwareScrollView
                        behavior={Platform.OS === "ios" ? "padding" : ""}
                        enabled
                    >
                        <View style={Style.formContainer}>
                            <View style={Style.contentContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={21}
                                    textAlign="left"
                                    text={ACCOUNT_ACTIVATION}
                                />
                                <SpaceFiller height={8} />
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={22}
                                    textAlign="left"
                                    text={screenDescription()}
                                />
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </ScrollView>
                <FixedActionContainer>
                    <View style={Style.buttonContainer}>
                        <View style={Style.bottomBtnContCls}>
                            <ActionButton
                                fullWidth
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text={CONTINUE}
                                    />
                                }
                                onPress={onContinueButtonDidTap}
                            />
                        </View>
                        <SpaceFiller height={16} />
                        <View style={Style.bottomBtnContCls}>
                            <TouchableOpacity onPress={onLaterButtonDidTap}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    textAlign="left"
                                    color={ROYAL_BLUE}
                                    text={LATER}
                                />
                            </TouchableOpacity>
                        </View>
                        <SpaceFiller height={16} />
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
};

export const activationPendingPropTypes = (PremierActivationPending.propTypes = {
    ...entryPropTypes,
});

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    buttonContainer: {
        flexDirection: "column",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },

    formContainer: {
        marginBottom: 40,
    },
});

export default PremierActivationPending;
