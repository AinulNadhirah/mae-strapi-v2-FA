/* eslint-disable react/jsx-no-bind */

/* eslint-disable no-case-declarations */
import AsyncStorage from "@react-native-community/async-storage";
import { NavigationEvents } from "@react-navigation/compat";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Text, View, Dimensions, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
// import CustomFlashMessage from "@components/Toast";
import FlashMessage from "react-native-flash-message";

import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import { HeaderPageIndicator, ErrorMessage } from "@components/Common";
import { TopMenu } from "@components/TopMenu";

import { withModelContext } from "@context";

import {
    postCollectionRequestWithData,
    getAllBookmarksForUser,
    getAllBookmarksForCollection,
    BookmarkHomeContent,
    LikeHomeContent,
} from "@services/index";

import * as strings from "@constants/strings";
import { ENDPOINT_BASE } from "@constants/url";

import * as ModelClass from "@utils/dataModel/modelClass";

import mainStyles from "@styles/main";

import BookmarksCard from "./BookmarksCard";

const { width, height } = Dimensions.get("window");

class BookmarksList extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            showMenu: false,
            deleteCollection: false,
            deleteBookmark: false,
            deleteBookmarkWithOptions: false,
            collectionData: ModelClass.CURRENT_COLLECTION_DATA,
            bookmarks: [],
            serviceUnavailError: false,
            loadBookmarks: false,
        };
        console.log("in const BookmarksList");
        // this.onFocusCall();
    }

    menuArray = [
        {
            menuLabel: strings.RENAME_COLLECTION,
            menuParam: "renameCollection",
        },
        {
            menuLabel: strings.DELETE_COLLECTION,
            menuParam: "deleteCollection",
        },
    ];

    bookmarks = [
        {
            title: "Starbucks Coffee",
            subHeading: "Start the morning with your favorite drink.",
            link: "SAVE RM 3 WITH QR PAY",
        },
        {
            title: "Starbucks Coffee",
            subHeading: "Start the morning with your favorite drink.",
            link: "SAVE RM 3 WITH QR PAY",
        },
        {
            title: "Starbucks Coffee",
            subHeading: "Start the morning with your favorite drink.",
            link: "SAVE RM 3 WITH QR PAY",
        },
        {
            title: "Starbucks Coffee",
            subHeading: "Start the morning with your favorite drink.",
            link: "SAVE RM 3 WITH QR PAY",
        },
    ];

    componentDidMount() {}

    async onFocusCall() {
        if (ModelClass.COLLECTION_RENAME.collectionRenamed) {
            // CustomFlashMessage.showContentSaveMessage(
            //     strings.COLLECTION_RENAMED,
            //     "",
            //     "bottom",
            //     "info"
            // );
            ModelClass.COLLECTION_RENAME = {
                collectionRenamed: false,
                collectionName: "",
            };
        }
        if (ModelClass.BOOKMARK_MOVEMENT.bookmarkRemoved) {
            // CustomFlashMessage.showContentSaveMessage(
            //     strings.BOOKMARK_REMOVED,
            //     "",
            //     "bottom",
            //     "info"
            // );
            ModelClass.BOOKMARK_MOVEMENT = {
                bookmarkRemoved: false,
                bookmarkMoved: false,
                collectionName: "",
            };
        }

        console.log("collectionData - - - ", ModelClass.CURRENT_COLLECTION_DATA);
        await this.setState({ collectionData: ModelClass.CURRENT_COLLECTION_DATA });

        if (this.state.collectionData.defaultType === "ALL") {
            await this.getAllBookmarksForUser();
        } else {
            await this.getAllBookmarksForCollection();
        }
    }

    async getAllBookmarksForUser() {
        console.log(
            "collectionData in model getAllBookmarksForUser - - - ",
            ModelClass.CURRENT_COLLECTION_DATA
        );
        console.log(
            "this.state.collectionData.collectionId getAllBookmarksForUser - - - - " +
                this.state.collectionData.collectionId
        );
        let variables = {
            mayaAuthorization: ModelClass.COMMON_DATA.serverAuth + ModelClass.COMMON_DATA.mayaToken,
            pageSize: "0",
            pageNumber: "1",
        };
        getAllBookmarksForUser(variables)
            .then((response) => {
                this.setState({
                    bookmarks: response.data.data.getBookMarkedContentByUserId.resultList,
                    loadBookmarks: true,
                });
                console.log(response.data.data.getBookMarkedContentByUserId.resultList);
            })
            .catch((err) => {
                console.log("err All- - " + JSON.stringify(err));
                this.setState({ serviceUnavailError: true });
            });
    }

    async getAllBookmarksForCollection() {
        console.log(
            "collectionData in model getAllBookmarksForCollection - - - ",
            ModelClass.CURRENT_COLLECTION_DATA
        );
        console.log(
            "this.state.collectionData.collectionId getAllBookmarksForCollection - - - - " +
                this.state.collectionData.collectionId
        );
        let variables = {
            mayaAuthorization: ModelClass.COMMON_DATA.serverAuth + ModelClass.COMMON_DATA.mayaToken,
            pageSize: "0",
            pageNumber: "1",
            collectionId: this.state.collectionData.collectionId,
        };
        getAllBookmarksForCollection(variables)
            .then((response) => {
                this.setState({
                    bookmarks: response.data.data.getContentByCollectionId.resultList,
                    loadBookmarks: true,
                });
                console.log(response);
            })
            .catch((err) => {
                console.log("err one- - " + JSON.stringify(err));
                this.setState({ serviceUnavailError: true });
            });
    }

    async linkPressed(item) {
        console.log(item);
        NavigationService.navigate(navigationConstant.HOME_DETAILS_SCREEN, {
            itemDetails: item,
            callPage: "Bookmarks",
        });
    }

    async likePressed(item) {
        console.log(item);

        const { getModel } = this.props;
        const { cmsUrl, cmsCloudEnabled } = getModel("cloud");
        const endpoint = cmsCloudEnabled ? cmsUrl : `${ENDPOINT_BASE}/user/v2/users`;

        LikeHomeContent(endpoint, item.id)
            .then(async (respone) => {
                console.log(" like Response: ", respone);
                this.onFocusCall();
            })
            .catch((err) => {
                console.log(" like ERROR: ", err);
                this.setState({ serviceUnavailError: true });
            });
    }

    itemToDelete = {};
    async bookmarkPressed(item) {
        console.log(item);
        this.itemToDelete = item;
        if (this.state.collectionData.defaultType === "ALL") {
            this.setState({ deleteBookmark: true });
        } else {
            this.setState({ deleteBookmarkWithOptions: true });
        }
    }

    async showAllItems() {
        console.log("collectionData - - - " + JSON.stringify(this.state.collectionData));
        ModelClass.CURRENT_COLLECTION_DATA = {
            collectionId: null,
            userId: this.state.collectionData.userId,
            collectionName: "All Items",
            backgroundImage: null,
            isActive: 1,
            defaultType: "ALL",
            isDeleted: null,
            numberOfItems: null,
        };
        this.setState({
            collectionData: {
                collectionId: null,
                userId: this.state.collectionData.userId,
                collectionName: "All Items",
                backgroundImage: null,
                isActive: 1,
                defaultType: "ALL",
                isDeleted: null,
                numberOfItems: null,
            },
            loadBookmarks: false,
        });
        await this.getAllBookmarksForUser();
    }

    renderBookmarks() {
        let bookmarksArray = [];
        for (let i = 0; i < this.state.bookmarks.length; i++) {
            bookmarksArray.push(
                <View key={i}>
                    <BookmarksCard
                        data={this.state.bookmarks[i]}
                        bookmarkPressed={(item) => this.bookmarkPressed(item)}
                        likePressed={(item) => this.likePressed(item)}
                        linkPressed={(item) => this.linkPressed(item)}
                    />
                </View>
            );
        }
        return bookmarksArray;
    }

    async handleItemPress(param) {
        this.setState({ showMenu: false });
        switch (param) {
            case "renameCollection":
                let navData = {
                    rename: true,
                    addOnly: false,
                    collectionData: this.state.collectionData,
                };
                NavigationService.navigateToModule(
                    navigationConstant.BOOKMARKS_MODULE,
                    navigationConstant.ADD_NEW_COLLECTION,
                    { navData: navData }
                );
                break;
            case "deleteCollection":
                // Added Set timeout to Remove TopMenu Overlay Properly
                var current = this;
                setTimeout(function () {
                    current.setState({ deleteCollection: true });
                }, 100);
                break;
        }
    }

    async deleteCollection() {
        console.log("in delete - - " + parseFloat(this.state.collectionData.collectionId));
        await postCollectionRequestWithData(
            "/deleteCollection?collectionId=" + this.state.collectionData.collectionId
        )
            .then((collectionData) => {
                console.log("rename collection res is - - - " + JSON.stringify(collectionData));
                ModelClass.CURRENT_COLLECTION_DATA = {};
                NavigationService.resetAndNavigateToModule(
                    navigationConstant.BOOKMARKS_MODULE,
                    navigationConstant.BOOKMARKS_DASHBOARD
                );
            })
            .catch((err) => {
                console.log("save new err is 5 - - - " + JSON.stringify(err));
                this.setState({ serviceUnavailError: true });
            });
    }

    async deleteBookmarkFromAll() {
        console.log("in delete - - " + parseFloat(this.state.collectionData.collectionId));
        await BookmarkHomeContent(this.itemToDelete.id)
            .then(async (respone) => {
                console.log(" bookmark Response: ", respone);
                this.itemToDelete = {};
                ModelClass.BOOKMARK_MOVEMENT = {
                    bookmarkRemoved: true,
                    bookmarkMoved: false,
                    collectionName: "",
                };
                this.onFocusCall();
            })
            .catch((err) => {
                this.itemToDelete = {};
                console.log(" bookmark ERROR: ", err);
                this.setState({ serviceUnavailError: true });
            });
    }

    async deleteBookmarkFromCollection() {
        const userId = await AsyncStorage.getItem("mayaUserId");
        console.log(
            "in deleteBookmarkFromCollection - - " +
                parseFloat(this.state.collectionData.collectionId)
        );
        let reqData = {
            collectionId: null,
            contentId: this.itemToDelete.id,
            isActive: 1,
            userId: userId,
        };
        await postCollectionRequestWithData("/updateCollectionId", JSON.stringify(reqData))
            .then((collectionData) => {
                console.log(
                    "deleteBookmarkFromCollection res is - - - " + JSON.stringify(collectionData)
                );
                this.itemToDelete = {};
                ModelClass.BOOKMARK_MOVEMENT = {
                    bookmarkRemoved: true,
                    bookmarkMoved: false,
                    collectionName: "",
                };
                this.onFocusCall();
            })
            .catch((err) => {
                this.itemToDelete = {};
                console.log("deleteBookmarkFromCollection err is - - - " + JSON.stringify(err));
                this.setState({ serviceUnavailError: true });
            });
    }

    cardPressed(item) {
        alert(JSON.stringify(item));
    }

    backPress() {
        ModelClass.CURRENT_COLLECTION_DATA = {};
        NavigationService.navigateToModule(
            navigationConstant.BOOKMARKS_MODULE,
            navigationConstant.BOOKMARKS_DASHBOARD
        );
    }

    navQuickActions = async () => {
        NavigationService.navigateToModule(
            navigationConstant.QUICK_ACTIONS_MODULE,
            navigationConstant.QUICK_ACTION_HOME
        );
    };

    render() {
        return (
            <View style={mainStyles.mayaBackground} accessibilityLabel="MainView" testID="MainView">
                <NavigationEvents onDidFocus={() => this.onFocusCall()} />
                <View>
                    {this.state.collectionData.defaultType === "ALL" ? (
                        <HeaderPageIndicator
                            showTitleCenter={true}
                            pageTitle={strings.ALL_COLLECTION}
                            showTitle={true}
                            navigation={this.props.navigation}
                            showBack={true}
                            noPop={true}
                            onBackPress={() => {
                                this.backPress();
                            }}
                            showClose={false}
                            noClose={true}
                        />
                    ) : (
                        <HeaderPageIndicator
                            showTitleCenter={true}
                            pageTitle={this.state.collectionData.collectionName}
                            showTitle={true}
                            navigation={this.props.navigation}
                            showBack={true}
                            noPop={true}
                            onBackPress={() => {
                                this.backPress();
                            }}
                            showMore={true}
                            onMorePress={() => this.setState({ showMenu: true })}
                        />
                    )}
                </View>

                {this.state.showMenu ? (
                    <TopMenu
                        onClose={() => {
                            this.setState({ showMenu: false });
                        }}
                        navigation={this.props.navigation}
                        menuArray={this.menuArray}
                        onItemPress={(obj) => this.handleItemPress(obj)}
                    />
                ) : null}

                <View style={Styles.marginSpaceTop} />
                <View style={Styles.listContainer}>
                    {this.state.loadBookmarks ? (
                        this.state.bookmarks.length > 0 ? (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {this.renderBookmarks()}
                                <View style={Styles.marginSpaceBottomScroll} />
                            </ScrollView>
                        ) : (
                            <View style={Styles.emptyContainer}>
                                <View
                                    style={Styles.emptyListHeadingView}
                                    testID={"emptyListHeadingView"}
                                    accessibilityLabel={"emptyListHeadingView"}
                                >
                                    <Text
                                        style={Styles.emptyListHeading}
                                        testID={"emptyListHeading"}
                                        accessibilityLabel={"emptyListHeading"}
                                    >
                                        {strings.NO_ITEMS}
                                    </Text>
                                </View>
                                <View
                                    style={Styles.emptyListBodyView}
                                    testID={"emptyListBodyView"}
                                    accessibilityLabel={"emptyListBodyView"}
                                >
                                    <Text
                                        style={Styles.emptyListBody}
                                        testID={"emptyListBody"}
                                        accessibilityLabel={"emptyListBody"}
                                    >
                                        {strings.NO_ITEMS_BODY}
                                    </Text>
                                </View>
                                {this.state.collectionData.defaultType === "ALL" ? null : (
                                    <TouchableOpacity
                                        style={Styles.showAllButton}
                                        testID={"showAllButton"}
                                        accessibilityLabel={"showAllButton"}
                                        onPress={() => this.showAllItems()}
                                    >
                                        <Text
                                            style={Styles.showAllText}
                                            testID={"showAllText"}
                                            accessibilityLabel={"showAllText"}
                                        >
                                            {strings.VIEW_ALL_ITEMS}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )
                    ) : null}
                </View>

                {this.state.deleteCollection == true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ deleteCollection: false });
                        }}
                        title={strings.DELETE_COLLECTION}
                        description={strings.DELETE_COLLECTION_BODY}
                        deleteCollection={true}
                        customParam1={"Yes"}
                        customParam2={"No"}
                        onYesPress={() => {
                            this.setState({ deleteCollection: false });
                            this.deleteCollection();
                        }}
                        onNoPress={() => {
                            this.setState({ deleteCollection: false });
                        }}
                    />
                ) : null}

                {this.state.deleteBookmarkWithOptions === true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ deleteBookmarkWithOptions: false });
                        }}
                        title={strings.REMOVE_ITEM}
                        description={strings.REMOVE_ITEM_BODY}
                        deleteCollection={true}
                        customParam1={strings.REMOVE_FROM_COLLECTION}
                        customParam2={strings.REMOVE}
                        onYesPress={() => {
                            this.setState({ deleteBookmarkWithOptions: false });
                            this.deleteBookmarkFromCollection();
                        }}
                        onNoPress={() => {
                            this.setState({ deleteBookmarkWithOptions: false });
                            this.deleteBookmarkFromAll();
                        }}
                    />
                ) : null}

                {this.state.deleteBookmark === true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ deleteBookmark: false });
                        }}
                        title={strings.REMOVE_BOOKMARK}
                        description={strings.REMOVE_BOOKMARK_BODY}
                        deleteCollection={true}
                        customParam1={"Yes"}
                        customParam2={"No"}
                        onYesPress={() => {
                            this.setState({ deleteBookmark: false });
                            this.deleteBookmarkFromAll();
                        }}
                        onNoPress={() => {
                            this.setState({ deleteBookmark: false });
                        }}
                    />
                ) : null}

                <FlashMessage style={{ marginBottom: 30, alignedText: "center" }} />

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

                {/* <FloatingAction
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

                {/* <FlashMessage style={{ marginBottom: 30, alignedText: "center" }} /> */}
            </View>
        );
    }
}

