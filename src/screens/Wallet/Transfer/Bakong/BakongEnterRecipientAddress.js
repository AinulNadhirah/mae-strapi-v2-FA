import PropTypes from "prop-types";
import React, { Component } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { AccountDetailsView, ScrollPickerView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typography from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { logEvent } from "@services/analytics";

import { BLACK, DISABLED, DISABLED_TEXT, YELLOW, NEARYLY_DARK_GREY } from "@constants/colors";
import { FA_SCREEN_NAME, FA_VIEW_SCREEN } from "@constants/strings";

import { formatBakongMobileNumbers } from "@utils/dataModel/utility";

class BakongEnterRecipientAddress extends Component {
    state = {
        loader: true,
        screenData: {
            image: this.props.route.params?.transferParams?.image ?? "",
            name:
                "+855 " +
                    formatBakongMobileNumbers(this.props.route.params?.transferParams?.mobileNo) ??
                "",
            description1: this.props.route.params?.transferParams?.name ?? "",
            description2: this.props.route.params?.transferParams?.transactionTo ?? "",
        },
        error: false,
        errorMessage: "",
        transferParams: {},
        showCountryScrollPicker: false,
        countries: [],
        selectedCountry: this.props.route.params?.transferParams.addressCountry ?? "CAMBODIA",
        selectedCountryCode: this.props.route.params?.transferParams.addressCountryCode ?? "KHM",
        addressLine1: this.props.route.params?.transferParams.addressLine1 ?? "",
        addressLine2: this.props.route.params?.transferParams.addressLine2 ?? "",
        countryScrollPickerSelectedIndex: 0,
    };

    componentDidMount() {
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            this.updateData();
        });
        this._logAnalyticsEvent("M2U_TRF_Overseas_Bakong_4RecipientAddress");
    }

    componentWillUnmount() {
        this.focusSubscription();
    }

    updateData() {
        const transferParams = this.props.route.params?.transferParams;

        this.setState({
            transferParams,
            selectedCountry: transferParams?.addressCountry ?? "CAMBODIA",
            selectedCountryCode: transferParams?.addressCountryCode ?? "KHM",
            addressLine1: transferParams?.addressLine1 ?? "",
            addressLine2: transferParams?.addressLine2 ?? "",
            countries:
                transferParams?.countries?.map?.(({ title, ...props }, index) => ({
                    name: title,
                    title,
                    index,
                    ...props,
                })) ?? [],
        });
    }

    doneClick = () => {
        const { selectedCountry, selectedCountryCode, addressLine1, addressLine2 } = this.state;

        const regex = new RegExp(/^[-a-z0-9&.‘/+\\,;:@\s]+$/i);

        if (!regex.test(addressLine1) || !regex.test(addressLine2)) {
            showErrorToast({ message: "Address should not contain invalid characters." });
            return;
        }

        const addressLine1Trimmed = addressLine1.trim();
        const addressLine2Trimmed = addressLine2.trim();

        let { transferParams } = this.state;
        transferParams.addressCountry = selectedCountry;
        transferParams.addressCountryCode = selectedCountryCode;
        transferParams.addressLine1 = addressLine1Trimmed;
        transferParams.addressLine2 = addressLine2Trimmed;

        this.props.navigation.navigate("BakongEnterPurpose", {
            transferParams: { ...transferParams },
        });
    };

    _onBackPress = () => {
        const { transferParams } = this.state;
        this.props.navigation.navigate("BakongEnterRecipientID", {
            transferParams: { ...transferParams },
        });
    };

    _onScrollPickerShow = () => {
        this._logAnalyticsEvent("M2U_TRF_Overseas_Bakong_4.1RecipientCountry");
        this.setState({ showCountryScrollPicker: true });
    };

    _onScrollPickerDismissed = () => this.setState({ showCountryScrollPicker: false });

    _onScrollPickerDoneButtonPressed = ({ title, desc, index }) =>
        this.setState({
            selectedCountry: title,
            selectedCountryCode: desc,
            showCountryScrollPicker: false,
            countryScrollPickerSelectedIndex: index,
        });

    _onAddressOneTextChange = (text) => {
        this.setState({
            addressLine1: text,
            error: false,
            errorMessage: "",
        });
    };

    _onAddressTwoTextChange = (text) => {
        this.setState({
            addressLine2: text,
            error: false,
            errorMessage: "",
        });
    };

    _logAnalyticsEvent = (screenName) => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName,
        });
    };

    render() {
        const {
            errorMessage,
            showCountryScrollPicker,
            countries,
            selectedCountry,
            addressLine1,
            addressLine2,
            screenData,
            countryScrollPickerSelectedIndex,
        } = this.state;

        return (
            <>
                <ScreenContainer
                    backgroundType="color"
                    errorMessage={errorMessage}
                    analyticScreenName="M2U_TRF_Overseas_Bakong_4RecipientAddress"
                >
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typography
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text="Bakong"
                                    />
                                }
                                headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                            />
                        }
                        useSafeArea
                        paddingHorizontal={0}
                        paddingBottom={0}
                    >
                        <>
                            <KeyboardAwareScrollView
                                showsVerticalScrollIndicator={false}
                                enableOnAndroid={false}
                            >
                                <View style={Styles.container}>
                                    <View style={Styles.headerContainer}>
                                        <AccountDetailsView data={screenData} base64 greyed />
                                    </View>
                                    <View style={[Styles.textInputWrapper, Styles.fieldGutter]}>
                                        <Typography text="Address line 1" />
                                        <TextInput
                                            maxLength={35}
                                            isValidate={this.state.error}
                                            errorMessage={this.state.errorMessage}
                                            onChangeText={this._onAddressOneTextChange}
                                            value={addressLine1}
                                            editable
                                            placeholder="Enter recipient's address"
                                        />
                                        <View style={Styles.textInputCharRemaining}>
                                            <Typography
                                                text={35 - addressLine1.length}
                                                color={NEARYLY_DARK_GREY}
                                            />
                                        </View>
                                    </View>
                                    <View style={[Styles.textInputWrapper, Styles.fieldGutter]}>
                                        <Typography text="Address line 2" />
                                        <TextInput
                                            maxLength={35}
                                            isValidate={this.state.error}
                                            errorMessage={this.state.errorMessage}
                                            onChangeText={this._onAddressTwoTextChange}
                                            value={addressLine2}
                                            editable
                                            placeholder="Enter recipient's address"
                                        />
                                        <View style={Styles.textInputCharRemaining}>
                                            <Typography
                                                text={35 - addressLine2.length}
                                                color={NEARYLY_DARK_GREY}
                                            />
                                        </View>
                                    </View>
                                    <View style={Styles.fieldGutter}>
                                        <Typography
                                            letterSpacing={0}
                                            lineHeight={19}
                                            textAlign="left"
                                            text="Country"
                                        />
                                        <SpaceFiller height={10} />
                                        <Dropdown
                                            title={
                                                selectedCountry === ""
                                                    ? "Select Country"
                                                    : selectedCountry
                                            }
                                            align="left"
                                            onPress={this._onScrollPickerShow}
                                        />
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                            <FixedActionContainer>
                                <ActionButton
                                    disabled={
                                        selectedCountry === "" ||
                                        addressLine1 === "" ||
                                        addressLine2 === ""
                                    }
                                    fullWidth
                                    borderRadius={25}
                                    onPress={this.doneClick}
                                    backgroundColor={
                                        selectedCountry === "" ||
                                        addressLine1 === "" ||
                                        addressLine2 === ""
                                            ? DISABLED
                                            : YELLOW
                                    }
                                    componentCenter={
                                        <Typography
                                            color={
                                                selectedCountry === "" ||
                                                addressLine1 === "" ||
                                                addressLine2 === ""
                                                    ? DISABLED_TEXT
                                                    : BLACK
                                            }
                                            text="Continue"
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                    }
                                />
                            </FixedActionContainer>
                        </>
                    </ScreenLayout>
                </ScreenContainer>
                {showCountryScrollPicker && (
                    <ScrollPickerView
                        showMenu
                        list={countries}
                        selectedIndex={countryScrollPickerSelectedIndex}
                        onRightButtonPress={this._onScrollPickerDoneButtonPressed}
                        onLeftButtonPress={this._onScrollPickerDismissed}
                        rightButtonText="Done"
                        leftButtonText="Cancel"
                    />
                )}
            </>
        );
    }
}

BakongEnterRecipientAddress.propTypes = {
    navigation: PropTypes.shape({
        addListener: PropTypes.func,
        navigate: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            transferParams: PropTypes.shape({
                addressCountry: PropTypes.string,
                addressCountryCode: PropTypes.string,
                addressLine1: PropTypes.string,
                addressLine2: PropTypes.string,
                countries: PropTypes.array,
                image: PropTypes.string,
                mobileNo: PropTypes.any,
                name: PropTypes.string,
                transactionTo: PropTypes.string,
            }),
        }),
    }),
};

const Styles = {
    headerContainer: {
        paddingLeft: 12,
        paddingBottom: 24,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    contentContainerStyle: {
        flex: 1,
    },
    fieldGutter: {
        marginBottom: 24,
        width: "100%",
    },
    textInputWrapper: {
        alignItems: "flex-start",
        height: 90,
        justifyContent: "space-between",
        width: "100%",
    },
    textInputCharRemaining: { width: "100%", alignItems: "flex-end" },
};

export default BakongEnterRecipientAddress;
