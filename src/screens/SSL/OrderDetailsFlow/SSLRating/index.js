import { useNavigation, useRoute } from "@react-navigation/core";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, Image, TextInput, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { SSL_ORDER_DETAILS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { postSSLOrderReview } from "@services";

import {
    BLACK,
    YELLOW,
    WHITE,
    MEDIUM_GREY,
    SWITCH_GREY,
    RED,
    DISABLED_TEXT,
    DISABLED,
    DARK_GREY,
} from "@constants/colors";

import { REVIEW_SUBMITTED } from "@constants/stringsSSL";

import assets from "@assets";

function SSLRating() {
    const route = useRoute();
    const { params } = route;
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [characterLimit, setCharacterLimit] = useState(250);

    useEffect(() => {
        const limit = 250 - comment.length;
        setCharacterLimit(limit);
    }, [comment]);

    function onEndEditing() {
        const limit = 250 - comment.length;
        setCharacterLimit(limit);
    }

    function onPressOneStar() {
        setRating(1);
    }

    function onPressTwoStar() {
        setRating(2);
    }

    function onPressThreeStar() {
        setRating(3);
    }

    function onPressFourStar() {
        setRating(4);
    }

    function onPressFiveStar() {
        setRating(5);
    }

    function onPressSubmit() {
        if (rating !== 0) {
            setIsLoading(true);
            postOrderReview();
        }
    }

    async function postOrderReview() {
        const body = {
            orderId: params?.orderId,
            rating,
            comment: comment.trim(),
        };

        try {
            console.log("postOrderReview start");
            const response = await postSSLOrderReview(body);
            console.log("postOrderReview success", response);

            navigation.navigate(SSL_ORDER_DETAILS, {
                orderId: params?.orderId,
                successMessage: REVIEW_SUBMITTED,
            });
        } catch (e) {
            navigation.navigate(SSL_ORDER_DETAILS, {
                errorMessage: e?.error?.error?.message ? e?.error?.error?.message : e?.message,
            });
        } finally {
            setIsLoading(false);
        }
    }

    function handleClose() {
        navigation.goBack();
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        backgroundColor={MEDIUM_GREY}
                        headerCenterElement={
                            <Typo fontSize={16} fontWeight="600" color={BLACK} lineHeight={19} />
                        }
                        headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                    />
                }
                useSafeArea
                neverForceInset={["bottom"]}
                paddingLeft={24}
                paddingRight={24}
                paddingBottom={24}
                paddingTop={24}
            >
                <KeyboardAwareScrollView
                    contentContainerStyle={styles.containerPadding}
                    behavior={Platform.OS == "ios" ? "padding" : ""}
                    enabled
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    enableOnAndroid={true}
                >
                    <View style={styles.container}>
                        <View style={styles.topContainer}>
                            <Typo fontSize={20} lineHeight={28} text="Rate your order" />
                            <Image source={assets.SSLShoppingBag} style={styles.shoppingBagIcon} />
                            <Typo
                                fontSize={14}
                                fontWeight="semi-bold"
                                text={params?.merchantName}
                            />
                            <Typo
                                style={styles.storeAddress}
                                fontSize={14}
                                lineHeight={20}
                                text={params?.outletAddress}
                            />
                            <View style={[styles.flexDirectionRow, styles.ratingContainer]}>
                                <TouchableOpacity onPress={onPressOneStar}>
                                    <Image
                                        source={rating === 0 ? assets.starEmpty : assets.starFilled}
                                        style={styles.starIcon}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onPressTwoStar}>
                                    <Image
                                        source={rating >= 2 ? assets.starFilled : assets.starEmpty}
                                        style={styles.starIcon}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onPressThreeStar}>
                                    <Image
                                        source={rating >= 3 ? assets.starFilled : assets.starEmpty}
                                        style={styles.starIcon}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onPressFourStar}>
                                    <Image
                                        source={rating >= 4 ? assets.starFilled : assets.starEmpty}
                                        style={styles.starIcon}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onPressFiveStar}>
                                    <Image
                                        source={rating === 5 ? assets.starFilled : assets.starEmpty}
                                        style={styles.starIcon}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.reviewLblContainer}>
                            <Typo
                                fontSize={14}
                                lineHeight={18}
                                textAlign="left"
                                text="Write a review"
                            />
                            <Typo
                                style={styles.characterRemaining}
                                textAlign="right"
                                fontSize={12}
                                lineHeight={18}
                                color={characterLimit === 0 ? RED : DARK_GREY}
                                text={`${characterLimit} characters left`}
                            />
                        </View>
                        <TextInput
                            autoFocus={false}
                            autoCorrect={false}
                            autoCapitalize="none"
                            style={styles.review}
                            onChangeText={setComment}
                            onEndEditing={onEndEditing}
                            multiline={true}
                            fontSize={12}
                            fontFamily="montserrat"
                            maxLength={250}
                            value={comment}
                            placeholder="Spare a moment to share your experience"
                        />
                    </View>
                </KeyboardAwareScrollView>
                <ActionButton
                    style={styles.doneButton}
                    borderRadius={24}
                    backgroundColor={rating === 0 ? DISABLED : YELLOW}
                    componentCenter={
                        <Typo
                            color={rating === 0 ? DISABLED_TEXT : BLACK}
                            fontSize={14}
                            fontWeight="semi-bold"
                            lineHeight={18}
                            text="Submit"
                        />
                    }
                    onPress={onPressSubmit}
                    isLoading={isLoading}
                />
            </ScreenLayout>
        </ScreenContainer>
    );
}
const styles = StyleSheet.create({
    characterRemaining: { flex: 1 },
    container: {
        flex: 1,
    },
    doneButton: {
        height: 48,
    },
    flexDirectionRow: { flexDirection: "row" },
    ratingContainer: {
        marginTop: 24,
    },
    review: {
        backgroundColor: WHITE,
        borderColor: SWITCH_GREY,
        borderRadius: 8,
        borderWidth: 1,
        height: 150,
        marginLeft: 12,
        marginRight: 12,
        marginTop: 16,
        paddingBottom: 13,
        paddingHorizontal: 15,
        paddingTop: 13,
        textAlignVertical: "top",
    },
    reviewLblContainer: {
        flexDirection: "row",
        marginHorizontal: 12,
        marginTop: 38,
    },
    shoppingBagIcon: {
        alignItems: "center",
        height: 64,
        marginBottom: 12,
        marginTop: 16,
        width: 64,
    },
    starIcon: {
        height: 32,
        marginLeft: 4.5,
        marginRight: 4.5,
        width: 33,
    },
    storeAddress: {
        marginTop: 4,
        width: "70%",
    },
    topContainer: {
        alignItems: "center",
    },
});

export default withModelContext(SSLRating);
