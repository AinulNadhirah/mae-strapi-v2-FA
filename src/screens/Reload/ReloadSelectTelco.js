import PropTypes from "prop-types";
import React, { Component } from "react";
import { Keyboard, StyleSheet, View } from "react-native";

import { RELOAD_SELECT_CONTACT } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ImageFatList } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import SearchInput from "@components/SearchInput";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { logEvent } from "@services/analytics";
import { getAllTelcoList, invokeL3Challenge } from "@services/index";

import { MEDIUM_GREY } from "@constants/colors";
import {
    RELOAD,
    EMPTY_HEADER,
    EMPTY_SUBHEADER,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FORM_PROCEED,
    FIELD_INFORMATION,
    FA_RELOAD_SELECTTELCO,
} from "@constants/strings";

class ReloadSelectTelco extends Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        super(props);

        this.state = {
            // Search Related
            searchText: "",
            showSearchInput: false,

            // Telco List Related
            telcoList: [],
            searchTelco: [],

            // Others
            isLoading: true,

            // Account Related
            accountNo: "",
            accountCode: "",
        };

        this.props.updateModel({
            ui: {
                onCancelLogin: this.onCancelLogin,
            },
        });
    }

    componentDidMount() {
        console.log("[ReloadSelectTelco] >> [componentDidMount]");
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_RELOAD_SELECTTELCO,
        });

        this.getAllTelcoList();
        this.updateAccountNum();
    }

    onCancelLogin = () => {
        console.log("[ReloadSelectTelco] >> [onCancelLogin]");

        this.props.navigation.goBack();
    };

    updateAccountNum = () => {
        console.log("[ReloadSelectTelco] >> [updateAccountNum]");

        const prevData = this.props?.route?.params?.prevData ?? "";
        const { getModel } = this.props;
        const { primaryAccount } = getModel("wallet");

        // From selected account
        const number = prevData?.number ?? null;
        const code = prevData?.code ?? null;

        // From primary account
        const acctNo = primaryAccount?.number ?? null;
        const acctCode = primaryAccount?.code ?? null;

        // Choose whichever is available
        const accountNo = number || acctNo || "";
        const accountCode = code || acctCode || "";

        this.setState({ accountNo, accountCode });
    };

    getAllTelcoList = async () => {
        console.log("[ReloadSelectTelco] >> [getAllTelcoList]");

        const { getModel } = this.props;
        const isL3ChallengeNeeded = await invokeL3Challenge(getModel);
        if (isL3ChallengeNeeded) return;

        try {
            const response = await getAllTelcoList();
            const result = response?.data?.resultList ?? [];
            console.log("[ReloadSelectTelco][getAllTelcoList] >> Response: ", result);

            this.setState({ telcoList: result, searchTelco: result, isLoading: false });
        } catch (error) {
            console.log(`[ReloadSelectTelco][getAllTelcoList] >> Exception: `, error);

            this.setState({ telcoList: [], searchTelco: [], isLoading: false });
        }
    };

    onBackTap = () => {
        console.log("[ReloadSelectTelco] >> [onBackTap]");

        this.props.navigation.goBack();
    };

    doSearchToogle = () => {
        console.log("[ReloadSelectTelco] >> [doSearchToogle]");

        const { showSearchInput, telcoList } = this.state;

        if (showSearchInput) this.setState({ searchText: "" });

        this.setState({
            showSearchInput: !showSearchInput,
            searchTelco: telcoList,
        });
    };

    onSearchTextChange = (val) => {
        console.log("[ReloadSelectTelco] >> [onSearchTextChange]");

        const { telcoList } = this.state;
        const text = val.toLowerCase();

        if (text) {
            const filteredList = telcoList.filter((item) =>
                item.shortName.toLowerCase().match(text)
            );
            this.setState({ searchTelco: filteredList });
        } else {
            Keyboard.dismiss();
            this.setState({ searchTelco: telcoList });
        }
    };

    onItemPressed = (item) => {
        console.log("[ReloadSelectTelco] >> [onItemPressed]");
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_RELOAD_SELECTTELCO,
            [FIELD_INFORMATION]: item?.shortName,
        });

        if (item) {
            this.props.navigation.navigate(RELOAD_SELECT_CONTACT, {
                paramsData: {
                    routeFrom: this.props?.route?.params?.routeFrom ?? "Dashboard",
                    telco: item,
                    accountNo: this.state.accountNo,
                },
            });
        }
    };

    render() {
        const { isLoading, showSearchInput, searchTelco } = this.state;

        return (
            <ScreenContainer
                backgroundType="color"
                showLoaderModal={isLoading}
                backgroundColor={MEDIUM_GREY}
            >
                {!isLoading && (
                    <ScreenLayout
                        paddingBottom={0}
                        paddingHorizontal={0}
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text={RELOAD}
                                    />
                                }
                            />
                        }
                    >
                        <React.Fragment>
                            <View style={styles.searchInputViewCls}>
                                <SearchInput
                                    doSearchToogle={this.doSearchToogle}
                                    showSearchInput={showSearchInput}
                                    onSearchTextChange={this.onSearchTextChange}
                                />
                            </View>

                            {searchTelco.length > 0 ? (
                                <ImageFatList
                                    items={searchTelco}
                                    textKey="shortName"
                                    onItemPressed={this.onItemPressed}
                                />
                            ) : (
                                <View style={styles.container}>
                                    <View style={styles.emptyStateView}>
                                        <Typo
                                            fontSize={18}
                                            lineHeight={32}
                                            fontWeight="bold"
                                            textAlign="left"
                                            text={EMPTY_HEADER}
                                            style={styles.headerText}
                                        />
                                        <Typo
                                            fontSize={14}
                                            lineHeight={20}
                                            text={EMPTY_SUBHEADER}
                                            style={styles.subHeaderText}
                                        />
                                    </View>
                                </View>
                            )}
                        </React.Fragment>
                    </ScreenLayout>
                )}
            </ScreenContainer>
        );
    }
}

ReloadSelectTelco.propTypes = {
    getModel: PropTypes.func,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptyStateView: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    headerText: {
        marginTop: 60,
    },
    searchInputViewCls: {
        marginHorizontal: 24,
    },
    subHeaderText: {
        marginTop: 10,
    },
});

export default withModelContext(ReloadSelectTelco);
