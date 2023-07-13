import React, { Component } from "react";
import { View, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";

import {
    SB_FRNDSGRPTAB,
    CALC_AMOUNT_SCREEN,
    SB_NAME,
    SB_DASHBOARD,
    SB_DETAILS,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { updateBillNameAPI } from "@services";
import { logEvent } from "@services/analytics";

import { BLACK, MEDIUM_GREY, YELLOW, RED_ERROR } from "@constants/colors";
import { SB_TYPE_EVEN, SB_TYPE_SEP, SB_FLOW_ADDSB, SB_FLOW_EDITSBNAME } from "@constants/data";
import {
    SB_MINMAX_AMT_ERR,
    SPLIT_BILL,
    CONTINUE,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_SPLIT_BILL_CREATE_BILL_DETAILS,
    FA_FORM_COMPLETE,
    FA_FORM_PROCEED,
    FA_FIELD_INFORMATION,
    SEPARATELY,
    EVENLY,
    FA_SPLIT_BILL_SPLIT_OPTION_SUCCESSFUL,
    FA_EDITBILLNAME,
    FA_SPLIT_BILL_EDIT_BILL_NAME,
    SPLIT_WAY,
} from "@constants/strings";

import { trimOuterInnerExtraSpaces } from "@utils/dataModel/utility";

import { navigateToDashboardIndex, validateSBName, validateSBNotes } from "./SBController";

class SBName extends Component {
    constructor(props) {
        super(props);
        this.state = {
            onlySBName: props?.route?.params?.onlySBName ?? false,
            billId: props?.route?.params?.billId ?? "",

            flowType: props?.route?.params?.flowType ?? SB_FLOW_ADDSB,
            accountNo: props?.route?.params?.accountNo ?? "",
            accountCode: props?.route?.params?.accountCode ?? "",
            prepopulateAmount: props?.route?.params?.prepopulateAmount ?? 0,

            splitBillName: props?.route?.params?.splitBillName ?? "",
            splitBillNameValid: true,
            splitBillNameErrMsg: "Error Message description",

            splitBillNote: "",
            splitBillNoteValid: true,
            splitBillNoteErrMsg: "Error Message description",

            radioBtnValid: true,
            radioBtnErrorMsg: "Error Message description",
            splitBillType: "",
        };
    }

    componentDidMount() {
        this.state.flowType === SB_FLOW_ADDSB &&
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_SPLIT_BILL_CREATE_BILL_DETAILS,
            });
        this.state.flowType === SB_FLOW_EDITSBNAME &&
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_SPLIT_BILL_EDIT_BILL_NAME,
            });
    }

    onBackTap = () => {
        console.log("[SBName] >> [onBackTap]");

        this.props.navigation.goBack();
    };

    onNextTap = () => {
        console.log("[SBName] >> [onNextTap]");
        let isValid = true;
        const {
            splitBillName,
            splitBillNote,
            splitBillType,
            accountNo,
            flowType,
            accountCode,
            prepopulateAmount,
        } = this.state;

        if (flowType === SB_FLOW_EDITSBNAME) {
            this.onEditBillNameNext();
        } else {
            const billNameValidMsg = validateSBName(splitBillName);
            const notesValidMsg = validateSBNotes(splitBillNote);

            // Update isValid flag based on the empty mandatory fields
            if (billNameValidMsg !== true || notesValidMsg !== true || !splitBillType) {
                isValid = false;
            }

            // Update for any validation errors
            this.setState({
                splitBillNameValid: !(billNameValidMsg !== true),
                splitBillNameErrMsg: billNameValidMsg,
                splitBillNoteValid: !(notesValidMsg !== true),
                splitBillNoteErrMsg: notesValidMsg,
                radioBtnValid: !!splitBillType,
                radioBtnErrorMsg: "Please select type of split bill",
            });

            if (isValid) {
                logEvent(FA_FORM_PROCEED, {
                    [FA_SCREEN_NAME]: FA_SPLIT_BILL_CREATE_BILL_DETAILS,
                    [FA_FIELD_INFORMATION]: splitBillType === SB_TYPE_EVEN ? EVENLY : SEPARATELY,
                });
                if (splitBillType === SB_TYPE_EVEN) {
                    this.props.navigation.navigate(CALC_AMOUNT_SCREEN, {
                        defaultAmount: prepopulateAmount,
                        onDone: this.onSplitBillAmtUpdate,
                        onClose: this.onAmountCloseTap,
                    });
                } else {
                    const emptyAmount = parseFloat(0).toFixed(2);
                    this.props.navigation.navigate(SB_FRNDSGRPTAB, {
                        splitBillName,
                        splitBillNote,
                        splitBillType,
                        splitBillAmount: `RM ${emptyAmount}`,
                        splitBillRawAmount: emptyAmount,
                        accountNo,
                        accountCode,
                        flowType,
                        screenName: SB_NAME,
                    });
                }
            }
        }
    };

    onEditBillNameNext = async () => {
        console.log("[SBName] >> [onEditBillNameNext]");

        const { splitBillName, billId, flowType } = this.state;
        const billNameValidMsg = validateSBName(splitBillName);
        const formattedBillName = trimOuterInnerExtraSpaces(splitBillName);

        // Update state for validation errors
        this.setState({
            splitBillNameValid: !(billNameValidMsg !== true),
            splitBillNameErrMsg: billNameValidMsg,
        });

        // Return if validation error
        if (billNameValidMsg !== true) return;

        // Request object
        const params = {
            billId: billId,
            name: formattedBillName,
        };

        const httpResp = await updateBillNameAPI(params, true).catch((error) => {
            console.log("[SBName][updateBillNameAPI] >> Exception: ", error);
        });
        const code = httpResp?.data?.code ?? null;

        if (code === 0) {
            logEvent(FA_FORM_COMPLETE, {
                [FA_SCREEN_NAME]: FA_SPLIT_BILL_SPLIT_OPTION_SUCCESSFUL.replace(
                    "Split_Option",
                    FA_EDITBILLNAME
                ),
            });
            this.props.navigation.navigate(SB_DETAILS, {
                splitBillName: formattedBillName,
                flowType,
            });
        } else {
            showErrorToast({
                message: "Failed to update Split Bill name.",
            });
        }
    };

    onAmountCloseTap = () => {
        console.log("[SBName] >> [onAmountCloseTap]");

        const { flowType } = this.state;
        const activeTabIndex = navigateToDashboardIndex(flowType);

        // Navigate back to Dashboard
        this.props.navigation.navigate(SB_DASHBOARD, {
            activeTabIndex,
        });
    };

    onSplitBillAmtUpdate = (amount, errorCallback) => {
        console.log("[SBName] >> [onSplitBillAmtUpdate]");

        // Min/Max amount check
        if ((parseFloat(amount) < 1 || parseFloat(amount) > 999999.99) && errorCallback) {
            errorCallback(SB_MINMAX_AMT_ERR);
            return;
        }

        const { splitBillName, splitBillNote, splitBillType, accountNo, flowType, accountCode } =
            this.state;

        this.props.navigation.navigate(SB_FRNDSGRPTAB, {
            splitBillName,
            splitBillNote,
            splitBillType,
            splitBillAmount: `RM ${amount}`,
            splitBillRawAmount: amount,
            accountNo,
            accountCode,
            flowType,
            screenName: SB_NAME,
        });
    };

    onNameChange = (value) => {
        this.onTextInputChange("splitBillName", value);
    };

    onNoteChange = (value) => {
        this.onTextInputChange("splitBillNote", value);
    };

    onTextInputChange = (key, value) => {
        this.setState({
            [key]: value,
        });
    };

    onEvenlyRadioTap = () => {
        this.onRadioBtnTap(SB_TYPE_EVEN);
    };

    onSeparatelyRadioTap = () => {
        this.onRadioBtnTap(SB_TYPE_SEP);
    };

    onRadioBtnTap = (splitBillType) => {
        console.log("[SBName] >> [onRadioBtnTap]");

        this.setState({
            splitBillType,
        });
    };

    render() {
        const {
            splitBillName,
            splitBillNameValid,
            splitBillNameErrMsg,
            splitBillNote,
            splitBillNoteValid,
            splitBillNoteErrMsg,
            splitBillType,
            radioBtnValid,
            radioBtnErrorMsg,
            onlySBName,
        } = this.state;

        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    scrollable
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={SPLIT_BILL}
                                />
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <KeyboardAvoidingView
                            style={Style.containerView}
                            behavior={Platform.OS === "ios" ? "padding" : ""}
                            enabled
                        >
                            <View style={Style.outerViewCls}>
                                {/* Split Bill Name */}
                                <View style={Style.fieldViewCls}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={19}
                                        textAlign="left"
                                        text="What's this bill for?"
                                    />
                                    <TextInput
                                        minLength={3}
                                        maxLength={14}
                                        autoFocus
                                        isValidate
                                        isValid={splitBillNameValid}
                                        errorMessage={splitBillNameErrMsg}
                                        value={splitBillName}
                                        placeholder="Enter bill name"
                                        onChangeText={this.onNameChange}
                                    />
                                </View>

                                {/* Split Bill Note */}
                                {!onlySBName && (
                                    <View style={Style.fieldViewCls}>
                                        <Typo
                                            fontSize={14}
                                            lineHeight={19}
                                            textAlign="left"
                                            text="Add notes (optional)"
                                        />
                                        <TextInput
                                            minLength={1}
                                            maxLength={14}
                                            isValidate
                                            isValid={splitBillNoteValid}
                                            errorMessage={splitBillNoteErrMsg}
                                            value={splitBillNote}
                                            placeholder="Enter notes"
                                            onChangeText={this.onNoteChange}
                                        />
                                    </View>
                                )}

                                {/* Evenly or Separately radio button */}
                                {!onlySBName && (
                                    <View style={Style.fieldViewCls}>
                                        <Typo
                                            fontSize={14}
                                            lineHeight={19}
                                            textAlign="left"
                                            text={SPLIT_WAY}
                                        />
                                        <View style={Style.radioBtnOuterViewCls}>
                                            <TouchableOpacity
                                                activeOpacity={1}
                                                onPress={this.onEvenlyRadioTap}
                                                style={Style.evenlyViewCls}
                                            >
                                                {splitBillType == SB_TYPE_EVEN ? (
                                                    <RadioChecked
                                                        label="Evenly"
                                                        paramLabelCls={Style.radioBtnLabelCls}
                                                        checkType="color"
                                                    />
                                                ) : (
                                                    <RadioUnchecked
                                                        label="Evenly"
                                                        paramLabelCls={Style.radioBtnLabelCls}
                                                    />
                                                )}
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                activeOpacity={1}
                                                onPress={this.onSeparatelyRadioTap}
                                                style={Style.separatelyViewCls}
                                            >
                                                {splitBillType == SB_TYPE_SEP ? (
                                                    <RadioChecked
                                                        label="Separately"
                                                        paramLabelCls={Style.radioBtnLabelCls}
                                                        checkType="color"
                                                    />
                                                ) : (
                                                    <RadioUnchecked
                                                        label="Separately"
                                                        paramLabelCls={Style.radioBtnLabelCls}
                                                    />
                                                )}
                                            </TouchableOpacity>

                                            {!radioBtnValid && (
                                                <Typo
                                                    style={Style.errorMessage}
                                                    textAlign="left"
                                                    text={radioBtnErrorMsg}
                                                />
                                            )}
                                        </View>
                                    </View>
                                )}
                            </View>
                        </KeyboardAvoidingView>

                        {/* Bottom button container */}
                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    height={48}
                                    fullWidth
                                    borderRadius={24}
                                    backgroundColor={YELLOW}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text={CONTINUE}
                                        />
                                    }
                                    onPress={this.onNextTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    containerView: {
        flex: 1,
        paddingHorizontal: 36,
        width: "100%",
    },

    errorMessage: {
        color: RED_ERROR,
        fontSize: 12,
        lineHeight: 16,
        paddingVertical: 15,
    },

    evenlyViewCls: {
        justifyContent: "center",
        width: 150,
    },

    fieldViewCls: {
        marginTop: 30,
    },

    outerViewCls: {
        flex: 1,
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
        marginTop: 15,
    },

    separatelyViewCls: {
        justifyContent: "center",
        marginTop: 15,
        width: 150,
    },
});

export default SBName;
