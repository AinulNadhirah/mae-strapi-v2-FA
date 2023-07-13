import AsyncStorage from "@react-native-community/async-storage";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import * as Animatable from "react-native-animatable";
import { useDispatch } from "react-redux";

import { TAB_NAVIGATOR, ZEST_CASA_ACTIVATION_PENDING } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Shimmer from "@components/ShimmerPlaceholder";
import Typo from "@components/Text";
// import ManageDevices from "@components/ManageDevices";
import { showErrorToast, showSuccessToast } from "@components/Toast";

import { useModelController } from "@context";

import {
    onboardingComplete,
    updatePrimaryAccount,
    bankingGetDataMayaM2u, // addDevice,
    getInviteCode, // getDevices,
    checkS2WEarnedChances,
} from "@services";
import { logEvent } from "@services/analytics";
import { FAChangeAccounts } from "@services/analytics/analyticsWallet";
import { checkAndRegisterPushNotification } from "@services/pushNotifications";

import { UPDATE_ACCOUNT_LIST_AND_MAE_STATUS_ACTION } from "@redux/actions/services/getAccountListAction";
import { PREPOSTQUAL_UPDATE_USER_STATUS } from "@redux/actions/services/prePostQualAction";

import {
    MEDIUM_GREY,
    YELLOW,
    DISABLED,
    DISABLED_TEXT,
    BLACK,
    WHITE,
    GREY,
    GREY_100,
    GREY_200,
    SHADOW_LIGHT,
    GREY_DARK,
} from "@constants/colors";
import {
    ACTIVATE_NOW,
    FA_ACTION_NAME,
    FA_ONBOARD_WALLET_SELECTACCOUNT,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
} from "@constants/strings";
import { ZEST_DRAFT_USER, ZEST_FULL_ETB_USER } from "@constants/zestCasaConfiguration";

import { generateHaptic } from "@utils";
import { formateAccountNumber } from "@utils/dataModel/utility";
import { setCustomerKey, setRefreshToken } from "@utils/dataModel/utilitySecureStorage";

import Images from "@assets";

const OVERLAY = "rgba(0, 0, 0, 0.4)";

const { width } = Dimensions.get("window");

const Card = ({ number, code, type, children, isSelected, onPress }) => {
    const CARD_IMAGE = type === "casa" ? Images.casaFullBg : Images.maeFullBg;

    function handlePress() {
        if (number && code)
            onPress({
                no: number,
                code,
            });
    }

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePress}
            style={styles.cardButton}
            testID={`choose_account_${number}`}
        >
            <View style={styles.cardContainer}>
                <View style={styles.cardInner}>
                    {isSelected && (
                        <Animatable.View
                            animation="fadeIn"
                            duration={500}
                            style={styles.selectedOverlay}
                        >
                            <Animatable.Image
                                animation="bounceIn"
                                duration={300}
                                source={Images.whiteTick}
                                style={styles.selectedCheck}
                            />
                        </Animatable.View>
                    )}
                    <Image source={CARD_IMAGE} style={styles.cardBg} />
                    <View style={styles.cardChildContainer}>{children}</View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

Card.propTypes = {
    number: PropTypes.string,
    code: PropTypes.string,
    type: PropTypes.string,
    children: PropTypes.element,
    isSelected: PropTypes.bool,
    onPress: PropTypes.func,
};

