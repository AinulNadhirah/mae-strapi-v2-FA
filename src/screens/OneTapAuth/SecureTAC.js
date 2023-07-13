import AsyncStorage from "@react-native-community/async-storage";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import BackgroundTimer from "react-native-background-timer";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    DASHBOARD,
    ONE_TAP_AUTH_MODULE,
    PUSH_STATUS,
    SECURE2U_PUSH_STACK,
    TAB_NAVIGATOR,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import Typography from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { secure2uPendingChallengeApi, invokeL3 } from "@services";

import { WHITE, MEDIUM_GREY, ROYAL_BLUE, SHADOW } from "@constants/colors";
import {
    SUCC_STATUS,
    FAIL_STATUS,
    TRANSACTION_SUCCESS,
    TRANSACTION_UNSUCCESS,
    S2U_AUTHORISATION_HAS_EXPIRED,
} from "@constants/strings";

import KeyUtilities from "@libs/KeyUtilities";
import { jsSHA } from "@libs/jssha-1.31.min.js";

import { getShadow } from "@utils/dataModel/utility";

class SecureTAC extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showS2u: false,
            softTac: "",
            showTac: false,
            tacTimer: "",
            //emptyState: false,
            showLoaderModal: false,
        };
        this.props.updateModel({
            ui: {
                onCancelLogin: this.onCancelLogin,
            },
        });
    }

    async componentDidMount() {
        this.checkS2uReg();
    }

    componentWillUnmount() {
        this._stopTacTimer();
    }

    checkS2uReg = () => {
        const getModel = this.props.getModel;
        const ota = getModel("ota");
        const { isPostPassword } = getModel("auth");
        const isUserEnabledSecure2U = ota?.isEnabled ?? false;
        const isUnderCoolDown = ota?.isUnderCoolDown ?? false;
        if (!isUnderCoolDown) {
            if (!isUserEnabledSecure2U) {
                if (!isPostPassword) {
                    this.setState({ showTac: false });
                    this.handlePassword();
                    return;
                }
                this.openActivate();
            } else {
                this.setState({ showTac: true });
                this._startTacTimer();
                this.checkPendingS2u();
            }
            this.setState({ showLoaderModal: false });
            return;
        }
        this.navigateToCoolingPage();
    };

    navigateToCoolingPage = () => {
        const {
            navigation: { navigate, replace },
        } = this.props;
        if (this.props.route.params?.fromDeepLink) {
            navigateToS2UCooling(navigate, false, false);
        } else {
            replace(TAB_NAVIGATOR, DASHBOARD);
            navigateToS2UCooling(navigate, true, false);
        }
    };

    onCancelLogin = () => this.props.navigation.goBack();

    handlePassword = async () => {
        try {
            const response = await invokeL3(true);
            if (response) {
                this.openActivate();
            }
        } catch (error) {
            console.log(error);
        }
    };

    openActivate = () => {
        this.props.navigation.pop();
        if (this.props?.route?.params?.screen === "QuickAction") {
            this.props.navigation.navigate(TAB_NAVIGATOR, {
                screen: "Tab",
                params: {
                    screen: "Dashboard",
                },
            });
        }

        this.props.navigation.navigate(ONE_TAP_AUTH_MODULE, {
            screen: "Activate",
            params: {
                flowParams: {
                    success: {
                        stack: "Dashboard",
                        screen: "SecureTAC",
                    },
                    fail: {
                        stack: TAB_NAVIGATOR,
                        screen: "Tab",
                    },
                    params: { ...this.props.route.params, showS2UCoolingToast: false },
                },
            },
        });
        this.setState({ showTac: true });
    };

    _startTacTimer = async () => {
        BackgroundTimer.runBackgroundTimer(() => {
            this.generateTac();
        }, 500);
    };

    async generateTac() {
        const KeyUtilitiesObj = KeyUtilities(jsSHA);
        //otaHotp
        const otaTotp = await AsyncStorage.getItem("otaTotp");
        let secureToken = KeyUtilitiesObj.generate(otaTotp);
        let timer = secureToken.countDown;
        if (timer < 10) {
            timer = "0" + timer;
        }
        timer = "00:" + timer;
        secureToken = secureToken.otp;
        this.setState({ softTac: secureToken, tacTimer: timer });
    }

    _stopTacTimer = async () => {
        console.log(" _stopBackgroundTimer --> ");
        BackgroundTimer.stopBackgroundTimer();
    };
    /***
     * checkPendingS2u()
     * Check S2u request to approve the Transaction or Show Empty page
     */
    checkPendingS2u = async () => {
        const getModel = this.props.getModel;
        const { isS2uV4Flag } = getModel("misc");
        const subUrl = isS2uV4Flag ? "/challenge/pending" : "/secure2u/getPendingMdipChallenges";
        try {
            secure2uPendingChallengeApi(subUrl, isS2uV4Flag)
                .then((response) => {
                    const responseObject = response.data;
                    console.log("/challenge/pending ==> ", responseObject);

                    if (
                        isS2uV4Flag &&
                        responseObject?.payload &&
                        responseObject?.statusDesc?.toLowerCase() === "successful"
                    ) {
                        const encryptedChallenge = responseObject.payload.cipher_text;
                        const nonce = responseObject.payload.nonce;
                        if (encryptedChallenge && nonce) {
                            this.setState({
                                showS2u: true,
                                pushData: {
                                    encryptedChallenge,
                                    nonce,
                                    device_id: responseObject?.payload?.device_id,
                                },
                            });
                        }
                    } else if (
                        responseObject.text &&
                        responseObject.text.toLowerCase() === "success"
                    ) {
                        const localEncryptedChallenge =
                            responseObject.payload[0].encryptedChallenge;
                        const localNonceChallenge = responseObject.payload[0].nonce;
                        if (localEncryptedChallenge && localNonceChallenge) {
                            this.setState({
                                showS2u: true,
                                pushData: {
                                    encryptedChallenge: localEncryptedChallenge,
                                    nonce: localNonceChallenge,
                                },
                            });
                        }
                    } else {
                        this.setState({ showS2u: false });
                    }
                })
                .catch((error) => {
                    this.setState({ showS2u: false });
                    console.log("ERROR ===> ", error);
                });
        } catch (e) {
            this.setState({ showS2u: false });
            console.log("ERROR ===> ", e);
        }
        //this.setState({ showS2u: true,pushData:{"encryptedChallenge" : "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", "nonce" : "JmRx1Ncu+OHXXivTjEkeexptvLpF9IVq"} });
    };

    onS2uClose = () => {
        console.log("[SecureTAC] >> [onS2uClose]");
        this.setState({ showS2u: false });
    };
    /***
     * onS2uDone()
     * Handle S2U Approval or Rejection Flow
     */
    onS2uDone = (response) => {
        console.log("[SecureTAC] >> [onS2uDone] response ", response);
        const { transactionStatus, s2uSignRespone, pushData } = response;

        this.onS2uClose();
        this.setState({ isLoading: false, showLoaderModal: false });
        if (response?.isV4) {
            this.handleV4Push(response);
            return;
        }
        const { text, status } = s2uSignRespone;
        const FPXobj = this.getFPXStatus(pushData);
        const pushDataArr = FPXobj?.pushData ?? pushData;
        if (transactionStatus) {
            // Show success page
            //const header = status ? "Transaction " + status : TRANSACTION_SUCCESS;
            const header = FPXobj?.status
                ? "Your Secure2u approval is completed"
                : TRANSACTION_SUCCESS;
            const serverError = FPXobj?.status ? this.processString(FPXobj.value) : null;

            this.props.navigation.navigate(SECURE2U_PUSH_STACK, {
                screen: PUSH_STATUS,
                params: {
                    headerText: header,
                    status: SUCC_STATUS,
                    details: pushDataArr,
                    serverError,
                    errorMessge: null,
                },
            });
        } else {
            const serverError = text || "";
            // Show Failure page when timeout
            if (status === "M408") {
                this.props.navigation.navigate(SECURE2U_PUSH_STACK, {
                    screen: PUSH_STATUS,
                    params: {
                        headerText: TRANSACTION_UNSUCCESS,
                        status: FAIL_STATUS,
                        details: pushDataArr,
                        serverError: null,
                    },
                });

                showErrorToast({
                    message: S2U_AUTHORISATION_HAS_EXPIRED,
                });
            } else {
                // Show Failure page
                this.props.navigation.navigate(SECURE2U_PUSH_STACK, {
                    screen: PUSH_STATUS,
                    params: {
                        headerText: TRANSACTION_UNSUCCESS,
                        status: FAIL_STATUS,
                        details: pushDataArr,
                        serverError: serverError || "",
                    },
                });
            }
        }
    };

    handleV4Push = (response) => {
        const { transactionStatus, v4Details } = response;
        const { title, description, details } = v4Details;
        this.props.navigation.navigate(SECURE2U_PUSH_STACK, {
            screen: PUSH_STATUS,
            params: {
                headerText: title || "",
                status: transactionStatus ? SUCC_STATUS : FAIL_STATUS,
                details: details || false,
                serverError: description || "",
            },
        });
    };

    getFPXStatus = (pushData) => {
        let isFPX = false;
        let msg = "";
        const s2uAckDetails = [];
        const requiredPushData = pushData ?? [];
        console.log(requiredPushData);
        requiredPushData.forEach((k) => {
            if (k.label.indexOf("__") > -1) {
                //start with __ need to omit expect __OBJ__
                isFPX = true;
                msg = k.label.indexOf("__obj__") > -1 ? k?.value?.successMsg : "";
            } else {
                s2uAckDetails.push({
                    label: k.label,
                    value: k.value,
                });
            }
        });
        return { status: isFPX, value: msg, pushData: s2uAckDetails };
    };

    processString = (str) => {
        const msg =
            str && str.split("<br/>").length >= 1
                ? str.split("<br/>")[1].replace(/(<([^>]+)>)/gi, "")
                : "";
        return msg;
    };

    onBackTap = () => {
        console.log("[SecureTAC] >> [onBackTap]");
        this.props.navigation.goBack();
    };

    onBtnPress = () => {
        const navParams = {
            source: "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/services/digital_banking/secure2u.page",
            title: "Secure2u",
        };

        this.props.navigation.navigate("SettingsModule", {
            screen: "PdfSetting",
            params: navParams,
        });
    };

    _renderS2UTacState() {
        return (
            <View style={styles.tacStateContainer}>
                <View style={styles.tacStateTxtContainer}>
                    <View style={styles.tacBlockCls}>
                        <View style={styles.tacInnerBlockCls}>
                            {/* Your Invite.....Label */}
                            <Typography
                                text="Your Secure TAC Number"
                                fontSize={13}
                                fontWeight="600"
                                lineHeight={23}
                            />
                            <View style={styles.tacValueBlockCls}>
                                <Typography
                                    text={this.state.softTac}
                                    fontSize={23}
                                    fontWeight="300"
                                    lineHeight={33}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={styles.tacValueBlockCls}>
                        <Typography
                            text={`AUTO-GENERATE IN ${this.state.tacTimer}`}
                            fontSize={14}
                            fontWeight="300"
                            lineHeight={31}
                        />
                    </View>
                </View>
                <TouchableOpacity onPress={this.onBtnPress}>
                    <Typography
                        color={ROYAL_BLUE}
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={18}
                        text="What is Secure2u?"
                        textAlign="center"
                        style={styles.secure2uText}
                    />
                </TouchableOpacity>
            </View>
        );
    }
    render() {
        const { showErrorModal, showLoaderModal } = this.state;

        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showErrorModal={showErrorModal}
                showLoaderModal={showLoaderModal}
            >
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    useSafeArea
                    neverForceInset={["bottom"]}
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                            /*headerCenterElement={
                                <Typography
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text="Secure2u"
                                />
                            }*/
                        />
                    }
                >
                    {this.state.showTac && this._renderS2UTacState()}
                    <React.Fragment />
                </ScreenLayout>
                {this.state.showS2u && (
                    <Secure2uAuthenticationModal
                        token={this.state.pollingToken}
                        amount={this.state.seletedAmount}
                        pushData={this.state.pushData}
                        onS2UDone={this.onS2uDone}
                        onS2UClose={this.onS2uClose}
                        s2uFlow="PUSH"
                    />
                )}
            </ScreenContainer>
        );
    }
}

SecureTAC.propTypes = {
    getModel: PropTypes.func,
    navigation: PropTypes.shape({
        goBack: PropTypes.func,
        navigate: PropTypes.func,
        replace: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.any,
    }),
    updateModel: PropTypes.func,
};

export default withModelContext(SecureTAC);

const styles = StyleSheet.create({
    secure2uText: {
        paddingVertical: 10,
    },
    tacBlockCls: {
        backgroundColor: WHITE,
        borderRadius: 16,
        height: 90,
        marginTop: 36,
        width: "90%",
        ...getShadow({
            color: SHADOW,
            width: 0,
            shadowOpacity: 1,
            shadowRadius: 8,
            elevation: 4,
        }),
    },
    tacInnerBlockCls: {
        alignItems: "center",
        height: "100%",
        justifyContent: "center",
        width: "100%",
    },
    tacStateContainer: {
        flex: 1,
    },
    tacStateTxtContainer: {
        alignItems: "center",
        flex: 0.9,
        justifyContent: "center",
        marginHorizontal: 48,
        marginTop: 24,
    },
    tacValueBlockCls: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 10,
    },
});
