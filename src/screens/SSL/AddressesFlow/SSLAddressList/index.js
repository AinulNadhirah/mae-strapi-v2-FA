import { useNavigation } from "@react-navigation/core";
import { useRoute } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import {
    AddNewAddressBtn,
    AddressFlatListItem,
    AddressHomeFlatListItem,
    AddressWorkFlatListItem,
} from "@components/SSL/AddressComponents";
import { dissolveStyle, BottomDissolveCover } from "@components/SSL/BottomDissolveCover.js";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { getSSLAddress } from "@services";

import { BLACK, MEDIUM_GREY } from "@constants/colors";

import { massageAddressFormat } from "@utils/dataModel/utilitySSLGeolocation";
import { useIsFocusedIncludingMount } from "@utils/hooks";

import assets from "@assets";

function SSLAddressList() {
    const navigation = useNavigation();
    const route = useRoute();
    const { params } = route;
    const [homeAddress, setHomeAddress] = useState({});
    const [workAddress, setWorkAddress] = useState({});
    const [otherAddresses, setOtherAddresses] = useState([]);

    const getAddressList = useCallback(async () => {
        try {
            const response = await getSSLAddress();
            let addresses = response?.data?.result?.addresses ?? [];
            addresses = massageAddressFormat(addresses);

            const otherAddr = addresses.filter(function (address) {
                if (address.home) {
                    setHomeAddress(address);
                    return false;
                } else if (address.work) {
                    setWorkAddress(address);
                    return false;
                }
                return true;
            });
            setOtherAddresses(otherAddr);
        } catch (e) {
            showErrorToast({
                message: e.message,
            });
        }
    }, []);

    useIsFocusedIncludingMount(() => {
        getAddressList();
    });

    function onPressHome(item) {
        if (item.id) {
            if (params?.entryPoint) {
                navigation.navigate(params.entryPoint, { item });
            }
        } else {
            navigation.navigate(navigationConstant.SSL_ADDRESS_ADDEDIT, { isHomeSelected: true });
        }
    }
    function onPressWork(item) {
        if (item.id) {
            if (params?.entryPoint) {
                navigation.navigate(params.entryPoint, { item });
            }
        } else {
            navigation.navigate(navigationConstant.SSL_ADDRESS_ADDEDIT, { isWorkSelected: true });
        }
    }
    function onPress(item) {
        if (params?.entryPoint) {
            navigation.navigate(params.entryPoint, { item });
        }
    }

    function onPressRightArrow(item) {
        navigation.navigate(navigationConstant.SSL_ADDRESS_VIEW, { item });
    }

    function onCloseTap() {
        navigation.goBack();
    }

    function onPressAddNewBtn(item) {
        navigation.navigate(navigationConstant.SSL_ADDRESS_ADDEDIT, { item });
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
                                text="Your Addresses"
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
                <View style={styles.container}>
                    <ScrollView
                        refreshControl={
                            <RefreshControl refreshing={false} onRefresh={getAddressList} />
                        }
                    >
                        <AddressHomeFlatListItem
                            onPress={onPressHome}
                            onPressRightArrow={onPressRightArrow}
                            item={homeAddress}
                        />
                        <AddressWorkFlatListItem
                            onPress={onPressWork}
                            onPressRightArrow={onPressRightArrow}
                            item={workAddress}
                        />

                        {otherAddresses?.map((address) => {
                            return (
                                <AddressFlatListItem
                                    key={address.id}
                                    onPress={onPress}
                                    onPressRightArrow={onPressRightArrow}
                                    item={address}
                                    rightIcon={assets.icChevronRight24Black}
                                />
                            );
                        })}
                        <View style={dissolveStyle.scrollPadding} />
                    </ScrollView>
                    <View style={dissolveStyle.imageBackground}>
                        <BottomDissolveCover>
                            <View style={styles.centerContainer}>
                                <AddNewAddressBtn
                                    onPress={onPressAddNewBtn}
                                    title="Add New Address"
                                />
                            </View>
                        </BottomDissolveCover>
                    </View>
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    centerContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    container: { flex: 1 },
});

export default withModelContext(SSLAddressList);
