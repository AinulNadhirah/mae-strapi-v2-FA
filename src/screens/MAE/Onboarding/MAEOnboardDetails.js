import React, { Component } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { LongTextInput } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { YELLOW, DISABLED, DISABLED_TEXT, BLACK, MEDIUM_GREY } from "@constants/colors";
import { FA_APPLY_MAE_PERSONALDETAILS } from "@constants/strings";

import * as DataModel from "@utils/dataModel";

class MAEOnboardDetails extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });
    MAEUserDetails = {};
    constructor(props) {
        super(props);
        this.state = {
            fullName: "",
            mobileNumber: "",
            isNextDisabled: true,
            nameLabel: "Full name (as per MyKad/Passport)",
            namePlaceholder: "Enter your full name",
            mobileLabel: "Mobile number",
            isValidName: "",
            isValidNumber: "",
        };
    }

    componentDidMount() {
        console.log("[MAEOnboardDetails] >> [componentDidMount]");
        // const dummy = true;
        // if(dummy) {
        //  this.setState({
        //      fullName: "Rakesh",
        //      mobileNumber: "1127500102",
        //      isNextDisabled: false,
        //  });
        // }
    }

    onBackTap = () => {
        console.log("[MAEOnboardDetails] >> [onBackTap]");
        this.props.navigation.goBack();
    };

    onCloseTap = () => {
        console.log("[MAEOnboardDetails] >> [onCloseTap]");
        this.props.navigation.navigate(this.props.route?.params?.entryStack || "More", {
            screen: this.props.route?.params?.entryScreen || "Apply",
            params: this.props.route?.params?.entryParams,
        });
    };

    onContinueTap = () => {
        console.log("[MAEOnboardDetails] >> [onContinueTap]");
        if (this.fullNameValidation() && this.mobileNumberValidation()) {
            const filledUserDetails = this.prepareUserDetails();
            this.props.navigation.navigate(navigationConstant.MAE_ONBOARD_DETAILS2, {
                filledUserDetails,
            });
        }
    };

    prepareUserDetails = () => {
        console.log("[MAEOnboardDetails] >> [prepareUserDetails]");
        const onBoardDetails = {
            fullName: this.state.fullName,
            mobileNumber: "0" + this.state.mobileNumber,
        };
        this.MAEUserDetails.onBoardDetails = onBoardDetails;
        this.MAEUserDetails.entryStack = this.props.route.params.entryStack;
        this.MAEUserDetails.entryScreen = this.props.route.params.entryScreen;
        this.MAEUserDetails.entryParams = this.props.route.params.entryParams;
        return this.MAEUserDetails;
    };

    fullNameValidation = () => {
        console.log("[MAEOnboardDetails] >> [fullNameValidation]");

        const fullName = this.state.fullName;
        let err = "";
        const err1 = "Name must not contain any special characters.";
        const err2 = "Name must not contain any numbers.";
        const err3 = "Name should contain at least 6 characters.";
        const err4 = "Prefixes or title such as Ms, Mrs. etc are not allowed.";
        // Check for leading or double spaces
        if (!DataModel.leadingOrDoubleSpaceRegex(fullName)) {
            err = err1;
        } else if (DataModel.hasNumberRegex(fullName)) {
            // Check if there are any numbers
            err = err2;
        } else if (!DataModel.maeNameRegex(fullName)) {
            // Check for accepting valid special characters
            err = err1;
        } else if (fullName.length < 6) {
            // Min length check
            err = err3;
        }

        // Check for title prefixes
        let excludedPrefixFlag = false;
        const excludedPrefixes = ["Mr", "Mrs", "Ms", "Mister", "Miss", "Master", "Dr", "Prof"];
        const nameArr = fullName.split(" ");
        for (let i in excludedPrefixes) {
            const prefix = excludedPrefixes[i];
            // if (fullName.indexOf(prefix) == 0 || fullName.indexOf(prefix.toLowerCase()) == 0)
            if (nameArr[0].toLocaleLowerCase() == prefix.toLocaleLowerCase()) {
                excludedPrefixFlag = true;
                break;
            }
        }
        if (excludedPrefixFlag) {
            err = err4;
        }
        this.setState({ isValidName: err });
        // Return true if no validation error
        return err ? false : true;
    };

    mobileNumberValidation = () => {
        console.log("[MAEOnboardDetails] >> [mobileNumberValidation]");

        const mobileNumber = this.state.mobileNumber;
        let err = "";
        const err1 = "The prefix you entered is invalid.";
        const err2 = "Mobile number should contain at least 10 digits.";
        const err3 = "Your mobile number should contain digits only.";
        const err4 = "The mobile number you entered is invalid.";
        const err5 = "Your phone number is already registered in our system.";

        // Check there are no other characters except numbers
        if (!DataModel.maeOnlyNumberRegex(mobileNumber)) {
            err = err3;
        } else if (mobileNumber.length < 9 || mobileNumber.length > 10) {
            err = err2;
        } else if (mobileNumber.indexOf("1") != 0) {
            // Mobile number prefix check
            err = err1;
        } else if (DataModel.charRepeatRegex(mobileNumber)) {
            // Check for consecutive same digit 8 times repeat
            err = err4;
        }
        this.setState({ isValidNumber: err });

        // Return true if no validation error
        return err ? false : true;
    };

    onInputTextChange = (params) => {
        console.log("[MAEOnboardDetails] >> [onInputTextChange]");

        const key = params["key"];
        const value = params["value"];
        this.setState(
            {
                [key]: value,
                isValidName: "",
                isValidNumber: "",
            },
            () => {
                this.enableDisableBtn();
            }
        );
    };

    enableDisableBtn = () => {
        console.log("[MAEOnboardDetails] >> [enableDisableBtn]");
        if (this.state.fullName.length > 0 && this.state.mobileNumber.length > 0) {
            this.setState({
                isNextDisabled: false,
            });
        } else {
            this.setState({
                isNextDisabled: true,
            });
        }
    };

    render() {
        const {
            fullName,
            mobileNumber,
            nameLabel,
            mobileLabel,
            namePlaceholder,
            isValidName,
            isValidNumber,
            isNextDisabled,
        } = this.state;

        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={FA_APPLY_MAE_PERSONALDETAILS}
            >
                <View style={styles.viewContainer}>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                                headerRightElement={<HeaderCloseButton onPress={this.onCloseTap} />}
                            />
                        }
                    >
                        <ScrollView>
                            <View style={styles.fieldContainer}>
                                <Typo
                                    fontSize={20}
                                    lineHeight={28}
                                    fontWeight="300"
                                    letterSpacing={0}
                                    textAlign="left"
                                    text={"What's your full name and mobile number?"}
                                />
                                {/* User Name */}
                                <View style={styles.containerTitle}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        fontStyle="normal"
                                        lineHeight={18}
                                        textAlign="left"
                                        text={nameLabel}
                                    />
                                </View>
                                <View>
                                    <LongTextInput
                                        maxLength={40}
                                        isValid={!isValidName}
                                        isValidate
                                        errorMessage={isValidName}
                                        value={fullName}
                                        placeholder={namePlaceholder}
                                        onChangeText={(value) => {
                                            this.onInputTextChange({ key: "fullName", value });
                                        }}
                                        numberOfLines={2}
                                    />
                                </View>
                                {/* Mobile Number */}
                                <View style={styles.containerTitle}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        fontStyle="normal"
                                        lineHeight={18}
                                        textAlign="left"
                                        text={mobileLabel}
                                    />
                                </View>
                                <View>
                                    <TextInput
                                        maxLength={10}
                                        isValid={!isValidNumber}
                                        isValidate
                                        errorMessage={isValidNumber}
                                        keyboardType={"number-pad"}
                                        value={mobileNumber}
                                        prefix="+60"
                                        onChangeText={(value) => {
                                            this.onInputTextChange({
                                                key: "mobileNumber",
                                                value,
                                            });
                                        }}
                                        returnKeyType="done"
                                    />
                                </View>
                            </View>
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
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    confirmButton: {
        marginTop: 40,
    },
    containerTitle: {
        marginBottom: 8,
        marginTop: 24,
    },
    fieldContainer: {
        marginHorizontal: 36,
    },
    viewContainer: {
        flex: 1,
    },
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 24,
        paddingVertical: 25,
    },
    linearGradient: {
        height: 30,
        left: 0,
        right: 0,
        top: -30,
        position: "absolute",
    },
});

export default MAEOnboardDetails;
