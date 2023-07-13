import PropTypes from "prop-types";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";

import { MEDIUM_GREY } from "@constants/colors";

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
    },
    layout: { alignItems: "center", flex: 1, justifyContent: "center", paddingHorizontal: 25 },
});

const NotFound = (props) => {
    const goBack = () => props?.navigation?.goBack();
    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={goBack} />}
                        headerCenterElement={
                            <Typo text="Not Found" fontWeight="600" fontSize={18} lineHeight={19} />
                        }
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                useSafeArea
            >
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.contentContainer}
                >
                    <View style={styles.layout}>
                        <Typo
                            text="Error! Reference source not found."
                            fontWeight="400"
                            fontSize={18}
                            lineHeight={19}
                            textAlign="left"
                            style={styles.mb20}
                        />
                    </View>
                </ScrollView>
            </ScreenLayout>
        </ScreenContainer>
    );
};
NotFound.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};
export default NotFound;
