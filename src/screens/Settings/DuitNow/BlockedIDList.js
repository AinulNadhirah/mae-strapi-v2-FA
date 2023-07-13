import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";

import AutoDebitBlockedList from "@screens/Settings/DuitNow/AutoDebitBlockedList";
import DuitNowBlockedList from "@screens/Settings/DuitNow/DuitNowBlockedList";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Popup from "@components/Popup";
import TabView from "@components/Specials/TabView";
import Typo from "@components/Text";
import { showInfoToast, showSuccessToast, showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { unblockAutoDebitBlockedList, rtpActionApi } from "@services";
import { RTPanalytics } from "@services/analytics/rtpAnalyticsSSL";

import { MEDIUM_GREY, YELLOW } from "@constants/colors";
import * as Strings from "@constants/strings";

import { toTitleCase } from "@utils/dataModel/rtdHelper";
import { getDeviceRSAInformation } from "@utils/dataModel/utility";

function BlockedIDList({ navigation, getModel, updateModel }) {
    const [popupTitle, setPopupTitle] = useState(Strings.UNBLOCK_AUTODEBIT);
    const [popupDesc, setPopupDesc] = useState("");
    const [isPopupDisplay, setIsPopupDisplay] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [updateDuitNow, setUpdateDuitNow] = useState(false);
    const [updateAutoDebit, setUpdateAutoDebit] = useState(true);
    const [requestBlockedFlag, setRequestBlockedFlag] = useState(true);
    const [autoDebitBlockedFlag, setAutoDebitBlockedFlag] = useState(true);
    const [unblockFlag, setUnblockFlag] = useState(true);
    const [proxyDetails, setProxyDetails] = useState({});

    useEffect(() => {
        RTPanalytics.viewBlockedRequestID();
        getServiceFlag();
    }, []);

    /***
     * handleTabChange
     * Handle Tab View tab change
     */
    function handleTabChange(activeTabIndex) {
        setActiveTabIndex(activeTabIndex);
    }

    function handleBack() {
        navigation.goBack();
    }

    function unBlockProxyAction(item) {
        setUpdateDuitNow(false);
        setUpdateAutoDebit(false);
        setIsPopupDisplay(true);
        setProxyDetails(item);

        const popUpTitle = item?.merchantId ? Strings.UNBLOCK_AUTODEBIT : Strings.UNBLOCK_PROXY_ID;
        setPopupTitle(popUpTitle);

        const popUpDesc = item?.merchantId
            ? `Are you sure you'd like to allow ${toTitleCase(
                  item?.merchantName
              )} to send you DuitNow AutoDebit in the future?`
            : Strings.ARE_YOU_SURE_YOU_LIKE_ALLOW;
        setPopupDesc(popUpDesc);
    }

    async function getServiceFlag() {
        setIsLoading(true);
        const permissionFlags = getModel("rpp")?.permissions;
        const { requestBlockedFlag, autoDebitBlockedFlag, unblockFlag } = permissionFlags || {};

        setRequestBlockedFlag(requestBlockedFlag);
        setAutoDebitBlockedFlag(autoDebitBlockedFlag);
        setUnblockFlag(unblockFlag);
        setIsLoading(false);
    }

    async function callRtpActionApi() {
        try {
            //duitnow unblock
            if (!proxyDetails?.merchantId) {
                const deviceInfo = getModel("device");
                const mobileSDKData = getDeviceRSAInformation(
                    deviceInfo.deviceInformation,
                    DeviceInfo
                );
                const params = {
                    ...proxyDetails,
                    requestType: "UNBLOCK",
                    transactionType: "UNBLOCK",
                    mobileSDKData,
                };
                const response = await rtpActionApi(params);
                if (response?.data?.code === 200 || response?.data?.result?.statusCode === "000") {
                    RTPanalytics.settingsUnblockSuccess();
                    const message = `You've successfully unblocked ${
                        proxyDetails?.receiverName ?? "requestor"
                    } and allowed future payment requests from them.`;
                    showSuccessToast({ message });
                    setUpdateDuitNow(true);
                } else {
                    showErrorToast({ message: Strings.UNBLOCK_UNSUCCESSFUL });
                }
            } else {
                //autodebit unblock
                const params = {
                    merchantId: proxyDetails?.merchantId,
                    offSet: 1,
                    limit: 10,
                    creditorName: proxyDetails?.merchantName,
                };
                const response = await unblockAutoDebitBlockedList(params);
                if (response?.data?.code === 200) {
                    const message = `${toTitleCase(
                        proxyDetails?.merchantName
                    )} has been unblocked.`;
                    showSuccessToast({ message });
                    RTPanalytics.formDNSettingsBlockedListComplete();
                    setUpdateAutoDebit(true);
                } else {
                    showInfoToast({ message: Strings.UNBLOCK_UNSUCCESSFUL });
                    RTPanalytics.formDNSettingsBlockedListError();
                }
            }
        } catch (err) {
            showInfoToast({ message: Strings.UNBLOCK_UNSUCCESSFUL });
        }
    }

    function handleConfirmPress() {
        setIsPopupDisplay(false);
        callRtpActionApi();
    }

    function handleClose() {
        setIsPopupDisplay(false);
    }

    //user does not have permission for both request and autodebit tab
    const noPermission = !(requestBlockedFlag || autoDebitBlockedFlag);

    const defaultCond = !autoDebitBlockedFlag ? ["REQUEST"] : ["REQUEST", "AUTODEBIT"];
    const autoDebitCond = !requestBlockedFlag ? ["AUTODEBIT"] : defaultCond;
    const tabTitle = !noPermission ? autoDebitCond : [];
    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={isLoading}
        >
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                header={
                    <HeaderLayout
                        backgroundColor={YELLOW}
                        headerCenterElement={
                            <Typo
                                text={Strings.DUITNOW_BLOCKED_LIST}
                                fontWeight="600"
                                fontSize={16}
                                lineHeight={19}
                            />
                        }
                        headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                    />
                }
                useSafeArea
            >
                <View style={styles.container}>
                    <TabView
                        defaultTabIndex={0}
                        activeTabIndex={activeTabIndex}
                        onTabChange={handleTabChange}
                        titles={tabTitle}
                        screens={[
                            !noPermission && requestBlockedFlag === true && activeTabIndex === 0 ? (
                                <DuitNowBlockedList
                                    key="0"
                                    index={0}
                                    unBlockProxyAction={unBlockProxyAction}
                                    updateDuitNow={updateDuitNow}
                                />
                            ) : (
                                <></>
                            ),
                            !noPermission &&
                            autoDebitBlockedFlag === true &&
                            activeTabIndex === 1 ? (
                                <AutoDebitBlockedList
                                    key="1"
                                    index={1}
                                    unBlockProxyAction={unBlockProxyAction}
                                    updateAutoDebit={updateAutoDebit}
                                    unblockFlag={unblockFlag}
                                />
                            ) : (
                                <></>
                            ),
                        ]}
                    />
                </View>
            </ScreenLayout>
            <Popup
                visible={isPopupDisplay}
                title={popupTitle}
                description={popupDesc}
                onClose={handleClose}
                primaryAction={{
                    text: Strings?.CONFIRM,
                    onPress: handleConfirmPress,
                }}
            />
        </ScreenContainer>
    );
}

BlockedIDList.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: "5%",
    },
});
export default withModelContext(BlockedIDList);
