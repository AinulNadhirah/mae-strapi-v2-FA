import React, { Component } from "react";
import { StyleSheet, View, Platform, Keyboard, Modal } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import TextInput from "@components/TextInput";
import { LongTextInput } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import Typo from "@components/Text";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import ScrollPicker from "@components/Pickers/ScrollPicker";
import StateScrollPickerItem from "@components/Pickers/ScrollPicker/StateScrollPickerItem";
import FixedActionContainer from "@components/Footers/FixedActionContainer";

import {
    leadingOrDoubleSpaceRegex,
    addressCharRegex,
    cityCharRegex,
    maeOnlyNumberRegex,
} from "@utils/dataModel";
import { isEmpty } from "@utils/dataModel/utility";
import { MAE_SETEPUP_RACE } from "@navigation/navigationConstant";
import { YELLOW, MEDIUM_GREY, DISABLED } from "@constants/colors";
import { PLEASE_SELECT, CONTINUE } from "@constants/strings";

class StepUpAddress extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Address 1
            address1: "",
            addressOneValid: true,
            addressOneErrorMsg: "",

            // Address 2
            address2: "",
            addressTwoValid: true,
            addressTwoErrorMsg: "",

            // City
            city: "",
            cityValid: true,
            cityErrorMsg: "",

            // State
            state: PLEASE_SELECT,
            stateValue: null,
            stateValid: true,
            stateErrorMsg: "",
            stateData: null,
            showPicker: false,

            // Postcode
            postCode: "",
            postcodeValid: true,
            postcodeErrorMsg: "",

            // Others
            type: "",
            dropdownData: [],
            keyname: "",
            isContinueDisabled: true,
        };
    }

    componentDidMount = () => {
        console.log("[StepUpAddress] >> [componentDidMount]");

        // Call method to manage data after init
        this.manageDataOnInit();
    };

    manageDataOnInit = () => {
        console.log("[StepUpAddress] >> [manageDataOnInit]");

        const params = this.props?.route?.params ?? {};
        const { stateData } = params?.masterdata ?? {};
        const { address1, address2, city, postCode, state } = params?.stepup_details ?? {};

        // Update state data from enquiry
        this.setState(
            {
                address1,
                address2,
                city,
                postCode,
                stateData,
                stateValue: isEmpty(state)
                    ? ""
                    : this.getUserData(stateData, state, PLEASE_SELECT).value,
                state: isEmpty(state)
                    ? PLEASE_SELECT
                    : this.getUserData(stateData, state, PLEASE_SELECT).display,
            },
            () => {
                this.enableDisableBtn();
            }
        );
    };

    getUserData = (dataArray, userValue, defaultValue) => {
        console.log("[StepUpAddress] >> [getUserData]");

        let displayObj = dataArray.find((d) => d.value === userValue);
        if (!displayObj) {
            return (displayObj = { display: defaultValue, value: defaultValue });
        }
        return displayObj;
    };

    onBackTap = () => {
        console.log("[StepUpAddress] >> [onBackTap]");

        this.props.navigation.goBack();
    };

    onContinueButtonPress = () => {
        console.log("[StepUpAddress] >> [onContinueButtonPress]");

        const params = this.props?.route?.params ?? {};
        const { isContinueDisabled } = this.state;

        // Return if button is in disabled state
        if (isContinueDisabled) return;

        // Return is form validation fails
        const isFormValid = this.validateFormDetails();
        if (!isFormValid) return;

        const formData = this.getFormData();
        this.props.navigation.navigate(MAE_SETEPUP_RACE, {
            ...params,
            addressDetailsInfo: formData,
        });
    };

    getFormData = () => {
        console.log("[StepUpAddress] >> [getFormData]");

        const { address1, address2, city, postCode } = this.state;

        return {
            address1: address1.trim(),
            address2: address2.trim(),
            city: city.trim(),
            postCode: postCode,
        };
    };

    onAddressOneChange = (value) => {
        this.onTextInputChange("address1", value);
    };

    onAddressTwoChange = (value) => {
        this.onTextInputChange("address2", value);
    };

    onCityChange = (value) => {
        this.onTextInputChange("city", value);
    };

    onPostcodeChange = (value) => {
        this.onTextInputChange("postCode", value);
    };

    onSelectCmpPressed = () => {
        console.log("[StepUpAddress] >> [onSelectCmpPressed]");

        Keyboard.dismiss();

        const stateData = this.props?.route?.params?.masterdata?.stateData ?? null;
        if (stateData) {
            this.setState({
                showPicker: true,
                dropdownData: stateData,
                keyname: "display",
                type: "state",
            });
        }
    };

    onPickerDone = (value) => {
        console.log("[StepUpAddress] >> [onPickerDone]");

        const { dropdownData, type } = this.state;
        if (value) {
            const title = dropdownData.find((data) => data.value === value);
            if (type === "state") {
                this.setState(
                    { showPicker: false, state: title.display, stateValue: value },
                    () => {
                        this.enableDisableBtn();
                    }
                );
            }
        }
    };

    onPickerCancel = () => {
        console.log("[StepUpAddress] >> [onPickerCancel]");

        this.setState({ showPicker: false });
    };

    onTextInputChange = (key, value) => {
        console.log("[StepUpAddress][onTextInputChange] >> Key: " + key + " | value: " + value);
        this.setState(
            {
                [key]: value,
            },
            () => {
                this.enableDisableBtn();
            }
        );
    };

    enableDisableBtn = () => {
        console.log("[StepUpAddress] >> [enableDisableBtn]");

        const { address1, address2, city, postCode, stateValue } = this.state;
        if (
            address1.trim() === "" ||
            address2.trim() === "" ||
            city.trim() === "" ||
            postCode.trim() === "" ||
            !stateValue
        ) {
            this.setState({
                isContinueDisabled: true,
            });
        } else {
            this.setState({
                isContinueDisabled: false,
            });
        }
    };

    resetValidationErrors = () => {
        console.log("[StepUpAddress] >> [resetValidationErrors]");

        this.setState({
            addressOneValid: true,
            addressOneErrorMsg: "",
            addressTwoValid: true,
            addressTwoErrorMsg: "",
            cityValid: true,
            cityErrorMsg: "",
            postcodeValid: true,
            postcodeErrorMsg: "",
        });
    };

    validateFormDetails = () => {
        console.log("[StepUpAddress] >> [validateFormDetails]");

        // Reset existing error state
        this.resetValidationErrors();

        const { address1, address2, city, postCode } = this.state;

        // Address One
        const { isValid: addressOneValid, message: addressOneErrorMsg } =
            this.validateAddress1(address1);
        if (!addressOneValid) {
            this.setState({ addressOneValid, addressOneErrorMsg });
        }

        // Address Two
        const { isValid: addressTwoValid, message: addressTwoErrorMsg } =
            this.validateAddress2(address2);
        if (!addressTwoValid) {
            this.setState({ addressTwoValid, addressTwoErrorMsg });
        }

        // City
        const { isValid: cityValid, message: cityErrorMsg } = this.validateCity(city);
        if (!cityValid) {
            this.setState({ cityValid, cityErrorMsg });
        }

        // Post Code
        const { isValid: postcodeValid, message: postcodeErrorMsg } =
            this.validatePostcode(postCode);

        if (!postcodeValid) {
            this.setState({ postcodeValid, postcodeErrorMsg });
        }

        if (!addressOneValid || !addressTwoValid || !cityValid || !postcodeValid) {
            return false;
        }

        // Return true if all validation checks are passed
        return true;
    };

    renderScrollPickerItem = (item, index, isSelected) => (
        <StateScrollPickerItem stateName={item?.display ?? ""} isSelected={isSelected} />
    );

    /* VALIDATIONS */

    validateAddress1 = (value) => {
        console.log("[StepUpAddress] >> [validateAddress1]");

        if (!value) {
            return {
                isValid: false,
                message: "Please enter input in Address Line 1.",
            };
        }

        // Min length check
        if (value.length < 5) {
            return {
                isValid: false,
                message: "Address Line 1 must be more than 5 characters.",
            };
        }

        // Check for leading or double spaces
        if (!leadingOrDoubleSpaceRegex(value)) {
            return {
                isValid: false,
                message: "Address Line 1 must not contain leading/double spaces.",
            };
        }

        // Address Line 1 Special Char check
        if (!addressCharRegex(value)) {
            return {
                isValid: false,
                message: "Address Line 1 must not contain special character.",
            };
        }

        // Return true if no validation error
        return {
            isValid: true,
        };
    };

    validateAddress2 = (value) => {
        console.log("[StepUpAddress] >> [validateAddress2]");

        if (!value) {
            return {
                isValid: false,
                message: "Please enter input in Address Line 2.",
            };
        }

        // Min length check
        if (value.length < 5) {
            return {
                isValid: false,
                message: "Address Line 2 must be more than 5 characters.",
            };
        }

        // Check for leading or double spaces
        if (!leadingOrDoubleSpaceRegex(value)) {
            return {
                isValid: false,
                message: "Address Line 2 must not contain leading/double spaces.",
            };
        }

        // Address Line 1 Special Char check
        if (!addressCharRegex(value)) {
            return {
                isValid: false,
                message: "Address Line 2 must not contain special character.",
            };
        }

        // Return true if no validation error
        return {
            isValid: true,
        };
    };

    validateCity = (value) => {
        console.log("[StepUpAddress] >> [validateCity]");

        if (!value) {
            return {
                isValid: false,
                message: "Please enter a city.",
            };
        }

        // Min length check
        if (value.length < 5) {
            return {
                isValid: false,
                message: "City must be more than 5 characters.",
            };
        }

        // Check for leading or double spaces
        if (!leadingOrDoubleSpaceRegex(value)) {
            return {
                isValid: false,
                message: "City must not contain leading/double spaces.",
            };
        }

        if (!cityCharRegex(value)) {
            return {
                isValid: false,
                message: "City must not contain special character.",
            };
        }

        // Return true if no validation error
        return {
            isValid: true,
        };
    };

    validatePostcode = (value) => {
        console.log("[StepUpAddress] >> [validatePostcode]");

        // Check there are no other characters except numbers
        if (!maeOnlyNumberRegex(value)) {
            return {
                isValid: false,
                message: "Your postcode must not contain alphabets or special characters.",
            };
        }

        // Min length check
        if (value.length < 5) {
            return {
                isValid: false,
                message: "Postcode should not be less than 5 characters",
            };
        }

        // Return true if no validation error
        return {
            isValid: true,
        };
    };

    render() {
        const {
            address1,
            addressOneErrorMsg,
            addressOneValid,
            address2,
            addressTwoErrorMsg,
            addressTwoValid,
            city,
            cityErrorMsg,
            cityValid,
            state,
            stateData,
            showPicker,
            postCode,
            postcodeErrorMsg,
            postcodeValid,
            isContinueDisabled,
        } = this.state;

        return (
            <React.Fragment>
                <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                horizontalPaddingMode={"custom"}
                                horizontalPaddingCustomLeftValue={16}
                                horizontalPaddingCustomRightValue={16}
                                headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                            />
                        }
                        paddingHorizontal={0}
                        paddingBottom={0}
                        paddingTop={0}
                        useSafeArea
                    >
                        <React.Fragment>
                            <KeyboardAwareScrollView
                                style={styles.containerView}
                                behavior={Platform.OS == "ios" ? "padding" : ""}
                                enabled
                                showsVerticalScrollIndicator={false}
                            >
                                <Typo
                                    fontSize={20}
                                    lineHeight={28}
                                    fontWeight="300"
                                    letterSpacing={0}
                                    textAlign="left"
                                    text="What’s your residential address?"
                                />

                                {/* Address line 1 */}
                                <View style={styles.blockView}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        text="Address line 1"
                                    />
                                    <LongTextInput
                                        minLength={5}
                                        maxLength={40}
                                        autoFocus
                                        isValidate
                                        isValid={addressOneValid}
                                        errorMessage={addressOneErrorMsg}
                                        value={address1}
                                        placeholder="Enter your address"
                                        onChangeText={this.onAddressOneChange}
                                        numberOfLines={2}
                                    />
                                </View>

                                {/* Address line 2 */}
                                <View style={styles.blockView}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        text="Address line 2"
                                    />
                                    <LongTextInput
                                        minLength={5}
                                        maxLength={40}
                                        isValidate
                                        isValid={addressTwoValid}
                                        errorMessage={addressTwoErrorMsg}
                                        value={address2}
                                        placeholder="Enter your address"
                                        onChangeText={this.onAddressTwoChange}
                                        numberOfLines={2}
                                    />
                                </View>

                                {/* City */}
                                <View style={styles.blockView}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        text="City"
                                    />
                                    <LongTextInput
                                        minLength={5}
                                        maxLength={40}
                                        isValidate
                                        isValid={cityValid}
                                        errorMessage={cityErrorMsg}
                                        value={city}
                                        placeholder="Enter your city"
                                        onChangeText={this.onCityChange}
                                        numberOfLines={2}
                                    />
                                </View>

                                {/* STATE */}
                                <LabeledDropdown
                                    label="State"
                                    dropdownValue={state}
                                    onPress={this.onSelectCmpPressed}
                                    style={styles.blockView}
                                />

                                {/* Postcode */}
                                <View style={[styles.blockView, styles.lastFieldCls]}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        text="Postcode"
                                    />
                                    <TextInput
                                        minLength={5}
                                        maxLength={5}
                                        isValidate
                                        isValid={postcodeValid}
                                        errorMessage={postcodeErrorMsg}
                                        value={postCode}
                                        placeholder="Enter your postCode"
                                        keyboardType="numeric"
                                        onChangeText={this.onPostcodeChange}
                                        blurOnSubmit
                                    />
                                </View>
                            </KeyboardAwareScrollView>

                            {/* Bottom docked button container */}
                            <FixedActionContainer>
                                <ActionButton
                                    fullWidth
                                    onPress={this.onContinueButtonPress}
                                    disabled={isContinueDisabled}
                                    backgroundColor={isContinueDisabled ? DISABLED : YELLOW}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text={CONTINUE}
                                        />
                                    }
                                />
                            </FixedActionContainer>
                        </React.Fragment>
                    </ScreenLayout>
                </ScreenContainer>

                {/* Picker */}
                <Modal
                    animationIn="fadeIn"
                    animationOut="fadeOut"
                    hasBackdrop={false}
                    visible={showPicker}
                    style={{ margin: 0 }}
                    hideModalContentWhileAnimating
                    useNativeDriver
                    transparent
                >
                    <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.75)" }}>
                        <ScrollPicker
                            showPicker={showPicker}
                            items={stateData}
                            onCancelButtonPressed={this.onPickerCancel}
                            onDoneButtonPressed={this.onPickerDone}
                            renderCustomItems
                            customItemRenderer={this.renderScrollPickerItem}
                        />
                    </View>
                </Modal>
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    blockView: {
        marginTop: 24,
    },

    containerView: {
        flex: 1,
        paddingHorizontal: 36,
        width: "100%",
    },

    lastFieldCls: {
        marginBottom: 30,
    },
});

export default StepUpAddress;
