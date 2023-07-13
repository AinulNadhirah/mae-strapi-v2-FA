import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
    ViewPropTypes,
    Platform,
    Animated,
} from "react-native";
import PropTypes from "prop-types";

import Typo from "@components/Text";

import { WHITE, DARK_GREY, GREY, STATUS_GREEN, RED } from "@constants/colors";
import Assets from "@assets";
import { SB_PAYSTATUS_PAID, SB_PAYSTATUS_REJC } from "@constants/strings";
import { getShadow } from "@utils/dataModel/utility";

const SBDetailsContact = ({
    contactName,
    contactInitial,
    contactPayStatus,
    profilePicUrl,
    amount,
    item,
    style,
    onArrowTap,
    isOwnerView,
    token,
}) => {
    const [avatarType, setAvatarType] = useState("text");
    const imageAnimated = new Animated.Value(0);

    useEffect(() => {
        init();
    }, [profilePicUrl, token]);

    const init = useCallback(() => {
        if (profilePicUrl && token) setAvatarType("image");
    }, [profilePicUrl, token]);

    const onImageLoadError = useCallback(
        (error) => {
            // Show Contact Initials
            setAvatarType("text");
        },
        [avatarType]
    );

    const onImageLoad = () => {
        Animated.timing(imageAnimated, {
            toValue: 1,
            duration: 500,
        }).start();
    };

    const onArrowPress = () => {
        onArrowTap(item);
    };

    return (
        <View style={[Style.itemOuterCls, style]}>
            <View style={[Style.avatarOuterContCls, Style.shadow]}>
                <View style={Style.avatarContainerCls}>
                    {avatarType === "image" ? (
                        <Animated.Image
                            source={{
                                uri: profilePicUrl,
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
                            color={DARK_GREY}
                            fontSize={16}
                            fontWeight="300"
                            lineHeight={18}
                            text={contactInitial}
                        />
                    )}
                </View>
            </View>

            <View style={Style.textViewCls}>
                <Typo
                    textAlign="left"
                    fontSize={12}
                    fontWeight="600"
                    lineHeight={18}
                    text={contactName}
                    ellipsizeMode="tail"
                    numberOfLines={2}
                />

                <Typo
                    textAlign="left"
                    fontSize={12}
                    lineHeight={18}
                    text={amount}
                    numberOfLines={1}
                    style={{ marginTop: 5 }}
                />
            </View>

            {/* Paid Status || Arrow Icon */}
            {contactPayStatus === SB_PAYSTATUS_PAID || contactPayStatus === SB_PAYSTATUS_REJC ? (
                <View
                    style={[
                        Style.statusPillCls,
                        {
                            backgroundColor:
                                contactPayStatus === SB_PAYSTATUS_PAID ? STATUS_GREEN : RED,
                        },
                    ]}
                >
                    <Typo color={WHITE} fontSize={11} lineHeight={11} text={contactPayStatus} />
                </View>
            ) : (
                <React.Fragment>
                    {isOwnerView && (
                        <TouchableOpacity style={Style.arrowIconCls} onPress={onArrowPress}>
                            <Image
                                source={Assets.blackArrowRight}
                                style={Style.profileImgCls}
                                resizeMode="contain"
                                resizeMethod="resize"
                            />
                        </TouchableOpacity>
                    )}
                </React.Fragment>
            )}
        </View>
    );
};

const Style = StyleSheet.create({
    arrowIconCls: {
        height: 16,
        width: 16,
    },

    avatarContainerCls: {
        alignItems: "center",
        backgroundColor: GREY,
        borderColor: WHITE,
        borderRadius: 24,
        borderStyle: "solid",
        borderWidth: 2,
        height: 48,
        justifyContent: "center",
        overflow: "hidden",
        width: 48,
    },

    avatarOuterContCls: {
        alignItems: "center",
        borderRadius: Platform.select({
            ios: 25,
            android: 24,
        }),
        height: Platform.select({
            ios: 50,
            android: 48,
        }),
        justifyContent: "center",
        overflow: "hidden",
        width: Platform.select({
            ios: 50,
            android: 48,
        }),
    },

    itemOuterCls: {
        alignItems: "center",
        flexDirection: "row",
        marginLeft: 30,
        marginRight: 32,
        paddingVertical: 10,
    },

    profileImgCls: {
        height: "100%",
        width: "100%",
    },

    shadow: {
        ...getShadow({
            elevation: 8,
            shadowOpacity: 0.5,
        }),
    },

    statusPillCls: {
        borderRadius: 20,
        paddingVertical: 5,
        width: 80,
    },

    textViewCls: {
        flex: 1,
        justifyContent: "space-between",
        marginLeft: 15,
        overflow: "hidden",
    },
});

SBDetailsContact.propTypes = {
    contactName: PropTypes.string.isRequired,
    contactInitial: PropTypes.string,
    contactPayStatus: PropTypes.string,
    profilePicUrl: PropTypes.string,
    amount: PropTypes.string,
    item: PropTypes.object,
    isOwnerView: PropTypes.bool,
    style: ViewPropTypes.style,
    onArrowTap: PropTypes.func,
    token: PropTypes.any,
};

SBDetailsContact.defaultProps = {
    contactName: "",
    contactInitial: "",
    contactPayStatus: "",
    profilePicUrl: "",
    amount: "",
    item: {},
    isOwnerView: false,
    style: {},
    onArrowTap: () => {},
    token: false,
};

const Memoiz = React.memo(SBDetailsContact);

export default Memoiz;
