import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { View, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from "react-native";

import Toggle from "@components/Inputs/Switch";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { WHITE, BLACK } from "@constants/colors";
import { FA_SCREEN_NAME, FA_TABUNG_TABUNGVIEW, FA_VIEW_SCREEN } from "@constants/strings";

import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

const Boosters = ({
    boosters,
    completed,
    onBoosterItemTogglePressed,
    onBoosterTooltipPressed,
    isLoadingBoosterStatus,
    onManageBoosterButtonPressed,
}) => {
    const onTogglePressed = useCallback(
        (value) => onBoosterItemTogglePressed(value),
        [onBoosterItemTogglePressed]
    );

    const onPress = useCallback(() => {
        onManageBoosterButtonPressed(1);
    }, [onManageBoosterButtonPressed]);

    return (
        <View style={[styles.container, styles.shadow]}>
            <View style={styles.headerContainer}>
                <Typo text="Boosters" fontSize={16} fontWeight="600" lineHeight={18} />
                <TouchableOpacity onPress={onBoosterTooltipPressed}>
                    <Image source={Assets.icInformation} style={styles.image} />
                </TouchableOpacity>
            </View>
            {boosters &&
                boosters.map((booster, index) => {
                    const { formattedTotalAmount, name } = booster;
                    return (
                        <React.Fragment key={`${name}-${index}`}>
                            <View style={styles.boosterContainer}>
                                <View style={styles.booterDetailContainer}>
                                    <View style={styles.boosterDetailNumberContainer}>
                                        <Typo
                                            text={`${index + 1}`}
                                            fontSize={15}
                                            lineHeight={15}
                                            fontWeight="600"
                                        />
                                    </View>
                                    <View style={styles.boosterDetailTextContainer}>
                                        <Typo
                                            text={name}
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                        <Typo
                                            text={`RM ${formattedTotalAmount}`}
                                            fontSize={14}
                                            lineHeight={18}
                                        />
                                    </View>
                                </View>
                                <Toggle value={{ ...booster }} onTogglePressed={onTogglePressed} />
                            </View>
                            {index <= boosters.length && <SpaceFiller height={20} />}
                        </React.Fragment>
                    );
                })}
            <TouchableOpacity style={styles.manageBoosterButtonContainer} onPress={onPress}>
                <Typo
                    text="Manage Boosters"
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={18}
                    color="#4a90e2"
                />
            </TouchableOpacity>
            {(isLoadingBoosterStatus || completed) && (
                <View style={styles.overlay}>
                    {isLoadingBoosterStatus && <ActivityIndicator color={BLACK} size="large" />}
                </View>
            )}
        </View>
    );
};

const BOOSTER_NUMBER_CONTAINER_COLOR = "#f4f4f4";

const styles = StyleSheet.create({
    boosterContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    boosterDetailNumberContainer: {
        alignItems: "center",
        backgroundColor: BOOSTER_NUMBER_CONTAINER_COLOR,
        borderRadius: 15,
        height: 30,
        justifyContent: "center",
        width: 30,
    },
    boosterDetailTextContainer: {
        alignItems: "flex-start",
        height: 40,
        justifyContent: "space-between",
        marginLeft: 12,
    },
    booterDetailContainer: {
        alignItems: "center",
        flexDirection: "row",
        height: 40,
    },
    container: {
        backgroundColor: WHITE,
        borderRadius: 8,
        padding: 32,
        width: "100%",
    },
    headerContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "flex-start",
        marginBottom: 24,
    },
    image: {
        height: 16,
        marginLeft: 8,
        width: 16,
    },
    manageBoosterButtonContainer: {
        marginTop: 32,
    },
    overlay: {
        alignItems: "center",
        backgroundColor: WHITE,
        bottom: 0,
        justifyContent: "center",
        left: 0,
        opacity: 0.8,
        position: "absolute",
        right: 0,
        top: 0,
    },
    shadow: {
        ...getShadow({}),
    },
});

Boosters.propTypes = {
    boosters: PropTypes.array.isRequired,
    completed: PropTypes.bool.isRequired,
    onBoosterItemTogglePressed: PropTypes.func.isRequired,
    onBoosterTooltipPressed: PropTypes.func.isRequired,
    isLoadingBoosterStatus: PropTypes.bool.isRequired,
    onManageBoosterButtonPressed: PropTypes.func.isRequired,
};

export default React.memo(Boosters);
