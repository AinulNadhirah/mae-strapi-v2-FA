import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import * as Progress from "react-native-progress";
import PropTypes from "prop-types";

import OverlapAvatars from "@components/Avatars/OverlapAvatars";
import Typo from "@components/Text";

import { WHITE, PROGRESS_BAR_GREEN } from "@constants/colors";
import { getShadow } from "@utils/dataModel/utility";

const CollectCard = ({ onCardPressed, item, isLastItem, token, isFirstItem }) => {
    const {
        billName,
        billTotalAmount,
        billCollectedAmount,
        progressPercent,
        expiryDate,
        contactDetails,
    } = item;

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
                        {/* Split Bill Name */}
                        <Typo
                            text={billName}
                            fontSize={14}
                            lineHeight={18}
                            fontWeight="600"
                            textAlign="left"
                            ellipsizeMode="tail"
                            numberOfLines={2}
                            style={{ flex: 1 }}
                        />

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

                    {/* Collection Amount Label */}
                    <Typo text="Collected so far" fontSize={12} lineHeight={18} textAlign="left" />

                    {/* Collection Amount */}
                    {billCollectedAmount && billTotalAmount && (
                        <Typo
                            text={`${billCollectedAmount} of ${billTotalAmount}`}
                            fontSize={12}
                            lineHeight={18}
                            textAlign="left"
                            fontWeight="600"
                        />
                    )}

                    {/* Progress Bar */}
                    <View style={{ marginTop: 5 }}>
                        <Progress.Bar
                            progress={progressPercent}
                            style={{ borderRadius: 10 }}
                            width={null}
                            height={7}
                            animated={false}
                            borderRadius={3}
                            borderWidth={0}
                            color={PROGRESS_BAR_GREEN}
                            unfilledColor={"#ececee"}
                            borderColor={"#4a90e2"}
                        />
                    </View>

                    {/* Expiry */}
                    {expiryDate && (
                        <Typo
                            text={`Expires on ${expiryDate}`}
                            fontSize={11}
                            lineHeight={17}
                            textAlign="left"
                            fontWeight="normal"
                        />
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );
};

CollectCard.propTypes = {
    onCardPressed: PropTypes.func.isRequired,
    item: PropTypes.object.isRequired,
    isLastItem: PropTypes.bool,
    isFirstItem: PropTypes.bool,
    token: PropTypes.any,
};

CollectCard.defaultProps = {
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
        height: 170,
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

    shadow: {
        ...getShadow({
            elevation: 8,
        }),
    },

    topContCls: {
        flexDirection: "row",
        height: 50,
    },
});

export default React.memo(CollectCard);
