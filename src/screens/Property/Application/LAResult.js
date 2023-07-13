/* eslint-disable react/jsx-no-bind */

/* eslint-disable react-hooks/exhaustive-deps */
import { useFocusEffect } from "@react-navigation/native";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useReducer, useCallback } from "react";
import { StyleSheet, Dimensions, View, ScrollView, Platform, Image } from "react-native";
import * as Animatable from "react-native-animatable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RNSafetyNet from "react-native-safety-net";

import { BANKINGV2_MODULE, APPLICATION_DETAILS, LA_RESULT } from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { logEvent } from "@services/analytics";

import {
    MEDIUM_GREY,
    DARK_GREY,
    YELLOW,
    BLACK,
    SEPARATOR,
    WHITE,
    IRISBLUE,
} from "@constants/colors";
import {
    ADDITIONAL_FINANCING_INFO,
    MONTHLY_INSTALMENT_INFO,
    FA_FORM_COMPLETE,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_TRANSACTION_ID,
    FA_VIEW_SCREEN,
    FA_ACTION_NAME,
    FA_PROPERTY_APPLY_SUCCESS_LOAN_JA,
    FA_VIEW_APPLICATION,
    FA_PROPERTY_APPLY_SUCCESS_LOAN_MA,
    FA_PROPERTY_APPLY_FAIL_LOAN_MA,
    BANK_SELLING_TEXT,
    BANK_SELLING_TITLE,
    PUBLIC_SECTOR_FINANC_TEXT,
    YOUR_JOINT_APPLICANT,
} from "@constants/strings";

import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

import DetailField from "../Common/DetailField";
import { useResetNavigation, getEncValue } from "../Common/PropertyController";
import { saveLAResult, fetchApplicationDetails, fetchGetApplicants } from "./LAController";

const screenHeight = Dimensions.get("window").height;
const imageHeight = Math.max((screenHeight * 40) / 100, 350);

const imgAnimFadeInUp = {
    0: {
        opacity: 0,
        translateY: 40,
    },
    1: {
        opacity: 1,
        translateY: 0,
    },
};

// Static status values to be used locally
const STATUS_PASS = "PASS";
const STATUS_SOFT_FAIL = "SOFT_FAIL";

// Initial state object
const initialState = {
    // UI Labels
    headerText: "",
    subText1: "",
    subText2: "",
    propertyName: "",
    subHeaderLabelTextRate: "",
    subHeaderLabelTextPeriod: "",
    bankSellingPrice: "",

    // Loan Details
    loanAmount: "",
    loanAmountFormatted: "",
    interestRate: "",
    interestRateFormatted: "",
    spreadRate: "",
    spreadRateFormatted: null,
    baseRate: "",
    baseRateFormatted: null,
    monthlyInstalment: "",
    monthlyInstalmentFormatted: "",
    propertyPrice: "",
    propertyPriceFormatted: "",
    downpayment: "",
    downpaymentFormatted: "",
    loanPeriod: "",
    publicSectorNameFinance: false,

    infoPopup: false,
    infoPopupTitle: "",
    infoPopupDesc: "",

    // Others
    loading: false,
    status: "", // PASS | SOFT_FAIL

    // Result response data
    dataType: null,
    disableScreenshot: false,

    isJointApplicant: false,
    jointApplicantInfo: null,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "SET_HEADER_LABELS":
            return {
                ...state,
                headerText: payload?.headerText ?? state.headerText,
                subText1: payload?.subText1 ?? state.subText1,
                subText2: payload?.subText2 ?? state.subText2,
            };
        case "SET_LOADING":
            return {
                ...state,
                loading: payload,
            };
        case "SET_DOWNPAYMENT":
        case "SET_LOAN_DETAILS":
            return {
                ...state,
                ...payload,
            };
        case "SET_STATUS":
            return {
                ...state,
                status: payload,
            };
        case "SHOW_INFO_POPUP":
            return {
                ...state,
                infoPopup: payload?.infoPopup,
                infoPopupTitle: payload?.infoPopupTitle,
                infoPopupDesc: payload?.infoPopupDesc,
            };
        case "SET_JOINT_APPLICANT_INFO":
            return {
                ...state,
                jointApplicantInfo: payload,
            };
        case "SET_JOINT_APPLICANT":
            return {
                ...state,
                isJointApplicant: payload,
            };
        // case "DISABLE_SCREENSHOT":
        //     return {
        //         ...state,
        //         disableScreenshot: payload,
        //     };
        default:
            return { ...state };
    }
}

