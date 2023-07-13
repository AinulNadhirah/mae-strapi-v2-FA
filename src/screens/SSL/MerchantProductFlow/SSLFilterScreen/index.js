import { useNavigation, useRoute } from "@react-navigation/core";
import _ from "lodash";
import PropTypes from "prop-types";
import React, { useState, useEffect, useMemo } from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
} from "react-native";

import {
    SSL_FILTER_SCREEN,
    SSL_LOCATION_MAIN,
    SSL_MERCHANT_LISTING,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import LocationPill from "@components/SSL/LocationPill";
import SingleLineToggleWLabel from "@components/SSL/SingleLineToggleWLabel";
import TitleAndDropdownPill from "@components/SSL/TitleAndDropdownPill";
import Typo from "@components/Text";

import { withModelContext, useModelController } from "@context";

import { FAFilterScreen } from "@services/analytics/analyticsSSL";

import {
    BLACK,
    MEDIUM_GREY,
    YELLOW,
    WHITE,
    SHADOW_LIGHT,
    GREY,
    FADE_GREY,
} from "@constants/colors";
import * as Strings from "@constants/strings";

import { displayLocationTitle } from "@utils/dataModel/utilitySSLGeolocation";

const { width } = Dimensions.get("window");

const pickerSelectedEnum = Object.freeze({
    distance: "distance",
    promotions: "promotions",
    deliveryType: "deliveryType",
    subCategoryL3List: "subCategoryL3List",
});

const oriSelectedFilterIds = {
    distance: -1,
    promotions: -1,
    deliveryType: -1,
    subCategoryL3List: -1,
    price: null,
    isFavouriteListing: false,
};
export { pickerSelectedEnum, oriSelectedFilterIds };

function SSLFilterScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { params } = route;
    const { getModel } = useModelController();

    // Location pill
    const { currSelectedLocationV1 } = getModel("ssl");

    const pickerData = useMemo(() => route.params?.pickerData ?? {}, [route.params?.pickerData]);

    /**
     * Depending on entry point, our "defaultSelectedFilterIds" will be diff.
     * e.g Entry point is from Favourites. Our isFavouriteToggle by default now is true.
     * Click (Reset Filter) will reset isFavourite to true
     */
    const defaultSelectedFilterIds = useMemo(() => {
        return route.params?.defaultSelectedFilterIds ?? oriSelectedFilterIds;
    }, [route.params?.defaultSelectedFilterIds]);

    const [selectedFilterIds, setSelectedFilterIds] = useState({
        ...defaultSelectedFilterIds,
        ...route.params?.selectedFilterIds,
    });

    const [distanceLbl, setDistanceLbl] = useState("");
    const [promotionLbl, setPromotionLbl] = useState("");
    const [deliveryLbl, setDeliveryLbl] = useState("");
    const [subCategoryLbl, setSubCategoryLbl] = useState("");

    const [scrollPicker, setScrollPicker] = useState({
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    });
    const [isFiltersActive, setIsFiltersActive] = useState(false);

    /** SIDE EFFECTS */
    useEffect(() => {
        console.log("SSLFilterScreen selectedFilterIds", selectedFilterIds);
        console.log("SSLFilterScreen defaultSelectedFilterIds", defaultSelectedFilterIds);
        setIsFiltersActive(!_.isEqual(selectedFilterIds, defaultSelectedFilterIds));
        setDistanceLbl(
            pickerData.distance.find((obj) => obj.value === selectedFilterIds.distance)?.name
        );
        setPromotionLbl(
            pickerData.promotions.find((obj) => obj.value === selectedFilterIds.promotions)?.name
        );
        setDeliveryLbl(
            pickerData.deliveryType.find((obj) => obj.value === selectedFilterIds.deliveryType)
                ?.name
        );
        setSubCategoryLbl(
            pickerData.subCategoryL3List.find(
                (obj) => obj.value === selectedFilterIds.subCategoryL3List
            )?.name
        );
    }, [defaultSelectedFilterIds, pickerData, selectedFilterIds]);

    useEffect(() => {
        console.log("selectedFilterIds ::: ", selectedFilterIds);
        FAFilterScreen.onScreen();
    }, []);

    /** USER TAP ACTIONS  */
    function onPressLocationPill() {
        navigation.navigate(SSL_LOCATION_MAIN, {
            entryPoint: SSL_FILTER_SCREEN,
        });
    }
    function onDistancePressed() {
        console.log("[SSLFilterScreen]>[onDistancePressed]");
        setScrollPicker({
            isDisplay: true,
            selectedIndex:
                pickerData.distance.findIndex((obj) => selectedFilterIds.distance === obj.value) ??
                0,
            data: pickerData.distance,
            filterType: pickerSelectedEnum.distance,
        });
    }
    function onPromoPressed() {
        console.log("[SSLFilterScreen]>[onPromoPressed]");
        setScrollPicker({
            isDisplay: true,
            selectedIndex:
                pickerData.promotions.findIndex(
                    (obj) => selectedFilterIds.promotions === obj.value
                ) ?? 0,
            data: pickerData.promotions,
            filterType: pickerSelectedEnum.promotions,
        });
    }
    function onDeliveryTypePressed() {
        console.log("[SSLFilterScreen]>[onDeliveryTypePressed]");
        setScrollPicker({
            isDisplay: true,
            selectedIndex:
                pickerData.deliveryType.findIndex(
                    (obj) => selectedFilterIds.deliveryType === obj.value
                ) ?? 0,
            data: pickerData.deliveryType,
            filterType: pickerSelectedEnum.deliveryType,
        });
    }
    function onSubCategoryPressed() {
        console.log("[SSLFilterScreen]>[onSubCategoryPressed]");
        setScrollPicker({
            isDisplay: true,
            selectedIndex:
                pickerData.subCategoryL3List.findIndex(
                    (obj) => selectedFilterIds.subCategoryL3List === obj.value
                ) ?? 0,
            data: pickerData.subCategoryL3List,
            filterType: pickerSelectedEnum.subCategoryL3List,
        });
    }
    function onPriceDataPressed(item) {
        console.log("[SSLFilterScreen]>[onPriceDataPressed]", item);
        if (item.value === selectedFilterIds.price) {
            setSelectedFilterIds({
                ...selectedFilterIds,
                price: defaultSelectedFilterIds.price,
            }); // unselect
        } else setSelectedFilterIds({ ...selectedFilterIds, price: item.value });
    }
    function isFavMerchantToggle() {
        console.log("[SSLFilterScreen]>[isFavMerchantToggle]");
        setSelectedFilterIds({
            ...selectedFilterIds,
            isFavouriteListing: !selectedFilterIds.isFavouriteListing,
        });
    }

    function onCloseTap() {
        navigation.goBack();
    }
    function onClearAllPress() {
        setSelectedFilterIds(defaultSelectedFilterIds);
    }
    function onApplyFiltersPress() {
        console.log("SSLFilterScreen onApplyFiltersPress", selectedFilterIds);

        const filterAnalytics = {
            [Strings.FA_FIELD_INFORMATION]: {},
            [Strings.FA_FIELD_INFORMATION_2]: {},
            [Strings.FA_FIELD_INFORMATION_3]: {},
        };
        filterAnalytics[Strings.FA_FIELD_INFORMATION].distance = pickerData.distance.find(
            (obj) => obj.value == selectedFilterIds.distance
        )?.name;
        filterAnalytics[Strings.FA_FIELD_INFORMATION].promotions = pickerData.promotions.find(
            (obj) => obj.value == selectedFilterIds.promotions
        )?.name;
        filterAnalytics[Strings.FA_FIELD_INFORMATION_2].delivery_type =
            pickerData.deliveryType.find(
                (obj) => obj.value == selectedFilterIds.deliveryType
            )?.name;
        filterAnalytics[Strings.FA_FIELD_INFORMATION_2].categories =
            pickerData.subCategoryL3List.find(
                (obj) => obj.value == selectedFilterIds.subCategoryL3List
            )?.name;
        filterAnalytics[Strings.FA_FIELD_INFORMATION_3].price_range =
            pickerData.price.find((obj) => obj.value == selectedFilterIds.price)?.name ?? "";
        if (selectedFilterIds.isFavouriteListing)
            filterAnalytics[Strings.FA_FIELD_INFORMATION_3].fave_merchants = true;

        filterAnalytics[Strings.FA_FIELD_INFORMATION] = JSON.stringify(
            filterAnalytics[Strings.FA_FIELD_INFORMATION]
        );
        filterAnalytics[Strings.FA_FIELD_INFORMATION_2] = JSON.stringify(
            filterAnalytics[Strings.FA_FIELD_INFORMATION_2]
        );
        filterAnalytics[Strings.FA_FIELD_INFORMATION_3] = JSON.stringify(
            filterAnalytics[Strings.FA_FIELD_INFORMATION_3]
        );
        FAFilterScreen.onApplyFiltersPress(filterAnalytics);

        navigation.navigate({
            name: SSL_MERCHANT_LISTING,
            params: { selectedFilterIds },
            merge: true,
        });
    }

    /** SCROLLPICKER ACTIONS */
    function scrollPickerOnPressCancel() {
        console.log("[SSLFilterScreen]>[scrollPickerOnPressCancel]");
        setScrollPicker({ ...scrollPicker, isDisplay: false });
    }
    function scrollPickerOnPressDone(data) {
        console.log("[SSLFilterScreen]>[scrollPickerOnPressDone]", data);
        setScrollPicker({ ...scrollPicker, isDisplay: false });
        let value;
        switch (scrollPicker.filterType) {
            case pickerSelectedEnum.distance:
                value = pickerData.distance.find((obj) => obj.value == data.value)?.value;
                setSelectedFilterIds({ ...selectedFilterIds, distance: value });
                break;
            case pickerSelectedEnum.promotions:
                value = pickerData.promotions.find((obj) => obj.value == data.value)?.value;
                setSelectedFilterIds({ ...selectedFilterIds, promotions: value });
                break;
            case pickerSelectedEnum.deliveryType:
                value = pickerData.deliveryType.find((obj) => obj.value == data.value)?.value;
                setSelectedFilterIds({ ...selectedFilterIds, deliveryType: value });
                break;
            case pickerSelectedEnum.subCategoryL3List:
                value = pickerData.subCategoryL3List.find((obj) => obj.value == data.value)?.value;
                setSelectedFilterIds({ ...selectedFilterIds, subCategoryL3List: value });
                break;
            default:
                break;
        }
    }

    // Callback from LocationMain
    useEffect(() => {
        if (params?.isNewLocationSelectedRefresh) {
            const { setParams } = navigation;
            setParams({ isNewLocationSelectedRefresh: false });
            console.log("SSLFilterScreen refresh new location");
            navigation.navigate({
                name: SSL_MERCHANT_LISTING,
                params: {
                    selectedFilterIds: defaultSelectedFilterIds,
                    isNewLocationSelectedRefresh: true,
                },
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params?.isNewLocationSelectedRefresh]);

    // On Screen Variables - Location Pill
    const locationLbl = displayLocationTitle({ currSelectedLocationV1 });
    return (
        <KeyboardAvoidingView
            style={styles.containerView}
            behavior={Platform.OS == "ios" ? "padding" : ""}
            enabled
        >
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={false}
            >
                <>
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        color={BLACK}
                                        lineHeight={19}
                                        text={Strings.FILTER}
                                    />
                                }
                            />
                        }
                        useSafeArea
                        neverForceInset={["bottom"]}
                        paddingLeft={0}
                        paddingRight={0}
                        paddingBottom={0}
                        paddingTop={22}
                    >
                        <ScrollView>
                            <View style={styles.container}>
                                <LocationPill
                                    onPressLocationPill={onPressLocationPill}
                                    locationLbl={locationLbl}
                                />
                                <TitleAndDropdownPill
                                    title={Strings.FILTER_DISTANCE}
                                    dropdownTitle={distanceLbl}
                                    dropdownOnPress={onDistancePressed}
                                    isDisabled={
                                        defaultSelectedFilterIds.distance !=
                                        oriSelectedFilterIds.distance
                                    }
                                />
                                {pickerData?.promotions?.length > 1 && ( // Only show if has promotion data. 1st one is manually inserted "All Promotions" label
                                    <TitleAndDropdownPill
                                        title="Promotions"
                                        dropdownTitle={promotionLbl}
                                        dropdownOnPress={onPromoPressed}
                                        isDisabled={
                                            defaultSelectedFilterIds.promotions !=
                                            oriSelectedFilterIds.promotions
                                        }
                                    />
                                )}
                                <TitleAndDropdownPill
                                    title="Delivery Types"
                                    dropdownTitle={deliveryLbl}
                                    dropdownOnPress={onDeliveryTypePressed}
                                    isDisabled={
                                        defaultSelectedFilterIds.deliveryType !=
                                        oriSelectedFilterIds.deliveryType
                                    }
                                />
                                <TitleAndDropdownPill
                                    title="Categories"
                                    dropdownTitle={subCategoryLbl}
                                    dropdownOnPress={onSubCategoryPressed}
                                    isDisabled={
                                        defaultSelectedFilterIds.subCategoryL3List !=
                                        oriSelectedFilterIds.subCategoryL3List
                                    }
                                />
                                <PriceRange
                                    title={Strings.PRICE_RANGE}
                                    price={pickerData.price}
                                    onPriceDataPressed={onPriceDataPressed}
                                    selectedId={selectedFilterIds?.price}
                                    isDisabled={
                                        defaultSelectedFilterIds.price != oriSelectedFilterIds.price
                                    }
                                />
                                <SingleLineToggleWLabel
                                    onToggle={isFavMerchantToggle}
                                    isToggled={selectedFilterIds.isFavouriteListing}
                                    text="Favourite Merchants"
                                    isDisabled={
                                        defaultSelectedFilterIds.isFavouriteListing !=
                                        oriSelectedFilterIds.isFavouriteListing
                                    }
                                />

                                <View style={styles.buttonView}>
                                    <ClearAllBtn
                                        disabled={!isFiltersActive}
                                        onPress={onClearAllPress}
                                        text="Clear All"
                                    />
                                    <ApplyFiltersBtn
                                        onPress={onApplyFiltersPress}
                                        text="Apply Filters"
                                    />
                                </View>
                            </View>
                        </ScrollView>
                    </ScreenLayout>
                    <ScrollPickerView
                        showMenu={scrollPicker.isDisplay}
                        list={scrollPicker.data}
                        selectedIndex={scrollPicker.selectedIndex}
                        onRightButtonPress={scrollPickerOnPressDone}
                        onLeftButtonPress={scrollPickerOnPressCancel}
                        rightButtonText="Done"
                        leftButtonText="Cancel"
                    />
                </>
            </ScreenContainer>
        </KeyboardAvoidingView>
    );
}

function PriceRange({ title, price, onPriceDataPressed, selectedId, isDisabled }) {
    function PriceItem(item) {
        function onPress() {
            if (!isDisabled) onPriceDataPressed(item);
        }
        const isSelected = item.value === selectedId;
        return (
            <TouchableOpacity
                style={[styles.tagsView, isSelected && styles.selectedTagView]}
                onPress={onPress}
            >
                <Typo
                    fontSize={12}
                    fontWeight="normal"
                    lineHeight={18}
                    text={item.name}
                    color={isDisabled && !isSelected ? FADE_GREY : BLACK}
                />
            </TouchableOpacity>
        );
    }
    return (
        <View style={styles.distanceContainer}>
            <Typo fontSize={14} fontWeight="600" lineHeight={24} text={title} textAlign="left" />
            <View style={styles.priceContainer}>
                {price?.map((item) => (
                    <PriceItem key={`${item.value}`} {...item} />
                ))}
            </View>
        </View>
    );
}
PriceRange.propTypes = {
    title: PropTypes.string,
    price: PropTypes.array,
    onPriceDataPressed: PropTypes.func,
    selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    isDisabled: PropTypes.bool,
};

function ClearAllBtn({ disabled, onPress, text }) {
    return (
        <ActionButton
            disabled={disabled}
            borderRadius={25}
            onPress={onPress}
            backgroundColor={WHITE}
            style={styles.actionButton}
            componentCenter={
                <Typo
                    text={text}
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={18}
                    color={disabled ? GREY : BLACK}
                />
            }
        />
    );
}
ClearAllBtn.propTypes = {
    disabled: PropTypes.bool,
    onPress: PropTypes.func,
    text: PropTypes.string,
};

function ApplyFiltersBtn({ disabled, onPress, text }) {
    return (
        <ActionButton
            disabled={disabled}
            borderRadius={25}
            onPress={onPress}
            backgroundColor={YELLOW}
            style={styles.actionButton}
            componentCenter={
                <Typo
                    text={text}
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={18}
                    color={disabled ? GREY : BLACK}
                />
            }
        />
    );
}
ApplyFiltersBtn.propTypes = {
    disabled: PropTypes.bool,
    onPress: PropTypes.func,
    text: PropTypes.string,
};

const styles = StyleSheet.create({
    actionButton: {
        // paddingHorizontal: 34,
        width: width * 0.4,
    },
    buttonView: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 36,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    containerView: {
        flex: 1,
        width: "100%",
    },
    distanceContainer: {
        marginTop: 24,
    },
    priceContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 12,
    },
    selectedTagView: {
        backgroundColor: YELLOW,
    },
    tagsView: {
        backgroundColor: WHITE,
        borderRadius: 18.5,
        elevation: 8,
        paddingHorizontal: 27,
        paddingVertical: 10,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 5,
    },
});

export default withModelContext(SSLFilterScreen);
