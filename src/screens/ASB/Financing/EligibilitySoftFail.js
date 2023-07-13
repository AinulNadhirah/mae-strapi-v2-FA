import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Animated, TouchableOpacity, Image, Dimensions } from "react-native";
import * as Animatable from "react-native-animatable";
import { useSelector, useDispatch } from "react-redux";

import {
    DASHBOARD,
    FATCADECLARATION,
    SELECTACCOUNT,
    APPLY_LOANS,
    ELIGIBILITY_SOFT_FAIL,
    COMMON_MODULE,
    PDF_VIEW,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import Spring from "@components/Animations/Spring";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import InlineTypography from "@components/FormComponents/InlineTypography";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { useModelController } from "@context";

import {
    updateApiCEP,
    viewPartyDownload,
    asbCheckEligibilityService,
    asbUpdateApplicationStatus,
} from "@services";
import { logEvent } from "@services/analytics";

import { ELIGIBILITY_SUCCESS } from "@redux/actions/ASBFinance/eligibilityCheckAction";

import {
    ROYAL_BLUE,
    SEPARATOR,
    MEDIUM_GREY,
    WHITE,
    APPROX_GREY,
    SWITCH_GREY,
    YELLOW,
    BLACK,
    BLUE,
} from "@constants/colors";
import {
    DONE,
    CANCEL,
    OUR_RECOMMENDATION,
    PLEASE_SELECT,
    BACED_ON_THE_DETAILS,
    TOTAL_FINANING_AMOUNT,
    RECOMMENDED_FINANCING_TENURE,
    PROFIT_INTEREST,
    MONTHLY_PAYMENT,
    TAKAFUL_INSURANCE_FEE,
    YOUR_POTENTIAL,
    DECLINE_FINANCING,
    APPLY_FINANCING,
    DECIDE_LATER,
    HERE_OUR_OFFER,
    REJECTED_DISCANDED,
    COMMON_ERROR_MSG,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    DECLINE_FINANCING_OFFER,
    POTENTIAL_EARNINGS,
    POTENTIAL_EARNING_RATE,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FORM_ERROR,
    FA_TRANSACTION_ID,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    LEAVE_APPLICATION_GA,
} from "@constants/strings";

import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

const windowHeight = Dimensions.get("window").height;
function EligibilitySoftFailScreen({ route, navigation }) {
    const dispatch = useDispatch();
    const [showStatePicker, setShowStatePicker] = useState(false);
    const [tenure, setTenure] = useState("");
    const [record, setRecord] = useState([]);
    const [result, setResult] = useState([]);
    this.bannerAnimate = new Animated.Value(0);
    const { getModel } = useModelController();
    const userDetails = getModel("user");
    const [tenureList, setTenureList] = useState([]);
    const [showPopup, setShowPopup] = useState(false);

    const prePostQualReducer = useSelector((state) => state.asbServicesReducer.prePostQualReducer);
    const resumeReducer = useSelector((state) => state.resumeReducer);
    const eligibilityReducer = useSelector((state) => state.eligibilityReducer);

    const [loanInformation, setLoanInformation] = useState([]);
    const [grassIncome, setgrassIncome] = useState("");
    const [totalMonthNonBank, setTotalMonthNonBank] = useState("");
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);
    const [showPopupForPE, setShowPopupForPE] = useState(false);

    const stpReferenceNumber =
        prePostQualReducer?.stpreferenceNo ?? resumeReducer?.stpDetails?.stpReferenceNo;

    let count = 0;

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Apply_ASBFinancing_COffer",
        });
        init();
    }, []);

    const init = async () => {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "Apply_ASBFinancing_COffer",
            [FA_TRANSACTION_ID]: stpReferenceNumber,
        });
        const { loanInformation, grassIncome, totalMonthNonBank } = route.params;
        let eligibilityCheckOutcome;
        if (
            eligibilityReducer?.eligibilitData?.eligibilityCheckOutcome != null ||
            eligibilityReducer?.eligibilitData?.eligibilityCheckOutcome != undefined ||
            eligibilityReducer?.eligibilitData?.eligibilityCheckOutcome
        ) {
            eligibilityCheckOutcome = eligibilityReducer?.eligibilitData?.eligibilityCheckOutcome;
        } else {
            eligibilityCheckOutcome = JSON.parse(
                eligibilityReducer?.eligibilitData
            )?.eligibilityCheckOutcome;
        }
        let eligibilityResult = {};
        eligibilityCheckOutcome.map((data) => {
            if (data.dataType === "Recomendation") {
                eligibilityResult = data;
            }
        });

        setLoanInformation(loanInformation);
        setgrassIncome(grassIncome);
        setTotalMonthNonBank(totalMonthNonBank);
        setRecord(eligibilityResult);
        setResult(eligibilityReducer?.eligibilitData);
        setTenure(eligibilityResult?.minTenure);
        getTenure();
    };

    function handleClose() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: LEAVE_APPLICATION_GA,
        });
        setShowPopupConfirm(true);
    }
    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }

    const handleLeaveBtn = async () => {
        setShowPopupConfirm(false);

        const response = await saveUpdateData(false);
        if (response === "0000") {
            navigation.navigate(APPLY_LOANS);
        } else {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    };

    const saveUpdateData = async () => {
        try {
            const body = {
                stpReferenceNo: stpReferenceNumber,
                screenNo: "5",
                totalFinancingAmount: parseInt(record?.loanAmount),
                recommendedFinancingTenure: tenure ? tenure : record?.tenure,
                monthlyPayment: 0.0,
                insuranceFee: parseInt(record?.totalGrossPremium),
                potentialEarning: parseInt(record?.potentialEarning),
                tierList: record?.tierList,
            };
            const response = await updateApiCEP(body, false);
            const result = response?.data?.result.msgHeader;

            if (result.responseCode === "0000") {
                return result.responseCode;
            }
        } catch (error) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    };

    function onPopupPress() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Apply_ASBFinancing_COffer",
            [FA_ACTION_NAME]: "Decline Financing",
        });
        setShowPopup(true);
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Apply_ASBFinancing_DeclineCOffer",
        });
    }
    function onPopupClose() {
        setShowPopup(false);
    }
    const checkEligibility = async (loanTenure) => {
        const body = {
            stpReferenceNo: stpReferenceNumber,
            screenNo: "5",
            loanTenure,
        };
        const response = await asbCheckEligibilityService(body);
        if (response) {
            const eligibilityCheckOutcome =
                response?.data?.result?.wolocResponse?.msgBody?.eligibilityCheckOutcome;
            let eligibilityResult = {};
            eligibilityCheckOutcome?.map((data) => {
                if (data.dataType === "Recomendation") {
                    eligibilityResult = data;
                }
            });
            const apiResponse = response?.data?.result;
            const checkEligibilityResponse = apiResponse?.wolocResponse?.msgBody;
            dispatch({
                type: ELIGIBILITY_SUCCESS,
                data: checkEligibilityResponse,
                loanInformation,
                grassIncome,
                totalMonthNonBank,
            });

            setRecord(eligibilityResult);
            setResult(checkEligibilityResponse);
        }
    };

    const animateBanner = () => {
        return {
            opacity: this.bannerAnimate.interpolate({
                inputRange: [0, 120, 240],
                outputRange: [1, 0.8, 0],
            }),
            transform: [
                {
                    scale: this.bannerAnimate.interpolate({
                        inputRange: [-200, 0, 1],
                        outputRange: [1.4, 1, 1],
                    }),
                },
                {
                    translateY: this.bannerAnimate.interpolate({
                        inputRange: [-200, 0, 240],
                        outputRange: [0, 0, -100],
                    }),
                },
            ],
        };
    };

    const InfoLabel = () => {
        return (
            <View style={styles.infoLabelContainerCls}>
                <TouchableOpacity>
                    <Image style={styles.infoIcon} source={Assets.icInformation} />
                </TouchableOpacity>
                <Typo
                    fontSize={12}
                    lineHeight={14}
                    fontWeight="400"
                    letterSpacing={0}
                    textAlign="left"
                    text={OUR_RECOMMENDATION}
                    color={APPROX_GREY}
                />
            </View>
        );
    };

    function onPickerDone(item) {
        setTenure(item.value);
        checkEligibility(item.value);
        onPickerCancel();
    }

    function onPickerCancel() {
        setShowStatePicker(false);
    }
    const getTenure = () => {
        const noOfTenures = [];
        const min = record?.minTenure;
        const max = record?.maxTenure;
        for (var i = min; i <= max; i++) {
            noOfTenures.push({
                name: i + " Years",
                value: i,
            });
        }
        setTenureList(noOfTenures);
    };

    function onDecideLater() {
        navigation.navigate(DASHBOARD);
    }

    function onApplyFinancing() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Apply_ASBFinancing_COffer",
            [FA_ACTION_NAME]: "Apply Financing",
        });

        if (result?.overallValidationResult === "GREEN") {
            navigation.navigate(SELECTACCOUNT, { comingFrom: ELIGIBILITY_SOFT_FAIL });
        } else if (result?.overallValidationResult === "AMBER") {
            navigation.navigate(FATCADECLARATION, { comingFrom: ELIGIBILITY_SOFT_FAIL });
        }
    }

    const handleDecline = async () => {
        setShowPopup(false);

        const body = {
            stpReferenceNo: stpReferenceNumber,
            action: "CANCEL",
            status: "ELGCNCL",
            reason: "Accept other offer",
        };

        const response = await asbUpdateApplicationStatus(body);
        if (response) {
            const result = response?.data?.result;
            setShowPopup(false);
            if (result?.overallStatus?.statusCode === "0000") {
                navigation.navigate(DASHBOARD);
                showInfoToast({
                    message: DECLINE_FINANCING_OFFER,
                });
            } else {
                showErrorToast({
                    message: COMMON_ERROR_MSG,
                });
            }
        }
    };

    async function handleViewParty() {
        try {
            const data = {
                quotationId: result?.quotationId ? result?.quotationId : "000000000003E53F",
                stpReferenceNo: stpReferenceNumber,
            };
            const response = await viewPartyDownload(data, false);
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: "Apply_ASBFinancing_ViewInsuranceFee",
            });
            const title = "View More";
            const url = response?.data?.result;
            const params = {
                file: { base64: url },
                share: true,
                type: "base64",
                title,
                pdfType: "shareReceipt",
            };

            navigation.navigate(COMMON_MODULE, {
                screen: PDF_VIEW,
                params: { params },
            });
        } catch (error) {}
    }

    function getTenuresIndex(value) {
        return tenureList.findIndex((obj) => obj.name === value);
    }

    function showToolTip() {
        setShowPopupForPE(true);
    }

    function hideToolTip() {
        setShowPopupForPE(false);
    }

    return (
        <>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                useSafeArea
            >
                <View style={styles.container}>
                    <View style={{ height: windowHeight }}>
                        <Animated.View style={[styles.promotionImage, animateBanner()]}>
                            <Animatable.Image
                                animation="fadeInUp"
                                duration={300}
                                source={Assets.illustrationLoan}
                                style={styles.merchantBanner}
                            />
                        </Animated.View>
                        <Animated.ScrollView
                            scrollEventThrottle={16}
                            onScroll={Animated.event(
                                [
                                    {
                                        nativeEvent: {
                                            contentOffset: { y: this.bannerAnimate },
                                        },
                                    },
                                ],
                                { useNativeDriver: true }
                            )}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.mainContent}>
                                <View style={styles.contentArea}>
                                    <Typo
                                        fontSize={18}
                                        lineHeight={25}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        textAlign="left"
                                        text={"Dear " + userDetails?.fullName + ","}
                                        style={styles.textAlign}
                                    />
                                            <Typo
                                                fontSize={14}
                                                lineHeight={20}
                                                fontWeight="400"
                                                letterSpacing={0}
                                                textAlign="left"
                                        text={BACED_ON_THE_DETAILS}
                                                style={styles.textAlign}
                                            />
                                            <Typo
                                                fontSize={14}
                                                lineHeight={20}
                                                fontWeight="400"
                                                letterSpacing={0}
                                                textAlign="left"
                                                text={HERE_OUR_OFFER}
                                                style={styles.textAlign}
                                            />

                                    <View style={styles.shadow}>
                                        <Spring style={styles.card} activeOpacity={0.9}>
                                            <View style={styles.cardHead}>
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={19}
                                                    fontWeight="400"
                                                    fontStyle="normal"
                                                    textAlign="left"
                                                    text={TOTAL_FINANING_AMOUNT}
                                                />
                                                <Typo
                                                    fontSize={24}
                                                    lineHeight={29}
                                                    fontWeight="700"
                                                    letterSpacing={0}
                                                    textAlign="left"
                                                    text={
                                                        "RM " +
                                                        numeral(record?.loanAmount).format(",0.00")
                                                    }
                                                    style={styles.cardHeadAmt}
                                                />
                                            </View>
                                            <View style={styles.cardBody}>
                                                <View style={styles.cardBodyRow}>
                                                    <View style={styles.cardBodyColL}>
                                                        <Typo
                                                            fontSize={14}
                                                            lineHeight={18}
                                                            fontWeight="400"
                                                            letterSpacing={0}
                                                            textAlign="left"
                                                            text={RECOMMENDED_FINANCING_TENURE}
                                                        />
                                                    </View>
                                                    <View style={styles.cardBodyColR}>
                                                        <Typo
                                                            fontSize={14}
                                                            lineHeight={18}
                                                            fontWeight="600"
                                                            letterSpacing={0}
                                                            textAlign="right"
                                                            text={
                                                                tenure
                                                                    ? tenure + " years"
                                                                    : PLEASE_SELECT
                                                            }
                                                        />
                                                    </View>
                                                </View>
                                                <View style={styles.cardBodyRow}>
                                                    {InfoLabel()}
                                                </View>
                                                {record?.tierList?.map((data, index) => {
                                                    count += data.year;
                                                    return (
                                                        <View style={styles.recRow} key={index}>
                                                            <View style={styles.cardBodyColL}>
                                                                <Typo
                                                                    fontSize={14}
                                                                    lineHeight={18}
                                                                    fontWeight="600"
                                                                    letterSpacing={0}
                                                                    textAlign="left"
                                                                    text={
                                                                            record?.tierList
                                                                                .length === 1
                                                                            ? ""
                                                                            : data.tier === 1
                                                                            ? "First " +
                                                                              data.year +
                                                                              " years"
                                                                            : index !==
                                                                              record?.tierList
                                                                                  .length -
                                                                                  1
                                                                            ? count + " years"
                                                                            : index +
                                                                              3 +
                                                                              "-" +
                                                                              count +
                                                                              " years"
                                                                    }
                                                                />
                                                            </View>
                                                            <InlineTypography
                                                                label={PROFIT_INTEREST}
                                                                value={
                                                                    !!data &&
                                                                    data?.interestRate &&
                                                                    `${numeral(
                                                                        data?.interestRate
                                                                    ).format(",0.00")}%`
                                                                }
                                                                componentID="interestRate"
                                                                    style={
                                                                        styles.detailsRowContainer
                                                                    }
                                                            />

                                                            {/* Monthly Payments */}
                                                            <InlineTypography
                                                                label={MONTHLY_PAYMENT}
                                                                value={
                                                                    !!data &&
                                                                    data?.installmentAmount &&
                                                                    `RM ${numeral(
                                                                        data?.installmentAmount
                                                                    ).format(",0.00")}`
                                                                }
                                                                infoBtn={false}
                                                                componentID="monthlyPayments"
                                                                    style={
                                                                        styles.detailsRowContainer
                                                                    }
                                                            />
                                                        </View>
                                                    );
                                                })}
                                                {/* {record?.tierList?.map((data, index) => {
                                                    count += data.year;
                                                    return (
                                                        <View style={styles.recRow} key={index}>
                                                            <View style={styles.cardBodyRow}>
                                                                <View
                                                                    style={styles.cardBodyColLYear}
                                                                >
                                                                    <Typo
                                                                        fontSize={14}
                                                                        lineHeight={18}
                                                                        fontWeight="600"
                                                                        letterSpacing={0}
                                                                        textAlign="left"
                                                                        text={
                                                                            record?.tierList
                                                                                ?.length === 1
                                                                                ? ""
                                                                                : data.tier === 1
                                                                                ? "First " +
                                                                                  data.year +
                                                                                  " years"
                                                                                : index !=
                                                                                  record?.tierList
                                                                                      .length -
                                                                                      1
                                                                                ? count
                                                                                : index +
                                                                                  3 +
                                                                                  "-" +
                                                                                  count
                                                                        }
                                                                    />
                                                                    <Typo
                                                                        fontSize={14}
                                                                        lineHeight={18}
                                                                        fontWeight="600"
                                                                        letterSpacing={0}
                                                                        textAlign="left"
                                                                        text={
                                                                            data.tier != 1
                                                                                ? index !=
                                                                                  record?.tierList
                                                                                      .length -
                                                                                      1
                                                                                    ? "th"
                                                                                    : null
                                                                                : null
                                                                        }
                                                                        style={styles.thText}
                                                                    />
                                                                    <Typo
                                                                        fontSize={14}
                                                                        lineHeight={18}
                                                                        fontWeight="600"
                                                                        letterSpacing={0}
                                                                        textAlign="left"
                                                                        text={
                                                                            data.tier != 1
                                                                                ? index !=
                                                                                  record?.tierList
                                                                                      .length -
                                                                                      1
                                                                                    ? " year"
                                                                                    : " years"
                                                                                : null
                                                                        }
                                                                    />
                                                                </View>
                                                            </View>
                                                            <View style={styles.cardBodyRow}>
                                                                <View style={styles.cardBodyColL}>
                                                                    <Typo
                                                                        fontSize={14}
                                                                        lineHeight={18}
                                                                        fontWeight="400"
                                                                        letterSpacing={0}
                                                                        textAlign="left"
                                                                        text={PROFIT_INTEREST}
                                                                    />
                                                                </View>
                                                                <View style={styles.cardBodyColR}>
                                                                    <Typo
                                                                        fontSize={14}
                                                                        lineHeight={18}
                                                                        fontWeight="600"
                                                                        letterSpacing={0}
                                                                        textAlign="right"
                                                                        text={
                                                                            numeral(
                                                                                data?.interestRate
                                                                            ).format(",0.00") + "%"
                                                                        }
                                                                    />
                                                                </View>
                                                            </View>
                                                            <View style={styles.cardBodyRow}>
                                                                <View style={styles.cardBodyColL}>
                                                                    <Typo
                                                                        fontSize={14}
                                                                        lineHeight={18}
                                                                        fontWeight="400"
                                                                        letterSpacing={0}
                                                                        textAlign="left"
                                                                        text={MONTHLY_PAYMENT}
                                                                    />
                                                                </View>
                                                                <View style={styles.cardBodyColR}>
                                                                    <Typo
                                                                        fontSize={14}
                                                                        lineHeight={18}
                                                                        fontWeight="600"
                                                                        letterSpacing={0}
                                                                        textAlign="right"
                                                                        text={
                                                                            "RM " +
                                                                            numeral(
                                                                                data?.installmentAmount
                                                                            ).format(",0.00")
                                                                        }
                                                                    />
                                                                </View>
                                                            </View>
                                                        </View>
                                                    );
                                                })} */}
                                                <View style={styles.cardBodyRow}>
                                                    <View style={styles.cardBodyColL}>
                                                        <Typo
                                                            fontSize={14}
                                                            lineHeight={18}
                                                            fontWeight="400"
                                                            letterSpacing={0}
                                                            textAlign="left"
                                                            text={TAKAFUL_INSURANCE_FEE}
                                                        />
                                                        <TouchableOpacity onPress={handleViewParty}>
                                                            <Typo
                                                                fontSize={14}
                                                                lineHeight={18}
                                                                fontWeight="600"
                                                                letterSpacing={0}
                                                                textAlign="left"
                                                                text="View"
                                                                color={ROYAL_BLUE}
                                                            />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <View style={styles.cardBodyColR}>
                                                        <Typo
                                                            fontSize={14}
                                                            lineHeight={18}
                                                            fontWeight="600"
                                                            letterSpacing={0}
                                                            textAlign="right"
                                                            text={
                                                                "RM " +
                                                                numeral(
                                                                    record?.totalGrossPremium
                                                                ).format(",0.00")
                                                            }
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        </Spring>
                                    </View>

                                    <View style={styles.shadow}>
                                        <Spring style={styles.cardOne} activeOpacity={0.9}>
                                            <View style={styles.cardHeader}>
                                                <View style={styles.infoLabelContainerClsOne}>
                                                    <Typo
                                                        fontSize={14}
                                                        lineHeight={18}
                                                        fontWeight="400"
                                                        fontStyle="normal"
                                                        textAlign="left"
                                                        text={POTENTIAL_EARNINGS}
                                                    />
                                                    <TouchableOpacity onPress={showToolTip}>
                                                        <Image
                                                            style={styles.infoIconOne}
                                                            source={Assets.icInformation}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                                <Typo
                                                    fontSize={24}
                                                    lineHeight={29}
                                                    fontWeight="700"
                                                    letterSpacing={0}
                                                    textAlign="left"
                                                    text={
                                                        "RM " +
                                                        numeral(record?.potentialEarning).format(
                                                            ",0.00"
                                                        )
                                                    }
                                                    style={styles.cardHeadAmt}
                                                />
                                            </View>
                                        </Spring>
                                    </View>
                                    <Typo
                                        fontSize={12}
                                        lineHeight={18}
                                        fontWeight="400"
                                        letterSpacing={0}
                                        text={YOUR_POTENTIAL}
                                        style={styles.cardHeadAmt}
                                    />

                                    <View style={styles.boderBottom} />
                                        </View>
                                <View style={styles.btnSection}>
                                    <View style={styles.buttonAlign}>
                                        <ActionButton
                                            backgroundColor={WHITE}
                                            fullWidth
                                            componentCenter={
                                                <Typo
                                                    color={BLACK}
                                                    lineHeight={18}
                                                    fontWeight="600"
                                                    text={DECIDE_LATER}
                                                />
                                            }
                                            onPress={onDecideLater}
                                        />
                                    </View>
                                    <View style={styles.buttonAlign}>
                                        <ActionButton
                                            backgroundColor={YELLOW}
                                            fullWidth
                                            componentCenter={
                                                <Typo
                                                    color={BLACK}
                                                    lineHeight={18}
                                                    fontWeight="600"
                                                    text={APPLY_FINANCING}
                                                />
                                            }
                                            onPress={onApplyFinancing}
                                        />
                                    </View>
                                    <View style={styles.buttonAlign}>
                                        <ActionButton
                                            backgroundColor={MEDIUM_GREY}
                                            fullWidth
                                            componentCenter={
                                                <Typo
                                                    color={BLUE}
                                                    lineHeight={18}
                                                    fontWeight="600"
                                                    text={DECLINE_FINANCING}
                                                />
                                            }
                                            onPress={onPopupPress}
                                        />
                                    </View>
                                </View>
                            </View>
                        </Animated.ScrollView>
                    </View>
                </View>

                <Popup
                    visible={showPopupConfirm}
                    onClose={onPopupCloseConfirm}
                    title={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE}
                    description={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC}
                    primaryAction={{
                        text: "Leave",
                        onPress: handleLeaveBtn,
                    }}
                    secondaryAction={{
                        text: "Cancel",
                        onPress: onPopupCloseConfirm,
                    }}
                />
                <ScrollPickerView
                    showMenu={showStatePicker}
                    list={tenureList}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                    selectedIndex={tenure ? getTenuresIndex(tenure) : 0}
                />
                <Popup
                    visible={showPopup}
                    onClose={onPopupClose}
                    title={DECLINE_FINANCING}
                    description={REJECTED_DISCANDED}
                    secondaryAction={{
                        text: "Decline",
                        onPress: handleDecline,
                    }}
                    primaryAction={{
                        text: "Cancel",
                        onPress: onPopupClose,
                    }}
                />
                <Popup
                    visible={showPopupForPE}
                    onClose={hideToolTip}
                    title={POTENTIAL_EARNINGS}
                    description={POTENTIAL_EARNING_RATE}
                />
            </ScreenLayout>
        </>
    );
}

