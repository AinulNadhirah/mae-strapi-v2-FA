import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Animated, Image } from "react-native";
import * as Animatable from "react-native-animatable";
import LinearGradient from "react-native-linear-gradient";
import { useSelector, useDispatch, connect } from "react-redux";

import {
    ARTICLE,
    ASB_CONSENT,
    DASHBOARD,
    ON_BOARDING_M2U_USERNAME,
    ON_BOARDING_MODULE,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import Spring from "@components/Animations/Spring";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import Typography from "@components/Text";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController, withModelContext } from "@context";

import { applicationDetailsGetApi, checkDownTime, invokeL3 } from "@services";
import { logEvent } from "@services/analytics";

import { GUARANTOR_IDENTITY_DETAILS_CLEAR } from "@redux/actions/ASBFinance/guarantorIdentityDetailsAction";
import { RESUME_CLEAR } from "@redux/actions/ASBFinance/resumeAction";
import { ASB_PREPOSTQUAL_CLEAR } from "@redux/actions/ASBServices/prePostQualAction";
import { getMasterData } from "@redux/services/ASBServices/apiMasterData";
import { prePostQual } from "@redux/services/ASBServices/apiPrePostQual";

import { YELLOW, BLACK, MEDIUM_GREY, WHITE, GREY_100, GHOST_WHITE } from "@constants/colors";
import {
    APPLY_NOW,
    ASB_FINANCE,
    APPLY_ASB_FINANCE,
    COMPARE_EARNINGS,
    APPLY_ASB_FINANCE_DEC,
    APPLICATION_PENDING,
    APPLICATION_PENDING_DESC,
    FA_SCREEN_NAME,
    FA_SELECT_ARTICLE,
    FA_FIELD_INFORMATION,
    OKAY,
    CANCEL,
    FA_ACTION_NAME,
} from "@constants/strings";

import Assets from "@assets";

import { FA_SELECT_ACTION, FA_VIEW_SCREEN } from "../../constants/strings";
import { onClickOkay } from "../ASB/Financing/helpers/ASBHelpers";
import {
    PersonalDetailsPrefiller,
    EmployeeDetailsPrefiller,
    OccupationDetailsPrefiller,
} from "../ASB/Financing/helpers/CustomerDetailsPrefiller";

