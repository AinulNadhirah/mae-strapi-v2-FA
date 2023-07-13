import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Platform, TouchableOpacity, Image } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector, useDispatch } from "react-redux";

import { ASB_GUARANTOR_ADDITIONAL_INCOME } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import {
    GUARANTOR_INCOME_DETAILS_NEXT_BUTTON_ENABLE,
    GUARANTOR_MONTHLY_GROSS_INCOME,
    GUARANTOR_TOTAL_MONTHLY_NON_BANK_COMMITMENTS,
} from "@redux/actions/ASBFinance/guarantorIncomeDetailsAction";
import { asbUpdateCEP } from "@redux/services/ASBServices/asbApiUpdateCEP";

import { MEDIUM_GREY, YELLOW, DISABLED } from "@constants/colors";
import {
    AMOUNT_PLACEHOLDER,
    CURRENCY_CODE,
    MONTHLY_GROSS_INC,
    TOTAL_MONTHLY_NON,
    INCLUDIN_YOU_MONTHLY_COMMITMENTS,
    TOTAL_MONTHLY_NON_TOOLTIP,
    GUARANTOR,
    PLEASE_SHARE_WITH_US_INCOME_COMMITMENT_DETAILS,
    STEP,
    CONTINUE,
} from "@constants/strings";

import Assets from "@assets";

import { goBackHomeScreen, removeCommas } from "../helpers/ASBHelpers";

function GuarantorIncomeDetails({ route, navigation }) {
    const { currentSteps, totalSteps } = route?.params;

    // Hooks to access reducer data
    const asbGuarantorPrePostQualReducer = useSelector(
        (state) => state.asbServicesReducer.asbGuarantorPrePostQualReducer
    );
    console.log("GuarantorIncomeDetails", asbGuarantorPrePostQualReducer);

    const guarantorIncomeDetailsReducer = useSelector(
        (state) => state.asbFinanceReducer.guarantorIncomeDetailsReducer
    );

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    const {
        monthlyGrossInformation,
        totalMonthlyNonBNankingCommitments,
        incomeDetailsNextBottonEnable,
        monthlyloanInformationError,
        totalMonthlyNonBankingCommitmentsError,
    } = guarantorIncomeDetailsReducer;

    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        dispatch({
            type: GUARANTOR_INCOME_DETAILS_NEXT_BUTTON_ENABLE,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [monthlyGrossInformation, totalMonthlyNonBNankingCommitments]);

    const stpReferenceNumber = asbGuarantorPrePostQualReducer?.stpreferenceNo;

    function onGrassIncomeChange(value) {
        dispatch({ type: GUARANTOR_MONTHLY_GROSS_INCOME, monthlyGrossInformation: value });
    }

    function onTotalMonthNonBankChange(value) {
        dispatch({
            type: GUARANTOR_TOTAL_MONTHLY_NON_BANK_COMMITMENTS,
            totalMonthlyNonBNankingCommitments: value,
        });
    }

    function onTotalMonthInfoPress() {
        setShowPopup(true);
    }

    function onPopupClose() {
        setShowPopup(false);
    }

    function handleBack() {
        console.log("[GuarantorIncomeDetails] >> [handleBack]");
        navigation.goBack();
    }

    function handleClose() {
        console.log("[GuarantorIncomeDetails] >> [handleClose]");
        goBackHomeScreen(navigation);
    }

    function handleContinueButton() {
        if (incomeDetailsNextBottonEnable) {
            updateApiCEP(() => {
                navigation.navigate(ASB_GUARANTOR_ADDITIONAL_INCOME);
            });
        }
    }

    function updateApiCEP(callback) {
        const body = {
            screenNo: "3",
            stpReferenceNo: stpReferenceNumber,
            monthlyGrossIncome: removeCommas(monthlyGrossInformation),
            monthlyNonBankCommitments: totalMonthlyNonBNankingCommitments,
        };

        dispatch(
            asbUpdateCEP(body, (data) => {
                if (data) {
                    if (callback) {
                        callback();
                    }
                }
            })
        );
    }

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    paddingBottom={36}
                    paddingTop={16}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                            headerCenterElement={
                                <Typo
                                    text={`${STEP} ${currentSteps} of ${totalSteps}`}
                                    fontWeight="300"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <React.Fragment>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KeyboardAwareScrollView
                                style={styles.containerView}
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                                showsVerticalScrollIndicator={false}
                            >
                                <Typo
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={20}
                                    text={GUARANTOR}
                                    textAlign="left"
                                />

                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={28}
                                    text={PLEASE_SHARE_WITH_US_INCOME_COMMITMENT_DETAILS}
                                    textAlign="left"
                                />

                                {detailsView()}
                            </KeyboardAwareScrollView>
                        </ScrollView>
                        <FixedActionContainer>
                            <View style={styles.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={incomeDetailsNextBottonEnable ? 1 : 0.5}
                                    backgroundColor={
                                        incomeDetailsNextBottonEnable ? YELLOW : DISABLED
                                    }
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={CONTINUE}
                                        />
                                    }
                                    onPress={handleContinueButton}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
                <Popup
                    visible={showPopup}
                    onClose={onPopupClose}
                    title={TOTAL_MONTHLY_NON_TOOLTIP}
                    description={INCLUDIN_YOU_MONTHLY_COMMITMENTS}
                />
            </ScreenContainer>
        </React.Fragment>
    );

    function detailsView() {
        return (
            <React.Fragment>
                <SpaceFiller height={24} />
                <Typo fontSize={14} lineHeight={18} textAlign="left" text={MONTHLY_GROSS_INC} />
                <TextInput
                    maxLength={9}
                    isValidate
                    isValid={monthlyloanInformationError === null ? true : false}
                    errorMessage={monthlyloanInformationError}
                    keyboardType={"number-pad"}
                    value={monthlyGrossInformation}
                    placeholder={AMOUNT_PLACEHOLDER}
                    onChangeText={onGrassIncomeChange}
                    prefix={CURRENCY_CODE}
                />
                <SpaceFiller height={24} />

                <View style={styles.infoLabelContainerCls}>
                    <Typo fontSize={14} lineHeight={18} textAlign="left" text={TOTAL_MONTHLY_NON} />
                    <TouchableOpacity onPress={onTotalMonthInfoPress}>
                        <Image style={styles.infoIcon} source={Assets.icInformation} />
                    </TouchableOpacity>
                </View>

                <TextInput
                    maxLength={10}
                    isValid={totalMonthlyNonBankingCommitmentsError === null ? true : false}
                    errorMessage={totalMonthlyNonBankingCommitmentsError}
                    keyboardType={"number-pad"}
                    value={totalMonthlyNonBNankingCommitments}
                    placeholder={AMOUNT_PLACEHOLDER}
                    onChangeText={onTotalMonthNonBankChange}
                    prefix={CURRENCY_CODE}
                />
            </React.Fragment>
        );
    }
}
GuarantorIncomeDetails.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};
const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    containerView: {
        flex: 1,
        paddingHorizontal: 25,
        width: "100%",
    },

    infoIcon: {
        height: 16,
        marginLeft: 10,
        width: 16,
    },
    infoLabelContainerCls: {
        alignItems: "center",
        flexDirection: "row",
        paddingVertical: 2,
    },
});

export default GuarantorIncomeDetails;
