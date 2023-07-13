import React, { Component } from "react";
import {
    View,
    Text,
    ScrollView,
    ImageBackground,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from "react-native";
import * as navigationConstant from "@navigation/navigationConstant";
import LinearGradient from "react-native-linear-gradient";
import CardFlip from "react-native-card-flip";
import * as Utility from "@utils/dataModel/utility";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import Assets from "@assets";
import Typo from "@components/Text";
import ActionButton from "@components/Buttons/ActionButton";
import NavigationService from "@navigation/navigationService";
import { GAOnboarding } from "@services/analytics/analyticsSTPMae";
import { YELLOW, ROYAL_BLUE, BLACK, MEDIUM_GREY } from "@constants/colors";
import { FA_APPLY_MAE_ONBOARDING_COMPLETED } from "@constants/strings";
import { withModelContext } from "@context";
import { resumeApplication } from "@services";
import { showErrorToast } from "@components/Toast";
import PropTypes from "prop-types";
import { onMAETopUpButtonTap } from "@screens/MAE/Topup/TopupController";

class VirtualCardScreen extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
    };

    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            filledUserDetails: props.route.params?.filledUserDetails,
            debitCardNo: "", //props.route.params?.filledUserDetails?.MAEAccountCreateResult.debitCardNo,
            acctNo: "", //props.route.params?.filledUserDetails?.MAEAccountCreateResult.acctNo,
            expiryDate: "", //props.route.params?.filledUserDetails?.MAEAccountCreateResult.expiryDate,
            inviteCode: "", //props.route.params?.filledUserDetails?.MAEAccountCreateResult.inviteCode,
            accessNo: "", //props.route.params?.filledUserDetails?.MAEAccountCreateResult.accessNo,
            refNo: "", //props.route.params?.filledUserDetails?.MAEAccountCreateResult.refNo,
            username: props.route.params?.filledUserDetails?.usernameDetails?.username,
            password: props.route.params?.filledUserDetails?.usernameDetails?.password,
        };
    }

    componentDidMount() {
        console.log("[VirtualCardScreen] >> [componentDidMount]");
        this.checkMAEAccountDetails();
    }

    checkMAEAccountDetails = () => {
        //Need to test
        console.log("[UploadSecurityImage] >> [checkMAEAccountDetails]");
        const { filledUserDetails } = this.state;
        if (!filledUserDetails.MAEAccountCreateResult) {
            const data = {
                customerId: filledUserDetails.onBoardDetails2.idNo,
                mobileNo: filledUserDetails.onBoardDetails.mobileNumber,
            };
            resumeApplication(data)
                .then((response) => {
                    console.log("[UploadSecurityImage][checkMAEAccountDetails] >> Success");
                    const result = response.data.result;
                    if (result.statusCode == "0000") {
                        filledUserDetails.MAEAccountCreateResult = result;
                        this.setState({ debitCardNo: result.debitCardNo, acctNo: result.acctNo });
                        GAOnboarding.onOnboardingComplete(result);
                        return;
                    }
                    showErrorToast({
                        message: result.statusDesc,
                    });
                })
                .catch((error) => {
                    console.log("[UploadSecurityImage][checkMAEAccountDetails] >> Failure");
                    showErrorToast({
                        message: error.message,
                    });
                });
        } else {
            this.setState({
                debitCardNo: filledUserDetails.MAEAccountCreateResult.debitCardNo,
                acctNo: filledUserDetails.MAEAccountCreateResult.acctNo,
            });
        }
    };

    onDone = (from) => {
        console.log("[VirtualCardScreen] >> [onDone]");
        const { username, password, filledUserDetails } = this.state;
        // const filledUserDetails = this.prepareUserDetails(from);
        if (filledUserDetails.from != "updateDetails") {
            this.props.navigation.navigate("Onboarding", {
                screen: "OnboardingM2uCreatePin",
                params: {
                    username,
                    password,
                    isMaeOnboarding: true,
                    goToTopup: from,
                    authData: filledUserDetails?.authData,
                    maeAccount: filledUserDetails?.MAEAccountCreateResult,
                },
            });
        } else {
            if (from) {
                const navParams = {
                    data: filledUserDetails?.MAEAccountCreateResult ?? null,
                    routeFrom: "Dashboard",
                };
                onMAETopUpButtonTap(navParams);
                GAOnboarding.onTopUp();
            } else {
                const entryParams = {
                    screen: "Dashboard",
                    params: { refresh: true },
                };
                this.props.navigation.navigate(filledUserDetails?.entryStack || "TabNavigator", {
                    screen: filledUserDetails?.entryScreen || "Tab",
                    params: filledUserDetails?.entryParams || entryParams,
                });
            }
        }
    };

    prepareUserDetails = (from) => {
        console.log("[VirtualCardScreen] >> [prepareUserDetails]");
        let MAEUserDetails = this.state.filledUserDetails || {};
        MAEUserDetails.virtualCard = { from: from };

        return MAEUserDetails;
    };

    render() {
        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={FA_APPLY_MAE_ONBOARDING_COMPLETED}
            >
                <ScreenLayout paddingBottom={0} paddingTop={0} paddingHorizontal={0} useSafeArea>
                    <ScrollView>
                        <View style={styles.fieldContainer}>
                            {/* Header Label */}
                            <Typo
                                fontSize={20}
                                lineHeight={30}
                                fontWeight="300"
                                letterSpacing={0}
                                textAlign="center"
                                style={styles.title}
                                text={"You're all set! \nTop up your account now."}
                            />

                            {/* Tappable Card */}
                            <CardFlip
                                style={styles.virtualCardImage}
                                ref={(card) => (this.card = card)}
                            >
                                <TouchableOpacity
                                    activeOpacity={1}
                                    style={styles.virtualCard}
                                    onPress={() => this.card.flip()}
                                >
                                    <ImageBackground
                                        resizeMode={"cover"}
                                        style={styles.cardImage}
                                        imageStyle={styles.virtualCard}
                                        source={Assets.debitCardFrontImage}
                                    >
                                        {/* <Text style={styles.virtualCardNumberTextCls}>
											{Utility.accountNumSeparator(this.state.debitCardNo)}
										</Text> */}
                                    </ImageBackground>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={1}
                                    style={styles.virtualCard}
                                    onPress={() => this.card.flip()}
                                >
                                    <ImageBackground
                                        resizeMode={"cover"}
                                        style={styles.cardImage}
                                        imageStyle={styles.virtualCard}
                                        source={Assets.debitCardBackImage}
                                    >
                                        <Typo
                                            fontSize={12}
                                            lineHeight={23}
                                            fontWeight="600"
                                            color={BLACK}
                                            textAlign="left"
                                            style={styles.virtualCardNumberTextCls}
                                            text={Utility.debitCardNumSeperator(
                                                this.state.debitCardNo
                                            )}
                                        />
                                    </ImageBackground>
                                </TouchableOpacity>
                            </CardFlip>

                            {/* Tap on Card Label */}
                            <Typo
                                fontSize={12}
                                lineHeight={16}
                                fontWeight="300"
                                letterSpacing={0}
                                textAlign="center"
                                style={styles.subText}
                                text={"Tap to flip the card"}
                            />

                            {/* Your Bank Acc.... Label */}
                            <Typo
                                fontSize={12}
                                lineHeight={23}
                                fontWeight="600"
                                letterSpacing={0}
                                textAlign="center"
                                style={styles.accountTitle}
                                text={"Your Account Number"}
                            />

                            {/* Account Number */}
                            <Typo
                                fontSize={20}
                                lineHeight={33}
                                fontWeight="300"
                                letterSpacing={0}
                                textAlign="center"
                                text={Utility.accountNumSeparator(this.state.acctNo)}
                            />
                        </View>
                    </ScrollView>
                    <View style={styles.bottomBtnContCls}>
                        <LinearGradient
                            colors={["#efeff300", MEDIUM_GREY]}
                            style={styles.linearGradient}
                        />
                        <ActionButton
                            backgroundColor={YELLOW}
                            borderRadius={20}
                            height={48}
                            fullWidth
                            componentCenter={
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text="Top Up Now"
                                />
                            }
                            onPress={() => this.onDone(true)}
                        />
                        <TouchableOpacity
                            onPress={() => this.onDone(false)}
                            activeOpacity={0.8}
                            style={{ marginTop: 24 }}
                        >
                            <Typo
                                color={ROYAL_BLUE}
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={"Do It Later"}
                                textAlign="center"
                            />
                        </TouchableOpacity>
                    </View>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    title: {
        marginTop: 50,
    },
    subText: {
        marginTop: 16,
    },
    fieldContainer: {
        marginBottom: 20,
    },
    accountTitle: {
        marginTop: 20,
    },
    virtualCardImage: {
        height: 300,
        marginTop: 20,
        width: "100%",
    },
    virtualCard: {
        alignItems: "center",
        height: "100%",
        width: "100%",
    },
    cardImage: {
        alignItems: "center",
        // marginTop: 30,
        width: 188,
        height: 300,
    },
    virtualCardNumberTextCls: {
        top: 93,
        left: -50,
        width: 170,
        transform: [{ rotate: "90deg" }],
    },
    bottomBtnContCls: {
        paddingHorizontal: 24,
        paddingVertical: 25,
        height: 130,
    },
    linearGradient: {
        height: 30,
        left: 0,
        right: 0,
        top: -30,
        position: "absolute",
    },
});

export default withModelContext(VirtualCardScreen);
