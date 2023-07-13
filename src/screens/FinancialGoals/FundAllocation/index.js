import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    View,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    VirtualizedList,
    Image,
    Animated,
    Easing,
} from "react-native";
import Collapsible from "react-native-collapsible";
import Modal from "react-native-modal";
import { PieChart } from "react-native-svg-charts";

import {
    BANKINGV2_MODULE,
    FINANCIAL_CUSTOM_PORTFOLIO,
    FUND_ALLOCATION,
    KICKSTART_EMAIL,
    UNIT_TRUST_OPENING_CONFIRMATION,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import { ErrorMessageV2 } from "@components/Common";
import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FundFactSheetURL from "@components/FinancialGoal/FundFactSheetURL";
import TitleAndDropdownPill from "@components/FinancialGoal/TitleAndDropdownPill";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import ScrollPicker from "@components/Pickers/ScrollPicker";
import Browser from "@components/Specials/Browser";
import Typo from "@components/Text";
import { showErrorToast, styles } from "@components/Toast";
import { TopMenu } from "@components/TopMenu";

import { useModelController } from "@context";

import {
    customerEligibilityCheck,
    getModelPortfolio,
    invokeL3,
    saveModelPortfolio,
} from "@services";
import { logEvent } from "@services/analytics";

import {
    MEDIUM_GREY,
    WHITE,
    BLACK,
    ROYAL_BLUE,
    YELLOW,
    MONEY_MARKET,
    MIXED_ASSET,
    FIXED_INCOME,
    EQUITY,
} from "@constants/colors";
import {
    INVEST_DISCLAIMER_HALF,
    INVEST_DISCLAIMER_FULL,
    READ_MORE,
    PORTFOLIO_COMPARE_PICK,
    PORTFOLIO,
    DISCLAIMERS,
    FUNDTYPE_TOOLTIP,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FIN_GOAL_OPEN_UTACCOUNT,
    FA_FIN_PORTFOLIO,
    UNIT_TRUST_EMPTY_TITLE,
    UNIT_TRUST_EMPTY_SUBTITLE,
    UNIT_TRUST_JOINT_ONLY_TITLE,
    UNIT_TRUST_JOINT_ONLY_SUBTITLE,
    COMMON_ERROR_MSG,
} from "@constants/strings";
import { FINANCIAL_GOAL_NOTICES } from "@constants/url";

import assets from "@assets";

import UnitTrustOpeningPopup from "../UnitTrustOpening/UnitTrustOpeningPopup";

const FundAllocation = ({ navigation, route }) => {
    const [readMore, setReadMore] = useState(false);
    const [showToolTip, setShowToolTip] = useState(false);
    const [states, setStates] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [customList, setCustomList] = useState(null);

    const [showEmptyUnitTrustPopup, setShowEmptyUnitTrustPopup] = useState(false);
    const [showJointUnitTrustPopup, setShowJointUnitTrustPopUp] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showBrowser, setShowBrowser] = useState(false);
    const browserUrl = useRef("");
    const browserTitle = useRef("");
    const { getModel } = useModelController();

    const [selectFundPortfolioDropdownMenus, setSelectFundPortfolioDropdownMenus] = useState(null);
    const [showSelectFundPicker, setShowSelectFundPicker] = useState(false);
    const [currentPickerSelectedIndex, setCurrentPickerSelectedIndex] = useState(null);
    const [dropdownMenus, setDropdownMenus] = useState(null);
    const [selectedFlexiFund, setSelectedFlexiFund] = useState(null);
    const isFlexiFundSelected = useRef(false); // whether fiexible retirement solution fund selected

    const menuArray = [
        {
            menuLabel: "Important note",
            menuParam: "importantNote",
        },
        {
            menuLabel: "Notices",
            menuParam: "notices",
        },
    ];

    useEffect(() => {
        fetchModelPortfolio();
    }, [fetchModelPortfolio]);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_PORTFOLIO,
        });
    }, []);

    const fetchModelPortfolio = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getModelPortfolio(
                route?.params?.goalType,
                route?.params?.timeHorizon,
                route?.params?.gbiRiskLevel,
                false
            );
            if (response?.data) {
                setIsLoading(false);
                const finalState = [];
                if (response?.data?.recommendedShariahList?.length > 0) {
                    const newState = {
                        title: "Islamic portfolio",
                        key: "recommendedShariahList",
                        subtitle: "Tailored Shariah-compliant portfolio",
                        selected: true,
                        mpCode: response?.data?.recommendedShariahList[0]?.mpCode,
                        data: { ...response?.data?.recommendedShariahList[0] },
                    };
                    finalState.push(newState);
                }
                if (response?.data?.recommendedConventionalList?.length > 0) {
                    const newState = {
                        title: "Conventional portfolio",
                        key: "recommendedConventionalList",
                        subtitle: "Tailored general portfolio",
                        selected: false,
                        mpCode: response?.data?.recommendedConventionalList[0]?.mpCode,
                        data: { ...response?.data?.recommendedConventionalList[0] },
                    };
                    finalState.push(newState);
                }
                if (response?.data?.supperList?.length > 0) {
                    const newState = {
                        title: "Flexible Retirement Solution",
                        key: "supperList",
                        subtitle:
                            "Alternatively, you may choose a fund from our selected affiliates",
                        selected: false,
                        mpCode: response?.data?.supperList[0]?.mpCode,
                        data: { ...response?.data?.supperList[0] },
                    };
                    setDropdownMenus(
                        response?.data?.supperList[0]?.productDetGroupDTOList[0]?.productDetDTOList
                    );
                    finalState.push(newState);
                }
                setStates(finalState);

                if (response?.data?.customList?.length > 0) {
                    setCustomList(response.data.customList[0]);
                }
            } else {
                setIsLoading(false);
                showErrorToast({ message: "Something is wrong. Try again later." });
            }
        } catch (error) {
            setIsLoading(false);
            showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
        }
    }, []);

    function renderSelectionItem({ item }) {
        return (
            <PortfolioSelectionItem
                title={item.title}
                keyIdentity={item.key}
                subtitle={item.subtitle}
                selected={item.selected}
                data={item.data}
                initialDepo={route?.params?.initialDeposit}
                monthlyInvest={route?.params?.monthlyDeposit}
                // eslint-disable-next-line react/jsx-no-bind
                onPress={() => selectItem(item, item?.key)}
                setShowSelectFundPicker={setShowSelectFundPicker}
                dropdownMenus={dropdownMenus}
                setSelectFundPortfolioDropdownMenus={setSelectFundPortfolioDropdownMenus}
                selectedFundText={selectedFlexiFund}
            />
        );
    }

    function onCloseToolTip() {
        setShowToolTip(false);
    }

    function selectItem(item, key) {
        const newState = [...states];
        for (let i = 0; i < states.length; i++) {
            if (states[i].title === item.title) {
                newState[i] = {
                    ...newState[i],
                    selected: true,
                };
                isFlexiFundSelected.current = key === "supperList";
            } else {
                newState[i] = {
                    ...newState[i],
                    selected: false,
                };
                isFlexiFundSelected.current = key === "supperList";
            }
        }

        setStates(newState);
    }

    function onPressBack() {
        navigation.goBack();
    }

    function _onReadMoreCallBack() {
        setReadMore(true);
    }

    function _onReadLessCallBack() {
        setReadMore(false);
    }

    function onPressBuildOwnPortfolio() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_CUSTOM_PORTFOLIO,
            params: {
                customList,
                initialDeposit: route?.params?.initialDeposit,
                monthlyDeposit: route?.params?.monthlyDeposit,
                goalId: route?.params?.goalId,
                goalType: route?.params?.goalType,
                gbiTargetAmt: route?.params?.gbiTargetAmt,
                clientRiskDate: route?.params?.clientRiskDate,
                gbiRiskLevel: route?.params?.gbiRiskLevel,
            },
        });
    }

    const invokePasswordAuthorization = async () => {
        try {
            const httpResp = await invokeL3(true);
            const result = httpResp.data;
            const { code } = result;
            if (code !== 0) {
                return;
            } else {
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: KICKSTART_EMAIL,
                    params: {
                        deposit: route?.params?.initialDeposit,
                        monthlyDeposit: route?.params?.monthlyDeposit,
                        ...route?.params,
                    },
                });
            }
        } catch (error) {
            if (error.status === "nonetwork") {
                this.props.navigation.goBack();
            }
        }
    };

    const saveFundAllocation = async (mpCodeSelected, productCodeAllocationList) => {
        try {
            setIsLoading(true);
            let response = "";

            if (!isFlexiFundSelected.current) {
                response = await saveModelPortfolio(
                    route?.params?.goalId,
                    mpCodeSelected,
                    true,
                    "",
                    true
                );
            } else {
                // flexible retirement solution
                response = await saveModelPortfolio(
                    route?.params?.goalId,
                    "",
                    false,
                    [productCodeAllocationList + "100"],
                    true
                );
            }

            setIsLoading(false);
            if (response?.data?.status === "SUCCESS") {
                invokePasswordAuthorization();
            } else {
                showErrorToast({ message: "Saving Failed" });
            }
        } catch (error) {
            setIsLoading(false);
            showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
        }
    };

    async function onPressInvest() {
        let mpCodeSelected = "";
        const productCodeAllocationList = currentPickerSelectedIndex;
        for (let i = 0; i < states.length; i++) {
            if (states[i].selected) {
                mpCodeSelected = states[i].mpCode;
            }
        }

        if (!selectedFlexiFund && isFlexiFundSelected.current) {
            showErrorToast({ message: "Please Select Fund" });
        } else {
            const { utAccount, isUTWithSingle, isUTWithOnlyJoint } = getModel("financialGoal");

            //call cust eligibile check for mias status
            let miasStatus = null;
            try {
                const response = await customerEligibilityCheck(null, true);
                if (response?.data) {
                    miasStatus = response?.data?.result?.miasStatus;
                }
            } catch (error) {
                showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
                return;
            }

            // mias status 001 means account created but not updated yet
            switch (true) {
                case !utAccount && !isUTWithSingle && miasStatus === "001":
                    showErrorToast({
                        message:
                            "We're still processing your Unit Trust account. This will take up to 24 hours. Kindly check again tomorrow to proceed with your goal creation.",
                    });
                    break;
                case utAccount && isUTWithSingle:
                    saveFundAllocation(mpCodeSelected, productCodeAllocationList);
                    break;
                case !isUTWithSingle && !isUTWithOnlyJoint:
                    promptEmptyUTPopup();
                    break;
                case isUTWithOnlyJoint:
                    promptJointUTPopup();
                    break;
                default:
                    break;
            }
        }
    }

    function promptEmptyUTPopup() {
        setShowEmptyUnitTrustPopup(true);

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_GOAL_OPEN_UTACCOUNT,
        });
    }

    function promptJointUTPopup() {
        setShowJointUnitTrustPopUp(true);

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_GOAL_OPEN_UTACCOUNT,
        });
    }

    function keyExtractor(item, index) {
        return `${item}-${index}`;
    }

    function onCloseUnitTrustPopup() {
        setShowEmptyUnitTrustPopup(false);
        setShowJointUnitTrustPopUp(false);
    }

    function onPressOpenAccount() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: UNIT_TRUST_OPENING_CONFIRMATION,
            params: {
                clientRiskDate: route?.params?.clientRiskDate,
                gbiRiskLevel: route?.params?.gbiRiskLevel,
                fromScreen: FUND_ALLOCATION,
                crossButtonScreen: FUND_ALLOCATION,
            },
        });

        setShowEmptyUnitTrustPopup(false);
        setShowJointUnitTrustPopUp(false);
    }

    function onPressThreeDot() {
        setShowMenu(true);
    }

    function onTopMenuCloseButtonPressed() {
        setShowMenu(false);
    }

    function handleTopMenuItemPress(item) {
        setShowMenu(false);
        switch (item) {
            case "importantNote":
                setShowToolTip(true);
                break;
            case "notices": {
                setShowBrowser(true);
                browserTitle.current = "Notices";
                browserUrl.current = FINANCIAL_GOAL_NOTICES;
                break;
            }
        }
    }

    function _onCloseBrowser() {
        setShowBrowser(false);
    }

    function onScrollPickerDoneButtonPressed(index) {
        setCurrentPickerSelectedIndex(index);
        setShowSelectFundPicker(false);
        setSelectedFlexiFund(
            selectFundPortfolioDropdownMenus.find((item) => item?.value === index)?.title
        );
    }

    function onScrollPickerCancelButtonPressed() {
        setShowSelectFundPicker(false);
    }

    return (
        <>
            <ScreenContainer>
                {isLoading ? (
                    <View style={Styles.loader}>
                        <ScreenLoader showLoader />
                    </View>
                ) : (
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={onPressBack} />}
                                headerCenterElement={
                                    <View>
                                        <View style={Styles.padding5}>
                                            <HeaderLabel>{PORTFOLIO}</HeaderLabel>
                                        </View>
                                    </View>
                                }
                                headerRightElement={
                                    <HeaderDotDotDotButton onPress={onPressThreeDot} />
                                }
                                backgroundColor={MEDIUM_GREY}
                            />
                        }
                        useSafeArea
                        paddingTop={0}
                        paddingHorizontal={0}
                        paddingBottom={0}
                    >
                        <FlatList
                            data={states}
                            style={Styles.flatListContainer}
                            renderItem={renderSelectionItem}
                            keyExtractor={keyExtractor}
                            // eslint-disable-next-line react/jsx-no-bind
                            listKey={(item, index) => `_key${index.toString()}`}
                            extraData={states.selected}
                            ListHeaderComponent={
                                <View>
                                    <Typo
                                        text={PORTFOLIO_COMPARE_PICK}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={28}
                                        textAlign="left"
                                    />
                                </View>
                            }
                            ListFooterComponent={
                                <View style={Styles.padding20}>
                                    <Disclaimer
                                        isReadMore={readMore}
                                        readMoreCallBack={_onReadMoreCallBack}
                                        readLessCallBack={_onReadLessCallBack}
                                    />
                                </View>
                            }
                            showsVerticalScrollIndicator={false}
                        />
                        <FixedActionContainer>
                            <View style={Styles.buttonContainer}>
                                <ActionButton
                                    fullWidth
                                    onPress={onPressInvest}
                                    backgroundColor={YELLOW}
                                    componentCenter={
                                        <Typo text="Invest Now" fontWeight="600" color={BLACK} />
                                    }
                                />
                                {customList && (
                                    <TouchableOpacity>
                                        <Typo
                                            text="Build My Own Portfolio"
                                            color={ROYAL_BLUE}
                                            fontWeight="600"
                                            fontSize={14}
                                            style={Styles.buildOwnPortfolio}
                                            onPress={onPressBuildOwnPortfolio}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </FixedActionContainer>
                    </ScreenLayout>
                )}
            </ScreenContainer>
            <ScrollPicker
                showPicker={showSelectFundPicker}
                items={selectFundPortfolioDropdownMenus ?? []}
                selectedIndex={currentPickerSelectedIndex}
                onDoneButtonPressed={onScrollPickerDoneButtonPressed}
                onCancelButtonPressed={onScrollPickerCancelButtonPressed}
                //fontSize={10}
            />
            <UnitTrustOpeningPopup
                visible={showEmptyUnitTrustPopup}
                title={UNIT_TRUST_EMPTY_TITLE}
                subtitle={UNIT_TRUST_EMPTY_SUBTITLE}
                onClose={onCloseUnitTrustPopup}
                onPressPrimaryButton={onPressOpenAccount}
            />
            <UnitTrustOpeningPopup
                visible={showJointUnitTrustPopup}
                title={UNIT_TRUST_JOINT_ONLY_TITLE}
                subtitle={UNIT_TRUST_JOINT_ONLY_SUBTITLE}
                onClose={onCloseUnitTrustPopup}
                onPressPrimaryButton={onPressOpenAccount}
            />
            <TopMenu
                showTopMenu={showMenu}
                onClose={onTopMenuCloseButtonPressed}
                menuArray={menuArray}
                onItemPress={handleTopMenuItemPress}
            />
            <Modal isVisible={showBrowser} hasBackdrop={false} useNativeDriver style={Styles.modal}>
                <Browser
                    source={{ uri: browserUrl.current }}
                    title={browserTitle.current}
                    onCloseButtonPressed={_onCloseBrowser}
                />
            </Modal>
            {showToolTip && (
                <ErrorMessageV2
                    title="Important Note"
                    description={FUNDTYPE_TOOLTIP}
                    onClose={onCloseToolTip}
                />
            )}
        </>
    );
};

