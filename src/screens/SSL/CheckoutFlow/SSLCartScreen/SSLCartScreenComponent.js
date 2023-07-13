/* eslint-disable react-native/sort-styles */
import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, Dimensions, TouchableOpacity, Image } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import EmptyState from "@components/DefaultState/EmptyState";
import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import {
    BLACK,
    YELLOW,
    WHITE,
    DARK_GREY,
    GREEN,
    GREY,
    RED,
    PICTON_BLUE,
    WARNING_YELLOW,
    GREY_100,
    GREY_200,
    BLUE,
    VARDEN,
} from "@constants/colors";

import { commaAdder } from "@utils/dataModel/utilityPartial.1";
import { deliveryType } from "@utils/dataModel/utilitySSL";

import assets from "@assets";

import {
    PROMO_STATUS_INVALID,
    PROMO_STATUS_VALID,
    PROMO_STATUS_MIN_AMT,
    PROMO_STATUS_FRAUD,
} from "./index";

const { width } = Dimensions.get("window");

/** SSLCartScreen on screen component - top to bottom */
/** Top buttons */
export function CartLocationPillShimmer() {
    return (
        <View style={styles1.pillContainer}>
            <Image style={styles1.blackPin} source={assets.blackPin} />
            <View style={styles1.middleColumnTextContainer}>
                <ShimmerPlaceHolder style={styles1.loaderTitle} />
                <ShimmerPlaceHolder style={styles1.loaderDesc} />
            </View>
            <Image source={assets.downArrow} style={styles1.downArrowStyle} resizeMode="contain" />
        </View>
    );
}
const styles1 = StyleSheet.create({
    blackPin: { height: 16, marginLeft: 16, marginRight: 12, width: 16 },
    downArrowStyle: {
        height: 15,
        marginRight: 15,
        width: 15,
    },
    middleColumnTextContainer: { flex: 1, justifyContent: "center" },
    pillContainer: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 8,
        flexDirection: "row",
        height: 64,
        marginTop: 4,
    },

    // Shimmer styles
    loaderTitle: {
        backgroundColor: GREY_100,
        borderRadius: 4,
        height: 8,
        maxWidth: 80,
        marginBottom: 6,
    },
    loaderDesc: {
        backgroundColor: GREY_200,
        borderRadius: 8,
        height: 16,
        maxWidth: 184,
    },
});

