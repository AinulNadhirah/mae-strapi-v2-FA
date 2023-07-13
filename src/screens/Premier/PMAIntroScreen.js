import React, { useEffect, useState } from "react";
import { View, StyleSheet, ImageBackground, ScrollView, Image, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector, useDispatch } from "react-redux";

import {
    EmployeeDetailsPrefiller,
    PersonalDetailsPrefiller,
} from "@screens/ZestCASA/helpers/CustomerDetailsPrefiller";
import {
    listOfNonMAEAccounts,
    shouldGoToActivationPendingScreen,
    shouldShowSuitabilityAssessmentForETBCustomer,
} from "@screens/ZestCASA/helpers/ZestHelpers";

import {
    PREMIER_MODULE_STACK,
    PREMIER_ACCOUNT_NOT_FOUND,
    PREMIER_ACTIVATION_PENDING,
    PREMIER_IDENTITY_DETAILS,
    PREMIER_OTP_VERIFICATION,
    PREMIER_RESIDENTIAL_DETAILS,
    PREMIER_SUITABILITY_ASSESSMENT,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { bankingGetDataMayaM2u, invokeL3 } from "@services";

import { UPDATE_ACCOUNT_LIST_AND_MAE_STATUS_ACTION } from "@redux/actions/services/getAccountListAction";
import { PREPOSTQUAL_UPDATE_USER_STATUS } from "@redux/actions/services/prePostQualAction";
import entryProps from "@redux/connectors/ZestCASA/entryConnector";
import downTimeServiceProps from "@redux/connectors/services/downTimeConnector";
import masterDataServiceProps from "@redux/connectors/services/masterDataConnector";
import { prePostQualPremier } from "@redux/services/Premier/apiPrePostQual";

import { YELLOW, DARK_CYAN, WHITE } from "@constants/colors";
import {
    PREMIER_CLEAR_ALL,
    PREMIER_PRE_QUAL_POST_LOGIN_FLAG,
    PMA_NTB_USER,
    PMA_FULL_ETB_USER,
    PMA_DRAFT_USER,
} from "@constants/premierConfiguration";
import {
    PMA,
    PMAI_INTRO_SCREEN_DESC,
    PMAI_ACCOUNT_TYPE,
    PMAI_ACCOUNT_SUBTEXT,
    ACCOUNT_NOT_OPENED_MESSAGE,
    ACCOUNT_LIST_NOT_FOUND_MESSAGE,
} from "@constants/premierStrings";
import { PREMIER_PRE_POST_ETB } from "@constants/premierUrl";
import {
    APPLY_NOW,
    ALREADY_HAVE_ACCOUNT_ERROR,
    OKAY,
    RESUME_FLOW_MESSAGE,
    WELCOME_BACK,
    ZEST_08_ACC_TYPE_ERROR,
} from "@constants/strings";
import { ZEST_CASA_CLEAR_ALL } from "@constants/zestCasaConfiguration";

import Assets from "@assets";

import { entryPropTypes } from "./PM1IntroScreen";
import { APPLY_PMA_INTRO_SCREEN } from "./helpers/AnalyticsEventConstants";
import {
    isDraftBranchUser,
    isDraftUser,
    isUnidentifiedUser,
    isM2UOnlyUser,
    handlePremierTapFlow,
} from "./helpers/premierHelpers";

const PMAIntroScreen = (props) => {
    const { navigation, route } = props;
    const { isPMA } = route.params;
    const { getModel } = useModelController();

    const masterDataReducer = useSelector((state) => state.masterDataReducer);
    const [isWelcomePopupVisible, setIsWelcomePopupVisible] = useState(false);
    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    useEffect(() => {
        init();
    }, []);

    const init = () => {
        console.log("[PMAIntroScreen] >> [init]");
        dispatch({ type: ZEST_CASA_CLEAR_ALL });
        props.updateIsPMA(isPMA);
        props.clearDownTimeReducer();
        props.checkDownTimePremier(false, () => {
            props.getMasterDataPremier();
        });
    };

    const descriptionList = PMAI_INTRO_SCREEN_DESC;

    function onBackTap() {
        console.log("[PMAIntroScreen] >> [onBackPress]");
        handlePremierTapFlow(dispatch, props);
        props.navigation.pop();
    }

    function onCloseTap() {
        console.log("[PMAIntroScreen] >> [onCloseTap]");
        // Clear all data from  reducers
        handlePremierTapFlow(dispatch, props);
        navigation.goBack();
    }

    function onApplyNow() {
        console.log("[PMAIntroScreen] >> [applyNow]");
        if (props.statusDownTime === "success") {
            const { isOnboard } = getModel("user");
            if (isOnboard) {
                handleOnboardedUser();
            } else {
                navigation.navigate(PREMIER_MODULE_STACK, {
                    screen: PREMIER_IDENTITY_DETAILS,
                });
            }
        }
    }

    function isETBUser(userStatus) {
        if (userStatus && userStatus !== PMA_NTB_USER && userStatus !== PMA_DRAFT_USER) {
            return true;
        }
    }

    async function handleOnboardedUser() {
        const httpResp = await invokeL3(true);
        const result = httpResp.data;
        const { code } = result;

        if (code !== 0) return;

        const data = {
            idType: "",
            birthDate: "",
            preOrPostFlag: PREMIER_PRE_QUAL_POST_LOGIN_FLAG,
            icNo: "",
            productName: "MAE_PMA",
        };

        dispatch(
            prePostQualPremier(PREMIER_PRE_POST_ETB, data, (result, userStatus, exception) => {
                if (result) {
                    if (isUnidentifiedUser(userStatus))
                        return showErrorToast({
                            message: ACCOUNT_NOT_OPENED_MESSAGE,
                        });

                    if (isETBUser(userStatus)) {
                        prefillDetailsForExistingUser(result);
                        callGetAccountsListService(false);
                        if (isM2UOnlyUser(userStatus)) {
                            dispatch({
                                type: PREPOSTQUAL_UPDATE_USER_STATUS,
                                userStatus: PMA_FULL_ETB_USER,
                            });
                        }
                    }
                    if (isDraftUser(userStatus)) {
                        callGetAccountsListService(true, (accountListings) => {
                            handleNavigationBasedOnModuleFlag(userStatus, result, accountListings);
                        });
                    } else {
                        handleNavigationBasedOnModuleFlag(userStatus, result, null);
                    }
                } else {
                    if (exception) {
                        const { statusCode } = exception;
                        const { statusDesc } = exception;

                        if (statusCode === "4778") {
                            showErrorToast({
                                message: ALREADY_HAVE_ACCOUNT_ERROR,
                            });
                        } else if (statusCode === "6608") {
                            showErrorToast({
                                message: ZEST_08_ACC_TYPE_ERROR,
                            });
                        } else if (statusCode === "6610") {
                            navigation.navigate(PREMIER_ACCOUNT_NOT_FOUND, {
                                isVisitBranchMode: true,
                            });
                        } else {
                            dispatch({ type: PREMIER_CLEAR_ALL });
                            navigation.navigate(PREMIER_ACCOUNT_NOT_FOUND, {
                                isVisitBranchMode: true,
                            });
                        }
                    }
                }
            })
        );
    }

    function prefillDetailsForExistingUser(result) {
        PersonalDetailsPrefiller(dispatch, masterDataReducer, result);
        EmployeeDetailsPrefiller(dispatch, masterDataReducer, result);
    }

    function handleNavigationBasedOnModuleFlag(userStatus, prePostQualResult, accountListings) {
        const saDailyIndicator = prePostQualResult?.saDailyInd;
        if (isETBUser(userStatus)) {
            shouldShowSuitabilityAssessmentForETBCustomer(saDailyIndicator)
                ? navigation.navigate(PREMIER_SUITABILITY_ASSESSMENT)
                : navigation.navigate(PREMIER_RESIDENTIAL_DETAILS);
        } else if (isDraftUser(userStatus)) {
            if (shouldGoToActivationPendingScreen(accountListings)) {
                navigation.navigate(PREMIER_ACTIVATION_PENDING);
            } else {
                navigation.navigate(PREMIER_ACCOUNT_NOT_FOUND, {
                    isVisitBranchMode: false,
                });
            }
        } else if (isDraftBranchUser(userStatus)) {
            setIsWelcomePopupVisible(true);
        }
    }

    function onWelcomePopupOkayButtonDidTap() {
        setIsWelcomePopupVisible(false);
        navigation.navigate(PREMIER_OTP_VERIFICATION, {
            isVisitBranchMode: true,
        });
    }

    function onWelcomePopupCloseButtonDidTap() {
        setIsWelcomePopupVisible(false);
    }

    async function callGetAccountsListService(isDraftNTB, callback) {
        try {
            const path = "/summary?type=A&checkMae=true";

            const response = await bankingGetDataMayaM2u(path, false);

            if (response && response.data && response.data.code === 0) {
                const { accountListings, maeAvailable } = response.data.result;

                if (accountListings && accountListings.length) {
                    listOfNonMAEAccounts(accountListings, (listOfNonMAEAccounts) => {
                        if (listOfNonMAEAccounts.length > 0) {
                            dispatch({
                                type: UPDATE_ACCOUNT_LIST_AND_MAE_STATUS_ACTION,
                                accountListings,
                                maeAvailable,
                            });

                            if (isDraftNTB && callback) {
                                callback(accountListings);
                            }
                        }
                    });
                }
            }
        } catch (error) {
            return showErrorToast({
                message: ACCOUNT_LIST_NOT_FOUND_MESSAGE,
            });
        }
    }

    const buildDescription = () => {
        return descriptionList.map((text) => {
            return (
                <View style={styles.descText} key={text}>
                    <Image source={Assets.rightTick} style={styles.tick} />
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                        textAlign="left"
                        text={text}
                        style={styles.rightTickText}
                    />
                    {/* <SpaceFiller height={24} /> */}
                </View>
            );
        });
    };

    return (
            <ScreenContainer backgroundType="color" analyticScreenName={APPLY_PMA_INTRO_SCREEN}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
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
                                <View style={styles.introScreen} testID="onboarding_pma_intro">
                                    <View style={styles.image}>
                                        <ImageBackground
                                            source={Assets.premierMudharabahEntryHeader}
                                            style={styles.imageBg}
                                        />
                                    </View>
                                    <View style={styles.description}>
                                        <View style={styles.accountType}>
                                            <Typo
                                                fontSize={12}
                                                fontWeight="600"
                                                lineHeight={16}
                                                textAlign="left"
                                                text={PMAI_ACCOUNT_TYPE}
                                                style={styles.accountText}
                                            />
                                        </View>
                                        <View>
                                            <Typo
                                                fontSize={20}
                                                fontWeight="700"
                                                lineHeight={28}
                                                textAlign="left"
                                                text={PMA}
                                            />
                                        </View>
                                        <View style={styles.subtext}>
                                            <Typo
                                                fontSize={16}
                                                fontWeight="400"
                                                lineHeight={24}
                                                textAlign="left"
                                                text={PMAI_ACCOUNT_SUBTEXT}
                                            />
                                        </View>
                                        <View style={styles.descContainer}>
                                            {buildDescription()}
                                        </View>
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>
                        <FixedActionContainer>
                            <View style={styles.bottomBtnContCls}>
                                <ActionButton
                                    backgroundColor={YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={APPLY_NOW}
                                        />
                                    }
                                    onPress={onApplyNow}
                                />
                            </View>
                        </FixedActionContainer>
                    
                </ScreenLayout>
            
            {isWelcomePopupVisible && (
                <Popup
                    visible={isWelcomePopupVisible}
                    onClose={onWelcomePopupCloseButtonDidTap}
                    title={WELCOME_BACK}
                    description={RESUME_FLOW_MESSAGE}
                    primaryAction={{
                        text: OKAY,
                        onPress: onWelcomePopupOkayButtonDidTap,
                    }}
                />
            )}
       </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    accountText: {
        color: WHITE,
        textAlign: "center",
    },
    accountType: {
        backgroundColor: DARK_CYAN,
        borderRadius: 12,
        color: WHITE,
        marginBottom: 24,
        marginTop: 24,
        paddingBottom: 4,
        paddingLeft: 4,
        paddingRight: 4,
        paddingTop: 4,
        width: 150,
    },
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    descContainer: {
        marginBottom: 58,
    },
    descText: {
        flexDirection: "row",
        marginBottom: 15,
    },
    description: {
        marginLeft: 24,
        marginRight: 38,
    },
    imageBg: {
        height: 210,
        width: "100%",
    },
    subtext: {
        marginBottom: 27,
        marginTop: 8,
    },
    tick: {
        height: 10,
        marginRight: 12.8,
        marginTop: 5,
        width: 14,
    },
});

PMAIntroScreen.propTypes = {
    ...entryPropTypes,
};

export default entryProps(downTimeServiceProps(masterDataServiceProps(PMAIntroScreen)));
