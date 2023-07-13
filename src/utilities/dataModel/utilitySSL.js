/* eslint-disable no-prototype-builtins */
import _ from "lodash";
import { Linking } from "react-native";

import { ORANGE, PROGRESS_BAR_GREEN, RED } from "@constants/colors";

import * as DataModel from "@utils/dataModel";

import { lottie } from "@assets";

/** We try to put all SSL related functions & biz logic here */
export function isSameMerchant({ merchantId, cartMerchantId = "" }) {
    return merchantId === cartMerchantId;
}

/**
 * Check Whether to prompt "Start a new cart?" popup
 * return true - when cart has legit and different merchantId "MBUAT1000872" and has product in it
 * return false - when cart is empty or cart merchantId is the same with new incoming merchantId
 */
export function isStartNewCart({ merchantId, cartMerchantId = "", cartProducts }) {
    if (cartMerchantId === "") return false;
    if (!cartProducts?.length) return false; // has merchant stored, but 0 product
    return merchantId !== cartMerchantId;
}

export function calculateCartAmount({ merchantDetail, cartProducts }) {
    console.log("calculateCartAmount cartProducts", cartProducts);
    return Array.isArray(cartProducts)
        ? cartProducts
              .filter((obj) => {
                  return obj.count > 0;
              })
              .reduce((acc, currentValue) => {
                  let optionAmt = 0;
                  optionAmt = currentValue?.selectedOptions?.reduce((accumulator, object) => {
                      return (
                          accumulator +
                          Number(
                              merchantDetail?.isSst
                                  ? (
                                        Number(object.amount) *
                                        (1 + merchantDetail?.sstPercentage / 100)
                                    ).toFixed(2)
                                  : Number(object.amount)
                          )
                      );
                  }, 0);

                  const itemTotalAmt =
                      parseFloat(
                          merchantDetail?.isSst
                              ? parseFloat(currentValue?.priceAmount ?? currentValue?.totalAmt) *
                                    (1 + merchantDetail?.sstPercentage / 100)
                              : currentValue?.priceAmount ?? currentValue?.totalAmt
                      ) + parseFloat(optionAmt);

                  acc = parseFloat(acc) + itemTotalAmt.toFixed(2) * currentValue.count;
                  return acc.toFixed(2);
              }, 0)
        : 0;
}

/**
 * Tell user if cart sync success or failure - refer BRD
 * (Merely a prompt/popup for user to see. Not actual sync-ing code)
 * 1. Sync & shop close - prompt error
 * 2. Sync success & isUserReorder - prompt success (user click reorder from order history)
 * 3. Sync successful - do nothing
 * 4. Sync failure - prompt error
 * 5. Merchant might adjust their basket limit - BRD didnt specify how to handle, we default to sync failure
 */
