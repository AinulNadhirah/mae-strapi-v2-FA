import React, { Component } from "react";
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    Keyboard,
    ScrollView,
    TextInput,
    StyleSheet,
    Dimensions,
    KeyboardAvoidingView,
} from "react-native";
import { NavigationEvents } from "@react-navigation/compat";
import Modal from "react-native-modalbox";
import ImagePicker from "react-native-image-crop-picker";
import moment from "moment";
import * as utility from "@utils/dataModel/utility";
import * as ModelClass from "@utils/dataModel/modelClass";
import { JournalMessages } from "./JournalMessages";
import { postFitRequestWithData } from "@services";

const { width, height } = Dimensions.get("window");
//props:
// entityId
// userID
// journalParentScreen: string of parent screen name (navigation constant)

class UploadMedia extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    intervalVariable;
    constructor(props) {
        super(props);
        this.state = {
            message: "",
            renderMessage: [],
            poll: false,
            latestJournalId: 0,
            sendingMessage: false,
        };
        this.displayJournalMessage();
    }

    _onTextChange = (text) => {
        this.setState({ message: text });
    };

    componentDidMount() {}

    componentWillUnmount() {
        // stop polling and clear temporary variables
        // alert("unmounting")
        ModelClass.journalMessageType = "";
        ModelClass.journalPicMessage = "";
        ModelClass.journalPic = "";
        // alert("unmounted!");
        clearInterval(this.intervalVariable);
    }

    viewJournal(journalData, journalUsers) {
        //call journalMessages component to display.
        // console.log("DATA : : : " + JSON.stringify(journalData) + "..." + JSON.stringify(journalUsers));
        let returnArray = [];
        let hidePhoto = false;
        let mayaImage = require("@assets/icons/ic_maya_small_yellow.png");
        let participantImage;
        let participantName;
        // console.log("fuck this shit: " + JSON.stringify(journalResponseObject));//+". . . ."+ journalResponseObject.result.messages.length);
        // console.log("fts3: " + journalData);
        for (let i = 0; i < journalData.length; i++) {
            // alert(journalData[i].messageType);
            // console.log("fuck this bs!" + i)
            if (i > 0) {
                hidePhoto = journalData[i].participantId == journalData[i - 1].participantId;
            } else {
                hidePhoto = false;
                console.log("in inner else" + i);
            }
            for (var j in journalUsers) {
                if (
                    journalUsers[j].userName &&
                    journalUsers[j].id == journalData[i].participantId
                ) {
                    participantImage = journalUsers[j].profilePic;
                    participantName = journalUsers[j].userName;
                }
            }
            // console.log(participantName + "_______________" + participantImage)
            // if(journalData[i].messageObject!==null) alert(JSON.stringify(journalData[i]));
            returnArray.push(
                <View key={i}>
                    <JournalMessages
                        msg={journalData[i].message} //{data.ENTRIE11.journalList[i].msg}
                        date={utility.handleSyncDate(moment(journalData[i].messageTime), "Chat")}
                        hidePhoto={hidePhoto}
                        imageUrl={
                            hidePhoto
                                ? null
                                : journalData[i].userType == "U"
                                ? participantImage
                                : null
                        } //{data.ENTRIE11.journalList[i].imageUrl}
                        name={participantName}
                        leftRightFlag={journalData[i].leftRightFlag}
                        userType={journalData[i].userType}
                        messageType={journalData[i].messageType}
                        messageObject={journalData[i].messageObject}
                        messageObjectHeight={
                            journalData[i].attachmentHeight == null
                                ? 210
                                : journalData[i].attachmentHeight
                        }
                        messageObjectWidth={
                            journalData[i].attachmentWidth == null
                                ? 200
                                : journalData[i].attachmentWidth
                        }
                    />
                </View>
            );
        }
        //console.log("return Array : " + returnArray);
        this.setState({ renderMessage: returnArray });
        //console.log("journal state: " + this.state.renderMessage)
        // this._scrollView
        // .getScrollResponder()
        // .scrollToEnd({ animated: true });
    }

    startJournalPolling() {
        // function to begin polling on focus
        // alert(this.props.journalParentScreen);
        // if (ModelClass.journalNavigateToGallery==true) { //if returning from pic preview from gallery
        //     ModelClass.journalNavigateToGallery=false; // to stop it from calling gallery after another render
        //     this.PickPicture();
        // }
        // else
        if (ModelClass.journalMessageType == "I") {
            this.sendMessage();
        }
        // ModelClass.journalParentScreen = "" //?? when navigating away from journal, this has to be cleared - except any of the modal click navigations. if click is from outside, not captured??
        // ModelClass.journalNavigateToGallery=false; //set it to false in all cases
        this.intervalVariable = setInterval(this.displayJournalMessage, 10000);
    }

    onTickPressed() {
        // for pure Text journal message
        ModelClass.journalMessageType = "T";
        if (!this.state.sendingMessage) {
            this.sendMessage();
        }
        // else (alert("nope."));
    }

    async addJournal(messageData) {
        //call add journal webservice
        // alert(messageData.attachmentHeight);
        const journalResponse = await postFitRequestWithData(
            "/addJournal",
            JSON.stringify(messageData)
        );
        if (journalResponse.status == 200) {
            const journalResponseObject = journalResponse.data;
            const journalData = journalResponseObject.result.messages;
            const journalUsers = journalResponseObject.result.userDetailsMap;
            this.viewJournal(journalData, journalUsers);
            this.setState({ message: "", sendingMessage: false });
        } else {
            this.setState({ sendingMessage: false });
        }
        ModelClass.journalMessageType = "";
        ModelClass.journalPicMessage = "";
        ModelClass.journalPic = "";
    }

    sendMessage() {
        //create data for webservice call
        let mesg = this.state.message;
        mesg = mesg.replace(/\s/g, "");
        Keyboard.dismiss();
        if (ModelClass.journalMessageType == "I") {
            // alert(ModelClass.journalPicDetails[2]);
            if (ModelClass.journalPic !== null) {
                this.setState({ sendingMessage: true });
                const messageData = {
                    participantId: this.props.userId,
                    entityId: this.props.entityId,
                    entityType: "F",
                    message: ModelClass.journalPicMessage,
                    messageType: "I",
                    messageObject: ModelClass.journalPic,
                    attachmentHeight: ModelClass.journalPicDetails[2],
                    attachmentWidth: ModelClass.journalPicDetails[1],
                };
                this.addJournal(messageData);
            }
        } else if (ModelClass.journalMessageType == "T" && mesg.length > 0) {
            this.setState({ sendingMessage: true });
            const messageData = {
                participantId: this.props.userId,
                entityId: this.props.entityId,
                entityType: "F",
                message: this.state.message,
                messageType: "T",
            };
            this.addJournal(messageData);
        }
    }

    displayJournalMessage = () => {
        //polling function.

        // if (!this.props.journalShown) { this.componentWillUnmount() }
        let participantData = {
            participantId: this.props.userId,
            latestJournalId: this.state.latestJournalId > 0 ? this.state.latestJournalId : 0,
            entityId: this.props.entityId,
            entityType: "F",
        };

        //without async func
        postFitRequestWithData("/getPaginatedMessages", JSON.stringify(participantData))
            .then((res) => {
                // console.log("1111111111111111" + JSON.stringify(res));
                if (res.status == 200) {
                    return res.data;
                }
            })
            .then((res) => {
                // console.log("22222222222222" + JSON.stringify(res));
                const journalData = res.result.messages;
                const journalUsers = res.result.userDetailsMap;
                this.viewJournal(journalData, journalUsers);
                // alert("in disp mesg\n"+JSON.stringify(journalData));
                // alert("aaya");
            });
    };

    takePicture() {
        this.refs.AddMediaModal.close();
        ModelClass.isjournalGalleryOpen = false;
        // ModelClass.journalNavigateToGallery==false;
        ModelClass.journalParentScreen = this.props.journalParentScreen;
        this.props.navigation.navigate("TakeJournalPicture");
    }

    PickPicture() {
        this.refs.AddMediaModal.close();
        ModelClass.journalParentScreen = this.props.journalParentScreen;
        ModelClass.isjournalGalleryOpen = true;
        // alert("should be true if gal open: "+ModelClass.isjournalGalleryOpen);
        ImagePicker.openPicker({
            // cropping: true,
            includeBase64: true,
            compressImageQuality: 1,
            includeExif: true,
            // freeStyleCropEnabled: true,
            mediaType: "photo",
            compressImageQuality: 0.2,
        })
            .then((image) => {
                // alert(JSON.stringify(image.width+"~~~h: "+image.height+"~~~~~~~~~"+image.data));
                ModelClass.journalPicDetails = [0, image.width, image.height];
                ModelClass.journalPic = image.data;
                // alert("image.data"+image.data)
                // this.props.navigation.navigate("JournalPicPreview");
                this.props.navigation.push("JournalPicPreview");
            })
            .catch((e) => {
                ModelClass.isjournalGalleryOpen = false;
                // alert("oh no!");
            });
    }

    shareLocation() {
        // this.refs.AddMediaModal.close();
        // ImagePicker.openCamera({
        //     cropping: true,
        //     includeBase64: true,
        //     compressImageQuality: 1,
        //     includeExif: true,
        //     freeStyleCropEnabled: true,
        //     mediaType: 'photo',
        // }).then((image) => {
        //     // alert(JSON.stringify(image.width+"~~~h: "+image.height+"~~~~~~~~~"+image.data));
        //     ModelClass.journalPicDetails = [0, image.width, image.height];
        //     ModelClass.journalPic = image.data;
        //     this.props.navigation.navigate("JournalPicPreview");
        // }).catch((e) => {
        //     alert("oh no!");
        // });
    }

    render() {
        return (
            <View
                style={styles.mainJournalView}
                testID={"mainJournalView"}
                accessibilityLabel={"mainJournalView"}
            >
                <NavigationEvents onDidFocus={() => this.startJournalPolling()} />
                <NavigationEvents onDidBlur={() => this.componentWillUnmount()} />
                <ScrollView
                    nestedScrollEnabled={true}
                    style={styles.journalView}
                    accessibilityLabel={"journalMessagesView"}
                    testID={"journalMessagesView"}
                    ref={(view) => (this._scrollView = view)}
                    onContentSizeChange={(contentWidth, contentHeight) => {
                        this._scrollView.scrollToEnd({ animated: false });
                    }}
                    keyboardShouldPersistTaps={"always"}
                    keyboardDismissMode={"on-drag"}
                >
                    {this.state.renderMessage}
                </ScrollView>
                <KeyboardAvoidingView>
                    <View
                        style={styles.textInputBoxView}
                        accessibilityLabel={"chatInputView"}
                        testID={"chatInputView"}
                    >
                        <TouchableOpacity
                            onPress={() => this.refs.AddMediaModal.open()}
                            style={styles.addMediaView}
                            testID={"journalAddMediaView"}
                            accessibilityLabel={"journalAddMediaView"}
                        >
                            <Image
                                style={styles.addMediaIcon}
                                source={require("@assets/icons/ic_plus.png")}
                                testID={"journalAddMedia"}
                                accessibilityLabel={"journalAddMedia"}
                            />
                        </TouchableOpacity>
                        <View
                            style={styles.textInputView}
                            testID={"journalTextInputView"}
                            accessibilityLabel={"journalTextInputView"}
                        >
                            <TextInput
                                textAlignVertical={"center"}
                                placeholder="Enter your chat..."
                                onChangeText={(text) => this._onTextChange(text)}
                                value={this.state.message}
                                style={{ fontFamily: "montserrat" }}
                                onSubmitEditing={(text) => this.onTickPressed()}
                                testID={"journalTextInput"}
                                accessibilityLabel={"journalTextInput"}
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.addMessageView}
                            accessibilityLabel={"journalTicView"}
                            testID={"journalTickView"}
                            onPress={() => this.onTickPressed()}
                        >
                            <Image
                                style={styles.addMessageTick}
                                source={require("@assets/icons/yellowTick.png")}
                                testID={"journalTick"}
                                accessibilityLabel={"journalTick"}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.endSpace} />
                </KeyboardAvoidingView>

                <Modal
                    ref={"AddMediaModal"}
                    style={styles.addMediaModal}
                    accessibilityLabel="AddMediaModal"
                    testID="AddMediaModal"
                    backdropOpacity={0.8}
                    backdropColor={"rgba(0,0,0,0.8)"}
                    backdropPressToClose={false}
                    swipeToClose={false}
                    coverScreen={true}
                    backdrop={true}
                    position={"bottom"}
                >
                    <View style={styles.addMediaLabelView}>
                        <Text style={styles.addMediaLabel}>Add Media</Text>
                    </View>
                    <View style={styles.AddMediaScroll}>
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                            <View style={{ width: (34 * width) / 375 }} />
                            <TouchableOpacity
                                onPress={() => this.takePicture()}
                                style={styles.AddMediaCard}
                                testID={"takePhotoCard"}
                                accessibilityLabel={"takePhotoCard"}
                            >
                                <View style={styles.mediaImageView}>
                                    <Image
                                        style={styles.mediaImage}
                                        source={require("@assets/icons/phone.png")}
                                    />
                                </View>
                                <View style={styles.mediaTextView}>
                                    <Text style={styles.mediaText}>Take Photo</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => this.PickPicture()}
                                style={styles.AddMediaCard}
                                testID={"UploadPhotoCard"}
                                accessibilityLabel={"UploadPhotoCard"}
                            >
                                <View style={styles.mediaImageView}>
                                    <Image
                                        style={styles.mediaImage}
                                        source={require("@assets/icons/upload.png")}
                                    />
                                </View>
                                <View style={styles.mediaTextView}>
                                    <Text style={styles.mediaText}>Upload Photo</Text>
                                </View>
                            </TouchableOpacity>
                            {/* <TouchableOpacity
                                onPress={() => this.shareLocation()}
                                style={styles.AddMediaCard}
                                testID={"shareLocationCard"}
                                accessibilityLabel={"shareLocationCard"}
                            >
                                <View style={styles.mediaImageView}>
                                    <Image
                                        style={styles.mediaImage}
                                        source={require('@assets/icons/share.png')}
                                    />
                                </View>
                                <View style={styles.mediaTextView}>
                                    <Text style={styles.mediaText}>
                                        Share Location
                                    </Text>
                                </View>
                            </TouchableOpacity> */}
                            <View style={{ width: (41 * width) / 375 }} />
                        </ScrollView>
                    </View>
                    <TouchableOpacity
                        style={styles.modalCrossView}
                        onPress={() => this.refs.AddMediaModal.close()}
                        testID={"addMediaClose"}
                        accessibilityLabel={"addMediaClose"}
                    >
                        <Image
                            style={styles.modalCross}
                            source={require("@assets/icons/Close.png.png")}
                            testID={"addMediaCloseImg"}
                            accessibilityLabel={"addMediaCloseImg"}
                        />
                    </TouchableOpacity>
                </Modal>
            </View>
        );
    }
}

