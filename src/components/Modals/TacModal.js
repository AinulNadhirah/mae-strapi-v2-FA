import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Modal, StyleSheet, Image } from "react-native";
import Config from "react-native-config";
import FlashMessage from "react-native-flash-message";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import OtpEnter from "@components/OtpEnter";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Toast, { infoToastProp, errorToastProp } from "@components/Toast";

import { withModelContext } from "@context";

import { createOtp } from "@services/index";

import { TAC_ERR_CODE } from "@constants/api";
import { MEDIUM_GREY } from "@constants/colors";
import * as Strings from "@constants/strings";
import { TAC_RESEND_COUNTDOWN_SECONDS } from "@constants/url";

import { maskedMobileNumber } from "@utils";
import { convertMayaMobileFormat } from "@utils/dataModel/utilityPartial.4";

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

Header.propTypes = {
    onClosePress: PropTypes.any,
};

class TacModal extends Component {
    static propTypes = {
        countDownInt: PropTypes.number,
    };

    constructor(props) {
        super(props);

        console.log("TacModal", this.props);
        this.state = {
            // RSA State Objects
            isRSARequired: false,
            challengeQuestion: "",
            challengeRequest: {},
            isRSALoader: true,
            RSACount: 0,
            RSAError: false,
            isLoading: true,
            mobileNumber: "",
            countDownInt: this.props.countDownInt ?? TAC_RESEND_COUNTDOWN_SECONDS,
            // Festive related
            festiveFlag: this.props?.festiveFlag ?? false,
            festiveImage: this.props?.festiveImage ?? {},
        };

        this.toastRef = {};
    }

    componentDidMount() {
        const {
            misc: { isOverseasMobileNoEnabled },
            m2uDetails: { m2uPhoneNumber },
        } = this.props.getModel(["misc", "m2uDetails"]);
        const m2uNumber = convertMayaMobileFormat(m2uPhoneNumber);
        this.setState(
            {
                mobileNumber: isOverseasMobileNoEnabled ? m2uPhoneNumber : m2uNumber,
            },
            () => {
                this.getTac(false);
            }
        );
    }

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    onClosePress = () => {
        this.props.onTacClose();
    };

    hideTAC = () => {
        const { onGetTacError } = this.props;
        if (onGetTacError) onGetTacError();
    };

    handleErrCallback = (errorMsg) => {
        this.setState({ isLoading: false });

        console.log("[TacModal] >> [displayError]");

        if (errorMsg) {
            this.toastRef.showMessage(
                errorToastProp({
                    message: errorMsg,
                })
            );
        }
    };

    onTacDonePress = (code) => {
        console.log("onTacDonePress", code);

        const { validateByOwnAPI, validateTAC } = this.props;

        // If validateByOwnAPI is true, then TAC validation needs to be diverted to its respective modules
        if (validateByOwnAPI && validateTAC) {
            this.setState({ isLoading: true }, () => {
                validateTAC(code, this.handleErrCallback);
            });
        } else {
            this.setState({ isLoading: true }, () => {
                this.callTransferApi(code);
            });

            // call mock
            // this.callTransferApiSuccess(paybillErrorsMock);
        }
    };

    onResentTacPress = () => {
        console.log("onResentTacPress");
        this.getTac(true);
    };

    // -----------------------
    // API CALL
    // -----------------------

    getTac = (resentTac) => {
        console.log("getTac", this.props);
        const params = this.props.tacParams;

        createOtp("/tac", params)
            .then((result) => {
                if (result && result.data) {
                    const responsedata = result.data;
                    const statusCode = responsedata?.statusCode ?? null;
                    const statusDesc = responsedata?.statusDesc ?? "";
                    const token = responsedata?.token ?? null;

                    console.log("responsedata:", responsedata);
                    if (statusCode === "0") {
                        // suppose to use responsedata.smsMessage, but not all API expected message. so use responsedata.token for now
                        const message = `${token}`;

                        if (Config?.DEV_ENABLE === "true" && message) {
                            const timeout = this.props.isS2UDown ? 6000 : 0;
                            setTimeout(() => {
                                this.toastRef.showMessage(
                                    infoToastProp({
                                        message: `Your TAC no. is ${message}`,
                                        position: "top",
                                        duration: 6000,
                                    })
                                );
                            }, timeout);
                        }
                        if (this.props.isS2UDown && !resentTac) {
                            this.toastRef.showMessage(
                                infoToastProp({
                                    message: Strings.SECURE2U_IS_DOWN,
                                })
                            );
                        }
                    } else {
                        if (statusCode === TAC_ERR_CODE) {
                            this.toastRef.showMessage(
                                errorToastProp({
                                    message: statusDesc,
                                })
                            );
                            this.hideTAC();
                        } else {
                            if (Config?.DEV_ENABLE === "true") {
                                this.toastRef.showMessage(
                                    infoToastProp({
                                        message: statusDesc,
                                        position: "top",
                                        duration: 6000,
                                    })
                                );
                            }
                        }
                    }
                } else {
                    this.toastRef.showMessage(
                        errorToastProp({
                            message: "Get tac error",
                        })
                    );
                }
            })
            .catch((err) => {
                console.log("[TacModal][getTac] >> Excveption: ", err);
                const message = `${err.message}`;

                this.toastRef.showMessage(
                    errorToastProp({
                        message: message,
                    })
                );

                // Hide TAC Modal for any other HTTP status code apart from 200
                this.hideTAC();
            })
            .finally(() => this.setState({ isLoading: false }));
    };

