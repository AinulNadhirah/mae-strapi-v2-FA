import React, { Component } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import Typography from "@components/Text";
import DropDownInput from "@components/Inputs/DropDownInput";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import ActionButton from "@components/Buttons/ActionButton";
import TextInput from "@components/TextInput";
import { ScrollPickerView } from "@components/Common";
import { FUNDTRANSFER_MODULE } from "@navigation/navigationConstant";
import { YELLOW, LIGHTER_YELLOW, BLACK, DISABLED_TEXT } from "@constants/colors";
import { getASNBNewTransferEnum, validateASNBNewTransferDetail } from "@services";
import { showErrorToast } from "@components/Toast";
import { logEvent } from "@services/analytics";
import { FA_SCREEN_NAME, FA_VIEW_SCREEN, FA_FORM_PROCEED, FA_FORM_ERROR } from "@constants/strings";

const DONE_LABEL = "Done";
const CANCEL_LABEL = "Cancel";
const SCREEN_NAME = "Transfer_ASNB_Information";

export default class ASNBNewTransferDetailsScreen extends Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    state = {
        //Product name scroll picker state
        showProductNameScrollPicker: false,
        productNameScrollPickerItems: [],
        productNameScrollPickerSelectedIndex: null,
        //ID Type scroll picker state
        showIDTypeScrollPicker: false,
        idTypeScrollPickerItems: [],
        idTypeScrollPickerSelectedIndex: null,
        //Relationship scroll picker state
        showRelationshipScrollPicker: false,
        relationshipScrollPickerSelectedIndex: null,
        relationshipScrollPickerItems: [],
        //Purpose scroll picker state
        showPurposeScrollPicker: false,
        purposeScrollPickerSelectedIndex: null,
        purposeScrollPickerItems: [],
        //Dropdown button state
        productNameSelectedItemValue: "Select",
        idTypeSelectedItemValue: "Select",
        relationshipSelectedItemValue: "Select",
        purposeSelectedItemValue: "Select",
        //ID number text field state
        idNumberValue: "",
        isIDNumberValueValid: true,
        idNumberValueErrorMessage: "",
        //Membership number text field state
        membershipNumberValue: "",
        isMembershipNumberValueValid: true,
        membershipNumberValueErrorMessage: "",
    };

    componentDidMount() {
        this._syncRemoteDataToState();
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: SCREEN_NAME,
        });
    }

    _handleHeaderBackButtonPressed = () => this.props.navigation.goBack();

    _syncRemoteDataToState = async () => {
        const response = await this._getASNBNewTransferEnum();
        const productNames = response?.data?.result?.productName ?? [];
        if (response)
            this.setState({
                productNameScrollPickerItems: productNames.map((product) => ({
                    name: product.fullName,
                    value: product.id,
                    productTransferMinAmount: product.minPaymentAmount,
                    productTransferMaxAmount: product.maxPaymentAmount,
                    payeeCode: product.payeeCode,
                })),
                idTypeScrollPickerItems: this._remapResponseObjectToDropdownObject(
                    response?.data?.result?.idType ?? []
                ),
                relationshipScrollPickerItems: this._remapResponseObjectToDropdownObject(
                    response?.data?.result?.relationship ?? []
                ),
                purposeScrollPickerItems: this._remapResponseObjectToDropdownObject(
                    response?.data?.result?.purposeTransfer ?? []
                ),
            });
    };

    _remapResponseObjectToDropdownObject = (enumArray) => {
        return enumArray.map((responseObject) => {
            return {
                name: responseObject.type,
                value: responseObject.id,
            };
        });
    };

    _getASNBNewTransferEnum = async () => {
        try {
            const request = await getASNBNewTransferEnum();
            if (request?.status === 200) return request;
            return null;
        } catch (error) {
            logEvent(FA_FORM_ERROR, {
                [FA_SCREEN_NAME]: SCREEN_NAME,
            });
            showErrorToast({
                message: "Please contact ASNB: 03-2057 3000 for further assistance.",
            });
            return null;
        }
    };

    _validateNewTransferDetails = async (transferDetail) => {
        try {
            const request = await validateASNBNewTransferDetail(transferDetail);
            if (request?.status === 200) return request;
            return null;
        } catch (error) {
            logEvent(FA_FORM_ERROR, {
                [FA_SCREEN_NAME]: SCREEN_NAME,
            });
            showErrorToast({
                message: error?.error?.error?.message ?? "",
            });
            return null;
        }
    };

    _handleScrollPickerCancelButtonPressed = () =>
        this.setState({
            showProductNameScrollPicker: false,
            showIDTypeScrollPicker: false,
            showRelationshipScrollPicker: false,
            showPurposeScrollPicker: false,
        });

    _handleProductNameDropDownPressed = () =>
        this.setState({
            showProductNameScrollPicker: true,
        });

    _handleProductNameSelection = (selectedItem, index) =>
        this.setState({
            showProductNameScrollPicker: false,
            productNameScrollPickerSelectedIndex: index,
            productNameSelectedItemValue: selectedItem.name,
        });

    _handleIDTypeDropDownPressed = () =>
        this.setState({
            showIDTypeScrollPicker: true,
        });

    _handleIDTypeSelection = (selectedItem, index) =>
        this.setState({
            showIDTypeScrollPicker: false,
            idTypeScrollPickerSelectedIndex: index,
            idTypeSelectedItemValue: selectedItem.name,
        });

    _handleRelationshipDropDownPressed = () =>
        this.setState({
            showRelationshipScrollPicker: true,
        });

    _handleRelationshipSelection = (selectedItem, index) =>
        this.setState({
            showRelationshipScrollPicker: false,
            relationshipScrollPickerSelectedIndex: index,
            relationshipSelectedItemValue: selectedItem.name,
        });

    _handlePurposeDropDownPressed = () =>
        this.setState({
            showPurposeScrollPicker: true,
        });

    _handlePurposeSelection = (selectedItem, index) =>
        this.setState({
            showPurposeScrollPicker: false,
            purposeScrollPickerSelectedIndex: index,
            purposeSelectedItemValue: selectedItem.name,
        });

    _isTextAlphanumericOnly = (text) => {
        const regex = RegExp(/^[a-zA-Z0-9]*$/, "i");
        return regex.test(text);
    };

    _isTextAlphanumericLengthMoreThanThree = (text) => {
        const regex = RegExp(/^[a-zA-Z0-9]{3,12}$/, "i");
        return regex.test(text);
    };

    _handleIDNumberTextInputUpdate = (text) =>
        this.setState({
            idNumberValue: text,
            isIDNumberValueValid: this._isTextAlphanumericOnly(text),
            idNumberValueErrorMessage: "ID number should be alphanumeric only.",
        });

    _handleIDNumberTextInputCompletion = ({ nativeEvent: { text } }) =>
        this.setState({
            isIDNumberValueValid: this._isTextAlphanumericLengthMoreThanThree(text),
            idNumberValueErrorMessage: "ID number must consist of minimum 5 characters.",
        });

    _handleMembershipNumberTextInputUpdate = (text) => {
        const textForDisplay = this._formatTextToAccountNumber(text);
        const result = this._isTextAlphanumericOnly(this._sanitizeText(text));
        this.setState({
            membershipNumberValue: textForDisplay,
            isMembershipNumberValueValid: result,
            membershipNumberValueErrorMessage:
                "Membership number must consist of numerical digits only.",
        });
    };

    _sanitizeText = (text) => {
        try {
            const charArray = text.split("");
            const sanitizedCharArray = [];
            charArray.forEach((char) => {
                if (char !== " ") sanitizedCharArray.push(char);
            });
            return sanitizedCharArray.join("");
        } catch (error) {
            return text;
        }
    };

    _formatTextToAccountNumber = (text) => {
        const sanitizedText = this._sanitizeText(text);
        const charArray = sanitizedText.split("");
        const formattedCharArray = [];
        charArray.forEach((char, index) => {
            if (Number.isInteger(index / 4) && index > 1) {
                formattedCharArray.push(" ");
            }
            formattedCharArray.push(char);
        });
        return formattedCharArray.join("");
    };

    _handleMembershipNumberTextInputCompletion = ({ nativeEvent: { text } }) =>
        this.setState({
            isMembershipNumberValueValid: this._isTextAlphanumericLengthMoreThanThree(
                this._sanitizeText(text)
            ),
            membershipNumberValueErrorMessage: "ID number must consist of minimum 12 characters.",
        });

    _isIndexValid = (index) => index !== null;

    _isTextLengthValid = (text) => text.length >= 3;

    _validateAllFormInput = () => {
        const {
            productNameScrollPickerSelectedIndex,
            idTypeScrollPickerSelectedIndex,
            relationshipScrollPickerSelectedIndex,
            purposeScrollPickerSelectedIndex,
            idNumberValue,
            isIDNumberValueValid,
            membershipNumberValue,
            isMembershipNumberValueValid,
        } = this.state;

        const isAllDropDownValid =
            this._isIndexValid(productNameScrollPickerSelectedIndex) &&
            this._isIndexValid(idTypeScrollPickerSelectedIndex) &&
            this._isIndexValid(relationshipScrollPickerSelectedIndex) &&
            this._isIndexValid(purposeScrollPickerSelectedIndex);

        const isAllTextInputValid =
            this._isTextLengthValid(idNumberValue) &&
            this._isTextLengthValid(membershipNumberValue);

        return (
            isAllDropDownValid &&
            isAllTextInputValid &&
            isIDNumberValueValid &&
            isMembershipNumberValueValid
        );
    };

    _generateNewASNBTransferParam = () => {
        const {
            productNameScrollPickerSelectedIndex,
            productNameScrollPickerItems,
            idTypeScrollPickerSelectedIndex,
            idTypeScrollPickerItems,
            relationshipScrollPickerSelectedIndex,
            relationshipScrollPickerItems,
            purposeScrollPickerSelectedIndex,
            purposeScrollPickerItems,
            idNumberValue,
            membershipNumberValue,
        } = this.state;

        return {
            productDetail: productNameScrollPickerItems[productNameScrollPickerSelectedIndex],
            idTypeDetail: idTypeScrollPickerItems[idTypeScrollPickerSelectedIndex],
            relationshipDetail:
                relationshipScrollPickerItems[relationshipScrollPickerSelectedIndex],
            purposeOfTransferDetail: purposeScrollPickerItems[purposeScrollPickerSelectedIndex],
            idNumberValue,
            membershipNumberValue: this._sanitizeText(membershipNumberValue),
        };
    };

    _handleNewASNBTransferDetailConfirmation = async () => {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: SCREEN_NAME,
        });
        const {
            navigation: { navigate },
            route: {
                params: { asnbTransferState },
            },
        } = this.props;
        const {
            membershipNumberValue,
            idNumberValue,
            relationshipScrollPickerSelectedIndex,
            relationshipScrollPickerItems,
            productNameScrollPickerItems,
            productNameScrollPickerSelectedIndex,
            idTypeScrollPickerItems,
            idTypeScrollPickerSelectedIndex,
        } = this.state;
        const response = await this._validateNewTransferDetails({
            asnbAccountDetail: {
                idNo: idNumberValue,
                idType: idTypeScrollPickerItems[idTypeScrollPickerSelectedIndex].value,
                membNo: this._sanitizeText(membershipNumberValue),
                payeeCode:
                    productNameScrollPickerItems[productNameScrollPickerSelectedIndex].payeeCode,
            },
            relationship: {
                id: relationshipScrollPickerItems[relationshipScrollPickerSelectedIndex].value,
            },
        });
        if (response?.data?.code === 200) {
            navigate(FUNDTRANSFER_MODULE, {
                screen: "ASNBTransferAmountScreen",
                params: {
                    asnbTransferState: {
                        beneficiaryName: response?.data?.result?.benefName ?? "-",
                        isOwnAccountTransfer: response?.data?.result?.acctTyp === "1",
                        isNewTransfer: true,
                        ...this._generateNewASNBTransferParam(),
                        ...(asnbTransferState?.selectedCASAAccountNumber && {
                            selectedCASAAccountNumber: asnbTransferState.selectedCASAAccountNumber,
                        }),
                    },
                },
            });
            return;
        }
        showErrorToast({ message: response?.data?.message ?? "" });
    };

    render() {
        const {
            idNumberValue,
            isIDNumberValueValid,
            idNumberValueErrorMessage,

            membershipNumberValue,
            isMembershipNumberValueValid,
            membershipNumberValueErrorMessage,

            productNameSelectedItemValue,
            idTypeSelectedItemValue,
            relationshipSelectedItemValue,
            purposeSelectedItemValue,

            showProductNameScrollPicker,
            productNameScrollPickerItems,
            productNameScrollPickerSelectedIndex,

            showIDTypeScrollPicker,
            idTypeScrollPickerItems,
            idTypeScrollPickerSelectedIndex,

            showRelationshipScrollPicker,
            relationshipScrollPickerItems,
            relationshipScrollPickerSelectedIndex,

            showPurposeScrollPicker,
            purposeScrollPickerItems,
            purposeScrollPickerSelectedIndex,
        } = this.state;

        const isFormValid = this._validateAllFormInput();

        return (
            <>
                <ScreenContainer backgroundType="color">
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typography
                                        text="Transfer"
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                    />
                                }
                                headerLeftElement={
                                    <HeaderBackButton
                                        onPress={this._handleHeaderBackButtonPressed}
                                    />
                                }
                            />
                        }
                        useSafeArea
                        paddingHorizontal={0}
                        paddingBottom={0}
                    >
                        <>
                            <ScrollView
                                style={styles.container}
                                contentContainerStyle={styles.contentContainerStyle}
                                showsVerticalScrollIndicator={false}
                            >
                                <DropDownInput
                                    label="Product Name"
                                    title={productNameSelectedItemValue}
                                    onPress={this._handleProductNameDropDownPressed}
                                />
                                <SpaceFiller height={24} />
                                <DropDownInput
                                    label="ID type for ASNB member"
                                    title={idTypeSelectedItemValue}
                                    onPress={this._handleIDTypeDropDownPressed}
                                />
                                <SpaceFiller height={24} />
                                <View style={styles.textInputWrapper}>
                                    <Typography text="ID number for ASNB member" />
                                    <TextInput
                                        clearButtonMode="while-editing"
                                        importantForAutofill="no"
                                        returnKeyType="done"
                                        editable
                                        value={idNumberValue}
                                        isValidate
                                        isValid={isIDNumberValueValid}
                                        errorMessage={idNumberValueErrorMessage}
                                        maxLength={12}
                                        placeholder="Enter ID number"
                                        onChangeText={this._handleIDNumberTextInputUpdate}
                                        onSubmitEditing={this._handleIDNumberTextInputCompletion}
                                        onBlur={this._handleIDNumberTextInputCompletion}
                                    />
                                </View>
                                <SpaceFiller height={isIDNumberValueValid ? 24 : 50} />
                                <View style={styles.textInputWrapper}>
                                    <Typography text="Membership number" />
                                    <TextInput
                                        clearButtonMode="while-editing"
                                        importantForAutofill="no"
                                        returnKeyType="done"
                                        editable
                                        value={membershipNumberValue}
                                        isValidate
                                        isValid={isMembershipNumberValueValid}
                                        errorMessage={membershipNumberValueErrorMessage}
                                        placeholder="Enter membership no"
                                        onChangeText={this._handleMembershipNumberTextInputUpdate}
                                        onSubmitEditing={
                                            this._handleMembershipNumberTextInputCompletion
                                        }
                                        onBlur={this._handleMembershipNumberTextInputCompletion}
                                        maxLength={14}
                                    />
                                </View>
                                <SpaceFiller height={isMembershipNumberValueValid ? 24 : 50} />
                                <DropDownInput
                                    label="Relationship"
                                    title={relationshipSelectedItemValue}
                                    onPress={this._handleRelationshipDropDownPressed}
                                />
                                <SpaceFiller height={24} />
                                <DropDownInput
                                    label="Purpose of transfer"
                                    title={purposeSelectedItemValue}
                                    onPress={this._handlePurposeDropDownPressed}
                                />
                            </ScrollView>
                            <FixedActionContainer>
                                <ActionButton
                                    fullWidth
                                    disabled={!isFormValid}
                                    componentCenter={
                                        <Typography
                                            text="Continue"
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            color={isFormValid ? BLACK : DISABLED_TEXT}
                                        />
                                    }
                                    backgroundColor={isFormValid ? YELLOW : LIGHTER_YELLOW}
                                    onPress={this._handleNewASNBTransferDetailConfirmation}
                                />
                            </FixedActionContainer>
                        </>
                    </ScreenLayout>
                </ScreenContainer>
                <ScrollPickerView
                    showMenu={showProductNameScrollPicker}
                    list={productNameScrollPickerItems}
                    selectedIndex={productNameScrollPickerSelectedIndex ?? 0}
                    onRightButtonPress={this._handleProductNameSelection}
                    onLeftButtonPress={this._handleScrollPickerCancelButtonPressed}
                    rightButtonText={DONE_LABEL}
                    leftButtonText={CANCEL_LABEL}
                />
                <ScrollPickerView
                    showMenu={showIDTypeScrollPicker}
                    list={idTypeScrollPickerItems}
                    selectedIndex={idTypeScrollPickerSelectedIndex ?? 0}
                    onRightButtonPress={this._handleIDTypeSelection}
                    onLeftButtonPress={this._handleScrollPickerCancelButtonPressed}
                    rightButtonText={DONE_LABEL}
                    leftButtonText={CANCEL_LABEL}
                />
                <ScrollPickerView
                    showMenu={showRelationshipScrollPicker}
                    list={relationshipScrollPickerItems}
                    selectedIndex={relationshipScrollPickerSelectedIndex ?? 0}
                    onRightButtonPress={this._handleRelationshipSelection}
                    onLeftButtonPress={this._handleScrollPickerCancelButtonPressed}
                    rightButtonText={DONE_LABEL}
                    leftButtonText={CANCEL_LABEL}
                />
                <ScrollPickerView
                    showMenu={showPurposeScrollPicker}
                    list={purposeScrollPickerItems}
                    selectedIndex={purposeScrollPickerSelectedIndex ?? 0}
                    onRightButtonPress={this._handlePurposeSelection}
                    onLeftButtonPress={this._handleScrollPickerCancelButtonPressed}
                    rightButtonText={DONE_LABEL}
                    leftButtonText={CANCEL_LABEL}
                />
            </>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 36,
    },
    contentContainerStyle: { paddingBottom: 50 },
    textInputWrapper: {
        alignItems: "flex-start",
        height: 70,
        justifyContent: "space-between",
        width: "100%",
    },
});
