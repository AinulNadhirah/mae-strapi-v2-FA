/* eslint-disable sonarjs/cognitive-complexity */
import PropTypes from "prop-types";
import React, { useEffect, useReducer, useCallback, useState } from "react";
import { StyleSheet, Platform, View, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import {
    BANKINGV2_MODULE,
    JA_CUST_ADDRESS,
    JA_CONFIRMATION,
    JA_EMPLOYMENT_DETAILS,
    APPLICATION_DETAILS,
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
import { PROP_ELG_INPUT } from "@constants/data";
import {
    PLEASE_SELECT,
    DONE,
    CANCEL,
    SAVE_NEXT,
    SAVE,
    DONT_SAVE,
    COMMON_ERROR_MSG,
    APPLICATION_REMOVE_TITLE,
    APPLICATION_REMOVE_DESCRIPTION,
    OKAY,
    EXIT_POPUP_DESC,
    EXIT_JA_POPUP_TITLE,
    FA_PROPERTY_JACEJA_CURRENTADDRESS,
    EDIT,
    EDIT_CONTACT_DETAILS,
    JOINT_APPLICATION,
    SAVE_AND_NEXT,
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
    STATE,
    STEPUP_MAE_ADDRESS_CITY,
    STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER,
    STEPUP_MAE_ADDRESS_POSTAL,
    STEPUP_MAE_POSTCODE_PLACEHOLDER,
} from "../../../constants/strings";
import { fetchGetApplicants, fetchJointApplicationDetails } from "../Application/LAController";
import { getEncValue, getExistingData, useResetNavigation } from "../Common/PropertyController";
import {
    validateAddressOne,
    validateAddressThree,
    validateAddressTwo,
    validateCity,
    validatePostcode,
} from "../Eligibility/CEController";
import { saveEligibilityInput, saveJAInput, getAddressData } from "./JAController";

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

    // Address 2
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
        case "SET_ADDRESS_THREE_ERROR":
        case "SET_MAIL_ADDRESS_TWO_ERROR":
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
        case "SHOW_APPLICATION_REMOVE_POPUP":
            return {
                ...state,
                showApplicationRemovePopup: payload,
            };
        default:
            return { ...state };
    }
}

