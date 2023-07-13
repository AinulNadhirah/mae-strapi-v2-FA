import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Image, Platform, StyleSheet, Dimensions } from "react-native";

import { useModelController } from "@context";

import { updateBookmarkProperty, updatePostLoginBookmarkProperty } from "@services";

import { getShadow, isEmpty } from "@utils/dataModel/utility";

import Assets from "@assets";

const screenWidth = Dimensions.get("window").width;
const dynamicDimension = (screenWidth * 12) / 100;

const BookmarkIcon = ({ data, onPressBookmark, isBookmarked, onBookmarkError, onBookmarkDone }) => {
    const inactiveIcon = Assets.bookmarkInactive;
    const activeIcon = Assets.bookmarkActive;
    const bookmarked = isBookmarked === "Y";
    const { getModel } = useModelController();
    const {
        user: { isOnboard },
    } = getModel(["user"]);
    const [bookmarkState, setbookmarkState] = useState(bookmarked);
    const [icon, setIcon] = useState(bookmarked ? activeIcon : inactiveIcon);

    useEffect(() => {
        setbookmarkState(bookmarked);
        setIcon(bookmarked ? activeIcon : inactiveIcon);
    }, [activeIcon, bookmarked, inactiveIcon, isBookmarked]);

    async function onBookmark() {
        const { propertyMetadata } = getModel("misc");
        const isCloudEnabled = propertyMetadata?.propertyCloudEnabled ?? false;
        const cloudEndPointBase = propertyMetadata?.propertyCloudUrl ?? "";

        if (isOnboard) {
            data.bookmarkAction = !bookmarkState ? "ADD" : "REMOVE";

            onPressBookmark(data);

            if (!bookmarkState) {
                const params = {
                    propertyId: data?.property_id,
                    action: "ADD",
                };

                try {
                    const response =
                        isCloudEnabled && !isEmpty(cloudEndPointBase)
                            ? await updatePostLoginBookmarkProperty(cloudEndPointBase, params)
                            : await updateBookmarkProperty(params);

                    if (response?.data) {
                        setbookmarkState(true);
                        setIcon(activeIcon);
                        if (onBookmarkDone()) onBookmarkDone();
                    }
                } catch (error) {
                    console.log(error);
                    if (onBookmarkError()) onBookmarkError();
                }
            } else {
                const params = {
                    propertyId: data?.property_id,
                    action: "REMOVE",
                };

                try {
                    const response =
                        isCloudEnabled && !isEmpty(cloudEndPointBase)
                            ? await updatePostLoginBookmarkProperty(cloudEndPointBase, params)
                            : await updateBookmarkProperty(params);

                    if (response?.data) {
                        setbookmarkState(false);
                        setIcon(inactiveIcon);
                        if (onBookmarkDone()) onBookmarkDone();
                    }
                } catch (error) {
                    console.log(error);
                    if (onBookmarkError()) onBookmarkError();
                }
            }
            //  return;
        } else {
            onPressBookmark();
        }
    }

    return (
        <View style={Platform.OS === "ios" ? Style.shadow : {}}>
            <TouchableOpacity
                style={[
                    Style.bookmarkBtnCont(dynamicDimension),
                    Platform.OS === "ios" ? {} : Style.shadow,
                ]}
                activeOpacity={0.8}
                onPress={onBookmark}
            >
                <Image style={Style.bookmarkIcon} resizeMode="cover" source={icon} />
            </TouchableOpacity>
        </View>
    );
};

BookmarkIcon.propTypes = {
    data: PropTypes.object.isRequired,
    onPressBookmark: PropTypes.func.isRequired,
    isBookmarked: PropTypes.string,
    onBookmarkError: PropTypes.func,
    onBookmarkDone: PropTypes.func,
};

BookmarkIcon.defaultProps = {
    isBookmarked: "N",
    onBookmarkError: () => {},
    onBookmarkDone: () => {},
};

const Style = StyleSheet.create({
    bookmarkBtnCont: (dimension) => ({
        marginRight: 15,
        marginLeft: 5,
        height: dimension,
        width: dimension,
        borderRadius: dimension / 2,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    }),

    bookmarkIcon: {
        height: "100%",
        width: "100%",
    },
    shadow: {
        ...getShadow({
            elevation: 8,
        }),
    },
});

export default BookmarkIcon;
