import AsyncStorage from "@react-native-community/async-storage";
import { useNavigation, useRoute } from "@react-navigation/core";
import _ from "lodash";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Platform,
    Dimensions,
    RefreshControl,
    Image,
    TextInput as TextInputRN,
    Keyboard,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import { BottomDissolveCover, dissolveStyle } from "@components/SSL/BottomDissolveCover.js";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { withModelContext, useModelController } from "@context";

import {
    GeocoderPlaces,
    getSSLAddress,
    getSSLAddressStates,
    postSSLAddress,
    updateSSLAddress,
    GeocoderAddress,
} from "@services";

import {
    BLACK,
    DARK_GREY,
    DISABLED,
    DISABLED_TEXT,
    MEDIUM_GREY,
    RED,
    RED_ERROR,
    SWITCH_GREY,
    WHITE,
    YELLOW,
} from "@constants/colors";
import { VALID_MOBILE_NUMBER } from "@constants/strings";

import * as DataModel from "@utils/dataModel";
import { checkNativeContatPermission } from "@utils/dataModel/utility";
import {
    SSLDetermineDefaultLocation,
    delyvaReverseGeoResultToAddrFormat,
    SSLUserContacteNoClass,
    getFormattedAddress,
} from "@utils/dataModel/utilitySSL";
import {
    delyvaSearchResultToAddrFormat,
    massageAddressFormat,
} from "@utils/dataModel/utilitySSLGeolocation";
import { useDidMount } from "@utils/hooks";

import SSLStyles from "@styles/SSLStyles";

import assets from "@assets";

import { Input, AddressName } from "./SSLAddressAddEditComponents";

const { width } = Dimensions.get("window");

