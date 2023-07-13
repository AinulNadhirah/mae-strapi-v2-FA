import moment from "moment";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { Keyboard, ScrollView, StyleSheet } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import DatePicker from "@components/Pickers/DatePicker";
import Popup from "@components/Popup";
import TextInputWithLengthCheck from "@components/TextInputWithLengthCheck";
import Typo from "@components/TextWithInfo";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { BLACK, DARK_GREY, DISABLED, DISABLED_TEXT, MEDIUM_GREY, YELLOW } from "@constants/colors";
import {
    OVERSEAS_WU_SENDER_EMP_LVL_LIST,
    OVERSEAS_WU_SENDER_ID_TYPE_LIST,
    OVERSEAS_WU_SENDER_OCCUPATION_LIST,
    OVERSEAS_WU_SENDER_SOURCE_OF_FUNDS_LIST,
    OVERSEAS_WU__SENDER_RELATION_LIST,
    MONTH_LITERALS,
    NON_HIERARCHICAL_JOBS
} from "@constants/data/Overseas";
import {
    CANCEL,
    CONTINUE,
    DONE,
    WESTERN_UNION,
    WU_ENTER_VALID_EXPIRY,
    WU_PASSPORT_ID,
    DD_MMM_YYYY,
    DROPDOWN_DEFAULT_TEXT
} from "@constants/strings";

import { convertToTitleCase, getCountryDataByName } from "@utils/dataModel/utilityRemittance";

