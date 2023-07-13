// @ts-check
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Alert,
    Dimensions,
    FlatList,
    ImageBackground,
    PermissionsAndroid,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import Contacts from "react-native-contacts";
import Permissions from "react-native-permissions";
import { useSafeArea } from "react-native-safe-area-context";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderRefreshButton from "@components/Buttons/HeaderRefreshButton";
import CacheeImageWithDefault from "@components/CacheeImageWithDefault";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { contactsSync, newContactsSync } from "@services";
import { logEvent } from "@services/analytics";

import {
    BLACK,
    LIGHT_BLACK,
    LIGHT_YELLOW,
    MEDIUM_GREY,
    ROYAL_BLUE,
    WHITE,
    YELLOW,
} from "@constants/colors";
import {
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    NO_RESULT_FOUND,
    OTHER_CONTACTS,
    RECENT_CONTACTS,
    WE_COULDNT_FIND_ANY_ITEMS_MATCHING,
    FA_SENDREQUEST_SENDMONEY_SELECTCONTACT,
    FA_SENDREQUEST_REQUESTMONEY_SELECTCONTACT,
} from "@constants/strings";

import { arraySearchByObjProp, sortByPropName } from "@utils/array";
import { isMalaysianMobileNum } from "@utils/dataModel";
import { convertMayaMobileFormat, formatMobileNumber } from "@utils/dataModel/utility";
import { dateToMilliseconds } from "@utils/time";
import useFestive from "@utils/useFestive";

import SearchInput from "../SearchInput";
import ContactItem from "./ContactItem";

export const { width, height } = Dimensions.get("window");

// TODO: filter, center error data not found
// TODO: diff phoneNumber and formattedPhoneNumber

