import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image, ScrollView } from "react-native";

import { SETTINGS_MODULE } from "@navigation/navigationConstant";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { duitNowAutodebitList, senderDetails } from "@services";
import { RTPanalytics } from "@services/analytics/rtpAnalyticsSSL";

import { MEDIUM_GREY, YELLOW } from "@constants/colors";
import { idMapProxy } from "@constants/data/DuitNowRPP";
import * as Strings from "@constants/strings";

import Images from "@assets";

import DuitNowAutodebitCard from "./DuitNowAutodebitCard";

const DuitNowAutodebitList = ({ navigation, getModel, updateModel }) => {
    const [data, setData] = useState([]);
    const [arrayData, setArrayData] = useState([]);
    const [pageCurrent, setPage] = useState(1);
    const [recordsPerPage] = useState(10);
    const [nPages, setNpages] = useState(0);
    const [hasPermissionViewAutoDebitList, setHasPermissionViewAutoDebitList] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [orgnlMndtId, setOrgnlMndtId] = useState("");

    useEffect(() => {
        senderDetailCall();
        RTPanalytics.viewDNSettingsAutoDebit();
    }, []);

    function handleBack() {
        navigation.goBack();
    }

    async function getDuitNowFlagsAPI() {
        const permissionFlags = getModel("rpp")?.permissions;
        const { hasPermissionViewAutoDebitList } = permissionFlags || {};
        setHasPermissionViewAutoDebitList(hasPermissionViewAutoDebitList);
    }

    async function senderDetailCall() {
        try {
            setIsLoading(true);
            await getDuitNowFlagsAPI();
            const senderDetailsContext = getModel("rpp")?.senderDetails;
            //if senderDetails not in context initiate api call
            if (senderDetailsContext?.apiCalled === false) {
                const res = await senderDetails();
                const userIdResponse = res.data;
                if (
                    userIdResponse?.idType ||
                    userIdResponse?.newICNumber ||
                    userIdResponse?.sdrId
                ) {
                    updateModel({
                        rpp: {
                            senderDetails: {
                                data: userIdResponse,
                                apiCalled: true,
                            },
                        },
                    });
                    callListing(userIdResponse);
                }
            } else {
                callListing(senderDetailsContext?.data);
            }
        } catch (error) {
            // error when retrieving the data
            setIsLoading(false);
        }
    }

    async function callListing(userIdResponse) {
        const idType = idMapProxy?.find((item) => item.name === userIdResponse?.idType);
        const countryCode = userIdResponse?.idCountryCode;
        const idValue = userIdResponse?.newICNumber || userIdResponse?.sdrId;
        const checkPass = idType?.code === "03" ? idValue + countryCode : idValue;
        await getDuitNowAutodebitListAPI({
            debtorScndVal: checkPass,
            debtorScndType: idType?.code,
            orgnlMndtId,
        });
    }

    // DuitNowAutodebit Services API Call
    async function getDuitNowAutodebitListAPI(params) {
        try {
            let response = await duitNowAutodebitList(params);

            if (response?.data?.data) {
                let lastRespond =
                    response?.data?.data.length === 14
                        ? response?.data?.data?.[response?.data?.data?.length - 1]
                        : null;
                let moreConsentCheck = lastRespond ? lastRespond?.refs1 : null;

                let appendData = [...response.data.data];
                let secondLast = response?.data?.data;
                let newMndtId = secondLast?.[secondLast?.length - 1]?.consentId;

                while (moreConsentCheck === "More consent records available") {
                    const parameter = {
                        debtorScndVal: params.debtorScndVal,
                        debtorScndType: params.debtorScndType,
                        orgnlMndtId: newMndtId,
                    };
                    response = await duitNowAutodebitList(parameter);

                    lastRespond = response?.data?.data;
                    moreConsentCheck = lastRespond?.[lastRespond?.length - 1]?.refs1;

                    appendData = [...appendData, ...response.data.data];

                    secondLast = response?.data?.data;
                    newMndtId = secondLast?.[secondLast?.length - 1]?.consentId;
                }

                const temp = pageCurrent * recordsPerPage;
                const temp2 = temp - recordsPerPage;
                const accStatus = appendData.filter(
                    (item) =>
                        item?.consentSts === "ACTV" ||
                        item?.consentSts === "SUSP" ||
                        item?.consentSts === "SUSB"
                );
                setData(accStatus);
                setOrgnlMndtId(params?.debtorScndVal);
                setNpages(Math.ceil(accStatus.length / recordsPerPage));
                setArrayData(accStatus.slice(temp2, temp));
            }
        } catch (err) {
            showErrorToast({ message: err?.message || Strings.COMMON_ERROR_MSG });
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    }

    function selectAccontTap(item) {
        navigation.navigate(SETTINGS_MODULE, {
            screen: "DuitNowAutoDebitDetails",
            params: {
                transferParams: {
                    item,
                },
            },
        });
    }

    function handleNextPage() {
        if (pageCurrent !== nPages) {
            const temp = (pageCurrent + 1) * recordsPerPage;
            const temp2 = temp - recordsPerPage;

            setPage(pageCurrent + 1);
            setArrayData(data.slice(temp2, temp));
        }
    }

    function handlePreviousPage() {
        if (pageCurrent !== 1) {
            const temp = (pageCurrent - 1) * recordsPerPage;
            const temp2 = temp - recordsPerPage;

            setPage(pageCurrent - 1);
            setArrayData(data.slice(temp2, temp));
        }
    }
    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={isLoading}
        >
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                header={
                    <HeaderLayout
                        backgroundColor={YELLOW}
                        headerCenterElement={
                            <Typo
                                text={Strings.DUITNOW_AUTODEBIT_LIST}
                                fontWeight="600"
                                fontSize={16}
                                lineHeight={19}
                            />
                        }
                        headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                    />
                }
                useSafeArea
            >
                {!!arrayData?.length && hasPermissionViewAutoDebitList ? (
                    <ScrollView
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                    >
                        <DuitNowAutodebitCard items={arrayData} onPress={selectAccontTap} />
                    </ScrollView>
                ) : (
                    <>
                        <View style={styles.emptyListView}>
                            <Typo
                                text={Strings.DUITNOW_AUTODEBIT_LIST_TITLE}
                                fontWeight="600"
                                fontStyle="normal"
                                adjustsFontSizeToFit
                                fontSize={19}
                                lineHeight={28}
                                textAlign="left"
                                style={styles.linkAccountText2}
                            />
                            <Typo
                                text={Strings.DUITNOW_AUTODEBIT_LIST_BODY}
                                fontWeight="300"
                                fontStyle="normal"
                                adjustsFontSizeToFit
                                fontSize={11}
                                lineHeight={20}
                                textAlign="center"
                                style={styles.linkAccountText2}
                            />
                        </View>
                    </>
                )}
            </ScreenLayout>
            {data?.length > recordsPerPage - 1 && hasPermissionViewAutoDebitList && (
                <View style={styles.headerStyle}>
                    <View style={styles.padding}>
                        <TouchableOpacity onPress={handlePreviousPage}>
                            <Image
                                style={styles.chevronButtonRight}
                                source={Images.icChevronLeft24Black}
                            />
                        </TouchableOpacity>
                    </View>
                    <Text>
                        {pageCurrent} of {nPages}
                    </Text>
                    <View style={styles.padding}>
                        <TouchableOpacity onPress={handleNextPage}>
                            <Image
                                style={styles.chevronButton}
                                source={Images.icChevronRight24Black}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </ScreenContainer>
    );
};

DuitNowAutodebitList.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
};
const styles = StyleSheet.create({
    chevronButton: {
        height: 24,
        width: 24,
    },
    chevronButtonRight: {
        height: 24,
        width: 24,
    },
    emptyListView: {
        alignContent: "center",
        alignItems: "center",
        display: "flex",
        flex: 1,
        justifyContent: "center",
        margin: "auto",
    },
    headerStyle: {
        alignItems: "center",
        flexDirection: "row",
        height: 20,
        justifyContent: "space-around",
        marginBottom: 20,
        marginTop: 20,
    },
    linkAccountText2: {
        marginLeft: 5,
        marginRight: 5,
        marginTop: 20,
    },
});
export default withModelContext(DuitNowAutodebitList);
