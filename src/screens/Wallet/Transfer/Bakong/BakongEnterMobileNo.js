import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Platform, TouchableOpacity, Image, StyleSheet } from "react-native";

import { FUNDTRANSFER_MODULE, TRANSFER_TAB_SCREEN } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typography from "@components/Text";
import TextInput from "@components/TextInput";
import { errorToastProp, showErrorToast, hideToast } from "@components/Toast";

import ApiManager, { METHOD_POST, TIMEOUT } from "@services/ApiManager";
import { logEvent } from "@services/analytics";

import { TOKEN_TYPE_M2U } from "@constants/api";
import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import { CONTINUE, FA_SCREEN_NAME, FA_VIEW_SCREEN } from "@constants/strings";
import { BAKONG_ENDPOINT } from "@constants/url";

import { checkNativeContatPermission, formatBakongMobileNumbers } from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";

import assets from "@assets";

class BakongEnterMobileNo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mobileNo: "",
            error: false,
            errorMessage: "",

            loader: false,

            transferParams: {},
            disabled: true,
        };
    }

    /***
     * componentDidMount
     * Update Screen data
     */
    componentDidMount() {
        console.log("[BakongEnterMobileNo] >> [componentDidMount] : ");
        this._updateDataInScreen();

        // Analytics - view_screen event
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "M2U_TRF_Overseas_Bakong_1Mobile",
        });
    }

    _getWalletInquiry = async (data) => {
        try {
            return await ApiManager.service({
                url: `${BAKONG_ENDPOINT}/payment/walletInquiry`,
                data,
                reqType: METHOD_POST,
                tokenType: TOKEN_TYPE_M2U,
                timeout: TIMEOUT,
                promptError: false,
                showPreloader: true,
            });
        } catch (error) {
            showErrorToast(
                errorToastProp({
                    message: error.message ?? "Unable to get account details. Please try again.",
                })
            );
            ErrorLogger(error);
            throw error;
        }
    };

    _onInquireMobileNo = async () => {
        console.log("[BakongEnterMobileNo][_onInquireMobileNo]");
        try {
            this.setState({ loader: true });
            const { transferParams } = this.state;
            const response = await this._getWalletInquiry({
                mobileNo: "855" + transferParams.mobileNo,
            });
            const { data } = response;
            console.log("[BakongEnterMobileNo][_onInquireMobileNo] data: ", data);
            const { accountId, name, phone, statusCode, statusDescription, serviceCharge } = data;

            if (statusCode === "0000" && accountId !== null) {
                this.props.navigation.navigate("BakongEnterAmount", {
                    transferParams: {
                        ...this.state.transferParams,
                        name,
                        inquiryData: data,
                        mobileNo: phone.substr(0, 3) === "855" ? phone.slice(3) : phone,
                        serviceCharge,
                    },
                });
            } else {
                this.setState({ loader: false });
                showErrorToast(
                    errorToastProp({
                        message: statusDescription ?? "The ID entered is invalid.",
                    })
                );
            }
        } catch (error) {
            this.setState({ loader: false });
            showErrorToast(
                errorToastProp({
                    message:
                        error?.message ??
                        "Unable to retrieve Bakong wallet details. Please try again.",
                })
            );
            ErrorLogger(error);
            throw error;
        }
    };

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {
        console.log("[BakongEnterMobileNo] >> [componentWillUnmount] : ");
    }

    /***
     * _updateDataInScreen
     * Handle one time screen load
     */
    _updateDataInScreen = () => {
        console.log("[BakongEnterMobileNo] >> [_updateDataInScreen] : ");
        const transferParams = this.props.route.params?.transferParams;
        if (transferParams) {
            const mobileNo = transferParams.mobileNo;

            console.log("[BakongEnterMobileNo] >> [_updateDataInScreen] mobileNo ==> ", mobileNo);

            this.setState(
                {
                    mobileNo: formatBakongMobileNumbers(transferParams?.mobileNo ?? ""),
                    disabled: transferParams.mobileNo ? false : true,
                    transferParams: {
                        ...transferParams,
                        favorite: transferParams.favorite ? true : false,
                    },
                },
                () => {
                    if (transferParams.favorite) this._onTextDone();
                }
            );
        }
    };

    /***
     * _onBackPress
     * Handle on Back button click
     */
    _onBackPress = () => {
        console.log("[BakongEnterMobileNo] >> [_onBackPress]");
        hideToast();
        // this.props.navigation.goBack();

        // Go back to transfer screen
        this.props.navigation.navigate(FUNDTRANSFER_MODULE, {
            screen: TRANSFER_TAB_SCREEN,
            params: {
                screenDate: { routeFrom: "Dashboard" },
                index: 3,
            },
        });
    };

    /***
     * _onTextChange
     * on Text Change formate state
     */
    _onTextChange = (text) => {
        this.setState({
            mobileNo: text && text !== "" ? formatBakongMobileNumbers(text) : "",
            error: false,
            errorMessage: "",
            disabled: false,
        });
    };

    /***
     * _onTextDone
     * Handle On Done Key Press from Keyboard
     */
    _onTextDone = () => {
        console.log("[BakongEnterMobileNo] >> [_onTextDone] ==> ");
        let val = this.state.mobileNo;
        console.log("[BakongEnterMobileNo] >> [_onTextDone] mobileNo :", this.state.mobileNo);
        console.log(
            "[BakongEnterMobileNo] >> [_onTextDone] mobileNo.length :",
            this.state.mobileNo.length
        );
        val = val.replace(/\s/g, "");
        console.log("[BakongEnterMobileNo] >> [_onTextDone] val :", val);
        console.log("[BakongEnterMobileNo] >> [_onTextDone] val.length :", val.length);
        console.log("[BakongEnterMobileNo] >> [_onTextDone] mobileNo : ", this.state.mobileNo);
        if (val.length === 0) {
            this.setState({
                error: true,
                errorMessage: "Please enter a valid mobile number.",
            });
        } else if (val.length < 8) {
            this.setState({
                error: true,
                errorMessage: "Please enter a valid mobile number.",
            });
        } else {
            if (val.length > 15) {
                this.setState({
                    error: true,
                    errorMessage: "Mobile number cannot be greater than 15 digits.",
                });
            } else {
                this.setState(
                    {
                        error: false,
                        errorMessage: "",
                        transferParams: {
                            ...this.state.transferParams,
                            mobileNo: val,
                            image: {
                                image: "icBakong.png",
                                imageName: "icBakong.png",
                                imageUrl: "icBakong.png",
                                shortName: "Bakong",
                                type: true,
                            },
                            name: "",
                            transactionTo: "Bakong Wallet",
                        },
                    },
                    () => {
                        console.log(
                            "[BakongEnterMobileNo] >> [_onTextDone] transferParams : ",
                            this.state.transferParams
                        );

                        // inquire mobile no.
                        this._onInquireMobileNo();
                    }
                );
            }
        }
    };

    getContact = async () => {
        console.log("[ReloadSelectContact] >> [getContact]");

        try {
            const contactInfo = await checkNativeContatPermission();
            if (contactInfo && contactInfo?.status) {
                const mobileNo = contactInfo?.mobileNo ?? "";

                // Remove white spaces before validating length
                const mobileNoFormatted = mobileNo.replace(/\s+/g, "");
                console.log(mobileNo);

                this.setState({
                    mobileNo: this.checkFormatNumber(mobileNoFormatted) ?? "",
                    error: false,
                    errorMessage: "",
                    disabled: false,
                });

                return;
            }

            showErrorToast({
                message: "No contact selected",
            });
        } catch (error) {
            showErrorToast({
                message: "No contact selected",
            });
        }
    };

    /***
     * checkFormatNumber
     * check Format Mobile Number Value
     */
    checkFormatNumber(val) {
        console.log("[DuitNowEnterID] >> [checkFormatNumber] val ==> ", val);
        try {
            val = val.replace(/\s/g, "");
            val = val.replace(/[{()}]/g, "");
            val = val.replace(/[[\]']+/g, "");
            val = val.replace(/-/g, "");
            val = val.replace(/\*/g, "");
            val = val.replace(/#/g, "");
            val = val.replace(/\D/g, "");
        } catch (e) {
            console.log(e);
        }
        let first = val.substring(0, 1);
        let second = val.substring(0, 3);
        let value = "";
        console.log("[BakongEnterMobileNo] >> [checkFormatNumber] val2 ==> ", val);
        console.log("[BakongEnterMobileNo] >> [checkFormatNumber] first ==> ", first);
        console.log("[BakongEnterMobileNo] >> [checkFormatNumber] second ==> ", second);
        if (second === "855") {
            value = val.substring(3, val.length);
        } else {
            value = val;
        }

        if (value.length > 21) {
            value = value.substring(0, 21);
        }
        console.log("[BakongEnterMobileNo] >> [checkFormatNumber] value ==> ", value);
        return formatBakongMobileNumbers(value);
    }

    // /***
    //  * formatNumber
    //  * formate ID Value
    //  */
    // formatNumber = (val) => {
    //     console.log("[DuitNowEnterID] >> [formatNumber] val ==> ", val);
    //     let first = val.toString().substring(0, 3);
    //     let second = val
    //         .toString()
    //         .substring(3, val.length)
    //         .replace(/\d{4}(?=.)/g, "$& ");
    //     return (first + " " + second).toString().trim();
    // };

    render() {
        const { showErrorModal, errorMessage } = this.state;
        return (
            <ScreenContainer
                backgroundType="color"
                showErrorModal={showErrorModal}
                errorMessage={errorMessage}
                showOverlay={false}
                backgroundColor={MEDIUM_GREY}
                // analyticScreenName="M2U_TRF_Overseas_Bakong_1Mobile"
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typography
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text="Bakong"
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                        />
                    }
                    useSafeArea
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <React.Fragment>
                        <View style={Styles.container}>
                            <View style={Styles.blockNew}>
                                <View style={Styles.descriptionContainerAmount}>
                                    <Typography
                                        fontSize={14}
                                        fontWeight="normal"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={19}
                                        color={BLACK}
                                        textAlign="left"
                                        text="Mobile number"
                                    />
                                </View>

                                <View style={styles.mobileNumberView}>
                                    <View style={styles.mobileNumberView1}>
                                        <TextInput
                                            prefix="+855"
                                            keyboardType={
                                                Platform.OS === "ios" ? "number-pad" : "numeric"
                                            }
                                            accessibilityLabel={"mobileNumber"}
                                            maxLength={19}
                                            isValidate={this.state.error}
                                            errorMessage={this.state.errorMessage}
                                            value={this.state.mobileNo}
                                            onChangeText={this._onTextChange}
                                            editable={true}
                                            onSubmitEditing={this._onTextDone}
                                            returnKeyType="done"
                                        />
                                    </View>
                                    <View style={styles.mobileNumberView2}>
                                        <TouchableOpacity onPress={this.getContact}>
                                            <Image
                                                style={styles.mobileNumberSelectView}
                                                source={assets.icContactList}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <FixedActionContainer>
                            <ActionButton
                                disabled={this.state.disabled}
                                fullWidth
                                borderRadius={25}
                                onPress={this._onTextDone}
                                backgroundColor={this.state.disabled ? DISABLED : YELLOW}
                                componentCenter={
                                    <Typography
                                        color={this.state.disabled ? DISABLED_TEXT : BLACK}
                                        text={CONTINUE}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

BakongEnterMobileNo.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            transferParams: PropTypes.shape({
                favorite: PropTypes.any,
                mobileNo: PropTypes.string,
            }),
        }),
    }),
};

const styles = StyleSheet.create({
    mobileNumberSelectView: {
        height: 22,
        resizeMode: Platform.OS != "ios" ? "center" : "contain",
        width: 20,
    },
    mobileNumberView: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 6,
        width: "100%",
    },
    mobileNumberView1: {
        width: "100%",
    },
    mobileNumberView2: {
        height: 22,
        position: "absolute",
        right: 0,
        top: 10,
        width: 20,
    },
});

export default BakongEnterMobileNo;
