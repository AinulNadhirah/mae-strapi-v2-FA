import React from "react";
import { View, StyleSheet, ImageBackground, Dimensions } from "react-native";
import PropTypes from "prop-types";
import WalletLabel from "@components/Label/WalletLabel";
import Typo from "@components/Text";
import { BLACK, WHITE } from "@constants/colors";
import Spring from "@components/Animations/Spring";
import * as utility from "@utils/dataModel/utility";

export const { width, height } = Dimensions.get("window");

const ProductCardBig = ({
    onCardPressed,
    image,
    title,
    accountNumber,
    desc,
    amount,
    isPrimary,
    isAccountSuspended,
    ...props
}) => (
    <Spring style={styles.container} activeOpacity={0.9} onPress={onCardPressed}>
        <ImageBackground source={image} style={styles.imageContainer(isAccountSuspended)}>
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
                            text={title}
                            color={WHITE}
                        />
                    </View>

                    {isPrimary && <WalletLabel />}
                </View>

                <View style={styles.middleContainer}>
                    <Typo
                        fontSize={20}
                        fontWeight="300"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={24}
                        textAlign="left"
                        text={accountNumber}
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
                        text={`${Math.sign(amount) === -1 ? "-" : ""}RM ${utility.commaAdder(
                            Math.abs(amount).toFixed(2)
                        )}`}
                    />
                </View>
            </View>
        </ImageBackground>
    </Spring>
);

ProductCardBig.propTypes = {
    onCardPressed: PropTypes.func.isRequired,
    image: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    accountNumber: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    isPrimary: PropTypes.bool,
    isAccountSuspended: PropTypes.bool,
};

ProductCardBig.defaultProps = {
    onCardPressed: () => {},
    image: "",
    title: "",
    accountNumber: "",
    desc: "",
    amount: 0,
    isPrimary: false,
    isAccountSuspended: false,
};

const Memoiz = React.memo(ProductCardBig);

export default Memoiz;

const styles = StyleSheet.create({
    container: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 5,
        height: 200,
        marginBottom: 24,
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        width: width - 48,
        overflow: "hidden",
    },
    contentContainer: {
        flex: 1,
        marginHorizontal: 16,
        marginTop: 20,
    },
    imageContainer: (isAccountSuspended) => ({
        width: "100%",
        height: "100%",
        opacity: isAccountSuspended ? 0.5 : 1,
    }),
    middleContainer: {
        marginTop: 44,
    },
    bottomContainer: {
        position: "absolute",
        bottom: 24,
        marginTop: 12,
    },
    headerContainer: {
        flexDirection: "row",
        height: 22,
    },
    titleLabelContainer: {
        flex: 1,
    },
});
