import AsyncStorage from "@react-native-community/async-storage";
import _ from "lodash";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { Modal, View, StyleSheet, Alert } from "react-native";
import Config from "react-native-config";

import navigationService from "@navigation/navigationService";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { MEDIUM_GREY } from "@constants/colors";
import {
    APP_SETTING,
    CLEAR_DATA_CACHE,
    CLEAR_DATA_CACHE_MSG,
    DEBUGGING,
    ENVIRONMENT,
    FEATURES,
    RESTART,
} from "@constants/strings";

import Footer from "@utils/components/Footer";
import Header from "@utils/components/Header";
import SectionItems from "@utils/components/SectionItems";

import { goToAppSetting, removeLocalStorage, saveAppEnv } from "./dataModel/utilityPartial.4";

export function simpleId() {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return "_" + Math.random().toString(36).substr(2, 9);
}

export const ErrorLogger = () =>
    // errorObject,
    // user = { id: "", name: "", email: "" },
    // diagnostic = {}
    {
        // const beforeSendCallback = (report) => {
        //     report.metadata = { diagnostic: { ...diagnostic } };
        // };
        /**
         * Need to revisit this as it is throwing an error on Android
         * related to conversion of double to string value
         */
        //     const isErrorInstance = errorObject instanceof Error;
        //     if (!isErrorInstance) {
        //         const { error, message, status } = errorObject;
        //         const errorMessage = `${error} :: ${message} :: ${status}`;
        //         const newErrorInstance = new Error(errorMessage);
        //         if (__DEV__)
        //             console.tron.display({
        //                 name: "ErrorLogger",
        //                 value: newErrorInstance,
        //                 preview: "Error Instance",
        //                 important: true,
        //             });
        //         else Bugsnag.notify(newErrorInstance, beforeSendCallback, false);
        //     } else {
        //         if (__DEV__)
        //             console.tron.display({
        //                 name: "ErrorLogger",
        //                 value: errorObject,
        //                 preview: "errorObject",
        //                 important: true,
        //             });
        //         else Bugsnag.notify(errorObject, beforeSendCallback, false);
        //     }
        // } catch (e) {
        //     Bugsnag.notify(e);
        // }
    };

export const UserLogger = (mobileNo, mayaUsername, mayaEmail) => {
    // Bugsnag.setUser(mobileNo, mayaUsername, mayaEmail);
    if (__DEV__) console.table({ mobileNo, mayaUsername });
};

const EventLogStateContext = React.createContext();
const EventLogUpdaterContext = React.createContext();

/**
 * Cleared event logs locally
 * And global error logs
 */
async function clearEventLogStored() {
    await AsyncStorage.removeItem("eventLogs");

    global.errorLogs = [];
}

function eventLogReducer(state, action) {
    switch (action.type) {
        case "add": {
            if (!action.payload) throw new Error("Payload is missing");
            if (!action.payload?.name) throw new Error("Event name is missing");

            const timestamp = Date.now();

            return {
                events: [{ ...action.payload, id: simpleId(), timestamp }, ...state.events],
            };
        }

        case "pop": {
            const withPop = state.events.pop();

            return { events: [...withPop] };
        }

        case "mergedPersist": {
            return {
                events: [...state.events, ...action.payload],
            };
        }

        case "clean": {
            // clear AS too
            clearEventLogStored();

            return {
                events: [],
            };
        }

        default: {
            throw new Error(`Unhandled action type: ${action.type}`);
        }
    }
}

