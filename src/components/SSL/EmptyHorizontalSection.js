import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, ImageBackground, Image, TouchableOpacity } from "react-native";

import TitleViewAllHeader from "@components/SSL/TitleViewAllHeader";
import Typo from "@components/Text";

import { YELLOW } from "@constants/colors";

import assets from "@assets";

function EmptyHorizontalSection({ title, desc, actionLbl, onPress }) {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            {!!title && <TitleViewAllHeader title={title} />}
            <ImageBackground source={assets.SSLSectionEmptyBg} style={styles.imgBg}>
                <View style={styles.iconView}>
                    <Image source={assets.sslXFoodIcon} style={styles.icon} />
                </View>
                <Typo
                    fontSize={14}
                    fontStyle="normal"
                    letterSpacing={0}
                    lineHeight={18}
                    text={desc}
                />

                <View style={styles.actionLblView} backgroundColor={YELLOW}>
                    <Typo text={actionLbl} fontSize={12} fontWeight="semi-bold" />
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    actionLblView: {
        alignSelf: "center",
        backgroundColor: YELLOW,
        borderRadius: 15,
        flexWrap: "wrap",
        marginBottom: 36,
        marginTop: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    container: { flex: 1 },
    icon: { height: 64, paddingBottom: 12, width: 64 },
    iconView: { marginBottom: 12, marginTop: 32 },
    imgBg: {
        alignItems: "center",
        borderRadius: 10,
        height: 252,
        justifyContent: "center",
        marginBottom: 30,
        marginHorizontal: 24,
        overflow: "hidden",
        paddingHorizontal: 24,
    },
});

EmptyHorizontalSection.propTypes = {
    title: PropTypes.string,
    desc: PropTypes.string,
    actionLbl: PropTypes.string,
    onPress: PropTypes.func,
};
const Memoiz = React.memo(EmptyHorizontalSection);
export default Memoiz;
