import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { WHITE } from "@constants/colors";
import { DESC_EMPTY_STATE, LEARN_MORE, TITLE_EMPTY_STATE } from "@constants/strings";

import useFestive from "@utils/useFestive";

const Content = ({ data }) => {
    const { festiveAssets } = useFestive();
    const backgroundColor = festiveAssets?.dashboard?.gameProgress?.entriesContainerButton;

    return (
        <>
            <Typo
                fontSize={15}
                fontWeight="600"
                lineHeight={18}
                text={data.title}
                textAlign="left"
            />
            <SpaceFiller height={4} />
            <Typo
                fontSize={15}
                fontWeight="400"
                lineHeight={18}
                letterSpacing={0}
                text={data.description}
                textAlign="left"
            />
            <SpaceFiller height={12} />
            <View style={[styles.buttonContainer, backgroundColor && { backgroundColor }]}>
                <Typo fontSize={13} fontWeight="600" text={data.buttonText} />
            </View>
        </>
    );
};

Content.propTypes = {
    data: PropTypes.object,
};

Content.defaultProps = {
    data: {
        title: TITLE_EMPTY_STATE,
        description: DESC_EMPTY_STATE,
        buttonText: LEARN_MORE,
    },
};

const styles = StyleSheet.create({
    buttonContainer: {
        alignSelf: "flex-start",
        backgroundColor: WHITE,
        borderRadius: 20,
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
});

export default withModelContext(Content);
