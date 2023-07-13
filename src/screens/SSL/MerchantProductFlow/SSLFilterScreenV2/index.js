import { useNavigation, useRoute } from "@react-navigation/core";
import _ from "lodash";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { StyleSheet, View, ScrollView } from "react-native";

import { SSL_FILTER_SCREEN_L3, SSL_MERCHANT_LISTING_V2 } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { BLACK, MEDIUM_GREY } from "@constants/colors";
import * as Strings from "@constants/strings";

import { Title, Buttons, L3Buttons, ClearAllBtn, ApplyFiltersBtn } from "./components";
import {
    defaultSelectedFilterIds,
    FILTER_SECTION_SORTBY,
    FILTER_SECTION_DISTANCE,
    FILTER_SECTION_PRICE,
    FILTER_SECTION_PROMO,
    FILTER_SECTION_MODE,
    FILTER_SECTION_L3,
    FILTER_SECTION_OTHERS,
} from "./types";

function SSLFilterScreenV2() {
    const navigation = useNavigation();
    const route = useRoute();

    const oriSelectedFilterIds = useMemo(
        () => route.params?.oriSelectedFilterIds ?? defaultSelectedFilterIds,
        [route.params?.oriSelectedFilterIds]
    );
    const [selectedFilterIds, setSelectedFilterIds] = useState(route.params?.selectedFilterIds);
    const isFiltersActive = !_.isEqual(selectedFilterIds, oriSelectedFilterIds);

    const filterSectionData = useMemo(
        () => route.params?.filterSectionData ?? {},
        [route.params?.filterSectionData]
    );
    const [scrollPicker, setScrollPicker] = useState({
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    });

    const L3Pills = useMemo(
        () =>
            filterSectionData.categoryL3List?.filter((obj) =>
                selectedFilterIds[FILTER_SECTION_L3].includes(obj.value)
            ),
        [filterSectionData.categoryL3List, selectedFilterIds]
    );

    /** USER TAP ACTIONS  */
    const onSortByPressed = useCallback(
        (key) => () => {
            console.log("onSortByPressed", key);
            setScrollPicker({
                isDisplay: true,
                selectedIndex:
                    filterSectionData[key].findIndex(
                        (obj) => selectedFilterIds[key] === obj.value
                    ) ?? 0,
                data: filterSectionData[key],
                filterType: key,
            });
        },
        [filterSectionData, selectedFilterIds]
    );

    const onButtonItemPressed = useCallback(
        (item, key) => {
            console.log("onButtonItemPressed", item, key);
            const tempSelectedFilterIds = _.cloneDeep(selectedFilterIds);
            console.log("tempSelectedFilterIds", tempSelectedFilterIds[key]);
            const index = tempSelectedFilterIds[key].findIndex((id) => id === item.value);
            console.log("index", index);
            index > -1
                ? tempSelectedFilterIds[key].splice(index, 1)
                : tempSelectedFilterIds[key].push(item.value);
            setSelectedFilterIds(tempSelectedFilterIds);
            console.log("onButtonItemPressed", tempSelectedFilterIds);
        },
        [selectedFilterIds]
    );

    /** L3 related */
    function onPressAddL3() {
        navigation.navigate({
            name: SSL_FILTER_SCREEN_L3,
            params: {
                selectedL3s: selectedFilterIds[FILTER_SECTION_L3],
                L3Data: filterSectionData[FILTER_SECTION_L3],
            },
        });
    }
    function onPressL3Cancel(item) {
        const temp = selectedFilterIds[FILTER_SECTION_L3].filter((obj) => obj !== item.value);
        setSelectedFilterIds((prev) => ({
            ...prev,
            [FILTER_SECTION_L3]: temp,
        }));
    }
    useEffect(() => {
        // L3 callback
        if (route.params?.newSelectedL3?.length > 0) {
            setSelectedFilterIds((prev) => ({
                ...prev,
                [FILTER_SECTION_L3]: route.params.newSelectedL3,
            }));
            navigation.setParams({ newSelectedL3: null });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route.params?.newSelectedL3]);

    /** Other on screen actions */
    function onCloseTap() {
        navigation.goBack();
    }
    function onClearAllPress() {
        setSelectedFilterIds(oriSelectedFilterIds);
    }
    function onApplyFiltersPress() {
        navigation.navigate({
            name: SSL_MERCHANT_LISTING_V2,
            params: { selectedFilterIds },
            merge: true,
        });
    }

    /** SCROLLPICKER ACTIONS */
    function scrollPickerOnDismiss() {
        setScrollPicker((prev) => ({
            ...prev,
            isDisplay: false,
        }));
    }
    function scrollPickerOnPressDone(data) {
        scrollPickerOnDismiss();

        switch (scrollPicker.filterType) {
            case FILTER_SECTION_DISTANCE:
                setSelectedFilterIds({ ...selectedFilterIds, distance: data.value });
                break;
            case FILTER_SECTION_SORTBY:
                setSelectedFilterIds({ ...selectedFilterIds, sortBy: data.value });
                break;
            default:
                break;
        }
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
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
                <ScrollView>
                    <View style={styles.container}>
                        <Title title="Sort By" />
                        <Dropdown
                            title={
                                filterSectionData.sortBy.find(
                                    (obj) => obj.value === selectedFilterIds.sortBy
                                )?.name
                            }
                            onPress={onSortByPressed(FILTER_SECTION_SORTBY)}
                        />
                        <View style={styles.arbitraryHeight(24)} />

                        <Title title={Strings.FILTER_DISTANCE} />
                        <Dropdown
                            title={
                                filterSectionData.distance.find(
                                    (obj) => obj.value === selectedFilterIds.distance
                                )?.name
                            }
                            onPress={onSortByPressed(FILTER_SECTION_DISTANCE)}
                        />
                        <View style={styles.arbitraryHeight(24)} />

                        <Title title={Strings.PRICE_RANGE} />
                        <Buttons
                            title={Strings.PRICE_RANGE}
                            data={filterSectionData.price}
                            onButtonItemPressed={onButtonItemPressed}
                            enumType={FILTER_SECTION_PRICE}
                            selectedIds={selectedFilterIds?.price}
                        />
                        <Title title="Promotions" />
                        <Buttons
                            data={filterSectionData.promo}
                            onButtonItemPressed={onButtonItemPressed}
                            enumType={FILTER_SECTION_PROMO}
                            selectedIds={selectedFilterIds?.promo}
                        />
                        <Title title="Mode" />
                        <Buttons
                            data={filterSectionData.mode}
                            onButtonItemPressed={onButtonItemPressed}
                            enumType={FILTER_SECTION_MODE}
                            selectedIds={selectedFilterIds?.mode}
                        />

                        <Title title="Categories" />
                        <L3Buttons
                            data={L3Pills}
                            onPressL3Cancel={onPressL3Cancel}
                            onPressAdd={onPressAddL3}
                        />

                        <Title title="Others" />
                        <Buttons
                            data={filterSectionData.others}
                            onButtonItemPressed={onButtonItemPressed}
                            enumType={FILTER_SECTION_OTHERS}
                            selectedIds={selectedFilterIds?.others}
                        />
                        <View style={styles.buttonView}>
                            <ClearAllBtn
                                disabled={!isFiltersActive}
                                onPress={onClearAllPress}
                                text="Clear All"
                            />
                            <ApplyFiltersBtn onPress={onApplyFiltersPress} text="Apply Filters" />
                        </View>
                        <View style={styles.arbitraryHeight(40)} />
                    </View>
                </ScrollView>
            </ScreenLayout>
            <ScrollPickerView
                showMenu={scrollPicker.isDisplay}
                list={scrollPicker.data}
                selectedIndex={scrollPicker.selectedIndex}
                onRightButtonPress={scrollPickerOnPressDone}
                onLeftButtonPress={scrollPickerOnDismiss}
                rightButtonText="Done"
                leftButtonText="Cancel"
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    arbitraryHeight: (height) => {
        return { height };
    },
    buttonView: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-around",
        paddingTop: 26,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
});

export default withModelContext(SSLFilterScreenV2);
