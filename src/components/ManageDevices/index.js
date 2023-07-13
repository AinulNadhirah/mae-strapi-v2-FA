import PropTypes from "prop-types";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Modal, Image, ScrollView } from "react-native";
import FlashMessage from "react-native-flash-message";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

// import { clearAll } from "@services/localStorage";
// import NavigationService from "@navigation/navigationService";
import { handleRequestClose } from "@components/BackHandlerInterceptor";
import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";
// import Popup from "@components/Popup";
import Toast from "@components/Toast";

// import { TAB_NAVIGATOR } from "@navigation/navigationConstant";
// import { errorToastProp, successToastProp } from "@components/Toast";
import { withModelContext } from "@context";

import { withApi } from "@services/api";
import { getDevices } from "@services/api/methods";

import {
    MEDIUM_GREY,
    WHITE,
    SHADOW_LIGHT, // LIGHT_GREY,
    STATUS_GREEN,
} from "@constants/colors";
import { YELLOW } from "@constants/colors";

import { getDeviceRSAInformation } from "@utils/dataModel/utility";

import Images from "@assets";

// import { removeCustomerKey } from "@utils/dataModel/utility";

const CloseButton = ({ onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.closeButton}>
        <Image source={Images.icCloseBlack} style={styles.closeButtonIcon} />
    </TouchableOpacity>
);

CloseButton.propTypes = {
    onPress: PropTypes.func,
};

