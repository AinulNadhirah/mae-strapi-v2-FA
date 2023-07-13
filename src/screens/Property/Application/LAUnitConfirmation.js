/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { useEffect, useReducer, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import {
    BANKINGV2_MODULE,
    LA_UNIT_CONFIRMATION,
    LA_CUST_ADDRESS,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common/ScrollPickerView";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { logEvent } from "@services/analytics";

import {
    MEDIUM_GREY,
    YELLOW,
    BLACK,
    DISABLED_TEXT,
    DISABLED,
    RED_ERROR,
    DARK_GREY,
    FADE_GREY,
} from "@constants/colors";
import {
    PLEASE_SELECT,
    DONE,
    CANCEL,
    COMMON_ERROR_MSG,
    EXIT_POPUP_TITLE,
    SAVE,
    DONT_SAVE,
    EDIT_FIN_DETAILS,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    LA_EXIT_POPUP_DESC,
    FA_FIELD_INFORMATION,
    CONFIRM_SUBMIT,
    LOAN_APPROVAL_OFFER_TEXT_MA,
    FA_PROPERTY_JACEJA_ACKNOWLEDGE,
    FA_FORM_PROCEED,
    FA_JA_SAVEPROGRESS,
} from "@constants/strings";

import { saveLAInput } from "../Application/LAController";
import { useResetNavigation, getMasterData } from "../Common/PropertyController";

// Initial state object
const initialState = {
    //stepper info
    currentStep: "",
    totalSteps: "",
    stepperInfo: "",

    // Title related
    title: PLEASE_SELECT,
    titleValue: null,
    titleValueIndex: 0,
    titleData: null,
    titlePicker: false,
    titleObj: null,

    // Others
    showExitPopup: false,
    cancelEditPopup: false,
    isContinueDisabled: true,
    pickerType: null,
    headerText: "",
    loading: true,
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
                titlePicker: false,
            };
        case "SHOW_PICKER":
            return {
                ...state,
                pickerType: payload,
                titlePicker: payload === "title",
            };
        case "SET_STEPPER_INFO":
        case "SET_PICKER_DATA":
        case "SET_TITLE":
            return {
                ...state,
                ...payload,
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
        case "SHOW_CANCEL_EDIT_POPUP":
            return {
                ...state,
                cancelEditPopup: payload,
            };

        case "SET_LOADING":
            return {
                ...state,
                loading: payload,
            };
        default:
            return { ...state };
    }
}

function LAUnitConfirmation({ route, navigation }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [resetToDiscover, resetToApplication] = useResetNavigation(navigation);

    const [showExitPopup, setShowExitPopup] = useState(false);

    const { isContinueDisabled, title, loading } = state;
    const scrollRef = useRef();

    useEffect(() => {
        init();
    }, []);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        dispatch({
            actionType: "SET_CONTINUE_DISABLED",
            payload: title === PLEASE_SELECT,
        });
    }, [title]);

    async function init() {
        // Populate Picker Data
        const masterData = await getMasterData();
        setPickerData(masterData);

        // Prepopulate any existing details
        prepopulateData();

        setLoading(false);
    }

    function onBackTap() {
        navigation.goBack();
    }

    const [propertyName, setPropertyName] = useState("");

    const prepopulateData = () => {
        const navParams = route?.params ?? {};
        const paramsEditFlow = navParams?.editFlow ?? false;

        const headerText = route.params?.headerText ?? "";

        const propertyName = navParams?.propertyName ?? "";
        setPropertyName(propertyName + "?");
        // let currentStep = navParams?.currentStep;
        let currentStep = 0;
        currentStep = currentStep + 1;
        const totalSteps = 5;
        const stepperInfo =
            currentStep && !paramsEditFlow && currentStep < totalSteps
                ? `Step ${currentStep} of ${totalSteps}`
                : "";

        // Set Header Text
        dispatch({
            actionType: "SET_HEADER_TEXT",
            payload: paramsEditFlow ? EDIT_FIN_DETAILS : headerText,
        });

        //Set Stepper Info
        dispatch({
            actionType: "SET_STEPPER_INFO",
            payload: {
                currentStep,
                totalSteps,
                stepperInfo,
            },
        });
    };

    const setPickerData = (masterData) => {
        // const masterData = route.params?.masterData ?? {};
        console.log(masterData);
        dispatch({
            actionType: "SET_PICKER_DATA",
            payload: {
                titleData: masterData?.propertyOwners ?? null,
            },
        });
    };

    const onPickerCancel = () => {
        dispatch({
            actionType: "HIDE_PICKER",
            payload: true,
        });
    };

    const onPickerDone = (item, index) => {
        const { pickerType } = state;
        switch (pickerType) {
            case "title":
                dispatch({
                    actionType: "SET_TITLE",
                    payload: {
                        title: item?.name ?? PLEASE_SELECT,
                        titleValue: item?.value ?? null,
                        titleObj: item,
                        titleValueIndex: index,
                    },
                });
                break;
            default:
                break;
        }

        // Close picker
        onPickerCancel();
    };

    const onTitleTap = () => {
        dispatch({
            actionType: "SHOW_PICKER",
            payload: "title",
        });
    };

    function setLoading(loading) {
        dispatch({
            actionType: "SET_LOADING",
            payload: loading,
        });
    }

    async function onExitPopupSave() {
        // Hide popup
        closeExitPopup();

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveLAInput({
            screenName: LA_UNIT_CONFIRMATION,
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

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_JA_SAVEPROGRESS,
            [FA_ACTION_NAME]: SAVE,
        });
    }

    function closeExitPopup() {
        console.log("[LAUnitOwnerConfirmation] >> [closeExitPopup]");

        setShowExitPopup(false);
    }

    async function onContinue() {
        console.log("[LAUnitOwnerConfirmation] >> [onContinue]");

        const navParams = route?.params ?? {};

        let currentStep = navParams?.currentStep;
        currentStep = currentStep + 1;

        // Retrieve form data

        const formData = getFormData(state.titleValue);

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_PROPERTY_JACEJA_ACKNOWLEDGE,
            [FA_FIELD_INFORMATION]: "property_owner: " + state.title,
        });

        // Save Form Data in DB before moving to next screen
        await saveLAInput({
            screenName: LA_UNIT_CONFIRMATION,
            formData,
            navParams,
        });

        // Navigate to Customer address screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: LA_CUST_ADDRESS,
            params: { ...navParams, ...formData, currentStep },
        });
    }

    function getFormData(value) {
        console.log("[LAUnitOwnerConfirmation] >> [getFormData]");

        return {
            isJaUnitOwner: ["SOLE", "JASOLE", "MEJA"].includes(value) ? "Y" : "N",
            propertyOwner: value,
        };
    }
    function onCloseTap() {
        // Show Exit OR Cancel Edit Popup
        setShowExitPopup(true);
    }

    function onExitPopupDontSave() {
        console.log("[LAUnitOwnerConfirmation] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();

        resetToDiscover();
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
                analyticScreenName={FA_PROPERTY_JACEJA_ACKNOWLEDGE}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    text="Step 2 of 7"
                                    fontSize={12}
                                    fontWeight="600"
                                    color={FADE_GREY}
                                    lineHeight={16}
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
                    <>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            style={Style.scrollViewCls}
                            ref={scrollRef}
                        >
                            {/* Property - Unit Type Name */}
                            <Typo
                                fontWeight="600"
                                lineHeight={24}
                                text={state.headerText}
                                numberOfLines={2}
                                textAlign="left"
                                testID="ja_headline"
                            />
                            {/* Sub Header */}
                            <Typo textAlign="left" style={Style.unitTitle}>
                                <Typo
                                    textAlign="left"
                                    style={Style.unitTitleSubText}
                                    text={`Who's going to be the${"\n"}`}
                                />

                                <Typo
                                    style={[Style.unitTitleSubText, Style.unitTitleSubTextBold]}
                                    text={` owner(s)${" "}`}
                                />

                                <Typo style={Style.unitTitleSubText} text="of " />
                                <Typo
                                    style={[Style.unitTitleSubText, Style.unitTitleSubTextBold]}
                                    text={propertyName}
                                />
                            </Typo>
                            {/* Title */}
                            <LabeledDropdown
                                label="Property Owner(s)"
                                dropdownValue={title}
                                onPress={onTitleTap}
                                style={Style.fieldViewCls}
                                testID="title"
                            />

                            {/* Bottom Spacer - Always place as last item among form elements */}
                            <View style={Style.bottomSpacer} />
                        </ScrollView>
                        {/* Bottom Container */}
                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <Typo
                                    fontSize={12}
                                    fontWeight="400"
                                    lineHeight={20}
                                    style={Style.noteLabel}
                                    text={LOAN_APPROVAL_OFFER_TEXT_MA}
                                    textAlign="left"
                                    color={DARK_GREY}
                                />

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
                                            text={CONFIRM_SUBMIT}
                                        />
                                    }
                                    onPress={onContinue}
                                />
                            </View>
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </ScreenContainer>

            {/* Exit confirmation popup */}
            <Popup
                visible={showExitPopup}
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

            {/* Title Picker */}
            {state.titleData && (
                <ScrollPickerView
                    showMenu={state.titlePicker}
                    list={state.titleData}
                    selectedIndex={state.titleValueIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}
        </>
    );
}

LAUnitConfirmation.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const Style = StyleSheet.create({
    bottomBtnContCls: {
        width: "100%",
    },

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

    noteLabel: {
        marginBottom: 16,
        paddingHorizontal: 8,
        paddingTop: 8,
    },

    radioBtnLabelCls: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "600",
        letterSpacing: 0,
        lineHeight: 18,
        paddingLeft: 10,
    },

    radioBtnOuterViewCls: {
        flexDirection: "row",
        marginTop: 15,
    },

    radioBtnViewCls: {
        justifyContent: "center",
        width: 100,
    },
    scrollViewCls: {
        paddingHorizontal: 36,
        paddingTop: 24,
    },
    unitTitle: {
        paddingTop: 8,
    },
    unitTitleSubText: {
        fontSize: 20,
        lineHeight: 28,
        textAlign: "left",
    },
    unitTitleSubTextBold: {
        fontWeight: "bold",
    },
});

export default LAUnitConfirmation;
