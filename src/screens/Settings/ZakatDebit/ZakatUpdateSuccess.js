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
import { FA_FORM_COMPLETE, FA_SCREEN_NAME, FA_TRANSACTION_ID } from "@constants/strings";
import { SETTINGS_MODULE } from "@navigation/navigationConstant";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import { APIContactToDisplayCntry } from "@utils/dataModel/utilityZakat";

function ZakatUpdateSuccess({ navigation, route }) {
    const { flowParams } = route.params;
    function handleClose() {
        navigation.navigate(SETTINGS_MODULE, {
            screen: "ZakatAutoDebitSettings",
            params: {
                accountUpdate: flowParams?.menuUpdated === "PAYFROM",
                zakatBodyUpdate: flowParams?.menuUpdated === "ZAKATBODY",
                mobileUpdate: flowParams?.menuUpdated === "MOBILE",
            }
        });
    }

    const successScreen = flowParams?.menuUpdated === "PAYFROM" 
        ? "Settings_AutoDebitZakat_SwitchAccount_Successful" 
        : flowParams?.menuUpdated === "ZAKATBODY" 
        ? "Settings_AutoDebitZakat_SwitchOrg_Successful" 
        : "Settings_AutoDebitZakat_EditMobileNumber_Successful";

    useEffect(() => {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: successScreen,
            [FA_TRANSACTION_ID]: flowParams?.referenceId
        });
    }, [route?.params?.flowParams]);

    const _getTransactionType = () => {
        const transType = flowParams?.menuUpdated === 'PAYFROM' 
        ? "Switch Account" 
        : flowParams?.menuUpdated === 'ZAKATBODY' 
        ? "Switch Zakat Body" 
        : "Edit Mobile Number";

        return "Auto Debit for Zakat - \n".concat(transType);
    };

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY} 
            analyticScreenName={successScreen}>
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
                                <Image source={Images.icTickNew} style={styles.meta} />
                            </View>
                            <View style={styles.footer}>
                                <Typo
                                    fontSize={20}
                                    lineHeight={30}
                                    fontWeight="400"
                                    text={flowParams?.header}
                                    textAlign="left"
                                />
                            </View>

                            <View style={styles.errorDataStyle}>
                                <Typo
                                    fontSize={12}
                                    lineHeight={18}
                                    fontWeight="400"
                                    text="Switch to"
                                    textAlign="left"
                                    style={styles.leftRightFlexStyle}
                                />
                                <Typo
                                    style={styles.leftRightFlexStyle}
                                    fontSize={12}
                                    lineHeight={18}
                                    fontWeight="600"
                                    text={flowParams?.menuUpdated === "MOBILE" 
                                    ? APIContactToDisplayCntry(flowParams?.switchTo) 
                                    : flowParams?.switchTo
                                    }
                                    ellipsizeMode="tail"
                                    numberOfLines={2}
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
                                    text={flowParams?.timeStamp || "-"}
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

ZakatUpdateSuccess.propTypes = {
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
    meta: {
        height: 56,
        width: 56,
    },
    leftRightFlexStyle: {
        flex: 1
    }
});

export default ZakatUpdateSuccess;
