import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, ScrollView, TextInput, Platform } from "react-native";
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
import Typography from "@components/TextWithInfo";
import { errorToastProp, showErrorToast, showSuccessToast } from "@components/Toast";

import { withModelContext } from "@context";

import { addTofav } from "@services";
import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { GREY, MEDIUM_GREY, YELLOW } from "@constants/colors";
import {
    FTT,
    MOT,
    SETTINGS_ENTER_NAME,
    VISA_DIRECT,
    WESTERN_UNION,
    INSERT_ANOTHER_NICKNAME,
    UNABLE_ADD_FAV,
} from "@constants/strings";

import { validateAlphaNumaric } from "@utils/dataModel";
import {
    formateAccountNumber,
    formatBakongMobileNumbers,
    getDeviceRSAInformation,
} from "@utils/dataModel/utility";
import { getImage } from "@utils/dataModel/utilityRemittance";

import Styles from "@styles/Wallet/TransferAddToFavoritesStyle";

class OverseasAddToFavourites extends Component {
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
            errorMessage: "",
            transferParams: this.props.route.params.transferParams,

            // form data
            favouriteNameText: this.props.route.params?.favItem?.regName ?? "",

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
        RemittanceAnalytics.trxSuccessAddFav();
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            if (this.props.route.params.transferParams?.transactionTo) {
                this.updateData();
            }
        });
    }

    componentWillUnmount() {
        this.focusSubscription();
    }

    /***
     * updateData
     * Update Screen Data upon screen focused
     */
    async updateData() {
        const transferParams = this.props.route.params.transferParams;
        const recipientIdNumber =
            transferParams?.recipientIdNumber ||
            transferParams?.BakongRecipientIDDetails?.icPassportNumber;
        const last4 = recipientIdNumber.substring(recipientIdNumber.length - 4);
        const mask = recipientIdNumber
            .substring(0, recipientIdNumber.length - 4)
            .replace(/./g, "*");
        const maskedIdNo = mask + last4;

        this.setState({
            transferParams: { ...transferParams, recipientIdNumberMasked: maskedIdNo },
            favouriteNameText: this.props.route.params?.favItem?.regName ?? "",
        });
    }

    doneClick = async (extraParams = {}) => {
        try {
            const { transferParams, favouriteNameText } = this.state;
            const { getModel, route } = this.props;
            const { deviceInformation, deviceId } = getModel("device");
            const { favRemittanceBeneficiaries } = getModel("overseasTransfers");
            const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);
            const { favItem } = route?.params;

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

                if (
                    favRemittanceBeneficiaries?.length > 0 &&
                    favRemittanceBeneficiaries?.includes(favouriteNameText?.toLowerCase())
                ) {
                    showErrorToast({
                        message: INSERT_ANOTHER_NICKNAME,
                    });
                    return;
                }
                const transferReq = {
                    ...favItem?.payload,
                    mobileSDKData: undefined,
                };
                const nickName =
                    favouriteNameText?.length > 20
                        ? favouriteNameText?.substring(0, 20)?.trim()
                        : favouriteNameText?.trim();
                const response = await addTofav({
                    ...favItem,
                    transferReq,
                    mobileSDKData,
                    address1: transferParams?.addressLine1,
                    address2: transferParams?.addressLine2,
                    country: transferParams?.addressCountryCode,
                    idNum: favItem?.idNum ?? transferParams?.recipientIdNumber,
                    idType:
                        transferParams?.recipientIdType === "NID" ||
                        transferParams?.recipientIdType === "NATIONAL_ID"
                            ? "1"
                            : "2",
                    mobileNo: transferParams?.inquiryData?.phone
                        ? "+" + transferParams?.inquiryData?.phone
                        : "+" + favItem?.mobileNo,
                    nationality: transferParams?.recipientNationalityCode || favItem?.country,
                    regName: favItem?.regName || transferParams?.inquiryData?.name,
                    ...route?.params.favItem,
                    nickName,
                    ...extraParams,
                    payload: null,
                });

                const { data } = response;
                if (data?.statusCode === "0000" || data?.code === 200) {
                    // go back and show success toast
                    this.props.navigation?.navigate("OverseasAcknowledgement", {
                        ...this.props.route?.params,
                        transferParams: {
                            ...this.props.route?.params?.transferParams,
                            favourite: true,
                        },
                    });
                    showSuccessToast({
                        message: `${nickName} added to Favourites.`,
                    });
                } else {
                    //show error toast
                    this.props.navigation?.goBack();
                    showErrorToast({
                        message:
                            data?.statusDescription?.includes("SQLException") ||
                            data?.statusDescription?.includes("java.sql") ||
                            data?.statusDescription?.includes("exception")
                                ? UNABLE_ADD_FAV
                                : data?.statusDescription ?? UNABLE_ADD_FAV,
                    });
                }
            } else {
                showErrorToast({
                    message: "Please enter a name.",
                });
            }
        } catch (error) {
            const status = error?.status ?? 0;
            if (status === 428 || status === 423 || status === 422) {
                this._handleRSAFailure(error);
            } else {
                this.props.navigation?.goBack();
                showErrorToast({
                    message:
                        error?.message?.includes("SQLException") ||
                        error?.message?.includes("java.sql") ||
                        error?.message?.includes("exception")
                            ? UNABLE_ADD_FAV
                            : error?.message ?? UNABLE_ADD_FAV,
                });
                throw error;
            }
        }
    };

    _onBackPress = () => {
        this.props.navigation?.goBack();
    };

    _onFavouriteNameTextChange = (text) => {
        this.setState({
            favouriteNameText: text ? text : "",
        });
    };

    // RSA START
    _handleRSAFailure = (error) => {
        if (error.status === 428)
            this.setState((prevState) => ({
                challengeRequest: {
                    ...prevState.challengeRequest,
                    challenge: error?.error?.challenge,
                },
                showRSAChallengeQuestion: true,
                showRSALoader: false,
                rsaChallengeQuestion: error?.error?.challenge?.questionText,
                rsaCount: prevState?.rsaCount + 1,
                showRSAError: prevState?.rsaCount > 0,
            }));
        else if (error.status === 423) {
            this.setState({
                showRSAChallengeQuestion: false,
            });
            const serverDate = error?.error?.serverDate ?? "N/A";
            this.props.navigation?.navigate(ONE_TAP_AUTH_MODULE, {
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
                challenge: { ...this.state.challengeRequest?.challenge, answer },
            };

            this.doneClick(payload);
        });
    };

    _handleRSAChallengeQuestionClosed = () => this.setState({ showRSAError: false });
    _getLabelData = (type) => {
        const { transferParams, favItem } = this.props.route.params;
        const custName = favItem?.regName;
        const country = favItem?.transferToCountry;

        if (type === "FTT") {
            return [
                { label: "Bank name", value: favItem?.bankName },
                { label: "Registered name", value: custName },
                {
                    label: "Account Number",
                    value: formateAccountNumber(favItem?.acctNo, favItem?.acctNo?.length),
                },
                { label: "Country", value: country },
                { label: "Transfer type", value: FTT },
            ];
        }

        if (type === "RT" || type === "MOT") {
            return [
                { label: "Bank name", value: favItem?.bankName },
                { label: "Registered name", value: custName },
                {
                    label: "Account Number",
                    value: formateAccountNumber(favItem?.acctNo, favItem?.acctNo?.length),
                },
                { label: "Country", value: favItem?.transferToCountry },
                { label: "Transfer type", value: MOT },
            ];
        }

        if (type === "VD") {
            return [
                { label: "Bank name", value: "Visa International" },
                { label: "Registered name", value: custName },
                { label: "Country", value: country },
                { label: "Transfer type", value: VISA_DIRECT },
            ];
        }

        if (type === "WU") {
            return [
                { label: "Registered name", value: custName },
                { label: "Country", value: country },
                { label: "Transfer type", value: WESTERN_UNION },
            ];
        }
        return [
            { label: "Bank name", value: transferParams?.transactionTo },
            { label: "Registered name", value: transferParams?.name },
            { label: "Transfer type", value: "Bakong Transfer" },
            {
                label: "Mobile number",
                value: transferParams?.transactionTo
                    ? "+855 " + formatBakongMobileNumbers(transferParams?.inquiryData?.phone)
                    : "",
            },
            { label: "Nationality", value: transferParams?.selectedCountry?.countryName },
            {
                label: "ID Type",
                value: transferParams?.recipientIdType === "NID" ? "National ID" : "Passport",
            },
            {
                label: `${
                    transferParams?.recipientIdType === "NID" ? "National ID" : "Passport"
                } number`,
                value: favItem?.idNum,
            },
            { label: "Address line 1", value: favItem?.address1 },
            { label: "Address line 2", value: favItem?.address2 },
        ];
    };
    renderDetails = () => {
        const { favItem } = this.props.route.params;

        const type = favItem?.product === "Bakong" ? "BK" : favItem?.product;
        const infoList = this._getLabelData(type);
        return infoList
            .filter((filteredInfo) => {
                return filteredInfo?.value;
            })
            .map((info, i) => {
                return (
                    <View key={`containerFavInfo-${i}`} style={Styles.rowListContainer}>
                        <View style={Styles.rowListItemLeftContainer}>
                            <Typography
                                fontSize={14}
                                lineHeight={19}
                                textAlign="left"
                                text={info.label}
                            />
                        </View>
                        <View style={Styles.rowListItemRightContainer}>
                            <Typography
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                textAlign="right"
                                text={info.value}
                            />
                        </View>
                    </View>
                );
            });
    };
    //RSA END

    render() {
        const {
            showErrorModal,
            errorMessage,
            loader,
            favouriteNameText,
            transferParams,
            disabled,
            showRSAChallengeQuestion,
            showRSAError,
            showRSALoader,
            rsaChallengeQuestion,
        } = this.state;
        const iosInputStyle =
            favouriteNameText && favouriteNameText.length >= 1
                ? Styles.commonInputConfirmIosText
                : Styles.commonInputConfirmIos;
        const inputStyle =
            favouriteNameText && favouriteNameText.length >= 1
                ? Styles.commonInputConfirmText
                : Styles.commonInputConfirm;
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
                                        text="Add as Favourites"
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
                                <View style={Styles.container}>
                                    <View style={Styles.headerContainer}>
                                        <View style={Styles.headerImageContainer}>
                                            <CircularLogoImage
                                                source={getImage(transferParams?.name)}
                                                isLocal={true}
                                            />
                                        </View>

                                        <TextInput
                                            placeholderTextColor={GREY}
                                            textAlign="left"
                                            autoCorrect={false}
                                            autoFocus={false}
                                            allowFontScaling={false}
                                            style={
                                                Platform.OS === "ios" ? iosInputStyle : inputStyle
                                            }
                                            maxLength={20}
                                            placeholder={SETTINGS_ENTER_NAME}
                                            value={favouriteNameText.substring(0, 20)}
                                            onChangeText={this._onFavouriteNameTextChange}
                                            returnKeyType="done"
                                        />
                                    </View>

                                    <View style={Styles.formBodyContainer}>
                                        {this.renderDetails()}
                                    </View>
                                </View>
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

export default withModelContext(OverseasAddToFavourites);
