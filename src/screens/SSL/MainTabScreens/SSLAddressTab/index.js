import { useNavigation } from "@react-navigation/core";
import React, { useCallback, useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import {
    AddNewAddressBtn,
    AddressFlatListItem,
    AddressHomeFlatListItem,
    AddressWorkFlatListItem,
} from "@components/SSL/AddressComponents";
import { dissolveStyle, BottomDissolveCover } from "@components/SSL/BottomDissolveCover.js";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { getSSLAddress } from "@services";

import { massageAddressFormat } from "@utils/dataModel/utilitySSLGeolocation";
import { useIsFocusedIncludingMount } from "@utils/hooks";

function SSLAddressTab() {
    const navigation = useNavigation();
    const [homeAddress, setHomeAddress] = useState({});
    const [workAddress, setWorkAddress] = useState({});
    const [otherAddresses, setOtherAddresses] = useState([]);

    const getAddressList = useCallback(async () => {
        try {
            const response = await getSSLAddress();
            let addresses = response?.data?.result?.addresses ?? [];
            addresses = massageAddressFormat(addresses);

            setHomeAddress(addresses.find((address) => address.home) ?? {});
            setWorkAddress(addresses.find((address) => address.work) ?? {});
            const otherAddr = addresses.filter(function (address) {
                if (address.home || address.work) {
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
            navigation.navigate(navigationConstant.SSL_ADDRESS_VIEW, { item });
        } else {
            navigation.navigate(navigationConstant.SSL_ADDRESS_ADDEDIT, { isHomeSelected: true });
        }
    }
    function onPressWork(item) {
        if (item.id) {
            navigation.navigate(navigationConstant.SSL_ADDRESS_VIEW, { item });
        } else {
            navigation.navigate(navigationConstant.SSL_ADDRESS_ADDEDIT, { isWorkSelected: true });
        }
    }

    function onPress(item) {
        navigation.navigate(navigationConstant.SSL_ADDRESS_VIEW, { item });
    }

    function onPressAddNewBtn(item) {
        navigation.navigate(navigationConstant.SSL_ADDRESS_ADDEDIT, { item });
    }

    return (
        <View style={styles.container}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={false} onRefresh={getAddressList} />}
            >
                <AddressHomeFlatListItem
                    onPress={onPressHome}
                    item={homeAddress}
                    onPressRightArrow={onPressHome}
                />
                <AddressWorkFlatListItem
                    onPress={onPressWork}
                    item={workAddress}
                    onPressRightArrow={onPressWork}
                />

                {otherAddresses?.map((address) => {
                    return (
                        <AddressFlatListItem
                            key={address.id}
                            onPress={onPress}
                            onPressRightArrow={onPress}
                            item={address}
                        />
                    );
                })}
                <View style={dissolveStyle.scrollPadding} />
            </ScrollView>
            <View style={dissolveStyle.imageBackground}>
                <BottomDissolveCover>
                    <View style={styles.centerContainer}>
                        <AddNewAddressBtn onPress={onPressAddNewBtn} title="Add New Address" />
                    </View>
                </BottomDissolveCover>
            </View>
        </View>
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

export default withModelContext(SSLAddressTab);