function LAResult({ route, navigation }) {
    const [resetToDiscover] = useResetNavigation(navigation);
    const [state, dispatch] = useReducer(reducer, initialState);
    const safeAreaInsets = useSafeAreaInsets();

    const { disableScreenshot, jointApplicantInfo } = state;

    useEffect(() => {
        init();
    }, []);

    const init = useCallback(() => {
        console.log("[LAResult] >> [init]");

        // Call API to save result data
        saveLAResultData();

        const navParams = route?.params ?? {};
        const propertyName = navParams?.propertyName;
        const propertyPrice = navParams?.propertyPrice;
        const financingType = navParams?.financingType;

        const eligibilityResult = navParams?.eligibilityResult ?? {};
        const dataType = eligibilityResult?.dataType ?? null;
        const eligibilityStatus = navParams?.eligibilityStatus ?? "";
        const loanAmount = eligibilityResult?.aipAmount;
        const loanPeriod = eligibilityResult?.tenure ?? navParams?.tenure;
        const downpayment = navParams?.downPaymentAmount;
        const monthlyInstalment = eligibilityResult?.installmentAmount;
        const bankSellingPrice = eligibilityResult?.bankSellingPrice ?? "";
        const { interestRate, spreadRate, baseRate } = getInterestRate(eligibilityResult);
        const publicSectorNameFinance =
            eligibilityResult?.publicSectorNameFinance === "Y" ? true : false;

        const tempStatus = getStatus(dataType, eligibilityStatus);

        const headerText =
            tempStatus === STATUS_PASS
                ? navParams?.jointApplicantDetails
                    ? "Great news! You and your joint applicant are now one step closer to owning your dream home!"
                    : "Great news, you’re now one step closer to owning your dream home!"
                : navParams?.jointApplicantDetails
                ? "Great news! Your joint applicant and you are one step closer to moving into your dream home!"
                : "Great news, We've have successfully received your application.";
        const subText1 =
            tempStatus === STATUS_PASS || navParams?.jointApplicantDetails
                ? "Your sales representative will be in touch with you to proceed with the final steps."
                : "Our representative will contact you to assist with the rest of your mortgage application.";
        const subText2 = "You may head over to the Application tab to track the status.";
        //const baseRateText = financingType === "conventional" ? "Base Rate" : "Islamic base rate";
        const baseRateText = navParams?.baseRateLabel ?? "Base rate";

        //check for current user
        const isJointApplicant = navParams?.currentUser === "J";
        // Set Joint info
        if (isJointApplicant) {
            dispatch({
                actionType: "SET_JOINT_APPLICANT",
                payload: true,
            });
        }

        //joint info
        const jointApplicantInfo = navParams?.jointApplicantDetails ?? null;

        // Set Joint info
        if (jointApplicantInfo) {
            dispatch({
                actionType: "SET_JOINT_APPLICANT_INFO",
                payload: jointApplicantInfo,
            });
        }

        // Update screen status
        dispatch({
            actionType: "SET_STATUS",
            payload: tempStatus,
        });

        // Set header and subtext values
        dispatch({
            actionType: "SET_HEADER_LABELS",
            payload: {
                headerText,
                subText1,
                subText2,
            },
        });

        // Set Loan Details
        dispatch({
            actionType: "SET_LOAN_DETAILS",
            payload: {
                // Others
                dataType,

                // Property
                propertyName,
                propertyPrice,
                propertyPriceFormatted: !isNaN(propertyPrice)
                    ? `RM ${numeral(propertyPrice).format("0,0.00")}`
                    : null,

                // Loan Amount
                loanAmount,
                loanAmountFormatted: !isNaN(loanAmount)
                    ? `RM ${numeral(loanAmount).format("0,0.00")}`
                    : null,

                // Interest Rate
                interestRate,
                interestRateFormatted: !isNaN(interestRate) ? `${interestRate}% p.a` : "",
                baseRate,
                baseRateFormatted: !isNaN(baseRate) ? `${baseRateText} ${baseRate}%` : "",
                spreadRate,
                spreadRateFormatted: !isNaN(spreadRate) ? `Spread: ${spreadRate}%` : "",
                loanPeriod: !isNaN(loanPeriod) ? `${loanPeriod} years` : "",
                // Monthly Instalment
                monthlyInstalment,
                monthlyInstalmentFormatted: !isNaN(monthlyInstalment)
                    ? `RM ${numeral(monthlyInstalment).format("0,0.00")}`
                    : null,
                // Downpayment
                downpayment,
                downpaymentFormatted: !isNaN(downpayment)
                    ? `RM ${numeral(downpayment).format("0,0.00")}`
                    : null,
                bankSellingPrice: getBankSellingPrice(financingType, bankSellingPrice),
                headerLabelText:
                    financingType === "conventional"
                        ? "Property loan amount"
                        : "Property financing amount",
                subHeaderLabelTextRate:
                    financingType === "conventional"
                        ? "Effective interest rate"
                        : "Effective profit rate",
                subHeaderLabelTextPeriod:
                    financingType === "conventional" ? "Loan period" : "Financing period",
                publicSectorNameFinance,
            },
        });

        //disable screenshot
        // dispatch({
        //     actionType: "DISABLE_SCREENSHOT",
        //     payload: Platform.OS === "android" && tempStatus === STATUS_PASS,
        // });
        if (jointApplicantInfo) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_PROPERTY_APPLY_SUCCESS_LOAN_JA,
            });

            logEvent(FA_FORM_COMPLETE, {
                [FA_SCREEN_NAME]: FA_PROPERTY_APPLY_SUCCESS_LOAN_JA,
                [FA_TRANSACTION_ID]: route.params?.stpApplicationId,
            });
        } else if (tempStatus === STATUS_PASS) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_PROPERTY_APPLY_SUCCESS_LOAN_MA,
            });

            logEvent(FA_FORM_COMPLETE, {
                [FA_SCREEN_NAME]: FA_PROPERTY_APPLY_SUCCESS_LOAN_MA,
                [FA_TRANSACTION_ID]: route.params?.stpApplicationId,
            });
        } else {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_PROPERTY_APPLY_FAIL_LOAN_MA,
            });
        }
    }, [route.params, saveLAResultData]);

    /* disabling screenshot option for Android */
    useFocusEffect(
        useCallback(() => {
            // Screenshot disabling - Android Specific
            if (Platform.OS === "android" && disableScreenshot) {
                try {
                    RNSafetyNet.screenshotDisable(true);
                } catch (error) {
                    console.log("[LAResult][screenshotDisable] >> Exception: ", error);
                }
                return () => {
                    try {
                        RNSafetyNet.screenshotDisable(false);
                    } catch (error) {
                        console.log("[LAResult][screenshotDisable] >> Exception: ", error);
                    }
                };
            }
        }, [disableScreenshot])
    );

    function getBankSellingPrice(financingType, bankSellingPrice) {
        if (financingType !== null && financingType !== "conventional" && bankSellingPrice) {
            return !isNaN(bankSellingPrice)
                ? `RM ${numeral(bankSellingPrice).format("0,0.00")}`
                : "";
        } else {
            return "";
        }
    }

    function getStatus(dataType, eligibilityStatus) {
        if (eligibilityStatus === "AMBER") {
            return STATUS_SOFT_FAIL;
        } else if (dataType === "Eligible" && eligibilityStatus === "GREEN") {
            return STATUS_PASS;
        } else {
            return STATUS_SOFT_FAIL;
        }
    }

    const saveLAResultData = useCallback(() => {
        console.log("[LAResult] >> [saveLAResultData]");

        // TODO: If need to pass more fields in request, then do the required changes as needed here
        const navParams = route?.params ?? {};

        // Call Save LA result API
        saveLAResult(navParams);
    }, [route?.params]);

    function getInterestRate(eligibilityResult) {
        console.log("[LAResult] >> [getInterestRate]");

        const interestRate = eligibilityResult?.interestRate
            ? parseFloat(eligibilityResult.interestRate).toFixed(2)
            : "";
        const spreadRate = eligibilityResult?.spreadRate
            ? parseFloat(eligibilityResult.spreadRate).toFixed(2)
            : "";
        const baseRate = eligibilityResult?.baseRate
            ? parseFloat(eligibilityResult.baseRate).toFixed(2)
            : "";

        return { interestRate, spreadRate, baseRate };
    }

    const onBankSellingIconPress = () => {
        console.log("[LAResult] >> [onBankSellingIconPress]");
        dispatch({
            actionType: "SHOW_INFO_POPUP",
            payload: {
                infoPopup: true,
                infoPopupTitle: BANK_SELLING_TITLE,
                infoPopupDesc: BANK_SELLING_TEXT,
            },
        });
    };

    const onCloseInfoPopup = () => {
        console.log("[LAResult] >> [onCloseInfoPopup]");
        dispatch({
            actionType: "SHOW_INFO_POPUP",
            payload: {
                infoPopup: false,
                infoPopupTitle: "",
                infoPopupDesc: "",
            },
        });
    };

    function onCloseTap() {
        console.log("[LAResult] >> [onCloseTap]");
        resetToDiscover();
    }

    function onViewApplicationPress() {
        console.log("[LAResult] >> [onViewApplicationPress]");

        // Navigate to application tab - with respective record
        getDetails();

        const screenName =
            state.status === STATUS_PASS
                ? FA_PROPERTY_APPLY_SUCCESS_LOAN_MA
                : FA_PROPERTY_APPLY_FAIL_LOAN_MA;

        if (jointApplicantInfo) {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: FA_PROPERTY_APPLY_SUCCESS_LOAN_JA,
                [FA_ACTION_NAME]: FA_VIEW_APPLICATION,
            });
        } else {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: screenName,
                [FA_ACTION_NAME]: FA_VIEW_APPLICATION,
            });
        }
    }

    async function getDetails() {
        console.log("[LAResult] >> [getDetails]");

        const navParams = route?.params ?? {};
        const syncId = navParams?.syncId ?? "";
        const latitude = navParams?.latitude ?? null;
        const longitude = navParams?.longitude ?? null;

        const encSyncId = await getEncValue(syncId);

        const params = {
            syncId: encSyncId,
            stpId: "",
        };

        const responseData = await fetchGetApplicants(encSyncId, false);

        if (!responseData?.success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: responseData?.errorMessage });
            return;
        }

        const { jointApplicantDetails, currentUser, mainApplicantDetails } = responseData;

        // Call API to fetch Application Details
        const { success, errorMessage, propertyDetails, savedData, cancelReason } =
            await fetchApplicationDetails(params);

        if (!success) {
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }

        // Navigate to details page
        navigation.push(BANKINGV2_MODULE, {
            screen: APPLICATION_DETAILS,
            params: {
                latitude,
                longitude,
                savedData,
                propertyDetails,
                jointApplicantDetails,
                mainApplicantDetails,
                currentUser,
                syncId,
                cancelReason,
                from: LA_RESULT,
            },
        });
    }

    function setLoading(loading) {
        dispatch({
            actionType: "SET_LOADING",
            payload: loading,
        });
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={state.loading}
            >
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={<View />}
                    useSafeArea
                    neverForceInset={["top"]}
                >
                    <>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Top Image Component */}
                            <View style={styles.imageContainer(imageHeight)}>
                                <Animatable.Image
                                    animation={imgAnimFadeInUp}
                                    delay={500}
                                    duration={500}
                                    source={Assets.loanApplicationSuccess}
                                    style={styles.imageCls}
                                    resizeMode="cover"
                                    useNativeDriver
                                />

                                {/* Toolbar container for Close Icon */}
                                <View style={styles.toolbarContainer(safeAreaInsets.top)}>
                                    <View style={styles.closeBtnCont}>
                                        <HeaderCloseButton onPress={onCloseTap} />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.horizontalMarginBig}>
                                {/* Header Text */}
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={20}
                                    text={state.headerText}
                                    textAlign="left"
                                />

                                {/* Sub Text 1 */}
                                <Typo
                                    lineHeight={22}
                                    textAlign="left"
                                    style={styles.subText1}
                                    text={state.subText1}
                                />

                                {/* Sub Text 2 */}
                                {(state.status === STATUS_PASS ||
                                    jointApplicantInfo?.customerId !== null) && (
                                    <Typo
                                        lineHeight={22}
                                        textAlign="left"
                                        style={styles.subText1}
                                        text={state.subText2}
                                    />
                                )}
                            </View>

                            {/* Loan Details Container if eligible*/}
                            {state.status === STATUS_PASS && (
                                <View style={Platform.OS === "ios" ? styles.shadow : {}}>
                                    <View
                                        style={[
                                            Platform.OS === "ios" ? {} : styles.shadow,
                                            styles.loanDetailsContainer,
                                            styles.horizontalMargin,
                                        ]}
                                    >
                                        {/* Property Name */}
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text={state.propertyName}
                                        />

                                        {/* Loan Amount Label */}
                                        <Typo
                                            lineHeight={19}
                                            style={styles.loanAmountLabel}
                                            text={state.headerLabelText}
                                        />

                                        {/* Loan Amount value */}
                                        <Typo
                                            fontSize={24}
                                            lineHeight={29}
                                            fontWeight="bold"
                                            style={styles.loanAmount}
                                            text={state.loanAmountFormatted}
                                        />

                                        {/* Info container */}
                                        <View style={styles.infoNoteContainer}>
                                            <Image
                                                source={Assets.noteInfo}
                                                style={styles.infoIcon}
                                                resizeMode="contain"
                                            />

                                            <Typo
                                                fontSize={12}
                                                textAlign="left"
                                                lineHeight={15}
                                                text={ADDITIONAL_FINANCING_INFO}
                                                color={DARK_GREY}
                                                style={styles.infoText}
                                            />
                                        </View>

                                        {/* publicSectorNameFinance info container*/}
                                        {state.publicSectorNameFinance && (
                                            <View style={styles.infoNoteContainer}>
                                                <Image
                                                    source={Assets.noteInfo}
                                                    style={styles.infoIcon}
                                                    resizeMode="contain"
                                                />

                                                <Typo
                                                    fontSize={12}
                                                    textAlign="left"
                                                    lineHeight={15}
                                                    text={PUBLIC_SECTOR_FINANC_TEXT}
                                                    color={DARK_GREY}
                                                    style={styles.infoText}
                                                />
                                            </View>
                                        )}

                                        {/* Gray separator line */}
                                        <View style={styles.graySeparator} />

                                        {/* Interest Rate */}
                                        <DetailField
                                            label={state.subHeaderLabelTextRate}
                                            value={state.interestRateFormatted}
                                            valueSubText1={state.baseRateFormatted}
                                            valueSubText2={state.spreadRateFormatted}
                                        />

                                        {/* loan period */}
                                        <DetailField
                                            label={state.subHeaderLabelTextPeriod}
                                            value={state.loanPeriod}
                                        />

                                        {/* Monthly Instalment */}
                                        <DetailField
                                            label="Monthly instalment"
                                            value={state.monthlyInstalmentFormatted}
                                            infoNote={MONTHLY_INSTALMENT_INFO}
                                        />

                                        {/* Gray separator line */}
                                        <View style={styles.graySeparator} />

                                        {/* Property Price */}
                                        <DetailField
                                            label="Property price"
                                            value={state.propertyPriceFormatted}
                                        />

                                        {/* Down payment */}
                                        <DetailField
                                            label="Downpayment"
                                            value={state.downpaymentFormatted}
                                        />

                                        {/* Bank selling price */}
                                        {state.bankSellingPrice.length > 0 && (
                                            <DetailField
                                                label="Bank’s selling price"
                                                value={state.bankSellingPrice}
                                                isShowLeftInfoIcon={true}
                                                onLeftInfoIconPress={onBankSellingIconPress}
                                            />
                                        )}
                                    </View>
                                </View>
                            )}

                            {/* Joint Applicant */}
                            {jointApplicantInfo !== null && state.status === STATUS_PASS && (
                                <>
                                    <View
                                        style={[styles.graySeparatorBig, styles.horizontalMargin]}
                                    />
                                    <View style={styles.jointApplicantTitle}>
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={20}
                                            text={YOUR_JOINT_APPLICANT}
                                            textAlign="left"
                                            style={styles.horizontalMargin}
                                        />
                                        <JointApplicantDetail
                                            jointApplicantInfo={jointApplicantInfo}
                                        />
                                    </View>
                                </>
                            )}

                            {state.status === STATUS_PASS && (
                                <Typo
                                    fontSize={12}
                                    fontWeight="400"
                                    lineHeight={20}
                                    style={styles.noteLabel}
                                    text="Note: This approval is subject to the bank’s discretion."
                                    textAlign="left"
                                    color={DARK_GREY}
                                />
                            )}
                        </ScrollView>

                        {/* Bottom Container */}
                        <FixedActionContainer>
                            <View style={styles.bottomBtnContCls}>
                                {state.status === STATUS_SOFT_FAIL &&
                                    jointApplicantInfo === null && (
                                        <Typo
                                            fontSize={12}
                                            fontWeight="400"
                                            lineHeight={20}
                                            text="Note: The approval of this application is subject to the bank’s discretion."
                                            textAlign="left"
                                            style={styles.noteLabelBottom}
                                            color={DARK_GREY}
                                        />
                                    )}
                                <ActionButton
                                    activeOpacity={0.5}
                                    backgroundColor={YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            color={BLACK}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text="View application"
                                        />
                                    }
                                    onPress={onViewApplicationPress}
                                />
                            </View>
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </ScreenContainer>

            {/* Info Popup */}
            <Popup
                visible={state.infoPopup}
                title={state.infoPopupTitle}
                description={state.infoPopupDesc}
                onClose={onCloseInfoPopup}
            />
        </>
    );
}

