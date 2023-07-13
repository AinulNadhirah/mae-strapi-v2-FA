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

import { withModelContext } from "@context";

import { invokeL2 } from "@services";

import { BLACK, DARK_GREY, DISABLED, DISABLED_TEXT, YELLOW } from "@constants/colors";

export const defaultWidgets = [
    {
        id: "samaSamaLokalWidget",
        title: "Order Food & More",
    },
    {
        id: "WALLET_DUITNOWREQUEST",
        title: "DuitNow Request",
    },
    {
        id: "spending",
        title: "Spending Summary",
    },
    {
        id: "tabung",
        title: "Tabung",
    },
    {
        id: "promotions",
        title: "Deals For You",
    },
    {
        id: "articles",
        title: "Top Reads",
    },
];

const styles = StyleSheet.create({
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

function WidgetRow({ id, index, title, onMoveUp, onMoveDown }) {
    function handleMoveUp() {
        onMoveUp(id, index);
    }

    function handleMoveDown() {
        onMoveDown(id, index);
    }
    return (
        <ManageListItem
            title={title}
            fixed
            onMoveDown={handleMoveDown}
            onMoveUp={handleMoveUp}
            onRemove={null}
        />
    );
}

WidgetRow.propTypes = {
    id: PropTypes.string,
    index: PropTypes.number,
    title: PropTypes.string,
    onMoveUp: PropTypes.func,
    onMoveDown: PropTypes.func,
};

function ManageDashboard({ navigation, getModel, updateModel }) {
    const [widgets, setWidgets] = useState([]);
    const [haveChanges, setChange] = useState(false);
    const { isPostLogin } = getModel("auth");
    const { widgets: dashboardWidgets } = getModel("dashboard");

    const handleOnBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    async function syncWithAsync(updatedWidgets) {
        await AsyncStorage.setItem("dashboardWidgetsList", JSON.stringify(updatedWidgets));
    }

    function updateContext(updatedWidgets) {
        updateModel({
            dashboard: {
                widgets: updatedWidgets,
            },
        });
    }

    function handleMoveUp(id, index) {
        // if the first one, do nothing
        // minus the current index and put it in the stack
        if (index > 0) {
            const copyOfWidgets = [...widgets];
            const currentWidget = copyOfWidgets.find((widget) => widget.id === id);
            let updatedWidgets = copyOfWidgets.filter((widget) => widget.id !== id);

            // splice it into the index
            updatedWidgets.splice(index - 1, 0, currentWidget);

            setWidgets([...updatedWidgets]);

            setChange(true);
        }
    }

    function handleMoveDown(id, index) {
        // if the last one, do nothing
        // add the current index and put it in the stack
        if (index < widgets.length - 1) {
            const copyOfWidgets = [...widgets];
            const currentWidget = copyOfWidgets.find((widget) => widget.id === id);
            let updatedWidgets = copyOfWidgets.filter((widget) => widget.id !== id);

            // splice it into the index
            updatedWidgets.splice(index + 1, 0, currentWidget);

            setWidgets([...updatedWidgets]);

            setChange(true);
        }
    }

    function handleSave() {
        updateContext(widgets);
        syncWithAsync(widgets);

        navigation.goBack();
    }

    const checkForLocalWidgetsData = useCallback(() => {
        // use value from model context, since we already assign this when dashboard loaded
        if (dashboardWidgets) setWidgets(dashboardWidgets);
    }, [dashboardWidgets]);

    const init = useCallback(async () => {
        try {
            const response = await invokeL2(false);

            if (!response) {
                throw new Error();
            }
        } catch (error) {
            handleOnBack();
        }
    }, [handleOnBack]);

    useEffect(() => {
        if (!isPostLogin) {
            init();
        } else {
            // check for existing widget config in AS, else use the default
            checkForLocalWidgetsData();
        }
    }, [checkForLocalWidgetsData, isPostLogin, init]);

    return (
        <ScreenContainer backgroundType="color" analyticScreenName="Manage_Widgets">
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
                <>
                    <ScrollView style={styles.scroll}>
                        {isPostLogin && (
                            <>
                                <View>
                                    <Typo
                                        textAlign="left"
                                        text="Customise Widgets"
                                        fontWeight="300"
                                        fontSize={20}
                                        lineHeight={28}
                                        style={styles.title}
                                    />
                                    <Typo
                                        textAlign="left"
                                        text="Rearrange your dashboard’s widgets in order of preference."
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
                                            {...widget}
                                        />
                                    ))}
                                </View>
                            </>
                        )}
                    </ScrollView>

                    <FixedActionContainer>
                        <ActionButton
                            disabled={!haveChanges}
                            backgroundColor={!haveChanges ? DISABLED : YELLOW}
                            fullWidth
                            componentCenter={
                                <Typo
                                    color={!haveChanges ? DISABLED_TEXT : BLACK}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text="Continue"
                                />
                            }
                            onPress={handleSave}
                        />
                    </FixedActionContainer>
                </>
            </ScreenLayout>
        </ScreenContainer>
    );
}

ManageDashboard.propTypes = {
    navigation: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
};

export default withModelContext(ManageDashboard);
