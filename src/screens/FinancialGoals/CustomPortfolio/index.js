import PropTypes from "prop-types";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { ScrollView, View, Image, StyleSheet, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";

import {
    BANKINGV2_MODULE,
    DASHBOARD_STACK,
    FINANCIAL_CUSTOM_PORTFOLIO,
    KICKSTART_EMAIL,
    UNIT_TRUST_OPENING_CONFIRMATION,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import { ErrorMessageV2 } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import ScrollPicker from "@components/Pickers/ScrollPicker";
import Browser from "@components/Specials/Browser";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";
import { TopMenu } from "@components/TopMenu";

import { useModelController } from "@context";

import { customerEligibilityCheck, invokeL3, saveModelPortfolio } from "@services";
import { logEvent } from "@services/analytics";

import { BLACK, DISABLED, DISABLED_TEXT, MEDIUM_GREY, ROYAL_BLUE, YELLOW } from "@constants/colors";
import {
    DISCLAIMERS,
    FA_FIN_BUILD_OWN_PORTFOLIO,
    FA_FIN_GOAL_OPEN_UTACCOUNT,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FUNDTYPE_TOOLTIP,
    PORTFOLIO,
    INVEST_DISCLAIMER_HALF,
    INVEST_DISCLAIMER_FULL,
    COMMON_ERROR_MSG,
} from "@constants/strings";

import { numberWithCommas } from "@utils/dataModel/utilityPartial.3";

import assets from "@assets";

import UnitTrustOpeningPopup from "../UnitTrustOpening/UnitTrustOpeningPopup";

const CustomPortfolio = ({ navigation, route }) => {
    const customFundList = route?.params?.customList?.productDetGroupDTOList;

    const [buttonEnabled, setButtonEnabled] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [currentOptions, setCurrentOptions] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState(
        customFundList?.map(() => {
            return {};
        })
    );
    const [currentFund, setCurrentFund] = useState(null);
    const [expandDisclaimer, setExpandDisclaimer] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showBrowser, setShowBrowser] = useState(false);
    const [showToolTip, setShowToolTip] = useState(false);
    const [showEmptyUnitTrustPopup, setShowEmptyUnitTrustPopup] = useState(false);
    const [showJointUnitTrustPopup, setShowJointUnitTrustPopup] = useState(false);
    const { getModel } = useModelController();

    const browserUrl = useRef("");
    const browserTitle = useRef("");

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
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_BUILD_OWN_PORTFOLIO,
        });
    }, []);

    function onPressBack() {
        navigation.goBack();
    }

    function onFundSelectPress(options, index) {
        const list = options.map((item) => {
            return {
                title: item?.prodName,
                value: item?.prodCode,
            };
        });
        setShowPicker(!showPicker);
        setCurrentFund(index);
        setCurrentOptions(list);
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
            // this.setState({ showLoaderModal: false });
            if (error.status === "nonetwork") {
                this.props.navigation.goBack();
            }
        }
    };

    const saveFundAllocation = async () => {
        const productCodeAllocationList = [];
        for (let i = 0; i < selectedOptions.length; i++) {
            if (selectedOptions[i].selected) {
                productCodeAllocationList.push(
                    selectedOptions[i].selected + selectedOptions[i].allocation
                );
            }
        }
        try {
            const response = await saveModelPortfolio(
                route?.params?.goalId,
                "",
                false,
                productCodeAllocationList,
                false
            );
            if (response?.data?.status === "SUCCESS") {
                invokePasswordAuthorization();
            } else {
                showErrorToast({ message: "Saving Failed" });
            }
        } catch (error) {
            showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
        }
    };

    async function onPressInvest() {
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
                saveFundAllocation();
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

    function promptEmptyUTPopup() {
        setShowEmptyUnitTrustPopup(true);

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_GOAL_OPEN_UTACCOUNT,
        });
    }

    function promptJointUTPopup() {
        setShowJointUnitTrustPopup(true);

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_GOAL_OPEN_UTACCOUNT,
        });
    }

    function onCloseUnitTrustPopup() {
        setShowEmptyUnitTrustPopup(false);
        setShowJointUnitTrustPopup(false);
    }

    function onPressOpenAccount() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: UNIT_TRUST_OPENING_CONFIRMATION,
            params: {
                clientRiskDate: route?.params?.clientRiskDate,
                gbiRiskLevel: route?.params?.gbiRiskLevel,
                fromScreen: FINANCIAL_CUSTOM_PORTFOLIO,
                crossButtonScreen: FINANCIAL_CUSTOM_PORTFOLIO,
            },
        });

        setShowEmptyUnitTrustPopup(false);
        setShowJointUnitTrustPopup(false);
    }

    function onScrollPickerDoneButtonPressed(prodCode) {
        setShowPicker(false);
        const selected = selectedOptions.map((item, selectedIndex) => {
            if (selectedIndex === currentFund) {
                return {
                    selected: prodCode,
                    allocation: customFundList?.[selectedIndex]?.allocation * 100,
                };
            } else {
                return item;
            }
        });
        setSelectedOptions(selected);
        const notSelected = selected.find((item) => Object.keys(item).length === 0);
        setButtonEnabled(!notSelected);
    }

    function onScrollPickerCancelButtonPressed() {
        setShowPicker(false);
    }

    const getSelected = useCallback(
        (index) => {
            return customFundList?.[index]?.productDetDTOList?.find(
                (item) => item.prodCode === selectedOptions?.[index]?.selected
            )?.prodName;
        },
        [customFundList, selectedOptions]
    );

    const getSelectedItem = (index) => {
        return customFundList?.[index]?.productDetDTOList?.find(
            (item) => item.prodCode === selectedOptions?.[index]?.selected
        );
    };

    function onPressExpandDisclaimer() {
        setExpandDisclaimer(true);
    }

    function onPressCollapseDisclaimer() {
        setExpandDisclaimer(false);
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
                browserUrl.current =
                    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/wealth/financialgoals_notices.pdf";
                break;
            }
        }
    }

    function _onCloseBrowser() {
        setShowBrowser(false);
    }

    function onCloseToolTip() {
        setShowToolTip(false);
    }

    return (
        <>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onPressBack} />}
                            headerRightElement={<HeaderDotDotDotButton onPress={onPressThreeDot} />}
                            headerCenterElement={<HeaderLabel>{PORTFOLIO}</HeaderLabel>}
                        />
                    }
                    useSafeArea
                    paddingTop={0}
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <ScrollView style={styles.container}>
                        <Typo
                            text="Customise your portfolio according to your preferences"
                            fontWeight="600"
                            fontSize={16}
                            lineHeight={22}
                            textAlign="left"
                        />
                        <View style={styles.info}>
                            <LabelValue
                                label="Initial Deposit"
                                value={`RM ${numberWithCommas(
                                    Number(route?.params?.initialDeposit).toFixed(2)
                                )}`}
                            />
                            <LabelValue
                                label="Monthly Investment"
                                value={`RM ${numberWithCommas(
                                    Number(route?.params?.monthlyDeposit).toFixed(2)
                                )}`}
                            />
                        </View>
                        {customFundList && (
                            <Typo
                                text="Select fund you prefer"
                                fontSize={14}
                                fontWeight="400"
                                textAlign="left"
                            />
                        )}
                        {customFundList &&
                            customFundList.map((item, index) => {
                                return (
                                    <FundSelectionItem
                                        key={index}
                                        itemIndex={index}
                                        placeholderText="Select fund"
                                        onPress={onFundSelectPress}
                                        allocation={`${item?.allocation * 100}%`}
                                        fundType={item?.categoryName}
                                        items={item?.productDetDTOList}
                                        navigation={navigation}
                                        selected={getSelected(index)}
                                        selectedItem={getSelectedItem(index)}
                                    />
                                );
                            })}
                        <Typo
                            text={DISCLAIMERS}
                            fontSize={14}
                            fontWeight="600"
                            textAlign="left"
                            style={styles.disclaimerTitle}
                        />
                        <Typo
                            // text={
                            //     !expandDisclaimer ? INVEST_DISCLAIMER_HALF : INVEST_DISCLAIMER_FULL
                            // }
                            fontSize={12}
                            fontWeight="400"
                            textAlign="left"
                            color="#ADADAD"
                            numberOfLines={expandDisclaimer ? null : 3}
                            style={styles.disclaimer}
                        >
                            {!expandDisclaimer ? INVEST_DISCLAIMER_HALF : INVEST_DISCLAIMER_FULL}
                            <TouchableOpacity
                                style={styles.disclaimerReadMore}
                                onPress={
                                    !expandDisclaimer
                                        ? onPressExpandDisclaimer
                                        : onPressCollapseDisclaimer
                                }
                            >
                                <Typo
                                    text={`${!expandDisclaimer ? "Read more" : "Read less"}`}
                                    fontWeight="400"
                                    textAlign="right"
                                    color="#ADADAD"
                                    fontSize={12}
                                    style={styles.disclaimerReadMoreText}
                                />
                            </TouchableOpacity>
                        </Typo>
                    </ScrollView>
                    <FixedActionContainer>
                        <View style={styles.buttonContainer}>
                            <ActionButton
                                fullWidth
                                onPress={onPressInvest}
                                disabled={!buttonEnabled}
                                backgroundColor={buttonEnabled ? YELLOW : DISABLED}
                                componentCenter={
                                    <Typo
                                        text="Invest Now"
                                        fontWeight="600"
                                        fontSize={14}
                                        color={buttonEnabled ? BLACK : DISABLED_TEXT}
                                    />
                                }
                            />
                            <TouchableOpacity>
                                <Typo
                                    text="View Suggested Portfolio"
                                    color={ROYAL_BLUE}
                                    fontWeight="600"
                                    fontSize={14}
                                    style={styles.viewPortfolio}
                                    onPress={onPressBack}
                                />
                            </TouchableOpacity>
                        </View>
                    </FixedActionContainer>
                </ScreenLayout>
            </ScreenContainer>
            <ScrollPicker
                showPicker={showPicker}
                items={currentOptions}
                selectedIndex={selectedOptions}
                onDoneButtonPressed={onScrollPickerDoneButtonPressed}
                onCancelButtonPressed={onScrollPickerCancelButtonPressed}
            />
            <UnitTrustOpeningPopup
                visible={showEmptyUnitTrustPopup}
                title="We noticed you dont have a Unit Trust account yet with us."
                subtitle="To create your first goal, you will first need to open a unit trust account."
                onClose={onCloseUnitTrustPopup}
                onPressPrimaryButton={onPressOpenAccount}
            />
            <UnitTrustOpeningPopup
                visible={showJointUnitTrustPopup}
                title="We noticed that you already have an existing joint unit trust account."
                subtitle="To proceed with this goal, you will need to open a single unit trust account."
                onClose={onCloseUnitTrustPopup}
                onPressPrimaryButton={onPressOpenAccount}
            />
            <TopMenu
                showTopMenu={showMenu}
                onClose={onTopMenuCloseButtonPressed}
                menuArray={menuArray}
                onItemPress={handleTopMenuItemPress}
            />
            <Modal isVisible={showBrowser} hasBackdrop={false} useNativeDriver style={styles.modal}>
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

