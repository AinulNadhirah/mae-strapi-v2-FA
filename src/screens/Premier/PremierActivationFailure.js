import PropTypes from "prop-types";
import React, { useEffect } from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    View,
    ScrollView,
    Platform,
    TouchableOpacity
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
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
    SHARE_RECEIPT
} from "@constants/strings";

import { updateWalletBalance } from "@utils/dataModel/utilityWallet";

import Assets from "@assets";

import {
    FailureDetailsViewWithAccountNumber,
    FailureDetailsViewWithDateAndTime,
    FailureDetailsViewWithReferenceId
} from "../ZestCASA/components/FailureDetailsView";
import { entryPropTypes } from "./PM1IntroScreen";

const PremierActivationFailure = (props) => {
    const { getModel, updateModel } = useModelController();
    const { route } = props;
    const { height } = Dimensions.get("window");
    const marginFromTop = height * 0.25;
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

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        console.log("[AccountActivationFailure] >> [init]");
        console.log(props);

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
                } else {
                    logEvent(FA_FORM_ERROR, {
                        [FA_SCREEN_NAME]: analyticScreenName,
                    });
                }
            }
        }

        // [[UPDATE_BALANCE]] Update balance from response if transaction is success
        const { isUpdateBalanceEnabled } = getModel("wallet");

        if (isUpdateBalanceEnabled && isDebitCardSuccess) {
            updateWalletBalance(updateModel);
        }
    };

    return (
            <ScreenContainer backgroundType="color">
                <ScreenLayout paddingHorizontal={0} paddingBottom={0} paddingTop={0} useSafeArea>
                    <React.Fragment>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KeyboardAwareScrollView
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                            >
                                <View style={Style.formContainer}>
                                    <View style={Style.contentContainer}>
                                        <SpaceFiller height={marginFromTop} />
                                        <Image
                                            source={
                                                isDebitCardSuccess
                                                    ? Assets.icTickNew
                                                    : Assets.icFailedIcon
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
                </ScreenLayout>
            </ScreenContainer>
    );

    function buildDetailsView () {
        if (accountNumber && referenceId && dateAndTime) {
            return (
                <FailureDetailsViewWithAccountNumber
                    accountNumber={accountNumber}
                    referenceId={referenceId}
                    dateAndTime={dateAndTime}
                />
            );
        } else if (!accountNumber && referenceId && dateAndTime) {
            return (
                <FailureDetailsViewWithReferenceId
                    referenceId={referenceId}
                    dateAndTime={dateAndTime}
                />
            );
        } else if (!accountNumber && !referenceId && dateAndTime) {
            return <FailureDetailsViewWithDateAndTime dateAndTime={dateAndTime} />;
        } else {
            return <React.Fragment />;
        }
    }
};

export const failurePropTypes = (PremierActivationFailure.propTypes = {
    ...entryPropTypes,
    title: PropTypes.string,
    description: PropTypes.string,
    accountNumber: PropTypes.string,
    referenceId: PropTypes.string,
    dateAndTime: PropTypes.string,
    isDebitCardSuccess: PropTypes.bool,
    onDoneButtonDidTap: PropTypes.func,
    onShareReceiptButtonDidTap: PropTypes.func,
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

export default PremierActivationFailure;