export function CartDeliveryTypePill({
    onPressDeliveryType,
    instantDeliveryPrepTime,
    selectedDeliveryId,
    deliveryOptions,
    tableNo = "0",
}) {
    let deliveryTypeLbl, deliveryLbl, deliveryIcon;
    if (selectedDeliveryId === deliveryType.THIRD_PARTY) {
        deliveryTypeLbl = "Instant Delivery";
        deliveryIcon = assets.locationPillDeliveryBike;
        deliveryLbl = instantDeliveryPrepTime;
    }
    if (selectedDeliveryId === deliveryType.PICKUP) {
        deliveryTypeLbl = "Pickup";
        deliveryIcon = assets.SSLLocationPillPickup;
        deliveryLbl = "Collect your order at the store when it's ready";
    }
    if (selectedDeliveryId === deliveryType.MERCHANT) {
        deliveryTypeLbl = "Merchant Delivery";
        deliveryIcon = assets.locationPillDeliveryBike;
        deliveryLbl =
            "No delivery tracking available. Don't worry if system auto-completes order after 3 hours. Do contact merchant for actual delivery time and date.";
    }
    if (selectedDeliveryId === deliveryType.EMAIL) {
        deliveryTypeLbl = "Email";
        deliveryIcon = assets.SSLLocationPillEmail;
        deliveryLbl = "To be sent upon payment completion";
    }
    if (selectedDeliveryId === deliveryType.DINE_IN) {
        deliveryTypeLbl = "Dine-In";
        deliveryIcon = assets.SSLDish;
        deliveryLbl = `Table ${tableNo}`;
    }
    return (
        <TouchableOpacity
            style={[styles2.topContainer, styles2.disclaimerHeight(selectedDeliveryId)]}
            onPress={selectedDeliveryId !== deliveryType.DINE_IN ? onPressDeliveryType : null}
        >
            <Image style={styles2.blackPin} source={deliveryIcon} />
            <View style={styles2.middleColumnTextContainer}>
                <Typo
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={19}
                    textAlign="left"
                    text={deliveryTypeLbl}
                    color={selectedDeliveryId !== deliveryType.DINE_IN ? BLUE : BLACK}
                />
                {selectedDeliveryId === MERCHANT_DELIVERY ? (
                    <View style={styles2.deliveryPopup}>
                        <Typo
                            fontSize={11}
                            lineHeight={13.4}
                            textAlign="left"
                            color={BLACK}
                            numberOfLines={4}
                            text={deliveryLbl}
                        />
                    </View>
                ) : (
                    <Typo
                        fontSize={11}
                        lineHeight={19}
                        textAlign="left"
                        color={BLACK}
                        numberOfLines={2}
                        text={deliveryLbl}
                    />
                )}
            </View>

            {deliveryOptions?.length > 1 && selectedDeliveryId !== deliveryType.DINE_IN && (
                <Image
                    source={assets.downArrow}
                    style={styles2.downArrowInside}
                    resizeMode="contain"
                />
            )}
        </TouchableOpacity>
    );
}
CartDeliveryTypePill.propTypes = {
    onPressDeliveryType: PropTypes.func.isRequired,
    instantDeliveryPrepTime: PropTypes.string,
    selectedDeliveryId: PropTypes.number,
    deliveryOptions: PropTypes.array,
    tableNo: PropTypes.string,
};
CartDeliveryTypePill.defaultProps = {
    deliveryOptions: [],
};
const styles2 = StyleSheet.create({
    topContainer: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        flexDirection: "row",
        marginBottom: 1,
    },
    blackPin: {
        height: 16,
        marginLeft: 16,
        marginRight: 12,
        width: 16,
        marginTop: 27,
        alignSelf: "flex-start",
    },
    downArrowInside: {
        height: 15,
        marginRight: 18,
        width: 15,
        marginTop: 27,
        alignSelf: "flex-start",
    },
    disclaimerHeight: (selectedDeliveryId) => ({ height: selectedDeliveryId === 3 ? 114 : 64 }),
    middleColumnTextContainer: { flex: 1, justifyContent: "center" },
    deliveryPopup: {
        borderRadius: 4,
        backgroundColor: VARDEN,
        marginVertical: 6,
        marginRight: 10,
        padding: 8,
    },
});

export function CartLocationPill({ onPressLocationPill, locationLbl }) {
    return (
        <TouchableOpacity style={styles3.pillContainer} onPress={onPressLocationPill}>
            <Image style={styles3.blackPin} source={assets.blackPin} />
            <View style={styles3.middleColumnTextContainer}>
                <Typo
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={22}
                    textAlign="left"
                    color={BLUE}
                    text={locationLbl?.name}
                />
                <Typo
                    fontSize={11}
                    lineHeight={15}
                    textAlign="left"
                    color={BLACK}
                    numberOfLines={2}
                    text={locationLbl?.addr}
                />
            </View>
            <Image source={assets.downArrow} style={styles3.downArrowInside} resizeMode="contain" />
        </TouchableOpacity>
    );
}
CartLocationPill.propTypes = {
    onPressLocationPill: PropTypes.func.isRequired,
    locationLbl: PropTypes.string,
};
CartLocationPill.defaultProps = {
    locationLbl: "Menara Maybank",
};
const styles3 = StyleSheet.create({
    blackPin: { height: 16, marginLeft: 16, marginRight: 12, width: 16 },
    downArrowInside: {
        height: 15,
        marginRight: 18,
        width: 15,
    },
    middleColumnTextContainer: { flex: 1, justifyContent: "center" },
    pillContainer: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        flexDirection: "row",
        height: 64,
    },
});

