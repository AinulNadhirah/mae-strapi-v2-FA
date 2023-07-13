import moment from "moment";
import PropTypes from "prop-types";
import React, { useState, useEffect, useReducer, useCallback } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Keyboard,
    Image,
    Platform,
    FlatList,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import ScreenContainer from "@components/Containers/ScreenContainer";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import DatePicker from "@components/Pickers/DatePicker";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { customerInquiry } from "@services";
import { applySuppCard } from "@services/analytics/analyticsSTPCreditcardAndSuppCard";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK, GREY } from "@constants/colors";
import { getDateRangeDefaultData } from "@constants/datePickerDefaultData";
import { CARDS_SUPP_DOB } from "@constants/dateScenarios";
import {
    COMMON_ERROR_MSG,
    PLEASE_SELECT,
    DONE,
    CANCEL,
    FA_APPLY_SUPPLEMENTARYCARD_SELECTCARD,
} from "@constants/strings";

import { onlyNumber, getAge, validateEmail, validateArmyId } from "@utils/dataModel";
import { getDateRange, getDefaultDate, getEndDate, getStartDate } from "@utils/dateRange";

import assets from "@assets";
import { CARD_SUPP_CONFIRMATION } from "@navigation/navigationConstant";

const initialState = {
    // CC Type related
    ccType: PLEASE_SELECT,
    ccTypeValue: null,
    ccTypeValid: true,
    ccTypeErrorMsg: "",
    ccTypeData: [
        {
            value: "027",
            name: "Conventional",
        },
    ],
    ccTypeValueIndex: 0,
    ccTypePicker: false,
    showInfo: false,

    // CC Type Id related
    cidType: PLEASE_SELECT,
    cidTypeValue: null,
    cidTypeValid: true,
    cidTypeErrorMsg: "",
    cidTypeData: [],
    cidTypeValueIndex: 0,
    cidTypePicker: false,

    // DOB related
    dOB: "e.g. 2 Jan 1991",
    dOBValid: true,
    dOBErrorMsg: "",
    datePicker: false,
    datePickerDate: new Date(new Date().getFullYear() - 12 + "-" + "01-01"),

    // Email related
    email: "",
    emailValid: true,
    emailErrorMsg: "",

    // Id Number related
    idNum: "",
    idNumValid: true,
    idNumErrorMsg: "",

    cardData: [],
    cardCount: 0,

    // Others
    isContinueDisabled: false,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "PopulateDropdowns": {
            const cardData = payload?.serverData?.cardDispDataArr;
            const newData =
                cardData &&
                cardData.map((value, index) => ({
                    ...value,
                    isSelected: false,
                    id: index,
                }));
            return {
                ...state,
                //ccTypeData: payload?.serverData?.masterData?.options ?? state.ccTypeData,
                cidTypeData: payload?.serverData?.masterData?.icTypes ?? state.cidTypeData,
                cardData: newData ?? state.cardData,
            };
        }
        case "cardSelect":
            return {
                ...state,
                cardData: payload?.cardData,
                cardCount: payload?.cardCount,
            };
        case "popupDisplay":
            return {
                ...state,
                showInfo: payload,
            };
        case "hidePicker":
            return {
                ...state,
                pickerType: null,
                ccTypePicker: false,
                cidTypePicker: false,
            };
        case "showPicker":
            return {
                ...state,
                pickerType: payload,
                ccTypePicker: payload === "ccType",
                cidTypePicker: payload === "cidType",
            };
        case "ccTypeDone":
            return {
                ...state,
                ccType: payload?.ccType,
                ccTypeValue: payload?.ccTypeValue,
                ccTypeObj: payload?.ccTypeObj,
                ccTypeValueIndex: payload?.ccTypeValueIndex,
            };
        case "cidTypeDone":
            return {
                ...state,
                cidType: payload?.cidType,
                cidTypeValue: payload?.cidTypeValue,
                cidTypeObj: payload?.cidTypeObj,
                cidTypeValueIndex: payload?.cidTypeValueIndex,
            };
        case "idNum":
            return {
                ...state,
                idNum: payload,
            };
        case "DOB":
            return {
                ...state,
                dOB: payload?.dOB,
                datePickerDate: payload?.datePickerDate,
            };
        case "showDatePicker":
            return {
                ...state,
                datePicker: payload,
            };
        case "email":
            return {
                ...state,
                email: payload,
            };
        case "updateValidationErrors":
            return {
                ...state,
                idNumValid: payload?.idNumValid ?? true,
                idNumErrorMsg: payload?.idNumErrorMsg ?? "",
                dOBValid: payload?.dOBValid ?? "",
                emailValid: payload?.emailValid ?? true,
                emailErrorMsg: payload?.emailErrorMsg ?? "",
            };
        case "isContinueDisabled":
            return {
                ...state,
                isContinueDisabled: payload,
            };
        default:
            return { ...state };
    }
}

