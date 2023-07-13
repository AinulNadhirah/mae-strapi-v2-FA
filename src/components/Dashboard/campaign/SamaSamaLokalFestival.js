import { useNavigation } from "@react-navigation/native";
import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import CacheeImageWithDefault from "@components/CacheeImageWithDefault";
import ContentSSL from "@components/Dashboard/campaign/SSLContent";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { SHADOW_LIGHT } from "@constants/colors";

import useFestive from "@utils/useFestive";

function SamaSamaLokalFestival({ onPress }) {
    // const navigation = useNavigation();
    const { festiveAssets, festiveNavigation, getSSLDashboardContent } = useFestive();

    // function handleOnPress() {
    //     goToSSL(navigation);
    // }

    /**
     * showing "active" content for small banner
     */
    return (
        <>
            <View style={styles.dashboardWidgetHeader}>
                <Typo
                    fontSize={16}
                    fontWeight="600"
                    lineHeight={19.5}
                    text={festiveAssets?.ssl?.headerTitle} //edit title taptrackwin
                />
            </View>
            <View style={styles.container}>
                <TouchableSpring onPress={onPress}>
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
                            {/* trying to edit for ssl */}

                            <View style={styles.innerContainer}>
                                <CacheeImageWithDefault
                                    image={festiveAssets?.greetingReceived?.background}
                                    style={styles.image}
                                />
                                <CacheeImageWithDefault
                                    image={festiveAssets?.dashboard?.logo}
                                    style={styles.logo}
                                />
                                <CacheeImageWithDefault
                                    image={festiveAssets?.ssl?.handLogo}
                                    style={styles.handLogo}
                                />
                                <View style={styles.contentContainer}>
                                    <ContentSSL data={getSSLDashboardContent("active")} />
                                </View>
                            </View>
                        </Animated.View>
                    )}
                </TouchableSpring>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    animatedContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        height: 160,
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
        height: 130,
        position: "absolute",
        right: 16,
        width: 127,
        marginBottom: 30,
    },
    handLogo: {
        bottom: 6,
        height: 10,
        position: "absolute",
        right: 25,
        width: 85,
        marginBottom: 10,
    },
    dashboardWidgetHeader: {
        alignItems: "flex-start",
        flexDirection: "column",
        justifyContent: "space-between",
        marginBottom: 24,
        marginHorizontal: 24,
    },
});

// GameWithoutTracker.propTypes = {
//     updateModel: PropTypes.func,
//     getModel: PropTypes.func,
// };

export default withModelContext(SamaSamaLokalFestival);
