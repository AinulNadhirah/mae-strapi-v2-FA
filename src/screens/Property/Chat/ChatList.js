/* eslint-disable react/jsx-no-bind */

/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable react-native/split-platform-components */
import { useFocusEffect } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import {
    StyleSheet,
    View,
    Platform,
    RefreshControl,
    TouchableOpacity,
    PermissionsAndroid,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { PERMISSIONS, check, request, RESULTS } from "react-native-permissions";

import EmptyStateScreen from "@screens/CommonScreens/EmptyStateScreen";

import { CHAT_WINDOW, BANKINGV2_MODULE, PROPERTY_DASHBOARD } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { getChatList } from "@services";

import { MEDIUM_GREY, GREY, FADE_GREY, NOTIF_RED, NEARYLY_DARK_GREY } from "@constants/colors";
import {
    CHAT,
    CHAT_HISTORY_TEXT,
    COMMON_ERROR_MSG,
    NO_MESSAGE_TEXT,
    PROPERTY,
} from "@constants/strings";

import Assets from "@assets";

import {
    fetchPropertyPrice,
    fetchGetApplicants,
    fetchApplicationDetails,
} from "../Application/LAController";
import { getEncValue } from "../Common/PropertyController";

function ChatList({ route, navigation }) {
    const [emptyState, setEmptyState] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [chatList, setChatList] = useState([]);
    const [expiredChatList, setExpiredChatList] = useState([]);
    const [chatToken, setChatToken] = useState(true);
    const [customerName, setCustomerName] = useState(null);

    useEffect(() => {
        const isActiveChats = chatList instanceof Array && chatList.length > 0;
        const isExpiredChats = expiredChatList instanceof Array && expiredChatList.length > 0;

        setEmptyState(!isLoading && !(isActiveChats || isExpiredChats));
    }, [isLoading, chatList]);

    useFocusEffect(
        useCallback(() => {
            fetchChatData();
        }, [])
    );

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        console.log("[ChatList] >> [init]");
        if (Platform.OS === "ios") {
            // eslint-disable-next-line no-unused-vars
            const isPermission = await checkCameraPermission();
        } else {
            await checkAndroidPermissions();
        }
    };

    function onBackTap() {
        console.log("[ChatList] >> [onBackTap]");
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
    }

    async function fetchChatData() {
        console.log("[ChatList] >> [fetchChatData]");

        // Loading
        setIsLoading(true);

        // Request object
        const params = {};

        // API call to fetch chat list
        await getChatList(params, false)
            .then((httpResp) => {
                console.log("[ChatList][getChatList] >> Response: ", httpResp);

                const statusCode = httpResp?.data?.result?.statusCode ?? null;
                const statusDesc = httpResp?.data?.result?.statusDesc ?? COMMON_ERROR_MSG;
                const chatList = httpResp?.data?.result?.chatList ?? [];
                const activeChatList = chatList.filter(
                    (item) => item?.isApplicationActive === true
                );
                const expiredList = chatList.filter(
                    (item) => !item?.isApplicationActive || item?.isApplicationActive === null
                );
                const token = httpResp?.data?.result?.token ?? "";
                const custName = httpResp?.data?.result?.customerName;

                // Show error message
                if (statusCode !== "0000") {
                    showErrorToast({ message: statusDesc });
                }

                // Assign chat list fetched in response
                setCustomerName(custName);
                setChatList(activeChatList);
                setExpiredChatList(expiredList);
                setChatToken(token);
            })
            .catch((error) => {
                console.log("[ChatList][getChatList] >> Exception: ", error);

                // Assign empty array in case of an exception
                setChatList([]);
            })
            .finally(() => {
                // Loading - OFF
                setIsLoading(false);
            });
    }

    async function onChatPress(data) {
        console.log("[ChatList] >> [onChatPress]");

        const chatUrl = data?.chatUrl ?? null;
        const stpId = (await data?.stpId) ?? "";
        const propertyName = data?.propertyName ?? "";
        const salesPersonName = data?.agentName ?? "";
        const salesPersonMobileNo = data?.salesPersonMobileNo ?? "";
        let chatPropertyPrice;
        let isJAAccepted;
        let mainApplicantName;
        let jointApplicantName;

        if (!chatUrl && !chatToken) {
            showErrorToast({ message: "Live Chat URL is missing" });
            return;
        }

        const encStpId = await getEncValue(stpId);
        const params = {
            syncId: "",
            stpId: encStpId,
        };
        const { syncId, propertyPrice, mainCustomerName, jointCustomerName } =
            await fetchPropertyPrice(params, false);

        chatPropertyPrice = propertyPrice;
        // eslint-disable-next-line prefer-const
        mainApplicantName = mainCustomerName;
        // eslint-disable-next-line prefer-const
        jointApplicantName = jointCustomerName;

        if (syncId) {
            const encSyncId = await getEncValue(syncId);
            const { currentUser, mainApplicantDetails, jointApplicantDetails } =
                await fetchGetApplicants(encSyncId, false);

            if (propertyPrice === "" || currentUser === "M" || currentUser == null) {
                const params = {
                    syncId,
                    stpId: encStpId,
                };
                const { success, errorMessage, savedData } = await fetchApplicationDetails(
                    params,
                    false
                );

                if (!success) {
                    // Show error message
                    showErrorToast({ message: errorMessage });
                    navigation.goBack();
                    return;
                }

                chatPropertyPrice = savedData?.propertyPrice
                    ? savedData?.propertyPrice
                    : savedData?.propertyPriceRaw;

                isJAAccepted = savedData?.isAccepted;
            }

            const showGroupCoApplicant =
                currentUser === "J" ? mainApplicantName : isJAAccepted ? jointApplicantName : "";

            const isExpired = data?.isApplicationActive ? "No" : "Yes";
            const url = chatUrl + "?token=" + chatToken + "&expired=" + isExpired;
            console.log("[ChatList] >> [onChatPress] url: " + url);

            // Navigate to Chat Window
            navigation.navigate(BANKINGV2_MODULE, {
                screen: CHAT_WINDOW,
                params: {
                    chatUrl: url,
                    syncId,
                    stpId,
                    propertyName: propertyName.replace("|", ""),
                    salesPersonName,
                    salesPersonMobileNo,
                    propertyPrice: chatPropertyPrice,
                    showGroupCoApplicant,
                    currentUser,
                    mainApplicantDetails,
                    jointApplicantDetails,
                },
            });
        } else {
            const url = chatUrl + "?token=" + chatToken;
            console.log("[ChatList] >> [onChatPress] url: " + url);
            // Navigate to Chat Window
            navigation.navigate(BANKINGV2_MODULE, {
                screen: CHAT_WINDOW,
                params: {
                    chatUrl: url,
                    syncId,
                    stpId,
                    propertyName: propertyName.replace("|", ""),
                    salesPersonName,
                    salesPersonMobileNo,
                },
            });
        }
    }

    const checkAndroidPermissions = async () => {
        const permissions = await Promise.all([
            PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA),
            PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE),
            PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE),
        ]);
        const isAllPermissionsGranted = permissions.every((permission) => permission);

        if (!isAllPermissionsGranted) {
            const requests = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.CAMERA,
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            ]);
            const requestKeys = Object.keys(requests);
            const isAllRequestGranted = requestKeys.every((key) => requests[key] === "granted");
            console.log(
                "[ChatList] >> [checkAndroidPermissions] isAllRequestGranted: " +
                    isAllRequestGranted
            );
        }
    };

    const checkCameraPermission = async () => {
        const result = await check(PERMISSIONS.IOS.CAMERA);
        if (result === RESULTS.GRANTED) {
            console.log("[ChatList] >> [checkCameraPermission] Granted");
        } else if (result === RESULTS.DENIED) {
            const res2 = await request(PERMISSIONS.IOS.CAMERA);
            console.log("[ChatList] >> [checkCameraPermission] permission", res2);
        } else if (result === RESULTS.BLOCKED) {
            console.log("[ChatList] >> [checkCameraPermission] BLOCKED");
        }
    };

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={PROPERTY}
            analyticTabName={CHAT}
        >
            <>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo fontSize={16} fontWeight="600" lineHeight={19} text="Chat" />
                            }
                        />
                    }
                    showLoaderModal={isLoading}
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={24}
                    useSafeArea
                >
                    {emptyState ? (
                        <EmptyStateScreen
                            headerText={NO_MESSAGE_TEXT}
                            subText={CHAT_HISTORY_TEXT}
                            showBtn={false}
                            imageSrc={Assets.loanCalcEmptyState}
                        />
                    ) : (
                        <>
                            {chatList.length > 0 && (
                                <ScrollView
                                    style={styles.scrollContainer(
                                        expiredChatList.length > 0 ? "50%" : "100%"
                                    )}
                                    showsVerticalScrollIndicator={false}
                                    nestedScrollEnabled={true}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={isLoading}
                                            onRefresh={fetchChatData}
                                        />
                                    }
                                >
                                    {chatList.map((item, index) => {
                                        return (
                                            <ChatListItem
                                                data={item}
                                                custName={customerName}
                                                key={index}
                                                onPress={onChatPress}
                                            />
                                        );
                                    })}
                                </ScrollView>
                            )}

                            {expiredChatList.length > 0 && (
                                <>
                                    <Typo
                                        fontSize={12}
                                        fontWeight="600"
                                        lineHeight={20}
                                        text="Expired Chats"
                                        ellipsizeMode="tail"
                                        numberOfLines={1}
                                        textAlign="left"
                                        style={styles.expiredChatTitle}
                                    />
                                    <ScrollView
                                        style={styles.scrollContainer(
                                            expiredChatList.length > 0
                                                ? chatList.length > 0
                                                    ? "50%"
                                                    : "100%"
                                                : "100%"
                                        )}
                                        showsVerticalScrollIndicator={false}
                                        nestedScrollEnabled={true}
                                        refreshControl={
                                            <RefreshControl
                                                refreshing={isLoading}
                                                onRefresh={fetchChatData}
                                            />
                                        }
                                    >
                                        {expiredChatList.map((item, index) => {
                                            return (
                                                <ChatListItem
                                                    data={item}
                                                    custName={customerName}
                                                    key={index}
                                                    onPress={onChatPress}
                                                />
                                            );
                                        })}
                                    </ScrollView>
                                </>
                            )}
                        </>
                    )}
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