function SSLAddressAddEdit() {
    const navigation = useNavigation();
    const route = useRoute();
    const { params } = route;
    const { updateModel, getModel } = useModelController();
    const { currSelectedLocationV1, geolocationUrl } = getModel("ssl");
    const location = getModel("location");

    const [isLoading, setIsLoading] = useState(false);
    const item = params?.item ?? {};

    const [name, setName] = useState(item?.name ?? "");
    const [addressLine1, setAddressLine1] = useState(item?.addressLine1 ?? "");
    const [unitNo, setUnitNo] = useState(item?.unitNo ?? "");
    const [postcode, setPostcode] = useState(item?.postcode ?? "");
    const [city, setCity] = useState(item?.city ?? "");
    const [state, setState] = useState(item?.state ?? "");
    const [recipientName, setRecipientName] = useState(item?.recipientName ?? "");
    const [contactNoDisplay, setContactNoDisplay] = useState(
        SSLUserContacteNoClass(item?.contactNo).inTextFieldDisplayFormat()
    );
    const [email, setEmail] = useState(item?.email ?? "");
    const [note, setNote] = useState(item?.note ?? "");
    const onChangeNote = useCallback((e) => {
        e = e.replace(/(\r\n|\n|\r)/gm, ""); // Remove next line character (BRD requirement < 3 lines)
        setNote(e);
    }, []);
    const onSubmitEditing = useCallback(() => {
        Keyboard.dismiss();
    }, []);

    const [nameErr, setNameErr] = useState("");
    const [addressLine1Err, setAddressLine1Err] = useState("");
    const [unitNoErr, setUnitNoErr] = useState("");
    const [postcodeErr, setPostcodeErr] = useState("");
    const [cityErr, setCityErr] = useState("");
    const [stateErr, setStateErr] = useState("");
    const [recipientNameErr, setRecipientNameErr] = useState("");
    const [contactNoErr, setContactNoErr] = useState("");
    const [emailErr, setEmailErr] = useState("");

    const longitude = useRef(item?.longitude);
    const latitude = useRef(item?.latitude);
    const [isHomeAvailable, setIsHomeAvailable] = useState(true);
    const [isWorkAvailable, setIsWorkAvailable] = useState(true);

    /**
     * Auto select home if user entry point is from AddAddress by tapping <Home>
     * Also auto select if existing address is home
     *
     * Same applies to work
     */
    const [isHomeSelected, setIsHomeSelected] = useState(params?.isHomeSelected || item?.home);
    const [isWorkSelected, setIsWorkSelected] = useState(params?.isWorkSelected || item?.work);

    // state
    const [stateId, setStateId] = useState(null);
    const [stateData, setStateData] = useState([]);
    const [scrollPicker, setScrollPicker] = useState({
        isDisplay: false,
        selectedIndex: 0,
        data: [],
    });

    // Popups
    const [popup, setPopup] = useState({});

    const init = useCallback(() => {
        function showError(e) {
            showErrorToast({
                message: e.message,
            });
        }

        setIsLoading(true);
        getSSLAddressStates()
            .then((response) => {
                const states = response?.data?.result?.states ?? [];
                setStateData(states);

                console.log("state", state);
                const obj = states.find((obj) => {
                    return obj.id == stateId || obj.state === state;
                });
                if (obj) {
                    setStateId(obj.id);
                    setState(obj.state);
                }
            })
            .catch(showError)
            .finally(() => {
                setIsLoading(false);
            });

        getSSLAddress()
            .then((response) => {
                let addresses = response?.data?.result?.addresses ?? [];
                addresses = massageAddressFormat(addresses);
                addresses.forEach((obj) => {
                    if (obj.home && obj.id != item?.id) {
                        setIsHomeAvailable(false);
                    }
                    if (obj.work && obj.id != item?.id) {
                        setIsWorkAvailable(false);
                    }
                });
            })
            .catch(showError);
    }, [state, stateId, item?.id]);

    useDidMount(() => {
        init();
        if (!params?.item && !params?.searchLocationItem) {
            // The screen could be: Add or Edit. If Add, we auto navigate to search on load
            searchAddressBtnPressed();
        }
    }, []);

    async function saveAddressAPI() {
        const body = {
            id: item?.id,
            name,
            addressLine1,
            addressType: 3, // Backend should ignore this
            ...(unitNo && { unitNo }),
            city,
            state,
            postcode,
            recipientName,
            contactNo: SSLUserContacteNoClass(contactNoDisplay).inBackendFormat(),
            email,
            longitude: `${longitude.current}`,
            latitude: `${latitude.current}`,
            defaultAddress: false,
            home: isHomeSelected,
            work: isWorkSelected,
            note,
        };

        setIsLoading(true);
        try {
            let result;
            if (body?.id) {
                result = await updateSSLAddress(body);
            } else {
                result = await postSSLAddress(body);
            }
            console.log("SSLAddressAddEdit postSSLAddress", result);

            // Update context's currSelectedLocationV1 if its the same
            if (
                currSelectedLocationV1.addressType === 3 && // only non delyva
                currSelectedLocationV1.id === body?.id
            ) {
                updateModel({
                    ssl: {
                        currSelectedLocationV1: body,
                    },
                });
                AsyncStorage.setItem(
                    "currSelectedLocationV1",
                    JSON.stringify(currSelectedLocationV1)
                );
            } else {
                // If added address is nearby, use it
                const defaultLocation = await SSLDetermineDefaultLocation({
                    getSSLAddress,
                    deviceLocation: location,
                    massageAddressFormat,
                    currSelectedLocationV1,
                    geolocationUrl,
                    GeocoderAddress,
                    delyvaReverseGeoResultToAddrFormat,
                    useAddressBookOnly: true,
                });
                if (!_.isEmpty(defaultLocation)) {
                    AsyncStorage.setItem("currSelectedLocationV1", JSON.stringify(defaultLocation));
                    updateModel({
                        ssl: {
                            currSelectedLocationV1: defaultLocation,
                        },
                    });
                }
            }

            /**
             * 1. Entry point - On tap any LocationPill -> navigate to SSL_LOCATION_MAIN -> tap add new address
             * 2. Entry point - On tap any LocationPill -> navigate to SSL_LOCATION_MAIN -> Search any location -> tap on bookmark to add location to address
             * Expected behavior: Upon successful saving of address, we assume user selects that address as current. We auto dismiss the address stack (Current screen and underneath SSL_LOCATION_MAIN screen)
             **/
            if (
                params?.entryPoint === navigationConstant.SSL_LOCATION_MAIN ||
                params?.entryPoint === navigationConstant.SSL_ADDERESS_N_LOCATION_SEARCH
            ) {
                navigation.navigate(navigationConstant.SSL_LOCATION_MAIN, {
                    searchLocationItem: body,
                });
            } else if (params?.entryPoint === navigationConstant.SSL_CART_SCREEN) {
                /**
                 * SSLCartScreen to SSLAddressAddEdit has 2 path:
                 * - User edit "note to rider" and
                 * - New location checkout flow
                 */
                AsyncStorage.setItem("currSelectedLocationV1", JSON.stringify(body));
                updateModel({
                    ssl: {
                        currSelectedLocationV1: body,
                    },
                });
                navigation.navigate(navigationConstant.SSL_CART_SCREEN, {
                    isNewAddressCheckoutFlow: params?.isNewAddressCheckoutFlow,
                });
            } else {
                navigation.goBack();
            }
        } catch (e) {
            showErrorToast({
                message: e.message,
            });
        } finally {
            setIsLoading(false);
        }
    }

    async function getGeocoder() {
        /**
         * 1. We use user input to get list of addresses (to get lat long)
         *    - No result found (Wrong address input)
         *    - 1 result found (directly use its long lat )
         *    - >1 result found
         *      - if result matches existing search result, then use its long lat
         */
        try {
            setIsLoading(true);
            let places = await GeocoderPlaces({
                geolocationUrl,
                locationString: `${addressLine1} ${city} ${postcode} ${state}`,
            });
            places = delyvaSearchResultToAddrFormat(places?.data);
            if (places.length === 0) {
                throw new Error();
            } else if (places.length === 1) {
                latitude.current = places[0].latitude;
                longitude.current = places[0].longitude;
            } else {
                let isEqual = false;
                places.forEach((place) => {
                    if (_.isEqual(place, params?.searchLocationItem)) {
                        isEqual = true;
                        latitude.current = place.latitude;
                        longitude.current = place.longitude;
                    }
                });

                if (!isEqual) {
                    latitude.current = places[0].latitude;
                    longitude.current = places[0].longitude;
                }
            }
        } catch (e) {
            showErrorToast({
                message: "Your location could not be determined, please double check your input.",
            });
            return;
        } finally {
            setIsLoading(false);
        }
        saveAddressAPI();
    }

    useEffect(() => {
        if (params?.searchLocationItem) {
            console.log("params?.searchLocationItem", params?.searchLocationItem, stateData);
            try {
                // By order of least likely for error
                latitude.current = params.searchLocationItem.latitude;
                longitude.current = params.searchLocationItem.longitude;

                setPostcode(params.searchLocationItem.postcode.substring(0, 5));
                setPostcodeErr("");

                setCity(params.searchLocationItem.city.substring(0, 40));
                setCityErr("");

                const obj = stateData.find((obj) => obj.state == params?.searchLocationItem?.state);
                if (obj) {
                    setStateId(obj.id);
                    setState(obj.state);
                    setStateErr("");
                } else {
                    setStateId(null);
                    setState("");
                }

                setAddressLine1(params.searchLocationItem.addressLine1.substring(0, 200));
                setAddressLine1Err("");

                setUnitNo(params.searchLocationItem.unitNo.substring(0, 200));
                setUnitNoErr("");
            } catch (e) {
                // do nothing
            }
        }
    }, [params?.searchLocationItem, stateData]);

    const onEndEditing = {
        name: ({ isCTAChecking }) => {
            // /^[a-zA-Z0-9#\/\\\&\)\(.~,_-]{4,50}$/g;
            const regex = /^[a-zA-Z\s]{1,20}$/;
            if (regex.test(name)) {
                !isCTAChecking && setNameErr("");
                return true;
            } else {
                !isCTAChecking &&
                    setNameErr(
                        "Address Name should contain at least 1 character with spacing and only alphabetical."
                    );
                return false;
            }
        },
        addressLine1: ({ isCTAChecking }) => {
            const regex = /^[a-zA-Z0-9\s/\'\\()&.,#_~@-]{1,200}$/; // special char: /\()&.-,#_~'@
            if (regex.test(addressLine1)) {
                !isCTAChecking && setAddressLine1Err("");
                return true;
            } else {
                !isCTAChecking &&
                    setAddressLine1Err(
                        "Address should contain at least 1 character and can only include alphabets, numbers, and the following special characters /()&.-,#_~@' "
                    );
                return false;
            }
        },
        unitNo: ({ isCTAChecking }) => {
            const regex = /^[a-zA-Z0-9\s/\'\\()&.,#_~@-]{0,200}$/; // special char: /\()&.-,#_~'@
            if (regex.test(unitNo)) {
                !isCTAChecking && setUnitNoErr("");
                return true;
            } else {
                !isCTAChecking &&
                    setUnitNoErr(
                        "Additional Address Details can only include alphabets, numbers, and the following special characters /()&.-,#_~@' "
                    );
                return false;
            }
        },
        postcode: ({ isCTAChecking }) => {
            const regex = /^.{5,5}$/;
            if (regex.test(postcode)) {
                !isCTAChecking && setPostcodeErr("");
                return true;
            } else {
                !isCTAChecking && setPostcodeErr("Postcode should contain at least 5 characters.");
                return false;
            }
        },
        city: ({ isCTAChecking }) => {
            const regex = /^.{1,40}$/;
            if (regex.test(city)) {
                !isCTAChecking && setCityErr("");
                return true;
            } else {
                !isCTAChecking && setCityErr("City should contain at least 1 character");
                return false;
            }
        },
        // State is a dropdown
        state: ({ isCTAChecking }) => {
            if (stateId) {
                !isCTAChecking && setStateErr("");
                return true;
            } else {
                !isCTAChecking && setStateErr("Please select state");
                return false;
            }
        },
        recipientName: ({ isCTAChecking }) => {
            if (DataModel.validateSSLRecipientName(recipientName.trim())) {
                !isCTAChecking && setRecipientNameErr("");
                return true;
            } else {
                !isCTAChecking &&
                    setRecipientNameErr("Recipient Name should contain at least 2 character");
                return false;
            }
        },
        contactNo: ({ isCTAChecking }) => {
            const isValidLength = SSLUserContacteNoClass(contactNoDisplay).isValidLength();
            const isValidMalaysian =
                SSLUserContacteNoClass(contactNoDisplay).isMalaysianMobileNum();
            if (isValidLength && isValidMalaysian) {
                !isCTAChecking && setContactNoErr("");
                return true;
            } else if (!isValidLength) {
                !isCTAChecking &&
                    setContactNoErr("Contact Number should contain 7 - 12 characters.");
                return false;
            } else {
                !isCTAChecking && setContactNoErr(VALID_MOBILE_NUMBER);
                return false;
            }
        },
        email: ({ isCTAChecking }) => {
            if (DataModel.validateEmail(email.trim())) {
                !isCTAChecking && setEmailErr("");
                return true;
            } else {
                !isCTAChecking && setEmailErr("Please enter a valid email address.");
                return false;
            }
        },
        notes: () => {
            // Notes is optional
            return true;
        },
    };

    // Dropdown
    function statesDropdownOnPress() {
        if (stateData && stateData.length) {
            setScrollPicker({
                isDisplay: true,
                selectedIndex: stateData.findIndex((obj) => obj.state === state) ?? 0,
                data: stateData.map((obj) => {
                    const { state, id } = obj;
                    return { name: state, value: id };
                }),
            });
        }
    }

    function scrollPickerOnPressDone(data) {
        console.log("select state: ", data);
        setScrollPicker({ ...scrollPicker, isDisplay: false });
        setStateId(data.value);
        setState(data.name);
    }
    function scrollPickerOnPressCancel() {
        setScrollPicker({ ...scrollPicker, isDisplay: false });
    }

    // Other functions
    function onCloseTap() {
        navigation.goBack();
    }

    function searchAddressBtnPressed() {
        navigation.navigate(navigationConstant.SSL_ADDERESS_N_LOCATION_SEARCH);
    }

    function onPressHome() {
        isHomeSelected ? setIsHomeSelected(false) : setIsHomeSelected(true);
    }

    function onPressWork() {
        isWorkSelected ? setIsWorkSelected(false) : setIsWorkSelected(true);
    }

    async function onPressSaveAddress() {
        setNote((note) => note.replace(/(\r\n|\n|\r)/gm, ""));
        let isAllPass = true;
        for (const key in onEndEditing) {
            const bool = onEndEditing[key]({});
            if (!bool) {
                isAllPass = false;
            }
        }
        if (!isAllPass) return;

        /**
         * When user is at a new location, upon checkout -> payment, we'll ask user to
         * - Fill in rest of the address. (We need contactNo and Email)
         * - And when user click Done, we'll prompt the user to Save Address or Continue without saving
         */
        if (
            params?.entryPoint === navigationConstant.SSL_CART_SCREEN &&
            params?.isNewAddressCheckoutFlow
        ) {
            setPopup({
                visible: true,
                title: "Save your address",
                description:
                    "Make your next order experience faster and easier by saving your address.",
                onClose: () => {
                    setPopup({ visible: false });
                },
                primaryAction: {
                    text: "Save to Address Book",
                    onPress: () => {
                        setPopup({ visible: false });
                        getGeocoder();
                    },
                },
                textLink: {
                    text: "Continue Without Saving",
                    onPress: () => {
                        setPopup({ visible: false });

                        const body = {
                            name,
                            addressLine1,
                            ...(unitNo && { unitNo: unitNo }),
                            city,
                            state,
                            postcode,
                            recipientName,
                            contactNo: SSLUserContacteNoClass(contactNoDisplay).inBackendFormat(),
                            email,
                            longitude: `${longitude.current}`,
                            latitude: `${latitude.current}`,
                            defaultAddress: false,
                            home: isHomeSelected,
                            work: isWorkSelected,
                        };

                        AsyncStorage.setItem("currSelectedLocationV1", JSON.stringify(body));
                        updateModel({
                            ssl: {
                                currSelectedLocationV1: body,
                            },
                        });
                        navigation.navigate(navigationConstant.SSL_CART_SCREEN, {
                            isNewAddressCheckoutFlow: true,
                        });
                    },
                },
            });
        } else if (!item?.id) {
            // Add new address flow
            setPopup({
                visible: true,
                title: "Confirm your full address",
                description: addressDesc,
                onClose: () => {
                    setPopup({ visible: false });
                },
                primaryAction: {
                    text: "Confirm",
                    onPress: () => {
                        setPopup({ visible: false });
                        getGeocoder();
                    },
                },
                secondaryAction: {
                    text: "Edit",
                    onPress: () => {
                        setPopup({ visible: false });
                    },
                },
            });
        } else {
            getGeocoder();
        }
    }

    let isSaveEnabled = true;
    for (const key in onEndEditing) {
        const bool = onEndEditing[key]({ isCTAChecking: true });
        if (!bool) {
            isSaveEnabled = false;
        }
    }

    function onChangeContactNo(val) {
        setContactNoDisplay(SSLUserContacteNoClass(val).inTextFieldDisplayFormat());
    }

    async function getContact() {
        const contactInfo = await checkNativeContatPermission();
        if (contactInfo?.status) {
            const mobileNo = contactInfo?.mobileNo ?? "";

            if (SSLUserContacteNoClass(contactNoDisplay).validateSSLContactNo()) {
                onChangeContactNo(mobileNo?.trim());
                setContactNoErr("");
            } else {
                setContactNoErr("Contact Number should contain 7 - 12 characters.");
            }
        }
    }

    const onChangeAddress = (text) => {
        let address = text;
        if (Platform.OS === "ios") {
            address = getFormattedAddress(address);
        }
        setAddressLine1(address);
    };
    const onChangeUnit = (text) => {
        let addressUnit = text;
        if (Platform.OS === "ios") {
            addressUnit = getFormattedAddress(addressUnit);
        }
        setUnitNo(addressUnit);
    };

    const addressDesc = unitNo
        ? `${unitNo}, ${addressLine1}\n${postcode} ${city}\n${state}`
        : `${addressLine1}\n${postcode} ${city}\n${state}`;
    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onCloseTap} />}
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                color={BLACK}
                                lineHeight={19}
                                text="Address Details"
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
                    contentContainerStyle={styles.containerPadding}
                    behavior={Platform.OS === "ios" ? "padding" : ""}
                    enabled
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    refreshControl={<RefreshControl refreshing={false} onRefresh={init} />}
                >
                    <AddressName
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g. School"
                        maxLength={20}
                        onEndEditing={onEndEditing.name}
                        isValid={!nameErr}
                        errorMessage={nameErr}
                        // Home btn
                        isHomeAvailable={isHomeAvailable}
                        isHomeSelected={isHomeSelected}
                        onPressHome={onPressHome}
                        // Work btn
                        isWorkAvailable={isWorkAvailable}
                        isWorkSelected={isWorkSelected}
                        onPressWork={onPressWork}
                    />
                    <Input
                        label="Address"
                        subLabel="Please edit and add your precise location"
                        value={addressLine1}
                        placeholder="e.g. Unit 1, Condo ABC, Jalan Happy 123"
                        onChangeText={(text) => onChangeAddress(text)}
                        maxLength={200}
                        onEndEditing={onEndEditing.addressLine1}
                        isValid={!addressLine1Err}
                        errorMessage={addressLine1Err}
                    >
                        <TouchableOpacity
                            onPress={searchAddressBtnPressed}
                            style={styles.searchBtnContainer}
                        >
                            <Image source={assets.search} style={styles.searchIcon} />
                        </TouchableOpacity>
                    </Input>

                    <Input
                        label="Additional Address Details (Optional)"
                        value={unitNo}
                        placeholder="e.g. B-10-03, Wisma ABC"
                        onChangeText={(text) => onChangeUnit(text)}
                        maxLength={200}
                        onEndEditing={onEndEditing.unitNo}
                        isValid={!unitNoErr}
                        errorMessage={unitNoErr}
                    />
                    <Input
                        label="Postcode"
                        value={postcode}
                        placeholder="e.g. 47300"
                        keyboardType="numeric"
                        onChangeText={setPostcode}
                        maxLength={5}
                        onEndEditing={onEndEditing.postcode}
                        isValid={!postcodeErr}
                        errorMessage={postcodeErr}
                    />
                    <Input
                        label="City/Town"
                        value={city}
                        placeholder="e.g. Petaling Jaya"
                        onChangeText={setCity}
                        maxLength={40}
                        onEndEditing={onEndEditing.city}
                        isValid={!cityErr}
                        errorMessage={cityErr}
                    />
                    {/* <View style={styles.dropdownContainer}> */}

                    <View style={styles.arbitraryMarginTop({ marginTop: 24 })}>
                        <Typo
                            fontSize={14}
                            fontWeight="normal"
                            color={BLACK}
                            textAlign="left"
                            lineHeight={18}
                            text="State"
                        />
                        <View style={styles.arbitraryMarginTop({ marginTop: 10 })} />

                        <Dropdown
                            title={state || "Please select a State"}
                            align="left"
                            onPress={statesDropdownOnPress}
                        />
                        {!!stateErr && (
                            <Typo style={styles.errMsgStyle} textAlign="left" text={stateErr} />
                        )}
                    </View>
                    <Input
                        label="Recipient Name"
                        value={recipientName}
                        placeholder="e.g. Danial Ariff"
                        onChangeText={setRecipientName}
                        maxLength={40}
                        onEndEditing={onEndEditing.recipientName}
                        isValid={!recipientNameErr}
                        errorMessage={recipientNameErr}
                    />
                    <View style={styles.height2} />
                    <Typo
                        fontSize={14}
                        fontWeight="normal"
                        color={BLACK}
                        textAlign="left"
                        lineHeight={18}
                        text="Contact Number"
                    />
                    <TextInput
                        autoFocus={false}
                        style={styles.emailTextInput}
                        value={contactNoDisplay}
                        prefix="+60"
                        placeholder="e.g. 6012 345 6789"
                        autoCapitalize="none"
                        keyboardType="phone-pad"
                        onChangeText={onChangeContactNo}
                        maxLength={12}
                        returnKeyType="done"
                        autoCorrect={false}
                        onEndEditing={onEndEditing.contactNo}
                        isValid={!contactNoErr}
                        isValidate
                        errorMessage={contactNoErr}
                    >
                        <TouchableOpacity onPress={getContact}>
                            <Image
                                accessible={true}
                                style={styles.selectContactImage}
                                source={assets.icSelectContact}
                            />
                        </TouchableOpacity>
                    </TextInput>
                    <Input
                        label="Email"
                        value={email}
                        placeholder="e.g. danial@gmail.com"
                        keyboardType="email-address"
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        maxLength={40}
                        onEndEditing={onEndEditing.email}
                        isValid={!emailErr}
                        errorMessage={emailErr}
                    />

                    <View style={styles.height2} />
                    <Typo
                        fontSize={14}
                        fontWeight="normal"
                        color={BLACK}
                        textAlign="left"
                        lineHeight={18}
                        text="Note to Rider (Optional)"
                    />
                    <TextInputRN
                        autoFocus={false}
                        autoCorrect={false}
                        autoCapitalize="none"
                        style={styles.review}
                        onChangeText={onChangeNote}
                        onEndEditing={onEndEditing.notes}
                        multiline={true}
                        onSubmitEditing={onSubmitEditing}
                        fontSize={12}
                        fontFamily="montserrat"
                        maxLength={100}
                        value={note}
                        placeholder="Add a note to the rider, e.g. Please leave food at the door/gate"
                    />

                    <Typo
                        style={styles.characterRemaining}
                        textAlign="right"
                        fontSize={12}
                        lineHeight={18}
                        color={note.length - 100 === 0 ? RED : DARK_GREY}
                        text={`${100 - note.length} characters left`}
                    />
                    <View style={dissolveStyle.scrollPaddingWithKeyboard} />
                </KeyboardAwareScrollView>

                <View style={dissolveStyle.imageBackground}>
                    <BottomDissolveCover>
                        <View style={styles.centerContainer}>
                            <ActionButton
                                style={{ width: width - 50 }}
                                borderRadius={25}
                                onPress={onPressSaveAddress}
                                borderWidth={1}
                                backgroundColor={isSaveEnabled ? YELLOW : DISABLED}
                                componentCenter={
                                    <Typo
                                        text="Save"
                                        fontSize={14}
                                        fontWeight="semi-bold"
                                        lineHeight={18}
                                        color={isSaveEnabled ? BLACK : DISABLED_TEXT}
                                    />
                                }
                                isLoading={isLoading}
                            />
                        </View>
                    </BottomDissolveCover>
                </View>
            </ScreenLayout>
            <Popup
                visible={popup.visible}
                title={popup.title}
                description={popup.description}
                onClose={popup.onClose}
                primaryAction={popup.primaryAction}
                textLink={popup.textLink}
                secondaryAction={popup.secondaryAction}
            />

            <ScrollPickerView
                showMenu={scrollPicker.isDisplay}
                list={scrollPicker.data}
                selectedIndex={scrollPicker.selectedIndex}
                onRightButtonPress={scrollPickerOnPressDone}
                onLeftButtonPress={scrollPickerOnPressCancel}
                rightButtonText="Done"
                leftButtonText="Cancel"
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    arbitraryMarginTop: ({ marginTop }) => {
        return { marginTop: marginTop };
    },
    centerContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    containerPadding: { paddingHorizontal: 24 },
    emailTextInput: {
        fontFamily: "montserrat-SemiBold",
        fontSize: 20,
        letterSpacing: 0,
    },
    errMsgStyle: {
        color: RED_ERROR,
        fontSize: 12,
        lineHeight: 16,
        paddingVertical: 10,
    },
    height2: { height: 24 },
    review: {
        backgroundColor: WHITE,
        borderColor: SWITCH_GREY,
        borderRadius: 8,
        borderWidth: 1,
        height: 150,
        marginTop: 16,
        paddingBottom: 13,
        paddingHorizontal: 15,
        paddingTop: 13,
        textAlignVertical: "top",
    },
    searchBtnContainer: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 32 / 2,
        height: 32,
        justifyContent: "center",
        width: 32,
        ...SSLStyles.shadow,
    },
    searchIcon: {
        height: 25,
        width: 25,
    },
    selectContactImage: {
        height: 30,
        resizeMode: "contain",
        width: 30,
    },
});

export default withModelContext(SSLAddressAddEdit);
