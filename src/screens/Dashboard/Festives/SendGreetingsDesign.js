// @ts-check
import PropTypes from "prop-types";
import React, { useEffect, useRef, FunctionComponent as FC, useState } from "react";
import { View, StyleSheet, TextInput, Dimensions } from "react-native";
import * as Animatable from "react-native-animatable";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import CacheeImageWithDefault from "@components/CacheeImageWithDefault";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FullBgLoading from "@components/FullBgLoading";
import Typography from "@components/Text";

import { withModelContext } from "@context";

import {
    WHITE,
    MEDIUM_GREY,
    SHADOW_LIGHT,
    YELLOW,
    BLACK,
    DISABLED,
    DISABLED_TEXT,
} from "@constants/colors";

import useFestive from "@utils/useFestive";

function Thumb({ icon, iconActive, index, handlePress, isSelected }) {
    function onPress() {
        handlePress(index);
    }
    return (
        <Animatable.View
            animation="bounceIn"
            duration={300}
            delay={index * 100 + 1000}
            style={styles.thumbContainer}
        >
            <TouchableSpring scaleTo={0.9} tension={150} onPress={onPress}>
                {({ animateProp }) => (
                    <Animated.View
                        style={[
                            isSelected ? styles.thumbInnerActive : styles.thumbInner,
                            {
                                transform: [
                                    {
                                        scale: animateProp,
                                    },
                                ],
                            },
                        ]}
                    >
                        <CacheeImageWithDefault image={icon} style={styles.thumbImg} />
                    </Animated.View>
                )}
            </TouchableSpring>
        </Animatable.View>
    );
}

Thumb.propTypes = {
    handlePress: PropTypes.func,
    icon: PropTypes.any,
    iconActive: PropTypes.any,
    index: PropTypes.any,
    isSelected: PropTypes.any,
};

const { width } = Dimensions.get("window");

