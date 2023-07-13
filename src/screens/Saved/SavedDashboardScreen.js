import React, { Component } from "react";
import { View, StyleSheet, FlatList, ImageBackground, Image, TouchableOpacity } from "react-native";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import Typo from "@components/Text";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import assets from "@assets";
import { MEDIUM_GREY, WHITE } from "@constants/colors";
import { getSavedVouchers } from "@services";
import { showErrorToast } from "@components/Toast";

class SavedDashboardScreen extends Component {
    state = {
        loading: true,
        categories: [],
        vouchersData: [],
    };

    componentDidMount = () => {
        this._fetchData(true);
    };

    _fetchData = (showRefresh) => {
        this.setState({ loading: showRefresh });
        this._fetchVouchers();
    };

    _fetchVouchers = async () => {
        // Call API to get all saved/redeemed vouchers
        try {
            const response = await getSavedVouchers();

            if (response && response.data) {
                console.log(response);

                const { resultList } = response.data;

                // Add "Voucher" category into grid
                let voucherItem = {
                    name: "Voucher",
                    count: resultList.length,
                    bg: assets.bgVoucherCategory,
                };

                this.setState({
                    categories: resultList.length > 0 ? [voucherItem] : null,
                    vouchersData: resultList,
                });
            }
        } catch (error) {
            //  error
            this.setState({ vouchersData: [], categories: [] });

            showErrorToast({
                message: "Unable to retrieve saved items. Please try again later.",
            });
        } finally {
            this.setState({
                loading: false,
            });
        }
    };

    _onBackPress = () => this.props.navigation.goBack();

    _onRefresh() {
        this._fetchData(false);
    }

    _renderEmptyState() {
        return (
            <View style={styles.emptyStateContainer}>
                <View style={styles.emptyStateTxtContainer}>
                    <View style={styles.emptyStateTitle}>
                        <Typo
                            text="No Saved Items"
                            fontSize={18}
                            lineHeight={32}
                            fontWeight="600"
                        />
                    </View>
                    <Typo
                        text="Nothing to see here. Come back later once you've saved something!"
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

        switch (name) {
            case "Voucher":
                this.props.navigation.navigate("SavedVouchers", {
                    vouchersData: this.state.vouchersData,
                });
                break;
            default:
                showErrorToast({
                    message: "Category not found.",
                });
        }
    };

    _renderItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={savedItemStyles.container}
                activeOpacity={0.9}
                onPress={() => this._onCategoryPressed(item.name)}
            >
                <ImageBackground
                    style={savedItemStyles.bgImage}
                    resizeMode={"cover"}
                    source={item.bg}
                >
                    <View style={savedItemStyles.overlayContainer}>
                        <View style={savedItemStyles.contentContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                color={WHITE}
                                textAlign="left"
                                text={item.name}
                            />
                            <Typo
                                fontSize={12}
                                lineHeight={18}
                                color={WHITE}
                                textAlign="left"
                                text={`${item.count} Items`}
                            />
                        </View>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        );
    };

    render() {
        const { loading, categories } = this.state;

        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName="Saved"
            >
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={18}
                    neverForceInset={["bottom"]}
                    useSafeArea
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo text="Saved" fontWeight="600" fontSize={16} lineHeight={19} />
                            }
                            headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                        />
                    }
                >
                    <View style={styles.container}>
                        {/* Body */}
                        {categories && categories.length > 0 ? (
                            <FlatList
                                data={categories}
                                renderItem={this._renderItem}
                                numColumns={2}
                                keyExtractor={(item, index) => index.toString()}
                                onRefresh={() => this._onRefresh()}
                                refreshing={loading}
                            />
                        ) : (
                            !categories && this._renderEmptyState()
                        )}
                    </View>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}
export default SavedDashboardScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    savedGrid: { paddingHorizontal: 18, paddingTop: 16 },
});

const savedItemStyles = StyleSheet.create({
    bgImage: { height: "100%", width: "100%" },
    container: {
        flex: 1,
        flexDirection: "column",
        borderRadius: 8,
        height: 208,
        overflow: "hidden",
        margin: 6,
        maxWidth: "47%",
    },
    contentContainer: { bottom: 14, marginHorizontal: 16, position: "absolute" },
    overlayContainer: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.4)" },
});
