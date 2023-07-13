import PropTypes from "prop-types";
import React, { Component } from "react";
import { StyleSheet, View, Keyboard } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import PromotionsList from "@components/Cards/PromotionsList";
import ScreenContainer from "@components/Containers/ScreenContainer";
import LoadingMerchant from "@components/FnB/LoadingMerchant";
import NoResults from "@components/FnB/NoResults";
import SearchInput from "@components/SearchInput";
// import Assets from "@assets";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { getAllFnBPromotions, getPromotionSearch } from "@services";
import { logEvent } from "@services/analytics";

import { BLACK, MEDIUM_GREY } from "@constants/colors";
import * as Strings from "@constants/strings";

import { getLocationDetails } from "@utils/dataModel/utility";
import { getLatitude, getLongitude } from "@utils/dataModel/utilitySSL";

class ViewAllPromotions extends Component {
    static propTypes = {
        updateModel: PropTypes.func,
        getModel: PropTypes.func,
        navigation: PropTypes.object,
        route: PropTypes.object,
    };

    state = {
        searchText: "",
        showSearchInput: false,
        searchPromotionData: [],
        location: {},
        isLoading: true,
        promotionData: [],
        isFilter: false,
        page: 0,
        pageSearch: 0,
        filterParams: null,
        isFinish: false,
    };

    componentDidMount() {
        this.checkLocationPermission();
        this.focusListener = this.props.navigation.addListener("focus", this.onFocus);
        logEvent(Strings.FA_VIEW_SCREEN, {
            [Strings.FA_SCREEN_NAME]: "Food_Promotion_List",
        });
    }

    componentWillUnmount() {
        this.focusListener();
    }

    checkLocationPermission = () => {
        console.log("[FnBTabScreen] >> [checkLocationPermission]");
        this.setState(
            {
                page: 0,
                pageSearch: 0,
            },
            async () => {
                await getLocationDetails()
                    .then((data) => {
                        console.log(`checkLocationPermission data`, data);
                        this.setState(
                            {
                                location: {
                                    latitude: data?.location?.latitude ?? "",
                                    longitude: data?.location?.longitude ?? "",
                                },
                            },
                            () => this.getPromotionData()
                        );
                    })
                    .catch(() => {
                        this.getPromotionData();
                    });
            }
        );
    };

    getPromotionData = () => {
        const { location } = this.state;
        const { fnbCurrLocation } = this.props.getModel("fnb");

        const params = {
            latitude: getLatitude({ location, currSelectedLocationV1: fnbCurrLocation }),
            longitude: getLongitude({ location, currSelectedLocationV1: fnbCurrLocation }),

            categoryId: 1,
        };
        this.getAllPromotions(params);
    };

    getPromotionSearch = (searchString) => {
        console.log("[ViewAllPromotions] >> [getPromotionSearch]");

        const { location } = this.state;
        const { fnbCurrLocation } = this.props.getModel("fnb");
        const params = {
            keywords: searchString,
            categoryId: 1,
            latitude: getLatitude({ location, currSelectedLocationV1: fnbCurrLocation }),
            longitude: getLongitude({ location, currSelectedLocationV1: fnbCurrLocation }),
        };
        const { pageSearch, searchPromotionData } = this.state;

        this.setState({
            pageSearch: pageSearch + 1,
        });

        getPromotionSearch(params, pageSearch + 1)
            .then((respone) => {
                const result = respone?.data?.result;
                const promotionList = result?.promotionList ?? [];
                console.log("Data isss", result);
                const data = [...searchPromotionData, ...promotionList];
                this.setState({
                    isLoading: false,
                    searchPromotionData: data,
                    isFinish: promotionList.length < 20,
                });
            })
            .catch((error) => {
                console.log(`is Error`, error);
                this.setState({ isLoading: false }, () => {
                    // showErrorToast({
                    //     message: error.message,
                    // });
                });
            });
    };
    getAllPromotions = (params) => {
        console.log("[ViewAllPromotions] >> [getAllPromotions]");
        const { page, searchPromotionData } = this.state;

        this.setState({
            page: page + 1,
        });

        getAllFnBPromotions(params, "Discover", true, page + 1)
            .then((respone) => {
                const result = respone.data.result;
                console.log("Data isss", result);
                const data = [...searchPromotionData, ...result];
                this.setState({
                    isLoading: false,
                    promotionData: data,
                    searchPromotionData: data,
                    isFinish: result.length < 20,
                });
            })
            .catch((error) => {
                console.log(`is Error`, error);
                this.setState({ isLoading: false }, () => {
                    //     showErrorToast({
                    //         message: error.message,
                    //     });
                });
            });
    };
    onEndReachedMerchant = () => {
        console.log("[ViewAllMerchants] >> [onEndReachedMerchant]");
        const { searchText, filterParams, isFinish } = this.state;

        if (!isFinish) {
            const { location } = this.state;
            const { fnbCurrLocation } = this.props.getModel("fnb");
            const params = {
                latitude: getLatitude({ location, currSelectedLocationV1: fnbCurrLocation }),
                longitude: getLongitude({ location, currSelectedLocationV1: fnbCurrLocation }),
                categoryId: 1,
            };

            if (searchText && searchText.length >= 1) {
                this.getPromotionSearch(searchText);
            } else {
                this.getAllPromotions({ ...params, ...filterParams });
            }
        }
    };

