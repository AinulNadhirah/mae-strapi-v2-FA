import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector, useDispatch } from "react-redux";

import {
    ZEST_CASA_ACCOUNT_NOT_FOUND,
    ZEST_CASA_ACTIVATION_PENDING,
    ZEST_CASA_IDENTITY_DETAILS,
    ZEST_CASA_OTP_VERIFICATION,
    ZEST_CASA_RESIDENTIAL_DETAILS,
    ZEST_CASA_SUITABILITY_ASSESSMENT,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";
import HeaderView from "@components/Views/HeaderView";

import { useModelController } from "@context";

import { bankingGetDataMayaM2u, invokeL3 } from "@services";

import { UPDATE_ACCOUNT_LIST_AND_MAE_STATUS_ACTION } from "@redux/actions/services/getAccountListAction";
import {
    PREPOSTQUAL_CLEAR,
    PREPOSTQUAL_UPDATE_USER_STATUS,
} from "@redux/actions/services/prePostQualAction";
import entryProps from "@redux/connectors/ZestCASA/entryConnector";
import downTimeServiceProps, {
    downTimeServicePropTypes,
} from "@redux/connectors/services/downTimeConnector";
import masterDataServiceProps, {
    masterDataServicePropTypes,
} from "@redux/connectors/services/masterDataConnector";
import { prePostQual } from "@redux/services/apiPrePostQual";

import { DISABLED, YELLOW } from "@constants/colors";
import {
    NEXT_SMALL_CAPS,
    OKAY,
    RESUME_FLOW_MESSAGE,
    WELCOME_BACK,
    M2U_PREMIER_APPLICATION,
    M2U_PREMIER_ENTRY_DESCRIPTION,
    ZEST_APPLICATION,
    ZEST_ENTRY_DESCRIPTION,
    ZEST_08_ACC_TYPE_ERROR,
    ALREADY_HAVE_ACCOUNT_ERROR,
} from "@constants/strings";
import { ZEST_CASA_CHECK_DOWNTIME, ZEST_CASA_PRE_POST_ETB } from "@constants/url";
import {
    ZEST_CASA_CLEAR_ALL,
    PRE_QUAL_POST_LOGIN_FLAG,
    ZEST_UNIDENTIFIED_USER,
    ZEST_NTB_USER,
    ZEST_FULL_ETB_USER,
    ZEST_DRAFT_BRANCH_USER,
    ZEST_DRAFT_USER,
} from "@constants/zestCasaConfiguration";

import Assets from "@assets";

import { APPLY_M2U_PREMIER, APPLY_ZESTI } from "./helpers/AnalyticsEventConstants";
import {
    EmployeeDetailsPrefiller,
    PersonalDetailsPrefiller,
} from "./helpers/CustomerDetailsPrefiller";
import {
    listOfNonMAEAccounts,
    shouldGoToActivationPendingScreen,
    shouldShowSuitabilityAssessmentForETBCustomer,
} from "./helpers/ZestHelpers";

const ZestCASAEntry = (props) => {
    const { navigation, route } = props;
    const { isZest } = route.params;
    const { getModel } = useModelController();

    const masterDataReducer = useSelector((state) => state.masterDataReducer);

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    const [isWelcomePopupVisible, setIsWelcomePopupVisible] = useState(false);

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        console.log("[ZestCASAEntry] >> [init]");
        props.updateIsZest(isZest);
        props.clearDownTimeReducer();
        props.checkDownTime(`${ZEST_CASA_CHECK_DOWNTIME}?isZesti=${isZest}`, () => {
            props.getMasterData();
        });
    };

    function onBackTap() {
        console.log("[ZestCASAEntry] >> [onBackTap]");
        dispatch({ type: ZEST_CASA_CLEAR_ALL });
        props.clearDownTimeReducer();
        props.clearMasterDataReducer();
        dispatch({ type: PREPOSTQUAL_CLEAR });
        props.clearEntryReducer();
        props.navigation.goBack();
    }

    function onNextTap() {
        console.log("[ZestCASAEntry] >> [onNextTap]");
        moveToNext();
    }

    const moveToNext = async () => {
        if (props.statusDownTime === "success") {
            const { isOnboard } = getModel("user");

            if (isOnboard) {
                handleOnboardedUser();
            } else {
                navigation.navigate(ZEST_CASA_IDENTITY_DETAILS);
            }
        }
    };

    function getHeaderImage() {
        return isZest ? Assets.zestEntryHeader : Assets.m2uPremierEntryHeader;
    }

    function getHeaderTitle() {
        return isZest ? ZEST_APPLICATION : M2U_PREMIER_APPLICATION;
    }

    function getHeaderDescription() {
        return isZest ? ZEST_ENTRY_DESCRIPTION : M2U_PREMIER_ENTRY_DESCRIPTION;
    }

    async function handleOnboardedUser() {
        const httpResp = await invokeL3(true);
        const result = httpResp.data;
        const { code } = result;

        if (code != 0) return;

        const data = {
            idType: "",
            birthDate: "",
            preOrPostFlag: PRE_QUAL_POST_LOGIN_FLAG,
            icNo: "",
            isZestI: isZest,
        };

        dispatch(
            prePostQual(ZEST_CASA_PRE_POST_ETB, data, (result, userStatus, exception) => {
                if (result) {
                    console.log("userStatus =======>" + userStatus);

                    if (userStatus && userStatus === ZEST_UNIDENTIFIED_USER)
                        return showErrorToast({
                            message: "We currently have not opened application for you.",
                        });

                    if (
                        userStatus &&
                        userStatus !== ZEST_NTB_USER &&
                        userStatus !== ZEST_DRAFT_USER
                    ) {
                        prefillDetailsForExistingUser(result);
                        callGetAccountsListService(false);
                    }
                    if (userStatus === ZEST_DRAFT_USER) {
                        callGetAccountsListService(true, (accountListings) => {
                            handleNavigationBasedOnModuleFlag(
                                props.isZest,
                                userStatus,
                                result,
                                accountListings
                            );
                        });
                    } else {
                        handleNavigationBasedOnModuleFlag(props.isZest, userStatus, result, null);
                    }
                } else {
                    if (exception) {
                        const { statusCode } = exception;

                        if (statusCode === "4774") {
                            showErrorToast({
                                message: ALREADY_HAVE_ACCOUNT_ERROR,
                            });
                        } else if (statusCode === "6608") {
                            showErrorToast({
                                message: ZEST_08_ACC_TYPE_ERROR,
                            });
                        } else if (statusCode === "6610") {
                            navigation.navigate(ZEST_CASA_ACCOUNT_NOT_FOUND, {
                                isVisitBranchMode: true,
                            });
                        } else {
                            dispatch({ type: ZEST_CASA_CLEAR_ALL });
                            props.clearDownTimeReducer();
                            props.clearMasterDataReducer();
                            dispatch({ type: PREPOSTQUAL_CLEAR });
                            navigation.navigate(ZEST_CASA_ACCOUNT_NOT_FOUND, {
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

    function handleNavigationBasedOnModuleFlag(
        isZest,
        userStatus,
        prePostQualResult,
        accountListings
    ) {
        const saDailyIndicator = prePostQualResult?.saDailyInd ?? null;
        if (userStatus !== ZEST_NTB_USER && userStatus !== ZEST_DRAFT_USER) {
            shouldShowSuitabilityAssessmentForETBCustomer(isZest, saDailyIndicator)
                ? navigation.navigate(ZEST_CASA_SUITABILITY_ASSESSMENT)
                : navigation.navigate(ZEST_CASA_RESIDENTIAL_DETAILS);
        } else if (userStatus === ZEST_DRAFT_USER) {
            if (shouldGoToActivationPendingScreen(accountListings)) {
                navigation.navigate(ZEST_CASA_ACTIVATION_PENDING);
            } else {
                navigation.navigate(ZEST_CASA_ACCOUNT_NOT_FOUND);
            }
        } else if (userStatus === ZEST_DRAFT_BRANCH_USER) {
            setIsWelcomePopupVisible(true);
        }
    }

    function onWelcomePopupOkayButtonDidTap() {
        setIsWelcomePopupVisible(false);
        navigation.navigate(ZEST_CASA_OTP_VERIFICATION, {
            isVisitBranchMode: true,
        });
    }

    function onWelcomePopupCloseButtonDidTap() {
        setIsWelcomePopupVisible(false);
    }

    async function callGetAccountsListService(isDraftNTB = false, callback) {
        try {
            const path = `/summary?type=A&checkMae=true`;

            const response = await bankingGetDataMayaM2u(path, false);

            if (response && response.data && response.data.code === 0) {
                const { accountListings, maeAvailable } = response.data.result;

                if (accountListings && accountListings.length) {
                    listOfNonMAEAccounts(accountListings, (listOfNonMAEAccounts) => {
                        if (listOfNonMAEAccounts.length > 0) {
                            dispatch({
                                type: UPDATE_ACCOUNT_LIST_AND_MAE_STATUS_ACTION,
                                accountListings: accountListings,
                                maeAvailable: maeAvailable,
                            });

                            if (isDraftNTB) {
                                if (callback) {
                                    callback(accountListings);
                                }
                            } else {
                                dispatch({
                                    type: PREPOSTQUAL_UPDATE_USER_STATUS,
                                    userStatus: ZEST_FULL_ETB_USER,
                                });
                            }
                        }
                    });
                }
            }
        } catch (error) {
            return showErrorToast({
                message: "We are unable to fetch a list of your accounts",
            });
        }
    }

    const analyticScreenName = isZest ? APPLY_ZESTI : APPLY_M2U_PREMIER;

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName={analyticScreenName}>
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
                                <HeaderView
                                    headerImage={getHeaderImage()}
                                    title={getHeaderTitle()}
                                    description={getHeaderDescription()}
                                />
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    fullWidth
                                    activeOpacity={props.statusDownTime === "success" ? 1 : 0.5}
                                    backgroundColor={
                                        props.statusDownTime === "success" ? YELLOW : DISABLED
                                    }
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={NEXT_SMALL_CAPS}
                                        />
                                    }
                                    onPress={onNextTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
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
        </React.Fragment>
    );
};

const commonPropTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    props: PropTypes.object,
};

export const entryPropTypes = (ZestCASAEntry.propTypes = {
    ...commonPropTypes,
    ...downTimeServicePropTypes,
    ...masterDataServicePropTypes,

    // State
    isZest: PropTypes.bool,
    statusDownTime: PropTypes.string,

    // Dispatch
    updateIsZest: PropTypes.func,
    checkDownTime: PropTypes.func,
    clearDownTimeReducer: PropTypes.func,
    getMasterData: PropTypes.func,
    clearMasterDataReducer: PropTypes.func,
});

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
});

export default downTimeServiceProps(masterDataServiceProps(entryProps(ZestCASAEntry)));
