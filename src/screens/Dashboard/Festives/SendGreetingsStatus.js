// @ts-check
import PropTypes from "prop-types";
import React, { useEffect, FunctionComponent as FC } from "react";
import { ScrollView, View, StyleSheet, Image } from "react-native";

import { TAB_NAVIGATOR } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import CacheeImageWithDefault from "@components/CacheeImageWithDefault";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typography from "@components/Text";

import { withModelContext } from "@context";

import { MEDIUM_GREY, YELLOW } from "@constants/colors";

import useFestive from "@utils/useFestive";

import assets from "@assets";

function SendGreetingsStatus({ navigation, route }): FC {
    const selectedContacts = route.params?.selectedContacts ?? [];
    const success = route.params?.success ?? false;
    const message = route.params?.message ?? "";
    const errorMessage = route.params?.errorMessage ?? "";
    const datetime = route.params?.datetime ?? "";
    const { festiveAssets } = useFestive();

    function onDone() {
        navigation.navigate(TAB_NAVIGATOR, {
            screen: "Tab",
            params: {
                screen: "Dashboard",
            },
        });
    }

    function getContactName({ mayaUserName, name, phoneNumber, userName, fullName }) {
        return mayaUserName || name || fullName || userName || phoneNumber;
    }

    function getContactsName() {
        if (selectedContacts.length > 3) {
            return `${getContactName(selectedContacts[0])}, ${getContactName(
                selectedContacts[1]
            )}, ${getContactName(selectedContacts[2])} and ${selectedContacts.length - 3} others`;
        }

        return selectedContacts.reduce(
            (pv, contact) => `${!pv.length ? pv : pv + ", "}${getContactName(contact)}`,
            ""
        );
    }

    useEffect(() => {
        return () =>
            navigation.setParams({
                selectedContacts: null,
                success: null,
                message: null,
                errorMessage: null,
                datetime: null,
            });
    }, [navigation]);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <CacheeImageWithDefault
                    resizeMode="stretch"
                    style={styles.imageBG}
                    image={festiveAssets?.greetingSend.topContainer}
                />
                <ScreenLayout
                    header={<HeaderLayout />}
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <>
                        <ScrollView style={styles.scroller}>
                            <Image
                                resizeMode="contain"
                                style={styles.statusIcon}
                                source={success ? assets.icTickNew : assets.icFailedIcon}
                            />
                            <View style={styles.titleContainer}>
                                <Typography
                                    text={`e-Greeting ${message}`}
                                    fontWeight="300"
                                    fontSize={20}
                                    lineHeight={28}
                                    textAlign="left"
                                />
                                {!!errorMessage?.length && (
                                    <View style={styles.descriptionsContainer}>
                                        <Typography
                                            text={errorMessage}
                                            fontWeight="normal"
                                            fontSize={12}
                                            lineHeight={18}
                                            textAlign="left"
                                        />
                                    </View>
                                )}
                            </View>
                            <View>
                                <View style={styles.metaContainer}>
                                    <View style={styles.metaColumnOne}>
                                        <Typography
                                            text="Date & time"
                                            fontWeight="normal"
                                            fontSize={12}
                                            lineHeight={18}
                                            textAlign="left"
                                        />
                                    </View>
                                    <View style={styles.metaColumnTwo}>
                                        <Typography
                                            text={datetime}
                                            fontWeight="600"
                                            fontSize={12}
                                            lineHeight={18}
                                            textAlign="right"
                                        />
                                    </View>
                                </View>
                                <View style={styles.metaContainer}>
                                    <View style={styles.metaColumnOne}>
                                        <Typography
                                            text="Name"
                                            fontWeight="normal"
                                            fontSize={12}
                                            lineHeight={18}
                                            textAlign="left"
                                        />
                                    </View>
                                    <View style={styles.metaColumnTwo}>
                                        <Typography
                                            text={getContactsName()}
                                            fontWeight="600"
                                            fontSize={12}
                                            lineHeight={18}
                                            textAlign="right"
                                        />
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                        <FixedActionContainer>
                            <ActionButton
                                backgroundColor={YELLOW}
                                fullWidth
                                componentCenter={
                                    <Typography
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="Done"
                                    />
                                }
                                onPress={onDone}
                            />
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

SendGreetingsStatus.propTypes = {
    getModel: PropTypes.func,
    navigation: PropTypes.object,
    route: PropTypes.object,
};

export default withModelContext(SendGreetingsStatus);

const styles = StyleSheet.create({
    descriptionsContainer: {
        marginTop: 12,
    },
    imageBG: {
        flex: 1,
        height: "35%",
        width: "100%",
        ...StyleSheet.absoluteFill,
    },
    metaColumnOne: {
        flex: 0.4,
    },
    metaColumnTwo: { flex: 0.6 },
    metaContainer: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 18,
    },
    scroller: {
        paddingHorizontal: 36,
        paddingTop: 70,
    },
    statusIcon: {
        height: 56,
        width: 56,
    },
    titleContainer: {
        paddingVertical: 30,
    },
});
