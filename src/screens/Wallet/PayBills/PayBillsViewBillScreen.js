import React, { useState, useCallback } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Image,
    Text,
} from "react-native";

import { COMMON_MODULE, PDF_VIEWER } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { Avatar } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { getBillPresPDF } from "@services";

import { BLACK, GREY, MEDIUM_GREY, RED } from "@constants/colors";

import Assets from "@assets";

function PayBillsViewBillScreen({ route, navigation }) {
    const params = route?.params ?? {};
    const [billData] = useState(params?.newBillHist);
    const [paymentData] = useState(params?.newPaymentHist);
    const [logoImage] = useState(params?.image);

    const goBack = useCallback(() => {
        console.log("[PayBillsViewBillScreen] >> [goBack]");
        navigation.goBack();
    }, [navigation]);

    const onOpenPDF = useCallback(
        (url, value) => {
            console.log("[PayBillsViewBillScreen] >> [onTeamsConditionClick]");
            const navParams = {
                file: url,
                share: false,
                showShare: false,
                type: "url",
                pdfType: value?.name,
                title: value?.name,
                route: "PayBillsViewBillScreen",
                module: "payBillsModule",
            };

            navigation.navigate(COMMON_MODULE, {
                screen: PDF_VIEWER,
                params: navParams,
            });
        },
        [navigation]
    );
    const getBillPresPDFApi = useCallback(async (data) => {
        try {
            const response = await getBillPresPDF(data);
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            return null;
        }
    }, []);

    const onBillPress = useCallback(
        async (value) => {
            console.log("[PayBillsViewBillScreen] >> [value]", value);
            const serverParams = {
                accountNo: value?.accountNumber,
                accountType: value?.accountType,
                stmtDate: value?.billDate,
            };
            const response = await getBillPresPDFApi(serverParams);
            if (response) {
                const { statusCode, pdfFileURL, statusDesc } = response?.data;
                if (statusCode === "0000") {
                    onOpenPDF(pdfFileURL, value);
                } else {
                    showErrorToast({
                        message: statusDesc ?? "Something went wrong. Try again later1.",
                    });
                }
            }
        },
        [onOpenPDF, getBillPresPDFApi]
    );

    const onPaymentPress = useCallback(() => {
        /*need to do enchanse later depends requirment*/
    }, []);

    // No Data View Class
    const NoDataView = useCallback(({ title, description }) => {
        return (
            <View style={Style.noData}>
                <View style={Style.noDataTitle}>
                    <Typo
                        fontSize={18}
                        fontWeight="bold"
                        letterSpacing={0}
                        lineHeight={32}
                        color="#000000"
                    >
                        <Text>{title}</Text>
                    </Typo>
                </View>
                <View style={Style.noDataDesc}>
                    <Typo fontSize={14} lineHeight={20}>
                        <Text>{description}</Text>
                    </Typo>
                </View>
            </View>
        );
    }, []);

    const BillListItem = useCallback(({ title, item, image, paymentAmt, onPress }) => {
        const onListItemPressed = useCallback(() => onPress(item));
        return (
            <TouchableOpacity activeOpacity={0.9} onPress={() => onListItemPressed(item)}>
                <View style={Style.bankInfo}>
                    <View style={Style.circleImageView}>
                        <View style={Style.circleImageView}>
                            {image.type === "local" && (
                                <Image
                                    style={image.imgStyle}
                                    source={image.source}
                                    resizeMethod="scale"
                                />
                            )}
                            {image.type === "url" && (
                                <Avatar imageUri={logoImage} name="name" radius={42} />
                            )}
                        </View>
                    </View>
                    <View style={Style.bankInfoText}>
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={18}
                            color="#000000"
                            textAlign="left"
                            text={title}
                        />
                    </View>
                    {paymentAmt ? (
                        <View style={Style.amtText}>
                            <Typo
                                fontSize={12}
                                fontWeight="600"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={18}
                                color={RED}
                                textAlign="left"
                                text={paymentAmt}
                            />
                        </View>
                    ) : (
                        <View style={Style.statementImage}>
                            <Image style={Style.statementImg} source={Assets.payStatement} />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    }, []);

    const BillList = useCallback(({ list, onItemPress, listFrom }) => {
        const extractKey = useCallback((item, index) => `${item.contentId}-${index}`, []);
        const renderItem = useCallback(
            ({ item }) => (
                <BillListItem
                    title={item.name}
                    item={item}
                    paymentAmt={item?.amt}
                    image={{
                        type: "url",
                        source: item.image,
                    }}
                    onPress={onItemPress}
                    type="card"
                />
            ),
            [onItemPress]
        );
        return (
            <FlatList
                style={Style.listCls}
                data={list}
                extraData={list}
                scrollToIndex={0}
                showsHorizontalScrollIndicator={false}
                showIndicator={false}
                keyExtractor={extractKey}
                renderItem={renderItem}
                ListEmptyComponent={
                    <NoDataView
                        title={listFrom === "BILL" ? "No Bills Found" : "No History Found"}
                        description="We couldn't find any items."
                    />
                }
            />
        );
    }, []);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={goBack} />}
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text="View Bills"
                            />
                        }
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                useSafeArea
            >
                <React.Fragment>
                    <ScrollView
                        horizontal={false}
                        contentContainerStyle={{ flexGrow: 1 }}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled
                    >
                        <View style={Style.txnHeader}>
                            <Typo
                                text="Latest Bills"
                                fontWeight="600"
                                fontSize={12}
                                lineHeight={16}
                                textAlign="left"
                                color={BLACK}
                            />
                        </View>
                        <View style={Style.svContainer}>
                            <BillList
                                list={billData}
                                onItemPress={onBillPress}
                                listFrom="BILL"
                            ></BillList>
                        </View>
                        <View style={Style.txnHeader}>
                            <Typo
                                text="Payment History"
                                fontWeight="600"
                                fontSize={12}
                                lineHeight={16}
                                textAlign="left"
                                color={BLACK}
                            />
                        </View>
                        <View style={Style.svContainer}>
                            <BillList
                                list={paymentData}
                                onItemPress={onPaymentPress}
                                listFrom="HISTORY"
                            ></BillList>
                        </View>
                    </ScrollView>
                </React.Fragment>
            </ScreenLayout>
        </ScreenContainer>
    );
}

