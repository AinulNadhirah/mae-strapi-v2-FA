import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";

import OverlapAvatars from "@components/Avatars/OverlapAvatars";
import Typo from "@components/Text";
import { WHITE } from "@constants/colors";

import { getShadow } from "@utils/dataModel/utility";

const GroupCard = ({ onCardPressed, item, isLastItem, token, isFirstItem }) => {
    const { groupName, dateCreated, contactDetails } = item;

    const cardPress = () => {
        onCardPressed(item);
    };

    return (
        <View style={Styles.shadow}>
            <TouchableOpacity
                activeOpacity={0.8}
                style={[
                    Styles.container,
                    { marginBottom: isLastItem ? 50 : 16, marginTop: isFirstItem ? 30 : 0 },
                    Styles.shadow,
                ]}
                onPress={cardPress}
            >
                <View style={Styles.contentContainer}>
                    <View style={Styles.topContCls}>
                        <View style={Styles.labelsContCls}>
                            {groupName && (
                                <Typo
                                    text={groupName}
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="600"
                                    ellipsizeMode="tail"
                                    numberOfLines={2}
                                    textAlign="left"
                                />
                            )}

                            {dateCreated && (
                                <Typo
                                    text={`Created on ${dateCreated}`}
                                    fontSize={11}
                                    lineHeight={17}
                                    fontWeight="normal"
                                    textAlign="left"
                                    style={{ marginTop: 5 }}
                                />
                            )}
                        </View>

                        {/* Contact Image/Initials */}
                        <View style={Styles.avatarContCls}>
                            {contactDetails && (
                                <OverlapAvatars
                                    contactDetails={contactDetails}
                                    width={36}
                                    height={36}
                                    borderRadius={18}
                                    token={token}
                                />
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

GroupCard.propTypes = {
    onCardPressed: PropTypes.func.isRequired,
    item: PropTypes.object.isRequired,
    isLastItem: PropTypes.bool,
    isFirstItem: PropTypes.bool,
    token: PropTypes.any,
};

GroupCard.defaultProps = {
    onCardPressed: () => {},
    item: {},
    isLastItem: false,
    isFirstItem: false,
    token: false,
};

const Styles = StyleSheet.create({
    avatarContCls: {
        marginLeft: 10,
        position: "absolute",
        right: 0,
        width: 130,
    },
    container: {
        backgroundColor: WHITE,
        borderRadius: 8,
        height: 90,
        marginBottom: 16,
        marginHorizontal: 24,
        overflow: "hidden",
        padding: 15,
    },
    contentContainer: {
        height: "100%",
        justifyContent: "space-between",
        width: "100%",
    },
    labelsContCls: {
        flex: 1,
        justifyContent: "space-between",
        overflow: "hidden",
    },
    shadow: {
        ...getShadow({
            elevation: 8,
        }),
    },
    topContCls: {
        flexDirection: "row",
        height: "100%",
    },
});

export default React.memo(GroupCard);
