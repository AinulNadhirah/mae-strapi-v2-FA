import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    Alert,
    Dimensions,
    StyleSheet,
    Image,
    View,
    ScrollView,
    TouchableOpacity,
} from "react-native";

import {
    PDF_VIEWER,
    TOPUP_ENTER_AMOUNT_SCREEN,
    MAE_MODULE_STACK,
    INVITE_CODE,
    GATEWAY_SCREEN,
    TOPUP_STATUS_SCREEN,
    BANKINGV2_MODULE,
    MAE_CARD_ADDRESS,
    MAE_CARDDETAILS,
    TAB_NAVIGATOR,
    DASHBOARD,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { styles } from "@components/Toast";

import { withModelContext } from "@context";

import { GAOnboarding } from "@services/analytics/analyticsSTPMae";

import {
    WHITE,
    YELLOW,
    FADE_GREY,
    MEDIUM_GREY,
    ROYAL_BLUE,
    GREY,
    LIGHT_GREY,
} from "@constants/colors";
import * as Strings from "@constants/strings";

import { formateAccountNumber } from "@utils/dataModel/utility";
import { autoTopupNavigate } from "@utils/dataModel/utilityPartial.5";
import { updateWalletBalance } from "@utils/dataModel/utilityWallet";

import Assets from "@assets";

import { getNetworkMsg } from "../../../utilities";
import * as TopupController from "./TopupController";

const screenHeight = Dimensions.get("window").height;

class TopupStatusScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: props.route.params?.status ?? Strings.FAIL_STATUS, // success | failure
            headerText: props.route.params?.headerText,
            detailsArray: props.route.params?.detailsArray ?? false, // Each object must contain key & value
            serverError: props.route.params?.serverError ?? false,
            receiptDetailsArray: props.route.params?.receiptDetailsArray ?? [],
            showShareReceipt: props.route.params?.showShareReceipt ?? false,
            isShowShareInvitation: false,
            isShowApplyCard: false,
            s2wParams: props.route.params?.s2wParams ?? {},
            showAutoTopup: false,
            autoTopupParam: {},
        };
    }

    componentDidMount() {
        console.log("[TopupStatusScreen] >> [componentDidMount]");

        this.init();

        this.props.navigation.addListener("focus", this.onScreenFocus);

        // [[UPDATE_BALANCE]] Update the wallet balance if success
        const { isUpdateBalanceEnabled } = this.props.getModel("wallet");

        if (isUpdateBalanceEnabled) {
            const isSuccess = this.props.route?.params?.status === "success";
            if (isSuccess) {
                updateWalletBalance(this.props.updateModel);
            }
        }
    }

    // extract from original code to avoid having setState within CDM
    init() {
        const { routeFrom, data } = this.props.route.params;

        if (this.state.status == "success") {
            this._autoTopupInq();
        }

        if (routeFrom == "Dashboard") {
            const inviteCode = data?.inviteCode ?? "";
            if (inviteCode.length > 0 && !this.state.headerText.includes("Debit")) {
                this.setState({
                    isShowShareInvitation: true,
                });
            }

            if (!this.state.headerText.includes("Debit")) {
                this.setState({
                    isShowApplyCard: true,
                });
            }

            if (this.state.status == "success") {
                this.setState({
                    headerText: Strings.TOPUP_STATUS_MSG_SUCC_ONBOARD,
                });
            }
        } else {
            const transactionDetails = this.state.detailsArray;
            const transactionId =
                transactionDetails && transactionDetails.length === 3
                    ? transactionDetails[2]?.value
                    : transactionDetails.length === 2
                    ? transactionDetails[0]?.value
                    : "";
            GAOnboarding.onAcknowledgeTouUp(this.state.status, transactionId);
        }
    }

    _autoTopupInq = async () => {
        console.log("[TopupStatusSCreen] >> [_autoTopupInq]");
        const { maeData } = this.props.route.params;

        if (maeData && maeData.debitInq) {
            const navParams = {
                fromModule: TAB_NAVIGATOR,
                fromScreen: "Dashboard",
                moreParams: {},
            };

            const { screen, params } = await autoTopupNavigate(maeData, navParams);

            if (screen === "AutoTopupLimit") {
                this.setState({
                    showAutoTopup: true,
                    autoTopupParam: params,
                });
            }
        }
    };

    onScreenFocus = () => {
        console.log("[TopupStatusScreen] >> [onScreenFocus]");

        const params = this.props.route?.params ?? "";
        if (!params) return;

        this.setState({
            status: params?.status ?? Strings.FAIL_STATUS, // success | failure
            headerText: params?.headerText,
            detailsArray: params?.detailsArray ?? false, // Each object must contain key & value
            serverError: params?.serverError ?? false,
            receiptDetailsArray: params?.receiptDetailsArray ?? [],
            showShareReceipt: params?.showShareReceipt ?? false,
        });

        //show invite Code
        const { routeFrom, data, headerText } = params;

        if (routeFrom === "Dashboard" && !headerText.includes("Debit")) {
            const inviteCode = data?.inviteCode ?? "";
            if (inviteCode.length > 0) {
                this.setState({
                    isShowShareInvitation: true,
                });
            }

            this.setState({
                isShowApplyCard: true,
            });
        }

        if (params?.s2wParams?.isTapTasticReady) {
            this.props.navigation.push("TabNavigator", {
                screen: "CampaignChancesEarned",
                params: {
                    ...params?.s2wParams,
                },
            });
        }
    };

    /* EVENT HANDLERS */

    onShareReceiptTap = async () => {
        console.log("[TopupStatusScreen] >> [onShareReceiptTap]");

        // Call custom method to generate PDF
        const file = await CustomPdfGenerator.generateReceipt(
            true,
            Strings.TOPUP_CASA_HEADER,
            true,
            Strings.RECEIPT_NOTE,
            this.state.receiptDetailsArray,
            true
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
        this.props.navigation.navigate(PDF_VIEWER, navParams);
    };

    onDoneTap = () => {
        console.log("[TopupStatusScreen] >> [onDoneTap]");

        const params = this.props.route.params;
        const { routeFrom, fundingType, status, transactionType, data } = params;

        if (transactionType === "AUTO_TOPUP") {
            const navParams = {
                data: {
                    ...data,
                },
                status,
                isAddCard: true,
                from: "ADDCARD",
            };
            this.props.navigation.navigate("AutoTopupCard", navParams);
            return;
        }

        if (status === "success" && routeFrom === DASHBOARD && fundingType === "ADDCARD") {
            this.navToOnboardFundingFlow();
        } else {
            TopupController.onTopupModuleClosePress(this);
        }
    };

    onActivateAutoTopup = () => {
        console.log("[TopupStatusScreen] >> [onActivateAutoTopup]");
        const navParams = this.state.autoTopupParam;
        TopupController.activateAutoTopup(this, navParams);
    };

    onMAECardTap = () => {
        this.props.navigation.navigate(GATEWAY_SCREEN, {
            action: "APPLY_MAE_CARD",
            entryPoint: "MAE_ONBOARD_TOPUP",
        });
    };

    navToOnboardFundingFlow = () => {
        console.log("[TopupStatusScreen] >> [navToOnboardFundingFlow]");
        // TODO: Handle for Onboard Funding CR
        const params = this.props.route.params;
        const data = params?.data ?? {};
        const acctNo = data?.acctNo ?? "";
        const formattedAccount = acctNo ? formateAccountNumber(acctNo, 12) : "";
        const navParams = {
            data: {
                ...data,
                formattedAccount,
            },
            ...params,
        };

        this.props.navigation.navigate(TOPUP_ENTER_AMOUNT_SCREEN, navParams);
    };

    onShareInviteCode = () => {
        console.log("[TopupStatusScreen] >> [onShareInviteCode]");
        const inviteCode = this.props.route.params?.data?.inviteCode ?? "";
        this.props.navigation.navigate(MAE_MODULE_STACK, {
            screen: INVITE_CODE,
            params: {
                inviteCode,
                from: TOPUP_STATUS_SCREEN,
                ...this.props.route.params,
            },
        });
    };

    /* UI */

    render() {
        const {
            status,
            showShareReceipt,
            serverError,
            detailsArray,
            isShowApplyCard,
            isShowShareInvitation,
            showAutoTopup,
        } = this.state;
        const { headerMsg, descMsg } = getNetworkMsg(serverError);
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            horizontalPaddingMode={"custom"}
                            horizontalPaddingCustomLeftValue={16}
                            horizontalPaddingCustomRightValue={16}
                        />
                    }
                    paddingHorizontal={36}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView style={Style.scrollContainer}>
                            {/* Image Block */}
                            <View style={Style.statusPgImgBlockCls}>
                                <Image
                                    resizeMode="contain"
                                    style={Style.statusImg}
                                    source={
                                        this.state.status == "failure"
                                            ? Assets.icFailedIcon
                                            : Assets.icTickNew
                                    }
                                />
                            </View>

                            {/* Desc */}
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={28}
                                textAlign="left"
                                text={headerMsg ?? this.state.headerText}
                                style={{ marginBottom: 5 }}
                            />

                            {/* Server Error */}
                            <Typo
                                fontSize={12}
                                textAlign="left"
                                fontWeight="normal"
                                fontStyle="normal"
                                color={FADE_GREY}
                                lineHeight={18}
                                text={descMsg ?? serverError}
                            />

                            {/* Status Details */}
                            {detailsArray && (
                                <View style={{ marginTop: 25 }}>
                                    {detailsArray.map((prop, key) => {
                                        return (
                                            <View style={Style.detailsBlockCls} key={key}>
                                                <Typo
                                                    fontSize={12}
                                                    fontWeight="normal"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    text={prop.key}
                                                />

                                                <Typo
                                                    fontSize={12}
                                                    fontWeight="600"
                                                    fontStyle="normal"
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

                        {/* Bottom Button Container */}
                        <View style={Style.btnContainerCls}>
                            {status == "success" && showShareReceipt ? (
                                <ActionButton
                                    height={48}
                                    fullWidth
                                    borderRadius={24}
                                    backgroundColor={WHITE}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            text="Share Receipt"
                                        />
                                    }
                                    onPress={this.onShareReceiptTap}
                                    style={{ marginBottom: 15 }}
                                />
                            ) : null}
                            {showAutoTopup ? (
                                <>
                                    <ActionButton
                                        height={48}
                                        fullWidth
                                        borderRadius={24}
                                        backgroundColor={YELLOW}
                                        borderWidth={0}
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                text={Strings.ACTIVATE_AUTO_TOPUP}
                                            />
                                        }
                                        onPress={this.onActivateAutoTopup}
                                    />
                                    <TouchableOpacity
                                        onPress={this.onDoneTap}
                                        activeOpacity={0.8}
                                        style={Style.blueDone}
                                    >
                                        <Typo
                                            color={ROYAL_BLUE}
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text="Done"
                                        />
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <ActionButton
                                    height={48}
                                    fullWidth
                                    borderRadius={24}
                                    backgroundColor={
                                        isShowApplyCard ? WHITE : showAutoTopup ? null : YELLOW
                                    }
                                    borderWidth={isShowApplyCard ? 1 : 0}
                                    borderColor={isShowApplyCard ? GREY : LIGHT_GREY}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            text={Strings.DONE}
                                        />
                                    }
                                    onPress={this.onDoneTap}
                                />
                            )}
                            {isShowApplyCard && (
                                <ActionButton
                                    height={48}
                                    fullWidth
                                    borderRadius={24}
                                    style={Style.MAECardBtn}
                                    backgroundColor={YELLOW}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            text="Get a MAE Card"
                                        />
                                    }
                                    onPress={this.onMAECardTap}
                                />
                            )}
                            {/* {isShowShareInvitation && (
                                <TouchableOpacity
                                    onPress={this.onShareInviteCode}
                                    activeOpacity={0.8}
                                    style={{ marginTop: 24 }}
                                >
                                    <Typo
                                        color={ROYAL_BLUE}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="Share Invite Code"
                                    />
                                </TouchableOpacity>
                            )} */}
                        </View>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

TopupStatusScreen.propTypes = {
    navigation: PropTypes.shape({
        addListener: PropTypes.func,
        navigate: PropTypes.func,
        pop: PropTypes.func,
        push: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            data: PropTypes.shape({
                inviteCode: PropTypes.string,
            }),
            detailsArray: PropTypes.bool,
            fundingType: PropTypes.string,
            headerText: PropTypes.any,
            receiptDetailsArray: PropTypes.array,
            routeFrom: PropTypes.string,
            serverError: PropTypes.bool,
            showShareReceipt: PropTypes.bool,
            status: PropTypes.string,
            transactionType: PropTypes.string,
            s2wParams: PropTypes.object,
        }),
    }),
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
};

const Style = StyleSheet.create({
    MAECardBtn: {
        marginTop: 16,
    },

    btnContainerCls: {
        bottom: 0,
        left: 0,
        paddingBottom: 25,
        paddingTop: 25,
        right: 0,
    },

    detailsBlockCls: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
        marginTop: 10,
        width: "100%",
    },

    scrollContainer: {
        flex: 1,
    },
    statusImg: {
        height: 52,
        width: 57,
    },
    statusPgImgBlockCls: {
        marginBottom: 25,
        marginTop: (screenHeight * 10) / 100,
        width: "100%",
    },
    blueDone: { marginTop: 24 },
});

export default withModelContext(TopupStatusScreen);
