import React, { Component } from "react";
import { Text, View, Image, TouchableOpacity, TouchableWithoutFeedback, Alert } from "react-native";
import PropTypes from "prop-types";
import Slider from "react-native-slider";
import Styles from "@styles/OffersListItem";
import * as Strings from "@constants/strings";
import { ButtonRound, HideView, ButtonRoundLeft, HighlightText } from "@components/Common";
import commonStyle from "@styles/main";

// import CustomFlashMessage from "@components/Toast";

// const itemsListItem = ({ item, onPress, likeClick, dislikeClick, bookmarkClick }) => {

class itemsListItem extends Component {
    static propTypes = {
        item: PropTypes.array,
        likeClick: PropTypes.func.isRequired,
        dislikeClick: PropTypes.func.isRequired,
        bookmarkClick: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
    }

    // var isMutation = false
    // var bookMarkQuery = CREATE_BOOKMARK
    // const onSuccess = () => {
    //   CustomFlashMessage.showContentSaveMessage("Saved", "", "bottom", "warning");
    // };

    renderBookmark = (item) => {
        let likeButton = require("@assets/icons/ic_bookmark_no.png");

        return (
            <TouchableOpacity
                onPress={bookmarkClick}
                testID={"btnSaveContent"}
                accessibilityLabel={"btnSaveContent"}
            >
                <Image style={[Styles.bookmarkButtonIcon]} source={likeButton} />
            </TouchableOpacity>
        );
    };

    renderLikeContent = (item) => {
        let disLikeButton;

        if (
            item.userContent == null ||
            item.userContent === null ||
            item.userContent === undefined ||
            (item.userContent != null && item.userContent.contentLike === "0")
        ) {
            disLikeButton = require("@assets/icons/ic_like_no.png");
        } else if (item.userContent != null && item.userContent.contentLike === "1") {
            disLikeButton = require("@assets/icons/ic_like_no.png");
        } else if (item.userContent != null && item.userContent.contentLike === "2") {
            disLikeButton = require("@assets/icons/ic_like_done.png");
        } else {
            disLikeButton = require("@assets/icons/ic_like_no.png");
        }

        return (
            <TouchableOpacity
                style={[Styles.likeButtonIcon]}
                onPress={likeClick}
                // onPress={() => {
                //   console.log('like content is', item.userContent.contentLike)
                //   if (item.userContent.contentLike == 0) {
                //     console.log('like content is zero')

                //   }
                //   else if (item.userContent.contentLike == 1) {
                //     console.log('like content is one')

                //   } else {
                //     console.log('like content is one')

                //   }
                // }

                // }

                testID={"btnDisLikeButtonIcon"}
                accessibilityLabel={"btnDisLikeButtonIcon"}
            >
                <Image style={[Styles.likeButtonIcon]} source={disLikeButton} />
            </TouchableOpacity>
        );
    };

    renderDisLikeContent = (item) => {
        let likeButton;

        if (
            item.userContent == null ||
            item.userContent === null ||
            item.userContent === undefined ||
            (item.userContent != null && item.userContent.contentLike === "0")
        ) {
            likeButton = require("@assets/icons/ic_dislike_no.png");
            disLikeButton = require("@assets/icons/ic_like_no.png");
        } else if (item.userContent != null && item.userContent.contentLike === "1") {
            likeButton = require("@assets/icons/ic_dislike_done.png");
            disLikeButton = require("@assets/icons/ic_like_no.png");
        } else if (item.userContent != null && item.userContent.contentLike === "2") {
            likeButton = require("@assets/icons/ic_dislike_no.png");
            disLikeButton = require("@assets/icons/ic_like_done.png");
        } else {
            likeButton = require("@assets/icons/ic_dislike_no.png");
            disLikeButton = require("@assets/icons/ic_like_no.png");
        }

        return (
            <TouchableOpacity
                onPress={dislikeClick}
                // onPress={() => {
                //   console.log('dislike content is', item.userContent.contentLike)
                // }
                // }
                testID={"btnLikeButtonIcon"}
                accessibilityLabel={"btnLikeButtonIcon"}
            >
                <Image style={[Styles.likeButtonIcon]} source={likeButton} />
            </TouchableOpacity>
        );
    };

