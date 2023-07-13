import numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { ScrollView, StyleSheet, View, Image } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import GridButtons from "@components/Common/GridButtons";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ProductHoldingsListItem from "@components/ListItems/ProductHoldingsListItem";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typography from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { bankingGetDataMayaM2u } from "@services";

import { GREEN, WHITE, GREY } from "@constants/colors";

import { formateAccountNumber } from "@utils/dataModel/utility";

import Assets from "@assets";

export default class FDCertificateDetailsScreen extends Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    state = {
        showLoader: true,
        certificateDropdownValue: "",
        showCertificateScrollPicker: false,
        certificateScrollPickerItems: [],
        certificateScrollPickerSelectedIndex: 0,
        certificateDetails: null,
        fdAccountDetails: null,
    };

    componentDidMount() {
        this._hydrateScreen();
    }

    _hydrateScreen = async () => {
        const fdAccountDetails = await this._getFDAccountDetails();
        if (!fdAccountDetails) {
            showErrorToast({ message: "Unable to retrieve account information." });
            this.props.navigation.goBack();
            return;
        }
        const { number, group } = fdAccountDetails;
        const fdAccountCertificatesRequest = await this._getFDAccountCertificates(number);
        const certificateDetails = fdAccountCertificatesRequest?.data?.fdCertificates ?? [];
        const newCertificateDetails = certificateDetails.pop();
        const certificates = [newCertificateDetails, ...certificateDetails];
        const newCertificateNumber = newCertificateDetails.certificateNo;
        const certificateDetailRequest = await this._getCertificateDetails(
            number,
            newCertificateNumber,
            group
        );

        this.setState({
            showLoader: false,
            certificateScrollPickerItems:
                certificates.map(({ certificateNo }, index) => {
                    return {
                        name: `Certificate ${certificateNo}`,
                        certificateNo,
                        fdAccountNumber: number,
                        fdAccountGroup: group,
                        index,
                    };
                }) ?? [],
            certificateDropdownValue: `Certificate ${newCertificateNumber}` ?? "",
            certificateDetails: certificateDetailRequest?.data,
            fdAccountDetails,
        });
    };

    _navigateToEntryPoint = () => {
        const {
            route: {
                params: { fdEntryPointModule, fdEntryPointScreen, firstTimeFd },
            },
            navigation: { navigate },
        } = this.props;

        if (!firstTimeFd) {
            navigate("TabNavigator", {
                screen: "Tab",
                params: {
                    screen: "Maybank2u",
                    params: {
                        index: 2,
                    },
                },
            });
            return;
        }

        this.props.navigation.navigate(fdEntryPointModule, {
            screen: fdEntryPointScreen,
        });
    };

    _navigateToProductDetailScreen = () => {
        const {
            route: {
                params: { fdEntryPointModule, fdEntryPointScreen },
            },
        } = this.props;

        this.props.navigation.navigate("FDEntryPointValidationScreen", {
            fdEntryPointModule,
            fdEntryPointScreen,
            fdDetails: {
                selectedFDAccountDetails: this.state.fdAccountDetails,
            },
        });
    };

    _getNewlyCreatedFDAccountDetails = (fdAccounts) => {
        const {
            route: {
                params: { existingFDAccounts },
            },
        } = this.props;
        const index = fdAccounts.findIndex(
            ({ number }) =>
                existingFDAccounts.findIndex(
                    ({ number: existingAccountNumber }) => existingAccountNumber === number
                ) === -1
        );
        if (index !== -1) return fdAccounts[index];
        else return null;
    };

    _getFDAccountDetails = async () => {
        const {
            route: {
                params: { selectedFDAccountDetails },
            },
        } = this.props;

        const request = await this._getFDAccounts();
        const fdAccounts = request?.data?.result?.accountListings ?? [];
        let fdAccountDetails = null;
        if (selectedFDAccountDetails) {
            const index = fdAccounts.findIndex(
                ({ number }) => number === selectedFDAccountDetails.number
            );
            if (index !== -1) fdAccountDetails = fdAccounts[index];
        } else fdAccountDetails = this._getNewlyCreatedFDAccountDetails(fdAccounts);
        return fdAccountDetails;
    };

    _getFDAccounts = async () => {
        try {
            const response = await bankingGetDataMayaM2u(`/summary?type=F&checkMae=false`);
            if (response?.status === 200) return response;
            return null;
        } catch (error) {
            showErrorToast({ message: error?.message });
            return null;
        }
    };

    _getFDAccountCertificates = async (fdAccountNumber) => {
        try {
            const response = await bankingGetDataMayaM2u(
                `/details/fd/certificates?acctNo=${fdAccountNumber}`
            );
            if (response?.status === 200) return response;
            return null;
        } catch (error) {
            showErrorToast({ message: error?.message });
            return null;
        }
    };

    _getCertificateDetails = async (fdAccountNumber, certificateNumber, fdAccountGroup) => {
        try {
            const response = await bankingGetDataMayaM2u(
                `/details/fd/certificate/details?acctNo=${fdAccountNumber}&certificateNo=${certificateNumber}&group=${fdAccountGroup}`
            );
            if (response?.status === 200) return response;
            return null;
        } catch (error) {
            showErrorToast({ message: error?.message });
            return null;
        }
    };

    _showScrollPicker = () =>
        this.setState({
            showCertificateScrollPicker: true,
        });

    _hideScrollPicker = () =>
        this.setState({
            showCertificateScrollPicker: false,
        });

    _updateCertificateSelection = async (
        { name, certificateNo, fdAccountGroup, fdAccountNumber },
        index
    ) => {
        const request = await this._getCertificateDetails(
            fdAccountNumber,
            certificateNo,
            fdAccountGroup
        );
        this.setState({
            showCertificateScrollPicker: false,
            certificateDropdownValue: name,
            certificateScrollPickerSelectedIndex: index,
            certificateDetails: request?.data,
        });
    };

    _renderFDAccountDetails = () => {
        const { fdAccountDetails } = this.state;

        return (
            <View style={styles.accountSummary}>
                <Typography
                    text={fdAccountDetails?.name ?? "-"}
                    fontSize={16}
                    fontWeight="600"
                    lineHeight={19}
                />
                <SpaceFiller height={8} />
                <Typography
                    text={
                        fdAccountDetails?.number
                            ? formateAccountNumber(fdAccountDetails.number, 12)
                            : "-"
                    }
                    lineHeight={18}
                />
                <SpaceFiller height={8} />
                <Typography
                    text={`RM ${numeral(fdAccountDetails?.value ?? 0).format("0,0.00") ?? ""}`}
                    fontSize={18}
                    fontWeight="bold"
                    lineHeight={32}
                    color={GREEN}
                />
            </View>
        );
    };

    _renderSelectedCertificateDetails = () => {
        const { certificateDetails } = this.state;

        if (!certificateDetails) return null;

        const tenure = certificateDetails?.tenure ?? 0;

        return (
            <View style={styles.details}>
                <ProductHoldingsListItem
                    title="Total principal amount"
                    isString
                    string={certificateDetails?.principalAmountFormatted ?? ""}
                />
                <ProductHoldingsListItem
                    title="Account holder's name"
                    isString
                    string={certificateDetails?.certificateName?.split?.(",")?.join?.("\n") ?? ""}
                />
                <ProductHoldingsListItem
                    title={"Term"}
                    isString
                    string={`${tenure} month${tenure > 1 ? "s" : ""}`}
                />
                {certificateDetails?.dividendRateFormatted && (
                    <ProductHoldingsListItem
                        title={certificateDetails?.islamic ? "Profit rate" : "Interest rate"}
                        isString
                        string={certificateDetails?.dividendRateFormatted ?? ""}
                    />
                )}
                <ProductHoldingsListItem
                    title={"Maturity date"}
                    isString
                    string={certificateDetails?.maturityDate ?? ""}
                />
                <ProductHoldingsListItem
                    title={
                        certificateDetails?.islamic
                            ? "Profit payment mode"
                            : "Interest payment mode"
                    }
                    isString
                    string={
                        certificateDetails?.interestPaymentModeFormatted
                            ? certificateDetails?.interestPaymentModeFormatted
                            : "-"
                    }
                />
                <ProductHoldingsListItem
                    title="Instruction on maturity"
                    isString
                    string={certificateDetails?.instructionOnMaturityFormatted}
                />
            </View>
        );
    };

    render() {
        const {
            certificateScrollPickerItems,
            certificateScrollPickerSelectedIndex,
            certificateDropdownValue,
            showCertificateScrollPicker,
            showLoader,
        } = this.state;

        return (
            <>
                <ScreenContainer backgroundType="color" showLoaderModal={showLoader}>
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerRightElement={
                                    <HeaderCloseButton onPress={this._navigateToEntryPoint} />
                                }
                            />
                        }
                        useSafeArea
                        paddingHorizontal={0}
                        paddingBottom={0}
                    >
                        <ScrollView
                            style={styles.container}
                            contentContainerStyle={styles.contentContainer}
                            showsVerticalScrollIndicator={false}
                        >
                            {this._renderFDAccountDetails()}
                            <View style={styles.gridButtons}>
                                <View style={styles.gridButtonGutter}>
                                    <GridButtons
                                        data={{
                                            title: "Make a placement",
                                            source: Assets.qrPay,
                                        }}
                                        callback={this._navigateToProductDetailScreen}
                                    />
                                </View>
                            </View>
                            <ActionButton
                                fullWidth
                                backgroundColor={WHITE}
                                borderWidth={1}
                                borderColor={GREY}
                                componentLeft={
                                    <View style={styles.dropDownComponents}>
                                        <Typography text={certificateDropdownValue} />
                                    </View>
                                }
                                componentRight={
                                    certificateScrollPickerItems.length > 1 ? (
                                        <View style={styles.dropDownComponents}>
                                            <Image
                                                source={Assets.downArrow}
                                                style={styles.fdActionButtonImage}
                                            />
                                        </View>
                                    ) : null
                                }
                                onPress={this._showScrollPicker}
                                disabled={certificateScrollPickerItems.length <= 1}
                            />
                            {this._renderSelectedCertificateDetails()}
                        </ScrollView>
                    </ScreenLayout>
                </ScreenContainer>

                {showCertificateScrollPicker && (
                    <ScrollPickerView
                        showMenu
                        list={certificateScrollPickerItems}
                        selectedIndex={certificateScrollPickerSelectedIndex}
                        onRightButtonPress={this._updateCertificateSelection}
                        onLeftButtonPress={this._hideScrollPicker}
                        rightButtonText="Done"
                        leftButtonText="Cancel"
                    />
                )}
            </>
        );
    }
}

const styles = StyleSheet.create({
    accountSummary: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
    },
    details: {
        flex: 1,
        marginTop: 24,
    },
    dropDownComponents: {
        marginHorizontal: 24,
    },
    fdActionButtonImage: { height: 8, width: 16 },
    gridButtonGutter: { paddingLeft: 10 },
    gridButtons: {
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 24,
    },
});
