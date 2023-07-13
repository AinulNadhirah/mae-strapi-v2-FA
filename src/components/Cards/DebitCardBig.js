import PropTypes from "prop-types";
import React from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Dimensions,
    Image,
} from "react-native";

import Typo from "@components/Text";

import { BLACK, WHITE } from "@constants/colors";

import { maskAccount, getCardProviderImage } from "@utils/dataModel/utility";

export const { width, height } = Dimensions.get("window");

const DebitCardBig = ({ onCardPressed, image, title, accountNumber, desc, isAccountSuspended }) => (
    <View style={styles.container}>
        <TouchableOpacity activeOpacity={0.8} onPress={onCardPressed}>
            <ImageBackground source={image} style={styles.imageBackground(isAccountSuspended)}>
                <View style={styles.contentContainer}>
                    <View style={styles.headerContainer}>
                        <View style={styles.titleLabelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={18}
                                textAlign="left"
                                color={WHITE}
                                text={title}
                                numberOfLines={2}
                            />
                        </View>

                        <Image
                            style={styles.providerImage}
                            source={getCardProviderImage(accountNumber)}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.middleContainer}>
                        <Typo
                            fontSize={20}
                            fontWeight="400"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={26}
                            textAlign="left"
                            text={maskAccount(accountNumber, 12)}
                            color={WHITE}
                        />
                    </View>

                    <View style={styles.bottomContainer}>
                        <Typo
                            fontSize={12}
                            fontWeight="400"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={18}
                            textAlign="right"
                            color={WHITE}
                            text={desc}
                        />
                    </View>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    </View>
);

DebitCardBig.propTypes = {
    onCardPressed: PropTypes.func.isRequired,
    image: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    accountNumber: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    isAccountSuspended: PropTypes.bool,
};

DebitCardBig.defaultProps = {
    onCardPressed: () => {},
    image: "",
    title: "",
    accountNumber: "",
    desc: "",
    isAccountSuspended: false,
};

const styles = StyleSheet.create({
    bottomContainer: {
        bottom: 20,
        marginTop: 12,
        position: "absolute",
        right: 0,
    },
    container: {
        backgroundColor: BLACK,
        borderRadius: 8,
        elevation: 5,
        height: 200,
        overflow: "hidden",
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        width: width - 48,
    },
    contentContainer: {
        flex: 1,
        marginHorizontal: 16,
        marginTop: 20,
    },
    headerContainer: {
        flexDirection: "row",
    },
    imageBackground: (isAccountSuspended) => ({
        height: "100%",
        width: "100%",
        opacity: isAccountSuspended ? 0.5 : 1.0,
    }),
    middleContainer: {
        marginTop: 8,
    },
    titleLabelContainer: {
        flex: 1,
        paddingRight: 24,
    },
    providerImage: { height: 24, width: 42 },
});

export default React.memo(DebitCardBig);
