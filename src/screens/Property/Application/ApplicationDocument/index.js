import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { FlatList, TouchableOpacity, StyleSheet, Image } from "react-native";

import {
    BANKINGV2_MODULE,
    CHAT_DOCUMENTS,
    LETTER_OFFER_LIST,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { invokeL2 } from "@services";
import { logEvent } from "@services/analytics";

import { GREY, MEDIUM_GREY, TRANSPARENT } from "@constants/colors";
import {
    FA_ACTION_NAME,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_VIEW_SCREEN,
} from "@constants/strings";

import Assets from "@assets";

const ApplicationDocument = ({ route, navigation }) => {
    const list = [
        {
            id: 1,
            title: "Letter of Offer",
            action: navigateToLetterOffer,
        },
        {
            id: 2,
            title: "Chat Documents",
            action: navigateToChatDocument,
        },
    ];

    const { getModel } = useModelController();

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Property_Documents",
        });
    }, []);

    function navigateToLetterOffer() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: LETTER_OFFER_LIST,
            params: {
                ...route.params,
            },
        });

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Property_Documents",
            [FA_ACTION_NAME]: "Letter of Document",
        });
    }

    async function navigateToChatDocument() {
        const { isPostLogin, isPostPassword } = getModel("auth");
        if (!isPostPassword && !isPostLogin) {
            try {
                // L2 call to invoke login page
                const httpResp = await invokeL2(false);
                const code = httpResp?.data?.code ?? null;
                if (code != 0) return;
            } catch (error) {
                console.log("[ApplicationDocument][navigateToChatWindow] Exception:" + error);
                return;
            }
        }

        navigation.navigate(BANKINGV2_MODULE, {
            screen: CHAT_DOCUMENTS,
            params: {
                ...route.params,
            },
        });

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Property_Documents",
            [FA_ACTION_NAME]: "Chat Documents",
        });
    }

    function renderItem({ item }) {
        return <DocumentItem title={item.title} onPress={item?.action} />;
    }

    function onBackTap() {
        navigation.goBack();
    }

    function keyExtractor(item) {
        return `${item?.id}`;
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        headerCenterElement={
                            <Typo text="Documents" lineHeight={20} fontSize={16} fontWeight="600" />
                        }
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                useSafeArea
            >
                <FlatList
                    data={list}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    style={styles.flatList}
                />
            </ScreenLayout>
        </ScreenContainer>
    );
};

ApplicationDocument.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const DocumentItem = ({ title, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.itemContainer}>
            <Typo fontWeight="400" fontSize={14} style={styles.itemText}>
                {title}
            </Typo>
            <Image source={Assets.nextArrow} style={styles.image} />
        </TouchableOpacity>
    );
};

DocumentItem.propTypes = {
    title: PropTypes.string,
    onPress: PropTypes.func,
};

const styles = StyleSheet.create({
    flatList: {
        flex: 1,
    },
    image: {
        height: 15,
        width: 15,
    },
    itemContainer: {
        alignItems: "center",
        backgroundColor: TRANSPARENT,
        borderBottomColor: GREY,
        borderBottomWidth: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 36,
    },
    itemText: {
        paddingVertical: 31,
    },
});

export default ApplicationDocument;
