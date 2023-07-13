import PropTypes from "prop-types";
import React, { useCallback, useState, useRef, useEffect } from "react";
import { View, StyleSheet, Animated, ScrollView, Dimensions, Platform, Image } from "react-native";

import GridButtons from "@components/Common/GridButtons";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FavouriteAccountListItem from "@components/FavouriteAccountListItem";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import OwnAccountShimmerView from "@components/Others/OwnAccountShimmerView";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import SearchInput from "@components/SearchInput";
import Typo from "@components/Text";

import { MEDIUM_GREY } from "@constants/colors";
import {
    NEW_TRANSFER,
    FAVOURITES,
    ADD_FAVOURITES_TO_LIST,
    YOU_CAN_ALWAYS_ADD_FAVOURITE,
    NO_RESULT_FOUND,
    WE_COULDNT_FIND_ANY_ITEMS_MATCHING,
} from "@constants/strings";

import assets from "@assets";

const NEW_TRANSFER_CONTAINER_HEIGHT = 185;

const TransferGridButton = ({ item: { key, title, imageSource }, onButtonPressed }) => {
    const handleGridButtonPressed = useCallback(() => onButtonPressed(key), [key, onButtonPressed]);

    return (
        <GridButtons
            key={key}
            data={{
                title,
                source: imageSource,
            }}
            callback={handleGridButtonPressed}
        />
    );
};

TransferGridButton.propTypes = {
    item: PropTypes.object.isRequired,
    onButtonPressed: PropTypes.func.isRequired,
};

const TransferFavouriteAccountListItem = ({ item, onItemPressed }) => {
    const { image, description1, description2, name } = item;

    const handleAccountItemPressed = useCallback(
        () => onItemPressed(item.key, item),
        [item, onItemPressed]
    );

    return (
        <FavouriteAccountListItem
            avatarImageName={image?.imageName}
            avatarImageURI={image?.imageUrl}
            title={name}
            subTitle={description1}
            description={description2}
            onPress={handleAccountItemPressed}
        />
    );
};

TransferFavouriteAccountListItem.propTypes = {
    item: PropTypes.object.isRequired,
    onItemPressed: PropTypes.func.isRequired,
};