export function CartPickupEmailPill({ onPress, fullNameString, value }) {
    return (
        <TouchableOpacity style={styles4.pillContainer} onPress={onPress}>
            <Image style={styles4.blackPin} source={assets.info} />
            <View style={styles4.middleColumnTextContainer}>
                <Typo
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={19}
                    textAlign="left"
                    color={BLUE}
                    text={fullNameString || "Enter recipient info"}
                />
                {!!value && (
                    <Typo
                        fontSize={11}
                        lineHeight={19}
                        textAlign="left"
                        color={BLACK}
                        numberOfLines={2}
                        text={value}
                    />
                )}
            </View>
            <Image source={assets.downArrow} style={styles4.downArrowInside} resizeMode="contain" />
        </TouchableOpacity>
    );
}
CartPickupEmailPill.propTypes = {
    onPress: PropTypes.func.isRequired,
    fullNameString: PropTypes.string,
    value: PropTypes.string,
};
const styles4 = StyleSheet.create({
    blackPin: { height: 16, marginLeft: 16, marginRight: 12, width: 16 },
    downArrowInside: {
        height: 15,
        marginRight: 18,
        width: 15,
    },
    middleColumnTextContainer: { flex: 1, justifyContent: "center" },
    pillContainer: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        flexDirection: "row",
        height: 64,
    },
});

export function NoteToRiderPill({ onPress, note }) {
    return (
        <TouchableOpacity style={styles5.pillContainer} onPress={onPress}>
            <View style={styles5.middleColumnTextContainer}>
                <View style={styles5.row}>
                    <Typo
                        style={styles5.container}
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={20}
                        textAlign="left"
                        color={BLACK}
                        text="Note to Rider"
                    />
                    <Typo fontSize={12} fontWeight="600" lineHeight={20} color={BLUE} text="Edit" />
                </View>
                <Typo
                    style={styles5.marginTop4}
                    fontSize={12}
                    fontWeight="400"
                    lineHeight={19}
                    textAlign="left"
                    color={DARK_GREY}
                    text={note || "No notes to rider added"}
                />
            </View>
        </TouchableOpacity>
    );
}
NoteToRiderPill.propTypes = {
    onPress: PropTypes.func.isRequired,
    note: PropTypes.string,
};
const styles5 = StyleSheet.create({
    row: { flexDirection: "row" },
    container: { flex: 1 },
    middleColumnTextContainer: { flex: 1, justifyContent: "center" },
    marginTop4: { marginTop: 4 },
    pillContainer: {
        marginTop: 24,
        padding: 16,
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 8,
        flexDirection: "row",
        minHeight: 64,
    },
});

export function disclaimerHighlight(icon, title, msg) {
    return (
        <View style={styles6.container}>
            <Image style={styles6.icon} source={icon} />
            <View style={styles6.row}>
                <Typo
                    fontSize={12}
                    fontWeight="600"
                    lineHeight={18}
                    textAlign="left"
                    color={BLACK}
                    text={title}
                />
                <Typo
                    fontSize={10}
                    fontWeight="400"
                    lineHeight={12}
                    textAlign="left"
                    color={BLACK}
                    text={msg}
                />
            </View>
        </View>
    );
}

export function CartDeliveryMsgPill({ deliveryDistance, deliveryWeight, deliveryOutOfCoverage }) {
    let isVisible = false;
    let deliveryDistanceTitle;
    let deliveryWeightTitle;
    let deliveryDistanceMsg;
    let deliveryWeightMsg;
    let deliveryDistanceIcon;
    let deliveryWeightIcon;
    if (deliveryDistance > 20) {
        isVisible = true;
        deliveryDistanceTitle = "Delivery address is beyond 20KM";
        deliveryDistanceIcon = assets.SSLDeliveryAddress;
        deliveryDistanceMsg =
            "Delivery fee may be a bit pricey and waiting \ntime may be a little longer.";
    }
    if (deliveryWeight > 30) {
        isVisible = true;
        deliveryWeightTitle = "Order weight is over 30KG";
        deliveryWeightIcon = assets.SSLDeliveryWeight;
        deliveryWeightMsg =
            "An additional fee will be incurred as your order \nis heavier than the standard delivery weight.";
    }

    return (
        <>
            {isVisible && (
                <>
                    <View style={styles6.spacing(16)} />
                    {deliveryDistance > 20 &&
                        !deliveryOutOfCoverage &&
                        disclaimerHighlight(
                            deliveryDistanceIcon,
                            deliveryDistanceTitle,
                            deliveryDistanceMsg
                        )}
                    <View style={styles6.spacing(8)} />
                    {deliveryWeight > 30 &&
                        !deliveryOutOfCoverage &&
                        disclaimerHighlight(
                            deliveryWeightIcon,
                            deliveryWeightTitle,
                            deliveryWeightMsg
                        )}
                </>
            )}
        </>
    );
}

