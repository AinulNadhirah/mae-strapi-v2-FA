import { useNavigation, useRoute } from "@react-navigation/core";
import throttle from "lodash.throttle";
import PropTypes from "prop-types";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { StyleSheet, View, Image, TextInput, FlatList, TouchableOpacity } from "react-native";

import {
    FNB_TAB_SCREEN,
    SSL_ADDERESS_N_LOCATION_SEARCH,
    SSL_ADDRESS_ADDEDIT,
    SSL_LOCATION_MAIN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import { LocationFlatListItem } from "@components/SSL/AddressComponents";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext, useModelController } from "@context";

import { GeocoderPlaces } from "@services";

import { BLACK, MEDIUM_GREY, WHITE, LIGHT_GREY } from "@constants/colors";

import { delyvaSearchResultToAddrFormat } from "@utils/dataModel/utilitySSLGeolocation";

import SSLStyles from "@styles/SSLStyles";

import assets from "@assets";

function SSLAddressNLocationSearch() {
    const navigation = useNavigation();
    const route = useRoute();
    const { params } = route;
    const { getModel } = useModelController();
    const latitude = useRef(getModel("location").latitude);
    const longitude = useRef(getModel("location").longitude);
    const { geolocationUrl } = getModel("ssl");
    const [locationString, setLocationString] = useState(params?.locationString ?? "");
    const [locationData, setLocationData] = useState([]);
    const isShowBookmark = params?.entryPoint !== FNB_TAB_SCREEN;

    async function fetchApi(str) {
        try {
            let places;
            if (latitude.current && longitude.current) {
                const latLong = `${latitude.current},${longitude.current}`;
                places = await GeocoderPlaces({
                    geolocationUrl,
                    locationString: str,
                    latLong,
                });
            } else {
                places = await GeocoderPlaces({
                    geolocationUrl,
                    locationString: str,
                });
            }

            places = delyvaSearchResultToAddrFormat(places?.data);
            setLocationData(places);
        } catch (e) {
            showErrorToast({
                message: e.message,
            });
        }
    }

    const callApi = useCallback((str) => {
        if (str.length < 3) {
            setLocationData([]);
            return;
        }

        console.log(str);
        fetchApi(str);
    }, []);
    const throttled = useRef(throttle((str) => callApi(str), 1000));

    useEffect(() => throttled.current(locationString), [locationString]);

    function onPressClearSearchTF() {
        setLocationString("");
    }

    function onPressItem(item) {
        console.log("onPress", item);
        if (params?.entryPoint === SSL_LOCATION_MAIN) {
            navigation.navigate(SSL_LOCATION_MAIN, { searchLocationItem: item });
        } else if (params?.entryPoint === FNB_TAB_SCREEN) {
            navigation.navigate(FNB_TAB_SCREEN, { searchLocationItem: item });
        } else {
            navigation.navigate(SSL_ADDRESS_ADDEDIT, { searchLocationItem: item });
        }
    }
    function onPressItemBookmark(item) {
        if (params?.entryPoint === SSL_LOCATION_MAIN) {
            navigation.navigate(SSL_ADDRESS_ADDEDIT, {
                entryPoint: SSL_ADDERESS_N_LOCATION_SEARCH,
                searchLocationItem: item,
            });
        } else if (params?.entryPoint === FNB_TAB_SCREEN) {
            // Bookmark is hidden, won't hit this
        } else {
            navigation.navigate(SSL_ADDRESS_ADDEDIT, { searchLocationItem: item });
        }
    }

    function renderSeparator() {
        return <View style={styles.separator} />;
    }
    function renderItems({ item, index }) {
        return (
            <LocationFlatListItem
                iconLeftSource={assets.blackPin}
                key={`${item.id}_${index}`}
                onPress={onPressItem}
                item={item}
                onPressLocationBookmark={onPressItemBookmark}
                isShowBookmark={isShowBookmark}
            />
        );
    }
    renderItems.propTypes = {
        item: PropTypes.object,
        index: PropTypes.number,
    };

    function onCloseTap() {
        navigation.goBack();
    }

    function keyExtractor(item, index) {
        return item.id ? `${item.id}` : `${index}`;
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
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
                                text="Search Location"
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
                <View style={styles.containerPadding}>
                    <View style={[styles.textView, SSLStyles.pillShadow]}>
                        <View style={styles.inputIconContainer}>
                            <Image
                                source={assets.magnifyingGlassDisable}
                                style={styles.inputIcon}
                            />
                        </View>
                        <TextInput
                            autoFocus
                            style={styles.textinput}
                            placeholder="Enter location"
                            onChangeText={setLocationString}
                            value={locationString}
                            autoCorrect={false}
                        />
                        {!!locationString && (
                            <TouchableOpacity
                                style={styles.clearBtnContainer}
                                onPress={onPressClearSearchTF}
                            >
                                <Image source={assets.icCloseBlack} style={styles.clearBtn} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <FlatList
                    data={locationData}
                    renderItem={renderItems}
                    keyExtractor={keyExtractor}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={renderSeparator}
                    // contentContainerStyle={styles.content}
                />
            </ScreenLayout>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    clearBtn: {
        height: 20,
        width: 20,
    },
    clearBtnContainer: {
        height: 20,
        position: "absolute",
        right: 22,
        width: 20,
    },
    containerPadding: { paddingHorizontal: 24 },
    inputIcon: { height: "100%", width: "100%" },

    inputIconContainer: {
        height: 22,
        left: 22,
        position: "absolute",
        width: 22,
    },
    separator: { backgroundColor: LIGHT_GREY, height: 1, marginHorizontal: 24 },
    textView: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 24,
        flexDirection: "row",
        height: 48,
        justifyContent: "flex-start",
        marginBottom: 8,
        marginTop: 8,
        position: "relative",
        width: "100%",
    },
    textinput: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 18,
        letterSpacing: 0,
        lineHeight: 24,
        paddingLeft: 60,
        paddingRight: 50,
        width: "100%",
    },
});

export default withModelContext(SSLAddressNLocationSearch);
