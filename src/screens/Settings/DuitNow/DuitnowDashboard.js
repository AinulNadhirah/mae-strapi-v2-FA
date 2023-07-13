import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import DeviceInfo from "react-native-device-info";

import {
    DUITNOW_DETAILS,
    DUITNOW_CHOOSEACCOUNT,
    SETTINGS_MODULE,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast, showSuccessToast } from "@components/Toast";

import { withModelContext } from "@context";

import {
    getDuitNowEnquiryDetails,
    duitnowServices,
    getRtpListV1,
    getDuitNowFlags,
    rtpActionApi,
} from "@services";

import { MEDIUM_GREY, GREY, WHITE, GARGOYLE } from "@constants/colors";
import {
    COMMON_ERROR_MSG,
    DUITNOW,
    DUITNOW_DEREGISTER_SUCESS,
    DUITNOW_DISABLE_SUCESS,
    DUITNOW_ENABLE_SUCESS,
    FA_SETTINGS_DUITNOW_SELECTACCOUNT,
    DUITNOW_OTHER_SERVICES,
    DUITNOW_IDS,
} from "@constants/strings";

import { getPermissionObj } from "@utils/dataModel/rtdHelper";
import { getDeviceRSAInformation } from "@utils/dataModel/utility";

import * as DuitNowController from "./DuitNowController";
import DuitnowCard from "./DuitnowCard";
import OtherServicesCard from "./OtherServicesCard";