function JointApplicantDetail({ jointApplicantInfo }) {
    const applicantName = jointApplicantInfo?.customerName ?? "";
    const profileImage = jointApplicantInfo?.profilePicBase64
        ? `data:jpeg;base64,${jointApplicantInfo?.profilePicBase64}`
        : null;

    return (
        <View
            style={[
                Platform.OS === "ios" ? styles.shadow : {},
                styles.jointApplicantHeader,
                styles.jointApplicanthorizontalMargin,
            ]}
        >
            <View style={styles.jointApplicantRow}>
                {/* Profile Logo */}

                <Image
                    source={profileImage ? { uri: profileImage } : Assets.emptyProfile}
                    style={styles.profileLogo}
                />
                {/* Main Applicant Name */}
                <View>
                    <Typo
                        lineHeight={17}
                        fontWeight="400"
                        text={applicantName}
                        textAlign="left"
                        style={styles.jointApplicantName}
                    />
                </View>
            </View>
        </View>
    );
}

JointApplicantDetail.propTypes = {
    jointApplicantInfo: PropTypes.object,
};

LAResult.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    bottomBtnContCls: {
        paddingHorizontal: 16,
        width: "100%",
    },

    closeBtnCont: {
        alignItems: "center",
        height: 45,
        justifyContent: "center",
        width: 45,
    },

    graySeparator: {
        borderColor: SEPARATOR,
        borderTopWidth: 1,
        flex: 1,
        height: 1,
        marginVertical: 15,
    },

    graySeparatorBig: {
        borderColor: SEPARATOR,
        borderTopWidth: 1,
        flex: 1,
        height: 1,
        marginVertical: 25,
    },

    horizontalMargin: {
        marginHorizontal: 24,
    },

    horizontalMarginBig: {
        marginHorizontal: 36,
    },

    imageCls: {
        height: "100%",
        width: "100%",
    },

    imageContainer: (imageHeight) => ({
        alignItems: "center",
        height: imageHeight,
    }),

    infoIcon: {
        height: 16,
        width: 16,
    },

    infoNoteContainer: {
        alignItems: "flex-start",
        flexDirection: "row",
        marginBottom: 5,
        marginHorizontal: 20,
        marginTop: 15,
    },

    infoText: {
        marginHorizontal: 12,
    },

    jointApplicantHeader: {
        marginLeft: 40,
        marginTop: 5,
    },

    jointApplicantName: {
        marginTop: 15,
        paddingLeft: 20,
    },

    jointApplicantRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 25,
        width: "100%",
    },

    jointApplicantTitle: { flex: 1, flexDirection: "column" },

    jointApplicanthorizontalMargin: {
        marginHorizontal: 10,
    },

    loanAmount: {
        marginTop: 10,
    },

    loanAmountLabel: {
        marginTop: 15,
    },

    loanDetailsContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        marginVertical: 25,
        paddingVertical: 25,
    },

    noteLabel: {
        marginBottom: 24,
        marginTop: 15,
        paddingHorizontal: 36,
    },

    noteLabelBottom: {
        marginBottom: 24,
    },

    profileLogo: {
        backgroundColor: IRISBLUE,
        borderColor: WHITE,
        borderRadius: 150 / 2,
        borderWidth: 2,
        height: 48,
        width: 48,
    },

    shadow: {
        ...getShadow({
            elevation: 8,
        }),
    },

    subText1: {
        marginTop: 10,
    },
    toolbarContainer: (safeAreaInsetTop) => ({
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingHorizontal: 16,
        width: "100%",
        zIndex: 1,
        top: 0,
        position: "absolute",
        paddingTop: safeAreaInsetTop,
        height: 70 + safeAreaInsetTop,
    }),
});

export default LAResult;
