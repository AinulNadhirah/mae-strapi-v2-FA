import AsyncStorage from "@react-native-community/async-storage";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Image, Platform, Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import {
    APPLY_LOANS,
    ASB_DECLARATION,
    BANK_OFFICER,
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
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { updateApiCEP } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, YELLOW, BLACK, DISABLED } from "@constants/colors";
import {
    COMMON_ERROR_MSG,
    FATCA_DECLARATION,
    AGREE_AND_PROCEED,
    FATCA_POPUP_DESC,
    LEAVE_TITLE,
    LEAVE_DES,
    LEAVE,
    CANCEL,
    DONE,
    ARE_YOU_US_PERSON,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    LEAVE_APPLICATION_GA,
} from "@constants/strings";

import Assets from "@assets";

function FatcaDeclaration({ route, navigation }) {
    const scrollPickerInitialState = {
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    };
    const dispatch = useDispatch();
    const [uspYes, setuspYes] = useState(false);
    const [uspNo, setuspNo] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);
    const [countryScrollPicker, setCountryScrollPicker] = useState(scrollPickerInitialState);
    const prePostQualReducer = useSelector((state) => state.asbServicesReducer.prePostQualReducer);
    // Resume
    const resumeReducer = useSelector((state) => state.resumeReducer);
    const resumeStpDetails = resumeReducer?.stpDetails;
    // End Resume

    const stpReferenceNumber =
        prePostQualReducer?.stpreferenceNo ?? resumeReducer?.stpDetails?.stpReferenceNo;
    const reload = route?.params?.reload;

    useEffect(() => {
        if (reload || resumeStpDetails) {
            if (resumeStpDetails?.stpIsUsaCitizen === "Y") {
                setuspYes(true);
                setuspNo(false);
            } else if (resumeStpDetails?.stpIsUsaCitizen === "N") {
                setuspYes(false);
                setuspNo(true);
            }
        }
    }, [resumeStpDetails, reload]);

    function handleBack() {
        if (resumeStpDetails) {
            navigation.navigate(
                route?.params?.comingFrom === SELECTACCOUNT ? SELECTACCOUNT : BANK_OFFICER,
                { reload: true }
            ); // resume *
        } else {
            navigation.goBack();
        }
    }

    function handleClose() {
        setShowPopupConfirm(true);
    }

    function onCountryScrollPickerDoneButtonDidTap(data, index) {
        setCountryScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onCountryScrollPickerCancelButtonDidTap() {
        setCountryScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    async function handleProceedButton() {
        try {
            if (uspNo || uspYes) {
                const response = await saveUpdateData();
                if (response === "0000") {
                    navigation.navigate(ASB_DECLARATION, {});
                } else {
                    showErrorToast({
                        message: COMMON_ERROR_MSG,
                    });
                }
            }
        } catch (error) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    }

    const handleLeaveBtn = async () => {
        setShowPopupConfirm(false);
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: LEAVE_APPLICATION_GA,
        });
        const response = await saveUpdateData();
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
                screenNo: "7",
                stpReferenceNo: stpReferenceNumber,
                isUSAPerson: uspYes ? "Y" : "N",
            };
            dispatch({
                screenNo: "7",
                type: "RESUME_UPDATE",
                stpIsUsaCitizen: uspYes ? "Y" : "N",
            });
            const response = await updateApiCEP(body, false);
            const result = response?.data?.result.msgHeader;
            if (result.responseCode === "0000") {
                AsyncStorage.setItem("USAPerson", uspYes ? "Y" : "N");
                return result.responseCode;
            }
        } catch (error) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    };
    function onPinInfoPress() {
        setShowPopup(true);
    }
    function onPopupClose() {
        setShowPopup(false);
    }
    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }

    function onRadioBtnUSPTapYes() {
        setuspYes(true);
        setuspNo(false);
    }
    function onRadioBtnUSPTapNo() {
        setuspNo(true);
        setuspYes(false);
    }

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName="Apply_ASBFinancing_Declaration"
        >
            <>
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
                                                text={ARE_YOU_US_PERSON}
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
                                            title="Yes"
                                            isSelected={uspYes}
                                            fontSize={14}
                                            fontWeight="400"
                                            onRadioButtonPressed={onRadioBtnUSPTapYes}
                                        />
                                    </View>
                                    <View style={styles.noRadioBtn}>
                                        <ColorRadioButton
                                            title="No"
                                            isSelected={uspNo}
                                            fontSize={14}
                                            fontWeight="400"
                                            onRadioButtonPressed={onRadioBtnUSPTapNo}
                                        />
                                    </View>
                                </View>
                            </View>
                        </KeyboardAwareScrollView>
                        <FixedActionContainer>
                            <View style={styles.footer}>
                                <ActionButton
                                    activeOpacity={uspYes || uspNo ? 1 : 0.5}
                                    backgroundColor={uspYes || uspNo ? YELLOW : DISABLED}
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

                <ScrollPickerView
                    showMenu={countryScrollPicker.isDisplay}
                    list={countryScrollPicker.data}
                    selectedIndex={countryScrollPicker.selectedIndex}
                    onRightButtonPress={onCountryScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={onCountryScrollPickerCancelButtonDidTap}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />

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
                        onPress: handleLeaveBtn,
                    }}
                    secondaryAction={{
                        text: CANCEL,
                        onPress: onPopupCloseConfirm,
                    }}
                />
            </>
        </ScreenContainer>
    );
}

FatcaDeclaration.propTypes = {
    route: PropTypes.object,
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

export default FatcaDeclaration;