const Account = ({ name, number, amount, noMae, ...props }) => (
    <Card name={name} number={number} {...props}>
        {noMae ? (
            <>
                <Typo
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={18}
                    text="MAE Account"
                    color={WHITE}
                    textAlign="left"
                />
                <View style={styles.accountNoMaeContainer}>
                    <Typo
                        fontSize={12}
                        fontWeight="normal"
                        lineHeight={18}
                        text="Set up an account to manage your day-to-day spending and stay on top of your finances."
                        color={WHITE}
                        textAlign="left"
                        style={styles.noMaeDescription}
                    />
                </View>
                <View style={styles.noMaeActionContainer}>
                    <TouchableOpacity
                        onPress={props.onPress}
                        activeOpacity={0.8}
                        style={styles.noMaeAction}
                    >
                        <Typo text="Activate Now" fontSize={12} fontWeight="600" />
                    </TouchableOpacity>
                </View>
            </>
        ) : (
            <>
                <Typo
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={18}
                    text={name}
                    color={WHITE}
                    textAlign="left"
                />
                <Typo
                    fontSize={12}
                    fontWeight="normal"
                    lineHeight={18}
                    text={formateAccountNumber(number, 12)}
                    color={WHITE}
                    textAlign="left"
                    style={styles.accountDescription}
                />
                <Typo
                    fontSize={16}
                    fontWeight="600"
                    lineHeight={18}
                    text={amount}
                    color={WHITE}
                    textAlign="left"
                />
            </>
        )}
    </Card>
);

Account.propTypes = {
    name: PropTypes.string,
    number: PropTypes.string,
    amount: PropTypes.string,
    noMae: PropTypes.bool,
    onPress: PropTypes.func,
};

