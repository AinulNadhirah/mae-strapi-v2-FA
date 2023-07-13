import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from "react-native";

import {
    DEACTIVATE_M2U_CARDS_CASA_LANDING,
    SECURE_SWITCH_STACK,
} from "@navigation/navigationConstant";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { invokeL3 } from "@services";

import { BLACK, DARK_GREY, MEDIUM_GREY, WHITE, GREY, GARGOYLE } from "@constants/colors";
import {
    DEACTIVATE_M2U_ACCESS,
    DEACTIVATE_M2U_DESC,
    KILL_SWITCH,
    SS_LANDING_HEADER,
    BLOCK_CREDIT_CARD,
    DEACTIVATE_CARDS,
    DEACTIVATE_CASA,
    SUSPEND_ACCOUNTS,
    SUSPEND_CASA_LANDING,
    BLOCK_CARDS_LANDING,
    DEACTIVATE_M2U_ACCESS_LANDING,
} from "@constants/strings";

import Assets from "@assets";

const { width } = Dimensions.get("window");

function SecureSwitchItems({ title, descriptions, onPress }) {
    return (
        <View style={styles.innerContainer}>
            <TouchableOpacity onPress={onPress} style={styles.listContainer}>
                <View style={styles.textBox}>
                    <Typo
                        text={title}
                        fontWeight="600"
                        fontSize={16}
                        lineHeight={18}
                        textAlign="left"
                    />
                    <Typo
                        text={descriptions}
                        fontWeight="normal"
                        fontSize={12}
                        lineHeight={18}
                        textAlign="left"
                        style={styles.description}
                        color={DARK_GREY}
                    />
                </View>
                <Image
                    source={Assets.icChevronRight24Black}
                    style={styles.settingItemChildChevron}
                />
            </TouchableOpacity>
        </View>
    );
}

SecureSwitchItems.propTypes = {
    title: PropTypes.string,
    descriptions: PropTypes.string,
    onPress: PropTypes.func,
};

function SecureSwitchLanding({ route, navigation, getModel }) {
    const {
        auth: { isPostPassword },
        misc: { isShowBlockCard, isShowSuspendCASA },
    } = getModel(["auth", "misc"]);

    useEffect(() => {
        if (!isPostPassword) {
            handleL3();
        }
    }, []);

    async function handleL3() {
        try {
            // L3 call to invoke login page
            const httpResp = await invokeL3(true);
        } catch (error) {
            console.log("[DeactivateM2ULanding][HandleL3] Error >>", error);
            navigation.goBack();
        }
    }

    const handleDeactivationForM2UCardsCASA = (content) => {
        navigation.navigate(SECURE_SWITCH_STACK, {
            screen: DEACTIVATE_M2U_CARDS_CASA_LANDING,
            params: { ...route?.params, content },
        });
    };

    function handleBackTap() {
        navigation.goBack();
    }

    const itemListing = [
        {
            title: DEACTIVATE_M2U_ACCESS,
            descriptions: DEACTIVATE_M2U_DESC,
            onPress: () => handleDeactivationForM2UCardsCASA(DEACTIVATE_M2U_ACCESS_LANDING),
        },
    ];

    if (isShowSuspendCASA) {
        itemListing.unshift({
            title: SUSPEND_ACCOUNTS,
            descriptions: DEACTIVATE_CASA,
            onPress: () => handleDeactivationForM2UCardsCASA(SUSPEND_CASA_LANDING),
        });
    }

    if (isShowBlockCard) {
        itemListing.unshift({
            title: BLOCK_CREDIT_CARD,
            descriptions: DEACTIVATE_CARDS,
            onPress: () => handleDeactivationForM2UCardsCASA(BLOCK_CARDS_LANDING),
        });
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                scrollable
                header={
                    <HeaderLayout
                        backgroundColor={GARGOYLE}
                        headerCenterElement={
                            <Typo
                                text={KILL_SWITCH}
                                fontWeight="600"
                                fontSize={16}
                                lineHeight={19}
                            />
                        }
                        headerLeftElement={<HeaderBackButton onPress={handleBackTap} />}
                    />
                }
                useSafeArea
            >
                <View style={styles.contentText}>
                    <Typo
                        fontSize={20}
                        lineHeight={28}
                        letterSpacing={0}
                        color={BLACK}
                        textAlign="left"
                        text={SS_LANDING_HEADER}
                    />
                </View>
                <ScrollView>
                    {itemListing.map((item, index) => (
                        <SecureSwitchItems key={item.title} index={index} {...item} />
                    ))}
                </ScrollView>
            </ScreenLayout>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    contentText: {
        padding: 24,
        paddingTop: 16,
    },
    description: {
        marginTop: 5,
    },
    innerContainer: {
        backgroundColor: WHITE,
        borderBottomColor: GREY,
        borderBottomWidth: 1,
    },
    listContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 24,
        width,
    },
    settingItemChildChevron: { height: 30, width: 30 },
    textBox: {
        marginRight: 24,
        width: "85%",
    },
});

SecureSwitchLanding.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    getModel: PropTypes.func,
};

export default withModelContext(SecureSwitchLanding);
