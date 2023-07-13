import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, Image, TouchableOpacity, FlatList } from "react-native";

import Typo from "@components/Text";

import { GREY, WHITE, DARK_GREY, ROYAL_BLUE } from "@constants/colors";

import { maskIdValue } from "@utils/dataModel/utility";

import Images from "@assets";

const DuitnowCard = ({
    idTypeKey,
    valueKey,
    statusKey,
    bankNameKey,
    onPress,
    isDisplayStatus,
    ishideIcon,
    idValue,
    items,
}) => {
    const renderItems = ({ item, index }) => {
        function handleOnPress() {
            onPress(item);
        }

        return (
            <TouchableOpacity onPress={handleOnPress} key={index}>
                <View style={styles.containerView}>
                    <View style={styles.contentView}>
                        <Typo
                            text={item[idTypeKey]}
                            fontWeight="normal"
                            fontSize={14}
                            lineHeight={18}
                            textAlign="left"
                            style={styles.titleText}
                        />
                        <View style={styles.displayView}>
                            <Typo
                                text={
                                    item.isregisteredProxy
                                        ? item[idValue]
                                        : maskIdValue(item[valueKey])
                                }
                                fontWeight="600"
                                fontSize={14}
                                lineHeight={18}
                                textAlign="left"
                                style={styles.valueText}
                            />
                            <View style={styles.iconView}>
                                {!item[statusKey] ? (
                                    <Typo
                                        text="Select account"
                                        fontWeight="600"
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        color={ROYAL_BLUE}
                                        style={styles.actionLabel}
                                    />
                                ) : (
                                    <Image
                                        style={styles.chevronButton}
                                        source={Images.icChevronRight24Black}
                                    />
                                )}
                            </View>
                        </View>
                        {isDisplayStatus && (
                            <Typo
                                text={item[statusKey] ? item[bankNameKey] : "Not registered"}
                                fontWeight="normal"
                                fontSize={14}
                                lineHeight={18}
                                textAlign="left"
                                color={DARK_GREY}
                                style={styles.statusText}
                            />
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList data={items} renderItem={renderItems} />
        </View>
    );
};

DuitnowCard.propTypes = {
    onPress: PropTypes.func.isRequired,
    idTypeKey: PropTypes.string,
    idValue: PropTypes.string,
    valueKey: PropTypes.string,
    statusKey: PropTypes.string,
    bankNameKey: PropTypes.string,
    isDisplayStatus: PropTypes.bool,
    ishideIcon: PropTypes.bool,
    items: PropTypes.array,
};
DuitnowCard.defaultProps = {
    isSelectButton: false,
    isDisplayStatus: true,
    ishideIcon: false,
};
export default React.memo(DuitnowCard);

const styles = StyleSheet.create({
    actionLabel: {
        marginLeft: 20,
    },
    chevronButton: {
        height: 24,
        marginLeft: "90%",
        width: 24,
    },
    containerView: {
        backgroundColor: WHITE,
        borderBottomColor: GREY,
        borderBottomWidth: 1,
        height: 120,
    },
    contentView: {
        flex: 1,
        marginLeft: 24,
        marginRight: 24,
    },
    displayView: {
        alignItems: "center",
        flexDirection: "row",
        height: 20,
        marginTop: 5,
    },
    iconView: {
        width: "40%",
    },
    statusText: {
        marginTop: 10,
    },
    titleText: {
        marginTop: 15,
    },
    valueText: {
        width: "60%",
    },
});
