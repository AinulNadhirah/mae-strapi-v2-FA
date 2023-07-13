import AsyncStorage from "@react-native-community/async-storage";
import { useNavigation, useRoute } from "@react-navigation/core";
import { CacheeImage } from "cachee";
import React, { useState, useRef, useCallback, useEffect } from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
    Modal,
    SafeAreaView,
    TextInput as TextInputRN,
    Keyboard,
} from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Share from "react-native-share";
import Swiper from "react-native-swiper";

import OptionRadioButton from "@screens/SSL/MerchantProductFlow/SSLProductDetails/OptionRadioButton";
import OptionRadioChecked from "@screens/SSL/MerchantProductFlow/SSLProductDetails/OptionRadioChecked";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import Popup from "@components/Popup";
import { BottomDissolveCover, dissolveStyle } from "@components/SSL/BottomDissolveCover.js";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext, useModelController } from "@context";

import { getSSLProductDetailsV2 } from "@services";
import { FAMerchantDetails, FAProductDetails } from "@services/analytics/analyticsSSL";

import {
    BLACK,
    FADE_GREY,
    MEDIUM_GREY,
    NOTIF_RED,
    SEPARATOR,
    SWITCH_GREY,
    WHITE,
} from "@constants/colors";
import {
    SSL_CANCEL,
    SSL_NEW_CART,
    SSL_START_NEW_CART,
    SSL_START_NEW_CART_DESC,
} from "@constants/stringsSSL";

import { commaAdder } from "@utils/dataModel/utilityPartial.1";
import { isStartNewCart, keysToCamel, SSLCartClass } from "@utils/dataModel/utilitySSL";
import {
    getSameOrderInCart,
    defineOptGroupType,
    filterMandatoryOptGroup,
    priceFinalAmount,
} from "@utils/dataModel/utilitySSLOptionGroup";
import { useDidMount } from "@utils/hooks";

import assets from "@assets";

import ActionBtnLogic from "./ActionBtnLogic";
import AddMinusSection from "./AddMinusSection";

let onPressX = 0; //https://github.com/leecade/react-native-swiper/issues/698

