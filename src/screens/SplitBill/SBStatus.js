import PropTypes from "prop-types";
import React, { useEffect, useCallback, useRef } from "react";
import { Alert, Dimensions, StyleSheet, Image, View, ScrollView } from "react-native";

import { PDF_VIEWER } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { checkS2WEarnedChances } from "@services";
import { logEvent } from "@services/analytics";

import { WHITE, YELLOW, FADE_GREY, MEDIUM_GREY, GREY } from "@constants/colors";
import {
    FAIL_STATUS,
    PAYMENT_FAIL,
    THIRD_PARTY_TRANSFER,
    RECEIPT_NOTE,
    DONE,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_SPLIT_BILL_CREATE_BILL_CREATED,
    FA_FORM_COMPLETE,
    SPLIT_BILL_SUCC,
    FA_SPLIT_BILL_REQUEST_PAYMENT_SUCCESSFUL,
    FA_TRANSACTION_ID,
    FA_SELECT_ACTION,
    FA_SHARE_RECEIPT,
    FA_ACTION_NAME,
    SPLIT_BILL_FAIL,
    PAYMENT_SUCCESSFUL,
    PAYMENT_FAILED,
    FA_SPLIT_BILL_REQUEST_PAYMENT_UNSUCCESSFUL,
    FA_FORM_ERROR,
    SUCC_STATUS,
} from "@constants/strings";

import { updateWalletBalance } from "@utils/dataModel/utilityWallet";

import Assets from "@assets";

import { getNetworkMsg } from "../../utilities";

const screenHeight = Dimensions.get("window").height;

