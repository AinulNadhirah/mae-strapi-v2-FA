import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, Image, View } from "react-native";
import PropTypes from "prop-types";

import Typo from "@components/Text";
import Images from "@assets";

import { DARK_GREY, OFF_WHITE, PINKISH_GREY } from "@constants/colors";
import { removeAllCharInImage, getShadow, getContactNameInitial } from "@utils/dataModel/utility";

const DynamicImage = ({ item, type }) => {
    const [avatarType, setAvatarType] = useState("text");
    const imageName = Images[removeAllCharInImage(item.imageName)];
    const imageUrl = item?.imageUrl ?? null;

    // Extract Initials
    const shortName = item?.shortName ?? null;
    const initialText = shortName ? getContactNameInitial(item.shortName) : "";

    useEffect(() => {
        init();
    }, [imageName, imageUrl]);

    const init = useCallback(() => {
        // Use local image
        if (imageName) {
            setAvatarType("localImage");
            return;
        }

        // Use remote image from URL
        if (imageUrl) {
            setAvatarType("remoteImage");
            return;
        }

        // Use Initials
        setAvatarType("text");
    }, [imageName, imageUrl]);

    const onImageLoadError = useCallback(
        (error) => {
            // Show Telco Initials
            setAvatarType("text");
        },
        [avatarType]
    );

    return (
        <View>
            {avatarType === "localImage" ? (
                <View style={styles.border}>
                    <Image
                        style={styles.imageAvatar}
                        source={imageName}
                        resizeMode="stretch"
                        resizeMethod="scale"
                        onError={onImageLoadError}
                    />
                </View>
            ) : (
                <React.Fragment>
                    {avatarType === "remoteImage" ? (
                        <View style={styles.border}>
                            <Image
                                style={styles.imageAvatar}
                                source={{ uri: imageUrl }}
                                resizeMode="stretch"
                                resizeMethod="scale"
                                onError={onImageLoadError}
                            />
                        </View>
                    ) : (
                        <View style={styles.avatarContainerCls}>
                            <Typo
                                fontSize={21}
                                fontWeight="300"
                                lineHeight={21}
                                color={DARK_GREY}
                                text={initialText}
                                style={styles.intialText}
                            />
                        </View>
                    )}
                </React.Fragment>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    avatarContainerCls: {
        alignItems: "center",
        backgroundColor: PINKISH_GREY,
        borderColor: OFF_WHITE,
        borderRadius: 64 / 2,
        borderStyle: "solid",
        borderWidth: 2,
        height: 64,
        justifyContent: "center",
        width: 64,
        ...getShadow({
            elevation: 4,
        }),
    },

    border: {
        alignItems: "center",
        backgroundColor: PINKISH_GREY,
        borderColor: OFF_WHITE,
        borderRadius: 64 / 2,
        borderStyle: "solid",
        borderWidth: 2,
        height: 64,
        justifyContent: "center",
        width: 64,
        ...getShadow({
            elevation: 4,
        }),
    },

    imageAvatar: {
        borderRadius: 60 / 2,
        height: 60,
        width: 60,
    },

    intialText: {
        marginTop: 6,
    },
});

DynamicImage.propTypes = {
    item: PropTypes.object,
    type: PropTypes.string,
};

const Memoiz = React.memo(DynamicImage);

export default Memoiz;
