import { useNavigation, useRoute } from "@react-navigation/native";
import { isEmpty } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import TextInputWithLengthCheck from "@components/TextInputWithLengthCheck";
import Typo from "@components/TextWithInfo";

import { useModelController, withModelContext } from "@context";

import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { BLACK, DARK_GREY, DISABLED, DISABLED_TEXT, MEDIUM_GREY, YELLOW } from "@constants/colors";
import { CANCEL, CONTINUE, DONE, MOT, DROPDOWN_DEFAULT_TEXT } from "@constants/strings";

import { convertToTitleCase } from "@utils/dataModel/utilityRemittance";

const relationshipTransferData = [
    { name: "Spouse" },
    { name: "Siblings" },
    { name: "Parents" },
    { name: "Children" },
];
const purposeCodeWithRelation = ["14200", "14100", "35000", "31000", "NH"];
const relationshipTransferDataNR = [{ name: "Related" }, { name: "Non-related" }];

function MOTTransferDetails() {
    const navigation = useNavigation();
    const route = useRoute();
    const { transferParams, from, callBackFunction } = route?.params || {};
    const { getModel, updateModel } = useModelController();
    const { purposeCodeLists, OverseasSenderDetails, MOTSenderDetails, MOTTransferPurpose } =
        getModel("overseasTransfers");
    const { additionalInfo, relationShipStatus, transferPurpose, transferSubPurpose } =
        MOTTransferPurpose || {};
    const [statePurposeTransfer, changeTransferPopupState] = useState(preLoadData());
    const [relationshipAvailable, setRelationshipList] = useState(
        !relationShipStatus ? false : true
    );

    const {
        purposeList,
        subPurposeList,
        showPurposePopup,
        showSubPurposePopup,
        purposeSelectedIndex,
        subPurposeSelectedIndex,
        purposePlaceHolder,
        subPurposePlaceHolder,
        showRelationshipPopup,
        relationshipPlaceHolder,
        relationshipSelectedIndex,
    } = statePurposeTransfer;
    const senderNationality = MOTSenderDetails?.nationality ?? OverseasSenderDetails?.nationality;
    const isMalaysianSender =
        senderNationality?.toUpperCase() === "MALAYSIA" || senderNationality?.toUpperCase() === "M";
    const isCTADisabled =
        !purposePlaceHolder ||
        (isMalaysianSender && subPurposeList?.length > 0 && !subPurposePlaceHolder) ||
        (relationshipAvailable && !relationshipPlaceHolder);

    const showSubPurpose =
        !isEmpty(purposePlaceHolder) && isMalaysianSender && subPurposeList?.length > 0;
    useEffect(() => {
        RemittanceAnalytics.trxDetailsLoaded("MOT");
        changeTransferPopupState(preLoadData());

        if (
            (from === "MOTConfirmation" && MOTTransferPurpose?.relationShipStatus) ||
            MOTTransferPurpose?.relationShipStatus
        ) {
            setRelationshipList(true);
        }
    }, [purposeCodeLists?.length, from]);

    function preLoadData() {
        if (transferPurpose?.serviceName || transferSubPurpose?.subServiceName) {
            const purposeIndex = purposeCodeLists.findIndex((item, i) => {
                return item.serviceName === transferPurpose?.serviceName;
            });
            const subPurposeIndex =
                purposeIndex >= 0
                    ? purposeCodeLists[purposeIndex]?.subPurposeCodeList.findIndex((item) => {
                          return item.subServiceName === transferSubPurpose?.subServiceName;
                      })
                    : purposeIndex;
            return {
                purposeList: processPurposeList(purposeCodeLists),
                subPurposeList:
                    purposeIndex >= 0 ? purposeCodeLists[purposeIndex].subPurposeCodeList : [],
                purposePlaceHolder: transferPurpose?.serviceName,
                subPurposePlaceHolder: transferSubPurpose?.subServiceName,
                purposeSelectedIndex: purposeIndex,
                subPurposeSelectedIndex: subPurposeIndex,
                showPurposePopup: false,
                showSubPurposePopup: false,
                showRelationshipPopup: false,
                additionalInfo,
                relationshipPlaceHolder: relationShipStatus ?? "",
                relationshipSelectedIndex: MOTTransferPurpose?.relationshipSelectedIndex,
            };
        } else {
            return {
                purposeList: processPurposeList(purposeCodeLists),
                subPurposeList: [],
                purposePlaceHolder: "",
                subPurposePlaceHolder: "",
                purposeSelectedIndex: 0,
                subPurposeSelectedIndex: 0,
                showPurposePopup: false,
                showSubPurposePopup: false,
                additionalInfo: "",
                showRelationshipPopup: false,
                relationshipPlaceHolder: "",
                relationshipSelectedIndex,
            };
        }
    }

    function getHeaderUI() {
        return (
            <HeaderLayout
                headerLeftElement={
                    <HeaderBackButton
                        onPress={onBackButtonPress}
                        disabled={isCTADisabled && route?.params?.from === "MOTConfirmation"}
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
        const responseList = inputList.map((item, index) => ({
            ...item,
            name: convertToTitleCase(item?.serviceName?.replace("\uFFFD", "'")),
        }));
        return responseList;
    }

    function processSubpurposeList(inputList) {
        const responseList = inputList.map((item, index) => ({
            ...item,
            name: convertToTitleCase(item?.subServiceName),
        }));
        return responseList;
    }

    const onBackButtonPress = () => {
        const relationShipStatusList = isMalaysianSender
            ? relationshipTransferData
            : relationshipTransferDataNR;
        const transferDetailsObj = {
            transferPurpose: purposeList[purposeSelectedIndex],
            transferSubPurpose: showSubPurpose ? subPurposeList[subPurposeSelectedIndex] : "",
            relationShipStatus:
                relationshipAvailable && relationshipSelectedIndex >= 0
                    ? relationShipStatusList[relationshipSelectedIndex]?.name
                    : null,
            relationshipSelectedIndex,
            additionalInfo: statePurposeTransfer?.additionalInfo,
        };
        updateModel({
            overseasTransfers: {
                MOTTransferPurpose: transferDetailsObj,
            },
        });

        if (from === "MOTConfirmation") {
            if (callBackFunction) {
                callBackFunction(transferDetailsObj);
            }
            navigation.navigate(from, {
                ...route?.params,
                from: "",
            });
        } else {
            if (transferParams?.favourite) {
                navigation.goBack();
                return;
            }
            navigation.navigate("MOTRecipientDetails", {
                ...route?.params,
            });
        }
    };

    function onPressPurposeTransfer() {
        changeTransferPopupState((prevState) => ({
            ...prevState,
            purposeList: processPurposeList(purposeCodeLists),
            showPurposePopup: true,
        }));
    }

    function onPressSubPurposeTransfer() {
        changeTransferPopupState((prevState) => ({ ...prevState, showSubPurposePopup: true }));
    }
    function onPressRelationshipTransfer() {
        changeTransferPopupState((prevState) => ({ ...prevState, showRelationshipPopup: true }));
    }

    function onHandlePurposeDone(item, index) {
        const selectedItem = purposeList[purposeSelectedIndex || index];
        if (selectedItem?.serviceCode) {
            setRelationshipList(purposeCodeWithRelation.includes(selectedItem?.serviceCode));
        }
        changeTransferPopupState((prevState) => ({
            ...prevState,
            purposePlaceHolder: selectedItem?.name,
            purposeSelectedIndex,
            subPurposeList: selectedItem?.subPurposeCodeList,
            subPurposePlaceHolder: "",
            subPurposeSelectedIndex: 0,
            showPurposePopup: false,
            relationshipSelectedIndex: 0,
            relationshipPlaceHolder: "",
        }));
    }
    function onHandleSubPurposeDone(item, index) {
        const selectedSubPurpose =
            processSubpurposeList(subPurposeList)[subPurposeSelectedIndex || index];
        changeTransferPopupState((prevState) => ({
            ...prevState,
            subPurposePlaceHolder: selectedSubPurpose?.name,
            subPurposeSelectedIndex,
            showSubPurposePopup: false,
        }));
        setRelationshipList(purposeCodeWithRelation.includes(selectedSubPurpose?.subServiceCode));
    }
    function onHandleRelationshipDone(item, index) {
        changeTransferPopupState((prevState) => ({
            ...prevState,
            relationshipPlaceHolder: item.name,
            relationshipSelectedIndex: index,
            showRelationshipPopup: false,
        }));
    }
    function onHandleInfoChange(value) {
        changeTransferPopupState((prevState) => ({
            ...prevState,
            additionalInfo: value,
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

    const onChangeAdditionalInfo = useCallback((value) => {
        onHandleInfoChange(value);
    }, []);
    function onContinue() {
        const relationShipStatusList = isMalaysianSender
            ? relationshipTransferData
            : relationshipTransferDataNR;
        const transferDetailsObj = {
            transferPurpose: purposeList[purposeSelectedIndex],
            transferSubPurpose: showSubPurpose ? subPurposeList[subPurposeSelectedIndex] : "",
            relationShipStatus:
                relationshipAvailable && relationshipSelectedIndex >= 0
                    ? relationShipStatusList[relationshipSelectedIndex]?.name
                    : null,
            relationshipSelectedIndex,
            additionalInfo: statePurposeTransfer?.additionalInfo,
        };
        updateModel({
            overseasTransfers: {
                MOTTransferPurpose: transferDetailsObj,
            },
        });

        if (from === "MOTConfirmation") {
            if (callBackFunction) {
                callBackFunction(transferDetailsObj);
            }
            navigation.navigate(from, {
                ...route?.params,
                from: "",
            });
        } else {
            navigation.navigate("MOTConfirmation", {
                ...route?.params,
            });
        }
    }

    const onChangePurpose = useCallback((data, selectedIndex) => {
        changeTransferPopupState((prevState) => ({
            ...prevState,
            purposeSelectedIndex: selectedIndex,
        }));
    }, []);

    const onChangeSubPurpose = useCallback((data, selectedIndex) => {
        changeTransferPopupState((prevState) => ({
            ...prevState,
            subPurposeSelectedIndex: selectedIndex,
        }));
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
                <KeyboardAwareScrollView
                    enableOnAndroid={Platform.OS === "android"}
                    extraScrollHeight={105}
                >
                    <Typo
                        text={MOT}
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
                        title={convertToTitleCase(purposePlaceHolder) || DROPDOWN_DEFAULT_TEXT}
                        align="left"
                        borderWidth={0.5}
                        onPress={onPressPurposeTransfer}
                    />
                    {showSubPurpose && (
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
                                title={
                                    convertToTitleCase(subPurposePlaceHolder) ||
                                    DROPDOWN_DEFAULT_TEXT
                                }
                                align="left"
                                borderWidth={0.5}
                                onPress={onPressSubPurposeTransfer}
                            />
                        </>
                    )}

                    {relationshipAvailable && !isEmpty(purposePlaceHolder) && (
                        <>
                            <Typo
                                style={styles.inputContainer}
                                textAlign="left"
                                text="Relationship status"
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
                        </>
                    )}
                    <TextInputWithLengthCheck
                        label="Additional info (Optional)"
                        placeholder="Enter details"
                        value={statePurposeTransfer?.additionalInfo}
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
                list={purposeList}
                selectedIndex={purposeSelectedIndex}
                onRightButtonPress={onHandlePurposeDone}
                onLeftButtonPress={onHandlePurposeCancel}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
                onValueChange={onChangePurpose}
            />
            <ScrollPickerView
                showMenu={showSubPurposePopup}
                list={processSubpurposeList(subPurposeList)}
                selectedIndex={subPurposeSelectedIndex}
                onRightButtonPress={onHandleSubPurposeDone}
                onLeftButtonPress={onHandleSubPurposeCancel}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
                onValueChange={onChangeSubPurpose}
            />
            <ScrollPickerView
                showMenu={showRelationshipPopup}
                list={isMalaysianSender ? relationshipTransferData : relationshipTransferDataNR}
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
    inputContainer: { marginBottom: 8, marginTop: 24 },
    pageTitle: { marginTop: 4 },
    popUpTitle: { marginBottom: 8, marginTop: 24 },
});

export default withModelContext(MOTTransferDetails);