const Style = StyleSheet.create({
    svContainer: {
        paddingHorizontal: 24,
        paddingVertical: 4,
    },
    txnHeader: {
        backgroundColor: GREY,
        paddingHorizontal: 24,
        paddingVertical: 8,
    },
    bankInfo: {
        width: "100%",
        flexDirection: "row",
        paddingBottom: 17,
        borderBottomWidth: 1,
        borderBottomColor: "#eaeaea",
    },
    circleImageView: {
        width: 42,
        height: 42,
        borderRadius: 42 / 2,
        borderWidth: 1,
        borderColor: "#ffffff",
        backgroundColor: "#ffffff",
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
    },
    bankInfoText: {
        flex: 1,
        marginLeft: 16,
        justifyContent: "center",
        flexDirection: "column",
    },
    amtText: {
        justifyContent: "center",
        flexDirection: "column",
    },
    statementImage: {
        justifyContent: "center",
        flexDirection: "column",
    },
    seperator: {
        backgroundColor: "#CED0CE",
        height: 1,
        width: "100%",
    },
    statementImg: {
        width: 24,
        height: 24,
        resizeMode: "contain",
    },
    listCls: {
        width: "100%",
        paddingTop: 12,
    },
    noData: {
        flex: 1,
        padding: 30,
        justifyContent: "center",
    },
    noDataDesc: {
        paddingTop: 10,
    },
});

export default PayBillsViewBillScreen;
