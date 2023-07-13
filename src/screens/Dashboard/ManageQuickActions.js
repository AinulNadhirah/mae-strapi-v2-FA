import AsyncStorage from "@react-native-community/async-storage";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { ScrollView, View, StyleSheet } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import ManageListItem from "@components/ListItems/ManageListItem";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { invokeL2 } from "@services";

import { DARK_GREY, YELLOW, MEDIUM_GREY, DISABLED, BLACK } from "@constants/colors";
import { EZYQ, GROCERY } from "@constants/strings";

import { generateHaptic } from "@utils";

const DISABLED_TEXT = "rgba(0,0,0, .3)";

export const defaultActions = [
    {
        id: "payBill",
        title: "Pay Bills",
    },
    {
        id: "transfer",
        title: "Transfer",
    },
    {
        id: "atm",
        title: "ATM Cash-out",
    },
    {
        id: "reload",
        title: "Reload",
    },
];

export const defaultActionsSSL = [
    {
        id: "payBill",
        title: "Pay Bills",
    },
    {
        id: "transfer",
        title: "Transfer",
    },
    {
        id: "atm",
        title: "ATM Cash-out",
    },
    {
        id: "samaSamaLokal",
        title: "Sama2 Lokal",
    },
];

export const defaultAllActions = [
    {
        id: "payBill",
        title: "Pay Bills",
    },
    {
        id: "transfer",
        title: "Transfer",
    },
    {
        id: "samaSamaLokal",
        title: "Sama2 Lokal",
    },
    {
        id: "splitBills",
        title: "Split Bill",
    },
    {
        id: "reload",
        title: "Reload",
    },
    {
        id: "sendRequest",
        title: "Send & Request",
    },
    {
        id: "payCard",
        title: "Pay Card",
    },
    {
        id: "food",
        title: "Food",
    },
    {
        id: "ezyq",
        title: EZYQ,
    },
    {
        id: "groceries",
        title: GROCERY,
    },
    {
        id: "movie",
        title: "Movie Tickets",
    },
    {
        id: "flight",
        title: "Flight Tickets",
    },
    {
        id: "bus",
        title: "Bus Tickets",
    },
    {
        id: "erl",
        title: "ERL Tickets",
    },
    {
        id: "atm",
        title: "ATM Cash-out",
    },
    {
        id: "autoBilling",
        title: "Auto Billing",
    },
];

const styles = StyleSheet.create({
    availableService: {
        marginTop: 40,
    },
    container: {
        paddingVertical: 20,
    },
    scroll: {
        flex: 1,
        paddingHorizontal: 24,
    },
    title: {
        marginBottom: 6,
    },
});

function WidgetRow({
    id,
    index,
    title,
    onMoveUp,
    onMoveDown,
    disabledAdding,
    availableType,
    onRemove,
    onAdd,
    ...props
}) {
    function handleMoveUp() {
        onMoveUp(id, index);
    }

    function handleMoveDown() {
        onMoveDown(id, index);
    }

    function handleAdd() {
        onAdd(id);
    }

    function handleRemove() {
        onRemove(id);
    }
    return (
        <ManageListItem
            title={title}
            availableType={availableType}
            disabledAdding={disabledAdding}
            onMoveDown={handleMoveDown}
            onMoveUp={handleMoveUp}
            onAdd={handleAdd}
            onRemove={handleRemove}
            compact
            {...props}
        />
    );
}

WidgetRow.propTypes = {
    id: PropTypes.string,
    index: PropTypes.number,
    title: PropTypes.string,
    onMoveUp: PropTypes.func,
    onMoveDown: PropTypes.func,
    disabledAdding: PropTypes.bool,
    availableType: PropTypes.bool,
    onRemove: PropTypes.func,
    onAdd: PropTypes.func,
};