function OnboardingAccounts({ navigation, route }) {
    const [selectedAccount, setSelectedAccount] = useState({
        no: null,
        code: "",
    });
    const screenName = route?.params?.screenName;
    const [accountList, setAccountList] = useState([]);
    const [maeAccount, setMaeAccount] = useState(null);
    const [maeAvailable, setMaeAvailable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const loadingRef = useRef(false);
    // const [isManageDevice, setIsManageDevice] = useState(false);
    const { getModel, updateModel, resetModel } = useModelController();
    const { deviceId } = getModel("device");
    const { notifications: notificationsPermissions } = getModel("permissions");
    const { isCampaignPeriod, isTapTasticReady, isFestivalReady, tapTasticType } = getModel("misc");

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    // const username = route?.params?.username;
    // const mobileSDKData = getDeviceRSAInformation(deviceInformation, null, deviceId);

    function handleClose() {
        if (route.params?.onGoBack) {
            navigation.goBack();
            route.params?.onGoBack();
        } else {
            // reset stuff
            updateModel({
                auth: {
                    token: null,
                    refreshToken: null,
                },
            });

            !loading && navigation.canGoBack() && navigation.navigate(TAB_NAVIGATOR);
        }
    }

    function handleSelectAccount({ no, code }) {
        if (route.params?.from === "WalletMainDashboard") {
            FAChangeAccounts.onSelectAccount();
        }

        if (!loading) {
            generateHaptic("selection", true);

            setSelectedAccount({
                no,
                code,
            });
        }
    }

    function activateMAE() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_ONBOARD_WALLET_SELECTACCOUNT,
            [FA_ACTION_NAME]: ACTIVATE_NOW,
        });
        navigation.navigate("MAEModuleStack", {
            screen: "MAEIntroductionScreen",
            params: {
                entryStack: "Onboarding",
                entryScreen: "OnboardingM2uAccounts",
            },
        });
    }

    async function handleChangeWallet() {
        if (route.params?.from === "WalletMainDashboard") {
            FAChangeAccounts.onConfirmAccount();
        }
        if (!loadingRef.current && selectedAccount) {
            const { m2uUserId } = getModel("user");
            const { walletId } = getModel("wallet");

            const params = {
                accountCode: selectedAccount.code,
                accountNo: selectedAccount.no,
                m2uUserId,
                walletId,
            };

            loadingRef.current = true;
            setLoading(true);

            try {
                let request = {
                    accountNo: params.accountNo,
                    accountCode: params.accountCode,
                    hasPrimaryAccount: true,
                    id: parseInt(params.walletId),
                    m2uLinked: true,
                    mayaUserId: params.m2uUserId,
                    pinNo: "",
                };

                console.log("[ChooseAccount][handleChangeWallet] 🚀 /wallet/updateAccountNo");

                updatePrimaryAccount("/wallet/updateAccountNo", JSON.stringify(request), false)
                    .then((response) => {
                        console.log("[ChooseAccount][handleChangeWallet] 🚀 response:", response);

                        navigation.goBack();
                        route?.params?.onGoBack();
                        showSuccessToast({ message: "Your primary account has been updated." });
                    })
                    .catch((err) => {
                        console.log("ERR", err);
                        this.setState({ error: true, ErrorMessage: "Server communication error" });
                    });
            } catch (error) {
                console.log(error);
            } finally {
                loadingRef.current = false;
                setLoading(false);
            }
        }
    }

    const getReferalCode = useCallback(async () => {
        try {
            // const { cus_type } = getModel("user");
            const referral = await getInviteCode();

            if (referral) {
                const { inviteCode, ntb } = referral?.data;

                if (inviteCode) {
                    return { referralCode: inviteCode, rewardInfo: ntb };
                }
            }
        } catch (error) {
            showErrorToast({
                message: "Unable to retrieved referral code.",
            });

            throw error;
        }
    }, []);

    async function completeOnboarding() {
        if (!loadingRef.current) {
            const params = {
                accountCode: selectedAccount.code,
                accountNo: selectedAccount.no,
                fullName: route.params?.profileName,
            };

            loadingRef.current = true;
            setLoading(true);

            await registerDevicePNS();

            // save the details
            try {
                const response = await onboardingComplete(params);

                if (response && response.data) {
                    const { cus_key, refresh_token } = route.params.authData;
                    const referralCode = await getReferalCode();

                    if (!cus_key) {
                        console.log("cus key does not exists");
                        throw new Error("CusKey doesn't exists");
                    }

                    // write into storage
                    await AsyncStorage.setItem("isOnboardCompleted", "true");
                    await setCustomerKey(cus_key);
                    await setRefreshToken(refresh_token);

                    await AsyncStorage.removeItem("isAtmEnabled");
                    await AsyncStorage.removeItem("isAtmOnboarded");
                    resetModel(["atm"]);

                    // set stuff into context
                    updateModel({
                        auth: {
                            customerKey: cus_key,
                            isPostLogin: true, // we should have a L3 token at this time
                            lastSuccessfull: new Date(),
                        },
                        user: {
                            isOnboard: true,
                            ...referralCode,
                        },
                    });

                    if (!isFestivalReady && !isCampaignPeriod && isTapTasticReady) {
                        checkGameChances(response.data?.result?.s2w);
                    }

                    if (route?.params?.goBack) {
                        navigation.goBack();
                    } else {
                        // go to success screen
                        const { isSignupCampaignPeriod, isNewUser } = getModel("misc");
                        const { soleProp, cus_type } = getModel("user");
                        if (isSignupCampaignPeriod) {
                            if (isNewUser) {
                                navigation.navigate("OnboardingM2uSuccess", {
                                    ...route?.params,
                                    s2w: response.data?.result?.s2w,
                                    newUserStatus: false,
                                });
                            } else {
                                let screenType = "OnboardingM2uReferral";
                                let isSignUpCampaignNonMaeAccount = true;
                                const { from } = route?.params;
                                if (selectedAccount.code === "CC" && from === "MAESuccessScreen2") {
                                    screenType = "OnboardingM2uSuccess";
                                    isSignUpCampaignNonMaeAccount = false;
                                }
                                navigation.navigate(
                                    response.data?.result?.soleProp || soleProp || cus_type === "02"
                                        ? "OnboardingM2uSuccess"
                                        : screenType,
                                    {
                                        ...route?.params,
                                        isSignUpCampaignNonMaeAccount,
                                        s2w: response.data?.result?.s2w,
                                        newUserStatus: false,
                                    }
                                );
                            }
                        } else {
                            navigation.navigate(
                                response.data?.result?.soleProp || soleProp || cus_type === "02"
                                    ? "OnboardingM2uSuccess"
                                    : "OnboardingM2uReferral",

                                {
                                    ...route?.params,
                                    s2w: response.data?.result?.s2w,
                                    newUserStatus: false,
                                }
                            );
                        }
                    }
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
    }

    function handleProceed() {
        if (!loadingRef.current && selectedAccount) {
            // checkRegisteredDeviceList();
            completeOnboarding();
        }
    }

    // async function addNewDevice() {
    //     // const { OS_ID } = deviceInformation;
    //     // const params = {
    //     //     deviceId: OS_ID,
    //     //     m2uUsername: username,
    //     //     deviceDetail: deviceInformation.DeviceName,
    //     //     deviceModel: deviceInformation.DeviceModel,
    //     //     deviceOs: Platform.OS,
    //     // };
    //     const params = {
    //         mobileSDKData,
    //     };

    //     try {
    //         const response = await addDevice("", params);

    //         if (response && response.data) {
    //             completeOnboarding();
    //         }
    //     } catch (error) {
    //         showErrorToast({
    //             message: "Could not register the device. Try again.",
    //         });
    //     } finally {
    //         setIsManageDevice(false);
    //     }
    // }

    // async function checkRegisteredDeviceList() {
    //     const params = {
    //         mobileSDKData,
    //     };

    //     setLoading(true);

    //     try {
    //         const response = await getDevices(params);

    //         if (response && response.data) {
    //             const { resultCount } = response.data;

    //             if (resultCount > 0) {
    //                 setIsManageDevice(true);
    //                 setLoading(false);
    //             } else {
    //                 addNewDevice();
    //             }
    //         }
    //     } catch (error) {
    //         console.log(error);
    //         setLoading(false);
    //     }
    // }

    async function registerDevicePNS() {
        if (notificationsPermissions) {
            const { fcmToken } = getModel("auth");
            // if phone have mask, use m2u no, else use the other no
            const phone =
                route?.params?.phone?.indexOf("XXXX") === -1 ||
                route?.params?.phone?.indexOf("****") === -1
                    ? `${route?.params?.phone}`
                    : route?.params?.authData?.contact_number;

            try {
                const response = await checkAndRegisterPushNotification(
                    phone,
                    deviceId,
                    fcmToken,
                    "A"
                );

                if (response) {
                    updateModel({
                        auth: {
                            fcmToken: response,
                        },
                    });
                }
            } catch (error) {
                showErrorToast({
                    message: "Unable to register device with PNS",
                });
            }
        }
    }
    // function handleCloseManageDevice() {
    //     setIsManageDevice(false);
    //     handleClose();
    // }

    const getAllAccounts = useCallback(async () => {
        try {
            setLoadingData(true);

            const path = `/summary?type=A&checkMae=true`;

            const response = await bankingGetDataMayaM2u(path, false);

            if (response && response.data && response.data.code === 0) {
                const { accountListings, maeAvailable } = response.data.result;

                if (accountListings && accountListings.length) {
                    const isPrimary = accountListings.find((account) => account.primary);
                    const mae = accountListings.find(
                        (account) =>
                            (account.group === "0YD" || account.group === "CCD") &&
                            account.type === "D"
                    );
                    const withoutMae = mae
                        ? accountListings.filter((account) => account.number !== mae.number)
                        : accountListings;

                    setAccountList(withoutMae);
                    setMaeAvailable(maeAvailable);

                    if (withoutMae.length > 0) {
                        dispatch({
                            type: UPDATE_ACCOUNT_LIST_AND_MAE_STATUS_ACTION,
                            accountListings: accountListings,
                            maeAvailable: maeAvailable,
                        });

                        if (screenName !== ZEST_CASA_ACTIVATION_PENDING) {
                            dispatch({
                                type: PREPOSTQUAL_UPDATE_USER_STATUS,
                                userStatus: ZEST_FULL_ETB_USER,
                            });
                        }
                    }

                    // if in change account set to primary
                    if (route.params?.onGoBack) {
                        if (isPrimary) {
                            setSelectedAccount({
                                no: isPrimary.number.substring(0, 12),
                                code: isPrimary.code,
                            });
                        }
                    }

                    if (mae) {
                        // set mae by default on onboarding
                        setMaeAccount(mae);
                    }
                }
            }
        } catch (error) {
            // error when retrieving the data
        } finally {
            setLoadingData(false);
        }
    }, [route]);

    const checkGameChances = useCallback(
        async (s2wInfo) => {
            const { txnTypeList } = getModel("s2w");
            /*
                const response = await checkS2WEarnedChances({
                    txnType: s2wInfo.txnType,
                    oneTime: true,
                });
            */
            if (s2wInfo?.displayPopup) {
                const { displayPopup, chance, generic } = s2wInfo;

                if (displayPopup && txnTypeList.includes("MAELOGIN")) {
                    navigation.push("TabNavigator", {
                        screen: "CampaignChancesEarned",
                        params: {
                            chances: chance,
                            isCapped: generic,
                            isTapTasticReady,
                            tapTasticType,
                        },
                    });
                }
            }
        },
        [getModel, navigation, isTapTasticReady]
    );

    useEffect(() => {
        getAllAccounts();
    }, [getAllAccounts]);

    useEffect(() => {
        FAChangeAccounts.onScreen(route.params?.from);
    }, []);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={16}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                        />
                    }
                    useSafeArea
                >
                    <>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.container}
                        >
                            <View style={styles.instruction}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text={route.params?.pageTitle ?? "Set Primary Account"}
                                    textAlign="left"
                                />
                                <Typo
                                    fontSize={20}
                                    fontWeight="400"
                                    lineHeight={26}
                                    style={styles.label}
                                    text={
                                        route.params?.pageSubtitle ??
                                        "Select an account for your daily transactions such as QR."
                                    }
                                    textAlign="left"
                                />
                                <SpaceFiller height={8} />
                                {route.params?.from !== "WalletMainDashboard" && (
                                    <Typo textAlign={"left"}>
                                        <Typo
                                            fontSize={12}
                                            fontWeight="600"
                                            lineHeight={16}
                                            text={"Note: "}
                                            textAlign="left"
                                            color={GREY_DARK}
                                        />
                                        <Typo
                                            fontSize={12}
                                            fontWeight="400"
                                            lineHeight={16}
                                            text={
                                                "This account will be displayed right on your home screen for quick and easy access"
                                            }
                                            textAlign="left"
                                            color={GREY_DARK}
                                        />
                                    </Typo>
                                )}
                            </View>
                            <SpaceFiller height={24} />
                            <View style={styles.accountList}>
                                {loadingData && (
                                    <View style={styles.cardLoader}>
                                        <View style={styles.cardLoaderInner}>
                                            <Shimmer
                                                autoRun
                                                visible={false}
                                                style={styles.cardLoaderTitle}
                                            />
                                            <Shimmer
                                                autoRun
                                                visible={false}
                                                style={styles.cardLoaderAccount}
                                            />
                                            <Shimmer
                                                autoRun
                                                visible={false}
                                                style={styles.cardLoaderBalance}
                                            />
                                        </View>
                                    </View>
                                )}
                                {!loadingData &&
                                    (maeAvailable && maeAccount ? (
                                        <Account
                                            code={maeAccount.code}
                                            type="mae"
                                            name={maeAccount.name}
                                            number={maeAccount.number.substring(0, 12)}
                                            amount={`RM ${maeAccount.balance}`}
                                            onPress={handleSelectAccount}
                                            isSelected={
                                                selectedAccount.no ===
                                                maeAccount.number.substring(0, 12)
                                            }
                                        />
                                    ) : !maeAvailable ? (
                                        <Account type="mae" onPress={activateMAE} noMae />
                                    ) : null)}

                                {!loadingData &&
                                    accountList.map((account, index) => (
                                        <Account
                                            code={account.code}
                                            key={`${account.number}-${index}`}
                                            name={account.name}
                                            number={account.number.substring(0, 12)}
                                            amount={`RM ${account.balance}`}
                                            onPress={handleSelectAccount}
                                            isSelected={
                                                selectedAccount.no ===
                                                account.number.substring(0, 12)
                                            }
                                            type="casa"
                                        />
                                    ))}
                            </View>
                        </ScrollView>

                        <FixedActionContainer>
                            <ActionButton
                                disabled={!selectedAccount?.code}
                                isLoading={loading}
                                fullWidth
                                borderRadius={25}
                                onPress={
                                    route.params?.onGoBack ? handleChangeWallet : handleProceed
                                }
                                testID="choose_account_continue"
                                backgroundColor={!selectedAccount?.code ? DISABLED : YELLOW}
                                componentCenter={
                                    <Typo
                                        color={!selectedAccount?.code ? DISABLED_TEXT : BLACK}
                                        text={route.params?.proceedTitle ?? "Next"}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                        </FixedActionContainer>
                    </>
                </ScreenLayout>

                {/* {isManageDevice && (
                    <ManageDevices
                        isLoading={loading}
                        onProceed={addNewDevice}
                        onClose={handleCloseManageDevice}
                        onBoardUsername={username}
                    />
                )} */}
            </>
        </ScreenContainer>
    );
}

