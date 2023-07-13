import React, { Component } from "react";
import {
    Text,
    View,
    TextInput,
    Keyboard,
    TouchableWithoutFeedback,
    StyleSheet,
    Dimensions,
    AsyncStorage,
} from "react-native";
import { HeaderPageIndicator, ErrorMessage } from "@components/Common";
import * as Strings from "@constants/strings";
import * as navigationConstant from "@navigation/navigationConstant";
// import * as utility from '@utils/dataModel/utility';
import * as ModelClass from "@utils/dataModel/modelClass";
import mainStyles from "@styles/main";
import NavigationService from "@navigation/navigationService";
import ImagePicker from "react-native-image-crop-picker";
import { postCollectionRequestWithData } from "@services/index";

export default class AddNewCollection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showCloseAlert: false,
            showLimitAlert: false,
            showBlankAlert: false,
            showRequestAlert: false,
            showNetworkAlert: false,
            serviceUnavailError: false,
            showLoader: false,
            textInput: this.navData.rename ? this.navData.collectionData.collectionName : "",
            userId: "",
            authToken: "",
        };
    }

    navData = this.props.route.params?.navData ?? "";

    closePress() {
        if (this.navData.callBackPage == "Home") {
            NavigationService.navigateToModule(navigationConstant.TAB_NAVIGATOR);
        } else if (this.navData.callBackPage == "Bookmarks") {
            NavigationService.navigateToModule(
                navigationConstant.BOOKMARKS_MODULE,
                navigationConstant.BOOKMARKS_DASHBOARD
            );
        } else if (this.navData.callBackPage == "HomeDetails") {
            if (this.navData.move) {
                NavigationService.navigateToModule(
                    navigationConstant.BOOKMARKS_MODULE,
                    navigationConstant.ADD_TO_COLLECTION
                );
            } else {
                this.props.navigation.navigate(navigationConstant.HOME_DETAILS_SCREEN, {
                    itemDetails: ModelClass.CURRENT_CONTENT_DATA,
                    callPage: ModelClass.HOME_DETAILS_CALLPAGE,
                });
            }
        } else {
            NavigationService.resetAndNavigateToModule(
                navigationConstant.BOOKMARKS_MODULE,
                navigationConstant.BOOKMARKS_LIST
            );
        }
    }

    onSurePress() {
        this.setState({ showCloseAlert: false });
        NavigationService.resetAndNavigateToModule("fitnessModule", "FitnessDashboard");
    }

    onCancelPress() {
        this.setState({ showCloseAlert: false });
    }

    onDonePress() {
        value = this.state.textInput;
        value = value.replace(/\s/g, "");
        // alert(value.length);
        // this.pickSingleBase64();
        if (value.length > 20) {
            this.setState({ showLimitAlert: true });
        } else if (value.length == 0) {
            this.setState({ showBlankAlert: true });
        } else {
            this.pickSingleBase64();
        }
    }

    async pickSingleBase64() {
        ImagePicker.openPicker({
            width: (275 * width) / 375,
            height: (168 * height) / 667,
            cropping: true,
            includeBase64: true,
            compressImageQuality: 1,
            includeExif: true,
            freeStyleCropEnabled: false,
            mediaType: "photo",
        })
            .then((image) => {
                console.log("Image is", image);

                // var base64Image = `data:${image.mime};base64,` + image.data;
                // ModelClass.Update_Profile.Profile_image = base64Image

                this.saveCollectionData(image.data);
            })
            .catch((err) => {
                console.log("Picker Error is", err);
                this.saveCollectionData();
                // this.setState({ phoneError: true ,alertText: 'Please upload .jpg or .png files only.' })
            });
    }

    saveCollectionData = async (image) => {
        const userId = await AsyncStorage.getItem("mayaUserId");
        if (this.navData.rename) {
            let reqData = {
                backgroundImage: image ? image : this.navData.collectionData.backgroundImage,
                collectionId: this.navData.collectionData.collectionId,
                collectionName: this.state.textInput,
                defaultType: "OTHERS",
                isActive: 1,
                isDeleted: 0,
                numberOfItems: 0,
                userId: this.navData.collectionData.userId,
            };
            await postCollectionRequestWithData(
                "/updateCollectionNameAndImage",
                JSON.stringify(reqData)
            )
                .then((collectionData) => {
                    console.log(
                        "updateCollectionNameAndImage res is - - - " +
                            JSON.stringify(collectionData)
                    );
                    ModelClass.COLLECTION_RENAME = {
                        collectionRenamed: true,
                        collectionName: collectionData.data.result.collectionName,
                    };
                    ModelClass.CURRENT_COLLECTION_DATA = {
                        collectionId: collectionData.data.result.collectionId,
                        userId: collectionData.data.result.userId,
                        collectionName: collectionData.data.result.collectionName,
                        backgroundImage: collectionData.data.result.backgroundImage,
                        isActive: collectionData.data.result.isActive,
                        defaultType: collectionData.data.result.defaultType,
                        isDeleted: collectionData.data.result.isDeleted,
                        numberOfItems: collectionData.data.result.numberOfItems,
                    };
                    // NavigationService.resetAndNavigateToModule(navigationConstant.BOOKMARKS_MODULE, navigationConstant.BOOKMARKS_LIST, { collectionData: collectionData.data.result });
                    NavigationService.resetAndNavigateToModule(
                        navigationConstant.BOOKMARKS_MODULE,
                        navigationConstant.BOOKMARKS_LIST
                    );
                })
                .catch((err) => {
                    console.log("save new err is 1 - - - " + JSON.stringify(err));
                    this.setState({ serviceUnavailError: true });
                });
            console.log(this.state.textInput);
            // initiate rename
        } else {
            let imageData = "";
            let reqData = {};
            if (image) {
                imageData = image;
            }
            if (this.navData.addOnly) {
                reqData = {
                    backgroundImage: imageData,
                    collectionName: this.state.textInput,
                    defaultType: "OTHERS",
                    isActive: 1,
                    isDeleted: 0,
                    userId: userId,
                };
            } else {
                reqData = {
                    backgroundImage: imageData,
                    collectionName: this.state.textInput,
                    contentId: this.navData.contentId,
                    defaultType: "OTHERS",
                    isActive: 1,
                    isDeleted: 0,
                    userId: userId,
                };
            }
            await postCollectionRequestWithData("/addCollection", JSON.stringify(reqData))
                .then((collectionData) => {
                    console.log("save new res is - - - " + JSON.stringify(collectionData));
                    //check add condition and put navs and calls
                    if (this.navData.addOnly) {
                        NavigationService.resetAndNavigateToModule(
                            navigationConstant.BOOKMARKS_MODULE,
                            navigationConstant.BOOKMARKS_DASHBOARD
                        );
                    } else {
                        //check page of usage and do accordingly
                        if (this.navData.callBackPage == "Home") {
                            ModelClass.COLLECTION_MOVEMENT = {
                                moveTriggered: true,
                                collectionMoved: true,
                                collectionName: collectionData.data.result.collectionName,
                            };
                            NavigationService.navigateToModule(navigationConstant.TAB_NAVIGATOR);
                        } else if (this.navData.callBackPage == "Bookmarks") {
                            NavigationService.navigateToModule(
                                navigationConstant.BOOKMARKS_MODULE,
                                navigationConstant.BOOKMARKS_DASHBOARD
                            );
                        } else if (this.navData.callBackPage == "HomeDetails") {
                            if (this.navData.move) {
                                ModelClass.CURRENT_COLLECTION_ID =
                                    collectionData.data.result.collectionId;
                                // ModelClass.CURRENT_COLLECTION_DATA = {
                                //     collectionId: collectionData.data.result.collectionId,
                                //     userId: collectionData.data.result.userId,
                                //     collectionName: collectionData.data.result.collectionName,
                                //     backgroundImage: collectionData.data.result.backgroundImage,
                                //     isActive: collectionData.data.result.isActive,
                                //     defaultType: collectionData.data.result.defaultType,
                                //     isDeleted: collectionData.data.result.isDeleted,
                                //     numberOfItems: collectionData.data.result.numberOfItems
                                // }
                                ModelClass.CURRENT_CONTENT_DATA.collectionId =
                                    collectionData.data.result.collectionId;
                                NavigationService.navigateToModule(
                                    navigationConstant.BOOKMARKS_MODULE,
                                    navigationConstant.ADD_TO_COLLECTION
                                );
                            } else {
                                ModelClass.COLLECTION_MOVEMENT = {
                                    moveTriggered: true,
                                    collectionMoved: true,
                                    collectionName: collectionData.data.result.collectionName,
                                    collectionId: collectionData.data.result.collectionId,
                                };
                                NavigationService.navigateToModule(
                                    navigationConstant.HOME_DETAILS_SCREEN
                                );
                            }
                        }
                    }
                })
                .catch((err) => {
                    console.log("save new err is 2 - - - " + JSON.stringify(err));
                    this.setState({ serviceUnavailError: true });
                });
        }
    };

    backPress() {}

    render() {
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View
                    style={mainStyles.mayaBackground}
                    accessibilityLabel={"MainView"}
                    testID={"MainView"}
                >
                    <View>
                        <HeaderPageIndicator
                            showBack={true}
                            showClose={true}
                            showBackIndicator={true}
                            noPop={false}
                            // noPop={true}
                            // onBackPress={() => {
                            //     this.backPress()
                            // }}
                            navigation={this.props.navigation}
                            noClose={true}
                            onClosePress={() => {
                                this.closePress();
                            }}
                        />
                    </View>
                    <View style={styles.titleView}>
                        <Text style={styles.titleText}>
                            {this.navData.rename
                                ? Strings.RENAME_COLLECTION
                                : Strings.NEW_COLLECTION}
                        </Text>
                    </View>
                    <View style={styles.textInputView}>
                        <TextInput
                            defaultValue={
                                this.navData.rename
                                    ? this.navData.collectionData.collectionName
                                    : ""
                            }
                            onSubmitEditing={() => this.onDonePress()}
                            placeholder={"Add Collection Name"}
                            style={styles.inputStyle}
                            underlineColorAndroid={"transparent"}
                            autoCorrect={false}
                            autoFocus={true}
                            returnKeyType={"done"}
                            blurOnSubmit={false}
                            multiline={false}
                            testID={"textInput"}
                            accessibilityLabel={"textInput"}
                            onChangeText={(text) => this.setState({ textInput: text })}
                        />
                    </View>
                    {this.state.showBlankAlert === true ? (
                        <ErrorMessage
                            onClose={() => {
                                this.setState({ showBlankAlert: false });
                            }}
                            title={Strings.WARNING}
                            description={Strings.BLANK_COLLECTION_NAME}
                            showOk={true}
                            onOkPress={() => {
                                this.setState({ showBlankAlert: false });
                            }}
                        />
                    ) : null}
                    {this.state.showLimitAlert === true ? (
                        <ErrorMessage
                            onClose={() => {
                                this.setState({ showLimitAlert: false });
                            }}
                            title={Strings.WARNING}
                            description={Strings.COLLECTION_NAME_LIMIT}
                            showOk={true}
                            onOkPress={() => {
                                this.setState({ showLimitAlert: false });
                            }}
                        />
                    ) : null}
                    {this.state.showRequestAlert === true ? (
                        <ErrorMessage
                            onClose={() => {
                                this.setState({ showRequestAlert: false });
                            }}
                            title={Strings.ERROR}
                            description={Strings.SERVER_ERROR}
                            showOk={true}
                            onOkPress={() => {
                                // this.textSelect.current.focus()
                                this.setState({ showRequestAlert: false });
                            }}
                        />
                    ) : null}
                    {this.state.showNetworkAlert === true ? (
                        <ErrorMessage
                            onClose={() => {
                                this.setState({ showNetworkAlert: false });
                            }}
                            title={Strings.ERROR}
                            description={Strings.NETWORKCONNECTION}
                            showOk={true}
                            onOkPress={() => {
                                // this.textSelect.current.focus()
                                this.setState({ showNetworkAlert: false });
                            }}
                        />
                    ) : null}

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
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
    titleView: {
        marginTop: (height * 25) / 667,
        marginLeft: (width * 50) / 375,
        height: (height * 24) / 667,
        justifyContent: "center",
    },
    titleText: {
        fontFamily: "Montserrat-SemiBold",
        // fontWeight:'600',
        fontSize: 17,
        lineHeight: 23,
        color: "#000000",
        letterSpacing: 0,
    },
    textInputView: {
        marginTop: (height * 2) / 667,
        marginLeft: (width * 50) / 375,
        width: (width * 275) / 375,
        height: (height * 220) / 667,
    },
    inputStyle: {
        fontFamily: "Montserrat-Light",
        // fontWeight:'300',
        fontSize: 23,
        lineHeight: 33,
        color: "#000000",
        letterSpacing: 0,
    },
});