const styles6 = StyleSheet.create({
    spacing: (px) => ({
        height: px,
    }),
    container: {
        backgroundColor: VARDEN,
        flexDirection: "row",
        padding: 16,
        borderRadius: 8,
        height: 78,
    },
    row: { flexDirection: "column", justifyContent: "space-between" },
    icon: {
        height: 42,
        width: 42,
        marginVertical: 1,
        marginRight: 16,
    },
});

CartDeliveryMsgPill.propTypes = {
    deliveryDistance: PropTypes.number,
    deliveryWeight: PropTypes.number,
    deliveryOutOfCoverage: PropTypes.bool,
};

/** Body */
export function LeftRightLbl({ leftLbl, rightLbl, leftLblColor = "black", color = "black" }) {
    return (
        <View style={styles.subtotal}>
            <Typo fontSize={14} lineHeight={19} textAlign="left" text={leftLbl} color={color} />
            <Typo
                fontSize={14}
                lineHeight={18}
                fontWeight="semi-bold"
                textAlign="right"
                text={rightLbl}
                color={color}
            />
        </View>
    );
}
LeftRightLbl.propTypes = {
    leftLbl: PropTypes.string,
    rightLbl: PropTypes.string,
    leftLblColor: PropTypes.string,
    color: PropTypes.string,
};
LeftRightLbl.defaultProps = {
    color: "black",
};

export function ProcessingFeeLeftRightLbl({ onPressProcessingFeeInfo, processingFee }) {
    return (
        <View style={styles.subtotal}>
            <Typo fontSize={14} lineHeight={19} textAlign="left" text="Processing Fee" />

            <TouchableOpacity
                onPress={onPressProcessingFeeInfo}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
                <Image style={styles.infoViewMarginLeft} source={assets.info} />
            </TouchableOpacity>

            <View style={styles.processingFeeValue}>
                <Typo
                    fontSize={14}
                    lineHeight={18}
                    fontWeight="semi-bold"
                    textAlign="right"
                    text={processingFee}
                />
            </View>
        </View>
    );
}
ProcessingFeeLeftRightLbl.propTypes = {
    onPressProcessingFeeInfo: PropTypes.func,
    processingFee: PropTypes.string,
};

export function DeliveryFeeLeftRightLbl({ deliveryChargesResponse, onPressDeliveryFeeInfo }) {
    if (deliveryChargesResponse?.showDeliveryCharge != 1) return null;

    // Delivery Fee (6.3km)*
    let deliveryFeeLbl = "Delivery Fee";
    if (deliveryChargesResponse?.deliveryDistance) {
        deliveryFeeLbl += ` (${deliveryChargesResponse?.deliveryDistance}km)`;
    }

    // Strikethrough Original Charge
    let originalCharge = "";
    if (deliveryChargesResponse?.mbbFreeDelivery) {
        originalCharge = `RM ${commaAdder(deliveryChargesResponse?.originalCharge?.toFixed(2))}`;
    }

    // Right + RM 10
    let deliveryFeeValue = `RM ${commaAdder(deliveryChargesResponse?.deliveryCharge?.toFixed(2))}`;
    if (deliveryChargesResponse?.deliveryText) {
        deliveryFeeValue = deliveryChargesResponse?.deliveryText; // deliveryText usually is "FREE", we display it in green
    }
    const rightLblColor = deliveryChargesResponse?.deliveryText ? GREEN : BLACK;

    return (
        <View style={styles.subtotal}>
            <Typo fontSize={14} lineHeight={19} textAlign="left" text={`${deliveryFeeLbl}`} />

            <TouchableOpacity
                onPress={onPressDeliveryFeeInfo}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
                <Image style={styles.infoViewMarginLeft} source={assets.info} />
            </TouchableOpacity>

            <View style={styles.deliveryFeeValue}>
                {!!originalCharge && (
                    <Typo
                        fontSize={14}
                        lineHeight={18}
                        fontWeight="semi-bold"
                        textAlign="right"
                        text={originalCharge}
                        style={styles.strikethroughLbl}
                    />
                )}
                <Typo
                    fontSize={14}
                    lineHeight={18}
                    fontWeight="semi-bold"
                    textAlign="right"
                    text={deliveryFeeValue}
                    color={rightLblColor}
                />
            </View>
        </View>
    );
}
DeliveryFeeLeftRightLbl.propTypes = {
    deliveryChargesResponse: PropTypes.object,
    delyvaDeliveryType: PropTypes.any,
    onPressDeliveryFeeInfo: PropTypes.func,
};

