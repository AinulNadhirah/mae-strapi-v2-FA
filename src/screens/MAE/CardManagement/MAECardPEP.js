import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";

import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import Typo from "@components/Text";
import ActionButton from "@components/Buttons/ActionButton";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import { ScrollPickerView } from "@components/Common";

import { YELLOW, MEDIUM_GREY, BLACK, RED_ERROR, DISABLED } from "@constants/colors";
import { MAE_REQUESTCARD, DONE, PLEASE_SELECT, COMMON_ERROR_MSG } from "@constants/strings";
import { MAE_CARD_HIGH_RISK, MAE_CARD_ADDRESS } from "@navigation/navigationConstant";
import { scoreParty } from "@services";
import { showErrorToast } from "@components/Toast";

function MAECardPEP({ route, navigation }) {
    // Others
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    // Politically Exposed Field Related
    const [pep, setPep] = useState("No");
    const [pepValid, setPepValid] = useState(true);

    // Source of Fund Field related
    const [sourceOfFund, setSourceOfFund] = useState(PLEASE_SELECT);
    const [sourceOfFundValue, setSourceOfFundValue] = useState(null);
    const [sourceOfFundValid, setSourceOfFundValid] = useState(true);
    const [sourceOfFundErrorMsg, setSourceOfFundErrorMsg] = useState("");
    const [sourceOfFundData, setSourceOfFundData] = useState(null);
    // const [sourceOfFundKeyVal, setSourceOfFundKeyVal] = useState(null);
    const [showSourceOfFundPicker, setShowSourceOfFundPicker] = useState(false);

    useEffect(() => {
        init();
    }, []);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        setIsContinueDisabled(!pep || !sourceOfFundValue);
    }, [pep, sourceOfFundValue]);

    const init = () => {
        console.log("[MAECardPEP] >> [init]");

        const params = route?.params ?? {};
        const sourceOfFundCountry = params?.masterData?.sourceOfFundCountry ?? null;

        setSourceOfFundData(sourceOfFundCountry);
    };

    const onYesRadioTap = () => {
        console.log("[MAECardPEP] >> [onYesRadioTap]");

        setPep("Yes");
    };

    const onNoRadioTap = () => {
        console.log("[MAECardPEP] >> [onNoRadioTap]");

        setPep("No");
    };

    const onSourceOfFundFieldTap = () => {
        console.log("[MAECardPEP] >> [onSourceOfFundFieldTap]");

        if (sourceOfFundData) setShowSourceOfFundPicker(true);
    };

    const onPickerCancel = () => {
        console.log("[MAECardPEP] >> [onPickerCancel]");

        setShowSourceOfFundPicker(false);
    };

    const onPickerDone = (item) => {
        console.log("[MAECardPEP] >> [onPickerDone]");

        // Update selection values
        setSourceOfFund(item?.name ?? PLEASE_SELECT);
        setSourceOfFundValue(item?.value ?? null);

        // Close picker
        onPickerCancel();
    };

    const onDoneTap = () => {
        console.log("[MAECardPEP] >> [onDoneTap]");

        // Return if button is disabled
        if (isContinueDisabled) return;

        // Check for mandatory values
        if (!pep || !sourceOfFundValue) return;

        // Call API to evaluate risk of user
        scorePartyAPICall();
    };

    const scorePartyAPICall = () => {
        console.log("[MAECardPEP] >> [scorePartyAPICall]");

        // Request object
        const params = {
            pepDeclaration: pep,
            sourceOfFundCountry: sourceOfFundValue,
            empType: route.params?.empType,
            employerName: route.params?.employerName,
            monthlyIncome: route.params?.monthlyIncome,
            occupation: route.params?.occupation,
            occupationSector: route.params?.occupationSector,
        };

        const navParams = {
            ...route.params,
            ...params,
        };

        // Score Party API Call
        scoreParty(params, true)
            .then((httpResp) => {
                console.log("[MAECardPEP][scorePartyAPICall] >> Response: ", httpResp);

                const result = httpResp?.data?.result ?? {};
                const statusCode = result?.statusCode ?? null;
                const statusDesc = result?.statusDesc ?? null;
                const customerRiskRating = result?.customerRiskRating ?? null;

                if (statusCode === "000") {
                    if (customerRiskRating === "HR") {
                        // Navigate to High Risk screen
                        navigation.navigate(MAE_CARD_HIGH_RISK, navParams);
                    } else {
                        // Navigate to address screen
                        navigation.navigate(MAE_CARD_ADDRESS, navParams);
                    }
                } else {
                    // Show error message
                    showErrorToast({
                        message: statusDesc || COMMON_ERROR_MSG,
                    });
                }
            })
            .catch((error) => {
                console.log("[MAECardPEP][scorePartyAPICall] >> Exception: ", error);

                // Show error message
                showErrorToast({
                    message: error?.message ?? COMMON_ERROR_MSG,
                });
            });
    };

    const onBackTap = () => {
        console.log("[MAECardPEP] >> [onBackTap]");

        navigation.goBack();
    };

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={MAE_REQUESTCARD}
                                />
                            }
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
                            {/* Before we start... */}
                            <Typo
                                fontSize={20}
                                lineHeight={28}
                                fontWeight="300"
                                textAlign="left"
                                text="Before we start, please share the details below."
                                style={Style.headerLabelCls}
                            />

                            {/* Politically Exposed */}
                            <View style={Style.fieldViewCls}>
                                <Typo
                                    fontSize={14}
                                    lineHeight={19}
                                    textAlign="left"
                                    text="Are you a politically exposed person?"
                                />
                                <View style={Style.radioBtnOuterViewCls}>
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        onPress={onYesRadioTap}
                                        style={Style.radioBtnViewCls}
                                    >
                                        {pep === "Yes" ? (
                                            <RadioChecked
                                                label="Yes"
                                                paramLabelCls={Style.radioBtnLabelCls}
                                                checkType="color"
                                            />
                                        ) : (
                                            <RadioUnchecked
                                                label="Yes"
                                                paramLabelCls={Style.radioBtnLabelCls}
                                            />
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        activeOpacity={1}
                                        onPress={onNoRadioTap}
                                        style={Style.radioBtnViewCls}
                                    >
                                        {pep === "No" ? (
                                            <RadioChecked
                                                label="No"
                                                paramLabelCls={Style.radioBtnLabelCls}
                                                checkType="color"
                                            />
                                        ) : (
                                            <RadioUnchecked
                                                label="No"
                                                paramLabelCls={Style.radioBtnLabelCls}
                                            />
                                        )}
                                    </TouchableOpacity>

                                    {!pepValid && (
                                        <Typo
                                            style={Style.errorMessage}
                                            textAlign="left"
                                            text="Please select a value."
                                        />
                                    )}
                                </View>
                            </View>

                            {/* Source of Fund */}
                            <LabeledDropdown
                                label="Source of Fund Country"
                                dropdownValue={sourceOfFund}
                                isValid={sourceOfFundValid}
                                errorMessage={sourceOfFundErrorMsg}
                                onPress={onSourceOfFundFieldTap}
                                style={Style.fieldViewCls}
                            />
                        </ScrollView>

                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={isContinueDisabled ? 1 : 0.5}
                                    backgroundColor={isContinueDisabled ? DISABLED : YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={DONE}
                                        />
                                    }
                                    onPress={onDoneTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>

            {/* Picker */}
            {sourceOfFundData && (
                <ScrollPickerView
                    showMenu={showSourceOfFundPicker}
                    list={sourceOfFundData}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText="Done"
                    leftButtonText="Cancel"
                />
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

    errorMessage: {
        color: RED_ERROR,
        fontSize: 12,
        lineHeight: 16,
        paddingVertical: 15,
    },

    fieldViewCls: {
        marginTop: 25,
    },

    headerLabelCls: {
        marginTop: 15,
    },

    radioBtnLabelCls: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "600",
        letterSpacing: 0,
        lineHeight: 18,
        paddingLeft: 10,
    },

    radioBtnOuterViewCls: {
        flexDirection: "row",
        marginTop: 15,
    },

    radioBtnViewCls: {
        justifyContent: "center",
        width: 100,
    },

    scrollViewCls: {
        paddingHorizontal: 36,
    },
});

export default MAECardPEP;
