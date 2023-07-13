import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, ImageBackground, Image } from "react-native";

import Typo from "@components/Text";

import { WHITE, DARK_CYAN } from "@constants/colors";
import {
    SAVINGS_ACCOUNT_ID,
    SAVINGS_ACCOUNT_TYPE,
    SAVINGS_ACCOUNT_NAME,
    SAVINGS_ACCOUNT_SUBTEXT,
    SAVINGS_INTRO_SCREEN_DESC,
    SAVINGSI_ACCOUNT_ID,
    SAVINGSI_ACCOUNT_NAME,
    SAVINGSI_ACCOUNT_SUBTEXT,
    SAVINGSI_INTRO_SCREEN_DESC,
} from "@constants/premierStrings";

import Assets from "@assets";

export const IntroScreenViewSelection = ({ accountId, accountImage }) => {
    const buildDescription = () => {
        const accountList =
            accountId === SAVINGS_ACCOUNT_ID
                ? SAVINGS_INTRO_SCREEN_DESC
                : accountId === SAVINGSI_ACCOUNT_ID
                ? SAVINGSI_INTRO_SCREEN_DESC
                : "";

        return accountList.map((text, index) => {
            return (
                <View style={styles.descText} key={`descText-${index}`}>
                    <Image source={Assets.rightTick} style={styles.tick} />
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                        textAlign="left"
                        text={text}
                        style={styles.rightTickText}
                    />
                </View>
            );
        });
    };

    const accountType = () => {
        if (accountId) {
            switch (accountId) {
                case SAVINGS_ACCOUNT_ID:
                    return SAVINGS_ACCOUNT_TYPE;

                case SAVINGSI_ACCOUNT_ID:
                    return SAVINGSI_ACCOUNT_NAME;
            }
        }
    };

    const accountName = () => {
        if (accountId) {
            switch (accountId) {
                case SAVINGS_ACCOUNT_ID:
                    return SAVINGS_ACCOUNT_NAME;

                case SAVINGSI_ACCOUNT_ID:
                    return SAVINGSI_ACCOUNT_NAME;
            }
        }
    };

    const accountSubText = () => {
        if (accountId) {
            switch (accountId) {
                case SAVINGS_ACCOUNT_ID:
                    return SAVINGS_ACCOUNT_SUBTEXT;

                case SAVINGSI_ACCOUNT_ID:
                    return SAVINGSI_ACCOUNT_SUBTEXT;
            }
        }
    };

    return (
        <>
            <View style={styles.introScreen} testID={accountId}>
                <View style={styles.image}>
                    <ImageBackground source={accountImage} style={styles.imageBg} />
                </View>
                <View style={styles.description}>
                    {accountType() 
                    ? (
                        <View style={styles.accountType}>
                            <Typo
                                fontSize={12}
                                fontWeight="600"
                                lineHeight={16}
                                textAlign="left"
                                text={accountType()}
                                style={styles.accountText}
                            />
                        </View>
                    ) 
                    : null}
                    {accountName() 
                    ? (
                        <View>
                            <Typo
                                fontSize={20}
                                fontWeight="700"
                                lineHeight={28}
                                textAlign="left"
                                text={accountName()}
                            />
                        </View>
                    ) 
                    : null}
                    {accountSubText() 
                    ? (
                        <View style={styles.subtext}>
                            <Typo
                                fontSize={16}
                                fontWeight="400"
                                lineHeight={24}
                                textAlign="left"
                                text={accountSubText()}
                            />
                        </View>
                    ) 
                    : null}
                    <View style={styles.descContainer}>{buildDescription()}</View>
                </View>
            </View>
        </>
    );
};

IntroScreenViewSelection.propTypes = {
    accountId: PropTypes.string,
    accountImage: PropTypes.number,
};

const styles = StyleSheet.create({
    accountText: {
        color: WHITE,
        textAlign: "center",
    },
    accountType: {
        backgroundColor: DARK_CYAN,
        borderRadius: 12,
        color: WHITE,
        marginBottom: 24,
        marginTop: 24,
        paddingBottom: 4,
        paddingLeft: 4,
        paddingRight: 4,
        paddingTop: 4,
        width: 150,
    },
    descContainer: {
        marginBottom: 58,
    },
    descText: {
        flexDirection: "row",
        marginBottom: 15,
    },
    description: {
        marginLeft: 24,
        marginRight: 38,
    },
    imageBg: {
        height: 210,
        width: "100%",
    },
    subtext: {
        marginBottom: 27,
        marginTop: 8,
    },
    tick: {
        height: 10,
        marginRight: 12.8,
        marginTop: 5,
        width: 14,
    },
});
