import PropTypes from "prop-types";
import React, { Component } from "react";
import { StyleSheet, Image, View, TouchableOpacity } from "react-native";
import PDFView from "react-native-view-pdf";
import { WebView } from "react-native-webview";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { MEDIUM_GREY } from "@constants/colors";
import { SHARE_RECEIPT } from "@constants/strings";

import Assets from "@assets";

class PDFViewer extends Component {
    static propTypes = {
        route: PropTypes.object.isRequired,
        navigation: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            title: props.route.params?.title ?? SHARE_RECEIPT,
            file: props.route.params?.file ?? null,
            share: props.route.params?.share ?? "",
            type: props.route.params?.type ?? "",
            showShare: props.route.params?.showShare ?? true,
            sharePdfGaHandler: props.route.params?.sharePdfGaHandler ?? null,
        };
    }

    componentDidMount() {
        const { GAPdfView } = this.props?.route?.params;
        if (GAPdfView) GAPdfView();
    }

    onBackTap = () => {
        console.log("[PDFViewer] >> [onBackTap]");

        this.setState({ file: null }, () => {
            this.props.navigation.goBack();
        });
    };

    onShareTap = () => {
        console.log("[PDFViewer] >> [onShareTap]");
        CustomPdfGenerator.sharePDF(this.state.file.filePath, this.state.sharePdfGaHandler);
    };

    render() {
        const { title, showShare, file, type } = this.state;

        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                            headerCenterElement={
                                <Typo fontSize={16} fontWeight="600" lineHeight={19} text={title} />
                            }
                            headerRightElement={
                                showShare ? (
                                    <TouchableOpacity onPress={this.onShareTap}>
                                        <Image
                                            style={Style.shareIconCls}
                                            resizeMode="contain"
                                            source={Assets.icShareBlack}
                                        />
                                    </TouchableOpacity>
                                ) : (
                                    <React.Fragment />
                                )
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                >
                    {file && (
                        <View style={Style.outerViewCls}>
                            {type == "url" ? (
                                <PDFView
                                    fadeInDuration={1000.0}
                                    style={Style.viewCls}
                                    resource={file}
                                    resourceType={type}
                                />
                            ) : (
                                <WebView
                                    originWhitelist={["*"]}
                                    source={type == "url" ? { uri: file } : { html: file.html }}
                                    style={Style.viewCls}
                                    containerStyle={Style.webviewContainerStyle}
                                    scalesPageToFit
                                    automaticallyAdjustContentInsets={true}
                                    scrollEnabled={true}
                                />
                            )}
                        </View>
                    )}
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const Style = StyleSheet.create({
    outerViewCls: {
        flex: 1,
    },

    shareIconCls: {
        height: 44,
        width: 44,
    },

    viewCls: {
        backgroundColor: MEDIUM_GREY,
        flex: 1,
    },

    webviewContainerStyle: {
        marginRight: -5,
    },
});

export default PDFViewer;
