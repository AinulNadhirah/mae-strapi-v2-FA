import PropTypes from "prop-types";
import React from "react";
import AcknowledgementScreenTemplate from "@components/ScreenTemplates/AcknowledgementScreenTemplate";
import ActionButton from "@components/Buttons/ActionButton";
import Typography from "@components/Text";

export default class ASNBAddFavouritesAcknowledgementScreen extends React.Component {
    render() {
        return (
            <AcknowledgementScreenTemplate
                isSuccessful={false}
                message={false ? "Transfer Successful" : "Transfer Failed"}
                detailsData={[]}
                showLoader={false}
                errorMessage={this.props?.route?.params?.errorMessage ?? ""}
                ctaComponents={[
                    <ActionButton
                        key="share-button"
                        fullWidth
                        backgroundColor="#ffffff"
                        componentCenter={
                            <Typography
                                text="Share Receipt"
                                fontSize={14}
                                lineHeight={18}
                                fontWeight="600"
                            />
                        }
                    />,
                    <ActionButton
                        key="done-button"
                        fullWidth
                        componentCenter={
                            <Typography
                                text="Done"
                                fontSize={14}
                                lineHeight={18}
                                fontWeight="600"
                            />
                        }
                    />,
                ]}
            />
        );
    }
}

ASNBAddFavouritesAcknowledgementScreen.propTypes = {
    route: PropTypes.shape({
        params: PropTypes.shape({
            errorMessage: PropTypes.string,
        }),
    }),
};
