import React, { useRef } from "react";
import { View, Image, StyleSheet, ScrollView } from "react-native";
import ActionSheet from "react-native-actionsheet";

import { PLSTP_CAMERA, PLSTP_UPLOAD_DOC_VERIFICATION } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { YELLOW } from "@constants/colors";
import { PLSTP_UD_HEADER, PLSTP_UD_NOTE, PLSTP_UD_GOT_IT } from "@constants/strings";

import { checkCamPermission } from "@utils/dataModel/utility";

import Assets from "@assets";

function PLSTPUploadDocNote({ route, navigation }) {
    const params = route?.params ?? {};
    const notes = params?.notes ?? [];
    const title = params?.title ?? "";
    const sampleImg = params?.img ?? "";
    const { docType } = params;
    const actionsheet = useRef();

    async function handleOnPressActionsheet(index) {
        if (index < 2) {
            if (index !== 1) {
                const permission = await checkCamPermission();
                if (permission) {
                    navigateToCamera(index);
                }
            } else {
                navigateToCamera(index);
            }
        }
    }

    function navigateToCamera(index) {
        navigation.navigate(PLSTP_CAMERA, {
            ...route.params,
            imagePicker: index === 1,
        });
    }

    function onBackTap() {
        console.log("[PLSTPUploadDocNote] >> [onBackTap]");
        navigation.pop();
    }

    function onGotIt() {
        console.log("[PLSTPUploadDocNote] >> [onGotIt]");
        if (docType === "SALARY" || docType === "EA" || docType === "BR") {
            actionsheet.current.show();
        } else {
            navigation.navigate(PLSTP_UPLOAD_DOC_VERIFICATION, {
                ...route.params,
            });
        }
    }

    return (
        <ScreenContainer backgroundType="color" analyticScreenName={params?.analyticScreenName}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text={PLSTP_UD_HEADER}
                            />
                        }
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                useSafeArea
            >
                <ScrollView>
                    <View style={styles.container}>
                        <View style={styles.counterTitle}>
                            <Typo
                                text={title}
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={23}
                                textAlign="left"
                            />
                            <SpaceFiller height={25} />
                            <View style={styles.imageView}>
                                <Image source={sampleImg} style={styles.image} />
                            </View>
                            <SpaceFiller height={40} />
                            <Typo
                                text={PLSTP_UD_NOTE}
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={17}
                                textAlign="left"
                            />
                            <SpaceFiller height={8} />
                            {notes.map((note, index) => {
                                return (
                                    <React.Fragment key={`${note}-${index}`}>
                                        <View style={styles.itemOuterCls}>
                                            <Image
                                                source={Assets.plstpOval}
                                                style={styles.radioImg}
                                            />
                                            <Typo
                                                text={note}
                                                fontSize={14}
                                                fontWeight="400"
                                                lineHeight={20}
                                                textAlign="left"
                                            />
                                        </View>
                                        {index + 1 < notes.length && <SpaceFiller height={17} />}
                                    </React.Fragment>
                                );
                            })}
                        </View>
                    </View>
                </ScrollView>
                <FixedActionContainer>
                    <View style={styles.bottomBtnContCls}>
                        <ActionButton
                            activeOpacity={1}
                            backgroundColor={YELLOW}
                            fullWidth
                            componentCenter={
                                <Typo
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="600"
                                    text={PLSTP_UD_GOT_IT}
                                />
                            }
                            onPress={onGotIt}
                        />
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
            <ActionSheet
                ref={actionsheet}
                options={["Take a photo", "Choose from library", "Cancel"]}
                cancelButtonIndex={2}
                onPress={handleOnPressActionsheet}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
    },

    container: {
        alignItems: "flex-start",
        flex: 1,
        justifyContent: "flex-start",
        marginBottom: 36,
        marginHorizontal: 24,
        marginTop: 10,
    },

    counterTitle: {
        paddingHorizontal: 20,
    },

    image: {
        flex: 1,
        justifyContent: "center",
        resizeMode: "stretch",
    },
    imageView: {
        alignItems: "center",
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        width: 300,
    },

    itemOuterCls: {
        alignItems: "center",
        flexDirection: "row",
        overflow: "visible",
    },
    radioImg: {
        height: 6,
        marginRight: 8,
        width: 6,
    },
});

export default PLSTPUploadDocNote;
