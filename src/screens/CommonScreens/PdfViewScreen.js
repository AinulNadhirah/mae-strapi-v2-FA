import CameraRoll from "@react-native-community/cameraroll";
import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, Platform, Dimensions, TouchableOpacity, Image } from "react-native";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import PDFView from "react-native-view-pdf";
import ViewShot, { captureScreen } from "react-native-view-shot";
import { WebView } from "react-native-webview";
import RNFetchBlob from "rn-fetch-blob";

import { QR_STACK } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderShareButton from "@components/Buttons/HeaderShareButton";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast, showSuccessToast } from "@components/Toast";

import { MEDIUM_GREY, WHITE, GREY, YELLOW } from "@constants/colors";

import Assets from "@assets";

const { width, height } = Dimensions.get("window");

class PdfViewScreen extends Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        super(props);
        this.state = {
            loading: "",
        };
    }

    componentDidMount() {
        const { GAPdfView } = this.props?.route?.params?.params;
        if (GAPdfView) GAPdfView();
    }

    _onMorePress = () => {
        const params = this.props.route.params?.params ?? {};
        if (params) {
            switch (params.pdfType) {
                case "shareMyQr":
                    CustomPdfGenerator.shareMyQr(params.file.base64);
                    break;
                case "shareReceipt":
                    CustomPdfGenerator.shareReceipt(params.file.base64);
                    break;
                case "shareKliaTicket":
                    CustomPdfGenerator.shareKliaTicket(params.file.base64);
                    break;
                default:
                    break;
            }
        }
    };

    _onBackPress = () => {
        console.log("_onBackPress");
        const params = this.props.route.params?.params ?? {};
        try {
            if (params.pdfType === "shareMyQr") {
                this.setState({});
                this.props.navigation.pop();
                this.props.navigation.navigate(QR_STACK, {
                    screen: "QrMain",
                    params: {
                        refresh: true,
                        resetState: true,
                        qrState: params.qrState,
                    },
                });
            } else {
                this.props.navigation.goBack();
            }
        } catch (err) {
            console.log(err);
        }
    };

    _onShareNewPress = () => {
        captureScreen({
            format: "png",
            quality: 0.5,
            result: "data-uri",
        }).then(
            async (uri) => {
                console.log("Image saved to", uri);
                const shareOptions = {
                    title: "My MAE QR",
                    mimeType: "image/png",
                    url: uri,
                    subject: "MAE QR",
                };

                const sh = await Share.open(shareOptions).catch((err) => {
                    console.log("Share Err", err);
                });
            },
            (error) => console.error("Oops, snapshot failed", error)
        );
    };

    _renderWebView = () => {
        const params = this.props.route.params?.params ?? {};
        return (
            <View style={styles.container}>
                <WebView
                    source={{ uri: params.uri }}
                    style={styles.containerBackground}
                    testID="common_pdf_view_webview"
                    accessibilityLabel={params.uri}
                />
            </View>
        );
    };

    _renderMixView = () => {
        const params = this.props.route.params?.params ?? {};
        return (
            <View style={styles.container}>
                <WebView
                    source={{ html: params.file.html }}
                    style={styles.containerHtmlBackground}
                />
            </View>
        );
    };

    _onload = () => {
        const params = this.props.route.params?.params ?? {};
        console.log("PDF rendered from " + params.file.filePath);
    };

    _onError = (error) => {
        console.log("Cannot render PDF", error);
    };

    _onSavePress = () => {
        const params = this.props.route.params?.params ?? {};
        this.viewshot
            .capture()
            .then(async (uri) => {
                console.log("in save refs - - - - - - - - -", uri);
                let base64result = uri.split(";base64,")[1];
                let datetime = moment(new Date()).format("YYYYMMDD_HHmmss");
                let fileName = "MAE_QR_" + datetime + ".png";
                console.log("FileName : ", fileName);
                let filePath = "";
                if (Platform.OS == "ios") {
                    filePath = RNFetchBlob.fs.dirs.DocumentDir + "/" + fileName;
                } else {
                    filePath = RNFetchBlob.fs.dirs.DownloadDir + "/" + fileName;
                }
                console.log("FilePath : ", filePath);

                RNFS.writeFile(filePath, base64result, "base64")
                    .then((response) => {
                        console.log("Success Log: ", response);
                    })
                    .catch((errors) => {
                        console.log(" Error Log: ", errors);
                    });
                CameraRoll.save(Platform.OS === "ios" ? uri : filePath, "photo")
                    .then(() => {
                        showSuccessToast({
                            message: "QR Saved",
                        });
                    })
                    .catch((err) => {
                        showErrorToast({ message: "QR Save Failed!" });
                        console.log("err:", err);
                    });
            })
            .catch((err) => {
                showErrorToast({ message: "QR Save Failed!" });
                console.log("error occured: " + err);
            });
    };

    _onSharePress = async () => {
        const params = this.props.route.params?.params ?? {};
        this.viewshot
            .capture()
            .then(async (uri) => {
                console.log("in share refs - - - - - - - - -", uri);
                const shareOptions = {
                    title: "My MAE QR",
                    mimeType: "image/png",
                    url: uri,
                    subject: "MAE QR",
                };

                const sh = await Share.open(shareOptions).catch((err) => {
                    console.log("Share Err", err);
                });

                if (params?.sharePdfGaHandler && sh?.app) {
                    params.sharePdfGaHandler(sh.app);
                } else if (params?.sharePdfGaHandler && sh?.message) {
                    params.sharePdfGaHandler(sh.message);
                }
            })
            .catch((err) => {
                console.log("error occured: " + err);
            });
    };

    _renderPDFView = () => {
        const params = this.props.route.params?.params ?? {};
        return (
            <PdfViewSection
                type={params.type}
                filePath={params.filePath}
                file={params.file}
                onLoad={this._onload()}
                onError={this._onError()}
            />
        );
    };

    render() {
        const { showErrorModal, errorMessage } = this.state;
        const params = this.props.route.params?.params ?? {};
        return (
            <ScreenContainer
                backgroundType="color"
                showErrorModal={showErrorModal}
                errorMessage={errorMessage}
                showOverlay={false}
                backgroundColor={MEDIUM_GREY}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={params.title}
                                />
                            }
                            headerLeftElement={
                                params.showCrossBtn ? (
                                    <View />
                                ) : (
                                    <HeaderBackButton
                                        onPress={this._onBackPress}
                                        testID="go_back"
                                    />
                                )
                            }
                            headerRightElement={
                                params && params.share && params.pdfType != "shareMyQr" ? (
                                    <HeaderShareButton onPress={this._onMorePress} />
                                ) : params.showCrossBtn ? (
                                    <TouchableOpacity
                                        accessibilityLabel="close_page"
                                        testID="close_page"
                                        onPress={this._onBackPress}
                                    >
                                        <Image
                                            resizeMode="contain"
                                            style={{
                                                height: 44,
                                                width: 44,
                                            }}
                                            source={Assets.closeIcon}
                                        />
                                    </TouchableOpacity>
                                ) : (
                                    <View />
                                )
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <React.Fragment>
                        <ViewShot
                            ref={(ref) => (this.viewshot = ref)}
                            options={{
                                format: "png",
                                quality: 0.5,
                                result: "data-uri",
                            }}
                            snapshotContentContainer={true}
                            style={{
                                flex: 4,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <View style={styles.container} testID="common_pdf_view">
                                {params && params.type === "Web"
                                    ? this._renderWebView()
                                    : params.type === "Html"
                                    ? this._renderMixView()
                                    : this._renderPDFView()}
                            </View>
                        </ViewShot>
                        {params.pdfType === "shareMyQr" && (
                            <View style={styles.subButtonContainer}>
                                <View style={styles.flex1}>
                                    <ActionButton
                                        backgroundColor={WHITE}
                                        height={48}
                                        borderRadius={24}
                                        borderStyle="solid"
                                        borderWidth={1}
                                        borderColor={GREY}
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                text="Share"
                                            />
                                        }
                                        onPress={this._onSharePress}
                                    />
                                </View>
                                <View style={styles.width16} />
                                <View style={styles.flex1}>
                                    <ActionButton
                                        backgroundColor={YELLOW}
                                        height={48}
                                        borderRadius={24}
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                text="Save"
                                            />
                                        }
                                        onPress={this._onSavePress}
                                    />
                                </View>
                            </View>
                        )}
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

export const PdfViewSection = ({ type, filePath, file, onLoad, onError }) => {
    return (
        <View style={styles.container}>
            <PDFView
                fadeInDuration={0.0}
                style={styles.containerBackground}
                resource={type === "file" ? filePath : type === "base64" ? file.base64 : file}
                resourceType={type}
                onLoad={onLoad}
                onError={onError}
            />
        </View>
    );
};

PdfViewScreen.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

PdfViewSection.propTypes = {
    type: PropTypes.string,
    filePath: PropTypes.string,
    file: PropTypes.string || PropTypes.object,
    onLoad: PropTypes.func,
    onError: PropTypes.func,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerBackground: {
        flex: 1,
        height: height - 20,
        width: width,
    },
    containerHtmlBackground: {
        flex: 0,
        height: height - 20,
        width: width,
    },
    flex1: {
        flex: 1,
    },
    subButtonContainer: {
        alignItems: "center",
        alignSelf: "center",
        bottom: 6,
        flex: 1.4,
        flexDirection: "row",
        height: 40,
        justifyContent: "center",
        width: width - 48,
    },
    width16: {
        width: 16,
    },
});
export default PdfViewScreen;
