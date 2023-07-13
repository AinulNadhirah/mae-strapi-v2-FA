import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, ScrollView, TextInput, Platform, KeyboardAvoidingView } from "react-native";
import DeviceInfo from "react-native-device-info";

import {
    COMMON_MODULE,
    DASHBOARD,
    ONE_TAP_AUTH_MODULE,
    RSA_DENY_SCREEN,
    TAB_NAVIGATOR,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { CircularLogoImage } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typography from "@components/Text";
import {
    errorToastProp,
    showErrorToast,
    showSuccessToast,
    successToastProp,
} from "@components/Toast";

import { withModelContext } from "@context";

import ApiManager from "@services/ApiManager";

import { METHOD_POST, TIMEOUT, TOKEN_TYPE_M2U } from "@constants/api";
import { GREY, MEDIUM_GREY, YELLOW } from "@constants/colors";
import { SETTINGS_ENTER_NAME } from "@constants/strings";
import { BAKONG_ENDPOINT } from "@constants/url";

import { validateAlphaNumaric } from "@utils/dataModel";
import { getDeviceRSAInformation } from "@utils/dataModel/utilityPartial.2";
import { formatBakongMobileNumbers } from "@utils/dataModel/utilityPartial.5";
import { ErrorLogger } from "@utils/logs";

import Styles from "@styles/Wallet/TransferAddToFavoritesStyle";

class BakongAddToFavourites extends Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
        getModel: PropTypes.func.isRequired,
        updateModel: PropTypes.func.isRequired,
    };

    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
        this.state = {
            loader: false,
            screenData: {
                image: "",
                name: "",
                description1: "",
                description2: "",
            },
            error: false,
            errorMessage: "",
            transferParams: {},

            // form data
            favouriteNameText: "",
            // showFavouriteNameTextError: false,
            // favouriteNameTextError: "",

            // RSA
            showRSALoader: false,
            showRSAChallengeQuestion: false,
            rsaChallengeQuestion: "",
            showRSAError: false,
            challengeRequest: {},
            rsaCount: 0,
        };
    }

    componentDidMount() {
        console.log("[BakongAddToFavourites] >> [componentDidMount] : ");

        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            console.log("[BakongAddToFavourites] >> [componentDidMount] focusSubscription : ");
            this.updateData();
        });
    }

    componentWillUnmount() {
        console.log("[BakongAddToFavourites] >> [componentWillUnmount] : ");
        this.focusSubscription();
    }

    /***
     * updateData
     * Update Screen Data upon screen focused
     */
    async updateData() {
        const transferParams = this.props.route.params.transferParams;
        console.log("[BakongAddToFavourites] >> [updateData] transferParams==> ", transferParams);

        // Passport/ID number masking
        const { recipientIdNumber } = transferParams;
        // var first4 = cardnumber.substring(0, 4);
        const last4 = recipientIdNumber.substring(recipientIdNumber.length - 4);
        const mask = recipientIdNumber
            .substring(0, recipientIdNumber.length - 4)
            .replace(/./g, "*");
        const maskedIdNo = mask + last4;

        const screenData = {
            image: transferParams.image,
            name: "+855 " + formatBakongMobileNumbers(transferParams.mobileNo),
            description1: transferParams.name ?? "",
            description2: transferParams.transactionTo ?? "",
        };
        console.log("[BakongAddToFavourites] >> [updateData] screenData ==> ", screenData);

        this.setState({
            transferParams: { ...transferParams, recipientIdNumberMasked: maskedIdNo },
            screenData: screenData,
            favouriteNameText: transferParams.name ?? "",
            // selectedCountry: transferParams.addressCountry ?? "",
            // addressLine1: transferParams.addressLine1 ?? "",
            // addressLine2: transferParams.addressLine2 ?? "",
        });
    }

    _addToFavorites = async (data) => {
        try {
            return await ApiManager.service({
                url: `${BAKONG_ENDPOINT}/payment/addFavorite`,
                data,
                reqType: METHOD_POST,
                tokenType: TOKEN_TYPE_M2U,
                timeout: TIMEOUT,
                promptError: false,
                showPreloader: true,
            });
        } catch (error) {
            // this.props.navigation.goBack();
            // showErrorToast(
            //     errorToastProp({
            //         message: error.message ?? "Unable to add to favourites. Please try again.",
            //     })
            // );
            ErrorLogger(error);
            throw error;
        }
    };

    doneClick = async (extraParams = {}) => {
        console.log("[BakongAddToFavourites] >> [doneClick] : ");

        try {
            const { transferParams, favouriteNameText } = this.state;
            const { getModel } = this.props;
            const { deviceInformation, deviceId } = getModel("device");
            const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);

            if (favouriteNameText && favouriteNameText.length > 0) {
                // VALIDATION
                if (!validateAlphaNumaric(favouriteNameText)) {
                    showErrorToast(
                        errorToastProp({
                            message: "Name must contain alphanumerical characters only.",
                        })
                    );
                    return;
                }

                const response = await this._addToFavorites({
                    mobileSDKData,
                    address1: transferParams.addressLine1,
                    address2: transferParams.addressLine2,
                    country: transferParams.addressCountryCode,
                    idNum: transferParams.recipientIdNumber,
                    idType: transferParams.recipientIdType === "NID" ? "1" : "2",
                    mobileNo: "+" + transferParams.inquiryData.phone,
                    nationality: transferParams.recipientNationalityCode,
                    nickName: favouriteNameText.trim(),
                    regName: transferParams.inquiryData.name,
                    ...extraParams,
                });

                const { data } = response;
                console.log("[BakongAddToFavourites][doneClick] data: ", data);
                if (data.statusCode === "0000") {
                    // go back and show success toast
                    this.props.navigation.goBack();
                    showSuccessToast(
                        successToastProp({
                            message: `${favouriteNameText} successfully added to Favourites.`,
                        })
                    );
                } else {
                    //show error toast
                    this.props.navigation.goBack();
                    showErrorToast(
                        errorToastProp({
                            message:
                                data?.statusDescription ??
                                "Unable to add to favourites. Please try again.",
                        })
                    );
                }
            } else {
                showErrorToast(
                    errorToastProp({
                        message: "Please enter a name.",
                    })
                );
            }
        } catch (error) {
            console.tron.log("[BakongAddToFavourites][doneClick] error:", error);
            const status = error?.status ?? 0;
            if (status === 428 || status === 423 || status === 422) {
                this._handleRSAFailure(error);
                return;
            } else {
                this.props.navigation.goBack();
                showErrorToast(
                    errorToastProp({
                        message: error?.message ?? "Unable to add to favourites. Please try again.",
                    })
                );
                throw error;
            }
        }
    };

    _onBackPress = () => {
        console.log("[BakongAddToFavourites] >> [_onBackPress] : ");
        this.props.navigation.goBack();
    };

    _onFavouriteNameTextChange = (text) => {
        this.setState({
            favouriteNameText: text ? text : "",
        });
    };

    _onFavouriteNameTextDone = () => {};

    // RSA START
    _handleRSAFailure = (error) => {
        if (error.status === 428)
            this.setState((prevState) => ({
                challengeRequest: {
                    ...prevState.challengeRequest,
                    challenge: error.error.challenge,
                },
                showRSAChallengeQuestion: true,
                showRSALoader: false,
                rsaChallengeQuestion: error.error.challenge.questionText,
                rsaCount: prevState.rsaCount + 1,
                showRSAError: prevState.rsaCount > 0,
            }));
        else if (error.status === 423) {
            this.setState({
                showRSAChallengeQuestion: false,
            });
            const serverDate = error?.error?.serverDate ?? "N/A";
            this.props.navigation.navigate(ONE_TAP_AUTH_MODULE, {
                screen: "Locked",
                params: {
                    reason: error?.error?.statusDescription ?? "N/A",
                    loggedOutDateTime: serverDate,
                    lockedOutDateTime: serverDate,
                },
            });
        } else {
            this.setState({
                showRSAChallengeQuestion: false,
            });
            this.props.navigation.navigate(COMMON_MODULE, {
                screen: RSA_DENY_SCREEN,
                params: {
                    statusDescription: error?.error?.statusDescription ?? "N/A",
                    additionalStatusDescription: error?.error?.additionalStatusDescription ?? "",
                    serverDate: error?.error?.serverDate ?? "N/A",
                    nextParams: { screen: DASHBOARD, params: { refresh: false } },
                    nextModule: TAB_NAVIGATOR,
                    nextScreen: "Tab",
                },
            });
        }
    };

    _handleRSAChallengeQuestionAnswered = (answer) => {
        this.setState({ showRSAError: false, showRSALoader: true }, async () => {
            const payload = {
                challenge: { ...this.state.challengeRequest.challenge, answer },
            };

            this.doneClick(payload);
        });
    };

    _handleRSAChallengeQuestionClosed = () => this.setState({ showRSAError: false });
    //RSA END

    render() {
        const {
            showErrorModal,
            errorMessage,
            loader,
            screenData,
            favouriteNameText,
            transferParams,
            disabled,

            // RSA
            showRSAChallengeQuestion,
            showRSAError,
            showRSALoader,
            rsaChallengeQuestion,
        } = this.state;
        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    showErrorModal={showErrorModal}
                    errorMessage={errorMessage}
                    showLoaderModal={loader}
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
                                        text="Add To Favourites"
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
                            <ScrollView showsHorizontalScrollIndicator={false}>
                                <KeyboardAvoidingView style={{ flex: 1 }} behavior="position">
                                    <View style={Styles.container}>
                                        <View style={Styles.headerContainer}>
                                            <View style={Styles.headerImageContainer}>
                                                <CircularLogoImage
                                                    source={screenData.image}
                                                    isLocal={false}
                                                />
                                            </View>

                                            <TextInput
                                                placeholderTextColor={GREY}
                                                textAlign="left"
                                                autoCorrect={false}
                                                autoFocus={false}
                                                allowFontScaling={false}
                                                style={
                                                    Platform.OS === "ios"
                                                        ? favouriteNameText &&
                                                          favouriteNameText.length >= 1
                                                            ? Styles.commonInputConfirmIosText
                                                            : Styles.commonInputConfirmIos
                                                        : favouriteNameText &&
                                                          favouriteNameText.length >= 1
                                                        ? Styles.commonInputConfirmText
                                                        : Styles.commonInputConfirm
                                                }
                                                maxLength={20}
                                                placeholder={SETTINGS_ENTER_NAME}
                                                onSubmitEditing={this._onFavouriteNameTextDone}
                                                // errorMessage={this.state.favouriteNameTextError}
                                                // isValidate={this.state.showFavouriteNameTextError}
                                                value={favouriteNameText.substring(0, 20)}
                                                onChangeText={this._onFavouriteNameTextChange}
                                                returnKeyType="done"
                                            />
                                        </View>

                                        <View style={Styles.formBodyContainer}>
                                            {/* Bank name */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Bank name"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={transferParams.transactionTo}
                                                    />
                                                </View>
                                            </View>

                                            {/* Registered name */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Registered name"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={transferParams.name}
                                                    />
                                                </View>
                                            </View>

                                            {/* Transfer type */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Transfer type"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text="Bakong Transfer"
                                                    />
                                                </View>
                                            </View>

                                            {/* Mobile no. */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Mobile number"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={screenData.name}
                                                    />
                                                </View>
                                            </View>

                                            {/* Nationality */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Nationality"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={transferParams.recipientNationality}
                                                    />
                                                </View>
                                            </View>

                                            {/* ID Type */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="ID Type"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={
                                                            transferParams.recipientIdType === "NID"
                                                                ? "National ID"
                                                                : "Passport"
                                                        }
                                                    />
                                                </View>
                                            </View>

                                            {/* Passport / National ID */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text={
                                                            transferParams.recipientIdType === "NID"
                                                                ? "National ID Number"
                                                                : "Passport Number"
                                                        }
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={
                                                            transferParams.recipientIdNumberMasked
                                                        }
                                                    />
                                                </View>
                                            </View>

                                            {/* Address line 1 */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Address line 1"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={transferParams.addressLine1}
                                                    />
                                                </View>
                                            </View>

                                            {/* Address line 2 */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Address line 2"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={transferParams.addressLine2}
                                                    />
                                                </View>
                                            </View>

                                            {/* Country */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Country"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={transferParams.addressCountry}
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </KeyboardAvoidingView>
                            </ScrollView>
                            <FixedActionContainer>
                                <ActionButton
                                    disabled={disabled}
                                    fullWidth
                                    borderRadius={25}
                                    onPress={this.doneClick}
                                    backgroundColor={YELLOW}
                                    componentCenter={
                                        <Typography
                                            text="Add to Favourites"
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
                <ChallengeQuestion
                    loader={showRSALoader}
                    display={showRSAChallengeQuestion}
                    displyError={showRSAError}
                    questionText={rsaChallengeQuestion}
                    onSubmitPress={this._handleRSAChallengeQuestionAnswered}
                    onSnackClosePress={this._handleRSAChallengeQuestionClosed}
                />
            </React.Fragment>
        );
    }
}

export default withModelContext(BakongAddToFavourites);
