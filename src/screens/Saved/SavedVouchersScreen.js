import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, FlatList, ImageBackground, Image, TouchableOpacity } from "react-native";

import { PROMO_DETAILS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ContentCard from "@components/Cards/ContentCard/index";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { getSavedVouchers, LikeHomeContent } from "@services";

import { MEDIUM_GREY, WHITE } from "@constants/colors";
import { ENDPOINT_BASE } from "@constants/url";

import { ErrorLogger } from "@utils/logs";

import assets from "@assets";

class SavedVouchersScreen extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.object.isRequired,
    };

    state = {
        loading: true,
        vouchersData: [],
        refresh: false,
    };

    componentDidMount = () => {
        console.log("[SavedVouchersScreen] vouchersData:", this.state.vouchersData);

        this.focusSubscription = this.props.navigation.addListener("focus", async () => {
            this._fetchData(false);
        });
    };

    _fetchData = (showRefresh) => {
        this.setState({ loading: showRefresh }, () => {
            this._fetchVouchers();
        });
    };

    _fetchVouchers = async () => {
        // Call API to get all saved/redeemed vouchers
        try {
            const response = await getSavedVouchers();

            if (response && response.data) {
                console.log(response);

                const { resultList } = response.data;

                this.setState({
                    vouchersData: resultList.length > 0 ? resultList : null,
                    loading: false,
                    refresh: !this.state.refresh,
                });
            }
        } catch (error) {
            //  error
            this.setState({ vouchersData: null, loading: false, refresh: !this.state.refresh });
        }
    };

    _onBackPress = () => this.props.navigation.goBack();

    _onRefresh = () => {
        this._fetchData(true);
    };

    _renderEmptyState() {
        return (
            <View style={styles.emptyStateContainer}>
                <View style={styles.emptyStateTxtContainer}>
                    <View style={styles.emptyStateTitle}>
                        <Typo
                            text="No Saved Vouchers"
                            fontSize={18}
                            lineHeight={32}
                            fontWeight="600"
                        />
                    </View>
                    <Typo
                        text="Nothing to see here. Check back later once we've got some vouchers for you."
                        fontSize={12}
                        lineHeight={18}
                    />
                </View>
                <View style={styles.emptyStateBgImgContainer}>
                    <Image
                        source={assets.noTransactionIllustration}
                        style={{ flex: 1 }}
                        resizeMode="contain"
                    />
                </View>
            </View>
        );
    }

    _onCategoryPressed = (name) => {
        console.log("[_onCategoryPressed]:", name);
    };

    _onContentCardBodyPress = ({ item, index }) => {
        console.log("[_onContentCardBodyPress] item:", item);
        this.props.navigation.navigate("PromotionDetails", {
            itemDetails: item,
            callPage: "Saved-Vouchers",
            onGoBack: this._refreshData,
            index: index,
        });
    };

    _requestLikeContent = async ({ item, index }) => {
        try {
            console.log("item: ", item);
            console.log("index: ", index);

            const { getModel } = this.props;
            const { cmsUrl, cmsCloudEnabled } = getModel("cloud");
            const endpoint = cmsCloudEnabled ? cmsUrl : `${ENDPOINT_BASE}/user/v2/users`;

            const { id } = item;

            const response = await LikeHomeContent(endpoint, id.toString());
            const result = response.data.result;

            const { vouchersData } = this.state;
            const updatedList = [...vouchersData];
            const updatedItem = { ...item };
            if (
                updatedItem.userContent !== null &&
                updatedItem.userContent.emotionStatus === "LIKE"
            ) {
                updatedItem.likeCount--;
            } else {
                updatedItem.likeCount++;
            }
            updatedItem.userContent.emotionStatus = result.emotionStatus;

            updatedList[index] = updatedItem;

            this.setState({ vouchersData: updatedList, refresh: !this.state.refresh });
        } catch (error) {
            ErrorLogger(error);
        }
    };

    _renderResultItem = ({ item, index }) => {
        return (
            <View style={styles.containerResultCard}>
                <ContentCard
                    imageUrl={item.imageUrl}
                    likeCount={item.likeCount}
                    isLiked={
                        item.userContent != null && item.userContent.emotionStatus == "LIKE"
                            ? true
                            : false
                    }
                    isBookmarked={
                        item.userContent != null && item.userContent.isBookmarked ? true : false
                    }
                    onCardPressed={() => this._onContentCardBodyPress({ item, index })}
                    onLikeButtonPressed={() => this._requestLikeContent({ item, index })}
                    // onBookmarkButtonPressed={() => this._requestBookmarkContent({ item, index })}
                    title={item.title}
                    containerMode={"list"}
                    showFooter={false}
                />
            </View>
        );
    };

    render() {
        const { loading, vouchersData } = this.state;

        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                // showLoaderModal={loading}
            >
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    neverForceInset={["bottom"]}
                    useSafeArea
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo
                                    text="Voucher"
                                    fontWeight="600"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                        />
                    }
                >
                    <View style={styles.container}>
                        {/* Body */}
                        {vouchersData && vouchersData.length > 0 ? (
                            <FlatList
                                data={vouchersData}
                                extraData={this.state.refresh}
                                renderItem={this._renderResultItem}
                                keyExtractor={(item) => item.id.toString()}
                                ListHeaderComponent={<View style={styles.vouchersListHeader} />}
                                ListFooterComponent={<View style={styles.vouchersListHeader} />}
                                onRefresh={this._onRefresh}
                                refreshing={loading}
                            />
                        ) : (
                            !vouchersData && this._renderEmptyState()
                        )}
                    </View>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}
export default withModelContext(SavedVouchersScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
    },
    containerResultCard: {
        paddingBottom: 24,
        paddingHorizontal: 24,
    },
    emptyStateBgImgContainer: {
        alignItems: "center",
        flex: 0.6,
    },
    emptyStateContainer: {
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
    vouchersList: { paddingHorizontal: 24 },
    vouchersListHeader: { paddingTop: 16 },
});
