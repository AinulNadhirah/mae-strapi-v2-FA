import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { DARK_GREY } from "@constants/colors";

const SectionItems = ({ title, list }) => {
    return (
        <>
            <Typo
                fontSize={13}
                letterSpacing={0}
                lineHeight={20}
                textAlign="left"
                text={title}
                style={styles.uppercase}
            />
            <SpaceFiller height={4} />
            <View style={styles.lineStyle} />
            <SpaceFiller height={8} />
            {list.map((item, index) => {
                return (
                    <TouchableOpacity
                        key={index}
                        style={styles.textContainer}
                        onPress={item.onPress}
                    >
                        <Typo
                            fontSize={20}
                            letterSpacing={0}
                            lineHeight={20}
                            textAlign="left"
                            fontWeight="600"
                            style={styles.uppercaseItem}
                            text={item.title}
                        />
                    </TouchableOpacity>
                );
            })}
        </>
    );
};

SectionItems.propTypes = {
    title: PropTypes.string,
    list: PropTypes.array,
};

SectionItems.defaultProps = {
    text: "",
    list: [],
};

const styles = StyleSheet.create({
    lineStyle: {
        backgroundColor: DARK_GREY,
        height: 1,
    },
    textContainer: {
        alignItems: "center",
        flexDirection: "row",
        marginVertical: 6,
    },
    uppercase: {
        textTransform: "uppercase",
    },
    uppercaseItem: {
        flex: 1,
        textTransform: "uppercase",
    },
});

export default SectionItems;
