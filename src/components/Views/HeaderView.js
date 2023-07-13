import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, Image } from "react-native";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

const HeaderView = ({ headerImage, title, description }) => {
    return (
        <React.Fragment>
            <Image source={headerImage} style={Style.bannerImage} resizeMode="stretch" />
            <SpaceFiller height={24} />
            <View style={Style.formContainer}>
                <View style={Style.contentContainer}>
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={21}
                        textAlign="left"
                        text={title}
                    />
                    <SpaceFiller height={4} />
                    <Typo
                        fontSize={16}
                        fontWeight="600"
                        lineHeight={24}
                        textAlign="left"
                        text={description}
                    />
                </View>
            </View>
        </React.Fragment>
    );
};

HeaderView.propTypes = {
    headerImage: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
};

const Style = StyleSheet.create({
    bannerImage: {
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },

    formContainer: {
        marginBottom: 40,
    },
});

export default HeaderView;
