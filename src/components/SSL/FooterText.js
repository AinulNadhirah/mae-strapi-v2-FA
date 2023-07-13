import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View } from "react-native";

import Typo from "@components/Text";

import { GREY_DARK } from "@constants/colors";

function FooterText({ text }) {
    return (
        <View style={styles.footerView}>
            <Typo fontSize={12} lineHeight={20} color={GREY_DARK} text={text} />
        </View>
    );
}

const styles = StyleSheet.create({
    footerView: { paddingBottom: 32, paddingHorizontal: 24, paddingTop: 26 },
});

FooterText.propTypes = {
    text: PropTypes.string,
};
export default React.memo(FooterText);
