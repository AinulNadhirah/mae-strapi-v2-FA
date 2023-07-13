import AsyncStorage from "@react-native-community/async-storage";
import { useNavigation, useRoute } from "@react-navigation/core";
import _ from "lodash";
import PropTypes from "prop-types";
import React, { useCallback, useState } from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    RefreshControl,
} from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton.js";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import { BottomDissolveCover, dissolveStyle } from "@components/SSL/BottomDissolveCover.js";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext, useModelController } from "@context";

import { deleteSSLAddress, GeocoderAddress, getSSLAddress, getSSLAddressSingle } from "@services";

import { BLACK, MEDIUM_GREY, ROYAL_BLUE, YELLOW } from "@constants/colors";
import { REMOVE_ADDRESS } from "@constants/stringsSSL";

import { SSLUserContacteNoClass, SSLDetermineDefaultLocation } from "@utils/dataModel/utilitySSL";
import {
    delyvaReverseGeoResultToAddrFormat,
    massageAddressFormat,
} from "@utils/dataModel/utilitySSLGeolocation";
import { useIsFocusedIncludingMount } from "@utils/hooks";

const { width } = Dimensions.get("window");

function SSLAddressView() {
    const navigation = useNavigation();
    const route = useRoute();
    const { updateModel, getModel } = useModelController();
    const { currSelectedLocationV1, geolocationUrl } = getModel("ssl");
    const location = getModel("location");

    const [item, setItem] = useState(route.params?.item ?? {});

    const getAddressList = useCallback(async () => {
        try {
            const response = await getSSLAddressSingle(item?.id);
            let addresses = response?.data?.result?.addresses ?? [];
            addresses = massageAddressFormat(addresses);
            addresses.forEach((obj) => {
                if (obj.id === item?.id) {
                    setItem(obj);
                }
            });
        } catch (e) {
            showErrorToast({
                message: e.message,
            });
        }
    }, [item?.id]);

    const init = useCallback(async () => {
        getAddressList();
    }, [getAddressList]);

    useIsFocusedIncludingMount(() => {
        init();
    });

    function onCloseTap() {
        navigation.goBack();
    }

    // Popup related
    // Limited function, Currently cater for 1 "Got it" action button, onClick dismisses popup
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    function popupOnClose() {
        setIsPopupVisible(false);
    }
    function showPopup() {
        setIsPopupVisible(true);
    }
    function popupOnConfirm() {
        deleteAddress();
        setIsPopupVisible(false);
    }

    function onPressEdit() {
        console.log("show addr item: ", item);
        navigation.navigate(navigationConstant.SSL_ADDRESS_ADDEDIT, { item });
    }

    const deleteAddress = useCallback(async () => {
        console.log("deleteAddress", currSelectedLocationV1);
        /**
         * If user delete address that he's currently selected,
         * we need to re-assign their current location
         * */

        // Type 3 - addressbook address, id - all record in addressbook has id
        if (currSelectedLocationV1.addressType === 3 && item?.id === currSelectedLocationV1.id) {
            const defaultLocation = await SSLDetermineDefaultLocation({
                getSSLAddress,
                blackListedAddressId: item?.id,
                deviceLocation: location,
                massageAddressFormat,
                currSelectedLocationV1,
                geolocationUrl,
                GeocoderAddress,
                delyvaReverseGeoResultToAddrFormat,
            });

            if (!_.isEmpty(defaultLocation)) {
                AsyncStorage.setItem("currSelectedLocationV1", JSON.stringify(defaultLocation));
                updateModel({
                    ssl: {
                        currSelectedLocationV1: defaultLocation,
                    },
                });
            }
        }

        try {
            await deleteSSLAddress(item?.id);
            navigation.goBack();
        } catch (e) {
            showErrorToast({
                message: e.message,
            });
        }
    }, [currSelectedLocationV1, geolocationUrl, item?.id, location, navigation, updateModel]);

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
                                text="Details"
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
                    contentContainerStyle={styles.containerPadding}
                    refreshControl={<RefreshControl refreshing={false} onRefresh={init} />}
                >
                    <View style={styles.containerTitle}>
                        <Typo
                            fontSize={20}
                            fontWeight="bold"
                            color={BLACK}
                            textAlign="left"
                            lineHeight={25}
                            text={item.name}
                        />
                    </View>
                    <LabelValueAddress
                        label="Address"
                        value={`${item.addressLine1}\n${item.postcode} ${item.city}\n${item.state}`}
                    />
                    <LabelValue label="Additional Address Details" value={item?.unitNo ?? "-"} />
                    <LabelValue label="Recipient Name" value={item.recipientName} />
                    <LabelValue
                        label="Contact Number"
                        value={SSLUserContacteNoClass(item.contactNo).inFullDisplayFormat()}
                    />
                    <LabelValue label="Email" value={item.email} />
                    <LabelValue label="Note to Rider" value={item.note || "-"} />
                    <View style={dissolveStyle.scrollPadding} />
                </ScrollView>
                <View style={dissolveStyle.imageBackground}>
                    <BottomDissolveCover>
                        <View style={styles.centerContainer}>
                            <ActionButton
                                style={{ width: width - 50 }}
                                borderRadius={25}
                                onPress={onPressEdit}
                                borderWidth={1}
                                backgroundColor={YELLOW}
                                componentCenter={
                                    <Typo
                                        text="Edit Details"
                                        fontSize={14}
                                        fontWeight="semi-bold"
                                        lineHeight={18}
                                    />
                                }
                            />
                            <TouchableOpacity style={styles.removeAddress} onPress={showPopup}>
                                <Typo
                                    text="Remove Address"
                                    fontSize={14}
                                    fontWeight="semi-bold"
                                    lineHeight={18}
                                    color={ROYAL_BLUE}
                                />
                            </TouchableOpacity>
                        </View>
                    </BottomDissolveCover>
                </View>
            </ScreenLayout>

            <Popup
                visible={isPopupVisible}
                title={REMOVE_ADDRESS}
                description={`Would you like to remove ${item.name} from your address book?`}
                onClose={popupOnClose}
                primaryAction={{
                    text: "Confirm",
                    onPress: popupOnConfirm,
                }}
                secondaryAction={{
                    text: "Cancel",
                    onPress: popupOnClose,
                }}
            />
        </ScreenContainer>
    );
}

export function LabelValueAddress({ label, value }) {
    return (
        <View>
            <View style={styles.title}>
                <Typo fontWeight="semi-bold" fontSize={14} textAlign="left" text={label} />
            </View>
            <View style={styles.desc}>
                <Typo
                    fontWeight="normal"
                    fontSize={14}
                    lineHeight={20}
                    textAlign="left"
                    color={BLACK}
                    text={value}
                />
            </View>
        </View>
    );
}
LabelValueAddress.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
};

export function LabelValue({ label, value }) {
    return (
        <View style={styles.other}>
            <Typo fontWeight="semi-bold" fontSize={14} textAlign="left" text={label} />
            <View style={styles.desc}>
                <Typo
                    fontWeight="normal"
                    fontSize={14}
                    lineHeight={19}
                    textAlign="left"
                    color={BLACK}
                    text={value}
                />
            </View>
        </View>
    );
}
LabelValue.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
};

const styles = StyleSheet.create({
    centerContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    containerPadding: { paddingHorizontal: 24 },
    containerTitle: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    desc: { marginTop: 4 },
    other: {
        marginTop: 24,
    },
    removeAddress: { marginBottom: 28, marginTop: 14, padding: 10 },
    title: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 12,
    },
});

export default withModelContext(SSLAddressView);
