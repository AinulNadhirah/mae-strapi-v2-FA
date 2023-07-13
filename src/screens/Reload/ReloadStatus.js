import PropTypes from "prop-types";
import React, { Component } from "react";
import { Alert, Dimensions, StyleSheet, Image, View, ScrollView } from "react-native";

import {
    PDF_VIEWER,
    TAB_NAVIGATOR,
    ACCOUNT_DETAILS_SCREEN,
    BANKINGV2_MODULE,
    DASHBOARD,
    TAB,
    MORE,
    SPLASHSCREEN,
} from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

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
    RELOAD,
    RECEIPT_NOTE,
    DONE,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_RELOAD_SUCCESSFUL,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    FA_RELOAD_SHARE_RECEIPT,
    FA_RELOAD_UNSUCCESSFUL,
    FA_FORM_COMPLETE,
    FA_TRANSACTION_ID,
    FA_FORM_ERROR,
    FA_FIELD_INFORMATION,
    FA_VALUE,
    FA_SHARE,
    FA_RELOAD_RECEIPT,
    FA_METHOD,
} from "@constants/strings";

import { updateWalletBalance } from "@utils/dataModel/utilityWallet";

import Assets from "@assets";

import { getNetworkMsg } from "../../utilities";

const screenHeight = Dimensions.get("window").height;

