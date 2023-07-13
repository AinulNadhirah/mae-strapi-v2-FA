import React, { useReducer, useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { prequalCheck2, maskAddress, maskMobile } from "@screens/PLSTP/PLSTPController";
import { validateEmploymentAddress } from "@screens/PLSTP/PLSTPValidation";

import {
    PLSTP_EMPLOYMENT_DETAILS,
    PLSTP_OTHER_DETAILS,
    PLSTP_PREQUAL2_FAIL,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView, LongTextInput } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { saveEmploymentAddress, scorePartyPLSTP } from "@services";
import { logEvent } from "@services/analytics";

import { YELLOW, DISABLED } from "@constants/colors";
import {
    STEP_7,
    PLSTP_EMPLOYER_TITLE,
    PLSTP_OFFICE_ADDR1,
    PLSTP_OFFICE_ADDR2,
    PLSTP_OFFICE_ADDR3,
    PLSTP_CITY,
    PLSTP_STATE,
    PLSTP_POSTCODE,
    PLSTP_OFFICE_PHNO,
    PLSTP_MAINLING_ADDR,
    PLSTP_SAVE_NEXT,
    DONE,
    CANCEL,
    PLEASE_SELECT,
    FA_FORM_PROCEED,
    FA_SCREEN_NAME,
} from "@constants/strings";

// Initial state object
const initialState = {
    //Office Addr 1
    addr1: "",
    maskedOfcAddr1: "",
    addr1Valid: true,
    addr1ErrorMsg: "",
    addr1Editable: false,

    //Office Addr 2
    addr2: "",
    maskedOfcAddr2: "",
    addr2Valid: true,
    addr2ErrorMsg: "",
    addr2Editable: false,

    //Office Addr 3
    addr3: "",
    maskedOfcAddr3: "",
    addr3Valid: true,
    addr3ErrorMsg: "",
    addr3Editable: false,

    //City
    city: "",
    maskedOfcCity: "",
    cityValid: true,
    cityErrorMsg: "",
    cityEditable: false,

    // State
    stateField: PLEASE_SELECT,
    stateValue: null,
    stateValid: true,
    stateErrorMsg: "",
    stateData: null,
    stateKeyVal: null,
    statePicker: false,
    statePickerIndex: 0,

    //Postcode
    postcode: "",
    postcodeValid: true,
    postcodeErrorMsg: "",

    //Office Phone Number
    mobile: "",
    maskedOfcMobile: "",
    mobileValid: true,
    mobileErrorMsg: "",
    mobileEditable: false,

    // Mailing addr
    mailingAddr: PLEASE_SELECT,
    mailingAddrValue: null,
    mailingAddrValid: true,
    mailingAddrErrorMsg: "",
    mailingAddrData: null,
    mailingAddrKeyVal: null,
    mailingAddrPicker: false,
    mailingAddrPickerIndex: 0,

    // Others
    isContinueDisabled: true,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "populateDropdowns":
            return {
                ...state,
                stateData: payload?.state ?? state.stateData,
                mailingAddrData: payload?.preferredMailingAddress ?? state.mailingAddrData,
            };
        case "addr1":
            return {
                ...state,
                addr1: payload.addr1,
                maskedOfcAddr1: payload.maskedOfcAddr1,
                addr1Editable: payload.addr1Editable,
            };
        case "addr1Valid":
            return {
                ...state,
                addr1Valid: payload?.valid,
                addr1ErrorMsg: payload?.errorMsg,
            };
        case "addr2":
            return {
                ...state,
                addr2: payload.addr2,
                maskedOfcAddr2: payload.maskedOfcAddr2,
                addr2Editable: payload.addr2Editable,
            };
        case "addr2Valid":
            return {
                ...state,
                addr2Valid: payload?.valid,
                addr2ErrorMsg: payload?.errorMsg,
            };
        case "addr3":
            return {
                ...state,
                addr3: payload.addr3,
                maskedOfcAddr3: payload.maskedOfcAddr3,
                addr3Editable: payload.addr3Editable,
            };
        case "addr3Valid":
            return {
                ...state,
                addr3Valid: payload?.valid,
                addr3ErrorMsg: payload?.errorMsg,
            };
        case "city":
            return {
                ...state,
                city: payload.city,
                maskedOfcCity: payload.maskedOfcCity,
                cityEditable: payload.cityEditable,
            };
        case "cityValid":
            return {
                ...state,
                cityValid: payload?.valid,
                cityErrorMsg: payload?.errorMsg,
            };
        case "statePicker":
            return {
                ...state,
                statePicker: payload,
                pickerType: payload && "stateField",
            };
        case "stateField":
            return {
                ...state,
                stateField: payload?.name ?? PLEASE_SELECT,
                stateValue: payload?.id ?? null,
                statePickerIndex: payload?.index ?? 0,
            };
        case "postcode":
            return {
                ...state,
                postcode: payload.postcode,
            };
        case "postcodeValid":
            return {
                ...state,
                postcodeValid: payload?.valid,
                postcodeErrorMsg: payload?.errorMsg,
            };

        case "mobile":
            return {
                ...state,
                mobile: payload.mobile,
                maskedOfcMobile: payload.maskedOfcMobile,
                mobileEditable: payload.mobileEditable,
            };
        case "mobileValid":
            return {
                ...state,
                mobileValid: payload?.valid,
                mobileErrorMsg: payload?.errorMsg,
            };
        case "mailingAddrPicker":
            return {
                ...state,
                mailingAddrPicker: payload,
                pickerType: payload && "mailingAddr",
            };
        case "mailingAddr":
            return {
                ...state,
                mailingAddr: payload?.name ?? PLEASE_SELECT,
                mailingAddrValue: payload?.id ?? null,
                mailingAddrPickerIndex: payload?.index ?? 0,
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

function PLSTPEmploymentAddress({ route, navigation }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { initParams } = route?.params;
    const { masterData, customerInfo, stpRefNum, gcifData } = initParams;
    const [clearErr, SetClearErr] = useState("");

    useEffect(() => {
        init();
    }, [route.params]);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        // console.log("[PLSTPPersonalDetails] >> [Form Fields Updated]");
        const { addr1, addr2, addr3, city, stateField, postcode, mobile, mailingAddr } = state;
        dispatch({
            actionType: "isContinueDisabled",
            payload:
                addr1 === "" ||
                addr2 === "" ||
                addr3 === "" ||
                city === "" ||
                stateField === PLEASE_SELECT ||
                postcode === "" ||
                mobile === "" ||
                mailingAddr === PLEASE_SELECT,
        });
    }, [
        state.addr1,
        state.addr2,
        state.addr3,
        state.city,
        state.stateField,
        state.postcode,
        state.mobile,
        state.mailingAddr,
    ]);

    const init = () => {
        console.log("[PLSTPEmploymentAddress] >> [init]");

        const { stateKeyVal, preferredMailingAddressKeyVal } = masterData;
        // const { emailAddress, mobileNum, addressLine1, addressLine2, homeCity, postCode} = gcifData;
        let employerData;
        if (customerInfo?.officeAddress1) {
            employerData = customerInfo;
        } else {
            Object.assign(customerInfo, {
                officeAddress1: gcifData?.officeAddress?.addressLine1,
                officeAddress2: gcifData?.officeAddress?.addressLine2,
                officeAddress3: gcifData?.officeAddress?.addressLine3,
                officeCity: gcifData?.officeAddress?.city,
                officeState: gcifData?.officeAddress?.state?.type,
                officeStateValue: gcifData?.officeAddress?.state?.id,
                officePostcode: gcifData?.officeAddress?.postCode,
                officePhoneNum: gcifData?.officePhoneNumber,
                mailingAddress: "",
                mailingAddressValue: "",
            });
            employerData = customerInfo;
        }
        const {
            officeAddress1,
            officeAddress2,
            officeAddress3,
            officeCity,
            officeStateValue,
            officePostcode,
            mailingAddressValue,
            officePhoneNum,
        } = employerData;
        // Populate drodown data
        dispatch({ actionType: "populateDropdowns", payload: masterData });

        // Pre-populate field values if any existing and mask the data
        if (officeAddress1) {
            const addrSubstr = officeAddress1.substring(0, 30);
            const maskedAddress = maskAddress(addrSubstr);
            dispatch({
                actionType: "addr1",
                payload: {
                    addr1: addrSubstr,
                    maskedOfcAddr1: maskedAddress,
                    addr1Editable: false,
                },
            });
        }

        if (officeAddress2) {
            const addrSubstr = officeAddress2.substring(0, 30);
            const maskedAddress = maskAddress(addrSubstr);
            dispatch({
                actionType: "addr2",
                payload: {
                    addr2: addrSubstr,
                    maskedOfcAddr2: maskedAddress,
                    addr2Editable: false,
                },
            });
        }

        if (officeAddress3) {
            const addrSubstr = officeAddress3.substring(0, 30);
            const maskedAddress = maskAddress(addrSubstr);
            dispatch({
                actionType: "addr3",
                payload: {
                    addr3: addrSubstr,
                    maskedOfcAddr3: maskedAddress,
                    addr3Editable: false,
                },
            });
        }

        if (officeCity)
            dispatch({
                actionType: "city",
                payload: {
                    city: officeCity,
                    maskedOfcCity: maskAddress(officeCity),
                    cityEditable: false,
                },
            });

        if (officePostcode)
            dispatch({
                actionType: "postcode",
                payload: {
                    postcode: officePostcode,
                },
            });

        if (officePhoneNum) {
            let officePhoneSubstr = officePhoneNum; //.substring(0, 10);
            if (officePhoneSubstr.startsWith(0)) {
                officePhoneSubstr = officePhoneSubstr.substring(1);
            }
            const maskedMobile = maskMobile(officePhoneSubstr);
            dispatch({
                actionType: "mobile",
                payload: {
                    mobile: officePhoneSubstr,
                    maskedOfcMobile: maskedMobile,
                    mobileEditable: false,
                },
            });
        }

        if (officeStateValue)
            dispatch({
                actionType: "stateField",
                payload: {
                    name: stateKeyVal[officeStateValue],
                    id: officeStateValue,
                },
            });

        if (mailingAddressValue)
            dispatch({
                actionType: "mailingAddr",
                payload: {
                    name: preferredMailingAddressKeyVal[mailingAddressValue],
                    id: mailingAddressValue,
                },
            });
    };

    // Actions
    const onAddr1Change = (value) => {
        console.log("[PLSTPPersonalDetails] >> [onAddr1Change]");

        dispatch({
            actionType: "addr1",
            payload: { addr1: value, maskedOfcAddr1: value, addr1Editable: true },
        });
    };

    const onAddr2Change = (value) => {
        console.log("[PLSTPPersonalDetails] >> [onAddr2Change]");

        dispatch({
            actionType: "addr2",
            payload: { addr2: value, maskedOfcAddr2: value, addr2Editable: true },
        });
    };

    const onAddr3Change = (value) => {
        console.log("[PLSTPPersonalDetails] >> [onAddr3Change]");

        dispatch({
            actionType: "addr3",
            payload: { addr3: value, maskedOfcAddr3: value, addr3Editable: true },
        });
    };

    const onCityChange = (value) => {
        console.log("[PLSTPPersonalDetails] >> [onCityChange]");

        dispatch({
            actionType: "city",
            payload: { city: value, maskedOfcCity: value, cityEditable: true },
        });
    };

    const onStateFieldTap = () => {
        dispatch({
            actionType: "statePicker",
            payload: true,
        });
    };

    const onPostcodeChange = (value) => {
        console.log("[PLSTPPersonalDetails] >> [onPostcodeChange]");

        dispatch({
            actionType: "postcode",
            payload: { postcode: value },
        });
    };

    const onMobileChange = (value) => {
        console.log("[PLSTPPersonalDetails] >> [onMobileChange]");

        dispatch({
            actionType: "mobile",
            payload: { mobile: value, maskedOfcMobile: value, mobileEditable: true },
        });
    };

    const onMailingAddrFieldTap = () => {
        dispatch({
            actionType: "mailingAddrPicker",
            payload: true,
        });
    };

    const onPickerDone = (item, selectedIndex) => {
        item.index = selectedIndex;
        dispatch({ actionType: state.pickerType, payload: item });
        // Close picker
        onPickerCancel();
    };

    const onPickerCancel = () => {
        switch (state.pickerType) {
            case "stateField":
                dispatch({
                    actionType: "statePicker",
                    payload: false,
                });
                break;
            case "mailingAddr":
                dispatch({
                    actionType: "mailingAddrPicker",
                    payload: false,
                });
                break;
            default:
                break;
        }
    };

    function onEditBtnPressed(filed) {
        switch (filed) {
            case "addr1":
                if (!state.addr1Editable)
                    dispatch({
                        actionType: "addr1",
                        payload: { addr1: "", maskedOfcAddr1: "", addr1Editable: true },
                    });
                break;
            case "addr2":
                if (!state.addr2Editable)
                    dispatch({
                        actionType: "addr2",
                        payload: { addr2: "", maskedOfcAddr2: "", addr2Editable: true },
                    });
                break;
            case "addr3":
                if (!state.addr3Editable)
                    dispatch({
                        actionType: "addr3",
                        payload: { addr3: "", maskedOfcAddr3: "", addr3Editable: true },
                    });
                break;
            case "city":
                if (!state.cityEditable)
                    dispatch({
                        actionType: "city",
                        payload: { city: "", maskedOfcCity: "", cityEditable: true },
                    });
                break;
            case "mobile":
                if (!state.mobileEditable)
                    dispatch({
                        actionType: "mobile",
                        payload: { mobile: "", maskedOfcMobile: "", mobileEditable: true },
                    });
                break;
            default:
                break;
        }
    }

    const onDoneTap = async () => {
        console.log("[PLSTPEmploymentAddress] >> [onDoneTap]");

        // Return if button is disabled
        if (state.isContinueDisabled) return;
        if (clearErr) {
            dispatch({
                actionType: clearErr,
                payload: { valid: true, errorMsg: "" },
            });
        }
        const validateResult = { isValid: false, message: "", actionType: "" };
        const employmentAddressData = getFormData();
        Object.assign(validateResult, validateEmploymentAddress(employmentAddressData, {}));
        dispatch({
            actionType: validateResult.actionType,
            payload: { valid: validateResult.isValid, errorMsg: validateResult.message },
        });
        SetClearErr(validateResult.actionType);
        if (!validateResult.isValid) return;

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Apply_PersonalLoan_7",
        });
        let initData = initParams;
        if (!initParams.isSAL && !initParams?.prequal2Status) {
            const prequal2Data = {
                stpRefNo: stpRefNum,
                callType: "INQUERY",
                isLastPage: true,
            };
            const response = await prequalCheck2(prequal2Data);
            switch (response?.data?.code) {
                case 200:
                    initData = { ...initData, prequal2Status: true };
                    checkScoreParty(employmentAddressData, initData);
                    break;
                case 400:
                    const custInfo = {
                        ...customerInfo,
                        shortRefNo: response?.data?.result?.stpRefNo,
                        dateTime: response?.data?.result?.dateTime,
                    };
                    initData = Object.assign(initData, {
                        customerInfo: custInfo,
                    });
                    navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                        ...route.params,
                        initParams: initData,
                    });
                    break;
                case 702:
                case 701:
                case 408:
                    initData = { ...initData, isSAL: true };
                    checkScoreParty(employmentAddressData, initData);
                    break;
                default:
                    showErrorToast({
                        message: response?.data?.message,
                    });
                    break;
            }
        } else {
            checkScoreParty(employmentAddressData, initData);
        }
    };

    const checkScoreParty = (employmentAddressData, initData) => {
        const data = {
            stpRefNo: stpRefNum,
        };
        scorePartyPLSTP(data)
            .then((result) => {
                if (result?.data?.code === 200) {
                    initData = {
                        ...initData,
                        customerRiskRating: result.data?.result?.customerRiskRating,
                    };
                    navToNextScreen(employmentAddressData, initData);
                } else {
                    showErrorToast({
                        message: result?.data?.message,
                    });
                }
            })
            .catch((error) => {
                console.log("[PLSTPEmploymentAddress][checkScoreParty] >> Catch", error);
                showErrorToast({
                    message: error.message,
                });
            });
    };

    const navToNextScreen = (employmentAddressData, initData) => {
        const {
            officeAddress1,
            officeAddress2,
            officeAddress3,
            officeCity,
            officePostcode,
            officePhoneNum,
            officeState,
            officeStateValue,
            mailingAddress,
            mailingAddressValue,
        } = employmentAddressData;
        const data = {
            officeAddress: {
                addressLine1: officeAddress1,
                addressLine2: officeAddress2,
                addressLine3: officeAddress3,
                city: officeCity,
                postCode: officePostcode,
                state: {
                    id: officeStateValue,
                    type: officeState,
                },
            },
            officePhonePrefix: `0${officePhoneNum.substring(0, 2)}`, //Temporary change
            officePhoneNumber: officePhoneNum.substring(2, officePhoneNum.length), //Temporary change
            preferredMailingAddress: {
                id: mailingAddressValue,
                type: mailingAddress,
            },
            stpRefNo: stpRefNum,
        };
        saveEmploymentAddress(data)
            .then((result) => {
                // Navigate to Next screen (ScreenName : PLSTP_REPAYMENT_DETAILS)
                if (result?.data?.code === 200) {
                    const custData = Object.assign(customerInfo, employmentAddressData);
                    initData = { ...initData, customerInfo: custData };
                    navigation.navigate(PLSTP_OTHER_DETAILS, {
                        ...route.params,
                        initParams: initData,
                    });
                } else {
                    showErrorToast({
                        message: result?.data?.message,
                    });
                }
            })
            .catch((error) => {
                console.log("[PLSTPEmploymentAddress][onDoneTap] >> Catch", error);
                showErrorToast({
                    message: error.message,
                });
            });
    };

    const onBackTap = () => {
        console.log("[PLSTPEmploymentAddress] >> [onBackTap]");
        navigation.navigate(PLSTP_EMPLOYMENT_DETAILS, {
            ...route.params,
        });
    };

    const onCloseTap = () => {
        console.log("[PLSTPEmploymentAddress] >> [onCloseTap]");
        navigation.navigate(route?.params?.entryStack || "More", {
            screen: route?.params?.entryScreen || "Apply",
            params: route?.params?.entryParams,
        });
    };

    const getFormData = () => {
        console.log("[PLSTPEmploymentAddress] >> [getFormData]");

        return {
            officeAddress1: state.addr1.trim(),
            officeAddress2: state.addr2.trim(),
            officeAddress3: state.addr3.trim(),
            maskedOfcAddr1: maskAddress(state.maskedOfcAddr1.trim()),
            maskedOfcAddr2: maskAddress(state.maskedOfcAddr2.trim()),
            maskedOfcAddr3: maskAddress(state.maskedOfcAddr3.trim()),
            officeCity: state.city.trim(),
            maskedOfcCity: maskAddress(state.maskedOfcCity.trim()),
            officeState: state.stateField,
            officeStateValue: state.stateValue,
            officePostcode: state.postcode,
            officePhoneNum: state.mobile.trim(),
            maskedOfcMobile: maskMobile(state.maskedOfcMobile.trim()),
            mailingAddress: state.mailingAddr,
            mailingAddressValue: state.mailingAddrValue,
        };
    };

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName="Apply_PersonalLoan_7">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={STEP_7}
                                />
                            }
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView
                            style={Style.scrollViewCls}
                            showsVerticalScrollIndicator={false}
                        >
                            <KeyboardAwareScrollView
                                behavior={Platform.OS == "ios" ? "padding" : ""}
                                enabled
                            >
                                <View style={Style.formContainer}>
                                    {/* Screen Title */}
                                    <Typo
                                        fontSize={20}
                                        lineHeight={30}
                                        fontWeight="300"
                                        textAlign="left"
                                        text={PLSTP_EMPLOYER_TITLE}
                                        style={Style.headerLabelCls}
                                    />

                                    {/* Home address 1 */}
                                    <View style={Style.fieldViewCls}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="left"
                                            text={PLSTP_OFFICE_ADDR1}
                                        />
                                        <LongTextInput
                                            maxLength={30}
                                            isValid={state.addr1Valid}
                                            isValidate
                                            errorMessage={state.addr1ErrorMsg}
                                            numberOfLines={2}
                                            autoCapitalize="none"
                                            value={state.maskedOfcAddr1}
                                            onChangeText={onAddr1Change}
                                            onFocus={() => onEditBtnPressed("addr1")}
                                        />
                                    </View>

                                    {/* Home address 2 */}
                                    <View style={Style.fieldViewCls}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="left"
                                            text={PLSTP_OFFICE_ADDR2}
                                        />
                                        <LongTextInput
                                            maxLength={30}
                                            isValid={state.addr2Valid}
                                            isValidate
                                            errorMessage={state.addr2ErrorMsg}
                                            numberOfLines={2}
                                            autoCapitalize="none"
                                            value={state.maskedOfcAddr2}
                                            onChangeText={onAddr2Change}
                                            onFocus={() => onEditBtnPressed("addr2")}
                                        />
                                    </View>

                                    {/* Home address 3 */}
                                    <View style={Style.fieldViewCls}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="left"
                                            text={PLSTP_OFFICE_ADDR3}
                                        />
                                        <LongTextInput
                                            maxLength={30}
                                            isValid={state.addr3Valid}
                                            isValidate
                                            errorMessage={state.addr3ErrorMsg}
                                            numberOfLines={2}
                                            autoCapitalize="none"
                                            value={state.maskedOfcAddr3}
                                            onChangeText={onAddr3Change}
                                            onFocus={() => onEditBtnPressed("addr3")}
                                        />
                                    </View>

                                    {/* Postcode */}
                                    <View style={Style.fieldViewCls}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="left"
                                            text={PLSTP_POSTCODE}
                                        />
                                        <LongTextInput
                                            maxLength={5}
                                            isValid={state.postcodeValid}
                                            isValidate
                                            errorMessage={state.postcodeErrorMsg}
                                            numberOfLines={2}
                                            autoCapitalize="none"
                                            keyboardType={"number-pad"}
                                            value={state.postcode}
                                            onChangeText={onPostcodeChange}
                                        />
                                    </View>

                                    {/* City */}
                                    <View style={Style.fieldViewCls}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="left"
                                            text={PLSTP_CITY}
                                        />
                                        <LongTextInput
                                            maxLength={30}
                                            isValid={state.cityValid}
                                            isValidate
                                            errorMessage={state.cityErrorMsg}
                                            numberOfLines={2}
                                            autoCapitalize="none"
                                            value={state.maskedOfcCity}
                                            onChangeText={onCityChange}
                                            onFocus={() => onEditBtnPressed("city")}
                                        />
                                    </View>

                                    {/* State */}
                                    <LabeledDropdown
                                        label={PLSTP_STATE}
                                        dropdownValue={state.stateField}
                                        isValid={state.stateValid}
                                        errorMessage={state.stateErrorMsg}
                                        onPress={onStateFieldTap}
                                        style={Style.fieldViewCls}
                                    />

                                    {/* Office Phone Number */}
                                    <View style={Style.fieldViewCls}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="left"
                                            text={PLSTP_OFFICE_PHNO}
                                        />
                                        <LongTextInput
                                            maxLength={10}
                                            isValid={state.mobileValid}
                                            isValidate
                                            errorMessage={state.mobileErrorMsg}
                                            numberOfLines={1}
                                            autoCapitalize="none"
                                            keyboardType={"number-pad"}
                                            value={state.maskedOfcMobile}
                                            prefix="+60"
                                            onChangeText={onMobileChange}
                                            onFocus={() => onEditBtnPressed("mobile")}
                                        />
                                    </View>

                                    {/* Mailing Address */}
                                    <LabeledDropdown
                                        label={PLSTP_MAINLING_ADDR}
                                        dropdownValue={state.mailingAddr}
                                        isValid={state.mailingAddrValid}
                                        errorMessage={state.mailingAddrErrorMsg}
                                        onPress={onMailingAddrFieldTap}
                                        style={Style.fieldViewCls}
                                    />
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={state.isContinueDisabled ? 1 : 0.5}
                                    backgroundColor={state.isContinueDisabled ? DISABLED : YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={PLSTP_SAVE_NEXT}
                                        />
                                    }
                                    onPress={onDoneTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
            {/* State Picker */}
            {state.stateData && (
                <ScrollPickerView
                    showMenu={state.statePicker}
                    selectedIndex={state.statePickerIndex}
                    list={state.stateData}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}
            {/* Mailing Address Picker */}
            {state.mailingAddrData && (
                <ScrollPickerView
                    showMenu={state.mailingAddrPicker}
                    selectedIndex={state.mailingAddrPickerIndex}
                    list={state.mailingAddrData}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}
        </React.Fragment>
    );
}

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    fieldViewCls: {
        marginTop: 25,
    },

    formContainer: {
        marginBottom: 40,
    },

    headerLabelCls: {
        marginTop: 15,
    },

    scrollViewCls: {
        paddingHorizontal: 36,
    },
});

export default PLSTPEmploymentAddress;
