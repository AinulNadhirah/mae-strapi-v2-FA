import React, { Component } from "react";
import { View, Image, StyleSheet, Platform, TouchableOpacity, Keyboard } from "react-native";

import { RELOAD_SELECT_AMOUNT } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { SelectedCategoryList } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { logEvent } from "@services/analytics";

import { BLACK, MEDIUM_GREY } from "@constants/colors";
import {
    RELOAD,
    ENTERMOBILE_NUMBER,
    VALID_MOBILE_NUMBER,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_RELOAD_MOBILENUMBER,
} from "@constants/strings";

import { isMalaysianMobileNum } from "@utils/dataModel";
import { checkNativeContatPermission } from "@utils/dataModel/utility";

import Assets from "@assets";

class ReloadSelectContact extends Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        super(props);
        this.state = {
            seletedTelco: props?.route?.params?.paramsData?.telco,
            mobileNo: "",
            mobileNoRaw: "",
            containerError: false,
            containerErrorMessage: "",
            phoneError: false,
        };
        Keyboard.dismiss();
    }

    componentDidMount = () => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_RELOAD_MOBILENUMBER,
        });
    };

    onBackTap = () => {
        console.log("[ReloadSelectContact] >> [onBackTap]");

        this.props.navigation.goBack();
    };

    changeText = (val) => {
        if (!val) {
            this.setState({ phoneError: false });
        }
        this.formatMobileNumber(val.toString());
    };

    doneClick = () => {
        console.log("[ReloadSelectContact] >> [doneClick]");

        const { mobileNo, seletedTelco } = this.state;
        const navParams = this.props.route?.params ?? {};
        const isMobileNumberValid = this.isMobileNumberValid(mobileNo);

        // Show/hide inline error based on validation
        this.setState({ phoneError: !isMobileNumberValid });

        // If valid, go to next screen
        if (isMobileNumberValid) {
            // Navigate to Select Amount page
            this.props.navigation.navigate(RELOAD_SELECT_AMOUNT, {
                paramsData: {
                    telcoList: seletedTelco,
                    mobileNo: "60" + mobileNo.replace(/\s+/g, ""), // Added prefix
                    routeFrom: navParams?.paramsData?.routeFrom,
                    accountNo: navParams?.paramsData?.accountNo,
                },
            });
        }
    };

    isMobileNumberValid = (mobileNo = "") => {
        console.log("[ReloadSelectContact] >> [isMobileNumberValid]");

        // Remove white spaces before validating length
        const mobileNoFormatted = mobileNo.replace(/\s+/g, "");

        if (!(mobileNoFormatted.length >= 9 && mobileNoFormatted.length <= 13)) return false;

        if (!isMalaysianMobileNum(`+60${mobileNoFormatted}`)) return false;

        // Return true if passes validation checks
        return true;
    };

    formatMobileNumber = (number) => {
        this.setState({
            mobileNoRaw: number,
            mobileNo: number
                .toString()
                .replace(/(\d{2})(\d{1,4})?(\d{1,4})?(\d{1,4})?/, (_, p1, p2, p3, p4) => {
                    console.log(_);
                    let output = "";
                    if (p1) output = `${p1}`;
                    if (p2) output += ` ${p2}`;
                    if (p3) output += ` ${p3}`;
                    if (p4) output += ` ${p4}`;
                    return output;
                }),
        });
    };

    getContact = async () => {
        console.log("[ReloadSelectContact] >> [getContact]");

        const contactInfo = await checkNativeContatPermission();
        if (contactInfo?.status) {
            const mobileNo = contactInfo?.mobileNo ?? "";

            // Update inline error state
            this.setState({
                phoneError: !this.isMobileNumberValid(mobileNo),
            });

            // Remove white spaces before validating length
            const mobileNoFormatted = mobileNo.replace(/\s+/g, "");
            this.formatMobileNumber(
                mobileNoFormatted.length > 13 ? mobileNoFormatted.slice(0, 13) : mobileNoFormatted
            );

            return;
        }

        this.setState({
            containerError: true,
            containerErrorMessage: contactInfo?.message ?? "",
        });
    };

    render() {
        const {
            containerError,
            containerErrorMessage,
            seletedTelco,
            phoneError,
            mobileNo,
            mobileNoRaw,
        } = this.state;

        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <React.Fragment>
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text={RELOAD}
                                    />
                                }
                            />
                        }
                        useSafeArea
                        paddingLeft={36}
                        paddingRight={36}
                        showErrorModal={containerError}
                        errorMessage={containerErrorMessage}
                        showOverlay={containerError}
                    >
                        <View style={styles.container}>
                            <SelectedCategoryList
                                item={seletedTelco}
                                textKey="shortName"
                                imageKey="image"
                            />

                            <View style={styles.containerTitle}>
                                <Typo
                                    fontSize={20}
                                    lineHeight={28}
                                    fontWeight="300"
                                    textAlign="left"
                                    text={ENTERMOBILE_NUMBER}
                                />
                                <View style={styles.numberContainer}>
                                    <View style={styles.textinputView}>
                                        <TextInput
                                            isValidate
                                            isValid={!phoneError}
                                            errorMessage={VALID_MOBILE_NUMBER}
                                            onSubmitEditing={this.onDone}
                                            value={mobileNo}
                                            prefix="+60"
                                            onChangeText={this.onNameChange}
                                            editable={false}
                                        />
                                    </View>
                                    <View style={styles.contactIconView}>
                                        <TouchableOpacity onPress={this.getContact}>
                                            <Image
                                                accessible={true}
                                                testID={"selectContactImage"}
                                                accessibilityLabel={"selectContactImage"}
                                                style={styles.selectContactImage}
                                                source={Assets.icSelectContact}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScreenLayout>

                    {/* Keypad */}
                    <NumericalKeyboard
                        value={mobileNoRaw}
                        onChangeText={this.changeText}
                        maxLength={10}
                        onDone={this.doneClick}
                    />
                </React.Fragment>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    contactIconView: {
        height: 50,
        position: "absolute",
        right: 0,
    },

    container: {
        flex: 1,
    },

    containerTitle: {
        marginTop: 8,
    },

    numberContainer: {
        flexDirection: "row",
    },

    selectContactImage: {
        height: 30,
        marginTop: 10,
        resizeMode: Platform.OS != "ios" ? "center" : "contain",
        width: 30,
    },

    textinputView: {
        width: "100%",
    },
});
export default ReloadSelectContact;
