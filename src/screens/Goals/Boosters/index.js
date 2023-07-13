import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useCallback, useState, useEffect } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    Image,
    Text,
    TouchableOpacity,
    Animated,
} from "react-native";

import { BOOSTER_MODULE } from "@navigation/navigationConstant";

import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { getBoostersList } from "@services";
import { logEvent } from "@services/analytics";

import { WHITE, SHADOW_LIGHT, GREY, FADE_GREY } from "@constants/colors";
import {
    NEAREST_ONE,
    NEAREST_FIVE,
    NEAREST_TEN,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_TAB_NAME,
    TABUNG,
    BOOSTERS,
} from "@constants/strings";

import Images from "@assets";

// stupid currency constant include trailing spaces wth with people don't know how to define string constant???
const CURRENCY = "RM";
const tension = 70;
const friction = 7;

const styles = StyleSheet.create({
    boosterCard: {
        marginBottom: 16,
        paddingHorizontal: 24,
    },
    boosterCardActiveDesc: {
        marginBottom: 8,
    },
    boosterCardActiveFooter: {
        alignItems: "center",
        borderTopColor: GREY,
        borderTopWidth: 1,
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    boosterCardContent: {
        flex: 1,
        marginLeft: 20,
    },
    boosterCardContentRow: {
        alignItems: "center",
        flexDirection: "row",
        paddingBottom: 40,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    boosterCardFooterContent: {
        marginLeft: 8,
    },
    boosterCardFooterIcon: {
        height: 16,
        width: 16,
    },
    boosterCardIcon: {
        alignItems: "center",
        justifyContent: "center",
        width: 40,
    },
    boosterCardIconImg: {
        height: 48,
        width: 48,
    },
    boosterCardInner: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
    },
    boosterCardTouch: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    noGutter: {
        marginBottom: 0,
    },
    scroll: {
        paddingBottom: 24,
        // tab view roller tab have a padding bottom of 7
        paddingTop: 17,
    },
});

function BoosterCard({
    id,
    name,
    onPress,
    noGutter = false,
    active,
    boosterType,
    boosterGoalCount,
    info,
}) {
    const cardAnimation = new Animated.Value(1);

    function onPressIn() {
        Animated.spring(cardAnimation, {
            toValue: 0.97,
            tension,
            friction,
            useNativeDriver: true,
        }).start();
    }

    function onPressOut() {
        Animated.spring(cardAnimation, {
            toValue: 1,
            tension,
            friction,
            useNativeDriver: true,
        }).start();
    }

    function handlePress() {
        onPress({ id, boosterType, active, info });
    }

    function getSpareChangeValue(value) {
        switch (value) {
            case NEAREST_ONE:
                return `${CURRENCY}1`;
            case NEAREST_FIVE:
                return `${CURRENCY}5`;
            case NEAREST_TEN:
                return `${CURRENCY}10`;
            default:
                return `${CURRENCY}0`;
        }
    }

    function getIcon() {
        switch (boosterType) {
            case "S":
                return Images.spareChange;
            case "G":
                return Images.guiltyPleasure;
            case "Q":
                return Images.scanAndSave;
            default:
                return null;
        }
    }

    function getDescriptions() {
        switch (boosterType) {
            case "S":
                if (active)
                    return (
                        <>
                            <Text>Your expenses will be rounded up to the nearest </Text>
                            <Typo
                                fontWeight="bold"
                                fontSize={14}
                                lineHeight={20}
                                textAlign="left"
                                text={getSpareChangeValue(info?.spareChange)}
                            />
                            <Text> and placed into your Tabung.</Text>
                        </>
                    );
                // return `Round up to the nearest ${getSpareChangeValue(info?.spareChange)}.`;
                return "Round up daily expenses and invest all that spare change into your Tabung.";
            case "G":
                if (active)
                    return "You’ve set up a daily limit for your chosen category. If you overspend, you’ll put aside some money into your Tabung.";
                // if (active) return "View how much this Booster has helped your Tabung savings.";
                return "Turn overspending into a savings opportunity with this booster.";
            case "Q":
                if (active)
                    return "The savings you get from Scan & Pay promos will be placed into your Tabung.";
                // if (active) return "View how much you've saved from promos using this Booster.";
                return "Kickstart your Tabung by channeling savings from all your Scan & Pay transactions.";
            default:
                return "";
        }
    }

    return (
        <View style={[styles.boosterCard, noGutter && styles.noGutter]}>
            <Animated.View
                style={[
                    styles.boosterCardInner,
                    {
                        transform: [
                            {
                                scale: cardAnimation,
                            },
                        ],
                    },
                ]}
            >
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    onPress={handlePress}
                >
                    <View style={styles.boosterCardTouch}>
                        <Typo
                            fontWeight="600"
                            fontSize={16}
                            lineHeight={18}
                            textAlign="left"
                            text={name}
                        />
                    </View>
                    <View style={styles.boosterCardContentRow}>
                        <View style={styles.boosterCardIcon}>
                            <Image source={getIcon()} style={styles.boosterCardIconImg} />
                        </View>
                        <View style={styles.boosterCardContent}>
                            {active ? (
                                <>
                                    <Typo
                                        fontWeight="normal"
                                        fontSize={14}
                                        lineHeight={20}
                                        textAlign="left"
                                        style={styles.boosterCardActiveDesc}
                                    >
                                        {getDescriptions()}
                                    </Typo>
                                </>
                            ) : (
                                <Typo
                                    fontWeight="normal"
                                    fontSize={14}
                                    lineHeight={20}
                                    textAlign="left"
                                    text={getDescriptions()}
                                />
                            )}
                        </View>
                    </View>
                    {active && (
                        <View style={styles.boosterCardActiveFooter}>
                            <Image
                                source={Images.tabungFlag}
                                style={styles.boosterCardFooterIcon}
                            />
                            <View style={styles.boosterCardFooterContent}>
                                <Typo
                                    fontWeight="normal"
                                    fontSize={12}
                                    lineHeight={18}
                                    textAlign="left"
                                    color={FADE_GREY}
                                    text={`Activated in ${boosterGoalCount} Tabung`}
                                />
                            </View>
                        </View>
                    )}
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

BoosterCard.propTypes = {
    id: PropTypes.number,
    name: PropTypes.string,
    onPress: PropTypes.func,
    noGutter: PropTypes.bool,
    active: PropTypes.bool,
    boosterType: PropTypes.string,
    boosterGoalCount: PropTypes.number,
    info: PropTypes.object,
};

function Boosters({ key }) {
    const [boosters, setBoosters] = useState([]);
    const navigation = useNavigation();
    const route = useRoute();

    function getSpareChangeValueMessage(value) {
        switch (value) {
            case NEAREST_ONE:
                return {
                    amount: `${CURRENCY} 1.00`,
                    message: value,
                };
            case NEAREST_FIVE:
                return {
                    amount: `${CURRENCY} 5.00`,
                    message: value,
                };
            case NEAREST_TEN:
                return {
                    amount: `${CURRENCY} 10.00`,
                    message: value,
                };

            default:
                return {
                    amount: `${CURRENCY} 1.00`,
                    message: null,
                };
        }
    }

    function handleGoTo({ id, boosterType, active, info }) {
        // make use of the type and active status to navigate
        if (!active) {
            // go to setup
            navigation.navigate(BOOSTER_MODULE, {
                // for scan and save we go to summary straight away
                screen: boosterType === "Q" ? "BoosterSummary" : "BoosterSetup",
                params: {
                    boosterId: id,
                    boosterType,
                },
            });
        } else {
            const params = getSpareChangeValueMessage(info.spareChange);

            // go to manage
            navigation.navigate(BOOSTER_MODULE, {
                screen: "BoosterSummary",
                params: {
                    boosterType,
                    active,
                    boosterId: id,
                    amount: params?.amount ?? null,
                    message: params?.message ?? null,
                },
            });
        }
    }

    const getBoosters = useCallback(async () => {
        try {
            const response = await getBoostersList();

            if (response && response.data) {
                const { resultList } = response.data;

                // we don't want get fit yet
                const withoutFitness = resultList.filter((boost) => boost.boosterType !== "F");

                setBoosters(withoutFitness);
            }
        } catch (error) {
            showErrorToast({
                message: "Unable to get the booster list.",
            });
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            const isRefreshing = route.params?.refresh;

            if (isRefreshing) {
                getBoosters();
            }

            return () => {};
        }, [route, getBoosters])
    );

    useEffect(() => {
        if (!boosters.length) {
            getBoosters();
        }
    }, [boosters, getBoosters]);

    return (
        <ScrollView contentContainerStyle={styles.scroll}>
            {boosters.map((booster) => (
                <BoosterCard key={booster.id} onPress={handleGoTo} {...booster} />
            ))}
        </ScrollView>
    );
}

Boosters.propTypes = {
    getModel: PropTypes.func,
    key: PropTypes.string,
};

export default withModelContext(Boosters);
