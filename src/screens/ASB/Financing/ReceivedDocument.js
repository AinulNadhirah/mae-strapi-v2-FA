import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { View, Image, StyleSheet, ScrollView, Dimensions } from "react-native";
import { useDispatch } from "react-redux";

import { DASHBOARD } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { YELLOW, MEDIUM_GREY } from "@constants/colors";
import {
    FA_FORM_COMPLETE,
    FA_SCREEN_NAME,
    OKAY_GOT_IT,
    WE_RECEIVED_DOC,
    WE_RECEIVED_DOC_KINDLY_ALLOW_TO_PROCEED,
} from "@constants/strings";

import Assets from "@assets";

import { doneWithDataPush } from "../../../redux/reducers/ASBFinance/SingleApplicantbookingform";

const screenHeight = Dimensions.get("window").height;

const ReceivedDocumentScreen = ({ navigation }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "Apply_ASBFinancing_DocumentsReceived",
        });
        dispatch(doneWithDataPush());
    }, []);

    function handleDone() {
        navigation.navigate(DASHBOARD);
    }
    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName="Apply_ASBFinancing_DocumentsReceived"
        >
            <ScreenLayout
                header={<HeaderLayout />}
                useSafeArea
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                >
                    <View style={styles.container}>
                        <View style={styles.statusPgImgBlockCls}>
                            <Image
                                resizeMode="contain"
                                style={styles.statusIcon}
                                source={Assets.icTickNew}
                                // icTickNew
                            />
                        </View>
                        <Typo
                            text={WE_RECEIVED_DOC}
                            fontSize={20}
                            fontWeight="400"
                            lineHeight={28}
                            textAlign="left"
                            style={styles.title}
                        />

                        <Typo
                            text={WE_RECEIVED_DOC_KINDLY_ALLOW_TO_PROCEED}
                            fontSize={14}
                            fontWeight="400"
                            lineHeight={20}
                            textAlign="left"
                            style={styles.subTitle}
                        />
                    </View>
                </ScrollView>
                <FixedActionContainer>
                    <View style={styles.bottomBtnContCls}>
                        <ActionButton
                            onPress={handleDone}
                            activeOpacity={0.5}
                            backgroundColor={YELLOW}
                            fullWidth
                            componentCenter={
                                <Typo
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="600"
                                    text={OKAY_GOT_IT}
                                />
                            }
                        />
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flex: 1,
        justifyContent: "space-around",
    },

    container: {
        alignItems: "flex-start",
        flex: 1,
        justifyContent: "flex-start",
        marginHorizontal: 24,
        paddingBottom: 24,
    },
    statusIcon: {
        height: 56,
        width: 56,
    },
    statusPgImgBlockCls: {
        marginBottom: 25,
        marginTop: (screenHeight * 5) / 100,
        width: "100%",
    },

    subTitle: {
        marginBottom: 40,
        width: "100%",
    },
    title: {
        marginBottom: 30,
    },
});

ReceivedDocumentScreen.propTypes = {
    navigation: PropTypes.object,
};

export default React.memo(ReceivedDocumentScreen);
