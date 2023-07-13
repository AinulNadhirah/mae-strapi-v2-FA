import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from "react-native";

import { PLSTP_LOAN_APPLICATION } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { saveCRAData } from "@services";
import { logEvent } from "@services/analytics";

import { YELLOW, BLACK, DISABLED } from "@constants/colors";
import {
    STEP_2,
    CREDIT_REF_TITLE,
    CREDIT_REF_DESC,
    CREDIT_TNC,
    STP_TNC,
    PROCEED,
    FA_FORM_PROCEED,
    FA_SCREEN_NAME,
} from "@constants/strings";

import Assets from "@assets";

function PLSTPCreditCheck({ navigation, route }) {
    const [radioTNCChecked, setRadioTNCChecked] = useState(false);
    const [doneBtn, setDoneBtn] = useState(false);
    const { initParams } = route?.params;
    const { customerInfo, stpRefNum, isSAL } = initParams;

    useEffect(() => {
        init();
    }, [route?.params]);

    const init = () => {
        console.log("[PLSTPCreditCheck] >> [init]");
        if (customerInfo?.cra) {
            setRadioTNCChecked(customerInfo?.cra);
        }
    };
    function onRadioBtnTNCTap() {
        setRadioTNCChecked(!radioTNCChecked);
        setDoneBtn(!radioTNCChecked);
    }

    function onDoneTap() {
        navToNextScreen(true);
    }

    async function navToNextScreen(cra) {
        if (cra && !radioTNCChecked) return;
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Apply_PersonalLoan_2",
        });

        const data = {
            stpRefNo: stpRefNum,
            cra: cra,
        };
        const result = await saveData(data);
        if (result?.data?.code === 200) {
            const custInfo = {
                ...customerInfo,
                cra: cra,
            };
            const initData = { ...initParams, customerInfo: custInfo, isSAL: !isSAL ? !cra : true };
            navigation.navigate(PLSTP_LOAN_APPLICATION, {
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
            const response = await saveCRAData(payload);
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            showErrorToast({ message: error?.message });
            return null;
        }
    }

    const onCloseTap = () => {
        console.log("[PLSTPCreditCheck] >> [onCloseTap]");

        navigation.navigate(route?.params?.entryStack || "More", {
            screen: route?.params?.entryScreen || "Apply",
            params: route?.params?.entryParams,
        });
    };

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName="Apply_PersonalLoan_2">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={STEP_2}
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
                            {/* Credit Title */}
                            <Typo
                                fontSize={14}
                                lineHeight={23}
                                fontWeight="600"
                                textAlign="left"
                                text={CREDIT_REF_TITLE}
                                style={Style.headerLabelCls}
                            />

                            {/* Credit Desc */}
                            <Typo
                                fontSize={20}
                                lineHeight={30}
                                fontWeight="300"
                                textAlign="left"
                                text={CREDIT_REF_DESC}
                                style={Style.headerDescLabelCls}
                            />

                            {/* Credit TNC */}
                            <Typo
                                fontSize={14}
                                lineHeight={18}
                                fontWeight="600"
                                textAlign="left"
                                text={STP_TNC}
                                style={Style.headerTNCLabelCls}
                            />

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
                                        fontSize={14}
                                        lineHeight={20}
                                        fontWeight="400"
                                        textAlign="left"
                                        text={CREDIT_TNC}
                                    />
                                </View>
                            </View>
                        </ScrollView>

                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={0.5}
                                    backgroundColor={doneBtn ? YELLOW : DISABLED}
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
            </ScreenContainer>
        </React.Fragment>
    );
}

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    headerDescLabelCls: {
        marginTop: 10,
    },

    headerLabelCls: {
        marginTop: 15,
    },

    headerTNCLabelCls: {
        marginTop: 20,
    },

    image: {
        borderColor: BLACK,
        borderRadius: 10,
        borderWidth: 1,
        height: 20,
        marginRight: 7,
        width: 20,
    },
    radioCheckContainer: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 10,
    },

    radioContainer: {
        marginTop: 2,
    },

    scrollViewCls: {
        paddingHorizontal: 36,
    },

    textContainer: {
        width: "87%",
    },
});

export default PLSTPCreditCheck;
