import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    StyleSheet,
    Modal,
    ScrollView,
    FlatList,
    TouchableOpacity,
    Image,
} from "react-native";

// import { useSafeArea } from "react-native-safe-area-context";
import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { Avatar } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import SearchInput from "@components/SearchInput";
import Typography from "@components/Text";

// import { getBanksListApi } from "@services";
import {
    BLACK,
    DISABLED_TEXT,
    LIGHT_GREY,
    MEDIUM_GREY,
    SEPARATOR_GRAY,
    WHITE,
} from "@constants/colors";
import { NO_RESULT_FOUND, WE_COULDNT_FIND_ANY_ITEMS_MATCHING } from "@constants/strings";
import { ENDPOINT_BASE } from "@constants/url";

import { arraySearchByObjProp } from "@utils/array";
import { isEmpty } from "@utils/dataModel/utilityPartial.2";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";

const BankList = ({ list, onItemPress }) => {
    const renderItem = useCallback(
        ({ item }) => (
            <BankListItem
                title={item.bankName}
                item={item}
                image={{
                    type: "url",
                    source: item.image,
                }}
                onPress={onItemPress}
            />
        ),
        [onItemPress]
    );

    const keyExtract = useCallback((item, index) => `${item.contentId}-${index}`, []);

    return (
        <FlatList
            style={{ width: "100%" }}
            data={list}
            extraData={list}
            scrollToIndex={0}
            showsHorizontalScrollIndicator={false}
            showIndicator={false}
            keyExtractor={keyExtract}
            renderItem={renderItem}
        />
    );
};

BankList.propTypes = {
    list: PropTypes.any,
    onItemPress: PropTypes.any,
};

const BankListItem = ({ title, item, image, onPress }) => {
    const onListItemPressed = useCallback(() => onPress(item), [item, onPress]);
    return (
        <TouchableOpacity onPress={onListItemPressed} activeOpacity={0.9} disabled={item.disabled}>
            <View style={style.bankInfo}>
                <View style={style.circleImageView}>
                    <View style={style.circleImageView}>
                        {image.type === "local" && (
                            <Image
                                style={style.circleImageView}
                                source={image.source}
                                resizeMode="stretch"
                                resizeMethod="scale"
                            />
                        )}
                        {image.type === "url" && (
                            <Avatar imageUri={image.source.imageUri} name="name" radius={64} />
                        )}
                    </View>
                </View>
                <View style={style.bankInfoText}>
                    <Typography
                        fontSize={14}
                        fontWeight="600"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        textAlign="left"
                        text={title}
                        color={item.disabled ? DISABLED_TEXT : BLACK}
                    />
                </View>
            </View>
            <View style={style.seperator} />
        </TouchableOpacity>
    );
};

BankListItem.propTypes = {
    image: PropTypes.shape({
        source: PropTypes.shape({
            imageUri: PropTypes.any,
        }),
        type: PropTypes.string,
    }),
    item: PropTypes.shape({
        disabled: PropTypes.any,
    }),
    onPress: PropTypes.func,
    title: PropTypes.any,
    type: PropTypes.any,
};

