import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View } from "react-native";
import Typo from "@components/Text";
import { WHITE } from "@constants/colors";

const CalculationNotes = (props) => {
    const { notes } = props;
    return (
        <>
            <View style={Style.whiteContainerStyle}>
                {notes.map((item, index) => {
                    return (
                        <View key={index} style={Style.calculationPointsContainer}>
                            <Typo
                                text={`${++index}.  `}
                                fontWeight="400"
                                fontSize={14}
                                lineHeight={20}
                                textAlign="left"
                            />
                            <View>
                                <Typo
                                    text={item?.header}
                                    fontWeight="600"
                                    fontSize={14}
                                    lineHeight={20}
                                    textAlign="left"
                                />
                                {
                                    item?.description && (
                                        <Typo
                                        text={item.description}
                                        fontWeight="400"
                                        fontSize={14}
                                        lineHeight={20}
                                        textAlign="left"
                                        />
                                    )
                                }
                            </View>
                        </View>
                    );
                })}
            </View>
        </>
    );
};

CalculationNotes.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    props: PropTypes.object,
    notes: PropTypes.any
};

const Style = StyleSheet.create({
    calculationPointsContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        width: "100%",
        marginVertical: 5,
        paddingRight: 20,
    },
    whiteContainerStyle: {
        paddingLeft: 16,
        paddingTop: 10,
        paddingRight: 16,
        paddingBottom: 10,
        backgroundColor: WHITE,
        borderRadius: 8
    }
});

export default CalculationNotes;
