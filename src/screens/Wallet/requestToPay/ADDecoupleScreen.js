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
    ONE_TAP_AUTH_MODULE,
    REQUEST_TO_PAY_STACK,
    RTP_AUTODEBIT_CONFIRMATION_SCREEN,
    SEND_REQUEST_MONEY_DASHBOARD,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
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
    FILL_IN_AB_DETAILS,
    RTP_AUTODEBIT,
    AD_LIMIT_DETAILS,
    AD_FREQUENCY_DETAILS,
    SELECT_VALID_END_DATE,
} from "@constants/strings";

import { getDateFormated } from "@utils/dataModel";
import { checks2UFlow } from "@utils/dataModel/utility";

import Assets from "@assets";

function ADDecoupleScreen({ navigation, route, getModel }) {
    const [isSubmitDisble, setIsSubmitDisble] = useState(null);
    const [frequencyView, setFrequencyView] = useState(false);
    const [startDatePicker, setStartDatePicker] = useState(false);
    const [endDatePicker, setEndDatePicker] = useState(false);
    const [cancelAllowed, setCancelAllowed] = useState(false);
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
    const [flow, setFlow] = useState("");
    const [secure2uValidateData, setSecure2uValidateData] = useState(null);
    const [allowCancel, setAllowCancel] = useState(true);
    //Renew autodebit request params
    const from = useState(route.params?.from ?? "");
    const limitPerTxn = useState(parseFloat(route.params?.limitAmount).toFixed(2) ?? "");

    useEffect(() => {
        RTPanalytics.screenLoadADDebitDetails();
        updateState();
    }, []);

    useEffect(() => {
        isFieldsValid();
    }, [startDate, endDate, textInputValue]);

    async function updateState() {
        const transferParams = route?.params?.transferParams;

        const sDate = transferParams?.consentStartDate
            ? moment(transferParams?.consentStartDate)
            : moment().add(1, "days").toDate();
        const { flow, secure2uValidateData } = await checks2UFlow(71, getModel);
        setStartDate(sDate);
        setEndDate(
            transferParams?.consentExpiryDate
                ? moment(transferParams?.consentExpiryDate)
                : moment(sDate).add(30, "days").toDate()
        );

        setTextInputValue(transferParams?.consentMaxLimit ?? "");
        setDisplayStartDate(
            transferParams?.consentStartDate
                ? getDateFormated(transferParams?.consentStartDate)
                : null
        );
        setAllowCancel(allowCancel);
        setFlow(flow);
        setSecure2uValidateData(secure2uValidateData);

        isFieldsValid(true);
    }

    /***
     * _onBackPress
     * On Screen Back press handle
     */
    function _onBackPress() {
        hideToast();
        navigation.goBack();
    }

    /***
     * _onFrequencyClick
     * On Bank dropdown click event open the pop up
     */
    function _onFrequencyClick() {
        Keyboard.dismiss();
        setFrequencyView(true);
    }

    /**
     *_onFrequencyRightButtonModePress
     * On Frequency on click handle right button click event
     */
    function _onFrequencyRightButtonModePress(val) {
        setSelectedFrequency(val);
        setFrequencyView(false);
    }

    /**
     *_onFrequencyLeftButtonModePress
     * On Frequency on click handle left button click event
     */
    function _onFrequencyLeftButtonModePress() {
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
        if (from === "renewRequest") {
            setTextInputValue(limitPerTxn);
            setIsAmtTouched(true);
        }

        const regex = /^(?![0,]*(\.0+)?$)([,\d]*(?:\.[0-9]{0,4})?)$/gi;
        const isValid = regex.test(textInputValue.replace(/,/g, ""));
        const minAmount = parseFloat(textInputValue) > 0.009;
        const isExceeded = parseFloat(textInputValue) > 49999.99;
        let amtInputErrorMessage = "";
        if (!isValid || !displayStartDate || !displayEndDate || isExceeded) {
            if (isAmtTouched) {
                amtInputErrorMessage =
                    !textInputValue || !minAmount || isExceeded
                        ? "Please enter a valid amount."
                        : textInputValue && !isValid
                        ? "Allow only numeric and two decimal places."
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

    async function _OnSubmit() {
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
                    allowCancel,
                },
                secure2uValidateData,
                flow,
            };

            if (flow === "S2UReg") {
                navigation.navigate(ONE_TAP_AUTH_MODULE, {
                    screen: "Activate",
                    params: {
                        flowParams: {
                            success: {
                                stack: REQUEST_TO_PAY_STACK,
                                screen: RTP_AUTODEBIT_CONFIRMATION_SCREEN,
                            },
                            fail: {
                                stack: REQUEST_TO_PAY_STACK,
                                screen: SEND_REQUEST_MONEY_DASHBOARD,
                            },

                            params: { ...params, isFromS2uReg: true },
                        },
                    },
                });
            } else {
                navigation.navigate(REQUEST_TO_PAY_STACK, {
                    screen: RTP_AUTODEBIT_CONFIRMATION_SCREEN,
                    params,
                });
            }
        }
    }

    function _onLimitChange(value) {
        setTextInputValue(value);
        setIsAmtTouched(true);

        isFieldsValid();
    }

    function onToggle(el) {
        setCancelAllowed(!cancelAllowed);
    }

    function handleInfoPress(type) {
        const infoTitle = type === FREQUENCY ? "Transaction frequency" : "Limit per transaction";
        const infoMessage = type === FREQUENCY ? AD_FREQUENCY_DETAILS : AD_LIMIT_DETAILS;

        setInfoTitle(infoTitle);
        setInfoMessage(infoMessage);
        setShowFrequencyInfo(!showFrequencyInfo);
    }

    function _onAllowCancelPress(val) {
        setAllowCancel(val);
    }

    const { flagEndDate, flagStartDate } = route.params;
    const minEndDate = startDate
        ? moment(startDate).add(1, "days").toDate()
        : moment().add(1, "days").toDate();

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
                                text="Step 2 of 2"
                                color={DARK_GREY}
                            />
                        }
                        headerLeftElement={<HeaderBackButton onPress={_onBackPress} />}
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
                                                text={RTP_AUTODEBIT}
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
                                                text="Start date"
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
                                                        placeholder="Tap to select start date"
                                                        editable={true}
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
                                                text="End date"
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
                                                        placeholder="Tap to select end date"
                                                        editable={true}
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
                                                title={selectedFrequency?.name ?? "Please Select"}
                                                disable={false}
                                                align="left"
                                                iconType={1}
                                                textLeft={true}
                                                testID="txtSELECT_RL"
                                                accessibilityLabel="txtSELECT_RZ"
                                                borderWidth={0.5}
                                                onPress={_onFrequencyClick}
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

                                        <View>
                                            <TextInput
                                                importantForAutofill="no"
                                                editable={true}
                                                isValid={isAmtValidate}
                                                prefix="RM"
                                                isValidate
                                                value={
                                                    from === "renewRequest"
                                                        ? limitPerTxn
                                                        : textInputValue
                                                }
                                                errorMessage={amtInputErrorMessage}
                                                returnKeyType="done"
                                                keyboardType="numeric"
                                                onChangeText={_onLimitChange}
                                                maxLength={16}
                                                placeholder="0.00"
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
                                                text="Allow AutoDebit cancellation?"
                                            />
                                        </View>
                                        <View style={styles.formEditableContainer}>
                                            <TouchableOpacity
                                                style={styles.radioButtonContainer}
                                                onPress={() => _onAllowCancelPress(true)}
                                            >
                                                {allowCancel === true ? (
                                                    <RadioChecked checkType="color" />
                                                ) : (
                                                    <RadioUnchecked />
                                                )}

                                                <View style={styles.radioButtonTitle}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={19}
                                                        color={BLACK}
                                                        textAlign="left"
                                                        text="Yes"
                                                    />
                                                </View>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.radioButtonContainer}
                                                onPress={() => _onAllowCancelPress(false)}
                                            >
                                                {allowCancel === false ? (
                                                    <RadioChecked checkType="color" />
                                                ) : (
                                                    <RadioUnchecked />
                                                )}

                                                <View style={styles.radioButtonTitle}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={19}
                                                        color={BLACK}
                                                        textAlign="left"
                                                        text="No"
                                                    />
                                                </View>
                                            </TouchableOpacity>
                                            <View style={styles.mb20}></View>
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
                        onPress={_OnSubmit}
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
                onRightButtonPress={_onFrequencyRightButtonModePress}
                onLeftButtonPress={_onFrequencyLeftButtonModePress}
                rightButtonText="Done"
                leftButtonText="Cancel"
            />
            <DatePicker
                showDatePicker={startDatePicker}
                onCancelButtonPressed={hideStartDatePicker}
                onDoneButtonPressed={selectedStartDay}
                dateRangeStartDate={moment().add(1, "days").toDate()}
                dateRangeEndDate={moment()
                    .add(flagStartDate ?? 180, "days")
                    .toDate()}
                defaultSelectedDate={startDate}
            />
            <DatePicker
                showDatePicker={endDatePicker}
                onCancelButtonPressed={hideEndDatePicker}
                onDoneButtonPressed={selectedEndDay}
                dateRangeStartDate={minEndDate}
                dateRangeEndDate={moment()
                    .add(flagEndDate ?? 18262, "days")
                    .toDate()}
                defaultSelectedDate={minEndDate}
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

ADDecoupleScreen.propTypes = {
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
    formEditableContainer: {
        alignItems: "center",
        flexDirection: "row",
        marginBottom: 32,
        marginTop: 4,
        width: "100%",
    },
    infoIcon: { height: 16, marginLeft: 10, width: 16 },
    mb20: {
        marginBottom: 20,
    },
    radioButtonContainer: { flexDirection: "row", marginRight: 40, marginTop: 16 },
    radioButtonTitle: { marginLeft: 12 },
    scrollView: {
        flex: 1,
    },
});

export default withModelContext(ADDecoupleScreen);
