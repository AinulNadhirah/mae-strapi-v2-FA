import { useNavigation } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { Image, View, StyleSheet } from "react-native";

import { DASHBOARD_STACK } from "@navigation/navigationConstant";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import ActionButton from "@components/Buttons/ActionButton";
import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { MEDIUM_GREY, SHADOW_LIGHT, WHITE, YELLOW, BLACK } from "@constants/colors";
import { FESTIVE_DEEPAVALI, FESTIVE_MERDEKA } from "@constants/strings";
import { ENDPOINT_BASE } from "@constants/url";

import { responsive } from "@utils";

import { tapTasticAssets } from "@assets";

function LoadingBg() {
    return (
        <View style={styles.loader}>
            <ShimmerPlaceHolder autoRun style={styles.loaderInner} />
        </View>
    );
}

function SortToWinWidget({
    description = "",
    buttonText = "",
    isTapTastic = false,
    festiveType = "",
    gameStatus = 200,
}) {
    const navigation = useNavigation();
    const [imageLoaded, setLoad] = useState(false);
    const [image, setImage] = useState(
        tapTasticAssets[festiveType ? festiveType.toLowerCase() : "generic"].dashboardWidget
    );

    const fontWeightage = isTapTastic ? "600" : "bold";

    function handleOnPress() {
        if (festiveType === FESTIVE_DEEPAVALI) {
            navigation.navigate(DASHBOARD_STACK, {
                screen: "Dashboard",
                params: {
                    screen: "FestiveQuickActionScreen",
                },
            });
        }
    }

    function handleImageLoad() {
        setLoad(true);
    }

    // const tapTasticImg = typeof tapTasticAssets[festiveType].dashboardWidget ===;

    useEffect(() => {
        if (isTapTastic) {
            try {
                setImage(
                    tapTasticAssets[festiveType ? festiveType.toLowerCase() : "generic"]
                        .dashboardWidget
                );
            } catch (ex) {
                // do nothing
            }
        }
    }, [festiveType, isTapTastic]);

    const bannerText = (festiveType) => {
        if (festiveType.toLowerCase() === FESTIVE_DEEPAVALI) {
            return "";
        } else {
            return `Win a Proton X50,\ncash prizes, vouchers\nand more!`;
        }
    };

    const getTextColor = (festiveType) => {
        festiveType.toLocaleLowerCase == FESTIVE_MERDEKA ? BLACK : WHITE;
    };

    const getButtonText = () => {
        gameStatus === -1 ? `View Rewards` : `${buttonText ?? "Play Now!"}`;
    };

    return (
        <View style={styles.sortWinContainer}>
            <TouchableSpring onPress={handleOnPress}>
                {({ animateProp }) => (
                    <Animated.View
                        style={{
                            transform: [
                                {
                                    scale: animateProp,
                                },
                            ],
                        }}
                    >
                        <View style={styles.sortWinContainerCard}>
                            <View
                                style={{
                                    ...StyleSheet.absoluteFill,
                                }}
                            >
                                <Image
                                    source={
                                        festiveType.toLowerCase() === "raya22" && gameStatus === -1
                                            ? tapTasticAssets[festiveType.toLowerCase()]
                                                  .dashboardDownWidget
                                            : image
                                    }
                                    style={styles.sortWinCardBgImg}
                                    onLoad={handleImageLoad}
                                />
                            </View>
                            {!imageLoaded ? (
                                <LoadingBg />
                            ) : (
                                <View style={styles.sortWinContainerInner}>
                                    <Typo
                                        fontSize={13}
                                        fontWeight={fontWeightage}
                                        lineHeight={15.5}
                                        color={getTextColor(FESTIVE_MERDEKA)}
                                        text={bannerText(festiveType)}
                                        textAlign="left"
                                    />

                                    {festiveType.toLowerCase() !== FESTIVE_DEEPAVALI && (
                                        <View style={styles.sortWinActionContainer}>
                                            <ActionButton
                                                activeOpacity={0.8}
                                                backgroundColor={YELLOW}
                                                borderRadius={15}
                                                height={30}
                                                componentCenter={
                                                    <Typo
                                                        fontSize={12}
                                                        fontWeight="600"
                                                        lineHeight={15}
                                                        text={getButtonText()}
                                                    />
                                                }
                                                style={styles.sortWinAction}
                                                onPress={handleOnPress}
                                            />
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                    </Animated.View>
                )}
            </TouchableSpring>
        </View>
    );
}

const styles = StyleSheet.create({
    loader: {
        ...StyleSheet.absoluteFill,
        backgroundColor: WHITE,
        borderRadius: 8,
        padding: 16,
        width: "100%",
    },
    loaderInner: {
        borderRadius: 8,
        height: "100%",
        width: "100%",
    },
    sortWinAction: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    sortWinActionContainer: {
        flexDirection: "row",
        marginTop: 12,
    },
    sortWinCardBgImg: {
        borderRadius: 8,
        height: "100%",
        width: "100%",
    },
    sortWinContainer: {
        backgroundColor: MEDIUM_GREY,
        paddingBottom: 36,
        paddingHorizontal: 24,
    },
    sortWinContainerCard: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        flex: 1,
        flexDirection: "row",
        height: 88,

        position: "relative",
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
    },
    sortWinContainerInner: {
        paddingLeft: 16,
        paddingVertical: 16,
        width: responsive.widthPercentage(54),
    },
});

SortToWinWidget.propTypes = {
    buttonText: PropTypes.string,
    description: PropTypes.string,
    isTapTastic: PropTypes.bool,
    getModel: PropTypes.func,
    festiveType: PropTypes.string,
    gameStatus: PropTypes.number,
};

export default withModelContext(SortToWinWidget);
