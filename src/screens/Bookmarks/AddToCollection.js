import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
    ImageBackground,
    AsyncStorage,
} from "react-native";
import { NavigationEvents, withNavigation } from "@react-navigation/compat";
import * as Strings from "@constants/strings";
import NavigationService from "@navigation/navigationService";
import * as navigationConstant from "@navigation/navigationConstant";
import { postCollectionRequestWithData, getCollectionsRequestWithoutData } from "@services/index";
import * as ModelClass from "@utils/dataModel/modelClass";
import { BlurView } from "@components/Common/index";
import { ErrorMessage } from "@components/Common";

export const { width, height } = Dimensions.get("window");

class AddToCollection extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            usageParams: this.props.route.params?.usageParams ?? "",
            move: this.props.route.params?.move ?? "",
            currentCollectionId: this.props.route.params.move
                ? ModelClass.CURRENT_COLLECTION_ID
                : 0,
            collectionsList: [],
            serviceUnavailError: false,
        };
        this.getAllCollections();
    }

    componentDidMount() {
        // console.log("AddTo componentDidMount - - - "+JSON.stringify(this.props.route.params?.usageParams")));
        this.setState({
            usageParams: this.props.route.params?.usageParams ?? "",
            move: this.props.route.params?.move ?? "",
        });
    }

    getAllCollections = async () => {
        const userId = await AsyncStorage.getItem("mayaUserId");
        // await getCollectionsRequestWithoutData("/getAllCollections?userId=" + userId).then((collectionsList) => {
        await getCollectionsRequestWithoutData("/getAllCollections")
            .then((collectionsList) => {
                console.log(JSON.stringify(collectionsList.data.resultList));
                collectionsList.data.resultList.push({
                    collectionName: "",
                    backgroundImage: require("@assets/icons/addCard.png"),
                });
                if (this.state.move) {
                    console.log("in getAllCollections = = ", this.state.currentCollectionId);
                    this.setState({ currentCollectionId: ModelClass.CURRENT_COLLECTION_ID });
                }
                this.setState({ collectionsList: collectionsList.data.resultList.slice(1) });
            })
            .catch((err) => {
                console.log(JSON.stringify(err));
                this.setState({ serviceUnavailError: true });
            });
    };

    collections = [
        {
            collectionName: "Shopping: Wishlist",
            numberOfItems: 2,
            backgroundImage: require("@assets/Fitness/ic_banana.png"),
        },
        {
            collectionName: "Travel: Wishlist",
            numberOfItems: 3,
            // backgroundImage: require("@assets/Fitness/ic_banana.png"),
        },
        {
            collectionName: "Food & Beverage: Wishlist",
            numberOfItems: 3,
            backgroundImage: require("@assets/Fitness/ic_banana.png"),
        },
        {
            collectionName: "",
            backgroundImage: require("@assets/icons/addCard.png"),
        },
    ];

    scrollToRow(itemIndex) {
        if (itemIndex == 0) {
            this._scrollView.scrollTo({ x: 0 });
        } else {
            this._scrollView.scrollTo({ x: (148 * itemIndex * width) / 375 });
        }
    }

    async collectionCardPress(option, index) {
        if (this.state.move) {
            if (this.state.collectionsList.length > 2) {
                this.scrollToRow(index);
            }
            if (option.collectionName == "") {
                let navData = {
                    rename: false,
                    addOnly: false,
                    contentId: this.state.usageParams.contentId,
                    callBackPage: this.state.usageParams.usagePage,
                    move: true,
                };
                NavigationService.navigateToModule(
                    navigationConstant.BOOKMARKS_MODULE,
                    navigationConstant.ADD_NEW_COLLECTION,
                    { navData: navData }
                );
            } else {
                this.setState({ currentCollectionId: option.collectionId });
            }
        } else {
            if (option.collectionName == "") {
                let navData = {
                    rename: false,
                    addOnly: false,
                    contentId: this.state.usageParams.contentId,
                    callBackPage: this.state.usageParams.usagePage,
                };
                NavigationService.navigateToModule(
                    navigationConstant.BOOKMARKS_MODULE,
                    navigationConstant.ADD_NEW_COLLECTION,
                    { navData: navData }
                );
            } else {
                const userId = await AsyncStorage.getItem("mayaUserId");
                let reqData = {
                    collectionId: option.collectionId,
                    contentId: this.state.usageParams.contentId,
                    isActive: option.isActive,
                    userId: userId,
                };
                console.log(option);
                await postCollectionRequestWithData("/updateCollectionId", JSON.stringify(reqData))
                    .then((collectionData) => {
                        console.log(
                            "rename collection res is - - - " + JSON.stringify(collectionData)
                        );
                        ModelClass.COLLECTION_MOVEMENT = {
                            moveTriggered: true,
                            collectionMoved: true,
                            collectionName: option.collectionName,
                            collectionId: option.collectionId,
                        };
                        this.onClose();
                    })
                    .catch((err) => {
                        console.log("save new err is 3 - - - " + JSON.stringify(err));
                        this.setState({ serviceUnavailError: true });
                    });
            }
        }
    }

    onClose() {
        console.log("this.state.usageParams.usagePage - - - - " + this.state.usageParams.usagePage);
        if (this.state.usageParams.usagePage == "Home") {
            NavigationService.navigateToModule(navigationConstant.TAB_NAVIGATOR);
        } else if (this.state.usageParams.usagePage == "HomeDetails") {
            console.log("navigating to homeDetails");
            this.props.navigation.navigate(navigationConstant.HOME_DETAILS_SCREEN, {
                itemDetails: ModelClass.CURRENT_CONTENT_DATA,
                callPage: ModelClass.HOME_DETAILS_CALLPAGE,
            });
        }
    }

    async moveAndClose() {
        const userId = await AsyncStorage.getItem("mayaUserId");
        if (this.state.currentCollectionId != 0) {
            if (this.state.currentCollectionId != ModelClass.CURRENT_COLLECTION_ID) {
                let reqData = {
                    collectionId: this.state.currentCollectionId,
                    contentId: this.state.usageParams.contentId,
                    isActive: 1,
                    userId: userId,
                };
                console.log("currentCollectionId - - ", this.state.currentCollectionId);
                await postCollectionRequestWithData("/updateCollectionId", JSON.stringify(reqData))
                    .then((collectionData) => {
                        console.log(
                            "moveAndClose update collection res is - - - " +
                                JSON.stringify(collectionData.data.result)
                        );
                        // set variable for toast and close
                        ModelClass.BOOKMARK_MOVEMENT = {
                            bookmarkRemoved: false,
                            bookmarkMoved: true,
                            collectionName: collectionData.data.result.collectionName,
                        };
                        ModelClass.CURRENT_CONTENT_DATA.collectionId =
                            collectionData.data.result.collectionId;
                        this.onClose();
                    })
                    .catch((err) => {
                        console.log("save new err is 4 - - - " + JSON.stringify(err));
                        this.setState({ serviceUnavailError: true });
                    });
            } else {
                this.onClose();
            }
        } else {
            this.onClose();
        }
    }

    renderCollections() {
        console.log("renderCollection");
        let collectionsArray = [];
        let item;
        let collectionTitle = "";
        let backgroundImage = "";
        for (let index = 0; index < this.state.collectionsList.length; index++) {
            switch (this.state.collectionsList[index].defaultType) {
                case "ALL":
                    collectionTitle = Strings.ALL_COLLECTION;
                    backgroundImage = require("@assets/images/all-items.jpeg");
                    break;
                case "FOOD":
                    collectionTitle =
                        this.state.collectionsList[index].collectionName == ""
                            ? Strings.FOOD_COLLECTION
                            : this.state.collectionsList[index].collectionName;
                    backgroundImage =
                        this.state.collectionsList[index].isActive == 0
                            ? require("@assets/images/food.jpeg")
                            : this.state.collectionsList[index].backgroundImage
                            ? {
                                  uri:
                                      "data:image/jpeg;base64," +
                                      this.state.collectionsList[index].backgroundImage,
                              }
                            : require("@assets/images/food.jpeg");
                    break;
                case "TRAVEL":
                    collectionTitle =
                        this.state.collectionsList[index].collectionName == ""
                            ? Strings.TRAVEL_COLLECTION
                            : this.state.collectionsList[index].collectionName;
                    backgroundImage =
                        this.state.collectionsList[index].isActive == 0
                            ? require("@assets/images/travel.jpeg")
                            : this.state.collectionsList[index].backgroundImage
                            ? {
                                  uri:
                                      "data:image/jpeg;base64," +
                                      this.state.collectionsList[index].backgroundImage,
                              }
                            : require("@assets/images/travel.jpeg");
                    break;
                case "SHOPPING":
                    collectionTitle =
                        this.state.collectionsList[index].collectionName == ""
                            ? Strings.SHOP_COLLECTION
                            : this.state.collectionsList[index].collectionName;
                    backgroundImage =
                        this.state.collectionsList[index].isActive == 0
                            ? require("@assets/images/shopping.jpeg")
                            : this.state.collectionsList[index].backgroundImage
                            ? {
                                  uri:
                                      "data:image/jpeg;base64," +
                                      this.state.collectionsList[index].backgroundImage,
                              }
                            : require("@assets/images/shopping.jpeg");
                    break;
                case "OTHERS":
                    collectionTitle = this.state.collectionsList[index].collectionName;
                    backgroundImage = this.state.collectionsList[index].backgroundImage
                        ? {
                              uri:
                                  "data:image/jpeg;base64," +
                                  this.state.collectionsList[index].backgroundImage,
                          }
                        : "";
                    break;
                default:
                    collectionTitle = this.state.collectionsList[index].collectionName;
                    backgroundImage = this.state.collectionsList[index].backgroundImage;
                    break;
            }
            collectionsArray.push(
                <TouchableOpacity
                    onPress={() => {
                        this.collectionCardPress(this.state.collectionsList[index], index);
                    }}
                >
                    <View
                        style={
                            this.state.collectionsList.length == 1
                                ? styles.collectionButtonSingle
                                : index === 0
                                ? styles.collectionButtonFirst
                                : index === this.state.collectionsList.length - 1
                                ? styles.collectionButtonLast
                                : styles.collectionButton
                        }
                    >
                        <ImageBackground
                            style={styles.imageBackgroundView}
                            source={backgroundImage}
                            imageStyle={styles.collectionButtonImage}
                        >
                            {index === this.state.collectionsList.length - 1 ? null : (
                                <Text
                                    style={[
                                        styles.collectionTitle,
                                        { color: backgroundImage == "" ? "black" : "white" },
                                    ]}
                                >
                                    {collectionTitle}
                                </Text>
                            )}
                            {index === this.state.collectionsList.length - 1 ? null : this.state
                                  .move &&
                              this.state.currentCollectionId ==
                                  this.state.collectionsList[index].collectionId ? (
                                <Text
                                    style={[
                                        styles.collectionItemCount,
                                        { color: backgroundImage == "" ? "black" : "white" },
                                    ]}
                                >
                                    {Strings.CURRENTLY_ADDED}
                                </Text>
                            ) : (
                                <Text
                                    style={[
                                        styles.collectionItemCount,
                                        { color: backgroundImage == "" ? "black" : "white" },
                                    ]}
                                >
                                    {this.state.collectionsList[index].numberOfItems
                                        ? this.state.collectionsList[index].numberOfItems
                                        : "0"}
                                    {this.state.collectionsList[index].numberOfItems == 1
                                        ? " item"
                                        : " items"}
                                </Text>
                            )}
                        </ImageBackground>
                    </View>
                </TouchableOpacity>
            );
        }
        return collectionsArray;
    }

    render() {
        return (
            // <Modal
            //     visible={true}
            //     transparent={true}
            //     animationType="slide"
            //     onRequestClose={exitAlert}>

            <BlurView>
                <NavigationEvents onDidFocus={() => this.getAllCollections()} />
                <View style={styles.primaryView}>
                    <View style={styles.pageTitleView}>
                        <Text style={styles.pageTitleText}>
                            {this.state.move ? Strings.MOVE_ITEM_TITLE : Strings.ITEM_SAVED_TITLE}
                        </Text>
                    </View>
                    <View style={styles.bodyView}>
                        <Text style={styles.bodyText}>
                            {this.state.move ? Strings.MOVE_ITEM_BODY : Strings.ITEM_SAVED_BODY}
                        </Text>
                    </View>
                    <View style={styles.collectionItemView}>
                        {this.state.collectionsList ? (
                            <ScrollView
                                ref={(view) => (this._scrollView = view)}
                                showsHorizontalScrollIndicator={false}
                                horizontal={true}
                            >
                                {this.renderCollections()}
                            </ScrollView>
                        ) : null}
                    </View>
                    <TouchableOpacity
                        testID="crossButton"
                        accessibilityID="crossButton"
                        style={styles.crossButton}
                        onPress={() => (this.state.move ? this.moveAndClose() : this.onClose())}
                    >
                        <Image
                            testID="crossImage"
                            accessibilityID="crossImage"
                            style={styles.widgetImage}
                            source={require("@assets/icons/crossIcon.png")}
                        />
                    </TouchableOpacity>
                </View>

                {this.state.serviceUnavailError === true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ serviceUnavailError: false });
                        }}
                        title={"M2ULife"}
                        description={Strings.SERVER_ERROR}
                        showOk={true}
                        onOkPress={() => {
                            this.setState({ serviceUnavailError: false });
                        }}
                    />
                ) : null}
            </BlurView>
            // </Modal >
        );
    }
}