export function isPromptUser({ merchantDetail, productData, cartV1, isOptionUnavailable = false }) {
    const tempCartV1 = _.cloneDeep(cartV1); // contextCart vulnerable to direct mutation
    function isSyncSuccess({ cartProducts, productData }) {
        let isSuccess = true;
        // console.log("isSyncSuccess start", cartProducts);
        for (const cartProductObj of cartProducts) {
            const index = productData?.findIndex(
                (obj) => obj.productId === cartProductObj.productId
            );

            // console.log("isSyncSuccess index", index, "product", productData[index]);
            if (
                index === -1 || // product doesnt exist anymore
                !productData[index].avail // product not available
            ) {
                isSuccess = false;
                break;
            }
        }
        // console.log("isSyncSuccess", isSuccess);
        return isSuccess;
    }

    const { merchantId } = merchantDetail;
    const cartMerchantId = tempCartV1?.merchantDetail?.merchantId;
    const cartProducts = tempCartV1?.cartProducts || [];
    if (
        isSameMerchant({
            merchantId,
            cartMerchantId,
        })
    ) {
        if (!merchantDetail.open) {
            return SSLPROMPTUSERMSG.unavailable;
        } else if (contextCart.basketValue({ cartProducts }) > merchantDetail?.orderLimit) {
            return SSLPROMPTUSERMSG.orderLimitChanged;
        } else if (!isSyncSuccess({ cartProducts, productData })) {
            return SSLPROMPTUSERMSG.outOfStock;
        } else if (isSyncSuccess({ cartProducts, productData }) && isOptionUnavailable) {
            return SSLPROMPTUSERMSG.optionsUnavailable;
        } else if (isSyncSuccess({ cartProducts, productData }) && tempCartV1?.isReorder) {
            return SSLPROMPTUSERMSG.reorderSuccess;
        } else if (isSyncSuccess({ cartProducts, productData })) {
            return SSLPROMPTUSERMSG.success;
        }
    }
}
export const SSLPROMPTUSERMSG = Object.freeze({
    unavailable: "unavailable",
    success: "success",
    reorderSuccess: "reorderSuccess",
    outOfStock: "outOfStock",
    orderLimitChanged: "orderLimitChanged",
    optionsUnavailable: "optionsUnavailable",
});
export const SSLBIZLOGIC_MERCHANT_UNAVAILABLE = "SSLBIZLOGIC_MERCHANT_UNAVAILABLE";
export const SSLBIZLOGIC_PRODUCT_SYNC_SUCCESS = "SSLBIZLOGIC_PRODUCT_SYNC_SUCCESS";
export const SSLBIZLOGIC_REORDER_SUCCESS = "SSLBIZLOGIC_REORDER_SUCCESS";
export const SSLBIZLOGIC_OUT_OF_STOCK = "SSLBIZLOGIC_OUT_OF_STOCK";
export const SSLBIZLOGIC_ORDER_LIMIT_CHANGED = "SSLBIZLOGIC_ORDER_LIMIT_CHANGED";
export const SSLBIZLOGIC_OPTIONS_UNAVAILABLE = "SSLBIZLOGIC_OPTIONS_UNAVAILABLE";
/**
 * A class-like function to deal with locally cached cart.
 *
 * Feel free to add any local cart specific function here.
 *
 * Actually merchantDetail contains merchantDetail.product, but without option group.
 *
 * merchantDetail and cartProducts should be exactly the same with API's data, only
 * product has additional { count, additionalOrderRequest }
 *
 * Backend uses product.quantity for quantity of product a user bought, we use .count locally to avoid clashing
 * (so far in production already we notice no clashing, so feel free to switch to .quantity if desired)
 **/
export const SSLCartClass = (initialCart) => {
    const emptyCart = {
        merchantDetail: {},
        isReorder: false,
        cartProducts: [],
        promoCodeString: "",
        selectedDeliveryId: 1,
    };
    const cartV1 = _.isEmpty(initialCart) ? emptyCart : _.cloneDeep(initialCart);

    return {
        isSameMerchant: ({ merchantId }) => {
            return merchantId === cartV1?.merchantDetail?.merchantId;
        },
        isPromptStartANewCart: ({ merchantId }) => {
            /** prompt start a new cart when
             * 1. Has local cart with > 0 product
             * 2. Incoming merchantId is different
             */
            return (
                cartV1?.merchantDetail?.merchantId &&
                cartV1?.cartProduct.length &&
                cartV1?.merchantDetail?.merchantId !== merchantId
            );
        },
        getCart: () => {
            return cartV1;
        },
        getProducts: () => {
            return cartV1?.cartProducts ?? [];
        },
        emptyCart: () => {
            return emptyCart;
        },
        newCart: ({ merchantDetail, newProducts = [] }) => {
            return {
                ...emptyCart,
                merchantDetail,
                cartProducts: newProducts,
            };
        },
        updateCart: ({ merchantDetail, newProducts = [] }) => {
            cartV1.merchantDetail = merchantDetail;

            // cartV1.cartProducts = _.unionBy(newProducts, cartV1.cartProducts).filter(
            //     (obj) => obj.count > 0
            // );

            const index = cartV1.cartProducts.findIndex(
                (item) => item.tempOrderId === newProducts[0].tempOrderId
            );

            if (cartV1.cartProducts.length > 0 && index >= 0) {
                cartV1.cartProducts[index] = newProducts[0];
                cartV1.cartProducts = cartV1.cartProducts.filter((obj) => obj.count > 0);
            } else {
                cartV1.cartProducts = _.unionBy(newProducts, cartV1.cartProducts).filter(
                    (obj) => obj.count > 0
                );
            }

            return cartV1;
        },
        syncWithApiProducts: ({ apiProducts = [] }) => {
            cartV1.cartProducts = apiProducts
                .map((singleProduct) => {
                    // 1. Take productId which is present in API productData. Else discard
                    const cartProduct = cartV1.cartProducts.find(
                        (cartProduct) => cartProduct.productId === singleProduct.productId
                    );
                    if (cartProduct && cartProduct.avail) {
                        // 2. Adding in locally cached value. In this case count and customerRequest
                        singleProduct.count = cartProduct.count;
                        singleProduct.customerRequest = cartProduct.customerRequest;
                    }
                    return singleProduct;
                })
                .filter((obj) => obj.count > 0);
        },
        cartFinalAmount: () => {
            return Array.isArray(cartV1?.cartProducts)
                ? cartV1?.cartProducts
                      .filter((obj) => {
                          return obj.count > 0;
                      })
                      .reduce((acc, currentValue) => {
                          acc =
                              parseFloat(acc) +
                              parseFloat(currentValue.priceAmount) * currentValue.count;
                          return acc.toFixed(2);
                      }, 0)
                : 0;
        },
        /**
         * Function below is a side effect. By setting context, it'll trigger screen re-render if screen implements
         * const { cartV1 } = getModel("ssl")
         */
        storeCartContextAS({ updateModel, AsyncStorage }) {
            updateModel({
                ssl: {
                    cartV1,
                },
            });
            AsyncStorage.setItem("cartV1", JSON.stringify(cartV1));
        },
    };
};

