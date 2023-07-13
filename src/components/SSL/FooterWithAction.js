import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import Typo from "@components/Text";

import { BLACK, WHITE, YELLOW } from "@constants/colors";

import SSLStyles from "@styles/SSLStyles";

function FooterWithAction({ onPress, desc, actionLbl }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.letUsKnowContainer, SSLStyles.pillShadow]}
        >
            <Typo
                fontSize={14}
                lineHeight={20}
                fontWeight="normal"
                fontStyle="normal"
                letterSpacing={0}
                textAlign="center"
                text={desc}
                color={BLACK}
            />
            <View style={styles.letUsKnowBtn} backgroundColor={YELLOW}>
                <Typo text={actionLbl} fontSize={12} fontWeight="semi-bold" />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    letUsKnowBtn: {
        alignSelf: "center",
        backgroundColor: YELLOW,
        borderRadius: 15,
        flexWrap: "wrap",
        marginBottom: 15,
        marginTop: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    letUsKnowContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        marginBottom: 30,
        marginHorizontal: 25,
        marginTop: 36 - 16, // 16 is due to component above's marginbottom
        paddingHorizontal: 33,
        paddingTop: 16,
    },
});

FooterWithAction.propTypes = {
    onPress: PropTypes.func,
    desc: PropTypes.string,
    actionLbl: PropTypes.string,
};

const Memoiz = React.memo(FooterWithAction);

export default Memoiz;
