import PropTypes from "prop-types";
import React, { useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import TitleAndDropdownPill from "@components/SSL/TitleAndDropdownPill";
import Typo from "@components/Text";
import TitleAndDropdownPillWithIcon from "@components/TitleAndDropdownPillWithIcon";

import { asbUpdateCEP } from "@redux/services/ASBServices/asbApiUpdateCEP";

import { MEDIUM_GREY, YELLOW, BLACK, DISABLED_TEXT, DISABLED } from "@constants/colors";
import {
    DONE,
    CANCEL,
    ASB_FINANCING,
    PLEASE_SELECT,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    FILL_IN_ADDITIONAL_DETAILS,
    PLSTP_SAVE_NEXT,
    GUARANTOR_PRIMARY_SOURCE_OF_WEALTH_INFO_TITLE,
    GUARANTOR_PRIMARY_SOURCE_OF_WEALTH_INFO_DESC,
    LEAVE,
    SECTOR_INFO_HEADING,
    STEP,
} from "@constants/strings";

function GuarantorAdditionalDetailsIncome({ route, navigation }) {
    const { currentSteps, totalSteps } = route?.params;
    // Hooks to access reducer data
    const prequalReducer = useSelector((state) => state.asbServicesReducer.prePostQualReducer);
    const masterDataReducer = useSelector((state) => state.asbServicesReducer.masterDataReducer);

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    const [selectPrimaryIncome, setSelectPrimaryIncome] = useState("");
    const [selectPrimarySourceOfWealth, setSelectPrimarySourceOfWealth] = useState("");
    const [showPrimaryIncomePicker, setShowPrimaryIncomePicker] = useState(false);
    const [showPrimarySourceOfWealthPicker, setShowPrimarySourceOfWealthPicker] = useState(false);
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const stpReferenceNumber = prequalReducer?.stpreferenceNo;

    async function navToProceedScreen() {
        updateApiCEP(() => {});
    }

    function onBackTap() {
        navigation.goBack();
    }

    function onDropdownPress() {
        setShowPrimaryIncomePicker(true);
    }

    function onDropdownSourceOfWealthPress() {
        setShowPrimarySourceOfWealthPicker(true);
    }

    function onPopupClose() {
        setShowPopup(false);
    }

    function onPickerCancel() {
        setShowPrimaryIncomePicker(false);
    }

    function onPickerDone(item) {
        setSelectPrimaryIncome(item.name);
        onPickerCancel();
    }

    function onPickerourceOfWealthDone(item) {
        setSelectPrimarySourceOfWealth(item.name);
        onPickerSourceOfWealthCancel();
    }

    function onPickerSourceOfWealthCancel() {
        setShowPrimarySourceOfWealthPicker(false);
    }

    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }

    function handleClose() {
        setShowPopupConfirm(true);
    }

    async function handleLeaveButton() {
        setShowPopupConfirm(false);
        updateApiCEP(() => {});
    }

    function updateApiCEP(callback) {
        const body = {
            screenNo: "13",
            stpReferenceNo: stpReferenceNumber,
            primaryIncome: selectPrimaryIncome,
            primarySourceOfWealth: selectPrimarySourceOfWealth,
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

    function onPrimarySourceOfWealthInfoPress() {
        setShowPopup(true);
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
                            headerCenterElement={
                                <Typo
                                    text={`${STEP} ${currentSteps} of ${totalSteps}`}
                                    fontWeight="300"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
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
                            <SpaceFiller height={4} />

                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={28}
                                text={FILL_IN_ADDITIONAL_DETAILS}
                                textAlign="left"
                            />

                            <TitleAndDropdownPill
                                title={SECTOR_INFO_HEADING}
                                dropdownTitle={selectPrimaryIncome ?? PLEASE_SELECT}
                                dropdownOnPress={onDropdownPress}
                                removeTopMargin={true}
                                titleFontWeight="400"
                            />

                            <TitleAndDropdownPillWithIcon
                                title={GUARANTOR_PRIMARY_SOURCE_OF_WEALTH_INFO_TITLE}
                                dropdownTitle={selectPrimarySourceOfWealth ?? PLEASE_SELECT}
                                dropdownOnPress={onDropdownSourceOfWealthPress}
                                removeTopMargin={true}
                                titleFontWeight="400"
                                dropdownOnInfoPress={onPrimarySourceOfWealthInfoPress}
                            />
                        </KeyboardAwareScrollView>
                        <View style={styles.view}>
                            <FixedActionContainer>
                                <View style={styles.footer}>
                                    <ActionButton
                                        fullWidth
                                        disabled={
                                            !selectPrimaryIncome || !selectPrimarySourceOfWealth
                                        }
                                        borderRadius={25}
                                        onPress={navToProceedScreen}
                                        backgroundColor={
                                            !selectPrimaryIncome || !selectPrimarySourceOfWealth
                                                ? DISABLED
                                                : YELLOW
                                        }
                                        componentCenter={
                                            <Typo
                                                text={PLSTP_SAVE_NEXT}
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                color={
                                                    !selectPrimaryIncome ||
                                                    !selectPrimarySourceOfWealth
                                                        ? DISABLED_TEXT
                                                        : BLACK
                                                }
                                            />
                                        }
                                    />
                                </View>
                            </FixedActionContainer>
                        </View>
                    </View>
                </ScreenLayout>
                <Popup
                    visible={showPopup}
                    onClose={onPopupClose}
                    title={GUARANTOR_PRIMARY_SOURCE_OF_WEALTH_INFO_TITLE}
                    description={GUARANTOR_PRIMARY_SOURCE_OF_WEALTH_INFO_DESC}
                />
                <ScrollPickerView
                    showMenu={showPrimaryIncomePicker}
                    list={
                        masterDataReducer.status === "success"
                            ? masterDataReducer?.sourceOfFundOrigin
                            : []
                    }
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
                <ScrollPickerView
                    showMenu={showPrimarySourceOfWealthPicker}
                    list={
                        masterDataReducer.status === "success"
                            ? masterDataReducer?.sourceOfWealthOrigin
                            : []
                    }
                    onRightButtonPress={onPickerourceOfWealthDone}
                    onLeftButtonPress={onPickerSourceOfWealthCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />

                <Popup
                    visible={showPopupConfirm}
                    onClose={onPopupCloseConfirm}
                    title={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE}
                    description={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC}
                    primaryAction={{
                        text: LEAVE,
                        onPress: handleLeaveButton,
                    }}
                    secondaryAction={{
                        text: CANCEL,
                        onPress: onPopupCloseConfirm,
                    }}
                />
            </React.Fragment>
        </ScreenContainer>
    );
}

GuarantorAdditionalDetailsIncome.propTypes = {
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
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    view: {
        marginTop: 24,
        paddingHorizontal: 12,
    },
});

export default GuarantorAdditionalDetailsIncome;
