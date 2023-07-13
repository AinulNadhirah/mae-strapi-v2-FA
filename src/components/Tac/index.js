import React, { Component } from "react";
import { View, Modal } from "react-native";
import PropTypes from "prop-types";
import * as Strings from "@constants/strings";
import Toast, { infoToastProp, errorToastProp } from "@components/Toast";
import FlashMessage from "react-native-flash-message";
import { createOtp } from "@services";
import OtpEnter from "@components/OtpEnter";
import { OFF_WHITE } from "@constants/colors";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { withModelContext } from "@context";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";

const Header = ({ onClosePress }) => {
    return (
        <HeaderLayout
            horizontalPaddingMode="custom"
            horizontalPaddingCustomLeftValue={24}
            horizontalPaddingCustomRightValue={24}
            headerRightElement={<HeaderCloseButton onPress={onClosePress} />}
        />
    );
};

class Tac extends Component {
    constructor(props) {
        super(props);

        console.log("Tac", this.props);
        this.state = {
            // RSA State Objects
            isRSARequired: false,
            challengeQuestion: "",
            challengeRequest: {},
            isRSALoader: true,
            RSACount: 0,
            RSAError: false,
        };

        this.toastRef = {};
    }

    componentDidMount() {
        this.getTac();
    }

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    onClosePress = () => {
        this.props.onTacClose();
    };

    onTacDonePress = (code) => {
        console.log("onTacDonePress", code);
        this.callTransferApi(code);
        // call mock
        // this.callTransferApiSuccess(paybillErrorsMock);
    };

    onResentTacPress = () => {
        console.log("onResentTacPress");
        this.getTac();
    };

    // -----------------------
    // API CALL
    // -----------------------

    getTac = () => {
        console.log("getTac", this.props);
        const params = this.props.tacParams;

        createOtp("/tac", params)
            .then((result) => {
                const responsedata = result.data;
                console.log("responsedata:", responsedata);
                if (responsedata.statusDesc.toLowerCase() == "success") {
                    const message = `${responsedata.token}`;

                    this.toastRef.showMessage(
                        infoToastProp({
                            message: `Your TAC no. is ${message}`,
                            position: "top",
                            duration: 6000,
                        })
                    );
                } else {
                    const message = `${responsedata.statusDesc}`;

                    this.toastRef.showMessage(
                        infoToastProp({
                            message: message,
                            position: "top",
                            duration: 6000,
                        })
                    );
                }
            })
            .catch((err) => {
                console.log("err:", err);
                const message = `${err.message}`;

                this.toastRef.showMessage(
                    errorToastProp({
                        message: message,
                    })
                );
            });
    };

    callTransferApi = (token) => {
        const { transferApi } = this.props;
        const params = { ...this.props.transferAPIParams, tac: token };
        console.log("callTransferApi :", params);
        transferApi(params)
            .then((result) => {
                const response = result.data;
                this.callTransferApiSuccess(response);
            })
            .catch((err) => {
                console.log("ERR", err);
                this.toastRef.showMessage(
                    errorToastProp({
                        message: "error",
                    })
                );
            });
    };

    callTransferApiSuccess = (response) => {
        console.log("callTransferApiSuccess:", response);
        this.setState(
            {
                isRSARequired: false,
                isRSALoader: false,
            },
            () => {
                this.props.onTacSuccess(response);
            }
        );
    };

    // -----------------------
    // CHALLANGE QUESTION
    // -----------------------

    onChallengeSnackClosePress = () => {
        this.setState({ RSAError: false });
    };

    onChallengeQuestionSubmitPress = (answer) => {
        const {
            challengeRequest: { challenge },
        } = this.state;

        console.log("button disable is", this.state.isSubmitDisable);

        this.setState(
            {
                challengeRequest: {
                    ...this.state.challengeRequest,
                    challenge: {
                        ...challenge,
                        answer,
                    },
                },
                isRSALoader: true,
                RSAError: false,
                isSubmitDisable: true,
            },
            () => {
                const { transferApi } = this.props.transferApi;
                transferApi(this.state.challengeRequest);
            }
        );
    };

    // -----------------------
    // OTHER PROCESS
    // -----------------------

    refForToast = (ref) => {
        this.toastRef = ref;
    };

    renderToastComponent = (props) => <Toast {...props} />;

    render() {
        console.log("render", this.state);
        return (
            <Modal visible animated animationType="slide" hardwareAccelerated transparent>
                <ScreenContainer backgroundType="color" backgroundColor={OFF_WHITE}>
                    <React.Fragment>
                        <ScreenLayout
                            scrollable={false}
                            paddingLeft={0}
                            paddingRight={0}
                            paddingBottom={0}
                            header={<Header onClosePress={this.onClosePress} />}
                        >
                            <View style={Styles.mainContainer}>
                                {/* OTP */}
                                <OtpEnter
                                    onDonePress={this.onTacDonePress}
                                    title={Strings.TAC} // Strings.ONE_TIME_PASSWORD + " / " +
                                    securepin={false}
                                    description={Strings.ENTER_TAC} // Strings.ENTER_OTP_SENT + " / " +
                                    footer={Strings.RESEND_TAC} // Strings.RESEND_OTP + " / " +
                                    withTouch={false}
                                    disabled={false}
                                    onFooterPress={this.onResentTacPress}
                                />

                                {/* ChallengeQuestion */}
                                <ChallengeQuestion
                                    loader={this.state.isRSALoader}
                                    display={this.state.isRSARequired}
                                    displyError={this.state.RSAError}
                                    questionText={this.state.challengeQuestion}
                                    onSubmitPress={this.onChallengeQuestionSubmitPress}
                                    onSnackClosePress={this.onChallengeSnackClosePress}
                                />
                            </View>
                        </ScreenLayout>
                    </React.Fragment>
                </ScreenContainer>
                <FlashMessage MessageComponent={this.renderToastComponent} ref={this.refForToast} />
            </Modal>
        );
    }
}

Tac.propTypes = {
    tacParams: PropTypes.object.isRequired,
    transferAPIParams: PropTypes.object.isRequired,
    onTacSuccess: PropTypes.func,
    onTacClose: PropTypes.func,
};

Tac.defaultProps = {
    tacParams: {},
    transferAPIParams: {},
    onTacSuccess: () => {
        console.log(onTacSuccess);
    },
    onTacClose: () => {
        console.log(onTacClose);
    },
};

export default withModelContext(Tac);

const Styles = {
    mainContainer: {
        flex: 1,
    },
};

// MOCK
const paybillsuccessMock = {
    statusCode: "0",
    statusDescription: null,
    serverDate: "8 Apr 2020, 11:03 PM",
    transactionRefNumber: "MB11111117179767218M",
    amount: "1.87",
    toCardNo: "72203656",
    message: "Success",
    token: null,
    rsaStatus: null,
    challenge: null,
    maskCardNo: "****3656",
};
const paybillErrorsMock = {
    statusCode: "200",
    statusDescription: "Please wait a few minutes and try again.", // additionalStatus
    serverDate: "8 Apr 2020, 12:35 AM",
    transactionRefNumber: "MB11111117179754015M",
    amount: "14.95",
    toCardNo: "1234567890",
    message: "Failure",
    token: null,
    rsaStatus: null,
    challenge: null,
    maskCardNo: "******7890",
};
