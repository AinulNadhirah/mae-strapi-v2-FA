import numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component, useCallback } from "react";
import {
    View,
    StyleSheet,
    Dimensions,
    ScrollView,
    FlatList,
    TouchableOpacity,
    Image,
    Modal,
} from "react-native";
import ScrollPicker from "react-native-picker-scrollview";

import {
    FUNDTRANSFER_MODULE,
    LOAN_AMOUNT_SELECTION,
    FIXED_DEPOSIT_STACK,
    BANKINGV2_MODULE,
    BANKING_L2_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import GridButtons from "@components/Common/GridButtons";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import ProductHoldingsListItem from "@components/ListItems/ProductHoldingsListItem";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { bankingGetDataMayaM2u, getFDProductCodes, invokeL3 } from "@services";
import { GABanking } from "@services/analytics/analyticsBanking";

import { BLACK, YELLOW, WHITE, BLUE, OFF_WHITE, GREEN, RED } from "@constants/colors";

import { accountNumSeparator, commaAdder, formateAccountNumber } from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

import Assets from "@assets";

const width = Dimensions.get("window").width;

const BankingGridButton = ({ item: { key, title, imageSource }, onButtonPressed }) => {
    const handleGridButtonPressed = useCallback(() => onButtonPressed(key), [key, onButtonPressed]);

    return (
        <View style={styles.gridButtonGutter}>
            <GridButtons
                key={key}
                data={{
                    title,
                    source: imageSource,
                }}
                callback={handleGridButtonPressed}
            />
        </View>
    );
};

BankingGridButton.propTypes = {
    item: PropTypes.object.isRequired,
    onButtonPressed: PropTypes.func.isRequired,
};

class BankingL2Screen extends Component {
    static navigationOptions = () => ({
        title: "",
        header: null,
    });

    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    state = {
        showFilterByModal: false,
        filterByIndex: 0,
        filterNames: [],
        certificates: [],
        data: this.props.route.params.data,
        tabName: this.props.route.params.tabName,
        investmentData: null,
        showFDPlacementButton: false,
        fdPlacementTypeDetails: null,
    };

    _hydrateFDTab = () => {
        const { data } = this.state;

        let subUrl = "/details/fd/certificates";
        let params = "?acctNo=" + data.number;

        bankingGetDataMayaM2u(subUrl + params, true)
            .then((response) => {
                const result = response.data.fdCertificates;
                console.log(subUrl + params + " ==> ");
                if (result != null) {
                    console.log(result);

                    let filterNames = result.map((d) => {
                        return "Certificate " + d.certificateNo;
                    });

                    this.setState({
                        certificates: result,
                        filterByIndex: 0,
                        filterNames: filterNames,
                        refresh: !this.state.refresh,
                    });

                    // fetch first certificate
                    this._fetchCertificateData();
                } else {
                    this.setState({
                        certificates: null,
                        filterNames: [],
                        refresh: !this.state.refresh,
                    });
                }
            })
            .catch((Error) => {
                console.log("pfmGetData _fetchCertificates ERROR: ", Error);
                ErrorLogger(Error);
            });

        getFDProductCodes()
            .then((response) => {
                const fdProductCodes = response?.data?.fdType?.map?.(({ code }) => code) ?? [];
                const { showFDPlacementEntryPoint } = this.props.getModel("fixedDeposit");

                this.setState({
                    showFDPlacementButton:
                        fdProductCodes.includes(data?.code ?? "") && showFDPlacementEntryPoint,
                });
            })
            .catch((error) => {
                showErrorToast({ message: error.message });
            });
    };

    _fetchCertificateData = () => {
        const { data, filterByIndex, certificates } = this.state;

        let subUrl = "/details/fd/certificate/details";
        let params =
            "?acctNo=" +
            data.number +
            "&certificateNo=" +
            certificates[filterByIndex].certificateNo +
            "&group=" +
            data.group;

        bankingGetDataMayaM2u(subUrl + params, true)
            .then((response) => {
                const result = response.data;
                console.log(subUrl + params + " ==> ");
                if (result != null) {
                    console.log(result);

                    this.setState({ certificateData: result, refresh: !this.state.refresh });
                } else {
                    this.setState({ certificateData: null, refresh: !this.state.refresh });
                }
            })
            .catch((Error) => {
                console.log("pfmGetData _fetchCertificateData ERROR: ", Error);
                ErrorLogger(Error);
            });
    };

    _fetchLoanData = () => {
        const { data } = this.state;

        const subUrl = "/details/loan";
        const params =
            data.type === "O"
                ? "?type=" + data.type + "&" + "acctNo=" + data.number
                : "?acctNo=" + data.number;

        bankingGetDataMayaM2u(subUrl + params, true)
            .then((response) => {
                const result = response.data;
                console.log(subUrl + params + " ==> ");
                if (result != null) {
                    console.log(result);

                    this.setState({ loanData: result, refresh: !this.state.refresh });
                } else {
                    this.setState({ loanData: null, refresh: !this.state.refresh });
                }
            })
            .catch((error) => {
                console.log("pfmGetData _fetchLoanData ERROR: ", Error);
                ErrorLogger(error);
            });
    };

    _fetchInvestmentData = async () => {
        const { data, refresh } = this.state;
        try {
            const response = await bankingGetDataMayaM2u(
                `/details/investment?acctNo=${data.number}&type=${data.investmentType}`,
                true
            );
            if (response && response.data)
                this.setState({ investmentData: response.data, refresh: !refresh });
            else
                this.setState({
                    refresh: !refresh,
                });
        } catch (error) {
            ErrorLogger(error);
        }
    };

    componentDidMount = () => {
        console.log(this.state.tabName);

        if (this.state.tabName === "Fixed Deposits") {
            this._hydrateFDTab();
        } else if (this.state.tabName === "Loans") {
            this._fetchLoanData();
        } else if (this.state.tabName === "Investments") {
            this._fetchInvestmentData();
        }
    };

    _onBackPress = () => this.props.navigation.goBack();

    _toggleFilterByModal = () =>
        this.setState({
            showFilterByModal: !this.state.showFilterByModal,
        });

    _onFilterByPressDone = () =>
        this.setState(
            {
                showFilterByModal: !this.state.showFilterByModal,
                filterByIndex:
                    this.state.selectedFilterByIndex != null ? this.state.selectedFilterByIndex : 0,
            },
            () => {
                console.log("_onFilterByPressDone", this.state);

                //fetch new certificate
                this._fetchCertificateData();
            }
        );

    _onFilterValueChange = (data, selectedIndex) => {
        console.log("selectedIndex", selectedIndex);
        this.setState({ filterByCertificateValue: data, selectedFilterByIndex: selectedIndex });
        console.log("state in onValueChange", this.state);
    };

    _onLoanButtonPressed = async () => {
        console.log("[BankingL2Screen] >> [_onLoanButtonPressed]");

        const loanDetailsParams = await this._prepLoanDataForLoanAmountSelectionScreen(
            this.state.loanData
        );
        if (!loanDetailsParams) return;

        GABanking.selectActionLoanPress();
        this.props.navigation.navigate(FUNDTRANSFER_MODULE, {
            screen: LOAN_AMOUNT_SELECTION,
            params: loanDetailsParams,
        });
    };

    _prepLoanDataForLoanAmountSelectionScreen = async (loanData) => {
        console.log("[BankingL2Screen] >> [_prepLoanDataForLoanAmountSelectionScreen]");

        const { getModel } = this.props;
        const { isPostPassword } = getModel("auth");

        // L3 call to invoke login page
        if (!isPostPassword) {
            const httpResp = await invokeL3(true).catch((error) => {
                console.log("[BankingL2Screen][invokeL3] >> Exception: ", error);
            });
            const code = httpResp?.data?.code ?? null;
            if (code !== 0) return;
        }

        const loanObj = loanData?.loan ?? {};
        const acctNo = loanData?.acctNo ?? "";
        const installmentDue = loanObj?.installmentDue ?? loanObj?.plAmtDue ?? "";
        const repaymentAmount = loanObj?.repaymentAmount ?? "";

        const accountDetails = {
            acctCode: loanData?.acctCode ?? "",
            acctNo,
            acctType: loanData?.acctType ?? "",
            acctTypeName: loanData?.acctTypeName ?? "",
            loanCategory: loanData?.loanCategory ?? "",
            displayAccNum: acctNo ? accountNumSeparator(acctNo) : "",
        };

        const amountDetails = {
            installmentDue,
            repaymentAmount,
            displayInstallmentDue: `RM ${numeral(installmentDue).format("0,0.00")}`,
            displayRepayAmt: `RM ${numeral(repaymentAmount).format("0,0.00")}`,
        };

        return { loanObj, amountDetails, accountDetails, source: "loanDetails" };
    };

    _renderFilterModalItems = (data, index, isSelected) => {
        return (
            <View>
                {isSelected ? (
                    <View style={stylesFilterBy.selectedItemContainer}>
                        <Typo
                            fontSize={16}
                            fontWeight="600"
                            lineHeight={19}
                            color={BLACK}
                            text={data}
                        />
                    </View>
                ) : (
                    <Typo
                        fontSize={16}
                        fontWeight="normal"
                        lineHeight={19}
                        color={"#7c7c7d"}
                        text={data}
                    />
                )}
            </View>
        );
    };

    _renderFilterByModal = () => {
        const { filterNames, filterByIndex } = this.state;

        return (
            <View style={stylesFilterBy.containerBottom}>
                <View style={stylesFilterBy.containerModal}>
                    {/* Top bar section */}
                    <View style={stylesFilterBy.containerTopBar}>
                        {/* Close button */}
                        <View style={stylesFilterBy.btnClose}>
                            <TouchableOpacity onPress={this._toggleFilterByModal}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    textAlign="left"
                                    color={BLUE}
                                    text="Close"
                                />
                            </TouchableOpacity>
                        </View>
                        {/* Done button */}
                        <View style={stylesFilterBy.btnDone}>
                            <ActionButton
                                backgroundColor={YELLOW}
                                borderRadius={15}
                                height={30}
                                width={96}
                                componentCenter={
                                    <Typo
                                        fontSize={12}
                                        color={BLACK}
                                        fontWeight="600"
                                        lineHeight={15}
                                        text="Done"
                                    />
                                }
                                onPress={this._onFilterByPressDone}
                            />
                        </View>
                    </View>

                    {/* Picker section */}
                    <View style={stylesFilterBy.containerPicker}>
                        <ScrollPicker
                            //ref={(sp) => {this.sp = sp}}
                            dataSource={filterNames}
                            selectedIndex={filterByIndex}
                            itemHeight={44}
                            wrapperHeight={240}
                            wrapperColor={"#fff"}
                            highlightColor={"#d8d8d8"}
                            renderItem={this._renderFilterModalItems}
                            onValueChange={this._onFilterValueChange}
                        />
                    </View>
                </View>
            </View>
        );
    };

    _formatNameField = (field) => field.split(",").join("\n");

    _renderFixedDepositDetails() {
        const { certificateData } = this.state;
        const tenure = certificateData?.tenure ?? 0;

        return (
            <React.Fragment>
                <ProductHoldingsListItem
                    title="Total principal amount"
                    isString
                    string={certificateData.principalAmountFormatted}
                />
                <ProductHoldingsListItem
                    title="Account holder's name"
                    isString
                    string={this._formatNameField(certificateData.certificateName)}
                />
                <ProductHoldingsListItem
                    title="Term"
                    isString
                    string={`${tenure} month${tenure > 1 ? "s" : ""}`}
                />
                {certificateData.dividendRateFormatted != null && (
                    <ProductHoldingsListItem
                        title={certificateData.islamic ? "Profit rate" : "Interest rate"}
                        isString
                        string={certificateData.dividendRateFormatted}
                    />
                )}
                <ProductHoldingsListItem
                    title="Maturity date"
                    isString
                    string={certificateData.maturityDate}
                />
                <ProductHoldingsListItem
                    title={
                        certificateData.islamic ? "Profit payment mode" : "Interest payment mode"
                    }
                    isString
                    string={
                        certificateData.interestPaymentModeFormatted != null
                            ? certificateData.interestPaymentModeFormatted
                            : "-"
                    }
                />
                <ProductHoldingsListItem
                    title={"Instruction on maturity"}
                    isString
                    string={certificateData.instructionOnMaturityFormatted}
                />
            </React.Fragment>
        );
    }

    _renderLoanDetailItems = ({ item }) => {
        const { name, value } = item;
        const keyName = name.toLowerCase();
        if (keyName === "account name") {
            GABanking.viewScreenLoanDetails();
        }
        if (
            keyName === "outstanding balance" ||
            keyName === "outstanding balance cost of finance" ||
            keyName === "loan amount" ||
            keyName === "last payment" ||
            keyName === "last payment amount"
        ) {
            const convertedValue = -parseFloat(value.replace(/[a-zA-Z ,]/gi, ""));
            return <ProductHoldingsListItem title={name} amount={convertedValue} />;
        }
        return <ProductHoldingsListItem title={name} isString string={value} />;
    };

    _renderOverseasLoanDetailItems = ({ item }) => {
        const { loanData } = this.state;
        const { currencyCode } = loanData;

        const { name, value } = item;
        const displayName = name.toLowerCase();
        const formatValue = `${numeral(value).format("0, 0.00")}`;

        const displayLabel = (() => {
            switch (displayName) {
                case "outstanding cost of finance":
                    return currencyCode + " " + formatValue + "*";
                case "profit rate":
                    return value;
                default:
                    return currencyCode + " " + formatValue;
            }
        })();
        return <ProductHoldingsListItem title={name} isString string={displayLabel} />;
    };

    _loanDetailFlatListKeyExtractor = (item, index) => `${item.name}-${index}`;

    _renderLoanDetails() {
        const { loanData } = this.state;
        const { acctType } = loanData;
        return (
            <React.Fragment>
                {loanData && (
                    <FlatList
                        data={loanData.loanDetail}
                        renderItem={
                            acctType === "O"
                                ? this._renderOverseasLoanDetailItems
                                : this._renderLoanDetailItems
                        }
                        keyExtractor={this._loanDetailFlatListKeyExtractor}
                    />
                )}
            </React.Fragment>
        );
    }

    _renderInvestmentDetails() {
        const {
            investmentData: { investmentDetail },
        } = this.state;
        return (
            <React.Fragment>
                {investmentDetail.map((detail) => {
                    const { name, value } = detail;
                    return (
                        <ProductHoldingsListItem
                            key={`${name}-${value}`}
                            title={name}
                            isString
                            string={value}
                        />
                    );
                })}
            </React.Fragment>
        );
    }

    _renderAcouuntHeader = () => {
        const {
            tabName,
            data: { loanType, balance, regNumber, type, number, currencyCode },
        } = this.state;
        const currency = type === "O" ? currencyCode : "RM";
        const balanceString = `${Math.sign(balance) === -1 ? "-" : ""}${currency} ${commaAdder(
            Math.abs(balance).toFixed(2)
        )}`;

        if (tabName !== "Loans")
            return (
                <Typo
                    fontSize={18}
                    fontWeight="bold"
                    lineHeight={32}
                    color={tabName == "Fixed Deposits" ? GREEN : RED}
                    text={balanceString}
                />
            );
        else {
            if (loanType === "H")
                return <Typo fontSize={18} fontWeight="bold" lineHeight={32} text={regNumber} />;
            else if (type === "O")
                return (
                    <View>
                        <Typo
                            style={styles.headerAccountContainer}
                            fontSize={14}
                            lineHeight={18}
                            text={formateAccountNumber(number, 12)}
                        />
                        <Typo
                            fontSize={18}
                            fontWeight="bold"
                            lineHeight={32}
                            color={RED}
                            text={balanceString}
                        />
                    </View>
                );
            else
                return (
                    <Typo
                        fontSize={18}
                        fontWeight="bold"
                        lineHeight={32}
                        color={RED}
                        text={balanceString.replace("-", "")}
                    />
                );
        }
    };

    _onHeaderBackButtonPressed = () => this._onBackPress();

    _handleFixedDepositPlacement = () => {
        GABanking.selectActionHandleFixedDeposit();
        this.props.navigation.navigate(FIXED_DEPOSIT_STACK, {
            screen: "FDEntryPointValidationScreen",
            params: {
                fdEntryPointModule: BANKINGV2_MODULE,
                fdEntryPointScreen: BANKING_L2_SCREEN,
                fdDetails: {
                    selectedFDAccountDetails: this.state.data,
                },
            },
        });
    };

    render() {
        const {
            data,
            showFilterByModal,
            filterNames,
            certificateData,
            loanData,
            investmentData,
            filterByIndex,
            tabName,
            certificates,
            showFDPlacementButton,
        } = this.state;
        return (
            <React.Fragment>
                <ScreenContainer backgroundType="color">
                    <React.Fragment>
                        <Modal
                            animationIn={"fadeIn"}
                            animationOut={"fadeOut"}
                            hasBackdrop={false}
                            visible={showFilterByModal}
                            style={styles.modal}
                            hideModalContentWhileAnimating
                            useNativeDriver
                            transparent
                            // onRequestClose={() => {
                            //     Alert.alert('Modal has been closed.');
                            // }}
                        >
                            {this._renderFilterByModal()}
                        </Modal>

                        <ScreenLayout
                            paddingBottom={0}
                            paddingTop={0}
                            paddingHorizontal={0}
                            useSafeArea
                            header={
                                <HeaderLayout
                                    headerRightElement={
                                        <HeaderCloseButton
                                            onPress={this._onHeaderBackButtonPressed}
                                        />
                                    }
                                />
                            }
                        >
                            <ScrollView>
                                <View style={styles.container}>
                                    {data != null && (
                                        <React.Fragment>
                                            {/* Header */}
                                            <View style={styles.headerContainer}>
                                                <View>
                                                    <Typo
                                                        fontSize={16}
                                                        fontWeight="600"
                                                        lineHeight={19}
                                                        text={data.name}
                                                    />
                                                </View>

                                                {tabName !== "Loans" && (
                                                    <View style={styles.accNoContainer}>
                                                        <Typo
                                                            fontSize={14}
                                                            lineHeight={18}
                                                            text={formateAccountNumber(
                                                                data.number,
                                                                16
                                                            )}
                                                        />
                                                    </View>
                                                )}
                                                {this._renderAcouuntHeader()}
                                            </View>

                                            {/* Dropdown list if multiple certs */}
                                            {this.state.tabName == "Fixed Deposits" && (
                                                <View style={styles.dropDownContainer}>
                                                    {showFDPlacementButton && (
                                                        <View
                                                            style={
                                                                styles.fdPlacementEntryPointContainer
                                                            }
                                                        >
                                                            <BankingGridButton
                                                                item={{
                                                                    imageSource: Assets.qrPay,
                                                                    key: 1,
                                                                    title: "Make a placement",
                                                                }}
                                                                onButtonPressed={
                                                                    this
                                                                        ._handleFixedDepositPlacement
                                                                }
                                                            />
                                                        </View>
                                                    )}
                                                    <ActionButton
                                                        width={width - 48}
                                                        backgroundColor={WHITE}
                                                        borderWidth={1}
                                                        borderColor={"#cfcfcf"}
                                                        componentLeft={
                                                            <View style={styles.componentContainer}>
                                                                <Typo
                                                                    text={
                                                                        filterNames[filterByIndex]
                                                                    }
                                                                />
                                                            </View>
                                                        }
                                                        componentRight={
                                                            certificates?.length > 1 ? (
                                                                <View
                                                                    style={
                                                                        styles.componentContainer
                                                                    }
                                                                >
                                                                    <Image
                                                                        source={require("@assets/icons/dropDownIcon.png")}
                                                                        style={
                                                                            styles.fdActionButtonImage
                                                                        }
                                                                    />
                                                                </View>
                                                            ) : null
                                                        }
                                                        onPress={this._toggleFilterByModal}
                                                        disabled={certificates?.length <= 1}
                                                    />
                                                </View>
                                            )}

                                            {/* Body */}
                                            {this.state.tabName == "Fixed Deposits" && (
                                                <View style={styles.detailsContainer}>
                                                    {certificateData != null &&
                                                        this._renderFixedDepositDetails()}
                                                </View>
                                            )}

                                            {this.state.tabName == "Loans" && (
                                                <View style={styles.detailsContainer}>
                                                    {loanData && (
                                                        <View style={styles.loanDetailsContainer}>
                                                            {this._renderLoanDetails()}
                                                        </View>
                                                    )}
                                                    {loanData?.acctType === "O" &&
                                                        loanData?.note && (
                                                            <View
                                                                style={styles.overseasNoteContainer}
                                                            >
                                                                <Typo
                                                                    text={loanData?.note}
                                                                    fontSize={12}
                                                                    lineHeight={18}
                                                                    color="#787878"
                                                                    textAlign="left"
                                                                />
                                                            </View>
                                                        )}
                                                    {loanData?.showFullSettlementNotes && (
                                                        <View
                                                            style={
                                                                styles.fullSettlementNoteContainer
                                                            }
                                                        >
                                                            <Typo
                                                                text="Note:"
                                                                fontSize={12}
                                                                fontWeight="600"
                                                                lineHeight={18}
                                                                color="#787878"
                                                            />
                                                            <View
                                                                style={
                                                                    styles.fullSettlementNoteSeparator
                                                                }
                                                            />
                                                            <Typo
                                                                text={
                                                                    loanData?.note ??
                                                                    "For full settlement amount, please refer to your home branch."
                                                                }
                                                                fontSize={12}
                                                                lineHeight={18}
                                                                color="#787878"
                                                                textAlign="left"
                                                            />
                                                        </View>
                                                    )}
                                                </View>
                                            )}

                                            {this.state.tabName === "Investments" && (
                                                <View style={styles.detailsContainer}>
                                                    {investmentData != null &&
                                                        this._renderInvestmentDetails()}
                                                </View>
                                            )}
                                        </React.Fragment>
                                    )}
                                </View>
                            </ScrollView>
                            {this.state.tabName === "Loans" && this.state.data?.type !== "O" && (
                                <FixedActionContainer>
                                    <ActionButton
                                        fullWidth
                                        onPress={this._onLoanButtonPressed}
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text="Pay Loan"
                                            />
                                        }
                                    />
                                </FixedActionContainer>
                            )}
                        </ScreenLayout>
                    </React.Fragment>
                </ScreenContainer>
            </React.Fragment>
        );
    }
}
export default withModelContext(BankingL2Screen);