export function PromoLbl({
    onPressEnterPromo,
    promoCodeString,
    promoCodeStatus,
    onPressPromoInfoMinAmt,
    removePromo,
}) {
    return (
        <View style={styles.subtotal}>
            <Typo fontSize={14} lineHeight={19} textAlign="left" text="Promo" />

            {/* icRoundedGreenTick */}

            <View style={styles.promoContainer}>
                {promoCodeStatus === PROMO_STATUS_MIN_AMT && (
                    <TouchableOpacity
                        onPress={onPressPromoInfoMinAmt}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    >
                        <Image source={assets.info} style={styles.infoView} />
                    </TouchableOpacity>
                )}
                {promoCodeStatus === PROMO_STATUS_VALID && (
                    <Image source={assets.icRoundedGreenTick} style={styles.infoView} />
                )}
                {(promoCodeStatus === PROMO_STATUS_INVALID ||
                    promoCodeStatus === PROMO_STATUS_FRAUD) && (
                    <Image source={assets.error} style={styles.infoView} />
                )}
                <TouchableOpacity
                    onPress={onPressEnterPromo}
                    hitSlop={{ top: 20, bottom: 20, left: 0, right: 0 }}
                >
                    <Typo
                        fontSize={14}
                        lineHeight={18}
                        fontWeight="semi-bold"
                        textAlign="right"
                        text={promoCodeString || "Enter Promo Code"}
                        color={
                            promoCodeStatus === PROMO_STATUS_INVALID ||
                            promoCodeStatus === PROMO_STATUS_FRAUD
                                ? RED
                                : promoCodeStatus === PROMO_STATUS_VALID
                                ? GREEN
                                : promoCodeStatus === PROMO_STATUS_MIN_AMT
                                ? BLACK
                                : PICTON_BLUE
                        }
                    />
                </TouchableOpacity>
            </View>

            {!!promoCodeString && (
                <TouchableOpacity
                    onPress={removePromo}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <Image source={assets.SSLDeleteButton} style={styles.deleteIcon} />
                </TouchableOpacity>
            )}
        </View>
    );
}
PromoLbl.propTypes = {
    onPressEnterPromo: PropTypes.func,
    promoCodeString: PropTypes.string,
    promoCodeStatus: PropTypes.string,
    onPressPromoInfoMinAmt: PropTypes.func,
    removePromo: PropTypes.func,
};

export function FootNote({ text }) {
    return (
        <View style={styles.footNote}>
            <Typo fontSize={10} lineHeight={14} textAlign="left" text={text} color={DARK_GREY} />
        </View>
    );
}
FootNote.propTypes = {
    text: PropTypes.string,
};

/** Action buttons */
export function ActionButtonLoading() {
    return (
        <ActionButton
            style={{ width: width - 50 }}
            borderRadius={25}
            backgroundColor={WHITE}
            borderColor={GREY}
            isLoading={true}
        />
    );
}

export function ActionButtonError({ init }) {
    return (
        <ActionButton
            style={{ width: width - 50 }}
            borderRadius={25}
            onPress={init}
            backgroundColor={YELLOW} // Negative scenario, Action button should be white. However, we need to tell user to "retry" even when system error.
            borderColor={GREY}
            componentCenter={
                <Typo
                    text="System error, please try again"
                    fontSize={14}
                    fontWeight="semi-bold"
                    lineHeight={18}
                />
            }
        />
    );
}
ActionButtonError.propTypes = {
    init: PropTypes.func,
};

export function ActionButtonOutOfCoverage({ onPressLocationPill }) {
    return (
        <ActionButton
            style={{ width: width - 50 }}
            borderRadius={25}
            onPress={onPressLocationPill}
            backgroundColor={YELLOW}
            borderColor={GREY}
            componentCenter={
                <Typo
                    text="Unable to deliver to this address"
                    fontSize={14}
                    fontWeight="semi-bold"
                    lineHeight={18}
                />
            }
        />
    );
}
ActionButtonOutOfCoverage.propTypes = {
    onPressLocationPill: PropTypes.func,
};

