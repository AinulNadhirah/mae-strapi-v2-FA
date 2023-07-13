import React from "react";
import { View, StyleSheet, Image } from "react-native";
import PropTypes from "prop-types";
import Typo from "@components/Text";
import { WHITE } from "@constants/colors";
import { getShadow } from "@utils/dataModel/utility";
import Spring from "@components/Animations/Spring";

const ProductFeatureCard = ({ onCardPressed, image, title, desc, greyed }) => {
    return (
        <View style={styles.shadow}>
            <Spring
                style={
                    greyed ? [styles.container, { backgroundColor: "#cfcfcf" }] : styles.container
                }
                onPress={onCardPressed}
                activeOpacity={0.9}
            >
                <View style={styles.contentContainer}>
                    <Typo
                        fontSize={14}
                        fontWeight="600"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        textAlign="left"
                        text={title}
                        numberOfLines={2}
                    />
                    <View style={styles.rowContainer}>
                        {image && (
                            <View style={styles.imageContainer}>
                                <Image
                                    source={image}
                                    style={{ width: 44, height: 44 }}
                                    resizeMode="contain"
                                />
                            </View>
                        )}
                        <View style={styles.descContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="normal"
                                fontStyle="normal"
                                textAlign="left"
                                letterSpacing={-0.16}
                                lineHeight={23}
                                text={desc}
                                numberOfLines={3}
                            />
                        </View>
                    </View>
                </View>
            </Spring>
        </View>
    );
};

ProductFeatureCard.propTypes = {
    onCardPressed: PropTypes.func.isRequired,
    image: PropTypes.number,
    title: PropTypes.string.isRequired,
    desc: PropTypes.string,
    greyed: PropTypes.bool,
};

ProductFeatureCard.defaultProps = {
    onCardPressed: () => {},
    image: null,
    title: "",
    desc: "",
    greyed: false,
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: WHITE,
        borderRadius: 8,
        marginBottom: 16,
        overflow: "hidden",
        width: "100%",
    },
    contentContainer: {
        justifyContent: "space-between",
        paddingBottom: 24,
        paddingHorizontal: 20,
        paddingTop: 16,
        width: "100%",
    },
    rowContainer: {
        flex: 1,
        flexDirection: "row",
        marginTop: 19,
        justifyContent: "center",
    },
    descContainer: {
        flex: 1,
        justifyContent: "flex-start",
    },
    imageContainer: {
        width: 44,
        height: "100%",
        alignItems: "center",
        justifyContent: "flex-start",
        marginRight: 20,
        marginLeft: 4,
    },
    shadow: {
        ...getShadow({}),
    },
});

export default React.memo(ProductFeatureCard);
