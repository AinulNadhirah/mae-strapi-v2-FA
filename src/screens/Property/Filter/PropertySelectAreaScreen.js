import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import {
    TouchableOpacity,
    Image,
    StyleSheet,
    View,
    FlatList,
    Dimensions,
    Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import SearchInput from "@components/SearchInput";
import Typo from "@components/Text";

import { BLACK, MEDIUM_GREY, LIGHT_GREY, WHITE, YELLOW } from "@constants/colors";
import { CONFIRM, NO_RESULT_FOUND, WE_COULDNT_FIND_ANY_ITEMS_MATCHING } from "@constants/strings";

import { arraySearchByObjProp } from "@utils/array";
import { clone } from "@utils/dataModel/utility";

import Assets from "@assets";

const { width } = Dimensions.get("window");

function PropertySelectAreaScreen({ route, navigation }) {
    const [loading, setLoading] = useState(true);
    const [showSearchInput, setShowSearchInput] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [data, setData] = useState([]);
    const [selectedData, setSelectedData] = useState([]);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [bottomInfo, setBottomInfo] = useState("");
    const [type, setType] = useState("");
    const [headerTitle, setHeaderTitle] = useState("");

    useEffect(() => {
        init();
    }, []);

    const init = () => {
        console.log("[PropertySelectAreaScreen] >> [init]");

        const data = route?.params?.data ?? [];
        const type = route?.params?.type ?? "";
        const headerTitle = route?.params?.title ?? "";
        const tempDataArray = route?.params?.selectedData ?? [];
        const selectedDataArray = clone(tempDataArray);

        setData(data);
        setHeaderTitle(headerTitle);
        setType(type);
        setLoading(false);

        //show earlier selected data if there is
        if (selectedDataArray) {
            const selectedKeysArray = selectedDataArray.map(({ value }) => value);
            const length = selectedDataArray.length;
            const bottomInfo =
                length > 0 ? length + " " + type + (length > 1 ? "s" : "") + " selected" : "";
            setBottomInfo(bottomInfo);
            setSelectedData(selectedDataArray);
            setSelectedKeys(selectedKeysArray);
        }
    };

    const onBackTap = () => {
        console.log("[PropertySelectAreaScreen] >> [onBackTap]");

        navigation.goBack();
    };

    const renderItem = ({ item, index }) => {
        const isSelected = selectedKeys.indexOf(item.value) == -1 ? false : true;
        const handlePress = () => {
            onPressListItem(item);
        };

        return (
            <TouchableOpacity
                style={styles.itemContainer}
                activeOpacity={0.5}
                onPress={handlePress}
            >
                <View style={styles.itemInnerContainer}>
                    {/* label */}
                    <Typo fontSize={14} numberOfLines={1} text={item.name} lineHeight={19} />

                    {/* Tick Icon  */}
                    <View
                        style={styles.tickImageView}
                        accessibilityId={"tickImageView"}
                        testID={"tickImageView"}
                    >
                        {isSelected && (
                            <Image
                                accessibilityId={"tickImage"}
                                testID={"tickImage"}
                                style={Platform.OS === "ios" ? styles.tickImage1 : styles.tickImage}
                                source={Assets.tickIcon}
                            />
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const onPressListItem = (item) => {
        console.log("[PropertySelectAreaScreen] >> [onPressListItem]", item);
        const elementIndex = selectedKeys.indexOf(item.value);
        if (elementIndex == -1) {
            //select item
            selectedData.push(item);
            selectedKeys.push(item.value);
        } else {
            //deselect item
            selectedData.splice(elementIndex, 1);
            selectedKeys.splice(elementIndex, 1);
        }
        setSelectedData(selectedData);
        setSelectedKeys(selectedKeys);
        const length = selectedData.length;
        const bottomInfo =
            length > 0 ? length + " " + type + (length > 1 ? "s" : "") + " selected" : "";
        setBottomInfo(bottomInfo);
    };

    function keyExtractor(item, index) {
        return `${item?.value}-${index}`;
    }

    function doSearchToogle() {
        if (showSearchInput) setSearchText("");
        setShowSearchInput(!showSearchInput);
    }

    function onSearchTextChange(val) {
        setSearchText(val);
    }

    const listFilter = (array, filterType) => {
        if (array) {
            return array.filter((item) => {
                return true;
            });
        }
        return false;
    };

    const onPressConfirm = () => {
        console.log("[PropertySelectAreaScreen] >> [onPressConfirm]");
        route.params.confirmCallback &&
            route.params.confirmCallback(selectedData, selectedKeys, type);
        navigation.pop();
    };

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={loading}
        >
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text={headerTitle}
                            />
                        }
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
            >
                <React.Fragment>
                    <View style={styles.outerViewCls}>
                        {/* Search Component */}
                        <View style={styles.searchViewCls}>
                            <SearchInput
                                doSearchToogle={doSearchToogle}
                                showSearchInput={showSearchInput}
                                onSearchTextChange={onSearchTextChange}
                            />
                        </View>

                        {/* List */}
                        <View style={styles.contactListViewCls}>
                            <FlatList
                                data={listFilter(arraySearchByObjProp(data, searchText, ["name"]))}
                                keyExtractor={keyExtractor}
                                renderItem={renderItem}
                                extraData={selectedData}
                                maxToRenderPerBatch={1000}
                                windowSize={30}
                                updateCellsBatchingPeriod={1}
                                initialNumToRender={50}
                                ListEmptyComponent={!!searchText && <NoDataView />}
                            />
                        </View>

                        {/* Bottom docked bar */}
                        <BottomView
                            bottomInfo={bottomInfo}
                            onDoneEvent={onPressConfirm}
                            buttonLabel={CONFIRM}
                            isButtonEnabled={selectedData.length > 0 ? true : false}
                        />
                    </View>
                </React.Fragment>
            </ScreenLayout>
        </ScreenContainer>
    );
}

// Bottom View Class
const BottomView = ({ bottomInfo, onDoneEvent, buttonLabel, isButtonEnabled }) => {
    const safeAreaInsets = useSafeAreaInsets();
    return (
        <View style={styles.containerFooter(safeAreaInsets)}>
            <Typo
                fontSize={14}
                fontWeight="bold"
                letterSpacing={0}
                lineHeight={18}
                textAlign="left"
                text={bottomInfo}
            />
            <ActionButton
                backgroundColor={YELLOW}
                onPress={onDoneEvent}
                width={108}
                height={40}
                borderRadius={20}
                componentCenter={
                    <Typo text={buttonLabel} fontSize={14} fontWeight={"bold"} color={BLACK} />
                }
            />
        </View>
    );
};

BottomView.propTypes = {
    bottomInfo: PropTypes.any,
    buttonLabel: PropTypes.any,
    isButtonEnabled: PropTypes.any,
    onDoneEvent: PropTypes.any,
};

// No Data View Class
const NoDataView = ({
    title = NO_RESULT_FOUND,
    description = WE_COULDNT_FIND_ANY_ITEMS_MATCHING,
}) => {
    return (
        <View style={styles.noDataViewCls}>
            <Typo fontSize={18} fontWeight="bold" lineHeight={32} text={title} />
            <Typo
                fontWeight="200"
                lineHeight={20}
                style={styles.noDataViewSubTextCls}
                text={description}
            />
        </View>
    );
};

NoDataView.propTypes = {
    description: PropTypes.any,
    title: PropTypes.any,
};

PropertySelectAreaScreen.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    outerViewCls: {
        flex: 1,
        flexDirection: "column",
    },
    searchViewCls: {
        paddingHorizontal: 24,
    },
    contactListViewCls: {
        flex: 1,
        paddingTop: 16,
    },
    containerFooter: (inset) => ({
        alignItems: "center",
        backgroundColor: WHITE,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 18,
        paddingHorizontal: 24,
        paddingBottom: inset.bottom ? inset.bottom : 18,
    }),
    noDataViewCls: {
        marginHorizontal: 24,
        marginTop: 24,
    },
    noDataViewSubTextCls: {
        marginTop: 8,
    },
    itemContainer: {
        backgroundColor: WHITE,
        borderColor: LIGHT_GREY,
        borderWidth: 1,
        flex: 1,
        flexDirection: "row",
        height: 65,
        paddingHorizontal: 24,
        width,
    },
    itemInnerContainer: {
        flexDirection: "row",
        flex: 1,
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 13,
        paddingBottom: 11,
    },
    tickImageView: {
        height: 22,
        marginLeft: 8,
        width: 22,
    },
});

export default PropertySelectAreaScreen;