function SSLProductDetails() {
    const navigation = useNavigation();
    const route = useRoute();
    const { getModel, updateModel } = useModelController();

    const { sandboxUrl, cartV1 } = getModel("ssl");
    const merchantDetail = route.params?.merchantDetail;
    const [item, setItem] = useState({});

    // To force UI rendering
    const [change, setChange] = useState(0);

    // To accommodate ordering with option group
    const isNewOrder = route.params?.isNewOrder ?? true;
    const tempOrderId = route.params?.tempOrderId;
    const order = route.params?.item;

    let cartCount = 0;
    let preselectedOptions = [];

    if (SSLCartClass(cartV1).isSameMerchant({ merchantId: merchantDetail?.merchantId })) {
        SSLCartClass(cartV1)
            .getProducts()
            ?.forEach((obj) => {
                if (obj.tempOrderId === tempOrderId) cartCount = obj.count;
                if (obj.selectedOptions?.length > 0) preselectedOptions = obj.selectedOptions;
            });
    }
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState(preselectedOptions || []);
    const [tempCount, setTempCount] = useState(cartCount || 1); // default value is 1

    const [mandatoryOptGroup, setMandatoryOptGroup] = useState([]);
    const [isCartButtonEnabled, setIsCartButtonEnabled] = useState(true);
    const [invalidOptGroupIds, setInvalidOptGroupIds] = useState([]);

    // Customer request
    const [customerRequest, setCustomerRequest] = useState(order?.customerRequest ?? "");
    const onChangeText = useCallback((e) => {
        e = e.replace(/(\r\n|\n|\r)/gm, ""); // Remove next line character
        setCustomerRequest(e);
    }, []);
    const onSubmitEditing = useCallback(() => {
        Keyboard.dismiss();
    }, []);

    // Log analytic
    useEffect(() => {
        getProductDetails();
    }, []);
    useDidMount(() => {
        if (!item.avail || !merchantDetail?.open) return;
        FAMerchantDetails.onPressProduct({ merchantDetail, item, tempCount }); // MerchantDetails -> onPress product tracking. Since it leads to this screen we put it here instead
        FAProductDetails.onScreen({ merchantDetail, item, tempCount });
    });

    // Swiper + Full screen image viewer
    const swiperRef = useRef();
    const [isImageViewer, setIsImageViewer] = useState(false);
    // Hack: If the user swipe, we don't show imageViewer. Only tap we show.
    // We know is tap by (PressIn coordinate) === (PressOut coordinate)
    function onPressInSwiperImg(e) {
        return (onPressX = e.nativeEvent.locationX);
    }
    function onPressOutSwiperImg(e) {
        if (e.nativeEvent.locationX > onPressX - 5 && e.nativeEvent.locationX < onPressX + 5) {
            if (item?.imagePaths?.[0]) {
                // somehow BE return [null]
                setIsImageViewer(true);
            }
        }
    }
    function onCloseImageViewer() {
        setIsImageViewer(false);
    }

    // +, -, action button functions
    function handleMinus() {
        tempCount > 0 && setTempCount(tempCount - 1);
    }

    function handlePlus() {
        if (!item.avail || !merchantDetail?.open) return;

        if (!isNewOrder) {
            if (SSLCartClass(cartV1).isSameMerchant({ merchantId: merchantDetail?.merchantId })) {
                // Hit max basket limit

                item.count = tempCount + 1;
                const temp = SSLCartClass(cartV1).updateCart({ newProducts: [item] });

                if (SSLCartClass(temp).cartFinalAmount() > merchantDetail?.orderLimit) {
                    showErrorToast({
                        message: `Sorry, you've reached the maximum purchase limit (${item.currency} ${merchantDetail?.orderLimit}) for today.`,
                    });
                    return;
                }
            }
        }
        setTempCount(tempCount + 1);
    }

    // Validate required options when initialized
    useEffect(() => {
        if (!validateOptions().isBtnEnabled) {
            setIsCartButtonEnabled(false);
        }
    }, [mandatoryOptGroup]);

    function validateOptions() {
        let bool = true;
        let invalidOptGroupIds = [];
        let selectedMandatoryOptGroup = 0;
        const mandatoryOptGroupCount = mandatoryOptGroup.length;

        mandatoryOptGroup?.forEach((optGroup) => {
            const minSel = Number(optGroup?.minSelection);
            const maxSel = Number(optGroup?.maxSelection);

            if (minSel > optGroup?.selectedCount || optGroup?.selectedCount > maxSel) {
                invalidOptGroupIds = [...invalidOptGroupIds, optGroup?.optionGroupId];
                bool = false;
            } else {
                selectedMandatoryOptGroup += 1;
            }
        });

        item?.optionGroup?.forEach((optionGroup) => {
            if (optionGroup?.isRequired != true) {
                const optionCount = options?.filter(
                    (item) => item.optionGroupId === optionGroup.optionGroupId
                );

                const minSel = Number(optionGroup?.minSelection);
                const maxSel = Number(optionGroup?.maxSelection);

                if (minSel > optionCount?.length || optionCount?.length > maxSel) {
                    invalidOptGroupIds = [...invalidOptGroupIds, optionGroup?.optionGroupId];
                    bool = false;
                }
            }
        });

        if (selectedMandatoryOptGroup !== mandatoryOptGroupCount) {
            bool = false;
        }

        return { isBtnEnabled: bool, invalidOptGroupIds };
    }

    function onPressActionButton() {
        // Validate if option requirement is fulfilled
        setInvalidOptGroupIds([]);
        if (!validateOptions().isBtnEnabled && tempCount !== 0) {
            setInvalidOptGroupIds(validateOptions().invalidOptGroupIds);
            return;
        }

        if (!item.avail || !merchantDetail?.open) return;
        const cartMerchantId = cartV1?.merchantDetail?.merchantId;
        const cartProducts = cartV1?.cartProducts;

        // Hit different merchant - Display "Start a new Cart?"
        if (
            isStartNewCart({ merchantId: merchantDetail?.merchantId, cartMerchantId, cartProducts })
        ) {
            setIsShowPopupNewCart(true);
            return;
        }

        if (tempCount === 0 && cartCount === 0) return onBackTap();

        if (isNewOrder) {
            const prevOrder = getSameOrderInCart({
                item,
                customerRequest,
                options,
                cartProducts,
            });
            if (prevOrder) {
                // Just update item count if same order already exists in cart
                item.tempOrderId = prevOrder?.tempOrderId;
                item.count = prevOrder?.count + tempCount;
            } else {
                // Completely new order
                item.tempOrderId = Math.floor(100000 + Math.random() * 900000); // Randomize an ID
                item.count = tempCount;
            }
        } else {
            // Edit order
            item.tempOrderId = tempOrderId;
            item.count = tempCount;
        }
        item.customerRequest = customerRequest;
        item.selectedOptions = options;
        item.selectedRequiredOption = mandatoryOptGroup;

        const temp = SSLCartClass(cartV1).updateCart({ merchantDetail, newProducts: [item] });
        SSLCartClass(temp).storeCartContextAS({ updateModel, AsyncStorage });
        onBackTap();
    }

    // Etc
    function onBackTap() {
        navigation.goBack();
    }
    function handleShare() {
        if (!item?.productDeepLinkUrl) return;

        const shareOptions = {
            message: item?.productDeepLinkUrl,
        };
        Share.open(shareOptions).catch((e) => {
            console.log("Share e", e);
        });
    }

    // Popup
    const [isShowPopupNewCart, setIsShowPopupNewCart] = useState(false);
    function hideNewCartPopup() {
        setIsShowPopupNewCart(false);
    }
    function startNewCart() {
        setIsShowPopupNewCart(false);

        item.customerRequest = customerRequest;
        item.count = tempCount;
        item.selectedOptions = options;

        const temp = SSLCartClass(cartV1).newCart({ merchantDetail, newProducts: [item] });
        if (SSLCartClass(temp).cartFinalAmount() > merchantDetail.orderLimit) {
            showErrorToast({
                message: `Sorry, you've reached the maximum purchase limit (${item.currency} ${merchantDetail.orderLimit}) for today.`,
            });
            return;
        }

        SSLCartClass(temp).storeCartContextAS({ updateModel, AsyncStorage });
        navigation.goBack();
    }

    const getProductDetails = useCallback(async () => {
        setOptions([]);

        // If edit order
        if (!isNewOrder) {
            setOptions(keysToCamel(order?.selectedOptions));
            setMandatoryOptGroup(order?.selectedRequiredOption);
            if (!validateOptions().isBtnEnabled) {
                setIsCartButtonEnabled(false);
            }
            setChange(change ? 0 : 1);
        }

        const body = {
            latitude: route.params?.latitude || 3.181899,
            longitude: route.params?.longitude || 101.6938113,
            merchantId: route.params?.merchantDetail?.merchantId || "",
            productId: route.params?.item?.productId,
        };
        try {
            setIsLoading(true);
            console.log("getSSLProductDetails getProductDetails start");
            const data = await getSSLProductDetailsV2({ sandboxUrl, body });
            const products = data?.data?.result?.productDetail?.products;
            setItem(products?.[0]);
            if (isNewOrder) {
                const res = filterMandatoryOptGroup(products?.[0]?.optionGroup);
                setMandatoryOptGroup(res);
            }
        } catch (e) {
            console.log("SSLProductDetails getProductDetail err", e);
            if (cartV1?.isReorder) {
                // Reorder hit error, clear cart
                const temp = SSLCartClass().emptyCart();
                SSLCartClass(temp).storeCartContextAS({ updateModel, AsyncStorage });
            }
        } finally {
            setIsLoading(false);
        }
    });

    function onPressRadio(option, allOptions, optionGroup) {
        let currentOptionsInRadio = options;
        const optionWithGroupId = option?.map((obj) => ({
            ...obj,
            optionGroupId: optionGroup.optionGroupId,
        }));

        // 1. Get all option IDs in current option group
        const result = allOptions.map((obj) => obj.optionId);

        // 2. Remove all options in current option group
        currentOptionsInRadio = currentOptionsInRadio.filter(
            (item) => !result.includes(item.optionId)
        );

        // 3. Reset the options, with newly selected option in radio
        setOptions([...currentOptionsInRadio, ...optionWithGroupId]);

        // 4. To validate add to cart button
        const selectedOptionGroup = mandatoryOptGroup;
        const optionGroupIndex = selectedOptionGroup?.findIndex(
            (item) => item.optionGroupId === optionGroup.optionGroupId
        );

        if (optionGroupIndex >= 0) {
            selectedOptionGroup[optionGroupIndex].selectedCount = 1;
        }
        setMandatoryOptGroup(selectedOptionGroup);
        if (!validateOptions().isBtnEnabled) {
            setIsCartButtonEnabled(false);
        } else {
            setIsCartButtonEnabled(true);
        }
    }

    function onPressOption(option, optionGroup) {
        const currentOptions = options;
        const findIndex = currentOptions.find((item) => item.optionId === option.optionId);
        const checkFindIndex = findIndex ?? null;

        option.optionGroupId = optionGroup.optionGroupId;

        let currentOptionGroupSelectedCount = mandatoryOptGroup?.filter(
            (item) => item.optionGroupId === optionGroup.optionGroupId
        );

        if (checkFindIndex) {
            // Deselect
            const indexOfObject = currentOptions?.findIndex((object) => {
                return object.optionId === option.optionId;
            });
            currentOptions?.splice(indexOfObject, 1);
            setOptions(currentOptions?.length > 0 ? currentOptions : []);
            setChange(change ? 0 : 1);

            if (!validateOptions().isBtnEnabled) {
                setIsCartButtonEnabled(false);
            } else {
                setIsCartButtonEnabled(true);
            }

            if (!currentOptionGroupSelectedCount?.length) return;
            currentOptionGroupSelectedCount =
                currentOptionGroupSelectedCount?.[0]?.selectedCount - 1;
        } else {
            // Select
            const newopt = [...options, option];
            setOptions(newopt);

            if (!currentOptionGroupSelectedCount?.length) return;
            currentOptionGroupSelectedCount =
                currentOptionGroupSelectedCount?.[0]?.selectedCount + 1;
        }

        const selectedOptionGroup = mandatoryOptGroup;
        const optionGroupIndex = selectedOptionGroup.findIndex(
            (item) => item.optionGroupId === optionGroup.optionGroupId
        );

        // Check if satisfied the required option count
        selectedOptionGroup[optionGroupIndex].selectedCount = currentOptionGroupSelectedCount;
        setMandatoryOptGroup(selectedOptionGroup);
    }

    useEffect(() => {
        if (!validateOptions().isBtnEnabled) {
            setIsCartButtonEnabled(false);
        } else {
            setIsCartButtonEnabled(true);
        }
    }, [options, change]);

    function renderOptionGroup(optionGroups) {
        return optionGroups?.map((optGroup) => {
            const isSelectionInvalid = !!invalidOptGroupIds.includes(optGroup?.optionGroupId);
            return (
                <>
                    <View style={styles.separator} />
                    <View style={styles.optionGroupTitle}>
                        <Typo
                            fontWeight="semi-bold"
                            fontSize={14}
                            lineHeight={18}
                            textAlign="left"
                            text={optGroup?.name}
                        />
                        <Typo
                            fontSize={12}
                            lineHeight={18}
                            fontWeight={isSelectionInvalid ? 600 : 400}
                            color={isSelectionInvalid ? NOTIF_RED : FADE_GREY}
                            text={defineOptGroupType(optGroup)?.text}
                        />
                    </View>
                    {renderOptionList(defineOptGroupType(optGroup)?.isRadio, optGroup)}
                </>
            );
        });
    }

    function renderOptionList(isRadio, optionGroup) {
        if (isRadio === true) {
            return (
                <OptionRadioButton
                    optionGroup={optionGroup}
                    preselectedOptions={options}
                    options={optionGroup?.options}
                    currency={item?.currency}
                    isSst={merchantDetail?.isSst}
                    sstPercentage={merchantDetail?.sstPercentage}
                    onRadioButtonPressed={onPressRadio}
                />
            );
        } else {
            return optionGroup?.options?.map((element, index) => {
                return (
                    <OptionRadioChecked
                        key={index}
                        optionGroup={optionGroup}
                        option={element}
                        selectedOptions={options}
                        paramContainerCls={styles.optionContainer(!element?.active)}
                        paramLabelCls={styles.option}
                        label={element?.name}
                        paramRightLabelCls={styles.optionPrice}
                        currency={item?.currency}
                        // rightLabel={`+${item?.currency} ${element?.amount}`}
                        isSst={merchantDetail?.isSst}
                        sstPercentage={merchantDetail?.sstPercentage}
                        optionChecked={onPressOption}
                    />
                );
            });
        }
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            {isLoading ? (
                // Use this loader instead of context's showLoader because context's showLoader is dismissed when API call success
                <View style={styles.loaderContainer}>
                    <ScreenLoader showLoader />
                </View>
            ) : (
                <ScreenLayout
                    header={
                        <HeaderLayout
                            backgroundColor={MEDIUM_GREY}
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerRightElement={
                                <TouchableOpacity onPress={handleShare}>
                                    <Image style={styles.shareIcon} source={assets.icShareBlack} />
                                </TouchableOpacity>
                            }
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    color={BLACK}
                                    lineHeight={19}
                                    text={item?.name ? item?.name : "Product Details"}
                                />
                            }
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                    paddingLeft={0}
                    paddingRight={0}
                    paddingBottom={0}
                    paddingTop={0}
                >
                    <KeyboardAwareScrollView
                        extraScrollHeight={130} //offset bottom banner
                        showsVerticalScrollIndicator={false}
                    >
                        {item?.imagePaths?.length > 0 && (
                            <View style={styles.swiperContainer}>
                                <Swiper
                                    loop={false}
                                    ref={swiperRef}
                                    paginationStyle={styles.swiperPagination}
                                    activeDot={<View style={styles.dotView} />}
                                >
                                    {item?.imagePaths?.map((obj, index) => {
                                        return (
                                            <TouchableOpacity
                                                key={`${index}`}
                                                onPressIn={onPressInSwiperImg}
                                                onPressOut={onPressOutSwiperImg}
                                                style={styles.container}
                                            >
                                                <CacheeImage
                                                    style={styles.bannerImg(
                                                        item.avail && merchantDetail?.open
                                                            ? true
                                                            : false
                                                    )}
                                                    source={{ uri: obj }}
                                                    resizeMode="cover"
                                                />
                                            </TouchableOpacity>
                                        );
                                    })}
                                </Swiper>
                            </View>
                        )}
                        <View style={styles.infoView}>
                            <View style={styles.title}>
                                <Typo
                                    fontSize={17}
                                    fontWeight="semi-bold"
                                    lineHeight={17}
                                    letterSpacing={0}
                                    color={BLACK}
                                    textAlign="left"
                                    text={item?.name}
                                />
                            </View>
                            <View style={styles.price}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="semi-bold"
                                    letterSpacing={0}
                                    color={BLACK}
                                    textAlign="left"
                                    text={`${item?.currency} ${commaAdder(
                                        priceFinalAmount({
                                            isSst: merchantDetail?.isSst,
                                            amount: item?.priceAmount,
                                            sstPercentage: merchantDetail?.sstPercentage,
                                        }).toFixed(2)
                                    )}`}
                                />
                            </View>
                            {!!item?.shortDesc && (
                                <View style={styles.description}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={20}
                                        letterSpacing={0}
                                        color={BLACK}
                                        textAlign="left"
                                        text={item?.shortDesc}
                                    />
                                </View>
                            )}

                            {item?.optionGroup?.length > 0 && renderOptionGroup(item?.optionGroup)}

                            {/** Additional Request (Optional) */}
                            <View style={styles.separator} />
                            <View style={styles.description}>
                                <Typo
                                    fontSize={14}
                                    lineHeight={20}
                                    letterSpacing={0}
                                    color={BLACK}
                                    textAlign="left"
                                    text="Additional request (Optional)"
                                />
                            </View>
                            <TextInputRN
                                autoFocus={false}
                                autoCorrect={false}
                                autoCapitalize="none"
                                style={styles.review}
                                onChangeText={onChangeText}
                                multiline={true}
                                fontSize={12}
                                fontFamily="montserrat"
                                maxLength={100}
                                value={customerRequest}
                                onSubmitEditing={onSubmitEditing}
                                placeholder="e.g. extra sauce/ no plastic bag"
                            />
                            <Typo
                                style={styles.wordLeft}
                                fontSize={14}
                                lineHeight={20}
                                letterSpacing={0}
                                color={BLACK}
                                textAlign="left"
                                text={`${100 - customerRequest?.length}`}
                            />

                            {merchantDetail?.orderMethod !== 1 && ( // orderMethod 1 - order via Whatsapp. Deprecating
                                <>
                                    <View style={styles.quantity}>
                                        <Typo
                                            fontSize={16}
                                            fontWeight="semi-bold"
                                            lineHeight={18}
                                            letterSpacing={0}
                                            color={BLACK}
                                            textAlign="center"
                                            text="Quantity"
                                        />
                                    </View>

                                    <AddMinusSection
                                        onPressMinus={handleMinus}
                                        tempCount={`${tempCount}`}
                                        onPressPlus={handlePlus}
                                        avail={item?.avail}
                                        cartCount={cartCount}
                                    />
                                </>
                            )}
                        </View>
                        <View style={dissolveStyle.scrollPadding} />
                    </KeyboardAwareScrollView>
                    {merchantDetail?.orderMethod !== 1 && (
                        <BottomDissolveCover>
                            <View style={styles.centerContainer}>
                                <ActionBtnLogic
                                    onPress={onPressActionButton}
                                    tempCount={tempCount}
                                    item={item}
                                    options={options}
                                    isNewOrder={isNewOrder}
                                    cartCount={cartCount}
                                    isEnabled={isCartButtonEnabled}
                                    isSst={merchantDetail?.isSst}
                                    sstPercentage={merchantDetail?.sstPercentage}
                                    isMerchantOpen={merchantDetail?.open}
                                />
                            </View>
                        </BottomDissolveCover>
                    )}

                    <Modal visible={isImageViewer} transparent>
                        <SafeAreaView style={styles.imageViewerContainer}>
                            <TouchableOpacity style={styles.closeView}>
                                <HeaderCloseButton isWhite onPress={onCloseImageViewer} />
                            </TouchableOpacity>
                            <ImageViewer
                                imageUrls={item?.imagePaths?.map((obj) => {
                                    return { url: obj };
                                })}
                                index={swiperRef?.current?.state?.index ?? 0}
                                enableSwipeDown
                                useNativeDriver
                                onSwipeDown={onCloseImageViewer}
                            />
                        </SafeAreaView>
                    </Modal>
                </ScreenLayout>
            )}
            <Popup
                visible={isShowPopupNewCart}
                title={SSL_START_NEW_CART}
                description={SSL_START_NEW_CART_DESC}
                onClose={hideNewCartPopup}
                primaryAction={{
                    text: SSL_NEW_CART,
                    onPress: startNewCart,
                }}
                secondaryAction={{
                    text: SSL_CANCEL,
                    onPress: hideNewCartPopup,
                }}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    bannerImg: (avail) => ({ flex: 1, opacity: avail ? 1 : 0.5 }),
    centerContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    closeView: {
        alignItems: "center",
        alignSelf: "flex-end",
        height: 40,
        justifyContent: "center",
        paddingRight: 27,
        width: 40,
    },
    container: {
        flex: 1,
    },
    description: { marginTop: 24, maxHeight: 300 },
    dotView: {
        backgroundColor: BLACK,
        borderRadius: 4,
        height: 8,
        marginBottom: 3,
        marginLeft: 3,
        marginRight: 3,
        marginTop: 3,
        width: 8,
    },
    imageViewerContainer: { backgroundColor: BLACK, flex: 1 },
    infoView: { paddingHorizontal: 24 },
    loaderContainer: {
        backgroundColor: MEDIUM_GREY,
        flex: 1,
    },
    option: {
        fontSize: 14,
        lineHeight: 20,
        marginLeft: 8,
    },
    optionContainer: (isActive) => ({
        marginTop: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    }),
    optionGroupTitle: {
        flexDirection: "row",
        marginTop: 24,
    },
    optionPrice: {
        fontWeight: "bold",
        textAlign: "right",
    },
    price: { marginTop: 8 },
    quantity: { marginTop: 24 },
    review: {
        backgroundColor: WHITE,
        borderColor: SWITCH_GREY,
        borderRadius: 8,
        borderWidth: 1,
        height: 75,
        marginTop: 16,
        paddingBottom: 13,
        paddingHorizontal: 15,
        paddingTop: 13,
        textAlignVertical: "top",
    },
    separator: { backgroundColor: SEPARATOR, height: 1, marginTop: 24 },
    shareIcon: { height: 44, width: 44 },
    swiperContainer: {
        height: 282,
        width: "100%",
    },
    swiperPagination: {
        bottom: -27,
    },
    title: { marginTop: 46 },
    wordLeft: { alignSelf: "flex-end", paddingTop: 8 },
});

export default withModelContext(SSLProductDetails);
