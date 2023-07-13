import moment from "moment";
import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    Keyboard,
    Platform,
    ScrollView,
    KeyboardAvoidingView,
    TouchableOpacity,
    Image,
} from "react-native";

import {
    AUTOBILLING_CONFIRMATION,
    AUTOBILLING_DASHBOARD,
    AUTOBILLING_STACK,
    ONE_TAP_AUTH_MODULE,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import DatePicker from "@components/Pickers/DatePicker";
import Popup from "@components/Popup";
import Typography from "@components/Text";
import TextInput from "@components/TextInput";
import { hideToast, showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { RTPanalytics } from "@services/analytics/rtpAnalyticsSSL";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK, DARK_GREY } from "@constants/colors";
import { frequencyList } from "@constants/data/DuitNowRPP";
import {
    CONTINUE,
    FREQUENCY,
    LIMIT_PER_TRANSACTION,
    SETUP_AUTOBILLING_VIA,
    AB_FREQUENCY_DETAILS,
    AB_LIMIT_DETAILS,
    FILL_IN_AB_DETAILS,
    ACTIVATE,
    STEP2OF2,
    VALID_AMOUNT_ERROR,
    VALID_AMOUNT_DIGIT_PLACES_ERROR,
    PLEASE_SELECT,
    START_DATE,
    END_DATE,
    START_DATE_PLACEHOLDER,
    END_DATE_PLACEHOLEDER,
    SELECT_VALID_END_DATE,
} from "@constants/strings";

import { getDateFormated } from "@utils/dataModel";
import { checks2UFlow } from "@utils/dataModel/utility";

import Assets from "@assets";

function ABAutoDebitDetails({ navigation, route, getModel }) {
    const [frequencyView, setFrequencyView] = useState(false);
    const [startDatePicker, setStartDatePicker] = useState(false);
    const [endDatePicker, setEndDatePicker] = useState(false);
    const [showFrequencyInfo, setShowFrequencyInfo] = useState(false);
    const [textInputValue, setTextInputValue] = useState("");
    const [startDate, setStartDate] = useState(moment().add(1, "days").toDate());
    const [endDate, setEndDate] = useState(moment().add(30, "days").toDate());
    const [displayStartDate, setDisplayStartDate] = useState("");
    const [displayEndDate, setDisplayEndDate] = useState("");
    const [infoTitle, setInfoTitle] = useState("");
    const [infoMessage, setInfoMessage] = useState("");
    //Dropdown Selection options
    const [selectedFrequency, setSelectedFrequency] = useState({
        code: "04",
        name: "Monthly",
        index: 2,
    });
    const [amtInputErrorMessage, setAmtInputErrorMessage] = useState("");
    const [isAmtValidate, setIsAmtValidate] = useState(true);
    const [isAmtTouched, setIsAmtTouched] = useState(false);
    const [isSubmitDisble, setIsSubmitDisble] = useState(null);
    const [flow, setFlow] = useState("");
    const [secure2uValidateData, setSecure2uValidateData] = useState(null);

    useEffect(() => {
        RTPanalytics.screenLoadABDetails();
        updateState();
    }, []);
    useEffect(() => {
        isFieldsValid();
    }, [startDate, endDate, textInputValue]);

    async function updateState() {
        const transferParams = route?.params?.transferParams;
        const sDate = transferParams?.consentStartDate ?? moment().add(1, "days").toDate();
        const { flow, secure2uValidateData } = await checks2UFlow(70, getModel);

        setStartDate(sDate);
        setEndDate(transferParams?.consentExpiryDate ?? moment(sDate).add(30, "days").toDate());
        setTextInputValue(
            transferParams?.consentMaxLimit ?? transferParams?.limitAmount
                ? Numeral(transferParams?.limitAmount).format("0,0.00")
                : ""
        );
        setDisplayStartDate(
            transferParams?.consentStartDate
                ? getDateFormated(transferParams?.consentStartDate)
                : null
        );
        setDisplayEndDate(
            transferParams?.consentExpiryDate
                ? getDateFormated(transferParams?.consentExpiryDate)
                : null
        );
        setFlow(flow);
        setSecure2uValidateData(secure2uValidateData);
        isFieldsValid(true);
    }

    /***
     * _onBackPress
     * On Screen Back press handle
     */
    function onBackPress() {
        hideToast();
        navigation.goBack();
    }

    /***
     * _onFrequencyClick
     * On Bank dropdown click event open the pop up
     */
    function onFrequencyClick() {
        Keyboard.dismiss();
        setFrequencyView(true);
    }

    /**
     *_onFrequencyRightButtonModePress
     * On Frequency on click handle right button click event
     */
    function onFrequencyRightButtonModePress(val) {
        setSelectedFrequency(val);
        setFrequencyView(false);
    }

    /**
     *_onFrequencyLeftButtonModePress
     * On Frequency on click handle left button click event
     */
    function onFrequencyLeftButtonModePress() {
        setFrequencyView(false);
    }

    function showStartDatePicker() {
        setStartDatePicker(true);
    }

    function showEndDatePicker() {
        setEndDatePicker(true);
    }

    function hideStartDatePicker() {
        setStartDatePicker(false);
    }

    function hideEndDatePicker() {
        setEndDatePicker(false);
    }

    function selectedStartDay(day) {
        try {
            setDisplayStartDate(getDateFormated(day));
            setStartDate(day);
            isFieldsValid();
        } catch (e) {
            console.log("catch ", e);
        } finally {
            hideStartDatePicker();
        }
    }

    function selectedEndDay(day) {
        if (day && startDate) {
            const diffInMonth = moment(day).diff(startDate, "month");
            if (diffInMonth > 6) {
                showErrorToast({
                    message: SELECT_VALID_END_DATE,
                });
            } else {
                try {
                    setDisplayEndDate(getDateFormated(day));
                    setEndDate(day);
                    isFieldsValid();
                } catch (e) {
                    console.log("catch ", e);
                } finally {
                    hideEndDatePicker();
                }
            }
        }
    }

    function isFieldsValid(isInitial) {
        const regex = /^(?![0,]*(\.0+)?$)([,\d]*(?:\.[0-9]{0,4})?)$/gi;
        const isValid = regex.test(textInputValue.replace(/,/g, ""));
        const minAmount = parseFloat(textInputValue) > 0.009;
        const isExceeded = parseFloat(textInputValue) > 49999.99;
        let amtInputErrorMessage = "";
        if (!isValid || !displayStartDate || !displayEndDate || isExceeded) {
            if (isAmtTouched) {
                amtInputErrorMessage =
                    !textInputValue || !minAmount || isExceeded
                        ? VALID_AMOUNT_ERROR
                        : textInputValue && !isValid
                        ? VALID_AMOUNT_DIGIT_PLACES_ERROR
                        : "";
            }
            setAmtInputErrorMessage(amtInputErrorMessage);
            setIsAmtValidate(!(isAmtTouched && (!isValid || isExceeded)));
            setIsSubmitDisble(true);

            return false;
        }
        setAmtInputErrorMessage("");
        setIsAmtValidate(true);
        setIsSubmitDisble(false);

        return true;
    }

    async function OnSubmit() {
        const isFieldValid = isFieldsValid();

        if (isFieldValid) {
            const params = {
                ...route.params,
                transferParams: {
                    ...route.params.transferParams,
                    consentStartDate: startDate,
                    consentExpiryDate: endDate,
                    consentFrequency: selectedFrequency?.code,
                    consentFrequencyText: selectedFrequency?.name,
                    consentMaxLimit: textInputValue,
                    consentMaxLimitFormatted: Numeral(textInputValue).format("0,0.00"),
                },
                secure2uValidateData,
                flow,
            };

            if (flow === "S2UReg") {
                navigation.navigate(ONE_TAP_AUTH_MODULE, {
                    screen: ACTIVATE,
                    params: {
                        flowParams: {
                            success: {
                                stack: AUTOBILLING_STACK,
                                screen: AUTOBILLING_CONFIRMATION,
                            },
                            fail: {
                                stack: AUTOBILLING_STACK,
                                screen: AUTOBILLING_DASHBOARD,
                            },

                            params: { ...params, isFromS2uReg: true },
                        },
                    },
                });
            } else {
                navigation.navigate(AUTOBILLING_STACK, {
                    screen: AUTOBILLING_CONFIRMATION,
                    params,
                });
            }
        }
    }

    function onLimitChange(value) {
        setTextInputValue(value);
        setIsAmtTouched(true);

        isFieldsValid();
    }

    function handleInfoPress(type) {
        const infoTitle = type === FREQUENCY ? "Frequency" : "Limit per transaction";
        const infoMessage = type === FREQUENCY ? AB_FREQUENCY_DETAILS : AB_LIMIT_DETAILS;

        setInfoTitle(infoTitle);
        setInfoMessage(infoMessage);
        setShowFrequencyInfo(!showFrequencyInfo);
    }

    const minEndDate = startDate
        ? moment(startDate).add(1, "days").toDate()
        : moment().add(30, "days").toDate();

    return (
        <ScreenContainer
            backgroundType="color"
            showErrorModal={false}
            showLoaderModal={false}
            showOverlay={false}
            backgroundColor={MEDIUM_GREY}
        >
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerCenterElement={
                            <Typography
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text={STEP2OF2}
                                color={DARK_GREY}
                            />
                        }
                        headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
                    />
                }
                useSafeArea
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : ""}
                    style={styles.KeyboardAvoidingViewStyle}
                    keyboardVerticalOffset={150}
                    enabled
                >
                    <ScrollView style={styles.scrollView}>
                        <View style={styles.container}>
                            <View style={styles.containerInner}>
                                <View style={styles.block}>
                                    <View>
                                        <View>
                                            <Typography
                                                fontSize={13}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                lineHeight={25}
                                                color={BLACK}
                                                textAlign="left"
                                                text={SETUP_AUTOBILLING_VIA}
                                            />
                                            <Typography
                                                fontSize={14}
                                                fontWeight="bold"
                                                fontStyle="normal"
                                                lineHeight={19}
                                                color={BLACK}
                                                textAlign="left"
                                                text={FILL_IN_AB_DETAILS}
                                            />
                                        </View>

                                        <View style={styles.descriptionContainerAmount}>
                                            <Typography
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={19}
                                                color={BLACK}
                                                textAlign="left"
                                                text={START_DATE}
                                            />
                                        </View>

                                        <View style={styles.titleContainer}>
                                            <TouchableOpacity onPress={showStartDatePicker}>
                                                <View pointerEvents="none">
                                                    <TextInput
                                                        maxLength={30}
                                                        value={
                                                            displayStartDate?.length > 2
                                                                ? displayStartDate
                                                                : ""
                                                        }
                                                        placeholder={START_DATE_PLACEHOLDER}
                                                        editable
                                                        fontWeight="bold"
                                                        fontStyle="normal"
                                                    />
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.descriptionContainerAmount}>
                                            <Typography
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={19}
                                                color={BLACK}
                                                textAlign="left"
                                                text={END_DATE}
                                            />
                                        </View>
                                        <View style={styles.titleContainer}>
                                            <TouchableOpacity onPress={showEndDatePicker}>
                                                <View pointerEvents="none">
                                                    <TextInput
                                                        maxLength={30}
                                                        value={
                                                            displayEndDate?.length > 2
                                                                ? displayEndDate
                                                                : ""
                                                        }
                                                        placeholder={END_DATE_PLACEHOLEDER}
                                                        editable
                                                        fontWeight="bold"
                                                        fontStyle="normal"
                                                    />
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.descriptionContainerAmount}>
                                            <Typography
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={19}
                                                color={BLACK}
                                                textAlign="left"
                                                text={FREQUENCY}
                                            />
                                            <TouchableOpacity
                                                onPress={() => handleInfoPress(FREQUENCY)}
                                            >
                                                <Image
                                                    style={styles.infoIcon}
                                                    source={Assets.icInformation}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.contoryContainer}>
                                            <Dropdown
                                                title={selectedFrequency?.name ?? PLEASE_SELECT}
                                                disable={false}
                                                align="left"
                                                iconType={1}
                                                textLeft={true}
                                                testID="txtSELECT_RL"
                                                accessibilityLabel="txtSELECT_RZ"
                                                borderWidth={0.5}
                                                onPress={onFrequencyClick}
                                            />
                                        </View>
                                        <View style={styles.descriptionContainerAmount}>
                                            <Typography
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={19}
                                                color={BLACK}
                                                textAlign="left"
                                                text={LIMIT_PER_TRANSACTION}
                                            />
                                            <TouchableOpacity
                                                onPress={() =>
                                                    handleInfoPress(LIMIT_PER_TRANSACTION)
                                                }
                                            >
                                                <Image
                                                    style={styles.infoIcon}
                                                    source={Assets.icInformation}
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.mb20}>
                                            <TextInput
                                                importantForAutofill="no"
                                                editable
                                                isValid={isAmtValidate}
                                                prefix="RM"
                                                isValidate
                                                value={textInputValue}
                                                errorMessage={amtInputErrorMessage}
                                                returnKeyType="done"
                                                keyboardType="numeric"
                                                onChangeText={onLimitChange}
                                                maxLength={16}
                                                placeholder="0.00"
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
                <FixedActionContainer>
                    <ActionButton
                        disabled={isSubmitDisble}
                        fullWidth
                        borderRadius={25}
                        onPress={OnSubmit}
                        backgroundColor={isSubmitDisble ? DISABLED : YELLOW}
                        componentCenter={
                            <Typography
                                color={isSubmitDisble ? DISABLED_TEXT : BLACK}
                                text={CONTINUE}
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                            />
                        }
                    />
                </FixedActionContainer>
            </ScreenLayout>

            <ScrollPickerView
                showMenu={frequencyView}
                list={frequencyList}
                selectedIndex={selectedFrequency?.index}
                onRightButtonPress={onFrequencyRightButtonModePress}
                onLeftButtonPress={onFrequencyLeftButtonModePress}
                rightButtonText="Done"
                leftButtonText="Cancel"
            />
            <DatePicker
                showDatePicker={startDatePicker}
                onCancelButtonPressed={hideStartDatePicker}
                onDoneButtonPressed={selectedStartDay}
                dateRangeStartDate={moment().add(1, "days").toDate()}
                dateRangeEndDate={moment().add(6, "months").toDate()}
                defaultSelectedDate={startDate}
            />
            <DatePicker
                showDatePicker={endDatePicker}
                onCancelButtonPressed={hideEndDatePicker}
                onDoneButtonPressed={selectedEndDay}
                dateRangeStartDate={minEndDate}
                dateRangeEndDate={moment().add(50, "years").toDate()}
                defaultSelectedDate={minEndDate}
                endYear={moment().year() + 50}
            />
            <Popup
                visible={showFrequencyInfo}
                title={infoTitle}
                description={infoMessage}
                onClose={handleInfoPress}
            />
        </ScreenContainer>
    );
}

ABAutoDebitDetails.propTypes = {
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
    resetModel: PropTypes.func,
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    KeyboardAvoidingViewStyle: {
        flex: 1,
        flexDirection: "column",
        width: "100%",
    },
    block: { flexDirection: "column" },
    container: { flex: 1, paddingBottom: 5, paddingHorizontal: 36, width: "100%" },
    containerInner: { flex: 1, width: "100%" },
    contoryContainer: {
        alignSelf: "flex-start",
        marginTop: 10,
        paddingBottom: 5,
        width: "100%",
    },
    descriptionContainerAmount: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 30,
    },
    infoIcon: { height: 16, marginLeft: 10, width: 16 },
    mb20: {
        marginBottom: 20,
    },
    scrollView: {
        flex: 1,
    },
});

export default withModelContext(ABAutoDebitDetails);
