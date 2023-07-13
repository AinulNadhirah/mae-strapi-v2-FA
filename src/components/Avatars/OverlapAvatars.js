import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Platform, Animated } from "react-native";

import Typo from "@components/Text";

import { BLACK, WHITE, YELLOW, SHADOW_LIGHTER, GREY } from "@constants/colors";

import { getShadow } from "@utils/dataModel/utility";

const OverlapAvatars = ({
    contactDetails,
    width,
    height,
    borderRadius,
    backgroundColor,
    token,
}) => {
    return (
        <View style={Style.container}>
            {contactDetails.map((contact, index) => {
                return (
                    <Avatar
                        key={index}
                        contact={contact}
                        index={index}
                        height={height}
                        width={width}
                        borderRadius={borderRadius}
                        backgroundColor={backgroundColor}
                        token={token}
                    />
                );
            })}
        </View>
    );
};

const Avatar = ({ contact, index, height, width, borderRadius, token }) => {
    const [avatarType, setAvatarType] = useState("text");
    const [bgColor, setBgColor] = useState(GREY);
    const imageAnimated = new Animated.Value(0);

    useEffect(() => {
        init(contact);
    }, [contact, init]);

    const init = useCallback(
        (contact) => {
            const type = contact?.type ?? null;
            const avatarBgColor = contact?.backgroundColor ?? GREY;

            if (type === "image" && token) {
                setAvatarType(type);
            }

            setBgColor(avatarBgColor);
        },
        [token]
    );

    function onImageLoadError() {
        // Show Contact Initials
        setAvatarType("text");
        setBgColor(GREY);
    }

    function onImageLoad() {
        Animated.timing(imageAnimated, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }

    return (
        <View
            key={index}
            style={[
                {
                    height,
                    width,
                },
                Style.outerContainerCls,
                Platform.OS === "ios" ? Style.shadow : {},
            ]}
        >
            <View
                style={[
                    {
                        height,
                        width,
                        borderRadius,
                        backgroundColor: bgColor,
                    },
                    Style.innerContainerCls,
                    Platform.OS === "ios" ? {} : Style.shadow,
                ]}
            >
                {avatarType === "image" ? (
                    <Animated.Image
                        source={{
                            uri: contact.source,
                            headers: {
                                Authorization: token,
                            },
                        }}
                        style={[Style.profileImgCls, { opacity: imageAnimated }]}
                        onError={onImageLoadError}
                        onLoad={onImageLoad}
                    />
                ) : (
                    <Typo
                        fontSize={13}
                        lineHeight={13}
                        color={contact?.textColor ?? BLACK}
                        text={contact?.text ?? ""}
                        style={Style.initialsLabelCls}
                    />
                )}
            </View>
        </View>
    );
};

Avatar.propTypes = {
    backgroundColor: PropTypes.any,
    borderRadius: PropTypes.any,
    contact: PropTypes.shape({
        backgroundColor: PropTypes.any,
        source: PropTypes.any,
        text: PropTypes.string,
        textColor: PropTypes.any,
        type: PropTypes.any,
    }),
    height: PropTypes.any,
    index: PropTypes.any,
    token: PropTypes.any,
    width: PropTypes.any,
};

const Style = StyleSheet.create({
    container: {
        flexDirection: "row",
        height: "100%",
        justifyContent: "flex-end",
        width: "100%",
    },

    initialsLabelCls: {
        marginTop: 3,
    },

    innerContainerCls: {
        alignItems: "center",
        borderColor: WHITE,
        borderStyle: "solid",
        borderWidth: 2,
        justifyContent: "center",
        marginLeft: -5,
        overflow: "hidden",
    },

    outerContainerCls: {
        alignItems: "center",
        justifyContent: "center",
        marginLeft: -5,
    },

    profileImgCls: {
        height: "100%",
        width: "100%",
    },

    shadow: {
        ...getShadow({
            width: 0,
            height: 1,
            shadowRadius: 2,
            shadowOpacity: 0.3,
            shadowColor: SHADOW_LIGHTER,
            elevation: 4,
        }),
    },
});

OverlapAvatars.propTypes = {
    contactDetails: PropTypes.array.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    borderRadius: PropTypes.number,
    backgroundColor: PropTypes.string,
    token: PropTypes.any,
};

OverlapAvatars.defaultProps = {
    contactDetails: [],
    width: 36,
    height: 36,
    borderRadius: 36 / 2,
    backgroundColor: YELLOW,
    token: false,
};

const Memoiz = React.memo(OverlapAvatars);

export default Memoiz;
