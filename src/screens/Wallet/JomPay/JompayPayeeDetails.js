import React, { Component } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast, showInfoToast } from "@components/Toast";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { withModelContext } from "@context";

import { logEvent } from "@services/analytics";
import { inquiryJompay, inquiryJompayQr } from "@services/index";

import { YELLOW, MEDIUM_GREY, BLACK } from "@constants/colors";
import {
    CONTINUE,
    FA_PAY_JOMPAY_RECIPIENT_INFO,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    JOMPAY,
    SECURE2U_IS_DOWN,
    FA_SCANPAY_JOMPAY_RECIPTAMT,
} from "@constants/strings";

import {
    checks2UFlow,
    getShadow,
    removeSpecialChar,
    addSlashesForBreakableSpecialCharacter,
} from "@utils/dataModel/utility";

import Assets from "@assets";

("use strict");

class JompayPayeeDetails extends Component {
    static navigationOptions = { title: "", header: null };

    // createRequiredFieldObj

    constructor(props) {
        super(props);
        console.log("JompayPayeeDetails:", props.route.params);
        const { billerCode, billRef1, billRef2 } = props.route.params.billerInfo;
        this.state = {
            requiredFields: [
                this.createRequiredFieldObj("Biller Code", "billerCode", billerCode),
                this.createRequiredFieldObj("Reference 1", "billRef1", billRef1),
                this.createRequiredFieldObj("Reference 2 (Optional)", "billRef2", billRef2, true),
            ],
            doneBtnEnabled:
                props.route.params.isFav || (props.route.params.isJomPayQR && billRef1 !== ""),
        };
    }

