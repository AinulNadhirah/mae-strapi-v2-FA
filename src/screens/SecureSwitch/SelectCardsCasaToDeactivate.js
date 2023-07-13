import { slice } from "lodash";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Image,
    ImageBackground,
} from "react-native";
import { useSafeArea } from "react-native-safe-area-context";
import {
    M2U_DEACTIVATE,
    SECURE_SWITCH_STACK,
    DEACTIVATE_CARDS_CASA_CONFIRMATION,
    SELECT_REASON_TO_BLOCK_CARDS,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ProductCardLoader from "@components/Cards/ProductCardLoader";
import ScreenContainer from "@components/Containers/ScreenContainer";
import KillSwitchConfirmation from "@components/KillSwitchConfirmation";
import WalletLabel from "@components/Label/WalletLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showInfoToast, hideToast } from "@components/Toast";

import { getCasaCardsListEnquiry } from "@services";

import {
    MEDIUM_GREY,
    DARK_GREY,
    YELLOW,
    BLACK,
    GREY,
    WHITE,
    SHADOW_LIGHT,
    BLUE,
    DISABLED,
    DISABLED_TEXT,
    OVERLAY,
} from "@constants/colors";
import { CARD_BLOCK, PRIMARY_LIST, SECONDARY_LIST } from "@constants/data";
import {
    NEXT,
    CASA,
    CARDS,
    SUSPEND_CASA_CONFIRMATION_MODEL,
    CONFIRM,
    CANCEL,
    SUSPEND_ACCOUNTS,
    BLOCK_CREDIT_CARD,
    SELECT_CC_TO_BLOCK,
    SELECT_CASA_TO_SUSPEND,
    ACCCOUNT_TYPE,
    SAVINGS_ACCOUNT,
    CURRENT_ACCOUNT,
    INDIVIDUAL_ACC,
    PRIMARY_CARDS,
    LOAD_MORE,
    ACCOUNTS_SELECTED,
    JOINT_ACC,
    SUPPLEMENTARY_CARDS,
    BLOCK_SUPP_CARD,
    BLOCK_PRIMARY_CARD,
    SUSPEND_JOINT_ACCOUNTS,
    SUSPEND_INDIVIDUAL_ACCOUNTS,
    ALL_CARDS_BLOCKED,
    ALL_SAVINGS_ACC_BLOCKED,
    ALL_CURRENT_ACC_BLOCKED,
    BLOCK_CARD_NOTE,
} from "@constants/strings";

import { maskAccount, formateAccountNumber, getCardProviderImage } from "@utils/dataModel/utility";

import Assets from "@assets";

const { width } = Dimensions.get("window");
const bgImageStyle = {
    borderRadius: 8,
};
const INIT_ACC_COUNT = 5;
const SAVINGS = "S";
const CURRENT = "D";
const CREDIT_CARDS = "C";
const SUSPEND_ACC_MAX_COUNT = 10;
const BLOCK_CARDS_MAX_COUNT = 1;
const ACC_GROUP_0YD = "0YD";
const ACC_GROUP_CCD = "CCD";

const Card = ({
    name,
    number,
    isSelected,
    onPress,
    isPrimary,
    itemToDeactivate,
    group,
    listType,
    type,
}) => {
    const isMAECard = type === CURRENT && (group === ACC_GROUP_0YD || group === ACC_GROUP_CCD);
    function getCardBanner() {
        if (isMAECard) {
            return Assets.maeFullBg;
        } else if (itemToDeactivate === CASA) {
            return Assets.casaFullBg;
        } else if (itemToDeactivate === CARDS) {
            return Assets.cardsFullBackground;
        }
    }
    return (
        <TouchableOpacity
            onPress={() => onPress(number, isSelected, listType)}
            style={styles.cardContainer}
        >
            <ImageBackground
                source={getCardBanner()}
                resizeMode="cover"
                style={styles.imageBg}
                imageStyle={bgImageStyle}
            >
                <View style={styles.innerContainer}>
                    <View style={styles.accountDetails}>
                        <View style={styles.accountName}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="left"
                                color={WHITE}
                                text={name}
                                style={styles.accName}
                            />
                            <Typo
                                fontSize={12}
                                fontWeight="400"
                                lineHeight={15}
                                textAlign="left"
                                color={WHITE}
                                text={
                                    itemToDeactivate === CARDS
                                        ? maskAccount(number, 16)
                                        : formateAccountNumber(number, 12)
                                }
                            />
                        </View>
                        {isPrimary && <WalletLabel />}
                        {itemToDeactivate === CARDS && (
                            <Image
                                source={getCardProviderImage(number)}
                                resizeMode="contain"
                                style={styles.cardProviderImage}
                            />
                        )}
                    </View>
                </View>
                {isSelected && (
                    <View style={styles.overlayContainer}>
                        <Image
                            source={Assets.whiteTick}
                            style={styles.selectedImage}
                            resizeMode="contain"
                        />
                    </View>
                )}
            </ImageBackground>
        </TouchableOpacity>
    );
};

Card.propTypes = {
    name: PropTypes.string,
    number: PropTypes.string,
    itemToDeactivate: PropTypes.string,
    isSelected: PropTypes.bool,
    isPrimary: PropTypes.bool,
    onPress: PropTypes.func,
    type: PropTypes.string,
    group: PropTypes.string,
    listType: PropTypes.string,
};

Card.defaultProps = {
    name: "",
    number: "",
    itemToDeactivate: "",
    isSelected: false,
    isPrimary: false,
    onPress: () => {},
    type: "",
    group: "",
    listType: "",
};

const ListOfCardsCasaToRender = ({
    listOfCardsCasaToRender,
    itemToDeactivate,
    onSelectAccItem,
    onClickLoadMore,
}) => {
    return (
        <View style={styles.fieldContainer}>
            {listOfCardsCasaToRender.map((items) => {
                const { type, title, initialList, showLoadMore } = items;
                return (
                    <>
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            fontStyle="normal"
                            lineHeight={18}
                            textAlign="left"
                            text={title}
                            style={styles.individualAccTitle}
                        />
                        {initialList.map((acc, index) => (
                            <Card
                                key={acc.name}
                                name={acc?.name}
                                number={acc?.number}
                                itemToDeactivate={itemToDeactivate}
                                onPress={onSelectAccItem}
                                isSelected={acc?.isSelected}
                                isPrimary={acc?.primary}
                                listType={items?.type}
                                {...acc}
                            />
                        ))}
                        {showLoadMore && (
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={17}
                                text={LOAD_MORE}
                                color={BLUE}
                                style={styles.loadMore}
                                onPressText={() => onClickLoadMore(type)}
                            />
                        )}
                    </>
                );
            })}
        </View>
    );
};

ListOfCardsCasaToRender.propTypes = {
    listOfCardsCasaToRender: PropTypes.arrayOf(),
    itemToDeactivate: PropTypes.string,
    onSelectAccItem: PropTypes.func,
    onClickLoadMore: PropTypes.func,
};

ListOfCardsCasaToRender.defaultProps = {
    listOfCardsCasaToRender: [],
    itemToDeactivate: "",
    onSelectAccItem: () => {},
    onClickLoadMore: () => {},
};

const CasaAccTypeSelectionContainer = (
    {
        onSelectCasaAccType,
        selectedAccTypeForCardsCasa,
    }
) => (
    <View style={styles.selectTypeContainer}>
        <Typo
            fontSize={14}
            fontWeight={400}
            lineHeight={18}
            text={ACCCOUNT_TYPE}
            textAlign="left"
        />
        <View style={styles.accountTypeRadios}>
            <TouchableOpacity onPress={() => onSelectCasaAccType(SAVINGS)}>
                <View style={styles.selectAccountType}>
                    <Image
                        source={
                            selectedAccTypeForCardsCasa === SAVINGS
                                ? Assets.icChecked
                                : Assets.icRadioUnchecked
                        }
                        style={styles.selectIcon}
                        resizeMode="contain"
                    />
                    <Typo
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={18}
                        text={SAVINGS_ACCOUNT}
                    />
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onSelectCasaAccType(CURRENT)}>
                <View style={styles.selectAccountType}>
                    <Image
                        source={
                            selectedAccTypeForCardsCasa === CURRENT
                                ? Assets.icChecked
                                : Assets.icRadioUnchecked
                        }
                        style={styles.selectIcon}
                        resizeMode="contain"
                    />
                    <Typo
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={18}
                        text={CURRENT_ACCOUNT}
                    />
                </View>
            </TouchableOpacity>
        </View>
    </View>
);

