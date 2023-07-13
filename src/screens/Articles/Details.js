import PropTypes from "prop-types";
import React from "react";

import CTAController from "@screens/Promotions/CTAController";

import ContentDetailsScreenTemplate from "@components/ScreenTemplates/ContentDetailsScreenTemplate";

export default class ArticleDetails extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    render() {
        console.log(this.props);

        const { navigation, route } = this.props;
        const itemDetails = route.params?.itemDetails;
        const callPage = route.params?.callPage;
        const onGoBack = route.params?.onGoBack;
        const index = route.params?.index;

        return (
            <ContentDetailsScreenTemplate
                callPage={callPage}
                itemDetails={itemDetails}
                onGoBack={onGoBack}
                index={index}
                navigation={navigation}
                onCTAPressed={CTAController}
            />
        );
    }
}