const TransferTabItem = ({
    newTransferItems,
    favouritesItems,
    isLoadingFavouritesItems,
    onNewTransferButtonPressed,
    onFavouritesItemPressed,
    isFavouritesListSuccessfullyFetched,
    toggledSearchMode,
    isEnabled = true,
    header = "Be Right Back!",
    subHeader,
    desc,
}) => {
    const [favouritesSearchKeyword, setFavouritesSearchKeyword] = useState("");
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [favouritesItemsFlatListData, setFavouritesItemFlatListData] = useState([]);
    const newTransferContainerHeight = useRef(
        new Animated.Value(NEW_TRANSFER_CONTAINER_HEIGHT)
    ).current;
    const newTransferContainerOpacity = useRef(new Animated.Value(1)).current;

    const handleSearchInputPressed = useCallback(() => {
        setIsSearchMode(!isSearchMode);
        toggledSearchMode?.(!isSearchMode);
    }, [isSearchMode, toggledSearchMode]);

    const handleFavouritesTransferSearchKeywordUpdate = useCallback(
        (text) => setFavouritesSearchKeyword(text),
        []
    );
    const scrollRef = useRef();
    useEffect(() => {
        //Set the favourites transfer flat list data, should happen only once.
        setFavouritesItemFlatListData(favouritesItems);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        //Animate transition of hiding new transfer container to showing it.
        if (!isSearchMode) {
            Animated.sequence([
                Animated.timing(newTransferContainerHeight, {
                    toValue: NEW_TRANSFER_CONTAINER_HEIGHT,
                    duration: 250,
                    useNativeDriver: false,
                }),
                Animated.timing(newTransferContainerOpacity, {
                    toValue: 1,
                    duration: Platform.OS === "ios" ? 250 : 0,
                    useNativeDriver: false,
                }),
            ]).start();
        } else {
            Animated.sequence([
                Animated.timing(newTransferContainerOpacity, {
                    toValue: 0,
                    duration: Platform.OS === "ios" ? 250 : 0,
                    useNativeDriver: false,
                }),
                Animated.timing(newTransferContainerHeight, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: false,
                }),
            ]).start();
        }
    }, [isSearchMode, newTransferContainerHeight, newTransferContainerOpacity]);

    useEffect(() => {
        //Filter favourite items based on searched keyword.
        if (!isSearchMode || favouritesSearchKeyword.length < 3) {
            setFavouritesItemFlatListData(favouritesItems);
        } else {
            const regex = RegExp(`(${favouritesSearchKeyword})+`, "i");
            const filteredFavourites = favouritesItems.filter((item) => {
                const { name, description1, description2 } = item;
                return regex.test(name) || regex.test(description1) || regex.test(description2);
            });
            setFavouritesItemFlatListData(filteredFavourites);
            scrollRef?.current?.scrollTo({ animated: true, x: 0, y: 250 });
        }
    }, [favouritesItems, favouritesSearchKeyword, isSearchMode]);

    useEffect(() => {
        //Resets searched keyword.
        if (!isSearchMode) setFavouritesSearchKeyword("");
    }, [favouritesSearchKeyword, isSearchMode]);

    function TransferTabItemDown({ header, subHeader, desc }) {
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={50}
                    paddingHorizontal={0}
                    //useSafeArea
                >
                    <ScrollView
                        contentContainerStyle={styles.contentContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        <Typo
                            textAlign="center"
                            text={header}
                            fontWeight="600"
                            fontSize={18}
                            lineHeight={24}
                        />
                        <View style={styles.tabItemDownContainer}>
                            <View style={styles.tabItemDownSubContainer}>
                                {subHeader && (
                                    <Typo
                                        style={styles.itemTitle}
                                        textAlign="center"
                                        text={subHeader}
                                        fontWeight="400"
                                        fontSize={14}
                                        lineHeight={18}
                                    />
                                )}
                                {desc && (
                                    <Typo
                                        style={styles.itemDesc}
                                        textAlign="center"
                                        text={desc}
                                        fontWeight="400"
                                        fontSize={14}
                                        lineHeight={18}
                                    />
                                )}
                            </View>
                            <View style={styles.footerBg}>
                                <Image
                                    style={styles.itemImage}
                                    source={assets.illustrationErrorState}
                                />
                            </View>
                        </View>
                    </ScrollView>
                </ScreenLayout>
            </ScreenContainer>
        );
    }

    const renderEmptyFavouritesListText = (title, subtitle) => (
        <View style={styles.favouritesSectionEmptyContainer}>
            <Typo
                fontSize={18}
                fontWeight="bold"
                fontStyle="normal"
                letterSpacing={0}
                lineHeight={32}
                textAlign="center"
                text={title}
            />
            <SpaceFiller height={2} />
            <Typo
                fontSize={14}
                fontStyle="normal"
                letterSpacing={0}
                lineHeight={20}
                textAlign="center"
                text={subtitle}
            />
        </View>
    );

    const renderFavouritesSection = () => {
        const isFavouritesListEmpty = favouritesItems.length === 0;

        if (isLoadingFavouritesItems) return <OwnAccountShimmerView />;
        else if (!isFavouritesListSuccessfullyFetched) return null;
        else if (!favouritesItemsFlatListData.length && isSearchMode)
            return renderEmptyFavouritesListText(
                NO_RESULT_FOUND,
                WE_COULDNT_FIND_ANY_ITEMS_MATCHING
            );
        else if (isFavouritesListEmpty && isFavouritesListSuccessfullyFetched)
            return renderEmptyFavouritesListText(
                ADD_FAVOURITES_TO_LIST,
                YOU_CAN_ALWAYS_ADD_FAVOURITE
            );
        else
            return favouritesItemsFlatListData.map((item, index) => (
                <TransferFavouriteAccountListItem
                    key={`${item?.description1 ?? item?.name}-${index}`}
                    item={item}
                    onItemPressed={onFavouritesItemPressed}
                />
            ));
    };

    if (!isEnabled) {
        return <TransferTabItemDown header={header} subHeader={subHeader} desc={desc} />;
    }

    return (
        <ScrollView
            keyboardShouldPersistTaps="handled"
            style={styles.container}
            contentContainerStyle={styles.contentContainerStyle}
            showsVerticalScrollIndicator={false}
            stickyHeaderIndices={[1]}
            ref={scrollRef}
        >
            <Animated.View
                style={[
                    styles.newTransferSection,
                    {
                        height: newTransferContainerHeight,
                        opacity: newTransferContainerOpacity,
                    },
                ]}
            >
                <View style={styles.newTransferTitle}>
                    <Typo text={NEW_TRANSFER} lineHeight={18} fontSize={16} fontWeight="600" />
                </View>
                <View style={styles.transferGridButtons}>
                    {newTransferItems.map((item, index) => (
                        <View style={styles.transferGridButtonsGutter} key={`key-${index}`}>
                            <TransferGridButton
                                item={item}
                                onButtonPressed={onNewTransferButtonPressed}
                            />
                        </View>
                    ))}
                </View>
            </Animated.View>
            <View style={styles.favouritesInputSection}>
                <View style={styles.favouritesTitle}>
                    <Typo text={FAVOURITES} lineHeight={18} fontSize={16} fontWeight="600" />
                </View>
                <SearchInput
                    doSearchToogle={handleSearchInputPressed}
                    showSearchInput={isSearchMode}
                    onSearchTextChange={handleFavouritesTransferSearchKeywordUpdate}
                    marginHorizontal={0}
                />
            </View>
            <View style={styles.favouritesListSection}>{renderFavouritesSection()}</View>
        </ScrollView>
    );
};