CasaAccTypeSelectionContainer.propTypes = {
    onSelectCasaAccType: PropTypes.func,
    selectedAccTypeForCardsCasa: PropTypes.string,
};

CasaAccTypeSelectionContainer.defaultProps = {
    onSelectCasaAccType: () => {},
    selectedAccTypeForCardsCasa: "",
};

const NextButtonComponent = ({
    selectedItemsList,
    onClickNextButton,
    ...props
}) => (
    <ActionButton
        backgroundColor={!selectedItemsList.length ? DISABLED : YELLOW}
        componentCenter={
            <Typo
                fontSize={14}
                fontWeight="600"
                lineHeight={18}
                color={!selectedItemsList.length ? DISABLED_TEXT : BLACK}
                text={NEXT}
            />
        }
        disabled={!selectedItemsList.length}
        onPress={onClickNextButton}
        {...props}
    />
);

NextButtonComponent.propTypes = {
    selectedItemsList: PropTypes.arrayOf(),
    onClickNextButton: PropTypes.func,
};

NextButtonComponent.defaultProps = {
    selectedItemsList: [],
    onClickNextButton: () => {},
};

const BottomView = ({ itemToDeactivate, selectedItemsList, accLength, maxAccToSelect, onClickNextButton }) => {
    const safeArea = useSafeArea();

    return (
        <View>
            {itemToDeactivate === CASA
                ? (
                    <View style={styles.btnFooter(safeArea)}>
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            fontStyle="normal"
                            lineHeight={18}
                            textAlign="left"
                            text={`${selectedItemsList.length}/${
                                accLength > maxAccToSelect ? maxAccToSelect : accLength
                            } ${ACCOUNTS_SELECTED}`}
                        />
                        <NextButtonComponent width={128} onClickNextButton={onClickNextButton} selectedItemsList={selectedItemsList} />
                    </View>
                )
                : (
                    <View style={styles.buttonContainer}>
                        <NextButtonComponent fullWidth marginBottom={30} onClickNextButton={onClickNextButton} selectedItemsList={selectedItemsList} />
                    </View>
                )
            }
        </View>
    );
};

