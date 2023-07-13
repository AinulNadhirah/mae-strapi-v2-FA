import PropTypes from "prop-types";
import React from "react";
import { View, Image } from "react-native";

import Typo from "@components/Text";

import { FADE_GREY } from "@constants/colors";

const TransferAcknowledgeInfo = ({ image, title, description }) => {
    return (
        <React.Fragment>
            <Image
                accessibilityLabel="Image"
                testID="Image"
                style={Styles.images}
                source={
                    typeof image === "string" && image?.includes("http") ? { uri: image } : image
                }
            />
            <View style={[Styles.statusTextContainer]}>
                <Typo
                    fontSize={20}
                    fontWeight="300"
                    fontStyle="normal"
                    letterSpacing={0}
                    lineHeight={28}
                    textAlign="left"
                    text={title}
                />
                <View style={[Styles.statusDescription]}>
                    <Typo
                        fontSize={12}
                        fontWeight="normal"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        textAlign="left"
                        text={description}
                        color={FADE_GREY}
                    />
                </View>
            </View>
        </React.Fragment>
    );
};

TransferAcknowledgeInfo.propTypes = {
    image: PropTypes.any,
    title: PropTypes.string,
    description: PropTypes.string,
};

TransferAcknowledgeInfo.defaultProps = {
    image: "",
    title: "",
    description: "",
};

const Memoiz = React.memo(TransferAcknowledgeInfo);

export default Memoiz;

const Styles = {
    statusTextContainer: {
        marginTop: 24,
    },
    statusDescription: {
        marginTop: 8,
    },

    images: {
        resizeMode: "contain",
        width: 57,
        height: 57,
    },
};
