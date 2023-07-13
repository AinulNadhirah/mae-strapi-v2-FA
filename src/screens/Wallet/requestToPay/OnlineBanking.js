import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { Linking } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import ScreenLoader from "@components/Loaders/ScreenLoader";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import {
    getAutoDebitOnlineBkngDetails,
    getOnlineBkngDetails,
    invokeL3,
    onlineBkngRedirect,
} from "@services";

import { PROPERTY_MDM_ERR } from "@constants/strings";

import { getRouteParams } from "@utils/dataModel/rtpHelper";
import { checks2UFlow } from "@utils/dataModel/utility";

function OnlineBanking({ navigation, route, updateModel, getModel }) {
    useEffect(() => {
        updateModel({
            ui: {
                onCancelLogin: onCancel,
            },
        });
        checkAuthendication();
    }, []);

    function onCancel() {
        if (route?.params?.module === "Consent") {
            navigation.navigate(navigationConstant.TAB_NAVIGATOR, {
                screen: navigationConstant.TAB,
                params: {
                    screen: navigationConstant.DASHBOARD,
                    params: { refresh: true },
                },
            });
        } else {
            cancelOnlineBanking();
        }
    }

    async function cancelOnlineBanking() {
        const params = {
            endToEndId: route.params.EndtoEndId,
        };
        const response = await getOnlineBkngDetails(params);

        if (response?.status === 200) {
            const resp = response?.data?.responseData?.BusMsg;
            redirectMerchant(resp);
        }
    }

    async function redirectMerchant(resp) {
        const redirectUrl = resp?.redURL;
        const redirectSignature = resp?.endToEndIdSignature;
        const fullRedirectUrl = redirectUrl
            ? `${redirectUrl}?EndtoEndId=${route.params.EndtoEndId}&EndToEndIdSignature=${redirectSignature}`
            : null;
        const params = {
            endToEndId: route.params.EndtoEndId,
            merchantId: resp?.merchantId ?? "",
        };
        try {
            await onlineBkngRedirect(params);
        } catch (error) {
        } finally {
            if (redirectUrl) {
                Linking.openURL(fullRedirectUrl);
            }
        }
    }

    async function checkAuthendication() {
        try {
            const response = await invokeL3(false);
            if (response?.status === 200) {
                return route?.params?.module === "Consent"
                    ? getADOBDetails(route.params)
                    : getOBDetails(route.params);
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    async function getOBDetails(params, isCancel) {
        const id = params?.EndtoEndId;
        if (id) {
            const param = {
                endToEndId: id,
            };
            try {
                const response = await getOnlineBkngDetails(param);
                if (response?.status === 200) {
                    const result = response?.data;
                    const { flow, secure2uValidateData } = await checks2UFlow(
                        params?.module === "Consent" ? 71 : 4,
                        getModel
                    );
                    const nextParam = getRouteParams({
                        result,
                        flow,
                        secure2uValidateData,
                        params,
                    });
                    if (isCancel) {
                        return nextParam?.transferParams;
                    } else {
                        naviagateToConfirmationScreen(params, nextParam);
                    }
                } else {
                    showErrorToast({ message: PROPERTY_MDM_ERR });
                }
            } catch (error) {
                showErrorToast({ message: PROPERTY_MDM_ERR });
            }
        }
    }

    function naviagateToConfirmationScreen(params, nextParam) {
        const screen =
            params?.module === "Consent"
                ? navigationConstant.RTP_AUTODEBIT_CONFIRMATION_SCREEN
                : navigationConstant.REQUEST_TO_PAY_CONFIRMATION_SCREEN;
        if (nextParam?.flow === "S2UReg") {
            navigation.navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                screen: "Activate",
                params: {
                    flowParams: {
                        success: {
                            stack: navigationConstant.REQUEST_TO_PAY_STACK,
                            screen,
                        },
                        fail: {
                            stack: navigationConstant.REQUEST_TO_PAY_STACK,
                            screen: navigationConstant.SEND_REQUEST_MONEY_DASHBOARD,
                        },

                        params: { ...nextParam, isFromS2uReg: true },
                    },
                },
            });
        } else {
            navigation.navigate(navigationConstant.REQUEST_TO_PAY_STACK, {
                screen,
                params: { ...nextParam },
            });
        }
    }
    async function getADOBDetails(params, isCancel) {
        const id = params?.EndtoEndId;
        if (id) {
            const param = {
                consentId: id,
            };
            try {
                const response = await getAutoDebitOnlineBkngDetails(param);
                if (response?.status === 200 || response?.data?.result?.txnCode === "AOK200") {
                    const result = response?.data?.result;

                    const { flow, secure2uValidateData } = await checks2UFlow(71, getModel);
                    const nextParam = getRouteParams({
                        result,
                        flow,
                        secure2uValidateData,
                        params,
                    });
                    if (isCancel) {
                        return nextParam?.transferParams;
                    } else {
                        naviagateToConfirmationScreen(params, nextParam);
                    }
                } else {
                    showErrorToast({ message: PROPERTY_MDM_ERR });
                }
            } catch (error) {
                showErrorToast({ message: PROPERTY_MDM_ERR });
            }
        }
    }

    return <ScreenLoader showLoader={true} />;
}

OnlineBanking.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
};

export default withModelContext(OnlineBanking);