FundAllocation.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    item: PropTypes.object,
};

const Disclaimer = ({ isReadMore, readMoreCallBack, readLessCallBack }) => {
    return (
        <View style={Styles.paddingBtm30}>
            <Typo
                text={DISCLAIMERS}
                fontSize={14}
                fontWeight="600"
                lineHeight={28}
                textAlign="left"
            />
            {!isReadMore && (
                <Typo
                    fontSize={12}
                    fontWeight="300"
                    textAlign="left"
                    lineHeight={18}
                    style={Styles.paddingBtm15}
                >
                    {INVEST_DISCLAIMER_HALF}
                    <TouchableOpacity onPress={readMoreCallBack}>
                        <Typo
                            text={" " + READ_MORE}
                            fontSize={12}
                            fontWeight="300"
                            textAlign="left"
                            style={Styles.readMore}
                        />
                    </TouchableOpacity>
                </Typo>
            )}
            {isReadMore && (
                <Typo
                    fontSize={12}
                    fontWeight="300"
                    textAlign="left"
                    lineHeight={18}
                    style={Styles.paddingBtm15}
                >
                    {INVEST_DISCLAIMER_FULL}
                    <TouchableOpacity onPress={readLessCallBack}>
                        <Typo
                            text=" Read Less"
                            fontSize={12}
                            fontWeight="300"
                            textAlign="left"
                            style={Styles.readMore}
                        />
                    </TouchableOpacity>
                </Typo>
            )}
        </View>
    );
};

