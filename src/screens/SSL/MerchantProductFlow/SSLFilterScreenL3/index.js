import { useNavigation, useRoute } from "@react-navigation/core";
import _ from "lodash";
import PropTypes from "prop-types";
import React, { useMemo, useState } from "react";
import { StyleSheet, View, TouchableOpacity, FlatList } from "react-native";

import { SearchInput } from "@screens/SSL/SearchFlow/SSLSearchScreen/SSLSearchScreenComponents";

import { SSL_FILTER_SCREEN_V2 } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import RadioButton from "@components/Buttons/RadioButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import { BottomDissolveCover, dissolveStyle } from "@components/SSL/BottomDissolveCover";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { BLACK, MEDIUM_GREY, SEPARATOR } from "@constants/colors";

import { ApplyFiltersBtn, ClearAllBtn } from "../SSLFilterScreenV2/components";

function SSLFilterScreenL3() {
    const navigation = useNavigation();
    const route = useRoute();
    const [searchString, setSearchString] = useState("");

    const l3Data = useMemo(() => route.params?.L3Data || [], [route.params?.L3Data]); // [{name,count,value}]
    const [selectedL3s, setSelectedL3s] = useState(route.params?.selectedL3s || []); // [11,21]
    const displayData = useMemo(
        () =>
            l3Data
                .filter((obj) =>
                    // 1. show search result (empty string will return all)
                    obj.name.toLowerCase().includes(searchString.toLowerCase())
                )
                .map((obj) => {
                    // 2. map isSelected with selectedL3s
                    obj.isSelected = selectedL3s.includes(obj.value);
                    return obj;
                }),
        [l3Data, searchString, selectedL3s]
    ); // [{value,name,isSelected}]

    function onItemPressed(item) {
        const tempSelectedIds = _.cloneDeep(selectedL3s);
        const index = tempSelectedIds.findIndex((id) => id === item.value);
        index > -1 ? tempSelectedIds.splice(index, 1) : tempSelectedIds.push(item.value);
        setSelectedL3s(tempSelectedIds);
    }
    function onClearAllPress() {
        setSelectedL3s([]);
    }
    function onPressApplyFilters() {
        navigation.navigate({
            name: route.params?.entryPoint || SSL_FILTER_SCREEN_V2,
            params: { newSelectedL3: selectedL3s },

            merge: true,
        });
    }
    function onPressClearSearchTF() {
        setSearchString("");
    }
    function onCloseTap() {
        navigation.goBack();
    }

    function renderItem({ item }) {
        function handlePress() {
            onItemPressed(item);
        }
        return (
            <View>
                <TouchableOpacity item={item} onPress={handlePress} style={styles.itemStyle}>
                    <RadioButton
                        isSquare={true}
                        isSelected={item?.isSelected}
                        title=""
                        onRadioButtonPressed={handlePress}
                    />
                    <Typo
                        style={styles.itemText}
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={24}
                        text={item?.name + (item?.count ? ` (${item?.count})` : "")}
                        textAlign="left"
                    />
                </TouchableOpacity>
                <View style={styles.separator} />
            </View>
        );
    }
    renderItem.propTypes = {
        item: PropTypes.object,
    };
    function keyExtractor(item, index) {
        return `${item?.value}-${index}`;
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
                                text="Categories"
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
                    <View style={styles.containerPadding}>
                        <SearchInput
                            searchString={searchString}
                            setSearchString={setSearchString}
                            onPressClearSearchTF={onPressClearSearchTF}
                            placeholderText="Search Categories"
                        />
                    </View>

                    <FlatList
                        data={displayData}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        showsVerticalScrollIndicator={false}
                    />
                    <View style={dissolveStyle.scrollPadding} />
                </View>
                <BottomDissolveCover>
                    <View style={styles.buttonView}>
                        <ClearAllBtn
                            disabled={selectedL3s?.length === 0}
                            onPress={onClearAllPress}
                            text="Clear All"
                        />
                        <ApplyFiltersBtn onPress={onPressApplyFilters} text="Apply Filters" />
                    </View>
                </BottomDissolveCover>
            </ScreenLayout>
        </ScreenContainer>
    );
}
const styles = StyleSheet.create({
    buttonView: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 41,
        paddingTop: 26,
    },
    container: { flex: 1 },
    containerPadding: { marginBottom: 10, paddingHorizontal: 24 },
    itemStyle: {
        alignItems: "center",
        flexDirection: "row",
        height: 54,
        marginHorizontal: 24,
    },
    itemText: { flex: 1, marginLeft: 10 },
    separator: { backgroundColor: SEPARATOR, height: 1, marginHorizontal: 24 },
});

export default withModelContext(SSLFilterScreenL3);
