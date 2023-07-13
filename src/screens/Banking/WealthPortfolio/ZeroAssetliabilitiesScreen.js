import moment from "moment";
import PropTypes from "prop-types";
import React, { useState } from "react";

import EmptyStateScreen from "@screens/CommonScreens/EmptyStateScreen";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import { ErrorMessageV2 } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";
import { TopMenu } from "@components/TopMenu";

import Assets from "@assets";

const ZeroAssetliabilitiesScreen = ({ route, navigation }) => {
    const { title, subtitle } = route.params;
    const [toggleTop, setToggleTop] = useState(false);
    const [toggle, setToggle] = useState(false);

    function onHeaderBackButtonPressed() {
        navigation.goBack();
    }
    function onPressShowMenu() {
        setToggleTop(true);
    }

    function onDismissNote() {
        setToggle(false);
    }

    function onToggleMenu() {
        setToggleTop(false);
    }

    async function handleTopMenuItemPress(param) {
        if (param === "note") {
            setToggleTop(false);
            setTimeout(() => setToggle(true), 0);
        }
    }
    const menuArray = [
        {
            menuLabel: "Important Note",
            menuParam: "note",
        },
    ];
    const asOfDate = (() => {
        const today = new Date();
        const yesterday = today.setDate(today.getDate() - 1);
        return moment(yesterday).format("DD MMM YYYY");
    })();

    return (
        <>
            <ScreenContainer backgroundType="color">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={
                                <HeaderBackButton onPress={onHeaderBackButtonPressed} />
                            }
                            headerCenterElement={
                                <Typo
                                    text="Portfolio"
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={20}
                                />
                            }
                            headerRightElement={<HeaderDotDotDotButton onPress={onPressShowMenu} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <EmptyStateScreen
                        imageSrc={Assets.illustrationEmptyState}
                        headerText={title}
                        subText={subtitle}
                    />
                    {toggle ? (
                        <ErrorMessageV2
                            onClose={onDismissNote}
                            title="Important Note"
                            description={`1. Market Value for products in foreign currencies is estimated based on an average of Maybank’s Buying and Selling TT Foreign Exchange Rate as of ${asOfDate}, and is not an executable rate.\n\n2. The information provided here is for reference purposes only, and is not a statement of account.`}
                        />
                    ) : null}
                </ScreenLayout>
            </ScreenContainer>
            <TopMenu
                showTopMenu={toggleTop}
                onClose={onToggleMenu}
                navigation={navigation}
                menuArray={menuArray}
                onItemPress={handleTopMenuItemPress}
            />
        </>
    );
};

ZeroAssetliabilitiesScreen.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default ZeroAssetliabilitiesScreen;
