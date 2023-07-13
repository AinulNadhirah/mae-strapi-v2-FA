import React, { useRef, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { WebView } from "react-native-webview";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";
import { PREMIER_M2U_REGISTRATION_PROD_URL } from "@constants/premierUrl";

import { CONTINUE } from "@constants/strings";

import { entryPropTypes } from "../PM1IntroScreen";

const M2UOnlineRegistration = (props) => {
    const { navigation, route } = props;
    const [canGoBack, setCanGoBack] = useState(false);
    const { returnScreen } = route.params;
    const ref = useRef(null);

    function onBackTap () {
        console.log("[M2UOnlineRegistration] >> [onBackTap]");
        if (canGoBack) {
            ref?.current?.goBack();
        } else {
            navigation.navigate(returnScreen);
        }
    }

    function onCloseTap () {
        navigation.popToTop();
        navigation.goBack();
    }

    function handleNavigationStateChange (navState) {
        setCanGoBack(navState.canGoBack);
    }

    return (
            <ScreenContainer backgroundType="color">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KeyboardAwareScrollView
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                            >
                                <View style={Style.formContainer}>
                                    <WebView
                                        ref={ref}
                                        onNavigationStateChange={handleNavigationStateChange}
                                        source={{
                                            uri: PREMIER_M2U_REGISTRATION_PROD_URL,
                                        }}
                                        // userAgent={"Maybank-MY"}
                                        originWhitelist={["*"]}
                                    />
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={CONTINUE}
                                        />
                                    }
                                    // onPress={onNextTap}
                                />
                            </View>
                        </FixedActionContainer>
                    
                </ScreenLayout>
            </ScreenContainer>
        
    );
};

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    formContainer: {
        marginBottom: 40,
    },
});

M2UOnlineRegistration.propTypes = {
    ...entryPropTypes,
};

export default M2UOnlineRegistration;
