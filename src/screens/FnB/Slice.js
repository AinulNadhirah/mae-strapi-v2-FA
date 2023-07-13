import * as shape from "d3-shape";
import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { Dimensions } from "react-native";
import { Path } from "react-native-svg";

import { WHITE } from "@constants/colors";

const d3 = { shape };
const { width } = Dimensions.get("screen");

export default function Slice({ endAngle, index, data }) {
    const arcGenerator = d3.shape
        .arc()
        .padAngle(0.0015)
        .outerRadius(width / 2.1)
        .innerRadius(20);

    const createPieArc = useCallback(
        (index, endAngle, data) => {
            // const arcs = d3.shape.pie().value((item) => item.number)(data);
            const arcs = d3.shape.pie().value(() => 10)(data);

            let arcData = arcs[index];

            return arcGenerator(arcData);
        },
        [arcGenerator]
    );

    const pieArc = createPieArc(index, endAngle, data);

    return <Path d={pieArc} strokeWidth={0.5} stroke="#e4e4e4" fill={WHITE} />;
}

Slice.propTypes = {
    data: PropTypes.array,
    endAngle: PropTypes.number,
    index: PropTypes.number,
};
