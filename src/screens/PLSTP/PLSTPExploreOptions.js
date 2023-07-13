import React, { useEffect } from "react";
import { View, StyleSheet, Image, ScrollView } from "react-native";

import { SETTINGS_MODULE, TAB_NAVIGATOR } from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import { CardTemplate } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { TRANSPARENT, YELLOW } from "@constants/colors";
import {
    PLSTP_EXPLORE_TITLE,
    PLSTP_EZYCASH_TITLE,
    PLSTP_EZYPAY_TITLE,
    PLSTP_EZYPAY_DESC,
    PLSTP_BAL_TRNS_TITLE,
    PLSTP_BAL_TRNS_DESC,
    DONE,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
} from "@constants/strings";
import { PLSTP_EZYCASH_URL, PLSTP_EZYPAY_URL, PLSTP_BALTRNS_URL } from "@constants/url";

import Assets from "@assets";

const PLSTPExploreOptions = ({ navigation }) => {
    useEffect(() => {
        init();
    }, []);

    function init() {
        console.log("[PLSTPExploreOptions] >> [init]");
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Apply_PersonalLoan_Fail_Screen",
        });
    }

    function onDoneTap() {
        console.log("[PLSTPExploreOptions] >> [onDoneTap]");
        navigation.navigate(TAB_NAVIGATOR, {
            screen: "Tab",
            params: {
                screen: "Maybank2u",
            },
        });
    }

    function exploreOptions(from) {
        console.log("[PLSTPExploreOptions] >>> [exploreOptions]");

        //Check user is logged in
        //Navigate to explore options screen
        let url, title, actionName;
        switch (from) {
            case "cash":
                url = PLSTP_EZYCASH_URL;
                title = PLSTP_EZYCASH_TITLE;
                actionName = "EzyCash";
                break;
            case "pay":
                url = PLSTP_EZYPAY_URL;
                title = PLSTP_EZYPAY_TITLE;
                actionName = "EzyPay Plus";
                break;
            case "trns":
                url = PLSTP_BALTRNS_URL;
                title = PLSTP_BAL_TRNS_TITLE;
                actionName = "Balance Transfer";
                break;
            default:
                return;
        }
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Apply_ViewOtherProducts",
            [FA_ACTION_NAME]: actionName,
        });
        const props = {
            title: title,
            source: url,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName="Apply_ViewOtherProducts">
                <ScreenLayout useSafeArea paddingHorizontal={0} paddingBottom={0}>
                    <React.Fragment>
                        <ScrollView
                            style={styles.scrollViewCls}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.pageContainer}>
                                <View style={styles.imageContainer}>
                                    <View style={styles.imageView}>
                                        <Image source={Assets.plstpgroup} />
                                    </View>
                                </View>
                                <Typo
                                    fontSize={20}
                                    lineHeight={28}
                                    fontWeight="300"
                                    textAlign="center"
                                    text={PLSTP_EXPLORE_TITLE}
                                    style={styles.titleLabelCls}
                                />

                                <CardTemplate
                                    title={PLSTP_EZYPAY_TITLE}
                                    desc={PLSTP_EZYPAY_DESC}
                                    image={Assets.plstptravel}
                                    from="pay"
                                    onPress={exploreOptions}
                                />

                                <CardTemplate
                                    title={PLSTP_BAL_TRNS_TITLE}
                                    desc={PLSTP_BAL_TRNS_DESC}
                                    image={Assets.plstpsupplimentcard}
                                    from="trns"
                                    onPress={exploreOptions}
                                />
                            </View>
                        </ScrollView>

                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <View style={styles.bottomBtnContCls}>
                                <ActionButton
                                    backgroundColor={YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={DONE}
                                        />
                                    }
                                    onPress={onDoneTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );
};

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    imageContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    imageView: {
        alignItems: "center",
        height: 55,
        justifyContent: "center",
        marginTop: 91,
        width: 55,
    },
    pageContainer: {
        marginBottom: 36,
    },

    scrollViewCls: {
        paddingHorizontal: 36,
    },

    titleLabelCls: {
        marginTop: 34,
    },
});

export default PLSTPExploreOptions;