Disclaimer.propTypes = {
    isReadMore: PropTypes.bool,
    readMoreCallBack: PropTypes.func,
    readLessCallBack: PropTypes.func,
};

const PortfolioSelectionItem = ({
    onPress,
    title,
    keyIdentity,
    subtitle,
    selected,
    data,
    initialDepo,
    monthlyInvest,
    setShowSelectFundPicker,
    dropdownMenus,
    setSelectFundPortfolioDropdownMenus,
    selectedFundText,
}) => {
    const [showMoreInfo, setShowMoreInfo] = useState(false);
    const productCatColorMap = [
        {
            type: "Equity",
            color: EQUITY,
        },
        {
            type: "Fixed Income",
            color: FIXED_INCOME,
        },
        {
            type: "Mixed Asset",
            color: MIXED_ASSET,
        },
        {
            type: "Money Market",
            color: MONEY_MARKET,
        },
        {
            type: "Others",
            color: BLACK,
        },
    ];
    const DATA = data.productDetGroupDTOList;
    const DATA_VIRTUALIZE_FINAL = [];
    const pieData = [];

    for (let b = 0; b < productCatColorMap.length; b++) {
        let assetTypeHaving = false;
        let assetHavingOthers = false;
        let assetTypeAllocationTotal = 0;
        for (let a = 0; a < data.productDetGroupDTOList.length; a++) {
            for (let c = 0; c < data.productDetGroupDTOList?.[a]?.productDetDTOList.length; c++) {
                if (productCatColorMap[b].type === data.productDetGroupDTOList[a].categoryName) {
                    assetTypeHaving = true;
                    assetTypeAllocationTotal += data.productDetGroupDTOList[a].allocation;
                }
                if (productCatColorMap[b].type === "Others") {
                    const categoryGroup = ["Equity", "Fixed Income", "Mixed Asset", "Money Market"];
                    if (!categoryGroup.includes(data?.productDetGroupDTOList[a].categoryName)) {
                        assetTypeAllocationTotal += data.productDetGroupDTOList[a].allocation;
                        assetHavingOthers = true;
                    }
                }
            }
        }

        if (assetTypeHaving || assetHavingOthers) {
            const dataList = {
                allocation: assetTypeAllocationTotal,
                categoryName: productCatColorMap[b].type,
            };
            DATA_VIRTUALIZE_FINAL.push(dataList);

            const pieChartList = {
                key: b,
                value: assetTypeAllocationTotal,
                svg: { fill: selectColor(productCatColorMap[b].type) },
            };
            pieData.push(pieChartList);
        }
    }

    const portfolioData = [];
    for (let i = 0; i < DATA.length; i++) {
        for (let j = 0; j < DATA?.[i]?.productDetDTOList.length; j++) {
            const dataList = {
                value: DATA[i].allocation,
                /*svg: { fill: selectColor(DATA[i]) },
                key: i,*/
                fundName: DATA?.[i]?.productDetDTOList[j].prodName,
                fundType: DATA?.[i]?.categoryName,
                factsheetUrl: DATA?.[i]?.productDetDTOList?.[j]?.factsheetUrl,
                prospectusUrl: DATA?.[i]?.productDetDTOList?.[j]?.prospectusUrl,
                highlightUrl: DATA?.[i]?.productDetDTOList?.[j]?.highlightUrl,
            };
            portfolioData.push(dataList);
        }
    }

    function selectColor(item) {
        let colorSelected = "";
        productCatColorMap.filter((colorMap) => {
            if (colorMap.type === item) {
                colorSelected = colorMap.color;
            }
        });
        return colorSelected;
    }

    function getItem(data, index) {
        return {
            categoryCode: data[index].categoryCode,
            categoryName: data[index].categoryName,
            allocation: Math.round(data[index].allocation * 100),
        };
    }

    function getItemCount(data) {
        return data.length;
    }

    function colorSelector(item) {
        const colorCode = productCatColorMap.filter((colorMap) => {
            if (colorMap.type === item.categoryName) {
                return colorMap.color;
            }
        });
        return colorCode?.[0]?.color;
    }

    function renderLabelValue({ item }) {
        return (
            <View style={Styles.paddingHzntl14}>
                <View style={[Styles.colorBullet, { backgroundColor: colorSelector(item) }]} />
                <Typo
                    text={`${item?.categoryName} - ${item?.allocation} %`}
                    fontSize={14}
                    fontWeight="400"
                    textAlign="left"
                    lineHeight={22}
                />
            </View>
        );
    }

    function onPressShowMore() {
        setShowMoreInfo(true);
    }
    function onPressShowLess() {
        setShowMoreInfo(false);
    }

    function renderPortfolioFundItem({ item }) {
        return (
            <FundInfoItem
                fundName={item.fundName}
                fundAllocation={item.value * 100}
                fundType={item.fundType}
                factsheetUrl={item.factsheetUrl}
                prospectusUrl={item.prospectusUrl}
                highlightUrl={item.highlightUrl}
            />
        );
    }

    function keyExtractor(item, index) {
        return `${item}-${index}`;
    }

    function listKeyExtrator(_, index) {
        return `_key${index.toString()}`;
    }

    function portFolioKeyExtractor(item, index) {
        return `${item}-${index}`;
    }

    function portFolioListKeyExtractor(_, index) {
        return `_key${index.toString()}`;
    }

    function onScrollPickerSelectButtonPressed() {
        const menus = dropdownMenus?.map((item) => {
            return {
                ...item,
                title: item?.prodDesc,
                value: item?.productId,
            };
        });
        setSelectFundPortfolioDropdownMenus(menus);
        setShowSelectFundPicker(true);
    }

    return (
        <TouchableOpacity style={Styles.itemContainer} onPress={onPress} activeOpacity={0.8}>
            <View style={Styles.outerContainer}>
                <View style={Styles.itemTextContainer}>
                    <Typo fontWeight="600" fontSize={14} textAlign="left" lineHeight={25}>
                        {title}
                    </Typo>
                    <Typo
                        fontWeight="400"
                        fontSize={14}
                        textAlign="left"
                        lineHeight={25}
                        style={Styles.subtitle}
                    >
                        {subtitle}
                    </Typo>
                </View>
                <View style={Styles.radioContainer}>
                    {selected ? (
                        <RadioChecked
                            style={Styles.radioButton}
                            paramLabelCls={Styles.radioBtnLabelCls}
                            paramContainerCls={Styles.radioBtnContainerStyle}
                            checkType="image"
                            imageSrc={assets.icRadioChecked}
                        />
                    ) : (
                        <RadioUnchecked
                            paramLabelCls={Styles.radioBtnLabelCls}
                            paramContainerCls={Styles.radioBtnContainerStyle}
                        />
                    )}
                </View>
            </View>
            <View style={Styles.fundCardContainer}>
                <View style={Styles.width60}>
                    <VirtualizedList
                        data={DATA_VIRTUALIZE_FINAL}
                        getItem={getItem}
                        renderItem={renderLabelValue}
                        keyExtractor={keyExtractor}
                        listKey={listKeyExtrator}
                        getItemCount={getItemCount}
                        scrollEnabled={false}
                    />
                </View>
                <View style={Styles.width40}>
                    {keyIdentity !== "supperList" && (
                        <PieChart
                            data={pieData}
                            style={Styles.pieChart}
                            innerRadius="80%"
                            padAngle={0}
                            // eslint-disable-next-line react/jsx-no-bind
                            sort={(a, b) => b.value + a.value}
                        />
                    )}
                </View>
            </View>
            <View style={Styles.depositContainer}>
                <View style={Styles.width60}>
                    <Typo
                        text="Initial Deposit"
                        fontWeight="400"
                        fontSize={14}
                        textAlign="left"
                        lineHeight={25}
                        style={Styles.subtitle}
                    />
                    <Typo
                        text="Monthly Investment"
                        fontWeight="400"
                        fontSize={14}
                        textAlign="left"
                        lineHeight={25}
                        style={Styles.subtitle}
                    />
                </View>
                <View style={Styles.width40}>
                    <Typo
                        text={`RM ${numeral(initialDepo).format("0,0.00")}`}
                        fontWeight="600"
                        fontSize={14}
                        textAlign="right"
                        lineHeight={25}
                        style={Styles.subtitle}
                    />
                    <Typo
                        text={`RM ${numeral(monthlyInvest).format("0,0.00")}`}
                        fontWeight="600"
                        fontSize={14}
                        textAlign="right"
                        lineHeight={25}
                        style={Styles.subtitle}
                    />
                </View>
            </View>
            {keyIdentity === "supperList" && (
                <View style={Styles.dropDownContainer}>
                    <TitleAndDropdownPill
                        dropdownTitle={selectedFundText ?? "Select Fund"}
                        dropdownOnPress={onScrollPickerSelectButtonPressed}
                    />
                </View>
            )}
            {!showMoreInfo ? (
                <View style={Styles.showFundInfo}>
                    <TouchableOpacity onPress={onPressShowMore}>
                        <Typo
                            text="Show more fund info"
                            fontSize={12}
                            fontWeight="600"
                            color={ROYAL_BLUE}
                            textAlign="left"
                        />
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <View style={Styles.showFundInfo}>
                        <TouchableOpacity onPress={onPressShowLess}>
                            <Typo
                                text="Show less fund info"
                                fontSize={12}
                                fontWeight="600"
                                color={ROYAL_BLUE}
                                textAlign="left"
                            />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={portfolioData}
                        renderItem={renderPortfolioFundItem}
                        keyExtractor={portFolioKeyExtractor}
                        listKey={portFolioListKeyExtractor}
                    />
                </>
            )}
        </TouchableOpacity>
    );
};

