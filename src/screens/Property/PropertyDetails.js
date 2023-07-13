/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable array-callback-return */
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, ScrollView, Image, View, Platform, Linking, Dimensions } from "react-native";
import * as Animatable from "react-native-animatable";
import { TouchableOpacity } from "react-native-gesture-handler";
import Swiper from "react-native-swiper";

import EmptyStateScreen from "@screens/CommonScreens/EmptyStateScreen";

import {
    ON_BOARDING_MODULE,
    ON_BOARDING_START,
    BANKINGV2_MODULE,
    CE_DECLARATION,
    CE_UNIT_SELECTION,
    CE_PROPERTY_SEARCH_LIST,
    CONNECT_SALES_REP,
    JA_PERSONAL_INFO,
    JA_ACCEPTANCE,
    PROPERTY_DASHBOARD,
    PROPERTY_DETAILS,
    JA_PROPERTY_DETAILS,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import ReadMore from "@components/Common/ReadMore";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import {
    showErrorToast,
    showInfoToast,
    showSuccessToast,
    successToastProp,
} from "@components/Toast";
import { TopMenu } from "@components/TopMenu";

import { useModelController } from "@context";

import {
    getPropertyDetails,
    getPreLoginPropertyDetails,
    getPreLoginPropertyDetailsCloud,
    getPostLoginPropertyDetailsCloud,
    invokeL2,
    JointApplicationInviteResponse,
    getGroupChat,
} from "@services";
import { FAProperty, FAPropertyDetails } from "@services/analytics/analyticsProperty";

import { STATUS_CODE_SUCCESS } from "@constants/api";
import {
    GREY,
    MEDIUM_GREY,
    GREY_DARK,
    FADE_GREY,
    COD_GRAY,
    WHITE,
    YELLOW,
    ROYAL_BLUE,
    ACTIVE_COLOR,
    INACTIVE_COLOR,
    LOADER_DARK_GRAY,
} from "@constants/colors";
import { HIGH_RISE_ICON_IDS, PROP_LA_INPUT } from "@constants/data";
import {
    COMMON_ERROR_MSG,
    PROPERTY_MDM_ERR,
    PROPERTY_AGE_ERR,
    PROPERTY_NATIONALITY_ERR,
    SELECT_PROPERTY,
    REQ_ASSITANCE_POPUP_TITLE,
    REQ_ASSITANCE_POPUP_DESC,
    REQ_ASSITANCE_POPUP_SUBSEQUENT_TITLE,
    REQ_ASSITANCE_POPUP_SUBSEQUENT_DESC,
    APDL_TAG,
    FA_ADD_BOOKMARK,
    FA_REMOVE_BOOKMARK,
    FA_PROPERTY_APPLYMORTGAGE_PROPERTYDETAILS,
    FA_MAKE_AN_INQUIRY,
    FA_DOWNLOAD_BROUCHURE,
    FA_CHECK_ELIGIBILITY,
    FA_ACCEPT_INVITATION,
    FA_DECLINE_INVITATION,
    FA_PROPERTY_JA_REQUEST_DECLINE,
    CHECK_ELIGIBILITY,
    DOWNLOAD_BROCHURE,
    SHARE_PROPERTY_LINK,
    DESCRIPTION,
    FACILITIES,
    CONNECTIVITY,
    AMENITIES,
    DEVELOPER,
    ACCEPT_INVITATION,
    DECLINE_INVITATION,
    MAKE_AN_INQUIRY,
    READ_MORE,
    SHOW_LESS,
} from "@constants/strings";

import { isEmpty } from "@utils/dataModel/utility";
import { downloadBrochurePDF } from "@utils/pdfUtils";

import Assets from "@assets";

import BookmarkIcon from "./Common/BookmarkIcon";
import DeveloperRow from "./Common/DeveloperRow";
import FacilitiesRow from "./Common/FacilitiesRow";
import {
    fetchCCRISReport,
    getEncValue,
    getMasterData,
    getMDMData,
    checkStoragePermission,
    sharePropertyLink,
} from "./Common/PropertyController";
import PropertyImage from "./Common/PropertyImage";
import SubDetailsSet from "./Common/SubDetailsSet";
import UnitTypeTile from "./Common/UnitTypeTile";
import { isAgeEligible, getEligibilityBasicNavParams } from "./Eligibility/CEController";
import { getJEligibilityBasicNavParams } from "./JointApplicant/JAController";
import UnitTypeSwiper from "./UnitTypeSwiper";

const screenWidth = Dimensions.get("window").width;
const dynamicDimension = (screenWidth * 12) / 100;
const dynamicDimensionHalf = dynamicDimension / 2;

function PropertyDetails({ route, navigation }) {
    const { getModel } = useModelController();

    const [emptyState, setEmptyState] = useState(false);
    const [from, setFrom] = useState(null);
    const [updatePreviousPage, setUpdatePreviousPage] = useState(false);
    const [deviceToRemove, setDeviceToRemove] = useState(false);

    //properties
    const [propertyID, setPropertyID] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showTopMenu, setShowTopMenu] = useState(false);
    const [menuArray, setMenuArray] = useState([]);
    const [propertyDetails, setPropertyDetails] = useState({});
    const [propertyImages, setPropertyImages] = useState([]);
    const [description, setDescription] = useState([]);
    const [facilities, setFacilities] = useState([]);
    const [connectivity, setConnectivity] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const [developers, setDevelopers] = useState([]);
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [unitTypes, setUnitTypes] = useState([]);
    const [buildingTypes, setBuildingTypes] = useState([]);
    const [buildingTypeIcon, setBuildingTypeIcon] = useState(Assets.landedBuilding);
    const [enquiryPopup, setEnquiryPopup] = useState(false);
    const [isAssistanceRequested, setIsAssistanceRequested] = useState(false);
    const [syncId, setSyncId] = useState("");
    const [isSimplified, setIsSimplified] = useState(false);

    // Unit Type Overlay related
    const [selectedUnitTypeIndex, setSelectedUnitTypeIndex] = useState(null);
    const [showUnitTypeSwiper, setShowUnitTypeSwiper] = useState(false);

    // Dynamic Link & Share related
    const [propDeepLink, setPropDeepLink] = useState(null);

    //Make an enquiry popup title and desc
    const [popupTitle, setPopupTitle] = useState(REQ_ASSITANCE_POPUP_TITLE);
    const [popupDesc, setPopupDesc] = useState(REQ_ASSITANCE_POPUP_DESC);

    const { isPostLogin } = getModel("auth");
    const {
        user: { isOnboard },
    } = getModel(["user"]);

    //effects
    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        const { flow, from } = route.params ?? {};
        const { property_name: propertyName, property_id: propertyId, is_simplified: isSimplified } = propertyDetails ?? {};

        if (propertyName) {
            setIsSimplified(isSimplified);
        }
        FAPropertyDetails.onPropertyDetailsScreenLoad(flow, from, propertyName, propertyId);
    }, [propertyDetails, route.params, setIsSimplified]);

    const init = () => {
        console.log("[PropertyDetails] >> [init]");

        const params = route?.params ?? {};
        const propertyId = params?.propertyId ?? null;
        const propertyDetail = params?.propertyDetail ?? null;
        setSyncId(params.syncId ?? "");
        // Error checking for Property ID
        if (!propertyId && !propertyDetail) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
            onBackTap();
            return;
        }

        if (propertyDetail) {
            //from QR Scan
            setPropertyID(propertyDetail.property_id);
            setInitialData(propertyDetail);
            setIsSimplified(propertyDetails?.is_simplified);
            setLoading(false);
        } else {
            setPropertyID(propertyId);
            getDetails(propertyId);
        }
    };

    async function getDetails(propertyId) {
        try {
            console.log("[PropertyDetails] >> [getDetails]");

            setLoading(true);

            const navParams = route?.params ?? {};
            const latitude = navParams?.latitude ?? "";
            const longitude = navParams?.longitude ?? "";
            const { propertyMetadata } = getModel("misc");
            const isCloudEnabled = propertyMetadata?.propertyCloudEnabled ?? false;
            const cloudEndPointBase = propertyMetadata?.propertyCloudUrl ?? "";

            // Request object
            const params = { property_id: propertyId, latitude, longitude };

            let apiCall;
            if (isPostLogin) {
                apiCall =
                    isCloudEnabled && !isEmpty(cloudEndPointBase)
                        ? getPostLoginPropertyDetailsCloud(cloudEndPointBase, params)
                        : getPropertyDetails(params);
            } else {
                apiCall =
                    isCloudEnabled && !isEmpty(cloudEndPointBase)
                        ? getPreLoginPropertyDetailsCloud(cloudEndPointBase, params)
                        : getPreLoginPropertyDetails(params);
            }

            const httpResp = await apiCall;
            handleGetPropertyDetailsResponse(httpResp);
        } catch (error) {
            handleGetPropertyDetailsError(error);
        } finally {
            setLoading(false);
        }
    }

    const handleGetPropertyDetailsResponse = (httpResp) => {
        console.log("[PropertyDetails][handleGetPropertyDetailsResponse] >> Response: ", httpResp);
        const result = httpResp?.data?.result ?? {};
        const statusCode = result?.statusCode;
        const statusDesc = result?.statusDesc;
        if (statusCode === STATUS_CODE_SUCCESS) {
            const propertyDetail = result?.propertyDetails ?? {};
            if (propertyDetail) {
                setIsSimplified(propertyDetail?.is_simplified);
                setInitialData(propertyDetail);
            }
        } else {
            // Show error message
            showErrorToast({
                message: statusDesc || COMMON_ERROR_MSG,
            });
            onBackTap();
        }
    };

    const handleGetPropertyDetailsError = (error) => {
        console.log("[PropertyDetails][handleGetPropertyDetailsError] >> Exception: ", error);
        // Set Empty state in case of an exception
        setEmptyState(true);
        showErrorToast({
            message: error?.message ?? COMMON_ERROR_MSG,
        });
    };

    const setInitialData = (propertyDetail) => {
        console.log("[PropertyDetails] >> [setInitialData]");

        const tempMenuArray = [];
        const brochureName = propertyDetail?.brochureName ?? null;
        const brochurePath = propertyDetail?.brochureUrl ?? null;
        const deepLink = propertyDetail?.dynamic_link ?? null;
        const propertyImages = propertyDetail?.images ?? [];
        const propertyImagesArray = propertyImages.map(({ url }) => url);
        const showBrochureMenu = !!(brochureName && brochurePath);

        const buildings = propertyDetail?.buildings ?? [];
        let buildingTypes = buildings ? buildings[0].name : "";
        for (let i = 1, len = buildings.length; i < len; i++) {
            buildingTypes += `\n${buildings[i].name}`;
        }

        const count = buildings.length;
        if (count === 1) {
            const buildingId = buildings[0]?.building_id ?? "";
            const isHighRise = HIGH_RISE_ICON_IDS.indexOf(buildingId) !== -1;
            setBuildingTypeIcon(isHighRise ? Assets.highRiseBuilding : Assets.landedBuilding);
        }

        // Construct top menu data
        if (showBrochureMenu) {
            tempMenuArray.push({
                menuLabel: "Download Brochure",
                menuParam: DOWNLOAD_BROCHURE,
            });
        }
        if (deepLink) {
            tempMenuArray.push({
                menuLabel: "Share Property Link",
                menuParam: SHARE_PROPERTY_LINK,
            });
        }

        setPropertyDetails(propertyDetail);
        setPropertyImages(propertyImagesArray);
        setDescription(propertyDetail.description);
        setFacilities(propertyDetail?.facilitiesArr ?? []);
        setConnectivity(propertyDetail?.connectivityArr ?? []);
        setAmenities(propertyDetail?.amenitiesArr ?? []);
        setDevelopers(propertyDetail?.developer ?? []);
        setLatitude(propertyDetail?.latitude ?? []);
        setLongitude(propertyDetail?.longitude ?? []);
        setUnitTypes(propertyDetail?.units ?? []);
        setBuildingTypes(buildingTypes);
        setPropDeepLink(propertyDetail?.dynamic_link ?? null);
        setMenuArray(tempMenuArray);
        setFrom(route?.params?.from ?? null);
        setIsAssistanceRequested(propertyDetail?.isAssistanceRequested ?? "N");

        //If already requested then set popup title and desc
        if (isAssistanceRequested === "Y") {
            setPopupTitle(REQ_ASSITANCE_POPUP_SUBSEQUENT_TITLE);
            setPopupDesc(REQ_ASSITANCE_POPUP_SUBSEQUENT_DESC);
        }
    };

    const onBackTap = () => {
        console.log("[PropertyDetails] >> [onBackTap]");
        if (updatePreviousPage && route.params.from) {
            navigation.navigate(route.params?.from, {
                ...route?.params,
                refreshFromBookmark: true,
            });
            setUpdatePreviousPage(false);
        } else {
            navigation.setParams({ ...route.params, refreshFromBookmark: false });
            navigation.canGoBack() && navigation.goBack();
        }
    };

    const onLocationPress = () => {
        console.log("[PropertyDetails] >> [onLocationPress]");

        const { from } = route?.params ?? {};
        const { property_name: propertyName, property_id: propertyId } = propertyDetails;

        if (latitude && longitude) {
            const scheme = Platform.select({ ios: "maps:0,0?q=", android: "geo:0,0?q=" });
            const latLng = `${latitude},${longitude}`;
            console.log("[PropertyDetails] >> [latLng]: " + latLng);
            const url = Platform.select({
                ios: `${scheme}${propertyName}@${latLng}`,
                android: `${scheme}${latLng}(${propertyName})`,
            });

            url && Linking.openURL(url);

            FAPropertyDetails.onPropertyDetialsLocationPress(from, propertyName, propertyId);
        } else {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    };

    const onMakeAnInquiryPress = async () => {
        console.log("[PropertyDetails] >> [onMakeanInquiryPress]");

        /* If already made an enquiry, show popup */
        if (isAssistanceRequested === "Y" || route.params?.isAssistanceRequested) {
            setPopupTitle(REQ_ASSITANCE_POPUP_SUBSEQUENT_TITLE);
            setPopupDesc(REQ_ASSITANCE_POPUP_SUBSEQUENT_DESC);
            setEnquiryPopup(true);
            return;
        }

        // L2 call to invoke login page
        if (isOnboard) {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: CONNECT_SALES_REP,
                params: {
                    propertyDetails,
                    from: PROPERTY_DETAILS,
                },
            });
        } else {
            navigation.navigate(ON_BOARDING_MODULE, {
                screen: ON_BOARDING_START,
            });
            return;
        }

        const screenName =
            "Property_" + propertyDetails?.property_name + "_" + propertyDetails?.property_id;
        FAProperty.onPressSelectAction(screenName, FA_MAKE_AN_INQUIRY);
    };

    function onSelectProperty() {
        console.log("[PropertyDetails] >> [onSelectProperty]");

        const propertyName = propertyDetails?.property_name ?? "";

        navigation.navigate(BANKINGV2_MODULE, {
            screen: CE_UNIT_SELECTION,
            params: {
                ...route.params,
                propertyName,
                propertyDetails,
                isPropertyListed: "Y",
                from: route.params?.route,
            },
        });

        FAProperty.onPressFormProceed(FA_PROPERTY_APPLYMORTGAGE_PROPERTYDETAILS);
    }

    const onCheckEligibility = async () => {
        console.log("[PropertyDetails] >> [onCheckEligibility]");
        const { isConsentGiven } = getModel("property");

        // L2 call to invoke login page
        if (isOnboard) {
            const { isPostLogin, isPostPassword } = getModel("auth");
            if (!isPostPassword && !isPostLogin) {
                try {
                    const httpResp = await invokeL2(false);
                    const code = httpResp?.data?.code ?? null;
                    if (code !== 0) return;
                } catch (error) {
                    return;
                }
            }
        } else {
            navigation.navigate(ON_BOARDING_MODULE, {
                screen: ON_BOARDING_START,
            });
            return;
        }

        setLoading(true);
        // Prefetch required data
        const masterData = await getMasterData();
        const mdmData = await getMDMData();

        // Show error if failed to fetch MDM data
        if (!mdmData) {
            setLoading(false);
            showErrorToast({
                message: PROPERTY_MDM_ERR,
            });
            return;
        }

        // Age Eligibility Check
        const { isEligible, age } = await isAgeEligible(mdmData?.dob);
        if (!isEligible) {
            setLoading(false);
            showInfoToast({
                message: PROPERTY_AGE_ERR,
            });
            return;
        }

        // Nationality/PRIC Check
        const citizenship = mdmData?.citizenship ?? "";
        const idType = mdmData?.idType ?? "";
        if (citizenship !== "MYS" && idType !== "PRIC") {
            setLoading(false);
            showInfoToast({
                message: PROPERTY_NATIONALITY_ERR,
            });
            return;
        }

        const propertyName = propertyDetails?.property_name ?? "";
        const navParams = getEligibilityBasicNavParams({
            propertyName,
            propertyDetails,
            masterData,
            mdmData,
            age,
            latitude,
            longitude,
        });

        // Navigate to Declaration/Unit Selection screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: isConsentGiven ? CE_UNIT_SELECTION : CE_DECLARATION,
            params: {
                ...navParams,
                from: route?.params?.from,
                flow: route?.params?.flow,
            },
        });

        // Hide loader
        setLoading(false);
        const screenName =
            "Property_" + propertyDetails?.property_name + "_" + propertyDetails?.property_id;
        FAProperty.onPressSelectAction(screenName, FA_CHECK_ELIGIBILITY);
    };

    const showMenu = () => {
        console.log("[PropertyDetails] >> [showMenu]");

        setShowTopMenu(true);

        const { from } = route?.params ?? {};
        const { property_name: propertyName, property_id: propertyId } = propertyDetails;

        FAPropertyDetails.onPropertyDetailsShowMenu(from, propertyName, propertyId);
    };

    const closeMenu = () => {
        console.log("[PropertyDetails] >> [closeMenu]");
        setShowTopMenu(false);
    };

    const onTopMenuItemPress = (param) => {
        console.log("[PropertyDetails][onTopMenuItemPress] >> param: " + param);

        // Hide menu
        closeMenu();

        setTimeout(() => {
            switch (param) {
                case DOWNLOAD_BROCHURE:
                    onDowloadBrochure();
                    break;
                case SHARE_PROPERTY_LINK:
                    sharePropertyLink(propDeepLink, propertyDetails);
                    break;
                default:
                    break;
            }
        }, 500);
    };

    const onUnitTypeTap = (data, index) => {
        console.log("[PropertyDetails] >> [onUnitTypeTap]");

        setSelectedUnitTypeIndex(index);
        setShowUnitTypeSwiper(true);
    };

    const closeUnitTypeSwiper = () => {
        console.log("[PropertyDetails] >> [closeUnitTypeSwiper]");

        setSelectedUnitTypeIndex(null);
        setShowUnitTypeSwiper(false);
    };

    const onDowloadBrochure = async () => {
        console.log("[PropertyDetails] >> [onDowloadBrochure]");

        const permission = await checkStoragePermission();
        if (permission) downloadBrochurePDF(propertyDetails, propertyID);

        const screenName =
            "Property_" + propertyDetails?.property_name + "_" + propertyDetails?.property_id;
        FAProperty.onPressSelectMenu(screenName, FA_DOWNLOAD_BROUCHURE);
    };

    function _renderTruncatedFooter(handlePress) {
        return (
            <Typo
                fontSize={14}
                lineHeight={22}
                textAlign="left"
                style={styles.readMore}
                text={READ_MORE}
                onPress={handlePress}
            />
        );
    }

    function _renderRevealedFooter(handlePress) {
        return (
            <Typo
                fontSize={14}
                lineHeight={22}
                textAlign="left"
                style={styles.readMore}
                text={SHOW_LESS}
                onPress={handlePress}
            />
        );
    }

    const onPressBookmarkIcon = useCallback(
        (data) => {
            console.log("[PropertyDetails] >> [onPressBookmarkIcon]");

            const { flow, from } = route?.params ?? {};
            const { property_name: propertyName, property_id: propertyId } = propertyDetails;
            const eventName = data?.bookmarkAction === "ADD" ? FA_ADD_BOOKMARK : FA_REMOVE_BOOKMARK;

            FAPropertyDetails.onPropertyDetailsPressBookmarkIcon(
                flow,
                from,
                eventName,
                propertyName,
                propertyId
            );
        },
        [from, propertyDetails.property_name]
    );

    function onBookmarkError() {
        console.log("[PropertyDetails] >> [onBookmarkError]");

        showInfoToast({
            message: "Your request could not be proccessed at this time. Please try again later.",
        });
    }

    function onBookmarkDone() {
        console.log("[PropertyDetails] >> [onBookmarkDone]");
        setUpdatePreviousPage(true);
    }

    function closeEnquiryPopup() {
        console.log("[PropertyDetails] >> [closeEnquiryPopup]");
        setEnquiryPopup(false);
    }

    const acceptInvitation = async (isAccepted) => {
        const { JAAcceptance } = getModel("property");
        const saveData = route?.params?.saveData;
        const propertyData = propertyDetails;
        const encSyncId = await getEncValue(syncId);

        await JointApplicationInviteResponse({
            syncId: encSyncId,
            isAccepted,
        });

        if (isAccepted === "Y") {
            const masterData = await getMasterData();
            const mdmData = await getMDMData();
            const navParams = getJEligibilityBasicNavParams({
                masterData,
                mdmData,
                propertyData,
                syncId,
                latitude,
                longitude,
                saveData,
            });
            const params = {
                propertyId: propertyData?.property_id,
                progressStatus: PROP_LA_INPUT,
                syncId: encSyncId,
            };
            const { success, errorMessage } = await fetchCCRISReport(params, true);
            if (!success) {
                setLoading(false);
                // Show error message
                showErrorToast({ message: errorMessage });
                return;
            }
            if (saveData?.staffPfNo != null) {
                const params = {
                    propertyId: propertyData?.property_id,
                    stpId: saveData?.stpId ? saveData?.stpId : null,
                    operatorId: saveData?.staffPfNo,
                    syncId: encSyncId,
                    groupChatIndicator: "ADD_MEMBER",
                };

                await getGroupChat(params, true).catch((error) => {
                    console.log("[PropertyDetails][getGroupChat] >> Exception: ", error);
                });
            }

            navigation.navigate(BANKINGV2_MODULE, {
                screen: JAAcceptance ? JA_PERSONAL_INFO : JA_ACCEPTANCE,
                params: {
                    ...navParams,
                    syncId,
                },
            });
            if (route?.params?.from === JA_PROPERTY_DETAILS) {
                const screenName =
                    "Property_JA_Request_" +
                    propertyDetails?.property_name +
                    "_" +
                    propertyDetails?.property_id;
                FAProperty.onPressSelectAction(screenName, FA_ACCEPT_INVITATION);
            }
        } else {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: PROPERTY_DASHBOARD,
                params: {
                    activeTabIndex: 1,
                    reload: true,
                },
            });
            const screenName =
                "Property_JA_Request_" +
                propertyDetails?.property_name +
                "_" +
                propertyDetails?.property_id;
            FAProperty.onPressViewScreen(screenName, FA_DECLINE_INVITATION);
            showSuccessToast(
                successToastProp({
                    message: `You have declined to be a joint applicant for ${saveData?.propertyName}`,
                })
            );
        }

        await JointApplicationInviteResponse({
            syncId: encSyncId,
            isAccepted,
        });
    };

    const declineInvitationHandler = () => {
        setDeviceToRemove(true);
        FAProperty.onPressViewScreen(FA_PROPERTY_JA_REQUEST_DECLINE);
    };

    const handleClosePopup = () => {
        setDeviceToRemove(false);
    };

    function proceedRemoveDevice() {
        acceptInvitation("N");
        if (route?.params?.from === JA_PROPERTY_DETAILS) {
            const screenName =
                "Property_JA_Request_" +
                propertyDetails?.property_name +
                "_" +
                propertyDetails?.property_id;
            FAProperty.onPressSelectAction(screenName, FA_DECLINE_INVITATION);
        }
    }

    function navigateToOnboard() {
        navigation.navigate(ON_BOARDING_MODULE, {
            screen: ON_BOARDING_START,
        });
    }
    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerRightElement={
                                emptyState || menuArray.length < 1
? null
: !isSimplified
? (
                                    <HeaderDotDotDotButton onPress={showMenu} />
                                )
: null
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    {emptyState 
                    ? (
                        <EmptyStateScreen
                            headerText="No Details Available"
                            subText="Please check again later."
                            showBtn={true}
                            btnText="Go Back"
                            imageSrc={Assets.propertyListEmptyState}
                            onBtnPress={onBackTap}
                        />
                    ) 
                    : (
                        <React.Fragment>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View>
                                    {!isSimplified &&
                                        (propertyImages.length > 0
                                        ? (
                                            <View style={styles.propertyImageCls}>
                                                <Swiper
                                                    showsPagination
                                                    loop={false}
                                                    paginationStyle={styles.propertyImagesSwiperCls}
                                                    scrollEventThrottle={20}
                                                    dot={<View style={styles.swiperDot} />}
                                                    activeDot={
                                                        <Animatable.View
                                                            animation="bounceIn"
                                                            duration={750}
                                                            useNativeDriver
                                                            style={styles.swiperActiveDot}
                                                        />
                                                    }
                                                >
                                                    {propertyImages.map((item, index) => {
                                                        return (
                                                            <PropertyImage
                                                                url={item}
                                                                index={index}
                                                                key={index}
                                                            />
                                                        );
                                                    })}
                                                </Swiper>
                                            </View>
                                        )
                                        : (
                                            <PropImageEmptyState />
                                        ))}

                                    {/* Bookmark Icon */}
                                    {!isSimplified && (
                                        <View
                                            style={styles.logosContainer(
                                                dynamicDimension,
                                                dynamicDimensionHalf
                                            )}
                                        >
                                            {!loading && (
                                                <BookmarkIcon
                                                    data={propertyDetails}
                                                    onPressBookmark={
                                                        isOnboard
                                                            ? onPressBookmarkIcon
                                                            : navigateToOnboard
                                                    }
                                                    isBookmarked={propertyDetails?.isBookMarked}
                                                    onBookmarkError={onBookmarkError}
                                                    onBookmarkDone={onBookmarkDone}
                                                />
                                            )}
                                        </View>
                                    )}
                                </View>
                                <View style={styles.containerCls}>
                                    {!loading && (
                                        <>
                                            <View
                                                style={styles.propertyNameContainer(
                                                    propertyDetails?.property_name.length < 15
                                                        ? "row"
                                                        : null
                                                )}
                                            >
                                                <Typo
                                                    fontSize={18}
                                                    lineHeight={28}
                                                    fontWeight="600"
                                                    textAlign="left"
                                                    text={propertyDetails?.property_name}
                                                    style={styles.propertyNameCls}
                                                />

                                                {!propertyDetails?.apdl && (
                                                    <Typo
                                                        fontSize={12}
                                                        lineHeight={
                                                            propertyDetails?.property_name.length <
                                                            15
                                                                ? 28
                                                                : 15
                                                        }
                                                        text={APDL_TAG}
                                                        textAlign="left"
                                                        color={FADE_GREY}
                                                        style={styles.apdl}
                                                    />
                                                )}
                                            </View>

                                            <Typo
                                                fontSize={12}
                                                lineHeight={isSimplified ? 14 : 28}
                                                textAlign="left"
                                                text="From"
                                                color={FADE_GREY}
                                            />
                                            <Typo
                                                fontSize={16}
                                                lineHeight={isSimplified ? 18 : 28}
                                                fontWeight="600"
                                                textAlign="left"
                                                text={propertyDetails?.price_range}
                                            />

                                            {/* location, story, sqft, completion, hold */}
                                            <View>
                                                {!isSimplified && (
                                                    <SubDetailsSet
                                                        text={propertyDetails?.area}
                                                        textColor={ROYAL_BLUE}
                                                        iconCls={styles.metaIconCls}
                                                        icon={Assets.iconBlueLocation}
                                                        onLinkPress={onLocationPress}
                                                    />
                                                )}
                                                <SubDetailsSet
                                                    text={buildingTypes}
                                                    textColor={FADE_GREY}
                                                    iconCls={styles.metaIconCls}
                                                    icon={buildingTypeIcon}
                                                />
                                                {!isSimplified && (
                                                    <>
                                                        <SubDetailsSet
                                                            text={propertyDetails?.size}
                                                            textColor={FADE_GREY}
                                                            iconCls={styles.metaIconCls}
                                                            icon={Assets.iconGreySqf}
                                                        />
                                                        <SubDetailsSet
                                                            text={propertyDetails?.completion_year}
                                                            textColor={FADE_GREY}
                                                            iconCls={styles.metaIconCls}
                                                            icon={Assets.iconGreyCalendar}
                                                        />
                                                    </>
                                                )}
                                                <SubDetailsSet
                                                    text={propertyDetails?.tenure}
                                                    textColor={FADE_GREY}
                                                    iconCls={styles.metaIconCls}
                                                    icon={Assets.iconGreyKey}
                                                />
                                            </View>

                                            {/* Gray separator line */}
                                            {!isSimplified && <View style={styles.graySeparator} />}

                                            {/* Description */}
                                            {!isSimplified && (
                                                <>
                                                    <Typo
                                                        fontSize={16}
                                                        lineHeight={22}
                                                        fontWeight="600"
                                                        textAlign="left"
                                                        text={DESCRIPTION}
                                                        color={COD_GRAY}
                                                        style={styles.headerNameCls}
                                                    />
                                                    <ReadMore
                                                        numberOfLines={5}
                                                        renderTruncatedFooter={
                                                            _renderTruncatedFooter
                                                        }
                                                        renderRevealedFooter={_renderRevealedFooter}
                                                    >
                                                        <Typo
                                                            fontSize={14}
                                                            lineHeight={22}
                                                            textAlign="left"
                                                            color={GREY_DARK}
                                                            text={description}
                                                        />
                                                    </ReadMore>
                                                </>
                                            )}

                                            {/* Gray separator line */}
                                            {!isSimplified && <View style={styles.graySeparator} />}

                                            {/* Unit types */}
                                            {unitTypes?.length > 0 && (
                                                <>
                                                    {from === JA_PROPERTY_DETAILS
                                                    ? (
                                                        <Typo
                                                            fontSize={16}
                                                            lineHeight={22}
                                                            fontWeight="600"
                                                            textAlign="left"
                                                            text="Unit Type Selected"
                                                            color={COD_GRAY}
                                                            style={styles.headerNameCls(
                                                                isSimplified ? 15 : 0
                                                            )}
                                                        />
                                                    )
                                                    : (
                                                        <Typo
                                                            fontSize={16}
                                                            lineHeight={22}
                                                            fontWeight="600"
                                                            textAlign="left"
                                                            text="Unit Types"
                                                            color={COD_GRAY}
                                                            style={styles.headerNameCls(
                                                                isSimplified ? 15 : 0
                                                            )}
                                                        />
                                                    )}
                                                    {!isSimplified
                                                    ? (
                                                        <ScrollView
                                                            style={styles.unitTypeScrollView(-24)}
                                                            contentContainerStyle={styles.unitsListScrollContainer(
                                                                24
                                                            )}
                                                            horizontal
                                                        >
                                                            {from === JA_PROPERTY_DETAILS
                                                            ? (
                                                                <>
                                                                    {unitTypes.map(
                                                                        (unitType, index) => {
                                                                            if (
                                                                                unitTypes[index]
                                                                                    .unit_id ===
                                                                                route?.params
                                                                                    ?.saveData
                                                                                    .unitId
                                                                            ) {
                                                                                return (
                                                                                    <UnitTypeTile
                                                                                        key={index}
                                                                                        index={
                                                                                            index
                                                                                        }
                                                                                        data={
                                                                                            unitType
                                                                                        }
                                                                                        onPress={
                                                                                            onUnitTypeTap
                                                                                        }
                                                                                    />
                                                                                );
                                                                            }
                                                                        }
                                                                    )}
                                                                </>
                                                            )
                                                            : (
                                                                <>
                                                                    {unitTypes.map(
                                                                        (unitType, index) => {
                                                                            return (
                                                                                <UnitTypeTile
                                                                                    key={index}
                                                                                    index={index}
                                                                                    data={unitType}
                                                                                    onPress={
                                                                                        onUnitTypeTap
                                                                                    }
                                                                                />
                                                                            );
                                                                        }
                                                                    )}
                                                                </>
                                                            )}
                                                        </ScrollView>
                                                    )
                                                    : (
                                                        <View
                                                            style={styles.unitTypeScrollView(0)}
                                                            contentContainerStyle={styles.unitsListScrollContainer(
                                                                0
                                                            )}
                                                        >
                                                            {unitTypes.map((unitType, index) => {
                                                                return (
                                                                    <UnitTypeTile
                                                                        key={index}
                                                                        index={index}
                                                                        data={unitType}
                                                                        isSimplified={isSimplified}
                                                                    />
                                                                );
                                                            })}
                                                        </View>
                                                    )}

                                                    {/* Gray separator line */}
                                                    <View style={styles.graySeparator} />
                                                </>
                                            )}

                                            {/* Facilities */}
                                            {!isSimplified && facilities?.length > 0 && (
                                                <>
                                                    <Typo
                                                        fontSize={16}
                                                        lineHeight={22}
                                                        fontWeight="600"
                                                        textAlign="left"
                                                        text={FACILITIES}
                                                        color={COD_GRAY}
                                                        style={styles.headerNameCls}
                                                    />

                                                    {facilities.map((item, index) => (
                                                        <FacilitiesRow text={item} key={index} />
                                                    ))}

                                                    {/* Gray separator line */}
                                                    <View style={styles.graySeparator} />
                                                </>
                                            )}

                                            {/* Connectivity */}
                                            {!isSimplified && connectivity?.length > 0 && (
                                                <>
                                                    <Typo
                                                        fontSize={16}
                                                        lineHeight={22}
                                                        fontWeight="600"
                                                        textAlign="left"
                                                        text={CONNECTIVITY}
                                                        color={COD_GRAY}
                                                        style={styles.headerNameCls}
                                                    />
                                                    {connectivity.map((item, index) => (
                                                        <FacilitiesRow text={item} key={index} />
                                                    ))}

                                                    {/* Gray separator line */}
                                                    <View style={styles.graySeparator} />
                                                </>
                                            )}

                                            {/* Amenities */}
                                            {!isSimplified && amenities?.length > 0 && (
                                                <>
                                                    <Typo
                                                        fontSize={16}
                                                        lineHeight={22}
                                                        fontWeight="600"
                                                        textAlign="left"
                                                        text={AMENITIES}
                                                        color={COD_GRAY}
                                                        style={styles.headerNameCls}
                                                    />

                                                    {amenities.map((item, index) => (
                                                        <FacilitiesRow text={item} key={index} />
                                                    ))}

                                                    {/* Gray separator line */}
                                                    <View style={styles.graySeparator} />
                                                </>
                                            )}

                                            {/* Developer */}
                                            {developers?.length > 0 && (
                                                <>
                                                    <Typo
                                                        fontSize={16}
                                                        lineHeight={22}
                                                        fontWeight="600"
                                                        textAlign="left"
                                                        text={DEVELOPER}
                                                        color={COD_GRAY}
                                                        style={styles.headerNameCls}
                                                    />

                                                    {developers.map((item, index) => (
                                                        <DeveloperRow key={index} data={item} />
                                                    ))}
                                                </>
                                            )}
                                            <>
                                                {from === CE_PROPERTY_SEARCH_LIST ||
                                                from === CE_UNIT_SELECTION
                                                ? (
                                                    <View style={styles.bottomContainerCls}>
                                                        <ActionButton
                                                            fullWidth
                                                            backgroundColor={YELLOW}
                                                            componentCenter={
                                                                <Typo
                                                                    fontWeight="600"
                                                                    lineHeight={18}
                                                                    text={SELECT_PROPERTY}
                                                                />
                                                            }
                                                            onPress={onSelectProperty}
                                                        />
                                                    </View>
                                                )
                                                : from === JA_PROPERTY_DETAILS
                                                ? (
                                                    <View style={styles.bottomContainerCls}>
                                                        <ActionButton
                                                            fullWidth
                                                            backgroundColor={YELLOW}
                                                            componentCenter={
                                                                <Typo
                                                                    fontWeight="600"
                                                                    lineHeight={18}
                                                                    text={ACCEPT_INVITATION}
                                                                />
                                                            }
                                                            onPress={() => {
                                                                acceptInvitation("Y");
                                                            }}
                                                        />
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                declineInvitationHandler();
                                                            }}
                                                            activeOpacity={0.8}
                                                        >
                                                            <Typo
                                                                color={ROYAL_BLUE}
                                                                fontSize={14}
                                                                fontWeight="600"
                                                                lineHeight={18}
                                                                text={DECLINE_INVITATION}
                                                                style={styles.declineInvitationCls}
                                                            />
                                                        </TouchableOpacity>
                                                    </View>
                                                )
                                                : (
                                                    <></>
                                                )}
                                            </>
                                        </>
                                    )}
                                </View>
                            </ScrollView>
                            {from !== CE_PROPERTY_SEARCH_LIST &&
                                from !== CE_UNIT_SELECTION &&
                                from !== JA_PROPERTY_DETAILS && (
                                    <FixedActionContainer>
                                        {/* Bottom button container */}
                                        <View style={styles.fixedBottomContainerCls}>
                                            <>
                                                {/* Inquiry button */}
                                                <ActionButton
                                                    fullWidth
                                                    backgroundColor={WHITE}
                                                    borderStyle="solid"
                                                    borderWidth={1}
                                                    borderColor={GREY}
                                                    componentCenter={
                                                        <Typo
                                                            fontSize={14}
                                                            fontWeight="600"
                                                            lineHeight={18}
                                                            text={MAKE_AN_INQUIRY}
                                                        />
                                                    }
                                                    onPress={onMakeAnInquiryPress}
                                                    style={styles.inquiryBtn}
                                                />

                                                {/* Eligibility button */}
                                                <ActionButton
                                                    fullWidth
                                                    backgroundColor={YELLOW}
                                                    componentCenter={
                                                        <Typo
                                                            fontSize={14}
                                                            fontWeight="600"
                                                            lineHeight={18}
                                                            text={CHECK_ELIGIBILITY}
                                                        />
                                                    }
                                                    onPress={onCheckEligibility}
                                                />
                                            </>
                                        </View>
                                    </FixedActionContainer>
                                )}
                        </React.Fragment>
                    )}
                </ScreenLayout>
            </ScreenContainer>

            {!!deviceToRemove && (
                <Popup
                    visible
                    title={DECLINE_INVITATION}
                    description={`You've declined ${route?.params?.saveData?.mainApplicantName}'s invitation to be a joint applicant. He/She will be notified on this. This action cannot be undone.`}
                    onClose={handleClosePopup}
                    primaryAction={{
                        text: "Decline",
                        onPress: proceedRemoveDevice,
                    }}
                    secondaryAction={{
                        text: "Cancel",
                        onPress: handleClosePopup,
                    }}
                />
            )}

            {/* Top Menu */}
            <TopMenu
                showTopMenu={showTopMenu}
                onClose={closeMenu}
                onItemPress={onTopMenuItemPress}
                menuArray={menuArray}
            />

            {/* Unit Type Preview Overlay */}
            <UnitTypeSwiper
                showModal={showUnitTypeSwiper}
                onClose={closeUnitTypeSwiper}
                data={unitTypes}
                initialIndex={selectedUnitTypeIndex}
            />

            <Popup
                visible={enquiryPopup}
                title={popupTitle}
                description={popupDesc}
                onClose={closeEnquiryPopup}
                primaryAction={{
                    text: "Got it",
                    onPress: closeEnquiryPopup,
                }}
            />
        </>
    );
}

