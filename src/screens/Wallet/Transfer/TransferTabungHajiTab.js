import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image } from "react-native";

import {
    FUNDTRANSFER_MODULE,
    TABUNG_HAJI_NEW_TRANSFER_OWN_TABUNGHAJI,
    TABUNG_HAJI_ENTER_AMOUNT,
} from "@navigation/navigationConstant";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast, showSuccessToast } from "@components/Toast";
import TransferTabItem from "@components/TransferTabItem";

import { useModelController } from "@context";

import { bankingGetDataMayaM2u } from "@services";
import { TabungHajiAnalytics } from "@services/analytics/analyticsTabungHaji";
import {
    getTabungHajiFavoriteList,
    getTabungHajiAccounts,
    checkTHDownTime,
} from "@services/apiServiceTabungHaji";

import {
    OWN_TH,
    OTHER_TH,
    TABUNG_HAJI,
    TABUNGHAJI_NO_ACCOUNT_LINK_HEADER,
    TABUNGHAJI_NO_ACCOUNT_LINK_SUBHEADER,
    SERVICE_UNAVAILABLE_TRY_AGAIN_LATER,
    TABUNGHAJI_SERVICE_UNAVAILABLE,
    COMMON_ERROR_MSG,
} from "@constants/strings";

import { addSpaceAfter4Chars } from "@utils/dataModel/utilityPartial.2";

import Assets from "@assets";

const NEW_TABUNGHAJI_TRANSFER = [
    {
        title: TABUNG_HAJI,
        imageSource: Assets.TABUNGHAJI,
        key: 1,
    },
];

