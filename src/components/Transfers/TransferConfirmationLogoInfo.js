import React from "react";
import { View, Image } from "react-native";
import { CircularTextImage, Avatar } from "@components/Common";
import BorderedAvatar from "@components/Avatars/BorderedAvatar";
import * as Utility from "@utils/dataModel/utility";
import Typo from "@components/Text";
import PropTypes from "prop-types";

const LogoInfo = ({ imageType, image, title, subtitle }) => {
    return (
        <React.Fragment>
            {/* SECTION LOGO ------------------------ */}
            <View style={Styles.logo}>
                {imageType === "text" && <CircularTextImage text={Utility.getShortName(image)} />}
                {imageType == "url" && <Avatar imageUri={image} name={"name"} radius={64}></Avatar>}
                {imageType == "localAsset" && (
                    <BorderedAvatar width={64} height={64} borderRadius={48}>
                        <Image source={image} />
                    </BorderedAvatar>
                )}
            </View>
            {/* SECTION LOGO Title and subtitle ------------------------ */}
            <View>
                <View style={Styles.logoTitle}>
                    <Typo
                        fontSize={14}
                        fontWeight="600"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        color="#000000"
                        text={title}
                    />
                </View>
                <View style={Styles.logoSubTitle}>
                    <Typo
                        fontSize={14}
                        fontWeight="normal"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={20}
                        color="#000000"
                        text={subtitle}
                    />
                </View>
            </View>
        </React.Fragment>
    );
};

LogoInfo.propTypes = {
    imageType: PropTypes.string,
    image: PropTypes.number,
    title: PropTypes.string,
    subtitle: PropTypes.string,
};

LogoInfo.defaultProps = {
    imageType: "",
    image: "",
    title: "",
    subtitle: "",
};

const Memoiz = React.memo(LogoInfo);

export default Memoiz;

const Styles = {
    logo: {
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
    },
    logoTitle: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 14,
    },
    logoSubTitle: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 4,
    },
};
