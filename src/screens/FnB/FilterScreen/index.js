import { useNavigation, useRoute } from "@react-navigation/core";
import _ from "lodash";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    RefreshControl,
    Image,
    TextInput,
} from "react-native";

import { FNB_TAB_SCREEN, MERCHANT_LISTING } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HorizontalMasonry from "@components/FnB/HorizontalMasonry";
import { BottomDissolveCover } from "@components/SSL/BottomDissolveCover.js";
import SingleLineToggleWLabel from "@components/SSL/SingleLineToggleWLabel";
import TitleAndDropdownPill from "@components/SSL/TitleAndDropdownPill";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext, useModelController } from "@context";

import { getFnBFilterParam } from "@services";

import {
    BLACK,
    MEDIUM_GREY,
    YELLOW,
    WHITE,
    SHADOW_LIGHT,
    GREY,
    PLACEHOLDER_TEXT,
    DARK_GREY,
} from "@constants/colors";
import * as Strings from "@constants/strings";

import assets from "@assets";

const { width } = Dimensions.get("window");

// Default values. User can click "Clear All" to reset the values
const fnBDefaultSelectedFilterIds = {
    distance: -1, // however we're setting "1 km", "2 km", "3 km" instead of id, because we pass it that way back to API
    priceId: null,
    categoryArr: [],
    isNewest: false,
    locationString: "",
    promotionType: null,
    deliveryType: null,
};
export { fnBDefaultSelectedFilterIds };

