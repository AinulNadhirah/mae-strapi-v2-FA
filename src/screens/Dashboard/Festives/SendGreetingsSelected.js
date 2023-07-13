// @ts-check
import PropTypes from "prop-types";
import React, { FunctionComponent as FC, useState } from "react";
import {
    ScrollView,
    View,
    TouchableOpacity,
    StyleSheet,
    Image,
    ImageBackground,
} from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import CacheeImageWithDefault from "@components/CacheeImageWithDefault";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typography from "@components/Text";

import { withModelContext } from "@context";

import {
    BLACK,
    DARK_GREY,
    DISABLED,
    DISABLED_TEXT,
    GREY,
    MEDIUM_GREY,
    SHADOW,
    WHITE,
    YELLOW,
} from "@constants/colors";

import { getContactNameInitial } from "@utils/dataModel/utility";
import useFestive from "@utils/useFestive";

import assets from "@assets";

function FriendRemove({ handleRemove }) {
    return (
        <TouchableOpacity onPress={handleRemove} style={styles.removeButton}>
            <Image source={assets.icClose} style={styles.removeButtonImg} />
        </TouchableOpacity>
    );
}

FriendRemove.propTypes = {
    handleRemove: PropTypes.func,
};

function FriendAvatar({ mayaUserName, name, imgUrl }) {
    function getInitial() {
        if (mayaUserName || name) return getContactNameInitial(mayaUserName || name);

        return "#";
    }
    return (
        <View style={styles.avatarContainer}>
            <View style={styles.avatarInner}>
                <Typography
                    color={DARK_GREY}
                    text={getInitial()}
                    fontWeight="300"
                    fontSize={24}
                    lineHeight={29}
                />

                {!!imgUrl?.length && (
                    <View
                        style={{
                            ...StyleSheet.absoluteFill,
                        }}
                    >
                        <Image
                            source={{
                                uri: imgUrl,
                            }}
                            style={styles.avatarImg}
                        />
                    </View>
                )}
            </View>
        </View>
    );
}

FriendAvatar.propTypes = {
    imgUrl: PropTypes.string,
    mayaUserName: PropTypes.string,
    name: PropTypes.string,
};

function Friend({ mayaUserId, mayaUserName, name, phoneNumber, profilePicUrl, onRemove }) {
    function handleRemove() {
        typeof onRemove === "function" && onRemove(mayaUserId);
    }

    return (
        <View style={styles.friendContainer}>
            <FriendAvatar imgUrl={profilePicUrl} mayaUserName={mayaUserName} name={name} />
            <View style={styles.friendContent}>
                <Typography
                    text={mayaUserName || name || phoneNumber}
                    fontWeight="600"
                    fontSize={14}
                    lineHeight={18}
                    textAlign="left"
                    ellipsizeMode="tail"
                    numberOfLines={1}
                />
            </View>
            <FriendRemove handleRemove={handleRemove} />
        </View>
    );
}

Friend.propTypes = {
    mayaUserId: PropTypes.number,
    mayaUserName: PropTypes.string,
    name: PropTypes.string,
    onRemove: PropTypes.func,
    phoneNumber: PropTypes.string,
    profilePicUrl: PropTypes.string,
};

