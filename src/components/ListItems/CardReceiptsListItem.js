import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import moment from "moment";
import numeral from "numeral";
import Typo from "@components/Text";
import { YELLOW, DARK_GREY, RED, GREEN } from "@constants/colors";
import BorderedAvatar from "@components/Avatars/BorderedAvatar";

const CardReceiptsListItem = ({
    onListItemPressed,
    iconImgUrl,
    iconBgColor,
    title,
    desc,
    amount,
    iconPadded,
    hideIcon,
    date,
    amountForeign,
    currencyCode,
    billingCurrency,
    showForeign,
    ...props
}) => (
    <View style={styles.container}>
        <TouchableOpacity activeOpacity={0.8} onPress={onListItemPressed}>
            <React.Fragment>
                <View style={styles.contentContainer}>
                    {!hideIcon && (
                        <View style={styles.avatarContainer}>
                            <BorderedAvatar
                                backgroundColor={iconBgColor != null ? iconBgColor : YELLOW}
                            >
                                <View style={styles.imageContainer}>
                                    <Image
                                        style={iconPadded ? styles.image : styles.imageFull}
                                        source={iconImgUrl}
                                    />
                                </View>
                            </BorderedAvatar>
                        </View>
                    )}
                    <View style={styles.descContainer}>
                        <Typo
                            fontWeight={"600"}
                            textAlign={"left"}
                            fontSize={12}
                            lineHeight={19}
                            numberOfLines={date ? 1 : 3}
                            text={title}
                        />

                        {desc !== "" && (
                            <View style={styles.secondaryContainer}>
                                <Typo
                                    textAlign={"left"}
                                    fontSize={12}
                                    lineHeight={12}
                                    color={"#7c7c7d"}
                                    text={desc}
                                />
                            </View>
                        )}

                        {date && (
                            <View style={styles.secondaryContainer}>
                                <Typo
                                    textAlign="left"
                                    fontSize={12}
                                    fontWeight="normal"
                                    lineHeight={12}
                                    text={moment(date, "YYYY-MM-DD HH:mm:ss.0").format(
                                        "DD/MM/YYYY"
                                    )}
                                    color={DARK_GREY}
                                />
                            </View>
                        )}
                    </View>
                    <View>
                        {showForeign && (
                            <View style={styles.secondaryContainer}>
                                <Typo
                                    fontWeight={"600"}
                                    textAlign={"right"}
                                    fontSize={12}
                                    lineHeight={12}
                                    color={Math.sign(amountForeign) === -1 ? RED : GREEN}
                                    text={`${
                                        Math.sign(amountForeign) === -1 ? "-" : ""
                                    }${currencyCode} ${numeral(Math.abs(amountForeign)).format(
                                        "0,0.00"
                                    )}`}
                                />
                            </View>
                        )}

                        <Typo
                            fontWeight={"600"}
                            textAlign={"right"}
                            fontSize={12}
                            lineHeight={12}
                            color={Math.sign(amount) === -1 ? RED : GREEN}
                            text={`${
                                Math.sign(amount) === -1 ? "-" : ""
                            }${billingCurrency} ${numeral(Math.abs(amount)).format("0,0.00")}`}
                        />
                    </View>
                </View>
            </React.Fragment>
        </TouchableOpacity>
    </View>
);

CardReceiptsListItem.propTypes = {
    onListItemPressed: PropTypes.func.isRequired,
    iconImgUrl: PropTypes.any.isRequired,
    iconBgColor: PropTypes.string,
    title: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    iconPadded: PropTypes.bool,
    hideIcon: PropTypes.bool,
    date: PropTypes.string,
    amountForeign: PropTypes.number,
    currencyCode: PropTypes.string,
    showForeign: PropTypes.bool,
    billingCurrency: PropTypes.string,
};

CardReceiptsListItem.defaultProps = {
    onListItemPressed: () => {},
    iconImgUrl: "",
    iconBgColor: YELLOW,
    title: "",
    desc: "",
    amount: 0,
    iconPadded: true,
    hideIcon: false,
    date: null,
    amountForeign: null,
    currencyCode: null,
    showForeign: false,
    billingCurrency: "RM",
};

const Memoiz = React.memo(CardReceiptsListItem);

export default Memoiz;

const styles = StyleSheet.create({
    avatarContainer: { height: 36, marginRight: 8, width: 36 },
    container: {
        marginBottom: 12,
        width: "100%",
    },
    contentContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        minHeight: 48,
        width: "100%",
    },
    descContainer: { flex: 1, paddingRight: 24 },
    image: {
        height: "55%",
        resizeMode: "contain",
        width: "55%",
    },
    imageContainer: {
        alignItems: "center",
        borderRadius: 22,
        height: 36,
        justifyContent: "center",
        overflow: "hidden",
        width: 36,
    },
    imageFull: {
        height: "90%",
        resizeMode: "contain",
        width: "90%",
    },
    secondaryContainer: {
        marginTop: 2,
    },
});