export default withModelContext(BookmarksList);

const Styles = StyleSheet.create({
    listContainer: {
        backgroundColor: "white",
        height: height - 50 - (height * 20) / 667,
        width: width,
        alignItems: "center",
    },
    emptyContainer: {
        backgroundColor: "#f8f5f3",
        height: height - 50 - (height * 20) / 667,
        width: width,
        alignItems: "center",
    },
    marginSpaceTop: {
        height: (height * 20) / 667,
        backgroundColor: "#c0e4f2",
    },
    marginSpaceBottomScroll: {
        height: (height * 120) / 667,
        backgroundColor: "white",
    },
    emptyListHeadingView: {
        marginTop: (80 * height) / 667,
        width: (275 * width) / 375,
        alignItems: "center",
    },
    emptyListHeading: {
        fontFamily: "Montserrat-Light",
        fontSize: 23,
        lineHeight: 33,
        color: "black",
        textAlign: "center",
    },
    emptyListBodyView: {
        marginTop: (10 * height) / 667,
        width: (275 * width) / 375,
        alignItems: "center",
    },
    emptyListBody: {
        fontFamily: "Montserrat-Light",
        fontSize: 13,
        lineHeight: 19,
        color: "#7f7f7f",
        textAlign: "center",
    },
    showAllButton: {
        marginTop: (15 * height) / 667,
        width: (275 * width) / 375,
        alignItems: "center",
    },
    showAllText: {
        fontFamily: "Montserrat-Bold",
        fontSize: 11,
        lineHeight: 16,
        color: "#2477cf",
        textAlign: "center",
    },
});