class ReloadStatus extends Component {
    static propTypes = {
        navigation: PropTypes.object,
        route: PropTypes.object,
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            status: props.route.params?.status ?? FAIL_STATUS, // success | failure
            headerText: props.route.params?.headerText ?? PAYMENT_FAIL,
            detailsArray: props.route.params?.detailsArray ?? false, // Each object must contain key & value
            serverError: props.route.params?.serverError ?? false,
            receiptDetailsArray: props.route.params?.receiptDetailsArray ?? [],
            showShareReceipt: props.route.params?.showShareReceipt ?? false,
            isLocked: props.route.params?.isLocked ?? false,
            isDisabled: false,
        };
    }

    componentDidMount() {
        const txnId = this.state.detailsArray.find((obj) => obj.key === "Reference ID")?.value;
        const provider = this.state.detailsArray.find((obj) => obj.key === "Provider")?.value;
        const amtTransferred = this.state.detailsArray.find((obj) => obj.key === "Amount")?.value;
        const screenName = this.state.status === FAIL_STATUS;

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName ? FA_RELOAD_UNSUCCESSFUL : FA_RELOAD_SUCCESSFUL,
        });
        logEvent(screenName ? FA_FORM_ERROR : FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: screenName ? FA_RELOAD_UNSUCCESSFUL : FA_RELOAD_SUCCESSFUL,
            [FA_TRANSACTION_ID]: txnId,
            [FA_FIELD_INFORMATION]: provider,
            [FA_VALUE]: amtTransferred,
        });
        // this is only for campaign while using tracker and earned entries / chances for user
        // comment it out first, Year End Campaign using push notifications way to show CampaignChancesEarned.js
        // if (this.props.route.params?.status !== "failure") this.checkForEarnedChances();

        // [[UPDATE_BALANCE]] Update the wallet balance if success
        const { isUpdateBalanceEnabled } = this.props.getModel("wallet");

        if (isUpdateBalanceEnabled) {
            const isS2uFlow = this.props.route?.params?.isS2uFlow;
            const isSuccess = this.props.route.params?.status === "success";

            if (isSuccess && !isS2uFlow) {
                updateWalletBalance(this.props.updateModel);
            }
        }
    }

    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
    }

    /**
     * S2W chances earned checkers
     */
    checkForEarnedChances = () => {
        // check if campaign is running and check if it matched the list
        // delayed the check a lil bit to let user see the acknowledge screen
        this.timer && clearTimeout(this.timer);

        this.timer = setTimeout(async () => {
            const {
                misc: { isCampaignPeriod, isTapTasticReady, tapTasticType },
                s2w: { txnTypeList },
            } = this.props.getModel(["misc", "s2w"]);

            if ((isCampaignPeriod || isTapTasticReady) && txnTypeList.includes("M2URELOAD")) {
                const telcoName = this.props.route.params?.telcoName ?? "";
                const reloadAmount = this.props.route.params?.amount ?? 0;

                try {
                    /**
                     * New in Raya s2w
                     * For maxis reload, use code M2URELOADSPL
                     * For others, if amount >= 50, use M2URELOAD2
                     * else use M2URELOAD
                     */
                    const params = {
                        txnType:
                            telcoName === "Maxis Hotlink"
                                ? "M2URELOADSPL"
                                : reloadAmount >= 50
                                ? "M2URELOAD2"
                                : "M2URELOAD",
                    };

                    const response = await checkS2WEarnedChances(params);

                    if (response) {
                        const { displayPopup, chance } = response.data;
                        console.log("displayPopup", displayPopup, "chance", chance);

                        if (displayPopup) {
                            // go to earned chances screen
                            this.props.navigation.push("TabNavigator", {
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
    };

    reloadGASharePDF = (reloadShare) => {
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: FA_RELOAD_RECEIPT,
            [FA_METHOD]: reloadShare,
        });
    };

    reloadPdfView = () => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_RELOAD_RECEIPT,
        });
    };

    onShareReceiptTap = async () => {
        console.log("[ReloadStatus] >> [onShareReceiptTap]");
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_RELOAD_SUCCESSFUL,
            [FA_ACTION_NAME]: FA_RELOAD_SHARE_RECEIPT,
        });

        this.setState({
            isDisabled: true,
        });

        try {
            // Call custom method to generate PDF
            const file = await CustomPdfGenerator.generateReceipt(
                true,
                RELOAD,
                true,
                RECEIPT_NOTE,
                this.state.receiptDetailsArray,
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
                sharePdfGaHandler: this.reloadGASharePDF,
                GAPdfView: this.reloadPdfView,
            };

            // Navigate to PDF viewer to display PDF
            this.props.navigation.navigate(PDF_VIEWER, navParams);
        } catch (err) {
            console.log(err);
        } finally {
            this.setState({
                isDisabled: false,
            });
        }
    };

    onDoneTap = () => {
        console.log("[ReloadStatus] >> [onDoneTap]");

        if (this.state.isLocked) {
            NavigationService.resetAndNavigateToModule(SPLASHSCREEN, "", {
                skipIntro: true,
                rsaLocked: true,
            });
        } else {
            const routeFrom = this.props.route.params?.routeFrom ?? DASHBOARD;

            if (routeFrom === "AccountDetails") {
                this.props.navigation.navigate(BANKINGV2_MODULE, {
                    screen: ACCOUNT_DETAILS_SCREEN,
                });
                return;
            }

            if (routeFrom === "WALLET_DASHBOARD") {
                this.props.navigation.navigate(TAB_NAVIGATOR, {
                    screen: TAB,
                    params: {
                        screen: MORE,
                    },
                });
                return;
            }

            this.props.navigation.navigate(TAB_NAVIGATOR, {
                screen: TAB,
                params: {
                    screen: DASHBOARD,
                    params: { refresh: true },
                },
            });
        }
    };

    render() {
        const { status, showShareReceipt, serverError, detailsArray, headerText, isDisabled } =
            this.state;

        const { headerMsg, descMsg } = getNetworkMsg(serverError);

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
                            <Typo
                                fontSize={12}
                                textAlign="left"
                                color={FADE_GREY}
                                lineHeight={18}
                                text={descMsg ?? serverError}
                            />

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
                                {status === "success" && showShareReceipt && (
                                    <ActionButton
                                        height={48}
                                        fullWidth
                                        borderRadius={24}
                                        borderColor={GREY}
                                        borderWidth={1}
                                        backgroundColor={WHITE}
                                        disabled={isDisabled}
                                        isLoading={isDisabled}
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text="Share Receipt"
                                            />
                                        }
                                        onPress={this.onShareReceiptTap}
                                        style={Style.statusButton}
                                    />
                                )}

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
                                    onPress={this.onDoneTap}
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
        marginTop: (screenHeight * 10) / 100,
        width: "100%",
    },
});

export default withModelContext(ReloadStatus);
