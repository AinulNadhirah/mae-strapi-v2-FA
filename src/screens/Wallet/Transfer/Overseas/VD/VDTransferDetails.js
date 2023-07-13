// import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/TextWithInfo";

import { BLACK, DARK_GREY, DISABLED, DISABLED_TEXT, MEDIUM_GREY, YELLOW } from "@constants/colors";
import { CANCEL, CONTINUE, DONE, VISA_DIRECT, DROPDOWN_DEFAULT_TEXT } from "@constants/strings";

const purposeTransferData = [
    { name: "Family Support/Living Expenses" },
    { name: "Saving/Investments" },
    { name: "Gift" },
    { name: "Goods & Services Payment" },
    { name: "Travel Expenses" },
];
const subPurposeTransferData = [
    { name: "Private transfer - To immediate family member" },
    { name: "Wages and salaries in kind/benefits attributable to employee" },
    { name: "Private transfer - Migrant transfer" },
];
const identityTransferData = [
    { name: "Private transfer - To immediate family member" },
    { name: "Wages and salaries in kind/benefits attributable to employee" },
    { name: "Private transfer - Migrant transfer" },
];

const VDTransferDetails = () => {
    const [statePurposeTransfer, changeTransferPopupState] = useState({
        purposePlaceHolder: "",
        subPurposePlaceHolder: "",
        identityPlaceHolder: "",
        purposeSelectedIndex: 0,
        subPurposeSelectedIndex: 0,
        identitySelectedIndex: 0,
        showPurposePopup: false,
        showSubPurposePopup: false,
        showIdentityPopup: false,
    });
    const {
        showPurposePopup,
        showSubPurposePopup,
        showIdentityPopup,
        purposeSelectedIndex,
        subPurposeSelectedIndex,
        identitySelectedIndex,
        purposePlaceHolder,
        subPurposePlaceHolder,
        identityPlaceHolder,
    } = statePurposeTransfer;

    const isCTADisabled = !purposePlaceHolder || !subPurposePlaceHolder || !identityPlaceHolder;
    // const navigation = useNavigation();

    getHeaderUI = () => (
        <HeaderLayout
            headerLeftElement={<HeaderBackButton onPress={this.onBackButtonPress} />}
            headerCenterElement={
                <Typo
                    color={DARK_GREY}
                    text="Step 3 of 3"
                    fontWeight="600"
                    fontSize={12}
                    lineHeight={18}
                />
            }
        />
    );

    onBackButtonPress = () => {
        // navigation.goBack();
    };

    onPressPurposeTransfer = () => {
        changeTransferPopupState((prevState) => ({ ...prevState, showPurposePopup: true }));
    };

    onPressSubPurposeTransfer = () => {
        changeTransferPopupState((prevState) => ({ ...prevState, showSubPurposePopup: true }));
    };

    onPressIdentityTransfer = () => {
        changeTransferPopupState((prevState) => ({ ...prevState, showIdentityPopup: true }));
    };

    onHandlePurposeDone = (item, index) => {
        changeTransferPopupState((prevState) => ({
            ...prevState,
            purposePlaceHolder: item.name,
            purposeSelectedIndex: index,
            showPurposePopup: false,
        }));
    };
    onHandleSubPurposeDone = (item, index) => {
        changeTransferPopupState((prevState) => ({
            ...prevState,
            subPurposePlaceHolder: item.name,
            subPurposeSelectedIndex: index,
            showSubPurposePopup: false,
        }));
    };

    onHandleIdentityDone = (item, index) => {
        changeTransferPopupState((prevState) => ({
            ...prevState,
            identityPlaceHolder: item.name,
            identitySelectedIndex: index,
            showIdentityPopup: false,
        }));
    };

    onHandlePurposeCancel = () => {
        changeTransferPopupState((prevState) => ({ ...prevState, showPurposePopup: false }));
    };

    onHandleSubPurposeCancel = () => {
        changeTransferPopupState((prevState) => ({ ...prevState, showSubPurposePopup: false }));
    };

    onHandleIdentityCancel = () => {
        changeTransferPopupState((prevState) => ({ ...prevState, showIdentityPopup: false }));
    };

    onContinue = () => {
        // navigation.navigate("FTTConfirmation");
    };

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={16}
                paddingHorizontal={24}
                useSafeArea
                header={this.getHeaderUI()}
            >
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Typo
                        text={VISA_DIRECT}
                        textAlign="left"
                        fontSize={14}
                        lineHeight={18}
                        fontWeight="400"
                    />
                    <Typo
                        style={styles.pageTitle}
                        textAlign="left"
                        text="Please fill in transfer details"
                        fontWeight="600"
                        fontSize={16}
                        lineHeight={20}
                    />
                    <Typo
                        style={styles.popUpTitle}
                        textAlign="left"
                        text="Purpose of transfer"
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                    />
                    <Dropdown
                        title={purposePlaceHolder || DROPDOWN_DEFAULT_TEXT}
                        align="left"
                        borderWidth={0.5}
                        onPress={this.onPressPurposeTransfer}
                    />
                    <Typo
                        style={styles.popUpTitle}
                        textAlign="left"
                        text="Sub purpose"
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                    />
                    <Dropdown
                        title={subPurposePlaceHolder || DROPDOWN_DEFAULT_TEXT}
                        align="left"
                        borderWidth={0.5}
                        onPress={this.onPressSubPurposeTransfer}
                    />
                    <Typo
                        style={styles.popUpTitle}
                        textAlign="left"
                        text="I am a"
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                    />
                    <Dropdown
                        title={identityPlaceHolder || DROPDOWN_DEFAULT_TEXT}
                        align="left"
                        borderWidth={0.5}
                        onPress={this.onPressIdentityTransfer}
                    />
                </ScrollView>
            </ScreenLayout>
            <FixedActionContainer>
                <ActionButton
                    disabled={isCTADisabled}
                    backgroundColor={isCTADisabled ? DISABLED : YELLOW}
                    fullWidth
                    componentCenter={
                        <Typo
                            color={isCTADisabled ? DISABLED_TEXT : BLACK}
                            lineHeight={18}
                            fontWeight="600"
                            fontSize={14}
                            text={CONTINUE}
                        />
                    }
                    onPress={this.onContinue}
                />
            </FixedActionContainer>
            <ScrollPickerView
                showMenu={showPurposePopup}
                list={purposeTransferData}
                selectedIndex={purposeSelectedIndex}
                onRightButtonPress={this.onHandlePurposeDone}
                onLeftButtonPress={this.onHandlePurposeCancel}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            <ScrollPickerView
                showMenu={showSubPurposePopup}
                list={subPurposeTransferData}
                selectedIndex={subPurposeSelectedIndex}
                onRightButtonPress={this.onHandleSubPurposeDone}
                onLeftButtonPress={this.onHandleSubPurposeCancel}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            <ScrollPickerView
                showMenu={showIdentityPopup}
                list={identityTransferData}
                selectedIndex={identitySelectedIndex}
                onRightButtonPress={this.onHandleIdentityDone}
                onLeftButtonPress={this.onHandleIdentityCancel}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    popUpTitle: { marginBottom: 8, marginTop: 24 },
});

export default VDTransferDetails;