function SendGreetingsSelected({ navigation, route }): FC {
    const [selectedContacts, setContacts] = useState(route.params?.selectedContacts ?? []);
    const { isTapTasticReady } = route?.params;
    const { festiveAssets } = useFestive();

    function handleBack() {
        route.params?.updateContacts(selectedContacts);
        navigation.canGoBack() && navigation.goBack();
    }

    function handleClose() {
        navigation.navigate("DashboardStack", {
            screen: "Dashboard",
            params: {
                screen: "FestiveQuickActionScreen",
            },
        });
    }

    function onRemove(id) {
        const contactsWithoutId = selectedContacts.filter((contact) => contact.mayaUserId !== id);

        setContacts(contactsWithoutId);
    }

    function onContinue() {
        navigation.navigate("SendGreetingsDesign", {
            ...route?.params,
            selectedContacts,
        });
    }

    function onAddMore() {
        handleBack();
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <CacheeImageWithDefault
                    resizeMode="stretch"
                    style={styles.imageBG}
                    image={festiveAssets?.greetingSend.topContainer}
                />
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typography
                                    // text="Send e-Greetings"
                                    text={festiveAssets?.greetingSend.sendGreetingTitle}
                                    fontWeight="600"
                                    fontSize={16}
                                    lineHeight={19}
                                    color={festiveAssets?.isWhiteColorOnFestive ? WHITE : BLACK}
                                />
                            }
                            headerLeftElement={
                                <HeaderBackButton
                                    isWhite={festiveAssets?.isWhiteColorOnFestive}
                                    onPress={handleBack}
                                />
                            }
                            headerRightElement={
                                <HeaderCloseButton
                                    isWhite={festiveAssets?.isWhiteColorOnFestive}
                                    onPress={handleClose}
                                />
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={44}
                    useSafeArea
                >
                    <>
                        <ScrollView style={styles.scroller}>
                            <Typography
                                text={`Selected friends (${selectedContacts?.length}/30)`}
                                fontWeight="600"
                                fontSize={14}
                                lineHeight={18}
                                textAlign="left"
                            />
                            <View style={styles.mainContent}>
                                {selectedContacts.map((contact) => (
                                    <Friend
                                        key={contact?.mayaUserId}
                                        {...contact}
                                        onRemove={onRemove}
                                    />
                                ))}
                            </View>
                        </ScrollView>
                        <FixedActionContainer>
                            <View style={styles.footerContainerLeft}>
                                <ActionButton
                                    disabled={selectedContacts.length > 29}
                                    backgroundColor={WHITE}
                                    fullWidth
                                    componentCenter={
                                        <Typography
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text="Add More"
                                        />
                                    }
                                    style={styles.actionSecondary}
                                    onPress={onAddMore}
                                />
                            </View>
                            <View style={styles.footerContainerRight}>
                                <ActionButton
                                    disabled={selectedContacts.length < 1}
                                    backgroundColor={
                                        selectedContacts.length < 1 ? DISABLED : YELLOW
                                    }
                                    fullWidth
                                    componentCenter={
                                        <Typography
                                            color={
                                                selectedContacts.length < 1 ? DISABLED_TEXT : BLACK
                                            }
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text="Continue"
                                        />
                                    }
                                    onPress={onContinue}
                                />
                            </View>
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

SendGreetingsSelected.propTypes = {
    getModel: PropTypes.func,
    navigation: PropTypes.object,
    route: PropTypes.object,
};

export default withModelContext(SendGreetingsSelected);

const styles = StyleSheet.create({
    actionSecondary: {
        borderColor: GREY,
        borderWidth: 1,
    },
    avatarContainer: {
        backgroundColor: WHITE,
        borderRadius: 32,
        height: 64,
        padding: 2,
        shadowColor: SHADOW,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 1,
        shadowRadius: 15,
        width: 64,
    },
    avatarImg: {
        height: "100%",
        width: "100%",
    },
    avatarInner: {
        alignItems: "center",
        backgroundColor: GREY,
        borderRadius: 32,
        height: "100%",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
        width: "100%",
    },
    footerContainerLeft: {
        flex: 0.5,
        paddingRight: 6,
    },
    footerContainerRight: {
        flex: 0.5,
        paddingLeft: 6,
    },
    friendContainer: {
        alignItems: "center",
        borderBottomColor: GREY,
        borderBottomWidth: 1,
        flexDirection: "row",
        paddingVertical: 18,
    },
    friendContent: {
        flex: 1,
        paddingHorizontal: 18,
    },

    imageBG: {
        flex: 1,
        height: "35%",
        position: "absolute",
        width: "100%",
    },
    mainContent: {
        paddingVertical: 8,
    },
    removeButton: {
        alignItems: "center",
        backgroundColor: GREY,
        borderRadius: 12,
        height: 24,
        justifyContent: "center",
        width: 24,
    },
    removeButtonImg: {
        height: "100%",
        width: "100%",
    },
    scroller: {
        paddingHorizontal: 36,
    },
});
