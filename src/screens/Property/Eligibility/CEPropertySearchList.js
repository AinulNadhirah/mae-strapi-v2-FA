/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable react/jsx-no-bind */
import { useFocusEffect } from "@react-navigation/core";
import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import {
    PROPERTY_DETAILS,
    BANKINGV2_MODULE,
    CE_PROPERTY_SEARCH_LIST,
    CE_UNIT_SELECTION,
    CE_PURCHASE_DOWNPAYMENT,
    CE_PROPERTY_NAME,
    APPLICATION_DETAILS,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { getPropertyDetails, getPropertyList } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, WHITE, GREY, DARK_GREY, FADE_GREY } from "@constants/colors";
import {
    SAVE,
    DONT_SAVE,
    EXIT_POPUP_TITLE,
    EXIT_POPUP_DESC,
    FA_ACTION_NAME,
    FA_ADD_BOOKMARK,
    FA_REMOVE_BOOKMARK,
    FA_FIELD_INFORMATION,
    FA_FORM_PROCEED,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    COMMON_ERROR_MSG,
    FA_PROPERTY_APPLYMORTGAGE_SELECTPROPERTY,
    FA_PROPERTY_INFORMATION,
    FA_NOT_THIS_PROPERTY,
    FA_PROPERTY_SAVE,
    FA_PROPERTY_DONT_SAVE,
} from "@constants/strings";

import { useResetNavigation } from "../Common/PropertyController";
import PropertyTile from "../Common/PropertyTile";
import { saveEligibilityInput } from "./CEController";