    callTransferApi = (token) => {
        if (token && token.length >= 6) {
            const { transferApi } = this.props;
            const params = { ...this.props.transferAPIParams, tac: token, smsTac: token };
            console.log("callTransferApi :", params);
            transferApi(params)
                .then((result) => {
                    const response = result.data;
                    this.callTransferApiSuccess(response);
                })
                .catch((err) => {
                    console.log("ERR", err);
                    // this.toastRef.showMessage(
                    //     errorToastProp({
                    //         message: err.message,
                    //     })
                    // );
                    this.props.onTacError(err, token);
                })
                .finally(() => this.setState({ isLoading: false }));
        } else {
            this.setState({ isLoading: false }, () => {
                this.toastRef.showMessage(
                    errorToastProp({
                        message: Strings.TAC_CANNOT_BE_LESS_THAN_6,
                    })
                );
            });
        }
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
        console.log("[TacModal] >> [onChallengeQuestionSubmitPress] ");
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

    onToastClose = () => {
        this.toastRef.hideMessage();
    };

    renderToastComponent = (props) => <Toast onClose={this.onToastClose} {...props} />;

    render() {
        const { isLoading, festiveFlag, festiveImage, countDownInt } = this.state;

        return (
            <Modal visible animated animationType="slide" hardwareAccelerated transparent>
                {isLoading ? (
                    <View style={Styles.mainContainer}>
                        <ScreenLoader showLoader />
                    </View>
                ) : (
                    <ScreenContainer
                        backgroundType="color"
                        backgroundColor={MEDIUM_GREY}
                        showLoaderModal={this.state.isLoading}
                    >
                        <React.Fragment>
                            <Image
                                source={festiveFlag ? festiveImage : null}
                                style={[
                                    {
                                        ...StyleSheet.absoluteFill,
                                    },
                                    Styles.topContainer,
                                ]}
                            />
                            <ScreenLayout
                                scrollable={true}
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
                                        description={`${Strings.ENTER_TAC}\n${maskedMobileNumber(
                                            this.state.mobileNumber
                                        )}`}
                                        footer={Strings.RESEND_TAC} // Strings.RESEND_OTP + " / " +
                                        withTouch={false}
                                        disabled={false}
                                        onFooterPress={this.onResentTacPress}
                                        countDownInt={countDownInt}
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
                )}

                <FlashMessage MessageComponent={this.renderToastComponent} ref={this.refForToast} />
            </Modal>
        );
    }
}

TacModal.propTypes = {
    festiveFlag: PropTypes.bool,
    festiveImage: PropTypes.object,
    getModel: PropTypes.func,
    onGetTacError: PropTypes.func,
    onTacClose: PropTypes.func,
    onTacError: PropTypes.func,
    onTacSuccess: PropTypes.func,
    tacParams: PropTypes.object.isRequired,
    transferAPIParams: PropTypes.object.isRequired,
    transferApi: PropTypes.shape({
        transferApi: PropTypes.func,
    }),
    validateByOwnAPI: PropTypes.any,
    validateTAC: PropTypes.func,
    isS2UDown: PropTypes.bool,
};

TacModal.defaultProps = {
    tacParams: {},
    transferAPIParams: {},
    onTacSuccess: () => {
        console.log("onTacSuccess");
    },
    onTacError: () => {
        console.log("onTacError");
    },
    onTacClose: () => {
        console.log("onTacClose");
    },
    festiveFlag: false,
    festiveImage: {},
    isS2UDown: false,
};

export default withModelContext(TacModal);

const Styles = {
    mainContainer: {
        flex: 1,
    },
    topContainer: { width: "100%", height: "35%" },
};

// MOCK
// const paybillsuccessMock = {
//     statusCode: "0",
//     statusDescription: null,
//     serverDate: "8 Apr 2020, 11:03 PM",
//     transactionRefNumber: "MB11111117179767218M",
//     amount: "1.87",
//     toCardNo: "72203656",
//     message: "Success",
//     token: null,
//     rsaStatus: null,
//     challenge: null,
//     maskCardNo: "****3656",
// };
// const paybillErrorsMock = {
//     statusCode: "200",
//     statusDescription: "Please wait a few minutes and try again.", // additionalStatus
//     serverDate: "8 Apr 2020, 12:35 AM",
//     transactionRefNumber: "MB11111117179754015M",
//     amount: "14.95",
//     toCardNo: "1234567890",
//     message: "Failure",
//     token: null,
//     rsaStatus: null,
//     challenge: null,
//     maskCardNo: "******7890",
// };
