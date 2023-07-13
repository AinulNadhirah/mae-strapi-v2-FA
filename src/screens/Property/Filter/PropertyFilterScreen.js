/* eslint-disable sonarjs/no-use-of-empty-return-value */
/* eslint-disable no-use-before-define */
/* eslint-disable array-callback-return */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    View,
} from "react-native";
import Geocoder from "react-native-geocoder";

import {
    BANKINGV2_MODULE,
    PROPERTY_SELECT_AREA_SCREEN,
    PROPERTY_LIST,
    PROPERTY_DASHBOARD,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common/ScrollPickerView";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { STATUS_CODE_SUCCESS } from "@constants/api";
import { FAProperty } from "@services/analytics/analyticsProperty";

import {
    BLACK,
    GREY,
    MEDIUM_GREY,
    SWITCH_GREY,
    WHITE,
    YELLOW,
} from "@constants/colors";
import {
    CANCEL,
    DONE,
    COMMON_ERROR_MSG,
    FA_PROPERTY_FILTER,
    PRICE_RANGE,
    MIN_PRICE,
    MAX_PRICE,
    SIZE_RANGE,
    MIN_RANGE,
    MAX_RANGE,
    PREFERED_DEVELOPER,
    BEDROOMS_CAM,
    BEDROOMS,
    BATHROOMS_CAM,
    BATHROOMS,
    CARPARKS_CAM,
    CARPARKS,
    PROPERTY_TYPE,
    SEE_LESS,
    SHOW_MORE_PROPERTY_TYPE,
    OWNERSHIP,
    CLEAR_FLITERS,
    APPLY_FILTERS,
} from "@constants/strings";

import Assets from "@assets";
import { fetchFilterCriteria } from "../Common/PropertyController";

import RoomsCarparksRow from "./Common/RoomsCarparksRow";
import PropertyTypeRow from "./Common/PropertyTypeRow";
import OwnershipRow from "./Common/OwnershipRow";

const screenWidth = Dimensions.get("window").width;
const btnWidth = (screenWidth * 40) / 100;

const ALL_STATES = "All States";
const ALL_AREAS = "All Areas";
const ALL_DEVELOPERS = "All Developers";
const ANY = "Any";
const INTIAL_PROPERTY_TYPES_COUNT = 3;
const ROOM_CARPARKS_ARRAY = [ANY, "1+", "2+", "3+", "4+", "5+"];

function PropertyFilterScreen({ route, navigation }) {
    const { getModel } = useModelController();

    const [loading, setLoading] = useState(true);
    const [pickerType, setPickerType] = useState(null);
    const [showArea, setShowArea] = useState(false);

    const [statesList, setStatesList] = useState(null);
    const [priceRangeData, setPriceRangeData] = useState(null);
    const [propertySizeData, setPropertySizeData] = useState(null);
    const [propertyTypeData, setPropertyTypeData] = useState(null);
    const [ownershipData, setOwnershipData] = useState(null);

    const [locationState, setLocationState] = useState(ALL_STATES);
    const [stateValue, setStateValue] = useState("");
    const [stateData, setStateData] = useState(null);
    const [statePicker, setStatePicker] = useState(false);
    const [stateScrollPickerSelectedIndex, setStateScrollPickerSelectedIndex] = useState(0);

    const [area, setArea] = useState(ALL_AREAS);
    const [areaValue, setAreaValue] = useState([]);
    const [areaData, setAreaData] = useState(null);
    const [selectedAreaData, setSelectedAreaData] = useState([]);

    const [minPrice, setMinPrice] = useState(ANY);
    const [minPriceValue, setMinPriceValue] = useState("");
    const [minPriceData, setMinPriceData] = useState(null);
    const [minPricePicker, setMinPricePicker] = useState(false);
    const [minPriceScrollPickerSelectedIndex, setMinPriceScrollPickerSelectedIndex] = useState(0);

    const [maxPrice, setMaxPrice] = useState(ANY);
    const [maxPriceValue, setMaxPriceValue] = useState("");
    const [maxPriceData, setMaxPriceData] = useState(null);
    const [maxPricePicker, setMaxPricePicker] = useState(false);
    const [maxPriceScrollPickerSelectedIndex, setMaxPriceScrollPickerSelectedIndex] = useState(0);

    const [minSize, setMinSize] = useState(ANY);
    const [minSizeValue, setMinSizeValue] = useState("");
    const [minSizeData, setMinSizeData] = useState(null);
    const [minSizePicker, setMinSizePicker] = useState(false);
    const [minSizeScrollPickerSelectedIndex, setMinSizeScrollPickerSelectedIndex] = useState(0);

    const [maxSize, setMaxSize] = useState(ANY);
    const [maxSizeValue, setMaxSizeValue] = useState("");
    const [maxSizeData, setMaxSizeData] = useState(null);
    const [maxSizePicker, setMaxSizePicker] = useState(false);
    const [maxSizeScrollPickerSelectedIndex, setMaxSizeScrollPickerSelectedIndex] = useState(0);

    const [developer, setDeveloper] = useState(ALL_DEVELOPERS);
    const [developerValue, setDeveloperValue] = useState([]);
    const [developerData, setDeveloperData] = useState([]);
    const [selectedDeveloperData, setSelectedDeveloperData] = useState([]);

    const [bedrooms, setBedrooms] = useState(ROOM_CARPARKS_ARRAY[0]);
    const [bathrooms, setBathrooms] = useState(ROOM_CARPARKS_ARRAY[0]);
    const [carparks, setCarparks] = useState(ROOM_CARPARKS_ARRAY[0]);
    const [bedroomsValue, setBedroomsValue] = useState("");
    const [bathroomsValue, setBathroomsValue] = useState("");
    const [carparksValue, setCarparksValue] = useState("");

    const [selectedPropertyTypes, setSelectedPropertyTypes] = useState([]);
    const [propertyTypeListData, setPropertyTypeListData] = useState(null);
    const [propertyTypesRefresh, setPropertyTypesRefresh] = useState(false);
    const [isShowAllPropertyTypes, setIsShowAllPropertyTypes] = useState(false);

    const [ownershipValue, setOwnershipValue] = useState("");
    const [ownershipRefresh, setOwnershipRefresh] = useState(false);

    const [from, setFrom] = useState(null);

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        console.log("[PropertyFilterScreen] >> [init]");

        const { propertyMetadata } = getModel("misc");
        const isCloudEnabled = propertyMetadata?.propertyCloudEnabled ?? false;
        const cloudEndPointBase = propertyMetadata?.propertyCloudUrl ?? "";
        const params = {};

        try {
            const httpResp = await fetchFilterCriteria(isCloudEnabled, cloudEndPointBase, params);
            handleGetfilterCriteriaResponse(httpResp);
        } catch (error) {
            handleGetfilterCriteriaError(error);
        } finally {
            setLoading(false);
        }

        FAProperty.onPressViewScreen(FA_PROPERTY_FILTER);
    };

    const handleGetfilterCriteriaResponse = (httpResp) => {
        console.log(
            "[PropertyFilterScreen][handleGetfilterCriteriaResponse] >> Response: ",
            httpResp
        );
        const result = httpResp?.data?.result ?? {};
        const statusCode = result?.statusCode ?? null;
        const statusDesc = result?.statusDesc ?? null;
        if (statusCode === STATUS_CODE_SUCCESS) {
            const filterDetails = result?.filterDetails ?? {};
            if (filterDetails) {
                setInitialData(filterDetails);
            }
        } else {
            // Show error message
            showErrorToast({
                message: statusDesc || COMMON_ERROR_MSG,
            });
        }
    };

    const handleGetfilterCriteriaError = (error) => {
        console.log("[PropertyFilterScreen][handleGetfilterCriteriaError] >> Exception: ", error);
        showErrorToast({
            message: error?.message ?? COMMON_ERROR_MSG,
        });

        // Navigate back if failed to fetch data
        onPressClose();
    };

    const setInitialData = (filterDetails) => {
        console.log("[PropertyFilterScreen] >> [setInitialData]");

        const navParams = route?.params ?? {};
        const stateList = filterDetails?.stateList?.states ?? null;
        const lat = navParams?.latitude ?? "";
        const lng = navParams?.longitude ?? "";
        const statesArray = massageData(stateList);
        const propPriceData = filterDetails?.price ?? null;
        const propSizeData = filterDetails?.propertySizeRange ?? null;
        const propTypeData = filterDetails?.property_type ?? null;
        const prefDeveloper = filterDetails?.preferred_developer ?? null;
        const ownership = filterDetails?.ownsership ?? null;

        setStatesList(stateList);
        setPriceRangeData(propPriceData);
        setPropertySizeData(propSizeData);
        setMinPriceData(propPriceData);
        setMaxPriceData(propPriceData);
        setMinSizeData(propSizeData);
        setMaxSizeData(propSizeData);
        setDeveloperData(prefDeveloper);
        setPropertyTypeData(propTypeData);
        setOwnershipData(ownership);

        //property types set to 3
        setPropertypeInitialData(propTypeData);

        setStateData(statesArray);
        setFrom(navParams?.from ?? null);

        const filterParams = navParams?.filterParams ?? null;
        if (filterParams) {
            populateData(
                filterParams,
                stateList,
                propPriceData,
                propSizeData,
                prefDeveloper,
            );
        }

        // Auto Populate location data if coordinates are available
        if (lat && lng && filterParams === null) autoPopulateLocation(lat, lng, stateList);
    };

    const autoPopulateLocation = async (lat, lng, stateList) => {
        console.log("[PropertyFilterScreen] >> [autoPopulateLocation]");

        const res = await Geocoder.geocodePosition({ lat, lng });
        const { locality, adminArea } = res[0]; // area
        if (locality != null) {
            const userStateAreaArray = await getUserState(stateList, locality, adminArea);
            if (userStateAreaArray.length > 0) {
                const stateVal = userStateAreaArray[0].value;
                let statePickerIndex = stateList.findIndex(({ id }) => id === stateVal);
                statePickerIndex = statePickerIndex === -1 ? 0 : statePickerIndex;

                setLocationState(userStateAreaArray[0].name);
                setStateValue(stateVal);
                setStateScrollPickerSelectedIndex(statePickerIndex);

                if (userStateAreaArray.length === 2) {
                    const areaVal = [];
                    const selectedAreaData = [];
                    areaVal.push(userStateAreaArray[1].value);
                    selectedAreaData.push(userStateAreaArray[1]);

                    setArea(userStateAreaArray[1].name);
                    setAreaValue(areaVal);
                    setSelectedAreaData(selectedAreaData);
                    setShowArea(true);

                    // set area data based on state selected
                    const areaList = getAreaData(stateList, stateVal);
                    const areaArray = massageData(areaList);
                    setAreaData(areaArray);
                }
            }
        }
        console.log("Geocoder res: ", res[0]);
    };

    const populateData = (
        filterParams,
        stateList,
        priceData,
        sizeData,
        prefDeveloper
    ) => {
        console.log("[PropertyFilterScreen] >> [populateData]");
        const stateVal = filterParams?.state ?? null;
        const areaVal = filterParams?.area ?? null;
        const minPriceVal = filterParams?.min_price ?? "";
        const maxPriceVal = filterParams?.max_price ?? "";
        const minSizeVal = filterParams?.min_size ?? "";
        const maxSizeVal = filterParams?.max_size ?? "";
        const developerVal = filterParams?.developer_id ?? null;
        const bedroomVal = filterParams?.bedroom ? `${filterParams.bedroom}+` : null;
        const bathroomVal = filterParams?.bathroom ? `${filterParams.bathroom}+` : null;
        const carparkVal = filterParams?.carpark ? `${filterParams.carpark}+` : null;
        const buildingVal = filterParams?.building_id ?? null;
        const ownershipVal = filterParams?.ownership ?? null;

        if (stateVal && stateList) {
            setStateValue(stateVal);
            const stateObj = stateList.find(({ id }) => id === stateVal);
            const index = stateList.findIndex(({ id }) => id === stateVal);
            setLocationState(stateObj.name);
            setStateScrollPickerSelectedIndex(index);
        }

        if (areaVal && stateList) {
            // set area data based on state selected
            const areaList = getAreaData(stateList, stateVal);
            const areaArray = massageData(areaList);
            setAreaData(areaArray);

            const selectedAreaItems = areaArray.filter(
                ({ value }) => areaVal.indexOf(value) !== -1
            );
            populateAreaDeveloperValues(selectedAreaItems, areaVal, "area", areaArray.length);
            setShowArea(true);
        }

        if (minPriceVal && priceData) {
            const minPriceObj = priceData.find(({ value }) => value === minPriceVal);
            const index = priceData.findIndex(({ value }) => value === minPriceVal);
            updateMinPriceValue(minPriceObj, index, priceData, maxPriceVal);
        }

        if (maxPriceVal && priceData) {
            const maxPriceObj = priceData.find(({ value }) => value === maxPriceVal);

            //get updated index
            const propertyMaxPriceArray = minPriceVal
                ? getMaxItemsArray(priceData, minPriceVal)
                : priceData;
            let propertyMaxPriceIndex = propertyMaxPriceArray.findIndex(
                ({ value }) => value === maxPriceVal
            );
            propertyMaxPriceIndex = propertyMaxPriceIndex === -1 ? 0 : propertyMaxPriceIndex;
            updateMaxPriceValue(maxPriceObj, propertyMaxPriceIndex, priceData, minPriceVal);
        }

        if (minSizeVal && sizeData) {
            const minSizeObj = sizeData.find(({ value }) => value === minSizeVal);
            const index = sizeData.findIndex(({ value }) => value === minSizeVal);
            const maxSizeVal = updateMinSizeValue(minSizeObj, index, sizeData, maxSizeVal);
        }

        if (maxSizeVal && sizeData) {
            const maxSizeObj = sizeData.find(({ value }) => value === maxSizeVal);

            //get updated index
            const propertyMaxSizeArray = minSizeVal
                ? getMaxItemsArray(sizeData, minSizeVal)
                : sizeData;
            let propertyMaxSizeIndex = propertyMaxSizeArray.findIndex(
                ({ value }) => value === maxSizeVal
            );
            propertyMaxSizeIndex = propertyMaxSizeIndex === -1 ? 0 : propertyMaxSizeIndex;
            updateMaxSizeValue(maxSizeObj, propertyMaxSizeIndex, sizeData, minSizeVal);
        }

        if (developerVal && prefDeveloper) {
            const selectedDeveloperItems = prefDeveloper.filter(
                ({ value }) => developerVal.indexOf(value) !== -1
            );
            populateAreaDeveloperValues(
                selectedDeveloperItems,
                developerVal,
                "developer",
                prefDeveloper.length
            );
        }

        if (bedroomVal) {
            setBedroomsValue(bedroomVal);
            setBedrooms(bedroomVal);
        }

        if (bathroomVal) {
            setBathroomsValue(bathroomVal);
            setBathrooms(bathroomVal);
        }

        if (carparkVal) {
            setCarparksValue(carparkVal);
            setCarparks(carparkVal);
        }

        if (buildingVal) {
            setSelectedPropertyTypes(buildingVal);
            setPropertyTypesRefresh(true);
        }

        if (ownershipVal) {
            setOwnershipValue(ownershipVal);
            setOwnershipRefresh(true);
        }
    };

    const populateAreaDeveloperValues = (selectedItems, selectedKeys, type, totalLength) => {
        console.log("[PropertyFilterScreen] >> [populateAreaDeveloper]", selectedItems);

        if (selectedItems) {
            let info = "";
            const length = selectedItems.length;
            if (length === totalLength || length === 0) {
                info = type === "area" ? ALL_AREAS : ALL_DEVELOPERS;
            } else if (length === 1) {
                info = selectedItems[0].name;
            } else {
                info = length + " " + type + "s" + " selected";
            }
            if (type === "area") {
                setAreaValue(selectedKeys);
                setSelectedAreaData(selectedItems);
                setArea(info);
            } else if (type === "developer") {
                setDeveloperValue(selectedKeys);
                setSelectedDeveloperData(selectedItems);
                setDeveloper(info);
            }
        }
    };

    const onPressClose = () => {
        console.log("[PropertyFilterScreen] >> [onPressClose]");

        navigation.canGoBack() && navigation.goBack();
    };

    const massageData = (dataList) => {
        console.log("[PropertyFilterScreen] >> [massageData]");

        // Error checking
        if (!dataList) return [];

        return dataList.map((item) => {
            return {
                name: item.name,
                value: item.id,
            };
        });
    };

    const getAreaData = (statesList, stateID) => {
        console.log("[PropertyFilterScreen] >> [getAreaData]" + stateID);

        let areaList = [];
        if (statesList) {
            statesList.some((item) => {
                if (item && item.id === stateID) {
                    areaList = item.cities;
                    return true;
                }
            });
        }
        return areaList;
    };

    const getUserState = async (statesList, locality, adminArea) => {
        console.log("[PropertyFilterScreen] >> [getUserState]" + locality);

        let statesAreaArray = [];
        for (let i = 0, len = statesList.length; i < len; i++) {
            let stateObj = statesList[i]; //cities
            let areaArray = stateObj.cities; //cities
            for (let j = 0, length = areaArray.length; j < length; j++) {
                let areaObj = areaArray[j];
                if (areaObj.name && areaObj.name.toLowerCase() === locality.toLowerCase()) {
                    statesAreaArray.push({ name: stateObj.name, value: stateObj.id }); //state data
                    statesAreaArray.push({ name: areaObj.name, value: areaObj.id }); //area data
                    break;
                }
            }
            if (statesAreaArray.length === 2) break;
        }

        //if the above doesn't match - check for state
        if (statesAreaArray.length === 0) {
            for (let i = 0, len = statesList.length; i < len; i++) {
                let stateObj = statesList[i]; //cities
                const stateName = stateObj?.name ?? "";
                if (
                    stateName &&
                    (stateName.toLowerCase() === locality.toLowerCase() ||
                        stateName.toLowerCase() === adminArea.toLowerCase())
                ) {
                    statesAreaArray.push({ name: stateObj.name, value: stateObj.id }); //state data
                    break;
                }
            }
        }

        return statesAreaArray;
    };

    const onPressLocationField = () => {
        console.log("[PropertyFilterScreen] >> [onPressLocationField]");

        setPickerType("states");
        setStatePicker(true);
    };

    const onPressAreaField = () => {
        console.log("[PropertyFilterScreen] >> [onPressAreaField]");

        navigation.navigate(BANKINGV2_MODULE, {
            screen: PROPERTY_SELECT_AREA_SCREEN,
            params: {
                title: "Select Area",
                type: "area",
                data: areaData,
                selectedData: selectedAreaData,
                confirmCallback,
            },
        });
    };

    const onPressMinPriceField = () => {
        console.log("[PropertyFilterScreen] >> [onPressMinPriceField]");

        setPickerType("minPrice");
        setMinPricePicker(true);
    };

    const onPressMaxPriceField = () => {
        console.log("[PropertyFilterScreen] >> [onPressMaxPriceField]");

        setPickerType("maxPrice");
        setMaxPricePicker(true);
    };

    const onPressMinSizeField = () => {
        console.log("[PropertyFilterScreen] >> [onPressMinSizeField]");

        setPickerType("minSize");
        setMinSizePicker(true);
    };

    const onPressMaxSizeField = () => {
        console.log("[PropertyFilterScreen] >> [onPressMaxSizeField]");

        setPickerType("maxSize");
        setMaxSizePicker(true);
    };

    /* Picker cancel */
    const onPickerCancel = () => {
        console.log("[PropertyFilterScreen] >> [onPickerCancel]");

        setStatePicker(false);
        setMinPricePicker(false);
        setMaxPricePicker(false);
        setMinSizePicker(false);
        setMaxSizePicker(false);
        setPickerType(null);
    };

    /* Picker Done */
    const onPickerDone = (item, index) => {
        console.log("[PropertyFilterScreen] >> [onPickerDone]");

        if (item) {
            switch (pickerType) {
                case "states":
                    setLocationState(item?.name ?? ALL_STATES);
                    setStateValue(item?.value ?? "");
                    setStateScrollPickerSelectedIndex(index);

                    //update area info
                    // eslint-disable-next-line no-case-declarations
                    const showAreaField = item.name !== ALL_STATES;
                    if (showAreaField) {
                        setShowArea(showAreaField);
                        setArea(ALL_AREAS);
                        setAreaValue("");
                        setSelectedAreaData([]);
                        const areaList = getAreaData(statesList, item.value); // set area data based on state selected
                        const areaArray = massageData(areaList);
                        setAreaData(areaArray);
                    }
                    break;
                case "area":
                    setArea(item?.name ?? ALL_AREAS);
                    setAreaValue(item?.value ?? "");
                    break;
                case "minPrice":
                    updateMinPriceValue(item, index, priceRangeData, maxPriceValue);
                    break;
                case "maxPrice":
                    updateMaxPriceValue(item, index, priceRangeData, minPriceValue);
                    break;
                case "minSize":
                    updateMinSizeValue(item, index, propertySizeData, maxSizeValue);
                    break;
                case "maxSize":
                    updateMaxSizeValue(item, index, propertySizeData, minSizeValue);
                    break;
            }
        }
        // Close picker
        onPickerCancel();
    };

    const updateMinPriceValue = (item, index, priceRangeData, maxPriceValue) => {
        const minPriceName = (minPriceData && minPriceData[index].name) || (item?.name ?? ANY);
        const minPriceVal = (minPriceData && minPriceData[index].value) || (item?.value ?? "");
        setMinPrice(minPriceName);
        setMinPriceValue(minPriceVal);
        setMinPriceScrollPickerSelectedIndex(index);

        const propertyMaxPriceArray =
            minPriceVal === "" ? priceRangeData : getMaxItemsArray(priceRangeData, minPriceVal);
        let propertyMaxPriceIndex = propertyMaxPriceArray.findIndex(
            ({ value }) => value === maxPriceValue
        );
        propertyMaxPriceIndex = propertyMaxPriceIndex === -1 ? 0 : propertyMaxPriceIndex;
        setMaxPriceData(propertyMaxPriceArray);
        setMaxPriceScrollPickerSelectedIndex(propertyMaxPriceIndex);
    };

    const updateMaxPriceValue = (item, index, priceRangeData, minPriceValue) => {
        const maxPriceName = (maxPriceData && maxPriceData[index].name) || (item?.name ?? ANY);
        let maxPriceVal = (maxPriceData && maxPriceData[index].value) || (item?.value ?? "");
        setMaxPrice(maxPriceName);
        setMaxPriceValue(maxPriceVal);
        setMaxPriceScrollPickerSelectedIndex(index);

        //maxPriceVal = maxPriceVal ? maxPriceVal : priceRangeData[priceRangeData.length - 1].value;
        const propertyMinPriceArray =
            maxPriceVal === "" ? priceRangeData : getMinItemsArray(priceRangeData, maxPriceVal);
        let propertyMinPriceIndex = propertyMinPriceArray.findIndex(
            ({ value }) => value === minPriceValue
        );
        propertyMinPriceIndex = propertyMinPriceIndex === -1 ? 0 : propertyMinPriceIndex;
        setMinPriceData(propertyMinPriceArray);
        setMinPriceScrollPickerSelectedIndex(propertyMinPriceIndex);
    };

    const updateMinSizeValue = (item, index, propertySizeData, maxSizeValue) => {
        const minSizeName = (minSizeData && minSizeData[index].name) || (item?.name ?? ANY);
        const minSizeVal = (minSizeData && minSizeData[index].value) || (item?.value ?? "");
        setMinSize(minSizeName);
        setMinSizeValue(minSizeVal);
        setMinSizeScrollPickerSelectedIndex(index);

        const propertyMaxSizeArray =
            minSizeVal === "" ? propertySizeData : getMaxItemsArray(propertySizeData, minSizeVal);
        let propertyMaxSizeIndex = propertyMaxSizeArray.findIndex(
            ({ value }) => value === maxSizeValue
        );
        propertyMaxSizeIndex = propertyMaxSizeIndex === -1 ? 0 : propertyMaxSizeIndex;
        setMaxSizeData(propertyMaxSizeArray);
        setMaxSizeScrollPickerSelectedIndex(propertyMaxSizeIndex);
    };

    const updateMaxSizeValue = (item, index, propertySizeData, minSizeValue) => {
        const maxSizeName = (maxSizeData && maxSizeData[index].name) || (item?.name ?? ANY);
        let maxSizeVal = (maxSizeData && maxSizeData[index].value) || (item?.value ?? "");
        setMaxSize(maxSizeName);
        setMaxSizeValue(maxSizeVal);
        setMaxSizeScrollPickerSelectedIndex(index);

        //maxSizeVal = maxSizeVal ? maxSizeVal : propertySizeData[propertySizeData.length - 1].value;
        const propertyMinSizeArray =
            maxSizeVal === "" ? propertySizeData : getMinItemsArray(propertySizeData, maxSizeVal);
        let propertyMinSizeIndex = propertyMinSizeArray.findIndex(
            ({ value }) => value === minSizeValue
        );
        propertyMinSizeIndex = propertyMinSizeIndex === -1 ? 0 : propertyMinSizeIndex;
        setMinSizeData(propertyMinSizeArray);
        setMinSizeScrollPickerSelectedIndex(propertyMinSizeIndex);
    };

    const getMinItemsArray = (range, maxValue) =>
        range.filter((item) => parseInt(item.value) <= parseInt(maxValue));

    const getMaxItemsArray = (range, minValue) =>
        range.filter((item) => parseInt(item.value) >= parseInt(minValue));

    /* developer */
    const onPressDeveloperField = () => {
        console.log("[PropertyFilterScreen] >> [onPressDeveloperField]");

        if (developerData?.length > 0) {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: PROPERTY_SELECT_AREA_SCREEN,
                params: {
                    title: "Select Developer",
                    type: "developer",
                    data: developerData,
                    selectedData: selectedDeveloperData,
                    confirmCallback,
                },
            });
        }
    };

    const confirmCallback = (selectedItems, selectedKeys, type) => {
        console.log("[PropertyFilterScreen] >> [confirmCallback]", selectedItems);

        if (selectedItems) {
            let info = "";
            const length = selectedItems.length;
            const totalLength = type === "area" ? areaData.length : developerData.length;
            if (length === 1) {
                info = selectedItems[0].name;
            } else if (length === totalLength || length === 0) {
                info = type === "area" ? ALL_AREAS : ALL_DEVELOPERS;
            } else {
                info = length + " " + type + "s" + " selected";
            }
            if (type === "area") {
                setAreaValue(selectedKeys);
                setSelectedAreaData(selectedItems);
                setArea(info);
            } else if (type === "developer") {
                setDeveloperValue(selectedKeys);
                setSelectedDeveloperData(selectedItems);
                setDeveloper(info);
            }
        }
    };

    const onRoomCarparkPlus = (type) => {
        console.log("[PropertyFilterScreen] >> [onRoomCarparkPlus]" + type);

        if (type === "bedrooms") {
            const value = getNextRoomCarParkValidValue(bedrooms);
            setBedrooms(value);
            setBedroomsValue(value);
        } else if (type === "bathrooms") {
            const value = getNextRoomCarParkValidValue(bathrooms);
            setBathrooms(value);
            setBathroomsValue(value);
        } else if (type === "carparks") {
            const value = getNextRoomCarParkValidValue(carparks);
            setCarparks(value);
            setCarparksValue(value);
        }
    };

    const onRoomCarparkMinus = (type) => {
        console.log("[PropertyFilterScreen] >> [onRoomCarparkMinus]" + type);

        if (type === "bedrooms") {
            const value = getPreviousRoomCarParkValidValue(bedrooms);
            setBedrooms(value);
            setBedroomsValue(value);
        } else if (type === "bathrooms") {
            const value = getPreviousRoomCarParkValidValue(bathrooms);
            setBathrooms(value);
            setBathroomsValue(value);
        } else if (type === "carparks") {
            const value = getPreviousRoomCarParkValidValue(carparks);
            setCarparks(value);
            setCarparksValue(value);
        }
    };

    const getNextRoomCarParkValidValue = (currentValue) => {
        const length = ROOM_CARPARKS_ARRAY.length;
        let currentItemIndex = ROOM_CARPARKS_ARRAY.indexOf(currentValue);
        currentItemIndex++;
        return currentItemIndex >= length
                ? ROOM_CARPARKS_ARRAY[length - 1]
                : ROOM_CARPARKS_ARRAY[currentItemIndex];
    };

    const getPreviousRoomCarParkValidValue = (currentValue) => {
        let currentItemIndex = ROOM_CARPARKS_ARRAY.indexOf(currentValue);
        currentItemIndex--;
        return currentItemIndex < 0 ? ROOM_CARPARKS_ARRAY[0] : ROOM_CARPARKS_ARRAY[currentItemIndex];
    };

    function keyExtractor(item, index) {
        return `${item.value}-${index}`;
    }

    const renderItemPropertyType = ({ item, index }) => {
        return (
            <PropertyTypeRow
                key={index}
                data={item}
                onPress={onPressPropertyRow}
                selectedPropertyTypes={selectedPropertyTypes}
            />
        );
    };

    renderItemPropertyType.propTypes = {
        item: PropTypes.object,
        index: PropTypes.number,
    };

    const setPropertypeInitialData = (propertyTypes) => {
        if (propertyTypes && propertyTypes.length >= INTIAL_PROPERTY_TYPES_COUNT) {
            setPropertyTypeListData(propertyTypes.slice(0, INTIAL_PROPERTY_TYPES_COUNT));
        }
    };

    const onPressPropertyRow = (data) => {
        console.log("[PropertyFilterScreen] >> [onPressPropertyRow]", data);

        const selectedValue = data.value;
        const isItemAvailable = selectedPropertyTypes.includes(selectedValue);
        if (isItemAvailable) {
            //remove
            selectedPropertyTypes.splice(selectedPropertyTypes.indexOf(selectedValue), 1);
            setSelectedPropertyTypes(selectedPropertyTypes);
        } else {
            //add
            selectedPropertyTypes.push(selectedValue);
            setSelectedPropertyTypes(selectedPropertyTypes);
        }
        setPropertyTypesRefresh(!propertyTypesRefresh);
    };

    const onPressShowAllPropertyTypes = () => {
        const totalPropertyTypes = propertyTypeData.length;
        const len = isShowAllPropertyTypes ? INTIAL_PROPERTY_TYPES_COUNT : totalPropertyTypes;
        setPropertyTypeListData(propertyTypeData.slice(0, len));
        setIsShowAllPropertyTypes(!isShowAllPropertyTypes);
    };

    const renderItemOwnershipData = ({ item, index }) => {
        return (
            <OwnershipRow
                key={index}
                data={item}
                onPress={onPressOwnershipRowRow}
                ownership={ownershipValue}
            />
        );
    };

    renderItemOwnershipData.propTypes = {
        item: PropTypes.object,
        index: PropTypes.number,
    };

    const onPressOwnershipRowRow = (data) => {
        console.log("[PropertyFilterScreen] >> [onPressOwnershipRowRow]", data);

        const selectedValue = data.value;
        const ownershp = ownershipValue === selectedValue ? "" : selectedValue;
        setOwnershipValue(ownershp);
        setOwnershipRefresh(!ownershipRefresh);
    };

    const onPressClearFiler = () => {
        console.log("[PropertyFilterScreen] >> [onPressClearFiler]");

        setShowArea(false);
        setLocationState(ALL_STATES);
        setStateValue("");
        setArea(ALL_AREAS);
        setAreaValue("");
        setSelectedAreaData([]);
        setMinPrice(ANY);
        setMinPriceValue("");
        setMaxPrice(ANY);
        setMaxPriceValue("");
        setMinSize(ANY);
        setMinSizeValue("");
        setMaxSize(ANY);
        setMaxSizeValue("");
        setDeveloper(ALL_DEVELOPERS);
        setDeveloperValue("");
        setSelectedDeveloperData([]);
        setBedrooms(ROOM_CARPARKS_ARRAY[0]);
        setBathrooms(ROOM_CARPARKS_ARRAY[0]);
        setCarparks(ROOM_CARPARKS_ARRAY[0]);
        setBedroomsValue("");
        setBathroomsValue("");
        setCarparksValue("");
        setSelectedPropertyTypes([]);
        setPropertypeInitialData(propertyTypeData);
        setIsShowAllPropertyTypes(false);
        setPropertyTypesRefresh(true);
        setOwnershipValue("");
        setOwnershipRefresh(!ownershipRefresh);

        setMinPriceData(priceRangeData);
        setMaxPriceData(priceRangeData);
        setMinSizeData(propertySizeData);
        setMaxSizeData(propertySizeData);

        setStateScrollPickerSelectedIndex(0);
        setMinPriceScrollPickerSelectedIndex(0);
        setMaxPriceScrollPickerSelectedIndex(0);
        setMinSizeScrollPickerSelectedIndex(0);
        setMaxSizeScrollPickerSelectedIndex(0);
    };

    const onPressApplyFilters = () => {
        console.log("[PropertyFilterScreen] >> [onPressApplyFilters]");

        const filterObj = prepareFilterData();
        const params = route?.params ?? {};
        const screenType = from === PROPERTY_DASHBOARD ? "FILTER" : params?.screenType;

        navigation.navigate(BANKINGV2_MODULE, {
            screen: PROPERTY_LIST,
            params: {
                latitude: params?.latitude ?? "",
                longitude: params?.longitude ?? "",
                screenType,
                featuredProperties: params?.featuredProperties ?? [],
                filterApplied: Object.keys(filterObj).length > 0,
                filterParams: {
                    ...filterObj,
                },
            },
        });

        //Analytics
        try {
            const bedroom = filterObj?.bedroom ?? "Any";
            const bathroom = filterObj?.bathroom ?? "Any";
            const carpark = filterObj?.carpark ?? "Any";

            const buidingTypesIds = filterObj?.building_id ?? "";
            let buildingTypeNames = "";
            if (buidingTypesIds) {
                const buildingTypeNamesArray = [];
                for (let i = 0, len = buidingTypesIds.length; i < len; i++) {
                    const obj = propertyTypeData.find((x) => x.value === buidingTypesIds[i]);
                    buildingTypeNamesArray.push(obj.name);
                }
                buildingTypeNames = buildingTypeNamesArray.join("/");
            }

            const developerIds = filterObj?.developer_id ?? "";
            let developerIdNames = "";
            if (developerIds) {
                const developerIdNamesArray = [];
                for (let i = 0, len = developerIds.length; i < len; i++) {
                    const obj = developerData.find((x) => x.value === developerIds[i]);
                    developerIdNamesArray.push(obj.name);
                }
                developerIdNames = developerIdNamesArray.join("/");
            }

            const fieldInformation = {
                state: filterObj?.state ?? "All",
                area: filterObj?.area ?? "All",
                min_p: filterObj?.min_price ?? "Any",
                max_p: filterObj?.max_price ?? "Any",
            };
            const fieldInformation2 = {
                min_s: filterObj?.min_size ?? "Any",
                max_s: filterObj?.max_size ?? "Any",
                dev: developerIdNames.length > 0 ? developerIdNames : "All",
                "R/B/CP": bedroom + "/" + bathroom + "/" + carpark,
            };
            const fieldInformation3 = {
                prop_type: buildingTypeNames.length ? buildingTypeNames : "Any",
                title: filterObj?.ownership ?? "Any",
            };

            FAProperty.onPressApplyFilter(FA_PROPERTY_FILTER, JSON.stringify(fieldInformation), JSON.stringify(fieldInformation2), JSON.stringify(fieldInformation3));
        } catch (error) {
            console.log("[PropertyFilterScreen][onPressApplyFilters] >> Exception: ", error);
        }
    };

    const prepareFilterData = () => {
        console.log("[PropertyFilterScreen] >> [prepareFilterData]");

        const bedroomFormatted =
            !bedroomsValue || bedroomsValue === ANY ? "" : String(parseInt(bedroomsValue));
        const bathroomFormatted =
            !bathroomsValue || bathroomsValue === ANY ? "" : String(parseInt(bathroomsValue));
        const carparkFormatted =
            !carparksValue || carparksValue === ANY ? "" : String(parseInt(carparksValue));

        const filterObj = {
            state: stateValue,
            area: areaValue instanceof Array && areaValue.length ? areaValue : null,
            building_id:
                selectedPropertyTypes instanceof Array && selectedPropertyTypes.length
                    ? selectedPropertyTypes
                    : null,
            developer_id:
                developerValue instanceof Array && developerValue.length ? developerValue : null,
            min_price: minPriceValue,
            max_price: maxPriceValue,
            min_size: minSizeValue,
            max_size: maxSizeValue,
            ownership: ownershipValue,
            bedroom: bedroomFormatted,
            bathroom: bathroomFormatted,
            carpark: carparkFormatted,
        };

        // Remove keys with empty/null values
        return Object.entries(filterObj).reduce(
            (a, [k, v]) => (v ? ((a[k] = v), a) : a),
            {}
        );
    };

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
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text="Filter"
                                />
                            }
                            headerRightElement={<HeaderCloseButton onPress={onPressClose} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.containerCls}>
                                {!loading && (
                                    <>
                                        {/* Location */}
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            textAlign="left"
                                            text="Location"
                                            color={BLACK}
                                        />

                                        <LabeledDropdown
                                            dropdownValue={locationState}
                                            onPress={onPressLocationField}
                                        />

                                        {/* Area */}
                                        {showArea && (
                                            <TouchableOpacity
                                                style={styles.areaContainer}
                                                onPress={onPressAreaField}
                                                activeOpacity={0.7}
                                            >
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={18}
                                                    fontWeight="600"
                                                    textAlign="left"
                                                    text={area}
                                                    ellipsizeMode="tail"
                                                    numberOfLines={1}
                                                    style={styles.areaText}
                                                />
                                                <Image
                                                    source={Assets.blackArrowRight}
                                                    style={styles.nextArrowImage}
                                                    resizeMode="contain"
                                                />
                                            </TouchableOpacity>
                                        )}

                                        {/* Gray separator line */}
                                        <View style={styles.graySeparator} />

                                        {/* Price Range */}
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            textAlign="left"
                                            text={PRICE_RANGE}
                                            color={BLACK}
                                            style={styles.headerName}
                                        />

                                        {/* Min Price */}
                                        <LabeledDropdown
                                            label={MIN_PRICE}
                                            dropdownValue={minPrice}
                                            onPress={onPressMinPriceField}
                                            style={styles.fieldViewCls}
                                        />

                                        {/* Max Price */}
                                        <LabeledDropdown
                                            label={MAX_PRICE}
                                            dropdownValue={maxPrice}
                                            onPress={onPressMaxPriceField}
                                            style={styles.fieldViewCls}
                                        />

                                        {/* Gray separator line */}
                                        <View style={styles.graySeparator} />

                                        {/* Size Range */}
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            textAlign="left"
                                            text={SIZE_RANGE}
                                            color={BLACK}
                                            style={styles.headerName}
                                        />

                                        {/* Min Size */}
                                        <LabeledDropdown
                                            label={MIN_RANGE}
                                            dropdownValue={minSize}
                                            onPress={onPressMinSizeField}
                                            style={styles.fieldViewCls}
                                        />

                                        {/* Max Size */}
                                        <LabeledDropdown
                                            label={MAX_RANGE}
                                            dropdownValue={maxSize}
                                            onPress={onPressMaxSizeField}
                                            style={styles.fieldViewCls}
                                        />

                                        {/* Gray separator line */}
                                        <View style={styles.graySeparator} />

                                        {/* Preferred Developer */}
                                        {developerData && (
                                            <>
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={18}
                                                    fontWeight="600"
                                                    textAlign="left"
                                                    text={PREFERED_DEVELOPER}
                                                    color={BLACK}
                                                    style={styles.headerName}
                                                />

                                                <TouchableOpacity
                                                    style={styles.areaContainer}
                                                    onPress={onPressDeveloperField}
                                                    activeOpacity={0.7}
                                                >
                                                    <Typo
                                                        fontSize={14}
                                                        lineHeight={18}
                                                        fontWeight="600"
                                                        textAlign="left"
                                                        text={developer}
                                                        ellipsizeMode="tail"
                                                        numberOfLines={1}
                                                        style={styles.areaText}
                                                    />
                                                    <Image
                                                        source={Assets.blackArrowRight}
                                                        style={styles.nextArrowImage}
                                                        resizeMode="contain"
                                                    />
                                                </TouchableOpacity>

                                                {/* Gray separator line */}
                                                <View style={styles.graySeparator} />
                                            </>
                                        )}

                                        {/* Rooms & Carparks */}
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            textAlign="left"
                                            text="Rooms & Carparks"
                                            color={BLACK}
                                            style={styles.headerName}
                                        />

                                        <View style={styles.ownershipDataContainer}>
                                            <RoomsCarparksRow
                                                label={BEDROOMS_CAM}
                                                type={BEDROOMS}
                                                onPressPlus={onRoomCarparkPlus}
                                                onPressMinus={onRoomCarparkMinus}
                                                value={bedrooms}
                                            />
                                            <RoomsCarparksRow
                                                label={BATHROOMS_CAM}
                                                type={BATHROOMS}
                                                onPressPlus={onRoomCarparkPlus}
                                                onPressMinus={onRoomCarparkMinus}
                                                value={bathrooms}
                                            />
                                            <RoomsCarparksRow
                                                label={CARPARKS_CAM}
                                                type={CARPARKS}
                                                onPressPlus={onRoomCarparkPlus}
                                                onPressMinus={onRoomCarparkMinus}
                                                value={carparks}
                                            />
                                        </View>

                                        {/* Gray separator line */}
                                        <View style={styles.graySeparator} />

                                        {/* Property Type */}
                                        {propertyTypeListData && (
                                            <>
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={18}
                                                    fontWeight="600"
                                                    textAlign="left"
                                                    text={PROPERTY_TYPE}
                                                    color={BLACK}
                                                    style={styles.headerName}
                                                />

                                                <View style={styles.ownershipDataContainer}>
                                                    {/* PropertyType List */}
                                                    <FlatList
                                                        data={propertyTypeListData}
                                                        extraData={propertyTypesRefresh}
                                                        renderItem={renderItemPropertyType}
                                                        keyExtractor={keyExtractor}
                                                    />

                                                    <Typo
                                                        fontSize={14}
                                                        lineHeight={22}
                                                        textAlign="left"
                                                        style={styles.textUnderline}
                                                        text={
                                                            isShowAllPropertyTypes
                                                                ? SEE_LESS
                                                                : SHOW_MORE_PROPERTY_TYPE
                                                        }
                                                        onPress={onPressShowAllPropertyTypes}
                                                    />
                                                </View>

                                                {/* Gray separator line */}
                                                <View style={styles.graySeparator} />
                                            </>
                                        )}

                                        {/* Ownership */}
                                        {ownershipData && (
                                            <>
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={18}
                                                    fontWeight="600"
                                                    textAlign="left"
                                                    text={OWNERSHIP}
                                                    color={BLACK}
                                                    style={styles.headerName}
                                                />
                                                <View style={styles.ownershipDataContainer}>
                                                    <FlatList
                                                        data={ownershipData}
                                                        extraData={ownershipRefresh}
                                                        renderItem={renderItemOwnershipData}
                                                        keyExtractor={keyExtractor}
                                                    />
                                                </View>
                                            </>
                                        )}
                                    </>
                                )}
                            </View>
                        </ScrollView>

                        {/* Bottom docked button container */}
                        {!loading && (
                            <FixedActionContainer>
                                <View style={styles.bottomContainer}>
                                    {/* Clear Filters button */}
                                    <ActionButton
                                        width={btnWidth}
                                        backgroundColor={WHITE}
                                        borderStyle="solid"
                                        borderWidth={1}
                                        borderColor={GREY}
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text={CLEAR_FLITERS}
                                            />
                                        }
                                        onPress={onPressClearFiler}
                                    />

                                    {/* Apply Filters button */}
                                    <ActionButton
                                        width={btnWidth}
                                        backgroundColor={YELLOW}
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text={APPLY_FILTERS}
                                            />
                                        }
                                        onPress={onPressApplyFilters}
                                    />
                                </View>
                            </FixedActionContainer>
                        )}
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>

            {/* States Picker */}
            {stateData && (
                <ScrollPickerView
                    showMenu={statePicker}
                    list={stateData}
                    selectedIndex={stateScrollPickerSelectedIndex ?? 0}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* Min Price Picker */}
            {minPriceData && (
                <ScrollPickerView
                    showMenu={minPricePicker}
                    list={minPriceData}
                    selectedIndex={minPriceScrollPickerSelectedIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* Max Price Picker */}
            {maxPriceData && (
                <ScrollPickerView
                    showMenu={maxPricePicker}
                    list={maxPriceData}
                    selectedIndex={maxPriceScrollPickerSelectedIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* Min Size Picker */}
            {minSizeData && (
                <ScrollPickerView
                    showMenu={minSizePicker}
                    list={minSizeData}
                    selectedIndex={minSizeScrollPickerSelectedIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* Max Size Picker */}
            {maxSizeData && (
                <ScrollPickerView
                    showMenu={maxSizePicker}
                    list={maxSizeData}
                    selectedIndex={maxSizeScrollPickerSelectedIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}
        </>
    );
}

PropertyFilterScreen.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    areaContainer: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderColor: GREY,
        borderRadius: 25,
        borderStyle: "solid",
        borderWidth: 1,
        flexDirection: "row",
        height: 50,
        marginTop: 8,
        paddingHorizontal: 24,
        paddingVertical: 10,
    },
    areaText: {
        flex: 1,
    },
    bottomContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    containerCls: {
        marginBottom: 24,
        paddingHorizontal: 36,
    },
    fieldViewCls: {
        marginTop: 25,
    },
    graySeparator: {
        borderColor: SWITCH_GREY,
        borderTopWidth: 1,
        flex: 1,
        height: 1,
        marginVertical: 24,
    },
    headerName: {},
    nextArrowImage: {
        height: 15,
        marginLeft: 10,
        width: 15,
    },
    ownershipDataContainer: {
        marginBottom: 17,
        marginTop: 7,
    },
    textUnderline: {
        color: BLACK,
        height: 25,
        marginTop: 25,
        textDecorationLine: "underline",
    },
});

export default PropertyFilterScreen;