class DuitnowDashboard extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        route: PropTypes.object,
        navigation: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.state = {
            duitNowEnquiryData: [],
            proxyData: [],
            isLoading: true,
            duitnowAutoDebitFlag: true,
            duitnowAutoDebitBlockedFlag: true,
            duitnowRequestBlockedFlag: true,
        };
    }

    componentDidMount = () => {
        this.props.navigation.addListener("focus", this.onScreenFocus);
        this.getServiceFlag();
    };

    getServiceParams = (type, accountDetails, tac) => {
        return {
            pan: "",
            actionForceExpire: "000",
            noOfTrx: 1,
            proxyBankCode: "MBBEMYKL",
            registrationRequests: [
                {
                    accHolderName: "",
                    accHolderType: accountDetails.accountTypeCode || "",
                    accName: accountDetails.accountType || "",
                    accNo: accountDetails.accountNo || "",
                    accType: accountDetails.accountTypeCode || "",
                    proxyIdNo: accountDetails.idVal || "",
                    proxyIdType: accountDetails.proxyTypeCode || "",
                    regRefNo: accountDetails.regRefNo || "",
                    regStatus: "",
                },
            ],
            secondaryId: this.state.duitNowEnquiryData.secondaryId || "",
            secondaryIdType: this.state.duitNowEnquiryData.secondaryIdType || "",
            service: type,
            tac,
        };
    };

    onScreenFocus = () => {
        if (this.props?.route?.params?.auth === "successful") {
            const screenParams = this.props?.route?.params?.screenParams;
            this.getDuitNowAPISuccess(screenParams?.serviceType, true);
            return;
        }
        this.getDuitNowEnquiryDetails();
    };

    handleBack = () => {
        this.props.navigation.goBack();
    };

    selectAccontTap = (item) => {
        if (item.isregisteredProxy) {
            const params = {
                seletedItem: item,
                proxyDetails: this.state.duitNowEnquiryData,
                type: "updateAccount",
            };

            this.props.navigation.navigate(DUITNOW_DETAILS, { proxyDetails: params });
            return;
        }
        const params = {
            seletedItem: item,
            proxyDetails: this.state.duitNowEnquiryData,
            type: "SelectAccount",
        };
        this.props.navigation.navigate(DUITNOW_CHOOSEACCOUNT, { proxyDetails: params });
    };

    getServiceFlag = async () => {
        const permissionFlags = this.props.getModel("rpp")?.permissions;
        //if permissions not in context initiate api call
        if (permissionFlags?.flagAPICalled === false) {
            const res = await getDuitNowFlags();
            const cusType = this.props.getModel("user").cus_type;
            if (res?.data?.list) {
                const listing = res?.data?.list;
                const permissions = getPermissionObj({ listing, cusType });
                const {
                    duitnowAutoDebitFlag,
                    duitnowAutoDebitBlockedFlag,
                    duitnowRequestBlockedFlag,
                } = permissions;
                this.setState(
                    {
                        duitnowAutoDebitFlag,
                        duitnowAutoDebitBlockedFlag,
                        duitnowRequestBlockedFlag,
                    },
                    () => {
                        this.props.updateModel({
                            rpp: {
                                permissions,
                            },
                        });
                    }
                );
            }
        } else {
            const { duitnowAutoDebitFlag, duitnowAutoDebitBlockedFlag, duitnowRequestBlockedFlag } =
                permissionFlags;
            this.setState({
                duitnowAutoDebitFlag,
                duitnowAutoDebitBlockedFlag,
                duitnowRequestBlockedFlag,
            });
        }
    };

    // DuitNow Services API Call
    // -----------------------
    getDuitNowAPICall = (params, serviceType) => {
        duitnowServices(params)
            .then((respone) => {
                const result = respone.data.result;
                console.log("[DuitnowDetails] >> [getDuitNowAPICall] ", respone.code);
                if (result.status === "SUCCESS") {
                    this.getDuitNowAPISuccess(serviceType, true);
                    DuitNowController.getDuitNowGADetails(serviceType, true);
                    return;
                }

                this.setState({ isLoading: false }, () => {
                    this.getDuitNowAPISuccess(serviceType, false);
                    DuitNowController.getDuitNowGADetails(serviceType, false);
                    showErrorToast({
                        message: result?.duitnowResponseList[0]?.esbErrorValue,
                    });
                    this.props.navigation.navigate("Settings");
                });
                this.getRTPBlockList();
            })
            .catch((error) => {
                this.setState({ isLoading: false }, () => {
                    this.getDuitNowAPISuccess(serviceType, false);
                    DuitNowController.getDuitNowGADetails(serviceType, false);
                    showErrorToast({
                        message: error.message,
                    });
                });
                this.props.navigation.navigate("Settings");
            });
    };
    getDuitNowAPISuccess = (serviceType, isSuccess) => {
        DuitNowController.getDuitNowGADetails(serviceType, isSuccess);
        let message = "";
        switch (serviceType) {
            case "DEREGISTER":
                message = DUITNOW_DEREGISTER_SUCESS;
                break;
            case "SUSPEND":
                message = DUITNOW_DISABLE_SUCESS;
                break;
            case "ACTIVATE":
                message = DUITNOW_ENABLE_SUCESS;
                break;
            default:
                break;
        }
        this.setState({ isLoading: false }, () => {
            this.getDuitNowEnquiryDetails();
            showSuccessToast({ message });
            this.props.navigation.navigate("Settings");
        });
    };

    // API CALL
    // -----------------------
    getDuitNowEnquiryDetails = async () => {
        try {
            const response = await getDuitNowEnquiryDetails();

            const result = response.data.result;
            if (response.data.message === "Unsuccessful") {
                this.setState({ isLoading: false }, () => {
                    showErrorToast({
                        message: result.statusDesc,
                    });
                });
                return;
            }
            const registeredProxy = result?.registeredProxy
                ? result.registeredProxy.map((amount, index) => ({
                      ...amount,
                      isregisteredProxy: true,
                      id: index,
                  }))
                : [];
            const nonRegisteredProxy = result?.nonRegisteredProxy
                ? result.nonRegisteredProxy.map((amount, index) => ({
                      ...amount,
                      isregisteredProxy: false,
                      id: index,
                  }))
                : [];

            const proxyDetails = [...registeredProxy, ...nonRegisteredProxy];
            this.setState({
                duitNowEnquiryData: result,
                proxyData: proxyDetails,
                isLoading: false,
            });
        } catch (error) {
            this.setState({ isLoading: false }, () => {
                showErrorToast({
                    message: error.message,
                });
            });
        } finally {
            this.getRTPBlockList();
        }
    };

    getRTPBlockList = async (isLoadMore = false) => {
        this.setState({
            isLoading: true,
        });
        this.isLoading = true;
        try {
            const subUrl = "/rtp/list";
            const datalist = isLoadMore ? this.state.duitNowList : [];
            const params = {
                listType: "BLOCKED",
            };

            if (isLoadMore) {
                params.retrievalRefNo = this.retrievalRefNo;
            }

            const response = await getRtpListV1(subUrl, params);
            const data = response?.data?.result?.data ?? [];
            this.retrievalRefNo = response?.data?.result?.retrievalRefNo;
            this.setState({
                duitNowList: [...datalist, ...data],
            });
        } catch (error) {
            showErrorToast({
                message: error?.error?.error?.message ?? COMMON_ERROR_MSG,
            });
        } finally {
            this.setState({
                isLoading: false,
            });
            this.isLoading = false;
        }
    };

    callRtpActionApi = async () => {
        try {
            const { proxyDetails } = this.state;
            const deviceInfo = this.props.getModel("device");
            const mobileSDKData = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
            const params = {
                ...proxyDetails,
                requestType: "UNBLOCK",
                mobileSDKData,
            };
            const response = await rtpActionApi(params);
            if (response?.data?.code === 200) {
                const message = `You've successfully unblocked ${
                    proxyDetails?.receiverName ?? "requestor"
                } and allowed future payment requests from them.`;
                showSuccessToast({ message });
            } else {
                showErrorToast({ message: response?.data?.result?.statusDescription });
            }
        } catch (err) {
            if (err?.message) {
                showErrorToast({ message: err?.message ?? COMMON_ERROR_MSG });
            }
        } finally {
            this.onScreenFocus();
        }
    };

    handleConfirmPress = () => {
        this.callRtpActionApi();
    };

    isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
        const paddingToBottom = 20;
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    };

    onScroll = ({ nativeEvent }) => {
        if (this.isCloseToBottom(nativeEvent) && this.retrievalRefNo && !this.isLoading) {
            this.getRTPBlockList(true);
        }
    };

    otherServicesClick = (item) => {
        if (item?.id === 2) {
            if (!this.state.duitnowAutoDebitBlockedFlag && !this.state.duitnowRequestBlockedFlag) {
                showInfoToast({
                    message:
                        "Sorry, DuitNow Blocked List services are temporarily unavailable. Please try again later.",
                });
            } else {
                this.props.navigation.navigate(SETTINGS_MODULE, { screen: "BlockedIDList" });
            }
        } else {
            if (!this.state.duitnowAutoDebitFlag) {
                showInfoToast({
                    message:
                        "Sorry, DuitNow AutoDebit services are temporarily unavailable. Please try again later.",
                });
            } else {
                this.props.navigation.navigate(SETTINGS_MODULE, { screen: "DuitNowAutodebitList" });
            }
        }
    };

    render() {
        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={this.state.isLoading}
                analyticScreenName={FA_SETTINGS_DUITNOW_SELECTACCOUNT}
            >
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            backgroundColor={GARGOYLE}
                            headerCenterElement={
                                <Typo
                                    text={DUITNOW}
                                    fontWeight={600}
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={this.handleBack} />}
                        />
                    }
                    useSafeArea
                >
                    <ScrollView>
                        <View>
                            <Typo
                                text={DUITNOW_IDS}
                                fontWeight="300"
                                fontStyle="normal"
                                fontSize={20}
                                lineHeight={28}
                                textAlign="left"
                                style={styles.linkAccountText}
                            />
                            <View style={styles.accoutsListView}>
                                <DuitnowCard
                                    items={this.state.proxyData}
                                    idTypeKey="text"
                                    valueKey="value"
                                    idValue="idVal"
                                    statusKey="isregisteredProxy"
                                    bankNameKey="bankName"
                                    isSelectButton={true}
                                    isDisplayStatus={true}
                                    onPress={this.selectAccontTap}
                                />
                            </View>
                        </View>
                        <Typo
                            text={DUITNOW_OTHER_SERVICES}
                            fontWeight="300"
                            fontStyle="normal"
                            fontSize={20}
                            lineHeight={28}
                            textAlign="left"
                            style={styles.linkAccountText}
                        />
                        <View style={styles.accoutsListView}>
                            <OtherServicesCard
                                onPress={this.otherServicesClick}
                                items={[
                                    { id: 1, text: "DuitNow AutoDebit" },
                                    { id: 2, text: "DuitNow Blocked List" },
                                ]}
                            />
                        </View>
                    </ScrollView>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    accoutsListView: {
        backgroundColor: WHITE,
        borderTopColor: GREY,
        borderTopWidth: 1,
        marginTop: 20,
    },
    linkAccountText: {
        marginLeft: 24,
        marginRight: 48,
        marginTop: 20,
    },
});

export default withModelContext(DuitnowDashboard);