function DeviceCard({ device, currentDevice, currentDeviceName }) {
    return (
        <View style={styles.deviceCard}>
            <View style={styles.deviceCardInner}>
                <View style={styles.deviceMeta}>
                    <View>
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                            text={
                                currentDevice === device.deviceId
                                    ? currentDeviceName
                                    : device.deviceName
                            }
                            textAlign="left"
                        />
                        <Typo
                            fontSize={14}
                            fontWeight="normal"
                            lineHeight={18}
                            text={`Registered on ${device.formattedRegiterDate}`}
                            textAlign="left"
                        />
                        {currentDevice === device.deviceId && (
                            <View style={styles.currentDeviceTag}>
                                <View style={styles.currentDeviceTagInner}>
                                    <Typo
                                        fontSize={9}
                                        fontWeight="normal"
                                        lineHeight={12}
                                        text="Current"
                                        color={WHITE}
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}

DeviceCard.propTypes = {
    device: PropTypes.object,
    onRemove: PropTypes.func,
    currentDevice: PropTypes.string,
    currentDeviceName: PropTypes.string,
};

function ManageDevices({
    isLoading,
    // isManage,
    onBoardUsername,
    onClose,
    onProceed,
    getModel,
    updateModel,
    api,
    // resetModel,
}) {
    const [loading, setLoading] = useState(false);
    // const [deviceToRemove, setDeviceToRemove] = useState(null);
    const [devices, setDevices] = useState([]);
    const refForToast = useRef();
    // const { username } = getModel("user");
    const { deviceId, deviceInformation } = getModel("device");

    function handleClose() {
        onClose();
    }

    function handleProceed() {
        onProceed();
    }

    // function handleClosePopup() {
    //     setDeviceToRemove(null);
    // }

    // function handleUnlink() {
    //     resetModel(null, ["device"]);

    //     clearAll();
    //     removeCustomerKey();

    //     setDeviceToRemove(null);

    //     refForToast.current.showMessage(
    //         successToastProp({
    //             message: "Maybank2u account successfully unlinked.",
    //         })
    //     );

    //     // navigate back to dashboard
    //     NavigationService.resetAndNavigateToModule(TAB_NAVIGATOR, "Dashboard");
    // }

    // async function proceedRemoveDevice() {
    //     const params = {
    //         deviceId: deviceToRemove.deviceId,
    //         m2uUsername: onBoardUsername ?? username,
    //     };

    //     try {
    //         const response = await deactivateDevice(
    //             `m2uUsername=${onBoardUsername ?? username}&deviceId=${deviceToRemove.deviceId}`,
    //             params
    //         );

    //         if (response && response.data) {
    //             if (deviceToRemove.deviceId === deviceId) {
    //                 // unlink from app
    //                 handleUnlink();
    //             } else {
    //                 setDeviceToRemove(null);

    //                 getDeviceList();

    //                 refForToast.current.showMessage(
    //                     successToastProp({
    //                         message: "Device successfully removed.",
    //                         onToastPress: handleCloseToast,
    //                     })
    //                 );
    //             }
    //         }
    //     } catch (error) {
    //         refForToast.current.showMessage(
    //             errorToastProp({
    //                 message: "Unable to remove the device. Try again.",
    //                 onToastPress: handleCloseToast,
    //             })
    //         );
    //     }
    // }

    // function handleRemoveDevice(device) {
    //     setDeviceToRemove(device);
    // }

    function handleCloseToast() {
        refForToast.current.hideMessage();
    }

    function renderToastComponent(props) {
        return <Toast onClose={handleCloseToast} {...props} />;
    }

    function handleAndroidBack() {
        handleRequestClose(updateModel);
        handleClose();
    }

    const getDeviceList = useCallback(async () => {
        const mobileSDKData = getDeviceRSAInformation(deviceInformation, null, deviceId);
        const params = {
            username: onBoardUsername,
            mobileSDKData,
        };

        setLoading(true);

        try {
            const response = await getDevices(api, params);

            if (response && response.data) {
                const { resultList } = response.data;

                setDevices(resultList);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [deviceInformation, deviceId, onBoardUsername, api]);

    useEffect(() => {
        getDeviceList();
    }, [getDeviceList]);

    console.tron.log("devices", devices);

    return (
        <Modal
            visible
            animated
            animationType="slide"
            presentationStyle="fullScreen"
            // presentationStyle="pageSheet"
            hardwareAccelerated
            onRequestClose={handleAndroidBack}
        >
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
            >
                <>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typo
                                        text="Manage Devices"
                                        fontWeight="600"
                                        fontSize={16}
                                        lineHeight={19}
                                    />
                                }
                                headerRightElement={<CloseButton onPress={handleClose} />}
                            />
                        }
                        useSafeArea
                    >
                        <>
                            <ScrollView contentContainerStyle={styles.scrollerContainer}>
                                <View style={styles.topIcon}>
                                    <Image
                                        source={Images.manageDevice}
                                        style={styles.topIconImage}
                                    />
                                </View>
                                <View style={styles.container}>
                                    <Typo
                                        fontSize={20}
                                        fontWeight="300"
                                        lineHeight={28}
                                        text="Your Maybank2u ID is already linked to the following device."
                                    />
                                </View>
                                <View style={styles.deviceListContainer}>
                                    {devices.map((device, index) => (
                                        <DeviceCard
                                            key={`${device.deviceId}-${index}`}
                                            device={device}
                                            currentDevice={deviceId}
                                            currentDeviceName={deviceInformation.DeviceName}
                                            // onRemove={handleRemoveDevice}
                                        />
                                    ))}
                                </View>
                                <View style={styles.copyContainer}>
                                    <View style={styles.copyLine}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            lineHeight={18}
                                            text="You may only link your Maybank2u ID
                                        to one device at any given time."
                                        />
                                    </View>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        text="Would you like to link it to this device instead?"
                                    />
                                </View>
                            </ScrollView>

                            <FixedActionContainer>
                                <ActionButton
                                    loading={isLoading}
                                    fullWidth
                                    borderRadius={25}
                                    onPress={handleProceed}
                                    backgroundColor={YELLOW}
                                    componentCenter={
                                        <Typo
                                            text="Proceed"
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                    }
                                />
                            </FixedActionContainer>
                        </>
                    </ScreenLayout>
                    {/* {!!deviceToRemove && (
                        <Popup
                            visible
                            title="Remove Device"
                            description={`Are you sure want to remove ${deviceToRemove.deviceName}?`}
                            onClose={handleClosePopup}
                            primaryAction={{
                                text: "Proceed",
                                onPress: proceedRemoveDevice,
                            }}
                            secondaryAction={{
                                text: "Cancel",
                                onPress: handleClosePopup,
                            }}
                        />
                    )} */}
                    <FlashMessage MessageComponent={renderToastComponent} ref={refForToast} />
                </>
            </ScreenContainer>
        </Modal>
    );
}

ManageDevices.propTypes = {
    isManage: PropTypes.bool,
    onProceed: PropTypes.func,
    onClose: PropTypes.func,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
    onBoardUsername: PropTypes.string,
    isLoading: PropTypes.bool,
    resetModel: PropTypes.func,
    api: PropTypes.object,
};

const styles = StyleSheet.create({
    closeButton: {
        alignItems: "center",
        height: 44,
        justifyContent: "center",
        width: 44,
    },
    closeButtonIcon: {
        height: 17,
        width: 17, // match the size of the actual image
    },
    container: {
        padding: 24,
    },
    copyContainer: {
        alignItems: "center",
        paddingHorizontal: 24,
    },
    copyLine: {
        marginBottom: 18,
        paddingHorizontal: 24,
    },
    currentDeviceTag: {
        flexDirection: "row",
        marginTop: 12,
    },
    currentDeviceTagInner: {
        backgroundColor: STATUS_GREEN,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    deviceCard: {
        paddingHorizontal: 24,
        paddingVertical: 8,
    },
    deviceCardInner: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        padding: 20,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
    },
    deviceListContainer: {
        marginBottom: 24,
        // paddingVertical: 24,
    },
    deviceMeta: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    // removeCurrentDeviceButton: {
    //     alignItems: "center",
    //     backgroundColor: LIGHT_GREY,
    //     borderRadius: 12,
    //     height: 24,
    //     justifyContent: "center",
    //     width: 24,
    // },
    // removeCurrentDeviceIcon: { height: 24, width: 24 },
    scrollerContainer: {
        paddingVertical: 34,
    },
    topIcon: {
        alignItems: "center",
        justifyContent: "center",
    },
    topIconImage: {
        height: 64,
        width: 64,
    },
});

export default withApi(withModelContext(ManageDevices));
