import PropTypes from "prop-types";
import React, { useCallback } from "react";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

export default function ArticlesScreen({ navigation }) {
    const handleGoBack = useCallback(() => navigation.goBack(), [navigation]);

    return (
        <ScreenContainer backgroundType="color">
            <React.Fragment>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={handleGoBack} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text="Articles Landing"
                                />
                            }
                        />
                    }
                >
                    <React.Fragment>
                        <Typo
                            fontSize={16}
                            fontWeight="600"
                            lineHeight={19}
                            text="Should be where the list of articles is. The article details will live inside specific stacks."
                        />
                    </React.Fragment>
                </ScreenLayout>
            </React.Fragment>
        </ScreenContainer>
    );
}

ArticlesScreen.propTypes = {
    navigation: PropTypes.object,
};
