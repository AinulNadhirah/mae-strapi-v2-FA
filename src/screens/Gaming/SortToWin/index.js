import Clipboard from "@react-native-community/clipboard";
import { useFocusEffect } from "@react-navigation/native";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, View, StyleSheet, Image } from "react-native";
import Share from "react-native-share";
import { WebView } from "react-native-webview";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    BANKINGV2_MODULE,
    COMMON_MODULE,
    DASHBOARD_STACK,
    FIXED_DEPOSIT_STACK,
    FNB_MODULE,
    FNB_TAB_SCREEN,
    FUNDTRANSFER_MODULE,
    GATEWAY_SCREEN,
    KLIA_EKSPRESS_DASHBOARD,
    KLIA_EKSPRESS_STACK,
    LOYALTY_CARDS_SCREEN,
    LOYALTY_MODULE_STACK,
    MAE_INTRODUCTION,
    MAE_MODULE_STACK,
    MB_HEART_TAPTASTIC,
    MY_GROSER_INAPP_WEBVIEW_SCREEN,
    ONE_TAP_AUTH_MODULE,
    PAYBILLS_LANDING_SCREEN,
    PAYBILLS_MODULE,
    PAYBILLS_PAYEE_DETAILS,
    PDF_VIEW,
    RELOAD_MODULE,
    RELOAD_SELECT_TELCO,
    REQUEST_TO_PAY_ID_SCREEN,
    REQUEST_TO_PAY_STACK,
    SB_DASHBOARD,
    SEND_REQUEST_MONEY_DASHBOARD,
    SEND_REQUEST_MONEY_STACK,
    SSL_START,
    SSL_STACK,
    TABUNG_MAIN,
    TABUNG_STACK,
    TABUNG_TAB_SCREEN,
    TICKET_STACK,
    TRANSFER_TAB_SCREEN,
    ZAKAT_TYPE,
    SECURE2U_COOLING,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast, showSuccessToast } from "@components/Toast";

import { useModelController } from "@context";

import {
    getS2WUuid,
    getS2WgameEarnChance,
    invokeL3,
    checkChancesOnS2WWidget,
    getPayeeDetails,
    gameValidation,
    getDonationData,
} from "@services";

import { TRANSPARENT, WHITE, MEDIUM_GREY } from "@constants/colors";
import { ENDPOINT_BASE } from "@constants/url";

import { checks2UFlow } from "@utils/dataModel/utilityPartial.5";

import { gameImg, tapTasticAssets } from "@assets";

