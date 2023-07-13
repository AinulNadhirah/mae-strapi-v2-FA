import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import { FlatList, StyleSheet, TouchableOpacity, Image, View } from "react-native";

import EmptyStateScreen from "@screens/CommonScreens/EmptyStateScreen";

import { BANKINGV2_MODULE, CHAT_DOCUMENTS, DOCUMENT_VIEWER } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { getDocument, getDocumentsList } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, DARK_GREY, WHITE } from "@constants/colors";
import { FA_SCREEN_NAME, FA_VIEW_SCREEN } from "@constants/strings";

import Assets from "@assets";

import { getEncValue } from "../../Common/PropertyController";

function ChatDocuments({ route, navigation }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    useEffect(() => {
        async function initialize() {
            await init();
        }
        initialize();
    }, []);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Property_Documents_ChatDocuments",
        });
    }, []);

    const init = async () => {
        const syncId = route.params?.syncId;
        const stpId = route.params?.savedData?.stpApplicationId || route.params?.stpId; // first params from application tab, second from chat window

        let params = {};
        if (stpId) {
            const encStpId = await getEncValue(stpId);
            params = {
                syncId: "",
                stpId: encStpId,
                documentType: "chat",
            };
        } else {
            const encSyncId = await getEncValue(syncId);
            params = {
                syncId: encSyncId,
                stpId: "",
                documentType: "chat",
            };
        }

        try {
            const response = await getDocumentsList(params);
            const data = response?.data?.result?.docDetails;
            setData(data);
            console.log(response);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    function onBackTap() {
        console.log("[ChatDocuments] >> [onBackTap]");

        navigation.goBack();
    }

    const checkFileType = (fileName) => {
        return fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
    };

    async function onPressDocument(item) {
        console.log("[ChatDocuments] >> [onPressDocument]");
        setLoading(true);
        const params = {
            documentId: item?.id,
        };

        try {
            const response = await getDocument(params);
            const documentContent = response?.data?.result?.documentContent;

            navigation.push(BANKINGV2_MODULE, {
                screen: DOCUMENT_VIEWER,
                params: {
                    documentObject: documentContent,
                    from: CHAT_DOCUMENTS,
                },
            });
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    function renderItem({ item }) {
        console.log("[ChatDocuments] >> [renderItem]");

        const extension = checkFileType(item.docName);
        const imageSource =
            extension === "jpg" || extension === "png" || extension === "jpeg"
                ? Assets.fileJpg
                : Assets.filePdf;

        return <DocumentItem item={item} onPress={onPressDocument} image={imageSource} />;
    }

    function keyExtractor(item, index) {
        return `${item.id}-${index}`;
    }

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={loading}
        >
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        headerCenterElement={
                            <Typo
                                text="Chat Documents"
                                lineHeight={20}
                                fontSize={16}
                                fontWeight="600"
                            />
                        }
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                useSafeArea
            >
                {!loading && data.length <= 0 ? (
                    <EmptyStateScreen
                        headerText="No Chat Documents Available"
                        subText="Documents sent to your sales representative through chat will be collected here."
                        imageSrc={Assets.propertyDocumentEmptyState}
                    />
                ) : (
                    <FlatList data={data} keyExtractor={keyExtractor} renderItem={renderItem} />
                )}
            </ScreenLayout>
        </ScreenContainer>
    );
}

ChatDocuments.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const DocumentItem = ({ item, onPress, image }) => {
    const onPressDocument = useCallback(() => {
        onPress(item);
    }, [onPress, item]);

    return (
        <TouchableOpacity style={styles.documentContainer} onPress={onPressDocument}>
            <Image source={image} style={styles.icon} />
            <View style={styles.infoGroup}>
                <Typo
                    fontWeight="600"
                    fontSize={16}
                    textAlign="left"
                    lineHeight={18}
                    style={styles.docName}
                >
                    {item?.docName}
                </Typo>
                {item?.documentDate && (
                    <Typo
                        fontSize={10}
                        textAlign="left"
                        paddingTop={8}
                        lineHeight={11}
                        color={DARK_GREY}
                        style={styles.label}
                    >
                        {item?.documentDate}
                    </Typo>
                )}
            </View>
        </TouchableOpacity>
    );
};

DocumentItem.propTypes = {
    item: PropTypes.object,
    onPress: PropTypes.func,
    image: PropTypes.object,
};

const styles = StyleSheet.create({
    docName: {
        marginRight: 24,
    },
    documentContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        flexDirection: "row",
        marginHorizontal: 24,
        marginTop: 10,
        paddingHorizontal: 23,
    },
    icon: {
        marginVertical: 20,
    },
    infoGroup: {
        justifyContent: "center",
        marginHorizontal: 24,
    },
    label: {
        paddingTop: 8,
    },
});

export default ChatDocuments;
