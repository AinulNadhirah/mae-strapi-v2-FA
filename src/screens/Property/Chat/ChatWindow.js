/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Platform, KeyboardAvoidingView } from "react-native";
import { WebView } from "react-native-webview";

import {
    BANKINGV2_MODULE,
    APPLICATION_DETAILS,
    CHAT_WINDOW,
    CHAT_DOCUMENTS,
    PROPERTY_DASHBOARD,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";
import { TopMenu } from "@components/TopMenu";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY } from "@constants/colors";
import {
    FA_ACTION_NAME,
    FA_OPEN_MENU,
    FA_PROPERTY_CALL_RESPRESENTATIVE,
    FA_PROPERTY_CHATROOM,
    FA_PROPERTY_CHAT_DOCUMENTS,
    FA_SCREEN_NAME,
    FA_SELECT_MENU,
    FA_VIEW_APPLICATION,
} from "@constants/strings";

import { contactBankcall } from "@utils/dataModel/utility";

import { fetchApplicationDetails, fetchJointApplicationDetails } from "../Application/LAController";
import { getEncValue } from "../Common/PropertyController";

const MENU_ITEMS = [
    {
        menuLabel: "Chat Documents",
        menuParam: "CHAT_DOCUMENTS",
    },
    {
        menuLabel: "View Application",
        menuParam: "VIEW_APPLICATION",
    },
    {
        menuLabel: "Call Representative",
        menuParam: "CALL_REPRESENTATIVE",
    },
];
const menuArray = Object.freeze([...MENU_ITEMS]);