ChatList.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const ChatListItem = ({ custName, data, onPress }) => {
    const onItemPress = () => {
        if (onPress) onPress(data);
    };

    const isUnreadMsg = data?.unreadMsg > 0;
    let subText = "";
    let coApplicantName = "";

    if (custName === data?.mainCustomerName) {
        coApplicantName = data?.jointCustomerName && data?.jointCustomerName + ", ";
    } else if (custName === data?.jointCustomerName) {
        coApplicantName = data?.mainCustomerName && data?.mainCustomerName + ", ";
    }

    if (data?.propertyPrice) {
        subText =
            data?.propertyPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            ", " +
            coApplicantName +
            data?.agentName;
    } else {
        subText = data?.agentName;
    }

    return (
        <TouchableOpacity
            style={styles.chatItemOuterCont}
            activeOpacity={0.8}
            onPress={onItemPress}
        >
            <View style={styles.chatItemContentCont}>
                {/* Row 1 - Name of the property/input address*/}
                <View style={styles.chatItemRow}>
                    <Typo
                        lineHeight={18}
                        fontWeight="600"
                        text={data?.propertyName && data?.propertyName.replace("|", "")}
                        ellipsizeMode="tail"
                        numberOfLines={1}
                        textAlign="left"
                        style={[styles.chatItemRowLeft, styles.redDotIndicator]}
                    />
                    {isUnreadMsg && <View style={styles.redDot} />}
                </View>

                {/* Row 2 - Sales representative name*/}
                <View style={styles.chatItemRow}>
                    <Typo
                        fontSize={12}
                        lineHeight={20}
                        text={subText}
                        ellipsizeMode="tail"
                        numberOfLines={1}
                        textAlign="left"
                        style={[styles.chatItemRowLeft, styles.salesRepresentative]}
                    />
                    <Typo
                        fontSize={12}
                        lineHeight={18}
                        fontWeight="400"
                        text={data.messageDateTime}
                        textAlign="right"
                        style={styles.timeStamp}
                    />
                </View>

                {/* Row 3 - message */}
                <View style={styles.chatItemRow}>
                    <Typo
                        fontSize={10}
                        lineHeight={18}
                        fontWeight="600"
                        text={data.message}
                        color={FADE_GREY}
                        ellipsizeMode="tail"
                        numberOfLines={1}
                        style={styles.chatItemRowLeft}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
};

ChatListItem.propTypes = {
    custName: PropTypes.string,
    data: PropTypes.object,
    onPress: PropTypes.func,
};

const styles = StyleSheet.create({
    chatItemContentCont: {
        borderBottomWidth: 1,
        borderColor: GREY,
        borderStyle: "solid",
        flex: 1,
        paddingVertical: 10,
    },

    chatItemOuterCont: {
        alignItems: "center",
        flexDirection: "row",
    },

    chatItemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    chatItemRowLeft: {
        paddingRight: 14,
    },

    expiredChatTitle: {
        backgroundColor: NEARYLY_DARK_GREY,
        marginTop: 15,
        paddingHorizontal: 24,
        paddingVertical: 10,
    },

    redDot: {
        alignSelf: "flex-end",
        backgroundColor: NOTIF_RED,
        borderRadius: 4,
        height: 8,
        marginRight: 8,
        width: 8,
    },

    redDotIndicator: {
        flex: 0.9,
    },

    salesRepresentative: {
        flex: 0.6,
    },

    scrollContainer: (height) => ({
        height,
        paddingHorizontal: 24,
    }),

    timeStamp: {
        flex: 0.4,
    },
});

export default ChatList;