    componentDidMount() {
        // this.focusSubscription = this.props.navigation.addListener("focus", () => {});
        // this.blurSubscription = this.props.navigation.addListener("blur", () => {});
        const isJomPayQR = this.props.route?.params?.extraInfo?.isJomPayQR;
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: isJomPayQR
                ? FA_SCANPAY_JOMPAY_RECIPTAMT
                : FA_PAY_JOMPAY_RECIPIENT_INFO,
        });

        if (this.firstTextField) {
            setTimeout(() => {
                this.firstTextField.focus();
            }, 500);
        }
    }

    componentWillUnmount() {
        // this.focusSubscription();
        // this.blurSubscription();
    }

    // -----------------------
    // EVENT HANDLER
    // -----------------------
    doneClick = async () => {
        console.log("doneClick");
        const isValid = this.getRequiredFieldValidation();

        if (!isValid) {
            return;
        }
        let billRef2 = this.state.requiredFields[2].fieldValue;
        if (billRef2) {
            billRef2 = addSlashesForBreakableSpecialCharacter(billRef2);
        }

        try {
            const params = {
                amount: "0.01",
                billRef1: this.state.requiredFields[1].fieldValue,
                billRef2: billRef2,
                billerCode: this.state.requiredFields[0].fieldValue,
                fromAccountTypeInd: "D", //transferInfo.accountType,
            };

            const result = this.props.route.params?.isJomPayQR
                ? await inquiryJompayQr(params)
                : await inquiryJompay(params);

            console.log("=====inquiry success:", result);
            this.billerInfo = result?.data;

            console.log("result", result?.data);

            // if (this.props.route.params?.isJomPayQR) {
            //     this.handleQRFlow(result);
            // }
            this.props.navigation.navigate(navigationConstant.JOMPAY_MODULE, {
                screen: navigationConstant.JOMPAY_ENTER_AMOUNT,
                params: this.prepareNavParams(),
            });

            // we ignore it because areal mount value will be enter on "enteramuntscreen"
        } catch (err) {
            console.log("=====inquiry error:", err.error.code);
            if (err.error.code != 20007) {
                // this.setState({ showErrorModal: true, errorTitle: "Maya", errorMessage: err.message });
                // StateManager.updateErrorMessages([err.message]); //error.message
                this.showErrorMsg(err.message);
            } else {
                this.props.navigation.navigate(navigationConstant.JOMPAY_MODULE, {
                    screen: navigationConstant.JOMPAY_ENTER_AMOUNT,
                    params: this.prepareNavParams(),
                });
            }
        }
    };

    changeText = (item, index, text) => {
        if (item.optional) {
            item.fieldValue = text.replace(
                /[^0-9 a-z A-Z \^\/\-\[\\\]{}|"';:.>,<?~!@#$%&*()_+=`]/g,
                ""
            );
        } else {
            item.fieldValue = removeSpecialChar(text);
        }

        let requiredFields = this.state.requiredFields;
        requiredFields[index] = item;
        this.setState({
            requiredFields: requiredFields,
            doneBtnEnabled: this.isAllRequirdFieldFillup(),
        });
    };

    onBackPress = () => {
        this.props.navigation.goBack();
    };

    handleQRFlow = async (respone) => {
        console.log("handleQRFlow: ", respone?.data);
        const { isFav, isJomPayQR } = this.props.route.params?.extraInfo;
        if (respone?.data?.statusCode === "0000") {
            // for now is let, change to const after s2u support for Jompay is ready
            //passing new paramerter updateModel for s2u interops
            const { flow, secure2uValidateData } = await checks2UFlow(
                17,
                this.props.getModel,
                this.props.updateModel
            );

            // Following code is disable, because jompay not support s2u at the moment
            if (!secure2uValidateData.s2u_enabled && !isFav) {
                showInfoToast({ message: SECURE2U_IS_DOWN });
            }

            const nextParam = this.prepareNavParams();
            nextParam.extraInfo = {
                ...nextParam,
                extraInfo: { ...nextParam.extraInfo, secure2uValidateData, flow },
            };
            nextParam.billerInfo = respone?.data;
            const {
                navigation: { navigate },
            } = this.props;
            if (flow === navigationConstant.SECURE2U_COOLING && !isFav) {
                navigateToS2UCooling(navigate);
            } else if (flow === "S2UReg" && !isFav) {
                navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                    screen: "Activate",
                    params: {
                        flowParams: {
                            success: {
                                stack: navigationConstant.JOMPAY_MODULE,
                                screen: navigationConstant.JOMPAY_CONFIRMATION_SCREEN,
                            },
                            fail: {
                                stack: isJomPayQR
                                    ? navigationConstant.QR_STACK
                                    : navigationConstant.PAYBILLS_MODULE,
                                screen: isJomPayQR
                                    ? navigationConstant.QRPAY_MAIN
                                    : navigationConstant.PAYBILLS_LANDING_SCREEN,
                            },

                            params: { ...nextParam, isFromS2uReg: true },
                        },
                    },
                });
            } else {
                navigate(navigationConstant.JOMPAY_MODULE, {
                    screen: navigationConstant.JOMPAY_CONFIRMATION_SCREEN,
                    params: { ...nextParam },
                });
            }
        }
    };

    // -----------------------
    // GET UI
    // -----------------------

    getHeaderUI = () => {
        return (
            <HeaderLayout
                horizontalPaddingMode="custom"
                horizontalPaddingCustomLeftValue={24}
                horizontalPaddingCustomRightValue={24}
                headerLeftElement={<HeaderBackButton onPress={this.onBackPress} />}
                headerCenterElement={
                    <HeaderLabel>
                        <Text>Pay Bills</Text>
                    </HeaderLabel>
                }
            />
        );
    };

    // getNormalIcon = iconImage => {
    // 	return <Image style={Styles.normalIconImg} source={iconImage} resizeMode="center" />;
    // };

    // getAlphabetIcon = title => {
    // 	return (
    // 		<View style={Styles.alphabetIconContainer}>
    // 			<Text
    // 				style={[Styles.shortNameLabelBlack]}
    // 				accessible={true}
    // 				testID={"txtByClickingNext"}
    // 				accessibilityLabel={"txtByClickingNext"}
    // 			>
    // 				{getShortNameTransfer(title)}
    // 			</Text>
    // 		</View>
    // 	);
    // };

    getRequiredField = (requiredFields) => {
        return requiredFields.map((item, index) => {
            const label = item.fieldLabel;
            return (
                <View key={index} style={Styles.requiredField}>
                    <View style={Styles.titleContainer}>
                        <Typo
                            fontSize={14}
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={19}
                            color={BLACK}
                            textAlign="left"
                            text={label}
                        />
                    </View>
                    <View>
                        <View
                            style={
                                item.isValid
                                    ? Styles.inputContainer
                                    : Styles.inputContainerWithError
                            }
                        >
                            <TextInput
                                //placeholder={item.fieldName === "bilAcct" ? "Payment Detail" : label} // maya-2395
                                // style={[{ color: BLACK }]}
                                testID={"paymentDetail"}
                                accessibilityLabel={"paymentDetail"}
                                onChangeText={(text) => this.changeText(item, index, text)}
                                value={item.fieldValue}
                                // inputRef={(ref) => {
                                //     if (index == 0) {
                                //         this.firstTextField = ref;
                                //     }
                                // }}
                                // onFocus={(event) => {
                                //     this.scrollToInput(ReactNative.findNodeHandle(event.target));
                                // }}
                                errorMessage={item.errorMessage}
                                isValid={item.isValid}
                                isValidate={item.isValidate}
                                maxLength={index === 0 ? 8 : 20}
                                keyboardType={"ascii-capable"}
                            />
                        </View>
                    </View>
                </View>
            );
        });
    };

    // -----------------------
    // OTHERS
    // -----------------------

    createRequiredFieldObj(fieldLabel, fieldName, value, optional = false) {
        return {
            fieldLabel: fieldLabel,
            fieldValue: value,
            fieldName: fieldName,
            optional: optional,
            isValid: true,
            isValidate: false,
            errorMessage: "",
        };
    }

    prepareNavParams = () => {
        return {
            extraInfo: {
                billerCode: this.state.requiredFields[0].fieldValue, //8938
                billRef1: this.state.requiredFields[1].fieldValue, //568964
                billRef2: this.state.requiredFields[2].fieldValue, //123456
                isFav: this.props.route.params.isFav,
                isJomPayQR: this.props.route.params?.isJomPayQR,
                effectiveDateType: "today", //'today/recurring/schedule'
                amount: this.props.route.params?.isJomPayQR
                    ? this.props.route.params?.billerInfo?.amount
                    : "0.00",
                secure2uValidateData: {},
                prevSelectedAccount: this.props.route.params.prevSelectedAccount,
                fromModule: this.props.route.params.fromModule,
                fromScreen: this.props.route.params.fromScreen,
                onGoBack: this.props.route.params.onGoBack,
            },
            billerInfo: null,
            selectedAccount: { accountType: "" },
        };
    };

    scrollToInput = (reactNode) => {
        // Add a 'scroll' ref to your ScrollView
        // this.scroll.props.scrollToFocusedInput(reactNode);
    };

    getRequiredFieldValidation = () => {
        let isValid = true;
        let updatedRequiredFields = this.state.requiredFields.map((item) => {
            console.log("item", item);
            // reset
            item.isValid = true;
            item.isValidate = true;
            item.errorMessage = "";

            if (!item.optional) {
                console.log("item-----", item);
                if (item.fieldValue.length < 3) {
                    item.isValid = false;
                    item.isValidate = true;
                    item.errorMessage = "Please enter valid payment details";
                    isValid = false;
                }
            }

            return item;
        });

        this.setState({ requiredFields: updatedRequiredFields });
        console.log("isValid", isValid);
        return isValid;
    };

    isAllRequirdFieldFillup = () => {
        let isAllFillUp = true;
        this.state.requiredFields.forEach((item) => {
            if (!item.optional) {
                if (item.fieldValue === "" || item.fieldValue === null) {
                    isAllFillUp = false;
                }
            }
        });

        return isAllFillUp;
    };

    showErrorMsg = (msg) => {
        showErrorToast({
            message: msg,
        });
    };

    // KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null}
    render() {
        let requiredFields = this.state.requiredFields;
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout header={this.getHeaderUI()} paddingTop={24}>
                    <View style={Styles.container}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS == "ios" ? "padding" : ""}
                            style={Styles.KeyboardAvoidingViewStyle}
                            keyboardVerticalOffset={150}
                            enabled
                        >
                            <ScrollView style={Styles.scrollView}>
                                <TransferImageAndDetails
                                    title={JOMPAY}
                                    image={{ type: "local", source: Assets.jompayLogo }}
                                ></TransferImageAndDetails>
                                <View style={Styles.requiredFieldsContainer}>
                                    {this.getRequiredField(requiredFields)}
                                </View>
                            </ScrollView>
                        </KeyboardAvoidingView>
                        <View style={Styles.footerContainer}>
                            <ActionButton
                                height={48}
                                fullWidth
                                backgroundColor={this.state.doneBtnEnabled ? YELLOW : "#ffde0070"}
                                borderRadius={24}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        text={CONTINUE}
                                        color={this.state.doneBtnEnabled ? "#000000" : "#00000070"}
                                    />
                                }
                                onPress={this.doneClick}
                                disabled={!this.state.doneBtnEnabled}
                            />
                        </View>
                    </View>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

