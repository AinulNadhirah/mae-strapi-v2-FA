import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View } from "react-native";

import Typo from "@components/Text";

import { GREY_300 } from "@constants/colors";
import * as Strings from "@constants/strings";

function CarouselEmptyView({ title, desc }) {
    return (
        <View style={styles.emptyPromotionContainer}>
            <Typo
                fontSize={18}
                fontWeight="bold"
                fontStyle="normal"
                letterSpacing={0}
                lineHeight={32}
                textAlign="center"
                text={title}
            />
            <Typo
                fontSize={14}
                fontWeight="normal"
                fontStyle="normal"
                letterSpacing={0}
                lineHeight={20}
                textAlign="center"
                text={desc}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    emptyPromotionContainer: {
        alignItems: "center",
        backgroundColor: GREY_300,
        borderRadius: 8,
        height: 200,
        justifyContent: "center",
        marginBottom: 50,
        marginHorizontal: 24,
        paddingHorizontal: 72,
    },
});

CarouselEmptyView.propTypes = {
    title: PropTypes.string,
    desc: PropTypes.string,
};

CarouselEmptyView.defaultProps = {
    title: Strings.PROMITION_EMPTY_TEXT,
    desc: Strings.PROMITION_EMPTY_DESC,
};

export default React.memo(CarouselEmptyView);
