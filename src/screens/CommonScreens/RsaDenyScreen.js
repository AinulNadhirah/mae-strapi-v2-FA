import React, { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import PropTypes from "prop-types";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import ActionButton from "@components/Buttons/ActionButton";
import Images from "@assets";
import Typo from "@components/Text";
import { MEDIUM_GREY, YELLOW, FADE_GREY } from "@constants/colors";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import NavigationService from "@navigation/navigationService";
import { withModelContext } from "@context";

function RsaDenyScreen({ navigation, route }) {
    const statusDescription = route?.params?.statusDescription;
    const additionalStatusDescription = route?.params?.additionalStatusDescription;
    const serverDate = route?.params?.serverDate;
    const nextParams = route?.params?.nextParams;
    const nextModule = route?.params?.nextModule;
    const nextScreen = route?.params?.nextScreen;

    console.log("nextModule", nextModule);
    console.log("nextScreen", nextScreen);
    console.log("nextParams", nextParams);

    async function actionButtonOnPress() {
        NavigationService.navigate(nextModule, {
            screen: nextScreen,
            params: nextParams,
        });
    }

    useEffect(() => {
        return () => {
            navigation.setParams({
                statusDescription: null,
                additionalStatusDescription: null,
                serverDate: null,
                nextParams: null,
                nextModule: null,
                nextScreen: null,
            });
        };
    }, [navigation]);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={146}
                    paddingHorizontal={0}
                    header={<View />}
                    useSafeArea
                >
                    <>
                        <View style={styles.container}>
                            <View style={styles.iconContainer}>
                                <Image source={Images.icFailedIcon} style={styles.meta} />
                            </View>
                            <View style={styles.footer}>
                                <Typo
                                    fontSize={20}
                                    lineHeight={28}
                                    fontWeight="300"
                                    text={statusDescription}
                                    textAlign="left"
                                />
                                <Typo
                                    fontSize={12}
                                    fontWeight="normal"
                                    lineHeight={18}
                                    style={styles.label}
                                    text={additionalStatusDescription}
                                    textAlign="left"
                                    color={FADE_GREY}
                                />
                            </View>
                            <View style={styles.metaDetailsContainer}>
                                <Typo
                                    fontSize={12}
                                    fontWeight="normal"
                                    lineHeight={18}
                                    text="Date & time"
                                    textAlign="left"
                                />
                                <Typo
                                    fontSize={12}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text={serverDate}
                                    textAlign="right"
                                />
                            </View>
                        </View>
                        <FixedActionContainer>
                            <View style={styles.actionContainer}>
                                <ActionButton
                                    fullWidth
                                    borderRadius={25}
                                    onPress={actionButtonOnPress}
                                    backgroundColor={YELLOW}
                                    componentCenter={
                                        <Typo
                                            text="Done"
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                    }
                                />
                            </View>
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

RsaDenyScreen.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    updateModel: PropTypes.func,
};

const styles = StyleSheet.create({
    actionContainer: {
        alignItems: "center",
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 36,
    },
    footer: {
        flexDirection: "column",
        paddingVertical: 30,
    },
    iconContainer: {
        paddingHorizontal: 6,
    },
    label: {
        paddingVertical: 8,
    },
    meta: {
        height: 56,
        width: 56,
    },
    metaDetailsContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
});

export default withModelContext(RsaDenyScreen);
