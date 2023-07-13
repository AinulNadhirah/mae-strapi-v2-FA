import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Platform, TouchableOpacity, Image, StyleSheet } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import TextInputWithLengthCheck from "@components/TextInputWithLengthCheck";
import Typography from "@components/TextWithInfo";
import { errorToastProp, showErrorToast, hideToast } from "@components/Toast";

import { bakongWalletInquiry } from "@services";
import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import { CONTINUE, WE_FACING_SOME_ISSUE } from "@constants/strings";

import { checkNativeContatPermission, formatBakongMobileNumbers } from "@utils/dataModel/utility";
import { errorCodeMap } from "@utils/errorMap";
import { ErrorLogger } from "@utils/logs";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";

import assets from "@assets";

class BakongEnterMobileNumber extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mobileNo: "",
            error: false,
            errorMessage: "",
            transferParams: {},
            disabled: true,
        };
    }

    /***
     * componentDidMount
     * Update Screen data
     */
    componentDidMount() {
        console.log("[BakongEnterMobileNumber] >> [componentDidMount] : ");
        this._updateDataInScreen();
        RemittanceAnalytics.BakongMobileNumberLoad();
    }

    _onInquireMobileNo = async () => {
        console.log("[BakongEnterMobileNumber][_onInquireMobileNo]");
        try {
            const { transferParams } = this.state;
            const response = await bakongWalletInquiry({
                mobileNo: "855" + transferParams?.mobileNo,
            });
            if (response?.data && response?.data?.statusCode === "0000") {
                console.log("[BakongEnterMobileNumber][_onInquireMobileNo] data: ", response?.data);
                const { accountId, name, phone, statusCode, serviceCharge } = response?.data;
                if (statusCode === "0000" && accountId !== null) {
                    this.props.navigation.navigate("BakongRecipientIDDetails", {
                        transferParams: {
                            ...this.state.transferParams,
                            name,
                            inquiryData: response?.data,
                            mobileNo: phone.substr(0, 3) === "855" ? phone.slice(3) : phone,
                            serviceCharge,
                            remittanceData: this.props.route?.params?.remittanceData,
                        },
                        from: "",
                    });
                    return;
                }
            }
            showErrorToast(
                errorToastProp({
                    message: response?.data?.statusDescription ?? "The ID entered is invalid.",
                })
            );
        } catch (error) {
            const errObj = errorCodeMap(error);
            showErrorToast(
                errorToastProp({
                    message:
                        errObj?.code === 500
                            ? WE_FACING_SOME_ISSUE
                            : error?.message ??
                              "Unable to retrieve Bakong wallet details. Please try again.",
                })
            );
            ErrorLogger(error);
            throw error;
        }
    };

    /***
     * _updateDataInScreen
     * Handle one time screen load
     */
    _updateDataInScreen = () => {
        console.log("[BakongEnterMobileNumber] >> [_updateDataInScreen] : ");
        const transferParams = this.props.route.params?.transferParams;
        if (transferParams) {
            const mobileNo = transferParams.mobileNo;

            console.log(
                "[BakongEnterMobileNumber] >> [_updateDataInScreen] mobileNo ==> ",
                mobileNo
            );

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
        console.log("[BakongEnterMobileNumber] >> [_onBackPress]");
        hideToast();
        this.props.navigation.goBack();
    };

    /***
     * _onTextChange
     * on Text Change formate state
     */
    _onTextChange = (text) => {
        this.setState({
            mobileNo: text !== "" ? text : "",
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
        console.log("[BakongEnterMobileNumber] >> [_onTextDone] ==> ");
        let val = this.state.mobileNo;
        console.log("[BakongEnterMobileNumber] >> [_onTextDone] mobileNo :", this.state.mobileNo);
        console.log(
            "[BakongEnterMobileNumber] >> [_onTextDone] mobileNo.length :",
            this.state.mobileNo.length
        );
        val = val.replace(/\s/g, "");
        console.log("[BakongEnterMobileNumber] >> [_onTextDone] val :", val);
        console.log("[BakongEnterMobileNumber] >> [_onTextDone] val.length :", val.length);
        console.log("[BakongEnterMobileNumber] >> [_onTextDone] mobileNo : ", this.state.mobileNo);
        if (val.length < 8) {
            this.setState({
                error: true,
                errorMessage: "Please enter a valid mobile number.",
            });
        } else if (val.length > 15) {
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
                        "[BakongEnterMobileNumber] >> [_onTextDone] transferParams : ",
                        this.state.transferParams
                    );

                    // inquire mobile no.
                    this._onInquireMobileNo();
                }
            );
        }
    };

    getContact = async () => {
        console.log("[ReloadSelectContact] >> [getContact]");

        try {
            const contactInfo = await checkNativeContatPermission();
            if (contactInfo && contactInfo?.status) {
                const mobileNo = contactInfo?.mobileNo ?? "";

                // Remove white spaces before validating length
                const mobileNoFormatted = mobileNo.replace(/855{1}|\s+/g, "");
                console.log(mobileNo);

                this.setState({
                    mobileNo: mobileNoFormatted ?? "",
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

    render() {
        const { showErrorModal, errorMessage } = this.state;
        return (
            <ScreenContainer
                backgroundType="color"
                showErrorModal={showErrorModal}
                errorMessage={errorMessage}
                showOverlay={false}
                backgroundColor={MEDIUM_GREY}
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
                                        <TextInputWithLengthCheck
                                            prefix="+855"
                                            keyboardType={
                                                Platform.OS === "ios" ? "number-pad" : "numeric"
                                            }
                                            accessibilityLabel="mobileNumber"
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

BakongEnterMobileNumber.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func,
        goBack: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            remittanceData: PropTypes.object,
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
        resizeMode: Platform.OS !== "ios" ? "center" : "contain",
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

export default BakongEnterMobileNumber;
