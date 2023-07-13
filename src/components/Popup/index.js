import { BlurView } from "@react-native-community/blur";
import PropTypes from "prop-types";
import React from "react";
import { View, TouchableOpacity, Image, StyleSheet, Modal, ScrollView } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import { LogGesture } from "@components/NetworkLog";
import Typo from "@components/Text";

import { YELLOW, WHITE, ROYAL_BLUE, GREY, WARNING_YELLOW } from "@constants/colors";

import Images from "@assets";

const TRANSPARENT = "transparent";

const Popup = ({
    visible,
    onClose,
    title,
    description,
    ContentComponent,
    primaryAction,
    secondaryAction,
    textLink,
    hideCloseButton,
    warningText,
}) => {
    if (!visible) return null;

    let contentElement = null;

    if (ContentComponent) {
        contentElement = React.isValidElement(ContentComponent) ? (
            ContentComponent
        ) : (
            // $FlowFixMe
            <ContentComponent />
        );
    }

    return (
        <>
            <BlurView style={styles.blur} blurType="dark" blurAmount={10} />

            <Modal
                visible
                transparent
                hardwareAccelerated
                onRequestClose={onClose}
                animationType="fade"
            >
                <LogGesture modal>
                    <ScrollView
                        bounces={false}
                        style={styles.flex}
                        contentContainerStyle={styles.flex}
                    >
                        <View style={styles.popupInner}>
                            {/* Somehow touchable w/o feedback doesn't work in this case */}
                            <TouchableOpacity
                                activeOpacity={1}
                                style={styles.flexFull}
                                onPress={onClose}
                            >
                                <View style={styles.flexFull} />
                            </TouchableOpacity>

                            <View style={[styles.popupBody, styles.dialogContainer]}>
                                {!hideCloseButton && (
                                    <View style={styles.dialogCloseContainer}>
                                        <TouchableOpacity
                                            style={styles.closeButton}
                                            onPress={onClose}
                                        >
                                            <Image style={{}} source={Images.icCloseBlack} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                                {contentElement ? (
                                    contentElement
                                ) : (
                                    <>
                                        <View style={styles.dialogInnerContainer}>
                                            <View style={styles.dialogSectionContainer}>
                                                <Typo
                                                    text={title}
                                                    textAlign="left"
                                                    fontSize={14}
                                                    lineHeight={18}
                                                    fontWeight="600"
                                                />
                                            </View>
                                        </View>
                                        <View style={styles.dialogDescriptionContainer}>
                                            <Typo
                                                text={description}
                                                textAlign="left"
                                                fontSize={14}
                                                lineHeight={20}
                                                fontWeight="normal"
                                            />
                                            {!!warningText && (
                                                <View style={styles.warningContainer}>
                                                    <Image
                                                        style={styles.alertIcon}
                                                        source={Images.icWarningYellow}
                                                    />

                                                    <Typo
                                                        text={warningText}
                                                        fontWeight="600"
                                                        textAlign="left"
                                                        fontSize={12}
                                                        lineHeight={20}
                                                        style={styles.warningText}
                                                    />
                                                </View>
                                            )}
                                        </View>

                                        <View style={styles.dialogActionContainer}>
                                            {primaryAction && !secondaryAction && (
                                                <View
                                                    style={
                                                        !textLink && styles.primaryWithoutSiblings
                                                    }
                                                >
                                                    <ActionButton
                                                        fullWidth
                                                        borderRadius={24}
                                                        height={40}
                                                        onPress={primaryAction.onPress}
                                                        backgroundColor={YELLOW}
                                                        componentCenter={
                                                            <Typo
                                                                text={primaryAction.text}
                                                                fontSize={14}
                                                                fontWeight="600"
                                                                lineHeight={18}
                                                                numberOfLines={1}
                                                                textBreakStrategys="simple"
                                                            />
                                                        }
                                                    />
                                                </View>
                                            )}
                                            {secondaryAction && !primaryAction && (
                                                <View
                                                    style={
                                                        !textLink && styles.primaryWithoutSiblings
                                                    }
                                                >
                                                    <ActionButton
                                                        fullWidth
                                                        borderRadius={24}
                                                        height={40}
                                                        onPress={secondaryAction.onPress}
                                                        backgroundColor={WHITE}
                                                        style={styles.secondaryButtonSingle}
                                                        componentCenter={
                                                            <Typo
                                                                text={secondaryAction.text}
                                                                fontSize={14}
                                                                fontWeight="600"
                                                                lineHeight={18}
                                                                numberOfLines={1}
                                                                textBreakStrategys="simple"
                                                            />
                                                        }
                                                    />
                                                </View>
                                            )}
                                            {textLink && !secondaryAction && (
                                                <View
                                                    style={[
                                                        styles.textLinkContainer,
                                                        !primaryAction &&
                                                            styles.textLinkContainerSingle,
                                                    ]}
                                                >
                                                    <TouchableOpacity onPress={textLink.onPress}>
                                                        <Typo
                                                            color={ROYAL_BLUE}
                                                            text={textLink.text}
                                                            fontSize={14}
                                                            fontWeight="600"
                                                            lineHeight={18}
                                                            numberOfLines={1}
                                                            textBreakStrategys="simple"
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                            {primaryAction && secondaryAction && (
                                                <View
                                                    style={styles.primarySecondaryActionContainer}
                                                >
                                                    <View style={styles.primaryFooterContainer}>
                                                        <ActionButton
                                                            fullWidth
                                                            borderRadius={20}
                                                            height={40}
                                                            onPress={secondaryAction.onPress}
                                                            backgroundColor={WHITE}
                                                            style={styles.primaryFooterButton}
                                                            componentCenter={
                                                                <Typo
                                                                    text={secondaryAction.text}
                                                                    fontSize={14}
                                                                    fontWeight="600"
                                                                    lineHeight={18}
                                                                    numberOfLines={1}
                                                                    textBreakStrategys="simple"
                                                                />
                                                            }
                                                        />
                                                    </View>
                                                    <View style={styles.secondaryFooterContainer}>
                                                        <ActionButton
                                                            fullWidth
                                                            borderRadius={20}
                                                            height={40}
                                                            onPress={primaryAction.onPress}
                                                            backgroundColor={YELLOW}
                                                            componentCenter={
                                                                <Typo
                                                                    text={primaryAction.text}
                                                                    fontSize={14}
                                                                    fontWeight="600"
                                                                    lineHeight={18}
                                                                    numberOfLines={1}
                                                                    textBreakStrategys="simple"
                                                                />
                                                            }
                                                            style={styles.secondaryFooterButton}
                                                        />
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                    </>
                                )}
                            </View>
                            <TouchableOpacity
                                activeOpacity={1}
                                style={styles.flexFull}
                                onPress={onClose}
                            >
                                <View style={styles.flexFull} />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </LogGesture>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    alertIcon: {
        marginTop: 5,
        marginRight: 10,
    },
    blur: {
        bottom: 0,
        elevation: 99,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
        // zIndex: 999,
    },
    closeButton: {
        height: 20,
        width: 20,
    },
    contentStyle: {
        padding: 0,
        paddingTop: 0,
    },
    dialogActionContainer: {
        paddingHorizontal: 40,
    },
    dialogCloseContainer: {
        position: "absolute",
        right: 20,
        top: 20,
        zIndex: 7,
    },
    dialogContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        position: "relative",
    },
    dialogDescriptionContainer: {
        paddingBottom: 40,
        paddingHorizontal: 40,
    },
    dialogInnerContainer: {
        flexDirection: "column",
        paddingBottom: 16,
        paddingHorizontal: 40,
        paddingTop: 40,
    },
    dialogTitleOvewrite: {
        margin: 0,
    },
    flex: {
        flex: 1,
    },
    flexFull: {
        flex: 1,
        width: "100%",
    },
    overlayStyle: {
        backgroundColor: TRANSPARENT,
    },
    popupBody: {
        backgroundColor: WHITE,
        elevation: 4,
        shadowOffset: {
            height: 4,
            width: 2,
        },
        shadowOpacity: 0.24,
        width: "100%",
    },
    popupInner: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        padding: 24,
        position: "relative",
    },
    primaryFooterButton: {
        borderColor: GREY,
        borderWidth: 1,
        // paddingHorizontal: 30,
        // paddingVertical: 12,
    },
    primaryFooterContainer: {
        flexDirection: "row",
        paddingRight: 4,
        width: "50%",
    },
    primarySecondaryActionContainer: {
        flexDirection: "row",
        paddingBottom: 40,
        width: "100%",
    },
    primaryWithoutSiblings: {
        paddingBottom: 40,
    },
    secondaryButtonSingle: {
        borderColor: GREY,
        borderWidth: 1,
    },
    secondaryFooterButton: {
        // paddingHorizontal: 30,
        // paddingVertical: 12,
    },
    secondaryFooterContainer: {
        flexDirection: "row",
        paddingLeft: 4,
        width: "50%",
    },
    textLinkContainer: {
        paddingBottom: 24,
        paddingTop: 16,
    },
    textLinkContainerSingle: {
        paddingBottom: 40,
    },
    warningContainer: {
        backgroundColor: WARNING_YELLOW,
        borderRadius: 10,
        flexDirection: "row",
        marginTop: 20,
        padding: 15,
    },
    warningText: { flex: 1 },
});

Popup.propTypes = {
    visible: PropTypes.bool,
    hideCloseButton: PropTypes.bool,
    ContentComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
    onClose: PropTypes.func,
    title: PropTypes.string,
    description: PropTypes.string,
    primaryAction: PropTypes.shape({
        text: PropTypes.string,
        onPress: PropTypes.func,
    }),
    secondaryAction: PropTypes.shape({
        text: PropTypes.string,
        onPress: PropTypes.func,
    }),
    textLink: PropTypes.shape({
        text: PropTypes.string,
        onPress: PropTypes.func,
    }),
    warningText: PropTypes.string,
};

export default Popup;
