import React, { useReducer, useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from "react-native";

import { massagePLSTPMasterData, addCommas, removeCommas } from "@screens/PLSTP/PLSTPController";
import { validateMonthlyGrossInc } from "@screens/PLSTP/PLSTPValidation";

import {
    PLSTP_CREDIT_CHECK,
    PLSTP_LOAN_APPLICATION,
    PLSTP_PREQUAL2_FAIL,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { invokeL3, plstpPrequalCheck, validateIncome } from "@services";
import { logEvent } from "@services/analytics";

import { YELLOW, DISABLED, FADE_GREY } from "@constants/colors";
import {
    STEP_1,
    INCOME_DETAILS_DESC,
    INCOME_NOTE,
    MONTHLY_GROSS_INC,
    INCOME_TT,
    AMOUNT_PLACEHOLDER,
    PLSTP_AGREE,
    CURRENCY_CODE,
    FA_FORM_PROCEED,
    FA_SCREEN_NAME,
} from "@constants/strings";

import Assets from "@assets";

// Initial state object
const initialState = {
    // Monthly Gross Income related
    monthlyGrossInc: "",
    monthlyGrossIncValid: true,
    monthlyGrossIncErrorMsg: "",

    // Others
    isContinueDisabled: true,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "monthlyGrossInc":
            return {
                ...state,
                monthlyGrossInc: payload,
            };
        case "monthlyGrossIncValid":
            return {
                ...state,
                monthlyGrossIncValid: payload?.valid,
                monthlyGrossIncErrorMsg: payload?.errorMsg,
            };
        case "isContinueDisabled":
            return {
                ...state,
                isContinueDisabled: payload,
            };
        default:
            return { ...state };
    }
}

function PLSTPIncomeDetails({ route, navigation }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [desc, setDesc] = useState(INCOME_DETAILS_DESC);
    const [loading, setLoading] = useState(true);
    const [showScreen, setShowScreen] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        init();
    }, []);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        // console.log("[PLSTPIncomeDetails] >> [Form Fields Updated]");
        const { monthlyGrossInc } = state;
        dispatch({
            actionType: "isContinueDisabled",
            payload: monthlyGrossInc === "",
        });
    }, [state.monthlyGrossInc]);

    const init = async () => {
        console.log("[PLSTPIncomeDetails] >> [init]");
        const httpResp = await invokeL3(true).catch((error) => {
            console.log("PLSTPIncomeDetails >> invokel3", error);
        });
        const code = httpResp?.data?.code ?? null;
        if (code !== 0) {
            onBackTap();
            return;
        }
        setShowScreen(true);

        //Prequal Check 1
        if (!route?.params?.initParams?.stpRefNum) {
            prequalCheck1();
        } else {
            setLoading(false);
        }

        const params = route?.params ?? {};
        const { customerInfo } = params?.initParams;
        const { monthlyGrossInc } = customerInfo;

        // Pre-populate field values if any existing
        if (monthlyGrossInc)
            dispatch({ actionType: "monthlyGrossInc", payload: addCommas(monthlyGrossInc) });

        setDesc(INCOME_DETAILS_DESC.replace("{userName}", params?.fullName));
    };

    function toggleBtnPress() {
        console.log("[PLSTPIncomeDetails] >> [toggleBtnPress]");
        setShowPopup(!showPopup);
    }

    const prequalCheck1 = () => {
        plstpPrequalCheck()
            .then((response) => {
                // Navigate to Next screen (ScreenName : )
                setLoading(false);
                if (response?.data?.code === 200) {
                    const massageData = massagePLSTPMasterData(
                        response?.data?.result?.masterDataVO
                    );
                    navigation.setParams({
                        ...route?.params,
                        initParams: {
                            ...route?.params?.initParams,
                            stpRefNum: response?.data?.result?.stpRefNumber,
                            masterData: massageData,
                        },
                    });
                } else {
                    showErrorToast({
                        message: response?.data?.message,
                    });
                    onBackTap();
                }
            })
            .catch((error) => {
                setLoading(false);
                console.log("[PLSTPIncomeDetails][onDoneTap] >> Catch", error);
                if (error?.error?.code === 600) {
                    showInfoToast({
                        message: error.message,
                    });
                } else {
                    showErrorToast({
                        message: error.message,
                    });
                }
                onBackTap();
            });
    };

    const onMonthlyGrossIncChange = (value) => {
        console.log("[PLSTPIncomeDetails] >> [onEmpTypeFieldTap]");

        value = addCommas(value);
        dispatch({
            actionType: "monthlyGrossInc",
            payload: value,
        });
    };

    const onDoneTap = () => {
        console.log("[PLSTPIncomeDetails] >> [onDoneTap]");
        // Return if button is disabled
        if (state.isContinueDisabled) return;
        const validateResult = { isValid: false, message: "" };

        // Monthly Gross Income validation
        const income = removeCommas(state.monthlyGrossInc);
        Object.assign(validateResult, validateMonthlyGrossInc(income));
        dispatch({
            actionType: "monthlyGrossIncValid",
            payload: { valid: validateResult.isValid, errorMsg: validateResult.message },
        });
        if (!validateResult.isValid) return;

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Apply_PersonalLoan_1",
        });
        const data = {
            income,
            stpRefNo: route?.params?.initParams?.stpRefNum,
        };
        validateIncome(data)
            .then((response) => {
                // Navigate to Next screen (ScreenName : )
                if (response?.data?.code === 200) {
                    const result = response?.data?.result;

                    const custInfo = {
                        ...route?.params?.initParams?.customerInfo,
                        monthlyGrossInc: income,
                        ietGrossIncome: result?.ietGrossIncome,
                        ietNetIncome: result?.ietNetIncome,
                    };
                    const initData = {
                        ...route?.params?.initParams,
                        customerInfo: custInfo,
                        gcifData: result?.gcifData,
                        isSAL: result?.approvalStatus === "APPROVED" ? false : true,
                    };

                    navigation.navigate(
                        result?.approvalStatus === "APPROVED"
                            ? PLSTP_CREDIT_CHECK
                            : PLSTP_LOAN_APPLICATION,
                        {
                            ...route.params,
                            initParams: initData,
                        }
                    );
                } else {
                    const custInfo = {
                        shortRefNo: response?.data?.result?.stpRefNo,
                        dateTime: response?.data?.result?.dateTime,
                    };
                    const initData = { ...route?.params?.initParams, customerInfo: custInfo };

                    navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                        ...route.params,
                        initParams: initData,
                        from: "incomeDecline",
                    });
                    // showErrorToast({
                    //     message: response?.data?.message,
                    // });
                }
            })
            .catch((error) => {
                console.log("[PLSTPIncomeDetails][onDoneTap] >> Catch", error);
                if (error?.error?.code === 603) {
                    const custInfo = {
                        shortRefNo: error?.error?.transactionRefNumber,
                        dateTime: error?.error?.serverDate,
                    };
                    const initData = { ...route?.params?.initParams, customerInfo: custInfo };

                    navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                        ...route.params,
                        initParams: initData,
                        from: "incomeDecline",
                    });
                } else {
                    showErrorToast({
                        message: error?.message,
                    });
                }
            });
    };

    const onBackTap = () => {
        console.log("[PLSTPIncomeDetails] >> [onBackTap]");

        navigation.goBack();
    };

    const onCloseTap = () => {
        console.log("[PLSTPIncomeDetails] >> [onCloseTap]");
        navigation.navigate(route?.params?.entryStack || "More", {
            screen: route?.params?.entryScreen || "Apply",
            params: route?.params?.entryParams,
        });
    };

    return (
        <React.Fragment>
            {showScreen && (
                <ScreenContainer
                    backgroundType="color"
                    showLoaderModal={loading}
                    analyticScreenName="Apply_PersonalLoan_1"
                >
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text={STEP_1}
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
                                {/* Loan details desc */}
                                <Typo
                                    fontSize={20}
                                    lineHeight={28}
                                    fontWeight="300"
                                    textAlign="left"
                                    text={desc}
                                    style={Style.headerLabelCls}
                                />
                                <Typo
                                    fontSize={12}
                                    lineHeight={18}
                                    fontWeight="400"
                                    textAlign="left"
                                    color={FADE_GREY}
                                    text={INCOME_NOTE}
                                    style={Style.headerLabelCls}
                                />
                                {/* Monthly Gross Income */}
                                <View style={Style.fieldViewCls}>
                                    <View style={Style.leftItemCls}>
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            textAlign="left"
                                            text={MONTHLY_GROSS_INC}
                                        />
                                        <TouchableOpacity
                                            onPress={toggleBtnPress}
                                            style={Style.rightTouch}
                                        >
                                            <Image
                                                source={Assets.passwordInfo}
                                                style={Style.imageTT}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <TextInput
                                        maxLength={7}
                                        isValidate
                                        isValid={state.monthlyGrossIncValid}
                                        errorMessage={state.monthlyGrossIncErrorMsg}
                                        keyboardType={"number-pad"}
                                        value={state.monthlyGrossInc}
                                        placeholder={AMOUNT_PLACEHOLDER}
                                        onChangeText={onMonthlyGrossIncChange}
                                        prefix={CURRENCY_CODE}
                                    />
                                </View>
                            </ScrollView>

                            {/* Bottom docked button container */}
                            <FixedActionContainer>
                                <View style={Style.bottomBtnContCls}>
                                    <ActionButton
                                        activeOpacity={state.isContinueDisabled ? 1 : 0.5}
                                        backgroundColor={
                                            state.isContinueDisabled ? DISABLED : YELLOW
                                        }
                                        fullWidth
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                lineHeight={18}
                                                fontWeight="600"
                                                text={PLSTP_AGREE}
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
                        title={MONTHLY_GROSS_INC}
                        description={INCOME_TT}
                        onClose={toggleBtnPress}
                    />
                </ScreenContainer>
            )}
        </React.Fragment>
    );
}

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    fieldViewCls: {
        marginTop: 25,
    },

    headerLabelCls: {
        marginTop: 15,
    },

    imageTT: {
        height: 15,
        marginLeft: 15,
        marginTop: 3,
        width: 15,
    },

    leftItemCls: {
        alignItems: "flex-start",
        flexDirection: "row",
        overflow: "visible",
    },

    rightTouch: { width: "10%" },

    scrollViewCls: {
        paddingHorizontal: 36,
    },
});

export default PLSTPIncomeDetails;