function FilterScreen() {
    // General
    const navigation = useNavigation();
    const route = useRoute();
    const { getModel } = useModelController();
    const latitude = useRef(getModel("location").latitude);
    const longitude = useRef(getModel("location").longitude);
    const sandboxUrl = useRef(getModel("ssl").sandboxUrl);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedFilterIds, setSelectedFilterIds] = useState({
        ...fnBDefaultSelectedFilterIds,
        ...route.params?.selectedFilterIds,
    });

    // Variables
    const [categoriesData, setCategoriesData] = useState([]);
    const [priceData, setPriceData] = useState([]);
    const [deliveryTypeData, setDeliveryTypeData] = useState([]);
    const [promotionTypeData, setPromotionTypeData] = useState([]);

    // Variables - distance
    const [distanceLbl, setDistanceLbl] = useState("");
    const [distanceData, setDistanceData] = useState([]);

    const [isFiltersActive, setIsFiltersActive] = useState(false);
    const [scrollPicker, setScrollPicker] = useState({
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    });

    /** SIDE EFFECTS */
    useEffect(() => {
        console.log("FilterScreen selectedFilterIds", selectedFilterIds);
        console.log("FilterScreen fnBDefaultSelectedFilterIds", fnBDefaultSelectedFilterIds);
        setIsFiltersActive(!_.isEqual(selectedFilterIds, fnBDefaultSelectedFilterIds));
        setDistanceLbl(distanceData.find((obj) => obj.value === selectedFilterIds.distance)?.name);
    }, [distanceData, selectedFilterIds]);

    /** onPress Functions (top to btm) */
    function onCloseTap() {
        navigation.goBack();
    }
    function onPriceDataPressed(item) {
        console.log("FilterScreen onPriceDataPressed", item);
        if (item.value === selectedFilterIds.priceId) {
            setSelectedFilterIds({
                ...selectedFilterIds,
                priceId: fnBDefaultSelectedFilterIds.priceId,
            }); // unselect
        } else setSelectedFilterIds({ ...selectedFilterIds, priceId: item.value });
    }
    function onDistancePressed() {
        console.log("FilterScreen onDistancePressed");
        setScrollPicker({
            isDisplay: true,
            selectedIndex:
                distanceData.findIndex((obj) => selectedFilterIds.distance === obj.value) ?? 0,
            data: distanceData,
        });
    }

    function onPressDeliveryType(item) {
        console.log("FilterScreen onPressDeliveryType", item);
        if (item.value === selectedFilterIds.deliveryType) {
            setSelectedFilterIds({
                ...selectedFilterIds,
                deliveryType: fnBDefaultSelectedFilterIds.deliveryType,
            }); // unselect
        } else setSelectedFilterIds({ ...selectedFilterIds, deliveryType: item.value });
    }
    function onPressPromotionType(item) {
        console.log("FilterScreen onPressPromotionType", item);
        if (item.value === selectedFilterIds.promotionType) {
            setSelectedFilterIds({
                ...selectedFilterIds,
                promotionType: fnBDefaultSelectedFilterIds.promotionType,
            }); // unselect
        } else setSelectedFilterIds({ ...selectedFilterIds, promotionType: item.value });
    }
    function onPressCategory(item) {
        console.log("FilterScreen onPressCategory", item);
        const index = selectedFilterIds.categoryArr.findIndex((id) => id === item.value);
        if (index > -1) {
            // Removal
            const temp = _.cloneDeep(selectedFilterIds.categoryArr);
            temp.splice(index, 1);
            setSelectedFilterIds({ ...selectedFilterIds, categoryArr: temp });
        } else if (selectedFilterIds.categoryArr.length > 2) {
            // Not more than 3
        } else {
            // Addition
            let temp = _.cloneDeep(selectedFilterIds.categoryArr);
            temp.push(item.value);
            temp = [...new Set(temp)]; // remove duplicate
            setSelectedFilterIds({ ...selectedFilterIds, categoryArr: temp });
        }
    }
    function onNewestToggle() {
        console.log("FilterScreen onNewestToggle");
        setSelectedFilterIds({ ...selectedFilterIds, isNewest: !selectedFilterIds.isNewest });
    }
    function onLocationInputChange(text) {
        setSelectedFilterIds({ ...selectedFilterIds, locationString: text });
    }
    function onClearAllPress() {
        console.log("onClearAllPress", fnBDefaultSelectedFilterIds);
        setSelectedFilterIds(fnBDefaultSelectedFilterIds);
    }
    function onApplyFiltersPress() {
        const { from } = route?.params;
        navigation.navigate(from === "MakanMana" ? FNB_TAB_SCREEN : MERCHANT_LISTING, {
            selectedFilterIds,
            merge: true,
        });
    }

    /** SCROLLPICKER ACTIONS */
    function scrollPickerOnPressCancel() {
        console.log("FilterScreen scrollPickerOnPressCancel");
        setScrollPicker({ ...scrollPicker, isDisplay: false });
    }
    function scrollPickerOnPressDone(data) {
        console.log("FilterScreen scrollPickerOnPressDone", data);
        setScrollPicker({ ...scrollPicker, isDisplay: false });
        const value = distanceData.find((obj) => obj.value == data.value)?.value;
        setSelectedFilterIds({ ...selectedFilterIds, distance: value });
    }

    /** INIT Functions */
    const init = useCallback(async () => {
        try {
            const response = await getFnBFilterParam({ sandboxUrl: sandboxUrl.current });
            console.log("FilterScreen getFilterData success", response);
            const result = response.result;

            let toPickerFormat = result?.diningOption.map((obj) => {
                const { name, id } = obj;
                return { name: name, value: id };
            });
            setDeliveryTypeData(toPickerFormat ?? []);

            toPickerFormat = result?.promotionType.map((obj) => {
                const { name, id } = obj;
                return { name: name, value: id };
            });
            setPromotionTypeData(toPickerFormat ?? []);

            toPickerFormat = result?.priceList.map((obj) => {
                const { priceIndicator, priceId } = obj;
                return { name: priceIndicator, value: priceId };
            });
            setPriceData(toPickerFormat ?? []);

            toPickerFormat = result?.categoryVO?.subCategoryList.map((obj) => {
                const { cuisineType, cuisineId } = obj;
                return { name: cuisineType, value: cuisineId };
            });
            setCategoriesData(toPickerFormat ?? []);

            toPickerFormat = result.distanceList.map((obj) => {
                const { distance } = obj;
                return { name: distance, value: distance }; // unfortunately we're not sending id back to BE but value
            });
            toPickerFormat.unshift({ name: "All Distance", value: -1 }); // manually appending All at index 0
            setDistanceData(toPickerFormat);
        } catch (e) {
            console.log("FilterScreen getFilterData e", e);
            showErrorToast({
                message: e.message,
            });
        } finally {
            setIsLoading(false);
        }
    }, [sandboxUrl]);
    useEffect(() => {
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isDistanceEnabled =
        latitude.current && longitude.current && !selectedFilterIds.locationString.length;
    return (
        <KeyboardAvoidingView
            style={styles.containerView}
            behavior={Platform.OS == "ios" ? "padding" : ""}
            enabled
        >
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={isLoading}
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
                        paddingTop={0}
                    >
                        <ScrollView
                            refreshControl={<RefreshControl refreshing={false} onRefresh={init} />}
                        >
                            <View style={styles.container}>
                                <LocationInput
                                    isDisabled={
                                        selectedFilterIds.distance !=
                                        fnBDefaultSelectedFilterIds.distance // either location or distance, not both
                                    }
                                    onLocationInputChange={onLocationInputChange}
                                    locationString={selectedFilterIds.locationString}
                                />
                                <TitleAndDropdownPill
                                    title={Strings.FILTER_DISTANCE}
                                    dropdownTitle={distanceLbl}
                                    dropdownOnPress={onDistancePressed}
                                    isDisabled={!isDistanceEnabled} // either location or distance, not both
                                />
                                <HorizontalMasonry
                                    title="Dining Options"
                                    data={deliveryTypeData}
                                    onPress={onPressDeliveryType}
                                    selectedIdArr={[selectedFilterIds?.deliveryType]}
                                />

                                <HorizontalMasonry
                                    title="Promotions"
                                    data={promotionTypeData}
                                    onPress={onPressPromotionType}
                                    selectedIdArr={[selectedFilterIds?.promotionType]}
                                />
                                <PriceRange
                                    title={Strings.PRICE_RANGE}
                                    priceData={priceData}
                                    onPriceDataPressed={onPriceDataPressed}
                                    selectedId={selectedFilterIds?.priceId}
                                />
                                <HorizontalMasonry
                                    title={Strings.CATEGORIES}
                                    data={categoriesData}
                                    onPress={onPressCategory}
                                    selectedIdArr={selectedFilterIds?.categoryArr}
                                />
                                <SingleLineToggleWLabel
                                    onToggle={onNewestToggle}
                                    isToggled={selectedFilterIds.isNewest}
                                    text={Strings.FILTER_ADDITIONS}
                                />
                            </View>
                        </ScrollView>
                        <BottomDissolveCover>
                            <View style={styles.btmContainer}>
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
                        </BottomDissolveCover>
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

function PriceRange({ title, priceData, onPriceDataPressed, selectedId }) {
    function PriceItem(item) {
        function onPress() {
            onPriceDataPressed(item);
        }
        const isSelected = item.value === selectedId;
        return (
            <TouchableOpacity
                style={[styles.tagsView, isSelected && styles.selectedTagView, styles.priceTag]}
                onPress={onPress}
            >
                <Typo
                    fontSize={12}
                    fontWeight="normal"
                    lineHeight={18}
                    text={item.name}
                    color={BLACK}
                />
            </TouchableOpacity>
        );
    }
    return (
        <View style={styles.distanceContainer}>
            <Typo fontSize={14} fontWeight="600" lineHeight={24} text={title} textAlign="left" />
            <View style={styles.priceContainer}>
                {priceData?.map((item) => (
                    <PriceItem key={`${item.value}`} {...item} />
                ))}
            </View>
        </View>
    );
}
PriceRange.propTypes = {
    title: PropTypes.string,
    priceData: PropTypes.array,
    onPriceDataPressed: PropTypes.func,
    selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

function LocationInput({ isDisabled, onLocationInputChange, locationString }) {
    return (
        <>
            <Typo
                fontSize={14}
                fontWeight="600"
                lineHeight={24}
                text={Strings.LOCATION}
                textAlign="left"
                color={isDisabled ? DARK_GREY : BLACK}
            />
            <View style={styles.textView}>
                <View style={styles.inputIconContainer}>
                    <Image source={assets.magnifyingGlassDisable} style={styles.inputIcon} />
                </View>
                <TextInput
                    style={styles.textinput}
                    placeholder="Enter location"
                    placeholderTextColor={PLACEHOLDER_TEXT}
                    onChangeText={onLocationInputChange}
                    value={locationString}
                    editable={!isDisabled}
                />
            </View>
        </>
    );
}
LocationInput.propTypes = {
    isDisabled: PropTypes.bool,
    onLocationInputChange: PropTypes.func,
    locationString: PropTypes.string,
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
    btmContainer: {
        alignItems: "center",
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-evenly",
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
    inputIcon: { height: "100%", width: "100%" },
    inputIconContainer: {
        height: 22,
        left: 22,
        position: "absolute",
        width: 22,
    },
    priceContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 12,
    },
    priceTag: {
        paddingHorizontal: 28,
    },
    selectedTagView: {
        backgroundColor: YELLOW,
    },

    tagsView: {
        backgroundColor: WHITE,
        borderRadius: 18.5,
        elevation: 8,
        paddingHorizontal: 18,
        paddingVertical: 10,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 5,
    },
    textView: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 24,
        flexDirection: "row",
        height: 48,
        justifyContent: "flex-start",
        marginTop: 8,
        position: "relative",
        width: "100%",
    },
    textinput: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 20,
        fontWeight: "300",
        letterSpacing: 0,
        lineHeight: 24,
        paddingLeft: 60,
        width: "100%",
    },
});

export default withModelContext(FilterScreen);
