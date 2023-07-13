import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector, useDispatch } from "react-redux";

import { removeCommas } from "@screens/PLSTP/PLSTPController";

import {
    CURRENT_LOCATION,
    APPLY_LOANS,
    FATCADECLARATION,
    SELECTACCOUNT,
    ELIGIBILITY_SOFT_FAIL,
    APPLICATION_FINANCE_DETAILS,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { updateApiCEP, asbCheckEligibilityService } from "@services";
import { logEvent } from "@services/analytics";

import { ELIGIBILITY_SUCCESS } from "@redux/actions/ASBFinance/eligibilityCheckAction";

import { MEDIUM_GREY, YELLOW, BLACK, ROYAL_BLUE, DISABLED } from "@constants/colors";
import {
    ASB_FINANCING,
    STAFF_ID,
    DO_YOU_CURRENTLY_HAVE_BANK,
    IF_YOU_DO,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    SAVE_NEXT,
    COMMON_ERROR_MSG,
    YOUR_INFORMATION_WAS_UPDATED,
    YOUR_INFORMATION_WAS_UPDATED_DESC,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    LEAVE,
    CANCEL,
    OKAY,
    PLEASE_REMOVE_INVALID_SPECIAL_CHARACTERS,
    PLEASE_ENTER_STAFF_ID,
    LEAVE_APPLICATION_GA,
} from "@constants/strings";

import { maeOnlyNumberRegex } from "@utils/dataModel";

function BankOfficer({ route, navigation }) {
    const dispatch = useDispatch();
    const [loanInformation, setLoanInformation] = useState([]);
    const [grassIncome, setGrassIncome] = useState([]);
    const [totalMonthNonBank, setTotalMonthNonBank] = useState([]);
    const [staffId, setStaffId] = useState("");
    const [staffIdErrorMsg, setStaffIdErrorMsg] = useState("");
    const [staffIdValid, setStaffIdValid] = useState(true);
    const resumeReducer = useSelector((state) => state.resumeReducer);
    const resumeStpDetails = resumeReducer?.stpDetails;
    const reload = route?.params?.reload;

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Apply_ASBFinancing_StaffID",
        });
        init();
    }, []);

    useEffect(() => {
        if (reload || resumeStpDetails) {
            setStaffId(resumeStpDetails?.stpStaffId);
        }
    }, [reload, resumeStpDetails]);

    const init = async () => {
        const { loanInformation, grassIncome, totalMonthNonBank } = route.params;
        setLoanInformation(loanInformation);
        setGrassIncome(grassIncome);
        setTotalMonthNonBank(totalMonthNonBank);
    };

    function onStaffIdChange(value) {
        const min = 8;
        const result = value.toString().length;
        let err = "";
        let isValid = false;
        const commErr1 = PLEASE_REMOVE_INVALID_SPECIAL_CHARACTERS;
        if (result > 0) {
            if (result < min) {
                err = PLEASE_ENTER_STAFF_ID;
                isValid = false;
            } else if (!maeOnlyNumberRegex(removeCommas(value.trim()))) {
                err = commErr1;
                isValid = false;
            } else {
                err = "";
                isValid = true;
            }
        } else {
            err = "";
            isValid = true;
        }
        setStaffId(value);
        setStaffIdErrorMsg(err);
        setStaffIdValid(isValid);
    }
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);
    const [showPopupPNBFailed, setShowPopupPNBFailed] = useState(false);
    const prequalReducer = useSelector((state) => state.asbServicesReducer.prePostQualReducer);

    const stpReferenceNumber =
        prequalReducer?.data?.stpreferenceNo ?? resumeReducer?.stpDetails?.stpReferenceNo;

    const grossIncome = resumeReducer?.stpDetails?.stpGrossIncome ?? grassIncome;

    const totalMonthlyNonBank = resumeReducer?.stpDetails?.stpOtherCommitments ?? totalMonthNonBank;

    function handleClose() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: LEAVE_APPLICATION_GA,
        });
        setShowPopupConfirm(true);
    }
    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }
    function handlePNBFail() {
        setShowPopupPNBFailed(true);
    }
    function handlePNBFailClose() {
        setShowPopupPNBFailed(false);
    }
    function handlePNBFailNavigation() {
        setShowPopupPNBFailed(false);
        navigation.navigate(APPLICATION_FINANCE_DETAILS);
    }
    async function handleContinueBtn() {
        const response = await saveUpdateData(true);
        if (response !== "0000") {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
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

    const saveUpdateData = async (checkEligibility) => {
        try {
            // Return is form validation fails
            if (staffIdValid) {
                const body = {
                    screenNo: "4",
                    stpReferenceNo: stpReferenceNumber,
                    staffIdNo: staffId,
                };
                dispatch({
                    screenNo: "4",
                    type: "RESUME_UPDATE",
                    stpStaffId: staffId,
                });

                const response = await updateApiCEP(body, false);
                const result = response?.data?.result.msgHeader;
                if (result.responseCode === "0000") {
                    if (checkEligibility) {
                        await checkEligibilityApi();
                    }
                    return result.responseCode;
                }
            }
        } catch (error) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    };

    const checkEligibilityApi = async () => {
        try {
            const body = {
                stpReferenceNo: stpReferenceNumber,
                screenNo: "4",
                staffIdNo: staffId,
            };
            const response = await asbCheckEligibilityService(body);
            if (response) {
                const result = response?.data?.result;
                const checkEligibilityResponse = result?.wolocResponse?.msgBody;

                const pnbResponseStatus =
                    response?.data?.result?.pnbResponse?.overallStatus?.status;

                if (response.data.message === "Success") {
                    if (pnbResponseStatus !== "SUCCESS") {
                        handlePNBFail();
                    } else {
                        const overallValidationResult =
                            result?.wolocResponse?.msgBody?.overallValidationResult;
                        const dataType =
                            result?.wolocResponse?.msgBody?.eligibilityCheckOutcome[0]?.dataType;
                        dispatch({
                            type: ELIGIBILITY_SUCCESS,
                            data: checkEligibilityResponse,
                            loanInformation,
                            grassIncome: grossIncome,
                            totalMonthNonBank: totalMonthlyNonBank,
                        });
                        if (overallValidationResult === "AMBER") {
                            navigation.navigate(FATCADECLARATION, {
                                checkEligibilityResponse,
                                selectedAccountNo: "",
                            });
                        }
                        if (overallValidationResult === "GREEN") {
                            if (dataType === "Eligible") {
                                navigation.navigate(SELECTACCOUNT, {
                                    data: checkEligibilityResponse,
                                    loanInformation,
                                    grassIncome: grossIncome,
                                    totalMonthNonBank: totalMonthlyNonBank,
                                });
                            } else {
                                navigation.navigate(ELIGIBILITY_SOFT_FAIL, {
                                    data: checkEligibilityResponse,
                                    loanInformation,
                                    grassIncome: grossIncome,
                                    totalMonthNonBank: totalMonthlyNonBank,
                                });
                            }
                        }
                    }
                } else if (response.data.message === "Unsuccessful") {
                    showInfoToast({
                        message: response?.data?.result?.statusDesc,
                    });
                }
            }
        } catch {
            console.log("[BankOfficer][checkEligibility] >> error");
        }
    };

    function handleBack() {
        navigation.navigate(CURRENT_LOCATION, { reload: true });
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={36}
                    paddingTop={16}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                            headerCenterElement={
                                <Typo
                                    text="Step 4 of 5"
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
                    <View style={styles.container}>
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
                                text={ASB_FINANCING}
                                textAlign="left"
                            />

                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={28}
                                text={DO_YOU_CURRENTLY_HAVE_BANK}
                                textAlign="left"
                            />

                            <View style={styles.fieldViewCls}>
                                <Typo
                                    fontSize={14}
                                    lineHeight={18}
                                    textAlign="left"
                                    text={IF_YOU_DO}
                                />
                                <TextInput
                                    maxLength={8}
                                    keyboardType="number-pad"
                                    isValid={staffIdValid}
                                    errorMessage={staffIdErrorMsg}
                                    isValidate={staffIdErrorMsg ? true : false}
                                    value={staffId}
                                    placeholder={STAFF_ID}
                                    onChangeText={onStaffIdChange}
                                />
                            </View>

                            <View style={styles.mainContent}>
                                <View style={styles.footer}>
                                    <ActionButton
                                        fullWidth
                                        disabled={staffIdErrorMsg ? true : false}
                                        borderRadius={25}
                                        onPress={handleContinueBtn}
                                        backgroundColor={staffIdErrorMsg ? DISABLED : YELLOW}
                                        componentCenter={
                                            <Typo
                                                text={SAVE_NEXT}
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                color={BLACK}
                                            />
                                        }
                                    />
                                </View>
                                <View style={styles.bottomBtnContCls}>
                                    <ActionButton
                                        fullWidth
                                        borderRadius={25}
                                        onPress={handleContinueBtn}
                                        backgroundColor={MEDIUM_GREY}
                                        componentCenter={
                                            <Typo
                                                text="Skip"
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                color={ROYAL_BLUE}
                                            />
                                        }
                                    />
                                </View>
                            </View>
                        </KeyboardAwareScrollView>
                    </View>
                </ScreenLayout>
                <Popup
                    visible={showPopupConfirm}
                    onClose={onPopupCloseConfirm}
                    title={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE}
                    description={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC}
                    primaryAction={{
                        text: LEAVE,
                        onPress: handleLeaveBtn,
                    }}
                    secondaryAction={{
                        text: CANCEL,
                        onPress: onPopupCloseConfirm,
                    }}
                />
                <Popup
                    visible={showPopupPNBFailed}
                    onClose={handlePNBFailClose}
                    title={YOUR_INFORMATION_WAS_UPDATED}
                    description={YOUR_INFORMATION_WAS_UPDATED_DESC}
                    primaryAction={{
                        text: OKAY,
                        onPress: handlePNBFailNavigation,
                    }}
                />
            </>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
    containerView: {
        flex: 1,
        paddingHorizontal: 25,
        width: "100%",
    },
    fieldViewCls: {
        marginTop: 25,
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    mainContent: {
        backgroundColor: MEDIUM_GREY,
        marginTop: 240,
    },
});

BankOfficer.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default BankOfficer;