const CardListItem = ({ item, onPress }) => {
    const onListItemPressed = useCallback(() => onPress(item), [item, onPress]);
    return (
        <View style={styles.cardCont}>
            <View>
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.radioButton}
                    onPress={onListItemPressed}
                >
                    {item?.isSelected ? (
                        <RadioChecked
                            style={styles.radioButton}
                            paramLabelCls={styles.radioBtnLabelCls}
                            paramContainerCls={styles.radioBtnContainerStyle}
                            checkType="image"
                            imageSrc={assets.icRadioChecked}
                        />
                    ) : (
                        <RadioUnchecked
                            paramLabelCls={styles.radioBtnLabelCls}
                            paramContainerCls={styles.radioBtnContainerStyle}
                        />
                    )}
                </TouchableOpacity>
            </View>
            <View>
                <Typo
                    fontWeight="600"
                    textAlign="left"
                    fontSize={14}
                    lineHeight={18}
                    text={item?.name}
                />
                <View>
                    <Typo
                        textAlign="left"
                        fontSize={14}
                        fontWeight="normal"
                        lineHeight={18}
                        text={item?.formattedNumber}
                    />
                </View>
            </View>
        </View>
    );
};

CardListItem.propTypes = {
    item: PropTypes.object,
    onPress: PropTypes.func,
};

const CardList = ({ list, onItemPress }) => {
    const extractKey = useCallback((item, index) => `${item.contentId}-${index}`, []);
    const onListItemPressed = useCallback((item) => onItemPress(item), [onItemPress]);
    const renderItem = useCallback(
        ({ item }) => <CardListItem item={item} onPress={onListItemPressed} />,
        [onListItemPressed]
    );

    return (
        <FlatList
            style={styles.cardList}
            data={list}
            extraData={list}
            scrollToIndex={0}
            showsHorizontalScrollIndicator={false}
            showIndicator={false}
            keyExtractor={extractKey}
            renderItem={renderItem}
        />
    );
};

CardList.propTypes = {
    list: PropTypes.any,
    onItemPress: PropTypes.any,
};