function EventLogProviderInner({ children }) {
    const [state, dispatch] = React.useReducer(eventLogReducer, { events: [] });
    const globalError = global.errorLogs;

    useEffect(() => {
        async function syncEvents() {
            // get the stored event from AS into states
            const persistEvent = await AsyncStorage.getItem("eventLogs");
            const parseEvent = persistEvent ? JSON.parse(persistEvent) : [];
            const eventTransform = parseEvent.map((event) => ({
                ...event,
                isFromPersist: true,
            }));

            dispatch({
                type: "mergedPersist",
                payload: eventTransform,
            });
        }

        syncEvents();
    }, []);

    useEffect(() => {
        async function mapToStore() {
            const mergedEvents = [...state.events, ...globalError];
            const sortedEvents = _.orderBy(mergedEvents, ["timestamp"], ["desc"]);

            // we do not want to store large number of events, so limit to 200
            const sliceEvents = sortedEvents.slice(0, 200);

            await AsyncStorage.setItem("eventLogs", JSON.stringify(sliceEvents));
        }

        if (state.events.length) {
            mapToStore();
        }
    }, [globalError, state.events]);

    return (
        <EventLogStateContext.Provider value={state}>
            <EventLogUpdaterContext.Provider value={dispatch}>
                {children}
            </EventLogUpdaterContext.Provider>
        </EventLogStateContext.Provider>
    );
}

EventLogProviderInner.propTypes = {
    children: PropTypes.node,
};

function EventLogProvider({ children }) {
    if (Config?.DEV_ENABLE !== "true" || Config?.LOG_RESPONSE_REQUEST !== "true") {
        return <>{children}</>;
    }

    return <EventLogProviderInner>{children}</EventLogProviderInner>;
}

EventLogProvider.propTypes = {
    children: PropTypes.node,
};

function useEventStateLog() {
    const eventState = React.useContext(EventLogStateContext);

    if (Config?.DEV_ENABLE !== "true" || Config?.LOG_RESPONSE_REQUEST !== "true") {
        return [];
    }
    if (eventState === undefined) {
        throw new Error("useEventStateLog must be used within EventLogStateContext");
    }

    return eventState;
}

function useEventUpdaterLog() {
    const updater = React.useContext(EventLogUpdaterContext);

    if (Config?.DEV_ENABLE !== "true" || Config?.LOG_RESPONSE_REQUEST !== "true") {
        return () => {};
    }
    if (updater === undefined) {
        throw new Error("useEventUpdaterLog must be used within EventLogUpdaterContext");
    }

    return updater;
}

export type ErrorLoggerFn = {
    errorLogger(errorObject: Object, user: Object, diagnostic: Object): () => void,
};

function useErrorLog() {
    const dispatch = useEventUpdaterLog();

    function errorLogger(
        errorObject: Object,
        // eslint-disable-next-line no-unused-vars
        user: Object = { id: "", name: "", email: "" },
        diagnostic: Object = {}
    ): void {
        // const beforeSendCallback = (report) => {
        //     report.metadata = { diagnostic: { ...diagnostic } };
        // };

        try {
            // if (user.id) Bugsnag.setUser(`${user.id}`, "placeholder", "placeholder@mail.com");

            const isErrorInstance = errorObject instanceof Error;

            if (!isErrorInstance) {
                const errorMessage = `${errorObject?.error} :: ${errorObject?.message} :: ${errorObject?.status}`;
                const newErrorInstance = new Error(errorMessage);

                if (Config?.DEV_ENABLE === "true" || Config?.LOG_RESPONSE_REQUEST === "true") {
                    dispatch({
                        type: "add",
                        payload: {
                            name: "error_logger",
                            value: {
                                error: {
                                    error: errorObject?.error,
                                    status: errorObject?.status,
                                    message: errorMessage,
                                },
                                diagnostic,
                            },
                        },
                    });

                    // Remove sentry for Prod Env, Only available for DEV
                    // Sentry.captureException(newErrorInstance);
                }

                if (__DEV__)
                    console.tron.display({
                        name: "ErrorLogger",
                        value: {
                            message: newErrorInstance?.message,
                        },
                        preview: "Error Instance",
                        important: true,
                    });
                /*else {
                    // Bugsnag.notify(newErrorInstance, beforeSendCallback, false);
                    Sentry.captureException(newErrorInstance);
                }*/
            } else {
                if (Config?.DEV_ENABLE === "true" || Config?.LOG_RESPONSE_REQUEST === "true") {
                    dispatch({
                        type: "add",
                        payload: {
                            name: "error_logger",
                            value: {
                                error: {
                                    status: errorObject?.status,
                                    message: errorObject?.message,
                                    code: errorObject?.code,
                                    error: errorObject?.error,
                                },
                                diagnostic,
                            },
                        },
                    });

                    // Remove sentry for Prod Env, Only available for DEV
                    //Sentry.captureException(errorObject);
                }

                if (__DEV__)
                    console.tron.display({
                        name: "ErrorLogger",
                        value: {
                            status: errorObject?.status,
                            message: errorObject?.message,
                            code: errorObject?.code,
                        },
                        preview: "errorObject",
                        important: true,
                    });
                /*else {
                    // Bugsnag.notify(errorObject, beforeSendCallback, false);
                    Sentry.captureException(errorObject);
                }*/
            }
        } catch (e) {
            if (Config?.DEV_ENABLE === "true" || Config?.LOG_RESPONSE_REQUEST === "true") {
                dispatch({
                    type: "add",
                    payload: {
                        name: "error_logger",
                        value: {
                            error: {
                                message: e?.message,
                                error: e?.error,
                            },
                        },
                    },
                });

                // Remove sentry for Prod Env, Only available for DEV
                //Sentry.captureException(e);
            }
            if (__DEV__)
                console.tron.display({
                    name: "ErrorLogger",
                    value: {
                        message: e?.message,
                        error: e?.error,
                    },
                    preview: "Error Logger Catch",
                    important: true,
                });
            /*else {
                // Bugsnag.notify(e);
                Sentry.captureException(e);
            }*/
        }
    }

    return {
        errorLogger,
    };
}

