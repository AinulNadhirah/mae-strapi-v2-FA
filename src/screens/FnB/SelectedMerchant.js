import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import { BlurView } from "@react-native-community/blur";
import { Dialog } from "react-native-simple-dialogs";
import Typo from "@components/Text";
import ActionButton from "@components/Buttons/ActionButton";
import { YELLOW, WHITE, ROYAL_BLUE, BLACK, DARK_GREY } from "@constants/colors";

const TRANSPARENT = "transparent";

const SelectedMerchant = ({ item, visible, onClose, viewMoreAction, tryAgainAction }) => {
    function handleViewMorePress() {
        viewMoreAction(item);
    }
    function handleTryAgainPress() {
        tryAgainAction(item);
    }
    if (!visible) return null;
    return (
        <>
            <BlurView style={styles.blur} blurType="dark" blurAmount={10} />
            <Dialog
                visible={visible}
                onTouchOutside={onClose}
                animationType="fade"
                onRequestClose={onClose}
                dialogStyle={styles.dialogContainer}
                titleStyle={styles.dialogTitleOvewrite}
                contentStyle={styles.contentStyle}
                buttonsStyle={styles.contentStyle}
                overlayStyle={styles.overlayStyle}
            >
                <>
                    <View style={styles.dialogInnerContainer}>
                        <View style={styles.imageView}>
                            <Image
                                style={styles.promotionImage}
                                source={{
                                    uri: item?.logo,
                                }}
                            />
                        </View>
                        <View style={styles.infoContainer}>
                            <Typo
                                text={item?.shopName}
                                textAlign="left"
                                fontSize={14}
                                lineHeight={18}
                                fontWeight="600"
                                style={styles.nameText}
                            />
                        </View>
                    </View>
                    <View style={styles.dialogDescriptionContainer}>
                        <View style={item?.cuisinesTypes?.length ? styles.foodTypeView : {}}>
                            <Typo
                                fontSize={10}
                                style={styles.foodTypeText}
                                text={
                                    item?.cuisinesTypes?.length
                                        ? item?.cuisinesTypes[0].cuisineType
                                        : ""
                                }
                            />
                        </View>

                        <View style={styles.amountView}>
                            <Typo
                                fontSize={12}
                                fontWeight="600"
                                fontStyle="normal"
                                letterSpacing={0}
                                textAlign="left"
                                lineHeight={18}
                                color={BLACK}
                                text={item?.priceRange}
                            />
                            <View style={styles.circularView} />
                            <Typo
                                fontSize={12}
                                fontWeight="normal"
                                fontStyle="normal"
                                letterSpacing={0}
                                textAlign="right"
                                lineHeight={18}
                                style={styles.distance}
                                text={
                                    item?.distance
                                        ? item?.distance?.substring(
                                              0,
                                              item?.distance.indexOf(".") + 2
                                          ) + " km"
                                        : "km"
                                }
                            />
                        </View>
                        <ActionButton
                            fullWidth
                            borderRadius={20}
                            height={42}
                            onPress={handleViewMorePress}
                            backgroundColor={YELLOW}
                            componentCenter={
                                <Typo
                                    text="View More"
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            }
                            style={styles.secondaryFooterButton}
                        />
                        <TouchableOpacity
                            style={styles.tryAginFooterButton}
                            onPress={handleTryAgainPress}
                        >
                            <Typo
                                color={ROYAL_BLUE}
                                text="Spin Again"
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                            />
                        </TouchableOpacity>
                    </View>
                </>
            </Dialog>
        </>
    );
};

SelectedMerchant.propTypes = {
    visible: PropTypes.bool,
    onClose: PropTypes.func,
    item: PropTypes.object,
    viewMoreAction: PropTypes.func,
    tryAgainAction: PropTypes.func,
};
const styles = StyleSheet.create({
    amountView: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        marginLeft: 20,
        marginTop: 10,
    },
    blur: {
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },
    circularView: {
        backgroundColor: DARK_GREY,
        borderRadius: 2,
        height: 4,
        marginLeft: 2,
        width: 4,
    },
    contentStyle: {
        padding: 0,
        paddingTop: 0,
    },
    dialogContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        position: "relative",
    },
    dialogDescriptionContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 40,
        paddingHorizontal: 40,
    },
    dialogInnerContainer: {
        flexDirection: "column",
        paddingBottom: 16,
    },
    dialogTitleOvewrite: {
        margin: 0,
    },
    distance: {
        marginLeft: 3,
    },
    foodTypeText: {
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 16,
    },
    foodTypeView: {
        borderColor: BLACK,
        borderRadius: 8,
        borderStyle: "solid",
        borderWidth: 1,
        height: 17,
        width: 61,
    },
    imageView: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        height: 240,
        overflow: "hidden",
        width: "100%",
    },
    infoContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    nameText: {
        marginTop: 20,
    },
    overlayStyle: {
        backgroundColor: TRANSPARENT,
    },
    promotionImage: {
        flex: 1,
    },
    secondaryFooterButton: {
        marginTop: 30,
    },
    tryAginFooterButton: {
        marginTop: 25,
    },
});

export default SelectedMerchant;
