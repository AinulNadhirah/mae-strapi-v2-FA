import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Image, TouchableOpacity, ViewPropTypes, Animated } from "react-native";
import PropTypes from "prop-types";

import Typo from "@components/Text";
import {
    SB_FLOW_ADDGRP,
    SB_FLOW_ADDGRP_SB,
    SB_FLOW_ADDSB,
    SB_FLOW_EDIT_GRP,
} from "@constants/data";
import { WHITE, BLACK, ROYAL_BLUE, DARK_GREY, GREY } from "@constants/colors";
import Assets from "@assets";
import { getShadow } from "@utils/dataModel/utility";

const SBContactItem = ({
    profilePicUrl,
    contactName,
    contactInitial,
    amount,
    item,
    onAmountTap,
    onSendInviteTap,
    onRemoveIconTap,
    amountEditable,
    showInvite,
    isLastItem,
    style,
    flowType,
    owner,
    showRemoveIcon,
    token,
}) => {
    const [avatarType, setAvatarType] = useState("text");
    const imageAnimated = new Animated.Value(0);

    useEffect(() => {
        init();
    }, [init, profilePicUrl, token]);

    const init = useCallback(() => {
        if (profilePicUrl && token) setAvatarType("image");
    }, [profilePicUrl, token]);

    function onImageLoadError() {
        // Show Contact Initials
        setAvatarType("text");
    }

    const onImageLoad = () => {
        Animated.timing(imageAnimated, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    };

    const onAmountPress = () => {
        if (amountEditable) {
            onAmountTap(item);
        }
    };

    const onInvitePress = () => {
        onSendInviteTap(item);
    };

    const onRemovePress = () => {
        onRemoveIconTap(item);
    };

    return (
        <View style={[Style.itemOuterCls, isLastItem && Style.lastItemOuterCls, style]}>
            {/* Avatar / Profile Image */}
            <View style={Style.avatarContCls}>
                <View style={Style.avatarContInnerCls}>
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
                            fontSize={18}
                            fontWeight="300"
                            lineHeight={18}
                            text={contactInitial}
                            style={Style.contactInitialCls}
                        />
                    )}
                </View>
            </View>

            <View style={Style.contentViewCls}>
                <Typo
                    textAlign="left"
                    fontSize={14}
                    lineHeight={19}
                    text={contactName}
                    ellipsizeMode="tail"
                    numberOfLines={2}
                />

                {/* Show Invite Label */}
                {showInvite && (
                    <Typo
                        color={ROYAL_BLUE}
                        textAlign="left"
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={18}
                        text="Send Invite"
                        numberOfLines={1}
                        onPress={onInvitePress}
                        style={Style.inviteLabelCls}
                    />
                )}
            </View>

            {/* For Non Input but Editable Value  */}
            {flowType == SB_FLOW_ADDSB && (
                <Typo
                    textAlign="right"
                    color={amountEditable ? ROYAL_BLUE : BLACK}
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={18}
                    numberOfLines={2}
                    text={amount}
                    style={Style.amountContCls}
                    onPress={onAmountPress}
                />
            )}

            {/* Remove Cross Icon */}
            {showRemoveIcon && (
                <TouchableOpacity style={Style.closeIconContCls} onPress={onRemovePress}>
                    <Image source={Assets.icClose} style={Style.removeIconImgCls} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const Style = StyleSheet.create({
    amountContCls: {
        marginLeft: 10,
        maxWidth: 80,
    },

    avatarContCls: {
        alignItems: "center",
        borderRadius: 26,
        height: 52,
        justifyContent: "center",
        overflow: "hidden",
        ...getShadow({
            elevation: 8,
            shadowOpacity: 0.5,
        }),
        width: 52,
    },

    avatarContInnerCls: {
        alignItems: "center",
        backgroundColor: GREY,
        borderColor: WHITE,
        borderRadius: 24,
        borderStyle: "solid",
        borderWidth: 2,
        elevation: 5,
        height: 48,
        justifyContent: "center",
        overflow: "hidden",
        width: 48,
    },

    closeIconContCls: {
        alignItems: "center",
        backgroundColor: GREY,
        borderRadius: 12,
        height: 24,
        justifyContent: "center",
        width: 24,
    },

    contactInitialCls: {
        marginTop: 6,
    },

    contentViewCls: {
        flex: 1,
        justifyContent: "space-between",
        marginLeft: 20,
        overflow: "hidden",
    },

    inviteLabelCls: {
        marginTop: 5,
    },

    itemOuterCls: {
        alignItems: "center",
        flexDirection: "row",
        marginLeft: 30,
        marginRight: 36,
        paddingVertical: 10,
    },

    lastItemOuterCls: {
        paddingBottom: 30,
    },

    profileImgCls: {
        height: "100%",
        width: "100%",
    },

    removeIconImgCls: {
        height: 16,
        width: 16,
    },
});

SBContactItem.propTypes = {
    contactName: PropTypes.string.isRequired,
    contactInitial: PropTypes.string,
    profilePicUrl: PropTypes.string,
    amount: PropTypes.string,
    showRemoveIcon: PropTypes.bool,
    item: PropTypes.object,
    onAmountTap: PropTypes.func,
    onSendInviteTap: PropTypes.func,
    onRemoveIconTap: PropTypes.func,
    amountEditable: PropTypes.bool,
    showInvite: PropTypes.bool,
    owner: PropTypes.bool,
    isLastItem: PropTypes.bool,
    style: ViewPropTypes.style,
    flowType: PropTypes.oneOf([SB_FLOW_ADDSB, SB_FLOW_ADDGRP, SB_FLOW_ADDGRP_SB, SB_FLOW_EDIT_GRP]),
    token: PropTypes.any,
};

SBContactItem.defaultProps = {
    contactName: "",
    contactInitial: "",
    profilePicUrl: "",
    amount: "",
    showRemoveIcon: false,
    item: {},
    onAmountTap: () => {},
    onSendInviteTap: () => {},
    onRemoveIconTap: () => {},
    amountEditable: false,
    showInvite: false,
    owner: false,
    isLastItem: false,
    style: {},
    token: false,
};

const Memoiz = React.memo(SBContactItem);
export default Memoiz;