function CardSuppDetails({ navigation, route }) {
    const [loading, setLoading] = useState(false);
    const [state, dispatch] = useReducer(reducer, initialState);
    const [validDateRangeData, setValidDateRangeData] = useState(
        getDateRangeDefaultData(CARDS_SUPP_DOB)
    );
    const [defaultSelectedDate, setDefaultSelectedDate] = useState(
        getDefaultDate(validDateRangeData)
    );

    useEffect(() => {
        getDatePickerData();
        init();
    }, [init]);

    const getDatePickerData = () => {
        getDateRange(CARDS_SUPP_DOB).then((data) => {
            setValidDateRangeData(data);
        });
    };

    const init = useCallback(async () => {
        try {
            const params = route?.params ?? {};
            dispatch({
                actionType: "PopulateDropdowns",
                payload: params,
            });
        } catch (error) {
            navigation.canGoBack() && navigation.goBack();
        }
    }, [navigation, route?.params]);

    // Used enable/disable "Continue"
    useEffect(() => {
        dispatch({
            actionType: "isContinueDisabled",
            payload:
                state.ccType === PLEASE_SELECT ||
                state.cidType === PLEASE_SELECT ||
                state.cardCount === 0 ||
                state.dOB === "e.g. 2 Jan 1991" ||
                state.email === "" ||
                state.idNum === "",
        });
    }, [state.cardCount, state.ccType, state.cidType, state.dOB, state.email, state.idNum]);

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleClose() {
        navigation.navigate(route?.params?.entryStack || "More", {
            screen: route?.params?.entryScreen || "Apply",
            params: route?.params?.entryParams,
        });
    }

    function onCCTypeTap() {
        dispatch({
            actionType: "showPicker",
            payload: "ccType",
        });
    }

    function onPopupClose() {
        dispatch({
            actionType: "popupDisplay",
            payload: false,
        });
    }

    function handleInfoPress() {
        console.log("handleInfoPress");
        dispatch({
            actionType: "popupDisplay",
            payload: true,
        });
    }

    function onCidTypeTap() {
        dispatch({
            actionType: "showPicker",
            payload: "cidType",
        });
    }

    function onPickerCancel() {
        dispatch({
            actionType: "hidePicker",
            payload: true,
        });
    }

    function onPickerDone(item, index) {
        const { pickerType } = state;
        switch (pickerType) {
            case "ccType":
                dispatch({
                    actionType: "ccTypeDone",
                    payload: {
                        ccType: item?.name ?? PLEASE_SELECT,
                        ccTypeValue: item?.value ?? null,
                        ccTypeObj: item,
                        ccTypeValueIndex: index,
                    },
                });
                break;
            case "cidType":
                dispatch({
                    actionType: "cidTypeDone",
                    payload: {
                        cidType: item?.name ?? PLEASE_SELECT,
                        cidTypeValue: item?.value ?? null,
                        cidTypeObj: item,
                        cidTypeValueIndex: index,
                    },
                });
                break;
            default:
                break;
        }

        // Close picker
        onPickerCancel();
    }

    function onIdNumChange(value) {
        if (value.length === 12) {
            const dt = value.substring(4, 6) + value.substring(2, 4) + value.substring(0, 2);
            const formattedDate = moment(dt, "DDMMYYYY").format("DD/MM/YYYY");
            if (formattedDate !== "Invalid date") {
                dispatch({
                    actionType: "DOB",
                    payload: { dOB: formattedDate, datePickerDate: new Date(formattedDate) },
                });
            }
        }
        return dispatch({ actionType: "idNum", payload: value });
    }

    function onDOBChange() {
        Keyboard.dismiss();
        return dispatch({ actionType: "showDatePicker", payload: true });
    }

    function onDatePickerCancel() {
        return dispatch({ actionType: "showDatePicker", payload: false });
    }

    function onDatePickerDone(date) {
        // Form the date format to be shown on form
        const selectedDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        const selectedMonth =
            date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
        const selectedYear = date.getFullYear();
        const dateText = selectedDate + "/" + selectedMonth + "/" + selectedYear;
        setDefaultSelectedDate(date);
        dispatch({
            actionType: "DOB",
            payload: { dOB: dateText, datePickerDate: new Date(dateText) },
        });
        onDatePickerCancel();
    }

    function onEmailChange(value) {
        return dispatch({ actionType: "email", payload: value });
    }

    const validateIDNumber = useCallback(() => {
        // Min length check
        if (state.idNum.length !== 12) {
            return {
                idNumValid: false,
                idNumErrorMsg: "Sorry, your New IC must consist of 12 digits only.",
            };
        }
        if (state.cidTypeValue === "01") {
            // Only Number
            if (!onlyNumber(state.idNum)) {
                return {
                    idNumValid: false,
                    idNumErrorMsg: "Sorry, your ID No must be numeric only.",
                };
            }
        }

        if (state.cidTypeValue === "03" || state.cidTypeValue === "04") {
            if (validateArmyId(state.idNum)) {
                return {
                    idNumValid: false,
                    idNumErrorMsg: "Non Civilan ID length does not match.",
                };
            }
        }

        // Return true if no validation error
        return {
            idNumValid: true,
            idNumErrorMsg: "",
        };
    }, [state.cidTypeValue, state.idNum]);

    const validateDOB = useCallback(() => {
        const age = getAge(state.dOB, "DD/MM/YYYY");

        //Max age 65
        if (age > 65) {
            showErrorToast({
                message:
                    "We are sorry. The maximum age allowed for card application is 65 years and below.",
            });
            return { dOBValid: false };
        }

        //Min age 18
        if (age < 18) {
            showErrorToast({
                message:
                    "We are sorry. Application is only allowed for applicants 18 years old & above.",
            });
            return { dOBValid: false };
        }

        // Return true if no validation error
        return { dOBValid: true };
    }, [state.dOB]);

    const validateEml = useCallback(() => {
        // Only alphanumeric check
        if (!validateEmail(state.email)) {
            return {
                emailValid: false,
                emailErrorMsg: "Please enter a valid email address.",
            };
        }

        // Return true if no validation error
        return {
            emailValid: true,
            emailErrorMsg: "",
        };
    }, [state.email]);

    function validateForm() {
        // Reset existing error state
        dispatch({ actionType: "updateValidationErrors", payload: {} });

        const { idNumValid, idNumErrorMsg } = validateIDNumber();
        const { dOBValid } = validateDOB();
        const { emailValid, emailErrorMsg } = validateEml();
        // Update inline errors(if any)
        dispatch({
            actionType: "updateValidationErrors",
            payload: {
                idNumValid,
                idNumErrorMsg,
                dOBValid,
                emailValid,
                emailErrorMsg,
            },
        });

        return idNumValid && dOBValid && emailValid;
    }

    async function handleProceedButton() {
        setLoading(true);
        applySuppCard.onProceedCardSuppDetails(state.cardData, state.ccType);

        try {
            // Return is form validation fails
            const isFormValid = validateForm();
            if (!isFormValid) return;
            customerInqApi();
        } catch (error) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        } finally {
            setLoading(false);
        }
    }

    function getServerParams(params) {
        return {
            birthDate: params?.userAction?.displayData?.dob?.selectedValue,
            icNo: params?.userAction?.displayData?.idNumber?.displayValue,
            idType: params?.userAction?.displayData?.idType?.selectedValue,
        };
    }

    async function customerInqApi() {
        const obj = getParamData();
        const params = route?.params ?? {};
        const param = getServerParams({ ...params, userAction: { ...obj } });
        try {
            const httpResp = await customerInquiry(
                param,
                "loan/v1/supp-card/suppCardCustomerInquiry",
                true
            );
            const result = httpResp?.data?.result ?? null;
            if (!result) {
                return;
            }
            const { statusCode, statusDesc, customerFlag, stpRefNo } = result;
            if (statusCode === "0000") {
                if (params.routeFrom === CARD_SUPP_CONFIRMATION) {
                    navigation.navigate("CardSuppConfirmation", {
                        ...params,
                        userAction: { ...params?.userAction, ...obj.displayData },
                    });
                } else {
                    navigation.navigate("CardSuppCollection", {
                        ...params,
                        customerFlag,
                        stpRefNo,
                        cardData: state.cardData,
                        userAction: { ...obj.displayData },
                    });
                }
            } else {
                showErrorToast({
                    message: statusDesc || COMMON_ERROR_MSG,
                });
            }
        } catch (e) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    }

    function getParamData() {
        const {
            dOB,
            cidType,
            cidTypeValue,
            cidTypeObj,
            idNum,
            ccType,
            ccTypeValue,
            ccTypeObj,
            email,
        } = state;
        return {
            displayData: {
                ccType: {
                    displayKey: "Credit card type",
                    displayValue: ccType,
                    selectedValue: ccTypeValue,
                    selectedDisplay: ccType,
                    selectedObj: ccTypeObj,
                },
                email: {
                    displayKey: "Principal email address",
                    displayValue: email,
                },
                idType: {
                    displayKey: "Supplementary ID type",
                    displayValue: cidType,
                    selectedValue: cidTypeValue,
                    selectedDisplay: cidType,
                    selectedObj: cidTypeObj,
                },
                idNumber: {
                    displayKey: "Supplementary ID number",
                    displayValue: idNum,
                },
                dob: {
                    displayKey: "Supplementary date of birth",
                    displayValue: moment(dOB.replace(/[/]/g, ""), "DDMMYYYY").format("DD MMM YYYY"),
                    selectedValue: dOB.replace(/[/]/g, ""),
                },
            },
        };
    }

    function onSelectCard(value) {
        if (state.cardCount >= 5 && !value.isSelected) {
            //show error
            return;
        }

        const currentData = [...state.cardData];
        let ct = 0;
        let newData = [];
        currentData.map((item) => {
            const isSel =
                (item.isSelected && item.id !== value.id) ||
                (item.id === value.id && !value.isSelected);
            newData.push({ ...item, isSelected: isSel });
            if (isSel) {
                ct++;
            }
        });
        return dispatch({
            actionType: "cardSelect",
            payload: { cardData: newData, cardCount: ct },
        });
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showOverlay={state.datePicker}
                analyticScreenName={FA_APPLY_SUPPLEMENTARYCARD_SELECTCARD}
            >
                <>
                    <ScreenLayout
                        paddingBottom={36}
                        paddingTop={20}
                        paddingHorizontal={24}
                        header={
                            <HeaderLayout
                                headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                                headerCenterElement={
                                    <Typo
                                        text="Step 1 of 2"
                                        fontWeight="600"
                                        fontSize={16}
                                        lineHeight={19}
                                    />
                                }
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
                                <View style={styles.view}>
                                    <View style={styles.subheader}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            lineHeight={16}
                                            text="Supplementary Card Application"
                                            textAlign="left"
                                        />
                                    </View>
                                    <View style={styles.subheader}>
                                        <Typo
                                            fontSize={15}
                                            fontWeight="bold"
                                            lineHeight={17}
                                            text="Please fill in your details"
                                            textAlign="left"
                                        />
                                    </View>
                                    <SpaceFiller height={25} />
                                    <LabeledDropdown
                                        label="Supplementary Card Application"
                                        dropdownValue={state.ccType}
                                        isValid={state.ccTypeValid}
                                        errorMessage={state.ccTypeErrorMsg}
                                        onPress={onCCTypeTap}
                                        style={styles.info}
                                    />
                                    <View style={styles.info}>
                                        <View style={styles.infoView}>
                                            <View style={styles.innerView}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="normal"
                                                    lineHeight={18}
                                                    text="Tell us about the supplementary cardholder"
                                                    textAlign="left"
                                                />
                                            </View>
                                            <TouchableOpacity onPress={handleInfoPress}>
                                                <Image
                                                    style={styles.infoIcon}
                                                    source={assets.icInformation}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <CardList
                                            list={state.cardData}
                                            onItemPress={onSelectCard}
                                        />
                                    </View>
                                    <View style={styles.info}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            lineHeight={18}
                                            text="Principal email address"
                                            textAlign="left"
                                        />
                                        <SpaceFiller height={4} />
                                        <TextInput
                                            autoCorrect={false}
                                            onChangeText={onEmailChange}
                                            placeholder="e.g. danial@gmail.com"
                                            enablesReturnKeyAutomatically
                                            returnKeyType="next"
                                            isValidate
                                            isValid={state.emailValid}
                                            errorMessage={state.emailErrorMsg}
                                            value={state.email}
                                            maxLength={40}
                                        />
                                    </View>
                                    <LabeledDropdown
                                        label="Supplementary card ID type"
                                        dropdownValue={state.cidType}
                                        isValid={state.cidTypeValid}
                                        errorMessage={state.cidTypeErrorMsg}
                                        onPress={onCidTypeTap}
                                        style={styles.info}
                                    />
                                    <View style={styles.info}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            lineHeight={18}
                                            text="Supplementary card ID number"
                                            textAlign="left"
                                        />
                                        <SpaceFiller height={4} />
                                        <TextInput
                                            autoCorrect={false}
                                            onChangeText={onIdNumChange}
                                            placeholder="e.g. 980102 03 5678"
                                            enablesReturnKeyAutomatically
                                            returnKeyType="next"
                                            isValidate
                                            isValid={state.idNumValid}
                                            errorMessage={state.idNumErrorMsg}
                                            value={state.idNum}
                                            maxLength={12}
                                        />
                                    </View>
                                    <View style={styles.info}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            lineHeight={14}
                                            text="Supplementary date of birth"
                                            textAlign="left"
                                        />
                                        <TouchableOpacity
                                            activeOpacity={1}
                                            accessible={false}
                                            testID="inputView"
                                            accessibilityLabel="inputView"
                                            style={
                                                state.dOB === "e.g. 2 Jan 1991"
                                                    ? styles.inputContainer
                                                    : styles.inputContainerSelect
                                            }
                                            onPress={onDOBChange}
                                        >
                                            <Typo
                                                fontSize={20}
                                                fontWeight="bold"
                                                fontStyle="normal"
                                                lineHeight={20}
                                                textAlign="left"
                                                style={styles.labelTop}
                                                text={state.dOB}
                                                color={
                                                    state.dOB === "e.g. 2 Jan 1991" ? GREY : BLACK
                                                }
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                            <View style={styles.footer}>
                                <ActionButton
                                    fullWidth
                                    disabled={state.isContinueDisabled}
                                    isLoading={loading}
                                    borderRadius={25}
                                    onPress={handleProceedButton}
                                    backgroundColor={state.isContinueDisabled ? DISABLED : YELLOW}
                                    componentCenter={
                                        <Typo
                                            text="Save and Continue"
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            color={state.isContinueDisabled ? DISABLED_TEXT : BLACK}
                                        />
                                    }
                                />
                            </View>
                        </View>
                    </ScreenLayout>
                    {state.ccTypeData && (
                        <ScrollPickerView
                            showMenu={state.ccTypePicker}
                            list={state.ccTypeData}
                            selectedIndex={state.ccTypeValueIndex}
                            onRightButtonPress={onPickerDone}
                            onLeftButtonPress={onPickerCancel}
                            rightButtonText={DONE}
                            leftButtonText={CANCEL}
                        />
                    )}
                    {state.cidTypeData && (
                        <ScrollPickerView
                            showMenu={state.cidTypePicker}
                            list={state.cidTypeData}
                            selectedIndex={state.cidTypeValueIndex}
                            onRightButtonPress={onPickerDone}
                            onLeftButtonPress={onPickerCancel}
                            rightButtonText={DONE}
                            leftButtonText={CANCEL}
                        />
                    )}

                    <Popup
                        visible={state.showInfo}
                        title="Principal Card"
                        description="You may select the Principal Card with a maximum of 5 cards per application"
                        onClose={onPopupClose}
                    />
                </>
            </ScreenContainer>
            <DatePicker
                showDatePicker={state.datePicker}
                onCancelButtonPressed={onDatePickerCancel}
                onDoneButtonPressed={onDatePickerDone}
                dateRangeStartDate={getEndDate(validDateRangeData)}
                dateRangeEndDate={getStartDate(validDateRangeData)}
                defaultSelectedDate={defaultSelectedDate}
            />
        </>
    );
}

