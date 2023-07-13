import { useNavigation } from "@react-navigation/native";
import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import CacheeImageWithDefault from "@components/CacheeImageWithDefault";
import Content from "@components/Dashboard/campaign/Content";
import GameProgress from "@components/Dashboard/campaign/GameProgress";
import SpaceFiller from "@components/Placeholders/SpaceFiller";

import { SHADOW_LIGHT } from "@constants/colors";

import useFestive from "@utils/useFestive";

function GameWithTracker({ data, content }) {
    const navigation = useNavigation();
    const { festiveNavigation, festiveAssets } = useFestive();

    function handleOnPress() {
        festiveNavigation(navigation);
    }
    /**
     * showing "active" content for tracker + banner
     */
    return (
        <View style={styles.container}>
            <TouchableSpring onPress={handleOnPress}>
                {({ animateProp }) => (
                    <Animated.View
                        style={[
                            styles.animatedContainer,
                            {
                                transform: [
                                    {
                                        scale: animateProp,
                                    },
                                ],
                            },
                        ]}
                    >
                        <View style={styles.innerContainer}>
                            <CacheeImageWithDefault
                                image={
                                    festiveAssets?.dashboard?.dashboardWithTracker[data?.status]
                                        .background
                                }
                                style={styles.image}
                                resizeMode="stretch"
                            />
                            <CacheeImageWithDefault
                                image={festiveAssets?.dashboard?.dashboardLogo[data?.status].logo}
                                style={styles.logo}
                                resizeMode="stretch"
                            />
                            <View style={styles.contentContainer}>
                                <Content data={content} />
                                <SpaceFiller height={12} />
                                <GameProgress data={data} />
                            </View>
                        </View>
                    </Animated.View>
                )}
            </TouchableSpring>
        </View>
    );
}

GameWithTracker.propTypes = {
    data: PropTypes.object,
    content: PropTypes.object,
};

const styles = StyleSheet.create({
    animatedContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        height: 350,
        marginBottom: 36,
        marginHorizontal: 24,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    image: {
        borderRadius: 8,
        height: "100%",
        width: "100%",
        ...StyleSheet.absoluteFill,
    },
    innerContainer: {
        borderRadius: 8,
        elevation: 8,
        flex: 1,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
    },
    logo: {
        bottom: 6,
        height: 145,
        width: 160,
        position: "absolute",
        // right: 0,
        left: 185,
        top: 0,
    },
});

GameWithTracker.propTypes = {
    isRefresh: PropTypes.bool,
    updateModel: PropTypes.func,
    getModel: PropTypes.func,
};

export default GameWithTracker;