export const contextCart = {
    // Generates an empty cartObj
    generateEmptyCart() {
        return { merchantDetail: {}, isReorder: false, cartProducts: [], promoCodeString: "" };
    },
    // Update product to {count}
    updateSingleProductCount({ cartV1, merchantDetail, item, count }) {
        console.log(cartV1, count);
        const tempCartV1 = _.cloneDeep(cartV1); // contextCart vulnerable to direct mutation
        const tempCartProducts = tempCartV1?.cartProducts ?? [];
        const index = tempCartProducts.findIndex((obj) => obj.productId === item.productId);
        if (index > -1) {
            if (count === 0) {
                // delete item
                tempCartProducts.splice(index, 1);
            } else {
                // update item
                tempCartProducts[index].tempOrderId = item?.tempOrderId;
                tempCartProducts[index].count = count;
                tempCartProducts[index].customerRequest = item?.customerRequest || "";
                // update options
                tempCartProducts[index].selectedOptions = item?.selectedOptions ?? [];
            }
        } else if (count === 0) {
            // not in cart. No need delete & do nothing
        } else {
            // add item
            tempCartProducts.push({ ...item, count });
        }
        return {
            merchantDetail,
            cartProducts: tempCartProducts,
            promoCodeString: cartV1?.promoCodeString ?? "",
        };
    },
    // Generates a cartObj with given data
    generateCartWith({ merchantDetail, isReorder, productData, promoCodeString = "" }) {
        return {
            merchantDetail,
            isReorder,
            cartProducts: productData,
            promoCodeString,
        };
    },
    // Return the amount in your cart
    basketValue({ cartProducts, isSst, sstPercentage }) {
        const merchantDetail = {
            isSst,
            sstPercentage,
        };
        return calculateCartAmount({ cartProducts, merchantDetail });
    },
    // Stores your cart in context and AS
    storeCartContextAS({ updateModel, cartObj, AsyncStorage }) {
        console.log("cart obj in store cart context: ", cartObj);

        updateModel({
            ssl: {
                cartV1: cartObj,
            },
        });
        AsyncStorage.setItem("cartV1", JSON.stringify(cartObj));
    },
};

// Check if arr contains ALL value of target
export function arrContainAll(arr = [], target = []) {
    return target.every((v) => arr.includes(v));
}

export function openWhatsApp(obj = {}) {
    const { phone = "", text = "" } = obj;
    const num = phone.charAt(0) === "+" ? phone.substring(1) : phone;
    const url = "https://wa.me/" + (num.charAt(0) === "6" ? num : "6" + num) + "/?text=" + text;
    Linking.openURL(url).catch(() => {
        console.log("open whatsapp error");
    });
}

