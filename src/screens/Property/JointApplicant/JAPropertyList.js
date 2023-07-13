/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable react/jsx-no-bind */
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    View,
    Platform,
    RefreshControl,
    TouchableOpacity,
    Image,
    ScrollView,
} from "react-native";

import { BANKINGV2_MODULE, JA_PROPERTY_DETAILS } from "@navigation/navigationConstant";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";

import { getPropertyDetails } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, WHITE, GREY_DARK } from "@constants/colors";
import {
    FA_ACTION_NAME,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_SELECT_APPLICATION,
    PROPERTY,
    FA_PROPERTY_PENDINGINVITATIONS,
} from "@constants/strings";

import { getShadow } from "@utils/dataModel/utilityPartial.2";

function ListItemContentBlock({ title, value = "-" }) {
    return (
        <View style={Style.contentBlock}>
            <Typo textAlign="left" fontSize={12} lineHeight={18} text={title} />
            <Typo textAlign="left" fontSize={12} fontWeight="600" lineHeight={18} text={value} />
        </View>
    );
}
const ListItem = ({ onPress, data, isLastItem = false, lastItemPadding = false }) => {
    const onItemPress = () => {
        if (onPress) onPress(data);
    };
    return (
        <View style={Platform.OS === "ios" ? Style.shadow : {}}>
            <TouchableOpacity
                style={[
                    Platform.OS === "ios" ? {} : Style.shadow,
                    Style.lisItemContainer(isLastItem && lastItemPadding ? 50 : 25),
                    Style.horizontalMargin,
                ]}
                activeOpacity={0.8}
                onPress={onItemPress}
            >
                {/* Header */}
                <View style={Style.listItemHeader}>
                    <Image
                        style={Style.listItemHeaderImage}
                        source={{
                            uri: data?.imageUrl ?? null,
                        }}
                    />
                    <Typo
                        textAlign="left"
                        fontWeight="600"
                        lineHeight={18}
                        numberOfLines={1}
                        color={WHITE}
                        text={data?.propertyName ?? ""}
                        style={Style.listItemHeaderText}
                    />
                </View>

                <View style={Style.listItemBody}>
                    {/* Status Pill */}
                    <View style={Style.statusPillCont} />
                    <View style={Style.listItemInnerBody}>
                        <ListItemContentBlock
                            title="Property financing amount"
                            value={
                                !isNaN(data?.propertyFinancingAmt)
                                    ? `RM ${numeral(data.propertyFinancingAmt).format("0,0.00")}`
                                    : "-"
                            }
                        />
                        <ListItemContentBlock
                            title="Financing period"
                            value={data?.financingPeriod ? `${data.financingPeriod} years` : "-"}
                        />
                        <ListItemContentBlock
                            title="Monthly Instalment"
                            value={
                                !isNaN(data?.monthlyInstalment)
                                    ? `RM ${numeral(data.monthlyInstalment).format("0,0.00")}`
                                    : "-"
                            }
                            // value={data?.monthlyInstalment ?? "-"}
                        />
                        <ListItemContentBlock
                            title="Effective profit rate"
                            value={data?.effectiveProfitRate ? `${data.effectiveProfitRate}%` : "-"}
                        />
                    </View>
                    {/* )} */}
                </View>
            </TouchableOpacity>
        </View>
    );
};
const JAPropertyList = ({ navigation, route }) => {
    const isLoading = false;
    const loading = false;
    const [pendingInvitationList, setPendingInvitationList] = useState([]);

    useEffect(() => {
        setPendingInvitationList(route?.params?.list);
    }, []);

    const onBackTap = () => {
        navigation.goBack();
    };

    const onPress = async (data) => {
        const params = {
            property_id: data.propertyId,
            latitude: route.params.latitude,
            longitude: route.params.longitude,
        };
        let result = null;
        if (data.propertyId !== null) {
            result = await getPropertyDetails(params);
        }

        navigation.navigate(BANKINGV2_MODULE, {
            screen: JA_PROPERTY_DETAILS,
            params: {
                latitude: route.params.latitude,
                longitude: route.params.longitude,
                savedData: data,
                propertyData: result !== null ? result.data.result.propertyDetails : null,
                token: route.params.token,
            },
        });
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY_PENDINGINVITATIONS,
            [FA_ACTION_NAME]: FA_SELECT_APPLICATION,
        });
    };

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={loading}
            analyticScreenName={FA_PROPERTY_PENDINGINVITATIONS}
        >
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        headerCenterElement={
                            <Typo fontSize={16} fontWeight="600" lineHeight={19} text={PROPERTY} />
                        }
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
            >
                <View style={Style.container}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                        refreshControl={
                            <RefreshControl refreshing={isLoading} onRefresh={() => {}} />
                        }
                        onScroll={() => {}}
                        scrollEventThrottle={400}
                    >
                        <View style={Style.horizontalMarginBig}>
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={20}
                                text="Pending Invitation"
                                textAlign="left"
                            />

                            <Typo
                                lineHeight={22}
                                fontSize={20}
                                textAlign="left"
                                style={Style.subText1}
                                text="Tap to view your joint application invitation"
                            />
                        </View>
                        {pendingInvitationList.map((item, index) => {
                            return (
                                <ListItem
                                    onPress={onPress}
                                    data={item}
                                    key={index}
                                    isLastItem={pendingInvitationList.length - 1 === index}
                                    lastItemPadding={true}
                                />
                            );
                        })}
                    </ScrollView>
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
};
JAPropertyList.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};
ListItemContentBlock.propTypes = {
    title: PropTypes.string,
    value: PropTypes.string,
};
ListItem.propTypes = {
    onPress: PropTypes.func,
    data: PropTypes.object,
    isLastItem: PropTypes.bool,
    lastItemPadding: PropTypes.bool,
};

const Style = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },

    contentBlock: {
        marginBottom: 5,
        minHeight: 50,
        width: "50%",
    },
    horizontalMargin: {
        marginHorizontal: 24,
    },

    horizontalMarginBig: {
        marginHorizontal: 36,
    },
    lisItemContainer: (marginBottom) => ({
        backgroundColor: WHITE,
        borderRadius: 8,
        marginBottom,
        overflow: "hidden",
    }),
    listItemBody: {
        paddingHorizontal: 15,
        // paddingVertical: 12,
        paddingTop: 12,
    },

    listItemHeader: {
        backgroundColor: GREY_DARK,
        height: 45,
        width: "100%",
    },

    listItemHeaderImage: {
        height: "100%",
        opacity: 0.3,
        width: "100%",
    },

    listItemHeaderText: {
        paddingHorizontal: 15,
        position: "absolute",
        top: 15,
    },

    listItemInnerBody: {
        flexDirection: "row",
        flexWrap: "wrap",
    },

    shadow: {
        ...getShadow({
            elevation: 8,
        }),
    },

    statusPillCont: {
        alignItems: "center",
        flexDirection: "row",
        marginBottom: 10,
    },

    subText1: {
        marginBottom: 20,
        marginTop: 10,
    },
});
export default JAPropertyList;
