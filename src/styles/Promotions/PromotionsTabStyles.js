import { isAbsolute } from "path";
import { StyleSheet } from "react-native";
import { Dimensions, Image } from "react-native";

export const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
    carouselContainer: { paddingHorizontal: 20, paddingTop: 20 },
    container: {
        flex: 1,
        backgroundColor: "rgba(248, 248, 248, 1)",
    },
    containerFeatured: {
        marginTop: 24,
    },
    containerLatest: {
        paddingTop: 24,
        paddingBottom: 24,
        flex: 1,
    },
    containerHeaderTitle: {
        marginHorizontal: 24,
    },
    containerSearch: {
        marginTop: -8,
        marginHorizontal: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    containerResults: {
        paddingBottom: 36,
    },
    containerResultCard: {
        marginBottom: 32,
        marginHorizontal: 24,
        marginTop: 4,
    },
    searchBarIcon: {
        width: 45,
        height: 45,
    },
    searchLabelContainer: {
        flex: 1,
        height: 45,
        justifyContent: "center",
    },
    separator: { width: 20 },
    featuredList: { paddingTop: 24 },
    featuredContainer: { paddingTop: 24 },
});
