import PropTypes from "prop-types";
import React from "react";
import { View, Image, StyleSheet } from "react-native";

import DynamicImageTransfer from "@components/Others/DynamicImageTransfer";
import Typo from "@components/Text";

import { BLACK, DARK_GREY, OFF_WHITE } from "@constants/colors";

import { getShadow } from "@utils/dataModel/utility";

const AccountDetailsView = ({ data, base64 = false, greyed = false }) => (
    <View>
        <View style={Styles.newTransferView}>
            <View style={Styles.newTransferViewInner1}>
                {base64 ? (
                    <View style={Styles.circleImageViewEmpty}>
                        <DynamicImageTransfer item={data?.image} />
                    </View>
                ) : (
                    <View style={Styles.circleImageView}>
                        <Image
                            style={Styles.newTransferCircle}
                            source={{ uri: data?.image?.image }}
                            accessible={true}
                            resizeMode="cover"
                        />
                    </View>
                )}
            </View>
            <View style={Styles.newTransferViewInnerHalf}>
                {data.name ? (
                    <View style={Styles.titleView}>
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={18}
                            color={BLACK}
                            textAlign="left"
                            text={data.name}
                            style={styles.wrapShrink}
                        />
                    </View>
                ) : (
                    <View />
                )}
                {data.description1 ? (
                    <View style={Styles.descriptionView}>
                        <Typo
                            fontSize={12}
                            fontWeight="300"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={18}
                            color={BLACK}
                            textAlign="left"
                            text={data.description1}
                            multiline={true}
                            numberOfLines={5}
                            style={styles.wrapShrink}
                        />
                    </View>
                ) : (
                    <View />
                )}

                {data.description2 ? (
                    <Typo
                        fontSize={12}
                        fontWeight="300"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={17}
                        color={greyed ? DARK_GREY : BLACK}
                        textAlign="left"
                        text={data.description2}
                    />
                ) : (
                    <View />
                )}

                <View />
            </View>
        </View>
    </View>
);

AccountDetailsView.propTypes = {
    base64: PropTypes.bool,
    data: PropTypes.shape({
        description1: PropTypes.any,
        description2: PropTypes.any,
        image: PropTypes.shape({
            image: PropTypes.any,
        }),
        name: PropTypes.any,
    }),
    greyed: PropTypes.bool,
};

const Styles = {
    titleView: {
        paddingEnd: 36,
        paddingBottom: 1,
    },
    descriptionView: {
        paddingEnd: 36,
        marginTop: 1,
    },
    newTransferView: {
        width: "100%",
        minHeight: 80,
        minWidth: "90%",
        marginBottom: 12,
        marginTop: 16,
        flexDirection: "row",
        justifyContent: "flex-start",
    },

    newTransferViewInner1: {
        flexDirection: "column",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        padding: 1,
    },

    newTransferViewInnerHalf: {
        marginLeft: 15,
        justifyContent: "center",
        flexDirection: "column",
        flexGrow: 1,
        flex: 1,
    },

    newTransferCircle: {
        width: 59,
        height: 59,
        borderRadius: 59 / 2,
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
    },
    circleImageViewEmpty: {
        width: 60,
        height: 60,
        borderRadius: 60 / 2,
        marginLeft: 0,
        marginTop: 8,
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
    },
    circleImageView: {
        width: 62,
        height: 62,
        borderRadius: 62 / 2,
        marginLeft: 0,
        marginTop: 8,
        borderWidth: 2,
        borderColor: OFF_WHITE,
        backgroundColor: OFF_WHITE,
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        ...getShadow({
            elevation: 4, // android
        }),
    },
};
export default AccountDetailsView;

const styles = StyleSheet.create({
    wrapShrink: { flexShrink: 1, flexWrap: "wrap" },
});