// Calculate the weight of your cart. Returns totalWeight, and each product's weight (with qty)
export function calculateWeight({ cartProducts }) {
    // console.log("utilitySSL calculateWeight", cartProducts);
    let totalCartWeight = 0;
    const cartProductsWeighted = _.cloneDeep(cartProducts);
    cartProductsWeighted.map((product) => {
        const totalWeightPerItem = parseFloat((product.count * product.weight).toFixed(2));
        // console.log("totalWeightPerItem", totalWeightPerItem);
        if (!isNaN(totalWeightPerItem)) {
            totalCartWeight += totalWeightPerItem;
            product.totalWeight = totalWeightPerItem;
            product.weight = totalWeightPerItem;
        }
        product.totalAmt = parseFloat(product.count * product.priceAmount).toFixed(2);
        product.quantity = product.count; // backend received quantity
    });
    return { totalCartWeight, cartProductsWeighted };
}

// Use this right after API response, and inside try catch loop
export function validateQRMSResponse(response) {
    // Merchant manually set their store to "Closed". This happens very often, so FE has custom UI for this scenario
    if (response?.data?.result?.status === "QRO70" || response?.data?.result?.status === "QR070") {
        throw { message: "QR070", status: "QR070" }; // throw custom object instead of Error object to retain .status
    }

    // Our API is merely a wrapper from QRMS, so to get the true status code, we need to dig to the last layer
    if (response?.data?.result?.code !== 200) {
        let errorMsg = response?.data?.message;
        response?.data?.result?.status && (errorMsg += `${response?.data?.result?.status}`);
        response?.data?.result?.text && (errorMsg += `${response?.data?.result?.text}`);
        throw new Error(errorMsg);
    }
    // let sampleQRMSResponse = {
    //     "data": {
    //         "message": "Unsuccessful",
    //         "code": 400,
    //         "challenge": null,
    //         "result": {
    //             "code": 400,
    //             "status": "QRO70",
    //             "text": "No record found",
    //             "message": null,
    //             "merchantDetail": null
    //         }
    //     },
    //     "status": 200, // Notice the API layer is 200 success
    //     }
    // }
}

export function groupDeliveryType(pills = []) {
    /**
     * If a merchant has 1 - Delivery and 3 - Merchant Delivery,
     * We group both into just "Delivery", and put it in 1st location.
     * And 3 will replace 1. But actually doesnt matter because deliveryCharges API will grab from merchant's preference, and return either 3 or 1 whichever is cheapest
     *
     */
    const deliveryTypePills = _.cloneDeep(pills);
    const merchantDeliveryIndex = deliveryTypePills.findIndex((obj) => obj.id == 3);
    if (merchantDeliveryIndex > -1) {
        deliveryTypePills.splice(merchantDeliveryIndex, 1);

        const obj = deliveryTypePills.find((obj) => obj.id == 1);
        if (obj) {
            obj.id = 3;
            obj.name = "Delivery";
            obj.type = "Delivery";
            obj.color = null;
            obj.status = false;
        } else {
            deliveryTypePills.unshift({
                id: 3,
                name: "Delivery",
                type: "Delivery",
                color: null,
                status: false,
            });
        }
    }

    const instantDeliveryObj = deliveryTypePills.find((obj) => obj.id == 1);
    if (instantDeliveryObj) {
        instantDeliveryObj.name = "Delivery";
        instantDeliveryObj.type = "Delivery";
        instantDeliveryObj.color = null;
        instantDeliveryObj.status = false;
    }

    const pickupObj = deliveryTypePills.find((obj) => obj.id == 2);
    if (pickupObj) {
        pickupObj.name = "Pickup";
        pickupObj.type = "Pickup";
        pickupObj.color = null;
        pickupObj.status = false;
    }

    return deliveryTypePills;
}

// Analytics
export function getAnalyticsCartList({ cartV1 }) {
    const cart = cartV1?.cartProducts?.map((product) => {
        const prod = {};
        prod.item_id = product?.productId;
        prod.item_name = product?.name;
        prod.item_category = `${cartV1?.merchantDetail?.sections?.[0]?.categoryId}` || "";
        prod.item_brand = cartV1?.merchantDetail?.shopName;
        prod.quantity = Number(product?.count || 0);
        prod.price = Number(product?.priceAmount || 0);
        return prod;
    });
    return cart;
}

