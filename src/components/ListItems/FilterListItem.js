import React, { useCallback } from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import Typo from "@components/Text";
import assets from "@assets";
import { maskAccount, formateAccountNumber } from "@utils/dataModel/utility";

const FilterListItem = ({
    subItem,
    selected,
    creditCard,
    boldTitle,
    title,
    subtitle,
    onListItemPressed,
    ...props
}) => {
    const onPress = useCallback(() => onListItemPressed(subtitle));
    const containerStyle = [styles.container];
    if (subItem) containerStyle.push({ marginLeft: 30 });
    return (
        <TouchableOpacity style={containerStyle} onPress={onPress} {...props}>
            <View style={styles.row}>
                <Image
                    source={selected ? assets.icRadioChecked : assets.icRadioUnchecked}
                    style={styles.radioBtnImg}
                    resizeMode="contain"
                />
                <View style={styles.titleArea}>
                    <Typo
                        fontSize={17}
                        fontWeight={boldTitle ? "600" : "normal"}
                        lineHeight={23}
                        textAlign="left"
                        text={title}
                    />
                    {subtitle !== "" && (
                        <Typo
                            fontSize={17}
                            fontWeight={"normal"}
                            lineHeight={23}
                            textAlign="left"
                            text={
                                creditCard
                                    ? maskAccount(subtitle)
                                    : formateAccountNumber(subtitle, 12)
                            }
                        />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        width: "100%",
        marginBottom: 24,
    },
    radioBtnImg: {
        marginTop: 2,
        height: 20,
        width: 22,
    },
    row: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    titleArea: {
        alignItems: "flex-start",
        justifyContent: "center",
        marginLeft: 10,
        paddingRight: 24,
        flex: 1,
    },
});

FilterListItem.propTypes = {
    subItem: PropTypes.bool,
    selected: PropTypes.bool.isRequired,
    creditCard: PropTypes.bool,
    boldTitle: PropTypes.bool,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    onListItemPressed: PropTypes.func.isRequired,
};

FilterListItem.defaultProps = {
    subItem: false,
    selected: false,
    creditCard: false,
    boldTitle: false,
    title: "",
    subtitle: "",
    onListItemPressed: () => {},
};

const Memoiz = React.memo(FilterListItem);

export default Memoiz;
