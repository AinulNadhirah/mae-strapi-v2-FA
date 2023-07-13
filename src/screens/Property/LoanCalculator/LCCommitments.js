import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useRef, useReducer } from "react";
import { StyleSheet, ScrollView, View } from "react-native";

import { LC_TENURE, BANKINGV2_MODULE } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, YELLOW } from "@constants/colors";
import {
    CONTINUE,
    FA_FIELD_INFORMATION,
    FA_FORM_PROCEED,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
} from "@constants/strings";

import AmountInput from "../Common/AmountInput";
import ExpandField from "../Common/ExpandField";
import { useResetNavigation } from "../Common/PropertyController";
import SlidingNumPad from "../Common/SlidingNumPad";

// Initial state object
const initialState = {
    // Numerical Keypad related
    showNumPad: false,
    keypadAmount: "",
    numKeypadHeight: 0,
    currentKeypadType: "",

    // Housing Loan related
    housingLoanDispAmt: "",
    housingLoanRawAmt: "",
    housingLoanKeypadAmt: "",
    showHousingLoan: false,

    // Car Loan related
    carLoanDispAmt: "",
    carLoanRawAmt: "",
    carLoanKeypadAmt: "",
    showCarLoan: false,

    // Personal Loan related
    personalLoanDispAmt: "",
    personalLoanRawAmt: "",
    personalLoanKeypadAmt: "",
    showPersonalLoan: false,

    // CC Repayments related
    ccRepayDispAmt: "",
    ccRepayRawAmt: "",
    ccRepayKeypadAmt: "",
    showCCRepay: false,

    // Overdraft related
    overdraftDispAmt: "",
    overdraftRawAmt: "",
    overdraftKeypadAmt: "",
    showOverdraft: false,

    // Miscellaneous related
    nonBankCommitDispAmt: "",
    nonBankCommitRawAmt: "",
    nonBankCommitKeypadAmt: "",
    showNonBankCommit: false,
    nonBankCommitInfoPopup: false,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "setNumericalKeyboardHeight":
            return {
                ...state,
                numKeypadHeight: payload,
            };
        case "setShowNumPad":
            return {
                ...state,
                showNumPad: payload?.value ?? false,
                currentKeypadType: payload?.type ?? null,
                keypadAmount: payload?.amount ?? state.keypadAmount,
            };
        case "changeHousingLoanValue":
            return {
                ...state,
                housingLoanDispAmt: payload?.dispAmt,
                housingLoanRawAmt: payload?.rawAmt,
                housingLoanKeypadAmt: payload?.keypadAmt,
                keypadAmount: payload?.keypadAmt,
            };
        case "changeCarLoanValue":
            return {
                ...state,
                carLoanDispAmt: payload?.dispAmt,
                carLoanRawAmt: payload?.rawAmt,
                carLoanKeypadAmt: payload?.keypadAmt,
                keypadAmount: payload?.keypadAmt,
            };
        case "changePersonalLoanValue":
            return {
                ...state,
                personalLoanDispAmt: payload?.dispAmt,
                personalLoanRawAmt: payload?.rawAmt,
                personalLoanKeypadAmt: payload?.keypadAmt,
                keypadAmount: payload?.keypadAmt,
            };
        case "changeCCRepayValue":
            return {
                ...state,
                ccRepayDispAmt: payload?.dispAmt,
                ccRepayRawAmt: payload?.rawAmt,
                ccRepayKeypadAmt: payload?.keypadAmt,
                keypadAmount: payload?.keypadAmt,
            };
        case "changeOverdraftValue":
            return {
                ...state,
                overdraftDispAmt: payload?.dispAmt,
                overdraftRawAmt: payload?.rawAmt,
                overdraftKeypadAmt: payload?.keypadAmt,
                keypadAmount: payload?.keypadAmt,
            };
        case "changeNonBankCommitValue":
            return {
                ...state,
                nonBankCommitDispAmt: payload?.dispAmt,
                nonBankCommitRawAmt: payload?.rawAmt,
                nonBankCommitKeypadAmt: payload?.keypadAmt,
                keypadAmount: payload?.keypadAmt,
            };
        case "EXPAND_FIELD":
            return {
                ...state,
                ...payload,
            };
        case "SHOW_NONBANK_COMMIT_INFO_POPUP":
            return {
                ...state,
                nonBankCommitInfoPopup: payload,
            };
        default:
            return { ...state };
    }
}

