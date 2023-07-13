/* eslint-disable react/jsx-no-bind */
import AsyncStorage from "@react-native-community/async-storage";
import { isEmpty } from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { View, TouchableOpacity, Image, StyleSheet, Dimensions, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";

import {
    ATM_CASHOUT_STACK,
    ATM_AMOUNT_SCREEN,
    ATM_PREFERRED_AMOUNT,
    QR_STACK,
    ATM_WITHDRAW_CONFIRMATION,
    TAB,
    TAB_NAVIGATOR,
    DASHBOARD,
    CASHOUT_FAVOURITE,
    BANKINGV2_MODULE,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";
import { TopMenu } from "@components/TopMenu";

import { withModelContext } from "@context";

import {
    cancelOrTimeoutRequest,
    checkAtmOnboarding,
    combinedATMActions,
    invokeL2,
} from "@services";

import {
    MEDIUM_GREY,
    YELLOW,
    GREY,
    WHITE,
    LIGHT_GREY,
    DARK_GREY,
    BLACK,
    ROYAL_BLUE,
} from "@constants/colors";
import { ATM_QR, COMMON_ERROR_MSG, PREFERRED_AMOUNT } from "@constants/strings";

import { getDeviceRSAInformation } from "@utils/dataModel/utility";
import { errorCodeMap } from "@utils/errorMap";
import { ErrorLogger } from "@utils/logs";

import Images from "@assets";

const CloseButton = ({ onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.closeButton}>
        <Image source={Images.icCloseBlack} style={styles.closeButtonIcon} />
    </TouchableOpacity>
);

CloseButton.propTypes = {
    onPress: PropTypes.func,
};

const styles = StyleSheet.create({
    addIconBtn: {
        backgroundColor: WHITE,
        borderColor: GREY,
        borderRadius: 10,
        borderWidth: 1,
        flexDirection: "row",
        height: 50,
        marginBottom: 10,
        marginHorizontal: 10,
        marginTop: 10,
        paddingLeft: 15,
        paddingVertical: 12,
    },
    bgImg: { height: 320, marginTop: isIPhoneSmall ? 20 : 0, width: "110%" },
    // body: {
    //     display: "block",
    //     height: "90%",
    // },
    btn: {
        alignItems: "center",
        alignSelf: "center",
        bottom: Platform.OS === "ios" ? 12 : 20,
        flex: 1,
        justifyContent: "center",
        // marginBottom: 40,
        position: "absolute",
        width: "100%",
    },
    closeButton: {
        alignItems: "center",
        height: 44,
        justifyContent: "center",
        width: 44,
    },
    closeButtonIcon: {
        height: 17,
        width: 17,
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
    },
    deleteIcon: {
        alignSelf: "center",
        marginLeft: "auto",
        padding: 10,
    },
    description: {
        marginBottom: 10,
    },
    disabled: {
        color: LIGHT_GREY,
    },
    footerButtonTextContainer: {
        marginTop: 2,
    },
    footerButtonTextContainer2: {
        marginVertical: 10,
        height: 20,
    },
    footerLeftButtonContainer: {
        flexDirection: "row",
    },
    iconAdd: {
        height: 16,
        marginRight: 10,
        marginTop: 5,
        width: 16,
    },
    iconDelete: {
        height: 10,
        marginRight: 15,
        width: 10,
    },
    layout: { flex: 1, paddingHorizontal: 25 },
    mb20: {
        bottom: "8.5%",
        position: "absolute",
        zIndex: -1,
    },
    mb40: {
        bottom: "2.5%",
        paddingBottom: 5,
        position: "absolute",
        zIndex: -1,
    },
    mt20: {
        marginTop: 20,
    },
    mt25: {
        marginTop: 25,
    },
    text: { marginHorizontal: 30, top: -25 },
});
const { width } = Dimensions.get("window");

const X_WIDTH = 375;

const isIPhoneSmall = Platform.OS === "ios" && width <= X_WIDTH;
class PreferredAmount extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
    };
    constructor(props) {
        super(props);
        this.state = {
            preferredAmountList: this.props?.route.params?.preferredAmountList ?? [],
            menuArray: [],
            showMenu: false,
            editMode: false,
            didPerformAddOrUpdate: false,
            selectedItem: null,
            isLoading: false,
            custName: "",
            hideAddbtn: false,
            hasScannedQR: props.route.params?.routeFrom === ATM_QR,
        };
    }

    componentDidMount() {
        this.initData();
    }

    initData = async () => {
        const { isPostLogin } = this.props.getModel("auth");
        if (!isPostLogin) {
            const request = await this._requestL2Permission();
            if (request) {
                this._getPreferredAmountList();
                return;
            }
            this.setState({ isLoading: false });
            this.props.navigation.goBack();
        } else {
            this._getPreferredAmountList();
        }
    };
    componentDidUpdate(pProps) {
        console.info("PreferredAmount >> componentDidUpdate >>  ", this.props.route.params);
        if (this.props.route.params?.fromPNS) {
            this.setState({ isLoading: true });
            this._getPreferredAmountList();
        } else if (
            this.props.route.params?.didPerformAddOrUpdate &&
            this.props.route.params?.preferredAmountList
        ) {
            this.setState({ isLoading: true });
            console.info("PreferredAmount >> componentDidUpdate >>  ", this.props.route.params);
            this.updatePreferredAmountList(
                this.state.preferredAmountList.length >
                    this.props.route.params?.preferredAmountList.length
            );
        } else if (
            this.props.route.params?.didPerformWithdrawal &&
            this.props.route.params?.didPerformWithdrawal !==
                pProps.route.params?.didPerformWithdrawal
        ) {
            this._onClickAmount("new", "Add Preferred Amount");
        }
    }
    updatePreferredAmountList = (needsUpdate) => {
        this.setState({ isLoading: true });
        if (!needsUpdate) {
            this._getPreferredAmountList();
        }
        this.setState(
            {
                didPerformAddOrUpdate: true,
                preferredAmountList: needsUpdate
                    ? this.props.route.params?.preferredAmountList
                    : this.state.preferredAmountList,
            },
            async () => {
                await this.props.navigation.setParams({
                    preferredAmountList: [],
                    didPerformAddOrUpdate: false,
                });
            }
        );
        this.setState({ isLoading: false });
    };
    _getPreferredAmountList = async (addOrUpdate) => {
        this.setState({ isLoading: true });
        const { atmCashOutReady } = this.props.getModel("misc");
        const { isEnabled, isOnboarded } = this.props.getModel("atm");
        console.info("PreferredAmount >> _getPreferredAmountList ");
        try {
            if (this.props.route.params.fromPNS) {
                this.props.navigation.setParams({
                    fromPNS: false,
                });
            }
            const response = await checkAtmOnboarding(true);
            if (response?.status === 200) {
                const { code, result } = response?.data;
                const preferredList = result?.preferred_amount
                    ? JSON.parse(result?.preferred_amount)
                    : null;
                console.info("PreferredAmount >> checkAtmOnboarding ", response?.data);
                if (code === 200 && !isEmpty(preferredList)) {
                    const newArr = preferredList;
                    const listOfAmount = newArr.sort((a, b) => {
                        return b.id - a.id;
                    });
                    this.setState(
                        {
                            hideAddbtn: listOfAmount.length > 0,
                            preferredAmountList: listOfAmount,
                            didPerformAddOrUpdate: addOrUpdate,
                            custName: result?.customerName,
                            isLoading: false,
                        },
                        async () => {
                            if (code === 200) {
                                if (result?.status === "ACTIVE" && !isEnabled && !isOnboarded) {
                                    showInfoToast({
                                        message:
                                            "For security purposes, you will be able to use this feature to withdraw cash 24 hours after your first set up. Please try again later.",
                                    });
                                } else if (atmCashOutReady && result?.status === "ACTIVE") {
                                    await AsyncStorage.setItem("isAtmOnboarded", "true");
                                }
                                this.props.updateModel({
                                    atm: {
                                        preferredAmount: listOfAmount,
                                        isOnboarded: atmCashOutReady && result?.status === "ACTIVE",
                                        serviceFee: result?.feeCharge,
                                    },
                                });
                                this.props.navigation.setParams({
                                    is24HrCompleted: atmCashOutReady && result?.status === "ACTIVE",
                                });
                            }
                        }
                    );
                } else {
                    if (code === 200) {
                        if (
                            (result?.status === "ACTIVE" && !isEnabled && !isOnboarded) ||
                            result?.status === "PENDING"
                        ) {
                            showInfoToast({
                                message:
                                    "For security purposes, you will be able to use this feature to withdraw cash 24 hours after your first set up. Please try again later.",
                            });
                        }
                        this.setState({
                            hideAddbtn: false,
                            custName: result?.customerName,
                            didPerformAddOrUpdate: addOrUpdate,
                            preferredAmountList: [],
                            isLoading: false,
                        });
                        this.props.navigation.setParams({
                            is24HrCompleted: atmCashOutReady && result?.status === "ACTIVE",
                        });
                    }
                }
            }
        } catch (err) {
            this.setState({ isLoading: false });
            console.info("err >> ", err);
            const exObj = errorCodeMap(err);
            showErrorToast({ message: exObj?.message ?? COMMON_ERROR_MSG });
        }
    };

    requestTodelete = (el) => {
        this.setState({
            popupVisible: true,
            selectedItem: el,
        });
    };

    _removePreferredAmount = async () => {
        this.setState({ popupVisible: false }, async () => {
            const removeObj = this.state.selectedItem;
            const deviceInfo = this.props.getModel("device");
            const mobileSDKData = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
            let param = {
                mobileSDKData,
                requestType: "QRCLW_002",
            };
            this.state.preferredAmountList
                .sort((a, b) => {
                    return a.id - b.id;
                })
                .forEach((el) => {
                    if (removeObj.id !== el.id) {
                        param["preferredAmount" + el?.id] = el?.amount;
                    } else {
                        param["preferredAmount" + removeObj?.id] = "";
                        param["amount"] = removeObj?.amount;
                        param["action"] = "DELETE";
                        param["accountNo"] = removeObj?.accountNo;
                    }
                });

            const listUpdated = this.state.preferredAmountList.filter((prefAmt) => {
                return prefAmt.id !== removeObj?.id;
            });
            const list = listUpdated.map((obj, i) => {
                return {
                    ...obj,
                    id: parseInt(i) + 1,
                };
            });
            const listOfAmount = list.sort((a, b) => {
                return b.id - a.id;
            });
            param["preferredAmount"] = JSON.stringify(listOfAmount);
            await this._updatePreferredAmountApi(param, "remove");
        });
    };

    _updatePreferredAmountApi = async (params, isNew) => {
        try {
            if (isNew !== "new") {
                const response = await combinedATMActions(params);
                console.log("#### combinedATMActions", response?.data?.result);
                if (response?.data?.code === 200) {
                    this.props.navigation.setParams({
                        preferredAmountList: [],
                        didPerformAddOrUpdate: false,
                    });
                    this._getPreferredAmountList(true);
                    if (isNew === "remove") {
                        this.setState({ selectedItem: null });
                        showInfoToast({
                            message: `Preferred withdrawal amount deleted successfully.`,
                        });
                    } else {
                        showInfoToast({
                            message: `Preferred withdrawal amount ${
                                isNew === "new" ? "added" : "updated"
                            } successfully.`,
                        });
                    }
                }
            } else {
                this.setState({ didPerformAddOrUpdate: false }, () => {
                    this.props.navigation.navigate(ATM_CASHOUT_STACK, {
                        screen: CASHOUT_FAVOURITE,
                        params: {
                            apiParams: params,
                            isNew,
                            routeFrom: PREFERRED_AMOUNT,
                            custName: this.state.custName,
                            currentList: this.state.preferredAmountList,
                        },
                    });
                });
            }
        } catch (error) {
            console.log("combinedATMActions:error", error);
            showErrorToast({
                message: error?.message,
            });
        }
    };
    _requestL2Permission = async () => {
        try {
            const response = await invokeL2(false);
            this.setState({ isLoading: true });
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            this.setState({ isLoading: false });
            return null;
        }
    };
    showMenu = () => {
        console.log("[PreferredAmount] >> [showMenu]");

        const menuArray = [
            {
                menuLabel: "Manage Preferred Amount",
                menuParam: "MANAGE_PREFERRED_AMOUNT",
            },
        ];
        this.setState({ showMenu: true, menuArray });
    };

    closeMenu = () => {
        console.log("[PreferredAmount] >> [closeMenu]");
        this.setState({ showMenu: false });
    };

    onTopMenuItemPress = (param) => {
        console.log("[PreferredAmount >> param: " + param);

        this.setState({ editMode: true, showMenu: false });
        // Hide menu
        this.closeMenu();
    };

    goBack = () => {
        const { route, navigation } = this.props;
        console.log("[PreferredAmount >> param: ", route?.params);
        this.cancelWithdrawal(route?.params, navigation);
    };

    _onClickAmount = (action, amountObj) => {
        if (
            (!this.state.editMode &&
                amountObj !== "Other Amounts" &&
                amountObj !== "Add Preferred Amount") ||
            (action === "update" && this.props?.route?.params?.routeFrom === ATM_QR)
        ) {
            console.log(
                "#### _onClickAmount this.props.route.params",
                this.props.route.params,
                action,
                amountObj,
                this.state.editMode
            );
            const modValue = Number(amountObj?.amount?.replace(/,/g, ""));
            if (modValue && modValue % 50 === 0 && modValue <= 1500) {
                if (this.props?.route?.params?.routeFrom === ATM_QR) {
                    this.props?.navigation?.navigate(ATM_CASHOUT_STACK, {
                        screen: ATM_WITHDRAW_CONFIRMATION,
                        params: {
                            ...this.props.route.params,
                            transferAmount: modValue,
                            isPreferred: action === "update" && amountObj?.amount ? true : false,
                            // routeFrom: ATM_QR
                            accountNo: amountObj?.accountNo,
                            selectedAccount: this.props.route.params?.selectedAccount ?? {
                                acctNo: amountObj?.accountNo,
                                number: amountObj?.accountNo,
                                acctName: amountObj?.accountName,
                            },
                            custName: this.state.custName,
                            preferredAmountList: this.props?.route?.params?.preferredAmountList,
                        },
                    });
                } else if (!this.state.editMode) {
                    this.props.navigation.navigate(QR_STACK, {
                        screen: "QrMain",
                        params: {
                            origin: this.props.route.params?.origin ?? ATM_PREFERRED_AMOUNT,
                            routeFrom:
                                this.props.route.params?.routeFrom === ATM_QR
                                    ? ATM_QR
                                    : PREFERRED_AMOUNT,
                            transferAmount: modValue,
                            isPreferred: true,
                            custName: this.state.custName,
                            amountObj,
                            selectedAccount: {
                                acctNo: amountObj?.accountNo,
                                number: amountObj?.accountNo,
                                acctName: amountObj?.accountName,
                            },
                            primary: true,
                            settings: false,
                            fromRoute: "",
                            fromStack: "",
                            data:
                                this.props.route.params?.originStack === BANKINGV2_MODULE
                                    ? this.props.route.params?.data
                                    : null,

                            currentList: this.state.preferredAmountList,
                        },
                    });
                }
            }
        } else {
            this.setState({ didPerformAddOrUpdate: false }, () => {
                this.props.navigation.navigate(ATM_CASHOUT_STACK, {
                    screen: ATM_AMOUNT_SCREEN,
                    params: {
                        ...this.props.route.params,
                        selectedAccount:
                            this.props.route.params?.selectedAccount &&
                            this.props.route.params?.originStack === BANKINGV2_MODULE
                                ? this.props.route.params?.selectedAccount
                                : null,
                        routeFrom:
                            action === "new" && this.props.route.params.routeFrom === ATM_QR
                                ? ATM_QR
                                : PREFERRED_AMOUNT,
                        action: amountObj === "Other Amounts" ? amountObj : action,
                        amountObj:
                            amountObj === "Add Preferred Amount" && this.props.route.params?.data
                                ? {
                                      accountName: this.props.route.params?.data?.acctName,
                                      accountNo: this.props.route.params?.data?.acctNo,
                                  }
                                : amountObj,
                        editMode: this.state.editMode,
                        currentList: this.state.preferredAmountList,
                        custName: this.state.custName,
                    },
                });
            });
        }
    };

    cancelWithdrawal = async (params, navigation) => {
        const { qrText, refNo, routeFrom } = params;
        if (routeFrom === ATM_QR && qrText && refNo) {
            try {
                await cancelOrTimeoutRequest({
                    qrtext: qrText,
                    refNo,
                    referenceNo: refNo,
                });
            } catch (e) {
                console.log("[PreferredAmount] >> cancelWithdrawal ex", e);
            }
        }

        if (this.state.editMode) {
            this.setState({ editMode: false });
        } else if (params?.originStack) {
            navigation.navigate(params?.originStack, {
                screen: params?.origin,
                params: {
                    ...params,
                    data: null,
                    qrtText: null,
                    refNo: null,
                },
            });
        } else {
            navigation.navigate(TAB_NAVIGATOR, {
                screen: TAB,
                params: {
                    screen: DASHBOARD,
                    params: { refresh: true },
                },
            });
        }
    };

    _closeEditMode = () => {
        this.setState({ editMode: false });
    };

    _handleConfirm = (isFromQrPay) => {
        if (isFromQrPay) {
            this.setState({ didPerformAddOrUpdate: false }, () => {
                this.props.navigation.navigate(ATM_CASHOUT_STACK, {
                    screen: ATM_AMOUNT_SCREEN,
                    params: {
                        ...this.props.route.params,
                        routeFrom:
                            this.props.route.params.routeFrom === ATM_QR
                                ? ATM_QR
                                : PREFERRED_AMOUNT,
                        editMode: this.state.editMode,
                        currentList: this.state.preferredAmountList,
                        custName: this.state.custName,
                    },
                });
            });
        } else {
            this.props.navigation.navigate(QR_STACK, {
                screen: "QrMain",
                params: {
                    ...this.props.route.params,
                    transferAmount: null,
                    qrText: null,
                    refNo: null,
                    mins: null,
                    timestamp: null,
                    origin: ATM_PREFERRED_AMOUNT,
                    fromRoute: ATM_PREFERRED_AMOUNT,
                    routeFrom: ATM_PREFERRED_AMOUNT,
                    selectedAmount: "",
                    custName: this.state.custName,
                    primary: true,
                    settings: false,
                    fromStack: "",
                    data:
                        this.props.route.params?.originStack === BANKINGV2_MODULE
                            ? this.props.route.params?.data
                            : null,
                    currentList: this.state.preferredAmountList,
                },
            });
        }
    };

    handleClosePopup = () => {
        this.setState({ popupVisible: false });
    };

    render() {
        const {
            params: { is24HrCompleted, routeFrom },
        } = this.props.route;
        const { preferredAmountList, showMenu, menuArray, editMode, popupVisible, hasScannedQR } =
            this.state;

        return (
            <>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showLoaderModal={this.state.isLoading}
                >
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerLeftElement={
                                    !editMode ? <HeaderBackButton onPress={this.goBack} /> : null
                                }
                                headerCenterElement={
                                    <Typo
                                        text={editMode ? "Manage" : "ATM Cash-out"}
                                        fontWeight="600"
                                        fontSize={16}
                                        lineHeight={19}
                                    />
                                }
                                headerRightElement={
                                    preferredAmountList?.length <= 0 &&
                                    !editMode ? null : editMode ? (
                                        <HeaderCloseButton onPress={this._closeEditMode} />
                                    ) : (
                                        <HeaderDotDotDotButton onPress={this.showMenu} />
                                    )
                                }
                            />
                        }
                        paddingHorizontal={0}
                        paddingBottom={0}
                        paddingTop={0}
                        useSafeArea
                    >
                        <View
                            style={styles.container}
                            contentContainerStyle={styles.contentContainer}
                        >
                            <View style={styles.layout}>
                                <View style={styles.body}>
                                    <View style={styles.description}>
                                        <Typo
                                            fontSize={18}
                                            fontWeight="500"
                                            lineHeight={22}
                                            text={
                                                editMode
                                                    ? `Tap to edit or delete your preferred withdrawal amount.`
                                                    : `Select your preferred amount before making a withdrawal`
                                            }
                                            textAlign="left"
                                            style={styles.mt25}
                                        />
                                        {!editMode && preferredAmountList?.length === 0 ? (
                                            <Typo
                                                fontSize={14}
                                                fontWeight="400"
                                                lineHeight={21}
                                                text={`Find yourself withdrawing the same amount on a regular basis? Save your preferred amounts for future withdrawals.`}
                                                textAlign="left"
                                                style={styles.mt20}
                                            />
                                        ) : null}
                                    </View>
                                    {preferredAmountList
                                        .sort((a, b) => {
                                            return b.id - a.id;
                                        })
                                        .map((el, key) => {
                                            if (key < 3) {
                                                return (
                                                    <TouchableOpacity
                                                        style={styles.addIconBtn}
                                                        key={key}
                                                        onPress={() => {
                                                            // if (editMode) {
                                                            this._onClickAmount("update", el);
                                                            // }
                                                        }}
                                                    >
                                                        <View>
                                                            <View
                                                                style={
                                                                    styles.footerLeftButtonContainer
                                                                }
                                                            >
                                                                <Typo
                                                                    fontSize={16}
                                                                    lineHeight={24}
                                                                    fontWeight="600"
                                                                    text={`RM ${el.amount}`}
                                                                    textAlign="left"
                                                                    color={
                                                                        editMode
                                                                            ? ROYAL_BLUE
                                                                            : BLACK
                                                                    }
                                                                />
                                                            </View>
                                                        </View>
                                                        {editMode ? (
                                                            <TouchableOpacity
                                                                style={styles.deleteIcon}
                                                                onPress={() => {
                                                                    this.requestTodelete(el);
                                                                }}
                                                            >
                                                                <Image
                                                                    style={styles.iconDelete}
                                                                    source={
                                                                        Images.icon32BlackRemove
                                                                    }
                                                                />
                                                            </TouchableOpacity>
                                                        ) : null}
                                                    </TouchableOpacity>
                                                );
                                            }
                                        })}
                                    {!editMode && preferredAmountList?.length > 0 && (
                                        <TouchableOpacity
                                            style={styles.addIconBtn}
                                            disabled={!is24HrCompleted}
                                            onPress={() =>
                                                this._handleConfirm(
                                                    this.props.route.params.routeFrom === ATM_QR
                                                )
                                            }
                                        >
                                            <View style={styles.footerLeftButtonContainer}>
                                                <Typo
                                                    fontSize={16}
                                                    lineHeight={24}
                                                    fontWeight="600"
                                                    text="Other amounts"
                                                    style={!is24HrCompleted && styles.disabled}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                    {(preferredAmountList?.length === 0 &&
                                        !(
                                            (hasScannedQR || preferredAmountList?.length > 2) &&
                                            !editMode
                                        )) ||
                                    (editMode && preferredAmountList?.length < 3) ? (
                                        <TouchableOpacity
                                            disabled={!is24HrCompleted}
                                            style={styles.addIconBtn}
                                            onPress={() =>
                                                this._onClickAmount(
                                                    "new",
                                                    (hasScannedQR ||
                                                        preferredAmountList?.length > 2) &&
                                                        !editMode
                                                        ? "Other Amounts"
                                                        : "Add Preferred Amount"
                                                )
                                            }
                                        >
                                            <View style={styles.footerLeftButtonContainer}>
                                                {!(
                                                    (hasScannedQR ||
                                                        preferredAmountList?.length > 2) &&
                                                    !editMode
                                                ) &&
                                                    is24HrCompleted && (
                                                        <Image
                                                            style={styles.iconAdd}
                                                            source={Images.icon32BlackAdd}
                                                        />
                                                    )}

                                                <View style={styles.footerButtonTextContainer}>
                                                    <Typo
                                                        fontSize={16}
                                                        lineHeight={24}
                                                        fontWeight="600"
                                                        text={
                                                            editMode
                                                                ? "Add new amount"
                                                                : (hasScannedQR ||
                                                                      preferredAmountList?.length >
                                                                          2) &&
                                                                  !editMode
                                                                ? "Other Amounts"
                                                                : "Add Preferred Amount"
                                                        }
                                                        style={!is24HrCompleted && styles.disabled}
                                                    />
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ) : null}
                                    {!editMode &&
                                        preferredAmountList?.length < 3 &&
                                        preferredAmountList?.length > 0 &&
                                        !(
                                            (hasScannedQR || preferredAmountList?.length > 2) &&
                                            !editMode
                                        ) && (
                                            <TouchableOpacity
                                                style={styles.footerButtonTextContainer2}
                                                onPress={() =>
                                                    this._onClickAmount(
                                                        "new",
                                                        "Add Preferred Amount"
                                                    )
                                                }
                                            >
                                                <Typo
                                                    fontSize={16}
                                                    lineHeight={18}
                                                    fontWeight="600"
                                                    text="Add Preferred Amount"
                                                    color={ROYAL_BLUE}
                                                    style={!is24HrCompleted && styles.disabled}
                                                />
                                            </TouchableOpacity>
                                        )}
                                </View>
                                {(editMode ||
                                    (routeFrom !== ATM_QR && preferredAmountList?.length === 0) ||
                                    (!editMode && preferredAmountList.length === 0)) && (
                                    <View style={styles.btn}>
                                        <ActionButton
                                            fullWidth
                                            disabled={!is24HrCompleted}
                                            borderRadius={25}
                                            onPress={
                                                editMode ? this._closeEditMode : this._handleConfirm
                                            }
                                            backgroundColor={!is24HrCompleted ? LIGHT_GREY : YELLOW}
                                            componentCenter={
                                                <Typo
                                                    text={editMode ? "Done" : "Scan Now"}
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    color={!is24HrCompleted ? DARK_GREY : BLACK}
                                                />
                                            }
                                        />
                                    </View>
                                )}
                            </View>
                        </View>
                    </ScreenLayout>
                    {editMode && popupVisible && (
                        <Popup
                            visible={popupVisible}
                            onClose={this.handleClosePopup}
                            title="Remove preferred amount"
                            description={
                                "Are you sure you want to remove your preferred withdrawal amount?"
                            }
                            primaryAction={{
                                text: "Confirm",
                                onPress: this._removePreferredAmount,
                            }}
                            secondaryAction={{
                                text: "Cancel",
                                onPress: this.handleClosePopup,
                            }}
                        />
                    )}

                    {!editMode && (
                        <View
                            style={
                                editMode ||
                                (routeFrom !== ATM_QR && preferredAmountList?.length === 0)
                                    ? styles.mb20
                                    : styles.mb40
                            }
                        >
                            <Image
                                source={Images.atmCashOutBg}
                                resizeMode="stretch"
                                style={styles.bgImg}
                            />
                            <View style={styles.text}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={18}
                                    text={`Please ensure you're physically present at an ATM machine before activating the scanner.`}
                                    textAlign="left"
                                />
                            </View>
                        </View>
                    )}
                </ScreenContainer>
                <TopMenu
                    showTopMenu={showMenu}
                    onClose={this.closeMenu}
                    navigation={this.props.navigation}
                    menuArray={menuArray}
                    onItemPress={this.onTopMenuItemPress}
                />
            </>
        );
    }
}

export default withModelContext(PreferredAmount);