function WUSenderDetailsStepThree({ navigation, route, getModel, updateModel }) {
    const { WUSenderDetailsStepOne, WUSenderDetailsStepTwo } = route?.params || {};
    const [fieldsState, changeFieldState] = useState(preLoadData());
    const { transferParams } = route?.params || {};
    const [{ isVisible, infoTitle, infoMessage, primaryAction }, changeInfoDetail] = useState({
        isVisible: false,
        infoTitle: "",
        infoMessage: "",
        primaryAction: {},
    });

    const {
        popUpList = [],
        selectedPopUpType,
        popuUpSelectedItemIndex,
        showPopup = false,
        selectedIDTypeIndex,
        selectedOccupationIndex,
        selectedEmplPosLevelIndex,
        selectedRelationToRecipIndex,
        selectedSourceOfFundsIndex,
        // Functionality related fields
        selectedIDType,
        idNumber,
        idIssueCountry,
        dateOfBirth,
        selectedOccupation,
        selectedEmplPosLevel,
        selectedRelationToRecip,
        countryOfBirth,
        countryOfCitizenship,
        selectedSourceOfFunds,
        showDatePicker,
        dateType,
        displayDateOfBirth,
        idIssueDate,
        idExpiryDate,
    } = fieldsState;
    const isHavingNric = selectedIDType?.value === "NIC";
    const isCTADisabled =
        !selectedIDType?.name ||
        !idNumber ||
        !idIssueCountry?.countryName ||
        !dateOfBirth ||
        (!selectedOccupation?.name && selectedIDType?.value !== "PIC") ||
        (!selectedEmplPosLevel?.name &&
            !NON_HIERARCHICAL_JOBS.includes(selectedOccupation?.name)) ||
        !selectedRelationToRecip?.name ||
        !countryOfBirth?.countryName ||
        !countryOfCitizenship?.countryName ||
        !selectedSourceOfFunds?.name ||
        (!isHavingNric && !(idIssueDate || idExpiryDate));
    const dateRangeEndDate =
        dateType === "IED" ? moment(moment().toDate()).add(10, "y") : moment().toDate();
    let selectedCountryType = "";

    useEffect(() => {
        RemittanceAnalytics.WUSenderDetailsLoaded();
    }, []);

    function preLoadData() {
        const {
            selectedIDType,
            idNumber,
            idIssueCountry,
            idIssueDate,
            idExpiryDate,
            dateOfBirth,
            displayDateOfBirth,
            selectedOccupation,
            selectedEmplPosLevel,
            selectedRelationToRecip,
            countryOfBirth,
            countryOfCitizenship,
            selectedSourceOfFunds,
        } = getModel("overseasTransfers")?.WUSenderDetailsStepThree || {};
        const { icNumber } = getModel("user");

        return {
            selectedIDType:
                selectedIDType?.wuIdVal === "A" || icNumber?.length === 12
                    ? {
                          name: "National ID Card",
                          value: "NIC",
                          wuIdVal: "A",
                      }
                    : {
                          name: "Passport",
                          value: "PSPT",
                      },
            idNumber: idNumber || icNumber,
            idIssueCountry:
                idIssueCountry?.countryName?.toUpperCase() === "MALAYSIA" || icNumber?.length === 12
                    ? {
                          countryFlag: "malaysia_round_icon_64.png",
                          countryCode: "MY",
                          countryName: "Malaysia",
                          key: 0,
                      }
                    : idIssueCountry || {},
            idIssueDate,
            idExpiryDate,
            dateOfBirth:
                dateOfBirth ||
                moment(WUSenderDetailsStepOne?.senderDOB, ["DDMMYYYY", DD_MMM_YYYY]).format(
                    DD_MMM_YYYY
                ),
            displayDateOfBirth,
            selectedOccupation: selectedOccupation || {},
            selectedEmplPosLevel: selectedEmplPosLevel || "",
            selectedRelationToRecip: selectedRelationToRecip || {},
            countryOfBirth:
                WUSenderDetailsStepOne?.citizenship === "M"
                    ? { countryName: "Malaysia", countryCode: "MY" }
                    : countryOfBirth || getCountryDataByName(WUSenderDetailsStepOne?.nationality),
            countryOfCitizenship:
                WUSenderDetailsStepOne?.citizenship === "M"
                    ? { countryName: "Malaysia", countryCode: "MY" }
                    : countryOfCitizenship ||
                      getCountryDataByName(WUSenderDetailsStepOne?.nationality),
            selectedSourceOfFunds: selectedSourceOfFunds || {},
            showDatePicker: false,
            hideDatePicker: true,
            dateType: "DOB",
        };
    }

    function handleInfoPopup({ infoMessage, infoTitle }) {
        changeInfoDetail({ isVisible: true, infoMessage, infoTitle });
    }
    function onClosePopup() {
        changeInfoDetail({ isVisible: false });
    }

    function onChangeFieldValue(fieldName, fieldValue) {
        changeFieldState((prevState) => ({ ...prevState, [fieldName]: fieldValue }));
    }

    const onPressDropdown = useCallback(
        (type) => {
            switch (type) {
                case "ID":
                    changeFieldState((prevState) => ({
                        ...prevState,
                        showPopup: true,
                        popUpList: OVERSEAS_WU_SENDER_ID_TYPE_LIST,
                        popuUpSelectedItemIndex: selectedIDTypeIndex,
                        idNumber,
                        selectedPopUpType: type,
                        showDatePicker: false,
                    }));
                    break;
                case "OCC":
                    changeFieldState((prevState) => ({
                        ...prevState,
                        showPopup: true,
                        popUpList: OVERSEAS_WU_SENDER_OCCUPATION_LIST,
                        popuUpSelectedItemIndex: selectedOccupationIndex,
                        selectedPopUpType: type,
                        showDatePicker: false,
                    }));
                    break;
                case "EPL":
                    changeFieldState((prevState) => ({
                        ...prevState,
                        showPopup: true,
                        popUpList: OVERSEAS_WU_SENDER_EMP_LVL_LIST,
                        popuUpSelectedItemIndex: selectedEmplPosLevelIndex,
                        selectedPopUpType: type,
                        showDatePicker: false,
                    }));
                    break;
                case "RTR":
                    changeFieldState((prevState) => ({
                        ...prevState,
                        showPopup: true,
                        popUpList: OVERSEAS_WU__SENDER_RELATION_LIST,
                        popuUpSelectedItemIndex: selectedRelationToRecipIndex,
                        selectedPopUpType: type,
                        showDatePicker: false,
                    }));
                    break;
                case "SOF":
                    changeFieldState((prevState) => ({
                        ...prevState,
                        showPopup: true,
                        popUpList: OVERSEAS_WU_SENDER_SOURCE_OF_FUNDS_LIST,
                        popuUpSelectedItemIndex: selectedSourceOfFundsIndex,
                        selectedPopUpType: type,
                        showDatePicker: false,
                    }));
                    break;
            }
        },
        [
            idNumber,
            selectedEmplPosLevelIndex,
            selectedIDTypeIndex,
            selectedOccupationIndex,
            selectedRelationToRecipIndex,
            selectedSourceOfFundsIndex
        ]
    );

    const onPressDropdownID = useCallback(() => {
        onPressDropdown("ID");
    }, [onPressDropdown]);
    const onPressDropdownOCC = useCallback(() => {
        onPressDropdown("OCC");
    }, [onPressDropdown]);
    const onPressDropdownEPL = useCallback(() => {
        onPressDropdown("EPL");
    }, [onPressDropdown]);
    const onPressDropdownRTR = useCallback(() => {
        onPressDropdown("RTR");
    }, [onPressDropdown]);
    const onPressDropdownSOF = useCallback(() => {
        onPressDropdown("SOF");
    }, [onPressDropdown]);

    function onHandlePopUpDone(item, index) {
        switch (selectedPopUpType) {
            case "ID":
                changeFieldState((prevState) => ({
                    ...prevState,
                    selectedIDType: item,
                    selectedIDTypeIndex: index,
                    showPopup: false,
                    popUpList: [],
                    selectedPopUpType: "",
                    popuUpSelectedItemIndex: index,
                }));
                break;
            case "OCC":
                changeFieldState((prevState) => ({
                    ...prevState,
                    selectedOccupation: item,
                    selectedOccupationIndex: index,
                    showPopup: false,
                    popUpList: [],
                    selectedPopUpType: "",
                    popuUpSelectedItemIndex: 0,
                    selectedEmplPosLevel: !NON_HIERARCHICAL_JOBS.includes(item?.name)
                        ? ""
                        : selectedEmplPosLevel,
                }));
                break;
            case "EPL":
                changeFieldState((prevState) => ({
                    ...prevState,
                    selectedEmplPosLevel: item,
                    selectedEmplPosLevelIndex: index,
                    showPopup: false,
                    popUpList: [],
                    selectedPopUpType: "",
                    popuUpSelectedItemIndex: 0,
                }));
                break;
            case "RTR":
                changeFieldState((prevState) => ({
                    ...prevState,
                    selectedRelationToRecip: item,
                    selectedRelationToRecipIndex: index,
                    showPopup: false,
                    popUpList: [],
                    selectedPopUpType: "",
                    popuUpSelectedItemIndex: 0,
                }));
                break;
            case "SOF":
                changeFieldState((prevState) => ({
                    ...prevState,
                    selectedSourceOfFunds: item,
                    selectedSourceOfFundsIndex: index,
                    showPopup: false,
                    popUpList: [],
                    selectedPopUpType: "",
                    popuUpSelectedItemIndex: 0,
                }));
                break;
        }
    }

    function onHandlePopUpCancel() {
        changeFieldState((prevState) => ({
            ...prevState,
            showPopup: false,
            popUpList: [],
            selectedPopUpType: "",
        }));
    }

    const onPressCountryDropdown = useCallback((countryType) => {
        selectedCountryType = countryType;
        navigation.push("OverseasCountryListScreen", {
            ...route?.params,
            callBackFunction: onCountrySelectionDone,
            from: "WUSenderDetailsStepThree",
        });
    }, []);

    const onPressIDCDropdown = useCallback(() => {
        onPressCountryDropdown("IDC");
    }, [onPressCountryDropdown]);

    const onPressCOBDropdown = useCallback(() => {
        onPressCountryDropdown("COB");
    }, [onPressCountryDropdown]);

    const onPressCOCDropdown = useCallback(() => {
        onPressCountryDropdown("COC");
    }, [onPressCountryDropdown]);

    function onCountrySelectionDone(countryItem) {
        switch (selectedCountryType) {
            case "IDC":
                changeFieldState((prevState) => ({
                    ...prevState,
                    selectedCountryType: "",
                    idIssueCountry: countryItem,
                }));
                break;
            case "COB":
                changeFieldState((prevState) => ({
                    ...prevState,
                    selectedCountryType: "",
                    countryOfBirth: countryItem,
                }));
                break;
            case "COC":
                changeFieldState((prevState) => ({
                    ...prevState,
                    selectedCountryType: "",
                    countryOfCitizenship: countryItem,
                }));
                break;
        }
    }

    const onBackButtonPress = useCallback(() => {
        const senderDetailsStepThreeObj = {
            selectedIDType,
            idNumber,
            idIssueCountry,
            dateOfBirth,
            selectedOccupation,
            selectedEmplPosLevel,
            selectedRelationToRecip,
            countryOfBirth,
            countryOfCitizenship,
            selectedSourceOfFunds,
            idIssueDate: !isHavingNric ? idIssueDate : "",
            idExpiryDate: !isHavingNric ? idExpiryDate : "",
        };
        updateModel({
            overseasTransfers: {
                WUSenderDetailsStepOne,
                WUSenderDetailsStepTwo,
                WUSenderDetailsStepThree: senderDetailsStepThreeObj,
            },
        });
        navigation.navigate(
            route?.params?.favorite ? "OverseasProductListScreen" : "WUSenderDetailsStepTwo",
            {
                ...route?.params,
            }
        );
    }, [
        WUSenderDetailsStepOne,
        WUSenderDetailsStepTwo,
        countryOfBirth,
        countryOfCitizenship,
        dateOfBirth,
        idExpiryDate,
        idIssueCountry,
        idIssueDate,
        idNumber,
        isHavingNric,
        navigation,
        route?.params,
        selectedEmplPosLevel,
        selectedIDType,
        selectedOccupation,
        selectedRelationToRecip,
        selectedSourceOfFunds,
        updateModel
    ]);

    function onHideDatePicker() {
        changeFieldState((prevState) => ({
            ...prevState,
            showDatePicker: false,
        }));
    }
    function getFormattedDate(date) {
        // Format the date to be shown on form
        const selectedDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        const selectedMonth = MONTH_LITERALS[date.getMonth()];
        const selectedYear = date.getFullYear();
        return `${selectedDate} ${selectedMonth} ${selectedYear}`;
    }

    function getDate(date) {
        if (dateType === "DOB") {
            return {
                dateOfBirth: date ? moment(date).format(DD_MMM_YYYY) : "",
                displayDateOfBirth: date ? getFormattedDate(date) : "",
            };
        }

        if (dateType === "IID") {
            return {
                idIssueDate: date ? moment(date).format(DD_MMM_YYYY) : "",
            };
        }

        return {
            idExpiryDate: date ? moment(date).format(DD_MMM_YYYY) : "",
        };
    }
    function onDatePickerDone(date) {
        const data = getDate(date);

        changeFieldState((prevState) => ({
            ...prevState,
            ...data,
            dateType: "",
            showDatePicker: false,
        }));
    }
    async function onContinue() {
        if (!isHavingNric && moment(idExpiryDate, ["MM DD YYYY"]).isBefore(moment(new Date()))) {
            showErrorToast({ message: WU_ENTER_VALID_EXPIRY });
            return;
        }
        const senderDetailsStepThreeObj = {
            selectedIDType,
            idNumber,
            idIssueCountry,
            dateOfBirth,
            selectedOccupation,
            selectedEmplPosLevel,
            selectedRelationToRecip,
            countryOfBirth,
            countryOfCitizenship,
            selectedSourceOfFunds,
            idIssueDate: !isHavingNric ? idIssueDate : "",
            idExpiryDate: !isHavingNric ? idExpiryDate : "",
        };
        updateModel({
            overseasTransfers: {
                WUSenderDetailsStepOne,
                WUSenderDetailsStepTwo,
                WUSenderDetailsStepThree: senderDetailsStepThreeObj,
            },
        });

        if (route?.params?.fromWUConfirmation) {
            if (route?.params?.callBackFunction) {
                route.params.callBackFunction(
                    WUSenderDetailsStepOne,
                    WUSenderDetailsStepTwo,
                    senderDetailsStepThreeObj
                );
            }
            navigation.navigate("WUConfirmation", {
                ...route?.params,
            });
        } else if (transferParams?.favourite) {
            navigation.navigate("WUTransferDetails", {
                ...route?.params,
            });
        } else {
            navigation.navigate("WURecipientDetails", {
                ...route?.params,
                from: "WUSenderDetailsStepThree",
            });
        }
    }

    function getHeaderUI() {
        return (
            <HeaderLayout
                headerLeftElement={<HeaderBackButton onPress={onBackButtonPress} />}
                headerCenterElement={
                    <Typo
                        color={DARK_GREY}
                        text="Step 3 of 5"
                        fontWeight="600"
                        fontSize={12}
                        lineHeight={18}
                    />
                }
            />
        );
    }

    function DatePickerInput({ dateType }) {
        const label = {
            DOB: "Date of birth",
            IID: "ID issued date",
            IED: "ID expiry date",
        };
        const value = {
            DOB: displayDateOfBirth,
            IID: idIssueDate,
            IED: idExpiryDate,
        };

        const preloadDOB = dateType === "DOB" ? dateOfBirth : "";
        const onFieldPress = useCallback(() => {
            Keyboard.dismiss();
            onChangeFieldValue("showPopup", false);
            if (dateType !== "DOB") {
                onChangeFieldValue("dateType", dateType);
                onChangeFieldValue("showDatePicker", true);
            }
        }, [dateType]);

        const onFocus = useCallback(() => {
            onChangeFieldValue("showPopup", false);
            Keyboard.dismiss();
        }, []);
        return (
            <TextInputWithLengthCheck
                onFieldPress={onFieldPress}
                onFocus={onFocus}
                label={label[dateType]}
                name="dateOfBirth"
                value={value[dateType] ?? preloadDOB}
                editable={false}
                placeholder={
                    dateType === "IID"
                        ? `e.g. ${moment().subtract(2, "years").format(DD_MMM_YYYY)}`
                        : `e.g. ${moment().add(2, "years").format(DD_MMM_YYYY)}`
                }
                prefilledPlaceHolder
            />
        );
    }

    const onChangerIDNo = useCallback((value) => {
        onChangeFieldValue("idNumber", value.replace(/[^0-9A-Za-z]/g, ""));
    }, []);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={16}
                paddingHorizontal={0}
                useSafeArea
                header={getHeaderUI()}
            >
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Typo
                        text={WESTERN_UNION}
                        textAlign="left"
                        fontSize={14}
                        lineHeight={18}
                        fontWeight="400"
                    />

                    <Typo
                        style={styles.pageTitle}
                        textAlign="left"
                        text="Please fill in your details"
                        fontWeight="600"
                        fontSize={16}
                        lineHeight={20}
                    />

                    <Typo
                        style={styles.popUpTitle}
                        textAlign="left"
                        text="ID Type"
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                    />
                    <Dropdown
                        title={selectedIDType?.name || DROPDOWN_DEFAULT_TEXT}
                        align="left"
                        borderWidth={0.5}
                        onPress={onPressDropdownID}
                    />

                    <TextInputWithLengthCheck
                        label="ID number"
                        hasInfo={selectedIDType?.value === "PSPT"}
                        infoTitle="ID number"
                        infoMessage={WU_PASSPORT_ID(
                            !selectedIDType?.name
                                ? "national ID/passport"
                                : selectedIDType?.name?.toLowerCase()
                        )}
                        onPressInfoBtn={handleInfoPopup}
                        placeholder="e.g. 910102 03 5678"
                        value={idNumber}
                        maxLength={14}
                        onChangeText={onChangerIDNo}
                    />

                    <Typo
                        style={styles.popUpTitle}
                        textAlign="left"
                        text="ID issuing country"
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                    />
                    <Dropdown
                        title={idIssueCountry?.countryName || DROPDOWN_DEFAULT_TEXT}
                        align="left"
                        borderWidth={0.5}
                        onPress={onPressIDCDropdown}
                    />
                    {(selectedIDType?.value === "PSPT" || selectedIDType?.value === "PIC") && (
                        <>
                            <DatePickerInput dateType="IID" />

                            <DatePickerInput dateType="IED" />
                        </>
                    )}

                    <DatePickerInput dateType="DOB" />
                    <Typo
                        style={styles.popUpTitle}
                        textAlign="left"
                        text="Occupation"
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                    />

                    <Dropdown
                        title={selectedOccupation?.name || DROPDOWN_DEFAULT_TEXT}
                        align="left"
                        borderWidth={0.5}
                        onPress={onPressDropdownOCC}
                    />
                    {!NON_HIERARCHICAL_JOBS.includes(selectedOccupation?.name) && (
                        <>
                            <Typo
                                style={styles.popUpTitle}
                                textAlign="left"
                                text="Employment Position Level"
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={18}
                            />

                            <Dropdown
                                title={selectedEmplPosLevel?.name || DROPDOWN_DEFAULT_TEXT}
                                align="left"
                                borderWidth={0.5}
                                onPress={onPressDropdownEPL}
                            />
                        </>
                    )}

                    <Typo
                        style={styles.popUpTitle}
                        textAlign="left"
                        text="Relationship to beneficiary"
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                    />
                    <Dropdown
                        title={selectedRelationToRecip?.name || DROPDOWN_DEFAULT_TEXT}
                        align="left"
                        borderWidth={0.5}
                        onPress={onPressDropdownRTR}
                    />

                    <Typo
                        style={styles.popUpTitle}
                        textAlign="left"
                        text="Country of birth"
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                    />
                    <Dropdown
                        title={
                            convertToTitleCase(countryOfBirth?.countryName) || DROPDOWN_DEFAULT_TEXT
                        }
                        align="left"
                        borderWidth={0.5}
                        onPress={onPressCOBDropdown}
                    />

                    <Typo
                        style={styles.popUpTitle}
                        textAlign="left"
                        text="Country of citizenship"
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                    />
                    <Dropdown
                        title={
                            convertToTitleCase(countryOfCitizenship?.countryName) ||
                            DROPDOWN_DEFAULT_TEXT
                        }
                        align="left"
                        borderWidth={0.5}
                        onPress={onPressCOCDropdown}
                    />

                    <Typo
                        style={styles.popUpTitle}
                        textAlign="left"
                        text="Source of funds"
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                    />
                    <Dropdown
                        title={selectedSourceOfFunds?.name || DROPDOWN_DEFAULT_TEXT}
                        align="left"
                        borderWidth={0.5}
                        onPress={onPressDropdownSOF}
                    />
                </ScrollView>
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
                        onPress={onContinue}
                    />
                </FixedActionContainer>
            </ScreenLayout>
            {showPopup ? (
                <ScrollPickerView
                    showMenu={showPopup}
                    list={popUpList}
                    selectedIndex={popuUpSelectedItemIndex}
                    onRightButtonPress={onHandlePopUpDone}
                    onLeftButtonPress={onHandlePopUpCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            ) : null}

            <DatePicker
                showDatePicker={showDatePicker}
                onCancelButtonPressed={onHideDatePicker}
                onDoneButtonPressed={onDatePickerDone}
                dateRangeEndDate={dateRangeEndDate}
                defaultSelectedDate={dateType === "DOB" ? dateOfBirth : moment().toDate()}
            />
            {isVisible && (
                <Popup
                    title={infoTitle}
                    description={infoMessage}
                    visible={isVisible}
                    onClose={onClosePopup}
                    primaryAction={primaryAction}
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        paddingBottom: 25,
        paddingHorizontal: 24,
    },
    pageTitle: { marginTop: 4 },
    popUpTitle: { marginBottom: 8, marginTop: 24 },
});

WUSenderDetailsStepThree.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    updateModel: PropTypes.func,
    getModel: PropTypes.func,
};

export default withModelContext(WUSenderDetailsStepThree);