export function ActionButtonEmailEmpty({ title, onPress }) {
    return (
        <ActionButton
            style={{ width: width - 50 }}
            borderRadius={25}
            onPress={onPress}
            backgroundColor={YELLOW}
            componentCenter={
                <Typo text={title} fontSize={14} fontWeight="semi-bold" lineHeight={18} />
            }
        />
    );
}
ActionButtonEmailEmpty.propTypes = {
    title: PropTypes.string,
    onPress: PropTypes.func,
};

export function ActionButtonCheckout({ label, onPressCheckout }) {
    return (
        <ActionButton
            style={{ width: width - 50 }}
            borderRadius={25}
            onPress={onPressCheckout}
            backgroundColor={YELLOW}
            componentCenter={
                <Typo text={label} fontSize={14} fontWeight="semi-bold" lineHeight={18} />
            }
        />
    );
}
ActionButtonCheckout.propTypes = {
    label: PropTypes.string,
    onPressCheckout: PropTypes.func,
};

/** ETC */
export function AddLocationToAddressPrompt({ onPress }) {
    return (
        <TouchableOpacity style={styles.newAddressPromptContainer} onPress={onPress}>
            <View style={styles.warningIconContainer}>
                <Image source={assets.icWarning} style={styles.warningIcon} />
            </View>
            <View style={styles.newAddressLblContainer}>
                <Typo
                    fontSize={14}
                    fontWeight="semi-bold"
                    text="You're delivering to a new address. Please provide us with more details "
                    textAlign="left"
                    color={BLACK}
                    style={styles.newAddressLbl}
                />
            </View>

            <View style={styles.arrowRightContainer}>
                <Image source={assets.icChevronRight24Black} style={styles.arrowRight} />
            </View>
        </TouchableOpacity>
    );
}
AddLocationToAddressPrompt.propTypes = {
    onPress: PropTypes.func,
};

export function NoData({ onActionBtnClick }) {
    return (
        <View style={styles.container}>
            <EmptyState
                title="No items in cart"
                subTitle={
                    "Looks like you haven’t added anything to\nyour cart yet. Shop and order from your favourite local merchants today! "
                }
                buttonLabel="Order Now"
                onActionBtnClick={onActionBtnClick}
            />
        </View>
    );
}
NoData.propTypes = {
    onActionBtnClick: PropTypes.func,
};

const styles = StyleSheet.create({
    arrowRight: {
        height: 20,
        width: 20,
    },
    arrowRightContainer: {
        alignItems: "center",
        height: 60,
        justifyContent: "center",
        width: 40,
    },
    container: { flex: 1 },
    deleteIcon: { height: 16, marginLeft: 8, width: 16 },
    deliveryFeeValue: {
        flexDirection: "row",
        flex: 1,
        justifyContent: "flex-end",
    },
    processingFeeValue: {
        flexDirection: "row",
        flex: 1,
        justifyContent: "flex-end",
    },
    footNote: { marginHorizontal: 7, marginTop: 8 },
    infoView: { height: 16, marginRight: 8, width: 16 },
    infoViewMarginLeft: { height: 16, marginLeft: 8, width: 16 },
    newAddressLbl: { opacity: 0.6 },
    newAddressLblContainer: { flex: 1, justifyContent: "center" },
    newAddressPromptContainer: {
        backgroundColor: WARNING_YELLOW,
        borderRadius: 8,
        flexDirection: "row",
        height: 60,
        marginTop: 16,
    },
    promoContainer: {
        flexDirection: "row",
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-end",
    },
    strikethroughLbl: {
        marginRight: 10,
        textDecorationLine: "line-through",
        textDecorationStyle: "solid",
    },
    subtotal: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
    warningIcon: { height: 15, width: 16 },
    warningIconContainer: {
        alignItems: "center",
        height: 60,
        justifyContent: "center",
        width: 60,
    },
});

const THIRD_PARTY_DELIVERY = 1;
const MERCHANT_DELIVERY = 3;
