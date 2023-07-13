import React from "react";
import { TouchableOpacity, StyleSheet, Text, Image } from "react-native";
import PropTypes from "prop-types";
import Typo from "@components/Text";
import SpaceFiller from "@components/Placeholders/SpaceFiller";

const ContentCardLikeButton = ({ onLikeButtonPressed, isLiked, likeCount }) => {
    const _renderLikeIcon = () => {
        if (isLiked) {
            return (
                <Image style={styles.image} source={require("@assets/icons/ic_like_done.png")} />
            );
        } else {
            return <Image style={styles.image} source={require("@assets/icons/ic_like_no.png")} />;
        }
    };

    return (
        <TouchableOpacity style={styles.container} onPress={onLikeButtonPressed}>
            {_renderLikeIcon()}
            <SpaceFiller width={5} height={1} backgroundColor="transparent" />
            <Typo fontSize={12} lineHeight={17}>
                <Text>{likeCount}</Text>
            </Typo>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    image: {
        height: 24,
        width: 25,
    },
});

ContentCardLikeButton.propTypes = {
    onLikeButtonPressed: PropTypes.func.isRequired,
    isLiked: PropTypes.bool,
    likeCount: PropTypes.number,
};

ContentCardLikeButton.defaultProps = {
    isLiked: false,
    likeCount: 0,
};

const Memoiz = React.memo(ContentCardLikeButton);

export default Memoiz;