function ApplyLoansScreen(props) {
    const navigation = props.navigation;
    const dispatch = useDispatch();
    const { getModel } = useModelController();
    this.bannerAnimate = new Animated.Value(0);

    const [showPopupResume, setShowPopupResume] = useState(false);

    const masterDataReducer = useSelector((state) => state.asbServicesReducer.masterDataReducer);
    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        dispatch(getMasterData());
        const response = await checkDownTime(true);
        if (
            response &&
            response.data &&
            response.data.result &&
            response.data.result.statusCode !== "0000"
        ) {
            showErrorToast({
                message: response.data.result.statusDesc,
            });
            navigation.navigate(DASHBOARD);
        }
    };

    function onBackTap() {
        navigation.goBack();
    }

    function onCloseTap() {
        navigation.navigate(DASHBOARD);
    }

    function handleResume() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Apply_ASBFinancing_ApplicationPending",
        });
        setShowPopupResume(true);
    }
    function handleResumeClose() {
        setShowPopupResume(false);
    }

    const animateBanner = () => {
        return {
            opacity: this.bannerAnimate.interpolate({
                inputRange: [0, 120, 240],
                outputRange: [1, 0.8, 0],
            }),
            transform: [
                {
                    scale: this.bannerAnimate.interpolate({
                        inputRange: [-200, 0, 1],
                        outputRange: [1.4, 1, 1],
                    }),
                },
                {
                    translateY: this.bannerAnimate.interpolate({
                        inputRange: [-200, 0, 240],
                        outputRange: [0, 0, -100],
                    }),
                },
            ],
        };
    };

    async function onApplyNow() {
        dispatch({ type: GUARANTOR_IDENTITY_DETAILS_CLEAR });
        dispatch({
            type: ASB_PREPOSTQUAL_CLEAR,
        });
        dispatch({
            type: RESUME_CLEAR,
        });
        dispatch(RESUME_CLEAR);
        const userDetails = getModel("user");
        const { isOnboard } = userDetails;
        if (isOnboard) {
            const httpResp = await invokeL3(true);
            const result = httpResp.data;
            const { code } = result;
            const body = {
                msgBody: {
                    logonInfo: "Y",
                },
            };
            if (code !== 0) return;
            const responseResume = await applicationDetailsGetApi(body, false);

            if (responseResume?.data?.message === "Success") {
                handleResume();
            } else {
                dispatch(
                    prePostQual("asb/v1/asb/prequal", body, (data, mdmData) => {
                        if (data) {
                            prefillDetailsForExistingUser(mdmData);
                            navigation.navigate(ASB_CONSENT);
                        }
                    })
                );
            }
        } else {
            navigation.navigate(ON_BOARDING_MODULE, {
                screen: ON_BOARDING_M2U_USERNAME,
                params: {
                    screenName: "ApplyLoans",
                },
            });
        }
    }

    const handleResumeNavigation = async () => {
        //resume*
        setShowPopupResume(false);
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Apply_ASBFinancing_ApplicationPending",
            [FA_ACTION_NAME]: "Resume",
        });
        onClickOkay(props, false, dispatch);
    };

    function prefillDetailsForExistingUser(data) {
        PersonalDetailsPrefiller(dispatch, masterDataReducer, data);
        EmployeeDetailsPrefiller(dispatch, masterDataReducer, data);
        OccupationDetailsPrefiller(dispatch, masterDataReducer, data);
    }

    function goToFinancing() {
        logEvent(FA_SELECT_ARTICLE, {
            [FA_SCREEN_NAME]: "Apply_ASBFinancing",
            [FA_FIELD_INFORMATION]: `Articles: ${COMPARE_EARNINGS}`,
        });
        navigation.navigate(ARTICLE);
    }

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName="Apply_ASBFinancing"
        >
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                useSafeArea
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                    />
                }
                neverForceInset={["bottom"]}
                paddingLeft={0}
                paddingRight={0}
            >
                <View style={styles.container}>
                    <Animated.View style={[styles.promotionImage, animateBanner()]}>
                        <Animatable.Image
                            animation="fadeInUp"
                            duration={300}
                            source={Assets.tabungImage}
                            style={styles.merchantBanner}
                            resizeMode="cover"
                        />
                    </Animated.View>
                    <Animated.ScrollView
                        scrollEventThrottle={16}
                        onScroll={Animated.event(
                            [
                                {
                                    nativeEvent: {
                                        contentOffset: { y: this.bannerAnimate },
                                    },
                                },
                            ],
                            { useNativeDriver: true }
                        )}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.mainContent}>
                            <View style={styles.contentArea}>
                                <View style={styles.alignLR}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        fontStyle="normal"
                                        lineHeight={21}
                                        textAlign="left"
                                        text={ASB_FINANCE}
                                    />
                                    <Typo
                                        fontSize={16}
                                        lineHeight={24}
                                        fontWeight="600"
                                        letterSpacing={0}
                                        textAlign="left"
                                        text={APPLY_ASB_FINANCE}
                                        style={styles.titleText}
                                    />
                                    <Typo
                                        fontSize={16}
                                        lineHeight={24}
                                        fontWeight="600"
                                        letterSpacing={0}
                                        textAlign="left"
                                        text={APPLY_ASB_FINANCE_DEC}
                                        style={styles.titleText}
                                    />
                                </View>
                                <View style={styles.articleTitle}>
                                    <View style={styles.br} />
                                </View>

                                <View style={styles.alignLR}>
                                    <Spring
                                        style={styles.cardRow}
                                        onPress={goToFinancing}
                                        activeOpacity={0.9}
                                    >
                                        <View style={styles.imageView}>
                                            <Image
                                                source={Assets.articleLoan}
                                                style={styles.image}
                                                resizeMethod="scale"
                                            />
                                        </View>
                                        <Typography
                                            fontWeight="600"
                                            fontSize={13}
                                            lineHeight={15}
                                            style={styles.textHeader}
                                            text={COMPARE_EARNINGS}
                                            textAlign="left"
                                            numberOfLines={3}
                                        />
                                    </Spring>

                                    {masterDataReducer.status === "success" && (
                                        <View style={styles.bottomBtnContCls}>
                                            <LinearGradient
                                                colors={[GHOST_WHITE, MEDIUM_GREY]}
                                                style={styles.linearGradient}
                                            />
                                            <ActionButton
                                                fullWidth
                                                onPress={onApplyNow}
                                                backgroundColor={YELLOW}
                                                componentCenter={
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        color={BLACK}
                                                        text={APPLY_NOW}
                                                    />
                                                }
                                            />
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    </Animated.ScrollView>
                </View>
            </ScreenLayout>
            <Popup
                visible={showPopupResume}
                onClose={handleResumeClose}
                title={APPLICATION_PENDING}
                description={APPLICATION_PENDING_DESC}
                primaryAction={{
                    text: OKAY,
                    onPress: handleResumeNavigation,
                }}
                secondaryAction={{
                    text: CANCEL,
                    onPress: handleResumeClose,
                }}
            />
        </ScreenContainer>
    );
}

ApplyLoansScreen.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    alignLR: {
        marginHorizontal: 36,
    },
    articleTitle: {
        paddingVertical: 30,
    },
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 25,
    },
    br: {
        borderColor: GREY_100,
        borderWidth: 0.5,
    },
    cardRow: {
        backgroundColor: WHITE,
        borderRadius: 10,
        flexDirection: "row",
        height: 80,
        justifyContent: "center",
        marginBottom: 16,
        overflow: "hidden",
        width: "100%",
    },
    confirmButton: {
        marginTop: 40,
    },
    container: {
        flex: 1,
    },
    containerTitle: {
        marginBottom: 8,
        marginTop: 24,
    },
    contentArea: {
        paddingTop: 25,
    },
    image: {
        height: 80,
        width: 98,
    },
    imageView: {
        borderBottomLeftRadius: 10,
        borderTopLeftRadius: 10,
        height: 80,
        overflow: "hidden",
        width: 98,
    },
    linearGradient: {
        height: 30,
        left: 0,
        position: "absolute",
        right: 0,
        top: -30,
    },
    mainContent: {
        backgroundColor: MEDIUM_GREY,
        marginTop: 240,
    },
    merchantBanner: { flex: 1, height: "100%", width: "100%" },
    promotionImage: {
        height: 240,
        position: "absolute",
        width: "100%",
    },
    textHeader: {
        alignSelf: "center",
        flex: 1,
        paddingHorizontal: 15,
    },
    titleText: { paddingTop: 10 },
    viewContainer: {
        flex: 1,
    },
});

const mapDispatchToProps = (dispatch) => {
    return {
        resumeAction: (stpData, loanInformation) =>
            dispatch({
                type: "RESUME_SUCCESS",
                data: stpData,
                loanInformation,
            }),
    };
};

export default withModelContext(connect(mapDispatchToProps)(ApplyLoansScreen));