OnboardingAccounts.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    client: PropTypes.object,
};

const styles = StyleSheet.create({
    accountDescription: {
        paddingBottom: 27,
        paddingTop: 4,
    },
    accountList: {
        alignItems: "center",
        justifyContent: "center",
    },
    accountNoMaeContainer: {
        // width: width < 400 ? "90%" : "75%",
        width: "65%",
    },
    cardBg: {
        borderRadius: 8,
        bottom: 0,
        height: "105%",
        left: -24,
        position: "absolute",
        right: 0,
        top: 0,
        width,
    },
    cardButton: {
        paddingBottom: 24,
        paddingHorizontal: 24,
        width,
    },
    cardChildContainer: {
        padding: 16,
    },
    cardContainer: {
        elevation: 8,
        position: "relative",
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
        width: "100%",
    },
    cardInner: {
        borderRadius: 8,
        height: 116,
        overflow: "hidden",
        width: "100%",
    },
    cardLoader: {
        paddingHorizontal: 24,
        width: "100%",
    },
    cardLoaderAccount: {
        backgroundColor: GREY_100,
        height: 8,
        marginBottom: 24,
        width: "40%",
    },
    cardLoaderBalance: {
        backgroundColor: GREY_100,
        height: 8,
        width: "30%",
    },
    cardLoaderInner: {
        backgroundColor: GREY_200,
        borderRadius: 8,
        padding: 24,
        width: "100%",
    },
    cardLoaderTitle: {
        backgroundColor: GREY_100,
        height: 8,
        marginBottom: 8,
        width: "30%",
    },
    container: {
        flexDirection: "column",
        paddingBottom: 18,
    },
    instruction: {
        paddingHorizontal: 24,
    },
    label: {
        paddingTop: 8,
    },
    noMaeAction: {
        backgroundColor: WHITE,
        borderColor: GREY,
        borderRadius: 15,
        borderWidth: 1,
        paddingHorizontal: width < 400 ? 10 : 16,
        paddingVertical: width < 400 ? 4 : 8,
    },
    noMaeActionContainer: {
        bottom: 0,
        position: "absolute",
        right: 16,
    },
    noMaeDescription: {
        paddingTop: 4,
    },
    selectedCheck: { height: 38, width: 38 },
    selectedOverlay: {
        alignItems: "center",
        backgroundColor: OVERLAY,
        borderRadius: 8,
        bottom: 0,
        height: "100%",
        justifyContent: "center",
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
        width: width - 48,
        zIndex: 5,
    },
});

export default OnboardingAccounts;
