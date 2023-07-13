import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native";

import { addCommas, removeCommas, prequalCheck2 } from "@screens/PLSTP/PLSTPController";

import {
    PLSTP_LOAN_APPLICATION,
    PLSTP_PERSONAL_DETAILS,
    SETTINGS_MODULE,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import InlineTypography from "@components/FormComponents/InlineTypography";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { savePPData } from "@services";
import { logEvent } from "@services/analytics";

import { YELLOW, BLACK, GREY, WHITE, TRANSPARENT } from "@constants/colors";
import {
    STEP_4,
    REPAYMENT_DETAILS,
    LOAN_AMOUNT,
    TENURE,
    INTEREST_RATE,
    MONTHLY_PAYS,
    PROT_PLAN,
    PROT_PLAN_DESC,
    ADDON_CARE,
    RECEIVED_AMOUNT,
    PROCEED,
    TERMS_CONDITIONS,
    INFO_TITLE,
    INFO_DESC,
    FA_FORM_PROCEED,
    FA_SCREEN_NAME,
} from "@constants/strings";
import { PROTECTION_PLAN_TNC } from "@constants/url";

import Assets from "@assets";

const screenWidth = Dimensions.get("window").width;
const leftTextWidth = (screenWidth * 50) / 100;
const rightTextWidth = (screenWidth * 30) / 100;

function PLSTPRepaymentDetails({ navigation, route }) {
    const { initParams } = route?.params;
    const { customerInfo, stpRefNum } = initParams;
    const [loanAmount, setLoanAmount] = useState("");
    const [tenure, setTenure] = useState("");
    const [interestRate, setInterestRate] = useState("");
    const [monthlyPayments, setMonthlyPayments] = useState("");
    const [carePlan, setCarePlan] = useState("");
    const [amountReceive, setAmountReceive] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const [radioTNCChecked, setRadioTNCChecked] = useState(customerInfo?.personalCarePlan || false);

    useEffect(() => {
        const amount = customerInfo?.personalCarePlan
            ? parseFloat(customerInfo.amountNeed) - parseFloat(customerInfo.premiumAmount)
            : customerInfo.amountNeed;
        setAmountReceive(addCommas(amount));
        setLoanAmount(addCommas(customerInfo?.amountNeed));
        setTenure(customerInfo?.tenure);
        setInterestRate(customerInfo?.loanInteret);
        setMonthlyPayments(addCommas(customerInfo?.monthlyInstalment));
        setCarePlan(addCommas(customerInfo?.premiumAmount));
        // eslint-disable-next-line react-hooks/exhaustive-deps
        // Need to execute when navigate into this screen
    }, [navigation, route]);

    function onRadioBtnTNCTap() {
        setRadioTNCChecked(!radioTNCChecked);
        if (radioTNCChecked) {
            setAmountReceive(addCommas(customerInfo.amountNeed));
        } else {
            let subtract = Number(customerInfo.amountNeed) - Number(customerInfo.premiumAmount);
            if (!Number.isInteger(subtract)) {
                subtract = subtract.toFixed(2);
            }
            const finalAmount = addCommas(subtract);
            // console.log("the final amount after deducting premium amount ::: ",amount);
            setAmountReceive(finalAmount);
        }
    }

    async function onDoneTap() {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Apply_PersonalLoan_4",
        });

        if (!initParams.isSAL && !initParams?.prequal2Status) {
            const prequal2Data = {
                stpRefNo: stpRefNum,
                callType: "REGISTER",
            };
            const response = await prequalCheck2(prequal2Data);
            if (response?.data?.code === 200) {
                const initData = {
                    ...initParams,
                    carlosStpRefNo: response.data?.result?.carlosStpRefNo,
                };
                navToNextScreen(initData);
            } else {
                const initData = { ...initParams, isSAL: true };
                navToNextScreen(initData);
            }
        } else {
            navToNextScreen(initParams);
        }
    }

    async function navToNextScreen(initData) {
        const data = {
            stpRefNo: stpRefNum,
            personalCarePlan: radioTNCChecked,
        };
        const result = await saveData(data);
        if (result?.data?.code === 200) {
            const custInfo = {
                ...customerInfo,
                personalCarePlan: radioTNCChecked,
                amountReceive: removeCommas(amountReceive),
            };
            initData = { ...initData, customerInfo: custInfo };
            navigation.navigate(PLSTP_PERSONAL_DETAILS, {
                ...route.params,
                initParams: initData,
            });
        } else {
            showErrorToast({
                message: result?.data?.message,
            });
        }
    }

    async function saveData(payload) {
        try {
            const response = await savePPData(payload);
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            showErrorToast({ message: error?.message });
            return null;
        }
    }

    function onBackTap() {
        console.log("[PLSTPRepaymentDetails] >> [onBackTap]");

        navigation.navigate(PLSTP_LOAN_APPLICATION, {
            ...route.params,
        });
    }

    function onCloseTap() {
        console.log("[PLSTPRepaymentDetails] >> [onCloseTap]");
        navigation.navigate(route?.params?.entryStack || "More", {
            screen: route?.params?.entryScreen || "Apply",
            params: route?.params?.entryParams,
        });
    }

    function onLinkTap() {
        console.log("[PLSTPRepaymentDetails] >> [onLinkTap]");

        const props = {
            title: TERMS_CONDITIONS,
            source: PROTECTION_PLAN_TNC,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }

    function toggleBtnPress() {
        console.log("[PLSTPRepaymentDetails] >> [toggleBtnPress]");
        setShowPopup(!showPopup);
    }

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName="Apply_PersonalLoan_4">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={STEP_4}
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
                        <ScrollView
                            style={Style.scrollViewCls}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={Style.formContainer}>
                                {/* Credit Title */}
                                <Typo
                                    fontSize={14}
                                    lineHeight={23}
                                    fontWeight="600"
                                    textAlign="left"
                                    text={REPAYMENT_DETAILS}
                                    style={Style.headerLabelCls}
                                />

                                {/* Loan/Financing Amount */}
                                <InlineTypography
                                    label={LOAN_AMOUNT}
                                    value={`RM ${loanAmount}`}
                                    componentID="loanAmount"
                                    style={Style.inlineTypographyFieldCls}
                                />

                                {/* Tenure */}
                                <InlineTypography
                                    label={TENURE}
                                    value={tenure}
                                    componentID="tenure"
                                    style={Style.inlineTypographyFieldCls}
                                />

                                {/* Interest/Profit Rate */}
                                <InlineTypography
                                    label={INTEREST_RATE}
                                    value={`${interestRate}% p.a.`}
                                    componentID="interestRate"
                                    style={Style.inlineTypographyFieldCls}
                                />

                                {/* Monthly Payments */}
                                <InlineTypography
                                    label={MONTHLY_PAYS}
                                    value={`RM ${monthlyPayments}`}
                                    infoBtn={true}
                                    infoBtnPress={toggleBtnPress}
                                    componentID="monthlyPayments"
                                    style={Style.inlineTypographyFieldCls}
                                />

                                {/* Gray separator line */}
                                <View style={Style.graySeparator} />

                                {/* Protect Plan */}
                                <View style={Style.protectPlan}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                        textAlign="left"
                                        text={PROT_PLAN}
                                    />
                                    <Typo
                                        fontSize={12}
                                        lineHeight={20}
                                        fontWeight="400"
                                        textAlign="left"
                                        text={PROT_PLAN_DESC}
                                        style={Style.headerLabelCls}
                                    />
                                    <Typo
                                        fontSize={12}
                                        lineHeight={20}
                                        fontWeight="300"
                                        textAlign="left"
                                        text={TERMS_CONDITIONS}
                                        style={Style.tnc}
                                        onPress={onLinkTap}
                                    />
                                </View>
                                {/* Credit TNC Desc */}
                                <View style={Style.radioCheckContainer}>
                                    <TouchableOpacity
                                        onPress={onRadioBtnTNCTap}
                                        style={Style.radioContainer}
                                    >
                                        <Image
                                            style={Style.image}
                                            source={
                                                radioTNCChecked
                                                    ? Assets.icRadioChecked
                                                    : Assets.icRadioUnchecked
                                            }
                                        />
                                    </TouchableOpacity>
                                    <View style={Style.textContainer}>
                                        <Typo
                                            fontSize={12}
                                            lineHeight={18}
                                            fontWeight="400"
                                            textAlign="left"
                                            text={ADDON_CARE}
                                            style={Style.carePlanText}
                                        />
                                        <Typo
                                            textAlign="right"
                                            color={BLACK}
                                            fontSize={12}
                                            fontWeight={"600"}
                                            lineHeight={18}
                                            text={`-RM ${carePlan}`}
                                            style={Style.carePlanAmount}
                                        />
                                    </View>
                                </View>

                                {/* Gray separator line */}
                                <View style={Style.graySeparator} />

                                {/* Amount receive */}
                                <InlineTypography
                                    label={RECEIVED_AMOUNT}
                                    value={`RM ${amountReceive}`}
                                    componentID="amountReceive"
                                    leftFont={12}
                                    rightFont={screenWidth > 400 ? 20 : 18}
                                    rightFontWeight="700"
                                    style={Style.amountYouReceive}
                                />
                            </View>
                        </ScrollView>

                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={1}
                                    backgroundColor={YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={PROCEED}
                                        />
                                    }
                                    onPress={onDoneTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
                <Popup
                    visible={showPopup}
                    title={INFO_TITLE}
                    description={INFO_DESC}
                    onClose={toggleBtnPress}
                />
            </ScreenContainer>
        </React.Fragment>
    );
}

const Style = StyleSheet.create({
    amountYouReceive: {
        height: 30,
        marginTop: 25,
    },

    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    carePlanAmount: {
        maxWidth: rightTextWidth,
    },
    carePlanText: {
        maxWidth: leftTextWidth,
    },
    formContainer: {
        marginBottom: 40,
    },
    graySeparator: {
        borderColor: GREY,
        borderTopWidth: 1,
        height: 1,
        marginVertical: 25,
    },

    headerLabelCls: {
        marginTop: 15,
    },

    image: {
        borderColor: BLACK,
        borderRadius: 10,
        borderWidth: 1,
        height: 20,
        marginRight: 7,
        width: 20,
    },

    inlineTypographyFieldCls: {
        height: 30,
        marginTop: 18,
    },

    protectPlan: {
        backgroundColor: WHITE,
        borderRadius: 8,
        padding: 20,
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },

    radioCheckContainer: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 25,
    },

    radioContainer: {
        marginTop: 2,
    },

    scrollViewCls: {
        paddingHorizontal: 36,
    },
    textContainer: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "space-between",
        overflow: "visible",
        width: "87%",
    },
    tnc: {
        textDecorationLine: "underline",
    },
});

export default PLSTPRepaymentDetails;
