import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { Image, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Popup from "@components/Popup";
import TextInputWithLengthCheck from "@components/TextInputWithLengthCheck";
import Typo from "@components/TextWithInfo";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { requestFTTCharge } from "@services";
import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { BLACK, DARK_GREY, DISABLED, DISABLED_TEXT, MEDIUM_GREY, YELLOW } from "@constants/colors";
import { sourceOfFundsFtt } from "@constants/data/Overseas";
import {
    CANCEL,
    COMMON_ERROR_MSG,
    CONTINUE,
    DONE,
    WE_FACING_SOME_ISSUE,
    DROPDOWN_DEFAULT_TEXT,
} from "@constants/strings";

import { convertToTitleCase } from "@utils/dataModel/utilityRemittance";
import { errorCodeMap } from "@utils/errorMap";

import assets from "@assets";

const subPurposeTransferData_ = [];
const relationshipTransferData = [
    { name: "Spouse" },
    { name: "Siblings" },
    { name: "Parents" },
    { name: "Children" },
];
const purposeCodeWithRelation = ["14200", "14100", "35000", "31000", "NH"];
const relationshipTransferDataNR = [{ name: "Related" }, { name: "Non-related" }];

function FTTTransferDetails({ navigation, route, getModel, updateModel }) {
    const {
        purposeCodeLists,
        FTTRecipientBankDetails,
        FTTRecipientDetails,
        FTTSenderDetails,
        FTTTransferPurpose,
        trxId,
        paymentRefNo,
    } = getModel("overseasTransfers");
    const { nationalityChanged, transferParams } = route?.params || {};

    const [relationshipAvailable, setRelationshipList] = useState(
        purposeCodeWithRelation.includes(
            FTTTransferPurpose?.transferPurpose?.serviceCode ||
                FTTTransferPurpose?.transferSubPurpose?.subServiceCode
        ) || false
    );
    const [statePurposeTransfer, changeTransferPopupState] = useState(preLoadData());
    const [selectedBankFeeType, changeTrasactionFeeState] = useState(
        route?.params?.transferParams?.remittanceData?.gour
            ? statePurposeTransfer?.selectedBankFeeType ??
                  FTTTransferPurpose?.selectedBankFeeType ??
                  ""
            : "SHA"
    );
    const [{ isVisible, infoTitle, infoMessage }, changeInfoDetail] = useState({
        isVisible: false,
        infoTitle: "",
        infoMessage: "",
    });
    const {
        purposeList,
        purposePlaceHolder,
        subPurposePlaceHolder,
        purposeSelectedIndex,
        subPurposeSelectedIndex,
        showPurposePopup,
        showSubPurposePopup,
        additionalInfo,
        showRelationshipPopup,
        relationshipPlaceHolder,
        relationshipSelectedIndex,
        sourceOfFundPlaceHolder,
        sourceOfFundIndex,
        sourceOfFundPopup,
    } = statePurposeTransfer;
    const [purposeTransferData, setPurposeTransferData] = useState(
        purposeCodeLists.map((purposeItem, index) => {
            return {
                index,
                name: convertToTitleCase(purposeItem?.serviceName?.replace("\uFFFD", "'")),
                code: purposeItem?.serviceCode,
                subPurposeList: filterSubPurpose(purposeItem?.subPurposeCodeList),
            };
        })
    );
    const [subPurposeTransferData, setSubPurposeTransferData] = useState(subPurposeTransferData_);

    const isMalaysianSender = FTTSenderDetails?.nationality?.toUpperCase() === "M";

    const [chosePurpose, setChosePurpose] = useState(false);
    useEffect(() => {
        if (purposeCodeLists?.length !== purposeTransferData?.length || nationalityChanged) {
            const listOfPurposeData = processPurposeList(purposeCodeLists);
            changeTransferPopupState({
                ...statePurposeTransfer,
                purposeSelectedIndex: 0,
                subPurposeSelectedIndex: 0,
            });
            setPurposeTransferData(listOfPurposeData);
        }
    }, [purposeCodeLists?.length, purposeTransferData?.length, nationalityChanged]);

    useEffect(() => {
        setRelationshipList(
            purposeCodeWithRelation.includes(FTTTransferPurpose?.transferSubPurpose?.subServiceCode)
        );
        RemittanceAnalytics.trxDetailsLoaded("FTT");
        changeTransferPopupState(preLoadData());
        if (
            (route?.params?.from === "FTTConfirmation" && FTTTransferPurpose?.relationShipStatus) ||
            FTTTransferPurpose?.relationShipStatus
        ) {
            setRelationshipList(true);
        }
        if (
            route?.params?.from &&
            route?.params?.from !== "FTTConfirmation" &&
            nationalityChanged
        ) {
            console.tron.log("test 1 ", route?.params);
            changeTransferPopupState({
                ...statePurposeTransfer,
                purposePlaceHolder: "",
                subPurposePlaceHolder: "",
                relationshipPlaceHolder: "",
                purposeSelectedIndex: 0,
                subPurposeSelectedIndex: 0,
                purposeList: purposeCodeLists,
            });
            setPurposeTransferData(processPurposeList(purposeCodeLists));
        }
    }, [purposeCodeLists?.length, route?.params?.from]);
    function processPurposeList(purposeCodeListsData) {
        return purposeCodeListsData.map((purposeItem, index) => {
            return {
                index,
                name: convertToTitleCase(purposeItem?.serviceName?.replace("\uFFFD", "'")),
                code: purposeItem?.serviceCode,
                subPurposeList: filterSubPurpose(purposeItem?.subPurposeCodeList),
            };
        });
    }
    function filterSubPurpose(item) {
        const arr = [];
        for (const i in item) {
            arr.push({
                name: item[i]?.subServiceName?.replace("\uFFFD", "'"),
                code: item[i]?.subServiceCode,
            });
        }
        return arr;
    }

    const isCTADisabled =
        !purposePlaceHolder ||
        FTTTransferPurpose?.transferPurpose?.subServiceName ||
        (isMalaysianSender &&
            (!subPurposePlaceHolder || subPurposePlaceHolder === "Please select")) ||
        (!selectedBankFeeType && route?.params?.transferParams?.remittanceData?.gour) ||
        (!sourceOfFundPlaceHolder && route?.params?.remittanceData?.toCurrency === "IDR") ||
        (relationshipAvailable && !relationshipPlaceHolder);
    function getHeaderUI() {
        return (
            <HeaderLayout
                headerLeftElement={
                    <HeaderBackButton
                        onPress={onBackButtonPress}
                        disabled={isCTADisabled && route?.params?.from === "FTTConfirmation"}
                    />
                }
                headerCenterElement={
                    <Typo
                        color={DARK_GREY}
                        text="Step 4 of 4"
                        fontWeight="600"
                        fontSize={12}
                        lineHeight={18}
                    />
                }
            />
        );
    }

    const onBackButtonPress = () => {
        const transferDetailsObj = {
            transferPurpose:
                purposeSelectedIndex >= 0 ? purposeList[purposeSelectedIndex] : undefined,
            transferSubPurpose:
                purposeSelectedIndex >= 0 && subPurposeSelectedIndex >= 0
                    ? purposeList[purposeSelectedIndex]?.subPurposeCodeList[subPurposeSelectedIndex]
                    : undefined,
            additionalInfo: additionalInfo || FTTTransferPurpose?.additionalInfo,
            relationshipSelectedIndex,
            relationShipStatus:
                relationshipAvailable && relationshipSelectedIndex
                    ? isMalaysianSender
                        ? relationshipTransferData[relationshipSelectedIndex]?.name
                        : relationshipTransferDataNR[relationshipSelectedIndex]?.name
                    : "",
            selectedBankFeeType,
            sourceOfFunds:
                route?.params?.remittanceData?.toCurrency === "IDR"
                    ? sourceOfFundsFtt[sourceOfFundIndex]?.name
                    : "",
        };

        if (chosePurpose === true && route?.params?.from !== "FTTConfirmation") {
            updateModel({
                overseasTransfers: {
                    FTTTransferPurpose: transferDetailsObj,
                },
            });
        }
        if (route?.params?.from === "FTTConfirmation") {
            navigation.navigate(route?.params?.from, {
                ...route?.params,
                from: "",
            });
            return;
        }

        if (transferParams?.favTransferItem?.productType) {
            navigation.navigate("OverseasProductListScreen", {
                ...route?.params,
                from: "",
            });
            return;
        }

        navigation.navigate("FTTRecipientDetails", {
            ...route?.params,
            nationalityChanged: !route?.params?.nationalityChanged,
        });
    };

    function getTransactionCheckedUncheckerUI(feeState) {
        return (
            <Image
                source={
                    selectedBankFeeType === feeState ? assets.icChecked : assets.icRadioUnchecked
                }
                style={styles.icon}
                resizeMode="stretch"
            />
        );
    }

    const updateTrxFeeSHA = useCallback(() => {
        updateTrasactionFee("SHA");
    }, []);

    const updateTrxFeeOUR = useCallback(() => {
        updateTrasactionFee("OUR");
    }, []);

    function updateTrasactionFee(selectedFeeState) {
        changeTrasactionFeeState(selectedFeeState);
    }

    function onPressPurposeTransfer() {
        changeTransferPopupState((prevState) => ({ ...prevState, showPurposePopup: true }));
    }

    function onPressSubPurposeTransfer() {
        const selectedItem = purposeTransferData[purposeSelectedIndex];
        if (selectedItem?.subPurposeList) {
            const subPurposeListData = selectedItem?.subPurposeList.map((spData) => {
                return {
                    ...spData,
                    name: convertToTitleCase(spData?.name),
                };
            });
            setSubPurposeTransferData(subPurposeListData);
        }
        changeTransferPopupState((prevState) => ({
            ...prevState,
            showSubPurposePopup: true,
            subPurposeSelectedIndex: subPurposeSelectedIndex ?? 0,
        }));
    }

    function onPressRelationshipTransfer() {
        changeTransferPopupState((prevState) => ({ ...prevState, showRelationshipPopup: true }));
    }

    function onPressSourceOfFunds() {
        changeTransferPopupState((prevState) => ({ ...prevState, sourceOfFundPopup: true }));
    }

    function onHandlePurposeDone(item, index) {
        setChosePurpose(true);
        const selectedItem = purposeTransferData[purposeSelectedIndex]?.name
            ? purposeTransferData[purposeSelectedIndex]
            : purposeTransferData[0];

        if (selectedItem?.subPurposeList) {
            const subPurposeListData = selectedItem?.subPurposeList.map((spData) => {
                return {
                    ...spData,
                    name: convertToTitleCase(spData?.name),
                };
            });
            setSubPurposeTransferData(subPurposeListData);
        }
        changeTransferPopupState((prevState) => ({
            ...prevState,
            purposePlaceHolder: selectedItem?.name ?? item?.name,
            purposeSelectedIndex,
            showPurposePopup: false,
            subPurposePlaceHolder: "Please select",
            subPurposeSelectedIndex: 0,
        }));

        setRelationshipList(purposeCodeWithRelation.includes(selectedItem?.code));
        if (item?.name?.toUpperCase() === "SERVICES" && relationshipAvailable === true) {
            setRelationshipList(false);
        }
    }

    function onHandleSubPurposeDone(item, index) {
        const selectedItem = subPurposeTransferData[subPurposeSelectedIndex ?? index]?.name
            ? subPurposeTransferData[subPurposeSelectedIndex ?? index]
            : subPurposeTransferData[0];
        changeTransferPopupState((prevState) => ({
            ...prevState,
            subPurposePlaceHolder: selectedItem?.name ?? item?.name,
            subPurposeSelectedIndex,
            showSubPurposePopup: false,
            relationshipPlaceHolder: "",
        }));
        setRelationshipList(subPurposeTransferData[subPurposeSelectedIndex ?? 0]?.code === "NH");
    }

    function onHandleRelationshipDone(item, index) {
        const listData = isMalaysianSender ? relationshipTransferData : relationshipTransferDataNR;
        const selectedItem = listData[index ?? 0]?.name;
        changeTransferPopupState((prevState) => ({
            ...prevState,
            relationshipPlaceHolder: selectedItem,
            relationshipSelectedIndex: index ?? 0,
            showRelationshipPopup: false,
        }));
    }

    function onSourceOfFundDone(item, index) {
        changeTransferPopupState((prevState) => ({
            ...prevState,
            sourceOfFundPlaceHolder: item?.name,
            sourceOfFundIndex: index ?? 0,
            sourceOfFundPopup: false,
        }));
    }

    function preLoadData() {
        if (FTTTransferPurpose?.transferPurpose) {
            const purposeIndex = purposeCodeLists.findIndex((item, i) => {
                return item?.serviceName === FTTTransferPurpose?.transferPurpose?.serviceName;
            });
            const subPurposeIndex =
                purposeIndex >= 0
                    ? purposeCodeLists[purposeIndex]?.subPurposeCodeList?.findIndex((item, i) => {
                          return (
                              item?.subServiceName ===
                              FTTTransferPurpose?.transferSubPurpose?.subServiceName
                          );
                      })
                    : purposeIndex;

            const sofIndex = sourceOfFundsFtt.findIndex((item, i) => {
                return item?.name === FTTTransferPurpose?.sourceOfFunds;
            });

            console.tron.log("test 3 ", route?.params);
            return {
                purposeList: purposeCodeLists,
                subPurposeList:
                    purposeIndex >= 0 ? purposeCodeLists[purposeIndex]?.subPurposeCodeList : [],
                purposePlaceHolder: !nationalityChanged
                    ? FTTTransferPurpose?.transferPurpose?.serviceName
                    : "",
                subPurposePlaceHolder: !nationalityChanged
                    ? FTTTransferPurpose?.transferSubPurpose?.subServiceName
                    : "",
                purposeSelectedIndex: !nationalityChanged ? purposeIndex : 0,
                subPurposeSelectedIndex: !nationalityChanged ? subPurposeIndex : 0,
                relationshipPlaceHolder: !nationalityChanged
                    ? FTTTransferPurpose?.relationShipStatus
                    : "",
                relationshipSelectedIndex: !nationalityChanged
                    ? FTTTransferPurpose?.relationshipSelectedIndex
                    : 0,
                sourceOfFundIndex: FTTTransferPurpose?.sourceOfFundIndex || sofIndex,
                sourceOfFundPlaceHolder:
                    route?.params?.remittanceData?.toCurrency === "IDR"
                        ? FTTTransferPurpose?.sourceOfFunds
                        : null,
                showPurposePopup: false,
                showSubPurposePopup: false,
                showRelationshipPopup: false,
                sourceOfFundPopup: false,
                additionalInfo: FTTTransferDetails?.additionalInfo,
                selectedBankFeeType: FTTTransferPurpose?.selectedBankFeeType,
            };
        } else {
            console.tron.log("test 2 ", route?.params);
            return {
                purposeList: purposeCodeLists,
                subPurposeList: [],
                purposePlaceHolder: "",
                subPurposePlaceHolder: "",
                purposeSelectedIndex: 0,
                subPurposeSelectedIndex: 0,
                showPurposePopup: false,
                showSubPurposePopup: false,
                additionalInfo,
                showRelationshipPopup: false,
                relationshipPlaceHolder: "",
                relationshipSelectedIndex: 0,
                sourceOfFundIndex: 0,
                sourceOfFundPlaceHolder: "",
                sourceOfFundPopup: false,
            };
        }
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

    function onSourceOfFundsCancel() {
        changeTransferPopupState((prevState) => ({ ...prevState, sourceOfFundPopup: false }));
    }

    async function onContinue() {
        try {
            const { remittanceData, selectedCountry, transferParams } = route?.params;
            let transferDetailsObj = {};
            const relationShipStatusList = isMalaysianSender
                ? relationshipTransferData
                : relationshipTransferDataNR;
            if (transferParams?.remittanceData?.gour) {
                const param = {
                    trxId,
                    paymentRefNo,
                    isFromCurrMyr: remittanceData?.fromCurrency === "MYR",
                    fttCurrency: remittanceData?.toCurrency,
                    fttCountry:
                        transferParams?.countryData?.countryCode ||
                        selectedCountry?.countryCode ||
                        FTTRecipientDetails?.country?.countryCode ||
                        FTTRecipientDetails?.countryCode,
                    debitAcctCur:
                        selectedBankFeeType === "OUR" ? "MYR" : remittanceData?.toCurrency,
                    debitChgAcctCur: "MYR",
                    chargeType: transferParams?.remittanceData?.gour ? selectedBankFeeType : "SHA",
                    beneBankBic:
                        FTTRecipientBankDetails?.swiftCode?.length > 7 &&
                        FTTRecipientBankDetails?.swiftCode?.length < 10
                            ? `${FTTRecipientBankDetails?.swiftCode}${"X".repeat(
                                  11 - FTTRecipientBankDetails?.swiftCode?.length
                              )}`
                            : FTTRecipientBankDetails?.swiftCode,
                };
                const response = await requestFTTCharge(param);
                if (response?.data?.statusCode === "0" || response?.data?.statusCode === "0000") {
                    const totalAmt = parseFloat(response?.data?.totNostroAmtMyr);
                    const transactionBankFee = selectedBankFeeType === "OUR" ? totalAmt : 0;
                    const transactionBankFeeText = transferParams?.remittanceData?.gour
                        ? selectedBankFeeType === "OUR"
                            ? `RM ${numeral(transactionBankFee).format(
                                  "0,0.00"
                              )}\n I will pay (Recipient will\nreceive the full\ntransferred amount)`
                            : "Recipient will pay\n(This fee will be\ndeducted from the\ntransferred amount)"
                        : null;
                    transferDetailsObj = {
                        transferPurpose: purposeList[purposeSelectedIndex],
                        transferSubPurpose:
                            purposeList[purposeSelectedIndex]?.subPurposeCodeList[
                                subPurposeSelectedIndex
                            ],
                        relationShipStatus:
                            relationshipAvailable && relationshipSelectedIndex >= 0
                                ? relationShipStatusList[relationshipSelectedIndex]?.name
                                : null,
                        additionalInfo: additionalInfo || FTTTransferPurpose?.additionalInfo,
                        selectedBankFeeType,
                        transactionBankFeeText,
                        transactionBankFee,
                        chargeInquiryInfo: response?.data,
                        sourceOfFunds:
                            route?.params?.remittanceData?.toCurrency === "IDR"
                                ? sourceOfFundsFtt[sourceOfFundIndex]?.name
                                : null,
                        relationshipSelectedIndex,
                    };

                    updateModel({
                        overseasTransfers: {
                            FTTTransferPurpose: transferDetailsObj,
                            FTTSenderDetails: { ...FTTSenderDetails, nationalityChanged: false },
                        },
                    });
                    if (route?.params?.from === "FTTConfirmation") {
                        if (route?.params?.callBackFunction) {
                            route.params.callBackFunction(transferDetailsObj);
                        }
                        navigation.navigate(route?.params?.from, {
                            ...route?.params,
                            from: "",
                        });
                    } else {
                        navigation.navigate("FTTConfirmation", {
                            ...route?.params,
                        });
                    }
                }
            } else {
                transferDetailsObj = {
                    transferPurpose: purposeList[purposeSelectedIndex],
                    transferSubPurpose:
                        purposeList[purposeSelectedIndex]?.subPurposeCodeList[
                            subPurposeSelectedIndex
                        ],
                    relationshipSelectedIndex,
                    relationShipStatus:
                        relationshipAvailable && relationshipSelectedIndex >= 0
                            ? relationShipStatusList[relationshipSelectedIndex]?.name
                            : null,
                    additionalInfo: additionalInfo || FTTTransferPurpose?.additionalInfo,
                    transactionBankFeeText:
                        "Recipient will pay\n(This fee will be\ndeducted from the\ntransferred amount)",
                    selectedBankFeeType,
                    chargeInquiryInfo: {},
                    sourceOfFunds:
                        route?.params?.remittanceData?.toCurrency === "IDR"
                            ? sourceOfFundsFtt[sourceOfFundIndex]?.name
                            : null,
                };

                updateModel({
                    overseasTransfers: {
                        FTTTransferPurpose: transferDetailsObj,
                        FTTSenderDetails: { ...FTTSenderDetails, nationalityChanged: false },
                    },
                });
                if (route?.params?.from === "FTTConfirmation") {
                    if (route?.params?.callBackFunction) {
                        route.params.callBackFunction(transferDetailsObj);
                    }
                    navigation.navigate(route?.params?.from, {
                        ...route?.params,
                        nationalityChanged: false,
                        from: "",
                    });
                } else {
                    navigation.navigate("FTTConfirmation", {
                        ...route?.params,
                        nationalityChanged: false,
                    });
                }
            }
        } catch (e) {
            const errObj = errorCodeMap(e);
            showErrorToast({
                message:
                    errObj.code === 500
                        ? WE_FACING_SOME_ISSUE
                        : errObj?.message ?? COMMON_ERROR_MSG,
            });
        }
    }

    function handleInfoPopup({ infoMessage, infoTitle }) {
        changeInfoDetail({ isVisible: true, infoMessage, infoTitle });
    }

    function onClosePopup() {
        changeInfoDetail({ isVisible: false });
    }

    function onChangeFieldValue(fieldName, fieldValue) {
        changeTransferPopupState((prevState) => ({ ...prevState, [fieldName]: fieldValue }));
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

    const onChangeAdditionalInfo = useCallback((value) => {
        onChangeFieldValue("additionalInfo", value);
    }, []);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={16}
                paddingHorizontal={24}
                useSafeArea
                header={getHeaderUI()}
                scrollable
                contentContainerStyle={styles.contentContainer}
            >
                <KeyboardAwareScrollView
                    enableOnAndroid={Platform.OS === "android"}
                    extraScrollHeight={95}
                >
                    <Typo
                        text="Foreign Telegraphic Transfer"
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
                        style={styles.inputContainer}
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

                    {!!purposePlaceHolder &&
                        isMalaysianSender &&
                        (subPurposeTransferData?.length > 0 ||
                            subPurposePlaceHolder ||
                            FTTTransferPurpose?.transferSubPurpose?.subServiceName !== "") && (
                            <View>
                                <Typo
                                    style={styles.inputContainer}
                                    textAlign="left"
                                    text="Sub purpose"
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={18}
                                />
                                <Dropdown
                                    title={
                                        convertToTitleCase(subPurposePlaceHolder) || "Please select"
                                    }
                                    align="left"
                                    borderWidth={0.5}
                                    onPress={onPressSubPurposeTransfer}
                                />
                            </View>
                        )}

                    {route?.params?.remittanceData?.toCurrency === "IDR" && (
                        <>
                            <Typo
                                style={styles.inputContainer}
                                textAlign="left"
                                text="Source of fund"
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={18}
                            />
                            <Dropdown
                                title={sourceOfFundPlaceHolder || DROPDOWN_DEFAULT_TEXT}
                                align="left"
                                borderWidth={0.5}
                                onPress={onPressSourceOfFunds}
                            />
                        </>
                    )}
                    {relationshipAvailable && subPurposePlaceHolder !== "" && (
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
                    <>
                        <Typo
                            style={styles.agentFeeText}
                            textAlign="left"
                            text="Agent/Beneficiary bank fee"
                            fontSize={14}
                            fontWeight="400"
                            lineHeight={18}
                            hasInfo
                            infoTitle="Agent/Beneficiary bank fee"
                            infoMessage={
                                "You may pay the agent/beneficiary bank fee or let your recipient pay it, and the fee" +
                                " will be deducted from the transfer amount. The fee amount will be displayed on your " +
                                "transfer confirmation page later"
                            }
                            onPressInfoBtn={handleInfoPopup}
                        />
                        {route?.params?.transferParams?.remittanceData?.gour && (
                            <TouchableOpacity style={styles.radioBtn} onPress={updateTrxFeeOUR}>
                                {getTransactionCheckedUncheckerUI("OUR")}
                                <Typo
                                    style={styles.desc}
                                    text={`I will pay\n(Recipient will receive the full\ntransferred amount)`}
                                    textAlign="left"
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.radioBtn} onPress={updateTrxFeeSHA}>
                            {getTransactionCheckedUncheckerUI("SHA")}
                            <Typo
                                style={styles.desc}
                                text={`Recipient will pay\n(This fee will be deducted from the\ntransferred amount)`}
                                textAlign="left"
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                            />
                        </TouchableOpacity>
                    </>
                    <TextInputWithLengthCheck
                        label="Additional details (Optional)"
                        placeholder="Enter detail"
                        value={additionalInfo ?? FTTTransferPurpose?.additionalInfo}
                        maxLength={35}
                        onChangeText={onChangeAdditionalInfo}
                        containerStyle={styles.addInfoContainer}
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
                list={purposeTransferData}
                selectedIndex={purposeSelectedIndex}
                onRightButtonPress={onHandlePurposeDone}
                onLeftButtonPress={onHandlePurposeCancel}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
                onValueChange={onChangePurpose}
            />

            <ScrollPickerView
                showMenu={showSubPurposePopup}
                list={subPurposeTransferData}
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
            <ScrollPickerView
                showMenu={sourceOfFundPopup}
                list={sourceOfFundsFtt}
                selectedIndex={sourceOfFundIndex}
                onRightButtonPress={onSourceOfFundDone}
                onLeftButtonPress={onSourceOfFundsCancel}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />

            {isVisible && (
                <Popup
                    title={infoTitle}
                    description={infoMessage}
                    visible={isVisible}
                    onClose={onClosePopup}
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    addInfoContainer: { marginBottom: 30 },
    agentFeeText: { marginTop: 24 },
    contentContainer: {
        flex: 1,
        paddingBottom: 25,
    },
    desc: { flexWrap: "wrap", marginLeft: 8 },
    icon: {
        height: 20,
        width: 20,
    },
    inputContainer: { marginBottom: 8, marginTop: 24 },
    pageTitle: { marginTop: 4 },
    radioBtn: { flexDirection: "row", marginTop: 24 },
});

FTTTransferDetails.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
};
export default withModelContext(FTTTransferDetails);