export { UploadMedia };

export const styles = StyleSheet.create(
    //journal styles:
    {
        mainJournalView: {
            backgroundColor: "white",
        },
        journalView: {
            height: (height * 505) / 667,
            paddingBottom: (height * 4) / 667,
        },
        textInputBoxView: {
            marginLeft: (width * 23) / 375,
            marginTop: (height * 13) / 667,
            height: (height * 55) / 667,
            width: (width * 329) / 375,
            borderRadius: (width * 42.5) / 667,
            borderWidth: (width * 1) / 375,
            borderColor: "rgba(0,0,0,0.14)",
            // backgroundColor: "yellow",
            // elevation: 1,
            flexDirection: "row",
        },
        addMediaView: {
            width: (width * 50) / 375,
            // backgroundColor:'green',
            alignItems: "center",
            justifyContent: "center",
        },
        addMediaIcon: {
            width: (width * 25) / 375,
            height: (width * 25) / 375,
        },
        textInputView: {
            width: (width * 225) / 375,
            // backgroundColor: "red",
            justifyContent: "center",
        },
        addMessageView: {
            width: (width * 50) / 667,
            marginLeft: (width * 10) / 375,
            // backgroundColor:'black',
            alignItems: "center",
            justifyContent: "center",
            marginTop: (height * 5) / 667,
        },
        addMessageTick: {
            resizeMode: "contain",
            width: (width * 65) / 375,
            height: (width * 65) / 375,
        },
        endSpace: {
            height: (height * 80) / 667,
        },
        addMediaModal: {
            height: (338 * height) / 667,
            width: width,
            backgroundColor: "transparent",
        },
        addMediaLabelView: {
            marginLeft: (width * 58) / 375,
            height: (height * 23) / 667,
        },
        addMediaLabel: {
            fontFamily: "montserrat",
            fontSize: 17,
            lineHeight: (height * 23) / 667,
            color: "white",
        },
        AddMediaScroll: {
            marginTop: (20 * height) / 667,
            // marginLeft: 34 * width / 375,
            height: (191 * height) / 667,
        },
        AddMediaCard: {
            marginLeft: (10 * width) / 375,
            height: (191 * height) / 667,
            width: (138 * width) / 375,
            borderRadius: (11 * width) / 375,
            backgroundColor: "white",
        },
        modalCrossView: {
            marginTop: (19 * height) / 667,
            marginLeft: (137.5 * width) / 375,
            width: (100 * width) / 375,
            height: (60 * height) / 667,
            // backgroundColor: 'red',
            alignItems: "center",
        },
        modalCross: {
            width: (83 * width) / 375,
            height: (83 * width) / 375,
            resizeMode: "contain",
        },
        mediaImageView: {
            marginLeft: (21 * width) / 375,
            marginTop: (50 * height) / 667,
            height: (60 * width) / 375,
        },
        mediaImage: {
            height: (60 * width) / 375,
            width: (60 * width) / 375,
            resizeMode: "contain",
        },
        mediaTextView: {
            position: "absolute",
            bottom: (20 * height) / 667,
            left: (20 * width) / 375,
            width: (97 * width) / 375,
        },
        mediaText: {
            fontFamily: "montserrat",
            fontSize: 16,
            lineHeight: 23,
            color: "black",
        },
    }
);
