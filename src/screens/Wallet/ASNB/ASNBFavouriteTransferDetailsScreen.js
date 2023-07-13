import PropTypes from "prop-types";
import React, { Component } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { FUNDTRANSFER_MODULE } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import DropDownInput from "@components/Inputs/DropDownInput";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typography from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { getASNBNewTransferEnum, validateASNBNewTransferDetail } from "@services";

import { YELLOW, LIGHTER_YELLOW, BLACK, DISABLED_TEXT } from "@constants/colors";
import { TRANSFER_TO_HEADER } from "@constants/strings";

const DONE_LABEL = "Done";
const CANCEL_LABEL = "Cancel";

export default class ASNBFavouriteTransferDetailsScreen extends Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    state = {
        //Relationship scroll picker state
        showRelationshipScrollPicker: false,
        relationshipScrollPickerSelectedIndex: null,
        relationshipScrollPickerItems: [],
        //Purpose scroll picker state
        showPurposeScrollPicker: false,
        purposeScrollPickerSelectedIndex: null,
        purposeScrollPickerItems: [],
        //Dropdown button state
        relationshipSelectedItemValue: "Select",
        purposeSelectedItemValue: "Select",
    };

    componentDidMount() {
        this._syncRemoteDataToState();
    }

    _handleHeaderBackButtonPressed = () => this.props.navigation.goBack();

    _syncRemoteDataToState = async () => {
        const response = await this._getASNBNewTransferEnum();
        if (response)
            this.setState({
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
            showErrorToast({
                message: error?.error?.error?.message ?? "",
            });
            return null;
        }
    };

    _handleScrollPickerCancelButtonPressed = () =>
        this.setState({
            showRelationshipScrollPicker: false,
            showPurposeScrollPicker: false,
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

    _isIndexValid = (index) => index !== null;

    _validateAllFormInput = () => {
        const { relationshipScrollPickerSelectedIndex, purposeScrollPickerSelectedIndex } =
            this.state;

        return (
            this._isIndexValid(relationshipScrollPickerSelectedIndex) &&
            this._isIndexValid(purposeScrollPickerSelectedIndex)
        );
    };

    _generateNewASNBTransferParam = () => {
        const {
            relationshipScrollPickerSelectedIndex,
            relationshipScrollPickerItems,
            purposeScrollPickerSelectedIndex,
            purposeScrollPickerItems,
        } = this.state;

        return {
            ...this.props.route.params.asnbTransferState,
            relationshipDetail:
                relationshipScrollPickerItems[relationshipScrollPickerSelectedIndex],
            purposeOfTransferDetail: purposeScrollPickerItems[purposeScrollPickerSelectedIndex],
        };
    };

    _handleFavouriteASNBTransferDetailConfirmation = async () => {
        const {
            navigation: { navigate },
            route: {
                params: { asnbTransferState },
            },
        } = this.props;
        navigate(FUNDTRANSFER_MODULE, {
            screen: "ASNBTransferAmountScreen",
            params: {
                asnbTransferState: {
                    isNewTransfer: false,
                    ...this._generateNewASNBTransferParam(),
                    ...(asnbTransferState?.selectedCASAAccountNumber && {
                        selectedCASAAccountNumber: asnbTransferState.selectedCASAAccountNumber,
                    }),
                },
            },
        });
    };

    render() {
        const {
            relationshipSelectedItemValue,
            purposeSelectedItemValue,
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
                                        text={TRANSFER_TO_HEADER}
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
                                    onPress={this._handleFavouriteASNBTransferDetailConfirmation}
                                />
                            </FixedActionContainer>
                        </>
                    </ScreenLayout>
                </ScreenContainer>
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
});