PortfolioSelectionItem.propTypes = {
    onPress: PropTypes.func,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    selected: PropTypes.bool,
    data: PropTypes.object,
    item: PropTypes.object,
    initialDepo: PropTypes.number,
    monthlyInvest: PropTypes.number,
    setShowSelectFundPicker: PropTypes.func,
    dropdownMenus: PropTypes.object,
    setSelectFundPortfolioDropdownMenus: PropTypes.func,
    selectedFundText: PropTypes.string,
    keyIdentity: PropTypes.string,
};

const FundInfoItem = ({
    fundName,
    fundAllocation,
    fundType,
    factsheetUrl,
    prospectusUrl,
    highlightUrl,
}) => {
    const [isViewMore, setIsViewMore] = useState(false);
    const animatedHeight = useRef(new Animated.Value(0)).current;

    function onPressViewMore() {
        setIsViewMore(!isViewMore);
        Animated.timing(animatedHeight, {
            duration: 200,
            toValue: isViewMore ? 0 : 1,
            useNativeDriver: true,
            easing: Easing.linear,
        }).start();
    }

    const factSheetData = [
        {
            title: "Prospectus",
            url: prospectusUrl,
        },
        {
            title: "Product Highlight sheet",
            url: highlightUrl,
        },
        {
            title: "Factsheet",
            url: factsheetUrl,
        },
    ];

    const filteredFactsheetData = factSheetData.filter((item) => item?.url !== null);

    function renderFactSheet({ item }) {
        return <FundFactSheetURL title={item.title} url={item.url} />;
    }

    function keyExtractor(item, index) {
        return `${item}-${index}`;
    }

    return (
        <View style={Styles.showFundInfo}>
            <TouchableOpacity onPress={onPressViewMore}>
                <View style={Styles.outerContainer}>
                    <View style={Styles.fundDropdown}>
                        <Typo
                            fontSize={14}
                            lineHeight={17}
                            textAlign="left"
                            text={fundName}
                            numberOfLines={isViewMore ? 0 : 2}
                        />
                    </View>
                    {isViewMore && (
                        <View style={Styles.dropDownImgContainer}>
                            <Image style={Styles.dropUpIcon} source={assets.dropUpIcon} />
                        </View>
                    )}
                    {!isViewMore && (
                        <View style={Styles.dropDownImgContainer}>
                            <Image style={Styles.dropDownIcon} source={assets.downArrow} />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
            <Animated.View
                // eslint-disable-next-line react-native/no-inline-styles
                style={{
                    overflow: "hidden",
                    opacity: animatedHeight,
                }}
            >
                <Collapsible collapsed={!isViewMore} duration={50} easing={Easing.linear}>
                    <View style={Styles.fundListOuterContainer}>
                        <View style={Styles.width30}>
                            <Typo
                                fontSize={12}
                                lineHeight={17}
                                textAlign="left"
                                text="Allocation"
                            />
                            <Typo
                                fontSize={12}
                                lineHeight={17}
                                fontWeight="600"
                                textAlign="left"
                                text={`${fundAllocation}%`}
                            />
                        </View>
                        <View style={Styles.width60}>
                            <Typo fontSize={12} lineHeight={17} textAlign="left" text="Fund Type" />
                            <Typo
                                fontSize={12}
                                lineHeight={17}
                                fontWeight="600"
                                textAlign="left"
                                text={fundType}
                            />
                        </View>
                    </View>
                    <FlatList
                        data={filteredFactsheetData}
                        renderItem={renderFactSheet}
                        keyExtractor={keyExtractor}
                    />
                </Collapsible>
            </Animated.View>
        </View>
    );
};

FundInfoItem.propTypes = {
    fundName: PropTypes.string,
    fundAllocation: PropTypes.number,
    fundType: PropTypes.string,
    factsheetUrl: PropTypes.string,
    prospectusUrl: PropTypes.string,
    highlightUrl: PropTypes.string,
    item: PropTypes.object,
};

const Styles = StyleSheet.create({
    buildOwnPortfolio: {
        paddingTop: 24,
    },
    buttonContainer: {
        flex: 1,
    },
    colorBullet: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
        alignSelf: "center",
    },
    depositContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 14,
    },
    dropDownContainer: {
        paddingHorizontal: 24,
    },
    dropDownIcon: {
        height: 14,
        marginLeft: 10,
        top: 0,
        width: 14,
    },
    dropDownImgContainer: {
        width: "10%",
    },
    dropUpIcon: {
        height: 14,
        marginLeft: 10,
        top: 4,
        width: 14,
    },
    flatListContainer: {
        flex: 1,
        paddingHorizontal: 24,
    },
    fundCardContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 20,
    },
    fundDropdown: {
        width: "90%",
    },
    fundListOuterContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 10,
    },
    itemContainer: {
        flex: 1,
        flexDirection: "column",
        marginTop: 16,
        paddingVertical: 20,
        backgroundColor: WHITE,
        borderRadius: 8,
        shadowOffset: {
            shadowColor: "rgba(0, 0, 0, 0.8)",
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.25,
    },
    itemTextContainer: {
        paddingLeft: 14,
        width: "90%",
    },
    loader: {
        alignSelf: "center",
        flex: 1,
        justifyContent: "center",
    },
    modal: {
        margin: 0,
    },
    outerContainer: { flexDirection: "row", justifyContent: "space-between" },
    padding20: { paddingTop: 20 },
    padding5: { paddingTop: 5 },
    paddingBtm15: { paddingBottom: 15 },
    paddingBtm30: { paddingBottom: 30 },
    paddingHzntl14: { flexDirection: "row", paddingHorizontal: 14 },
    pieChart: {
        height: 80,
    },
    radioBtnContainerStyle: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    radioBtnLabelCls: {
        color: BLACK,
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 20,
        paddingLeft: 10,
    },
    radioButton: {
        alignItems: "flex-start",
        marginRight: 8,
    },
    radioContainer: {
        width: "10%",
    },
    readMore: { textDecorationLine: "underline" },
    showFundInfo: {
        paddingHorizontal: 14,
        paddingTop: 15,
    },
    subtitle: {
        marginRight: 20,
    },
    width30: {
        width: "30%",
    },
    width40: {
        width: "40%",
    },
    width60: {
        width: "60%",
    },
});

export default FundAllocation;
