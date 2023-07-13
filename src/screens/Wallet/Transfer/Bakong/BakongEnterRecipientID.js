import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { AccountDetailsView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import ScrollPicker from "@components/Pickers/ScrollPicker";
import Typography from "@components/Text";
import TextInput from "@components/TextInput";
import { errorToastProp, showErrorToast } from "@components/Toast";

import ApiManager from "@services/ApiManager";
import { logEvent } from "@services/analytics";

import { METHOD_GET, TIMEOUT, TOKEN_TYPE_M2U } from "@constants/api";
import {
    BLACK,
    DISABLED,
    DISABLED_TEXT,
    MEDIUM_GREY,
    PINKISH_GREY,
    YELLOW,
} from "@constants/colors";
import { FA_SCREEN_NAME, FA_VIEW_SCREEN } from "@constants/strings";
import { BAKONG_ENDPOINT } from "@constants/url";

import { alphaNumericNoSpaceRegex } from "@utils/dataModel";
import { formatBakongMobileNumbers } from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

class BakongEnterRecipientID extends Component {
    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
        this.state = {
            loader: false,
            screenData: {
                image: "",
                name: "",
                description1: "",
                description2: "",
            },
            error: false,
            errorMessage: "",
            transferParams: {},
            showNationalityScrollPicker: false,
            nationalities: [],
            // form data
            selectedNationality: this.props.transferParams?.recipientNationality ?? "CAMBODIA",
            selectedNationalityCode: this.props.transferParams?.recipientNationalityCode ?? "KHM",
            idType: "NID", // NID || Passport
            idNumber: "",
        };
    }

    /***
     * componentDidMount
     * Update Screen date
     */
    async componentDidMount() {
        console.log("[BakongEnterRecipientID] >> [componentDidMount] : ");

        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            console.log("[BakongEnterRecipientID] >> [componentDidMount] focusSubscription : ");
            this.updateData();
            this._getCountries();
        });

        // Analytics - view_screen
        this._logAnalyticsEvent("M2U_TRF_Overseas_Bakong_3RecipientDetails");
    }

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {
        console.log("[BakongEnterRecipientID] >> [componentWillUnmount] : ");
        this.focusSubscription();
    }

    /***
     * updateData
     * Update Screen Data upon screen focused
     */
    async updateData() {
        const transferParams = this.props.route.params.transferParams;
        console.log("[BakongEnterRecipientID] >> [updateData] transferParams==> ", transferParams);

        const screenData = {
            image: transferParams.image,
            name: "+855 " + formatBakongMobileNumbers(transferParams.mobileNo),
            description1: transferParams.name,
            description2: transferParams.transactionTo,
        };
        console.log("[BakongEnterRecipientID] >> [updateData] screenData ==> ", screenData);

        this.setState({
            transferParams: transferParams,
            screenData: screenData,
            selectedNationality: transferParams.recipientNationality ?? "CAMBODIA",
            selectedNationalityCode: transferParams.recipientNationalityCode ?? "KHM",
            idType: transferParams.recipientIdType ?? "NID",
            idNumber: transferParams.recipientIdNumber ?? "",
        });
    }

    /***
     * _getCountries
     * Get list of countries/nationalities from api
     */
    _getCountries = async () => {
        try {
            this.setState({ loader: true });
            const response = await ApiManager.service({
                url: `${BAKONG_ENDPOINT}/countries/passportcodes`,
                data: null,
                reqType: METHOD_GET,
                tokenType: TOKEN_TYPE_M2U,
                timeout: TIMEOUT,
                promptError: false,
                showPreloader: false,
            });
            console.log("[_getCountries] response: ", response);

            // array mapping
            const nationalities = response.data.resultList.map((country, index) => ({
                title: country.type,
                value: index,
                desc: country.desc,
            }));

            const { selectedNationality, selectedNationalityCode } = this.state;

            this.setState({
                nationalities,
                loader: false,
                // select cambodia by default
                selectedNationality: selectedNationality === "" ? "CAMBODIA" : selectedNationality,
                selectedNationalityCode:
                    selectedNationalityCode === "" ? "KHM" : selectedNationalityCode,
            });
        } catch (error) {
            showErrorToast(
                errorToastProp({
                    message:
                        error.message ?? "Unable to fetch list of countries. Please try again.",
                })
            );
            ErrorLogger(error);

            // go back
            this.props.navigation.goBack();
        }
    };

    doneClick = () => {
        console.log("[BakongEnterRecipientID] >> [doneClick] : ");
        const { selectedNationality, selectedNationalityCode, idType, idNumber } = this.state;

        const idNumberTrimmed = idNumber.trim();
        const validate = alphaNumericNoSpaceRegex(idNumberTrimmed);

        if (validate) {
            let { transferParams, nationalities } = this.state;
            transferParams.recipientNationality = selectedNationality;
            transferParams.recipientNationalityCode = selectedNationalityCode;
            transferParams.recipientIdType = idType;
            transferParams.recipientIdNumber = idNumberTrimmed;
            transferParams.countries = nationalities;

            console.log(
                "[BakongEnterRecipientID] >> [doneClick] transferParams ==> ",
                transferParams
            );
            this.props.navigation.navigate("BakongEnterRecipientAddress", {
                transferParams: { ...transferParams },
            });
        } else {
            showErrorToast(
                errorToastProp({
                    message:
                        idType === "NID"
                            ? "National ID should be alphanumeric only."
                            : "Passport should be alphanumeric only.",
                })
            );
        }
    };

    _onBackPress = () => {
        console.log("[BakongEnterRecipientID] >> [_onBackPress] : ");
        const { transferParams } = this.state;
        this.props.navigation.navigate("BakongEnterAmount", {
            transferParams: { ...transferParams },
        });
        // this.props.navigation.goBack();
    };

    _onScrollPickerShow = () => {
        this._logAnalyticsEvent("M2U_TRF_Overseas_Bakong_3.1Nationality");
        this.setState({ showNationalityScrollPicker: true });
    };

    _onScrollPickerDismissed = () => this.setState({ showNationalityScrollPicker: false });

    _onScrollPickerDoneButtonPressed = (value) => {
        const { nationalities } = this.state;

        this.setState({
            selectedNationality: nationalities[value].title,
            selectedNationalityCode: nationalities[value].desc,
            showNationalityScrollPicker: false,
        });
    };

    _onTextChange = (text) => {
        this.setState({
            idNumber: text,
            error: false,
            errorMessage: "",
        });
    };

    _onNIDSelected = () => this.setState({ idType: "NID" });

    _onPassportSelected = () => this.setState({ idType: "Passport" });

    _logAnalyticsEvent = (screenName) => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName,
        });
    };

    render() {
        const {
            showErrorModal,
            errorMessage,
            loader,
            showNationalityScrollPicker,
            nationalities,
            selectedNationality,
            idType,
            idNumber,
        } = this.state;
        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    showErrorModal={showErrorModal}
                    errorMessage={errorMessage}
                    showLoaderModal={loader}
                    showOverlay={showNationalityScrollPicker}
                    backgroundColor={MEDIUM_GREY}
                    // analyticScreenName="M2U_TRF_Overseas_Bakong_3RecipientDetails"
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
                        <React.Fragment>
                            <ScrollView showsHorizontalScrollIndicator={false}>
                                <View style={Styles.container}>
                                    <View style={Styles.headerContainer}>
                                        <AccountDetailsView
                                            data={this.state.screenData}
                                            base64
                                            greyed
                                        />
                                    </View>

                                    <View style={Styles.formBodyContainer}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={19}
                                            color={BLACK}
                                            textAlign="left"
                                            text="Recipient's Nationality"
                                        />

                                        <View style={Styles.formEditableContainer}>
                                            <View style={Styles.dropdownInputContainer}>
                                                <Dropdown
                                                    title={
                                                        selectedNationality === ""
                                                            ? "Select Country"
                                                            : selectedNationality
                                                    }
                                                    align="left"
                                                    onPress={this._onScrollPickerShow}
                                                />
                                            </View>
                                        </View>

                                        <Typography
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={19}
                                            color={BLACK}
                                            textAlign="left"
                                            text="Recipient's ID Type"
                                        />

                                        <View style={Styles.formEditableContainer}>
                                            <TouchableOpacity
                                                style={Styles.radioButtonContainer}
                                                onPress={this._onNIDSelected}
                                            >
                                                {idType === "NID" ? (
                                                    <RadioChecked checkType="color" />
                                                ) : (
                                                    <RadioUnchecked />
                                                )}

                                                <View style={Styles.radioButtonTitle}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={19}
                                                        color={BLACK}
                                                        textAlign="left"
                                                        text="National ID"
                                                    />
                                                </View>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={Styles.radioButtonContainer}
                                                onPress={this._onPassportSelected}
                                            >
                                                {idType === "Passport" ? (
                                                    <RadioChecked checkType="color" />
                                                ) : (
                                                    <RadioUnchecked />
                                                )}

                                                <View style={Styles.radioButtonTitle}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={19}
                                                        color={BLACK}
                                                        textAlign="left"
                                                        text="Passport"
                                                    />
                                                </View>
                                            </TouchableOpacity>
                                        </View>

                                        <Typography
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={19}
                                            color={BLACK}
                                            textAlign="left"
                                            text={
                                                idType === "NID" ? "National ID number" : "Passport"
                                            }
                                        />

                                        <View style={Styles.formEditableContainer}>
                                            <View style={Styles.inputContainer}>
                                                <TextInput
                                                    maxLength={15}
                                                    isValidate={this.state.error}
                                                    errorMessage={this.state.errorMessage}
                                                    onChangeText={this._onTextChange}
                                                    value={idNumber}
                                                    editable
                                                    placeholder={
                                                        idType === "NID"
                                                            ? "Enter national ID number"
                                                            : "Enter passport"
                                                    }
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </ScrollView>
                            <FixedActionContainer>
                                <ActionButton
                                    disabled={selectedNationality === "" || idNumber === ""}
                                    fullWidth
                                    borderRadius={25}
                                    onPress={this.doneClick}
                                    backgroundColor={
                                        selectedNationality === "" || idNumber === ""
                                            ? DISABLED
                                            : YELLOW
                                    }
                                    componentCenter={
                                        <Typography
                                            color={
                                                selectedNationality === "" || idNumber === ""
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
                        </React.Fragment>
                    </ScreenLayout>
                </ScreenContainer>
                <ScrollPicker
                    showPicker={showNationalityScrollPicker}
                    items={nationalities}
                    onDoneButtonPressed={this._onScrollPickerDoneButtonPressed}
                    onCancelButtonPressed={this._onScrollPickerDismissed}
                />
            </React.Fragment>
        );
    }
}