CardSuppDetails.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    cardCont: {
        alignItems: "center",
        flexDirection: "row",
        paddingBottom: 16,
    },
    cardList: { width: "100%" },
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
    containerView: {
        flex: 1,
        width: "100%",
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    info: {
        paddingBottom: 24,
    },
    infoIcon: {
        height: 18,
        marginLeft: 10,
        width: 18,
    },
    infoView: {
        alignItems: "center",
        flexDirection: "row",
        paddingBottom: 24,
    },
    innerView: {
        width: "92%",
    },
    inputContainer: {
        alignItems: "center",
        borderBottomColor: GREY,
        borderBottomWidth: 1,
        flexDirection: "row",
        height: 48,
        justifyContent: "flex-start",
    },
    inputContainerSelect: {
        alignItems: "center",
        borderBottomColor: BLACK,
        borderBottomWidth: 1,
        flexDirection: "row",
        height: 48,
        justifyContent: "flex-start",
    },
    labelTop: {
        marginTop: 5,
    },
    radioBtnContainerStyle: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    radioBtnLabelCls: {
        color: BLACK,
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 20,
        paddingLeft: 10,
    },
    radioButton: {
        alignItems: "flex-start",
        marginRight: 8,
    },
    subheader: {
        alignItems: "center",
        flexDirection: "row",
        paddingBottom: 6,
    },
    view: {
        paddingHorizontal: 12,
    },
});

export default CardSuppDetails;