function SendGreetingsDesign({ navigation, route }): FC {
    const { festiveAssets } = useFestive();
    const assetsToSelect = festiveAssets?.greetingSend.designTemplates;

    const [selectedDesign, setDesign] = useState(0);
    const [message, setMessage] = useState(assetsToSelect?.[selectedDesign]?.preFillText);
    const cardRef = useRef();
    const [bgLoading, setBg] = useState(true);

    function handleImgLoad() {
        setBg(false);
    }

    function handleBack() {
        if (route?.params?.eDuitData) {
            navigation.pop(2);
            return;
        }
        navigation.canGoBack() && navigation.goBack();
    }

    function onOptionSelected(index) {
        setDesign(index);
        if (cardRef?.current) cardRef?.current?.fadeIn(500);
        setMessage(assetsToSelect?.[index]?.preFillText);
    }

    function onUpdateMessage(text) {
        setMessage(text);
    }

    function onContinue() {
        console.info("onContinue: ", route?.params);
        const { routeFrom, eDuitData, transferParams } = route?.params;
        let { selectedContacts } = route?.params;
        if (selectedContacts == undefined) {
            selectedContacts = eDuitData?.transferParams?.contactObj
                ? [eDuitData?.transferParams?.contactObj]
                : selectedContacts;
        }
        const params = {
            selectedDesign: assetsToSelect?.[selectedDesign],
            message: message ? message.trim() : assetsToSelect?.[selectedDesign]?.preFillText,
            selectedContacts,
            routeFrom: transferParams?.routeFrom ?? routeFrom,
            includeGreeting: eDuitData?.transferParams?.contactObj ? true : false,
            eDuitData,
        };

        console.info("onContinue: ", params);

        if (message?.length) navigation.navigate("SendGreetingsReview", params);
    }

    useEffect(() => {
        setMessage(assetsToSelect?.[selectedDesign]?.preFillText);
    }, [assetsToSelect, selectedDesign]);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <View style={styles.bgImageContainer}>
                    <CacheeImageWithDefault
                        image={festiveAssets?.greetingSend.backgroundGreetings}
                        resizeMode="stretch"
                        style={styles.bgImage}
                        onLoad={handleImgLoad}
                    />
                </View>

                {bgLoading ? (
                    <FullBgLoading />
                ) : (
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerLeftElement={
                                    <HeaderBackButton isWhite onPress={handleBack} />
                                }
                            />
                        }
                        useSafeArea
                    >
                        <>
                            <KeyboardAwareScrollView
                                contentContainerStyle={styles.keyboardView}
                                enableOnAndroid={false}
                            >
                                <View style={styles.wrapper}>
                                    <Animatable.View
                                        animation="fadeInUp"
                                        delay={200}
                                        style={styles.copyContainer}
                                        useNativeDriver
                                    >
                                        <Typography
                                            fontSize={22}
                                            fontWeight="600"
                                            lineHeight={28}
                                            text={festiveAssets?.greetingSend.mainTitle}
                                            color={WHITE}
                                        />
                                    </Animatable.View>
                                    <View style={styles.optionsContainer}>
                                        <Animatable.View
                                            animation="fadeInUp"
                                            delay={400}
                                            style={styles.cardContainer}
                                            useNativeDriver
                                        >
                                            <View style={styles.cardInnerContainer}>
                                                <View
                                                    style={{
                                                        ...StyleSheet.absoluteFill,
                                                    }}
                                                >
                                                    <CacheeImageWithDefault
                                                        ref={cardRef}
                                                        image={
                                                            assetsToSelect?.[selectedDesign].card
                                                        }
                                                        style={styles.cardImg}
                                                    />
                                                </View>

                                                <View style={styles.cardContent}>
                                                    <TextInput
                                                        style={styles.greeetingsInput}
                                                        multiline
                                                        maxLength={100}
                                                        value={message}
                                                        onChangeText={onUpdateMessage}
                                                        onSubmitEditing={onContinue}
                                                        returnKeyType="next"
                                                        blurOnSubmit
                                                        color={WHITE}
                                                        borderBottomColor={WHITE}
                                                    />
                                                    <Typography
                                                        fontSize={10}
                                                        color={WHITE}
                                                        fontWeight="normal"
                                                        lineHeight={14}
                                                        text={
                                                            message
                                                                ? `${message?.length}/100`
                                                                : `${assetsToSelect?.[selectedDesign]?.preFillText?.length}/100`
                                                        }
                                                        textAlign="left"
                                                    />
                                                </View>
                                            </View>
                                        </Animatable.View>
                                        <View style={styles.thumbWrapper}>
                                            {assetsToSelect?.map((option, index) => (
                                                <Thumb
                                                    key={`${option.id}`}
                                                    icon={option.thumb}
                                                    iconActive={option.thumbActive}
                                                    index={index}
                                                    isSelected={index === selectedDesign}
                                                    handlePress={onOptionSelected}
                                                />
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                            <View>
                                <ActionButton
                                    disabled={!message?.length}
                                    backgroundColor={!message?.length ? DISABLED : YELLOW}
                                    fullWidth
                                    onPress={onContinue}
                                    componentCenter={
                                        <Typography
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text="Continue"
                                            color={!message?.length ? DISABLED_TEXT : BLACK}
                                        />
                                    }
                                />
                            </View>
                        </>
                    </ScreenLayout>
                )}
            </>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    bgImage: {
        height: "100%",
        width: "100%",
    },
    bgImageContainer: {
        ...StyleSheet.absoluteFill,
    },
    cardContainer: {
        borderColor: WHITE,
        borderRadius: 8,
        borderWidth: 2,
        height: width / 2,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
        width: width / 1.2,
    },
    cardContent: {
        flexDirection: "column",
        justifyContent: "flex-start",
    },
    cardImg: {
        borderRadius: 8,
        height: "100%",
        width: "100%",
    },
    cardInnerContainer: {
        alignItems: "center",
        height: "100%",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
        width: "100%",
    },
    copyContainer: {
        paddingBottom: 24,
    },
    greeetingsInput: {
        borderBottomColor: WHITE,
        borderBottomWidth: 2,
        color: WHITE,
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
        minHeight: 65,
        paddingVertical: 4,
        textAlign: "center",
        width: 192,
    },
    keyboardView: { flex: 1 },
    optionsContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    thumbContainer: {
        paddingHorizontal: 4,
        paddingVertical: 18,
    },
    thumbImg: {
        height: "100%",
        width: "100%",
    },
    thumbInner: {
        borderRadius: 29,
        flexDirection: "column",
        height: 58,
        width: 58,
    },
    thumbInnerActive: {
        borderColor: WHITE,
        borderRadius: 29,
        borderWidth: 2,
        flexDirection: "column",
        height: 58,
        width: 58,
    },
    thumbWrapper: {
        alignItems: "center",
        flexDirection: "row",
    },
    wrapper: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
});

SendGreetingsDesign.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

export default withModelContext(SendGreetingsDesign);
