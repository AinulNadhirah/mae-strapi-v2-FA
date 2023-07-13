import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import { FlatList, StyleSheet, TouchableOpacity, Image, View, Platform } from "react-native";

import EmptyStateScreen from "@screens/CommonScreens/EmptyStateScreen";

import {
    BANKINGV2_MODULE,
    DOCUMENT_VIEWER,
    LETTER_OFFER_LIST,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { getDocument, getDocumentsList } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, WHITE } from "@constants/colors";
import {
    FA_ACTION_NAME,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_VIEW_SCREEN,
} from "@constants/strings";

import Assets from "@assets";

import { getEncValue } from "../../Common/PropertyController";

function LetterOfferList({ route, navigation }) {
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
            [FA_SCREEN_NAME]: "Property_Documents_OfferLetter",
        });
    }, []);

    const init = async () => {
        const syncId = route.params?.syncId;
        const stpId = route.params?.savedData?.stpApplicationId;
        let params = {};
        if (stpId) {
            const encStpId = await getEncValue(stpId);
            params = {
                syncId: "",
                stpId: encStpId,
                documentType: "woloc",
            };
        } else {
            const encSyncId = await getEncValue(syncId);
            params = {
                syncId: encSyncId,
                stpId: "",
                documentType: "woloc",
            };
        }

        try {
            const response = await getDocumentsList(params, false);
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
        console.log("[LetterOfferList] >> [onBackTap]");

        navigation.goBack();
    }

    function checkFileType(fileName) {
        return fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
    }

    async function onPressDocument(item) {
        console.log("[LetterOfferList] >> [onPressDocument]");

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
                    from: LETTER_OFFER_LIST,
                },
            });
        } catch (error) {
            console.log(error);
        }

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Property_Documents_OfferLetter",
            [FA_ACTION_NAME]: "Select Offer Letter",
        });
    }

    function renderItem({ item }) {
        console.log("[LetterOfferList] >> [renderItem]");

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
                                text="Letter of Offer"
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
                        headerText="Letter of Offer Unavailable"
                        subText={`Your Letter of Offer will be generated soon.\nWe’ll notify you when it’s available.`}
                        imageSrc={Assets.propertyDocumentEmptyState}
                    />
                ) : (
                    <FlatList data={data} keyExtractor={keyExtractor} renderItem={renderItem} />
                )}
            </ScreenLayout>
        </ScreenContainer>
    );
}

LetterOfferList.propTypes = {
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
            <View style={[styles.infoGroup, { paddingRight: Platform.OS === "android" ? 24 : 0 }]}>
                <Typo
                    fontWeight="600"
                    fontSize={16}
                    textAlign="left"
                    backgroundColor="red"
                    lineHeight={18}
                    style={styles.docName}
                >
                    {item?.docName}
                </Typo>
                {item?.documentDate && (
                    <Typo fontWeight="400" fontSize={10} textAlign="left" paddingTop={8}>
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
        paddingLeft: 24,
    },
});

export default LetterOfferList;