function LCCommitments({ route, navigation }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const {
        showHousingLoan,
        showCarLoan,
        showPersonalLoan,
        showCCRepay,
        showOverdraft,
        showNonBankCommit,
        showNumPad,
        numKeypadHeight,
    } = state;
    const scrollRef = useRef();
    const [resetToDiscover] = useResetNavigation(navigation);

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Property_LoanCalculator_ManualInputCommitments",
        });
    }, []);

    const init = async () => {
        console.log("[LCCommitments] >> [init]");
    };

    const onBackTap = () => {
        console.log("[LCCommitments] >> [onBackTap]");

        navigation.goBack();
    };

    function onCloseTap() {
        console.log("[LCCommitments] >> [onCloseTap]");
        resetToDiscover();
    }

    const onHousingLoanPress = () => {
        console.log("[LCCommitments] >> [onHousingLoanPress]");

        const { housingLoanKeypadAmt } = state;

        dispatch({
            actionType: "setShowNumPad",
            payload: {
                value: true,
                type: "HOUSING_LOAN",
                amount: housingLoanKeypadAmt,
            },
        });
    };

    const onCarLoanPress = () => {
        console.log("[LCCommitments] >> [onCarLoanPress]");

        const { carLoanKeypadAmt } = state;

        dispatch({
            actionType: "setShowNumPad",
            payload: {
                value: true,
                type: "CAR_LOAN",
                amount: carLoanKeypadAmt,
            },
        });

        // Used to adjust input field placement when keypad is open
        setTimeout(() => {
            scrollRef.current.scrollTo({ animated: true, x: 0, y: 50 });
        }, 500);
    };

    const onPersonalLoanPress = () => {
        console.log("[LCCommitments] >> [onPersonalLoanPress]");

        const { personalLoanKeypadAmt } = state;

        dispatch({
            actionType: "setShowNumPad",
            payload: {
                value: true,
                type: "PERSONAL_LOAN",
                amount: personalLoanKeypadAmt,
            },
        });

        // Used to adjust input field placement when keypad is open
        setTimeout(() => {
            scrollRef.current.scrollTo({ animated: true, x: 0, y: 100 });
        }, 500);
    };

    const onCCRepaymentsPress = () => {
        console.log("[LCCommitments] >> [onCCRepaymentsPress]");

        const { ccRepayKeypadAmt } = state;

        dispatch({
            actionType: "setShowNumPad",
            payload: {
                value: true,
                type: "CC_REPAYMENTS",
                amount: ccRepayKeypadAmt,
            },
        });

        // Used to adjust input field placement when keypad is open
        setTimeout(() => {
            scrollRef.current.scrollTo({ animated: true, x: 0, y: 200 });
        }, 500);
    };

    const onOverdraftPress = () => {
        console.log("[LCCommitments] >> [onOverdraftPress]");

        const { overdraftKeypadAmt } = state;

        dispatch({
            actionType: "setShowNumPad",
            payload: {
                value: true,
                type: "OVERDRAFT",
                amount: overdraftKeypadAmt,
            },
        });

        // Used to adjust input field placement when keypad is open
        setTimeout(() => {
            scrollRef.current.scrollTo({ animated: true, x: 0, y: 300 });
        }, 500);
    };

    const onNonBankCommitPress = () => {
        console.log("[LCCommitments] >> [onNonBankCommitPress]");

        const { nonBankCommitKeypadAmt } = state;

        dispatch({
            actionType: "setShowNumPad",
            payload: {
                value: true,
                type: "NON_BANK_COMMITMENTS",
                amount: nonBankCommitKeypadAmt,
            },
        });

        // Used to adjust input field placement when keypad is open
        setTimeout(() => {
            scrollRef.current.scrollToEnd({ animated: true });
        }, 500);
    };

    function onHousingLoanExpand() {
        console.log("[LCCommitments] >> [onHousingLoanExpand]");

        dispatch({
            actionType: "EXPAND_FIELD",
            payload: {
                showHousingLoan: true,
            },
        });
    }

    function onCarLoanExpand() {
        console.log("[LCCommitments] >> [onCarLoanExpand]");

        dispatch({
            actionType: "EXPAND_FIELD",
            payload: {
                showCarLoan: true,
            },
        });
    }

    function onPersonalLoanExpand() {
        console.log("[LCCommitments] >> [onPersonalLoanExpand]");

        dispatch({
            actionType: "EXPAND_FIELD",
            payload: {
                showPersonalLoan: true,
            },
        });
    }

    function onCCRepaymentsExpand() {
        console.log("[LCCommitments] >> [onCCRepaymentsExpand]");

        dispatch({
            actionType: "EXPAND_FIELD",
            payload: {
                showCCRepay: true,
            },
        });
    }

    function onOverdraftExpand() {
        console.log("[LCCommitments] >> [onOverdraftExpand]");

        dispatch({
            actionType: "EXPAND_FIELD",
            payload: {
                showOverdraft: true,
            },
        });
    }

    function onNonBankCommitExpand() {
        console.log("[LCCommitments] >> [onNonBankCommitExpand]");

        dispatch({
            actionType: "EXPAND_FIELD",
            payload: {
                showNonBankCommit: true,
            },
        });
    }

    const getKeypadHeight = (height) => {
        dispatch({ actionType: "setNumericalKeyboardHeight", payload: height });
    };

    const onNumKeypadChange = (number) => {
        const { currentKeypadType, keypadAmount } = state;

        if (number === "0" && !keypadAmount) return;

        const rawAmt = !number ? "" : parseInt(number, 10) / 100;
        const dispAmt = !number ? "" : numeral(rawAmt).format("0,0.00");
        const payload = {
            dispAmt,
            rawAmt,
            keypadAmt: number,
        };

        switch (currentKeypadType) {
            case "HOUSING_LOAN":
                dispatch({
                    actionType: "changeHousingLoanValue",
                    payload: payload,
                });
                break;
            case "CAR_LOAN":
                dispatch({
                    actionType: "changeCarLoanValue",
                    payload: payload,
                });
                break;
            case "PERSONAL_LOAN":
                dispatch({
                    actionType: "changePersonalLoanValue",
                    payload: payload,
                });
                break;
            case "CC_REPAYMENTS":
                dispatch({
                    actionType: "changeCCRepayValue",
                    payload: payload,
                });
                break;
            case "OVERDRAFT":
                dispatch({
                    actionType: "changeOverdraftValue",
                    payload: payload,
                });
                break;
            case "NON_BANK_COMMITMENTS":
                dispatch({
                    actionType: "changeNonBankCommitValue",
                    payload: payload,
                });
                break;
            default:
                break;
        }
    };

    function showNonBankCommitInfoPopup() {
        console.log("[LCCommitments] >> [showNonBankCommitInfoPopup]");

        dispatch({
            actionType: "SHOW_NONBANK_COMMIT_INFO_POPUP",
            payload: true,
        });
    }

    function closeNonBankCommitInfoPopup() {
        console.log("[LCCommitments] >> [closeNonBankCommitInfoPopup]");

        dispatch({
            actionType: "SHOW_NONBANK_COMMIT_INFO_POPUP",
            payload: false,
        });
    }

    const onNumKeypadDone = () =>
        dispatch({
            actionType: "setShowNumPad",
            payload: {
                value: false,
            },
        });

    const onContinue = () => {
        console.log("[LCCommitments] >> [onContinue]");

        // Retrieve form data
        const formData = getFormData();

        navigation.navigate(BANKINGV2_MODULE, {
            screen: LC_TENURE,
            params: { ...formData },
        });

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Property_LoanCalculator_ManualInputCommitments",
        });
    };

    const getFormData = () => {
        console.log("[LCCommitments] >> [getFormData]");

        const {
            housingLoanRawAmt,
            carLoanRawAmt,
            personalLoanRawAmt,
            ccRepayRawAmt,
            overdraftRawAmt,
            nonBankCommitRawAmt,
        } = state;

        return {
            ...route.params,
            housingLoan: String(housingLoanRawAmt),
            carLoan: String(carLoanRawAmt),
            personalLoan: String(personalLoanRawAmt),
            creditCardRepayments: String(ccRepayRawAmt),
            overdraft: String(overdraftRawAmt),
            nonBankCommitments: String(nonBankCommitRawAmt),
        };
    };

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={24}
                    useSafeArea
                >
                    <>
                        <ScrollView
                            style={Style.container}
                            ref={scrollRef}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Title */}
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text="Financing Calculator"
                                textAlign="left"
                            />

                            {/* Description */}
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={Style.label}
                                text="Please enter your existing monthly financial commitments"
                                textAlign="left"
                            />

                            {/* Home financing */}
                            <ExpandField
                                label="Home financing"
                                show={!showHousingLoan}
                                onExpandPress={onHousingLoanExpand}
                            />
                            <AmountInput
                                label="Home financing"
                                onPress={onHousingLoanPress}
                                value={state.housingLoanDispAmt}
                                show={showHousingLoan}
                            />

                            {/* Car financing */}
                            <ExpandField
                                label="Car financing"
                                show={!showCarLoan}
                                onExpandPress={onCarLoanExpand}
                            />
                            <AmountInput
                                label="Car financing"
                                onPress={onCarLoanPress}
                                value={state.carLoanDispAmt}
                                show={showCarLoan}
                            />

                            {/* Personal financing */}
                            <ExpandField
                                label="Personal financing"
                                show={!showPersonalLoan}
                                onExpandPress={onPersonalLoanExpand}
                            />
                            <AmountInput
                                label="Personal financing"
                                onPress={onPersonalLoanPress}
                                value={state.personalLoanDispAmt}
                                show={showPersonalLoan}
                            />

                            {/* CC Repayments */}
                            <ExpandField
                                label="Credit card repayments"
                                show={!showCCRepay}
                                onExpandPress={onCCRepaymentsExpand}
                            />
                            <AmountInput
                                label="Credit card repayments"
                                onPress={onCCRepaymentsPress}
                                value={state.ccRepayDispAmt}
                                show={showCCRepay}
                                note="Enter your monthly minimum payment"
                            />

                            {/* Overdraft */}
                            <ExpandField
                                label="Overdraft"
                                show={!showOverdraft}
                                onExpandPress={onOverdraftExpand}
                            />
                            <AmountInput
                                label="Overdraft"
                                onPress={onOverdraftPress}
                                value={state.overdraftDispAmt}
                                show={showOverdraft}
                                note="Enter your monthly interest payment"
                            />

                            {/* Non-bank commitments */}
                            <ExpandField
                                label="Non-bank commitments"
                                show={!showNonBankCommit}
                                onExpandPress={onNonBankCommitExpand}
                                infoIcon
                                infoIconPress={showNonBankCommitInfoPopup}
                            />
                            <AmountInput
                                label="Non-bank commitments"
                                onPress={onNonBankCommitPress}
                                value={state.nonBankCommitDispAmt}
                                show={showNonBankCommit}
                                note="Enter your monthly non-bank commitments"
                                infoIcon
                                infoIconPress={showNonBankCommitInfoPopup}
                            />
                        </ScrollView>

                        {/* Vertical Spacer */}
                        <View
                            style={{
                                height: showNumPad ? numKeypadHeight : 0,
                            }}
                        />

                        {/* Bottom docked button container */}
                        {!showNumPad && (
                            <FixedActionContainer>
                                <ActionButton
                                    backgroundColor={YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={CONTINUE}
                                        />
                                    }
                                    onPress={onContinue}
                                />
                            </FixedActionContainer>
                        )}
                    </>
                </ScreenLayout>

                {/* Sliding Numerical Keypad */}
                <SlidingNumPad
                    showNumPad={showNumPad}
                    value={state.keypadAmount}
                    onChange={onNumKeypadChange}
                    onDone={onNumKeypadDone}
                    getHeight={getKeypadHeight}
                />

                {/* Non-Bank Commitments Info Popup */}
                <Popup
                    visible={state.nonBankCommitInfoPopup}
                    title="Monthly non-bank commitments"
                    description="Examples of monthly commitments with non-banking institutions: instalments, finance purchases of appliances, home furniture from consumer electronics, furniture retailers."
                    onClose={closeNonBankCommitInfoPopup}
                />
            </>
        </ScreenContainer>
    );
}

LCCommitments.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const Style = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 36,
        marginBottom: 24,
    },

    label: {
        paddingBottom: 28,
        paddingTop: 8,
    },
});

export default LCCommitments;
