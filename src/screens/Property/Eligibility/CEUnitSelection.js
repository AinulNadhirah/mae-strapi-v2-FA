/* eslint-disable react/jsx-no-bind */

/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigationState } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    TouchableOpacity,
    StyleSheet,
    View,
    ScrollView,
    Animated,
    ActivityIndicator,
    Image,
} from "react-native";

import {
    BANKINGV2_MODULE,
    CE_PROPERTY_SEARCH_LIST,
    CE_PURCHASE_DOWNPAYMENT,
    CE_UNIT_SELECTION,
    PROPERTY_DETAILS,
    SCAN_PROPERTY_QR_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { logEvent } from "@services/analytics";

import {
    DISABLED,
    MEDIUM_GREY,
    DARK_GREY,
    YELLOW,
    WHITE,
    OFF_WHITE,
    SHADOW_LIGHT,
    DISABLED_TEXT,
    BLACK,
    FADE_GREY,
} from "@constants/colors";
import {
    COMMON_ERROR_MSG,
    SAVE,
    DONT_SAVE,
    EXIT_POPUP_TITLE,
    EXIT_POPUP_DESC,
    LEAVE,
    GO_BACK,
    CANCEL_EDITS,
    CANCEL_EDITS_DESC,
    EDIT_FIN_DETAILS,
    SAVE_NEXT,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FORM_PROCEED,
    FA_FIELD_INFORMATION,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    FA_PROPERTY_CE_SAVEPROGRESS,
    FA_PROPERTY_CE_UNITTYPE,
} from "@constants/strings";

import Assets from "@assets";

import { useResetNavigation } from "../Common/PropertyController";
import { saveEligibilityInput, removeCEEditRoutes } from "./CEController";

const INDICATOR_DELAY = 500;

function CEUnitSelection({ route, navigation }) {
    const navigationState = useNavigationState((state) => state);
    const [resetToDiscover, resetToApplication] = useResetNavigation(navigation);

    const [headerText, setHeaderText] = useState("");
    const [currentStep, setCurrentStep] = useState("");
    const [totalSteps, setTotalSteps] = useState("");
    const [stepperInfo, setStepperInfo] = useState("");
    const [ctaText, setCtaText] = useState("Select & Continue");
    const [unitTypes, setUnitTypes] = useState([]);
    const [selectedItem, setSelectedItem] = useState({});
    const [unitId, setUnitId] = useState(null);
    const [isSimplified, setIsSimplified] = useState(false);

    const [showExitPopup, setShowExitPopup] = useState(false);
    const [cancelEditPopup, setCancelEditPopup] = useState(false);

    const [isContinueDisabled, setContinueDisabled] = useState(true);
    const [editFlow, setEditFlow] = useState(false);

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        setContinueDisabled(!unitId);
    }, [unitId]);

    function init() {
        console.log("[CEUnitSelection] >> [init]");

        const navParams = route?.params ?? {};
        const propertyDetails = navParams?.propertyDetails ?? "";
        const resumeFlow = navParams?.resumeFlow ?? false;
        const paramsEditFlow = navParams?.editFlow ?? false;
        let currentStep;
        let totalSteps;
        if (route?.params?.from === SCAN_PROPERTY_QR_SCREEN) {
            currentStep = 1;
            totalSteps = 6;
        } else {
            currentStep = propertyDetails?.is_simplified ? 3 : 1;
            totalSteps = propertyDetails?.is_simplified ? 8 : 6;
        }
        const stepperInfo =
            currentStep && totalSteps && !paramsEditFlow && currentStep <= totalSteps
                ? `Step ${currentStep} of ${totalSteps}`
                : "";
        setStepperInfo(stepperInfo);
        setCurrentStep(currentStep);
        setTotalSteps(totalSteps);

        if (propertyDetails) {
            const units = propertyDetails?.units;
            setHeaderText(propertyDetails?.property_name ?? "");
            setUnitTypes(units ?? []);
            //set Is Simplified
            setIsSimplified(propertyDetails?.is_simplified);
        }

        // Pre-populate data for resume OR edit flow
        if (resumeFlow || paramsEditFlow) populateSavedData();
    }

    const onBackPress = () => {
        console.log("[CEUnitSelection] >> [onBackPress]");

        const navParams = route?.params ?? {};
        const propertyDetails = navParams?.propertyDetails ?? "";
        const resumeFlow = route.params?.resumeFlow ?? false;

        if (resumeFlow || route?.params?.from === CE_PROPERTY_SEARCH_LIST) {
            navigation.goBack();
        } else if (navParams?.isPropertyListed === "N") {
            resetToDiscover();
        } else {
            // Navigate to Property details screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: PROPERTY_DETAILS,
                params: {
                    ...route.params,
                    propertyId: propertyDetails?.property_id,
                    from: CE_UNIT_SELECTION,
                },
            });
        }
    };

    const onCloseTap = () => {
        console.log("[CEUnitSelection] >> [onCloseTap]");

        if (editFlow) {
            setCancelEditPopup(true);
        } else {
            setShowExitPopup(true);
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_PROPERTY_CE_SAVEPROGRESS,
            });
        }
    };

    function populateSavedData() {
        console.log("[CEUnitSelection] >> [populateSavedData]");

        const navParams = route?.params ?? {};
        const savedData = navParams?.savedData ?? {};
        const paramsEditFlow = navParams?.editFlow ?? false;

        const units = navParams?.propertyDetails?.units ?? [];
        const savedUnitId = savedData?.unitId ?? null;
        const editUnitId = navParams?.unitId ?? null;
        const selectedUnitId = paramsEditFlow ? editUnitId : savedUnitId;

        // Unit ID
        if (selectedUnitId) {
            units.some((rec) => {
                const recUnitId = rec?.unit_id;
                if (recUnitId === selectedUnitId) {
                    setSelectedItem(rec);
                    setUnitId(recUnitId);
                }
                return recUnitId === selectedUnitId;
            });
        }

        // Changes specific to edit flow
        if (paramsEditFlow) {
            setEditFlow(paramsEditFlow);
            setHeaderText(EDIT_FIN_DETAILS);
            setCtaText(SAVE_NEXT);
        }
    }

    function onUnitTypeTap(data) {
        console.log("[CEUnitSelection] >> [onUnitTypeTap]");

        // Update data of Selected Unit Type
        setSelectedItem(data);
        setUnitId(data?.unit_id);
    }

    async function onExitPopupSave() {
        console.log("[CEUnitSelection] >> [onExitPopupSave]");

        // Hide popup
        closeExitPopup();

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveEligibilityInput({
            screenName: CE_UNIT_SELECTION,
            formData,
            navParams: route?.params,
            saveData: "Y",
        });

        if (success) {
            resetToApplication();
        } else {
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
        }

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CE_SAVEPROGRESS,
            [FA_ACTION_NAME]: SAVE,
        });
    }

    function onExitPopupDontSave() {
        console.log("[CEUnitSelection] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();

        resetToDiscover();

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CE_SAVEPROGRESS,
            [FA_ACTION_NAME]: DONT_SAVE,
        });
    }

    const closeExitPopup = () => {
        console.log("[CEUnitSelection] >> [closeExitPopup]");

        setShowExitPopup(false);
    };

    function onCancelEditPopupLeave() {
        console.log("[CEUnitSelection] >> [onCancelEditPopupLeave]");

        // Hide popup
        closeCancelEditPopup();

        // Removes all Eligibility edit flow screens
        const updatedRoutes = removeCEEditRoutes(navigationState?.routes ?? []);

        // Navigate to Eligibility Confirmation screen
        navigation.reset({
            index: updatedRoutes.length - 1,
            routes: updatedRoutes,
        });
    }

    function closeCancelEditPopup() {
        console.log("[CEUnitSelection] >> [closeCancelEditPopup]");

        setCancelEditPopup(false);
    }

    async function onContinue() {
        console.log("[CEUnitSelection] >> [onContinue]");

        const navParams = route?.params ?? {};
        const resumeFlow = navParams?.resumeFlow ?? false;

        // Retrieve form data
        const formData = getFormData();

        if (editFlow) {
            // Navigate to Downpayment screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: CE_PURCHASE_DOWNPAYMENT,
                params: {
                    ...navParams,
                    ...formData,
                },
            });
        } else {
            // Save Form Data in DB before moving to next screen
            const { syncId } = await saveEligibilityInput({
                screenName: CE_UNIT_SELECTION,
                formData,
                navParams,
                saveData: resumeFlow ? "Y" : "N",
            });

            // Navigate to Downpayment screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: CE_PURCHASE_DOWNPAYMENT,
                params: {
                    ...navParams,
                    ...formData,
                    syncId,
                },
            });
        }

        const headerText = formData?.headerText ?? "";
        const type = formData?.unitTypeName ?? "";

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CE_UNITTYPE,
            [FA_FIELD_INFORMATION]: "property_name: " + headerText + ". type: " + type,
        });
    }

    const getFormData = () => {
        console.log("[CEUnitSelection] >> [getFormData]");

        const navParams = route?.params ?? {};
        const propertyName = navParams?.propertyName;
        const unitTypeName = selectedItem?.name;
        const headerText =
            propertyName && unitTypeName
                ? `${propertyName} (${unitTypeName})`
                : propertyName || unitTypeName;

        return {
            unitType: selectedItem,
            unitId,
            headerText,
            unitTypeName,
            currentStep,
            totalSteps,
        };
    };

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={FA_PROPERTY_CE_UNITTYPE}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
                            headerCenterElement={
                                <Typo
                                    text={stepperInfo}
                                    lineHeight={16}
                                    fontSize={12}
                                    fontWeight="600"
                                    color={FADE_GREY}
                                />
                            }
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={24}
                    useSafeArea
                >
                    <>
                        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                            <View style={styles.wrapper}>
                                {/* Title */}
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text={headerText}
                                    textAlign="left"
                                />

                                {/* Subtext */}
                                <Typo
                                    fontSize={20}
                                    fontWeight="300"
                                    lineHeight={28}
                                    style={styles.label}
                                    text="Select a unit type"
                                    textAlign="left"
                                />

                                {/* Unit types */}
                                {unitTypes?.length > 0 && (
                                    <>
                                        <ScrollView
                                            style={styles.unitTypeScrollView}
                                            contentContainerStyle={styles.unitsListScrollContainer}
                                            horizontal={!isSimplified}
                                            showsHorizontalScrollIndicator={false}
                                        >
                                            {unitTypes.map((unitType, index) => {
                                                return (
                                                    <UnitTypeTile
                                                        key={index}
                                                        index={index}
                                                        data={unitType}
                                                        onPress={onUnitTypeTap}
                                                        selectedItem={selectedItem}
                                                        isSimplified={isSimplified}
                                                    />
                                                );
                                            })}
                                        </ScrollView>
                                    </>
                                )}
                            </View>
                        </ScrollView>

                        <FixedActionContainer>
                            <ActionButton
                                disabled={isContinueDisabled}
                                activeOpacity={isContinueDisabled ? 1 : 0.5}
                                backgroundColor={isContinueDisabled ? DISABLED : YELLOW}
                                fullWidth
                                componentCenter={
                                    <Typo
                                        color={isContinueDisabled ? DISABLED_TEXT : BLACK}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text={ctaText}
                                    />
                                }
                                onPress={onContinue}
                            />
                        </FixedActionContainer>
                    </>
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

            {/* Cancel edit confirmation popup */}
            <Popup
                visible={cancelEditPopup}
                title={CANCEL_EDITS}
                description={CANCEL_EDITS_DESC}
                onClose={closeCancelEditPopup}
                primaryAction={{
                    text: LEAVE,
                    onPress: onCancelEditPopupLeave,
                }}
                secondaryAction={{
                    text: GO_BACK,
                    onPress: closeCancelEditPopup,
                }}
            />
        </>
    );
}