function SBStatus({ route, navigation, getModel, updateModel }) {
    const status = route?.params?.status ?? FAIL_STATUS;
    const headerText = route?.params?.headerText ?? PAYMENT_FAIL;
    const detailsArray = route?.params?.detailsArray ?? false;
    const serverError = route?.params?.serverError !== "" ? route?.params?.serverError : false;
    const receiptDetailsArray = route?.params?.receiptDetailsArray ?? [];
    const showShareReceipt = route?.params?.showShareReceipt ?? false;

    const isS2uFlow = route?.params?.isS2uFlow;
    const timer = useRef(null);
    const { headerMsg, descMsg } = getNetworkMsg(serverError);

    useEffect(() => {
        // [[UPDATE_BALANCE]] Update the wallet balance if success
        const { isUpdateBalanceEnabled } = getModel("wallet");

        if (isUpdateBalanceEnabled) {
            const isSuccess = route?.params?.status === SUCC_STATUS;

            if (isSuccess && !isS2uFlow) {
                updateWalletBalance(updateModel);
            }
        }

        // this is only for campaign while using tracker and earned entries / chances for user
        // comment it out first, Year End Campaign using push notifications way to show CampaignChancesEarned.js
        // checkForEarnedChances();

        // return () => {
        //     timer.current && clearTimeout(timer.current);
        // };
    }, []);

    useEffect(() => {
        const { headerText, detailsArray } = route?.params;

        const txnId = Object.values(detailsArray)[0]?.value;
        if (headerText === SPLIT_BILL_SUCC && headerText !== SPLIT_BILL_FAIL) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_SPLIT_BILL_CREATE_BILL_CREATED,
            });
            logEvent(FA_FORM_COMPLETE, {
                [FA_SCREEN_NAME]: FA_SPLIT_BILL_CREATE_BILL_CREATED,
            });
        }
        if (headerText === PAYMENT_SUCCESSFUL) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_SPLIT_BILL_REQUEST_PAYMENT_SUCCESSFUL,
            });
            logEvent(FA_FORM_COMPLETE, {
                [FA_SCREEN_NAME]: FA_SPLIT_BILL_REQUEST_PAYMENT_SUCCESSFUL,
                [FA_TRANSACTION_ID]: txnId,
            });
        } else if (headerText === PAYMENT_FAILED) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_SPLIT_BILL_REQUEST_PAYMENT_UNSUCCESSFUL,
            });
            logEvent(FA_FORM_ERROR, {
                [FA_SCREEN_NAME]: FA_SPLIT_BILL_REQUEST_PAYMENT_UNSUCCESSFUL,
                [FA_TRANSACTION_ID]: txnId,
            });
        }
    }, []);

    /**
     * S2W chances earned checkers
     */
    const checkForEarnedChances = useCallback(() => {
        // check if campaign is running and check if it matched the list
        // delayed the check a lil bit to let user see the acknowledge screen
        timer.current && clearTimeout(timer.current);

        timer.current = setTimeout(async () => {
            const {
                misc: { isCampaignPeriod, isTapTasticReady, tapTasticType },
                s2w: { txnTypeList },
            } = getModel(["misc", "s2w"]);
            if (
                (isCampaignPeriod || isTapTasticReady) &&
                txnTypeList.includes("MAESPLITBILL") &&
                route?.params?.status === "success"
            ) {
                try {
                    const params = {
                        txnType: "MAESPLITBILL",
                    };

                    // const response = {
                    //     data: {
                    //         displayPopup: true,
                    //         chance: 2,
                    //     },
                    // };
                    const response = await checkS2WEarnedChances(params);

                    if (response) {
                        const { displayPopup, chance } = response.data;
                        console.log("displayPopup", displayPopup, "chance", chance);

                        if (displayPopup) {
                            // go to earned chances screen
                            navigation.push("TabNavigator", {
                                screen: "CampaignChancesEarned",
                                params: {
                                    chances: chance,
                                    isTapTasticReady,
                                    tapTasticType,
                                },
                            });
                        }
                    }
                } catch (error) {
                    // can't do nothing
                }
            }
        }, 400);
    }, [navigation, getModel]);

    const onShareReceiptTap = useCallback(async () => {
        console.log("[SBStatus] >> [onShareReceiptTap]");
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_SPLIT_BILL_REQUEST_PAYMENT_SUCCESSFUL,
            [FA_ACTION_NAME]: FA_SHARE_RECEIPT,
        });
        // Call custom method to generate PDF
        const file = await CustomPdfGenerator.generateReceipt(
            true,
            THIRD_PARTY_TRANSFER,
            true,
            RECEIPT_NOTE,
            receiptDetailsArray,
            true,
            "success",
            "Successful"
        );
        if (file === null) {
            Alert.alert("Please allow permission");
            return;
        }

        const navParams = {
            file,
            share: true,
            type: "file",
            pdfType: "shareReceipt",
        };

        // Navigate to PDF viewer to display PDF
        navigation.navigate(PDF_VIEWER, navParams);
    }, [receiptDetailsArray]);

    const onDoneTap = useCallback(() => {
        console.log("[SBStatus] >> [onDoneTap]");

        const onDone = route.params?.onDone ?? "";

        if (onDone) {
            onDone();
        } else {
            navigation.goBack();
        }
    }, [navigation]);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={<HeaderLayout />}
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                useSafeArea
            >
                <React.Fragment>
                    <ScrollView style={Style.scrollViewCls}>
                        {/* Image Block */}
                        <View style={Style.statusPgImgBlockCls}>
                            <Image
                                resizeMode="contain"
                                style={Style.statusIconCls}
                                source={
                                    status == "failure" ? Assets.icFailedIcon : Assets.icTickNew
                                }
                            />
                        </View>

                        {/* Desc */}
                        <Typo
                            fontSize={20}
                            fontWeight="300"
                            letterSpacing={0}
                            lineHeight={28}
                            textAlign="left"
                            text={headerMsg ?? headerText}
                            style={Style.descCls}
                        />

                        {/* Server Error */}
                        {serverError && (
                            <Typo
                                fontSize={12}
                                textAlign="left"
                                color={FADE_GREY}
                                lineHeight={18}
                                text={descMsg ?? serverError}
                            />
                        )}

                        {/* Status Details */}
                        {detailsArray && (
                            <View style={Style.detailsViewCls}>
                                {detailsArray.map((prop, index) => {
                                    return (
                                        <View style={Style.detailsBlockCls} key={index}>
                                            <Typo
                                                fontSize={12}
                                                letterSpacing={0}
                                                lineHeight={18}
                                                text={prop.key}
                                            />

                                            <Typo
                                                fontSize={12}
                                                fontWeight="600"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                text={prop.value}
                                            />
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </ScrollView>

                    {/* Bottom docked button container */}
                    <FixedActionContainer>
                        <View style={Style.bottomBtnContCls}>
                            {status == "success" && showShareReceipt ? (
                                <ActionButton
                                    height={48}
                                    fullWidth
                                    borderRadius={24}
                                    backgroundColor={WHITE}
                                    borderStyle="solid"
                                    borderWidth={1}
                                    borderColor={GREY}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text="Share Receipt"
                                        />
                                    }
                                    onPress={onShareReceiptTap}
                                    style={Style.statusButton}
                                />
                            ) : null}

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
                                        text={DONE}
                                    />
                                }
                                onPress={onDoneTap}
                            />
                        </View>
                    </FixedActionContainer>
                </React.Fragment>
            </ScreenLayout>
        </ScreenContainer>
    );
}

const Style = StyleSheet.create({
    bottomBtnContCls: {
        width: "100%",
    },

    descCls: {
        marginBottom: 5,
    },

    detailsBlockCls: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
        marginTop: 10,
        width: "100%",
    },

    detailsViewCls: {
        marginTop: 30,
    },

    scrollViewCls: {
        paddingHorizontal: 36,
    },

    statusButton: {
        marginBottom: 15,
    },

    statusIconCls: {
        height: 52,
        width: 57,
    },

    statusPgImgBlockCls: {
        marginBottom: 25,
        marginTop: (screenHeight * 15) / 100,
        width: "100%",
    },
});

SBStatus.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
};

export default withModelContext(SBStatus);
