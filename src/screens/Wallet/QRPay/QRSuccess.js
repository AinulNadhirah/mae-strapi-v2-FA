import React, { Component, Fragment } from "react";
import {
    Text,
    View,
    ScrollView,
    Image,
    FlatList,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ImageBackground,
    Platform,
    StyleSheet,
    Dimensions,
} from "react-native";
import Permissions from "react-native-permissions";

import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import {
    AvatarCircle,
    ButtonRound,
    ImageButtonCustom,
    SetupNow,
    MyView,
    Input,
    HeaderPageIndicator,
    ErrorMessage,
} from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { bankingGetDataMayaM2u } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, ROYAL_BLUE, WHITE, BLACK, FADE_GREY } from "@constants/colors";
import * as Strings from "@constants/strings";
import { FA_SCREEN_NAME, FA_FORM_COMPLETE, FA_SCANPAY_COMPLETE } from "@constants/strings";

import * as ModelClass from "@utils/dataModel/modelClass";

import Styles from "@styles/Wallet/WalletScreen";
import commonStyle from "@styles/main";

import Assets from "@assets";

export const { width, height } = Dimensions.get("window");

class QRSuccess extends Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        super(props);
        this.state = {
            error: false,
            accountNo: "",
            dLimit: 0,
            settings: false,
            setup: false,
            primary: false,
            wallet: false,
            data: {},
            quickAction: false,
            limitUpdate: false,
            qrState: {},
            qrType: "",
            loader: true,
        };
    }

    componentDidMount() {
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            this.setState({ loader: true });
            setTimeout(() => {
                this.setState({ loader: false });
            }, 2000);
        });
        this.blurSubscription = this.props.navigation.addListener("blur", () => {
            this.setState({ loader: false });
        });
        this.initData();
        this.checkForEarnedChances();
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
        this.timer && clearTimeout(this.timer);
    }

    /**
     * S2W chances earned checkers
     */
    checkForEarnedChances = () => {
        // check if campaign is running and check if it matched the list
        // delayed the check a lil bit to let user see the acknowledge screen
        this.timer && clearTimeout(this.timer);
        if (!this.props.route.params?.s2w) {
            return;
        }
        const { txnType, displayPopup, chance } = this.props.route.params.s2w;
        this.timer = setTimeout(() => {
            const {
                misc: { isCampaignPeriod, tapTasticType, isTapTasticReady },
                s2w: { txnTypeList },
            } = this.props.getModel(["misc", "s2w"]);

            if (
                (isCampaignPeriod || isTapTasticReady) &&
                txnTypeList.includes(txnType) &&
                displayPopup
            ) {
                this.props.navigation.push("TabNavigator", {
                    screen: "CampaignChancesEarned",
                    params: {
                        chances: chance,
                        isTapTasticReady,
                        tapTasticType,
                    },
                });
            }
        }, 400);
    };

    initData = async () => {
        const { route } = this.props;
        const settings = route.params?.settings ?? false;
        const setup = route.params?.setup ?? false;
        const primary = route.params?.primary ?? false;
        const wallet = route.params?.wallet ?? false;
        const data = route.params?.data ?? {};
        const dLimit = route.params?.dLimit ?? 0;
        const quickAction = route.params?.quickAction ?? false;
        const limitUpdate = route.params?.limitUpdate ?? false;
        const qrState = route.params?.qrState ?? {};
        const qrType = route.params?.qrType ?? "";
        const path = `/summary/qr?type=`;
        const response = await bankingGetDataMayaM2u(path + "A", false);
        console.log("CASA > ", response);
        if (response && response.data && response.data.code === 0) {
            const { accountListings } = response.data.result;
            if (accountListings && accountListings.length) {
                for (let item in accountListings) {
                    if (accountListings[item].primary) {
                        this.setState({
                            accountNo: accountListings[item].number
                                .substring(0, 12)
                                .replace(/[^\dA-Z]/g, "")
                                .replace(/(.{4})/g, "$1 ")
                                .trim(),
                            dLimit: `RM ${dLimit}`,
                            settings,
                            setup,
                            primary,
                            wallet,
                            data,
                            quickAction,
                            limitUpdate,
                            qrState,
                            qrType,
                            loader: false,
                        });
                    }
                }
            }
        }
    };

    confirmPress = () => {
        if (this.state.limitUpdate) {
            if (this.state.qrType === "Push") {
                this.props.navigation.pop();
                this.props.navigation.navigate(navigationConstant.QR_STACK, {
                    screen: "QrConf",
                    params: {
                        limitUpdate: this.state.limitUpdate,
                        qrState: this.state.qrState,
                    },
                });
            } else {
                this.props.navigation.pop();
                this.props.navigation.navigate(navigationConstant.QR_STACK, {
                    screen: "QrMain",
                    params: {
                        limitUpdate: this.state.limitUpdate,
                        qrState: this.state.qrState,
                    },
                });
            }
        } else {
            this.props.navigation.navigate(navigationConstant.QR_STACK, {
                screen: "QrMain",
                params: {
                    primary: this.state.primary,
                    wallet: this.state.wallet,
                    settings: this.state.settings,
                    setup: this.state.setup,
                    data: this.state.data,
                    quickAction: this.state.quickAction,
                },
            });
        }
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_SCANPAY_COMPLETE,
        });
    };

    render() {
        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={this.state.loader}
                analyticScreenName={FA_SCANPAY_COMPLETE}
            >
                <>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={24}
                        // header={
                        //     <HeaderLayout
                        //         headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                        //     />
                        // }
                        useSafeArea
                    >
                        {this.state.limitUpdate ? (
                            <View
                                style={{
                                    flex: 1,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <View
                                    style={{
                                        flex: 0.8,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginTop: height / 10,
                                    }}
                                >
                                    <Image
                                        style={styles.image}
                                        source={Assets.qrSuccess}
                                        resizeMode="contain"
                                    />
                                </View>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "flex-start",
                                        width: width - 148,
                                    }}
                                >
                                    <Typo
                                        fontSize={20}
                                        fontWeight="400"
                                        lineHeight={28}
                                        text={"You have successfully changed your daily limit."}
                                    />
                                    <Typo
                                        fontSize={20}
                                        fontWeight="400"
                                        lineHeight={28}
                                        style={{ marginTop: 20 }}
                                        text={"You can now proceed with your payment."}
                                    />
                                </View>

                                <View
                                    style={{
                                        alignItems: "center",
                                        justifyContent: "center",
                                        alignSelf: "center",
                                        position: "absolute",
                                        bottom: 30,
                                        height: 50,
                                    }}
                                >
                                    <TouchableOpacity
                                        style={styles.buttonContainer}
                                        onPress={this.confirmPress}
                                    >
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text="Continue"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View style={{ flex: 1 }}>
                                <View
                                    style={{
                                        flex: 1.8,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginTop: height / 10,
                                    }}
                                >
                                    <Image
                                        style={styles.image}
                                        source={Assets.qrSuccess}
                                        resizeMode="contain"
                                    />
                                </View>
                                <View
                                    style={{
                                        flex: 0.8,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Typo
                                        fontSize={20}
                                        fontWeight="300"
                                        lineHeight={28}
                                        text={"You have successfully setup \n Scan & Pay."}
                                    />
                                </View>
                                <View
                                    style={{
                                        flex: 0.8,
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginTop: 10,
                                    }}
                                >
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="Preferred account"
                                    />
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        lineHeight={18}
                                        style={{ marginTop: 5 }}
                                        text={this.state.accountNo}
                                    />
                                </View>
                                <View
                                    style={{
                                        flex: 0.8,
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginTop: 10,
                                    }}
                                >
                                    <Typo
                                        fontSize={14}
                                        fontWeight={"600"}
                                        lineHeight={18}
                                        text="Daily limit"
                                    />
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        lineHeight={18}
                                        style={{ marginTop: 5 }}
                                        text={`${this.state.dLimit}`}
                                    />
                                </View>
                                <View
                                    style={{
                                        flex: 2,
                                        flexDirection: "row",
                                        alignItems: "flex-start",
                                        justifyContent: "center",
                                        marginBottom: 10,
                                    }}
                                >
                                    <Typo
                                        fontSize={12}
                                        fontWeight="400"
                                        lineHeight={18}
                                        textAlign={"left"}
                                        text="Note: For purchases above cumulative limit, payment validation is required using biometric authentication or password. For QR code generation, no authentication is required."
                                    />
                                </View>
                                <View
                                    style={{
                                        alignItems: "center",
                                        justifyContent: "center",
                                        alignSelf: "center",
                                        position: "absolute",
                                        bottom: 30,
                                        height: 50,
                                    }}
                                >
                                    <TouchableOpacity
                                        style={styles.buttonContainer}
                                        onPress={this.confirmPress}
                                    >
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text="Continue"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </ScreenLayout>
                </>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    container: { backgroundColor: "transparent", flex: 1, width: "100%" },
    block: { flexDirection: "column" },
    titleContainer: { alignItems: "flex-start", justifyContent: "flex-start", width: width - 48 },
    descriptionContainer: {
        width: width - 48,
        alignItems: "flex-start",
        justifyContent: "flex-start",
    },
    buttonContainer: {
        width: width - 48,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffdd00",
        borderRadius: 48,
    },
    image: { width: 60, height: 80 },
});

export default withModelContext(QRSuccess);
