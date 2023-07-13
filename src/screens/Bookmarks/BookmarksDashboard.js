import {
    Text,
    View,
    Image,
    Dimensions,
    TouchableOpacity,
    Linking,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import React, { Component } from "react";
import CollectionsCard from "./CollectionsCard";
import mainStyles from "@styles/main";
import { NavigationEvents } from "@react-navigation/compat";
import { HeaderPageIndicator } from "@components/Common/HeaderPageIndicator";
import * as navigationConstant from "@navigation/navigationConstant";
import * as strings from "@constants/strings";
import * as ModelClass from "@utils/dataModel/modelClass";
import { FloatingAction } from "react-native-floating-action";
import NavigationService from "@navigation/navigationService";
// import CustomFlashMessage from "@components/Toast";
import FlashMessage from "react-native-flash-message";

import Drawer from "react-native-drawer";
import HomeScreenStyle from "@styles/Home/HomeTabScreen";
import commonStyle from "@styles/main";
import * as data from "@constants/data";
import { Query } from "react-apollo";
import { TOKEN_TYPE_MAYA } from "@constants/api";
import { getCollectionsRequestWithoutData } from "@services";
import { ErrorMessage } from "@components/Common";

const { width, height } = Dimensions.get("window");

export default class BookmarksDashboard extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            draweropen: false,
            iswallectCheck: false,
            collectionsList: [],
            serviceUnavailError: false,
            image: ModelClass.ISPROFILEIMAGE
                ? { uri: ModelClass.USER_DATA.profilePic }
                : require("@assets/icons/ic_dp_default.png"),
        };
        this.getCollections();
    }

    collections = [
        {
            collectionName: "All Items",
            numberOfItems: 8,
            backgroundImage: require("@assets/images/all-items.jpeg"),
            defaultType: "ALL",
        },
        {
            collectionName: "Shopping: Wishlist",
            numberOfItems: 2,
            backgroundImage: require("@assets/images/shopping.jpeg"),
            defaultType: "OTHERS",
        },
        {
            collectionName: "Travel: Wishlist",
            numberOfItems: 3,
            backgroundImage: require("@assets/images/travel.jpeg"),
            defaultType: "OTHERS",
        },
        {
            collectionName: "Food & Beverage: Wishlist",
            numberOfItems: 3,
            backgroundImage: require("@assets/images/food.jpeg"),
            defaultType: "OTHERS",
        },
    ];

    componentDidMount() {}

    getCollections = async () => {
        await getCollectionsRequestWithoutData("/getAllCollections")
            .then((collectionsList) => {
                console.log(JSON.stringify(collectionsList.data.resultList));
                this.setState({ collectionsList: collectionsList.data.resultList });
            })
            .catch((err) => {
                console.log(JSON.stringify(err));
                this.setState({ serviceUnavailError: true });
            });
    };

    mainClosePress() {
        NavigationService.resetRoot();
    }

    addCollection() {
        let navData = {
            rename: false,
            addOnly: true,
            callBackPage: "Bookmarks",
        };
        NavigationService.navigateToModule(
            navigationConstant.BOOKMARKS_MODULE,
            navigationConstant.ADD_NEW_COLLECTION,
            {
                navData: navData,
            }
        );
    }

    onFocusCall = async () => {
        this.getCollections();
        // CustomFlashMessage.showContentSaveMessage(
        //     strings.COLLECTION_RENAMED,
        //     "",
        //     "bottom",
        //     "info"
        // );
    };

    renderCollections() {
        let collectionsArray = [];
        for (let i = 0; i < this.state.collectionsList.length; i++) {
            if (this.state.collectionsList[i].isActive == 1) {
                collectionsArray.push(
                    <View key={i}>
                        <CollectionsCard
                            collectionData={this.state.collectionsList[i]}
                            cardPressed={(item) => this.cardPressed(item)}
                        />
                    </View>
                );
            }
        }
        return collectionsArray;
    }

    navQuickActions = async () => {
        ModelClass.settings.routeName = navigationConstant.QUICK_ACTION_HOME;
        NavigationService.navigateToModule(
            navigationConstant.QUICK_ACTIONS_MODULE,
            navigationConstant.QUICK_ACTION_HOME
        );
    };

    cardPressed(item) {
        // console.log(item);
        ModelClass.CURRENT_COLLECTION_DATA = {
            collectionId: item.collectionId,
            userId: item.userId,
            collectionName: item.collectionName,
            backgroundImage: item.backgroundImage,
            isActive: item.isActive,
            defaultType: item.defaultType,
            isDeleted: item.isDeleted,
            numberOfItems: item.numberOfItems,
        };
        // NavigationService.navigateToModule(navigationConstant.BOOKMARKS_MODULE, navigationConstant.BOOKMARKS_LIST, { collectionData: item })
        NavigationService.resetAndNavigateToModule(
            navigationConstant.BOOKMARKS_MODULE,
            navigationConstant.BOOKMARKS_LIST
        );
    }

    render() {
        return (
            <Drawer
                open={this.state.draweropen}
                type="overlay"
                content={this.renderSideMenuContent()}
                tapToClose={true}
                openDrawerOffset={0.1}
                panCloseMask={0.2}
                closedDrawerOffset={-3}
                styles={drawerStyles}
                // tweenHandler={(ratio) => ({
                //   main: { opacity: (2 - ratio) / 2 }
                // })}
            >
                <View
                    style={mainStyles.mayaBackground}
                    accessibilityLabel="MainView"
                    testID="MainView"
                >
                    <NavigationEvents onDidFocus={() => this.onFocusCall()} />
                    <View>
                        <HeaderPageIndicator
                            pageTitle={strings.SAVED}
                            showTitle={true}
                            showBack={false}
                            navigation={this.props.navigation}
                            // moduleName={navigationConstant.HOME_DASHBOARD}
                            // routeName={navigationConstant.HOME_DASHBOARD}
                            noPop={true}
                            showClose={true}
                            noClose={true}
                            onClosePress={() => this.mainClosePress()}
                            onBackPress={() => this.onsideMenuPressed()}
                        />
                    </View>
                    <View style={Styles.marginSpaceTop} />
                    <View style={Styles.dashboardContainer}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={Styles.marginSpaceTopScroll} />
                            {this.renderCollections()}
                            <View style={Styles.marginSpaceBottomScroll} />
                        </ScrollView>
                    </View>

                    <FloatingAction
                        color={"#AARRGGBB"}
                        position="left"
                        iconWidth={100}
                        iconHeight={100}
                        listenKeyboard={false}
                        showBackground={false}
                        visible={true}
                        floatingIcon={require("@assets/icons/ic_add_white.png")}
                        onPressMain={() => this.addCollection()}
                    />
                    {/* 
					<FloatingAction
						color={"#AARRGGBB"}
						position="right"
						iconWidth={100}
						iconHeight={100}
						testID={"quickActionButton"}
						accessibilityLabel={"quickActionButton"}
						listenKeyboard={false}
						showBackground={false}
						visible={true}
						testID={"btnMayaIcon"}
						accessibilityLabel={"btnMayaIcon"}
						floatingIcon={require("@assets/icons/ic_maya_floating.png")}
						onPressMain={() => this.navQuickActions()}
					/> */}

                    <FlashMessage style={{ marginBottom: 30, alignedText: "center" }} />
                    {this.state.iswallectCheck === true ? (
                        //todo change to rest isWalletExits
                        <Query
                            query={VALIDATE_WALLET}
                            variables={{
                                tokenType: TOKEN_TYPE_MAYA,
                                mayaAuthorization:
                                    ModelClass.COMMON_DATA.serverAuth +
                                    ModelClass.COMMON_DATA.mayaToken,
                            }}
                            fetchPolicy="network-only"
                        >
                            {({ loading, error, data, refetch }) => {
                                if (error) {
                                    console.log("home Error is ", error);
                                    return <ActivityIndicator color="#ffffff" />;
                                }
                                if (loading) {
                                    return <ActivityIndicator color="#ffffff" />;
                                }
                                if (data) {
                                    console.log(
                                        "isWalletExists Response : " + JSON.stringify(data)
                                    );

                                    this.setState({ iswallectCheck: false });

                                    const { isWalletExists = {} } = data;
                                    if (isWalletExists !== null && isWalletExists.exists) {
                                        AsyncStorage.setItem(
                                            "walletId",
                                            isWalletExists.walletId.toString()
                                        );

                                        NavigationService.navigateToModule(
                                            navigationConstant.WALLET_MODULE,
                                            navigationConstant.WALLET_LOGIN
                                        );
                                    } else {
                                        ModelClass.GOAL_DATA.startFrom = false;
                                        NavigationService.navigateToModule(
                                            navigationConstant.WALLET_MODULE,
                                            navigationConstant.WALLET_START
                                        );
                                    }
                                } else {
                                    console.log("data s Error is ");
                                }
                                return <Text>Return</Text>;
                            }}
                        </Query>
                    ) : null}
                </View>

                {this.state.serviceUnavailError === true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ serviceUnavailError: false });
                        }}
                        title={"M2ULife"}
                        description={strings.SERVER_ERROR}
                        showOk={true}
                        onOkPress={() => {
                            this.setState({ serviceUnavailError: false });
                        }}
                    />
                ) : null}
            </Drawer>
        );
    }

    categoryPressed = (item, index) => {
        this.setState({ draweropen: false });
        if (item.title == "Home") {
            NavigationService.resetRoot();
        } else if (item.title == "Wallet") {
            this.setState({ iswallectCheck: true });
        } else if (item.title == "Fitness") {
            this.onFitnessPress();
        } else if (item.title == "Travel") {
            ModelClass.WEBVIEW_DATA.url = "https://prf.hn/click/camref:1101l4euo";
            ModelClass.WEBVIEW_DATA.share = false;
            ModelClass.WEBVIEW_DATA.type = "url";
            ModelClass.WEBVIEW_DATA.route = navigationConstant.HOME_DASHBOARD;
            ModelClass.WEBVIEW_DATA.module = navigationConstant.HOME_DASHBOARD;
            ModelClass.WEBVIEW_DATA.title = "Travel";
            //ModelClass.WEBVIEW_DATA.pdfType = 'shareReceipt'
            NavigationService.navigateToModule(
                navigationConstant.COMMON_MODULE,
                navigationConstant.WEBVIEW_INAPP_SCREEN
            );

            this.setState({ draweropen: false });
        } else if (item.title == "Food &") {
            NavigationService.navigateToModule(
                navigationConstant.FNB_MODULE,
                navigationConstant.WHEEL_POC
            );
        } else {
            this.setState({ draweropen: false });
        }
    };

    navSettingsScreen = async () => {
        console.log("Navigate to Settings");
        console.log("this.state.image si", this.state.image);
        NavigationService.navigateToModule(
            navigationConstant.SETTINGS_MODULE,
            navigationConstant.SETTINGS_HOME,
            {
                navigationSource: "F",
            }
        );
    };

    onFitnessPress = async () => {
        let m2uUserName = null;
        let isFitSyned = null;
        let isFitReady = null;

        try {
            isFitSyned = await AsyncStorage.getItem("isFitSynced");
        } catch (error) {
            isFitSyned = null;
        }
        if (isFitSyned) {
            // syncd
            NavigationService.navigateToModule(
                navigationConstant.FITNESS_MODULE,
                navigationConstant.FITNESS_DASHBOARD
            );
        } else {
            //  non  syncd
            try {
                isFitReady = await AsyncStorage.getItem("isFitReady");
            } catch (error) {
                isFitReady = null;
            }
            if (isFitReady) {
                NavigationService.navigateToModule(
                    navigationConstant.FITNESS_MODULE,
                    navigationConstant.FITNESS_DASHBOARD
                );
            } else {
                NavigationService.navigateToModule(
                    navigationConstant.FITNESS_MODULE,
                    navigationConstant.FITNESS_LANDING_ONE
                );
            }
        }
    };

    renderSideMenuContent = () => {
        return (
            <View style={{ flex: 1, backgroundColor: "#ffde00" }}>
                <View style={HomeScreenStyle.userProfileView}>
                    <View
                        style={
                            ModelClass.USER_DATA.profilePic == "59"
                                ? HomeScreenStyle.sideMenudefaultImage
                                : HomeScreenStyle.sideMenuavatarImage
                        }
                    >
                        <TouchableOpacity
                            testID={"sideMenuAvatarImage"}
                            style={HomeScreenStyle.imageContainer}
                            accessibilityLabel={"sideMenuAvatarImage"}
                        >
                            {ModelClass.USER_DATA.profilePic != "" && (
                                <Image
                                    style={HomeScreenStyle.image}
                                    source={{ uri: ModelClass.USER_DATA.profilePic }}
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                    <View style={HomeScreenStyle.sideMenuNameView}>
                        <Text
                            style={[
                                HomeScreenStyle.sideMenuName,
                                commonStyle.fontSize15,
                                commonStyle.font,
                            ]}
                            testID={"txtName"}
                            accessibilityLabel={"txtName"}
                        >
                            {ModelClass.COMMON_DATA.username}
                        </Text>

                        <Text
                            style={[
                                HomeScreenStyle.sideMenusubName,
                                commonStyle.fontSize15,
                                commonStyle.font,
                            ]}
                            testID={"txtViewProfil"}
                            accessibilityLabel={"txtViewProfil"}
                        >
                            {"View Profile"}
                        </Text>
                    </View>

                    <View style={HomeScreenStyle.sideMenuSettingIcon}>
                        <TouchableOpacity
                            testID={"sideSettingsIcon"}
                            style={HomeScreenStyle.sideMenusettingsImage}
                            accessibilityLabel={"sideSettingsIcon"}
                            onPress={() => {
                                this.navSettingsScreen();
                            }}
                        >
                            <Image
                                style={HomeScreenStyle.sideMenusettingsImage}
                                source={require("@assets/icons/SideMenu/artboard.png")}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={HomeScreenStyle.categoryContainer}>
                    <FlatList
                        data={data.SIDE_MENU_DATA}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity
                                testID={item.title + item.subText}
                                accessibilityLabel={item.title + item.subText}
                                style={HomeScreenStyle.collectioncontainer}
                                onPress={() => {
                                    this.categoryPressed(item, index);
                                }}
                            >
                                <View style={HomeScreenStyle.collectionView}>
                                    <Image
                                        style={item.imageStyle}
                                        source={item.path}
                                        testID={"CategoryImage"}
                                        accessibilityLabel={"CategoryImage"}
                                    />
                                    <Text
                                        style={HomeScreenStyle.categoryText}
                                        testID={"txtTitle"}
                                        accessibilityLabel={"txtTitle"}
                                    >
                                        {item.title}
                                    </Text>
                                    <Text
                                        style={HomeScreenStyle.categorySubText}
                                        testID={"txtSubText"}
                                        accessibilityLabel={"txtSubText"}
                                    >
                                        {item.subText}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        //Setting the number of column
                        numColumns={3}
                        // keyExtractor={(item, index) => index}
                    />
                </View>
            </View>
        );
    };

    onsideMenuPressed = () => {
        console.log("Side Menu clicked");
        this.setState({ draweropen: true });
    };
}
const drawerStyles = {
    drawer: { shadowColor: "#000000", shadowOpacity: 0.8, shadowRadius: 3 },
    main: { paddingLeft: 3 },
};

const Styles = StyleSheet.create({
    dashboardContainer: {
        backgroundColor: "#f8f5f3",
        height: height - 50 - (height * 20) / 667,
        alignItems: "center",
    },
    marginSpaceTop: {
        height: (height * 20) / 667,
        backgroundColor: "#c0e4f2",
    },
    marginSpaceTopScroll: {
        height: (height * 30) / 667,
        backgroundColor: "transparent",
    },
    marginSpaceBottomScroll: {
        height: (height * 120) / 667,
        backgroundColor: "transparent",
    },
});
