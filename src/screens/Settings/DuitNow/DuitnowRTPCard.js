import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, TouchableOpacity, FlatList } from "react-native";

import Typography from "@components/Text";

import { GREY, WHITE, ROYAL_BLUE, DARK_GREY } from "@constants/colors";

import { toTitleCase, numberMasking } from "@utils/dataModel/rtdHelper";

const DuitnowRTPCard = ({ onPress, items, isAutoDebit, showBtn }) => {
    const renderItems = ({ item }) => {
        function handleOnPress() {
            onPress(item);
        }

        return (
            <TouchableOpacity onPress={showBtn ? handleOnPress : null}>
                <View style={styles.containerView}>
                    <View style={styles.containerViewInside}>
                        <View style={styles.displayViewLeft}>
                            <Typography
                                text={
                                    isAutoDebit
                                        ? toTitleCase(item?.merchantName)
                                        : item?.receiverName ?? ""
                                }
                                fontWeight="normal"
                                fontSize={14}
                                lineHeight={18}
                                textAlign="left"
                            />
                            {!isAutoDebit ? (
                                <Typography
                                    text={numberMasking(item?.receiverAcct ?? "")}
                                    fontWeight="600"
                                    fontSize={14}
                                    lineHeight={18}
                                    textAlign="left"
                                />
                            ) : null}
                            {item?.receiverProxyType ? (
                                <Typography
                                    text={item?.receiverProxyType}
                                    fontWeight="normal"
                                    fontSize={14}
                                    lineHeight={18}
                                    textAlign="left"
                                    color={DARK_GREY}
                                    style={styles.statusText}
                                />
                            ) : null}
                            {item?.bankName ? (
                                <Typography
                                    text={item?.bankName}
                                    fontWeight="normal"
                                    fontSize={14}
                                    lineHeight={18}
                                    textAlign="left"
                                    color={DARK_GREY}
                                    style={styles.statusText}
                                />
                            ) : null}
                        </View>
                        <View style={styles.displayViewRight}>
                            {showBtn && (
                                <Typography
                                    text="Unblock"
                                    fontWeight="600"
                                    fontSize={14}
                                    lineHeight={18}
                                    textAlign="left"
                                    color={ROYAL_BLUE}
                                    style={styles.actionLabel}
                                />
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };
    renderItems.propTypes = {
        item: PropTypes.any,
    };
    return <FlatList data={items} renderItem={renderItems} />;
};

DuitnowRTPCard.propTypes = {
    onPress: PropTypes.func.isRequired,
    idTypeKey: PropTypes.string,
    idValue: PropTypes.string,
    valueKey: PropTypes.string,
    statusKey: PropTypes.string,
    bankNameKey: PropTypes.string,
    isDisplayStatus: PropTypes.bool,
    ishideIcon: PropTypes.bool,
    items: PropTypes.array,
    isAutoDebit: PropTypes.bool,
    showBtn: PropTypes.bool,
};
DuitnowRTPCard.defaultProps = {
    isSelectButton: false,
    isDisplayStatus: true,
    ishideIcon: false,
};
export default React.memo(DuitnowRTPCard);

const styles = StyleSheet.create({
    actionLabel: {
        marginLeft: 20,
    },
    containerView: {
        backgroundColor: WHITE,
        borderBottomColor: GREY,
        borderBottomWidth: 1,
        paddingBottom: 24,
        paddingTop: 24,
    },
    containerViewInside: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 24,
        marginRight: 24,
    },
    displayViewLeft: {
        flex: 1,
        flexDirection: "column",
    },
    displayViewRight: {
        paddingRight: 22,
    },
    statusText: {
        marginTop: 10,
    },
});
