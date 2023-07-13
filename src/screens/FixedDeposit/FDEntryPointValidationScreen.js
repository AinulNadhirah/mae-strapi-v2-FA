import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet } from "react-native";

import {
    FIXED_DEPOSIT_STACK,
    BANKINGV2_MODULE,
    MAE_WALLET_SETUP,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typography from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { withModelContext } from "@context";

import {
    getFDPlacementType,
    bankingGetDataMayaM2u,
    checkOperationTime,
    maeStepupCusEnquiry,
    invokeL3,
    getJointFDProductCode,
} from "@services";

import {
    COMMON_ERROR_MSG,
    FA_APPLY_FIXEDDEPOSIT_DEPOSITTYPE,
    FA_FIXED_DEPOSIT_DETAILS,
    FA_MAYBANK2U,
    STEPUP_BRANCH_VISIT,
} from "@constants/strings";

class FDEntryPointValidationScreen extends Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        getModel: PropTypes.func.isRequired,
        updateModel: PropTypes.func.isRequired,
        route: PropTypes.object.isRequired,
    };

    state = {
        showLoaderModal: true,
        isMAEConventionalAccountHolder: false,
        isAllCASAAccountTypeJoint: false,
        maeConventionalAccountsDetails: null,
        showPopUp: false,
        popupTitle: "",
        popupDesc: "",
        popupType: "",
        popupPrimaryActionText: "",
    };

    componentDidMount() {
        this._handleNavigationToFlowStartingPoint();
    }

    _navigateToEntryPoint = () => {
        const {
            route: {
                params: { fdEntryPointModule, fdEntryPointScreen },
            },
            navigation: { navigate },
        } = this.props;
        navigate(fdEntryPointModule, {
            screen: fdEntryPointScreen,
        });
    };

    _handleNavigationToFlowStartingPoint = async () => {
        const {
            navigation: { replace },
            route: { params },
            getModel,
        } = this.props;
        const fdPlacementType = await this._getFDPlacementType({
            from: "",
            type: "",
        });
        const data = fdPlacementType?.data;

        if (!data) {
            this._navigateToEntryPoint();
            return;
        }

        const { serviceAccess, serviceAccessDesc } = data;

        if (!serviceAccess) {
            showInfoToast({
                message: serviceAccessDesc ?? COMMON_ERROR_MSG,
            });
            this._navigateToEntryPoint();
            return;
        }

        const { isPostPassword } = getModel("auth");

        if (!isPostPassword) {
            const l3Response = await this._requestL3Permission();

            if (l3Response?.data?.code !== 0) {
                this._navigateToEntryPoint();
                return;
            }
        }

        const casaAccounts = await this._getAccounts();

        if (!casaAccounts) {
            this._navigateToEntryPoint();
            return;
        }

        const accounts = casaAccounts?.data?.result?.accountListings ?? [];

        if (!accounts?.length) {
            this.setState({
                isAllCASAAccountTypeJoint: casaAccounts?.data?.result?.jointAccAvailable,
                showLoaderModal: false,
            });
            return;
        }

        const nonMaeAccounts = accounts.filter(
            (account) =>
                !(
                    account.group?.toUpperCase?.() === "0YD" ||
                    account.group?.toUpperCase?.() === "CCD"
                )
        );

        if (!nonMaeAccounts.length) {
            const maeConventionalAccounts = accounts.filter((account) => {
                const isDebitAccount = account.type?.toUpperCase?.() === "D";
                const isMAEConventionalAccount = account.group?.toUpperCase?.() === "0YD";
                return isDebitAccount && isMAEConventionalAccount;
            });
            if (maeConventionalAccounts.length)
                this.setState({
                    showLoaderModal: false,
                    isMAEConventionalAccountHolder: true,
                    maeConventionalAccountsDetails: maeConventionalAccounts[0],
                });
            else
                this.setState({
                    showLoaderModal: false,
                });
            return;
        }

        const getFDAccountsRequest = await this._getFDAccounts();
        if (!getFDAccountsRequest) {
            this._navigateToEntryPoint();
            return;
        }

        const getJointFDProductCodeRequest = await this._getJointFDProductCode();
        if (!getJointFDProductCodeRequest) {
            this._navigateToEntryPoint();
            return;
        }

        replace(FIXED_DEPOSIT_STACK, {
            screen: "FDProductDetailsScreen",
            params: {
                ...params,
                fdDetails: {
                    ...params.fdDetails,
                    ...data,
                },
                fdAccounts: getFDAccountsRequest?.data?.result?.accountListings ?? [],
                accounts: accounts.filter(
                    ({ type, group }) => !(type === "D" && (group === "0YD" || group === "CCD"))
                ),
                fdJointProductCodes: Object.keys(getJointFDProductCodeRequest?.data ?? {}),
            },
        });
    };

    _getAccounts = async () => {
        try {
            const response = await bankingGetDataMayaM2u(
                "/summary?type=A&filterJointAcc=true",
                false
            );

            if (response?.status === 200) return response;

            return null;
        } catch (error) {
            showErrorToast({ message: error?.message });
            return null;
        }
    };

    _getFDPlacementType = async (payload) => {
        try {
            const response = await getFDPlacementType(payload);
            if (response?.status === 200) return response;
            return null;
        } catch (error) {
            showErrorToast({ message: error?.message });
            return null;
        }
    };

    _getJointFDProductCode = async () => {
        try {
            const response = await getJointFDProductCode();
            if (response?.status === 200) return response;
            return null;
        } catch (error) {
            showErrorToast({ message: error?.message });
            return null;
        }
    };

    _getFDAccounts = async () => {
        try {
            const response = await bankingGetDataMayaM2u("/summary?type=F&checkMae=false", false);
            if (response?.status === 200) return response;
            return null;
        } catch (error) {
            showErrorToast({ message: error?.message });
            return null;
        }
    };

    _onHeaderBackButtonPressed = () => this.props.navigation.goBack();

    _onActionButtonPressed = () => {
        if (this.state.isMAEConventionalAccountHolder) this._handleStepUpNavigation();
        else this.props.navigation.goBack();
    };

    _getStepUpOperationTimeDetails = async () => {
        try {
            const response = await checkOperationTime(false, {
                requestType: "stepup",
            });
            if (response.status === 200) return response;
            return null;
        } catch (error) {
            showErrorToast({ message: error?.message });
            return null;
        }
    };

    _getMAEOperationTime = async () => {
        const stepUpOperationTimeRequest = await this._getStepUpOperationTimeDetails();
        if (!stepUpOperationTimeRequest) {
            this.setState({ showLoaderModal: false });
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
            return null;
        }
        const operationTimeDetails = stepUpOperationTimeRequest?.data?.result;
        if (operationTimeDetails?.statusCode !== "0000") {
            showErrorToast({
                message: operationTimeDetails?.statusDesc ?? COMMON_ERROR_MSG,
            });
            return { isWithinOperationalTime: false, operationTimeDetails };
        }
        return { isWithinOperationalTime: true, operationTimeDetails };
    };

    _getMAEStepUpStatus = async (payload) => {
        try {
            const response = await maeStepupCusEnquiry(payload);
            if (response.status === 200) return response;
            return null;
        } catch (error) {
            showErrorToast({ message: error?.message });
            return null;
        }
    };

    _getMAEStepUpStatusDetails = async (maeAcctNo) => {
        const request = await this._getMAEStepUpStatus({ maeAcctNo });
        const result = request?.data?.result;
        if (!result) {
            this.setState({ showLoaderModal: false });
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
            return null;
        }
        return {
            ...result,
            statusDescription: result?.statusDesc ?? COMMON_ERROR_MSG,
        };
    };

    _requestL3Permission = async () => {
        try {
            const response = await invokeL3(false);
            if (response?.status === 200) return response;
            return null;
        } catch (error) {
            return null;
        }
    };

    _handleStepUpNavigation = async () => {
        this.setState({ showLoaderModal: true });
        const {
            getModel,
            updateModel,
            route: {
                params: { fdEntryPointModule, fdEntryPointScreen },
            },
        } = this.props;
        const { isPostPassword } = getModel("auth");
        const { maeConventionalAccountsDetails } = this.state;
        const maeAcctNo = maeConventionalAccountsDetails?.number?.substring?.(0, 12);

        const maeOperationTimeDetails = await this._getMAEOperationTime();
        if (!maeOperationTimeDetails) return;
        const { isWithinOperationalTime, operationTimeDetails } = maeOperationTimeDetails;
        if (!isWithinOperationalTime) return;

        const maeStepUpStatusDetails = await this._getMAEStepUpStatusDetails(maeAcctNo);
        if (!maeStepUpStatusDetails) return;
        const { stepUpIndicator, statusDescription, ...otherStepUpDetails } =
            maeStepUpStatusDetails;

        if (stepUpIndicator === "0") {
            if (!isPostPassword) {
                const l3Response = await this._requestL3Permission();
                if (l3Response?.data?.code !== 0) {
                    this.setState({ showLoaderModal: false });
                    return;
                }
            }

            updateModel({
                fixedDeposit: {
                    placementEntryPointModule: fdEntryPointModule,
                    placementEntryPointScreen: fdEntryPointScreen,
                },
            });

            this.props.navigation.navigate(BANKINGV2_MODULE, {
                screen: MAE_WALLET_SETUP,
                params: {
                    stepup_details: {
                        ...otherStepUpDetails,
                        maeAcctNo,
                    },
                    idType: otherStepUpDetails?.idType,
                    routeFrom: "",
                    trinityFlag: operationTimeDetails?.trinityFlag ?? "",
                },
            });
        } else if (stepUpIndicator === "1")
            this.setState({
                showPopUp: true,
                popupTitle: "Activate Your Account",
                popupDesc: STEPUP_BRANCH_VISIT,
                popupType: "stepup",
                popupPrimaryActionText: "Got It",
            });
        else
            showErrorToast({
                message: statusDescription,
            });
        this.setState({ showLoaderModal: false });
    };

    _handlePopUpDismissal = () => {
        this.setState({
            showPopUp: false,
            popupTitle: "",
            popupDesc: "",
            popupType: "",
            popupPrimaryActionText: "",
        });
    };

    _generateTitle = () => {
        const { isMAEConventionalAccountHolder, isAllCASAAccountTypeJoint } = this.state;
        if (isMAEConventionalAccountHolder) return "Step Up Account";
        else if (isAllCASAAccountTypeJoint) return "Individual Savings/Current Account Required";
        else return "Savings/Current Account Required";
    };

    _generateDescription = () => {
        const { isMAEConventionalAccountHolder, isAllCASAAccountTypeJoint } = this.state;
        const prefix =
            "A savings or current account is required to make a fixed deposit placement.";
        if (isMAEConventionalAccountHolder)
            return `${prefix} You can step up your MAE account to an M2U Premier account.`;
        else if (isAllCASAAccountTypeJoint)
            return "An individual savings or current account is required to make a fixed deposit placement.";
        else return prefix;
    };

    render() {
        const {
            showLoaderModal,
            isMAEConventionalAccountHolder,
            showPopUp,
            popupDesc,
            popupTitle,
            popupPrimaryActionText,
        } = this.state;

        const {
            route: {
                params: { fdEntryPointScreen },
            },
        } = this.props;
        const analyticScreenName =
            fdEntryPointScreen === "Apply"
                ? FA_APPLY_FIXEDDEPOSIT_DEPOSITTYPE
                : fdEntryPointScreen === "Maybank2u"
                ? FA_MAYBANK2U
                : fdEntryPointScreen === "BankingL2Screen"
                ? FA_FIXED_DEPOSIT_DETAILS
                : "";

        return (
            <>
                <ScreenContainer
                    backgroundType="color"
                    showLoaderModal={showLoaderModal}
                    analyticScreenName={analyticScreenName}
                >
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerRightElement={
                                    !showLoaderModal ? (
                                        <HeaderCloseButton
                                            onPress={this._onHeaderBackButtonPressed}
                                        />
                                    ) : null
                                }
                            />
                        }
                    >
                        <>
                            <Typography
                                text={this._generateTitle()}
                                fontSize={18}
                                fontWeight="bold"
                                lineHeight={28}
                                textAlign="left"
                            />
                            <SpaceFiller height={13} />
                            <Typography
                                text={this._generateDescription()}
                                textAlign="left"
                                lineHeight={18}
                            />
                            <View style={styles.spacer} />
                            <ActionButton
                                componentCenter={
                                    <Typography
                                        text={
                                            isMAEConventionalAccountHolder ? "Step Up Now" : "Done"
                                        }
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                                onPress={this._onActionButtonPressed}
                            />
                        </>
                    </ScreenLayout>
                </ScreenContainer>
                <Popup
                    visible={showPopUp}
                    title={popupTitle}
                    description={popupDesc}
                    onClose={this._handlePopUpDismissal}
                    primaryAction={{
                        text: popupPrimaryActionText,
                        onPress: this._handlePopUpDismissal,
                    }}
                />
            </>
        );
    }
}

const styles = StyleSheet.create({
    spacer: { flex: 1 },
});

export default withModelContext(FDEntryPointValidationScreen);