BakongEnterRecipientID.propTypes = {
    navigation: PropTypes.shape({
        addListener: PropTypes.func,
        goBack: PropTypes.func,
        navigate: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            transferParams: PropTypes.shape({
                image: PropTypes.any,
                mobileNo: PropTypes.any,
                name: PropTypes.any,
                recipientIdNumber: PropTypes.string,
                recipientIdType: PropTypes.string,
                recipientNationality: PropTypes.string,
                recipientNationalityCode: PropTypes.string,
                transactionTo: PropTypes.any,
            }),
        }),
    }),
    transferParams: PropTypes.shape({
        recipientNationality: PropTypes.string,
        recipientNationalityCode: PropTypes.string,
    }),
};

const Styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
        paddingEnd: 38,
        paddingStart: 36,
        marginBottom: 60,
    },
    formBodyContainer: {
        paddingTop: 26,
    },
    formEditableContainer: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 4,
        marginBottom: 32,
        width: "100%",
    },
    headerContainer: {
        justifyContent: "flex-start",
    },
    dropdownInputContainer: { flex: 1, marginTop: 8 },
    inputContainer: { flex: 1 },
    touchableCurrencyContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomColor: PINKISH_GREY,
        borderBottomWidth: 1,
        paddingVertical: 13,
        marginRight: 14,
    },
    radioButtonContainer: { flexDirection: "row", marginRight: 40, marginTop: 16 },
    radioButtonTitle: { marginLeft: 12 },
};

export default BakongEnterRecipientID;
