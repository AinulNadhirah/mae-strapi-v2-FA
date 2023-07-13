import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, Keyboard, ScrollView } from "react-native";

import { REQUEST_TO_PAY_CONFIRMATION_SCREEN } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { AccountDetailsView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typography from "@components/Text";
import TextInput from "@components/TextInput";

import { withModelContext } from "@context";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import {
    TRANSFER_REFERENCE_ERROR,
    PLEASE_INPUT_VALID_RECIPIENT_REFERENCE,
    REQUEST_TO_PAY,
    ENTER_RECIPIENT_REFERENCE,
    CONTINUE,
    RTP_AUTODEBIT,
    PLEASE_REMOVE_INVALID_RECIPIENT_REFERENCE,
    DUINTNOW_IMAGE,
} from "@constants/strings";

import { referenceRegex } from "@utils/dataModel";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";

import Assets from "@assets";

class RequestToPayReference extends Component {
    static navigationOptions = { title: "", header: null };
    static propTypes = {
        navigation: PropTypes.object,
        route: PropTypes.object,
    };

    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
        this.state = {
            referenceText: "",
            showLocalError: false,
            showLocalErrorMessage: "",
            screenData: {
                image: {
                    image: DUINTNOW_IMAGE,
                    imageName: DUINTNOW_IMAGE,
                    imageUrl: DUINTNOW_IMAGE,
                    shortName: "",
                    type: true,
                },
                name: "",
                description1: "",
                description2: "",
            },
            image: "",
        };
        this.forwardItem = this.props.route.params?.forwardItem;
    }

    /***
     * componentDidMount
     * Update Screen data
     */
    componentDidMount() {
        this._updateDataInScreen();
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            this._updateDataInScreenAlways();
        });
    }

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {
        this.focusSubscription();
    }

    /***
     * _updateDataInScreen
     * Handle one time screen load
     */
    _updateDataInScreen = async () => {
        const transferParams = this.props.route.params?.transferParams ?? this.state.screenData;
        const screenData = {
            image: {
                image: "icDuitNowCircle",
                imageName: "icDuitNowCircle",
                imageUrl: "icDuitNowCircle",
                shortName: transferParams?.accountName,
            },
            imageName: DUINTNOW_IMAGE,
            imageUrl: DUINTNOW_IMAGE,
            shortName: transferParams?.accountName,
            name: transferParams?.idValueFormatted,
            description1: transferParams?.accHolderName,
            description2: transferParams?.idTypeText,

            // transferParams.actualAccHolderName = responseObject.actualAccHolderName;
            //             transferParams.accountHolderName = responseObject.accountHolderName;
        };
        this.setState({
            // secure2uValidateData: secure2uValidateData,
            image: Assets.icDuitNowCircle,
            screenData,
            referenceText:
                transferParams && transferParams.reference ? transferParams.reference : "",
        });
    };

    /**
     *_updateDataInScreenAlways
     * update Data In Screen Always
     */
    _updateDataInScreenAlways = () => {
        // const transferParams = this.props.route.params?.transferParams;
        // console.log(
        //     "[RequestToPayReference] >> [_updateDataInScreenAlways]---- : ",
        //     transferParams.reference
        // );
        // this.setState({
        //     referenceText: transferParams?.reference ?? "gagagaa",
        // });
    };

    /**
     *_onTextChange
     * On Reference Text change update state
     */
    _onTextChange = (text) => {
        this.setState({ referenceText: text });
    };

    /**
     *_onTextDone
     * On Reference Text on click handle next event
     */
    _onTextDone = (text) => {
        Keyboard.dismiss();
        this._proceedToNextScreen();
    };

    /**
     *_onMoveNext
     *
     */
    _onMoveNext = () => {
        Keyboard.dismiss();
    };

    /***
     * _proceedToNextScreen
     * _on Next click validate the input and move to next screen
     */
    _proceedToNextScreen = async () => {
        Keyboard.dismiss();
        const lengthCheck = this.state.referenceText.replace(/\s/g, "");
        const validate = referenceRegex(this.state.referenceText);
        // const referenceEdit = this.props.route.params?.referenceEdit ?? false;
        // const { transferFlow } = this.state;
        // const { secure2uValidateData } = this.state;
        if (lengthCheck.length <= 0) {
            this.setState({
                showLocalErrorMessage: TRANSFER_REFERENCE_ERROR,
                showLocalError: true,
            });
        } else if (lengthCheck.length <= 2) {
            this.setState({
                showLocalErrorMessage: PLEASE_INPUT_VALID_RECIPIENT_REFERENCE,
                showLocalError: true,
            });
        } else if (
            !validate ||
            (this.state.referenceText && this.state.referenceText.indexOf("@") !== -1)
        ) {
            this.setState({
                showLocalErrorMessage:
                    this.state.referenceText?.length && !validate
                        ? PLEASE_REMOVE_INVALID_RECIPIENT_REFERENCE
                        : PLEASE_INPUT_VALID_RECIPIENT_REFERENCE,
                showLocalError: true,
            });
        } else {
            this.setState({ showLocalError: false });

            const transferParams = this.props.route.params?.transferParams;

            transferParams.transferRefText = this.state.referenceText;
            transferParams.reference = this.state.referenceText;
            // Note: RTP initiators can edit amount by default, apart from incoming request with `amountEditable` flag
            transferParams.amountEditable = true;

            this.props.navigation.navigate(REQUEST_TO_PAY_CONFIRMATION_SCREEN, {
                senderBrn: this.props.route.params?.senderBrn,
                rtpType: this.props.route.params?.rtpType,
                soleProp: this.props.route.params?.soleProp,
                isRtpEnabled: this.props.route.params?.isRtpEnabled,
                isRtdEnabled: this.props.route.params?.isRtdEnabled,
                sourceFunds: this.props.route.params?.sourceFunds,
                productId: this.props.route.params?.productId,
                merchantId: this.props.route.params?.merchantId,
                transferParams,
                forwardItem: this.forwardItem,
                screenDate: this.props.route.params?.screenDate,
                autoDebitParams: {
                    reference: this.state.referenceText,
                },
            });
        }
    };

    /***
     * _onBackPress
     * On Back button click handler
     */
    _onBackPress = () => {
        this.props.navigation.goBack();
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
                analyticScreenName={"DuitNowRequest_RecipientReference"}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typography
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={REQUEST_TO_PAY}
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
                        <View style={Styles.containerDuitScreen}>
                            <ScrollView keyboardShouldPersistTaps="always">
                                <View style={Styles.block}>
                                    <View style={Styles.titleContainerTransferNew1}>
                                        <AccountDetailsView
                                            data={this.state.screenData}
                                            base64={true}
                                            image={this.state.image}
                                        />
                                    </View>

                                    <View style={Styles.descriptionContainerAmount}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={19}
                                            color={BLACK}
                                            textAlign="left"
                                            text={ENTER_RECIPIENT_REFERENCE}
                                        />
                                    </View>

                                    <View style={Styles.amountViewTransfer}>
                                        <TextInput
                                            maxLength={20}
                                            accessibilityLabel="inputReference"
                                            isValidate={this.state.showLocalError}
                                            errorMessage={this.state.showLocalErrorMessage}
                                            onSubmitEditing={this._onTextDone}
                                            value={this.state.referenceText}
                                            onChangeText={this._onTextChange}
                                            clearButtonMode="while-editing"
                                            returnKeyType="done"
                                            autoFocus
                                            editable
                                        />
                                    </View>
                                </View>
                            </ScrollView>
                        </View>
                        <View style={styles.footerButton}>
                            <ActionButton
                                disabled={this.state.referenceText.length < 3}
                                fullWidth
                                borderRadius={25}
                                onPress={this._proceedToNextScreen}
                                backgroundColor={
                                    this.state.referenceText.length < 3 ? DISABLED : YELLOW
                                }
                                componentCenter={
                                    <Typography
                                        color={
                                            this.state.referenceText.length < 3
                                                ? DISABLED_TEXT
                                                : BLACK
                                        }
                                        text={CONTINUE}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                        </View>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}
const styles = StyleSheet.create({
    footerButton: { marginBottom: 36, paddingHorizontal: 36, width: "100%" },
});
export default withModelContext(RequestToPayReference);