    onFocus = () => {
        if (this.props.route?.params?.filterParams) {
            const { filterParams } = this.props.route?.params;

            this.setState(
                {
                    page: 0,
                    promotionData: [],
                    searchPromotionData: [],
                    isLoading: true,
                    isFinish: false,
                    filterParams,
                },
                () => {
                    this.props.navigation.setParams({
                        filterParams: null,
                    });
                    this.getAllPromotions(filterParams);
                }
            );
        }
    };

    // SearchInput Event
    doSearchToogle = () => {
        console.log("[ViewAllPromotions] >> [SearchTap]");
        const { showSearchInput, promotionData } = this.state;
        if (showSearchInput) {
            this.setState({
                searchText: "",
                searchPromotionData: promotionData,
                showSearchInput: !showSearchInput,
            });
        } else {
            this.setState({
                searchPromotionData: [],
                pageSearch: 1,
                isFinish: false,
                showSearchInput: !showSearchInput,
            });
        }
    };
    // SearchInput Event
    onSearchTextChange = (val) => {
        const text = val.toLowerCase().replace(/[^\w\s]/gi, "");
        if (text) {
            // const filteredList = this.state.promotionData.filter((item) => {
            //     if (item.title.toLowerCase().match(text)) return item;
            // });
            //this.setState({ searchPromotionData: filteredList });
            this.setState({ pageSearch: 0, searchPromotionData: [], isFinish: false }, () => {
                this.getPromotionSearch(text);
            });
        } else {
            Keyboard.dismiss();
            this.setState({ promotionData: this.state.promotionData });
        }
    };

    onBackTap = () => {
        console.log("[ViewAllPromotions] >> [BackTap]");
        this.props.navigation.goBack();
    };

    onNewSearchTap = () => {
        console.log("[ViewAllPromotions] >> [onNewSearchTap]");
        if (this.state.isFilter) {
            this.getPromotionData();
            return;
        }
        this.setState({
            searchPromotionData: this.state.promotionData,
            searchText: "",
            showSearchInput: !this.state.showSearchInput,
        });
    };
    onCancelTap = () => {
        console.log("[ViewAllPromotions] >> [onCancelTap]");
        this.props.navigation.goBack();
    };

    onPromotionPressed = (item) => {
        console.log("[ViewAllPromotions] >> [onPromotionPressed]");
        logEvent(Strings.FA_SELECT_PROMOTION, {
            [Strings.FA_SCREEN_NAME]: "Food_Promotion_List",
            [Strings.FA_FIELD_INFORMATION]: item?.title,
        });
        const params = item?.merchantId
            ? {
                  promotionDetails: item,
                  source: "Featured",
              }
            : {
                  screen: navigationConstant.PROMO_DETAILS,
                  params: {
                      itemDetails: {
                          id: item.id,
                      },
                      callPage: "Dashboard",
                      index: 0,
                  },
              };

        this.props.navigation.navigate(
            item?.merchantId
                ? navigationConstant.PROMOTION_DETAILS
                : navigationConstant.PROMOS_MODULE,
            params
        );
    };

    onCloseTap = () => {
        console.log("[ViewAllPromotions] >> [CloseTap]");
        this.props.navigation.navigate(navigationConstant.FNB_TAB_SCREEN);
    };

    render() {
        const { isLoading } = this.state;
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                            headerRightElement={<HeaderCloseButton onPress={this.onCloseTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    color={BLACK}
                                    lineHeight={19}
                                    text={Strings.PROMOTIONS}
                                />
                            }
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                    paddingLeft={0}
                    paddingRight={0}
                    paddingBottom={0}
                    paddingTop={0}
                >
                    <View style={styles.container}>
                        <View style={styles.headerView}>
                            <View style={styles.searchView}>
                                <SearchInput
                                    doSearchToogle={this.doSearchToogle}
                                    showSearchInput={this.state.showSearchInput}
                                    onSearchTextChange={this.onSearchTextChange}
                                    placeHolder="Search"
                                />
                            </View>
                        </View>

                        {/* Promotions section */}
                        {isLoading ? (
                            <LoadingMerchant />
                        ) : this.state.searchPromotionData.length > 0 ? (
                            <PromotionsList
                                items={this.state.searchPromotionData}
                                onItemPressed={this.onPromotionPressed}
                                onEndReached={this.onEndReachedMerchant}
                            />
                        ) : (
                            <View style={styles.container}>
                                <NoResults
                                    onPrimary={this.onNewSearchTap}
                                    onSecondary={this.onCancelTap}
                                />
                            </View>
                        )}
                    </View>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    // funnelContainer: {
    //     marginRight: 10,
    // },
    headerView: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 12,
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    // searchBarIcon: {
    //     height: 24,
    //     width: 24,
    // },
    searchView: {
        height: 48,
        width: "100%",
    },
});

export default withModelContext(ViewAllPromotions);
