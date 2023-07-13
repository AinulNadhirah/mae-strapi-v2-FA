import React from "react";
import PropTypes from "prop-types";
import ContentDetailsScreenTemplate from "@components/ScreenTemplates/ContentDetailsScreenTemplate";
import CTAController from "@screens/Promotions/CTAController";

export default class DashboardContentDetails extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object,
    };

    render() {
        const {
            route: {
                params: { itemDetails, callPage, index },
            },
        } = this.props;
        return (
            <ContentDetailsScreenTemplate
                callPage={callPage}
                itemDetails={itemDetails}
                // onGoBack={onGoBack}
                index={index}
                navigation={this.props.navigation}
                onCTAPressed={CTAController}
            />
        );
    }
}