CustomPortfolio.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const LabelValue = ({ label, value }) => {
    return (
        <View style={styles.labelValueContainer}>
            <Typo text={label} fontSize={14} fontWeight="400" />
            <Typo text={value} fontSize={14} fontWeight="600" />
        </View>
    );
};

LabelValue.propTypes = {
    label: PropTypes.string,
    value: PropTypes.number,
};

const FundSelectionItem = ({
    placeholderText,
    itemIndex,
    fundType,
    allocation,
    items,
    onPress,
    selected,
    navigation,
    selectedItem,
}) => {
    const [expand, setExpand] = useState(false);

    function onPressExpand() {
        setExpand(!expand);
    }

    const _navigateToPDFViewer = ({ url, title }) => {
        navigation.navigate(DASHBOARD_STACK, {
            screen: "ExternalUrl",
            params: {
                url,
                title,
            },
        });
    };

    function onPressProductHighlight() {
        _navigateToPDFViewer({
            url: selectedItem?.highlightUrl,
            title: "Product Highlight sheet",
        });
    }

    function onPressProspectus() {
        _navigateToPDFViewer({ url: selectedItem?.prospectusUrl, title: "Prospectus" });
    }

    function onPressFactsheet() {
        _navigateToPDFViewer({ url: selectedItem?.factsheetUrl, title: "Factsheet" });
    }

    const Details = ({ title, value }) => {
        return (
            <View style={styles.detailsContainer}>
                <Typo
                    text={title}
                    fontSize={10}
                    fontWeight="400"
                    textAlign="left"
                    lineHeight={20}
                />
                <Typo
                    text={value}
                    fontSize={14}
                    fontWeight="600"
                    textAlign="left"
                    lineHeight={20}
                />
            </View>
        );
    };

    Details.propTypes = {
        title: PropTypes.string,
        value: PropTypes.string,
    };

    const BlueText = ({ text, onPress }) => {
        return (
            <Typo
                text={text}
                color={ROYAL_BLUE}
                fontSize={12}
                fontWeight="600"
                textAlign="left"
                onPress={onPress}
                style={styles.blueText}
            />
        );
    };

    BlueText.propTypes = {
        text: PropTypes.string,
    };

    function onPressFund() {
        onPress(items, itemIndex);
    }
    return (
        <View style={styles.fundSelectionContainer}>
            <ActionButton
                fullWidth
                backgroundColor="#ffffff"
                borderWidth={1}
                borderColor="#cfcfcf"
                componentLeft={
                    <View style={styles.selectionContainer}>
                        <Typo
                            text={selected || placeholderText}
                            fontSize={14}
                            lineHeight={18}
                            fontWeight="600"
                        />
                    </View>
                }
                componentRight={
                    <View style={styles.chevronContainer}>
                        <Image source={assets.downArrow} style={styles.chevronDownImage} />
                    </View>
                }
                onPress={onPressFund}
            />
            <View style={styles.fundDetailsContainer}>
                {!!selected && (
                    <BlueText
                        text={expand ? "Show less fund info" : "Show more fund info"}
                        onPress={onPressExpand}
                    />
                )}
                <View style={styles.allocationFundContainer}>
                    <Details title="Allocation" value={allocation} />
                    <Details title="Fund Type" value={fundType} />
                </View>
                {expand && selectedItem?.prospectusUrl && (
                    <BlueText text="Prospectus" onPress={onPressProspectus} />
                )}
                {expand && selectedItem?.highlightUrl && (
                    <BlueText text="Product Highlight sheet" onPress={onPressProductHighlight} />
                )}
                {expand && selectedItem?.factsheetUrl && (
                    <BlueText text="Factsheet" onPress={onPressFactsheet} />
                )}
            </View>
        </View>
    );
};

