import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, StyleSheet } from "react-native";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import CacheeImageWithDefault from "@components/CacheeImageWithDefault";
import Content from "@components/Dashboard/campaign/Content";

import { SHADOW_LIGHT } from "@constants/colors";

import useFestive from "@utils/useFestive";

function GameWithoutTracker() {
    const navigation = useNavigation();
    const { festiveAssets, festiveNavigation, getDashboardContent } = useFestive();

    function handleOnPress() {
        festiveNavigation(navigation);
    }
    /**
     * showing "active" content for small banner
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
                                    festiveAssets?.dashboard?.dashboardWithoutTracker.active
                                        .background
                                }
                                style={styles.image}
                            />
                            <CacheeImageWithDefault
                                image={festiveAssets?.dashboard?.dashboardLogo.active.logo}
                                style={styles.logo}
                            />
                            <View style={styles.contentContainer}>
                                <Content data={getDashboardContent("active")} />
                            </View>
                        </View>
                    </Animated.View>
                )}
            </TouchableSpring>
        </View>
    );
}

const styles = StyleSheet.create({
    animatedContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        height: 150,
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
    // logo: {
    //     bottom: 6,
    //     height: 130,
    //     position: "absolute",
    //     right: 16,
    //     width: 175,
    // },
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

export default GameWithoutTracker;