function BTBankingList({ onBankCallback, title, onClose, data }) {
    const [mbbBanksList, setMbbBanksList] = useState([]);
    const [fullListBanksList, setFullListBanksList] = useState([]);
    const [showSearchInput, setShowSearchInput] = useState(false);
    const [isListCalled, setIsListCalled] = useState(false);
    const [searchInputText, setSearchInputText] = useState("");

    /*const getBanksList = useCallback(async () => {
        getBanksListApi()
            .then(async (response) => {
                const result = response.data;
                console.log("[BTBankingList] >> [getBanksListsApi] result ==> ", result);
                if (result != null) {
                    let resultList = result.resultList;
                    if (result != null) {
                        for (let i = 0; i < resultList.length; i++) {
                            let obj = resultList[i];
                            obj.imageBase64 = obj.image;
                            obj.image = {
                                imageName: obj.imageName,
                                image: obj.imageName,
                                imageUrl: obj.imageUrl,
                                shortName: obj.bankName,
                                type: true,
                            };

                            resultList[i];
                        }
                        console.log(resultList);
                        setMbbBanksList(resultList);
                        setFullListBanksList(resultList);
                        setIsListCalled(true);
                    }
                }
            })
            .catch((Error) => {
                console.log("[BTBankingList] >> [getBanksListsApi] ERROR: ", Error);
            });
    }, []);*/

    useEffect(() => {
        //getBanksList();
        const selectedMValue = [...data];
        const newMValue = selectedMValue.map((value) => ({
            ...value,
            image: {
                imageName: isEmpty(value.imageUrl),
                imageUrl: isEmpty(value.imageUrl),
                type: "url",
                imageUri: isEmpty(value.imageUrl)
                    ? ""
                    : ENDPOINT_BASE + "/cms/document-view/" + value.imageUrl,
            },
        }));
        setMbbBanksList(newMValue);
        setFullListBanksList(newMValue);
        setIsListCalled(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onBackTap = useCallback(() => {
        console.log("[BTBankingList] >> [onBackTap]");
        onClose();
    }, [onClose]);

    const handleAndroidBack = useCallback(() => {
        onClose();
    }, [onClose]);

    const onBankItemClick = useCallback(
        (item) => {
            console.log(" onBankItemClick list  ==> ", item);
            onBankCallback(item);
        },
        [onBankCallback]
    );

    const doSearchToogle = useCallback(() => {
        const list = showSearchInput || searchInputText.length <= 1 ? fullListBanksList : [];
        console.log("[doSearchToogle] showSearchInput list  ==> ", list);
        setSearchInputText(showSearchInput || searchInputText.length <= 1 ? "" : searchInputText);
        setShowSearchInput(!showSearchInput);
        setMbbBanksList(list);
    }, [fullListBanksList, searchInputText, showSearchInput]);

    const onSearchTextChange = useCallback(
        (text) => {
            setSearchInputText(text);
            setMbbBanksList(
                text && text.length >= 1
                    ? arraySearchByObjProp(fullListBanksList, text, ["bankName"])
                    : fullListBanksList
            );
        },
        [fullListBanksList]
    );

    return (
        <Modal
            animated
            animationType="slide"
            hardwareAccelerated
            onRequestClose={handleAndroidBack}
        >
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typography
                                    text={title}
                                    fontWeight="600"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                            headerRightElement={<HeaderCloseButton onPress={onBackTap} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <View style={Styles.contentTab}>
                        <View style={Styles.wrapperBlue}>
                            <View style={Styles.blockInner}>
                                <View style={Styles.listSearchView}>
                                    <SearchInput
                                        doSearchToogle={doSearchToogle}
                                        showSearchInput={showSearchInput}
                                        onSearchTextChange={onSearchTextChange}
                                        useMargin={false}
                                    />
                                </View>
                                <ScrollView
                                    showsHorizontalScrollIndicator={false}
                                    showsVerticalScrollIndicator={false}
                                >
                                    <View>
                                        <BankList
                                            list={mbbBanksList}
                                            onItemPress={onBankItemClick}
                                        />
                                        {isListCalled && mbbBanksList.length < 1 && (
                                            <View style={Styles.emptyTextView}>
                                                <Typography
                                                    fontSize={18}
                                                    fontWeight="bold"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={32}
                                                    textAlign="center"
                                                    text={NO_RESULT_FOUND}
                                                />
                                                <View style={Styles.emptyText2View}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="200"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={20}
                                                        textAlign="center"
                                                        text={WE_COULDNT_FIND_ANY_ITEMS_MATCHING}
                                                    />
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                </ScrollView>
                            </View>
                        </View>
                    </View>
                </ScreenLayout>
            </ScreenContainer>
        </Modal>
    );
}

const style = StyleSheet.create({
    bankInfo: {
        borderBottomColor: LIGHT_GREY,
        borderBottomWidth: 1,
        flexDirection: "row",
        paddingBottom: 17,
        paddingTop: 22,
        width: "100%",
    },
    bankInfoText: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        marginLeft: 16,
    },
    circleImageView: {
        alignContent: "center",
        alignItems: "center",
        backgroundColor: WHITE,
        borderColor: WHITE,
        borderRadius: 64 / 2,
        borderWidth: 2,
        flexDirection: "row",
        height: 64,
        justifyContent: "center",
        width: 64,
    },
    seperator: {
        backgroundColor: SEPARATOR_GRAY,
        height: 1,
        width: "100%",
    },
});

BTBankingList.propTypes = {
    onBankCallback: PropTypes.func,
    title: PropTypes.string,
    onClose: PropTypes.func,
    data: PropTypes.array,
};

export default BTBankingList;
