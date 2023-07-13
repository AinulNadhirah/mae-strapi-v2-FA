import moment from "moment";
import PropTypes from "prop-types";
import React, { useCallback, useState, useEffect } from "react";
import { View, StyleSheet, Image, Platform } from "react-native";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import RNFetchBlob from "rn-fetch-blob";

import { PdfViewSection } from "@screens/CommonScreens/PdfViewScreen";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderShareButton from "@components/Buttons/HeaderShareButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Dropdown from "@components/FormComponents/Dropdown";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import Typo from "@components/Text";
import { showInfoToast } from "@components/Toast";

import { getStatementListApi } from "@services";
import { GABanking } from "@services/analytics/analyticsBanking";

import { MEDIUM_GREY, WHITE } from "@constants/colors";
import { shortMonthNames } from "@constants/data";
import { STATEMENTS } from "@constants/strings";

import { formateAccountNumber } from "@utils/dataModel/utilityPartial.3";

import Assets from "@assets";

function ViewStatements({ route, navigation }) {
    const params = route?.params ?? {};
    const carddata = params?.data ?? {};
    const accountNumber = params.statementType === "card" ? carddata?.cardNo : carddata?.acctNo;
    const type = params.statementType === "card" ? carddata?.cardType : carddata?.acctType;
    const [loaded, setloaded] = useState(false);
    const [statementlist, setstatementlist] = useState([]);
    const [latestYear, setLatestYear] = useState(0);
    const [openMonthList, setOpenMonthList] = useState(false);
    const [openYearList, setOpenYearList] = useState(false);
    const [latestMonthList, setLatestMonthList] = useState([]);
    const [lastMonthList, setLastMonthList] = useState([]);
    const [curMonthList, setCurMonthList] = useState([]);
    const [curMonthScrollList, setCurrentMonthScrollList] = useState([]);
    const [yearScrollList, setYearScrollList] = useState([]);
    const [lastYear, setLastYear] = useState(0);
    const [monthList, setMonthList] = useState([]);
    const [yearList, setYearList] = useState([]);
    const [filteredYear, setFilteredYear] = useState(0);
    const [filteredMonth, setFilteredMonth] = useState("");
    const [selectedYearIndex, setSelectedYearIndex] = useState(0);
    const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
    const [curPdfUrl, setCurPdfUrl] = useState("");
    const [isPdfUrlEmpty, setIsPdfUrlEmpty] = useState(true);
    const [isStatementEmpty, setIsStatementEmpty] = useState();
    const [isPdfLoaded, setIsPdfLoaded] = useState();
    const [isPdfLoading, setIsPdfLoading] = useState();
    const [isShareDisabled, setIsShareDisabled] = useState(false);

    useEffect(() => {
        fetchStatementData();
        setMonthYearList();
    }, [fetchStatementData, setMonthYearList]);

    const fetchStatementData = useCallback(async () => {
        try {
            const suburl =
                "/banking/v1/summary/statement" +
                "?statementType=" +
                type +
                "&accountNo=" +
                accountNumber;

            const response = await getStatementListApi(suburl);
            if (response?.data) {
                const { responseCode, statementList, responseRemarks } = response?.data;
                if (responseCode === "0001") {
                    if (statementList && statementList.length) {
                        setIsStatementEmpty(false);
                        const stmtYear = statementList[0]?.statementYear;
                        setLatestYear(stmtYear);
                        setFilteredYear(stmtYear);
                        setFilteredMonth(
                            moment(
                                moment(
                                    statementList[0]?.statementDetailList[0]?.statementDate,
                                    "DD MMM YYYY"
                                ).month() + 1,
                                "M"
                            ).format("MMM")
                        );
                        setLastYear(statementList[statementList.length - 1]?.statementYear);

                        const currentYear = stmtYear;
                        const lastyear = statementList[statementList.length - 1]?.statementYear;
                        let yearArray = [];
                        for (let i = currentYear; i >= lastyear; i--) {
                            yearArray.push(i.toString());
                        }
                        setYearList(yearArray);

                        let curMonthArray = statementList[0]?.statementDetailList.map((item) =>
                            moment(
                                moment(item.statementDate, "DD MMM YYYY").month() + 1,
                                "M"
                            ).format("MMM")
                        );
                        curMonthArray = curMonthArray.reverse();
                        setLatestMonthList(curMonthArray);
                        setCurMonthList(curMonthArray);
                        let lastMonthArray = statementList[
                            statementList.length - 1
                        ]?.statementDetailList.map((item) =>
                            moment(
                                moment(item.statementDate, "DD MMM YYYY").month() + 1,
                                "M"
                            ).format("MMM")
                        );
                        lastMonthArray = lastMonthArray.reverse();
                        setLastMonthList(lastMonthArray);

                        setSelectedMonthIndex(curMonthArray.length - 1);
                        const latestPdfUrl =
                            statementList[0]?.statementDetailList[0]?.statementDownloadUrl;
                        setCurPdfUrl(latestPdfUrl);
                        setIsPdfLoading(true);
                        setIsPdfUrlEmpty(!(latestPdfUrl && latestPdfUrl.length));

                        const formatedStatements = statementList.map((section) => {
                            const title = moment(section.statementYear).format("YYYY");
                            const data = section.statementDetailList;
                            return {
                                title,
                                data,
                            };
                        });
                        setstatementlist(formatedStatements);
                        setloaded(true);
                    } else {
                        setloaded(true);
                        setIsStatementEmpty(true);
                        setIsPdfUrlEmpty(true);
                    }
                } else {
                    setloaded(true);
                    if (responseCode !== "0005") {
                        showInfoToast({
                            message: responseRemarks
                                ? "Sorry for the inconvenience, caused due to " + responseRemarks
                                : "This service is currently unavailable. Please try again later.",
                        });
                    }
                    setIsStatementEmpty(true);
                    setIsPdfUrlEmpty(true);
                }
            }
        } catch (error) {
            handleCatchBlock();
        }
    }, [accountNumber, type]);

    const handleCatchBlock = () => {
        setloaded(true);
        setIsStatementEmpty(true);
        setIsPdfUrlEmpty(true);
        showInfoToast({
            message: "This service is currently unavailable. Please try again later.",
        });
    };

    const setMonthYearList = useCallback(async () => {
        setMonthList(shortMonthNames);
    }, []);

    useEffect(() => {
        const monthScrollPickerData = curMonthList.map((item) => {
            return { name: item, value: item };
        });
        setCurrentMonthScrollList(monthScrollPickerData);
    }, [curMonthList]);

    useEffect(() => {
        const yearScrollPickerData = yearList.map((item) => {
            return { name: item, value: item };
        });
        setYearScrollList(yearScrollPickerData);
        if (yearList.length > 0) {
            const tabName = yearList[selectedYearIndex] + filteredMonth;
            GABanking.viewScreenViewStatement(tabName);
        }
    }, [yearList]);

    function onYearsTap() {
        setOpenYearList(true);
    }
    function onMonthsTap() {
        setOpenMonthList(true);
    }

    const goBack = useCallback(() => {
        console.log("[ViewStatements] >> [goBack]");
        navigation.goBack();
    }, [navigation]);

    const getFilteredPDF = useCallback(
        async (month, year) => {
            const filteredMonthYear = month + " " + year;
            let filteredStmtItem;

            statementlist.forEach((stmt) => {
                if (stmt.title === year) {
                    filteredStmtItem = stmt.data.find((item) =>
                        item.statementDate.includes(filteredMonthYear)
                    );
                }
            });

            const filteredStmtDate = filteredStmtItem.statementDate;

            const formattedDate = moment(filteredStmtDate, "DD MMM YYYY");
            const selectedDate = formattedDate.format("DD/MM/YYYY");
            const yearDate = formattedDate.year().toString();
            try {
                const suburl =
                    "/banking/v1/summary/statement" +
                    "?statementType=" +
                    type +
                    "&accountNo=" +
                    accountNumber +
                    "&statementDate=" +
                    selectedDate;

                // get selected statement
                const response = await getStatementListApi(suburl);

                if (response?.data) {
                    const { responseCode, statementList } = response?.data;
                    if (responseCode === "0001") {
                        if (statementList) {
                            const statement = statementList.filter((item) => {
                                return item.statementYear === yearDate;
                            });

                            const selectedStatement = statement[0]?.statementDetailList.filter(
                                (item) => {
                                    return item.statementDate.includes(filteredMonthYear);
                                }
                            );
                            const pdfFileURL = selectedStatement[0]?.statementDownloadUrl;
                            if (pdfFileURL !== curPdfUrl) {
                                setIsPdfLoading(true);
                            }
                            if (pdfFileURL && pdfFileURL.length) {
                                setCurPdfUrl(pdfFileURL);
                                setIsPdfUrlEmpty(false);
                            } else {
                                if (pdfFileURL !== "") {
                                    setCurPdfUrl("");
                                }
                                setIsPdfUrlEmpty(true);
                                showInfoToast({
                                    message:
                                        "This service is currently unavailable. Please try again later.",
                                });
                            }
                        }
                    } else {
                        setloaded(true);
                        setCurPdfUrl("");
                        setIsPdfUrlEmpty(true);
                        if (responseCode !== "0005") {
                            showInfoToast({
                                message:
                                    "This service is currently unavailable. Please try again later.",
                            });
                        }
                    }
                } else {
                    handleCatchBlock();
                }
            } catch (error) {
                console.log("ViewStatements [error]", error);
                handleCatchBlock();
            }
        },
        [accountNumber, type, statementlist]
    );

    function onMonthClose() {
        setOpenMonthList(false);
    }

    function onYearClose() {
        setOpenYearList(false);
    }

    const getMonthList = (value, startYear, endYear) => {
        let monList = [];
        if (value === startYear) {
            monList = latestMonthList;
        } else if (value === endYear) {
            monList = lastMonthList;
        } else {
            monList = monthList;
        }
        setCurMonthList(monList);
        setFilteredMonth(monList[monList.length - 1]);
    };

    function onMonthDone({ value }) {
        if (value) {
            setFilteredMonth(value);
            setSelectedMonthIndex(curMonthList.indexOf(value));
            getFilteredPDF(value, filteredYear);
            GABanking.selectActionFilterMonthYear(yearList[selectedYearIndex], value);
        }
        setOpenMonthList(false);
    }

    function onYearDone({ value }) {
        if (value) {
            setFilteredYear(value);
            setSelectedYearIndex(yearList.indexOf(value));
            getMonthList(value, latestYear, lastYear);
            getFilteredPDF(filteredMonth, value);
            GABanking.selectActionFilterMonthYear(value, filteredMonth);
        }
        setOpenYearList(false);
    }

    function onPdfLoad() {
        setIsPdfLoading(false);
        setIsPdfLoaded(true);
    }
    function onPdfError() {
        setIsPdfLoading(false);
        setIsPdfLoaded(false);
        showInfoToast({
            message: "This service is currently unavailable. Please try again later.",
        });
    }

    const StatementEmptyList = useCallback(() => {
        return (
            <View style={Style.emptyStateContainer}>
                <View style={Style.emptyStateTxtContainer}>
                    <View style={Style.emptyStateTitle}>
                        <Typo
                            text="Statement Unavailable"
                            fontSize={18}
                            lineHeight={32}
                            fontWeight="600"
                        />
                    </View>
                    <Typo
                        text="Nothing to see here. Come back later when there's something to show!"
                        fontSize={12}
                        lineHeight={18}
                    />
                </View>
                <View style={Style.emptyStateBgImgContainer}>
                    <Image
                        source={Assets.noTransactionIllustration}
                        style={Style.emptyImageView}
                        resizeMode="contain"
                    />
                </View>
            </View>
        );
    }, []);

    async function onShare() {
        setIsShareDisabled(true);
        if (curPdfUrl !== "") {
            try {
                let filePath = null;
                let acctLastDigit, stmtType, customFileName;
                if (params.statementType === "card") {
                    const cardType = accountNumber.substr(0, 1);
                    if (cardType === "3") {
                        acctLastDigit = formateAccountNumber(accountNumber, 15)
                            .replace(/\s/g, "")
                            .substr(11);
                    } else {
                        acctLastDigit = formateAccountNumber(accountNumber, 16)
                            .replace(/\s/g, "")
                            .substr(12);
                    }
                } else {
                    acctLastDigit = formateAccountNumber(accountNumber, 12)
                        .replace(/\s/g, "")
                        .substr(6);
                }

                if (type === "S") {
                    stmtType = "SA";
                } else if (type === "D") {
                    stmtType = "CA";
                } else {
                    stmtType = "Bill";
                }

                customFileName = `M2U ${stmtType} ${acctLastDigit} ${filteredMonth} ${filteredYear}`;

                const isPlatformIOS = Platform.OS === "ios";
                const configOptions = { fileCache: true };
                configOptions.path =
                    RNFetchBlob.fs.dirs.DocumentDir + "/" + customFileName + ".pdf";

                RNFetchBlob.config(configOptions)
                    .fetch("GET", curPdfUrl)
                    .then(async (resp) => {
                        filePath = resp.path();
                        return resp.readFile("base64");
                    })
                    .then(async (base64Data) => {
                        base64Data = `data:application/pdf;base64,` + base64Data;
                        const options = isPlatformIOS
                            ? {
                                  type: type,
                                  url: filePath,
                              }
                            : {
                                  type: type,
                                  filename: customFileName,
                                  url: base64Data,
                              };
                        await Share.open(options);
                        await RNFS.unlink(filePath);
                        GABanking.shareStatement(
                            yearList[selectedYearIndex] + filteredMonth,
                            filePath
                        );
                    })
                    .then(() => setIsShareDisabled(false))
                    .catch(() => setIsShareDisabled(false));
            } catch (error) {
                console.log("sharing error", error);
            }
        }
    }

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={!loaded}
        >
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={goBack} />}
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text={STATEMENTS}
                            />
                        }
                        headerRightElement={
                            !isStatementEmpty && (
                                <HeaderShareButton disabled={isShareDisabled} onPress={onShare} />
                            )
                        }
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                useSafeArea
            >
                {!isStatementEmpty && (
                    <View style={Style.dateCompInnerView}>
                        <Dropdown
                            value={yearList[selectedYearIndex]}
                            onPress={onYearsTap}
                            style={Style.dateCompYear}
                        />
                        <Dropdown
                            value={
                                filteredMonth ||
                                (filteredYear === latestYear ? latestMonthList[0] : monthList[0])
                            }
                            onPress={onMonthsTap}
                            style={Style.dateCompMonth}
                        />
                    </View>
                )}

                {isPdfLoading && (
                    <View style={Style.loaderContainer}>
                        <ScreenLoader showLoader={true} />
                    </View>
                )}

                {isStatementEmpty && <StatementEmptyList />}

                {!isPdfUrlEmpty && !isStatementEmpty && (
                    <View style={Style.pdfContainer}>
                        <PdfViewSection
                            type="url"
                            file={curPdfUrl}
                            onLoad={onPdfLoad}
                            onError={onPdfError}
                        />
                    </View>
                )}
            </ScreenLayout>
            <ScrollPickerView
                showMenu={openMonthList}
                list={curMonthScrollList}
                rightButtonText="Done"
                leftButtonText="Cancel"
                onLeftButtonPress={onMonthClose}
                onRightButtonPress={onMonthDone}
                selectedIndex={selectedMonthIndex}
            />
            <ScrollPickerView
                showMenu={openYearList}
                list={yearScrollList}
                rightButtonText="Done"
                leftButtonText="Cancel"
                onLeftButtonPress={onYearClose}
                onRightButtonPress={onYearDone}
                selectedIndex={selectedYearIndex}
            />
        </ScreenContainer>
    );
}

const Style = StyleSheet.create({
    dateCompInnerView: {
        backgroundColor: MEDIUM_GREY,
        flexDirection: "row",
        padding: 10,
    },
    dateCompMonth: {
        flex: 1,
        marginLeft: 10,
    },
    dateCompYear: {
        flex: 1,
    },
    emptyImageView: {
        flex: 1,
    },
    emptyStateBgImgContainer: {
        alignItems: "center",
        flex: 0.6,
    },
    emptyStateContainer: {
        backgroundColor: WHITE,
        flex: 1,
    },
    emptyStateTitle: {
        marginBottom: 8,
    },
    emptyStateTxtContainer: {
        flex: 0.4,
        marginHorizontal: 48,
        marginTop: 24,
    },
    loaderContainer: {
        height: "90%",
    },
    pdfContainer: {
        backgroundColor: MEDIUM_GREY,
        height: "90%",
        width: "100%",
    },
});

ViewStatements.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default ViewStatements;
