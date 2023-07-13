import React from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Dimensions,
    Image,
} from "react-native";
import PropTypes from "prop-types";
import Typo from "@components/Text";
import { BLACK, WHITE, LIGHT_GREY } from "@constants/colors";
import { maskAccount, getCardProviderImage } from "@utils/dataModel/utility";

export const { width, height } = Dimensions.get("window");

const CreditCardBig = ({
    onCardPressed,
    image,
    title,
    accountNumber,
    desc,
    amount,
    isPrimary,
    hasSupplementary,
    isAccountSuspended,
}) => (
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
                            fontWeight="300"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={24}
                            textAlign="left"
                            text={maskAccount(accountNumber, 12)}
                            color={WHITE}
                        />
                    </View>

                    <View style={styles.bottomContainer}>
                        <Typo
                            fontSize={12}
                            fontWeight="normal"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={15}
                            textAlign="left"
                            color={WHITE}
                            text={desc}
                        />
                        <Typo
                            fontSize={16}
                            fontWeight="600"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={19}
                            textAlign="left"
                            color={WHITE}
                            text={`RM ${amount}`}
                        />
                    </View>
                </View>
            </ImageBackground>
        </TouchableOpacity>
        {hasSupplementary && (
            <View style={styles.supplementaryBadge}>
                <Typo fontSize={9} lineHeight={11} text="Supp. Card Available" />
            </View>
        )}
    </View>
);

CreditCardBig.propTypes = {
    onCardPressed: PropTypes.func.isRequired,
    image: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    accountNumber: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    amount: PropTypes.any,
    isPrimary: PropTypes.bool,
    hasSupplementary: PropTypes.bool,
    isAccountSuspended: PropTypes.bool,
};

CreditCardBig.defaultProps = {
    onCardPressed: () => {},
    image: "",
    title: "",
    accountNumber: "",
    desc: "",
    amount: 0,
    isPrimary: false,
    hasSupplementary: false,
    isAccountSuspended: false,
};

const styles = StyleSheet.create({
    bottomContainer: {
        bottom: 24,
        marginTop: 12,
        position: "absolute",
    },
    container: {
        backgroundColor: BLACK,
        borderRadius: 8,
        elevation: 5,
        height: 200,
        marginBottom: 24,
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
        marginTop: 44,
    },
    supplementaryBadge: {
        alignItems: "center",
        backgroundColor: LIGHT_GREY,
        borderRadius: 11,
        bottom: 23,
        height: 22,
        justifyContent: "center",
        position: "absolute",
        right: 16,
        width: 113,
    },
    titleLabelContainer: {
        flex: 1,
        paddingRight: 24,
    },
    providerImage: { height: 24, width: 42 },
});

export default React.memo(CreditCardBig);
