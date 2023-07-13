import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from "react-native";
import Share from "react-native-share";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { GASettingsScreen } from "@services/analytics/analyticsSettings";

import { MEDIUM_GREY, WHITE, SHADOW_LIGHT, GARGOYLE } from "@constants/colors";
import { FA_SETTINGS_CONTACTUS } from "@constants/strings";

import { contactBankcall } from "@utils/dataModel/utility";

import Images from "@assets";

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: 24,
    },
    helplineContainer: {
        paddingVertical: 36,
    },
    itemCard: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingVertical: 18,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
    },
    itemContainer: {
        paddingHorizontal: 24,
        paddingVertical: 8,
    },
    itemTitle: {
        marginBottom: 8,
    },
    scroller: {
        paddingVertical: 40,
    },
    settingItemChildChevron: { height: 24, width: 24 },
});

const helplines = [
    {
        title: "Customer Care Hotline (Malaysia)",
        phoneNo: "1-300-88-6688",
    },
    {
        title: "Customer Care Hotline (Overseas)",
        phoneNo: "+603 7844 3696",
    },
    {
        title: "Email",
        email: "mgcc@maybank.com.my",
    },
    {
        title: "Fraud Hotline",
        phoneNo: "+603 5891 4744",
    },
];

function Item({ item }) {
    function handleCall() {
        contactBankcall(item.phoneNo);
        GASettingsScreen.onClickHelpline(item.title);
    }

    function handleEmail() {
        Linking.openURL(`mailto:${item.email}`).catch(() => {
            // if fail use share
            const shareOptions = {
                title: item.title,
                message: item.email,
            };

            Share.open(shareOptions).catch(() => {
                showErrorToast({
                    message: "Unable to share the email",
                });
            });
        });
        GASettingsScreen.onClickHelpline(item.title);
    }

    return (
        <View key={item.title} style={styles.itemContainer}>
            <TouchableOpacity
                onPress={item.phoneNo ? handleCall : handleEmail}
                style={styles.itemCard}
            >
                <View>
                    <Typo
                        fontSize={14}
                        fontWeight="normal"
                        lineHeight={18}
                        text={item.title}
                        textAlign="left"
                        style={styles.itemTitle}
                    />
                    <Typo
                        fontSize={16}
                        fontWeight="600"
                        lineHeight={18}
                        text={item?.phoneNo ?? item?.email}
                        textAlign="left"
                    />
                </View>
                <View>
                    <Image
                        source={Images.icChevronRight24Black}
                        style={styles.settingItemChildChevron}
                    />
                </View>
            </TouchableOpacity>
        </View>
    );
}

Item.propTypes = {
    item: PropTypes.object,
};

function Helpline({ navigation }) {
    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={FA_SETTINGS_CONTACTUS}
        >
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                header={
                    <HeaderLayout
                        backgroundColor={GARGOYLE}
                        headerCenterElement={
                            <Typo text="Helpline" fontWeight="600" fontSize={16} lineHeight={19} />
                        }
                        headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                    />
                }
                neverForceInset={["bottom"]}
                useSafeArea
            >
                <ScrollView contentContainerStyle={styles.scroller}>
                    <View style={styles.content}>
                        <Typo
                            fontSize={20}
                            fontWeight="300"
                            lineHeight={28}
                            text="For any enquiries regarding your account, please call the respective hotline below."
                            textAlign="left"
                        />
                    </View>
                    <View style={styles.helplineContainer}>
                        {helplines.map((item) => (
                            <Item key={item.title} item={item} />
                        ))}
                    </View>
                </ScrollView>
            </ScreenLayout>
        </ScreenContainer>
    );
}

Helpline.propTypes = {
    navigation: PropTypes.object,
};

export default Helpline;
