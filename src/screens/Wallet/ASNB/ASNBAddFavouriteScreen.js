import PropTypes from "prop-types";
import React from "react";
import { ScrollView, StyleSheet, Image, View } from "react-native";

import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";

import {
    ASNB_FAVOURITE_SCREEN,
    ASNB_ACK_SCREEN,
    FUNDTRANSFER_MODULE,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typography from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast, showSuccessToast } from "@components/Toast";
import TransactionConfirmationDetails from "@components/TransactionConfirmationDetails";

import { withModelContext } from "@context";

import { addFavouriteASNBAccount } from "@services";
import { logEvent } from "@services/analytics";

import { ROYAL_BLUE } from "@constants/colors";
import { M2U, S2U_PUSH, SMS_TAC, SUCCESS_CODE_ZERO } from "@constants/data";
import { FN_ASNB_ADD_FAV } from "@constants/fundConstants";
import {
    SETTINGS_ENTER_NAME,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FA_FORM_COMPLETE,
    FA_FORM_ERROR,
    ADD_FAVOURITE_SUCCESS,
    ADD_FAVOURITE_UNSUCCESS,
} from "@constants/strings";

import {
    handleS2UAcknowledgementScreen,
    init,
    initChallenge,
    s2uSdkLogs,
} from "@utils/dataModel/s2uSDKUtil";
import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