const styles = StyleSheet.create({
    primaryView: {
        flex: 1,
        // backgroundColor: "green",
    },
    pageTitleView: {
        marginTop: (220 * height) / 667,
        marginLeft: (50 * width) / 375,
        marginRight: (20 * width) / 375,
        height: (23 * height) / 667,
    },
    pageTitleText: {
        fontFamily: "Montserrat-SemiBold",
        fontSize: 17,
        lineHeight: 23,
        color: "white",
    },
    bodyView: {
        marginLeft: (50 * width) / 375,
        marginRight: (20 * width) / 375,
        marginTop: (5 * height) / 667,
        justifyContent: "center",
    },
    bodyText: {
        fontFamily: "Montserrat-Light",
        fontSize: 23,
        lineHeight: 33,
        color: "white",
    },
    collectionItemView: {
        height: (191 * height) / 667,
        marginTop: (30 * height) / 667,
        flexDirection: "row",
    },
    collectionButton: {
        width: (138 * width) / 375,
        height: (191 * height) / 667,
        backgroundColor: "white",
        borderRadius: (15 * width) / 375,
        marginLeft: (10 * width) / 375,
    },
    collectionButtonFirst: {
        width: (138 * width) / 375,
        height: (191 * height) / 667,
        backgroundColor: "white",
        borderRadius: (15 * width) / 375,
        marginLeft: (45 * width) / 375,
    },
    collectionButtonLast: {
        width: (138 * width) / 375,
        height: (191 * height) / 667,
        backgroundColor: "white",
        borderRadius: (15 * width) / 375,
        marginLeft: (10 * width) / 375,
        marginRight: (45 * width) / 375,
    },
    collectionButtonSingle: {
        width: (138 * width) / 375,
        height: (191 * height) / 667,
        backgroundColor: "white",
        borderRadius: (15 * width) / 375,
        marginLeft: (118.5 * width) / 375,
    },
    imageBackgroundView: {
        backgroundColor: "transparent",
        flex: 1,
        justifyContent: "flex-end",
    },
    collectionButtonImage: {
        height: (191 * height) / 667,
        width: (138 * width) / 375,
        borderRadius: (15 * width) / 375,
    },
    collectionTitle: {
        fontFamily: "Montserrat-SemiBold",
        fontSize: 17,
        lineHeight: 23,
        color: "white",
        marginBottom: (2 * height) / 667,
        marginLeft: (20 * width) / 375,
    },
    collectionItemCount: {
        fontFamily: "Montserrat-Regular",
        fontSize: 15,
        lineHeight: 20,
        color: "white",
        marginBottom: (20 * height) / 667,
        marginLeft: (20 * width) / 375,
    },
    widgetImage: {
        height: (40 * width) / 375,
        width: (40 * width) / 375,
        resizeMode: "contain",
    },
    crossButton: {
        height: (45 * width) / 375,
        width: (45 * width) / 375,
        marginLeft: (165 * width) / 375,
        marginTop: (32 * height) / 667,
        backgroundColor: "white",
        borderRadius: ((45 / 2) * width) / 375,
        alignItems: "center",
        justifyContent: "center",
    },
});

export default withNavigation(AddToCollection);
