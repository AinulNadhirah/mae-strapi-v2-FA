import LottieView from "lottie-react-native";
import PropTypes from "prop-types";
import React, { useRef, useState } from "react";
import { StyleSheet, Dimensions, View } from "react-native";
import * as Animatable from "react-native-animatable";

import { setIsIntroductionHasShow } from "@screens/OnBoarding/Introduction/utility";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { YELLOW, BLACK } from "@constants/colors";

import Assets from "@assets";

const { height } = Dimensions.get("window");
const introductionAssets = Assets.dashboard.introduction;
const data = [
    {
        title: `Your enhanced experience\nis here.`,
        image: introductionAssets.first,
        hasAnimation: false,
        description:
            "Instantly preview your selected bank account right on your home page, easily access your frequently used services and more.",
    },
    {
        title: `Your Maybank account at a glance`,
        image: introductionAssets.second,
        hasAnimation: false,
    },
    {
        title: "Pay & Transfer",
        image: introductionAssets.third,
        hasAnimation: false,
    },
    {
        title: "Discover Exciting Features",
        image: introductionAssets.fourth,
        hasAnimation: true,
    },
    {
        title: "Customise Quick Actions",
        image: introductionAssets.fifth,
        hasAnimation: false,
    },
];

const IntroductionScreen = ({ onClose }) => {
    const [selectedScreenIndex, setSelectedScreenIndex] = useState(0);
    const imageRef = useRef();
    const isLastItem = selectedScreenIndex === data.length - 1;
    const buttonText = isLastItem ? "Got It" : "Next";

    function goBack() {
        onClose && onClose();
    }

    const onPress = async () => {
        if (isLastItem) {
            closeModal();
        } else {
            setSelectedScreenIndex(selectedScreenIndex + 1);
        }
    };

    const closeModal = () => {
        setIsIntroductionHasShow(true, goBack);
    };

    const selectedScreen = data[selectedScreenIndex];
    return (
        <ScreenContainer
            backgroundType="image"
            backgroundImage={Assets.dashboard.introductionBackground}
        >
            <ScreenLayout
                useSafeArea
                neverForceInset={["bottom"]}
                header={
                    <HeaderLayout
                        headerRightElement={
                            !isLastItem ? (
                                <HeaderCloseButton onPress={closeModal} visible={false} />
                            ) : null
                        }
                    />
                }
            >
                <View style={styles.container}>
                    <Typo
                        fontSize={22}
                        fontWeight="600"
                        lineHeight={24}
                        text={selectedScreen?.title}
                    />

                    <SpaceFiller height={24} />
                    {selectedScreen.hasAnimation ? (
                        <LottieView
                            source={selectedScreen?.image}
                            autoPlay
                            loop={true}
                            style={styles.animation}
                        />
                    ) : (
                        <Animatable.Image
                            ref={imageRef}
                            source={selectedScreen?.image}
                            resizeMode="contain"
                            style={styles.image}
                        />
                    )}
                </View>
                <ActionButton
                    fullWidth
                    backgroundColor={YELLOW}
                    onPress={onPress}
                    componentCenter={
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                            color={BLACK}
                            text={buttonText}
                        />
                    }
                />
            </ScreenLayout>
        </ScreenContainer>
    );
};

IntroductionScreen.propTypes = {
    onClose: PropTypes.func,
};

const styles = StyleSheet.create({
    image: {
        height: 0.6 * height,
        width: "100%",
    },
    animation: {
        height: 0.6 * height,
        width: "100%",
    },
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});

export default IntroductionScreen;
