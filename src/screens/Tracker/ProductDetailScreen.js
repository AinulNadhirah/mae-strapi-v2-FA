/* eslint-disable react/jsx-no-bind */
import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ScrollView,
    FlatList,
    TouchableOpacity,
    ImageBackground,
    Image,
    Modal,
} from "react-native";
import moment from "moment";
import ScrollPicker from "react-native-picker-scrollview";

import * as ModelClass from "@utils/dataModel/modelClass";
import * as Strings from "@constants/strings";
import { BLACK, YELLOW, WHITE, OFF_WHITE, BLUE } from "@constants/colors";
import NavigationService from "@navigation/navigationService";
import * as navigationConstant from "@navigation/navigationConstant";

import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import Typo from "@components/Text";
// import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ProductHoldingsListItem from "@components/ListItems/ProductHoldingsListItem";
import ActionButton from "@components/Buttons/ActionButton";

import * as utility from "@utils/dataModel/utility";

import { pfmGetData } from "@services/index";

const width = Dimensions.get("window").width;

class ProductDetailScreen extends Component {
    static navigationOptions = () => ({
        title: "",
        header: null,
    });

    state = {
        showFilterByModal: false,
        filterByIndex: 0,
        filterNames: [],
        certificates: [],
        data: this.props.route.params.data,
        tabName: this.props.route.params.tabName,
    };

