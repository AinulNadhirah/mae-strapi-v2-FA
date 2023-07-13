import React, { Component } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Keyboard,
    Platform,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import LinearGradient from "react-native-linear-gradient";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { LongTextInput } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScrollPicker from "@components/Pickers/ScrollPicker";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { getMAEMasterData } from "@services";

import { YELLOW, DISABLED, BLACK, WHITE, DISABLED_TEXT, MEDIUM_GREY } from "@constants/colors";
import { FA_APPLY_MAE_ADDRESS } from "@constants/strings";

import * as DataModel from "@utils/dataModel";
import * as Utility from "@utils/dataModel/utility";

import Assets from "@assets";

class MAEOnboardDetails3 extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });
    constructor(props) {
        super(props);
        this.state = {
            filledUserDetails: props.route.params?.filledUserDetails,
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "Please Select",
            stateData: props.route.params?.filledUserDetails?.masterData?.stateData || [],
            stateCode: "",
            postcode: "",
            isNextDisabled: true,

            isValidAddress1: "",
            isValidAddress2: "",
            isValidCity: "",
            isValidPostcode: "",

            displayPicker: false,
        };
        console.log("MAEOnboardDetails3:state----------", this.state);
    }

    componentDidMount() {
        console.log("[MAEOnboardDetails3] >> [componentDidMount]");
        this.checkStateData();
        // const dummy = true;
        // if(dummy) {
        // 	this.setState({
        // 		addressLine1: "addr1",
        // 		addressLine2: "addr2",
        // 		city: "Kuala Lumpur",
        // 		postcode: "50050",
        // 		isNextDisabled: false,
        // 	});
        // }
    }

    checkStateData = () => {
        console.log("[MAEOnboardDetails3] >> [checkStateData]");

        if (this.state.stateData?.length == 0) {
            getMAEMasterData()
                .then((response) => {
                    console.log("[MAEOnboardDetails3][checkStateData] >> Success");
                    const result = response.data.result;
                    if (result) {
                        const { filledUserDetails } = this.state;
                        filledUserDetails.masterData = result;
                        this.setState({
                            stateData: this.scrollPickerData(result.stateData),
                            filledUserDetails,
                        });
                    }
                })
                .catch((error) => {
                    console.log("[MAEOnboardDetails3][checkStateData] >> Failure");
                    showErrorToast({
                        message: error.message,
                    });
                });
        } else {
            this.setState({ stateData: this.scrollPickerData(this.state.stateData) });
        }
    };

    onBackTap = () => {
        console.log("[MAEOnboardDetails3] >> [onBackTap]");
        this.props.navigation.goBack();
    };

    onCloseTap = () => {
        console.log("[MAEOnboardDetails3] >> [onCloseTap]");
        const { filledUserDetails } = this.state;
        this.props.navigation.navigate(filledUserDetails?.entryStack || "More", {
            screen: filledUserDetails?.entryScreen || "Apply",
            params: filledUserDetails?.entryParams,
        });
    };

    onContinueTap = () => {
        console.log("[MAEOnboardDetails3] >> [onContinueTap]");

        if (
            this.address1Validation() &&
            this.address2Validation() &&
            this.cityValidation() &&
            this.stateValidation &&
            this.postcodeValidation()
        ) {
            const filledUserDetails = this.prepareUserDetails();
            this.props.navigation.navigate(navigationConstant.MAE_ONBOARD_EMPLOYMENT_DETAILS, {
                filledUserDetails,
            });
        }
    };

    prepareUserDetails = () => {
        console.log("MAEOnboardDetails3 >> [prepareUserDetails]");
        const onBoardDetails3 = {
            addressLine1: this.state.addressLine1,
            addressLine2: this.state.addressLine2,
            city: this.state.city,
            state: this.state.state,
            postcode: this.state.postcode,
            stateCode: this.state.stateCode,
        };
        let MAEUserDetails = this.state.filledUserDetails || {};
        MAEUserDetails.onBoardDetails3 = onBoardDetails3;

        return MAEUserDetails;
    };

    address1Validation = () => {
        console.log("[MAEOnboardDetails3] >> [address1Validation]");

        const address = this.state.addressLine1;
        let err = "";
        const err1 = "Please enter your address details.";
        const err2 = "Please remove invalid special characters.";
        const err3 = "Please do not enter two or more spaces.";
        // Check for accepting valid special characters
        if (!DataModel.addressCharRegex(address)) {
            err = err2;
        } else if (Utility.isEmpty(address)) {
            // Min length check
            err = err1;
        } else if (!DataModel.leadingOrDoubleSpaceRegex(address)) {
            err = err3;
        }

        this.setState({ isValidAddress1: err });
        // Return true if no validation error
        return err ? false : true;
    };

    address2Validation = () => {
        console.log("[MAEOnboardDetails3] >> [address2Validation]");

        const address = this.state.addressLine2;
        let err = "";
        const err1 = "Please enter your address details.";
        const err2 = "Please remove invalid special characters.";
        const err3 = "Please do not enter two or more spaces.";
        // Check for accepting valid special characters
        if (!DataModel.addressCharRegex(address)) {
            err = err2;
        } else if (Utility.isEmpty(address)) {
            // Min length check
            err = err1;
        } else if (!DataModel.leadingOrDoubleSpaceRegex(address)) {
            err = err3;
        }

        this.setState({ isValidAddress2: err });
        // Return true if no validation error
        return err ? false : true;
    };

    cityValidation = () => {
        console.log("[MAEOnboardDetails3] >> [cityValidation]");

        const city = this.state.city;
        let err = "";
        const err1 = "Please enter your city.";
        const err2 = "Please remove invalid special characters.";
        const err3 = "Please do not enter two or more spaces.";
        // Check for accepting valid special characters
        if (!DataModel.cityCharRegex(city)) {
            err = err2;
        } else if (Utility.isEmpty(city)) {
            // Min length check
            err = err1;
        } else if (!DataModel.leadingOrDoubleSpaceRegex(city)) {
            err = err3;
        }

        this.setState({ isValidCity: err });
        // Return true if no validation error
        return err ? false : true;
    };

    postcodeValidation = () => {
        console.log("[MAEOnboardDetails3] >> [postcodeValidation]");

        const postcode = this.state.postcode;
        let err = "";
        const err1 = "Please enter your postcode.";
        const err2 = "Your postcode must not contain alphabets or special characters.";
        const err3 = "Postcode should not be less than 5 characters.";

        // Check there are no other characters except numbers
        if (!DataModel.maeOnlyNumberRegex(postcode)) {
            err = err2;
        } else if (Utility.isEmpty(postcode)) {
            err = err1;
        } else if (postcode.length != 5) {
            err = err3;
        }

        this.setState({ isValidPostcode: err });

        // Return true if no validation error
        return err ? false : true;
    };

    stateValidation = () => {
        console.log("[MAEOnboardDetails3] >> [stateValidation]");

        const state = this.state.state;
        let err = "";
        const err1 = "Please select your state.";

        if (state == "Please Select") {
            err = err1;
        }

        this.setState({ isValidCity: err });
        // Return true if no validation error
        return err ? false : true;
    };

    onInputTextChange = (params) => {
        console.log("[MAEOnboardDetails3] >> [onInputTextChange]");
        const key = params["key"];
        const value = params["value"].trimStart();
        this.setState(
            {
                [key]: value,
                isValidAddress1: "",
                isValidAddress2: "",
                isValidCity: "",
                isValidPostcode: "",
            },
            () => {
                this.enableDisableBtn();
            }
        );
    };

    enableDisableBtn = () => {
        console.log("[MAEOnboardDetails3] >> [enableDisableBtn]");
        if (
            this.state.addressLine1 &&
            this.state.addressLine2 &&
            this.state.city &&
            this.state.postcode &&
            this.state.state != "Please Select"
        ) {
            this.setState({
                isNextDisabled: false,
            });
        } else {
            this.setState({
                isNextDisabled: true,
            });
        }
    };

    onStatePressed = () => {
        console.log("[MAEOnboardDetails3] >> [onStatePressed]");
        Keyboard.dismiss();
        this.setState({ displayPicker: true });
    };

    onDoneButtonPress = (value) => {
        console.log("[MAEOnboardDetails3] >> [onDoneButtonPress]");
        if (value) {
            const stateData = this.state.stateData.find((stateInfo) => stateInfo.value == value);
            this.setState(
                { displayPicker: false, state: stateData.title, stateCode: value },
                () => {
                    this.enableDisableBtn();
                }
            );
        }
    };
    onCancelButtonPress = () => {
        console.log("[MAEOnboardDetails3] >> [onCancelButtonPress]");
        this.setState({ displayPicker: false });
    };

    scrollPickerData = (data) => {
        console.log("[MAEOnboardDetails3] >> [scrollPickerData]");
        return data.map((obj) => {
            const { display, value } = obj;
            return {
                title: display,
                value,
            };
        });
    };

    render() {
        const {
            addressLine1,
            addressLine2,
            city,
            state,
            stateData,
            postcode,
            isValidAddress1,
            isValidAddress2,
            isValidCity,
            isValidPostcode,
            displayPicker,
            isNextDisabled,
            filledUserDetails,
        } = this.state;

        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showOverlay={displayPicker}
                    analyticScreenName={FA_APPLY_MAE_ADDRESS}
                >
                    <View style={styles.viewContainer}>
                        <ScreenLayout
                            paddingBottom={0}
                            paddingTop={0}
                            paddingHorizontal={0}
                            useSafeArea
                            header={
                                filledUserDetails?.from != "updateDetails" ? (
                                    <HeaderLayout
                                        headerLeftElement={
                                            <HeaderBackButton onPress={this.onBackTap} />
                                        }
                                        headerRightElement={
                                            <HeaderCloseButton onPress={this.onCloseTap} />
                                        }
                                    />
                                ) : null
                            }
                        >
                            <ScrollView>
                                <KeyboardAwareScrollView
                                    style={styles.container}
                                    behavior={Platform.OS == "ios" ? "padding" : ""}
                                    enabled
                                >
                                    <View
                                        style={
                                            filledUserDetails?.from === "updateDetails"
                                                ? styles.updateFormContainer
                                                : styles.formContainer
                                        }
                                    >
                                        <Typo
                                            fontSize={20}
                                            lineHeight={28}
                                            fontWeight="300"
                                            letterSpacing={0}
                                            textAlign="left"
                                            text={"What's your residential address?"}
                                        />
                                        <View style={styles.fieldContainer}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                lineHeight={18}
                                                textAlign="left"
                                                text="Address line 1"
                                            />
                                            <LongTextInput
                                                maxLength={40}
                                                isValid={!isValidAddress1}
                                                isValidate
                                                errorMessage={isValidAddress1}
                                                value={addressLine1}
                                                placeholder="Enter your address"
                                                onChangeText={(value) => {
                                                    this.onInputTextChange({
                                                        key: "addressLine1",
                                                        value,
                                                    });
                                                }}
                                                numberOfLines={2}
                                            />
                                        </View>
                                        <View style={styles.fieldContainer}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                lineHeight={18}
                                                textAlign="left"
                                                text="Address line 2"
                                            />
                                            <LongTextInput
                                                maxLength={40}
                                                isValid={!isValidAddress2}
                                                isValidate
                                                errorMessage={isValidAddress2}
                                                value={addressLine2}
                                                placeholder="Enter your address"
                                                onChangeText={(value) => {
                                                    this.onInputTextChange({
                                                        key: "addressLine2",
                                                        value,
                                                    });
                                                }}
                                                numberOfLines={2}
                                            />
                                        </View>
                                        <View style={styles.fieldContainer}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                lineHeight={18}
                                                textAlign="left"
                                                text="City"
                                            />
                                            <LongTextInput
                                                maxLength={40}
                                                isValid={!isValidCity}
                                                isValidate
                                                errorMessage={isValidCity}
                                                numberOfLines={2}
                                                value={city}
                                                placeholder="Enter your city"
                                                onChangeText={(value) => {
                                                    this.onInputTextChange({ key: "city", value });
                                                }}
                                            />
                                        </View>
                                        <View style={styles.fieldContainer}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                lineHeight={18}
                                                textAlign="left"
                                                text="State"
                                            />
                                            <View style={styles.dropDownView}>
                                                <TouchableOpacity
                                                    style={styles.touchableView}
                                                    onPress={this.onStatePressed}
                                                >
                                                    <View>
                                                        <Typo
                                                            fontSize={13}
                                                            fontWeight="600"
                                                            fontStyle="normal"
                                                            lineHeight={23}
                                                            letterSpacing={0}
                                                            color={BLACK}
                                                            textAlign="left"
                                                            text={state}
                                                            style={styles.dropDownText}
                                                        />

                                                        <Image
                                                            style={styles.dropDownIcon}
                                                            source={Assets.downArrow}
                                                        />
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <View style={styles.fieldContainer}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                lineHeight={18}
                                                textAlign="left"
                                                text="Postcode"
                                            />
                                            <TextInput
                                                maxLength={5}
                                                isValid={!isValidPostcode}
                                                isValidate
                                                errorMessage={isValidPostcode}
                                                keyboardType={"number-pad"}
                                                value={postcode}
                                                placeholder="Enter your postcode"
                                                onChangeText={(value) => {
                                                    this.onInputTextChange({
                                                        key: "postcode",
                                                        value,
                                                    });
                                                }}
                                                returnKeyType="done"
                                            />
                                        </View>
                                    </View>
                                </KeyboardAwareScrollView>
                            </ScrollView>
                            {/* Continue Button */}
                            <View style={styles.bottomBtnContCls}>
                                <LinearGradient
                                    colors={["#efeff300", MEDIUM_GREY]}
                                    style={styles.linearGradient}
                                />
                                <ActionButton
                                    fullWidth
                                    onPress={this.onContinueTap}
                                    disabled={isNextDisabled}
                                    backgroundColor={isNextDisabled ? DISABLED : YELLOW}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            color={isNextDisabled ? DISABLED_TEXT : BLACK}
                                            text="Continue"
                                        />
                                    }
                                />
                            </View>
                        </ScreenLayout>
                    </View>
                </ScreenContainer>
                <ScrollPicker
                    showPicker={displayPicker}
                    items={stateData}
                    onCancelButtonPressed={this.onCancelButtonPress}
                    onDoneButtonPressed={this.onDoneButtonPress}
                />
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 24,
        paddingVertical: 25,
    },
    confirmButton: {
        marginTop: 40,
    },
    container: {
        flex: 1,
    },
    containerTitle: {
        marginBottom: 8,
        marginTop: 24,
    },
    dropDownIcon: {
        height: 8,
        marginLeft: "88%",
        marginTop: -10,
        width: 15,
    },
    dropDownText: {
        height: 19,
        marginLeft: "5%",
        marginTop: -8,
        width: "75%",
    },
    dropDownView: {
        backgroundColor: WHITE,
        // borderColor: GRAY_CONCRETE,
        borderRadius: 24,
        // borderStyle: "solid",
        // borderWidth: 1,
        // elevation: 5,
        height: 48,
        marginTop: 16,
        width: "100%",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#cfcfcf",
    },
    fieldContainer: {
        marginTop: 24,
    },
    formContainer: {
        marginBottom: 40,
        marginHorizontal: 36,
    },
    linearGradient: {
        height: 30,
        left: 0,
        position: "absolute",
        right: 0,
        top: -30,
    },
    touchableView: {
        alignItems: "center",
        flexDirection: "row",
        height: "100%",
        marginLeft: "6%",
        width: "100%",
    },
    updateFormContainer: {
        marginBottom: 40,
        marginHorizontal: 36,
        marginTop: 80,
    },
    viewContainer: {
        flex: 1,
    },
});

export default MAEOnboardDetails3;
