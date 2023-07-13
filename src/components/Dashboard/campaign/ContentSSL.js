import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet } from "react-native";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { YELLOW } from "@constants/colors";

const ContentSSL = ({ data }) => {
    return (
        <>
            <Typo
                fontSize={13}
                fontWeight="700"
                lineHeight={18}
                text={data.title}
                textAlign="left"
            />
            <SpaceFiller height={3} />
            <Typo
                fontSize={13}
                fontWeight="400"
                lineHeight={18}
                letterSpacing={0}
                text={data.description}
                textAlign="left"
            />
            <SpaceFiller height={10} />
            <View style={styles.buttonContainerYellow}>
                <Typo fontSize={11.5} fontWeight="600" text={data.buttonText} />
            </View>
        </>
    );
};

ContentSSL.propTypes = {
    data: PropTypes.object,
};

const styles = StyleSheet.create({
    buttonContainerYellow: {
        alignSelf: "flex-start",
        backgroundColor: YELLOW,
        borderRadius: 20,
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
});

export default withModelContext(ContentSSL);
