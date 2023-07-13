import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, TouchableOpacity, Image, ScrollView } from "react-native";

import Typo from "@components/Text";

import { ROYAL_BLUE } from "@constants/colors";

import assets from "@assets";

export default function TnCPopupContentComponent({ promotionPills, onPressTnC }) {
    return (
        <View style={styles.contentComponent}>
            <ScrollView>
                <Typo
                    text="Promotions"
                    textAlign="left"
                    fontSize={14}
                    lineHeight={18}
                    fontWeight="600"
                    style={styles.titlePadding}
                />
                {promotionPills?.map((obj, index) => {
                    return (
                        <View style={styles.promotionView} key={`${index}`}>
                            <Image source={assets.SSLIcon32BlackBookmark} style={styles.bookmark} />
                            <View style={styles.promoTitleDesc}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="semi-bold"
                                    lineHeight={20}
                                    textAlign="left"
                                    text={obj?.title}
                                />
                                <Typo
                                    fontSize={14}
                                    lineHeight={20}
                                    textAlign="left"
                                    text={obj?.longDesc}
                                />
                                {!!obj?.tncLink && (
                                    <TouchableOpacity
                                        // eslint-disable-next-line react/jsx-no-bind
                                        onPress={() => onPressTnC(obj?.tncLink)}
                                        style={styles.tncContainer}
                                    >
                                        <Typo
                                            color={ROYAL_BLUE}
                                            fontWeight="semi-bold"
                                            fontSize={14}
                                            lineHeight={20}
                                            textAlign="left"
                                            text="View Terms & Conditions"
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}
TnCPopupContentComponent.propTypes = {
    promotionPills: PropTypes.array,
    onPressTnC: PropTypes.func,
};

const styles = StyleSheet.create({
    bookmark: {
        alignSelf: "flex-start",
        height: 20,
        marginTop: 4,
        width: 20,
    },
    contentComponent: { maxHeight: 580, paddingHorizontal: 40, paddingVertical: 40 },
    promoTitleDesc: {
        flex: 1,
        flexDirection: "column",
        paddingLeft: 15,
    },
    promotionView: {
        alignItems: "center",
        flexDirection: "row",
        flex: 1,
        paddingTop: 8,
    },
    titlePadding: { paddingBottom: 15 },
    tncContainer: { paddingBottom: 10, paddingTop: 4 },
});
