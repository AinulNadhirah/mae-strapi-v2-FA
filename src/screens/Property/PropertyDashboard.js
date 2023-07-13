/* eslint-disable react/jsx-no-bind */

/* eslint-disable no-lone-blocks */

/* eslint-disable react-hooks/exhaustive-deps */
import AsyncStorage from "@react-native-community/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useReducer, useState } from "react";

import {
    BANKINGV2_MODULE,
    PROPERTY_DASHBOARD,
    PROPERTY_INTRO,
    CHAT_LIST,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import GenericImageButton from "@components/Buttons/GenericImageButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import TabView from "@components/Specials/TabView";
import Typo from "@components/Text";
import { showInfoToast, showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import {
    getPropertyList,
    getPreLoginPropertyList,
    getPreLoginPropertyListCloud,
    getPromoList,
    getApplicationList,
    getBookmarkedPropertyList,
    getJAPendingInvitations,
    getChatReadStatus,
    getPostLoginPropertyListCloud,
    getPostLoginBookmarkedPropertyList,
} from "@services";
import { logEvent } from "@services/analytics";

import { STATUS_CODE_SUCCESS } from "@constants/api";
import { MEDIUM_GREY } from "@constants/colors";
import {
    FA_TAB_NAME,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    HOME2U,
    WE_FACING_SOME_ISSUE,
} from "@constants/strings";

import { getLocationDetails, isEmpty } from "@utils/dataModel/utility";

import Assets from "@assets";

import ApplicationTab from "./Application/ApplicationTab";
import BookmarkTab from "./Bookmark/BookmarkTab";
import DiscoverTab from "./DiscoverTab";

// Initial state object
const initialState = {
    // Common
    isLoading: true,
    activeScreen: null,
    activeTabIndex: 0,
    token: null,
    loading: false,

    // Tab Data
    propertyData: [],
    applicationData: [],
    pendingInvitationData: [],
    promoData: [],

    // Coordinates related
    latitude: "",
    longitude: "",
    coordinatesUpdateFlag: false,

    // Application Tab related
    applTabPageSize: 10,
    applTabTotalCount: 0,
    applTabPageNumber: null,

    //Bookmark Tab
    bookmarkTabPageNumber: null,
    bookmarkedData: [],
    bookmarkPaginationExists: false,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "setCoordinates":
            return {
                ...state,
                latitude: payload?.latitude,
                longitude: payload?.longitude,
                coordinatesUpdateFlag: true,
            };
        case "setIsLoading":
            return {
                ...state,
                isLoading: payload,
            };
        case "setActiveScreen":
            return {
                ...state,
                activeScreen: payload,
            };
        case "setActiveTabIndex":
            return {
                ...state,
                activeTabIndex: payload,
            };
        case "setToken":
            return {
                ...state,
                token: payload,
            };
        case "setPropertyData":
            return {
                ...state,
                propertyData: payload ?? [],
            };
        case "setPromoData":
            return {
                ...state,
                promoData: payload ?? [],
            };
        case "SET_APPLICATION_LIST_DATA":
            return {
                ...state,
                applicationData: payload ?? [],
            };
        case "SET_PENDING_APPLICATION_LIST_DATA":
            return {
                ...state,
                pendingInvitationData: payload ?? [],
            };
        case "SET_APPLICATION_PG_NUM":
            return {
                ...state,
                applTabPageNumber: payload,
            };
        case "SET_APPLICATION_TOTAL_COUNT":
            return {
                ...state,
                applTabTotalCount: payload,
            };
        case "SET_BOOKMARKED_PROPERTY_PG_NUM":
            return {
                ...state,
                bookmarkTabPageNumber: payload,
            };
        case "SET_BOOKMARKED_PROPERTY_LIST":
            return {
                ...state,
                bookmarkedData: payload ?? [],
            };
        case "SET_BOOKMARKED_PAGINATION_EXISTS":
            return {
                ...state,
                bookmarkPaginationExists: payload,
            };
        case "SET_LOADING":
            return {
                ...state,
                loading: payload,
            };
        default:
            return { ...state };
    }
}

function PropertyDashboard({ route, navigation }) {
    const { getModel, updateModel } = useModelController();
    const [state, dispatch] = useReducer(reducer, initialState);
    const { isPostLogin } = getModel("auth");
    const [isUnreadMsg, setIsUnreadMsg] = useState(false);

    const {
        user: { isOnboard },
    } = getModel(["user"]);
    const {
        activeScreen,
        activeTabIndex,
        propertyData,
        promoData,
        applicationData,
        applTabPageNumber,
        bookmarkedData,
        bookmarkTabPageNumber,
        loading,
        pendingInvitationData,
    } = state;
    const tabs = ["DISCOVER", "APPLICATION", "BOOKMARK"];
    useEffect(() => {
        init();
    }, []);

    // check the activeTabIndex and perform the prelogin login on backpress
    React.useEffect(() => {
        const checkOnBackPress = navigation.addListener("focus", () => {
            if (activeTabIndex === 1 || activeTabIndex === 2) {
                if (isOnboard) {
                    if (activeTabIndex === 1) {
                        reloadApplication();
                    } else if (activeTabIndex === 2) {
                        reloadBookmark();
                    }
                } else {
                    navigation.goBack();
                }
            }
        });
        return checkOnBackPress;
    });

    // Used to dynamically set a Tab active based on Navigation params
    useEffect(() => {
        const paramActiveTabIndex = route.params?.activeTabIndex ?? null;
        const paramReload = route.params?.reload ?? false;

        // Changes Active Tab
        if (typeof paramActiveTabIndex === "number" && paramActiveTabIndex !== activeTabIndex) {
            dispatch({ actionType: "setActiveTabIndex", payload: paramActiveTabIndex });

            navigation.setParams({
                activeTabIndex: null,
            });
        }

        // Reloads data of active tab
        if (paramReload) {
            switch (paramActiveTabIndex) {
                case 0:
                    reloadDiscover();
                    break;
                case 1:
                    reloadApplication();
                    break;
                case 2:
                    reloadBookmark();
                    break;
                default:
                    break;
            }

            navigation.setParams({
                reload: null,
            });
        }
    }, [route.params]);

    const fetchChatReadStatus = useCallback(async () => {
        const params = {};
        getChatReadStatus(params, false).then((httpResp) => {
            console.log("[PropertyDashboard][getChatReadStatus] >> Response: ", httpResp);

            const result = httpResp?.data?.result ?? null;
            setIsUnreadMsg(result);
        });
    }, [navigation]);

    const refreshFromBookmark = useCallback(async () => {
        if (route.params?.refreshFromBookmark) {
            switch (route.params?.tab) {
                case "bookmarkTab":
                    {
                        dispatch({
                            actionType: "setActiveTabIndex",
                            payload: 2,
                        });
                        await reloadBookmark();
                        navigation.setParams({ ...route?.params, refreshFromBookmark: false });
                    }
                    break;
                case "discoverTab":
                    {
                        dispatch({
                            actionType: "setActiveTabIndex",
                            payload: 0,
                        });
                        reloadDiscover();
                        navigation.setParams({ ...route?.params, refreshFromBookmark: false });
                    }
                    break;
                default:
                    break;
            }
        }
    }, [navigation, route.params]);

    useFocusEffect(
        useCallback(() => {
            refreshFromBookmark();
            fetchChatReadStatus();
        }, [refreshFromBookmark, fetchChatReadStatus])
    );

    // Called when latitude and longitude values are updated
    useEffect(() => {
        console.log(
            "[PropertyDashboard] >> Latitude: ",
            state.latitude,
            " | Longitude: ",
            state.longitude
        );

        if (state.coordinatesUpdateFlag) {
            // Call API to fetch properties
            getProperties(true);

            // Call API to fetch promotions
            getPromotions(true);
        }
    }, [state.coordinatesUpdateFlag]);

    // Used to invoke getApplicationList API call
    useEffect(() => {
        if (applTabPageNumber) {
            fetchApplicationTabData();
            getJAPendingInvitation();
        }
    }, [applTabPageNumber]);

    useEffect(() => {
        async function fetchBookmark() {
            if (bookmarkTabPageNumber) await fetchBookmarkTabData();
        }
        fetchBookmark();
    }, [bookmarkTabPageNumber]);

    async function init() {
        console.log("[PropertyDashboard] >> [init]");

        // Update token value
        const { token } = getModel("auth");
        dispatch({ actionType: "setToken", payload: token ? `bearer ${token}` : "" });

        const propertyIntroCompleted = await AsyncStorage.getItem("propertyIntro");
        if (propertyIntroCompleted === "true") {
            // Fetch user coordinates
            fetchCoordinates();

            dispatch({ actionType: "setActiveScreen", payload: PROPERTY_DASHBOARD });
        } else {
            // Added this delay due to image render issue on next screen
            navigation.replace(BANKINGV2_MODULE, {
                screen: PROPERTY_INTRO,
            });
            // keeping it for future
            // setTimeout(() => {
            //     navigation.replace(BANKINGV2_MODULE, {
            //         screen: PROPERTY_INTRO,
            //     });
            // }, 500);
        }

        analyticsScreenLoadLogEvent();
    }
    const getJAPendingInvitation = async () => {
        const result = await getJAPendingInvitations();
        dispatch({
            actionType: "SET_PENDING_APPLICATION_LIST_DATA",
            payload: result?.data?.result || [],
        });
    };
    const analyticsScreenLoadLogEvent = () => {
        console.log("[PropertyDashboard] >> [analyticsScreenLoadLogEvent]");
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Property",
            [FA_TAB_NAME]: "Discover",
        });
    };

    const fetchCoordinates = async () => {
        console.log("[PropertyDashboard] >> [fetchCoordinates]");

        const data = await getLocationDetails().catch((error) => {
            console.log("[PropertyDashboard][getLocationDetails] >> Exception: ", error);
        });
        const latitude = data?.location?.latitude ?? "";
        const longitude = data?.location?.longitude ?? "";

        // Store in state
        dispatch({
            actionType: "setCoordinates",
            payload: { latitude, longitude },
        });
    };

    const reloadDiscover = () => {
        console.log("[PropertyDashboard] >> [reloadDiscover]");
        fetchDiscoverTabData(true);
        fetchChatReadStatus();
    };

    const reloadApplication = () => {
        console.log("[PropertyDashboard] >> [reloadApplication]");

        // Reset counter to trigger API call
        resetApplicationPagination();
        fetchChatReadStatus();
    };

    const fetchDiscoverTabData = (hardReload = false) => {
        console.log("[PropertyDashboard] >> [fetchDiscoverTabData]");

        // Call APIs to fetch data for respective sections
        getProperties(hardReload);
        getPromotions(hardReload);
    };

    const fetchApplicationTabData = async () => {
        console.log("[PropertyDashboard] >> [fetchApplicationTabData]");
        // if (isPostLogin) {
        // Loading - ON
        setLoading(1, true);
        // Request object
        const params = {
            type: state.applicationTypeValue,
            page_no: applTabPageNumber,
            page_size: state.applTabPageSize,
        };
        //API call to fetch Application list
        getApplicationList(params, false)
            .then((httpResp) => {
                console.log("[PropertyDashboard][getApplicationList] >> Response: ", httpResp);
                //const statusCode = httpResp?.data?.result?.statusCode ?? null;
                //const statusDesc = httpResp?.data?.result?.statusDesc ?? COMMON_ERROR_MSG;
                const applicationList = httpResp?.data?.result?.applicationList ?? [];
                const paginationData = [...state.applicationData, ...applicationList];
                const totalRecords = httpResp?.data?.result?.total_record ?? paginationData.length;
                // Assign application list fetched in response
                dispatch({
                    actionType: "SET_APPLICATION_LIST_DATA",
                    payload: applTabPageNumber === 1 ? applicationList : paginationData,
                });
                // Set Total Count
                dispatch({
                    actionType: "SET_APPLICATION_TOTAL_COUNT",
                    payload: totalRecords,
                });
            })
            .catch((error) => {
                console.log("[PropertyDashboard][getApplicationList] >> Exception: ", error);
            })
            .finally(() => {
                // Loading - OFF
                setLoading(1, false);
            });
        // }
    };

    async function reloadBookmark() {
        console.log("[PropertyDashboard] >> [reloadBookmark]");
        // if (isPostLogin) {
        resetBookmarkPagination();
        // }
        //await fetchBookmarkTabData();
    }

    async function fetchBookmarkTabData() {
        console.log("[PropertyDashboard] >> [fetchBookmarkTabData]");
        setLoading(2, true);
        const pageNumber = !bookmarkTabPageNumber ? 1 : bookmarkTabPageNumber;
        const pageSize = 10;
        const params = {
            page_no: pageNumber,
            page_size: pageSize,
            filter_Type: "bookmark",
        };
        const { propertyMetadata } = getModel("misc");
        const isCloudEnabled = propertyMetadata?.propertyCloudEnabled ?? false;
        const cloudEndPointBase = propertyMetadata?.propertyCloudUrl ?? "";
        try {
            if (isPostLogin) {
                const response =
                    isCloudEnabled && !isEmpty(cloudEndPointBase)
                        ? await getPostLoginBookmarkedPropertyList(cloudEndPointBase, params)
                        : await getBookmarkedPropertyList(params);
                if (response?.data) {
                    handleGetBookmarkedPropertyList(response, pageSize);
                }
            } else {
                const response = await getBookmarkedPropertyList(params, false);
                if (response?.data) {
                    handleGetBookmarkedPropertyList(response);
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(2, false);
        }
        // }
    }

    const handleGetBookmarkedPropertyList = (response, pageSize) => {
        const newBookmarkedData = response?.data?.result?.propertyList ?? [];
        const paginationData = [...state.bookmarkedData, ...newBookmarkedData];
        const currentPageCount = response?.data?.result?.total_record;
        dispatch({
            actionType: "SET_BOOKMARKED_PROPERTY_LIST",
            payload: paginationData,
        });
        // check current page count with pageSize for pagination exists
        const paginationExists = currentPageCount !== 0 && currentPageCount >= pageSize;
        dispatch({
            actionType: "SET_BOOKMARKED_PAGINATION_EXISTS",
            payload: paginationExists,
        });
        //first time
        if (!bookmarkTabPageNumber) {
            dispatch({
                actionType: "SET_BOOKMARKED_PROPERTY_PG_NUM",
                payload: 1,
            });
        }
    };

    function incrementBookmarkPagination() {
        console.log("PropertyDashboard] >> [incrementBookmarkPagination]");

        dispatch({
            actionType: "SET_BOOKMARKED_PROPERTY_PG_NUM",
            payload: bookmarkTabPageNumber + 1,
        });
    }

    const getProperties = async (hardReload = false) => {
        console.log("[PropertyDashboard] >> [getProperties]");
        const { locationMsgFlag } = getModel("property");

        // Do not fetch data if already exists
        if (!hardReload && propertyData instanceof Array && propertyData.length) return;

        setLoading(0, true);

        const { latitude, longitude } = state;

        if ((!latitude || !longitude) && !locationMsgFlag) {
            showInfoToast({ message: "Please enable location permission to fetch accurate data." });

            // Update location msg flag - so that it should not be shown again
            updateModel({
                property: {
                    locationMsgFlag: true,
                },
            });
        }

        // Request object
        const params = {
            latitude,
            longitude,
            filter_Type: "featured",
            page_no: 1,
            page_size: 10,
        };

        const { propertyMetadata } = getModel("misc");
        const isCloudEnabled = propertyMetadata?.propertyCloudEnabled ?? false;
        const cloudEndPointBase = propertyMetadata?.propertyCloudUrl ?? "";

        // API call to fetch properties
        if (isPostLogin) {
            const apiCall =
                isCloudEnabled && !isEmpty(cloudEndPointBase)
                    ? getPostLoginPropertyListCloud(cloudEndPointBase, params)
                    : getPropertyList(params, false);

            try {
                const httpResp = await apiCall;
                handlePropertyListResponse(httpResp);
            } catch (error) {
                handlePropertyListError(error);
            } finally {
                setLoading(0, false);
            }
        } else {
            const apiCall =
                isCloudEnabled && !isEmpty(cloudEndPointBase)
                    ? getPreLoginPropertyListCloud(cloudEndPointBase, params)
                    : getPreLoginPropertyList(params);

            try {
                const httpResp = await apiCall;
                handlePropertyListResponse(httpResp);
            } catch (error) {
                handlePropertyListError(error);
            } finally {
                setLoading(0, false);
            }
        }
    };

    const handlePropertyListResponse = (httpResp) => {
        console.log("[PropertyDashboard][getPreLoginPropertyList] >> Response: ", httpResp);
        const statusCode = httpResp?.data?.result?.statusCode ?? null;
        const statusDesc = httpResp?.data?.result?.statusDesc ?? WE_FACING_SOME_ISSUE;
        const propertyList = httpResp?.data?.result?.propertyList ?? [];
        // Show error message
        if (statusCode !== STATUS_CODE_SUCCESS) {
            showErrorToast({ message: statusDesc });
        }
        // Assign properties fetched in response
        dispatch({ actionType: "setPropertyData", payload: propertyList });
    };

    const handlePropertyListError = (error) => {
        console.log("[PropertyDashboard][getPreLoginPropertyList] >> Exception: ", error);
        // Show error message
        showErrorToast({ message: WE_FACING_SOME_ISSUE });
        // Assign empty arraay in case of an exception
        dispatch({ actionType: "setPropertyData", payload: [] });
    };

    const getPromotions = (hardReload = false) => {
        console.log("[PropertyDashboard] >> [getPromotions]");

        const { latitude, longitude } = state;

        // Do not fetch data if already exists
        if (!hardReload && promoData instanceof Array && promoData.length) return;

        // Request object
        const params = {
            latitude,
            longitude,
            radius: 60,
        };

        // API call to fetch promotions
        getPromoList(params, false)
            .then((httpResp) => {
                console.log("[PropertyDashboard][getPromoList] >> Response: ", httpResp);

                const promoList = httpResp?.data?.result?.promotionList ?? [];
                dispatch({ actionType: "setPromoData", payload: promoList });
            })
            .catch((error) => {
                console.log("[PropertyDashboard][getPromoList] >> Exception: ", error);

                dispatch({ actionType: "setPromoData", payload: [] });
            });
    };

    const onBackTap = () => {
        console.log("[PropertyDashboard] >> [onBackTap]");

        navigation.goBack();
    };

    const setLoading = (paramTabIndex, value = false) => {
        console.log("[PropertyDashboard][setLoading] >> ", value);

        if (paramTabIndex === activeTabIndex) {
            dispatch({ actionType: "setIsLoading", payload: value });
        }
    };

    function setLoader(loading) {
        dispatch({
            actionType: "SET_LOADING",
            payload: loading,
        });
    }

    const handleTabChange = (index) => {
        console.log("[PropertyDashboard] >> [handleTabChange]");

        const tabName = (() => {
            switch (index) {
                case 1:
                    return "Application";
                case 2:
                    return "Bookmark";
                default:
                    return null;
            }
        })();

        dispatch({ actionType: "setActiveTabIndex", payload: index });

        switch (index) {
            case 0:
                fetchDiscoverTabData();
                break;
            case 1:
                if (!applTabPageNumber) resetApplicationPagination();
                break;
            case 2:
                if (bookmarkTabPageNumber !== 1) resetBookmarkPagination();
                break;
            default:
                break;
        }

        // GA view screen have to log here as useEffect from each tab is called each time tab changed.
        if (tabName) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: "Property",
                [FA_TAB_NAME]: tabName,
            });
        }
    };

    function incrementApplicationPagination() {
        console.log("[PropertyDashboard] >> [incrementApplicationPagination]");

        dispatch({
            actionType: "SET_APPLICATION_PG_NUM",
            payload: applTabPageNumber + 1,
        });
    }

    function resetApplicationPagination() {
        if (isOnboard) {
            dispatch({
                actionType: "SET_APPLICATION_PG_NUM",
                payload: null,
            });
            dispatch({
                actionType: "SET_APPLICATION_LIST_DATA",
                payload: [],
            });

            setTimeout(() => {
                dispatch({
                    actionType: "SET_APPLICATION_PG_NUM",
                    payload: 1,
                });
            }, 10);
        } else {
            setLoading(1, true);
            navigation.navigate("Onboarding", {
                screen: "OnboardingStart",
            });
        }
    }

    function resetBookmarkPagination() {
        //if (isPostLogin) {
        dispatch({
            actionType: "SET_BOOKMARKED_PROPERTY_PG_NUM",
            payload: null,
        });
        dispatch({
            actionType: "SET_BOOKMARKED_PROPERTY_LIST",
            payload: [],
        });

        setTimeout(() => {
            dispatch({
                actionType: "SET_BOOKMARKED_PROPERTY_PG_NUM",
                payload: 1,
            });
        }, 10);
    }

    async function onChatIconPress() {
        console.log("[PropertyDashboard] >> [onChatIconPress]");
        if (isOnboard) {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: CHAT_LIST,
                params,
            });
        } else {
            navigation.navigate("Onboarding", {
                screen: "OnboardingStart",
            });
            return;
        }
        // Construct Nav Params
        const params = {};

        // Navigate to Chat list screen
    }

    // This is intentionally placed just before "return", do not move it from here.
    const screens = [
        <DiscoverTab
            key={1}
            navigation={navigation}
            propertyList={propertyData}
            promoList={promoData}
            token={state.token}
            isLoading={state.isLoading}
            reloadData={reloadDiscover}
            reloadBookmark={reloadBookmark}
            latitude={state.latitude}
            longitude={state.longitude}
            setLoader={setLoader}
        />,
        <ApplicationTab
            key={2}
            navigation={navigation}
            pendingInvitationList={pendingInvitationData}
            list={applicationData}
            isLoading={state.isLoading}
            token={state.token}
            reloadData={reloadApplication}
            latitude={state.latitude}
            longitude={state.longitude}
            incrementPagination={incrementApplicationPagination}
            totalCount={state.applTabTotalCount}
            setLoader={setLoader}
            applTabPageNumber={applTabPageNumber}
        />,
        <BookmarkTab
            key={3}
            navigation={navigation}
            data={bookmarkedData}
            reloadBookmark={reloadBookmark}
            reloadDiscover={reloadDiscover}
            isLoading={state.isLoading}
            incrementPagination={incrementBookmarkPagination}
            paginationExists={state.bookmarkPaginationExists}
            bookmarkTabPageNumber={bookmarkTabPageNumber}
        />,
        // <ComingSoon />
    ];

    return (
        <>
            {activeScreen === PROPERTY_DASHBOARD && (
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showLoaderModal={loading}
                >
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text={HOME2U}
                                    />
                                }
                                headerRightElement={
                                    <GenericImageButton
                                        width={20}
                                        height={20}
                                        onPress={onChatIconPress}
                                        unreadMsg={isUnreadMsg}
                                        image={Assets.propertyChatIcon}
                                    />
                                }
                            />
                        }
                        paddingHorizontal={0}
                        paddingBottom={0}
                        paddingTop={0}
                    >
                        <TabView
                            titles={tabs}
                            screens={screens}
                            defaultTabIndex={activeTabIndex}
                            onTabChange={handleTabChange}
                            isAutoScroll={false}
                        />
                    </ScreenLayout>
                </ScreenContainer>
            )}
        </>
    );
}

PropertyDashboard.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

// const ComingSoon = () => {
//     return (
//         <View style={Style.comingSoonContainer}>
//             <Typo fontSize={16} fontWeight="600" lineHeight={19} text="Coming Soon!" />
//         </View>
//     );
// };

// const Style = StyleSheet.create({
//     comingSoonContainer: {
//         alignItems: "center",
//         flex: 1,
//         justifyContent: "center",
//     },
// });

export default PropertyDashboard;