const FLEX_START = "flex-start";

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 25,
        //paddingHorizontal: 24,
    },
    contentContainer: {
        paddingBottom: 25,
        //paddingHorizontal: 24,
    },
    contentContainerStyle: {
        alignItems: FLEX_START,
        flexGrow: 1,
        justifyContent: FLEX_START,
    },
    favouritesInputSection: {
        backgroundColor: MEDIUM_GREY,
        paddingHorizontal: 24,
        width: "100%",
    },
    favouritesListSection: {
        flex: 1,
        paddingHorizontal: 24,
        width: "100%",
    },
    favouritesSectionEmptyContainer: {
        marginTop: 17,
        width: Dimensions.get("screen").width - 48,
    },
    favouritesTitle: {
        alignItems: "flex-start",
        justifyContent: "center",
        paddingBottom: 10,
    },
    itemDesc: {
        marginTop: 15,
    },
    itemDesc: {
        marginTop: 15,
    },

    itemImage: {
        aspectRatio: 1,
        flex: 1,
        height: "100%",
        marginTop: "17%",
        resizeMode: "contain",
        width: "100%",
    },
    itemImage: {
        aspectRatio: 1,
        flex: 1,
        height: "100%",
        marginTop: "17%",
        resizeMode: "contain",
        width: "100%",
    },
    itemTitle: {
        marginTop: 20,
    },
    itemTitle: {
        marginTop: 20,
    },
    newTransferSection: {
        alignItems: FLEX_START,
        justifyContent: FLEX_START,
    },
    newTransferTitle: { marginBottom: 12, marginLeft: 24 },

    tabItemDownContainer: { flexDirection: "column" },
    tabItemDownSubContainer: { paddingHorizontal: 24 },
    transferGridButtons: { flexDirection: "row", marginLeft: 18 },
    transferGridButtonsGutter: { paddingLeft: 4, paddingTop: 4 },
});

TransferTabItem.propTypes = {
    newTransferItems: PropTypes.array.isRequired,
    favouritesItems: PropTypes.array.isRequired,
    isLoadingFavouritesItems: PropTypes.bool.isRequired,
    onNewTransferButtonPressed: PropTypes.func.isRequired,
    onFavouritesItemPressed: PropTypes.func.isRequired,
    isFavouritesListSuccessfullyFetched: PropTypes.bool.isRequired,
    toggledSearchMode: PropTypes.func,
    isEnabled: PropTypes.bool,
    header: PropTypes.string,
    subHeader: PropTypes.string,
    desc: PropTypes.string,
};

TransferTabItem.defaultProps = {
    toggledSearchMode: null,
};

export default React.memo(TransferTabItem);
