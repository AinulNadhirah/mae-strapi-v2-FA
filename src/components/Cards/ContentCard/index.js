import { CacheeImage } from "cachee";
import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";

import Typo from "@components/Text";

import { OFF_WHITE, BLACK, SHADOW_LIGHT, MEDIUM_GREY, WHITE } from "@constants/colors";

import ContentCardBookmarkButton from "./ContentCardBookmarkButton";
import ContentCardLikeButton from "./ContentCardLikeButton";

const ContentCard = ({
    imageUrl,
    title,
    likeCount,
    isLiked,
    isBookmarked,
    onCardPressed,
    onLikeButtonPressed,
    onBookmarkButtonPressed,
    containerMode,
    showFooter,
}) => {
    let containerStyle;
    let imageContainerStyle;
    if (containerMode === "list") {
        containerStyle = [
            styles.container,
            styles.containerShadow,
            styles.containerRadius,
            styles.listBgColor,
        ];
        imageContainerStyle = [styles.imageContainer, styles.imageRadius];
    } else {
        containerStyle = styles.container;
        imageContainerStyle = styles.imageContainer;
    }

    return (
        <View style={containerStyle}>
            <TouchableOpacity onPress={onCardPressed} activeOpacity={0.9}>
                <React.Fragment>
                    <View style={imageContainerStyle}>
                        <ActivityIndicator
                            size="small"
                            style={{
                                position: "absolute",
                            }}
                        />
                        <CacheeImage
                            resizeMode="cover"
                            style={styles.image}
                            source={{ uri: imageUrl }}
                        />
                    </View>
                    {containerMode === "list" && (
                        <View style={styles.summarySection}>
                            <Typo
                                fontSize={16}
                                lineHeight={22}
                                letterSpacing={0}
                                textAlign="left"
                                text={title}
                            />
                        </View>
                    )}
                </React.Fragment>
            </TouchableOpacity>
            {showFooter && (
                <View
                    style={
                        containerMode === "screen"
                            ? [styles.actionSection, styles.actionSectionWithHorizontalMargin]
                            : [styles.actionSection]
                    }
                >
                    <ContentCardLikeButton
                        likeCount={likeCount}
                        isLiked={isLiked}
                        onLikeButtonPressed={onLikeButtonPressed}
                    />
                    {/* <ContentCardBookmarkButton
                    isBookmarked={isBookmarked}
                    onBookmarkButtonPressed={onBookmarkButtonPressed}
                /> */}
                </View>
            )}
        </View>
    );
};

const SORT_OF_GREY = "#eaeaea";

const styles = StyleSheet.create({
    actionSection: {
        alignItems: "center",
        borderTopColor: SORT_OF_GREY,
        borderTopWidth: 1,
        flexDirection: "row",
        height: 56,
        justifyContent: "space-between",
        padding: 16,
        width: "100%",
    },
    actionSectionWithHorizontalMargin: {
        marginHorizontal: 8,
    },
    container: {
        backgroundColor: MEDIUM_GREY,
        width: "100%",
    },
    containerRadius: {
        borderRadius: 8,
    },
    containerShadow: {
        elevation: 8,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
    },
    image: {
        height: "100%",
        width: "100%",
    },
    imageContainer: {
        alignItems: "center",
        aspectRatio: 1.75,
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
        width: "100%",
        // height: 234,
    },
    imageRadius: {
        aspectRatio: 1.75,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        // height: 204,
    },
    listBgColor: {
        backgroundColor: WHITE,
    },
    summarySection: {
        alignItems: "flex-start",
        justifyContent: "flex-start",
        padding: 16,
        width: "100%",
    },
});

ContentCard.propTypes = {
    imageUrl: PropTypes.string.isRequired,
    likeCount: PropTypes.number,
    isLiked: PropTypes.bool,
    isBookmarked: PropTypes.bool,
    onCardPressed: PropTypes.func,
    onLikeButtonPressed: PropTypes.func,
    onBookmarkButtonPressed: PropTypes.func,
    title: PropTypes.string,
    containerMode: PropTypes.oneOf(["list", "screen"]).isRequired,
    showFooter: PropTypes.bool,
};

ContentCard.defaultProps = {
    likeCount: 0,
    isLiked: false,
    isBookmarked: false,
    onCardPressed: () => {},
    onLikeButtonPressed: () => {},
    onBookmarkButtonPressed: () => {},
    title: "",
    showFooter: true,
};

const Memoiz = React.memo(ContentCard);

export default Memoiz;
