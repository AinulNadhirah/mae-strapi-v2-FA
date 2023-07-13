import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Dimensions,
    Image,
    FlatList,
} from "react-native";
import * as Animatable from "react-native-animatable";
import Modal from "react-native-modal";

import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";
import Typo from "@components/Text";

import { getMerchantByChainId } from "@services";

import { WHITE, BLACK, YELLOW, SEPARATOR, SHADOW_CLOSED } from "@constants/colors";

import assets from "@assets";

const { width, height } = Dimensions.get("window");

ChainIdLinkedOutletsModal.propTypes = {
    isVisible: PropTypes.bool,
    onDismiss: PropTypes.func,
    onPressMerchant: PropTypes.func,
    sandboxUrl: PropTypes.any,
    chainId: PropTypes.any,
    latitude: PropTypes.any,
    longitude: PropTypes.any,
};
export function ChainIdLinkedOutletsModal({
    isVisible,
    onDismiss,
    onPressMerchant,
    sandboxUrl,
    chainId,
    latitude,
    longitude,
}) {
    const [chainIdLinkedOutlets, setChainIdLinkedOutlets] = useState([]);

    useEffect(() => {
        // Get merchants linked with chain ID
        if (isVisible) {
            const response = getMerchantByChainId({ sandboxUrl, chainId, latitude, longitude });
            response.then((response) => {
                setChainIdLinkedOutlets(response?.data?.results);
            });
        }
    }, []);

    function closeModal() {
        onDismiss(false);
    }

    function renderOutletItem(item) {
        const { promotions, price, averageRating, totalReview, shopName, distance, merchantId } =
            item.item;

        const ratingLbl = averageRating ? `${averageRating?.toFixed(1)} (${totalReview})` : "";

        const priceLbl = price?.description?.length ? price.description : "";

        function openMerchant() {
            onPressMerchant({ merchantId, shopName });
        }

        return (
            <View>
                <TouchableOpacity activeOpacity={0.8} onPress={openMerchant}>
                    <View style={styles.merchantItemContainer}>
                        <Typo
                            fontSize={12}
                            fontWeight="semi-bold"
                            lineHeight={15}
                            textAlign="left"
                            text={shopName}
                            numberOfLines={2}
                        />
                        <View style={styles.secondLineView}>
                            {!!priceLbl && (
                                <Typo
                                    fontWeight="normal"
                                    textAlign="left"
                                    fontSize={12}
                                    lineHeight={14}
                                    text={priceLbl}
                                />
                            )}
                            {!!priceLbl && !!distance && <View style={styles.bulletPoint} />}
                            {!!distance && (
                                <Typo
                                    fontSize={12}
                                    fontWeight="normal"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    textAlign="right"
                                    lineHeight={18}
                                    text={distance}
                                />
                            )}
                            {!!distance && !!ratingLbl && <View style={styles.bulletPoint} />}
                            {!!ratingLbl && (
                                <>
                                    <Image
                                        source={assets.starFilled}
                                        style={styles.rating}
                                        resizeMode="stretch"
                                    />

                                    <Typo
                                        fontSize={12}
                                        fontWeight="normal"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        textAlign="left"
                                        lineHeight={18}
                                        text={ratingLbl}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                        style={styles.container}
                                    />
                                </>
                            )}
                        </View>
                        <View style={styles.thirdLineView}>
                            {(promotions ?? "").replace(",", "").length > 0 && (
                                <View style={styles.promotionPill}>
                                    <Typo
                                        fontSize={12}
                                        fontWeight="normal"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        textAlign="left"
                                        lineHeight={18}
                                        text="Promotion"
                                        numberOfLines={1}
                                        style={styles.container}
                                    />
                                </View>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={styles.separator} />
            </View>
        );
    }

    const shimmerView = [...Array(6)].map((i) => (
        <View style={styles.empty} key={i}>
            <ShimmerPlaceHolder style={styles.placeholderLine1} />
            <ShimmerPlaceHolder style={styles.placeholderLine2} />
            <ShimmerPlaceHolder style={styles.placeholderLine3} />
            <View style={styles.separator} />
        </View>
    ));

    return (
        <View style={isVisible ? styles.modalContainer : styles.hidden}>
            <Modal
                avoidKeyboard
                animationIn="fadeIn"
                animationOut="fadeOut"
                visible={isVisible}
                style={styles.modal}
                onRequestClose={closeModal}
                useNativeDriver
                transparent={true}
            >
                <View style={styles.containerView}>
                    <TouchableWithoutFeedback onPress={closeModal} style={styles.touchable}>
                        <View style={styles.empty}>
                            <View />
                        </View>
                    </TouchableWithoutFeedback>
                    <Animatable.View
                        animation="slideInUp"
                        duration={300}
                        useNativeDriver
                        style={styles.animatedCard}
                    >
                        <View style={styles.topContainerClose}>
                            <TouchableOpacity onPress={closeModal} style={styles.closeTouchable}>
                                <Image source={assets.icCloseBlack} style={styles.closeIcon} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.contentContainer}>
                            {!!chainIdLinkedOutlets?.length > 0
? (
                                <FlatList
                                    style={styles.flex_1}
                                    data={chainIdLinkedOutlets}
                                    renderItem={renderOutletItem}
                                    keyExtractor={(item) => item.merchantId}
                                    showsVerticalScrollIndicator={false}
                                    ListFooterComponent={
                                        <Typo
                                            fontSize={12}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            textAlign="left"
                                            lineHeight={18}
                                            text="You’ve seen all outlets around you"
                                            numberOfLines={1}
                                            color="#999999"
                                        />
                                    }
                                />
                            ) : (
                                shimmerView
                            )}
                            <View style={styles.height20} />
                        </View>
                    </Animatable.View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    animatedCard: {
        backgroundColor: WHITE,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: "hidden",
        width: "100%",
    },
    bulletPoint: {
        backgroundColor: BLACK,
        borderRadius: 2,
        height: 4,
        marginHorizontal: 4,
        width: 4,
    },
    closeIcon: { height: 16, width: 16 },
    closeTouchable: {
        alignItems: "center",
        height: 44,
        justifyContent: "center",
        position: "absolute",
        right: 0,
        top: 0,
        width: 44,
    },
    containerView: {
        alignItems: "center",
        flex: 1,
        justifyContent: "flex-end",
    },
    contentContainer: {
        backgroundColor: WHITE,
        height: height * 0.65,
        marginTop: 31,
        minHeight: 200,
        paddingHorizontal: 20,
        width,
    },
    empty: {
        flex: 1,
        width: "100%",
    },
    flex_1: {
        flex: 1,
    },
    height20: { height: 20 },
    hidden: {
        display: "none",
    },
    merchantItemContainer: {
        backgroundColor: WHITE,
        paddingTop: 10,
        width: "100%",
    },
    modal: {
        display: "flex",
        margin: 0,
    },
    modalContainer: {
        backgroundColor: SHADOW_CLOSED,
        elevation: 9,
        height,
        position: "absolute",
        width,
        zIndex: 9,
    },
    placeholderLine1: {
        borderRadius: 2,
        height: 16,
        marginBottom: 15,
        width: "80%",
    },
    placeholderLine2: {
        borderRadius: 2,
        height: 16,
        marginBottom: 15,
        width: "60%",
    },
    placeholderLine3: {
        borderRadius: 2,
        height: 16,
        marginBottom: 15,
        width: "40%",
    },
    promotionPill: {
        alignItems: "center",
        backgroundColor: YELLOW,
        borderRadius: 10.5,
        height: 21,
        justifyContent: "center",
        marginRight: 8,
        paddingHorizontal: 8,
    },
    rating: {
        height: 11,
        marginRight: 4,
        width: 10,
    },
    secondLineView: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 8,
    },
    separator: {
        backgroundColor: SEPARATOR,
        height: 1,
        marginVertical: 10,
        width: "100%",
    },
    thirdLineView: {
        alignItems: "center",
        flexDirection: "row",
        marginVertical: 8,
    },
    topContainerClose: { alignItems: "flex-end" },
    touchable: {
        flex: 1,
        height: "100%",
        width: "100%",
    },
});
