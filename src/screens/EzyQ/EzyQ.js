import React from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import PropTypes from "prop-types";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { MEDIUM_GREY, BLACK } from "@constants/colors";
import { EZYQ } from "@constants/strings";
import Typography from "@components/Text";
import { EZYQ_URL } from "@constants/url";

function EzyQ({ navigation }) {
    function onCloseTap() {
        console.log("[EzyQ] >> [onCloseTap] :");
        navigation.goBack();
    }

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName="MBB_EZYQ"
        >
            <ScreenLayout
                header={
                    <HeaderLayout
                        horizontalPaddingMode="custom"
                        horizontalPaddingCustomLeftValue={16}
                        horizontalPaddingCustomRightValue={16}
                        headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        headerCenterElement={
                            <Typography
                                fontSize={16}
                                fontWeight="600"
                                color={BLACK}
                                lineHeight={19}
                                text={EZYQ}
                            />
                        }
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                useSafeArea
            >
                <View style={styles.webPageContainer}>
                    <WebView
                        source={{ uri: EZYQ_URL }}
                        style={styles.webPage}
                        userAgent={"Maybank-MY"}
                        originWhitelist={["*"]}
                    />
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
}
EzyQ.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    webPage: {
        backgroundColor: MEDIUM_GREY,
        opacity: 0.99,
    },
    webPageContainer: {
        borderColor: BLACK,
        flex: 1,
    },
});

export default EzyQ;