function CEPropertySearchList({ route, navigation }) {
    const [resetToDiscover, resetToApplication] = useResetNavigation(navigation);
    // Common
    const [listData, setListData] = useState([]);
    const [currentStep, setCurrentStep] = useState("");
    const [totalSteps, setTotalSteps] = useState("");
    const [stepperInfo, setStepperInfo] = useState("");
    const [isSimplifiedProperty, setisSimplifiedProperty] = useState(false);

    const [showExitPopup, setShowExitPopup] = useState(false);

    useEffect(() => {
        init();
    }, []);

    const refreshFromBookmark = useCallback(async () => {
        if (route.params?.refreshFromBookmark) {
            await getProperties();
        }
    }, [route.params?.refreshFromBookmark, getProperties]);

    useFocusEffect(
        useCallback(() => {
            refreshFromBookmark();
        }, [refreshFromBookmark])
    );

    const init = useCallback(async () => {
        console.log("[CEPropertySearchList] >> [init]");
        setisSimplifiedProperty(false);
        const navParams = route?.params ?? {};
        const propertyList = navParams?.propertyList ?? [];
        setListData(propertyList);

        let currentStep = navParams?.currentStep;
        currentStep = currentStep + 1;
        let totalSteps = navParams?.totalSteps;

        if (navParams?.from === APPLICATION_DETAILS) {
            currentStep = 2;
            totalSteps = 8;
            await getProperties();
        }

        const stepperInfo =
            currentStep && totalSteps && currentStep < totalSteps
                ? `Step ${currentStep} of ${totalSteps}`
                : "";
        setStepperInfo(stepperInfo);
        setCurrentStep(currentStep);
        setTotalSteps(totalSteps);
    }, [getProperties, route?.params]);

    // trigger API call as come back from bookmark refresh
    const getProperties = useCallback(async () => {
        console.log("[CEPropertySearchList] >> [getProperties]");
        const searchKey = route?.params?.savedData?.propertySearchName;
        const navParams = route.params;
        const params = {
            latitude: navParams?.latitude ?? "",
            longitude: navParams?.longitude ?? "",
            filter_Type: "nonListed",
            search_key:
                route?.params?.from === APPLICATION_DETAILS ? searchKey : navParams?.propertyName,
            page_no: 1,
            page_size: 5,
        };

        const response = await getPropertyList(params);
        const propertyList = response?.data?.result?.propertyList;
        setListData(propertyList);
    }, [route.params]);

    const onBackTap = () => {
        console.log("[CEPropertySearchList] >> [onBackTap]");

        navigation.goBack();
    };

    const onPropertyPress = (data) => {
        console.log("[CEPropertySearchList] >> [onPropertyPress]");

        // Navigate to Property details page
        navigation.navigate(BANKINGV2_MODULE, {
            screen: PROPERTY_DETAILS,
            params: {
                ...route.params,
                propertyId: data?.property_id,
                from: CE_PROPERTY_SEARCH_LIST,
            },
        });
    };

    async function onSelectProperty(data) {
        console.log("[CEPropertySearchList] >> [onSelectProperty]");

        const navParams = route?.params ?? {};
        const params = {
            latitude: navParams?.latitude ?? "",
            longitude: navParams?.longitude ?? "",
            property_id: data?.property_id,
        };

        // Fetch Property details
        const response = await getPropertyDetails(params);
        const result = response?.data?.result ?? {};
        const propertyDetails = result?.propertyDetails ?? {};
        const propertyName = data?.property_name ?? "";

        // Proceed to Unit Selection screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: CE_UNIT_SELECTION,
            params: {
                ...navParams,
                propertyDetails,
                propertyName,
                isPropertyListed: "Y",
                currentStep,
                totalSteps: 8,
                from: CE_PROPERTY_SEARCH_LIST,
            },
        });

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_PROPERTY_APPLYMORTGAGE_SELECTPROPERTY,
            [FA_FIELD_INFORMATION]: propertyName,
        });
    }

    const onPressBookmark = useCallback((data) => {
        const eventName = data?.bookmarkAction === "ADD" ? FA_ADD_BOOKMARK : FA_REMOVE_BOOKMARK;
        logEvent(eventName, {
            [FA_SCREEN_NAME]: FA_PROPERTY_APPLYMORTGAGE_SELECTPROPERTY,
            [FA_FIELD_INFORMATION]: data?.property_name,
        });
    }, []);

    const onPressInfo = useCallback(
        (data) => {
            console.log("[CEPropertySearchList] >> [onPressInfo]");

            navigation.navigate(BANKINGV2_MODULE, {
                screen: PROPERTY_DETAILS,
                params: {
                    ...route.params,
                    propertyId: data?.property_id,
                    from: CE_PROPERTY_SEARCH_LIST,
                },
            });

            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: FA_PROPERTY_APPLYMORTGAGE_SELECTPROPERTY,
                [FA_ACTION_NAME]: FA_PROPERTY_INFORMATION,
            });
        },
        [navigation, route.params]
    );

    function notThisProperty() {
        console.log("[CEPropertySearchList] >> [notThisProperty]");

        const navParams = route?.params ?? {};

        navigation.navigate(BANKINGV2_MODULE, {
            screen: CE_PURCHASE_DOWNPAYMENT,
            params: {
                ...navParams,
                isPropertyListed: "N",
                headerText: navParams?.propertyName,
                currentStep,
                totalSteps,
            },
        });

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY_APPLYMORTGAGE_SELECTPROPERTY,
            [FA_ACTION_NAME]: FA_NOT_THIS_PROPERTY,
        });
    }

    function onBookmarkError() {
        showInfoToast({
            message: "Your request could not be proccessed at this time. Please try again later.",
        });
    }

    function getFormData() {
        console.log("[CEPropertySearchList] >> [getFormData]");

        const saveData = route?.params?.savedData;
        const searchKey = route?.params?.propertyName
            ? route?.params?.propertyName
            : saveData?.propertySearchName;
        return {
            propertySearchName: searchKey,
            currentStep,
            totalSteps,
        };
    }

    async function onExitPopupSave() {
        console.log("[CEPropertySearchList] >> [onExitPopupSave]");

        // Hide popup
        closeExitPopup();

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveEligibilityInput({
            screenName: CE_PROPERTY_NAME,
            formData,
            navParams: route?.params,
            saveData: "Y",
        });

        if (success) {
            resetToApplication(CE_PROPERTY_SEARCH_LIST);
        } else {
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
        }

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY_APPLYMORTGAGE_SELECTPROPERTY,
            [FA_ACTION_NAME]: FA_PROPERTY_SAVE,
        });
    }

    function onExitPopupDontSave() {
        console.log("[CEPropertySearchList] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();

        resetToDiscover();

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY_APPLYMORTGAGE_SELECTPROPERTY,
            [FA_ACTION_NAME]: FA_PROPERTY_DONT_SAVE,
        });
    }

    function closeExitPopup() {
        console.log("[CEPropertySearchList] >> [closeExitPopup]");

        setShowExitPopup(false);
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={FA_PROPERTY_APPLYMORTGAGE_SELECTPROPERTY}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    text={stepperInfo}
                                    lineHeight={16}
                                    fontSize={12}
                                    fontWeight="600"
                                    color={FADE_GREY}
                                />
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <ScrollView style={Style.scrollContainer} showsVerticalScrollIndicator={false}>
                        <View style={Style.horizontalMargin}>
                            {/* Similar properties found */}
                            <Typo
                                fontWeight="600"
                                lineHeight={18}
                                text={
                                    isSimplifiedProperty
                                        ? "Property found"
                                        : "Similar properties found"
                                }
                                textAlign="left"
                            />

                            {/* Header */}
                            <Typo
                                fontSize={20}
                                fontWeight="400"
                                lineHeight={28}
                                style={Style.headerText}
                                text="Is this your desired property?"
                                textAlign="left"
                            />
                        </View>

                        {/* Property List */}
                        {listData.map((item, index) => {
                            return (
                                <PropertyTile
                                    key={index}
                                    data={item}
                                    isLastItem={listData.length - 1 === index}
                                    lastItemPadding={true}
                                    onPress={onPropertyPress}
                                    onBookmarkError={onBookmarkError}
                                    isBookmarked={item?.isBookMarked}
                                    selectable
                                    onSelectProperty={onSelectProperty}
                                    onPressBookmark={onPressBookmark}
                                    onPressInfo={onPressInfo}
                                    isSimplified={item?.is_simplified}
                                />
                            );
                        })}
                    </ScrollView>

                    {/* Bottom button container */}
                    <FixedActionContainer>
                        <View style={[Style.bottomBtnContainer, Style.horizontalMargin]}>
                            <ActionButton
                                fullWidth
                                backgroundColor={WHITE}
                                borderStyle="solid"
                                borderWidth={1}
                                borderColor={GREY}
                                componentCenter={
                                    <Typo
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="Not this property?"
                                    />
                                }
                                onPress={notThisProperty}
                            />

                            {/* Skip this... */}
                            <Typo
                                fontSize={12}
                                lineHeight={20}
                                text="Skip this step and apply for mortgage "
                                color={DARK_GREY}
                                style={Style.ctaNote}
                            />
                        </View>
                    </FixedActionContainer>
                </ScreenLayout>
            </ScreenContainer>

            {/* Exit confirmation popup */}
            <Popup
                visible={showExitPopup}
                title={EXIT_POPUP_TITLE}
                description={EXIT_POPUP_DESC}
                onClose={closeExitPopup}
                primaryAction={{
                    text: SAVE,
                    onPress: onExitPopupSave,
                }}
                secondaryAction={{
                    text: DONT_SAVE,
                    onPress: onExitPopupDontSave,
                }}
            />
        </>
    );
}

CEPropertySearchList.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const Style = StyleSheet.create({
    bottomBtnContainer: {
        // marginBottom: 70,
        // marginTop: -20,
        width: "100%",
    },

    ctaNote: {
        // marginTop: 10,
        marginVertical: 15,
    },

    headerText: {
        paddingTop: 8,
    },

    horizontalMargin: {
        marginHorizontal: 24,
    },

    scrollContainer: {
        flex: 1,
        paddingTop: 20,
    },
});

export default CEPropertySearchList;