const SCREEN_NAME = "Add_Favourite";
class ASNBAddFavouriteScreen extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
        getModel: PropTypes.func.isRequired,
        updateModel: PropTypes.func.isRequired,
    };

    state = {
        nickname: "",
        isNicknameValid: true,
        nicknameTextInputErrorMessage: "-",
        showTACModal: false,
        tacTransferApiParams: null,
        //S2U V4
        showS2UModal: false,
        mapperData: {},
        nonTxnData: { isNonTxn: true },
        isS2UDown: false,
    };

    componentDidMount() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: SCREEN_NAME,
        });
        this._syncASNBTransferStateToScreenState();
    }

    _syncASNBTransferStateToScreenState = () =>
        this.setState({
            nickname: this.props.route.params.asnbTransferState.beneficiaryName,
        });

    _handleHeaderBackButtonPressed = () => this.props.navigation.goBack();

    _generateFavouriteDetails = () => {
        const {
            route: {
                params: {
                    asnbTransferState: {
                        productDetail,
                        relationshipDetail,
                        purposeOfTransferDetail,
                        idNumberValue,
                        membershipNumberValue,
                        beneficiaryName,
                    },
                },
            },
        } = this.props;
        return [
            { title: "Product name", value: productDetail.name },
            { title: "Member’s name", value: beneficiaryName },
            { title: "ID number for ASB member ", value: idNumberValue },
            { title: "Membership number", value: membershipNumberValue },
            { title: "Relationship", value: relationshipDetail.name },
            { title: "Purpose of transfer", value: purposeOfTransferDetail.name },
        ];
    };

    _handleNicknameUpdate = (updatedNickname) =>
        this.setState({ nickname: updatedNickname, isNicknameValid: true });

    _generateTransactionParams = () => {
        const {
            route: {
                params: {
                    asnbTransferState: {
                        productDetail,
                        idTypeDetail,
                        idNumberValue,
                        membershipNumberValue,
                    },
                },
            },
        } = this.props;
        return {
            tacLength: 6,
            idNo: idNumberValue,
            idType: idTypeDetail.value,
            membNo: membershipNumberValue,
            payeeCode: productDetail.payeeCode,
            beneName: this.state.nickname.trim(),
            twoFAType: "TAC",
        };
    };

    _handleNicknameConfirmation = () => {
        const { nickname } = this.state;
        if (!nickname) {
            this.setState({
                isNicknameValid: false,
                nicknameTextInputErrorMessage: "Name cant be empty.",
            });
            return;
        }
        this.initiateS2USdk();
    };

    //S2U V4
    s2uSDKInit = async () => {
        const { beneficiaryName, productDetail } = this.props.route.params.asnbTransferState;
        const transactionPayload = this._generateTransactionParams();
        delete transactionPayload.twoFAType;
        transactionPayload.tacLength = 0;
        transactionPayload.fullName = beneficiaryName;
        transactionPayload.productName = productDetail.name;
        return await init(FN_ASNB_ADD_FAV, transactionPayload);
    };

    //S2U V4
    initiateS2USdk = async () => {
        try {
            const s2uInitResponse = await this.s2uSDKInit();
            console.log("S2U SDK s2uInitResponse : ", s2uInitResponse);
            if (s2uInitResponse?.message || s2uInitResponse?.statusCode !== 0) {
                console.log("s2uInitResponse error : ", s2uInitResponse.message);
                this._handleTACFailedCall();
            } else {
                if (s2uInitResponse?.actionFlow === SMS_TAC) {
                    const { getModel } = this.props;
                    const { isS2uV4ToastFlag } = getModel("misc");
                    //Tac Flow
                    this.setState({
                        showTACModal: true,
                        tacTransferApiParams: this._generateTransactionParams(),
                        isS2UDown: isS2uV4ToastFlag ?? false,
                    });
                } else if (s2uInitResponse?.actionFlow === S2U_PUSH) {
                    if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) {
                        this.doS2uRegistration(this.props.navigation.navigate);
                    }
                } else {
                    //S2U Pull Flow
                    this.initS2UPull(s2uInitResponse);
                }
            }
        } catch (error) {
            console.log(error, "ASNB Add Fav");
            s2uSdkLogs(error, "ASNB Add Fav");
        }
    };
    //S2U V4
    initS2UPull = async (s2uInitResponse) => {
        const {
            navigation: { navigate },
        } = this.props;
        if (s2uInitResponse?.s2uRegistrationDetails?.isActive) {
            if (s2uInitResponse?.s2uRegistrationDetails?.isUnderCoolDown) {
                //S2U under cool down period
                navigateToS2UCooling(navigate);
            } else {
                const challengeRes = await initChallenge();
                console.log("initChallenge RN Response :: ", challengeRes);
                if (challengeRes?.mapperData) {
                    this.setState({
                        showS2UModal: true,
                        mapperData: challengeRes?.mapperData,
                    });
                } else {
                    this._handleTACFailedCall();
                }
            }
        } else {
            //Redirect user to S2U registration flow
            this.doS2uRegistration(navigate);
        }
    };

    doS2uRegistration = (navigate) => {
        const redirect = {
            succStack: FUNDTRANSFER_MODULE,
            succScreen: ASNB_FAVOURITE_SCREEN,
        };
        navigateToS2UReg(navigate, this.props.route.params, redirect);
    };

    //S2U V4
    onS2uDone = (response) => {
        // Close S2u popup
        this.onS2uClose();
        const { executePayload, transactionStatus } = response;
        const entryPoint = {
            entryStack: FUNDTRANSFER_MODULE,
            entryScreen: ASNB_ACK_SCREEN,
            params: {
                ...this.props.route.params,
            },
        };
        const ackDetails = {
            executePayload,
            transactionSuccess: transactionStatus,
            entryPoint,
            navigate: this.props.navigation.navigate,
        };
        if (executePayload?.executed) {
            const result = executePayload?.result;
            if (result?.statusCode === SUCCESS_CODE_ZERO) {
                ackDetails.transactionDetails = {
                    nickName: this.state.nickname,
                };
                ackDetails.titleMessage = ADD_FAVOURITE_SUCCESS;
            } else {
                ackDetails.titleMessage = ADD_FAVOURITE_UNSUCCESS;
            }
            ackDetails.transactionSuccess = result?.statusCode === SUCCESS_CODE_ZERO;
        }
        handleS2UAcknowledgementScreen(ackDetails);
    };

    //S2U V4
    onS2uClose = () => {
        this.setState({ showS2UModal: false });
    };

    _handleTACSuccessCall = (tacResponse) => {
        if (tacResponse?.result?.statusCode === SUCCESS_CODE_ZERO) {
            logEvent(FA_FORM_COMPLETE, {
                [FA_SCREEN_NAME]: SCREEN_NAME,
            });
            showSuccessToast({
                message: `${this.state.nickname} successfully added to Favourites`,
            });
            this.props.navigation.goBack();
        } else {
            logEvent(FA_FORM_ERROR, {
                [FA_SCREEN_NAME]: SCREEN_NAME,
            });
            this.setState({ showTACModal: false });
            showErrorToast({
                message: tacResponse?.result?.additionalStatusDescription || tacResponse?.message,
            });
        }
    };

    _handleTACFailedCall = () => {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: SCREEN_NAME,
        });
        this.setState({ showTACModal: false });
        showErrorToast({
            message: "Your request couldn't be completed at this time. Please try again.",
        });
    };

    _handleTACModalDismissal = () => this.setState({ showTACModal: false });

    render() {
        const {
            nickname,
            isNicknameValid,
            nicknameTextInputErrorMessage,
            showTACModal,
            tacTransferApiParams,
            isS2UDown,
        } = this.state;

        return (
            <ScreenContainer backgroundType="color">
                <>
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerLeftElement={
                                    <HeaderBackButton
                                        onPress={this._handleHeaderBackButtonPressed}
                                    />
                                }
                                headerCenterElement={
                                    <Typography
                                        text="Add as Favourites"
                                        fontSize={16}
                                        lineHeight={19}
                                        fontWeight="600"
                                    />
                                }
                            />
                        }
                        useSafeArea
                        neverForceInset={["bottom"]}
                        paddingHorizontal={0}
                        paddingTop={0}
                    >
                        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                            <View style={styles.logoContainer}>
                                <Image source={Assets.asnbLogo} styles={styles.logo} />
                            </View>
                            <SpaceFiller height={14} />
                            <TextInput
                                style={styles.textInput}
                                maxLength={20}
                                onChangeText={this._handleNicknameUpdate}
                                value={nickname.substring(0, 20)}
                                isValidate
                                isValid={isNicknameValid}
                                errorMessage={nicknameTextInputErrorMessage}
                                onSubmitEditing={this._handleNicknameConfirmation}
                                clearButtonMode="while-editing"
                                returnKeyType="done"
                                placeholder={SETTINGS_ENTER_NAME}
                            />
                            <SpaceFiller height={40} />
                            <TransactionConfirmationDetails
                                details={this._generateFavouriteDetails()}
                            />
                            {this.state.showS2UModal && (
                                <Secure2uAuthenticationModal
                                    token=""
                                    onS2UDone={this.onS2uDone}
                                    onS2uClose={this.onS2uClose}
                                    s2uPollingData={this.state.mapperData}
                                    transactionDetails={this.state.mapperData}
                                    secure2uValidateData={this.state.mapperData}
                                    nonTxnData={this.state.nonTxnData}
                                    s2uEnablement={true}
                                    navigation={this.props.navigation}
                                    extraParams={{
                                        metadata: {
                                            txnType: "ASNB_ADD_FAV",
                                        },
                                    }}
                                />
                            )}
                        </ScrollView>
                        <FixedActionContainer>
                            <ActionButton
                                onPress={this._handleNicknameConfirmation}
                                fullWidth
                                componentCenter={
                                    <Typography
                                        text="Add to Favourites"
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                    />
                                }
                            />
                        </FixedActionContainer>
                    </ScreenLayout>
                    {showTACModal && (
                        <TacModal
                            tacParams={this.props.route.params.addToFavouriteTACParams}
                            transferAPIParams={tacTransferApiParams}
                            transferApi={addFavouriteASNBAccount}
                            onTacSuccess={this._handleTACSuccessCall}
                            onTacError={this._handleTACFailedCall}
                            onTacClose={this._handleTACModalDismissal}
                            isS2UDown={isS2UDown}
                        />
                    )}
                </>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 36,
    },
    content: {
        justifyContent: "flex-start",
        paddingTop: 32,
    },
    logo: {
        borderRadius: 25,
        height: 50,
        width: 50,
    },
    logoContainer: {
        ...getShadow({}),
    },
    textInput: {
        color: ROYAL_BLUE,
        fontFamily: "montserrat",
        fontStyle: "normal",
        fontWeight: "bold",
        letterSpacing: 0,
        width: "100%",
    },
});

export default withModelContext(ASNBAddFavouriteScreen);
