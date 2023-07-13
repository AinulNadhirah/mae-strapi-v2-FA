import { useNavigation } from "@react-navigation/core";
import DeviceInfo from "react-native-device-info";

import NavigationService from "@navigation/navigationService";

import { useModelController } from "@context";

import { m2uEnrollment } from "@services";
import { logEvent } from "@services/analytics";

import { FA_DASHBOARD_MORE, FA_LOGOUT, FA_SCREEN_NAME } from "@constants/strings";

import { getDeviceRSAInformation } from "@utils/dataModel/utilityPartial.2";
import { getCustomerKey } from "@utils/dataModel/utilityPartial.4";

const useLogout = () => {
    const { getModel, updateModel } = useModelController();
    const navigation = useNavigation();
    const {
        user: { isOnboard },
        auth: { isPostLogin },
    } = getModel(["user", "auth"]);

    function handleLogout() {
        // disable temp for ui
        if (!isOnboard) {
            // go onboard
            handleGoToOnboard(navigation);
        } else {
            if (isPostLogin) {
                logEvent(FA_LOGOUT, {
                    [FA_SCREEN_NAME]: FA_DASHBOARD_MORE,
                });

                // do logout
                logoutAndRefreshToken(getModel, updateModel, navigation).then();
            } else {
                // do login manually.
                updateModel({
                    ui: {
                        touchId: true,
                    },
                });
            }
        }
    }

    function handleGoToOnboard(navigation) {
        navigation.navigate("Onboarding", {
            screen: "OnboardingStart",
        });
    }

    async function logoutAndRefreshToken(getModel, updateModel, navigation) {
        let { customerKey } = getModel("auth");
        const { deviceInformation, deviceId } = getModel("device");
        const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);

        if (!customerKey) {
            customerKey = await getCustomerKey();
        }

        if (customerKey) {
            const params = {
                grantType: "PASSWORD",
                tokenType: "LOGOUT",
                customerKey,
                mobileSDKData,
            };

            // setLoadingLogout(true);

            // get the L1 token back again
            try {
                const response = await m2uEnrollment(params, true);

                if (response && response.data) {
                    const { access_token, refresh_token, contact_number, ic_number, cus_type } =
                        response.data;

                    // setLoadingLogout(false);
                    updateModel({
                        auth: {
                            token: access_token,
                            refreshToken: refresh_token,
                            customerKey,
                            isPostLogin: false,
                            isPostPassword: false,
                            lastSuccessfull: null,
                        },
                        m2uDetails: {
                            m2uPhoneNumber: contact_number,
                        },
                        user: {
                            icNumber: ic_number,
                            cus_type,
                            soleProp: cus_type === "02",
                        },
                        qrPay: {
                            authenticated: false,
                        },
                        property: {
                            isConsentGiven: false,
                            JAAcceptance: false,
                        },
                    });

                    navigation.navigate("Logout");
                }
            } catch (error) {
                console.tron.log("Error when authenticating");

                // setLoadingLogout(false);

                await handleFailedLogout();
            }
        } else {
            await handleFailedLogout();
        }
    }

    async function handleFailedLogout() {
        NavigationService.replaceStack("OnboardingIntro");
    }

    return {
        handleLogout,
        handleGoToOnboard,
    };
};

export default useLogout;
