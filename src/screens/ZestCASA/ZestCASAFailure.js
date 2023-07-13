import PropTypes from "prop-types";
import React, { useEffect } from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    View,
    ScrollView,
    Platform,
    TouchableOpacity,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { logEvent } from "@services/analytics";

import { BLACK, GREY, ROYAL_BLUE, WHITE } from "@constants/colors";
import {
    CANCEL,
    DONE,
    FA_FORM_ERROR,
    FA_SCREEN_NAME,
    FA_TRANSACTION_ID,
    FA_VIEW_SCREEN,
    SHARE_RECEIPT,
} from "@constants/strings";

import { updateWalletBalance } from "@utils/dataModel/utilityWallet";

import Assets from "@assets";

import { entryPropTypes } from "./ZestCASAEntry";
import { FailureDetailsViewWithAccountNumber } from "./components/FailureDetailsView";

const ZestCASAFailure = (props) => {
    const { getModel, updateModel } = useModelController();

    const { route } = props;
    const { height } = Dimensions.get("window");
    const marginFromTop = height * 0.25;
    const marginFromTopWithCloseBotton = height * 0.12;
    const title = route?.params?.title;
    const description = route?.params?.description;
    const accountNumber = route?.params?.accountNumber;
    const referenceId = route?.params?.referenceId;
    const dateAndTime = route?.params?.dateAndTime;
    const onCancelButtonDidTap = route?.params?.onCancelButtonDidTap;
    const onShareReceiptButtonDidTap = route?.params?.onShareReceiptButtonDidTap;
    const isDebitCardSuccess = route?.params?.isDebitCardSuccess;
    const analyticScreenName = route?.params?.analyticScreenName;
    const needFormAnalytics = route?.params?.needFormAnalytics;
    const doneButtonText = route?.params?.doneButtonText;
    const onDoneButtonDidTap = route?.params?.onDoneButtonDidTap;
    const needCloseBackButton = route?.params?.needCloseBackButton ?? false;
    const onBackTap = route?.params?.onBackTap;
    const onCloseTap = route?.params?.onCloseTap;
    const referenceIdForGA = route?.params?.referenceIdForGA;

    useEffect(() => {
        // [[UPDATE_BALANCE]] Update balance from response if transaction is success
        const { isUpdateBalanceEnabled } = getModel("wallet");

        if (isUpdateBalanceEnabled && isDebitCardSuccess) {
            updateWalletBalance(updateModel);
        }
    }, []);

    useEffect(() => {
        if (analyticScreenName) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: analyticScreenName,
            });
            if (needFormAnalytics) {
                if (referenceId) {
                    logEvent(FA_FORM_ERROR, {
                        [FA_SCREEN_NAME]: analyticScreenName,
                        [FA_TRANSACTION_ID]: referenceId,
                    });
                } else if (referenceIdForGA) {
                    logEvent(FA_FORM_ERROR, {
                        [FA_SCREEN_NAME]: analyticScreenName,
                        [FA_TRANSACTION_ID]: referenceIdForGA,
                    });
                } else {
                    logEvent(FA_FORM_ERROR, {
                        [FA_SCREEN_NAME]: analyticScreenName,
                    });
                }
            }
        }
    }, [analyticScreenName, needFormAnalytics, referenceId, referenceIdForGA]);

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color">
                {needCloseBackButton ? (
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                                headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                            />
                        }
                        paddingHorizontal={0}
                        paddingBottom={0}
                        paddingTop={0}
                        useSafeArea
                    >
                        {failureLayout()}
                    </ScreenLayout>
                ) : (
                    <ScreenLayout
                        paddingHorizontal={0}
                        paddingBottom={0}
                        paddingTop={0}
                        useSafeArea
                    >
                        {failureLayout()}
                    </ScreenLayout>
                )}
            </ScreenContainer>
        </React.Fragment>
    );

    function failureLayout() {
        return (
            <React.Fragment>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <KeyboardAwareScrollView
                        behavior={Platform.OS === "ios" ? "padding" : ""}
                        enabled
                    >
                        <View style={Style.formContainer}>
                            <View style={Style.contentContainer}>
                                {needCloseBackButton ? (
                                    <SpaceFiller height={marginFromTopWithCloseBotton} />
                                ) : (
                                    <SpaceFiller height={marginFromTop} />
                                )}
                                <Image
                                    source={
                                        isDebitCardSuccess ? Assets.icTickNew : Assets.icFailedIcon
                                    }
                                    style={Style.failedImage}
                                />
                                <SpaceFiller height={28} />
                                <Typo
                                    fontSize={20}
                                    fontWeight="400"
                                    lineHeight={30}
                                    textAlign="left"
                                    text={title}
                                />
                                <SpaceFiller height={8} />
                                {description && (
                                    <Typo
                                        fontSize={12}
                                        fontWeight="400"
                                        lineHeight={18}
                                        textAlign="left"
                                        text={description}
                                    />
                                )}
                                <SpaceFiller height={36} />
                                {buildDetailsView()}
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </ScrollView>

                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        <View style={Style.buttonContainer}>
                            {onShareReceiptButtonDidTap && (
                                <ActionButton
                                    disabled={false}
                                    fullWidth
                                    borderRadius={25}
                                    borderWidth={0.5}
                                    borderColor={GREY}
                                    onPress={onShareReceiptButtonDidTap}
                                    backgroundColor={WHITE}
                                    componentCenter={
                                        <Typo
                                            color={BLACK}
                                            text={SHARE_RECEIPT}
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                    }
                                />
                            )}
                        </View>
                    </View>
                </FixedActionContainer>

                <FixedActionContainer>
                    <View style={Style.buttonContainer}>
                        {onDoneButtonDidTap && (
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={doneButtonText ?? DONE}
                                        />
                                    }
                                    onPress={onDoneButtonDidTap}
                                />
                            </View>
                        )}
                        <SpaceFiller height={16} />
                        {onCancelButtonDidTap && (
                            <View style={Style.bottomBtnContCls}>
                                <TouchableOpacity onPress={onCancelButtonDidTap}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        textAlign="left"
                                        color={ROYAL_BLUE}
                                        text={CANCEL}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </FixedActionContainer>
            </React.Fragment>
        );
    }

    function buildDetailsView() {
        if (!accountNumber && !referenceId && !dateAndTime) {
            <React.Fragment />;
        } else {
            return (
                <FailureDetailsViewWithAccountNumber
                    accountNumber={accountNumber}
                    referenceId={referenceId}
                    dateAndTime={dateAndTime}
                />
            );
        }
    }
};

export const failurePropTypes = (ZestCASAFailure.propTypes = {
    ...entryPropTypes,

    title: PropTypes.string,
    description: PropTypes.string,
    accountNumber: PropTypes.string,
    referenceId: PropTypes.string,
    dateAndTime: PropTypes.string,
    isDebitCardSuccess: PropTypes.bool,
    onDoneButtonDidTap: PropTypes.func,
    onShareReceiptButtonDidTap: PropTypes.func,
    referenceIdForGA: PropTypes.string,
});

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    buttonContainer: {
        flexDirection: "column",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },

    failedImage: {
        height: 56,
        width: 56,
    },

    formContainer: {
        marginBottom: 40,
    },
});

export default ZestCASAFailure;
