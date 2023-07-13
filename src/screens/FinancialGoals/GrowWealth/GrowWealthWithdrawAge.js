/* eslint-disable radix */
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View } from "react-native";

import { BANKINGV2_MODULE, GROWTH_WEALTH_UPFRONT_AMOUNT } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { useModelController, withModelContext } from "@context";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, GREY, BLACK } from "@constants/colors";
import {
    AGE,
    GOAL_BASED_INVESTMENT,
    GROWTH_WEATH_GOAL,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FIN_GOAL_WEALTH_AGE,
} from "@constants/strings";

import { getAgeByDob } from "@utils/dataModel/utilityFinancialGoals";

const GrowWealthWithdrawAge = ({ navigation, route }) => {
    const [error, setError] = useState("");
    const { getModel } = useModelController();
    const { birthDate } = getModel("user");
    const userAge = getAgeByDob(birthDate);

    const [age, setAge] = useState(
        route?.params?.fundsByAge
            ? route?.params?.fundsByAge.toString()
            : String(userAge + 10 >= 99 ? 99 : userAge + 10) // default age is current user age + 10, but not more than 99
    );
    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_GOAL_WEALTH_AGE,
        });
    }, []);

    function onDoneButtonPress() {
        if (age < userAge + 1 || age > 99) {
            setError("Please enter age between your current age and 99");
        } else {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: GROWTH_WEALTH_UPFRONT_AMOUNT,
                params: {
                    ...route?.params,
                    fundsByAge: parseInt(age),
                },
            });
        }
    }

    function onBackButtonPress() {
        navigation.goBack();
    }

    function changeText(val) {
        setAge(val);
        setError("");
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackButtonPress} />}
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text={GOAL_BASED_INVESTMENT}
                            />
                        }
                    />
                }
                useSafeArea
                paddingHorizontal={0}
                paddingBottom={0}
                neverForceInset={["bottom"]}
            >
                <React.Fragment>
                    <View style={styles.container}>
                        <View style={styles.blockNew}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={GROWTH_WEATH_GOAL}
                                textAlign="left"
                            />

                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.sublabel}
                                text="At what age would you like to withdraw this sum?"
                                textAlign="left"
                            />
                            <View style={styles.amountViewTransfer}>
                                <TextInput
                                    placeholder="0"
                                    accessibilityLabel="Text"
                                    prefixStyle={[{ color: GREY }]}
                                    style={{ color: age === "" ? GREY : BLACK }}
                                    isValid={!error}
                                    isValidate
                                    errorMessage={error}
                                    value={age}
                                    suffix={AGE}
                                    clearButtonMode="while-editing"
                                    returnKeyType="done"
                                    editable={false}
                                />
                            </View>
                        </View>
                    </View>
                    <NumericalKeyboard
                        value={`${age}`}
                        onChangeText={changeText}
                        maxLength={2}
                        onDone={onDoneButtonPress}
                    />
                </React.Fragment>
            </ScreenLayout>
        </ScreenContainer>
    );
};

GrowWealthWithdrawAge.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

export default withModelContext(GrowWealthWithdrawAge);

const styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
    },
    sublabel: {
        marginTop: 24,
        fontSize: 14,
        fontWeight: "400",
        lineHeight: 18,
        color: "#000000",
    },
    blockNew: {
        flexDirection: "column",
        flex: 1,
        paddingHorizontal: 24,
    },
    amountViewTransfer: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 4,
        width: "100%",
    },
};