    _fetchCertificates = async () => {
        const { data, filterByIndex } = this.state;

        let subUrl = "/pfm/fd/certificates";
        let params = "?acctNo=" + data.number;

        pfmGetData(subUrl + params, true)
            .then(async (response) => {
                const result = response.data.fdCertificates;
                console.log(subUrl + params + " ==> ");
                if (result != null) {
                    console.log(result);

                    let filterNames = result.map((d, i) => {
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
            });
    };

    _fetchCertificateData = async () => {
        const { data, filterByIndex, certificates } = this.state;

        let subUrl = "/pfm/fd/certificateDetail";
        let params =
            "?acctNo=" +
            data.number +
            "&certificateNo=" +
            certificates[filterByIndex].certificateNo +
            "&group=" +
            data.group;

        pfmGetData(subUrl + params, true)
            .then(async (response) => {
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
            });
    };

    _fetchLoanData = async () => {
        const { data } = this.state;

        let subUrl = "/pfm/loan/accounts/details";
        let params = "?acctNo=" + data.number;

        pfmGetData(subUrl + params, true)
            .then(async (response) => {
                const result = response.data;
                console.log(subUrl + params + " ==> ");
                if (result != null) {
                    console.log(result);

                    this.setState({ loanData: result, refresh: !this.state.refresh });
                } else {
                    this.setState({ loanData: null, refresh: !this.state.refresh });
                }
            })
            .catch((Error) => {
                console.log("pfmGetData _fetchLoanData ERROR: ", Error);
            });
    };

    _fetchInvestmentData = async () => {
        const { data } = this.state;

        let subUrl = "/pfm/investment/detail";
        let params = "?acctNo=" + data.number;

        pfmGetData(subUrl + params, true)
            .then(async (response) => {
                const result = response.data;
                console.log(subUrl + params + " ==> ");
                if (result != null) {
                    console.log(result);

                    this.setState({ investmentData: result, refresh: !this.state.refresh });
                } else {
                    this.setState({ investmentData: null, refresh: !this.state.refresh });
                }
            })
            .catch((Error) => {
                console.log("pfmGetData _fetchInvestmentData ERROR: ", Error);
            });
    };

    componentDidMount = async () => {
        console.log(this.state.tabName);

        if (this.state.tabName == "Fixed Deposits") {
            await this._fetchCertificates();
        } else if (this.state.tabName == "Loans") {
            await this._fetchLoanData();
        } else if (this.state.tabName == "Investments") {
            await this._fetchInvestmentData();
        }
    };

    _onBackPress = async () => {
        // console.log("_onBackPress");
        this.props.navigation.goBack();
    };

    _toggleFilterByModal = () => {
        this.setState({
            showFilterByModal: !this.state.showFilterByModal,
            // filterByKey: filter,
        });
    };

    _onFilterByPressDone = async () => {
        await this.setState({
            showFilterByModal: !this.state.showFilterByModal,
            filterByIndex:
                this.state.selectedFilterByIndex != null ? this.state.selectedFilterByIndex : 0,
        });

        console.log("_onFilterByPressDone", this.state);

        //fetch new certificate
        this._fetchCertificateData();
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
                                >
                                    <Text>Close</Text>
                                </Typo>
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
                                    >
                                        <Text>Done</Text>
                                    </Typo>
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
                            renderItem={(data, index, isSelected) => {
                                return (
                                    <View>
                                        {isSelected ? (
                                            <View style={stylesFilterBy.selectedItemContainer}>
                                                <Typo
                                                    fontSize={16}
                                                    fontWeight="600"
                                                    lineHeight={19}
                                                    color={BLACK}
                                                >
                                                    <Text>{data}</Text>
                                                </Typo>
                                            </View>
                                        ) : (
                                            <Typo
                                                fontSize={16}
                                                fontWeight="normal"
                                                lineHeight={19}
                                                color={"#7c7c7d"}
                                            >
                                                <Text>{data}</Text>
                                            </Typo>
                                        )}
                                    </View>
                                );
                            }}
                            onValueChange={(data, selectedIndex) => {
                                console.log("selectedIndex", selectedIndex);
                                this.setState({
                                    filterByCertificateValue: data,
                                    selectedFilterByIndex: selectedIndex,
                                });
                                console.log("state in onValueChange", this.state);
                            }}
                        />
                        {/* <Picker
                        style={{ backgroundColor: OFF_WHITE, width: width, height: 240 }}
                        selectedValue={ filterByCategoryValue === '' ? '' : filterByCategoryValue }
                        pickerData={categoryNames}
                        onValueChange={value => { this.setState({filterByCategoryValue: value}) }}
                        itemSpace={64} // this only support in android
                        /> */}
                        {/* <Picker
                            values={["Kolkata","Delhi","Hydrabad","Banglore","Pune"]}
                            selected={this.state.index}
                            style={{ 
                                flex: 1, 
                                height: 200,
                                fontSize: 16,
                                fontFamily: "montserrat",
                                fontWeight: "600",
                                fontStyle: "normal",
                                lineHeight: 19,
                                letterSpacing: 0,
                                textAlign: "center",
                                color: BLACK
                                }}
                            enableInput={false}
                            onSelect={(value,index) => {
                                console.log('onSelect', value, index);
                                this.setState({index})
                            }}
                        /> */}
                    </View>
                </View>
            </View>
        );
    };

    _renderFixedDepositDetails() {
        const { certificateData } = this.state;

        return (
            <React.Fragment>
                <ProductHoldingsListItem
                    title={"Total Principal Amount"}
                    isString={true}
                    string={certificateData.principalAmountFormatted}
                />
                <View style={styles.divider} />
                <ProductHoldingsListItem
                    title={"Account Name"}
                    isString={true}
                    string={certificateData.certificateName}
                />
                <View style={styles.divider} />
                <ProductHoldingsListItem
                    title={"Term"}
                    isString={true}
                    string={certificateData.tenure + " month(s)"}
                />
                <View style={styles.divider} />
                <ProductHoldingsListItem
                    title={certificateData.islamic ? "Profit Rate" : "Interest Rate"}
                    isString={true}
                    string={certificateData.dividendRateFormatted}
                />
                <View style={styles.divider} />
                <ProductHoldingsListItem
                    title={"Maturity Date"}
                    isString={true}
                    string={certificateData.maturityDate}
                />
                <View style={styles.divider} />
                <ProductHoldingsListItem
                    title={"Interest Payment Mode"}
                    isString={true}
                    string={
                        certificateData.interestPaymentModeFormatted != null
                            ? certificateData.interestPaymentModeFormatted
                            : "-"
                    }
                />
                <View style={styles.divider} />
                <ProductHoldingsListItem
                    title={"Instructions on Maturity"}
                    isString={true}
                    string={certificateData.instructionOnMaturityFormatted}
                />
                <View style={styles.divider} />
            </React.Fragment>
        );
    }

    _renderLoanDetails() {
        const { loanData } = this.state;

        return (
            <React.Fragment>
                {loanData != null &&
                    loanData.loanDetail != null &&
                    loanData.loanDetail.length != 0 && (
                        <FlatList
                            data={loanData.loanDetail}
                            // extraData={refresh}
                            renderItem={({ item }) => (
                                <React.Fragment>
                                    <ProductHoldingsListItem
                                        title={item.name}
                                        isString={true}
                                        string={item.value}
                                    />
                                    <View style={styles.divider} />
                                </React.Fragment>
                            )}
                            // keyExtractor={item => item.number.toString()}
                        />
                    )}
            </React.Fragment>
        );
    }

    _renderInvestmentDetails() {
        const { investmentData } = this.state;

        return (
            <React.Fragment>
                {investmentData != null &&
                    investmentData.investmentDetail != null &&
                    investmentData.investmentDetail.length != 0 && (
                        <FlatList
                            data={investmentData.investmentDetail}
                            // extraData={refresh}
                            renderItem={({ item }) => (
                                <React.Fragment>
                                    <ProductHoldingsListItem
                                        title={item.name}
                                        isString={true}
                                        string={item.value}
                                    />
                                    <View style={styles.divider} />
                                </React.Fragment>
                            )}
                            // keyExtractor={item => item.number.toString()}
                        />
                    )}
            </React.Fragment>
        );
    }

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
                            style={{ margin: 0 }}
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
                            useSafeArea={true}
                            header={
                                <HeaderLayout
                                    headerRightElement={
                                        <HeaderCloseButton onPress={() => this._onBackPress()} />
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
                                                    >
                                                        <Text>{data.name}</Text>
                                                    </Typo>
                                                </View>

                                                <View style={styles.accNoContainer}>
                                                    <Typo
                                                        fontSize={14}
                                                        lineHeight={18}
                                                        text={utility.formateAccountNumber(
                                                            data.number,
                                                            16
                                                        )}
                                                    />
                                                </View>

                                                <View>
                                                    <Typo
                                                        fontSize={18}
                                                        fontWeight="bold"
                                                        lineHeight={32}
                                                        color={
                                                            tabName == "Fixed Deposits"
                                                                ? "#5dbc7d"
                                                                : "#e35d5d"
                                                        }
                                                    >
                                                        <Text>
                                                            {Math.sign(data.balance) == -1 && "-"}RM{" "}
                                                            {utility.commaAdder(
                                                                Math.abs(data.balance).toFixed(2)
                                                            )}
                                                        </Text>
                                                    </Typo>
                                                </View>
                                            </View>

                                            {/* Dropdown list if multiple certs */}
                                            {this.state.tabName == "Fixed Deposits" && (
                                                <View style={styles.dropDownContainer}>
                                                    <ActionButton
                                                        width={width - 48}
                                                        backgroundColor={WHITE}
                                                        borderWidth={1}
                                                        borderColor={"#cfcfcf"}
                                                        componentLeft={
                                                            <View style={styles.componentContainer}>
                                                                <Typo>
                                                                    <Text>
                                                                        {filterNames[filterByIndex]}
                                                                    </Text>
                                                                </Typo>
                                                            </View>
                                                        }
                                                        componentRight={
                                                            <View style={styles.componentContainer}>
                                                                <Image
                                                                    source={require("@assets/icons/dropDownIcon.png")}
                                                                    style={{ width: 16, height: 8 }}
                                                                />
                                                            </View>
                                                        }
                                                        onPress={() => this._toggleFilterByModal()}
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
                                                    {loanData != null && this._renderLoanDetails()}
                                                </View>
                                            )}

                                            {this.state.tabName == "Investment" && (
                                                <View style={styles.detailsContainer}>
                                                    {investmentData != null &&
                                                        this._renderInvestmentDetails()}
                                                </View>
                                            )}
                                        </React.Fragment>
                                    )}
                                </View>
                            </ScrollView>
                        </ScreenLayout>
                    </React.Fragment>
                </ScreenContainer>
            </React.Fragment>
        );
    }
}
export default ProductDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        marginBottom: 24,
    },
    accNoContainer: {
        marginVertical: 8,
    },
    detailsContainer: {
        marginHorizontal: 24,
    },
    dropDownContainer: {
        marginHorizontal: 24,
        marginBottom: 24,
    },
    componentContainer: {
        marginHorizontal: 24,
    },
    divider: {
        width: "100%",
        height: 1,
        backgroundColor: "#eaeaea",
    },
});

const stylesFilterBy = StyleSheet.create({
    containerBottom: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.75)",
    },
    containerModal: {
        height: 300,
        width: width,
    },
    containerTopBar: {
        height: 60,
        width: width,
        alignItems: "center",
        flexDirection: "row",
        paddingHorizontal: 24,
        backgroundColor: "white",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    containerPicker: {
        width: width,
        height: 240,
    },
    selectedItemContainer: {
        height: 44,
        width: width,
        backgroundColor: "#f8f8f8",
        alignItems: "center",
        justifyContent: "center",
    },
    btnClose: {
        flex: 1,
        backgroundColor: "white",
    },
    btnDone: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-end",
        backgroundColor: "white",
    },
});
