import React from "react";
import { View, Image, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import Typography from "@components/Text";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import { WHITE, GREY, GRAY } from "@constants/colors";
import Assets from "@assets";

const AccountsDropdownInnerBody = ({ title, subtitle }) => {
    return (
        <>
            <View style={styles.container}>
                <Typography
                    fontSize={14}
                    lineHeight={14}
                    fontWeight="600"
                    textAlign="left"
                    text={title}
                    ellipsizeMode="tail"
                    numberOfLines={1}
                    style={styles.textCls}
                />
                <SpaceFiller height={2} />
                <Typography
                    fontSize={12}
                    lineHeight={12}
                    textAlign="left"
                    text={subtitle}
                    ellipsizeMode="tail"
                    numberOfLines={1}
                    style={styles.textCls}
                    color={GRAY}
                />
            </View>
            <Image source={Assets.downArrow} style={styles.imgCls} resizeMode="contain" />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 2,
    },
    disabledCls: {
        opacity: 0.5,
    },
    imgCls: {
        height: 15,
        marginLeft: 10,
        width: 15,
    },
    textCls: {
        flex: 1,
    },
    wrapperCls: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderColor: GREY,
        borderRadius: 25,
        borderStyle: "solid",
        borderWidth: 1,
        flexDirection: "row",
        height: 50,
        paddingHorizontal: 24,
        paddingVertical: 10,
    },
});

AccountsDropdownInnerBody.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
};

export default React.memo(AccountsDropdownInnerBody);