function ChatWindow({ route, navigation }) {
    const [chatUrl, setChatUrl] = useState(null);
    const [showTopMenu, setShowTopMenu] = useState(false);
    const [propertyName, setPropertyName] = useState("");
    const [salesPersonMobileNo, setSalesPersonMobileNo] = useState("");
    const [webViewCanGoBack, setWebViewCanGoBack] = useState(false);

    const propertyPrice = route.params?.propertyPrice;
    const showGroupCoApplicant = route.params?.showGroupCoApplicant
        ? ", " + route.params?.showGroupCoApplicant
        : "";

    let headerSubtitle1 = "";
    let headerSubtitle2 = "";

    if (propertyPrice) {
        headerSubtitle1 =
            "RM" + route.params?.propertyPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        headerSubtitle2 = showGroupCoApplicant + ", " + route.params?.salesPersonName;
    } else {
        headerSubtitle1 = route.params?.salesPersonName ? route.params?.salesPersonName : "";
    }

    const webView = useRef(null);

    useEffect(() => {
        init();

        // Reset/Clean up state before unmount
        return () => {
            setChatUrl(null);
        };
    }, []);

    function onBackTap() {
        console.log("[ChatWindow] [onBackTap] >> webViewCanGoBack:" + webViewCanGoBack);

        if (webViewCanGoBack && webView && webView.current) {
            webView.current?.goBack();
        } else {
            setChatUrl(null);

            // Delay is to fix the crash issue on Android on back navigation
            setTimeout(
                () => {
                    if (route?.params?.from === "NOTIFICATION") {
                        navigation.reset({
                            index: 0,
                            routes: [
                                {
                                    name: PROPERTY_DASHBOARD,
                                    params: {
                                        activeTabIndex: 1,
                                        reload: true,
                                    },
                                },
                            ],
                        });
                    } else {
                        navigation.goBack();
                    }
                },
                Platform.OS === "android" ? 1 : 0
            );
        }
    }

    const init = () => {
        console.log("[ChatWindow] >> [init]");

        const navParams = route?.params ?? {};
        const url = navParams?.chatUrl ?? null;

        setChatUrl(url);
        setPropertyName(navParams?.propertyName ?? "");
        setSalesPersonMobileNo(navParams?.salesPersonMobileNo ?? "");
    };

    const onTopMenuItemPress = (param) => {
        console.log("[ChatWindow][onTopMenuItemPress] >> param: " + param);

        // Hide menu
        closeMenu();

        setTimeout(() => {
            switch (param) {
                case "CHAT_DOCUMENTS":
                    navigateToChatDocument();
                    break;
                case "VIEW_APPLICATION":
                    // navigate to view application
                    getApplicationDetails();
                    break;
                case "CALL_REPRESENTATIVE":
                    // call
                    salesPersonMobileNo && contactBankcall(salesPersonMobileNo);
                    logEvent(FA_SELECT_MENU, {
                        [FA_SCREEN_NAME]: FA_PROPERTY_CHATROOM,
                        [FA_ACTION_NAME]: FA_PROPERTY_CALL_RESPRESENTATIVE,
                    });
                    break;
                default:
                    break;
            }
        }, 500);
    };

    async function navigateToChatDocument() {
        // L3 call to invoke password page
        // const { isPostPassword } = getModel("auth");
        // if (!isPostPassword) {
        //     try {
        //         const httpResp = await invokeL3(false);
        //         const code = httpResp?.data?.code ?? null;
        //         if (code !== 0) return;
        //     } catch (error) {
        //         return;
        //     }
        // }

        // Navigate to chat documents
        const navParams = route?.params ?? {};

        navigation.navigate(BANKINGV2_MODULE, {
            screen: CHAT_DOCUMENTS,
            params: { ...navParams },
        });

        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CHATROOM,
            [FA_ACTION_NAME]: FA_PROPERTY_CHAT_DOCUMENTS,
        });
    }

    async function getApplicationDetails() {
        console.log("[ChatWindow] >> [getApplicationDetails]");

        const navParams = route?.params ?? {};
        const syncId = navParams?.syncId ?? "";
        const latitude = navParams?.latitude ?? null;
        const longitude = navParams?.longitude ?? null;
        const stpId = navParams?.stpId ?? null;
        const currentUser = navParams?.currentUser;
        const mainApplicantDetails = navParams?.mainApplicantDetails;
        const jointApplicantDetails = navParams?.jointApplicantDetails;

        let params = {};
        if (stpId) {
            const encStpId = await getEncValue(stpId);
            params = {
                syncId: "",
                stpId: encStpId,
            };
        } else {
            const encSyncId = await getEncValue(syncId);
            params = {
                syncId: encSyncId,
                stpId: "",
            };
        }

        // Call API to fetch Application Details
        if (navParams?.currentUser === "J") {
            const { success, errorMessage, propertyDetails, savedData, cancelReason } =
                await fetchJointApplicationDetails(params);

            if (!success) {
                // Show error message
                showErrorToast({ message: errorMessage });
                return;
            }

            // Navigate to details page
            navigation.push(BANKINGV2_MODULE, {
                screen: APPLICATION_DETAILS,
                params: {
                    latitude,
                    longitude,
                    savedData,
                    propertyDetails,
                    syncId,
                    cancelReason,
                    from: CHAT_WINDOW,
                    currentUser,
                    mainApplicantDetails,
                    jointApplicantDetails,
                },
            });
        } else {
            const { success, errorMessage, propertyDetails, savedData, cancelReason } =
                await fetchApplicationDetails(params);

            if (!success) {
                // Show error message
                showErrorToast({ message: errorMessage });
                return;
            }

            // Navigate to details page
            navigation.push(BANKINGV2_MODULE, {
                screen: APPLICATION_DETAILS,
                params: {
                    latitude,
                    longitude,
                    savedData,
                    propertyDetails,
                    syncId,
                    cancelReason,
                    from: CHAT_WINDOW,
                    currentUser,
                    mainApplicantDetails,
                    jointApplicantDetails,
                },
            });
        }

        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CHATROOM,
            [FA_ACTION_NAME]: FA_VIEW_APPLICATION,
        });
    }

    function showMenu() {
        console.log("[ChatWindow] >> [showMenu]");

        // setMenuArray(menuArray);
        setShowTopMenu(true);

        logEvent(FA_OPEN_MENU, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CHATROOM,
        });
    }

    function closeMenu() {
        console.log("[ChatWindow] >> [closeMenu]");
        setShowTopMenu(false);
    }

    function handleWebViewNavigationStateChange(newNavState) {
        const { url, canGoBack } = newNavState;
        if (!url) return;
        console.log("[ChatWindow] >> [handleWebViewNaviagtion] url:" + url);
        console.log("[ChatWindow] >> [handleWebViewNaviagtion] canGoBack:" + canGoBack);
        const PDFUrl = "index.php/file/downloadfile";
        const isCanGoBack = url?.includes(PDFUrl) ? true : false;
        setWebViewCanGoBack(isCanGoBack);
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={FA_PROPERTY_CHATROOM}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <CustomHeader
                                    title={propertyName}
                                    subTitle1={headerSubtitle1}
                                    subTitle2={headerSubtitle2}
                                />
                            }
                            headerRightElement={<HeaderDotDotDotButton onPress={showMenu} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <>
                        {chatUrl && (
                            <KeyboardAvoidingView
                                behavior={Platform.select({
                                    android: "height",
                                })}
                                enabled
                                contentContainerStyle={Style.keyPad}
                                keyboardVerticalOffset={Platform.select({
                                    ios: 0,
                                    android: 100,
                                })}
                                style={Style.keyboard}
                            >
                                <WebView
                                    originWhitelist={["*"]}
                                    source={{ uri: chatUrl }}
                                    style={Style.webViewCls}
                                    containerStyle={Style.webviewContainerStyle}
                                    scalesPageToFit
                                    automaticallyAdjustContentInsets={true}
                                    scrollEnabled={true}
                                    allowUniversalAccessFromFileURLs
                                    mixedContentMode="always"
                                    allowFileAccess
                                    ref={webView}
                                    onNavigationStateChange={handleWebViewNavigationStateChange}
                                />
                            </KeyboardAvoidingView>
                        )}
                    </>
                </ScreenLayout>
            </ScreenContainer>

            {/* Top Menu */}
            <TopMenu
                showTopMenu={showTopMenu}
                onClose={closeMenu}
                onItemPress={onTopMenuItemPress}
                menuArray={menuArray}
            />
        </>
    );
}

