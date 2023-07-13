import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Image, StyleSheet, TouchableOpacity, FlatList, ScrollView } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext, INITIAL_MODEL } from "@context";

import { logEvent } from "@services/analytics";
import { getGoalsList, invokeL2 } from "@services/index";

import { MEDIUM_GREY } from "@constants/colors";
import { GOAL_DATA } from "@constants/data";
import {
    FA_CREATE_TABUNG_CATEGORY,
    FA_FORM_PROCEED,
    FA_FIELD_INFORMATION,
    FA_SCREEN_NAME,
} from "@constants/strings";

import { ErrorLogger } from "@utils/logs";

class SelectGoalType extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        resetModel: PropTypes.func,
    };

    componentDidMount() {
        // this.focusSubscription = this.props.navigation.addListener("focus", async () => {
        //     // Reset goal data context before proceeding
        //     this._resetGoalDataContext();
        // });
        this.checkAuth();
    }

    checkAuth = async () => {
        const { getModel } = this.props;
        const { isPostLogin } = getModel("auth");
        if (!isPostLogin) {
            try {
                const stepUp = await invokeL2();
            } catch (error) {
                this.props.navigation.goBack();
            }
        }
    };

    // componentWillUnmount() {
    // this.focusSubscription();
    // }

    onBackPress = () => {
        // this.props.navigation.navigate(navigationConstant.TABUNG_STACK, {
        //     screen: navigationConstant.TABUNG_TAB_SCREEN,
        // });

        this.props.navigation.goBack();
    };

    // _resetGoalDataContext = () => {
    //     console.log("[SelectGoalType][_resetGoalDataContext] resetting goals model...");

    //     const { resetModel } = this.props;
    //     resetModel(["goals"]);
    // };

    _getExistingGoalCount = async () => {
        try {
            const response = await getGoalsList("/goal/exists");
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    onCategoryPress = async (item) => {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_CREATE_TABUNG_CATEGORY,
            [FA_FIELD_INFORMATION]: item.title,
        });
        console.log("[SelectGoalType][onCategoryPress] Item: ", item);

        const request = await this._getExistingGoalCount();
        if (request) {
            const {
                data: {
                    result: { count, canCreateGoals, errorMessage },
                },
            } = request;

            if (!canCreateGoals) showErrorToast({ message: errorMessage });
            else if (count > 10)
                showErrorToast({
                    message:
                        "You may only have a maximum of 10 goals at a given time. Please delete a goal before adding another.",
                });
            else {
                const { updateModel } = this.props;
                const { goals } = INITIAL_MODEL;
                const { goalData } = goals;

                console.log("[SelectGoalType][onCategoryPress] goal data is..", goalData);

                updateModel({
                    goals: {
                        goalData: {
                            ...goalData,
                            type: item.title,
                            typeCode: item.id,
                            typeValue: item.type,
                            goalAmount: 0.0,
                            goalName: "",
                            goalEnd: "",
                            goalStart: "",
                            esiEnabled: false,
                            esiActivation: false,
                            esiDiactivation: false,
                            noChange: false,
                            joinGoal: false,
                        },
                    },
                });

                this.props.navigation.navigate(navigationConstant.CREATE_GOALS_ENTER_GOAL_NAME);
            }
        }
    };

    renderListItem(item) {
        return (
            <TouchableOpacity onPress={() => this.onCategoryPress(item)}>
                <View style={styles.listItemContainer}>
                    <View style={styles.listItemImageContainer}>
                        <Image
                            source={item.path}
                            style={{ width: 64, height: 64, margin: 6 }}
                            resizeMode="contain"
                        />
                    </View>
                    <View style={styles.listItemTextContainer}>
                        <View style={styles.subText1}>
                            <Typo
                                lineHeight={18}
                                fontSize={16}
                                fontWeight="600"
                                text={item.title}
                                textAlign="left"
                            />
                        </View>
                        <View style={styles.subText2}>
                            <Typo lineHeight={20} fontSize={14} text={item.des} textAlign="left" />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    render() {
        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    analyticScreenName={FA_CREATE_TABUNG_CATEGORY}
                >
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this.onBackPress} />}
                            />
                        }
                        useSafeArea
                    >
                        <ScrollView style={styles.scrollView}>
                            <View style={styles.titleContainer}>
                                <Typo
                                    lineHeight={18}
                                    fontSize={14}
                                    fontWeight="600"
                                    text="Tabung"
                                    textAlign="left"
                                />
                            </View>
                            <View style={styles.descriptionContainer}>
                                <Typo
                                    lineHeight={28}
                                    fontSize={20}
                                    fontWeight="300"
                                    text="Pick a category to start saving."
                                    textAlign="left"
                                />
                            </View>
                            <FlatList
                                data={GOAL_DATA}
                                horizontal={false}
                                showsHorizontalScrollIndicator={false}
                                showIndicator={false}
                                keyExtractor={(item, index) => `${item.id}`}
                                renderItem={({ item }) => this.renderListItem(item)}
                                ListFooterComponent={<View style={styles.listFooterSpacer} />}
                            />
                        </ScrollView>
                    </ScreenLayout>
                </ScreenContainer>
            </React.Fragment>
        );
    }
}
const styles = StyleSheet.create({
    titleText: {
        fontFamily: "Montserrat",
        fontSize: 14,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 18,
        letterSpacing: 0,
        color: "#000000",
    },
    titleContainer: {
        marginTop: 16,
    },
    descriptionContainer: {
        marginTop: 5,
        marginBottom: 20,
    },
    scrollView: { paddingHorizontal: 24 },
    subText1: {
        fontFamily: "Montserrat",
        fontSize: 16,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 18,
        letterSpacing: 0,
        color: "#000000",
    },
    subText2: {
        marginTop: 5,
        fontFamily: "Montserrat",
        fontSize: 14,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 20,
        letterSpacing: 0,
        color: "#000000",
    },
    listItemContainer: {
        height: 96,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 8,
        backgroundColor: "#ffffff",
    },
    listItemImageContainer: {
        flex: 0.8,
        alignSelf: "center",
        alignItems: "center",
    },
    listItemTextContainer: {
        flex: 2.2,
        flexDirection: "column",
        width: "100%",
    },
    listFooterSpacer: { height: 24 },
});

export default withModelContext(SelectGoalType);
