import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { MEDIUM_GREY, YELLOW } from "@constants/colors";

import Images from "@assets";
import { logEvent } from "@services/analytics";
import { FA_SCREEN_NAME, FA_TRANSACTION_ID, FA_FORM_ERROR } from "@constants/strings";
import moment from "moment";
import SpaceFiller from "@components/Placeholders/SpaceFiller";

function ZakatFail({ navigation, route }) {
    const { flowParams } = route.params;
    function handleClose() {
        if (route?.params?.flowParams) {
            navigation.navigate(flowParams?.fail.stack, {
                screen: flowParams?.fail.screen,
                params: {
                    auth: "fail",
                    reason: route?.params?.reason ?? "",
                    ...flowParams.params,
                },
            });
        } else {
            navigation.navigate("Dashboard", {
                screen: "Settings",
            });
        }
    }

    useEffect(() => {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "Apply_AutoDebitZakat_Unsuccessful",
            [FA_TRANSACTION_ID]: flowParams?.params?.referenceId
        });
    }, [route?.params?.flowParams]);

    const _getTransactionType = () => {
        return flowParams?.params?.transType === "PAYFROM" 
            ? `Auto Debit for Zakat\nSwitch Account` 
            : flowParams?.params?.transType === "ZAKATBODY" 
            ? `Auto Debit for Zakat\nSwitch Body` 
            : flowParams?.params?.transType === "MOBILE" 
            ? `Auto Debit for Zakat\nEdit Mobile No.` 
            : flowParams?.params?.transType === "CANCELAUTODEBIT" 
            ? `Auto Debit for Zakat\nCancel Auto Debit` 
            : `Set up Auto Debit\nfor Zakat`; 
    };

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY} 
            analyticScreenName="Apply_AutoDebitZakat_Unsuccessful">
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
                            <View>
                                <Image source={Images.icFailedIcon} style={styles.meta} />
                            </View>
                            <View style={styles.footer}>
                                <Typo
                                    fontSize={20}
                                    lineHeight={28}
                                    fontWeight="400"
                                    text="Set up unsuccessful"
                                    textAlign="left"
                                />
                                <Typo
                                    fontSize={14}
                                    fontWeight="200"
                                    lineHeight={18}
                                    style={styles.label}
                                    text={flowParams?.params?.message}
                                    textAlign="left"
                                />
                            </View>
                            <View style={styles.errorDataStyle}>
                                <Typo
                                    fontSize={12}
                                    lineHeight={18}
                                    fontWeight="400"
                                    text="Reference ID"
                                    textAlign="left"
                                />
                                <Typo
                                    fontSize={12}
                                    lineHeight={18}
                                    fontWeight="600"
                                    text={flowParams?.params?.referenceId || "-"}
                                    textAlign="right"
                                />
                            </View>
                            <SpaceFiller height={17}/>
                            <View style={styles.errorDataStyle}>
                                <Typo
                                    fontSize={12}
                                    lineHeight={18}
                                    fontWeight="400"
                                    text="Date and Time"
                                    textAlign="left"
                                />
                                <Typo
                                    fontSize={12}
                                    lineHeight={18}
                                    fontWeight="600"
                                    text={moment(flowParams?.params?.timeStamp).format("DD MMMM YYYY, hh:mm A") || "-"}
                                    textAlign="right"
                                />
                            </View>
                            <SpaceFiller height={17}/>
                            <View style={styles.errorDataStyle}>
                                <Typo
                                    fontSize={12}
                                    lineHeight={18}
                                    fontWeight="400"
                                    text="Transaction Type"
                                    textAlign="left"
                                />
                                <Typo
                                    fontSize={12}
                                    lineHeight={18}
                                    fontWeight="600"
                                    text={_getTransactionType()}
                                    textAlign="right"
                                />
                            </View>

                        </View>
                        <FixedActionContainer>
                            <View style={styles.actionContainer}>
                                <ActionButton
                                    fullWidth
                                    borderRadius={25}
                                    onPress={handleClose}
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

ZakatFail.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
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
    errorDataStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footer: {
        flexDirection: "column",
        paddingVertical: 24,
    },
    label: {
        paddingVertical: 22,
    },
    meta: {
        height: 56,
        width: 56,
    },
});

export default ZakatFail;
