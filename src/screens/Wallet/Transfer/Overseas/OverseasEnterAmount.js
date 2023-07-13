import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, ScrollView, TouchableOpacity, Image, Platform } from "react-native";

import {
    FUNDTRANSFER_MODULE,
    TRANSFER_TAB_SCREEN,
    BANKINGV2_MODULE,
    ACCOUNT_DETAILS_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import BorderedAvatar from "@components/Avatars/BorderedAvatar";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import ScrollPicker from "@components/Pickers/ScrollPicker";
import TextInputWithLengthCheck from "@components/TextInputWithLengthCheck";
import Typo from "@components/TextWithInfo";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { getRateInquiry } from "@services";
import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import {
    BLACK,
    DARK_GREY,
    DISABLED,
    DISABLED_TEXT,
    FADE_SELECT_GREY,
    MEDIUM_GREY,
    OFF_WHITE,
    PINKISH_GREY,
    YELLOW,
} from "@constants/colors";
import {
    COMMON_ERROR_MSG,
    CONTINUE,
    CURRENCY_NOT_ELIGIBLE,
    ENTER_AMOUNT,
    OVERSEAS_TRANSFER_HEADER,
    WE_FACING_SOME_ISSUE,
    DROPDOWN_DEFAULT_TEXT,
} from "@constants/strings";

import { getImage } from "@utils/dataModel/utilityRemittance";

import assets from "@assets";

class OverseasEnterAmount extends Component {
    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
        const favTransferItem = this.props.route?.params?.transferParams?.favTransferItem;
        const { selectedCountry } = this.props.getModel("overseasTransfers");
        const defaultCurrencyObj = { title: "RM", value: "MYR" };
        const currencyList =
            favTransferItem?.productType === "Bakong"
                ? selectedCountry?.currencyList?.filter((curr) => {
                      return curr?.title !== "EUR";
                  })
                : favTransferItem?.productType === "RT"
                ? selectedCountry?.currencyList?.filter((curr) => {
                      return curr?.title !== "EUR" && curr?.title !== "USD";
                  })
                : selectedCountry?.currencyList;
        this.state = {
            amount: "",
            // loader: false,
            showLocalError: false,
            showLocalErrorMessage: "",
            errorMessage: "",
            amountValue: 0,
            primaryCurrencyList: currencyList?.length
                ? [defaultCurrencyObj, ...currencyList]
                : [defaultCurrencyObj],
            secondaryCurrencyList: currencyList?.length ? [...currencyList] : [],
            selectedPrimaryCurrency: defaultCurrencyObj,
            selectedSecondaryCurrency: {},
            // displayCurrencyList: {},
            selectingPrimary: false,
            showScrollPicker: false,
            scrollPickerData: currencyList?.length ? [...currencyList] : [],
            showKeyboard: true,
            buttonDisabled: true,
        };
    }

    /***
     * componentDidMount
     * Update Screen date
     */
    componentDidMount() {
        this.init();
    }

    init = () => {
        RemittanceAnalytics.amountSelectionLoaded();
        this.setState({
            showLocalError: false,
            showKeyboard: false,
        });
    };

    /***
     * doneClick
     * on Done Button Click
     */
    doneClick = async () => {
        this.setState(
            {
                showLocalError: false,
                showKeyboard: false,
            },
            this.checkButtonDisabled()
        );
    };

    /***
     * changeText
     * change Text update state after formatting
     */
    changeText = (val) => {
        const value = val ? parseInt(val, 10) : 0;

        if (value > 0) {
            const formatted = this.numberWithCommas(value);
            this.setState({
                amount: formatted,
                amountValue: value,
                showLocalError: false,
            });
        } else {
            this.setState({
                amount: "",
                amountValue: value,
                showLocalError: false,
            });
        }
    };

    /***
     * numberWithCommas
     * formate amount with comma
     */
    numberWithCommas = (val) => {
        const text = JSON.stringify(val);
        let x = "0.00";
        if (text) {
            let resStr = "";
            if (text.length === 1) {
                resStr =
                    text.substring(0, text.length - 2) + "0.0" + text.substring(text.length - 2);
            } else if (text.length < 3) {
                resStr =
                    text.substring(0, text.length - 2) + "0." + text.substring(text.length - 2);
            } else {
                if (parseInt(text, 10) > 0) {
                    resStr =
                        text.substring(0, text.length - 2) + "." + text.substring(text.length - 2);
                } else {
                    resStr = "0.00";
                }
            }

            x = resStr.toString();
            const pattern = /(-?\d+)(\d{3})/;
            while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
        }
        return x;
    };

    /***
     * _onBackPress
     * on back button click event
     */
    _onBackPress = () => {
        this.props.navigation.goBack();
    };

    _showPrimaryCurrencyPicker = () => {
        this.setState({
            scrollPickerData: this.state.primaryCurrencyList,
            showScrollPicker: true,
            selectingPrimary: true,
        });
    };

    _showSecondaryCurrencyPicker = () => {
        this.setState({
            scrollPickerData: this.state.secondaryCurrencyList,
            showScrollPicker: true,
            selectingPrimary: false,
        });
    };

    checkButtonDisabled = () => {
        const { amountValue, selectedPrimaryCurrency, selectedSecondaryCurrency } = this.state;
        if (amountValue === 0) this.setState({ buttonDisabled: true });
        else if (selectedPrimaryCurrency?.value === "MYR" && !selectedSecondaryCurrency.value)
            this.setState({ buttonDisabled: true });
        else this.setState({ buttonDisabled: false });
    };

    getOpenServiceFlags = (serviceFlagArray, key) => {
        const productInd = key.toUpperCase();
        return serviceFlagArray.includes(productInd) ? "Y" : "N";
    };

    getFavServiceFlags = (serviceFlagArray, key, favType) => {
        const productInd = key.toUpperCase();
        if (serviceFlagArray.includes(productInd) && favType === productInd) {
            return "Y";
        }
        return "N";
    };

    getProductList = (serviceFlagArray, favType) => {
        const { productsActive } = this.props.getModel("overseasTransfers");
        console.info("productsActive: ", productsActive);
        const keys = Object.keys(productsActive);
        const obj = {};
        for (const key of keys) {
            const productStatus = productsActive[key.toLowerCase() + "Enable"] === "N" ? "" : key;
            if (
                !key.includes("IndDesc") &&
                !key.includes("Enable") &&
                !key.includes("DailyLimitInd")
            ) {
                obj["rateInq_" + key.toUpperCase() + "_Ind"] = !favType
                    ? this.getOpenServiceFlags(serviceFlagArray, productStatus)
                    : this.getFavServiceFlags(serviceFlagArray, productStatus, favType);
            }
        }
        return obj;
    };

    filterCardListBk = (overseasRateInquiry, isEUR) => {
        const bkCard = overseasRateInquiry.filter((filteredCard) => {
            return filteredCard?.productType === "BK" && !isEUR;
        });

        const otherCards = overseasRateInquiry
            .filter((filteredCard) => {
                return (
                    filteredCard?.productType &&
                    filteredCard?.productType !== "BK" &&
                    filteredCard?.productType !== "VD"
                );
            })
            .filter((a) => {
                return a?.productType && a?.exchangeRate && a?.serviceFee !== "-";
            });
        return bkCard?.length === 1 ? [{ ...bkCard[0] }, ...otherCards] : [...otherCards];
    };
    handleContinuePressed = async () => {
        try {
            const { amount, amountValue, selectedPrimaryCurrency, selectedSecondaryCurrency } =
                this.state;

            const amountFloatVal = parseFloat(this.state.amount.replace(/,/g, ""));
            const { transferParams } = this.props.route?.params;
            let serviceFlagArrayList = "";
            if (selectedSecondaryCurrency?.serviceFlag || selectedPrimaryCurrency?.serviceFlag) {
                serviceFlagArrayList = selectedSecondaryCurrency?.serviceFlag
                    ? selectedSecondaryCurrency?.serviceFlag.split(";")
                    : selectedPrimaryCurrency?.serviceFlag.split(";");
            } else {
                serviceFlagArrayList = transferParams?.countryData?.serviceFlag.split(";");
            }

            const serviceFlagArray = serviceFlagArrayList.filter((prodFlag) => {
                if (
                    transferParams?.countryData?.countryCode !== "KH" ||
                    selectedPrimaryCurrency?.value === "EUR"
                ) {
                    return prodFlag !== "BK";
                }
                return prodFlag;
            });
            const { cus_segment } = this.props.getModel("user");
            const { productsActive, trxId, paymentRefNo } =
                this.props.getModel("overseasTransfers");
            const listOfProducts = this.getProductList(
                serviceFlagArray,
                transferParams?.favTransferItem?.productType === "Bakong"
                    ? "BK"
                    : transferParams?.favTransferItem?.productType
            );
            console.info("transferParams: ", transferParams);
            const cardNo = {
                cardNumberVD:
                    transferParams?.favourite &&
                    transferParams?.favTransferItem?.productType === "VD"
                        ? transferParams?.favTransferItem?.responseObject?.beneInfo?.beneId
                        : null,
            };
            const params = {
                trxId,
                paymentRefNo,
                selectedAccount: transferParams?.selectedAccount?.account?.number,
                selectedCountry: transferParams?.countryData?.countryCode,
                selectedState:
                    transferParams?.stateData?.stateCode ||
                    transferParams?.favTransferItem?.responseObject?.beneInfo?.addressInfo
                        ?.stateCode,
                selectedCity: transferParams?.cityData?.cityName,
                fromCurrency: selectedPrimaryCurrency?.value,
                toCurrency:
                    selectedPrimaryCurrency?.value === "MYR"
                        ? selectedSecondaryCurrency.value
                        : "MYR",
                amountEntered: this.state.amount.replace(/,/g, ""),
                ...listOfProducts,
                marketSegment: cus_segment || "01",
                ...cardNo,
                rtPhaseTwoFlag: true,
                fttExtendedHourFlag: false,
            };
            console.info("handleContinuePressed: ", params);
            const response = await getRateInquiry(params);
            const isSuccess =
                response?.data?.statusCode === "0000" ||
                parseInt(response?.data?.statusCode, 10) === 201;
            const overseasRateInquiry = response?.data?.overseasRateInquiry;
            if (isSuccess && overseasRateInquiry?.length > 0) {
                const data =
                    params?.selectedCountry === "KH"
                        ? this.filterCardListBk(
                              overseasRateInquiry,
                              selectedPrimaryCurrency?.value === "EUR" ||
                                  selectedSecondaryCurrency?.value === "EUR"
                          )
                        : overseasRateInquiry
                              .map((rateItem) => {
                                  return {
                                      ...rateItem,
                                      hideCard:
                                          !transferParams?.favourite &&
                                          rateItem?.productType === "VD",
                                  };
                              })
                              .filter((itemToFilter) => {
                                  if (
                                      serviceFlagArray.includes(itemToFilter?.productType) ||
                                      (serviceFlagArray.includes("RT:BK") &&
                                          itemToFilter?.productType === "RT")
                                  ) {
                                      return itemToFilter;
                                  }
                              })
                              .filter((a) => {
                                  return a?.productType && a?.exchangeRate && a?.serviceFee !== "-";
                              });
                console.info("handleContinuePressed data: ", data);
                if (!data?.length || !data[0]?.productType) {
                    showErrorToast({ message: CURRENCY_NOT_ELIGIBLE });
                    return;
                }

                /*************************************************************************/
                // for Bakong old flow only
                transferParams.amountValue = amount;
                transferParams.amountCurrency =
                    selectedPrimaryCurrency?.value === "MYR"
                        ? selectedSecondaryCurrency?.value
                        : selectedPrimaryCurrency?.value;
                /*************************************************************************/

                this.props.updateModel({
                    overseasTransfers: {
                        amountDetails: {
                            primaryCurrency: selectedPrimaryCurrency?.value,
                            secondaryCurrency:
                                selectedPrimaryCurrency?.value === "MYR"
                                    ? selectedSecondaryCurrency?.value
                                    : {},
                            numericAmount: amountValue,
                            formattedAmount: amount,
                            amountWithCurrency: `${selectedPrimaryCurrency?.value} ${amount}`,
                        },
                        purposeCodeLists: {},
                        WURecipientDetails: {},
                        WUTransferPurpose: {},
                        WUSenderDetailsStepThree: {},
                        WUSenderDetailsStepTwo: {},
                        WUSenderDetailsStepOne: {},
                        OverseasSenderDetails: {},
                    },
                });
                RemittanceAnalytics.amountSelected(selectedPrimaryCurrency?.value);

                // transferParams?.favourite for MOT
                if (transferParams?.favTransferItem?.productType === "RT") {
                    RemittanceAnalytics.currencySelectionLoaded();
                    RemittanceAnalytics.currencySelected(
                        selectedPrimaryCurrency?.value === "MYR"
                            ? selectedSecondaryCurrency?.value
                            : selectedPrimaryCurrency?.value
                    );
                }
                const hasVdData = data.filter((cardData) => {
                    return cardData?.productType === "VD";
                });
                this.props.navigation.navigate("OverseasProductListScreen", {
                    transferParams,
                    overseasRateInquiry: data,
                    apiParams: params,
                    showVdInput:
                        serviceFlagArray.includes("VD") &&
                        productsActive?.vd === "Y" &&
                        hasVdData?.length === 1,
                    fromCurrency: selectedPrimaryCurrency?.value,
                });
            } else if (response?.data?.statusCode === 201) {
                showErrorToast({
                    message:
                        "Sorry. The transaction has timed out. Please call the Customer Care Hotline at 1 300 88 6688 for further assistance.",
                });
            } else {
                showErrorToast({
                    message: COMMON_ERROR_MSG,
                });
            }
        } catch (ex) {
            console.info("handleContinuePressed ex ", ex);
            showErrorToast({
                message: ex?.error?.message ?? WE_FACING_SOME_ISSUE,
            });
        }
    };

    _onScrollPickerDismissed = () =>
        this.setState({ showScrollPicker: false, selectingPrimary: false });

    _onScrollPickerDoneButtonPressed = (value) => {
        const { selectingPrimary, primaryCurrencyList, secondaryCurrencyList } = this.state;
        if (selectingPrimary) {
            this.setState({
                selectedPrimaryCurrency: primaryCurrencyList.find((item) => item.value === value),
                showScrollPicker: false,
                selectingPrimary: false,
            });
        } else {
            this.setState({
                selectedSecondaryCurrency: secondaryCurrencyList.find(
                    (item) => item.value === value
                ),
                showScrollPicker: false,
            });
        }
        this.checkButtonDisabled();
    };

    showKeyboard = (e) => {
        console.info("e: ", e);
        this.setState({ showKeyboard: true });
    };

    onCloseButtonPress = () => {
        // Go back to transfer screen const { routeFrom } = this.props.getModel("overseasTransfers");
        const { routeFrom } = this.props.getModel("overseasTransfers");
        if (routeFrom?.prevData) {
            this.props.navigation.navigate(BANKINGV2_MODULE, {
                screen: ACCOUNT_DETAILS_SCREEN,
                params: {
                    prevData: routeFrom?.prevData,
                },
            });
            return;
        }
        this.props.navigation.navigate(FUNDTRANSFER_MODULE, {
            screen: TRANSFER_TAB_SCREEN,
            params: {
                screenDate: { routeFrom: "Dashboard" },
                index: 3,
            },
        });
    };

    getData = () => {
        const { selectedPrimaryCurrency, selectedSecondaryCurrency } = this.state;
        const { transferParams } = this.props.route?.params;
        return {
            dropdownText: selectedSecondaryCurrency?.title
                ? selectedSecondaryCurrency?.title
                : DROPDOWN_DEFAULT_TEXT,
            isVdOrBakongorWU:
                transferParams?.favTransferItem?.productType === "VD" ||
                transferParams?.favTransferItem?.productType === "Bakong" ||
                transferParams?.favTransferItem?.productType === "WU",
            nonfavToMyr:
                (transferParams?.favourite && selectedPrimaryCurrency?.value !== "MYR") ||
                (!transferParams?.favourite && selectedPrimaryCurrency?.value === "MYR")
                    ? 50
                    : 10,
        };
    };
    render() {
        const {
            showErrorModal,
            errorMessage,
            showKeyboard,
            showScrollPicker,
            scrollPickerData,
            selectedPrimaryCurrency,
            amountValue,
            buttonDisabled,
        } = this.state;
        const { transferParams } = this.props.route?.params;

        const { dropdownText, isVdOrBakongorWU, nonfavToMyr } = this.getData();
        const kbViewRm = {
            bottom:
                transferParams?.favourite && selectedPrimaryCurrency?.value === "MYR"
                    ? 100
                    : nonfavToMyr,
        };
        const lineOne = isVdOrBakongorWU
            ? transferParams?.favTransferItem?.responseObject?.beneInfo?.fullName ??
              transferParams?.favTransferItem?.name
            : transferParams?.favTransferItem?.description1;
        const lineTwo = isVdOrBakongorWU
            ? transferParams?.favTransferItem?.description1
            : transferParams?.favTransferItem?.custName;
        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    showErrorModal={showErrorModal}
                    errorMessage={errorMessage}
                    showOverlay={showScrollPicker}
                    backgroundColor={MEDIUM_GREY}
                >
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text={
                                            transferParams?.favourite
                                                ? "Transfer Favourite"
                                                : OVERSEAS_TRANSFER_HEADER
                                        }
                                    />
                                }
                                headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                                headerRightElement={
                                    transferParams?.favourite ? (
                                        <HeaderCloseButton onPress={this.onCloseButtonPress} />
                                    ) : null
                                }
                            />
                        }
                        useSafeArea
                        paddingHorizontal={0}
                        paddingBottom={0}
                    >
                        <React.Fragment>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={Styles.container}>
                                    {transferParams?.favourite ? (
                                        <View style={Styles.headerContainer}>
                                            <View style={Styles.headerImageContainer}>
                                                <BorderedAvatar
                                                    height={64}
                                                    width={64}
                                                    borderRadius={32}
                                                    backgroundColor={OFF_WHITE}
                                                >
                                                    <Image
                                                        style={Styles.image}
                                                        source={getImage(
                                                            transferParams?.favTransferItem
                                                                .productType
                                                        )}
                                                    />
                                                </BorderedAvatar>
                                            </View>
                                            <View style={Styles.headerTextContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    fontStyle="normal"
                                                    lineHeight={18}
                                                    color={BLACK}
                                                    textAlign="left"
                                                    text={lineOne}
                                                />
                                                <Typo
                                                    fontSize={12}
                                                    fontWeight="400"
                                                    fontStyle="normal"
                                                    lineHeight={16}
                                                    color={BLACK}
                                                    textAlign="left"
                                                    text={lineTwo}
                                                />
                                                <Typo
                                                    fontSize={12}
                                                    fontWeight="400"
                                                    fontStyle="normal"
                                                    lineHeight={16}
                                                    color={DARK_GREY}
                                                    textAlign="left"
                                                    text={
                                                        transferParams?.favTransferItem
                                                            ?.description2
                                                    }
                                                />
                                            </View>
                                        </View>
                                    ) : null}
                                    <View style={Styles.descriptionContainerAmount}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={19}
                                            color={BLACK}
                                            textAlign="left"
                                            text={ENTER_AMOUNT}
                                        />
                                    </View>

                                    <View style={Styles.amountViewTransfer}>
                                        <TouchableOpacity
                                            onPress={this._showPrimaryCurrencyPicker}
                                            style={Styles.touchableCurrencyContainer}
                                        >
                                            <Typo
                                                fontSize={20}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={22}
                                                color={FADE_SELECT_GREY}
                                                textAlign="left"
                                                text={selectedPrimaryCurrency?.title}
                                            />

                                            <Image
                                                style={Styles.icDropDown}
                                                source={assets.downArrow}
                                            />
                                        </TouchableOpacity>
                                        <View
                                            activeOpacity={1}
                                            onTouchEnd={this.showKeyboard}
                                            style={Styles.inputContainer}
                                        >
                                            <TextInputWithLengthCheck
                                                isValidate={this.state.showLocalError}
                                                errorMessage={this.state.showLocalErrorMessage}
                                                value={this.state.amount}
                                                clearButtonMode="while-editing"
                                                returnKeyType="done"
                                                editable={false}
                                                onFocus={this.showKeyboard}
                                                placeholder="0.00"
                                            />
                                        </View>
                                    </View>
                                </View>
                                {selectedPrimaryCurrency?.value === "MYR" ? (
                                    <View style={Styles.container}>
                                        <View style={Styles.descriptionContainerAmount}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={19}
                                                color={BLACK}
                                                textAlign="left"
                                                text="Convert to"
                                            />
                                        </View>

                                        <View style={Styles.amountViewTransfer}>
                                            <View style={Styles.descriptionContainerToCurrency}>
                                                <Dropdown
                                                    title={dropdownText}
                                                    align="left"
                                                    borderWidth={0.5}
                                                    testID="txtSELECT_RL"
                                                    accessibilityLabel="txtSELECT_RZ"
                                                    onPress={this._showSecondaryCurrencyPicker}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                ) : null}
                            </ScrollView>

                            {!showKeyboard && (
                                <FixedActionContainer>
                                    <ActionButton
                                        disabled={buttonDisabled}
                                        isLoading={false}
                                        fullWidth
                                        borderRadius={25}
                                        onPress={this.handleContinuePressed}
                                        testID="continue_button"
                                        backgroundColor={buttonDisabled ? DISABLED : YELLOW}
                                        componentCenter={
                                            <Typo
                                                color={buttonDisabled ? DISABLED_TEXT : BLACK}
                                                text={CONTINUE}
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                            />
                                        }
                                    />
                                </FixedActionContainer>
                            )}
                        </React.Fragment>
                    </ScreenLayout>
                    {showKeyboard && (
                        <NumericalKeyboard
                            value={`${amountValue}`}
                            onChangeText={this.changeText}
                            maxLength={8}
                            onDone={this.doneClick}
                        />
                    )}
                </ScreenContainer>
                <ScrollPicker
                    showPicker={showScrollPicker}
                    items={scrollPickerData}
                    onDoneButtonPressed={this._onScrollPickerDoneButtonPressed}
                    onCancelButtonPressed={this._onScrollPickerDismissed}
                />
            </React.Fragment>
        );
    }
}

