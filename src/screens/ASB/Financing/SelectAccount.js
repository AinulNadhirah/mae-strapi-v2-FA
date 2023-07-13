import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Platform, Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector } from "react-redux";

import {
    APPLY_LOANS,
    FATCADECLARATION,
    BANK_OFFICER,
    ELIGIBILITY_SOFT_FAIL,
    SELECTACCOUNT,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ColorRadioButton from "@components/Buttons/ColorRadioButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Dropdown from "@components/FormComponents/Dropdown";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { getProductDesc, updateApiCEP } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, YELLOW, BLACK, DISABLED } from "@constants/colors";
import {
    DONE,
    CANCEL,
    ASB_FINANCING,
    PLEASE_SELECT,
    SELECT_YOUR_ACC,
    AUTOMATE_YOUR_MONTLY_PAYMENT,
    FROM_ACCOUNT,
    SET_STANDING_INS,
    SET_STANDING_INS_WAY,
    STANDING_INS,
    PAYMENT_AUTOMATION,
    PLSTP_SAVE_NEXT,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    COMMON_ERROR_MSG,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    LEAVE,
    LEAVE_APPLICATION_GA,
} from "@constants/strings";

function SelectAccount({ route, navigation }) {
    const [selectedAccountNo, setSelectAccountNo] = useState("");
    const [selectedProductDesc, setSelectProductDesc] = useState("");
    const [selectedProdDesc, setSelectProdDesc] = useState("");
    const [selectedaccountType, setSelectaccountType] = useState("");

    const [showStatePicker, setShowStatePicker] = useState(false);
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);
    const [isAgree, setAgree] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const prequalReducer = useSelector((state) => state.asbServicesReducer.prePostQualReducer);
    const resumeReducer = useSelector((state) => state.resumeReducer);
    const [isAccountList, setAccountList] = useState(false);

    const stpReferenceNumber =
        prequalReducer?.data?.stpreferenceNo ?? resumeReducer?.stpDetails?.stpReferenceNo;

    useEffect(() => {
        init();
    }, []);

    async function init() {
        const accountData = [];
        const CASAAccountData = resumeReducer?.stpDetails?.stpAccountProfile
            ? JSON.parse(resumeReducer?.stpDetails?.stpAccountProfile)
            : prequalReducer?.data?.esbResponse?.casaResponse?.AccountProfile;

        if (CASAAccountData) {
            CASAAccountData.map((data) => {
                const accNo = data.AcctNumber.split("0000");

                data.name = data.ProductName + " " + accNo[1];
                data.value = data.ProductName;
                data.acctNumber = accNo[1];
                data.productName = data.ProductName;
                accountData.push(data);
            });

            try {
                // Return is form validation fails
                if (accountData) {
                    const body = { productDetails: accountData };

                    const response = await getProductDesc(body, false);

                    const result = response?.data?.result?.productDetails;
                    if (result) {
                        const accountDataList = [];
                        result.map((data) => {
                            data.name = data.productDescription + " " + data.acctNumber;
                            data.value = data.productName;
                            data.no = data.acctNumber;
                            accountDataList.push(data);
                            setAccountList(accountDataList);
                            resumeData(accountDataList);
                        });
                    }
                }
            } catch (error) {
                showErrorToast({
                    message: COMMON_ERROR_MSG,
                });
            }
        }
    }

    function resumeData(result) {
        result &&
            result.map((data) => {
                if (data.no === resumeReducer?.stpDetails?.stpAccountNumber) {
                    setSelectAccountNo(data.no);
                    setSelectProductDesc(data.productDescription);
                    setSelectProdDesc(data.value);
                    setSelectaccountType(data.accountType);
                    setAgree(true);
                }
            });
    }

    function onDropdownPress() {
        setShowStatePicker(true);
    }

    function onPickerDone(item) {
        setSelectAccountNo(item.no);
        setSelectProductDesc(item.productDescription);
        setSelectProdDesc(item.value);
        setSelectaccountType(item.accountType);
        onPickerCancel();
    }

    function onPickerCancel() {
        setShowStatePicker(false);
    }

    function handleToggle() {
        setAgree(!isAgree);
    }

    function onPinInfoPress() {
        setShowPopup(true);
    }
    function onPopupClose() {
        setShowPopup(false);
    }
    function handleClose() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: LEAVE_APPLICATION_GA,
        });
        setShowPopupConfirm(true);
    }

    function handleBack() {
        navigation.navigate(
            route?.params?.comingFrom === ELIGIBILITY_SOFT_FAIL
                ? ELIGIBILITY_SOFT_FAIL
                : BANK_OFFICER
        );
    }

    async function handleContinueBtn() {
        const body = {
            screenNo: "6",
            stpReferenceNo: stpReferenceNumber,
            acctNumber: selectedAccountNo,
            productName: selectedProdDesc,
            acctType: selectedaccountType,
        };

        const response = await updateApiCEP(body, false);
        const result = response?.data?.result?.msgHeader;

        if (result.responseCode === "0000") {
            navigation.navigate(FATCADECLARATION, { comingFrom: SELECTACCOUNT });
        } else {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    }

    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }

    async function handleLeaveBtn() {
        setShowPopupConfirm(false);

        const response = await saveUpdateData(false);
        if (response === "0000") {
            navigation.navigate(APPLY_LOANS);
        } else {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    }

    const saveUpdateData = async () => {
        try {
            const body = {
                screenNo: "6",
                stpReferenceNo: stpReferenceNumber,
                acctNumber: selectedAccountNo,
                productName: selectedProdDesc,
                acctType: selectedaccountType,
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

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName="Apply_ASBFinancing_AutomatePayment"
        >
            <ScreenLayout
                paddingBottom={36}
                paddingTop={16}
                paddingHorizontal={0}
                header={
                    <HeaderLayout
                        headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                        headerCenterElement={
                            <Typo
                                text="Step 5 of 5"
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
                            text={SELECT_YOUR_ACC}
                            textAlign="left"
                        />

                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                            text={AUTOMATE_YOUR_MONTLY_PAYMENT}
                            textAlign="left"
                            style={styles.subTitle}
                        />

                        <View style={styles.fieldViewCls}>
                            <Typo
                                fontSize={14}
                                lineHeight={18}
                                textAlign="left"
                                text={FROM_ACCOUNT}
                                style={styles.label}
                            />
                            <Dropdown
                                value={
                                    selectedProductDesc
                                        ? selectedProductDesc + " " + selectedAccountNo
                                        : PLEASE_SELECT
                                }
                                onPress={onDropdownPress}
                            />
                        </View>
                        <View style={styles.agreeSection}>
                            <View>
                                <ColorRadioButton
                                    isSelected={isAgree}
                                    fontSize={14}
                                    onRadioButtonPressed={handleToggle}
                                    fontWeight="400"
                                />
                            </View>
                            <View style={styles.agree}>
                                <Text onPress={handleToggle}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        lineHeight={18}
                                        text="As per "
                                        textAlign="left"
                                    />
                                    <Text onPress={onPinInfoPress} style={styles.underline}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="700"
                                            lineHeight={18}
                                            text={STANDING_INS}
                                            textAlign="left"
                                        />
                                    </Text>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        lineHeight={18}
                                        text={PAYMENT_AUTOMATION}
                                        textAlign="left"
                                    />
                                </Text>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                    <ScrollPickerView
                        showMenu={showStatePicker}
                        list={isAccountList}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                    <Popup
                        visible={showPopup}
                        onClose={onPopupClose}
                        title={SET_STANDING_INS}
                        description={SET_STANDING_INS_WAY}
                    />
                </View>
                <FixedActionContainer>
                    <View style={styles.footer}>
                        <ActionButton
                            fullWidth
                            disabled={selectedProductDesc && isAgree ? false : true}
                            borderRadius={25}
                            onPress={handleContinueBtn}
                            backgroundColor={selectedProductDesc && isAgree ? YELLOW : DISABLED}
                            componentCenter={
                                <Typo
                                    text={PLSTP_SAVE_NEXT}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    color={BLACK}
                                />
                            }
                        />
                    </View>
                </FixedActionContainer>
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
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    agree: {
        flexDirection: "row",
        flex: 1,
        paddingTop: 10,
    },
    agreeSection: {
        flexDirection: "row",
        flex: 1,
        paddingTop: 30,
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
    label: {
        paddingBottom: 10,
    },

    subTitle: {
        paddingTop: 40,
    },
    underline: {
        textDecorationLine: "underline",
    },
});

SelectAccount.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default SelectAccount;
