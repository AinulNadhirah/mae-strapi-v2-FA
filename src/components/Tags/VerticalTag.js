import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Typo from "@components/Text";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import PropTypes from "prop-types";

const VerticalTag = ({ subcategory, title, color }) => {
    let categoryDetail = "";
    if (subcategory !== "") categoryDetail = `: ${subcategory}`;

    return (
        <View style={styles.container}>
            <SpaceFiller width={5} height={17} backgroundColor={color} />
            <SpaceFiller width={5} height={17} backgroundColor="transparent" />
            <Typo fontSize={12} fontWeight="bold" fontStyle="normal" letterSpacing={0}>
                <Text>{`${title} ${categoryDetail}`}</Text>
            </Typo>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
});

VerticalTag.propTypes = {
    color: PropTypes.string,
    subcategory: PropTypes.string,
    title: PropTypes.string.isRequired,
};

VerticalTag.defaultProps = {
    color: "#000",
    subcategory: "",
};

const Memoiz = React.memo(VerticalTag);

export default Memoiz;
