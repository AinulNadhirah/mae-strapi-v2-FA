import React, { useEffect } from "react";
import { StyleSheet, View, ScrollView, Platform, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import {
    ACCOUNTS_SCREEN,
    APPLY_MAE_SCREEN,
    DASHBOARD,
    MAE_MODULE_STACK,
    SETTINGS_MODULE,
    ZEST_CASA_ACTIVATE_ACCOUNT,
    ZEST_CASA_BRANCH_ACTIVATION,
    ZEST_CASA_SUCCESS,
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
import { draftUserAccountInquiry } from "@redux/services/apiDraftUserAccountInquiry";
import { onBoardDetails, onBoardDetails3, onBoardDetails4 } from "@redux/utilities/actionUtilities";

import { ROYAL_BLUE, TRANSPARENT } from "@constants/colors";
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
    M2UPRSCENECODE,
    M2U_PREMIER,
    PENDING_ACTIVATION,
    YOU_HAVE_A,
    ZEST,
    ZESTSCENECODE,
    ZEST_CASA_VISIT_BRANCH_DESCRIPTION,
} from "@constants/strings";
import { EZYQ_URL, ZEST_CASA_RESUME_NTB_ACCOUNT_INQUIRY } from "@constants/url";
import {
    HIGH_RISK_CUSTOMER_CODE,
    M2U_SCREEN_SCORE_EXCEPTION,
    MYKAD_CODE,
    MYKAD_ID_TYPE,
    PRE_QUAL_POST_LOGIN_FLAG,
    ZEST_CASA_CLEAR_ALL,
} from "@constants/zestCasaConfiguration";

import { retrieveuserDOB } from "@utils/momentUtils";

import { entryPropTypes } from "./ZestCASAEntry";
import {
    APPLY_ACTIVATE_ZESTI_ACCOUNT_ACTIVATION,
    APPLY_M2U_COMPLETED,
    MAKE_AN_APPOINTMENT,
} from "./helpers/AnalyticsEventConstants";
import { accountBasedOnModuleFlag } from "./helpers/ZestHelpers";

const ZestCASAActivationPending = (props) => {
    const { navigation } = props;
    const { getModel } = useModelController();

    // Hooks to access reducer data
    const identityDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.identityDetailsReducer
    );
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    const getAccountListReducer = useSelector((state) => state.getAccountListReducer);
    const draftUserAccountInquiryReducer = useSelector(
        (state) => state.draftUserAccountInquiryReducer
    );

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    const { accountListings } = getAccountListReducer ?? [];
    const { identityNumber } = identityDetailsReducer;
    const { customerStatus, gcif, isZestI, userStatus, universalCifNo, m2uIndicator } =
        prePostQualReducer;
    const { pan } = draftUserAccountInquiryReducer;
    const account = accountBasedOnModuleFlag(isZestI, accountListings);
    const accountNumber = account?.number.substring(0, 12);

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        console.log("[ZestCASAActivationPending] >> [init]");
    };

    function onBackTap() {
        console.log("[ZestCASAActivationPending] >> [onBackTap]");
        dispatch({ type: ZEST_CASA_CLEAR_ALL });
        navigation.navigate(DASHBOARD);
    }

    function onContinueButtonDidTap() {
        console.log("[ZestCASAActivationPending] >> [onDoneButtonDidTap]");

        dispatch({ type: DRAFT_USER_ACCOUNT_INQUIRY_UPDATE_ACCOUNT_NUMBER, acctNo: accountNumber });
        callDraftUserAccountInquiryService();
    }

    function onLaterButtonDidTap() {
        console.log("[ZestCASAActivationPending] >> [onCancelButtonDidTap]");
        dispatch({ type: ZEST_CASA_CLEAR_ALL });
        navigation.navigate(DASHBOARD);
    }

    function onBookAppointmentButtonDidTap() {
        console.log("[ZestCASABranchActivation] >> [onBookAppointmentButtonDidTap]");
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
            preOrPostFlag: PRE_QUAL_POST_LOGIN_FLAG,
            icNo: identityNumber,
            universalCifNo,
            gcif,
            acctNo: accountNumber,
            customerStatus,
            isZestI,
        };

        dispatch(
            draftUserAccountInquiry(
                ZEST_CASA_RESUME_NTB_ACCOUNT_INQUIRY,
                accountInquiryBody,
                (result, error) => {
                    if (result) {
                        if (
                            result?.scorePartyResult?.customerRiskRatingCode ===
                                HIGH_RISK_CUSTOMER_CODE ||
                            result?.scorePartyResult?.numOfWatchlistHits > 0
                        ) {
                            navigation.navigate(ZEST_CASA_SUCCESS, {
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
                            navigateBasedOnEKYCFlag(
                                result.ekycDone,
                                createFilledUserDetailsObjectHeader
                            );
                        }
                    } else {
                        if (error && error?.code === M2U_SCREEN_SCORE_EXCEPTION) {
                            navigation.navigate(ZEST_CASA_BRANCH_ACTIVATION, {
                                onMaybeLaterButtonDidTap: () => {
                                    navigation.popToTop();
                                    navigation.goBack();
                                },
                            });
                        }
                    }
                },
                isZestI,
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
            isZestI,
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

    function navigateBasedOnEKYCFlag(eKYCFlag, createFilledUserDetailsObjectHeader) {
        // navigation.navigate(ZEST_CASA_SELECT_DEBIT_CARD);
        if (eKYCFlag) {
            navigation.navigate(ZEST_CASA_ACTIVATE_ACCOUNT);
        } else {
            const filledUserDetails = createFilledUserDetailsObjectHeader;
            const eKycParams = {
                selectedIDType: filledUserDetails?.onBoardDetails2?.selectedIDType,
                entryStack: filledUserDetails?.entryStack,
                entryScreen: filledUserDetails?.entryScreen,
                entryParams: filledUserDetails?.entryParams,
                from: filledUserDetails?.onBoardDetails2?.from,
                idNo: filledUserDetails?.onBoardDetails2?.idNo,
                fullName: filledUserDetails?.onBoardDetails?.fullName,
                pan: filledUserDetails?.pan,
                accountNumber: filledUserDetails?.accountNumber,
                reqType: "E01",
                isNameCheck: false,
                sceneCode: isZestI ? ZESTSCENECODE : M2UPRSCENECODE,
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

    const screenDescription = () =>
        `${YOU_HAVE_A} ${
            isZestI ? ZEST : M2U_PREMIER
        } ${ACCOUNT.toLowerCase()}: ${accountNumber} ${PENDING_ACTIVATION.toLowerCase()}. ${CLICK_CONTINUE_PROCEED}.`;

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                analyticScreenName={APPLY_ACTIVATE_ZESTI_ACCOUNT_ACTIVATION}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
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
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );
};

export const activationPendingPropTypes = (ZestCASAActivationPending.propTypes = {
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

export default ZestCASAActivationPending;
