import PropTypes from "prop-types";
import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Image, Platform, Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ColorRadioButton from "@components/Buttons/ColorRadioButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";

import { GUARANTOR_FATCA_DECLARATION_IS_US_PERSON } from "@redux/actions/ASBFinance/guarantorFatcaDeclarationAction";
import { asbUpdateCEP } from "@redux/services/ASBServices/asbApiUpdateCEP";

import { MEDIUM_GREY, YELLOW, BLACK, DISABLED } from "@constants/colors";
import {
    FATCA_DECLARATION,
    AGREE_AND_PROCEED,
    FATCA_POPUP_DESC,
    LEAVE_TITLE,
    LEAVE_DES,
    GUARANTOR_ARE_YOU_US_PERSON,
    NO,
    YES,
    LEAVE,
    CANCEL,
} from "@constants/strings";

import Assets from "@assets";

function GuarantorFatcaDeclaration({ navigation }) {
    // Hooks to access reducer data
    const asbGuarantorPrePostQualReducer = useSelector(
        (state) => state.asbServicesReducer.asbGuarantorPrePostQualReducer
    );
    const guarantorFatcaDeclarationReducer = useSelector(
        (state) => state.asbFinanceReducer.guarantorFatcaDeclarationReducer
    );

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();
    const { isUSPerson, isFatcaDeclarationButtonEnabled } = guarantorFatcaDeclarationReducer;

    const [showPopup, setShowPopup] = useState(false);
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);

    const guarantorStpReferenceNumber = asbGuarantorPrePostQualReducer?.stpreferenceNo;

    function handleBack() {
        navigation.goBack();
    }

    function handleClose() {
        setShowPopupConfirm(true);
    }

    function handleProceedButton() {
        updateApiCEP(() => {});
    }

    const handleLeaveBtn = async () => {
        setShowPopupConfirm(false);
        updateApiCEP(() => {});
    };

    function updateApiCEP(callback) {
        const body = {
            screenNo: "7",
            stpReferenceNo: guarantorStpReferenceNumber,
            USAPerson: isUSPerson ? "Y" : "N",
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

    function onPinInfoPress() {
        setShowPopup(true);
    }
    function onPopupClose() {
        setShowPopup(false);
    }
    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }

    function onRadioBtnUSPTap(value) {
        dispatch({ type: GUARANTOR_FATCA_DECLARATION_IS_US_PERSON, isUSPerson: value });
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <React.Fragment>
                <ScreenLayout
                    paddingBottom={36}
                    paddingTop={16}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
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
                            <View style={styles.mainSection}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={28}
                                    text={FATCA_DECLARATION}
                                    textAlign="left"
                                />
                                <View style={styles.fieldViewCls}>
                                    <View style={styles.infoLabelContainerCls}>
                                        <Text>
                                            <Typo
                                                fontSize={14}
                                                lineHeight={20}
                                                textAlign="left"
                                                text={GUARANTOR_ARE_YOU_US_PERSON}
                                            />
                                            <TouchableOpacity onPress={onPinInfoPress}>
                                                <Image
                                                    style={styles.infoIcon}
                                                    source={Assets.icInformation}
                                                />
                                            </TouchableOpacity>
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.groupContainer}>
                                    <View>
                                        <ColorRadioButton
                                            title={YES}
                                            isSelected={isUSPerson}
                                            fontSize={14}
                                            fontWeight={"400"}
                                            onRadioButtonPressed={onRadioBtnUSPTap(true)}
                                        />
                                    </View>
                                    <View style={styles.noRadioBtn}>
                                        <ColorRadioButton
                                            title={NO}
                                            isSelected={isUSPerson}
                                            fontSize={14}
                                            fontWeight={"400"}
                                            onRadioButtonPressed={onRadioBtnUSPTap(false)}
                                        />
                                    </View>
                                </View>
                            </View>
                        </KeyboardAwareScrollView>
                        <FixedActionContainer>
                            <View style={styles.footer}>
                                <ActionButton
                                    activeOpacity={isFatcaDeclarationButtonEnabled ? 1 : 0.5}
                                    backgroundColor={
                                        isFatcaDeclarationButtonEnabled ? YELLOW : DISABLED
                                    }
                                    fullWidth
                                    borderRadius={25}
                                    onPress={handleProceedButton}
                                    componentCenter={
                                        <Typo
                                            text={AGREE_AND_PROCEED}
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            color={BLACK}
                                        />
                                    }
                                />
                            </View>
                        </FixedActionContainer>
                    </View>
                </ScreenLayout>

                <Popup
                    visible={showPopup}
                    onClose={onPopupClose}
                    title={FATCA_DECLARATION}
                    description={FATCA_POPUP_DESC}
                />

                <Popup
                    visible={showPopupConfirm}
                    onClose={onPopupCloseConfirm}
                    title={LEAVE_TITLE}
                    description={LEAVE_DES}
                    primaryAction={{
                        text: LEAVE,
                        onPress: { handleLeaveBtn },
                    }}
                    secondaryAction={{
                        text: CANCEL,
                        onPress: { onPopupCloseConfirm },
                    }}
                />
            </React.Fragment>
        </ScreenContainer>
    );
}

GuarantorFatcaDeclaration.propTypes = {
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
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
        marginBottom: 15,
        marginTop: 25,
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    groupContainer: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "flex-start",
        marginLeft: 0,
        width: "100%",
    },
    infoIcon: {
        height: 16,
        left: 5,
        top: 3,
        width: 16,
    },
    infoLabelContainerCls: {
        alignItems: "center",
        flexDirection: "row",
    },
    mainSection: {
        marginBottom: 40,
    },
    noRadioBtn: {
        marginLeft: 20,
        width: "60%",
    },
});

export default GuarantorFatcaDeclaration;
