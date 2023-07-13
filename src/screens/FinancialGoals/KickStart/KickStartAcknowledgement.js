/* eslint-disable react-native/no-raw-text */
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { Image, View, StyleSheet } from "react-native";

import { FINANCIAL_GOALS_DASHBOARD_SCREEN } from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, YELLOW, DARK_GREY } from "@constants/colors";
import {
    DONE,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FIN_STARTINVEST_CREATED,
    FA_FORM_COMPLETE,
    FA_TRANSACTION_ID,
    FA_FIELD_INFORMATION,
} from "@constants/strings";

import assets from "@assets";

const KickStartAcknowledgement = ({ navigation, route }) => {
    const fieldInfo = (() => {
        switch (route?.params?.goalType) {
            case "R":
                return "Retirement";
            case "E":
                return route?.params?.fundsFor === "myself" ? "Education" : "ChildEducation";
            case "W":
                return "Wealth";
        }
    })();

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_STARTINVEST_CREATED,
        });
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_FIN_STARTINVEST_CREATED,
            [FA_TRANSACTION_ID]: route?.params?.referenceId,
            [FA_FIELD_INFORMATION]: fieldInfo,
        });
    }, [fieldInfo, route?.params?.referenceId]);

    function onDoneTap() {
        navigation.navigate("Dashboard", {
            screen: FINANCIAL_GOALS_DASHBOARD_SCREEN,
        });
    }

    const detailsData = (() => {
        return [
            {
                title: "Reference ID",
                value: route?.params?.referenceId,
            },
            {
                title: "Date & time",
                value: route?.params?.createdDate,
            },
        ];
    })();

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout useSafeArea paddingTop={0} paddingHorizontal={0} paddingBottom={0}>
                <Image source={assets.kickStartSuccess} resizeMode="cover" style={styles.image} />
                <View style={styles.subContainer}>
                    <Typo
                        text="Congrats on starting your goal!"
                        fontSize={14}
                        fontWeight={600}
                        textAlign="left"
                        style={styles.title}
                    />
                    <Typo
                        text="You've made a smart choice and we're here to make sure everything goes smoothly. Sit back and relax, your funds are safely on their way. Thank you for choosing us!"
                        fontSize={16}
                        lineHeight={20}
                        fontWeight={400}
                        textAlign="left"
                        style={styles.subtitle}
                    />
                    {detailsData.map((item, index) => {
                        return <LabelValue key={index} label={item?.title} value={item?.value} />;
                    })}
                    <Typo
                        text="The cash in process may take up to 2 business days to be reflected. You will notified when the transaction is completed."
                        color={DARK_GREY}
                        fontSize={14}
                        fontWeight={400}
                        textAlign="left"
                        style={styles.disclaimer}
                    />
                </View>
                <FixedActionContainer>
                    <ActionButton
                        key="2"
                        fullWidth
                        onPress={onDoneTap}
                        backgroundColor={YELLOW}
                        componentCenter={
                            <Typo text={DONE} fontSize={14} fontWeight="600" lineHeight={18} />
                        }
                    />
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
};

KickStartAcknowledgement.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const LabelValue = ({ label, value }) => {
    return (
        <View style={styles.labelValueContainer}>
            <Typo
                text={label}
                fontSize={12}
                fontWeight={400}
                style={styles.flex}
                textAlign="left"
            />
            <Typo
                text={value}
                fontSize={12}
                fontWeight={600}
                style={styles.flex}
                textAlign="right"
            />
        </View>
    );
};

LabelValue.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
};

const styles = StyleSheet.create({
    disclaimer: {
        paddingTop: 30,
    },
    flex: { flex: 1 },
    image: {
        width: "100%",
    },
    labelValueContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    subContainer: {
        flex: 1,
        paddingHorizontal: 24,
    },
    subtitle: {
        paddingBottom: 20,
    },
    title: {
        paddingBottom: 8,
        paddingTop: 32,
    },
});

export default KickStartAcknowledgement;
