import { CacheeImage } from "cachee";
import PropTypes from "prop-types";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { DARK_GREY, GRANDIS, WHITE } from "@constants/colors";

import { insertSeparators } from "@utils/array";
import useFestive from "@utils/useFestive";

const { width } = Dimensions.get("window");

const GameProgress = ({ data }) => {
    const { festiveAssets, getImageUrl } = useFestive();

    const assets = festiveAssets?.dashboard?.gameProgress;
    const backgroundColor = assets?.backgroundColor ?? GRANDIS;
    const entriesContainerColor = assets?.entriesContainerColor;
    const borderColor = assets?.borderColor;

    const progressData = [
        {
            image: getImageUrl(assets?.widgetItem1),
            title: assets?.descriptionWidgetItem1,
            total: getTotalEntries("grand_entries"),
        },
        {
            image: getImageUrl(assets?.widgetItem2),
            title: assets?.descriptionWidgetItem2,
            total: getTotalEntries("entries"),
        },
    ];

    function getTotalEntries(entitlementsMethod) {
        const entitlements = data?.entitlements;
        return entitlements?.length > 0
            ? entitlements?.find((item) => item.entitlement_method === entitlementsMethod)
                  ?.entitlement_count ?? 0
            : 0;
    }
    return (
        <View style={[styles.container, { backgroundColor, borderColor }]}>
            <View style={styles.innerContainer}>
                <Typo
                    fontSize={13}
                    fontWeight="400"
                    color={DARK_GREY}
                    text={assets?.title}
                    textAlign="center"
                />
                <View style={styles.progressContainer}>
                    {insertSeparators(
                        progressData.map((item, index) => {
                            return (
                                <View style={styles.itemContainer} key={`${index}-progress-item`}>
                                    <CacheeImage source={item.image} style={styles.image} />
                                    <SpaceFiller height={12} />
                                    <View style={styles.textContainer}>
                                        <View
                                            style={[
                                                styles.totalValueContainer,
                                                { backgroundColor: entriesContainerColor },
                                            ]}
                                        >
                                            <Typo
                                                fontSize={18}
                                                fontWeight="600"
                                                text={item?.total?.toString()}
                                                letterSpacing={0}
                                                lineHeight={24}
                                            />
                                        </View>
                                        <SpaceFiller width={8} />
                                        <Typo
                                            fontSize={0.03 * width}
                                            numberOfLines={2}
                                            fontWeight="600"
                                            text={item.title}
                                            textAlign="left"
                                        />
                                    </View>
                                </View>
                            );
                        }),
                        (index) => (
                            <SpaceFiller key={`${index}-space`} width={8} />
                        )
                    )}
                </View>
            </View>
        </View>
    );
};

GameProgress.propTypes = {
    data: PropTypes.object,
    festiveType: PropTypes.string,
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        borderRadius: 12,
        borderWidth: 6,
        flex: 1,
    },
    image: { height: 85, width: "100%" },
    innerContainer: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderColor: WHITE,
        borderRadius: 8,
        padding: 8,
    },
    itemContainer: { flex: 1 },
    progressContainer: { flex: 1, flexDirection: "row", padding: 4 },
    textContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    totalValueContainer: {
        borderRadius: 4,
        height: 35,
        justifyContent: "center",
        width: 35,
    },
});

export default GameProgress;