const styles = StyleSheet.create({
    accNoContainer: {
        marginVertical: 8,
    },
    componentContainer: {
        marginHorizontal: 24,
    },
    container: {
        flex: 1,
    },
    detailsContainer: {
        marginHorizontal: 24,
    },
    dropDownContainer: {
        marginBottom: 24,
        marginHorizontal: 24,
    },
    fdActionButtonImage: { height: 8, width: 16 },
    fdPlacementEntryPointContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 24,
        width: "100%",
    },
    fullSettlementNoteContainer: {
        alignItems: "flex-start",
        justifyContent: "flex-start",
        marginVertical: 24,
    },
    fullSettlementNoteSeparator: { height: 4 },
    gridButtonGutter: { paddingLeft: 10 },
    headerAccountContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
        marginTop: 8,
    },
    headerContainer: {
        marginBottom: 24,
    },
    loanDetailsContainer: {
        marginHorizontal: 8,
    },
    modal: { margin: 0 },
    overseasNoteContainer: {
        marginVertical: 30,
    },
});

const ContainerButtonColor = "rgba(0, 0, 0, 0.75)";

const stylesFilterBy = StyleSheet.create({
    btnClose: {
        backgroundColor: WHITE,
        flex: 1,
    },
    btnDone: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-end",
        backgroundColor: WHITE,
    },
    containerBottom: {
        alignItems: "center",
        backgroundColor: ContainerButtonColor,
        flex: 1,
        justifyContent: "flex-end",
    },
    containerModal: {
        height: 300,
        width: width,
    },
    containerPicker: {
        height: 240,
        width: width,
    },
    containerTopBar: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        flexDirection: "row",
        height: 60,
        paddingHorizontal: 24,
        width: width,
    },
    selectedItemContainer: {
        alignItems: "center",
        backgroundColor: OFF_WHITE,
        height: 44,
        justifyContent: "center",
        width: width,
    },
});