export default withModelContext(JompayPayeeDetails);

const Styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
    },
    KeyboardAvoidingViewStyle: {
        flex: 1,
        flexDirection: "column",
        width: "100%",
    },
    scrollView: {
        flex: 1,
    },
    footerContainer: {
        width: "100%",
        flexDirection: "column",
        justifyContent: "flex-end",
        paddingTop: 20,
    },
    requiredField: {
        // borderWidth: 1,
        // borderColor: "#ff9900"
    },
    requiredFieldsContainer: {
        width: "100%",
        paddingTop: 26,
        // borderWidth: 1,
        // borderColor: "#000000"
    },
    titleContainer: {
        // borderWidth: 1, borderColor: "#ff0000"
    },
    inputContainer: { flexDirection: "row", paddingBottom: 36 },
    inputContainerWithError: { flexDirection: "row", paddingBottom: 0 },

    billerInfo: {
        width: "100%",
        flexDirection: "row",
        marginTop: 16,
    },
    circleImageView: {
        width: 64,
        height: 64,
        borderRadius: 64 / 2,
        borderWidth: 2,
        borderColor: "#ffffff",
        backgroundColor: "#ffffff",
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",

        ...getShadow({
            // color: "#000000",
            // height: 4, // IOS
            // width: 1, // IOS
            // shadowOpacity: 0.08, // IOS
            // shadowRadius: 2, // IOS
            elevation: 2, // android
        }),
    },
    billerInfoText: {
        flex: 1,
        marginLeft: 16,
        justifyContent: "center",
        flexDirection: "column",
    },
};
