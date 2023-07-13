import moment from "moment";
import PropTypes from "prop-types";
import React, { memo } from "react";
import { View, StyleSheet, Image, TouchableOpacity, FlatList } from "react-native";

import { StatusTextView } from "@components/Common";
import Typo from "@components/Text";

import { GREY, WHITE, DARK_GREY } from "@constants/colors";
import { frequencyList } from "@constants/data/DuitNowRPP";

import Images from "@assets";

const DuitNowAutodebitCard = ({ onPress, items }) => {
    const renderItems = ({ item }) => {
        function handleOnPress() {
            onPress(item);
        }
        const freqObj = frequencyList?.find((el) => el?.code === item?.freqMode) ?? {};
        const consentFrequencyText = freqObj?.name ?? "";

        return (
            <TouchableOpacity onPress={handleOnPress}>
                <View style={styles.containerView}>
                    <View style={styles.contentView}>
                        {(item?.consentSts === "SUSP" || item?.consentSts === "SUSB") && (
                            <View style={styles.displayStatus}>
                                <StatusTextView status="Paused" />
                            </View>
                        )}
                        <Typo
                            text={consentFrequencyText}
                            fontWeight="normal"
                            fontSize={14}
                            lineHeight={18}
                            textAlign="left"
                            style={styles.titleText}
                        />
                        <View style={styles.displayView}>
                            <Typo
                                text={item.creditorName}
                                fontWeight="600"
                                fontSize={14}
                                lineHeight={18}
                                textAlign="left"
                                style={styles.valueText}
                            />
                            <View style={styles.iconView}>
                                <Image
                                    style={styles.chevronButton}
                                    source={Images.icChevronRight24Black}
                                />
                            </View>
                        </View>
                        <Typo
                            text={`${moment(item?.effctvDt).format("DD MMM YYYY")} to ${moment(
                                item?.xpryDt
                            ).format("DD MMM YYYY")}`}
                            fontWeight="normal"
                            fontSize={14}
                            lineHeight={18}
                            textAlign="left"
                            color={DARK_GREY}
                            style={styles.statusText}
                        />
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

DuitNowAutodebitCard.propTypes = {
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
DuitNowAutodebitCard.defaultProps = {
    isSelectButton: false,
    isDisplayStatus: true,
    ishideIcon: false,
};
export default memo(DuitNowAutodebitCard);

const styles = StyleSheet.create({
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
    displayStatus: {
        marginTop: 10,
        marginBottom: -10,
    },
});
