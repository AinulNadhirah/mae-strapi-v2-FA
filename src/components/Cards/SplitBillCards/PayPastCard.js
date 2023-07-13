import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";

import OverlapAvatars from "@components/Avatars/OverlapAvatars";
import Typo from "@components/Text";
import { WHITE } from "@constants/colors";

import { getShadow } from "@utils/dataModel/utility";

const PayPastCard = ({ onCardPressed, item, isLastItem, token, isFirstItem }) => {
    const {
        billName,
        expiryDate,
        amountOwed,
        statusText,
        statusColor,
        ownerName,
        contactDetails,
        billTotalAmount,
        billCollectedAmount,
    } = item;
    const hasBillExpired = item?.hasBillExpired ?? false;
    const isBillOwner = item?.isBillOwner ?? false;

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
                        {/* Split Bill Title */}
                        <Typo
                            text={billName || ""}
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

                    {/* Status badge */}
                    {statusText && statusColor && (
                        <View
                            style={[
                                Styles.statusPillCls,
                                {
                                    backgroundColor: statusColor,
                                },
                            ]}
                        >
                            <Typo
                                text={statusText || ""}
                                fontSize={10}
                                lineHeight={11}
                                fontWeight="normal"
                                color={WHITE}
                            />
                        </View>
                    )}

                    {/* You collected/You owe label */}
                    {isBillOwner ? (
                        <View style={Styles.amountLabelViewCls}>
                            <Typo
                                text={`You collected `}
                                fontSize={14}
                                lineHeight={19}
                                textAlign="left"
                                fontWeight="normal"
                            />
                            <Typo
                                text={billCollectedAmount}
                                fontSize={14}
                                lineHeight={19}
                                textAlign="left"
                                fontWeight="600"
                            />
                        </View>
                    ) : (
                        <View style={Styles.amountLabelViewCls}>
                            <Typo
                                text={`You owe ${ownerName} `}
                                fontSize={14}
                                lineHeight={19}
                                textAlign="left"
                                fontWeight="normal"
                            />
                            <Typo
                                text={amountOwed}
                                fontSize={14}
                                lineHeight={19}
                                textAlign="left"
                                fontWeight="600"
                            />
                        </View>
                    )}

                    {/* Expiry */}
                    {hasBillExpired ? (
                        <Typo
                            text={`Expired on ${expiryDate}`}
                            fontSize={11}
                            lineHeight={17}
                            textAlign="left"
                            fontWeight="normal"
                        />
                    ) : (
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

PayPastCard.propTypes = {
    onCardPressed: PropTypes.func.isRequired,
    item: PropTypes.object.isRequired,
    isLastItem: PropTypes.bool,
    isFirstItem: PropTypes.bool,
    token: PropTypes.any,
};

PayPastCard.defaultProps = {
    onCardPressed: () => {},
    item: {},
    isLastItem: false,
    isFirstItem: false,
    token: false,
};

const Styles = StyleSheet.create({
    amountLabelViewCls: {
        flexDirection: "row",
    },

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

    statusPillCls: {
        alignItems: "center",
        borderRadius: 50,
        height: 25,
        justifyContent: "center",
        width: 75,
    },

    topContCls: {
        flexDirection: "row",
        height: 50,
    },
});

export default React.memo(PayPastCard);
