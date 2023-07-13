import React, { Component } from "react";
import ReactNative, { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";

import { PAYBILLS_ENTER_AMOUNT, PAYBILLS_MODULE } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { logEvent } from "@services/analytics";

import { YELLOW, MEDIUM_GREY, LIGHT_YELLOW, BLACK, LIGHT_BLACK } from "@constants/colors";
import {
    CONTINUE,
    FA_PAY_BILLERS_RECIPIENT_INFO,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
} from "@constants/strings";

import { getShadow } from "@utils/dataModel/utility";
import { removeSpecialChar } from "@utils/dataModel/utility";
import { openNativeContactPicker } from "@utils/dataModel/utility";

import images from "@assets";

("use strict");

class PayBillsPayeeDetails extends Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        super(props);
        console.log(props.route.params);
        let requiredFields = props.route.params.requiredFields.map((item) => {
            item.isValid = true;
            item.isValidate = false;
            item.errorMessage = "";
            return item;
        });

        this.state = {
            requiredFields: requiredFields ? requiredFields : [],
            billerName: props.route.params?.billerInfo.fullName
                ? props.route.params?.billerInfo.fullName
                : props.route.params?.billerInfo.shortName,
            billerSubName: props.route.params?.billerInfo.subName,
            image: props.route.params?.billerInfo.imageUrl,
            lengthError: false,
            doneBtnEnabled: false,
            // doneBtnEnabled: !requiredFields?.length,
        };
    }

    componentDidMount() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_PAY_BILLERS_RECIPIENT_INFO,
        });
        this.focusSubscription = this.props.navigation.addListener("focus", () => {});
        this.blurSubscription = this.props.navigation.addListener("blur", () => {});
        if (this.state.billerName === "MaybankHeart") {
            // go to next screen
            this.props.navigation.navigate(PAYBILLS_MODULE, {
                screen: PAYBILLS_ENTER_AMOUNT,
                params: this.prepareNavParams(),
            });
        }
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    // -----------------------
    // EVENT HANDLER
    // -----------------------
    doneClick = () => {
        const isValid = this.getRequiredFieldValidation();
        if (!isValid) {
            return;
        }

        this.props.navigation.navigate(PAYBILLS_MODULE, {
            screen: PAYBILLS_ENTER_AMOUNT,
            params: this.prepareNavParams(),
        });
    };

    changeText = (item, index, text) => {
        item.fieldValue = text.replace(/[^0-9 a-z A-Z .\-(),:_/]/g, "");
        // item.fieldValue = removeSpecialChar(text);

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

    getRequiredField = (requiredFields) => {
        return requiredFields.map((item, index) => {
            const label = item.fieldLabel ? item.fieldLabel : item.alternateLabel; //"Bill Account Number";
            const isMobile = label.toLowerCase().indexOf("mobile") > -1;
            const prefix = isMobile ? "+60" : null;
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
                                // style={[{ color: "rgb(158,158,158)" }]}
                                testID={"paymentDetail"}
                                accessibilityLabel={"paymentDetail"}
                                onChangeText={(text) => this.changeText(item, index, text)}
                                value={item.fieldValue}
                                autoFocus={
                                    index == 0 && this.state.billerName !== "MaybankHeart"
                                        ? true
                                        : false
                                }
                                onFocus={(event) => {
                                    this.scrollToInput(ReactNative.findNodeHandle(event.target));
                                }}
                                errorMessage={item.errorMessage}
                                isValid={item.isValid}
                                isValidate={item.isValidate}
                                prefix={prefix}
                                maxLength={index === 0 ? 30 : 20}
                                keyboardType={"ascii-capable"}
                            />
                            {isMobile && (
                                <TouchableOpacity
                                    style={Styles.contactIconContainer}
                                    onPress={() => this.selectContact(index)}
                                >
                                    <Image
                                        style={Styles.contactIcon}
                                        source={images.icContactList}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            );
        });
    };

    // -----------------------
    // OTHERS
    // -----------------------

    prepareNavParams = () => {
        let navParam = this.props.route.params;
        navParam.requiredFields = [...this.state.requiredFields];
        // no need this info for next screeb

        navParam.requiredFields = navParam.requiredFields.map((item) => {
            //
            const label = item.fieldLabel ? item.fieldLabel : item.alternateLabel; //"Bill Account Number";
            const isMobile = label.toLowerCase().indexOf("mobile") > -1;
            if (isMobile) {
                item.fieldValue = `60${item.fieldValue.replace(/[^A-Z0-9]/gi, "")}`; //item.fieldValue.replace(/[^A-Z0-9]/gi, "")
            }
            delete item.isValid;
            delete item.isValidate;
            delete item.errorMessage;
            return item;
        });

        return navParam;
    };

    scrollToInput = (reactNode) => {
        // Add a 'scroll' ref to your ScrollView
        // this.scroll.props.scrollToFocusedInput(reactNode);
    };

    getRequiredFieldValidation = () => {
        let isValid = true;
        let updatedRequiredFields = this.state.requiredFields.map((item) => {
            // reset
            item.isValid = true;
            item.isValidate = true;
            item.errorMessage = "";
            if (item.fieldValue.length < 3) {
                item.isValid = false;
                item.isValidate = true;
                item.errorMessage = "Please enter valid payment details";
                isValid = false;
            }

            return item;
        });

        this.setState({ requiredFields: updatedRequiredFields });
        return isValid;
    };

    isAllRequirdFieldFillup = () => {
        let isAllFillUp = true;
        this.state.requiredFields.forEach((item) => {
            if (item.fieldValue === "" || item.fieldValue === null) {
                isAllFillUp = false;
            }
        });

        return isAllFillUp;
    };

    selectContact = (itemIndex) => {
        let requiredFields = this.state.requiredFields;
        let item = requiredFields[itemIndex];
        openNativeContactPicker()
            .then((result) => {
                let phoneNumber = result.phoneNumber;
                let strCheck = phoneNumber.substring(0, 3);
                if (strCheck === "+60") {
                    phoneNumber = phoneNumber.substring(3);
                } else {
                    strCheck = phoneNumber.substring(0, 2);
                    if (strCheck === "60") {
                        phoneNumber = phoneNumber.substring(2);
                    } else {
                        strCheck = phoneNumber.substring(0, 1);
                        if (strCheck === "0") {
                            phoneNumber = phoneNumber.substring(1);
                        }
                    }
                }

                phoneNumber = phoneNumber.replace(/[^A-Z0-9]/gi, "");
                phoneNumber = `${phoneNumber.substring(0, 2)} ${phoneNumber.substring(
                    2,
                    6
                )} ${phoneNumber.substring(6)}`;

                item.fieldValue = phoneNumber;
                requiredFields[itemIndex] = item;
                this.setState({
                    requiredFields: requiredFields,
                    doneBtnEnabled: this.isAllRequirdFieldFillup(),
                });
                this.getRequiredFieldValidation();
            })
            .catch((err) => {
                item.errorMessage = err.message;
                item.isValid = false;
                item.isValidate = true;
                requiredFields[itemIndex] = item;
                this.setState({
                    requiredFields: requiredFields,
                });
            });
    };

    // KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null}
    render() {
        let image = {
            type: "url",
            source: this.state.image,
        };

        const { billerName, billerSubName } = this.state;

        let requiredFields = this.state.requiredFields;

        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout header={this.getHeaderUI()} paddingTop={24}>
                    <View style={Styles.container}>
                        <ScrollView style={Styles.scrollView}>
                            <View style={Styles.billerInfo}>
                                <TransferImageAndDetails
                                    title={billerName}
                                    subtitle={billerSubName}
                                    image={image}
                                ></TransferImageAndDetails>
                            </View>
                            <View style={Styles.requiredFieldsContainer}>
                                {this.getRequiredField(requiredFields)}
                            </View>
                        </ScrollView>
                        <View style={Styles.footerContainer}>
                            <ActionButton
                                height={48}
                                fullWidth
                                backgroundColor={this.state.doneBtnEnabled ? YELLOW : LIGHT_YELLOW}
                                borderRadius={24}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        text={CONTINUE}
                                        color={this.state.doneBtnEnabled ? BLACK : LIGHT_BLACK}
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

export default PayBillsPayeeDetails;

const Styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
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
    requiredField: {},
    requiredFieldsContainer: {
        width: "100%",
        paddingTop: 26,
    },
    titleContainer: {
        // borderWidth: 1, borderColor: "#ff0000"
    },
    inputContainer: { flexDirection: "row", paddingBottom: 36 },
    inputContainerWithError: { flexDirection: "row", paddingBottom: 0 },
    contactIconContainer: {
        position: "absolute",
        right: 0,
        width: 20,
        height: 22,
    },
    contactIcon: {
        width: "100%",
        height: "100%",
    },

    billerInfo: {
        width: "100%",
        flexDirection: "row",
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
