import * as shape from "d3-shape";
import _ from "lodash";
import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Svg, { G, Text, TSpan, Rect } from "react-native-svg";

import { BLACK, YELLOW } from "@constants/colors";

import Slice from "./Slice";

const d3 = { shape };
const { width } = Dimensions.get("screen");
const wheelWidth = width * 1.5;

function computeTextRotation(d) {
    return ((d.startAngle / 2 + d.endAngle / 2) * 180) / Math.PI;
}

function Label({ index, data }) {
    const arcLabel = d3.shape
        .arc()
        .outerRadius(wheelWidth / 2)
        .innerRadius(3);

    const getArc = useCallback((index, data) => {
        const arcs = _.sortBy(d3.shape.pie().value(() => 10)(data), (o) => {
            return o.index;
        });
        return arcs[index];
    }, []);

    const getMerchantName = useCallback((name) => {
        const shopname = name?.split(" ");

        if (shopname.length >= 2) {
            if (shopname[0].length + shopname[1].length > 15) {
                const str = `${shopname[0]} ${shopname[1]}`;
                return `${str.substr(0, 15)}...`;
            }

            return `${shopname[0]} ${shopname[1]}`;
        }

        if (shopname[0].length > 15) {
            return `${shopname[0].substr(0, shopname[0].length - 3)}...`;
        }

        return shopname[0];
    }, []);

    const getShopName = useCallback((name) => {
        const shopname = name.split(" ");
        return shopname;
    }, []);

    const shouldExceedCharcs = useCallback((merchantName) => {
        if (merchantName[0].length > 15 || merchantName[0].length + merchantName[1].length > 15) {
            return "";
        }

        if (merchantName.length > 3) {
            return `${merchantName[2]} ${merchantName[3]} ...`;
        }

        return merchantName[2];
    }, []);

    const merchant = data[index];
    const arc = getArc(index, data);
    const centroid = arcLabel.centroid(arc);
    const merchantName = getMerchantName(merchant?.shopName);
    const shopName = getShopName(merchant?.shopName);

    let cuisineLbl = "";
    if (merchant?.cuisinesTypes?.length) {
        cuisineLbl = merchant?.cuisinesTypes[0].categoryName;
    }

    return (
        <G transform={`translate(${centroid})`}>
            {merchant?.pills?.promo && (
                <>
                    <Rect
                        y={"-2.5em"}
                        x={"-2.6em"}
                        rx={7}
                        height="14"
                        width="60"
                        fill={YELLOW}
                        transform={`rotate(${computeTextRotation(arc)})`}
                    />
                    <Text
                        fill={BLACK}
                        transform={`rotate(${computeTextRotation(arc)})`}
                        textAnchor="middle"
                        fontFamily="Montserrat-Bold"
                        fontSize={7}
                        fontWeight="bold"
                        fontStyle="normal"
                    >
                        <TSpan key={`arc-${index}-slice-${2}`} y={"-2.9em"}>
                            {"Promotion"}
                        </TSpan>
                    </Text>
                </>
            )}

            <Text
                fill={BLACK}
                transform={`rotate(${computeTextRotation(arc)})`}
                textAnchor="middle"
                fontFamily="Montserrat-Bold"
                fontSize={8}
                fontWeight="bold"
                fontStyle="normal"
                lineHeight={16}
            >
                <TSpan y="-0.3em" key={`arc-${index}-slice-${merchant.merchantId}`}>
                    {merchantName}
                </TSpan>
                {shopName.length >= 2 && (
                    <TSpan x={0} y="1.3em" key={`arc-${index}-slice-${2}`}>
                        {shouldExceedCharcs(shopName)}
                    </TSpan>
                )}
            </Text>
            <Text
                fill={BLACK}
                transform={`rotate(${computeTextRotation(arc)})`}
                textAnchor="middle"
                fontFamily="Montserrat-Regular"
                fontSize={7}
                fontWeight="normal"
                fontStyle="normal"
                lineHeight={16}
                y={shopName.length > 3 ? "3.5em" : "3em"}
            >
                <TSpan key={`arc-${index}-slice-${2}`}>{cuisineLbl}</TSpan>
            </Text>

            <Text
                transform={`rotate(${computeTextRotation(arc)})`}
                fontFamily="Montserrat-Medium"
                textAnchor="middle"
                fill={BLACK}
                fontSize={8}
                fontWeight="500"
                fontStyle="normal"
                lineHeight={16}
                y={shopName.length > 3 ? "5.5em" : "5em"}
            >
                <TSpan key={`arc-${index}-slice-${5}`}>
                    {merchant?.distance
                        ? merchant?.distance?.substring(0, merchant?.distance.indexOf(".") + 2) +
                          " km"
                        : "- km"}
                </TSpan>
            </Text>
        </G>
    );
}

Label.propTypes = {
    color: PropTypes.any,
    data: PropTypes.any,
    index: PropTypes.any,
};

export default function SpinPie({ data }) {
    return (
        <View>
            <Svg
                width={width * 1.5}
                height={width * 1.5}
                viewBox={`0 0 ${width} ${width}`}
                style={styles.svg}
            >
                <G y={width / 2} x={width / 2}>
                    {data.map((item, index) => {
                        return (
                            <Slice
                                index={index}
                                endAngle={2 * Math.PI}
                                data={data}
                                key={"pie_shape_" + index}
                            />
                        );
                    })}
                </G>
                <G y={width / 2} x={width / 2}>
                    {data.map((item, index) => {
                        return <Label index={index} data={data} key={"pie_text_" + index} />;
                    })}
                </G>
            </Svg>
        </View>
    );
}

SpinPie.propTypes = {
    data: PropTypes.array,
};

const styles = StyleSheet.create({
    svg: {
        transform: [{ rotate: "-18deg" }],
    },
});