CEUnitSelection.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

// Unit Type Tile
function UnitTypeTile({ data, onPress, index, selectedItem, isSimplified }) {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [defaultImage, setDefaultImage] = useState(false);
    const selectedUnitID = selectedItem?.unit_id ?? "";
    const isSelected = selectedUnitID === data.unit_id;

    const imageAnimated = useRef(new Animated.Value(0)).current;
    const image = data?.image_url ?? null;

    const onImgLoadError = useCallback(() => {
        console.log("[CEUnitSelection] [UnitTypeTile] >> onImgLoadError");

        setTimeout(() => {
            setImgLoaded(true);
            setDefaultImage(true);
        }, INDICATOR_DELAY);
    }, []);

    const onImgLoad = useCallback(() => {
        setTimeout(() => {
            setImgLoaded(true);
            Animated.timing(imageAnimated, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }, INDICATOR_DELAY);
    }, [imageAnimated]);

    const onTilePress = () => {
        console.log("[CEUnitSelection][UnitTypeTile] >> onTilePress:", data);
        if (onPress) onPress(data, index);
    };

    return (
        <TouchableOpacity
            style={[
                styles.unitTypeTileCls(isSimplified ? "100%" : 240),
                styles.unitTypeTileSpacing,
            ]}
            activeOpacity={0.8}
            onPress={onTilePress}
        >
            {/* Type Name */}
            {isSimplified && (
                <View style={styles.unitTypeToggleContainer(0, 8)}>
                    <Image
                        accessibilityId="tickImage"
                        testID="tickImage"
                        style={styles.tickImage}
                        source={isSelected ? Assets.tickIcon : Assets.icRadioUnchecked}
                    />
                    <Typo fontSize={12} lineHeight={18} fontWeight="600" text={data.name} />
                </View>
            )}
            {/* Image */}
            {!isSimplified && (
                <View style={styles.unitTypeImgContainer}>
                    {defaultImage ? (
                        <View style={styles.unitTypeDefaultImgContainer}>
                            <Image
                                style={styles.unitTypeDefaultImg}
                                source={Assets.propertyIconColor}
                            />
                        </View>
                    ) : (
                        <Animated.Image
                            source={{ uri: image }}
                            style={styles.unitItemImg}
                            onLoad={onImgLoad}
                            onError={onImgLoadError}
                            useNativeDriver
                        />
                    )}

                    {!imgLoaded && (
                        <ActivityIndicator
                            size="small"
                            style={styles.indicator}
                            color={OFF_WHITE}
                        />
                    )}
                </View>
            )}

            {/* Price Range */}
            <Typo fontSize={14} lineHeight={18} fontWeight="600" text={data.priceRange} />

            {/* Unit Details */}
            {!isSimplified && (
                <View style={styles.unitTypeDetailsSection}>
                    <SetUnitTypeSubDetail
                        text={data?.bedroom_count}
                        icon={Assets.iconGreyBedroom}
                    />
                    <SetUnitTypeSubDetail
                        text={data?.bathroom_count}
                        icon={Assets.iconGreyBathroom}
                    />
                    <SetUnitTypeSubDetail text={data?.carPark} icon={Assets.iconGreyParking} />
                    <SetUnitTypeSubDetail text={data?.size} icon={Assets.iconGreyFloorPlan} />
                </View>
            )}

            {/* Type Name */}
            {!isSimplified && (
                <View style={styles.unitTypeToggleContainer(8, 0)}>
                    <Image
                        accessibilityId="tickImage"
                        testID="tickImage"
                        style={styles.tickImage}
                        source={isSelected ? Assets.tickIcon : Assets.icRadioUnchecked}
                    />
                    <Typo fontSize={12} lineHeight={18} fontWeight="600" text={data.name} />
                </View>
            )}
        </TouchableOpacity>
    );
}

UnitTypeTile.propTypes = {
    data: PropTypes.object,
    onPress: PropTypes.func,
    index: PropTypes.number,
    selectedItem: PropTypes.object,
    isSimplified: PropTypes.bool,
};

const SetUnitTypeSubDetail = ({ text, icon }) => {
    return (
        <View style={styles.metaUnitSubDetail}>
            <Image style={styles.metaUnitSubDetailIcon} source={icon} />
            <Typo
                fontSize={10}
                fontWeight="normal"
                textAlign="left"
                color={DARK_GREY}
                text={text}
            />
        </View>
    );
};

SetUnitTypeSubDetail.propTypes = {
    text: PropTypes.string,
    icon: PropTypes.element,
};

const styles = StyleSheet.create({
    label: {
        paddingTop: 8,
    },

    metaUnitSubDetail: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        width: "50%",
    },

    metaUnitSubDetailIcon: {
        height: 24,
        marginRight: 5,
        width: 24,
    },

    tickImage: {
        height: 20,
        marginRight: 10,
        width: 20,
    },

    unitItemImg: {
        height: "100%",
        resizeMode: "contain",
        width: "100%",
    },

    unitTypeDefaultImg: {
        height: 50,
        width: 50,
    },

    unitTypeDefaultImgContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },

    unitTypeDetailsSection: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        marginVertical: 15,
    },

    unitTypeImgContainer: {
        height: 208,
        marginBottom: 4,
        marginTop: 8,
        width: 160,
    },

    unitTypeScrollView: {
        marginHorizontal: -24,
    },

    unitTypeTileCls: (fullWidth) => ({
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        justifyContent: "center",
        marginRight: 12,
        padding: 16,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 1,
        shadowRadius: 15,
        width: fullWidth,
    }),

    unitTypeTileSpacing: {
        marginTop: 15,
        padding: 20,
    },

    unitTypeToggleContainer: (marginTopVal, marginBottomVal) => ({
        alignItems: "center",
        flexDirection: "row",
        marginTop: marginTopVal,
        marginBottom: marginBottomVal,
        paddingHorizontal: 8,
        paddingVertical: 4,
    }),

    unitsListScrollContainer: {
        padding: 24,
    },

    wrapper: {
        flex: 1,
        flexDirection: "column",
        paddingHorizontal: 36,
    },
});

export default CEUnitSelection;