const getJSExceptionHandler = () => global.ErrorUtils.getGlobalHandler();

function interceptJSException(handler, preserveOriginal = false) {
    const orginalHandler = getJSExceptionHandler();

    function customHandler(error, isFatal) {
        if (preserveOriginal) {
            handler(error, isFatal, orginalHandler);
        } else {
            handler(error, isFatal);
        }
    }

    global.ErrorUtils.setGlobalHandler(customHandler);
}

const festiveTypeList = [
    { name: "Default", value: "default" },
    { name: "Year End", value: "yearend" },
    { name: "Chinese New Year", value: "cny" },
    { name: "Raya Aidilfitri", value: "raya" },
];

function LogStart() {
    const [visible, setVisible] = useState("");
    const controller = useModelController();
    const { supsonic, isTapTasticReady, tapTasticType } = controller.getModel("misc");
    const [showFestivePicker, setShowFestivePicker] = useState(false);
    // only require this when the debug mode enabled
    const EventLog = require("../components/EventLog").default;
    const NetworkLog = require("../components/NetworkLog").default;
    const ContextViewer = require("../components/ContextViewer").default;
    const isS2App = Config.APP_ENV === "S2";
    const isTestingEnv = Config.ENV_FLAG === "UAT" || Config.ENV_FLAG === "SIT";
    const envName = isS2App ? "U1" : "S2";
    const defaultFestiveIndex = festiveTypeList.map((e) => e.value).indexOf(tapTasticType);
    const [selectedFestiveIndex, setSelectedFestiveIndex] = useState(defaultFestiveIndex);

    function onClose() {
        controller.updateModel({
            ui: {
                showNetLog: false,
            },
        });
    }

    const onBack = useCallback(() => {
        setVisible("");
    }, []);

    const onPressEvent = useCallback(() => {
        setVisible("events");
    }, []);

    const onPressNetwork = useCallback(() => {
        setVisible("network");
    }, []);

    const onPressContext = useCallback(() => {
        setVisible("context");
    }, []);

    const restart = useCallback(
        ({ isClearCache = false, appEnv = Config.APP_ENV }) => {
            saveAppEnv(appEnv);

            navigationService.resetAndNavigateToModule("Splashscreen", "", {
                emptyState: isClearCache,
                appEnv,
            });

            controller.updateModel({
                ui: {
                    showNetLog: false,
                },
            });
        },
        [controller]
    );

    const handleClear = async (appEnv = "") => {
        controller.updateModel({
            ui: {
                touchId: false,
                m2uLogin: false,
            },
        });

        // clear AS
        await removeLocalStorage();

        restart({ isClearCache: true, appEnv });
    };

    if (!supsonic) {
        if (Config?.DEV_ENABLE !== "true" || Config?.LOG_RESPONSE_REQUEST !== "true") return null;
    }

    const showPopupConfirmation = async (message, onPress) => {
        Alert.alert("Confirmation", message, [
            {
                text: "No",
                style: "cancel",
            },
            {
                text: "Yes",
                onPress,
            },
        ]);
    };

    const changeAppEnv = async (isS2App) => {
        const appEnv = !isS2App ? "S2" : "";
        await handleClear(appEnv);
    };

    function onFestivePickerDone(item, index) {
        if (item) {
            setSelectedFestiveIndex(index);
            controller.updateModel({
                misc: {
                    isTapTasticReady: item.value !== "default",
                    tapTasticType: item.value,
                },
            });
        }
        onCancelFestivePicker();
        restart({ isClearCache: false });
    }

    const festiveToggleItem = __DEV__
        ? [
              {
                  title: `Festive (${tapTasticType})`,
                  onPress: onCancelFestivePicker,
                  selectedValue: isTapTasticReady,
              },
          ]
        : [];

    function onCancelFestivePicker() {
        setShowFestivePicker(!showFestivePicker);
    }

    const listFeatures = [
        ...festiveToggleItem,
        { title: RESTART, onPress: restart },
        { title: APP_SETTING, onPress: goToAppSetting },
        {
            title: CLEAR_DATA_CACHE,
            onPress: () => showPopupConfirmation(CLEAR_DATA_CACHE_MSG, handleClear),
        },
    ];

    const listDebugging = [
        {
            title: "Event Logs",
            onPress: onPressEvent,
        },
        {
            title: "Network Logs",
            onPress: onPressNetwork,
        },
        {
            title: "Context Viewer",
            onPress: onPressContext,
        },
    ];

    const listTestings = [
        {
            title: `${envName} Testing`,
            onPress: () =>
                showPopupConfirmation(`Change to ${envName} environment?`, () =>
                    changeAppEnv(isS2App)
                ),
        },
    ];

    return (
        <Modal visible hardwareAccelerated animationType="slide">
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                {!visible && <Header isTestingEnv={isTestingEnv && isTapTasticReady} />}
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={
                                !visible ? <View /> : <HeaderBackButton onPress={onBack} />
                            }
                            headerCenterElement={
                                <Typo
                                    text={
                                        visible === "network"
                                            ? "Network Logs"
                                            : visible === "events"
                                            ? "Event Logs"
                                            : visible === "context"
                                            ? "Context Viewer"
                                            : ""
                                    }
                                    fontWeight="600"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                            headerRightElement={<HeaderCloseButton onPress={onClose} />}
                        />
                    }
                    paddingTop={16}
                    paddingRight={0}
                    paddingLeft={0}
                    paddingBottom={0}
                >
                    {!visible && (
                        <>
                            <View style={styles.contentContainer}>
                                {isTestingEnv && (
                                    <>
                                        <SectionItems title={ENVIRONMENT} list={listTestings} />
                                        <SpaceFiller height={32} />
                                    </>
                                )}
                                <SectionItems title={DEBUGGING} list={listDebugging} />
                                <SpaceFiller height={32} />
                                <SectionItems title={FEATURES} list={listFeatures} />
                            </View>
                            <Footer />
                        </>
                    )}
                    {visible === "network" && <NetworkLog supsonic={supsonic} />}
                    {visible === "events" && <EventLog supsonic={supsonic} />}
                    {visible === "context" && <ContextViewer supsonic={supsonic} />}
                </ScreenLayout>
            </ScreenContainer>
            <ScrollPickerView
                showMenu={showFestivePicker}
                list={festiveTypeList}
                rightButtonText="Done"
                leftButtonText="Cancel"
                onLeftButtonPress={onCancelFestivePicker}
                onRightButtonPress={onFestivePickerDone}
                selectedIndex={selectedFestiveIndex}
            />
        </Modal>
    );
}

export {
    EventLogProvider,
    useEventStateLog,
    useEventUpdaterLog,
    useErrorLog,
    LogStart,
    getJSExceptionHandler,
    interceptJSException,
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
});
