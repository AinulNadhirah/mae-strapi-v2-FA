import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { StyleSheet, ScrollView, View } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/TextWithInfo";

import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { BLACK, MEDIUM_GREY, YELLOW } from "@constants/colors";
import { OVERSEAS_INFO_DATA } from "@constants/data/Overseas";
import { CONTINUE } from "@constants/strings";

function OverseasPrequisites({ navigation, route }) {
    const { headerTitle, name } = route?.params || {};
    const productType = name;
    const { pageTitle = "", detailData = [] } = OVERSEAS_INFO_DATA[productType];
    useEffect(() => {
        RemittanceAnalytics.trxPrerequisitesLoaded(productType === "RT" ? "MOT" : productType);
    }, [productType]);

    function getHeaderUI() {
        return (
            <HeaderLayout
                headerLeftElement={<HeaderBackButton onPress={onBackButtonPress} />}
                headerCenterElement={
                    headerTitle ? (
                        <Typo text={headerTitle} fontWeight="600" fontSize={16} lineHeight={18} />
                    ) : null
                }
            />
        );
    }

    const onBackButtonPress = () => {
        if (productType === "WU") {
            navigation.navigate("OverseasProductListScreen", {
                ...route?.params,
            });
            return;
        }

        navigation.goBack();
    };

    function getScreenName(name) {
        if (name === "RT") {
            return "MOTRecipientBankDetails";
        }
        if (name === "FTT") {
            return "FTTRecipientBankDetails";
        }
        if (name === "WU") {
            return "WUSenderDetailsStepOne";
        }
        // if (name === "BK") {
        //     return "Bakong Transfer";
        // }
        if (name === "VD") {
            return "VDTransferDetails";
        }
    }

    function onContinue() {
        navigation.navigate(getScreenName(productType), {
            ...route?.params,
        });
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={16}
                paddingHorizontal={0}
                useSafeArea
                header={getHeaderUI()}
            >
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Typo
                        textAlign="left"
                        text={pageTitle}
                        fontWeight="600"
                        fontSize={16}
                        lineHeight={19}
                    />
                    {detailData.map((data, i) => {
                        return (
                            <View style={styles.mappedData} key={"detailData-" + i}>
                                <Typo
                                    style={styles.itemTitle}
                                    textAlign="left"
                                    text={`${data?.title}`}
                                    fontWeight="400"
                                    fontSize={16}
                                    lineHeight={20}
                                />
                                {data?.items.map((item) => {
                                    return (
                                        <View key={"detailDataItem-" + i}>
                                            <Typo
                                                style={styles.itemDesc}
                                                textAlign="left"
                                                text={`${item}`}
                                                fontWeight="400"
                                                fontSize={14}
                                                lineHeight={21}
                                            />
                                        </View>
                                    );
                                })}
                            </View>
                        );
                    })}
                </ScrollView>
                <FixedActionContainer>
                    <ActionButton
                        backgroundColor={YELLOW}
                        fullWidth
                        componentCenter={
                            <Typo
                                color={BLACK}
                                lineHeight={18}
                                fontWeight="600"
                                fontSize={14}
                                text={CONTINUE}
                            />
                        }
                        onPress={onContinue}
                    />
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        paddingBottom: 25,
        paddingHorizontal: 24,
    },
    itemDesc: {
        marginTop: 15,
    },
    itemTitle: {
        marginTop: 20,
    },
    mappedData: { flexDirection: "column" },
});
OverseasPrequisites.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};
export default OverseasPrequisites;
