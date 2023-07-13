import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, Keyboard, ScrollView } from "react-native";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    ONE_TAP_AUTH_MODULE,
    FUNDTRANSFER_MODULE,
    TRANSFER_CONFIRMATION_SCREEN,
    DUITNOW_ENTER_AMOUNT,
    TAB_NAVIGATOR,
    BANKINGV2_MODULE,
    ACCOUNT_DETAILS_SCREEN,
    SECURE2U_COOLING,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { AccountDetailsView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { withModelContext } from "@context";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import {
    TRANSFER_REFERENCE_ERROR,
    PLEASE_INPUT_VALID_RECIPIENT_REFERENCE,
    DUITNOW,
    ENTER_RECIPIENT_REFERENCE,
    CONTINUE,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FAV_MAYBANK_DUITNOW,
} from "@constants/strings";

import { referenceRegexOtherBank } from "@utils/dataModel";
import { checks2UFlow } from "@utils/dataModel/utility";
import { S2UFlowEnum } from "@utils/dataModel/utilityEnum";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";

("use strict");
const SCREEN_NAME = "Transfer_DuitNow_RecipientReference";

class DuitNowReference extends Component {
    static navigationOptions = { title: "", header: null };

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
            secure2uValidateData: {},
            screenData: {
                image: {
                    image: "icDuitNowCircle.png",
                    imageName: "icDuitNowCircle.png",
                    imageUrl: "icDuitNowCircle.png",
                    shortName: "",
                    type: true,
                },
                name: "",
                description1: "",
                description2: "",
            },
            transferParams: {},
            transferFlow: 12,

            // Festive Campaign related
            festiveFlag: false,
            festiveImage: {},
        };
    }

    /***
     * componentDidMount
     * Update Screen data
     */
    componentDidMount() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: SCREEN_NAME,
        });
        console.log("[DuitNowReference] >> [componentDidMount] : ");
        this._updateDataInScreen();
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            console.log("[DuitNowReference] >> [componentDidMount] focusSubscription : ");
            this._updateDataInScreenAlways();
        });
    }

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {
        console.log("[DuitNowReference] >> [componentWillUnmount] : ");
        this.focusSubscription();
    }

    /***
     * _updateDataInScreen
     * Handle one time screen load
     */
    _updateDataInScreen = async () => {
        console.log("[DuitNowReference] >> [_updateDataInScreen] : ");

        const params = this.props?.route?.params ?? {};
        const festiveFlag = params?.festiveFlag ?? false;
        const festiveImage = params?.festiveObj?.backgroundImage ?? {};
        const transferParams = params?.transferParams ?? this.state.screenData;

        console.log(
            "[DuitNowReference] >> [_updateDataInScreen] transferParams : ",
            transferParams
        );
        const screenData = {
            image: transferParams.image,
            name: transferParams.idValueFormatted,
            description1: transferParams.accountName,
            description2: transferParams.idTypeText,
        };
        this.setState({ screenData });
        this.setState({
            // secure2uValidateData: secure2uValidateData,
            transferParams,
            transferFlow: transferParams.transferFlow,
            functionsCode: transferParams.functionsCode,
            screenData,
            referenceText:
                transferParams && transferParams.reference ? transferParams.reference : "",

            festiveFlag,
            festiveImage,
        });
    };

    /**
     *_updateDataInScreenAlways
     * update Data In Screen Always
     */
    _updateDataInScreenAlways = () => {
        console.log("[DuitNowReference] >> [_updateDataInScreenAlways] : ");
        const transferParams = this.props.route.params?.transferParams ?? this.state.screenData;
        this.setState({
            referenceText: transferParams.transferRefText ? transferParams.transferRefText : "",
        });
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
    _onTextDone = () => {
        console.log("[DuitNowReference] >> [_onTextDone] : ");
        Keyboard.dismiss();
        this._proceedToNextScreen();
    };

    /**
     *_onMoveNext
     *
     */
    _onMoveNext = () => {
        console.log("[DuitNowReference] >> [_onMoveNext] : ");
        Keyboard.dismiss();
    };

    /***
     * _proceedToNextScreen
     * _on Next click validate the input and move to next screen
     */
    _proceedToNextScreen = async () => {
        console.log("[DuitNowReference] >> [_proceedToNextScreen]");

        Keyboard.dismiss();

        const { festiveFlag } = this.state;
        const lengthCheck = this.state.referenceText.replace(/\s/g, "");
        const validate = referenceRegexOtherBank(this.state.referenceText);
        const referenceEdit = this.props.route.params?.referenceEdit ?? false;
        const festiveObj = this.props.route?.params?.festiveObj ?? {};

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
        } else if (!validate) {
            this.setState({
                showLocalErrorMessage: PLEASE_INPUT_VALID_RECIPIENT_REFERENCE,
                showLocalError: true,
            });
        } else {
            this.setState({ showLocalError: false });

            const transferParams = this.props.route.params?.transferParams ?? this.state.screenData;

            transferParams.transferRefText = this.state.referenceText;
            transferParams.reference = this.state.referenceText;
            console.log(
                "[DuitNowReference] >> [_proceedToNextScreen] transferParams : ",
                transferParams
            );
            this.setState({
                transferParams,
            });
            const stateData = {};
            const { getModel, updateModel } = this.props;
            const ota = getModel("ota");
            console.log("[DuitNowReference] >> [_proceedToNextScreen] ota ==> ", ota);
            // Fetch CASA accounts
            //const casaAccounts = await this.fetchAccountsList();
            stateData.transferParams = transferParams;
            // Check for S2u registration //passing new paramerter updateModel for s2u interops
            const { flow, secure2uValidateData, isUnderCoolDown } = await checks2UFlow(
                this.state.functionsCode,
                getModel,
                updateModel,
                parseInt(transferParams.tacIndicator) === 0 && FAV_MAYBANK_DUITNOW
            );
            stateData.flow = flow;
            stateData.secure2uValidateData = secure2uValidateData;
            console.log("[DuitNowReference] >> [_proceedToNextScreen] stateData ==> ", stateData);
            const { routeFrom } = transferParams;
            let stack = TAB_NAVIGATOR;
            let screen = "Tab";
            //get the origin screen
            const route = routeFrom || "Dashboard";
            console.log("[DuitNowReference] >> [_proceedToNextScreen] route ", routeFrom);
            if (route === "WalletMainDashboard") {
                stack = TAB_NAVIGATOR;
                screen = "Dashboard";
            } else if (route == "AccountDetails") {
                stack = BANKINGV2_MODULE;
                screen = ACCOUNT_DETAILS_SCREEN;
            }
            Keyboard.dismiss();
            const { transferFav, amount } = transferParams;
            const isFavAnd10KAbove =
                secure2uValidateData?.s2uFavTxnFlag === "Y" &&
                transferFav &&
                (parseFloat(amount.replace(/,/g, "")) >=
                    parseFloat(secure2uValidateData?.s2uFavTxnLimit) ??
                    10000);
            const {
                navigation: { navigate },
            } = this.props;
            if (flow === SECURE2U_COOLING || (isFavAnd10KAbove && isUnderCoolDown)) {
                navigateToS2UCooling(navigate);
            } else if (
                (flow === S2UFlowEnum.s2uReg && !referenceEdit) ||
                (isFavAnd10KAbove && secure2uValidateData?.pull === "NA")
            ) {
                stateData.flowType = flow;
                stateData.festiveFlag = festiveFlag;
                stateData.festiveObj = festiveObj;

                console.log(
                    "[DuitNowReference] >> [_proceedToNextScreen] stateData ==> ",
                    stateData
                );
                navigate(ONE_TAP_AUTH_MODULE, {
                    screen: "Activate",
                    params: {
                        flowParams: {
                            success: {
                                stack: FUNDTRANSFER_MODULE,
                                screen: TRANSFER_CONFIRMATION_SCREEN,
                            },
                            fail: {
                                stack,
                                screen,
                            },
                            params: { ...stateData, isFavAnd10KAbove },
                        },
                    },
                });
            } else {
                navigate(TRANSFER_CONFIRMATION_SCREEN, {
                    secure2uValidateData,
                    transferParams,
                    flow,
                    festiveFlag,
                    festiveObj,
                    isFavAnd10KAbove,
                });
            }
        }
    };

    /***
     * _onBackPress
     * On Back button click handler
     */
    _onBackPress = () => {
        console.log("[DuitNowReference] >> [_onBackPress] : ");
        const { transferParams } = this.state;
        console.log("[DuitNowReference] >> [_onBackPress] transferParams ==> ", transferParams);
        this.props.navigation.navigate(DUITNOW_ENTER_AMOUNT, {
            transferParams,
        });
    };

    render() {
        const { showErrorModal, errorMessage, festiveFlag, festiveImage } = this.state;
        return (
            <ScreenContainer
                backgroundType={festiveFlag ? "image" : "color"}
                backgroundImage={festiveFlag ? festiveImage : null}
                backgroundColor={MEDIUM_GREY}
                showErrorModal={showErrorModal}
                errorMessage={errorMessage}
                showOverlay={false}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={DUITNOW}
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
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={19}
                                            color="#000000"
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
                                            editable={true}
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
                                    <Typo
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

DuitNowReference.propTypes = {
    getModel: PropTypes.func,
    navigation: PropTypes.shape({
        addListener: PropTypes.func,
        navigate: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            festiveObj: PropTypes.object,
            referenceEdit: PropTypes.bool,
            transferParams: PropTypes.any,
        }),
    }),
    updateModel: PropTypes.any,
};

const styles = StyleSheet.create({
    footerButton: { marginBottom: 36, paddingHorizontal: 36, width: "100%" },
});

export default withModelContext(DuitNowReference);
