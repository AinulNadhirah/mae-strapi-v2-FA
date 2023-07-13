import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { ASB_GUARANTOR_SUCCESS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import RadioButton from "@components/Buttons/RadioButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";

import { GUARANTOR_DECLARATION_AGREE_ACTION } from "@redux/actions/ASBFinance/guarantorDeclarationAction";
import { asbUpdateCEP } from "@redux/services/ASBServices/asbApiUpdateCEP";
import { asbSendNotification } from "@redux/services/ASBServices/asbSendNotification";

import { YELLOW, DISABLED, TRANSPARENT } from "@constants/colors";
import {
    PLSTP_AGREE,
    DECLARATION,
    PLSTP_TNC_NOTE,
    ASB_PRIVACY_NOTE,
    ASB_PRIVACY_NOTE_MM,
    ASB_ALLOW_PROCESS_PI,
    PLSTP_NOT_ALLOW_PROCESS_PI,
    TERMS_CONDITIONS,
    LEAVE,
    CONFIRM,
    LEAVE_TITLE,
    LEAVE_DES,
    CANCEL,
    NOTIFY_GUARANTOR,
    NOTIFY_GUARANTOR_DETAILS,
    PLSTP_TNC_NOTE_MM,
    ASB_GUARANTOR_TNC_DESC_1,
    ASB_GUARANTOR_DISCLOSURE,
    ASB_GUARANTOR_TNC_DESC_2,
    ASB_GUARANTOR_TNC_DESC_3,
    ASB_GUARANTOR_TNC_DESC_4,
} from "@constants/strings";
import {
    ASB_GUARANTOR_DECLARATION_CONVENTIONAL_URL,
    ASB_GUARANTOR_DECLARATION_ISLAMIC_URL,
    ASB_GUARANTOR_TNC_CONVENTIONAL_URL,
    ASB_GUARANTOR_TNC_ISLAMIC_URL,
} from "@constants/url";

import { goBackHomeScreen, navigatePDF } from "../helpers/ASBHelpers";

const GuarantorDeclaration = ({ navigation }) => {
    // Hooks for dispatch reducer action
    const dispatch = useDispatch();

    const prePostQualReducer = useSelector((state) => state.asbServicesReducer.prePostQualReducer);
    const guarantorDeclarationReducer = useSelector(
        (state) => state.asbFinanceReducer.guarantorDeclarationReducer
    );

    const guarantorIdentityDetailsReducer = useSelector(
        (state) => state.asbFinanceReducer.guarantorIdentityDetailsReducer
    );
    const financeDetailsReducer = useSelector(
        (state) => state.asbFinanceReducer.financeDetailsReducer
    );

    const asbGuarantorPrePostQualReducer = useSelector(
        (state) => state.asbServicesReducer.asbGuarantorPrePostQualReducer
    );

    const [cancelPopup, setCancelPopup] = useState(false);
    const [confirmPopup, setConfirmPopup] = useState(false);

    const { agreeDeclaration } = guarantorDeclarationReducer;

    const stpReferenceNumber = prePostQualReducer?.stpreferenceNo;
    const guarantorStpReferenceNumber = asbGuarantorPrePostQualReducer?.stpreferenceNo;

    useEffect(() => {}, []);

    function onAgreeRadioButtonDidTap() {
        dispatch({ type: GUARANTOR_DECLARATION_AGREE_ACTION, agreeDeclaration: true });
    }

    function onDisagreeRadioButtonDidTap() {
        dispatch({ type: GUARANTOR_DECLARATION_AGREE_ACTION, agreeDeclaration: false });
    }

    function onBackTap() {
        navigation.goBack();
    }

    function onClickClose() {
        setCancelPopup(true);
    }

    function onPopupCloseConfirm() {
        setCancelPopup(false);
    }

    function handleLeaveBtn() {
        setCancelPopup(false);
        updateApiCEP(() => {
            navigation.popToTop();
            goBackHomeScreen(navigation);
        });
    }

    function onCancelPopup() {
        setConfirmPopup(false);
    }

    function onAgreeConfirm() {
        setConfirmPopup(true);
    }

    function closeConfirmPopup() {
        setConfirmPopup(false);
        updateApiCEP(() => {
            const body = {
                stpReferenceNo: stpReferenceNumber,
                guarantorEmail: guarantorIdentityDetailsReducer.emailAddress,
                guarantorMobileNumber: guarantorIdentityDetailsReducer.mobileNumberWithoutExtension,
            };

            dispatch(
                asbSendNotification(body, () => {
                    navigation.navigate(ASB_GUARANTOR_SUCCESS, {
                        onCloseTap: () => {
                            navigation.popToTop();
                            goBackHomeScreen(navigation);
                        },
                        onDoneTap: () => {
                            navigation.popToTop();
                            goBackHomeScreen(navigation);
                        },
                    });
                })
            );
        });
    }

    function updateApiCEP(callback) {
        const body = {
            screenNo: "8",
            stpReferenceNo: guarantorStpReferenceNumber,
            declarePdpa: agreeDeclaration ? "Y" : "N",
        };
        dispatch(
            asbUpdateCEP(body, (data) => {
                if (data) {
                    if (callback) {
                        callback();
                    }
                }
            })
        );
    }

    function onTNCLinkDidTap() {
        const dataSend = {
            title: "",
            source: financeDetailsReducer.loanTypeIsConv
                ? ASB_GUARANTOR_TNC_CONVENTIONAL_URL
                : ASB_GUARANTOR_TNC_ISLAMIC_URL,
            headerColor: TRANSPARENT,
        };
        navigatePDF(navigation, dataSend);
    }

    function onDisclosureDidTap() {
        const dataSend = {
            title: "",
            source: financeDetailsReducer.loanTypeIsConv
                ? ASB_GUARANTOR_DECLARATION_CONVENTIONAL_URL
                : ASB_GUARANTOR_DECLARATION_ISLAMIC_URL,
            headerColor: TRANSPARENT,
        };
        navigatePDF(navigation, dataSend);
    }

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName={"analyticScreenName"}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerRightElement={<HeaderCloseButton onPress={onClickClose} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={Style.formContainer}>
                                <View style={Style.contentContainer}>
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={24}
                                        textAlign="left"
                                        text={DECLARATION}
                                    />
                                    <SpaceFiller height={24} />
                                    {buildTNCParagraph()}
                                    <SpaceFiller height={24} />
                                    {buildPointParagraph()}
                                    <SpaceFiller height={24} />
                                    {buildDisclosureParagraph()}
                                    <SpaceFiller height={24} />
                                    {buildPoint2Paragraph()}
                                    <SpaceFiller height={24} />
                                    {buildPoint3Paragraph()}
                                    <SpaceFiller height={24} />
                                    {buildPoint4Paragraph()}
                                    <SpaceFiller height={24} />
                                    {buildPrivacyParagraph()}
                                    <SpaceFiller height={16} />
                                    {buildRadioButtonGroupView()}
                                </View>
                            </View>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    disabled={agreeDeclaration ? false : true}
                                    activeOpacity={agreeDeclaration ? 1 : 0.5}
                                    backgroundColor={agreeDeclaration ? YELLOW : DISABLED}
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={PLSTP_AGREE}
                                        />
                                    }
                                    onPress={onAgreeConfirm}
                                />
                            </View>
                        </FixedActionContainer>
                        {/* Cancel confirmation popup */}
                        <Popup
                            visible={cancelPopup}
                            title={LEAVE_TITLE}
                            description={LEAVE_DES}
                            onClose={onPopupCloseConfirm}
                            primaryAction={{
                                text: LEAVE,
                                onPress: handleLeaveBtn,
                            }}
                            secondaryAction={{
                                text: CANCEL,
                                onPress: onPopupCloseConfirm,
                            }}
                        />
                        <Popup
                            visible={confirmPopup}
                            title={NOTIFY_GUARANTOR}
                            description={NOTIFY_GUARANTOR_DETAILS}
                            onClose={onCancelPopup}
                            primaryAction={{
                                text: CONFIRM,
                                onPress: closeConfirmPopup,
                            }}
                            secondaryAction={{
                                text: CANCEL,
                                onPress: onCancelPopup,
                            }}
                        />
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );

    function buildTNCParagraph() {
        return (
            <Typo fontSize={14} lineHeight={21} fontWeight="400" textAlign="left">
                {PLSTP_TNC_NOTE}
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="600"
                    letterSpacing={0}
                    textAlign="left"
                    style={Style.underline}
                    text={TERMS_CONDITIONS + ","}
                    onPress={onTNCLinkDidTap}
                />
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="600"
                    letterSpacing={0}
                    textAlign="left"
                    text={" "}
                />

                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="400"
                    letterSpacing={0}
                    textAlign="left"
                    text={PLSTP_TNC_NOTE_MM}
                />
            </Typo>
        );
    }

    function buildPointParagraph() {
        return (
            <Typo
                fontSize={14}
                lineHeight={21}
                fontWeight="600"
                letterSpacing={0}
                textAlign="left"
                text={ASB_GUARANTOR_TNC_DESC_1}
            />
        );
    }

    function buildDisclosureParagraph() {
        return (
            <Typo
                fontSize={14}
                lineHeight={21}
                fontWeight="600"
                letterSpacing={0}
                textAlign="left"
                style={Style.underline}
                text={ASB_GUARANTOR_DISCLOSURE}
                onPress={onDisclosureDidTap}
            />
        );
    }

    function buildPoint2Paragraph() {
        return (
            <Typo
                fontSize={14}
                lineHeight={21}
                fontWeight="600"
                letterSpacing={0}
                textAlign="left"
                text={ASB_GUARANTOR_TNC_DESC_2}
            />
        );
    }

    function buildPoint3Paragraph() {
        return (
            <Typo
                fontSize={14}
                lineHeight={21}
                fontWeight="600"
                letterSpacing={0}
                textAlign="left"
                text={ASB_GUARANTOR_TNC_DESC_3}
            />
        );
    }

    function buildPoint4Paragraph() {
        return (
            <Typo
                fontSize={14}
                lineHeight={21}
                fontWeight="600"
                letterSpacing={0}
                textAlign="left"
                text={ASB_GUARANTOR_TNC_DESC_4}
            />
        );
    }

    function buildPrivacyParagraph() {
        return (
            <Typo fontSize={14} lineHeight={21} fontWeight="400" textAlign="left">
                {ASB_PRIVACY_NOTE}
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    textAlign="left"
                    text={". " + ASB_PRIVACY_NOTE_MM}
                />
            </Typo>
        );
    }

    function buildRadioButtonGroupView() {
        return (
            <React.Fragment>
                <RadioButton
                    title={ASB_ALLOW_PROCESS_PI}
                    isSelected={agreeDeclaration ? true : false}
                    onRadioButtonPressed={onAgreeRadioButtonDidTap}
                    fontSize={14}
                    fontWeight="400"
                />
                <SpaceFiller height={15} />
                <RadioButton
                    title={PLSTP_NOT_ALLOW_PROCESS_PI}
                    isSelected={!agreeDeclaration ? true : false}
                    onRadioButtonPressed={onDisagreeRadioButtonDidTap}
                    fontSize={14}
                    fontWeight="400"
                />
            </React.Fragment>
        );
    }
};

export const declarationPropTypes = (GuarantorDeclaration.propTypes = {
    navigation: PropTypes.object,
});

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },

    formContainer: {
        marginBottom: 40,
    },
    underline: {
        textDecorationLine: "underline",
    },
});

export default GuarantorDeclaration;
