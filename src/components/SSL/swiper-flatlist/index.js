/** Local copy of react-native-swiper-flatlist
 * 1. Fix: import {FlatList} from "react-native-gesture-handler" instead of "react-native"
 * 2. Due to a bug in Sama2Lokal Landing screen's "What would u like to order" Grid
 *  - unable to scroll because it is nested inside TabView
 *  - doesnt work even after added nestedScrollEnabled EVERY scrollview / flatlist involved
 */
import { SwiperFlatList, Pagination } from "./src/components";

export default SwiperFlatList;

export { SwiperFlatList, Pagination };