EligibilitySoftFailScreen.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    boderBottom: {
        borderBottomColor: SWITCH_GREY,
        borderBottomWidth: 1,
        marginVertical: 25,
    },
    btnSection: { marginBottom: 30 },
    buttonAlign: {
        paddingHorizontal: 25,
        paddingVertical: 15,
    },
    card: {
        backgroundColor: WHITE,
        borderRadius: 10,
        justifyContent: "center",
        marginBottom: 16,
        overflow: "hidden",
        paddingBottom: 25,
        paddingVertical: 0,
        width: "100%",
    },
    cardBody: {
        paddingHorizontal: 16,
    },
    cardBodyColL: {
        width: "60%",
    },
    cardBodyColLYear: {
        flexDirection: "row",
        width: "60%",
    },
    cardBodyColR: {
        width: "40%",
    },
    cardBodyRow: {
        flexDirection: "row",
        paddingVertical: 7,
    },
    cardHead: {
        alignItems: "center",
        borderBottomColor: SEPARATOR,
        borderBottomWidth: 1,
        flex: 1,
        justifyContent: "center",
        marginBottom: 20,
        paddingHorizontal: 16,
        paddingVertical: 25,
    },
    cardHeadAmt: {
        paddingTop: 5,
    },
    cardHeader: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        paddingVertical: 25,
    },

    cardOne: {
        backgroundColor: WHITE,
        borderRadius: 10,
        justifyContent: "center",
        marginBottom: 16,
        overflow: "hidden",
        paddingVertical: 0,
        width: "100%",
    },

    container: {
        flex: 1,
        top: -70,
    },
    contentArea: {
        marginHorizontal: 25,
        paddingTop: 25,
    },
    infoIcon: {
        height: 16,
        marginRight: 7,
        opacity: 0.4,
        width: 16,
    },
    infoIconOne: {
        height: 16,
        marginLeft: 7,
        width: 16,
    },
    infoLabelContainerCls: {
        flexDirection: "row",
        paddingVertical: 2,
        width: "80%",
    },
    infoLabelContainerClsOne: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        paddingVertical: 2,
        width: "100%",
    },
    mainContent: {
        backgroundColor: MEDIUM_GREY,
        marginTop: 300,
    },

    merchantBanner: { flex: 1, height: "100%", width: "100%" },

    promotionImage: {
        height: 300,
        position: "absolute",
        top: 0,
        width: "100%",
    },
    recRow: {
        borderBottomColor: SEPARATOR,
        borderBottomWidth: 1,
        paddingVertical: 8,
    },
    shadow: {
        ...getShadow({}),
    },
    textAlign: {
        paddingBottom: 20,
    },
    thText: {
        fontSize: 10,
        top: -5,
    },
    detailsRowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
        width: "100%",
    },
});

export default EligibilitySoftFailScreen;
