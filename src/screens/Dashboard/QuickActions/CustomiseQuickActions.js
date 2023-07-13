import AsyncStorage from "@react-native-community/async-storage";
import _ from "lodash";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";

import Footer from "@screens/Dashboard/QuickActions/Footer";
import Header from "@screens/Dashboard/QuickActions/Header";
import WidgetRow from "@screens/Dashboard/QuickActions/WidgetRow";
import { defaultAllActions } from "@screens/Dashboard/QuickActions/data";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { invokeL2 } from "@services";

import {
    BLACK,
    CSS_GRAY,
    DISABLED,
    MEDIUM_GREY,
    PLATINUM,
    SILVER,
    YELLOW,
} from "@constants/colors";

import { generateHaptic } from "@utils";

const DISABLED_TEXT = "rgba(0,0,0, .3)";

const MAX_ITEMS = 15;

const MAX_ITEMS_PER_PAGE = 8;

function CustomiseQuickAction({ navigation, route }) {
    const [availableWidgets, setAvailableWidgets] = useState([]);
    const [haveChanges, setHaveChanges] = useState(false);
    const draggableFlatListRef = useRef();
    const footerRef = useRef();
    // const [footerPosition, setFooterPosition] = useState(null);
    const [selectedEmptyIndex, setSelectedEmptyIndex] = useState(null);

    const { getModel, updateModel } = useModelController();

    const {
        dashboard: { quickActions },
        auth: { isPostLogin },
        ssl: { sslReady },
        misc: { propertyMetadata, tapTasticType },
        myGroserReady,
    } = getModel(["dashboard", "auth", "ssl", "myGroserReady", "misc"]);

    const contextActions = quickActions?.data;

    //Change home2u label to Property (Backend meta data)
    const home2uIndex = contextActions.findIndex((item) => item.id === "home2u");
    if (contextActions[home2uIndex]) {
        contextActions[home2uIndex].title = propertyMetadata?.menuTitle;
    }

    const isMyGroserAvailable = myGroserReady?.code;

    //First Page Quick Actions
    const [allowedFirstPageItems, setAllowedFirstPageItems] = useState([]);
    const [disabledFirstPageItems, setDisabledFirstPageItems] = useState([]);
    const [firstPageWidgets, setFirstPageWidgets] = useState([]);

    //Second Page Quick Actions
    const [allowedSecondPageWidgets, setAllowedSecondPageWidgets] = useState([]);
    const [disabledSecondPageWidgets, setDisabledSecondPageWidgets] = useState([]);
    const [secondPageWidgets, setSecondPageWidgets] = useState([]);

    const currentWidgetsLength = firstPageWidgets.filter((elements) => {
        return elements.title !== null;
    }).length;

    function handleOnBack() {
        navigation.goBack();
    }

    function addingDisabledItems(isFromFirstPage, array) {
        const list = [...array];
        const currentDisabledItems = isFromFirstPage
            ? disabledFirstPageItems
            : disabledSecondPageWidgets;
        const setCurrentAllowedItems = isFromFirstPage
            ? setAllowedFirstPageItems
            : setAllowedSecondPageWidgets;

        setCurrentAllowedItems(array);
        currentDisabledItems.map((item) => {
            list.splice(item.index, 0, item);
        });
        return list;
    }

    function setSelectedList(isFromFirstPage, array) {
        if (isFromFirstPage) {
            setFirstPageWidgets(array);
        } else {
            setSecondPageWidgets(array);
        }
    }

    // function addingItems(newItem) {
    //     let allowedItem;
    //     let isFromFirstPage;
    //     let setCurrentList;
    //     if (firstPageWidgets.length < MAX_ITEMS_PER_PAGE) {
    //         setCurrentList = setFirstPageWidgets;
    //         allowedItem = allowedFirstPageItems;
    //         isFromFirstPage = true;
    //     } else if (secondPageWidgets.length < MAX_ITEMS - MAX_ITEMS_PER_PAGE) {
    //         setCurrentList = setSecondPageWidgets;
    //         allowedItem = allowedSecondPageWidgets;
    //         isFromFirstPage = false;
    //     }
    //
    //     const currentAllowedItem = [...allowedItem, newItem];
    //     const mergedArray = addingDisabledItems(isFromFirstPage, currentAllowedItem);
    //     setCurrentList(mergedArray);
    // }

    function addingItemToList(newItem, index) {
        let allowedItem = allowedFirstPageItems;
        let isFromFirstPage = true;
        let setCurrentList = setFirstPageWidgets;

        allowedItem[index] = newItem;

        // const currentAllowedItem = [...allowedItem, newItem];
        const mergedArray = addingDisabledItems(isFromFirstPage, allowedItem);

        setCurrentList(mergedArray);
    }

    // function handleMoveUp(id) {
    //     const isFromFirstPage = firstPageWidgets.some((action) => action.id === id);
    //     const currentAllowedItems = isFromFirstPage
    //         ? allowedFirstPageItems
    //         : allowedSecondPageWidgets;
    //     const copyOfWidgets = [...currentAllowedItems];
    //     const currentWidget = copyOfWidgets.find((widget) => widget.id === id);
    //     const currentIndex = copyOfWidgets.indexOf(currentWidget);
    //
    //     if (currentIndex > 0) {
    //         const updatedWidgets = copyOfWidgets.filter((widget) => widget.id !== id);
    //
    //         // splice it into the index
    //         updatedWidgets.splice(currentIndex - 1, 0, currentWidget);
    //
    //         const mergedArray = addingDisabledItems(isFromFirstPage, updatedWidgets);
    //
    //         setSelectedList(isFromFirstPage, mergedArray);
    //     } else if (currentIndex === 0 && !isFromFirstPage) {
    //         let copyFirstAllowedWidgets = [...allowedFirstPageItems];
    //         const copySecondAllowedWidgets = [...allowedSecondPageWidgets];
    //         if (firstPageWidgets.length === MAX_ITEMS_PER_PAGE) {
    //             const lastFirstPageWidget =
    //                 copyFirstAllowedWidgets[allowedFirstPageItems.length - 1];
    //
    //             copyFirstAllowedWidgets[allowedFirstPageItems.length - 1] = currentWidget;
    //             copySecondAllowedWidgets[0] = lastFirstPageWidget;
    //         } else {
    //             copyFirstAllowedWidgets = [...copyFirstAllowedWidgets, currentWidget];
    //             copySecondAllowedWidgets.splice(0, 1);
    //         }
    //
    //         const mergedArrayFirst = addingDisabledItems(true, copyFirstAllowedWidgets);
    //         const mergedArraySecond = addingDisabledItems(false, copySecondAllowedWidgets);
    //
    //         setFirstPageWidgets(mergedArrayFirst);
    //         setSecondPageWidgets(mergedArraySecond);
    //     }
    //
    //     !haveChanges && setHaveChanges(true);
    //
    //     generateHaptic("selection", true);
    // }
    //
    // function handleMoveDown(id) {
    //     const isFromFirstPage = firstPageWidgets.some((action) => action.id === id);
    //     const currentAllowedItems = isFromFirstPage
    //         ? allowedFirstPageItems
    //         : allowedSecondPageWidgets;
    //     const copyOfWidgets = [...currentAllowedItems];
    //     const currentWidget = copyOfWidgets.find((widget) => widget.id === id);
    //     const currentIndex = copyOfWidgets.indexOf(currentWidget);
    //
    //     if (currentIndex < currentAllowedItems.length - 1) {
    //         const updatedWidgets = copyOfWidgets.filter((widget) => widget.id !== id);
    //         updatedWidgets.splice(currentIndex + 1, 0, currentWidget);
    //         const mergedArray = addingDisabledItems(isFromFirstPage, updatedWidgets);
    //
    //         setSelectedList(isFromFirstPage, mergedArray);
    //     } else if (currentIndex === currentAllowedItems.length - 1 && isFromFirstPage) {
    //         let copyFirstAllowedWidgets = [...allowedFirstPageItems];
    //         let copySecondAllowedWidgets = [...allowedSecondPageWidgets];
    //         if (secondPageWidgets.length === MAX_ITEMS - MAX_ITEMS_PER_PAGE) {
    //             copyFirstAllowedWidgets[allowedFirstPageItems.length - 1] =
    //                 copySecondAllowedWidgets[0];
    //             copySecondAllowedWidgets[0] = currentWidget;
    //         } else {
    //             copyFirstAllowedWidgets.splice(allowedFirstPageItems.length - 1, 1);
    //             copySecondAllowedWidgets = [currentWidget, ...copySecondAllowedWidgets];
    //         }
    //
    //         const mergedArrayFirst = addingDisabledItems(true, copyFirstAllowedWidgets);
    //         const mergedArraySecond = addingDisabledItems(false, copySecondAllowedWidgets);
    //
    //         setFirstPageWidgets(mergedArrayFirst);
    //         setSecondPageWidgets(mergedArraySecond);
    //     }
    //
    //     !haveChanges && setHaveChanges(true);
    //
    //     generateHaptic("selection", true);
    // }

    function handleOnRemove(id, index) {
        // remove from main actions and put into the available widget
        const isFromFirstPage = firstPageWidgets.some((action) => action.id === id);
        let currentAllowedList = isFromFirstPage ? allowedFirstPageItems : allowedSecondPageWidgets;

        const currentWidget = currentAllowedList.find((action) => action.id === id);
        currentAllowedList[index] = { id: `empty-${index}`, title: null };

        // const removedWidget = currentAllowedList.filter((action) => action.id !== id);

        const mergedArray = addingDisabledItems(isFromFirstPage, currentAllowedList);

        setSelectedList(isFromFirstPage, mergedArray);

        const sortAvailableWidgets = sortAlphabeticalOrder([currentWidget, ...availableWidgets]);

        // put it on top of available action
        setAvailableWidgets(sortAvailableWidgets);

        !haveChanges && setHaveChanges(true);

        generateHaptic("impactLight", true);
    }

    function handleOnAdd(id) {
        // shove it into active actions and removed from available list
        const toAdd = availableWidgets.find((action) => action.id === id);
        const removeFromAvailable = availableWidgets.filter((action) => action.id !== id);

        let emptyIndex;
        if (selectedEmptyIndex) {
            emptyIndex = selectedEmptyIndex;
        } else {
            emptyIndex = allowedFirstPageItems.findIndex((item) => !item.title);
        }

        addingItemToList(toAdd, emptyIndex);

        setAvailableWidgets(removeFromAvailable);

        !haveChanges && setHaveChanges(true);

        setSelectedEmptyIndex(null);

        generateHaptic("impactLight", true);
    }

    const setAllowedDisabledItems = (
        start,
        end,
        setPageItems,
        setDisabledItems,
        setAllowedItems
    ) => {
        const pageItems = contextActions.slice(start, end);
        const allowedItems = pageItems.filter((item) => !item.disabled);
        const disabledItems = pageItems
            .map((item, index) => {
                const iconImage = getIconFromMassageData(item.id);
                if (item.disabled) {
                    return { ...item, index, iconImage };
                }
            })
            .filter(Boolean);

        setPageItems(pageItems);
        setDisabledItems(disabledItems);
        setAllowedItems(allowedItems);
    };

    const sortAlphabeticalOrder = (list) => {
        return list.sort((a, b) => a.title.localeCompare(b.title));
    };

    const getIconFromMassageData = (id) => {
        const massageData = route?.params?.data;
        return massageData.find((x) => x.id === id)?.iconImage;
    };

    const checkForLocalWidgetsData = useCallback(() => {
        if (contextActions) {
            // If in main, throw it out
            let availableActions = defaultAllActions.filter((action) => {
                return !contextActions.find((main) => main.id === action.id);
            });

            //Change home2u label to Property (Backend meta data)
            const home2uIndex = availableActions.findIndex((item) => item.id === "home2u");
            if (availableActions[home2uIndex]) {
                availableActions[home2uIndex].title = propertyMetadata?.menuTitle;
            }

            availableActions = sortAlphabeticalOrder(availableActions);

            //all available items must not disabled
            availableActions = availableActions.map((item) => ({
                ...item,
                disabled: false,
            }));

            // // Throw out ssl if not ready. Nothing can be done if user added ssl tile to main
            // if (!sslReady) {
            //     availableActions = availableActions.filter((action) => {
            //         return !(action.id === "samaSamaLokal");
            //     });
            // }
            // if (!isMyGroserAvailable) {
            //     availableActions = availableActions.filter((action) => {
            //         return !(action.id === "groceries");
            //     });
            // }
            // if (!atmCashOutReady) {
            //     availableActions = availableActions.filter((action) => {
            //         return !(action.id === "atm");
            //     });
            // }

            //First Page
            setAllowedDisabledItems(
                0,
                MAX_ITEMS,
                setFirstPageWidgets,
                setDisabledFirstPageItems,
                setAllowedFirstPageItems
            );

            //Second Page
            // setAllowedDisabledItems(
            //     MAX_ITEMS_PER_PAGE,
            //     MAX_ITEMS,
            //     setSecondPageWidgets,
            //     setDisabledSecondPageWidgets,
            //     setAllowedSecondPageWidgets
            // );

            setAvailableWidgets(availableActions);
        }
    }, [contextActions, sslReady, isMyGroserAvailable]);

    async function handleSave() {
        // console.log("firstPageWidgets = ",firstPageWidgets)
        const customiseQuickActions = {
            data: firstPageWidgets,
            selectedCampaign: tapTasticType,
        };

        AsyncStorage.setItem("dashboardQuickActions", JSON.stringify(customiseQuickActions)).then(
            () => {
                updateModel({
                    dashboard: {
                        quickActions: customiseQuickActions,
                    },
                });
                handleOnBack();
            }
        );
    }

    const scrollToMoreAction = (index) => {
        if (draggableFlatListRef.current && firstPageWidgets && firstPageWidgets.length > 0) {
            // draggableFlatListRef.current?.scrollTo({x: 0, y: footerPosition, animated: true});
            console.log("index = ", index);
            draggableFlatListRef.current?._component.scrollToEnd({ animated: true });
            setSelectedEmptyIndex(index);
        }
    };

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         footerRef.current.measure((fx, fy, width, height, px, py) => {
    //             console.log("tes = ", {fx, fy, width, height, px, py});
    //             setFooterPosition(py)
    //         });
    //     }, 1000);
    //     return () => {
    //         clearTimeout(timer);
    //     }
    // }, []);

    const renderItem = ({ item, drag, isActive, index }) => {
        if (item.title) {
            let iconImage;
            if (!item.iconImage) {
                iconImage = getIconFromMassageData(item.id);
            } else {
                iconImage = item.iconImage;
            }

            const widget = { ...item, iconImage };
            return (
                <WidgetRow
                    onLongPress={drag}
                    key={widget.id}
                    index={index}
                    onRemove={handleOnRemove}
                    isActive={isActive}
                    {...widget}
                />
            );
        } else {
            return (
                <TouchableOpacity
                    key={item.id}
                    style={styles.emptyContainer}
                    onLongPress={drag}
                    onPress={() => scrollToMoreAction(index)}
                >
                    <Typo
                        text="+"
                        color={CSS_GRAY}
                        fontSize={36}
                        lineHeight={42}
                        fontWeight="400"
                        textAlign="center"
                    />
                </TouchableOpacity>
            );
        }
    };

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
                                    text="Manage Quick Actions"
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
                                {/*<ScrollView*/}
                                {/*    style={styles.scroll}*/}
                                {/*    showsVerticalScrollIndicator={false}*/}
                                {/*>*/}
                                {/*    <View>*/}
                                {/*        <Typo*/}
                                {/*            textAlign="left"*/}
                                {/*            text="Customise Quick Actions"*/}
                                {/*            fontSize={20}*/}
                                {/*            lineHeight={28}*/}
                                {/*            style={styles.title}*/}
                                {/*        />*/}
                                {/*        <Typo*/}
                                {/*            textAlign="left"*/}
                                {/*            text="Select and rearrange your 11 frequently used actions in order of preference."*/}
                                {/*            fontSize={12}*/}
                                {/*            lineHeight={18}*/}
                                {/*        />*/}
                                {/*    </View>*/}
                                {/*    <QuickActionsPage*/}
                                {/*        list={firstPageWidgets}*/}
                                {/*        pageName="Page 1"*/}
                                {/*        maxItems={MAX_ITEMS_PER_PAGE}*/}
                                {/*        handleMoveUp={handleMoveUp}*/}
                                {/*        handleMoveDown={handleMoveDown}*/}
                                {/*        handleOnRemove={handleOnRemove}*/}
                                {/*        disabledUpActionId={allowedFirstPageItems[0]?.id}*/}
                                {/*    />*/}
                                {/*    <QuickActionsPage*/}
                                {/*        list={secondPageWidgets}*/}
                                {/*        pageName="Page 2"*/}
                                {/*        maxItems={MAX_ITEMS - MAX_ITEMS_PER_PAGE}*/}
                                {/*        handleMoveUp={handleMoveUp}*/}
                                {/*        handleMoveDown={handleMoveDown}*/}
                                {/*        handleOnRemove={handleOnRemove}*/}
                                {/*        disabledDownActionId={*/}
                                {/*            allowedSecondPageWidgets?.[*/}
                                {/*                allowedSecondPageWidgets?.length - 1*/}
                                {/*            ]?.id*/}
                                {/*        }*/}
                                {/*    />*/}
                                {/*    <SpaceFiller height={16} />*/}
                                {/*    <SpaceFiller*/}
                                {/*        width="100%"*/}
                                {/*        height={1}*/}
                                {/*        backgroundColor={SEPARATOR}*/}
                                {/*    />*/}
                                {/*    <SpaceFiller height={24} />*/}
                                {/*    <Typo*/}
                                {/*        textAlign="left"*/}
                                {/*        text="More Actions"*/}
                                {/*        fontWeight="300"*/}
                                {/*        fontSize={20}*/}
                                {/*        lineHeight={28}*/}
                                {/*    />*/}
                                {/*    <View style={styles.container}>*/}
                                {/*        {availableWidgets.map((widget, index) => (*/}
                                {/*            <WidgetRow*/}
                                {/*                key={widget.id}*/}
                                {/*                index={index}*/}
                                {/*                availableType*/}
                                {/*                showDown={false}*/}
                                {/*                showUp={false}*/}
                                {/*                disabledAdding={currentWidgetsLength === MAX_ITEMS}*/}
                                {/*                onAdd={handleOnAdd}*/}
                                {/*                onMoveUp={handleMoveUp}*/}
                                {/*                onMoveDown={handleMoveDown}*/}
                                {/*                {...widget}*/}
                                {/*            />*/}
                                {/*        ))}*/}
                                {/*    </View>*/}
                                {/*</ScrollView>*/}
                                <DraggableFlatList
                                    ref={draggableFlatListRef}
                                    keyExtractor={(item) => item.id}
                                    containerStyle={styles.scroll}
                                    showsVerticalScrollIndicator={false}
                                    data={allowedFirstPageItems}
                                    renderItem={renderItem}
                                    ListHeaderComponent={<Header list={disabledFirstPageItems} />}
                                    ListFooterComponent={
                                        <Footer
                                            footerRef={footerRef}
                                            list={availableWidgets}
                                            handleOnAdd={handleOnAdd}
                                            disabledAdding={currentWidgetsLength === MAX_ITEMS}
                                        />
                                    }
                                    onDragEnd={({ data }) => {
                                        if (!_.isEqual(data, allowedFirstPageItems)) {
                                            setAllowedFirstPageItems(data);
                                            const mergedArray = addingDisabledItems(true, data);
                                            setFirstPageWidgets(mergedArray);
                                            !haveChanges && setHaveChanges(true);
                                        }
                                    }}
                                />
                                <FixedActionContainer backgroundColor={MEDIUM_GREY}>
                                    <ActionButton
                                        disabled={!haveChanges || currentWidgetsLength < MAX_ITEMS}
                                        backgroundColor={
                                            !haveChanges || currentWidgetsLength < MAX_ITEMS
                                                ? DISABLED
                                                : YELLOW
                                        }
                                        fullWidth
                                        componentCenter={
                                            <Typo
                                                color={
                                                    !haveChanges || currentWidgetsLength < MAX_ITEMS
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

CustomiseQuickAction.propTypes = {
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 20,
    },
    scroll: {
        flex: 1,
        paddingHorizontal: 16,
    },
    title: {
        marginBottom: 6,
    },
    emptyContainer: {
        minHeight: 52,
        backgroundColor: PLATINUM,
        marginHorizontal: 8,
        borderWidth: 1.8,
        borderColor: SILVER,
        borderStyle: "dashed",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 8,
        marginVertical: 4,
        paddingHorizontal: 16,
    },
});

export default CustomiseQuickAction;