FundSelectionItem.propTypes = {
    placeholderText: PropTypes.string,
    options: PropTypes.array,
    fundType: PropTypes.string,
    allocation: PropTypes.string,
    onPress: PropTypes.func,
    selected: PropTypes.string,
    navigation: PropTypes.object,
    items: PropTypes.array,
    itemIndex: PropTypes.number,
    selectedItem: PropTypes.object,
};

const styles = StyleSheet.create({
    allocationFundContainer: {
        flexDirection: "row",
    },
    blueText: {
        paddingTop: 10,
    },
    buttonContainer: {
        flex: 1,
    },
    chevronContainer: {
        marginRight: 24,
    },
    chevronDownImage: { height: 8, width: 16 },
    container: {
        marginBottom: 20,
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    detailsContainer: {
        paddingTop: 15,
        width: "50%",
    },
    disclaimer: {
        paddingBottom: 30,
    },
    disclaimerReadMore: {
        alignSelf: "flex-end",
        marginTop: -2,
    },
    disclaimerReadMoreText: {
        backgroundColor: MEDIUM_GREY,
        textDecorationLine: "underline",
    },
    disclaimerTitle: {
        paddingBottom: 8,
        paddingTop: 50,
    },
    fundDetailsContainer: {
        paddingLeft: 25,
    },
    fundSelectionContainer: {
        paddingTop: 24,
    },
    info: {
        paddingBottom: 35,
        paddingTop: 24,
    },
    labelValueContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 12,
    },
    modal: {
        margin: 0,
    },
    selectionContainer: {
        marginLeft: 24,
        maxWidth: "85%",
    },
    viewPortfolio: {
        paddingTop: 24,
    },
});

export default CustomPortfolio;
