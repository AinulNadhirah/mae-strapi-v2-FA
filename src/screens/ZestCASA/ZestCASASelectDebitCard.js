import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector, useDispatch } from "react-redux";

import { ZEST_CASA_DEBIT_CARD_RESIDENTIAL_DETAILS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import {
    SELECT_DEBIT_CARD_CONTINUE_BUTTON_DISABLED_ACTION,
    SELECT_DEBIT_CARD_ACTION,
} from "@redux/actions/ZestCASA/selectDebitCardAction";
import { PREPOSTQUAL_UPDATE_USER_STATUS } from "@redux/actions/services/prePostQualAction";
import { fetchAccountList } from "@redux/services/apiGetAccountList";
import { getDebitCards } from "@redux/services/apiGetDebitCards";

import { DISABLED, YELLOW } from "@constants/colors";
import {
    CONTINUE,
    DEBIT_CARD_APPLICATION,
    SELECT_DEBIT_CARD,
    DEBIT_CARD_PAYMENT_NOTE,
    FA_FORM_PROCEED,
    FA_SCREEN_NAME,
    FA_ACTION_NAME,
} from "@constants/strings";
import {
    ZEST_CASA_CLEAR_ALL,
    ZEST_DEBIT_CARD_NTB_USER,
    ZEST_DEBIT_CARD_USER,
    ZEST_FULL_ETB_USER,
    ZEST_NTB_USER,
} from "@constants/zestCasaConfiguration";
import {
    PM1_DEBIT_CARD_NTB_USER,
    PM1_DEBIT_CARD_USER,
    PM1_NTB_USER,
    PM1_FULL_ETB_USER,
    PMA_DEBIT_CARD_NTB_USER,
    PMA_DEBIT_CARD_USER,
    PMA_NTB_USER,
    PMA_FULL_ETB_USER,
    KAWANKU_SAVINGS_DEBIT_CARD_NTB_USER,
    KAWANKU_SAVINGS_DEBIT_CARD_USER,
    KAWANKU_SAVINGS_NTB_USER,
    KAWANKU_SAVINGS_FULL_ETB_USER,
    KAWANKU_SAVINGSI_DEBIT_CARD_NTB_USER,
    KAWANKU_SAVINGSI_DEBIT_CARD_USER,
    KAWANKU_SAVINGSI_NTB_USER,
    KAWANKU_SAVINGSI_FULL_ETB_USER

} from "@constants/premierConfiguration";
import { DebitCardSelector } from "./components/DebitCardSelector";
import { CARD_REQUESTCARD_DEBITCARD } from "./helpers/AnalyticsEventConstants";
import { debitCardResidentailDetailsPrefiller } from "./helpers/CustomerDetailsPrefiller";
import { getCardsImage } from "./helpers/ZestHelpers";

const ZestCASASelectDebitCard = (props) => {
    const { navigation } = props;

    // Hooks for access reducer data
    const getDebitCardsReducer = useSelector((state) => state.getDebitCardsReducer);
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const draftUserAccountInquiryReducer = useSelector(
        (state) => state.draftUserAccountInquiryReducer
    );
    const masterDataReducer = useSelector((state) => state.masterDataReducer);

    const { userStatus } = prePostQualReducer;
    const { cardData } = getDebitCardsReducer;
    const reducer = isNTBOrETBUser() ? prePostQualReducer : draftUserAccountInquiryReducer;
    const selectDebitCardReducer = useSelector(
        (state) => state.zestCasaReducer.selectDebitCardReducer
    );

    // Hooks for dispatch reducer action
    const dispatch = useDispatch();

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        console.log("[ZestCASASelectDebitCard] >> [init]");
        dispatch(fetchAccountList());
        dispatch(getDebitCards({}));
    };

    useEffect(() => {
        dispatch({ type: SELECT_DEBIT_CARD_CONTINUE_BUTTON_DISABLED_ACTION });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectDebitCardReducer.debitCardIndex]);

    function onBackTap() {
        console.log("[ZestCASASelectDebitCard] >> [onBackTap]");
        navigation.goBack();
    }

    function onCloseTap() {
        console.log("[ZestCASAActivationPending] >> [onBackTap]");
        dispatch({ type: ZEST_CASA_CLEAR_ALL });
        navigation.navigate("Dashboard");
    }

    function isNTBOrETBUser () {
        if (entryReducer.isPM1 && (userStatus === PM1_NTB_USER || userStatus === PM1_FULL_ETB_USER)) {
            return true;
        } else if (entryReducer.isPMA && (userStatus === PMA_NTB_USER || userStatus === PMA_FULL_ETB_USER)) {
            return true;
        } else if (entryReducer.isKawanku && (userStatus === KAWANKU_SAVINGS_NTB_USER || userStatus === KAWANKU_SAVINGS_FULL_ETB_USER)) {
            return true;
        } else if (entryReducer.isKawankuSavingsI && (userStatus === KAWANKU_SAVINGSI_NTB_USER || userStatus === KAWANKU_SAVINGSI_FULL_ETB_USER)) {
            return true;
        } else if (userStatus === ZEST_NTB_USER || userStatus === ZEST_FULL_ETB_USER) {
            return true;
        }
    }

    function isDebitCardUser () {
        if (entryReducer.isPM1) {
            if ( userStatus === PM1_DEBIT_CARD_NTB_USER ||
                userStatus === PM1_DEBIT_CARD_USER ) {
                return true;
            }
        }else if (entryReducer.isPMA){
            if ( userStatus === PMA_DEBIT_CARD_NTB_USER ||
                userStatus === PMA_DEBIT_CARD_USER ) {
                return true;
            }
        } else if (entryReducer.isKawanku) {
            if ( userStatus === KAWANKU_SAVINGS_DEBIT_CARD_NTB_USER ||
                userStatus === KAWANKU_SAVINGS_DEBIT_CARD_USER ) {
                return true;
            }
        } else if (entryReducer.isKawankuSavingsI) {
            if ( userStatus === KAWANKU_SAVINGSI_DEBIT_CARD_NTB_USER ||
                userStatus === KAWANKU_SAVINGSI_DEBIT_CARD_USER) {
                return true;
            }
        } else if (userStatus === ZEST_DEBIT_CARD_NTB_USER || userStatus === ZEST_DEBIT_CARD_USER) {
            return true;
        }
    }

    function onNextTap() {
        console.log("[ZestCASASelectDebitCard] >> [onNextTap]");

        if (selectDebitCardReducer.isSelectDebitCardContinueButtonEnabled) {
            if (isDebitCardUser()) {
                navigation.navigate(ZEST_CASA_DEBIT_CARD_RESIDENTIAL_DETAILS);
            } else {
                if (userStatus === PM1_NTB_USER) {
                    dispatch({
                        type: PREPOSTQUAL_UPDATE_USER_STATUS,
                        userStatus: PM1_DEBIT_CARD_NTB_USER,
                    });
                } else if (userStatus === PMA_NTB_USER) {
                    dispatch({
                        type: PREPOSTQUAL_UPDATE_USER_STATUS,
                        userStatus: PMA_DEBIT_CARD_NTB_USER,
                    });
                } else if (userStatus === KAWANKU_SAVINGS_NTB_USER) {
                    dispatch({
                        type: PREPOSTQUAL_UPDATE_USER_STATUS,
                        userStatus: KAWANKU_SAVINGS_DEBIT_CARD_NTB_USER,
                    });
                } else if (userStatus === KAWANKU_SAVINGSI_NTB_USER) {
                    dispatch({
                        type: PREPOSTQUAL_UPDATE_USER_STATUS,
                        userStatus: KAWANKU_SAVINGSI_DEBIT_CARD_NTB_USER,
                    });
                } else if (userStatus === ZEST_NTB_USER) {
                    dispatch({
                        type: PREPOSTQUAL_UPDATE_USER_STATUS,
                        userStatus: ZEST_DEBIT_CARD_NTB_USER,
                    });
                } else {
                    dispatch({
                        type: PREPOSTQUAL_UPDATE_USER_STATUS,
                        userStatus: ZEST_DEBIT_CARD_USER,
                    });
                }
                debitCardResidentailDetailsPrefiller(dispatch, masterDataReducer, reducer);
                navigation.navigate(ZEST_CASA_DEBIT_CARD_RESIDENTIAL_DETAILS);
            }
        }
    }

    function onCardViewDidTap(index, value, cardItem) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: CARD_REQUESTCARD_DEBITCARD,
            [FA_ACTION_NAME]: cardItem?.cardName,
        });
        dispatch({
            type: SELECT_DEBIT_CARD_ACTION,
            debitCardIndex: index,
            debitCardValue: cardItem,
        });
    }

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName={CARD_REQUESTCARD_DEBITCARD}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KeyboardAwareScrollView
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                            >
                                <View style={Style.formContainer}>
                                    <View style={Style.contentContainer}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="400"
                                            lineHeight={21}
                                            textAlign="left"
                                            text={DEBIT_CARD_APPLICATION}
                                        />
                                        <SpaceFiller height={4} />
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={22}
                                            textAlign="left"
                                            text={SELECT_DEBIT_CARD}
                                        />
                                        <SpaceFiller height={4} />
                                        <Typo
                                            fontSize={12}
                                            fontWeight="400"
                                            lineHeight={18}
                                            textAlign="left"
                                            text={DEBIT_CARD_PAYMENT_NOTE}
                                        />
                                        <SpaceFiller height={36} />
                                        {renderDebitCardSelectorCardViews()}
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={
                                        selectDebitCardReducer.isSelectDebitCardContinueButtonEnabled
                                            ? 1
                                            : 0.5
                                    }
                                    backgroundColor={
                                        selectDebitCardReducer.isSelectDebitCardContinueButtonEnabled
                                            ? YELLOW
                                            : DISABLED
                                    }
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={CONTINUE}
                                        />
                                    }
                                    onPress={onNextTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );

    function renderDebitCardSelectorCardViews() {
        return cardData.map((cardItem) => {
            const { cardName, cardIndex } = cardItem;

            return (
                <React.Fragment key={cardIndex}>
                    <DebitCardSelector
                        cardName={cardName}
                        cardImageSource={getCardsImage(cardName)}
                        cardIndex={cardIndex}
                        cardItem={cardItem}
                        onDebitCardSelected={onCardViewDidTap}
                        selectedCardIndex={selectDebitCardReducer.debitCardIndex}
                    />
                    <SpaceFiller height={16} />
                </React.Fragment>
            );
        });
    }
};

ZestCASASelectDebitCard.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    params: PropTypes.object,
};

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },

    formContainer: {
        marginBottom: 40,
    },
});

export default ZestCASASelectDebitCard;