BottomView.propTypes = {
    selectedItemsList: PropTypes.arrayOf(),
    onClickNextButton: PropTypes.func,
    itemToDeactivate: PropTypes.string,
    accLength: PropTypes.number,
    maxAccToSelect: PropTypes.number,
};

BottomView.defaultProps = {
    selectedItemsList: [],
    onClickNextButton: () => {},
    itemToDeactivate: "",
    accLength: 0,
    maxAccToSelect: 0,
};

const SelectCardsCasaToDeactivate = ({ route, navigation }) => {
    const { fromModule, fromScreen, itemToDeactivate } = route.params;

    const [isLoading, setIsLoading] = useState(false);
    const [selectedItemsList, setSelectedItemsCountList] = useState([]);
    const [selectedAccTypeForCardsCasa, setSelectedAccTypeForCardsCasa] = useState(
        itemToDeactivate === CASA ? SAVINGS : CREDIT_CARDS
    );
    const maxAccToSelect =
        itemToDeactivate === CASA ? SUSPEND_ACC_MAX_COUNT : BLOCK_CARDS_MAX_COUNT;
    const [listOfCardsCasaToRender, setListOfCardsCasaToRender] = useState([]);
    const [accLength, setAccLength] = useState(0);
    const [showConfirmationModel, setShowConfirmationModel] = useState(false);
    const [step] = useState(1);

    let pageIntroTexts = {};
    if (itemToDeactivate === CASA) {
        pageIntroTexts = {
            title: SUSPEND_ACCOUNTS,
            desc: SELECT_CASA_TO_SUSPEND,
        };
    } else if (itemToDeactivate === CARDS) {
        pageIntroTexts = {
            title: BLOCK_CREDIT_CARD,
            desc: SELECT_CC_TO_BLOCK,
        };
    }

    function onBackHandler() {
        navigation.goBack();
    }

    function onCloseHandler() {
        if (fromModule && fromScreen) {
            navigation.navigate(fromModule, { screen: fromScreen });
        }
    }

    function onSelectCasaAccType(accType) {
        setSelectedAccTypeForCardsCasa(accType);
        getListCasaCards(accType);
        hideToast();
    }

    function onClickLoadMore(type) {
        const newRenderList = listOfCardsCasaToRender.map((item) => {
            if (item.type === type) {
                item.initialList = item.list;
                item.showLoadMore = false;
            }

            return item;
        });
        setListOfCardsCasaToRender([...newRenderList]);
    }

    function handleSelectedItemBasedOnAccType(list, accNo, selectedItems) {
        return list.map((acc) => {
            if (itemToDeactivate === CASA) {
                if (acc.number === accNo) {
                    acc.isSelected = !acc.isSelected;
                }
            } else if (itemToDeactivate === CARDS) {
                acc.isSelected = false;
                if (acc.number === accNo) {
                    acc.isSelected = true;
                }
            }
            if (acc.isSelected) {
                selectedItems.push({ ...acc });
            }

            return acc;
        });
    }

    function handleSelectedItemBasedOnType(type, accNo) {
        const selectedItems = [];
        const cardsCasaList = [];
        listOfCardsCasaToRender.forEach((item) => {
            if (item.type === type) {
                const { list } = item;
                const updatedRenderList = handleSelectedItemBasedOnAccType(list, accNo, selectedItems);
                item.list = updatedRenderList;
            } else {
                const { list } = item;
                if (itemToDeactivate === CASA) {
                    list.forEach((acc) => {
                        if (acc.isSelected) {
                            selectedItems.push({ ...acc });
                        }
                    });
                } else if (itemToDeactivate === CARDS) {
                    list.forEach((acc) => {
                        acc.isSelected = false;
                    });
                }
            }
            cardsCasaList.push(item);
        });

        return { selectedItems, cardsCasaList };
    }

    function onSelectAccItem(accNo, isAccSelected, type) {
        if (
            selectedItemsList.length < maxAccToSelect ||
            (itemToDeactivate === CASA &&
                selectedItemsList.length === maxAccToSelect &&
                isAccSelected) ||
            (itemToDeactivate === CARDS && selectedItemsList.length === maxAccToSelect)
        ) {
            const { selectedItems, cardsCasaList } = handleSelectedItemBasedOnType(type, accNo);

            if (selectedItems.length <= maxAccToSelect) {
                setSelectedItemsCountList(selectedItems);
                setListOfCardsCasaToRender([...cardsCasaList]);
            }
        }
    }

    function formatItemsToRender(listOfCardsCASA) {
        let primaryList;
        let secondaryList;
        const itemsToRender = [];
        let primaryListTitle;
        let secondaryListTitle;
        if (itemToDeactivate === CASA) {
            primaryList = listOfCardsCASA.filter((acc) => !acc.jointAccount);
            secondaryList = listOfCardsCASA.filter((acc) => acc.jointAccount);
            primaryListTitle = INDIVIDUAL_ACC;
            secondaryListTitle = JOINT_ACC;
        } else if (itemToDeactivate === CARDS) {
            primaryList = listOfCardsCASA.filter(
                (card) => card.creditCardType === "01"
            );
            secondaryList = listOfCardsCASA.filter(
                (card) => card.creditCardType === "02"
            );
            primaryListTitle = PRIMARY_CARDS;
            secondaryListTitle = SUPPLEMENTARY_CARDS;
        }
        if (primaryList.length) {
            itemsToRender.push({
                type: PRIMARY_LIST,
                title: primaryListTitle,
                initialList: slice(primaryList, 0, INIT_ACC_COUNT),
                list: primaryList,
                showLoadMore: primaryList.length > INIT_ACC_COUNT,
            });
        }
        if (secondaryList.length) {
            itemsToRender.push({
                type: SECONDARY_LIST,
                title: secondaryListTitle,
                initialList: slice(secondaryList, 0, INIT_ACC_COUNT),
                list: secondaryList,
                showLoadMore: secondaryList.length > INIT_ACC_COUNT,
            });
        }
        setListOfCardsCasaToRender(itemsToRender);
        setAccLength(listOfCardsCASA.length);
    }

    function getListCasaCards(accType) {
        setIsLoading(true);
        setSelectedItemsCountList([]);
        setListOfCardsCasaToRender([]);
        getCasaCardsListEnquiry(accType)
            .then((response) => {
                const listOfCardsCASA = response?.data?.result?.accountListings;
                if (listOfCardsCASA && listOfCardsCASA.length) {
                    formatItemsToRender(listOfCardsCASA);
                } else {
                    let message;
                    if (itemToDeactivate === CASA) {
                        if (accType === SAVINGS) message = ALL_SAVINGS_ACC_BLOCKED;
                        else if (accType === CURRENT) message = ALL_CURRENT_ACC_BLOCKED;
                    } else if (itemToDeactivate === CARDS) {
                        message = ALL_CARDS_BLOCKED;
                    }
                    showInfoToast({
                        message,
                    });
                }
                setIsLoading(false);
            })
            .catch(() => {
                setIsLoading(false);
            });
    }

    function getPrimarySecondarySelectedItems() {
        const itemsListForDeactivation = [];
        if (itemToDeactivate === CASA) {
            const primarySelectedItems = selectedItemsList.filter((acc) => !acc.jointAccount);
            const secondarySelectedItems = selectedItemsList.filter((acc) => acc.jointAccount);
            if (primarySelectedItems.length) {
                itemsListForDeactivation.push({
                    title: SUSPEND_INDIVIDUAL_ACCOUNTS,
                    showEdit: true,
                    navBackInd: 1,
                    listItems: primarySelectedItems,
                });
            }
            if (secondarySelectedItems.length) {
                itemsListForDeactivation.push({
                    title: SUSPEND_JOINT_ACCOUNTS,
                    showEdit: true,
                    navBackInd: 1,
                    listItems: secondarySelectedItems,
                });
            }
        } else if (itemToDeactivate === CARDS) {
            const isPrimaryCardSelected = !!selectedItemsList.filter(
                (card) => card.creditCardType === "01"
            ).length;
            itemsListForDeactivation.push({
                id: CARD_BLOCK,
                title: isPrimaryCardSelected ? BLOCK_PRIMARY_CARD : BLOCK_SUPP_CARD,
                showEdit: true,
                navBackInd: 2,
                listItems: selectedItemsList,
            });
        }

        return itemsListForDeactivation;
    }

    function onClickNextButton() {
        if (itemToDeactivate === CASA) {
            setShowConfirmationModel(true);
        } else if (itemToDeactivate === CARDS) {
            const itemsListForDeactivation = getPrimarySecondarySelectedItems();
            navigation.navigate(SECURE_SWITCH_STACK, {
                screen: SELECT_REASON_TO_BLOCK_CARDS,
                params: {
                    from: M2U_DEACTIVATE,
                    fromModule,
                    fromScreen,
                    itemsListForDeactivation,
                    itemToDeactivate,
                },
            });
        }
    }

    function onClickConfirmOnModel() {
        setShowConfirmationModel(false);
        const itemsListForDeactivation = getPrimarySecondarySelectedItems();
        navigation.navigate(SECURE_SWITCH_STACK, {
            screen: DEACTIVATE_CARDS_CASA_CONFIRMATION,
            params: {
                from: M2U_DEACTIVATE,
                fromModule,
                fromScreen,
                itemsListForDeactivation,
                itemToDeactivate,
                selectedAccType: selectedAccTypeForCardsCasa,
            },
        });
    }

    useEffect(() => {
        getListCasaCards(selectedAccTypeForCardsCasa);
    }, []);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                header={
                    <HeaderLayout
                        backgroundColor={null}
                        headerLeftElement={<HeaderBackButton onPress={onBackHandler} />}
                        headerRightElement={<HeaderCloseButton onPress={onCloseHandler} />}
                        headerCenterElement={
                            <Typo
                                text={`Step ${step} of 2`}
                                fontWeight="600"
                                fontSize={12}
                                lineHeight={18}
                                color={DARK_GREY}
                            />
                        }
                    />
                }
            >
                <View style={styles.pageContainer}>
                    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                        <View>
                            <View style={styles.suspendAccHeading}>
                                <Typo
                                    text={pageIntroTexts.title}
                                    fontSize={14}
                                    lineHeight={18}
                                    textAlign="left"
                                    style={styles.suspendAccTitle}
                                />
                                <Typo
                                    text={pageIntroTexts.desc}
                                    fontSize={16}
                                    lineHeight={20}
                                    fontWeight="600"
                                    textAlign="left"
                                />
                            </View>
                            {itemToDeactivate === CASA && (
                                <CasaAccTypeSelectionContainer
                                    onSelectCasaAccType={onSelectCasaAccType}
                                    selectedAccTypeForCardsCasa={selectedAccTypeForCardsCasa}
                                />
                            )}
                            {
                                itemToDeactivate === CARDS && (
                                    <Typo
                                        text={BLOCK_CARD_NOTE}
                                        fontSize={12}
                                        lineHeight={18}
                                        fontWeight="400"
                                        textAlign="left"
                                        style={styles.noteText}
                                    />
                                )
                            }
                            {isLoading
                                ? (
                                    <View style={styles.productsListContainer}>
                                        <ProductCardLoader />
                                    </View>
                                )
                                : (
                                    <ListOfCardsCasaToRender
                                        listOfCardsCasaToRender={listOfCardsCasaToRender}
                                        itemToDeactivate={itemToDeactivate}
                                        onSelectAccItem={onSelectAccItem}
                                        onClickLoadMore={onClickLoadMore}
                                    />
                                )
                                }
                        </View>
                    </ScrollView>
                    <BottomView
                        itemToDeactivate={itemToDeactivate}
                        selectedItemsList={selectedItemsList}
                        accLength={accLength}
                        maxAccToSelect={maxAccToSelect}
                        onClickNextButton={onClickNextButton}
                    />
                </View>
            </ScreenLayout>
            <Popup
                visible={showConfirmationModel}
                onClose={() => {
                    setShowConfirmationModel(false);
                }}
                ContentComponent={
                    <KillSwitchConfirmation
                        {...SUSPEND_CASA_CONFIRMATION_MODEL}
                        primaryAction={{
                            text: CONFIRM,
                            onPress: onClickConfirmOnModel,
                        }}
                        secondaryAction={{
                            text: CANCEL,
                            onPress: () => {
                                setShowConfirmationModel(false);
                            },
                        }}
                    />
                }
            />
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    accName: {
        marginBottom: 3,
    },
    accountDetails: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 26,
        width: "100%",
    },
    accountName: {
        width: "80%",
    },
    accountTypeRadios: {
        flexDirection: "row",
        paddingTop: 17,
        paddingBottom: 37,
    },
    buttonContainer: {
        marginHorizontal: 24,
        marginTop: 16,
    },
    btnFooter: (inset) => ({
        alignItems: "center",
        backgroundColor: WHITE,
        borderTopColor: GREY,
        borderTopWidth: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        margin: 0,
        paddingBottom: inset.bottom ? inset.bottom : 24,
        paddingHorizontal: 24,
        paddingTop: 16,
        position: "relative",
        width,
    }),
    cardContainer: {
        borderRadius: 8,
        height: 117,
        marginBottom: 16,
        position: "relative",
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
        width: width - 48,
    },
    cardProviderImage: {
        height: 24,
        width: 42,
    },
    fieldContainer: {
        marginLeft: 24,
        marginRight: 24,
    },
    imageBg: {
        height: "100%",
        position: "relative",
        width: "100%",
    },
    individualAccTitle: {
        marginBottom: 16,
    },
    innerContainer: {
        padding: 16,
        width: "100%",
    },
    loadMore: {
        marginBottom: 48,
        marginHorizontal: 24,
        marginVertical: 16,
    },
    overlayContainer: {
        alignItems: "center",
        backgroundColor: OVERLAY,
        borderRadius: 8,
        flexDirection: "row",
        height: "100%",
        justifyContent: "center",
        left: 0,
        position: "absolute",
        top: 0,
        width: "100%",
    },
    pageContainer: {
        flex: 1,
    },
    productsListContainer: {
        marginHorizontal: 24,
        marginTop: 12,
    },
    noteText: {
        paddingHorizontal: 24,
        paddingBottom: 36,
    },
    scrollViewContainer: {
        backgroundColor: MEDIUM_GREY,
    },
    selectAccountType: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        marginRight: 16,
    },
    selectIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
    },
    selectTypeContainer: {
        paddingHorizontal: 24,
    },
    suspendAccHeading: {
        marginBottom: 24,
        marginLeft: 24,
        marginRight: 24,
        marginTop: 16,
    },
    suspendAccTitle: {
        paddingBottom: 4,
    },
});

SelectCardsCasaToDeactivate.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default SelectCardsCasaToDeactivate;
