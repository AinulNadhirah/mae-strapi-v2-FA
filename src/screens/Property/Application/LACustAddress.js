/* eslint-disable sonarjs/cognitive-complexity */
import PropTypes from "prop-types";
import React, { useEffect, useReducer, useCallback } from "react";
import { StyleSheet, Platform, View, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import {
    LA_CUST_ADDRESS,
    BANKINGV2_MODULE,
    LA_EMP_DETAILS,
    LA_CONFIRMATION,
    LA_EMP_ADDRESS,
    LA_FINANCING_TYPE,
    LA_TNC,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { LongTextInput } from "@components/Common";
import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import { ScrollPickerView } from "@components/Common/ScrollPickerView";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { logEvent } from "@services/analytics";

import {
    MEDIUM_GREY,
    YELLOW,
    BLACK,
    DISABLED_TEXT,
    DISABLED,
    RED_ERROR,
    GREY_DARK,
    FADE_GREY,
} from "@constants/colors";
import { AMBER, INELGIBLE_OCCUPATION_LIST } from "@constants/data";
import {
    PLEASE_SELECT,
    DONE,
    CANCEL,
    COMMON_ERROR_MSG,
    EXIT_POPUP_TITLE,
    LA_EXIT_POPUP_DESC,
    SAVE,
    DONT_SAVE,
    SAVE_NEXT,
    CONFIRM,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FORM_PROCEED,
    FA_PROPERTY_APPLY_CONF_EDITPERSONAL_DETAILS,
    FA_PROPERTY_APPLY_CURRENT_ADDRESS,
} from "@constants/strings";

import { maskAddress } from "@utils/maskUtils";

import {
    CURRENT_ADDRESS,
    HOME_ADDR_LINE_ONE,
    HOME_ADDR_LINE_THREE,
    HOME_ADDR_LINE_TWO,
    MAILING_ADDR_COUNTRY,
    MAILING_ADDR_LINE_ONE,
    MAILING_ADDR_LINE_THREE,
    MAILING_ADDR_LINE_TWO,
    MAILING_ADDR_SAME,
    STEPUP_MAE_ADDRESS_CITY,
    STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER,
    STEPUP_MAE_ADDRESS_POSTAL,
    STEPUP_MAE_POSTCODE_PLACEHOLDER,
} from "../../../constants/strings";
import { useResetNavigation, getExistingData } from "../Common/PropertyController";
import {
    validateAddressOne,
    validateAddressThree,
    validateAddressTwo,
    validateCity,
    validatePostcode,
} from "../Eligibility/CEController";
import { saveLAInput } from "./LAController";

// Initial state object
const initialState = {
    //stepper info
    stepperInfo: "",

    // Country related
    country: PLEASE_SELECT,
    countryValue: null,
    countryValueIndex: 0,
    countryData: null,
    countryPicker: false,
    countryObj: null,

    // Address 1
    addressOne: "",
    addressOneDisp: "",
    addressOneValid: true,
    addressOneErrorMsg: "",
    addressOneFocus: false,

    // Address 2
    addressTwo: "",
    addressTwoDisp: "",
    addressTwoValid: true,
    addressTwoErrorMsg: "",
    addressTwoFocus: false,

    // Address 3
    addressThree: "",
    addressThreeDisp: "",
    addressThreeValid: true,
    addressThreeErrorMsg: "",
    addressThreeFocus: false,

    // City
    city: "",
    cityDisp: "",
    cityValid: true,
    cityErrorMsg: "",
    cityFocus: false,

    // Postcode
    postcode: "",
    postcodeDisp: "",
    postcodeValid: true,
    postcodeErrorMsg: "",
    postcodeFocus: false,

    // Mailing Country related
    mailCountry: PLEASE_SELECT,
    mailCountryValue: null,
    mailCountryValueIndex: 0,
    mailCountryData: null,
    mailCountryPicker: false,
    mailCountryObj: null,

    // State related
    state: PLEASE_SELECT,
    stateValue: null,
    stateValueIndex: 0,
    stateData: null,
    statePicker: false,
    stateObj: null,
    stateShow: false,

    // Mailing Address 1
    mailAddressOne: "",
    mailAddressOneDisp: "",
    mailAddressOneValid: true,
    mailAddressOneErrorMsg: "",
    mailAddressOneFocus: false,

    // Mailing Address 2
    mailAddressTwo: "",
    mailAddressTwoDisp: "",
    mailAddressTwoValid: true,
    mailAddressTwoErrorMsg: "",
    mailAddressTwoFocus: false,

    // Mailing Address 3
    mailAddressThree: "",
    mailAddressThreeDisp: "",
    mailAddressThreeValid: true,
    mailAddressThreeErrorMsg: "",
    mailAddressThreeFocus: false,

    // Mailing City
    mailCity: "",
    mailCityDisp: "",
    mailCityValid: true,
    mailCityErrorMsg: "",
    mailCityFocus: false,

    // Mailing Postcode
    mailPostcode: "",
    mailPostcodeDisp: "",
    mailPostcodeValid: true,
    mailPostcodeErrorMsg: "",
    mailPostcodeFocus: false,

    // Mailing State related
    mailState: PLEASE_SELECT,
    mailStateValue: null,
    mailStateValueIndex: 0,
    mailStateData: null,
    mailStatePicker: false,
    mailStateObj: null,
    mailStateShow: false,

    // UI Labels
    headerText: "",
    ctaText: SAVE_NEXT,

    // Others
    editFlow: false,
    showExitPopup: false,
    isContinueDisabled: true,
    pickerType: null,
    mailAddressFlag: true,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "SET_HEADER_TEXT":
            return {
                ...state,
                headerText: payload,
            };
        case "HIDE_PICKER":
            return {
                ...state,
                pickerType: null,
                statePicker: false,
                mailStatePicker: false,
                countryPicker: false,
                mailCountryPicker: false,
            };
        case "SHOW_PICKER":
            return {
                ...state,
                pickerType: payload,
                statePicker: payload === "state",
                mailStatePicker: payload === "mailState",
                countryPicker: payload === "country",
                mailCountryPicker: payload === "mailCountry",
            };
        case "SET_PICKER_DATA":
        case "SET_STATE":
        case "SET_MAIL_STATE":
        case "SET_COUNTRY":
        case "SET_MAIL_COUNTRY":
        case "RESET_VALIDATION_ERRORS":
        case "SET_ADDRESS_ONE_ERROR":
        case "SET_MAIL_ADDRESS_ONE_ERROR":
        case "SET_ADDRESS_TWO_ERROR":
        case "SET_MAIL_ADDRESS_TWO_ERROR":
        case "SET_ADDRESS_THREE_ERROR":
        case "SET_MAIL_ADDRESS_THREE_ERROR":
        case "SET_CITY_ERROR":
        case "SET_MAIL_CITY_ERROR":
        case "SET_POSTCODE_ERROR":
        case "SET_MAIL_POSTCODE_ERROR":
        case "SET_INIT_DATA":
        case "SET_ADDRESS_ONE_FOCUS":
        case "SET_ADDRESS_TWO_FOCUS":
        case "SET_CITY_FOCUS":
        case "SET_POSTCODE_FOCUS":
        case "SET_MAIL_ADDRESS_ONE_FOCUS":
        case "SET_MAIL_ADDRESS_TWO_FOCUS":
        case "SET_MAIL_ADDRESS_THREE_FOCUS":
        case "SET_MAIL_CITY_FOCUS":
        case "SET_MAIL_POSTCODE_FOCUS":
        case "INVERSE_MAIL_ADDRESS_FLAG":
        case "SET_STATE_SHOW":
        case "SET_MAIL_STATE_SHOW":
        case "SET_STEPPER_INFO":
            return {
                ...state,
                ...payload,
            };
        case "SET_ADDRESS_ONE":
            return {
                ...state,
                addressOne: payload,
                addressOneDisp: payload,
            };
        case "SET_ADDRESS_TWO":
            return {
                ...state,
                addressTwo: payload,
                addressTwoDisp: payload,
            };
        case "SET_ADDRESS_THREE":
            return {
                ...state,
                addressThree: payload,
                addressThreeDisp: payload,
            };
        case "SET_CITY":
            return {
                ...state,
                city: payload,
                cityDisp: payload,
            };
        case "SET_POSTCODE":
            return {
                ...state,
                postcode: payload,
                postcodeDisp: payload,
            };
        case "SET_MAIL_ADDRESS_ONE":
            return {
                ...state,
                mailAddressOne: payload,
                mailAddressOneDisp: payload,
            };
        case "SET_MAIL_ADDRESS_TWO":
            return {
                ...state,
                mailAddressTwo: payload,
                mailAddressTwoDisp: payload,
            };
        case "SET_MAIL_ADDRESS_THREE":
            return {
                ...state,
                mailAddressThree: payload,
                mailAddressThreeDisp: payload,
            };
        case "SET_MAIL_CITY":
            return {
                ...state,
                mailCity: payload,
                mailCityDisp: payload,
            };
        case "SET_MAIL_POSTCODE":
            return {
                ...state,
                mailPostcode: payload,
                mailPostcodeDisp: payload,
            };
        case "SET_CONTINUE_DISABLED":
            return {
                ...state,
                isContinueDisabled: payload,
            };
        case "SHOW_EXIT_POPUP":
            return {
                ...state,
                showExitPopup: payload,
            };
        default:
            return { ...state };
    }
}

function LACustAddress({ route, navigation }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [resetToDiscover, resetToApplication] = useResetNavigation(navigation);

    const {
        isContinueDisabled,
        addressOne,
        addressTwo,
        addressThree,
        city,
        postcode,
        country,
        countryValue,
        stateShow,
        mailCountry,
        mailCountryValue,
        mailAddressOne,
        mailAddressTwo,
        mailAddressThree,
        mailCity,
        mailPostcode,
        mailState,
        mailAddressFlag,
        mailStateShow,
    } = state;

    useEffect(() => {
        init();
    }, []);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        const basicFieldsFlag =
            addressOne === "" ||
            addressTwo === "" ||
            city === "" ||
            postcode === "" ||
            (countryValue === "MYS" && state.state === PLEASE_SELECT) ||
            country === PLEASE_SELECT;

        if (mailAddressFlag) {
            dispatch({
                actionType: "SET_CONTINUE_DISABLED",
                payload: basicFieldsFlag,
            });
        } else {
            dispatch({
                actionType: "SET_CONTINUE_DISABLED",
                payload:
                    basicFieldsFlag ||
                    mailAddressOne === "" ||
                    mailAddressTwo === "" ||
                    mailCity === "" ||
                    mailPostcode === "" ||
                    (mailCountryValue === "MYS" && mailState === PLEASE_SELECT) ||
                    mailCountry === PLEASE_SELECT,
            });
        }
    }, [
        addressOne,
        addressTwo,
        addressThree,
        city,
        state.state,
        postcode,
        country,
        countryValue,
        mailCountry,
        mailCountryValue,
        mailAddressOne,
        mailAddressTwo,
        mailAddressThree,
        mailCity,
        mailPostcode,
        mailState,
        mailAddressFlag,
    ]);

    // Show state field only if country is Malaysia
    useEffect(() => {
        dispatch({
            actionType: "SET_STATE_SHOW",
            payload: {
                stateShow: countryValue === "MYS",
            },
        });
    }, [countryValue]);

    // Show mailing state field only if country is Malaysia
    useEffect(() => {
        dispatch({
            actionType: "SET_MAIL_STATE_SHOW",
            payload: {
                mailStateShow: mailCountryValue === "MYS",
            },
        });
    }, [mailCountryValue]);

    const init = useCallback(() => {
        console.log("[LACustAddress] >> [init]");

        // Populate Picker Data
        setPickerData();

        // Prepopulate any existing details
        prepopulateData();
    }, [route, navigation]);

    function onBackTap() {
        console.log("[LACustAddress] >> [onBackTap]");

        navigation.goBack();
    }

    function onCloseTap() {
        console.log("[LACustAddress] >> [onCloseTap]");

        // Show Exit Popup
        dispatch({
            actionType: "SHOW_EXIT_POPUP",
            payload: true,
        });
    }

    function setPickerData() {
        console.log("[LACustAddress] >> [setPickerData]");

        const masterData = route.params?.masterData ?? {};

        dispatch({
            actionType: "SET_PICKER_DATA",
            payload: {
                countryData: masterData?.country ?? null,
                stateData: masterData?.state ?? null,
                mailStateData: masterData?.state ?? null,
                mailCountryData: masterData?.country ?? null,
            },
        });
    }

    function prepopulateData() {
        console.log("[LACustAddress] >> [prepopulateData]");

        const navParams = route?.params ?? {};
        const masterData = navParams?.masterData ?? {};
        const mdmData = navParams?.mdmData ?? {};
        const savedData = navParams?.savedData ?? {};
        const editFlow = navParams?.editFlow ?? false;

        const {
            address1,
            address2,
            address3,
            homeCity,
            custPostcode,
            custState,
            custCountry,
            mailingAddress1,
            mailingAddress2,
            mailingAddress3,
            mailingCity,
            mailingPostcode,
            mailingState,
            mailingCountry,
            isMailingAddr,
        } = getAddressData(navParams, savedData, mdmData, editFlow);
        const headerText = navParams?.headerText ?? "";
        const tempMailAddressFlag = !(isMailingAddr && isMailingAddr === "N");

        const maskedAddress1 = maskAddress(address1);
        const maskedAddress2 = maskAddress(address2);
        const maskedAddress3 = maskAddress(address3);
        const maskedCity = maskAddress(homeCity);

        // Set Header Text
        dispatch({
            actionType: "SET_HEADER_TEXT",
            payload: editFlow ? "Edit personal details" : headerText,
        });

        dispatch({
            actionType: "SET_INIT_DATA",
            payload: {
                addressOne: address1,
                addressTwo: address2,
                addressThree: address3,
                city: homeCity,
                postcode: custPostcode,

                addressOneDisp: maskedAddress1,
                addressTwoDisp: maskedAddress2,
                addressThreeDisp: maskedAddress3,
                cityDisp: maskedCity,
                postcodeDisp: custPostcode,

                mailAddressFlag: tempMailAddressFlag,

                editFlow,

                ctaText: editFlow ? CONFIRM : SAVE_NEXT,
            },
        });

        // State
        if (custState) {
            const stateSelect = getExistingData(custState, masterData?.state ?? null);
            dispatch({
                actionType: "SET_STATE",
                payload: {
                    state: stateSelect.name,
                    stateValue: stateSelect.value,
                    stateObj: stateSelect.obj,
                    stateValueIndex: stateSelect.index,
                },
            });
        }

        // Customer Country
        if (custCountry) {
            const countrySelect = getExistingData(custCountry, masterData?.country ?? null);
            dispatch({
                actionType: "SET_COUNTRY",
                payload: {
                    country: countrySelect.name,
                    countryValue: countrySelect.value,
                    countryObj: countrySelect.obj,
                    countryValueIndex: countrySelect.index,
                },
            });
        }

        // Set Mailing Address details if applicable
        if (!tempMailAddressFlag) {
            const maskedMailAddress1 = maskAddress(mailingAddress1);
            const maskedMailAddress2 = maskAddress(mailingAddress2);
            const maskedMailAddress3 = maskAddress(mailingAddress3);
            const maskedMailCity = maskAddress(mailingCity);

            dispatch({
                actionType: "SET_INIT_DATA",
                payload: {
                    mailAddressOne: mailingAddress1,
                    mailAddressTwo: mailingAddress2,
                    mailAddressThree: mailingAddress3,
                    mailCity: mailingCity,
                    mailPostcode: mailingPostcode,

                    mailAddressOneDisp: maskedMailAddress1,
                    mailAddressTwoDisp: maskedMailAddress2,
                    mailAddressThreeDisp: maskedMailAddress3,
                    mailCityDisp: maskedMailCity,
                    mailPostcodeDisp: postcode,
                },
            });

            // Mailing State
            if (mailingState) {
                const mailStateSelect = getExistingData(mailingState, masterData?.state ?? null);
                dispatch({
                    actionType: "SET_MAIL_STATE",
                    payload: {
                        mailState: mailStateSelect.name,
                        mailStateValue: mailStateSelect.value,
                        mailStateObj: mailStateSelect.obj,
                        mailStateValueIndex: mailStateSelect.index,
                    },
                });
            }

            // Mailing Country
            if (mailingCountry) {
                const countrySelect = getExistingData(mailingCountry, masterData?.country ?? null);
                dispatch({
                    actionType: "SET_MAIL_COUNTRY",
                    payload: {
                        mailCountry: countrySelect.name,
                        mailCountryValue: countrySelect.value,
                        mailCountryObj: countrySelect.obj,
                        mailCountryValueIndex: countrySelect.index,
                    },
                });
            }
        }

        // stepper info
        let currentStep = navParams?.currentStep;
        currentStep = currentStep + 1;
        const totalSteps = navParams?.totalSteps;
        const stepperInfo =
            currentStep && currentStep <= totalSteps ? `Step ${currentStep} of ${totalSteps}` : "";
        dispatch({
            actionType: "SET_STEPPER_INFO",
            payload: {
                stepperInfo,
            },
        });

        const screenName = editFlow
            ? FA_PROPERTY_APPLY_CONF_EDITPERSONAL_DETAILS
            : FA_PROPERTY_APPLY_CURRENT_ADDRESS;
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName,
        });
    }

    function getAddressData(navParams, savedData, mdmData, editFlow) {
        console.log("[LACustAddress] >> [getAddressData]");

        // isMailingAddr: mailAddressFlag ? "Y" : "N",

        if (editFlow) {
            return {
                address1: navParams?.correspondenseAddr1 ?? "",
                address2: navParams?.correspondenseAddr2 ?? "",
                address3: navParams?.correspondenseAddr3 ?? "",
                homeCity: navParams?.correspondenseCity ?? "",
                custPostcode: navParams?.correspondensePostCode ?? "",
                custState: navParams?.correspondenseState ?? "",
                custCountry: navParams?.correspondenseCountry ?? "",

                mailingAddress1: navParams?.mailingAddr1 ?? "",
                mailingAddress2: navParams?.mailingAddr2 ?? "",
                mailingAddress3: navParams?.mailingAddr3 ?? "",
                mailingCity: navParams?.mailingCity ?? "",
                mailingPostcode: navParams?.mailingPostCode ?? "",
                mailingState: navParams?.mailingState ?? "",
                mailingCountry: navParams?.mailingCountry ?? "",
                isMailingAddr: navParams?.isMailingAddr,
            };
        } else {
            return {
                address1: savedData?.correspondenseAddr1 ?? mdmData?.addr1,
                address2: savedData?.correspondenseAddr2 ?? mdmData?.addr2,
                address3: savedData?.correspondenseCity ?? mdmData?.addr3,
                homeCity: savedData?.correspondenseCity ?? mdmData?.homeCity,
                custPostcode: savedData?.correspondensePostCode ?? mdmData?.postCode,
                custState: savedData?.correspondenseState ?? mdmData?.state,
                custCountry: navParams?.correspondenseCountry ?? mdmData?.country,

                mailingAddress1: savedData?.mailingAddr1 ?? mdmData?.mailingAddr1,
                mailingAddress2: savedData?.mailingAddr2 ?? mdmData?.mailingAddr2,
                mailingAddress3: savedData?.mailingCity ?? mdmData?.mailingAddr3,
                mailingCity: savedData?.mailingCity ?? mdmData?.mailingCity,
                mailingPostcode: savedData?.mailingPostCode ?? mdmData?.mailingPostCode,
                mailingState: savedData?.mailingState ?? mdmData?.mailingState,
                mailingCountry: savedData?.mailingCountry ?? mdmData?.mailingCountry,
                isMailingAddr: savedData?.isMailingAddr ?? mdmData?.mailingAddrInd,
            };
        }
    }

    function resetAddressFields(countryCode) {
        console.log("[LACustAddress] >> [resetAddressFields]" + countryCode);
        if (countryCode === "MYS") {
            const navParams = route?.params ?? {};
            const masterData = navParams?.masterData ?? {};
            const mdmData = navParams?.mdmData ?? {};
            const savedData = navParams?.savedData ?? {};
            const editFlow = navParams?.editFlow ?? false;

            const { address1, address2, address3, homeCity, custPostcode, custState } =
                getAddressData(navParams, savedData, mdmData, editFlow);

            const maskedAddress1 = maskAddress(address1);
            const maskedAddress2 = maskAddress(address2);
            const maskedAddress3 = maskAddress(address3);
            const maskedCity = maskAddress(homeCity);

            dispatch({
                actionType: "SET_INIT_DATA",
                payload: {
                    addressOne: address1,
                    addressTwo: address2,
                    addressThree: address3,
                    city: homeCity,
                    postcode: custPostcode,

                    addressOneDisp: maskedAddress1,
                    addressTwoDisp: maskedAddress2,
                    addressThreeDisp: maskedAddress3,
                    cityDisp: maskedCity,
                    postcodeDisp: custPostcode,
                },
            });

            // State
            if (custState) {
                const stateSelect = getExistingData(custState, masterData?.state ?? null);
                dispatch({
                    actionType: "SET_STATE",
                    payload: {
                        state: stateSelect.name,
                        stateValue: stateSelect.value,
                        stateObj: stateSelect.obj,
                        stateValueIndex: stateSelect.index,
                    },
                });
            }
        } else {
            //for country other than MYS then reset address fields
            dispatch({
                actionType: "SET_INIT_DATA",
                payload: {
                    addressOne: "",
                    addressTwo: "",
                    addressThree: "",
                    city: "",
                    postcode: "",

                    addressOneDisp: "",
                    addressTwoDisp: "",
                    cityDisp: "",
                    postcodeDisp: "",
                },
            });
        }
    }

    function resetMailingAddressFields(countryCode) {
        console.log("[LACustAddress] >> [resetMailingAddressFields]");
        if (countryCode === "MYS") {
            const navParams = route?.params ?? {};
            const masterData = navParams?.masterData ?? {};
            const mdmData = navParams?.mdmData ?? {};
            const savedData = navParams?.savedData ?? {};
            const editFlow = navParams?.editFlow ?? false;

            const {
                mailingAddress1,
                mailingAddress2,
                mailingAddress3,
                mailingCity,
                mailingPostcode,
                mailingState,
            } = getAddressData(navParams, savedData, mdmData, editFlow);

            const maskedMailAddress1 = maskAddress(mailingAddress1);
            const maskedMailAddress2 = maskAddress(mailingAddress2);
            const maskedMailAddress3 = maskAddress(mailingAddress3);
            const maskedMailCity = maskAddress(mailingCity);

            dispatch({
                actionType: "SET_INIT_DATA",
                payload: {
                    mailAddressOne: mailingAddress1,
                    mailAddressTwo: mailingAddress2,
                    mailAddressThree: mailingAddress3,
                    mailCity: mailingCity,
                    mailPostcode: mailingPostcode,

                    mailAddressOneDisp: maskedMailAddress1,
                    mailAddressTwoDisp: maskedMailAddress2,
                    mailAddressThreeDisp: maskedMailAddress3,
                    mailCityDisp: maskedMailCity,
                    mailPostcodeDisp: mailingPostcode,
                },
            });

            // Mailing State
            if (mailingState) {
                const mailStateSelect = getExistingData(mailingState, masterData?.state ?? null);
                dispatch({
                    actionType: "SET_MAIL_STATE",
                    payload: {
                        mailState: mailStateSelect.name,
                        mailStateValue: mailStateSelect.value,
                        mailStateObj: mailStateSelect.obj,
                        mailStateValueIndex: mailStateSelect.index,
                    },
                });
            }
        } else {
            //for country other than MYS then reset address fields
            dispatch({
                actionType: "SET_INIT_DATA",
                payload: {
                    mailAddressOne: "",
                    mailAddressTwo: "",
                    mailAddressThree: "",
                    mailCity: "",
                    mailPostcode: "",

                    mailAddressOneDisp: "",
                    mailAddressTwoDisp: "",
                    mailAddressThreeDisp: "",
                    mailCityDisp: "",
                    mailPostcodeDisp: "",
                },
            });
        }
    }

    function onPickerCancel() {
        console.log("[LACustAddress] >> [onPickerCancel]");

        dispatch({
            actionType: "HIDE_PICKER",
            payload: true,
        });
    }

    function onPickerDone(item, index) {
        console.log("[LACustAddress] >> [onPickerDone]");

        const { pickerType } = state;

        switch (pickerType) {
            case "country":
                dispatch({
                    actionType: "SET_COUNTRY",
                    payload: {
                        country: item?.name ?? PLEASE_SELECT,
                        countryValue: item?.value ?? null,
                        countryObj: item,
                        countryValueIndex: index,
                    },
                });
                resetAddressFields(item?.value);
                break;
            case "state":
                dispatch({
                    actionType: "SET_STATE",
                    payload: {
                        state: item?.name ?? PLEASE_SELECT,
                        stateValue: item?.value ?? null,
                        stateObj: item,
                        stateValueIndex: index,
                    },
                });
                break;
            case "mailCountry":
                dispatch({
                    actionType: "SET_MAIL_COUNTRY",
                    payload: {
                        mailCountry: item?.name ?? PLEASE_SELECT,
                        mailCountryValue: item?.value ?? null,
                        mailCountryObj: item,
                        mailCountryValueIndex: index,
                    },
                });
                resetMailingAddressFields(item?.value);
                break;
            case "mailState":
                dispatch({
                    actionType: "SET_MAIL_STATE",
                    payload: {
                        mailState: item?.name ?? PLEASE_SELECT,
                        mailStateValue: item?.value ?? null,
                        mailStateObj: item,
                        mailStateValueIndex: index,
                    },
                });
                break;
            default:
                break;
        }

        // Close picker
        onPickerCancel();
    }

    function onStateTap() {
        console.log("[LACustAddress] >> [onStateTap]");

        dispatch({
            actionType: "SHOW_PICKER",
            payload: "state",
        });
    }

    function onCountryTap() {
        console.log("[LACustAddress] >> [onCountryTap]");

        dispatch({
            actionType: "SHOW_PICKER",
            payload: "country",
        });
    }

    function onMailStateTap() {
        console.log("[LACustAddress] >> [onMailStateTap]");

        dispatch({
            actionType: "SHOW_PICKER",
            payload: "mailState",
        });
    }

    function onAddressOneChange(value) {
        dispatch({
            actionType: "SET_ADDRESS_ONE",
            payload: value,
        });
    }

    function onAddressTwoChange(value) {
        dispatch({
            actionType: "SET_ADDRESS_TWO",
            payload: value,
        });
    }

    function onAddressThreeChange(value) {
        dispatch({
            actionType: "SET_ADDRESS_THREE",
            payload: value,
        });
    }

    function onCityChange(value) {
        dispatch({
            actionType: "SET_CITY",
            payload: value,
        });
    }

    function onPostcodeChange(value) {
        dispatch({
            actionType: "SET_POSTCODE",
            payload: value,
        });
    }

    function onMailAddressOneChange(value) {
        dispatch({
            actionType: "SET_MAIL_ADDRESS_ONE",
            payload: value,
        });
    }

    function onMailAddressTwoChange(value) {
        dispatch({
            actionType: "SET_MAIL_ADDRESS_TWO",
            payload: value,
        });
    }

    function onMailAddressThreeChange(value) {
        dispatch({
            actionType: "SET_MAIL_ADDRESS_THREE",
            payload: value,
        });
    }

    function onMailCityChange(value) {
        dispatch({
            actionType: "SET_MAIL_CITY",
            payload: value,
        });
    }

    function onMailPostcodeChange(value) {
        dispatch({
            actionType: "SET_MAIL_POSTCODE",
            payload: value,
        });
    }

    function onMailingCountryTap() {
        console.log("[LACustAddress] >> [onMailingCountryTap]");
        dispatch({
            actionType: "SHOW_PICKER",
            payload: "mailCountry",
        });
    }

    function onAddressOneFocus() {
        if (!state.addressOneFocus) {
            dispatch({
                actionType: "SET_ADDRESS_ONE_FOCUS",
                payload: {
                    addressOne: "",
                    addressOneDisp: "",
                    addressOneFocus: true,
                },
            });
        }
    }

    function onAddressTwoFocus() {
        if (!state.addressTwoFocus) {
            dispatch({
                actionType: "SET_ADDRESS_TWO_FOCUS",
                payload: {
                    addressTwo: "",
                    addressTwoDisp: "",
                    addressTwoFocus: true,
                },
            });
        }
    }

    function onAddressThreeFocus() {
        if (!state.addressTwoFocus) {
            dispatch({
                actionType: "SET_ADDRESS_TWO_FOCUS",
                payload: {
                    addressThree: "",
                    addressThreeDisp: "",
                    addressThreeFocus: true,
                },
            });
        }
    }

    function onCityFocus() {
        if (!state.cityFocus) {
            dispatch({
                actionType: "SET_CITY_FOCUS",
                payload: {
                    city: "",
                    cityDisp: "",
                    cityFocus: true,
                },
            });
        }
    }

    function onPostcodeFocus() {
        if (!state.postcodeFocus) {
            dispatch({
                actionType: "SET_POSTCODE_FOCUS",
                payload: {
                    postcode: "",
                    postcodeDisp: "",
                    postcodeFocus: true,
                },
            });
        }
    }

    function onMailAddressOneFocus() {
        if (!state.mailAddressOneFocus) {
            dispatch({
                actionType: "SET_MAIL_ADDRESS_ONE_FOCUS",
                payload: {
                    mailAddressOne: "",
                    mailAddressOneDisp: "",
                    mailAddressOneFocus: true,
                },
            });
        }
    }

    function onMailAddressTwoFocus() {
        if (!state.mailAddressTwoFocus) {
            dispatch({
                actionType: "SET_MAIL_ADDRESS_TWO_FOCUS",
                payload: {
                    mailAddressTwo: "",
                    mailAddressTwoDisp: "",
                    mailAddressTwoFocus: true,
                },
            });
        }
    }

    function onMailAddressThreeFocus() {
        if (!state.mailAddressTwoFocus) {
            dispatch({
                actionType: "SET_MAIL_ADDRESS_THREE_FOCUS",
                payload: {
                    mailAddressThree: "",
                    mailAddressThreeDisp: "",
                    mailAddressThreeFocus: true,
                },
            });
        }
    }

    function onMailCityFocus() {
        if (!state.mailCityFocus) {
            dispatch({
                actionType: "SET_MAIL_CITY_FOCUS",
                payload: {
                    mailCity: "",
                    mailCityDisp: "",
                    mailCityFocus: true,
                },
            });
        }
    }

    function onMailPostcodeFocus() {
        if (!state.mailPostcodeFocus) {
            dispatch({
                actionType: "SET_MAIL_POSTCODE_FOCUS",
                payload: {
                    mailPostcode: "",
                    mailPostcodeDisp: "",
                    mailPostcodeFocus: true,
                },
            });
        }
    }

    function onRadioBtnTap() {
        console.log("[LACustAddress] >> [onRadioBtnTap]");

        dispatch({
            actionType: "INVERSE_MAIL_ADDRESS_FLAG",
            payload: {
                mailAddressFlag: !mailAddressFlag,
            },
        });
    }

    async function onExitPopupSave() {
        console.log("[LACustAddress] >> [onExitPopupSave]");

        // Hide popup
        closeExitPopup();

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveLAInput({
            screenName: LA_CUST_ADDRESS,
            formData,
            navParams: route?.params,
        });

        if (success) {
            resetToApplication();
        } else {
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
        }
    }

    function onExitPopupDontSave() {
        console.log("[LACustAddress] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();

        resetToDiscover();
    }

    function closeExitPopup() {
        console.log("[LACustAddress] >> [closeExitPopup]");

        dispatch({
            actionType: "SHOW_EXIT_POPUP",
            payload: false,
        });
    }

    function resetValidationErrors() {
        console.log("[LACustAddress] >> [resetValidationErrors]");

        dispatch({
            actionType: "RESET_VALIDATION_ERRORS",
            payload: {
                addressOneValid: true,
                addressOneErrorMsg: "",
                addressTwoValid: true,
                addressTwoErrorMsg: "",
                addressThreeValid: true,
                addressThreeErrorMsg: "",
                cityValid: true,
                cityErrorMsg: "",
                postcodeValid: true,
                postcodeErrorMsg: "",
            },
        });
    }

    function resetMailingValidationErrors() {
        console.log("[LACustAddress] >> [resetMailingValidationErrors]");

        dispatch({
            actionType: "RESET_VALIDATION_ERRORS",
            payload: {
                mailAddressOneValid: true,
                mailAddressOneErrorMsg: "",
                mailAddressTwoValid: true,
                mailAddressTwoErrorMsg: "",
                mailAddressThreeValid: true,
                mailAddressThreeErrorMsg: "",
                mailCityValid: true,
                mailCityErrorMsg: "",
                mailPostcodeValid: true,
                mailPostcodeErrorMsg: "",
            },
        });
    }

    function validateFormDetails() {
        console.log("[LACustAddress] >> [validateFormDetails]");

        // Reset existing error state
        resetValidationErrors();

        // Address One
        const { isValid: addressOneValid, message: addressOneErrorMsg } =
            validateAddressOne(addressOne);
        if (!addressOneValid) {
            dispatch({
                actionType: "SET_ADDRESS_ONE_ERROR",
                payload: { addressOneValid, addressOneErrorMsg },
            });
        }

        // Address Two
        const { isValid: addressTwoValid, message: addressTwoErrorMsg } =
            validateAddressTwo(addressTwo);
        if (!addressTwoValid) {
            dispatch({
                actionType: "SET_ADDRESS_TWO_ERROR",
                payload: { addressTwoValid, addressTwoErrorMsg },
            });
        }

        // Address Three
        const { isValid: addressThreeValid, message: addressThreeErrorMsg } =
            validateAddressThree(addressThree);
        if (!addressThreeValid) {
            dispatch({
                actionType: "SET_ADDRESS_THREE_ERROR",
                payload: { addressThreeValid, addressThreeErrorMsg },
            });
        }

        // City
        const { isValid: cityValid, message: cityErrorMsg } = validateCity(city);
        if (!cityValid) {
            dispatch({
                actionType: "SET_CITY_ERROR",
                payload: { cityValid, cityErrorMsg },
            });
        }

        // Post Code
        const { isValid: postcodeValid, message: postcodeErrorMsg } = validatePostcode(
            postcode,
            state.countryValue
        );
        if (!postcodeValid) {
            dispatch({
                actionType: "SET_POSTCODE_ERROR",
                payload: { postcodeValid, postcodeErrorMsg },
            });
        }

        return !(!addressOneValid ||
            !addressTwoValid ||
            !addressThreeValid ||
            !cityValid ||
            !postcodeValid);
    }

    function validateMailingFormDetails() {
        console.log("[LACustAddress] >> [validateFormDetails]");
        // Reset existing error state
        resetMailingValidationErrors();

        // Mailing Address One
        const { isValid: mailAddressOneValid, message: mailAddressOneErrorMsg } =
            validateAddressOne(mailAddressOne);
        if (!mailAddressOneValid) {
            dispatch({
                actionType: "SET_MAIL_ADDRESS_ONE_ERROR",
                payload: { mailAddressOneValid, mailAddressOneErrorMsg },
            });
        }

        // Mailing Address Two
        const { isValid: mailAddressTwoValid, message: mailAddressTwoErrorMsg } =
            validateAddressTwo(mailAddressTwo);
        if (!mailAddressTwoValid) {
            dispatch({
                actionType: "SET_MAIL_ADDRESS_TWO_ERROR",
                payload: { mailAddressTwoValid, mailAddressTwoErrorMsg },
            });
        }

        // Mailing Address Three
        const { isValid: mailAddressThreeValid, message: mailAddressThreeErrorMsg } =
            validateAddressThree(mailAddressThree);
        if (!mailAddressThreeValid) {
            dispatch({
                actionType: "SET_MAIL_ADDRESS_THREE_ERROR",
                payload: { mailAddressThreeValid, mailAddressThreeErrorMsg },
            });
        }

        // Mailing City
        const { isValid: mailCityValid, message: mailCityErrorMsg } = validateCity(mailCity);
        if (!mailCityValid) {
            dispatch({
                actionType: "SET_MAIL_CITY_ERROR",
                payload: { mailCityValid, mailCityErrorMsg },
            });
        }

        //Mailing Post Code
        const { isValid: mailPostcodeValid, message: mailPostcodeErrorMsg } = validatePostcode(
            mailPostcode,
            state.mailCountryValue
        );
        if (!mailPostcodeValid) {
            dispatch({
                actionType: "SET_MAIL_POSTCODE_ERROR",
                payload: { mailPostcodeValid, mailPostcodeErrorMsg },
            });
        }

        return !(!mailPostcodeValid ||
            !mailAddressOneValid ||
            !mailAddressTwoValid ||
            !mailAddressThreeValid ||
            !mailCityValid);
    }

    const isOccupationSpecificCateg = (value) => {
        //student/house wife/husband/Retiree or outside labour
        return INELGIBLE_OCCUPATION_LIST.includes(value);
    };

    async function onContinue() {
        console.log("[LACustAddress] >> [onContinue]");

        const navParams = route?.params ?? {};
        const occupation = navParams?.occupation ?? navParams?.savedData?.occupation;
        const isOccupationHideScreen = isOccupationSpecificCateg(occupation);

        // Return if form validation fails
        const isFormValid = validateFormDetails();

        if (!mailAddressFlag) {
            const isMailingFormValid = validateMailingFormDetails();
            if (!isMailingFormValid || !isFormValid) {
                return;
            }
        } else if (!isFormValid) return;
        let currentStep = navParams?.currentStep;
        currentStep = currentStep + 1;

        // Retrieve form data
        const formData = getFormData();

        if (state.editFlow) {
            // Navigate to Confirmation screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: LA_CONFIRMATION,
                params: {
                    ...navParams,
                    ...formData,
                    updateData: true,
                    editScreenName: LA_CUST_ADDRESS,
                },
            });
        } else {
            // Save Form Data in DB before moving to next screen
            await saveLAInput({
                screenName: LA_CUST_ADDRESS,
                formData,
                navParams,
            });

            if (isOccupationHideScreen) {
                let currentStep = navParams?.currentStep;
                currentStep = currentStep + 1;
                const totalSteps = navParams?.totalSteps ?? 7;
                const newTotalSteps = isOccupationHideScreen ? totalSteps - 1 : totalSteps;
                const eligibilityStatus = navParams?.eligibilityStatus;

                if (eligibilityStatus === AMBER) {
                    // Navigate to LA_TNC screen

                    navigation.navigate(BANKINGV2_MODULE, {
                        screen: isOccupationHideScreen ? LA_TNC : LA_EMP_ADDRESS,
                        params: {
                            ...navParams,
                            ...formData,
                            currentStep,
                            totalSteps: newTotalSteps,
                        },
                    });
                } else {
                    // Navigate to Financing Type screen
                    // If occupation is specific category(Employer Address is not required) then Navigate to Financing Type Screen
                    navigation.navigate(BANKINGV2_MODULE, {
                        screen: LA_FINANCING_TYPE,
                        params: {
                            ...navParams,
                            ...formData,
                            currentStep,
                            totalSteps: newTotalSteps,
                        },
                    });
                }
            } else {
                // Navigate to Employer Details screen
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: LA_EMP_DETAILS,
                    params: {
                        ...navParams,
                        ...formData,
                        currentStep,
                    },
                });
            }
        }

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_PROPERTY_APPLY_CURRENT_ADDRESS,
        });
    }

    function getFormData() {
        console.log("[LACustAddress] >> [getFormData]");

        return {
            correspondenseAddr1: addressOne,
            correspondenseAddr2: addressTwo,
            correspondenseAddr3: addressThree,
            correspondenseCity: city,
            correspondensePostCode: postcode,
            correspondenseState: stateShow ? state.stateValue : "",
            correspondenseCountry: state.countryValue,
            isMailingAddr: mailAddressFlag ? "Y" : "N",
            mailingAddr1: mailAddressOne,
            mailingAddr2: mailAddressTwo,
            mailingAddr3: mailAddressThree,
            mailingCity: mailCity,
            mailingPostCode: mailPostcode,
            mailingState: mailStateShow ? state.mailStateValue : "",
            mailingCountry: mailCountryValue,
        };
    }

    return (
        <>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                state.editFlow
? (
                                    <></>
                                )
: (
                                    <Typo
                                        text={state.stepperInfo}
                                        lineHeight={16}
                                        fontSize={12}
                                        fontWeight="600"
                                        color={FADE_GREY}
                                    />
                                )
                            }
                            headerRightElement={
                                state.editFlow ? <></> : <HeaderCloseButton onPress={onCloseTap} />
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <>
                        <KeyboardAwareScrollView
                            behavior={Platform.OS === "ios" ? "padding" : ""}
                            enabled
                            showsVerticalScrollIndicator={false}
                            style={Style.scrollViewCls}
                        >
                            {/* Property - Unit Type Name */}
                            <Typo
                                fontWeight="600"
                                lineHeight={24}
                                text={state.headerText}
                                numberOfLines={2}
                                textAlign="left"
                            />

                            {/* Header */}
                            {!state.editFlow && (
                                <Typo
                                    fontSize={20}
                                    fontWeight="300"
                                    lineHeight={28}
                                    style={Style.headerText}
                                    text={CURRENT_ADDRESS}
                                    textAlign="left"
                                />
                            )}

                            {/* Country */}
                            <LabeledDropdown
                                label="Country"
                                dropdownValue={state.country}
                                onPress={onCountryTap}
                                style={Style.fieldViewCls}
                            />

                            {/* Address line 1 */}
                            <View style={Style.fieldViewCls}>
                                <Typo lineHeight={18} textAlign="left" text={HOME_ADDR_LINE_ONE} />
                                <LongTextInput
                                    minLength={5}
                                    maxLength={40}
                                    isValidate
                                    isValid={state.addressOneValid}
                                    errorMessage={state.addressOneErrorMsg}
                                    value={state.addressOneDisp}
                                    placeholder={STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER}
                                    numberOfLines={2}
                                    onChangeText={onAddressOneChange}
                                    onFocus={onAddressOneFocus}
                                />
                            </View>

                            {/* Address line 2 */}
                            <View style={Style.fieldViewCls}>
                                <Typo lineHeight={18} textAlign="left" text={HOME_ADDR_LINE_TWO} />
                                <LongTextInput
                                    minLength={5}
                                    maxLength={40}
                                    isValidate
                                    isValid={state.addressTwoValid}
                                    errorMessage={state.addressTwoErrorMsg}
                                    value={state.addressTwoDisp}
                                    placeholder={STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER}
                                    numberOfLines={2}
                                    onChangeText={onAddressTwoChange}
                                    onFocus={onAddressTwoFocus}
                                />
                            </View>

                            {/* Address line 3 */}
                            <View style={Style.fieldViewCls}>
                                <Typo
                                    lineHeight={18}
                                    textAlign="left"
                                    text={HOME_ADDR_LINE_THREE}
                                />
                                <LongTextInput
                                    minLength={5}
                                    maxLength={40}
                                    isValidate
                                    isValid={state.addressThreeValid}
                                    errorMessage={state.addressThreeErrorMsg}
                                    value={state.addressThreeDisp}
                                    placeholder={STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER}
                                    numberOfLines={2}
                                    onChangeText={onAddressThreeChange}
                                    onFocus={onAddressThreeFocus}
                                />
                            </View>

                            {/* City */}
                            <View style={Style.fieldViewCls}>
                                <Typo
                                    lineHeight={18}
                                    textAlign="left"
                                    text={STEPUP_MAE_ADDRESS_CITY}
                                />
                                <LongTextInput
                                    minLength={1}
                                    maxLength={40}
                                    isValidate
                                    isValid={state.cityValid}
                                    errorMessage={state.cityErrorMsg}
                                    value={state.cityDisp}
                                    placeholder={STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER}
                                    numberOfLines={2}
                                    onChangeText={onCityChange}
                                    onFocus={onCityFocus}
                                />
                            </View>

                            {/* Postcode */}
                            <View style={Style.fieldViewCls}>
                                <Typo
                                    lineHeight={18}
                                    textAlign="left"
                                    text={STEPUP_MAE_ADDRESS_POSTAL}
                                />
                                <TextInput
                                    minLength={1}
                                    maxLength={8}
                                    isValidate
                                    isValid={state.postcodeValid}
                                    errorMessage={state.postcodeErrorMsg}
                                    value={state.postcodeDisp}
                                    placeholder={STEPUP_MAE_POSTCODE_PLACEHOLDER}
                                    blurOnSubmit
                                    returnKeyType="done"
                                    onChangeText={onPostcodeChange}
                                    onFocus={onPostcodeFocus}
                                />
                            </View>

                            {/* State */}
                            {stateShow && (
                                <LabeledDropdown
                                    label="State"
                                    dropdownValue={state.state}
                                    onPress={onStateTap}
                                    style={Style.fieldViewCls}
                                />
                            )}

                            {/* Radio Button */}
                            <TouchableOpacity
                                style={Style.fieldViewCls}
                                activeOpacity={1}
                                onPress={onRadioBtnTap}
                            >
                                {mailAddressFlag
                            ? (
                                    <RadioChecked
                                        label={MAILING_ADDR_SAME}
                                        paramContainerCls={Style.radioContainerStyle}
                                        paramLabelCls={Style.radioLabelCls}
                                    />
                                )
                            : (
                                    <RadioUnchecked
                                        label={MAILING_ADDR_SAME}
                                        paramContainerCls={Style.radioContainerStyle}
                                        paramLabelCls={Style.radioLabelCls}
                                    />
                                )}
                            </TouchableOpacity>

                            {!mailAddressFlag && (
                                <>
                                    {/* Mailing Country */}
                                    <LabeledDropdown
                                        label={MAILING_ADDR_COUNTRY}
                                        dropdownValue={state.mailCountry}
                                        onPress={onMailingCountryTap}
                                        style={Style.fieldViewCls}
                                    />

                                    {/* Mailing Address line 1 */}
                                    <View style={Style.fieldViewCls}>
                                        <Typo
                                            lineHeight={18}
                                            textAlign="left"
                                            text={MAILING_ADDR_LINE_ONE}
                                        />
                                        <LongTextInput
                                            minLength={5}
                                            maxLength={40}
                                            isValidate
                                            isValid={state.mailAddressOneValid}
                                            errorMessage={state.mailAddressOneErrorMsg}
                                            value={mailAddressOne}
                                            placeholder={STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER}
                                            numberOfLines={2}
                                            onChangeText={onMailAddressOneChange}
                                            onFocus={onMailAddressOneFocus}
                                        />
                                    </View>
                                    {/* Mailing Address line 2 */}
                                    <View style={Style.fieldViewCls}>
                                        <Typo
                                            lineHeight={18}
                                            textAlign="left"
                                            text={MAILING_ADDR_LINE_TWO}
                                        />
                                        <LongTextInput
                                            minLength={5}
                                            maxLength={40}
                                            isValidate
                                            isValid={state.mailAddressTwoValid}
                                            errorMessage={state.mailAddressTwoErrorMsg}
                                            value={mailAddressTwo}
                                            placeholder={STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER}
                                            numberOfLines={2}
                                            onChangeText={onMailAddressTwoChange}
                                            onFocus={onMailAddressTwoFocus}
                                        />
                                    </View>
                                    {/* Mailing Address line 3 */}
                                    <View style={Style.fieldViewCls}>
                                        <Typo
                                            lineHeight={18}
                                            textAlign="left"
                                            text={MAILING_ADDR_LINE_THREE}
                                        />
                                        <LongTextInput
                                            minLength={5}
                                            maxLength={40}
                                            isValidate
                                            isValid={state.mailAddressThreeValid}
                                            errorMessage={state.mailAddressThreeErrorMsg}
                                            value={mailAddressThree}
                                            placeholder={STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER}
                                            numberOfLines={2}
                                            onChangeText={onMailAddressThreeChange}
                                            onFocus={onMailAddressThreeFocus}
                                        />
                                    </View>
                                    {/* Mailing City */}
                                    <View style={Style.fieldViewCls}>
                                        <Typo
                                            lineHeight={18}
                                            textAlign="left"
                                            text={STEPUP_MAE_ADDRESS_CITY}
                                        />
                                        <LongTextInput
                                            minLength={5}
                                            maxLength={40}
                                            isValidate
                                            isValid={state.mailCityValid}
                                            errorMessage={state.mailCityErrorMsg}
                                            value={mailCity}
                                            placeholder={STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER}
                                            numberOfLines={2}
                                            onChangeText={onMailCityChange}
                                            onFocus={onMailCityFocus}
                                        />
                                    </View>
                                    {/* Mailing Postcode */}
                                    <View style={Style.fieldViewCls}>
                                        <Typo
                                            lineHeight={18}
                                            textAlign="left"
                                            text={STEPUP_MAE_ADDRESS_POSTAL}
                                        />
                                        <TextInput
                                            minLength={1}
                                            maxLength={8}
                                            isValidate
                                            isValid={state.mailPostcodeValid}
                                            errorMessage={state.mailPostcodeErrorMsg}
                                            value={mailPostcode}
                                            placeholder={STEPUP_MAE_POSTCODE_PLACEHOLDER}
                                            blurOnSubmit
                                            returnKeyType="done"
                                            onChangeText={onMailPostcodeChange}
                                            onFocus={onMailPostcodeFocus}
                                        />
                                    </View>
                                    {/* Maialing State */}
                                    {mailStateShow && (
                                        <LabeledDropdown
                                            label="State"
                                            dropdownValue={mailState}
                                            onPress={onMailStateTap}
                                            style={Style.fieldViewCls}
                                        />
                                    )}
                                </>
                            )}

                            {/* Bottom Spacer - Always place as last item among form elements */}
                            <View style={Style.bottomSpacer} />
                        </KeyboardAwareScrollView>

                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <ActionButton
                                disabled={isContinueDisabled}
                                activeOpacity={isContinueDisabled ? 1 : 0.5}
                                backgroundColor={isContinueDisabled ? DISABLED : YELLOW}
                                fullWidth
                                componentCenter={
                                    <Typo
                                        color={isContinueDisabled ? DISABLED_TEXT : BLACK}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text={state.ctaText}
                                    />
                                }
                                onPress={onContinue}
                            />
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </ScreenContainer>

            {/* Country Picker */}
            {state.countryData && (
                <ScrollPickerView
                    showMenu={state.countryPicker}
                    list={state.countryData}
                    selectedIndex={state.countryValueIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* State Picker */}
            {state.stateData && (
                <ScrollPickerView
                    showMenu={state.statePicker}
                    list={state.stateData}
                    selectedIndex={state.stateValueIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* Mailing State Picker */}
            {state.mailStateData && (
                <ScrollPickerView
                    showMenu={state.mailStatePicker}
                    list={state.mailStateData}
                    selectedIndex={state.mailStateValueIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* Mailing Country Picker */}
            {state.mailCountryData && (
                <ScrollPickerView
                    showMenu={state.mailCountryPicker}
                    list={state.mailCountryData}
                    selectedIndex={state.mailCountryValueIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* Exit confirmation popup */}
            <Popup
                visible={state.showExitPopup}
                title={EXIT_POPUP_TITLE}
                description={LA_EXIT_POPUP_DESC}
                onClose={closeExitPopup}
                primaryAction={{
                    text: SAVE,
                    onPress: onExitPopupSave,
                }}
                secondaryAction={{
                    text: DONT_SAVE,
                    onPress: onExitPopupDontSave,
                }}
            />
        </>
    );
}

LACustAddress.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const Style = StyleSheet.create({
    bottomSpacer: {
        marginTop: 60,
    },

    errorMessage: {
        color: RED_ERROR,
        fontSize: 12,
        lineHeight: 16,
        paddingVertical: 15,
    },

    fieldViewCls: {
        marginTop: 25,
    },

    headerText: {
        paddingTop: 8,
    },

    radioContainerStyle: {
        flexDirection: "row",
        justifyContent: "flex-start",
    },

    radioLabelCls: {
        color: GREY_DARK,
        flexShrink: 1,
        fontFamily: "montserrat",
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "normal",
        lineHeight: 22,
        marginTop: -5,
        paddingLeft: 10,
    },

    scrollViewCls: {
        paddingHorizontal: 36,
        paddingTop: 24,
    },
});

export default LACustAddress;