function TransferTabungHajiTab({ navigation, index, activeTabIndex, route, toggleSearchMode }) {
    const { getModel } = useModelController();

    const [senderDetails, setSenderDetails] = useState({
        m2uUserId: "",
        mayaUserId: "",
        fullName: "",
        cus_name: "",
        username: "",
    });
    const [favouritesItems, setFavouritesItems] = useState([]);
    const [isLoadingFavouritesItems, setIsLoadingFavouritesItems] = useState(true);
    const [isFavouritesListSuccessfullyFetched, setIsFavouritesListSuccessfullyFetched] =
        useState(false);
    const [tabunghajiLinked, setTabunghajiLinked] = useState(true);
    const [maybankParams, setMaybankParams] = useState("");
    const [tabunghajiParams, setTabunghajiParams] = useState("");
    const [tabunghajiFlagDetails, setTabungHajiFlagDetails] = useState({
        isEnabled: true,
        isServiceDown: false,
        isDowntime: false,
        isLinkedNoData: false,
        downtimeDesc: "",
    });

    const isServiceValid =
        !tabunghajiFlagDetails?.isServiceDown &&
        !tabunghajiFlagDetails?.isDowntime &&
        tabunghajiFlagDetails?.isEnabled &&
        !tabunghajiFlagDetails?.isLinkedNoData;

    useEffect(() => {
        if (activeTabIndex === index) {
            syncRemoteDataToState();
            TabungHajiAnalytics.tabunghajiScreenLoaded();
        }
    }, [index]);

    useEffect(() => {
        if (route?.params?.tabunghajiTransferState?.isAlreadyInFavouriteList) {
            getTransferFavouriteList();
        }
    }, [route?.params?.tabunghajiTransferState?.isAlreadyInFavouriteList]);

    async function syncRemoteDataToState() {
        await getTHAccountItems();
        await getMBBAccountItems();
        retrieveLoggedInUserDetails();
        getTransferFavouriteList();
    }

    async function getTransferFavouriteList() {
        try {
            setIsLoadingFavouritesItems(true);
            const response = await getTabungHajiFavoriteList();
            const { code, result } = response?.data;

            if (result?.statusCode === "0000") {
                const favAccountList = result?.recurringRec ?? [];

                const favouritesArray = favAccountList.map((account, index) => ({
                    name: account?.thacctNickName ?? "",
                    image: { imageName: "tabunghajiTextLogo" },
                    description1: addSpaceAfter4Chars(account?.thacctNo ?? ""),
                    description2: TABUNG_HAJI,
                    icno: account?.icno ?? "",
                    tacFirstFalg: account?.tacFirstFalg ?? "",
                    key: index,
                    responseObject: {
                        ...account,
                    },
                }));

                setFavouritesItems(favouritesArray ?? []);
                setIsFavouritesListSuccessfullyFetched(true);
                setIsLoadingFavouritesItems(false);
            } else if (code === 400) {
                setIsLoadingFavouritesItems(false);
                showErrorToast({
                    message: result?.hostStatusDesc || COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            showErrorToast({
                message: error?.message || COMMON_ERROR_MSG,
            });
            setIsLoadingFavouritesItems(false);
        }
    }

    async function checkProductDowntime() {
        try {
            const request = await checkTHDownTime();
            const { flag, status, statusCode, description } = request?.data;
            if (request?.status === 200) {
                if (status === "0") {
                    setTabungHajiFlagDetails({
                        isServiceDown: true,
                        downtimeDesc: SERVICE_UNAVAILABLE_TRY_AGAIN_LATER,
                    });
                    showSuccessToast({
                        message: SERVICE_UNAVAILABLE_TRY_AGAIN_LATER,
                    });
                } else if (statusCode === "9999") {
                    setTabungHajiFlagDetails({
                        isDowntime: true,
                        downtimeDesc: description,
                    });
                    showInfoToast({
                        message: description,
                    });
                } else if (flag !== "Y") {
                    setTabungHajiFlagDetails({
                        isEnabled: false,
                        downtimeDesc: TABUNGHAJI_SERVICE_UNAVAILABLE,
                    });
                    showInfoToast({
                        message: TABUNGHAJI_SERVICE_UNAVAILABLE,
                    });
                }
            }
            return null;
        } catch (error) {
            showErrorToast({
                message: error?.message || COMMON_ERROR_MSG,
            });
        }
    }

    function handleTabungHajiDown() {
        if (tabunghajiFlagDetails?.isServiceDown) {
            showSuccessToast({
                message: tabunghajiFlagDetails?.downtimeDesc,
            });
        } else if (tabunghajiFlagDetails?.isLinkedNoData) {
            showErrorToast({
                message: tabunghajiFlagDetails?.downtimeDesc,
            });
        } else if (tabunghajiFlagDetails?.isDowntime || !tabunghajiFlagDetails?.isEnabled) {
            showInfoToast({
                message: tabunghajiFlagDetails?.downtimeDesc,
            });
        }
    }

    function handleNewTransferConfirmation() {
        if (isServiceValid) {
            TabungHajiAnalytics.newTransferTH();

            navigation.navigate(FUNDTRANSFER_MODULE, {
                screen: TABUNG_HAJI_NEW_TRANSFER_OWN_TABUNGHAJI,
                params: {
                    tabunghajiTransferState: {
                        senderName: senderDetails?.cus_name,
                        isNewTransfer: true,
                        favourite: false,
                    },
                    maybankParams,
                    tabunghajiParams,
                },
            });
        } else {
            handleTabungHajiDown();
        }
    }

    function handleFavouritesTransferItemPressed(selectedItemsIndex, selectedItem) {
        if (isServiceValid) {
            const selectedAccNo = selectedItem?.description1.replace(/\s/g, ""); // remove whitespace

            if (favouritesItems) {
                TabungHajiAnalytics.transferFav();
                navigation.navigate(FUNDTRANSFER_MODULE, {
                    screen: TABUNG_HAJI_ENTER_AMOUNT,
                    params: {
                        tabunghajiTransferState: {
                            bankName: TABUNG_HAJI,
                            fromAccount: {
                                id: OWN_TH,
                                name: TABUNG_HAJI,
                                senderName: senderDetails?.cus_name,
                                accNo: "",
                            },
                            toAccount: {
                                id: OTHER_TH,
                                receiverName: selectedItem?.name,
                                accNo: selectedAccNo,
                                accType: selectedItem?.description2,
                                primary: selectedItem?.beneficiaryFlag ?? "",
                                image: { imageName: selectedItem?.image },
                                icNo: selectedItem?.icno,
                                favFlag: selectedItem?.tacFirstFalg,
                            },
                            isNewTransfer: false,
                            favourite: true,
                        },
                        maybankParams,
                        tabunghajiParams,
                    },
                });
            }
        } else {
            handleTabungHajiDown();
        }
    }

    function retrieveLoggedInUserDetails() {
        const { m2uUserId, mayaUserId, fullName, cus_name, username } = getModel("user");

        setSenderDetails({
            m2uUserId,
            mayaUserId,
            fullName,
            cus_name,
            username,
        });
    }

    async function getMBBAccountItems() {
        try {
            checkProductDowntime();
            const path = `/summary?type=A&checkMae=true`;
            const response = await bankingGetDataMayaM2u(path, false);
            if (response?.status === 200) {
                setMaybankParams(response?.data?.result?.accountListings);
                return response;
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    async function getTHAccountItems() {
        try {
            const response = await getTabungHajiAccounts();
            const { status, statusDescription, tabungHajiAccounts } = response?.data;
            if (tabungHajiAccounts && tabungHajiAccounts?.length > 0) {
                setTabunghajiLinked(true);
                setTabunghajiParams(tabungHajiAccounts);
            } else {
                if (status === "SUCCESSFUL") {
                    setTabunghajiLinked(false);
                } else {
                    showErrorToast({
                        message: statusDescription,
                    });
                    setTabungHajiFlagDetails({
                        isLinkedNoData: true,
                        downtimeDesc: statusDescription,
                    });
                    setTabunghajiParams(tabungHajiAccounts);
                }
                return response;
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    return (
        <>
            {activeTabIndex === index && (
                <View style={Styles.container}>
                    {tabunghajiLinked ? (
                        <TransferTabItem
                            newTransferItems={NEW_TABUNGHAJI_TRANSFER}
                            favouritesItems={favouritesItems}
                            isLoadingFavouritesItems={isLoadingFavouritesItems}
                            isFavouritesListSuccessfullyFetched={
                                isFavouritesListSuccessfullyFetched
                            }
                            onNewTransferButtonPressed={handleNewTransferConfirmation}
                            onFavouritesItemPressed={handleFavouritesTransferItemPressed}
                            toggledSearchMode={toggleSearchMode}
                        />
                    ) : (
                        <View style={Styles.emptyStateContainer}>
                            <View style={Styles.emptyStateTextArea}>
                                <Typo
                                    text={TABUNGHAJI_NO_ACCOUNT_LINK_HEADER}
                                    fontSize={18}
                                    fontWeight="bold"
                                    lineHeight={32}
                                />
                                <SpaceFiller height={8} />
                                <Typo
                                    text={TABUNGHAJI_NO_ACCOUNT_LINK_SUBHEADER}
                                    fontSize={14}
                                    lineHeight={20}
                                />
                            </View>

                            <Image
                                style={Styles.emptyStateImage}
                                source={Assets.bankingEmptyStateIllustration}
                            />
                        </View>
                    )}
                </View>
            )}
        </>
    );
}

TransferTabungHajiTab.propTypes = {
    navigation: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    activeTabIndex: PropTypes.number.isRequired,
    route: PropTypes.object.isRequired,
    toggleSearchMode: PropTypes.func.isRequired,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
    resetModel: PropTypes.func,
};

const Styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: "space-between",
    },
    emptyStateImage: {
        height: 280,
        width: "100%",
    },
    emptyStateTextArea: {
        marginHorizontal: 36,
        marginTop: 35,
    },
});

export default TransferTabungHajiTab;