// Calculate straight line distance
export function calculateDistanceTwoCoordinate({ lat1, lon1, lat2, lon2 }) {
    // Converts numeric degrees to radians
    function toRad(Value) {
        return (Value * Math.PI) / 180;
    }

    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var _lat1 = toRad(lat1);
    var _lat2 = toRad(lat2);

    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(_lat1) * Math.cos(_lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}

// Get long, lat depending on user's location, and their current selected location
export function getLatitude({ location, currSelectedLocationV1 }) {
    let latitude = "3.181899";
    if (location?.latitude) {
        latitude = location.latitude;
    }
    if (currSelectedLocationV1?.latitude) {
        latitude = currSelectedLocationV1.latitude;
    }
    return latitude;
}
export function getLongitude({ location, currSelectedLocationV1 }) {
    let longitude = "101.6938113";
    if (location?.longitude) {
        longitude = location.longitude;
    }
    if (currSelectedLocationV1?.longitude) {
        longitude = currSelectedLocationV1.longitude;
    }
    return longitude;
}

export async function SSLDetermineDefaultLocation({
    getSSLAddress,
    deviceLocation,
    massageAddressFormat,
    blackListedAddressId, // if delete address flow
    currSelectedLocationV1,
    geolocationUrl,
    GeocoderAddress,
    delyvaReverseGeoResultToAddrFormat,
    useAddressBookOnly = false,
}) {
    console.log("SSLDetermineDefaultLocation start");
    /**
     * 1. Get user's current location
     * 2. Auto select any item inside addressbook to nearest to location (<1km)
     * 3. If not found, use cached currSelectedLocationV1 (<1km)
     * 4. Else call delyva
     */
    /** Auto set a default address for user */
    let defaultLocation = {};
    let shortestDistance = 10000;
    try {
        const response = await getSSLAddress();
        let addresses = response?.data?.result?.addresses ?? [];
        addresses = massageAddressFormat(addresses);
        console.log("addresses", addresses);
        addresses = addresses.filter((address) => address.id !== blackListedAddressId);
        addresses.map((obj) => {
            const distance = calculateDistanceTwoCoordinate({
                lat1: deviceLocation?.location?.latitude,
                lon1: deviceLocation?.location?.longitude,
                lat2: obj?.latitude,
                lon2: obj?.longitude,
            });
            console.log("distance", distance);
            if (distance < 1 && distance < shortestDistance) {
                defaultLocation = obj;
                shortestDistance = distance;
            }
        });
    } catch (e) {
        // Unable to get addressbook API
    }
    console.log("done addressbook", defaultLocation);
    if (useAddressBookOnly) return defaultLocation;

    if (_.isEmpty(defaultLocation)) {
        const distance = calculateDistanceTwoCoordinate({
            lat1: deviceLocation?.location?.latitude,
            lon1: deviceLocation?.location?.longitude,
            lat2: currSelectedLocationV1?.latitude,
            lon2: currSelectedLocationV1?.longitude,
        });
        if (distance < 1 && currSelectedLocationV1?.id !== blackListedAddressId) {
            defaultLocation = currSelectedLocationV1;
        }
    }

    console.log("done defaultlocation checking", defaultLocation);

    // console.log("defaultLocation", defaultLocation);
    try {
        if (_.isEmpty(defaultLocation)) {
            const body = {
                lat: deviceLocation?.location?.latitude,
                lon: deviceLocation?.location?.longitude,
            };
            let response = await GeocoderAddress({ geolocationUrl, body });
            console.log("setCurrLocation", response);
            response = delyvaReverseGeoResultToAddrFormat(response);
            defaultLocation = response;
        }
    } catch (e) {
        // Unable to get current geolocation's landmark
    }
    return defaultLocation;
}

export function sslOrdersStatusMapping({
    deliveryId,
    deliveryStatus,
    orderStatus,
    cancelReason = "Your order is cancelled",
    isCar = false,
}) {
    if (deliveryId === 1 && deliveryStatus && (orderStatus === 8 || orderStatus === 2)) {
        // 1 - third party delivery
        switch (deliveryStatus) {
            case 0:
            case 10:
            case 11:
                return {
                    width: "10%",
                    color: ORANGE,
                    lottie: lottie.preparingFood,
                    text: "Waiting for merchant to accept order",
                    isCancellable: true,
                };
            case 100: // order created
                return {
                    width: "10%",
                    color: PROGRESS_BAR_GREEN,
                    lottie: lottie.findingRider,
                    text: isCar ? "Finding a driver" : "Finding a rider",
                    isCancellable: true,
                };
            case 110:
            case 200: // rider found
                return {
                    width: "30%",
                    color: PROGRESS_BAR_GREEN,
                    lottie: lottie.findingRider,
                    text: isCar ? "Driver is found" : "Rider is found",
                    isCancellable: false,
                };
            case 400: // rider headed to store
            case 450:
            case 475:
            case 500: // pickup success
            case 501:
            case 555:
            case 556:
                return {
                    width: "50%",
                    color: PROGRESS_BAR_GREEN,
                    lottie: isCar ? lottie.headToStoreCourier : lottie.headToStoreOnDemand,
                    text: isCar
                        ? "Driver is heading to the store"
                        : "Rider is heading to the store",
                    isCancellable: false,
                };
            case 600: // on the way to you
            case 625: // arrived for deliver
            case 650:
                return {
                    width: "70%",
                    color: PROGRESS_BAR_GREEN,
                    lottie: null,
                    text: "Order is on the way to you",
                    isCancellable: false,
                };
            case 654:
            case 655:
                return {
                    width: "30%",
                    color: PROGRESS_BAR_GREEN,
                    lottie: lottie.findingRider,
                    text: isCar ? "Finding you a new driver" : "Finding you a new rider",
                    isCancellable: true,
                };
            case 700:
            case 1000:
                return {
                    width: "100%",
                    color: PROGRESS_BAR_GREEN,
                    lottie: lottie.orderCompleted,
                    text: "Order is completed",
                    isCancellable: false,
                };
            case 900:
                return {
                    width: "100%",
                    color: RED,
                    lottie: lottie.error,
                    text: "Unable to find a Rider. Order cancelled.",
                    isCancellable: false,
                };
            default:
                // case 99: // create order failed
                return {
                    width: "100%",
                    color: RED,
                    lottie: lottie.error,
                    text: "Order cancelled",
                    isCancellable: false,
                };
        }
    } else {
        // Self pickup, Merchant Delivery, Email
        switch (orderStatus) {
            case 0: // Order Cancelled
                return {
                    width: "100%",
                    color: RED,
                    lottie: lottie.orderCanceled,
                    text:
                        deliveryStatus === 900
                            ? "Unable to find a Rider. Order cancelled."
                            : cancelReason
                            ? cancelReason.replace("\\n", "\n")
                            : "Your order is cancelled",
                    isCancellable: false,
                };
            case 4: // Order Cancelled by merchant
                return {
                    width: "100%",
                    color: RED,
                    lottie: lottie.orderCanceled,
                    text: cancelReason
                        ? cancelReason.replace("\\n", "\n")
                        : "Merchant unable to prepare order. Order cancelled",
                    isCancellable: false,
                };
            case 3: // Pending Merchant to accept order
                return {
                    width: "10%",
                    color: ORANGE,
                    lottie: deliveryId === 4 ? lottie.orderConfirmed : lottie.preparingFood,
                    text: "Waiting for merchant to accept order",
                    isCancellable: false,
                };
            case 7: // Merchant is preparing your order
                return {
                    width: "10%",
                    color: PROGRESS_BAR_GREEN,
                    lottie: deliveryId === 4 ? lottie.orderConfirmed : lottie.preparingFood,
                    text: "Merchant is preparing your order",
                    isCancellable: false,
                };
            case 8: // Finding Rider
                return {
                    width: "30%",
                    color: PROGRESS_BAR_GREEN,
                    lottie: lottie.findingRider,
                    text: "Finding Rider",
                    isCancellable: false,
                };
            case 2: {
                // Order In Progress
                let text, lottieImg;
                if (deliveryId === 2) {
                    text = "Order is ready for pick up";
                    lottieImg = lottie.readyToPickup;
                } else if (deliveryId === 1 || deliveryId === 3) {
                    text = "Order is on the way to you";
                    lottieImg = isCar ? lottie.headToStoreCourier : lottie.headToStoreOnDemand;
                } else {
                    // 4 - email
                    text = "Order in progress";
                }
                return {
                    width: "75%",
                    color: PROGRESS_BAR_GREEN,
                    lottie: lottieImg,
                    text,
                    isCancellable: false,
                };
            }
            case 1: // Order Completed
                return {
                    width: "100%",
                    color: PROGRESS_BAR_GREEN,
                    lottie: lottie.orderCompleted,
                    text: "Order is completed",
                    isCancellable: false,
                };
            default:
                // Order processing
                return {
                    width: "10%",
                    color: ORANGE,
                    lottie: lottie.orderConfirmed,
                    text: "Order in progress",
                    isCancellable: true,
                };
        }
    }
}

export const SSLUserContacteNoClass = (mobile) => {
    let mobileNo = "";

    // input 60172738291 or 172738291
    let tempMobile = mobile?.toString() ?? "";
    tempMobile = tempMobile.trim().replace(/\s/g, ""); // remove white space
    if (tempMobile.substring(0, 2) === "60") {
        tempMobile = tempMobile.substring(2);
    } else if (tempMobile.substring(0, 1) === "0") {
        tempMobile = tempMobile.substring(1);
    }

    mobileNo = tempMobile; // The raw variable that we deal with is of format: 16273291

    return {
        inTextFieldDisplayFormat() {
            // returns ->  16 2758 123. MAE Frontend will prepend label +60
            return mobileNo.replace(/(\d{2})(\d{1,4})?(\d{1,4})?/, (_, p1, p2, p3) => {
                let output = "";
                if (p1) output = `${p1}`;
                if (p2) output += ` ${p2}`;
                if (p3) output += ` ${p3}`;
                return output;
            });
        },
        inFullDisplayFormat() {
            // returns +6012 2859 1238
            return `+60${this.inTextFieldDisplayFormat()}`;
        },
        inBackendFormat() {
            // Proper format to backend 60162738272
            return `60${mobileNo}`;
        },
        isValidLength() {
            // 7 - 12 seems incorrect, but that's what stated in BRD
            const regex = /^.{7,12}$/;
            return regex.test(mobileNo);
        },
        isMalaysianMobileNum() {
            return DataModel.isMalaysianMobileNum(`+60${mobileNo}`);
        },
    };
};

export const apiSSLContactNoToNewFormat = (contact) => {
    let massagedContact = contact?.toString() ?? "";
    if (contact.substring(0, 2) === "60") {
        massagedContact = massagedContact.substring(2);
    } else if (massagedContact.substring(0, 1) === "0") {
        massagedContact = massagedContact.substring(1);
    }
    return massagedContact;
};

/**
 * input: 0172738291
 * output: +6017 273 8291
 *
 * input: 60172738291
 * output: +6017 273 8291
 */
export const APIContactToDisplayFormat = (contact) => {
    try {
        if (contact.substring(0, 1) === "0") {
            contact = "+6" + contact;
        } else if (contact.substring(0, 1) === "60") {
            contact = "+" + contact;
        }
        return contact
            .toString()
            .replace(/ /g, "")
            .replace(/(\d{4})-?(\d{1,3})?(\d{1,4})?/, (_, p1, p2, p3) => {
                let output = "";
                if (p1) output = `${p1}`;
                if (p2) output += ` ${p2}`;
                if (p3) output += ` ${p3}`;
                return output;
            });
    } catch (e) {
        return contact;
    }
};

/**
 *
 * @param {array} cachedProductData
 * @param {array} apiProductData
 * @returns {array} syncedProductData
 */
export const syncLocalCartWithApiProductData = (cachedCartProducts, apiProductData) => {
    let syncedProducts = [];
    cachedCartProducts.map((itemInCart) => {
        const tempApiProduct = apiProductData.find(
            (product) => product.productId === itemInCart.productId
        );
        if (tempApiProduct?.avail) {
            itemInCart.priceAmount = tempApiProduct.priceAmount;
            itemInCart.name = tempApiProduct.name;
            itemInCart.weight = tempApiProduct.weight;
            syncedProducts = [...syncedProducts, itemInCart];
        }
    });
    return syncedProducts.filter((obj) => obj.count > 0);
};

/**
 *
 * @param {array} rating -
 *  rating:[
 *      { "rating_1.0" : "1" },
 *      { "rating_5.0" : "2" }
 *  ]
 *
 * @returns {object}
 *  rating = {
 *      five: 2,
 *      four: 0,
 *      three: 0,
 *      two: 0,
 *      one: 1,
 *  };
 */
export const massageMerchantDetailsRating = (rating) => {
    const parsedRating = {
        five: 0,
        four: 0,
        three: 0,
        two: 0,
        one: 0,
    };
    if (Array.isArray(rating)) {
        rating?.some((obj) => {
            if (obj.hasOwnProperty("rating_5.0")) {
                parsedRating.five = Number(obj["rating_5.0"]);
            } else if (obj.hasOwnProperty("rating_4.0")) {
                parsedRating.four = obj["rating_4.0"];
            } else if (obj.hasOwnProperty("rating_3.0")) {
                parsedRating.three = obj["rating_3.0"];
            } else if (obj.hasOwnProperty("rating_2.0")) {
                parsedRating.two = obj["rating_2.0"];
            } else if (obj.hasOwnProperty("rating_1.0")) {
                parsedRating.one = obj["rating_1.0"];
            }
        });
    }
    return parsedRating;
};

// Temporary handling snake_case
const isObject = function (o) {
    return o === Object(o) && !isArray(o) && typeof o !== "function";
};

const isArray = function (a) {
    return Array.isArray(a);
};

const toCamel = (s) => {
    return s.replace(/([-_][a-z])/gi, ($1) => {
        return $1.toUpperCase().replace("-", "").replace("_", "");
    });
};

export const keysToCamel = function (o) {
    if (isObject(o)) {
        const n = {};

        Object.keys(o).forEach((k) => {
            n[toCamel(k)] = keysToCamel(o[k]);
        });

        return n;
    } else if (isArray(o)) {
        return o.map((i) => {
            return keysToCamel(i);
        });
    }

    return o;
};

export function validateIfOptionStillExist(productFromOrder, productFromCloud) {
    const allOptions = getAllOptionIdInProduct(productFromCloud?.optionGroup);
    const selectedOptions = getAllOptionIdInSelectedOption(
        keysToCamel(productFromOrder?.optionGroup)
    );
    return selectedOptions.every((val) => allOptions.includes(val));
}

export function syncSelectedOption(optionGroup, selectedOptionsId) {
    let selectedOptions = [];
    optionGroup?.map((optGroup, index) => {
        optGroup?.options?.map((opt, index) => {
            if (selectedOptionsId.includes(opt?.optionId)) {
                opt.optionGroupId = optGroup?.optionGroupId;
                selectedOptions = [...selectedOptions, opt];
            }
        });
    });
    return selectedOptions;
}

export function getAllOptionIdInSelectedOption(optionGroup) {
    let allOptionId = [];
    optionGroup?.map((obj, index) =>
        obj?.selectedOptions.map((opt, index) => (allOptionId = [...allOptionId, opt?.optionId]))
    );
    return allOptionId;
}

function getAllOptionIdInProduct(optionGroup) {
    let allOptionId = [];
    optionGroup?.map((obj, index) =>
        obj?.options.map((opt, index) => (allOptionId = [...allOptionId, opt?.optionId]))
    );
    return allOptionId;
}

export function sslIsHalalLbl(item) {
    if (item?.isHalal) return "[Halal]";
    if (item?.isHalal === false) return "[Non-Halal]";
    return "";
}

export function getFormattedAddress(text) {
    if (text.includes("’")) {
        text = text.replace("’", "'");
    }
    return text;
}

export function getQRParams(data) {
    let regex = /[?&]([^=#]+)=([^&#]*)/g;
    let params = {};
    let match;
    while ((match = regex.exec(data))) {
        params[match[1]] = match[2];
    }

    return params;
}

export function getNonDineInMerchants(data) {
    return data.filter(
        (item) =>
            item?.deliveryTypes?.length !== 1 &&
            ![item?.deliveryTypes].includes(deliveryType.DINE_IN)
    );
}

export const deliveryType = {
    THIRD_PARTY: 1,
    PICKUP: 2,
    MERCHANT: 3,
    EMAIL: 4,
    DINE_IN: 7,
};