function JACustAddress({ route, navigation }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [resetToApplication] = useResetNavigation(navigation);
    const [loading, setLoading] = useState(true);

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
        editFlow,
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
        dispatch({
            actionType: "SET_MAIL_STATE_SHOW",
            payload: {
                mailStateShow: mailCountryValue === "MYS",
            },
        });
    }, [countryValue, mailCountryValue]);

    const init = useCallback(() => {
        console.log("[JACustAddress] >> [init]");

        // Populate Picker Data
        setPickerData();

        // Prepopulate any existing details
        prepopulateData();
        setLoading(false);
    }, [route, navigation]);

    function onBackTap() {
        console.log("[JACustAddress] >> [onBackTap]");

        navigation.goBack();
    }

    async function onCloseTap() {
        console.log("[JACustAddress] >> [onCloseTap]");
        const navParams = route?.params ?? {};
        const getSyncId = navParams?.syncId ?? "";
        const encSyncId = await getEncValue(getSyncId);
        const { success, errorMessage, jointApplicantDetails } = await fetchGetApplicants(
            encSyncId,
            false
        );
        if (!success) {
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }
        if (!jointApplicantDetails) {
            dispatch({
                actionType: "SHOW_APPLICATION_REMOVE_POPUP",
                payload: true,
            });
            return;
        }
        // Show Exit Popup
        dispatch({
            actionType: "SHOW_EXIT_POPUP",
            payload: true,
        });
    }

    function setPickerData() {
        console.log("[JACustAddress] >> [setPickerData]");

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

    function closeCancelRemovePopup() {
        dispatch({
            actionType: "SHOW_APPLICATION_REMOVE_POPUP",
            payload: false,
        });
        reloadApplicationDetails();
    }

    async function reloadApplicationDetails() {
        const navParams = route?.params ?? {};
        const encSyncId = await getEncValue(navParams?.syncId ?? "");
        // Request object
        const params = {
            syncId: encSyncId,
            stpId: "",
        };

        const { success, errorMessage, propertyDetails, savedData, cancelReason } =
            await fetchJointApplicationDetails(params, true);
        if (!success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }
        if (savedData?.isSaveData === "Y" && success) {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: APPLICATION_DETAILS,
                params: {
                    ...navParams,
                    savedData,
                    cancelReason,
                    propertyDetails,
                    reload: true,
                },
            });
        } else {
            resetToApplication();
        }
    }

    function prepopulateData() {
        console.log("[JACustAddress] >> [prepopulateData]");
        const navParams = route?.params ?? {};
        const masterData = navParams?.masterData ?? {};
        const mdmData = navParams?.mdmData ?? {};
        const savedData = navParams?.savedData ?? {};
        const editFlow = navParams?.editFlow ?? false;

        const {
            address1,
            address2,
            address3,
            city,
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
        const maskedCity = maskAddress(city);

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
                city,
                postcode: custPostcode,
                addressOneDisp: maskedAddress1,
                addressTwoDisp: maskedAddress2,
                addressThreeDisp: maskedAddress3,
                cityDisp: maskedCity,
                postcodeDisp: custPostcode,
                mailAddressFlag: tempMailAddressFlag,
                editFlow,
                ctaText: SAVE_NEXT,
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
            const maskedMailACity = maskAddress(mailingCity);

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
                    mailCityDisp: maskedMailACity,
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
    }

    function resetAddressFields(countryCode) {
        console.log("[JACustAddress] >> [resetAddressFields]" + countryCode);
        if (countryCode === "MYS") {
            const navParams = route?.params ?? {};
            const masterData = navParams?.masterData ?? {};
            const mdmData = navParams?.mdmData ?? {};
            const savedData = navParams?.savedData ?? {};
            const editFlow = navParams?.editFlow ?? false;

            const { address1, address2, address3, custPostcode, custState } = getAddressData(
                navParams,
                savedData,
                mdmData,
                editFlow
            );

            const maskedAddress1 = maskAddress(address1);
            const maskedAddress2 = maskAddress(address2);
            const maskedAddress3 = maskAddress(address3);

            dispatch({
                actionType: "SET_INIT_DATA",
                payload: {
                    addressOne: address1,
                    addressTwo: address2,
                    addressThree: address3,
                    city: address3,
                    postcode: custPostcode,
                    addressOneDisp: maskedAddress1,
                    addressTwoDisp: maskedAddress2,
                    cityDisp: maskedAddress3,
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
        console.log("[JACustAddress] >> [resetMailingAddressFields]");
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
                mailingPostcode,
                mailingState,
            } = getAddressData(navParams, savedData, mdmData, editFlow);

            const maskedMailAddress1 = maskAddress(mailingAddress1);
            const maskedMailAddress2 = maskAddress(mailingAddress2);
            const maskedMailAddress3 = maskAddress(mailingAddress3);

            dispatch({
                actionType: "SET_INIT_DATA",
                payload: {
                    mailAddressOne: mailingAddress1,
                    mailAddressTwo: mailingAddress2,
                    mailCity: mailingAddress3,
                    mailPostcode: mailingPostcode,
                    mailAddressOneDisp: maskedMailAddress1,
                    mailAddressTwoDisp: maskedMailAddress2,
                    mailCityDisp: maskedMailAddress3,
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
        } else {
            //for country other than MYS then reset address fields
            dispatch({
                actionType: "SET_INIT_DATA",
                payload: {
                    mailAddressOne: "",
                    mailAddressTwo: "",
                    mailCity: "",
                    mailPostcode: "",
                    mailAddressOneDisp: "",
                    mailAddressTwoDisp: "",
                    mailCityDisp: "",
                    mailPostcodeDisp: "",
                },
            });
        }
    }

    function onPickerCancel() {
        console.log("[JACustAddress] >> [onPickerCancel]");

        dispatch({
            actionType: "HIDE_PICKER",
            payload: true,
        });
    }

    function onPickerDone(item, index) {
        console.log("[JACustAddress] >> [onPickerDone]");

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

    function onTap(payloadValue) {
        console.log("[JACustAddress] >> [onTap]");

        dispatch({
            actionType: "SHOW_PICKER",
            payload: payloadValue,
        });
    }

    function onTextFieldChange(value, actionTypeValue) {
        dispatch({
            actionType: actionTypeValue,
            payload: value,
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
        if (!state.addressThreeFocus) {
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
        console.log("[JACustAddress] >> [onRadioBtnTap]");

        dispatch({
            actionType: "INVERSE_MAIL_ADDRESS_FLAG",
            payload: {
                mailAddressFlag: !mailAddressFlag,
            },
        });
    }

    function resetValidationErrors() {
        console.log("[JACustAddress] >> [resetValidationErrors]");

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
        console.log("[JACustAddress] >> [validateFormDetails]");

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
        const { isValid: mailCityValid, message: mailCityErrorMsg } = validateCity(city);
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

    async function onContinue() {
        console.log("[JACustAddress] >> [onContinue]");

        const navParams = route?.params ?? {};
        // Return if form validation fails
        const isFormValid = validateFormDetails();
        if (!mailAddressFlag) {
            const isMailingFormValid = validateMailingFormDetails();
            if (!isMailingFormValid || !isFormValid) {
                return;
            }
        } else if (!isFormValid) return;
        // Retrieve form data
        const formData = getFormData();

        let currentStep = navParams?.currentStep;
        currentStep = currentStep + 1;

        const getSyncId = navParams?.syncId ?? "";
        const encSyncId = await getEncValue(getSyncId);
        const { success, errorMessage, jointApplicantDetails } = await fetchGetApplicants(
            encSyncId,
            false
        );
        if (!success) {
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }
        if (!jointApplicantDetails) {
            dispatch({
                actionType: "SHOW_APPLICATION_REMOVE_POPUP",
                payload: true,
            });
            return;
        }
        if (editFlow) {
            const { syncId } = await saveEligibilityInput(
                {
                    screenName: JA_CUST_ADDRESS,
                    formData,
                    navParams,
                    editFlow,
                },
                false
            );
            // Navigate to Confirmation screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: JA_CONFIRMATION,
                params: {
                    ...navParams,
                    ...formData,
                    updateData: true,
                    editScreenName: JA_CUST_ADDRESS,
                    syncId,
                },
            });
        } else {
            // Save Form Data in DB before moving to next screen
            const httpReq = await saveJAInput({
                screenName: JA_CUST_ADDRESS,
                formData,
                navParams,
            });
            if (httpReq.success === true) {
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: JA_EMPLOYMENT_DETAILS,
                    params: {
                        ...navParams,
                        ...formData,
                        currentStep,
                    },
                });
            }
        }
    }

    function getFormData() {
        console.log("[JACustAddress] >> [getFormData]");

        return {
            homeAddr1: addressOne,
            homeAddr2: addressTwo,
            homeAddr3: addressThree,
            homeCity: city,
            homePostCode: postcode,
            homeState: stateShow ? state.stateValue : "",
            homeCountry: state.countryValue,
            isMailingAddr: mailAddressFlag ? "Y" : "N",
            mailingAddr1: mailAddressFlag ? addressOne : mailAddressOne,
            mailingAddr2: mailAddressFlag ? addressTwo : mailAddressTwo,
            mailingAddr3: mailAddressFlag ? addressThree : mailAddressThree,
            mailingCity: mailAddressFlag ? city : mailCity,
            mailingPostCode: mailAddressFlag ? postcode : mailPostcode,
            mailingState: mailAddressFlag
                ? stateShow
                    ? state.stateValue
                    : ""
                : mailStateShow
                ? state.mailStateValue
                : "",
            mailingCountry: mailAddressFlag ? state.countryValue : mailCountryValue,
            progressStatus: PROP_ELG_INPUT,
        };
    }

    async function onExitPopupSave() {
        // Hide popup
        closeExitPopup();

        // Retrieve form data
        const formData = getFormData();
        const navParams = route?.params;
        navParams.saveData = "Y";
        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveEligibilityInput({
            screenName: JA_CUST_ADDRESS,
            formData,
            navParams,
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
        // Hide popup
        closeExitPopup();

        resetToApplication();
    }

    function closeExitPopup() {
        dispatch({
            actionType: "SHOW_EXIT_POPUP",
            payload: false,
        });
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
                analyticScreenName={FA_PROPERTY_JACEJA_CURRENTADDRESS}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                state.editFlow
                                ? (
                                    <Typo
                                        text={EDIT}
                                        lineHeight={16}
                                        fontSize={12}
                                        fontWeight="600"
                                        color={BLACK}
                                    />
                                )
                                : (
                                    <>
                                        <Typo
                                            text={state.stepperInfo}
                                            fontWeight="600"
                                            fontSize={12}
                                            lineHeight={16}
                                            color={FADE_GREY}
                                        />
                                    </>
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
                                text={state.editFlow ? EDIT_CONTACT_DETAILS : JOINT_APPLICATION}
                                numberOfLines={2}
                                textAlign="left"
                            />
                            {/* Header */}
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={Style.headerText}
                                text={CURRENT_ADDRESS}
                                textAlign="left"
                            />

                            {/* Country */}
                            <LabeledDropdown
                                label="Country"
                                dropdownValue={state.country}
                                onPress={() => onTap("country")}
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
                                    onChangeText={(v) => onTextFieldChange(v, "SET_ADDRESS_ONE")}
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
                                    onChangeText={(v) => onTextFieldChange(v, "SET_ADDRESS_TWO")}
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
                                    onChangeText={(v) => onTextFieldChange(v, "SET_ADDRESS_THREE")}
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
                                    onChangeText={(v) => onTextFieldChange(v, "SET_CITY")}
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
                                    onChangeText={(v) => onTextFieldChange(v, "SET_POSTCODE")}
                                    onFocus={onPostcodeFocus}
                                />
                            </View>

                            {/* State */}
                            {stateShow && (
                                <LabeledDropdown
                                    label="State"
                                    dropdownValue={state.state}
                                    onPress={() => onTap("state")}
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
                                        onPress={() => onTap("mailCountry")}
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
                                            onChangeText={(v) =>
                                                onTextFieldChange(v, "SET_MAIL_ADDRESS_ONE")
                                            }
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
                                            onChangeText={(v) =>
                                                onTextFieldChange(v, "SET_MAIL_ADDRESS_TWO")
                                            }
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
                                            onChangeText={(v) =>
                                                onTextFieldChange(v, "SET_MAIL_ADDRESS_THREE")
                                            }
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
                                            minLength={1}
                                            maxLength={40}
                                            isValidate
                                            isValid={state.mailCityValid}
                                            errorMessage={state.mailCityErrorMsg}
                                            value={mailCity}
                                            placeholder={STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER}
                                            numberOfLines={2}
                                            onChangeText={(v) =>
                                                onTextFieldChange(v, "SET_MAIL_CITY")
                                            }
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
                                            onChangeText={(v) =>
                                                onTextFieldChange(v, "SET_MAIL_POSTCODE")
                                            }
                                            onFocus={onMailPostcodeFocus}
                                        />
                                    </View>
                                    {/* Maialing State */}
                                    {mailStateShow && (
                                        <LabeledDropdown
                                            label={STATE}
                                            dropdownValue={mailState}
                                            onPress={() => onTap("mailState")}
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
                                        text={state.editFlow ? SAVE_AND_NEXT : state.ctaText}
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
                title={EXIT_JA_POPUP_TITLE}
                description={EXIT_POPUP_DESC}
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
            {/*Application Removed popup */}
            <Popup
                visible={state.showApplicationRemovePopup}
                title={APPLICATION_REMOVE_TITLE}
                description={APPLICATION_REMOVE_DESCRIPTION}
                onClose={closeCancelRemovePopup}
                primaryAction={{
                    text: OKAY,
                    onPress: closeCancelRemovePopup,
                }}
            />
        </>
    );
}

JACustAddress.propTypes = {
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

export default JACustAddress;
