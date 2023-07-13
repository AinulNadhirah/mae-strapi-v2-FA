import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { AccountDetailsView, ScrollPickerView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import TextInputWithLengthCheck from "@components/TextInputWithLengthCheck";
import Typo from "@components/TextWithInfo";

import { useModelController, withModelContext } from "@context";

import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { BLACK, DARK_GREY, DISABLED, DISABLED_TEXT, MEDIUM_GREY, YELLOW } from "@constants/colors";
import { CANCEL, CONTINUE, DONE, DROPDOWN_DEFAULT_TEXT } from "@constants/strings";

const relationshipTransferData = [
    { name: "Spouse" },
    { name: "Siblings" },
    { name: "Parents" },
    { name: "Children" },
];

function BakongTransferPurposeDetails() {
    const navigation = useNavigation();
    const route = useRoute();
    const { transferParams } = route?.params || {};
    const { getModel, updateModel } = useModelController();
    const { purposeCodeLists, BakongRecipientIDDetails, BKTransferPurpose } =
        getModel("overseasTransfers");
    const [statePurposeTransfer, changeTransferPopupState] = useState(preLoadData());

    const {
        purposeList,
        subPurposeList,
        showPurposePopup,
        showSubPurposePopup,
        purposeSelectedIndex,
        subPurposeSelectedIndex,
        purposePlaceHolder,
        subPurposePlaceHolder,
        additionalInfo,
        showRelationshipPopup,
        relationshipPlaceHolder,
        relationshipSelectedIndex,
    } = statePurposeTransfer;
    const [relationshipAvailable, setRelationshipList] = useState(
        (relationshipPlaceHolder && relationshipSelectedIndex > 0) ||
            (BKTransferPurpose?.transferSubPurpose?.subServiceCode === "NH" &&
                BKTransferPurpose?.relationShipStatus)
    );
    const isCTADisabled =
        !purposePlaceHolder ||
        !subPurposePlaceHolder ||
        (!relationshipPlaceHolder && relationshipAvailable);

    useEffect(() => {
        RemittanceAnalytics.trxDetailsLoaded("Bakong");
    }, []);

    function preLoadData() {
        const { transferPurposeIndex, transferSubPurposeList, transferSubPurposeIndex } =
            BKTransferPurpose || {};

        return {
            purposeList: purposeCodeLists,
            subPurposeList: transferSubPurposeList || [],
            purposePlaceHolder: BKTransferPurpose?.transferPurpose?.serviceName || "",
            subPurposePlaceHolder: BKTransferPurpose?.transferSubPurpose?.subServiceName || "",
            purposeSelectedIndex: transferPurposeIndex || 0,
            subPurposeSelectedIndex: transferSubPurposeIndex || 0,
            showPurposePopup: false,
            showSubPurposePopup: false,
            additionalInfo: BKTransferPurpose?.additionalInfo || "",
            showRelationshipPopup: false,
            relationshipPlaceHolder:
                BKTransferPurpose?.transferSubPurpose?.subServiceCode === "NH"
                    ? BKTransferPurpose?.relationShipStatus
                    : "",
            relationshipSelectedIndex: BKTransferPurpose?.relationshipSelectedIndex || 0,
        };
    }

    function onHandleInfoChange(value) {
        changeTransferPopupState((prevState) => ({
            ...prevState,
            additionalInfo: value,
        }));
    }

    function getHeaderUI() {
        return (
            <HeaderLayout
                headerLeftElement={
                    <HeaderBackButton
                        onPress={onBackButtonPress}
                        disabled={
                            route?.params?.from === "BakongDetailsConfirmation" && isCTADisabled
                        }
                    />
                }
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
    }

    function processPurposeList(inputList) {
        return inputList.map((item) => ({
            ...item,
            name: item?.serviceName,
        }));
    }

    function processSubpurposeList(inputList) {
        if (inputList?.length > 0) {
            return inputList.map((item) => ({
                ...item,
                name: item?.subServiceName,
            }));
        }
        return [];
    }

    const onBackButtonPress = () => {
        if (
            purposeList?.length &&
            purposeSelectedIndex &&
            subPurposeList?.length &&
            subPurposeSelectedIndex
        ) {
            const transferPurposeDetailsObj = {
                transferPurpose: purposeList[purposeSelectedIndex],
                transferSubPurpose: subPurposeList[subPurposeSelectedIndex],
                relationShipStatus: relationshipTransferData[relationshipSelectedIndex]?.name,
                additionalInfo,
                purposePlaceHolder,
                relationshipPlaceHolder: relationshipAvailable ? relationshipPlaceHolder : "",
                subPurposePlaceHolder,
                transferPurposeList: purposeCodeLists,
                transferPurposeIndex: purposeSelectedIndex,
                transferSubPurposeList: subPurposeList,
                transferSubPurposeIndex: subPurposeSelectedIndex,
                relationshipSelectedIndex,
            };
            updateModel({
                overseasTransfers: {
                    BKTransferPurpose: transferPurposeDetailsObj,
                },
            });
        }

        if (route?.params?.from === "BakongDetailsConfirmation") {
            navigation.navigate(route?.params?.from, {
                ...route?.params,
                from: "",
            });
            return;
        }

        if (transferParams?.favTransferItem?.productType) {
            navigation.navigate("OverseasProductListScreen", {
                ...route?.params,
            });
            return;
        }

        navigation.navigate("BakongRecipientAddressDetails", {
            ...route?.params,
        });
    };

    function onPressPurposeTransfer() {
        changeTransferPopupState((prevState) => ({ ...prevState, showPurposePopup: true }));
    }

    function onPressSubPurposeTransfer() {
        changeTransferPopupState((prevState) => ({
            ...prevState,
            showSubPurposePopup: true,
            subPurposeSelectedIndex: subPurposeSelectedIndex ?? 0,
        }));
    }
    function onPressRelationshipTransfer() {
        changeTransferPopupState((prevState) => ({ ...prevState, showRelationshipPopup: true }));
    }

    function onHandlePurposeDone(item, index) {
        const selectedItem = processPurposeList(purposeList)[index];
        changeTransferPopupState((prevState) => ({
            ...prevState,
            purposePlaceHolder: selectedItem.name,
            purposeSelectedIndex: index,
            subPurposeList: selectedItem?.subPurposeCodeList,
            subPurposePlaceHolder: "",
            relationshipPlaceHolder: "",
            subPurposeSelectedIndex: 0,
            showPurposePopup: false,
        }));
        if (item?.name === "Services" && relationshipAvailable) {
            setRelationshipList(false);
        }
    }
    function onHandleSubPurposeDone(item, index) {
        const selectItem = processSubpurposeList(subPurposeList)[index];
        const showRelationshipDropdown = selectItem?.subServiceCode === "NH";
        setRelationshipList(showRelationshipDropdown);
        changeTransferPopupState((prevState) => ({
            ...prevState,
            subPurposePlaceHolder: selectItem?.name,
            subPurposeSelectedIndex: index,
            showSubPurposePopup: false,
            relationshipPlaceHolder: showRelationshipDropdown ? relationshipPlaceHolder : "",
        }));
    }
    function onHandleRelationshipDone(item, index) {
        changeTransferPopupState((prevState) => ({
            ...prevState,
            relationshipPlaceHolder: item.name,
            relationshipSelectedIndex: index ?? 0,
            showRelationshipPopup: false,
        }));
    }
    function onHandlePurposeCancel() {
        changeTransferPopupState((prevState) => ({ ...prevState, showPurposePopup: false }));
    }

    function onHandleSubPurposeCancel() {
        changeTransferPopupState((prevState) => ({ ...prevState, showSubPurposePopup: false }));
    }
    function onHandleRelationshipCancel() {
        changeTransferPopupState((prevState) => ({ ...prevState, showRelationshipPopup: false }));
    }

    function onContinue() {
        const transferPurposeDetailsObj = {
            transferPurpose: purposeList[purposeSelectedIndex],
            transferSubPurpose: subPurposeList[subPurposeSelectedIndex],
            relationShipStatus: relationshipTransferData[relationshipSelectedIndex]?.name,
            additionalInfo,
            purposePlaceHolder,
            relationshipSelectedIndex,
            relationshipPlaceHolder: relationshipAvailable ? relationshipPlaceHolder : "",
            subPurposePlaceHolder,
            transferPurposeList: purposeCodeLists,
            transferPurposeIndex: purposeSelectedIndex,
            transferSubPurposeList: subPurposeList,
            transferSubPurposeIndex: subPurposeSelectedIndex,
        };

        updateModel({
            overseasTransfers: {
                BKTransferPurpose: transferPurposeDetailsObj,
            },
        });

        if (route?.params?.from === "BakongDetailsConfirmation") {
            navigation.navigate(route?.params?.from, {
                ...route?.params,
                from: "",
            });
        } else {
            navigation.navigate("BakongDetailsConfirmation", {
                ...route?.params,
            });
        }
    }

    const onChangeAdditionalInfo = useCallback((value) => {
        onHandleInfoChange(value);
    }, []);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={16}
                paddingHorizontal={0}
                useSafeArea
                header={getHeaderUI()}
                scrollable
                contentContainerStyle={styles.contentContainer}
            >
                <KeyboardAwareScrollView enableOnAndroid extraScrollHeight={120}>
                    <View style={styles.headerContainer}>
                        <AccountDetailsView
                            data={BakongRecipientIDDetails?.screenData}
                            base64
                            greyed
                        />
                    </View>
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
                        onPress={onPressPurposeTransfer}
                    />
                    {!!purposePlaceHolder && (
                        <>
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
                                onPress={onPressSubPurposeTransfer}
                            />
                        </>
                    )}
                    {subPurposePlaceHolder !== "" && relationshipAvailable && (
                        <View>
                            <Typo
                                style={styles.inputContainer}
                                textAlign="left"
                                text="Relationship"
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={18}
                            />
                            <Dropdown
                                title={relationshipPlaceHolder || DROPDOWN_DEFAULT_TEXT}
                                align="left"
                                borderWidth={0.5}
                                onPress={onPressRelationshipTransfer}
                            />
                        </View>
                    )}
                    <TextInputWithLengthCheck
                        label="Additional info (Optional)"
                        placeholder="Enter recipient reference"
                        value={additionalInfo}
                        maxLength={35}
                        onChangeText={onChangeAdditionalInfo}
                    />
                </KeyboardAwareScrollView>
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
                    onPress={onContinue}
                />
            </ScreenLayout>
            <ScrollPickerView
                showMenu={showPurposePopup}
                list={processPurposeList(purposeList)}
                selectedIndex={purposeSelectedIndex}
                onRightButtonPress={onHandlePurposeDone}
                onLeftButtonPress={onHandlePurposeCancel}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            <ScrollPickerView
                showMenu={showSubPurposePopup}
                list={processSubpurposeList(subPurposeList)}
                selectedIndex={subPurposeSelectedIndex}
                onRightButtonPress={onHandleSubPurposeDone}
                onLeftButtonPress={onHandleSubPurposeCancel}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            <ScrollPickerView
                showMenu={showRelationshipPopup}
                list={relationshipTransferData}
                selectedIndex={relationshipSelectedIndex}
                onRightButtonPress={onHandleRelationshipDone}
                onLeftButtonPress={onHandleRelationshipCancel}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        paddingBottom: 25,
        paddingHorizontal: 24,
    },
    headerContainer: {
        justifyContent: "flex-start",
    },
    inputContainer: { marginBottom: 8, marginTop: 24 },
    popUpTitle: { marginBottom: 8, marginTop: 24 },
});

export default withModelContext(BakongTransferPurposeDetails);