ChatWindow.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

function CustomHeader({ title, subTitle1, subTitle2 }) {
    return (
        <View style={Style.titleCont}>
            <Typo
                textAlign="center"
                fontSize={14}
                fontWeight="600"
                lineHeight={18}
                text={title}
                ellipsizeMode="tail"
                numberOfLines={1}
            />
            <View
                style={[
                    Style.chatItemRow,
                    {
                        marginLeft: Platform.select({ android: 40, ios: 30 }),
                        marginRight: Platform.select({ android: 40, ios: 30 }),
                    },
                ]}
            >
                <Typo
                    textAlign="left"
                    fontSize={11}
                    fontWeight="600"
                    lineHeight={13}
                    text={subTitle1}
                    ellipsizeMode="tail"
                    numberOfLines={1}
                />
                <Typo
                    textAlign="right"
                    fontSize={11}
                    lineHeight={13}
                    text={subTitle2}
                    ellipsizeMode="tail"
                    numberOfLines={1}
                />
            </View>
        </View>
    );
}

CustomHeader.propTypes = {
    title: PropTypes.string,
    subTitle1: PropTypes.string,
    subTitle2: PropTypes.string,
};

const Style = StyleSheet.create({
    chatItemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    keyPad: { flex: 1, flexDirection: "column" },

    keyboard: {
        flexGrow: 1,
    },

    titleCont: {
        alignItems: "center",
        justifyContent: "center",
    },
    webViewCls: {
        backgroundColor: MEDIUM_GREY,
        flex: 1,
    },
    webviewContainerStyle: {
        marginRight: -5,
    },
});

export default ChatWindow;
