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

function RsaLocked({ navigation, route }) {
    const reason = route?.params?.reason;
    const loggedOutDateTime = route?.params?.loggedOutDateTime;
    const lockedOutDateTime = route?.params?.lockedOutDateTime;

    async function handleClearUserState() {
        NavigationService.resetAndNavigateToModule("Splashscreen", "", {
            skipIntro: true,
            rsaLocked: true,
        });
    }

    useEffect(() => {
        return () => {
            navigation.setParams({
                reason: null,
                loggedOutDateTime: null,
                lockedOutDateTime: null,
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
                                    text={reason}
                                    textAlign="left"
                                />
                                <Typo
                                    fontSize={12}
                                    fontWeight="normal"
                                    lineHeight={18}
                                    style={styles.label}
                                    text={`Logged out on ${loggedOutDateTime}`}
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
                                    text={lockedOutDateTime}
                                    textAlign="right"
                                />
                            </View>
                        </View>
                        <FixedActionContainer>
                            <View style={styles.actionContainer}>
                                <ActionButton
                                    fullWidth
                                    borderRadius={25}
                                    onPress={handleClearUserState}
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

RsaLocked.propTypes = {
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

export default withModelContext(RsaLocked);
