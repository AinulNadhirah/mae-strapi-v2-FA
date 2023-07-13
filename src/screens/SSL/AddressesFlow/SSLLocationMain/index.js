import AsyncStorage from "@react-native-community/async-storage";
import { useNavigation, useRoute } from "@react-navigation/core";
import _ from "lodash";
import React, { useCallback, useState, useRef, useEffect } from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
    ScrollView,
    RefreshControl,
} from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import {
    LocationFlatListItem,
    AddressHomeFlatListItem,
    AddressWorkFlatListItem,
    AddressFlatListItem,
} from "@components/SSL/AddressComponents";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext, useModelController } from "@context";

import { GeocoderAddress, getSSLAddress } from "@services";

import { BLACK, WHITE, MEDIUM_GREY, LIGHT_GREY } from "@constants/colors";
import { LOCATION_NOT_AVAILABLE } from "@constants/stringsSSL";

import {
    delyvaReverseGeoResultToAddrFormat,
    massageAddressFormat,
} from "@utils/dataModel/utilitySSLGeolocation";
import { useIsFocusedIncludingMount, usePrevious } from "@utils/hooks";

import SSLStyles from "@styles/SSLStyles";

import assets from "@assets";

function SSLLocationMain() {
    const navigation = useNavigation();
    const route = useRoute();
    const { params } = route;
    const { updateModel, getModel } = useModelController();
    const latitude = useRef(getModel("location").latitude);
    const longitude = useRef(getModel("location").longitude);

    const { locationHistoryArrV1, currSelectedLocationV1, geolocationUrl } = getModel("ssl");
    const prevlocationHistoryArrV1 = usePrevious(locationHistoryArrV1);
    // console.log("locationHistoryArrV1", locationHistoryArrV1);

    const [isLoading, setIsLoading] = useState(true);
    const [currLocation, setCurrLocation] = useState({});
    const [homeAddress, setHomeAddress] = useState({});
    const [workAddress, setWorkAddress] = useState({});

    /** UI - History */
    // Set user's current location
    function updateCurrentLocation(item) {
        AsyncStorage.setItem("currSelectedLocationV1", JSON.stringify(item));
        updateModel({
            ssl: {
                currSelectedLocationV1: item,
            },
        });
    }

    // Add selected address / location into history array
    function locationHistoryAdd(location) {
        const temp = [...locationHistoryArrV1];
        location && temp.unshift(location);

        updateModel({
            ssl: {
                locationHistoryArrV1: temp.slice(0, 10),
            },
        });
        AsyncStorage.setItem("locationHistoryArrV1", JSON.stringify(temp.slice(0, 10)));
    }

    // Remove duplicate for locationHistoryArrV1
    useEffect(() => {
        if (_.isEqual(prevlocationHistoryArrV1, locationHistoryArrV1)) return;
        let tempHistoryArr = [...locationHistoryArrV1];
        tempHistoryArr = tempHistoryArr.filter((item, index) => {
            if (item.home || item.work) return false; // We don't keep Home & Work on history. (they're always on screen)
            const _address = JSON.stringify(item);
            return (
                index ===
                tempHistoryArr.findIndex((obj) => {
                    return JSON.stringify(obj) === _address;
                })
            );
        });
        updateModel({
            ssl: {
                locationHistoryArrV1: tempHistoryArr.slice(0, 10), // Keep last 10
            },
        });
        AsyncStorage.setItem("locationHistoryArrV1", JSON.stringify(tempHistoryArr.slice(0, 10)));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locationHistoryArrV1]);

    // On press Location item -> Add location
    const onPressLocationBookmark = useCallback(
        (item) => {
            navigation.navigate(navigationConstant.SSL_ADDRESS_ADDEDIT, {
                searchLocationItem: item,
                entryPoint: navigationConstant.SSL_LOCATION_MAIN,
            });
        },
        [navigation]
    );

    // On press Address item -> Edit address
    function onPressRightArrowAddress(item) {
        navigation.navigate(navigationConstant.SSL_ADDRESS_ADDEDIT, {
            item,
            entryPoint: navigationConstant.SSL_LOCATION_MAIN,
        });
    }

    /** UI - Addressbook */
    const onPressAddressbook = useCallback(async () => {
        console.log("SSLLocationMain onPressAddressbook");
        navigation.navigate(navigationConstant.SSL_ADDRESS_LIST, {
            entryPoint: navigationConstant.SSL_LOCATION_MAIN,
        });
    }, [navigation]);

    /**
     * addresslist select come back, set Context and goBack()
     * add new address (same with edit Home/work) on done setContext and goBack()
     */
    const getAddressList = useCallback(async () => {
        try {
            const response = await getSSLAddress();
            let maeAddresses = response?.data?.result?.addresses ?? [];
            maeAddresses = massageAddressFormat(maeAddresses);

            maeAddresses.forEach(function (address) {
                if (address.home) {
                    setHomeAddress(address);
                } else if (address.work) {
                    setWorkAddress(address);
                }
            });

            // Sync location history context with latest API value for Mae Address
            console.log("delyva_maeAddresses locationHistoryArrV1", locationHistoryArrV1);
            let delyva_maeAddresses = [...locationHistoryArrV1];
            delyva_maeAddresses = delyva_maeAddresses.map((delyva_maeAddr) => {
                let temp = delyva_maeAddr;
                maeAddresses.forEach((maeAddr) => {
                    if (delyva_maeAddr.addressType === 3 && delyva_maeAddr.id === maeAddr.id) {
                        temp = maeAddr;
                    }
                });
                return temp;
            });

            console.log("delyva_maeAddresses", delyva_maeAddresses);
            updateModel({
                ssl: {
                    locationHistoryArrV1: delyva_maeAddresses,
                },
            });

            if (params?.isGoAddressList) {
                console.log("params?.isGoAddressList", params?.isGoAddressList);
                onPressAddressbook();

                const { setParams } = navigation;
                setParams({ isGoAddressList: false });
            } else if (params?.locationItem) {
                onPressLocationBookmark(params.locationItem);

                const { setParams } = navigation;
                setParams({ locationItem: false });
            }
        } catch (e) {
            showErrorToast({
                message: e.message,
            });
        } finally {
            setIsLoading(false);
        }
    }, [
        locationHistoryArrV1,
        navigation,
        onPressAddressbook,
        onPressLocationBookmark,
        params?.isGoAddressList,
        params?.locationItem,
        updateModel,
    ]);

    const getCurrentLandmark = useCallback(async () => {
        const body = {
            lat: latitude.current,
            lon: longitude.current,
        };
        try {
            let response = await GeocoderAddress({ geolocationUrl, body });
            console.log("GeocoderAddress return response", response);
            response = delyvaReverseGeoResultToAddrFormat(response);
            console.log("setCurrLocation", response);
            setCurrLocation(response);
        } catch (e) {
            console.log("GeocoderAddress error", e);
            // Unable to get current geolocation's landmark
        }
    }, [geolocationUrl]);

    useIsFocusedIncludingMount(() => {
        if (!params?.searchLocationItem && !params?.item) {
            /**
             * Can't refresh list because
             * getAddressList() uses locationHistoryArrV1, but it is stale because
             * the new value is set in updateCurrentLocation(obj) in the code below.
             *
             * We call getAddressList() to update in case user edit any existing addressbook item.
             * Bug will occur if user both: selecting an address AND edit any existing address...
             * - We leave that issue for another day or when redux is implemented
             */
            getAddressList();
        }
        getCurrentLandmark();
    });

    // Callback from Search screen / AddressBook screen, auto dismiss current screen if necessary
    useEffect(() => {
        let obj;
        if (params?.searchLocationItem) {
            console.log("params.searchLocationItem", params?.searchLocationItem);
            obj = params.searchLocationItem;
        } else if (params?.item) {
            console.log("params?.item", params?.item);
            obj = params.item;
        }

        if (obj) {
            updateCurrentLocation(obj);
            locationHistoryAdd(obj);

            if (params?.entryPoint) {
                navigation.navigate(params.entryPoint, {
                    isNewLocationSelectedRefresh: true,
                });
            } else {
                navigation.goBack();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params?.searchLocationItem, params?.item]);

    /** On Screen action (top to bottom) */
    function onCloseTap() {
        navigation.goBack();
    }
    function searchLocationOnPress() {
        let searchPillLbl = "";

        if (currSelectedLocationV1.addressType === 1 || currSelectedLocationV1.addressType === 2) {
            searchPillLbl = currSelectedLocationV1.addressLine1;
        }

        navigation.navigate(navigationConstant.SSL_ADDERESS_N_LOCATION_SEARCH, {
            entryPoint: navigationConstant.SSL_LOCATION_MAIN,
            locationString: searchPillLbl,
        });
    }
    function onPressUseCurrentLocation() {
        if (!currLocation?.addressLine1) return;
        updateCurrentLocation(currLocation);
        locationHistoryAdd(currLocation);
        if (params?.entryPoint) {
            navigation.navigate(params.entryPoint, {
                isNewLocationSelectedRefresh: true,
            });
        } else {
            navigation.goBack();
        }
    }

    // Home, Work, History Address Item
    function onPressHome(item) {
        if (_.isEmpty(item)) {
            navigation.navigate(navigationConstant.SSL_ADDRESS_ADDEDIT, {
                entryPoint: navigationConstant.SSL_LOCATION_MAIN,
                isHomeSelected: true,
            });
            return;
        }
        onPressAddress(item);
    }
    function onPressWork(item) {
        if (_.isEmpty(item)) {
            navigation.navigate(navigationConstant.SSL_ADDRESS_ADDEDIT, {
                entryPoint: navigationConstant.SSL_LOCATION_MAIN,
                isWorkSelected: true,
            });
            return;
        }
        onPressAddress(item);
    }
    function onPressAddress(item) {
        if (_.isEmpty(item)) {
            addNewAddress();
            return;
        }

        updateCurrentLocation(item);
        locationHistoryAdd(item);
        if (params?.entryPoint) {
            navigation.navigate(params.entryPoint, {
                isNewLocationSelectedRefresh: true,
            });
        } else {
            navigation.goBack();
        }
    }
    function addNewAddress() {
        navigation.navigate(navigationConstant.SSL_ADDRESS_ADDEDIT, {
            entryPoint: navigationConstant.SSL_LOCATION_MAIN,
        });
    }

    // History Location item
    function onPressLocation(item) {
        updateCurrentLocation(item);
        locationHistoryAdd(item);
        if (params?.entryPoint) {
            navigation.navigate(params.entryPoint, {
                isNewLocationSelectedRefresh: true,
            });
        } else {
            navigation.goBack();
        }
    }

    let searchPillLbl = "Search Location";
    if (currSelectedLocationV1?.addressType === 1 || currSelectedLocationV1?.addressType === 2) {
        searchPillLbl = currSelectedLocationV1.addressLine1;
    }

    let currentLocationLbl = LOCATION_NOT_AVAILABLE;
    if (currLocation?.addressLine1) {
        currentLocationLbl = `${currLocation.addressLine1}`;
    }

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={isLoading}
        >
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onCloseTap} />}
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                color={BLACK}
                                lineHeight={19}
                                text="Your Location"
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
                <TouchableWithoutFeedback
                    onPressIn={searchLocationOnPress}
                    style={styles.dummySearch}
                >
                    <View style={[styles.textView, SSLStyles.pillShadow]}>
                        <View style={styles.inputIconContainer}>
                            <Image source={assets.blackPin} style={styles.inputIcon} />
                        </View>
                        <Typo
                            style={styles.textinput}
                            text={searchPillLbl}
                            fontSize={14}
                            textAlign="left"
                            textAlignVertical="center"
                            numberOfLines={2}
                            color={BLACK}
                            lineHeight={16}
                            letterSpacing={0}
                        />
                    </View>
                </TouchableWithoutFeedback>
                <ScrollView
                    refreshControl={
                        <RefreshControl refreshing={false} onRefresh={getAddressList} />
                    }
                >
                    {currentLocationLbl !== LOCATION_NOT_AVAILABLE && (
                        <TouchableOpacity
                            style={styles.currentLocationContainer}
                            onPress={onPressUseCurrentLocation}
                        >
                            <View style={styles.currentLocationContainerTwoLine}>
                                <Typo
                                    fontSize={16}
                                    color={BLACK}
                                    lineHeight={18}
                                    text="Use Current Location"
                                    fontWeight="semi-bold"
                                />
                                <View style={styles.heightPadding} />
                                <Typo
                                    fontSize={12}
                                    color={BLACK}
                                    lineHeight={18}
                                    textAlign="left"
                                    text={currentLocationLbl}
                                />
                            </View>
                            <Image source={assets.black_target} style={styles.blackTarget} />
                        </TouchableOpacity>
                    )}

                    <View style={styles.addressBookContainer}>
                        <TouchableOpacity
                            style={styles.addressBookViewAllContainer}
                            onPress={onPressAddressbook}
                        >
                            <View style={styles.addressBookViewAllLbl}>
                                <Typo
                                    fontSize={16}
                                    color={BLACK}
                                    lineHeight={18}
                                    text="Address Book"
                                    fontWeight="semi-bold"
                                />
                                <View style={styles.heightPadding} />
                                <Typo
                                    fontSize={12}
                                    color={BLACK}
                                    lineHeight={18}
                                    text="Select from your saved addresses"
                                />
                            </View>
                            <Image source={assets.SSL_arrow_right} style={styles.arrowRight} />
                        </TouchableOpacity>

                        <AddressHomeFlatListItem
                            onPress={onPressHome}
                            onPressRightArrow={onPressRightArrowAddress}
                            item={homeAddress}
                        />
                        <AddressWorkFlatListItem
                            onPress={onPressWork}
                            onPressRightArrow={onPressRightArrowAddress}
                            item={workAddress}
                        />
                        <TouchableOpacity onPress={addNewAddress}>
                            <View style={styles.addNewAddressContainer}>
                                <Image source={assets.SSL_black_add} style={styles.addIcon} />
                                <View style={styles.addNewAddressLbl}>
                                    <Typo
                                        fontWeight="semi-bold"
                                        fontSize={14}
                                        textAlign="left"
                                        text="Add new address"
                                    />
                                </View>
                            </View>

                            <View style={styles.separator} />
                        </TouchableOpacity>
                    </View>

                    {locationHistoryArrV1.map((address, index) => {
                        if (address.addressType === 3) {
                            return (
                                <AddressFlatListItem
                                    key={`${address.id}_${index}`}
                                    onPress={onPressAddress}
                                    onPressRightArrow={onPressRightArrowAddress}
                                    item={address}
                                    rightIcon={assets.iconBlackEdit}
                                />
                            );
                        } else {
                            return (
                                <LocationFlatListItem
                                    key={`${address.id}_${index}`}
                                    onPress={onPressLocation}
                                    item={address}
                                    onPressLocationBookmark={onPressLocationBookmark}
                                    isShowBookmark={true}
                                />
                            );
                        }
                    })}
                </ScrollView>
            </ScreenLayout>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    addIcon: {
        height: 24,
        width: 24,
    },
    addNewAddressContainer: {
        alignItems: "center",
        flexDirection: "row",
        height: 73,
        paddingLeft: 24,
        paddingRight: 26,
    },
    addNewAddressLbl: { flex: 1, marginHorizontal: 15 },
    addressBookContainer: { backgroundColor: WHITE, marginBottom: 8 },
    addressBookViewAllContainer: {
        alignItems: "center",
        backgroundColor: WHITE,
        flexDirection: "row",
        height: 80,
        paddingHorizontal: 24,
    },
    addressBookViewAllLbl: { alignItems: "flex-start", flex: 1 },
    arrowRight: { height: 24, width: 24 },
    blackTarget: { height: 24, width: 24 },
    currentLocationContainer: {
        alignItems: "center",
        backgroundColor: WHITE,
        flexDirection: "row",
        height: 80,
        marginBottom: 8,
        paddingHorizontal: 24,
    },
    currentLocationContainerTwoLine: { alignItems: "flex-start", flex: 1 },
    dummySearch: { paddingHorizontal: 24 },
    heightPadding: { height: 4 },
    inputIcon: { height: "100%", width: "100%" },
    inputIconContainer: {
        height: 22,
        left: 22,
        position: "absolute",
        width: 22,
    },
    separator: {
        backgroundColor: LIGHT_GREY,
        height: 1,
        marginHorizontal: 24,
    },
    textView: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 24,
        flexDirection: "row",
        height: 48,
        justifyContent: "flex-start",
        marginBottom: 16,
        marginTop: 8,
        position: "relative",
        width: "100%",
    },
    textinput: {
        paddingLeft: 60,
        paddingRight: 10,
    },
});

export default withModelContext(SSLLocationMain);