function ManageQuickActions({ navigation }) {
    const [widgets, setWidgets] = useState([]);
    const [availableWidgets, setAvailableWidgets] = useState([]);
    const [haveChanges, setHaveChanges] = useState(false);

    const { getModel, updateModel } = useModelController();
    const { quickActions: contextActions } = getModel("dashboard");
    const { isPostLogin } = getModel("auth");
    const { sslReady } = getModel("ssl");
    const { atmCashOutReady } = getModel("misc");
    const isMyGroserAvailable = getModel("myGroserReady")?.code ? true : false;
    function handleOnBack() {
        navigation.goBack();
    }

    function handleMoveUp(id, index) {
        // if the first one, do nothing
        // minus the current index and put it in the stack
        if (index > 0) {
            const copyOfWidgets = [...widgets];
            const currentWidget = copyOfWidgets.find((widget) => widget.id === id);
            const updatedWidgets = copyOfWidgets.filter((widget) => widget.id !== id);

            // splice it into the index
            updatedWidgets.splice(index - 1, 0, currentWidget);

            setWidgets([...updatedWidgets]);
            !haveChanges && setHaveChanges(true);

            generateHaptic("selection", true);
        }
    }

    function handleMoveDown(id, index) {
        // if the last one, do nothing
        // add the current index and put it in the stack
        if (index < widgets.length - 1) {
            const copyOfWidgets = [...widgets];
            const currentWidget = copyOfWidgets.find((widget) => widget.id === id);
            const updatedWidgets = copyOfWidgets.filter((widget) => widget.id !== id);

            // splice it into the index
            updatedWidgets.splice(index + 1, 0, currentWidget);

            setWidgets([...updatedWidgets]);
            !haveChanges && setHaveChanges(true);

            generateHaptic("selection", true);
        }
    }

    function handleOnRemove(id) {
        // remove from main actions and put into the available widget
        const toRemove = widgets.find((action) => action.id === id);
        const removedWidget = widgets.filter((action) => action.id !== id);

        setWidgets(removedWidget);

        // put it on top of available action
        setAvailableWidgets([toRemove, ...availableWidgets]);

        !haveChanges && setHaveChanges(true);

        generateHaptic("impactLight", true);
    }

    function handleOnAdd(id) {
        // shove it into active actions and removed from available list
        const toAdd = availableWidgets.find((action) => action.id === id);
        const removeFromAvailable = availableWidgets.filter((action) => action.id !== id);

        setWidgets([...widgets, toAdd]);
        setAvailableWidgets(removeFromAvailable);

        !haveChanges && setHaveChanges(true);

        generateHaptic("impactLight", true);
    }

    const checkForLocalWidgetsData = useCallback(() => {
        if (contextActions) {
            // If in main, throw it out
            let availableActions = defaultAllActions.filter((action) => {
                return !contextActions.find((main) => main.id === action.id);
            });

            // Throw out ssl if not ready. Nothing can be done if user added ssl tile to main
            if (!sslReady) {
                availableActions = availableActions.filter((action) => {
                    return !(action.id === "samaSamaLokal");
                });
            }
            if (!isMyGroserAvailable) {
                availableActions = availableActions.filter((action) => {
                    return !(action.id === "groceries");
                });
            }
            if (!atmCashOutReady) {
                availableActions = availableActions.filter((action) => {
                    return !(action.id === "atm");
                });
            }

            setWidgets(contextActions);
            setAvailableWidgets(availableActions);
        }
    }, [contextActions, sslReady, isMyGroserAvailable]);

    async function handleSave() {
        updateModel({
            dashboard: {
                quickActions: widgets,
            },
        });

        await AsyncStorage.setItem("dashboardQuickActions", JSON.stringify(widgets));

        handleOnBack();
    }

    const init = useCallback(async () => {
        try {
            const response = await invokeL2(false);

            if (!response) {
                throw new Error();
            }
        } catch (error) {
            navigation.goBack();
        }
    }, [navigation]);

    useEffect(() => {
        if (!isPostLogin) {
            init();
        } else {
            // check for existing widget config in AS, else use the default
            checkForLocalWidgetsData();
        }
    }, [checkForLocalWidgetsData, init, isPostLogin]);

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName="Manage_QckAct"
        >
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={24}
                    paddingHorizontal={0}
                    useSafeArea
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={handleOnBack} />}
                            headerCenterElement={
                                <Typo
                                    text="Manage Widgets"
                                    fontWeight="600"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                        />
                    }
                >
                    {/* just because screen layout make a fuss having a boolean as children */}
                    <>
                        {isPostLogin && (
                            <>
                                <ScrollView
                                    style={styles.scroll}
                                    showsVerticalScrollIndicator={false}
                                >
                                    <View>
                                        <Typo
                                            textAlign="left"
                                            text="Customise Top Actions"
                                            fontWeight="300"
                                            fontSize={20}
                                            lineHeight={28}
                                            style={styles.title}
                                        />
                                        <Typo
                                            textAlign="left"
                                            text="Rearrange your frequently used actions in order of preference."
                                            fontWeight="normal"
                                            fontSize={12}
                                            lineHeight={18}
                                            color={DARK_GREY}
                                        />
                                    </View>
                                    <View style={styles.container}>
                                        {widgets.map((widget, index) => (
                                            <WidgetRow
                                                key={widget.id}
                                                index={index}
                                                onMoveUp={handleMoveUp}
                                                onMoveDown={handleMoveDown}
                                                onRemove={handleOnRemove}
                                                {...widget}
                                            />
                                        ))}
                                    </View>
                                    <View style={styles.availableService}>
                                        <Typo
                                            textAlign="left"
                                            text="Available Services"
                                            fontWeight="300"
                                            fontSize={20}
                                            lineHeight={28}
                                        />
                                    </View>
                                    <View style={styles.container}>
                                        {availableWidgets.map((widget, index) => (
                                            <WidgetRow
                                                key={widget.id}
                                                index={index}
                                                availableType
                                                showDown={false}
                                                showUp={false}
                                                disabledAdding={widgets.length === 4}
                                                onAdd={handleOnAdd}
                                                onMoveUp={handleMoveUp}
                                                onMoveDown={handleMoveDown}
                                                {...widget}
                                            />
                                        ))}
                                    </View>
                                </ScrollView>
                                <FixedActionContainer backgroundColor={MEDIUM_GREY}>
                                    <ActionButton
                                        disabled={!haveChanges || widgets.length < 4}
                                        backgroundColor={
                                            !haveChanges || widgets.length < 4 ? DISABLED : YELLOW
                                        }
                                        fullWidth
                                        componentCenter={
                                            <Typo
                                                color={
                                                    !haveChanges || widgets.length < 4
                                                        ? DISABLED_TEXT
                                                        : BLACK
                                                }
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text="Save Changes"
                                            />
                                        }
                                        onPress={handleSave}
                                    />
                                </FixedActionContainer>
                            </>
                        )}
                    </>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

ManageQuickActions.propTypes = {
    navigation: PropTypes.object,
};

export default ManageQuickActions;
