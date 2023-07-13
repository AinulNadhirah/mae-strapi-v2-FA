import PropTypes from "prop-types";
import React, { Component } from "react";
import { Alert, Dimensions, StyleSheet, Image, View, ScrollView } from "react-native";

import {
    PDF_VIEWER,
    TAB_NAVIGATOR, // DASHBOARD,
    COMMON_MODULE,
    VIEW_TICKET,
    BANKINGV2_MODULE,
    ACCOUNT_DETAILS_SCREEN,
    DASHBOARD,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { checkS2WEarnedChances } from "@services";
import { FAExternalPartner } from "@services/analytics/analyticsExternalPartner";

import { WHITE, YELLOW, FADE_GREY, MEDIUM_GREY } from "@constants/colors";
import {
    BUS_TICKETS,
    DONE,
    FAIL_STATUS,
    FLIGHT_TICKETS,
    MOVIE_TICKETS,
    PAYMENT_FAIL,
    RECEIPT_NOTE,
    SUCC_STATUS,
} from "@constants/strings";

import { updateWalletBalance } from "@utils/dataModel/utilityWallet";

import Assets from "@assets";

// const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

class TicketStatus extends Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            status: props.route.params?.parms?.status ?? FAIL_STATUS, // success | failure
            headerText: props.route.params?.parms?.headerText ?? PAYMENT_FAIL,
            detailsArray: props.route.params?.parms?.details ?? false, // Each object must contain key & value
            serverError: props.route.params?.parms?.serverError ?? false,
            receiptDetailsArray: props.route.params?.parms?.receiptDetailsArray ?? [],
            showShareReceipt: props.route.params?.parms?.showShareReceipt ?? false,
            OrderID: props.route.params?.parms?.orderID ?? "",
            ticketType: props.route.params?.parms?.ticketType ?? "",
            isDisabled: false,
        };
    }

    getTicketType = () => {
        console.log("[TicketStatus] >> [getTicketType]");
        const { ticketName } = this.props.route?.params?.parms ?? this.props.route?.params;
        switch (this.state.ticketType) {
            case "AIRPAZ":
                return FLIGHT_TICKETS;
            case "CTB":
                return BUS_TICKETS;
            case "WETIX":
                return MOVIE_TICKETS;
            default:
                return ticketName ?? "Ticket payment";
        }
    };

    ticketGASharePDF = (reloadShare) => {
        FAExternalPartner.onSharePDF(this.state.ticketType, reloadShare);
    };

    ticketPdfView = () => {
        FAExternalPartner.onViewPDF(this.state.ticketType);
    };

    onShareReceiptTap = async () => {
        console.log("[TicketStatus] >> [onShareReceiptTap]");
        this.setState({
            isDisabled: true,
        });
        FAExternalPartner.onShareReceipt(this.state.ticketType);

        const ticketType = this.getTicketType();

        try {
            // Call custom method to generate PDF
            const file = await CustomPdfGenerator.generateReceipt(
                true,
                ticketType,
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
                GAPdfView: this.ticketPdfView,
                sharePdfGaHandler: this.ticketGASharePDF,
            };

            // Navigate to PDF viewer to display PDF
            this.props.navigation.navigate(COMMON_MODULE, {
                screen: PDF_VIEWER,
                params: navParams,
            });
        } catch (err) {
            console.log(err);
        } finally {
            this.setState({
                isDisabled: false,
            });
        }
    };

    onDoneTap = () => {
        console.log("[TicketStatus] >> [onDoneTap]");
        const route = this.props.route.params?.parms?.routeFrom;

        if (this.state.status === "failure") {
            if (route === "AccountDetails") {
                this.props.navigation.navigate(BANKINGV2_MODULE, {
                    screen: ACCOUNT_DETAILS_SCREEN,
                });
                return;
            } else if (route === "Dashboard") {
                this.props.navigation.navigate(TAB_NAVIGATOR, {
                    screen: DASHBOARD,
                    params: { refresh: true },
                });
                return;
            }
            this.props.navigation.navigate(TAB_NAVIGATOR, {
                screen: "Tab",
                params: {
                    screen: route,
                    params: { refresh: true },
                },
            });
            return;
        }
        const params = {
            orderID: this.state.OrderID,
            ticketType: this.state.ticketType,
            routeFrom: this.props.route.params?.parms?.routeFrom,
        };
        this.props.navigation.navigate(VIEW_TICKET, { params });
    };

    checkForEarnedChances = () => {
        // check if campaign is running and check if it matched the list
        // delayed the check a lil bit to let user see the acknowledge screen
        try {
            this.timer && clearTimeout(this.timer);

            this.timer = setTimeout(async () => {
                const { isTapTasticReady, tapTasticType } = this.props?.route?.params;

                const response = await checkS2WEarnedChances({
                    txnType: "MAEMYGROSER",
                });

                if (response?.data) {
                    const { displayPopup, chance, generic } = response.data;
                    console.tron.log("displayPopup", displayPopup, "chance", chance);

                    if (displayPopup || generic) {
                        // go to earned chances screen
                        this.props.navigation.push("TabNavigator", {
                            screen: "CampaignChancesEarned",
                            params: {
                                chances: chance,
                                isCapped: generic,
                                isTapTasticReady,
                                tapTasticType,
                            },
                        });
                    }
                }
            }, 400);
        } catch (e) {}
    };

    componentDidMount() {
        console.info("[TicketStatus] >> [componentDidMount] ", this.props.route?.params);
        // this is only for campaign while using tracker and earned entries / chances for user
        // comment it out first, Year End Campaign using push notifications way to show CampaignChancesEarned.js
        // if (this.props.route.params?.parms?.ticketType === "MYGROSER") {
        //     this.checkForEarnedChances();
        // }

        // [[UPDATE_BALANCE]] Update the wallet balance if success
        const { isUpdateBalanceEnabled } = this.props.getModel("wallet");

        if (isUpdateBalanceEnabled) {
            const isSuccess = this.props.route?.params?.parms?.status === SUCC_STATUS;
            const isS2uFlow = this.props.route?.params?.isS2uFlow;
            if (isSuccess && !isS2uFlow) {
                updateWalletBalance(this.props.updateModel);
            }
        }
    }

    render() {
        const { status, showShareReceipt, serverError, detailsArray } = this.state;

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
                        <ScrollView style={{ flex: 1 }}>
                            {/* Image Block */}
                            <View style={Style.statusPgImgBlockCls}>
                                <Image
                                    resizeMode="contain"
                                    style={{ width: 57, height: 52 }}
                                    source={
                                        this.state.status === "failure"
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
                                text={this.state.headerText}
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
                                text={serverError}
                            />

                            {/* Status Details */}
                            {detailsArray && (
                                <View style={{ marginTop: 30 }}>
                                    {detailsArray.map((prop) => {
                                        return (
                                            <View style={Style.detailsBlockCls}>
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
                            {status === "success" && showShareReceipt && (
                                <ActionButton
                                    height={48}
                                    fullWidth
                                    borderRadius={24}
                                    backgroundColor={WHITE}
                                    disabled={this.state.isDisabled}
                                    isLoading={this.state.isDisabled}
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
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        text={DONE}
                                    />
                                }
                                onPress={this.onDoneTap}
                            />
                        </View>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const Style = StyleSheet.create({
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
        marginBottom: 15,
        marginTop: 10,
        width: "100%",
    },

    moreIconCls: {
        height: 44,
        width: 44,
    },

    statusPgImgBlockCls: {
        marginBottom: 25,
        marginTop: (screenHeight * 10) / 100,
        width: "100%",
    },
});

export default withModelContext(TicketStatus);
