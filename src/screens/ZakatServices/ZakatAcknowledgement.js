import PropTypes from "prop-types";
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Image, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";
import { useModelController } from "@context";
import { logEvent } from "@services/analytics";

import { BLACK, DARK_GREY, YELLOW } from "@constants/colors";
import {
    DONE,
    FA_FORM_COMPLETE,
    FA_SCREEN_NAME,
    ZAKAT_SUCCESS_NOTE,
    ZAKAT_SUCCESS_DATE_NOTIFIER,
    FA_TRANSACTION_ID
} from "@constants/strings";

import assets from "@assets";
import moment from "moment";
import { maskedMobileNumber } from "@utils";
import { formateAccountNumber, removeWhiteSpaces } from "@utils/dataModel/utilityPartial.3";
import { checkIfNumberWithPrefix, APIContactToDisplayCntry } from "@utils/dataModel/utilityZakat";

const ZakatAcknowledgement = ({ navigation, route }) => {
    const { bottom } = useSafeAreaInsets();

    const { getModel } = useModelController();

    const { mobileNumber } = getModel("user");

    const zakatData = [
        {
            labelName: "Pay from:",
            labelValue: [route?.params?.payFromAcctName, formateAccountNumber(route?.params?.payFromAcctNo, 12)]
        },
        {
            labelName: "Zakat body:",
            labelValue: route?.params?.zakatBody
        },
        {
            labelName: "Mobile number:",
            labelValue: removeWhiteSpaces(route?.params?.mobileNumber) === removeWhiteSpaces(checkIfNumberWithPrefix(mobileNumber)) 
            ? maskedMobileNumber(APIContactToDisplayCntry(route?.params?.mobileNumber)) 
            : APIContactToDisplayCntry(route?.params?.mobileNumber),
        },
        {
            labelName: "Reference ID:",
            labelValue: route?.params?.transactionID
        },
        {
            labelName: "Date & time",
            labelValue: moment(new Date()).format("DD MMMM YYYY, hh:mm A")
        }
    ];

    useEffect(() => {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "Apply_AutoDebitZakat_Successful",
            [FA_TRANSACTION_ID]: route?.params?.transactionID
        });
    }, [route?.params?.transactionID]);

    function onPressDone() {
        navigation.navigate("TabNavigator", {
            screen: "Tab",
            params: {
                screen: "MAE_ACC_DASHBOARD"
            },
        });
    }

    const scrollView = useRef();

    return (
        <>
            <ScreenContainer analyticScreenName="Apply_AutoDebitZakat_Successful">
                <ScreenLayout
                        paddingTop={0}
                        paddingHorizontal={0}
                        paddingBottom={bottom}>
                    <ScrollView
                            ref={scrollView}
                            style={styles.container}
                        >
                            <Image source={assets.onboardingSuccessBg} style={styles.bgImage} />

                        <View style={styles.marginConatiner}>
                        <Typo
                            text="Set up successful!"
                            fontSize={16}
                            lineHeight={24}
                            fontWeight="600"
                            textAlign="left"
                        />
                        <Typo
                            text={ZAKAT_SUCCESS_DATE_NOTIFIER}
                            fontSize={14}
                            lineHeight={20}
                            fontWeight="400"
                            textAlign="left"
                            style={styles.subtitle}
                        />

                        <View style={styles.zakatDataContainer}>
                            <View >
                                {
                                    zakatData.map((data) => {
                                        return (
                                            <>
                                                <Typo
                                                    text={data?.labelName}
                                                    fontSize={14}
                                                    lineHeight={20}
                                                    fontWeight="600"
                                                    textAlign="left"
                                                    style={styles.sectionPadding}
                                                />
                                                {
                                                    !Array.isArray(data?.labelValue)
    ? (
                                                        <Typo
                                                            text={data?.labelValue}
                                                            fontSize={12}
                                                            lineHeight={20}
                                                            fontWeight="400"
                                                            textAlign="left"
                                                            style={styles.subtitle}
                                                        />
                                                    )
    : (
                                                        data?.labelValue.map((subd, index) => {
                                                            return (
                                                                <Typo key={index}
                                                                    text={subd}
                                                                    fontSize={12}
                                                                    lineHeight={20}
                                                                    fontWeight="400"
                                                                    textAlign="left"
                                                                    style={styles.subtitle}
                                                                />
                                                            );
                                                        })
                                                    )
                                                }
                                                
                                            </>
                                        );
                                    })
                                }
                            </View>

                            <View style={styles.footerNoteStyle}>
                                <Typo fontSize={12}
                                    fontWeight="400"
                                    lineHeight={18}
                                    textAlign="left">
                                        Note:
                                <Typo
                                    text={` ${ZAKAT_SUCCESS_NOTE}`}
                                    fontSize={12}
                                    fontWeight="400"
                                    lineHeight={18}
                                    textAlign="left"
                                    color={DARK_GREY}
                                />
                                </Typo>
                            </View>
                            
                        </View>
                    </View>
                        
                    </ScrollView>

                    <FixedActionContainer>
                <ActionButton
                    fullWidth
                    backgroundColor={YELLOW}
                    onPress={onPressDone}
                    style={styles.button}
                    componentCenter={
                        <Typo text={DONE} fontWeight="600" fontSize={14} color={BLACK} />
                    }
                />
            </FixedActionContainer>
                </ScreenLayout>
            </ScreenContainer>
    </>
    );
};

ZakatAcknowledgement.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    bgImage: { resizeMode: "cover", width: "100%" },
    button: {
        marginRight: 24,
    },
    container: {
        flex: 1,
    },
    marginConatiner: {
        paddingHorizontal: 24,
    },
    footerNoteStyle: {
        flexDirection: 'row', 
        alignItems: 'flex-start', 
        justifyContent: 'flex-start',
        marginTop: 10,
    },
    sectionPadding: {
        paddingTop: 10
    },
    zakatDataContainer: {
        flex: 1, 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        paddingTop: 24, 
        paddingBottom: 24
    }
});

export default ZakatAcknowledgement;