OverseasEnterAmount.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
};

const Styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
        paddingEnd: 38,
        paddingStart: 36,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginBottom: 15,
    },
    headerImageContainer: {
        paddingVertical: 6,
        paddingRight: 15,
    },
    headerTextContainer: {
        alignItems: "flex-start",
    },
    image: {
        height: 60,
        width: 60,
    },
    descriptionContainerAmount: {
        paddingTop: 10,
    },
    descriptionContainerToCurrency: {
        width: "100%",
        paddingTop: 8,
    },
    amountViewTransfer: {
        flexDirection: "row",
        marginTop: 4,
        marginBottom: 8,
        width: "100%",
    },
    titleContainerTransferNew: {
        justifyContent: "flex-start",
    },
    icDropDown: {
        width: 12,
        height: 6,
        resizeMode: "contain",
        marginLeft: 6,
    },
    inputContainer: { flex: 8.6, marginTop: Platform.OS === "ios" ? 4 : 3, zIndex: 10 },
    touchableCurrencyContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomColor: PINKISH_GREY,
        borderBottomWidth: 1,
        marginRight: 14,
        height: 53,
        paddingHorizontal: 8,
    },
    keyboardContainer: {
        flex: 1,
    },
};
//make this component available to the app
export default withModelContext(OverseasEnterAmount);
