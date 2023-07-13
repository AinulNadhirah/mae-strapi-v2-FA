import { useFocusEffect } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";

import { AUTOBILLING_MERCHANT_DETAILS, AUTOBILLING_STACK } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import TabView from "@components/Specials/TabView";
import Typo from "@components/Text";

import { withModelContext, useModelController } from "@context";

import { invokeL3 } from "@services";

import { MEDIUM_GREY } from "@constants/colors";
import * as Strings from "@constants/strings";

import BillStatusScreen from "./BillStatusScreen";

function AutoBillingDashboard({ navigation, route }) {
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [showLoaderModal, setShowLoaderModal] = useState(false);
    const [updateData, setUpdateData] = useState(false);
    const [showInScreenLoaderModal, setShowInScreenLoaderModal] = useState(false);
    const { getModel, updateModel } = useModelController();

    useEffect(() => {
        updateComponent();
        updateModel({
            ui: {
                onCancelLogin: onCancel,
            },
        });
    }, []);
    useFocusEffect(
        useCallback(() => {
            const updateScreenData = route.params?.updateScreenData ?? null;
            if (updateScreenData) {
                _updateDataInChild();
            } else {
                setUpdateData(false);
            }
        }, [route.params?.updateScreenData])
    );

    async function updateComponent() {
        const { isPostPassword } = getModel("auth");
        if (!isPostPassword) {
            const httpResp = await invokeL3(true).catch(() => {});
            const code = httpResp?.data?.code ?? null;
            if (code !== 0) return null;
        }
    }

    /***
     * _updateDataInChild
     *  update Data In Child
     */

    function _updateDataInChild() {
        setUpdateData(true);
    }

    /***
     * onCancel
     * On Close button click in Pin or Password model
     */
    function onCancel() {
        navigation.goBack();
    }

    /***
     * _onBackPress
     * Handle screen back button
     */
    function _onBackPress() {
        navigation.goBack();
    }

    /***
     * handleTabChange
     * Handle Tab View tab change
     */
    function handleTabChange(activeTabIndex) {
        setActiveTabIndex(activeTabIndex);
    }

    /***
     * _onPayRequestPress
     * On pay now button click from pop when request item click
     */
    function _onPayRequestPress(item) {}

    /***
     * _onShowIncomingRequestPopupPress
     * show incoming request show the pay now popup
     */
    function _onShowIncomingRequestPopupPress(title, item) {}

    /***
     * _onNotificationRequestReqId
     * on Notification Request ReqId
     */
    function _onNotificationRequestReqId(reqId) {
        setActiveTabIndex(reqId);
    }

    /***
     * _onRejectRequestPress
     * On Reject request from child called
     */
    function _onRejectRequestPress() {}

    /***
     * _onBillingButtonPress
     * On send money button click form pending and past tabs
     */
    function _onBillingButtonPress() {
        navigation.navigate(AUTOBILLING_STACK, {
            screen: AUTOBILLING_MERCHANT_DETAILS,
            params: { ...route.params },
        });
    }
    /***
     * _onChargeCustomerPress
     * On send money button click form pending and past tabs
     */
    function _onChargeCustomerPress() {}

    /***
     * toggleShowInScreenLoaderModal
     * toggle in Screen Loader view based on param
     */
    function toggleShowInScreenLoaderModal(value) {
        setShowLoaderModal(value);
        setShowInScreenLoaderModal(value);
    }

    const { cus_type } = getModel("user");

    const childData = {
        cusType: cus_type,
    };
    const params = {
        activeTabIndex,
        navigation,
        route,
        childData,
        screenDate: route.params?.screenDate ?? null,
        onBillingButtonPress: _onBillingButtonPress,
        onChargeCustomerPress: _onChargeCustomerPress,
        onPayRequestPress: _onPayRequestPress,
        onRejectRequestPress: _onRejectRequestPress,
        onNotificationRequestReqId: _onNotificationRequestReqId,
        onShowIncomingRequestPopupPress: _onShowIncomingRequestPopupPress,
        updateDataInChild: _updateDataInChild,
        toggleLoader: toggleShowInScreenLoaderModal,
    };
    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                showOverlay={false}
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={showLoaderModal}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={Strings.AUTO_BILLING}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={_onBackPress} />}
                        />
                    }
                    useSafeArea
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <React.Fragment>
                        <TabView
                            defaultTabIndex={0}
                            activeTabIndex={activeTabIndex}
                            onTabChange={handleTabChange}
                            titles={[Strings.BILL_STATUS.toUpperCase(), Strings.PAST]}
                            screens={[
                                <BillStatusScreen
                                    key="0"
                                    index={0}
                                    updateData={updateData}
                                    {...params}
                                />,
                                <BillStatusScreen
                                    key="1"
                                    index={1}
                                    updateData={updateData}
                                    {...params}
                                />,
                            ]}
                        />
                    </React.Fragment>
                </ScreenLayout>
                {showInScreenLoaderModal && <ScreenLoader showLoader={true} />}
            </ScreenContainer>
        </React.Fragment>
    );
}

AutoBillingDashboard.propTypes = {
    navigation: PropTypes.shape({
        addListener: PropTypes.func,
        goBack: PropTypes.func,
        navigate: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            acctNo: PropTypes.any,
            activeTabIndex: PropTypes.number,
            cta: PropTypes.string,
            doneFlow: PropTypes.bool,
            prevData: PropTypes.any,
            refId: PropTypes.any,
            screenDate: PropTypes.any,
            subModule: PropTypes.string,
            transferParams: PropTypes.object,
            updateScreenData: PropTypes.any,
        }),
    }),
};
export default withModelContext(AutoBillingDashboard);