// Empty state component if no property images are fetched
function PropImageEmptyState() {
    return (
        <View style={[styles.propertyImageCls, styles.emptyStatePropImgCont]}>
            <Image style={styles.emptyStatePropImgCls} source={Assets.propertyIconColor} />
        </View>
    );
}
PropertyDetails.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    bottomContainerCls: {
        flexDirection: "column",
        marginBottom: 36,
        marginTop: 46,
    },

    containerCls: {
        marginHorizontal: 24,
    },

    declineInvitationCls: {
        marginTop: 24,
    },

    emptyStatePropImgCls: {
        height: 70,
        width: 70,
    },

    emptyStatePropImgCont: {
        alignItems: "center",
        backgroundColor: LOADER_DARK_GRAY,
        justifyContent: "center",
    },

    fixedBottomContainerCls: {
        flexDirection: "column",
        flex: 1,
        marginBottom: 30,
        marginTop: 40,
    },

    graySeparator: {
        borderColor: GREY,
        borderTopWidth: 1,
        flex: 1,
        height: 1,
        marginBottom: 20,
        marginTop: 25,
    },

    headerNameCls: (topMargin) => ({
        marginTop: topMargin,
        paddingBottom: 8,
    }),

    inquiryBtn: {
        marginBottom: 16,
    },

    logosContainer: (dimension, dimensionHalf) => ({
        height: dimension + 14,
        position: "absolute",
        right: 0,
        bottom: 0,
        marginTop: -(dimensionHalf + dimensionHalf + 7),
        marginRight: 32,
    }),

    metaIconCls: {
        flex: 0.1,
    },

    propertyImageCls: {
        height: 240,
        marginBottom: 32,
        width: "100%",
        zIndex: 0,
    },

    propertyImagesSwiperCls: {
        bottom: -20,
        position: "absolute",
    },

    propertyNameCls: {
        paddingRight: 5,
    },

    propertyNameContainer: (flex) => ({
        flex: 1,
        flexDirection: flex,
        paddingBottom: 28,
    }),

    readMore: {
        color: GREY_DARK,
        fontFamily: "montserrat",
        height: 25,
        textDecorationLine: "underline",
    },

    swiperActiveDot: {
        backgroundColor: ACTIVE_COLOR,
        borderRadius: 3,
        height: 6,
        marginHorizontal: 4,
        width: 6,
    },

    swiperDot: {
        backgroundColor: INACTIVE_COLOR,
        borderRadius: 3,
        height: 6,
        marginHorizontal: 4,
        width: 6,
    },

    unitTypeScrollView: (marginHorizontal) => ({
        marginHorizontal,
    }),

    unitsListScrollContainer: (padding) => ({
        padding,
    }),
});

export default PropertyDetails;