export default function GameEngine({ navigation, route }) {
    const [isReady, setReady] = useState(false);
    const [gameStarted, setGame] = useState(false);
    const [s2Winfo, setS2Winfo] = useState({
        uid: null,
        signature: null,
        ts: null,
    });
    const timer = useRef();
    const webview = useRef(null);
    const { getModel, updateModel } = useModelController();
    const {
        auth: { token },
        qrPay: { isEnabled: qrEnabled },
        misc: { gameMetadata, isTapTasticReady, isBakongReady, tapTasticType },
    } = getModel(["auth", "qrPay", "misc"]);

    const bgImage = isTapTasticReady ? gameImg.bgChancesTop : null;
    const menuBarColor = isTapTasticReady ? "#FCAEC4" : TRANSPARENT;
    const isFestival = isTapTasticReady;

    const { isPostLogin, isPostPassword } = getModel("auth");
    const { isOnboard } = getModel("user");
    const [haveDonationDetails, setHaveDonationDetails] = useState(false);
    const [donationDetails, setDonationDetails] = useState({});
    function renderLoading() {
        return (
            <View style={[styles.loaderContainer, isFestival && styles.cnyGameBg]}>
                <ActivityIndicator color={WHITE} size="small" />
            </View>
        );
    }
    const handleOnback = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    function handleLoadReady() {
        setReady(true);
    }

    function handleTokenError() {
        /**
         * since we calling the API within the game, when face this,
         * we just recall the game info api again, and let apimanager handle it
         * if its refresh, then webview would refresh with the new token
         * if its sso, then api manager will help kick it out
         */
        init();
    }

    // const performGameValidation = useCallback(async () => {
    //     try {
    //         const response = await gameValidation();
    //         if (response?.data?.error) {
    //             setGameStatus(response?.data?.status_code);
    //             //     showErrorToast({ message: response?.data?.error });
    //         }
    //     } catch (ex) {
    //         // setGameStatus(200);
    //     }
    // }, [setGameStatus]);

    const checkForChances = useCallback(async () => {
        const response = await checkChancesOnS2WWidget().catch(() => {
            //  nothing to do
        });

        /**
         * if response added > 1 we will show popup here.
         * check if campaign is running and check if it matched the list
         * delayed the check a lil bit to let user see the acknowledge screen
         */
        if (response?.data?.s2w) {
            const {
                misc: { isCampaignPeriod, tapTasticType },
                s2w: { txnTypeList },
            } = getModel(["misc", "s2w"]);

            const { txnType, displayPopup, chance } = response?.data?.s2w;

            if (
                (isCampaignPeriod || isTapTasticReady) &&
                txnTypeList.includes(txnType) &&
                displayPopup
            ) {
                navigation.push("TabNavigator", {
                    screen: "CampaignChancesEarned",
                    params: {
                        chances: chance,
                        navigateInstead: true,
                        isTapTasticReady,
                        tapTasticType,
                    },
                });
            }
        }
    }, [getModel, navigation]);

    const init = useCallback(async () => {
        try {
            // getS2WgameEarnChance backend require us to call this first.
            // Upon succesful 200, proceed
            await getS2WgameEarnChance();
            const response = await getS2WUuid();

            if (response) {
                const { uid, signature, ts } = response?.data;

                setS2Winfo({ uid, signature, ts });
            }
        } catch (error) {
            // we couldn't get the s2w stuff, maybe show error?
            if (error.message !== "login cancelled") {
                showErrorToast({
                    message: error?.message ?? "Something went wrong. Try again later.",
                });
            }

            handleOnback();
        } finally {
            updateModel({
                ui: {
                    showLoader: false,
                },
            });
        }
    }, [handleOnback]);

    async function referToFriends(prizeMsg) {
        // show share action sheet.
        const msg = `I just won ${prizeMsg} on the MAE by Maybank2u app! Think you'll be as lucky as me? Download the app now and play Raya IstiMAEwa. Not a Maybank customer? Just create a free MAE account instantly on the app.`;
        const shareOptions = {
            title: "Refer Friends",
            subject: "Refer Friends",
            message: msg,
            failOnCancel: false,
        };

        try {
            const share = await Share.open(shareOptions);

            if (share) {
                console.tron.log(share);
            }
        } catch (error) {
            console.tron.log(error);
            // showErrorToast({
            //     message: "Unable to share.",
            // });
        }
    }

    function goToTnc(tncUrl) {
        const urlString = tncUrl
            ? tncUrl
            : "https://www.maybank2u.com.my/iwov-resources/pdf/personal/promotions/2022/mae-raya-2022-tnc.pdf";

        const params = {
            file: urlString,
            share: false,
            type: "url",
            title: "Terms & Conditions",
            pdfType: "shareReceipt",
        };
        navigation.navigate(COMMON_MODULE, {
            screen: PDF_VIEW,
            params: { params },
        });
    }

    async function handleEduitRaya() {
        const { isPostPassword } = getModel("auth");

        function redirection() {
            handleRedirection({
                stack: SEND_REQUEST_MONEY_STACK,
                screen: SEND_REQUEST_MONEY_DASHBOARD,
                params: {
                    entryPoint: "SortToWin",
                    includeGreeting: true,
                    routeFrom: "SortToWin",
                },
            });
        }

        if (isPostPassword) {
            redirection();
            return;
        }

        try {
            const response = await invokeL3();

            if (response) {
                redirection();
            }
        } catch (error) {
            console.tron.log("login cancelled or error");
        }
    }

    const handleRedirection = useCallback(
        ({ stack = null, screen, params = {} }) => {
            if (stack) {
                navigation.push(stack, {
                    screen,
                    params,
                });
            } else if (screen) {
                navigation.push(screen, params);
            }
        },
        [navigation]
    );

    function copyToClipboard(code) {
        Clipboard.setString(code);

        showInfoToast({
            message: "Reward code copied",
        });
    }
    async function handleS2URedirect() {
        const { flow } = await checks2UFlow(4, getModel);
        if (flow === SECURE2U_COOLING) {
            const { navigate } = navigation;
            navigateToS2UCooling(navigate);
        } else if (!flow || flow === "S2UReg") {
            handleRedirection({
                stack: ONE_TAP_AUTH_MODULE,
                screen: "Activate",
            });
        } else if (flow === "TAC") {
            showErrorToast({ message: "Secure2u is currently unavailable." });
        } else {
            showSuccessToast({
                message: "You've already registered for Secure2u.",
            });
        }
        return;
    }

    async function handleZakatRedirect() {
        const { isPostPassword } = getModel("auth");

        function redirection() {
            handleRedirection({
                stack: PAYBILLS_MODULE,
                screen: ZAKAT_TYPE,
                params: {
                    zakatFlow: true,
                    isFav: false,
                    prevSelectedAccount: null,
                    fromModule: "GameStack",
                    fromScreen: "Main",
                },
            });
        }

        if (isPostPassword) {
            redirection();
            return;
        }

        try {
            const response = await invokeL3();

            if (response) {
                redirection();
            }
        } catch (error) {
            console.tron.log("login cancelled or error");
        }
    }

    function createRequiredFieldObj(fieldLabel, fieldValue, fieldName) {
        const alternateLabel =
            fieldName == "bilAcct" ? "Bill Account Number" : "Bill Reference Number";
        return {
            fieldLabel: fieldLabel,
            fieldValue: "",
            fieldName: fieldName,
            alternateLabel: alternateLabel,
        };
    }

    function handleGoToTAPtasticDonate() {
        navigation.navigate(PAYBILLS_MODULE, {
            screen: MB_HEART_TAPTASTIC,
            params: {
                isTapTasticReady,
                tapTasticType,
                isPostLogin,
                isPostPassword,
                haveDonationDetails,
                donationDetails,
            },
        });
    }
    const handleGoToDonate = useCallback(async () => {
        // Copied from maybankheart widget

        if (!isPostPassword) {
            const httpResp = await invokeL3(true).catch((error) => {
                console.log("[GatewayScreen][invokeL3] >> Exception: ", error);
            });
            const code = httpResp?.data?.code ?? null;

            if (code !== 0) {
                return;
            }
        }
        getDonationDetails();
        handleGoToTAPtasticDonate();
        return;
        // try {
        //     const response = await getPayeeDetails(["AJD"]);

        //     if (response) {
        //         const mbbHeartPayeeDetails = response?.data?.resultList[0] ?? [];
        //         let requiredFieldArray = [];

        //         if (mbbHeartPayeeDetails.billAcctRequired == "0" && requiredFieldArray.length < 2) {
        //             requiredFieldArray.push(
        //                 createRequiredFieldObj(
        //                     mbbHeartPayeeDetails.bilAcctDispName,
        //                     mbbHeartPayeeDetails.acctId,
        //                     "bilAcct"
        //                 )
        //             );
        //         }

        //         if (mbbHeartPayeeDetails.billRefRequired == "0" && requiredFieldArray.length < 2) {
        //             requiredFieldArray.push(
        //                 createRequiredFieldObj(mbbHeartPayeeDetails.billRefDispName, "", "billRef")
        //             );
        //         }

        //         handleRedirection({
        //             stack: PAYBILLS_MODULE,
        //             screen: PAYBILLS_PAYEE_DETAILS,
        //             params: {
        //                 billerInfo: {
        //                     ...mbbHeartPayeeDetails,
        //                     fullName: "MaybankHeart",
        //                     subName: "Maybank",
        //                 },
        //                 requiredFields: [...requiredFieldArray],
        //                 donationFlow: true,
        //                 fromModule: "GameStack",
        //                 fromScreen: "Main",
        //             },
        //         });
        //     }
        // } catch (error) {
        //     // failed to get the data of payee
        //     showErrorToast({
        //         message: error?.message ?? "Something went wrong. Try again later.",
        //     });
        // }
    }, [getModel, handleRedirection]);
    const getDonationDetails = useCallback(async () => {
        setDonationDetails({ totalContribution: "", individualContribution: "" });
        setHaveDonationDetails(false);

        // call api
        if (isOnboard && isPostLogin) {
            try {
                const response = await getDonationData(false);
                console.log("[Maybank Heart Widget] response: ", response);

                if (response?.data?.statusCode === "000") {
                    const { currencyCode, individualContribution, totalContribution } =
                        response?.data;

                    setDonationDetails({
                        totalContribution: `${currencyCode}${numeral(totalContribution).format(
                            "0,0.00"
                        )}`,
                        individualContribution: individualContribution
                            ? `${currencyCode}${numeral(individualContribution).format("0,0.00")}`
                            : "RM0.00",
                    });
                    setHaveDonationDetails(true);
                    // console.log("[Maybank Heart Widget] donation details: ", donationDetails);
                }
            } catch (error) {
                setHaveDonationDetails(false);
            }
        }
    }, [isOnboard, isPostLogin]);

    function handleOnEvent(event) {
        console.log(event?.nativeEvent?.data);

        // handle token error
        if (event?.nativeEvent?.data.indexOf("ajax error") > -1) {
            if (
                event?.nativeEvent?.data.indexOf("401") > -1 ||
                event?.nativeEvent?.data.indexOf("403") > -1
            ) {
                handleTokenError();
                return;
            }
        }

        // handle copy reward code
        if (event?.nativeEvent?.data.indexOf("copy-code") > -1) {
            const data = event?.nativeEvent?.data;
            const rewardCode = data.substr(data.indexOf(":") + 2, data.length);

            if (rewardCode) {
                copyToClipboard(rewardCode);
            }
        }
        if (event?.nativeEvent?.data.indexOf("tnc_url") > -1) {
            const data = event?.nativeEvent?.data;
            const url = data.substr(data.indexOf(":") + 2, data.length);
            console.log("handleOnEvent: ", url);
            goToTnc(url);
        } else if (event?.nativeEvent?.data.indexOf("game_prize") > -1) {
            const data = event?.nativeEvent?.data;
            const game_prize = data.substr(data.indexOf(":") + 1, data.length);
            referToFriends(game_prize);
        } else {
            switch (event?.nativeEvent?.data) {
                case "game_started":
                    setGame(true);
                    // webview.current?.injectJavaScript(removeTopPadding);
                    break;
                case "game_over":
                    setGame(false);
                    // webview.current?.injectJavaScript(addTopPadding);
                    break;
                case "tnc":
                    goToTnc();
                    break;
                case "tnc_with_url":
                    goToTnc();
                    break;
                case "apply_mae_card":
                    handleRedirection({
                        stack: BANKINGV2_MODULE,
                        screen: GATEWAY_SCREEN,
                        params: {
                            action: "APPLY_MAE_CARD",
                        },
                    });
                    break;
                case "create_tabung":
                    handleRedirection({
                        stack: TABUNG_STACK,
                        screen: TABUNG_MAIN,
                        params: {
                            screen: TABUNG_TAB_SCREEN,
                        },
                    });
                    break;
                case "activate_booster":
                    handleRedirection({
                        stack: TABUNG_STACK,
                        screen: TABUNG_MAIN,
                        params: {
                            screen: TABUNG_TAB_SCREEN,
                            params: {
                                index: 1,
                            },
                        },
                    });
                    break;
                case "sp":
                    handleRedirection({
                        stack: "QrStack",
                        screen: qrEnabled ? "QrMain" : "QrStart",
                        params: {
                            primary: true,
                            settings: false,
                            fromRoute: "",
                            fromStack: "",
                        },
                    });
                    break;
                case "sp_angpao":
                    handleRedirection({
                        stack: "QrStack",
                        screen: qrEnabled ? "QrMain" : "QrStart",
                        params: {
                            primary: true,
                            settings: false,
                            fromRoute: "",
                            fromStack: "",
                            quickAction: true,
                        },
                    });
                    break;
                case "snr_angpao_greeting":
                    handleEduitRaya();
                    break;
                case "snr_angpao":
                    handleRedirection({
                        stack: SEND_REQUEST_MONEY_STACK,
                        screen: SEND_REQUEST_MONEY_DASHBOARD,
                        params: {},
                    });
                    break;
                case "requestMoney":
                    handleRedirection({
                        stack: SEND_REQUEST_MONEY_STACK,
                        screen: SEND_REQUEST_MONEY_DASHBOARD,
                        params: {
                            cta: "request",
                            routeFrom: "sortToWin",
                        },
                    });
                    break;
                case "sendMoney":
                    handleRedirection({
                        stack: SEND_REQUEST_MONEY_STACK,
                        screen: SEND_REQUEST_MONEY_DASHBOARD,
                        params: {
                            cta: "send",
                        },
                    });
                    break;
                case "paybill":
                    handleRedirection({
                        stack: PAYBILLS_MODULE,
                        screen: PAYBILLS_LANDING_SCREEN,
                        params: { data: null },
                    });
                    break;
                case "reload":
                case "reload_50":
                case "reload_hotlink":
                    handleRedirection({
                        stack: RELOAD_MODULE,
                        screen: RELOAD_SELECT_TELCO,
                        params: {},
                    });
                    break;
                case "split_bill":
                    handleRedirection({
                        stack: BANKINGV2_MODULE,
                        screen: SB_DASHBOARD,
                        params: { routeFrom: "SortToWin", refId: null, activeTabIndex: 1 },
                    });
                    break;
                case "fnb_makan_mana":
                    handleRedirection({
                        stack: FNB_MODULE,
                        screen: FNB_TAB_SCREEN,
                        params: {
                            index: 1,
                            navigateFrom: "Dashboard",
                        },
                    });
                    break;
                case "klia":
                    handleRedirection({
                        stack: KLIA_EKSPRESS_STACK,
                        screen: KLIA_EKSPRESS_DASHBOARD,
                        params: {},
                    });
                    break;
                case "pay_mae":
                    handleRedirection({
                        stack: "",
                        screen: "",
                        params: {},
                    });
                    break;
                case "duit_now":
                    handleRedirection({
                        stack: FUNDTRANSFER_MODULE,
                        screen: TRANSFER_TAB_SCREEN,
                        params: { index: 2, screenDate: { routeFrom: "SortToWin" } },
                    });
                    break;
                case "loyalty":
                    handleRedirection({
                        stack: LOYALTY_MODULE_STACK,
                        screen: LOYALTY_CARDS_SCREEN,
                        params: {},
                    });
                    break;
                case "apply_mae":
                    handleRedirection({
                        stack: MAE_MODULE_STACK,
                        screen: MAE_INTRODUCTION,
                        params: {
                            entryStack: "GameStack",
                            entryScreen: "Main",
                            entryParams: {},
                        },
                    });
                    break;
                case "zakat_fitrah":
                    handleZakatRedirect();
                    break;
                case "asnb_transfer":
                    handleRedirection({
                        stack: FUNDTRANSFER_MODULE,
                        screen: TRANSFER_TAB_SCREEN,
                        params: {
                            isNewASNBTransferEntryPoint: true,
                            screenDate: { routeFrom: "SortToWin" },
                        },
                    });
                    break;
                case "s2uregcta":
                    handleS2URedirect();
                    break;
                case "donatecta":
                    handleGoToDonate();
                    break;
                case "oversea_transfer":
                    handleRedirection({
                        stack: FUNDTRANSFER_MODULE,
                        screen: TRANSFER_TAB_SCREEN,
                        params: {
                            index: isBakongReady ? 4 : 0,
                            from: isBakongReady ? 4 : 0, // 4- bakong
                            screenDate: { routeFrom: "SortToWin" },
                        },
                    });
                    break;
                case "sama2lokal":
                    handleRedirection({
                        stack: SSL_STACK,
                        screen: SSL_START,
                    });
                    break;
                case "duitnow_request":
                    handleRedirection({
                        stack: REQUEST_TO_PAY_STACK,
                        screen: REQUEST_TO_PAY_ID_SCREEN,
                        params: { screenDate: { routeFrom: "SortToWin" } },
                    });
                    break;
                case "my_groser":
                    handleRedirection({
                        stack: TICKET_STACK,
                        screen: MY_GROSER_INAPP_WEBVIEW_SCREEN,
                    });
                    break;
                case "apply_efd":
                    handleRedirection({
                        stack: FIXED_DEPOSIT_STACK,
                        screen: "FDEntryPointValidationScreen",
                        params: {
                            routeFrom: "SortToWin",
                            fdEntryPointModule: "More",
                            fdEntryPointScreen: "Apply",
                        },
                    });
                    break;
                case "sp_reg":
                    if (qrEnabled) {
                        showSuccessToast({
                            message: "You've already registered for Scan & Pay.",
                        });
                    } else {
                        handleRedirection({
                            stack: "QrStack",
                            screen: qrEnabled ? "QrMain" : "QrStart",
                            params: {
                                primary: true,
                                settings: false,
                                fromRoute: "",
                                fromStack: "",
                                quickAction: true,
                            },
                        });
                    }
                    break;
                default:
                    break;
            }
        }
    }

    function onError(syntheticEvent) {
        const { nativeEvent } = syntheticEvent;
        console.log("WebView error: ", nativeEvent);
    }

    function onHttpError(syntheticEvent) {
        const { nativeEvent } = syntheticEvent;
        console.log("WebView HTTP error: ", nativeEvent);
    }

    useEffect(() => {
        if (route?.params?.isFromWidget) {
            updateModel({
                ui: {
                    showLoader: true,
                },
            });

            checkForChances();
        }

        () => {
            navigation.setParams({
                isFromWidget: null,
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (!(s2Winfo?.uid || isReady)) {
                init();
            }
            // performGameValidation();
            return () => {
                clearTimeout(timer.current);
            };
        }, [init, s2Winfo])
    );
    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={TRANSPARENT}
                analyticScreenName="SortToWin"
                showLoaderModal={!(s2Winfo.uid || isReady)}
            >
                <>
                    <View style={styles.dummyPlaceholder}>
                        <Image
                            source={isFestival ? tapTasticAssets[tapTasticType].genericBg : bgImage}
                            style={styles.gameBg}
                        />
                    </View>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        isGame
                        header={
                            <HeaderLayout
                                backgroundColor={isFestival ? TRANSPARENT : menuBarColor}
                                headerLeftElement={
                                    gameStarted ? null : (
                                        <HeaderBackButton
                                            isWhite={isFestival}
                                            onPress={handleOnback}
                                        />
                                    )
                                }
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        color={isFestival && WHITE}
                                        text={
                                            gameStarted
                                                ? null
                                                : `${
                                                      isFestival
                                                          ? "Raya IstiMAEwa"
                                                          : gameMetadata?.gameHeaderTitle
                                                  }`
                                        }
                                    />
                                }
                                headerRightElement={null}
                            />
                        }
                        contentContainerStyle={styles.gameContainer}
                    >
                        <>
                            {!!s2Winfo.uid && !!s2Winfo.signature && !!s2Winfo.ts ? (
                                <WebView
                                    ref={webview}
                                    originWhitelist={["*"]}
                                    source={{
                                        // uri: `http://localhost:9000/?token=${token}&uid=${s2Winfo.uid}&signature=${s2Winfo.signature}&ts=${s2Winfo.ts}&debug=true`,
                                        uri: `${ENDPOINT_BASE}/game/prototype/index.html?token=${token}&uid=${s2Winfo.uid}&signature=${s2Winfo.signature}&ts=${s2Winfo.ts}`,
                                    }}
                                    startInLoadingState
                                    javaScriptEnabled
                                    allowUniversalAccessFromFileURLs
                                    renderLoading={renderLoading}
                                    mixedContentMode="always"
                                    containerStyle={styles.webviewContainer}
                                    onMessage={handleOnEvent}
                                    onLoadEnd={handleLoadReady}
                                    onError={onError}
                                    onHttpError={onHttpError}
                                    style={styles.webviewBg(
                                        isTapTasticReady && !isFestival
                                            ? "#061F44"
                                            : gameMetadata?.gameHeaderBgColor
                                    )}
                                />
                            ) : (
                                renderLoading()
                            )}
                        </>
                    </ScreenLayout>
                </>
            </ScreenContainer>
        </>
    );
}

GameEngine.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    cnyGameBg: {
        backgroundColor: "#00497F",
    },
    dummyPlaceholder: {
        position: "absolute",
        ...StyleSheet.absoluteFill,
    },
    gameBg: {
        height: "100%",
        width: "100%",
    },
    gameContainer: { flex: 1 },
    loaderContainer: {
        ...StyleSheet.absoluteFill,
        alignItems: "center",
        justifyContent: "center",
    },
    webviewBg: (color) => ({
        backgroundColor: color || MEDIUM_GREY,
    }),
    webviewContainer: {
        flex: 1,
    },
});