function Item({
    item,
    index,
    selectedContact,
    onSelect,
    onViewAllRecentContact,
    isMultipleSelection,
    onDoneEvent,
}) {
    const {
        name,
        phoneNumbers,
        phoneNumber,
        formatedPhoneNumber,
        isSyncedThroughMaya,
        mayaUserId,
        id,
        suffix,
        mayaUserName,
        profilePicUrl,
        thumbnailPath,
    } = item;

    if (item?.section) {
        return (
            <View style={styles.sectionContainer}>
                <Typo
                    fontSize={16}
                    fontWeight="600"
                    lineHeight={18}
                    textAlign="left"
                    text={item?.section}
                />
                {item?.isViewAllNeeded && (
                    <TouchableOpacity onPress={onViewAllRecentContact}>
                        <Typo
                            color={ROYAL_BLUE}
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                            text="View All"
                        />
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    return (
        <ContactItem
            name={name}
            suffix={suffix}
            onContactPress={onSelect}
            phoneNumbers={phoneNumbers}
            phoneNumber={phoneNumber}
            formatedPhoneNumber={formatedPhoneNumber}
            isSyncedThroughMaya={isSyncedThroughMaya}
            isSelected={
                selectedContact.find((tempItem) => tempItem.phoneNumber === item.phoneNumber)
                    ? true
                    : false
            }
            mayaUserId={mayaUserId}
            mayaUserName={mayaUserName}
            profilePicUrl={profilePicUrl}
            thumbnailPath={thumbnailPath}
            key={index}
            itemIndex={index}
            id={id}
            isMultipleSelection={isMultipleSelection}
            onDoneEvent={onDoneEvent}
        />
    );
}

Item.propTypes = {
    index: PropTypes.any,
    item: PropTypes.object,
    onSelect: PropTypes.any,
    onViewAllRecentContact: PropTypes.any,
    selectedContact: PropTypes.array,
    isMultipleSelection: PropTypes.bool,
    onDoneEvent: PropTypes.any,
};

// Header
const Header = ({ onBackTap, onRefreshTap, title, hasWhiteText }) => {
    return (
        <HeaderLayout
            horizontalPaddingMode="custom"
            horizontalPaddingCustomLeftValue={16}
            horizontalPaddingCustomRightValue={22}
            headerLeftElement={<HeaderBackButton onPress={onBackTap} isWhite={hasWhiteText} />}
            headerRightElement={
                <HeaderRefreshButton
                    width={22}
                    height={22}
                    onPress={onRefreshTap}
                    isWhite={hasWhiteText}
                />
            }
            headerCenterElement={
                <Typo
                    fontSize={16}
                    fontWeight="600"
                    lineHeight={19}
                    text={title}
                    color={hasWhiteText ? WHITE : BLACK}
                />
            }
        />
    );
};

Header.propTypes = {
    onBackTap: PropTypes.any,
    onRefreshTap: PropTypes.any,
    title: PropTypes.any,
    hasWhiteText: PropTypes.bool,
};

// Bottom View Class
const BottomView = ({ bottomInfo, onDoneEvent, buttonLabel, isButtonEnabled }) => {
    const safeArea = useSafeArea();
    return (
        <View style={styles.containerFooter(safeArea)}>
            <Typo
                fontSize={14}
                fontWeight="bold"
                letterSpacing={0}
                lineHeight={18}
                textAlign="left"
                text={bottomInfo}
            />
            <ActionButton
                backgroundColor={isButtonEnabled ? YELLOW : LIGHT_YELLOW}
                onPress={onDoneEvent}
                width={108}
                height={40}
                borderRadius={20}
                componentCenter={
                    <Typo
                        text={buttonLabel}
                        fontSize={14}
                        fontWeight="bold"
                        color={isButtonEnabled ? BLACK : LIGHT_BLACK}
                    />
                }
                disabled={!isButtonEnabled}
            />
        </View>
    );
};

BottomView.propTypes = {
    bottomInfo: PropTypes.any,
    buttonLabel: PropTypes.any,
    isButtonEnabled: PropTypes.any,
    onDoneEvent: PropTypes.any,
};
// No Data View Class
const NoDataView = ({
    title = NO_RESULT_FOUND,
    description = WE_COULDNT_FIND_ANY_ITEMS_MATCHING,
}) => {
    return (
        <View style={styles.noDataViewCls}>
            <Typo fontSize={18} fontWeight="bold" lineHeight={32} text={title} />

            <Typo
                fontWeight="200"
                lineHeight={20}
                style={styles.noDataViewSubTextCls}
                text={description}
            />
        </View>
    );
};

NoDataView.propTypes = {
    description: PropTypes.any,
    title: PropTypes.any,
};

const ContactPicker = ({
    title,
    buttonLabel,
    selectedContact,
    bottomInfo,
    filter,
    onSelect,
    onListUpdate,
    onDoneEvent,
    onBackPress,
    onRefresh,
    getModel,
    updateModel,
    hideHeader,
    callSync,
    userMobileNumber,
    onNoPermission,
    resetSearchText,
    festiveFlag,
    festiveImage,
    hasWhiteText,
    isMultipleSelection,
    sendAndRequestFlag,
    logEventFunc,
}) => {
    const MAX_ITEMS_RECENT_CONTACT = 3;
    const MAX_ITEMS_ALL_RECENT_CONTACT = 10;
    // TODO: use one setState only
    const [syncedContact, setSyncedContact] = useState([]);
    const [searchText, setSearchText] = useState("");
    const isPermissionCheck = useRef(false);
    const isRefresh = useRef(false);
    const [showViewAllRecentContacts, setShowViewAllRecentContact] = useState(false);
    // SearchInput Event
    const [showSearchInput, setShowSearchInput] = useState(false);

    // Used to initiate sync call from parent components
    useEffect(() => {
        console.log("useEffect >> callSync: ", callSync, " | resetSearchText: ", resetSearchText);
        logEventFunc();
        if (callSync) onRefreshTap();

        // Reset Search State
        if (resetSearchText) {
            setSearchText("");
            setShowSearchInput(false);
        }
    }, [callSync, onRefreshTap, resetSearchText]);

    function keyExtractor(item, index) {
        return `${item?.id}-${index}`;
    }

    const reloadContact = useCallback(() => {
        console.log("reloadContact", isPermissionCheck.current);
        if (!isPermissionCheck.current) {
            if (Platform.OS != "ios") {
                getAndroidPermission();
            } else {
                getIOSPermission();
            }
            isPermissionCheck.current = true;
        }

        setSyncedContact([...syncedContact]);

        if (onListUpdate) onListUpdate({ totalContacts: syncedContact.length });
    }, [getAndroidPermission, getIOSPermission, onListUpdate, syncedContact]);

    // =================
    // EVENTS
    // =================

    // Header event
    const onRefreshTap = useCallback(() => {
        console.log("onRefreshTap");
        isRefresh.current = true;
        onRefresh();
        setSyncedContact([]);
        isPermissionCheck.current = false;
        setSearchText("");
        setShowSearchInput(false);
        reloadContact();
    }, [onRefresh, reloadContact]);

    // SearchInput Event
    function doSearchToogle() {
        if (showSearchInput) setSearchText("");
        setShowSearchInput(!showSearchInput);
    }

    // SearchInput Event
    function onSearchTextChange(val) {
        setSearchText(val);
    }
    // =================
    // FUNCTIONS
    // =================

    // STEP-1: CHECK & MANAGE PERMISSION
    const getIOSPermission = useCallback(async () => {
        console.log("[ContactPicker] >> [getIOSPermission]");

        const permissionResult = await Permissions.request("contacts");

        if (
            permissionResult == "denied" ||
            permissionResult == "undetermined" ||
            permissionResult == "restricted"
        ) {
            onNoPermission();
        } else {
            getContact();
        }
    }, [getContact, onNoPermission]);

    const getAndroidPermission = useCallback(async () => {
        console.log("[ContactPicker] >> [getAndroidPermission]");

        const granted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_CONTACTS
        );
        console.log("ContactPicker:getAndroidPermission:granted:", granted);
        if (!granted) {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
                {
                    title: "MAYA App read Contact Permission",
                    message: "MAYA App needs access to read your Contact " + "",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK",
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("Permission granted");
                getContact();
            } else {
                console.log("Permission denied");
            }
        } else {
            console.log("PROCEED");
            getContact();
        }
    }, [getContact]);

    // STEP 2 - GET CONTACT
    const getContact = useCallback(() => {
        console.log("[ContactPicker] >> [getContact]");

        // get from context
        let contacts = getModel("contacts", isRefresh.current);
        if (contacts.syncedContacts.length == 0 || isRefresh.current) {
            isRefresh.current = false;
            getContactFromNative();
        } else {
            setSyncedContact(contacts.syncedContacts);
        }
    }, [getContactFromNative, getModel]);

    const getContactFromNative = useCallback(() => {
        console.log("[ContactPicker] >> [getContactFromNative]");

        Contacts.getAll(async (err, contacts) => {
            if (err === "denied") {
                Alert.alert(
                    "ERROR",
                    "Please allow permission to read contacts on your device and try again.",
                    [
                        {
                            text: "Ok",
                        },
                    ],
                    { cancelable: false }
                );
            } else {
                let { contactNumArray, localMassageData } = massageBeforeSync(contacts);

                // userContactSync(newList);
                await syncContactAPICall(contactNumArray, localMassageData);
            }
        });
    }, [massageBeforeSync, syncContactAPICall]);

    const massageBeforeSync = useCallback(
        (contacts = []) => {
            console.log("[ContactPicker] >> [massageBeforeSync]");

            let newContacts = [];
            let contactNumArray = [];
            let tempPhonNumObj = {};
            const userMayaFormatNum = convertMayaMobileFormat(userMobileNumber);

            contacts.forEach((item) => {
                let { givenName, familyName, middleName, suffix, phoneNumbers } = item;

                phoneNumbers.forEach((contact) => {
                    const { number } = contact;
                    const name = `${item.givenName}${item.middleName ? " " + item.middleName : ""}${
                        item.familyName ? " " + item.familyName : ""
                    }${item.suffix ? " " + item.suffix : ""}`;

                    // Remove all special characters, alphabets and spaces
                    const cleanedupNo = number.replace(/[^0-9]/gi, "");

                    // Check for valid Malaysian number
                    if (!isMalaysianMobileNum(cleanedupNo)) return;

                    // Check to avoid duplicate numbers
                    if (Object.prototype.hasOwnProperty.call(tempPhonNumObj, cleanedupNo)) return;

                    const mayaFormatNum = convertMayaMobileFormat(cleanedupNo);

                    // Skip if it matches logged in users number
                    if (mayaFormatNum == userMayaFormatNum) return;

                    const contactNumber = convertMayaMobileFormat(cleanedupNo);

                    const contactRec = {
                        ...contact,
                        number: contactNumber,
                    };

                    item = {
                        givenName,
                        familyName,
                        middleName,
                        suffix,
                        phoneNumbers: [contactRec],
                        name: name.trim(),
                        formatedPhoneNumber: formatMobileNumber(mayaFormatNum),
                        phoneNumber: mayaFormatNum,
                        isSyncedThroughMaya: false,
                    };

                    // Used for storing locally
                    newContacts.push(item);

                    // Used to send in sync API request
                    contactNumArray.push(contactNumber);

                    // Used to avoid duplicate records
                    tempPhonNumObj[cleanedupNo] = true;
                });
            });

            // return newContacts;
            return { contactNumArray, localMassageData: newContacts };
        },
        [userMobileNumber]
    );

    // STEP 3 - SYNC CONTACT
    const syncContactAPICall = useCallback(
        async (contactNumArray, localMassageData) => {
            const data = {
                type: sendAndRequestFlag,
                phoneNumbers: contactNumArray,
            };
            const syncContactAPI = sendAndRequestFlag
                ? await newContactsSync(data)
                : await contactsSync(contactNumArray);

            try {
                const response = syncContactAPI;
                console.log("[ContactPicker][syncContactAPICall] >> Response: ", response?.data);

                const newSyncedContact = massageAfterSync(response?.data ?? [], localMassageData);
                updateModel({
                    contacts: {
                        syncedContacts: [...newSyncedContact],
                    },
                });

                setSyncedContact(newSyncedContact);
            } catch (err) {
                console.log("[ContactPicker][syncContactAPICall] >> Exception: ", err);

                // For Exception, assign local massaged data to contact list
                updateModel({
                    contacts: {
                        syncedContacts: localMassageData,
                    },
                });
                setSyncedContact(localMassageData);
            }
        },
        [massageAfterSync, updateModel]
    );

    const massageAfterSync = useCallback(
        (contacts, localMassageData) => {
            console.log("[ContactPicker] >> [massageAfterSync]");

            const newSyncedContact = massageContactsData(contacts, localMassageData);

            if (onListUpdate) onListUpdate({ totalContacts: newSyncedContact.length });

            return newSyncedContact;
        },
        [onListUpdate]
    );

    const massageContactsData = (contacts, localMassageData) => {
        console.log("[ContactPicker] >> [massageContactsData]");

        // Empty check
        if (!contacts || !(contacts instanceof Array) || !contacts.length) {
            return localMassageData;
        }

        // Convert array to JSON
        let contactsObj = {};
        contacts.forEach((item) => {
            if (item?.number) contactsObj[item.number] = item;
        });

        // Iterate over local data and update synced Maya users
        return localMassageData.map((contactRecord) => {
            const { phoneNumber } = contactRecord;

            if (Object.prototype.hasOwnProperty.call(contactsObj, phoneNumber)) {
                return {
                    ...contactRecord,
                    ...contactsObj[phoneNumber],
                    isSyncedThroughMaya: true,
                };
            } else {
                return {
                    ...contactRecord,
                    type: "other",
                };
            }
        });
    };

    function filterContactByType(list, filterBy) {
        return list.filter((item) => {
            return item.type === filterBy;
        });
    }

    function sortRecentContact(list) {
        return list.sort(
            (a, b) => dateToMilliseconds(b.transactionDate) - dateToMilliseconds(a.transactionDate)
        );
    }

    const listFilter = (array, filterType) => {
        let finalList = [];
        const filteredList = array.filter((item) => {
            if (filterType === "maya") {
                return item.isSyncedThroughMaya;
            } else {
                return true;
            }
        });

        if (sendAndRequestFlag) {
            const recentContactList = filterContactByType(filteredList, "recent");
            const recentContactListSorted = sortRecentContact(recentContactList);

            const otherContactList = filterContactByType(filteredList, "other");

            //other section combine with recent contact
            const sortAllContacts = sortByPropName(
                [...recentContactList, ...otherContactList],
                "name"
            );

            //show only 3 recent contacts
            const recentContactItem = [
                ...(otherContactList.length
                    ? [
                          {
                              section: RECENT_CONTACTS,
                              isViewAllNeeded:
                                  recentContactList &&
                                  recentContactList.length > MAX_ITEMS_RECENT_CONTACT,
                          },
                      ]
                    : []),
                ...recentContactListSorted.slice(0, MAX_ITEMS_RECENT_CONTACT),
            ];

            const otherContactItem = [
                ...(recentContactList.length ? [{ section: OTHER_CONTACTS }] : []),
                ...sortAllContacts,
            ];

            finalList = [
                ...(recentContactList.length ? recentContactItem : []),
                ...(otherContactList.length ? otherContactItem : []),
            ];
        } else {
            finalList = sortByPropName([...filteredList], "name");
        }

        return finalList;
    };

    function onPressViewAllContacts() {
        setShowViewAllRecentContact(true);
    }

    function onBackPressViewAllContacts() {
        setShowViewAllRecentContact(false);
    }

    const onDoneHandler = () => {
        onDoneEvent();
        setSearchText("");
        setShowSearchInput(false);
    };

    // =================
    // UI RENDER
    // =================
    function getKey(item) {
        return `${item.index}`;
    }

    function renderItem(props) {
        return (
            <Item
                {...props}
                key={getKey(props)}
                onSelect={onSelect}
                selectedContact={selectedContact}
                onViewAllRecentContact={onPressViewAllContacts}
                isMultipleSelection={isMultipleSelection}
                onDoneEvent={onDoneEvent}
            />
        );
    }

    const ViewAllContactPage = () => {
        const recentContactList = sortRecentContact(filterContactByType(syncedContact, "recent"));
        const data = recentContactList.slice(0, MAX_ITEMS_ALL_RECENT_CONTACT);

        return (
            <View style={styles.fullView}>
                <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                    <ScreenLayout
                        paddingHorizontal={0}
                        paddingBottom={0}
                        paddingTop={0}
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text={RECENT_CONTACTS}
                                    />
                                }
                                headerLeftElement={
                                    <HeaderBackButton onPress={onBackPressViewAllContacts} />
                                }
                            />
                        }
                    >
                        <FlatList
                            data={data}
                            keyExtractor={keyExtractor}
                            renderItem={renderItem}
                            maxToRenderPerBatch={1000}
                            windowSize={30}
                            updateCellsBatchingPeriod={1}
                            initialNumToRender={data.length}
                        />
                    </ScreenLayout>
                </ScreenContainer>
            </View>
        );
    };
    const data = listFilter(arraySearchByObjProp(syncedContact, searchText, ["name"]), filter);
    const { festiveAssets } = useFestive();
    return (
        <View style={styles.fullView}>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <>
                    {festiveFlag && (
                        <CacheeImageWithDefault
                            resizeMode={Platform.OS === "ios" ? "stretch" : "cover"}
                            style={styles.imageBG}
                            image={festiveAssets?.greetingSend.topContainer}
                        />
                    )}
                    <ScreenLayout
                        paddingHorizontal={0}
                        paddingBottom={0}
                        header={
                            hideHeader ? (
                                <React.Fragment />
                            ) : (
                                <Header
                                    onBackTap={onBackPress}
                                    onRefreshTap={onRefreshTap}
                                    hasWhiteText={hasWhiteText}
                                    title={title}
                                />
                            )
                        }
                    >
                        <View style={styles.outerViewCls}>
                            {/* Search Component */}
                            <View style={styles.searchViewCls}>
                                <SearchInput
                                    doSearchToogle={doSearchToogle}
                                    showSearchInput={showSearchInput}
                                    onSearchTextChange={onSearchTextChange}
                                />
                            </View>

                            {/* Contact List */}
                            <View style={styles.contactListViewCls}>
                                <FlatList
                                    data={data}
                                    keyExtractor={keyExtractor}
                                    renderItem={renderItem}
                                    maxToRenderPerBatch={1000}
                                    windowSize={30}
                                    updateCellsBatchingPeriod={1}
                                    initialNumToRender={data.length}
                                    ListEmptyComponent={!!searchText && <NoDataView />}
                                />
                            </View>

                            {/* Bottom docked bar */}
                            {isMultipleSelection && (
                                <BottomView
                                    bottomInfo={bottomInfo}
                                    onDoneEvent={onDoneHandler}
                                    buttonLabel={buttonLabel}
                                    isButtonEnabled={selectedContact.length > 0}
                                />
                            )}
                        </View>
                    </ScreenLayout>
                </>
            </ScreenContainer>
            {showViewAllRecentContacts && <ViewAllContactPage />}
        </View>
    );
};

const styles = StyleSheet.create({
    contactListViewCls: {
        flex: 1,
        paddingTop: 16,
    },

    containerFooter: (inset) => ({
        alignItems: "center",
        backgroundColor: WHITE,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 18,
        paddingHorizontal: 24,
        paddingBottom: inset.bottom ? inset.bottom : 18,
    }),

    fullView: {
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },

    imageBG: {
        flex: 1,
        height: 375,
        position: "absolute",
        width: "100%",
    },

    noDataViewCls: {
        marginHorizontal: 24,
        marginTop: 24,
    },

    noDataViewSubTextCls: {
        marginTop: 8,
    },
    outerViewCls: {
        flex: 1,
        flexDirection: "column",
    },
    searchViewCls: {
        paddingHorizontal: 24,
    },
    sectionContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
});

ContactPicker.propTypes = {
    bottomInfo: PropTypes.string,
    buttonLabel: PropTypes.string,
    callSync: PropTypes.bool,
    festiveFlag: PropTypes.bool,
    festiveImage: PropTypes.object,
    filter: PropTypes.string,
    getModel: PropTypes.func,
    hideHeader: PropTypes.bool,
    onBackPress: PropTypes.func,
    onDoneEvent: PropTypes.func,
    onListUpdate: PropTypes.func,
    onNoPermission: PropTypes.func,
    onRefresh: PropTypes.func,
    onSelect: PropTypes.func,
    resetSearchText: PropTypes.bool,
    selectedContact: PropTypes.array.isRequired,
    title: PropTypes.string,
    updateModel: PropTypes.func,
    userMobileNumber: PropTypes.string,
    isMultipleSelection: PropTypes.bool,
    sendAndRequestFlag: PropTypes.bool,
    logEventFunc: PropTypes.func,
};

ContactPicker.defaultProps = {
    filter: "all",
    title: "Select Contact",
    buttonLabel: "Done",
    selectedContact: [],
    bottomInfo: "",
    hideHeader: false,
    callSync: false,
    resetSearchText: false,
    userMobileNumber: "",
    festiveFlag: false,
    isMultipleSelection: true,
    sendAndRequestFlag: null,
    festiveImage: {},
    onSelect: () => {},
    onDoneEvent: () => {},
    onBackPress: () => {},
    onRefresh: () => {},
    onListUpdate: () => {},
    onNoPermission: () => {},
    logEventFunc: () => {},
};

export default withModelContext(ContactPicker);
