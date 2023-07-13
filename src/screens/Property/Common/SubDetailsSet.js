import PropTypes from "prop-types";
import { View, Image, StyleSheet } from 'react-native';
import React from 'react';
import Typo from "@components/Text";

const SubDetailsSet = ({ text, textColor, iconCls, icon, onLinkPress }) => {
    return (
        <View style={styles.metaViewCls}>
            <View style={iconCls}>
                <Image style={styles.iconCls} source={icon} />
            </View>
            <View style={styles.metaDetailCls}>
                <Typo
                    fontSize={12}
                    lineHeight={17}
                    fontWeight="normal"
                    textAlign="left"
                    color={textColor}
                    text={text}
                    onPress={onLinkPress}
                />
            </View>
        </View>
    );
};

SubDetailsSet.propTypes = {
    text: PropTypes.string,
    textColor: PropTypes.string,
    iconCls: PropTypes.object,
    onLinkPress: PropTypes.func,
    icon: PropTypes.element,
};

const styles = StyleSheet.create({
    metaViewCls: {
        flexDirection: "row",
        marginTop: 8,
    },
    iconCls: {
        height: 16,
        width: 16,
    },
    metaDetailCls: {
        flex: 0.9,
    },
});

export default SubDetailsSet;