    render() {
        return (
            <View>
                {/* <TouchableWithoutFeedback underlayColor='none'>
        <View
          style={
            item.contentType == "1" || item.contentType == "2"
              ? Styles.rewardsMainContainer
              : Styles.rewardsMainContainerEmpty
          }
        >
          <HideView
            hide={item.contentType == "1" ? false : true}
            style={Styles.offerPlanMainContainer}
          >
            <View style={Styles.budgetingContainer}>
              <Text
                style={[commonStyle.blackColour, Styles.textDescription, commonStyle.font]}
                testID={"txtIF_YOU_HAVE"}
                accessibilityLabel={"txtIF_YOU_HAVE"}
              >
                {Strings.IF_YOU_HAVE}
              </Text>

              <View style={Styles.budgetingButton}>
                <ButtonRoundLeft
                  testID={"btnGO_ON_AN_EXOTIC_HOLIDAY"}
                  accessibilityLabel={"btnGO_ON_AN_EXOTIC_HOLIDAY"}
                  headerText={Strings.GO_ON_AN_EXOTIC_HOLIDAY}
                  style={[commonStyle.flex1]}
                //onPress={this.onMovetoNext.bind(this)}
                />

                <ButtonRoundLeft
                  testID={"btnBUY_SOMETHINGS"}
                  accessibilityLabel={"btnBUY_SOMETHINGS"}
                  headerText={Strings.BUY_SOMETHINGS}
                  style={commonStyle.flex1}
                //onPress={this.onMovetoNext.bind(this)}
                />

                <ButtonRoundLeft
                  testID={"btnSAVE_THE_MONEY"}
                  accessibilityLabel={"btnSAVE_THE_MONEY"}
                  headerText={Strings.SAVE_THE_MONEY}
                  style={commonStyle.flex1}
                //onPress={this.onMovetoNext.bind(this)}
                />
              </View>
            </View>
          </HideView>

          <HideView
            hide={item.contentType == "2" ? false : true}
            style={Styles.offerPlanMainContainer2}
          >
            <View style={Styles.budgetingContainer}>
              <Text
                style={[Styles.text, Styles.textBlack, Styles.textReminderDesc, commonStyle.font]}
                testID={"txtMALAYSIANS_SPEND"}
                accessibilityLabel={"txtMALAYSIANS_SPEND"}
              >
                {Strings.MALAYSIANS_SPEND}
              </Text>

              <Text
                style={[
                  commonStyle.blackColour,
                  commonStyle.fontSize20,
                  Styles.textReminderDesc2, commonStyle.font
                ]}
                testID={"txtHOW_MUCH_DO_YOU"}
                accessibilityLabel={"txtHOW_MUCH_DO_YOU"}
              >
                {Strings.HOW_MUCH_DO_YOU}
              </Text>

              <View style={Styles.spendSpinnerContainer}>
                <Slider
                  step={1}
                  maximumValue={100}
                  //onValueChange={this.change.bind(this)}
                  // value={value}
                  value={10}
                  testID={"sliderSpending"}
                  accessibilityLabel={"sliderSpending"}
                />
              </View>

              <View style={Styles.budgetingButton}>
                <ButtonRound
                  testID={"btbDONE"}
                  accessibilityLabel={"btbDONE"}
                  headerText={Strings.DONE}
                  style={commonStyle.flex1}
                //onPress={this.onMovetoNext.bind(this)}
                />
              </View>
            </View>
          </HideView>

          <View style={Styles.rewardsContainer}>
            <View style={Styles.rewardsBox}>
              <Image
                testID={"imgRewardsImage"}
                accessibilityLabel={"imgRewardsImage"}
                style={Styles.rewardsImage}
                //source={require("@assets/images/ic_rewards1.png")}
                source={{ uri: item.imageUrl }}
              //source={{ uri: item.imageUrl }}
              />
              <View style={[Styles.rewardsTitleLayout]}>
                <Text
                  style={[Styles.textReminderTitle, commonStyle.font]}
                  numberOfLines={2}
                  testID={"txtRewardsTitle"}
                  accessibilityLabel={"txtRewardsTitle"}
                >
                  {(item.title != null) ? ((item.title).toString()).replace(/\r?\n|\r/g, " ") : ""}
                </Text>
              </View>
              <View style={[Styles.rewardsDesLayout]}>
                <HighlightText
                  highlightStyle={{ fontWeight: "bold", color: 'red' }}
                  searchWords={['More']}
                  accessible={true}
                  adjustsFontSizeToFit={true}
                  numberOfLines={3}
                  style={[Styles.textOfferDesc2, commonStyle.font]}
                  textToHighlight={(item != null && item.fullText != null) ? (item.fullText.toString().replace(/\r?\n|\r/g, " ").length > 100) ? item.fullText.toString().replace(/\r?\n|\r/g, " ").substring(0, 100) + '... More' : item.fullText.toString().replace(/\r?\n|\r/g, " ") : ""}
                  testID={"txtRewardsDescription"}
                  accessibilityLabel={"txtRewardsDescription"}
                />


              </View>
              <View style={[Styles.offerValeLayout]}>
                <Text
                  style={[Styles.offerValueLabel, commonStyle.font]}
                  testID={"txtRewardsDescription1"}
                  accessibilityLabel={"txtRewardsDescription1"}
                  adjustsFontSizeToFit={true}
                  numberOfLines={2}
                >
                  {(item != null) ? ((item.introText).toString()).replace(/\r?\n|\r/g, " ") : ""}
                </Text>
              </View>

              <View style={[Styles.offerLikeLayout]}>
                <View style={[Styles.offerLikeLayout1and2]}>
                  <View style={[Styles.offerLikeLayout1and2Full]}>
                    <View style={[Styles.offerLikeLayout1]}>
                      {
                        this.renderDisLikeContent(item)

                      }

                    </View>
                    <View style={[Styles.offerLikeLayout2]}>
                      {
                        this.renderLikeContent(item)

                      }
                    </View>
                  </View>
                </View>
                <View style={[Styles.offerLikeLayout3]}>
                  {
                    this.renderBookmark(item)

                  }
                  
                </View>
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback> */}
            </View>
        );
    }
}

export { itemsListItem };
