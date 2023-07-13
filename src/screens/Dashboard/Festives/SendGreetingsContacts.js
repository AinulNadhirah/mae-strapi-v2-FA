// @ts-check
import PropTypes from "prop-types";
import React, { useEffect, FunctionComponent as FC, useState } from "react";

import ContactPicker from "@components/ContactPicker";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import useFestive from "@utils/useFestive";

function SendGreetingsContacts({ route, navigation, getModel }): FC {
    console.info("[SendGreetingsContacts] >> ", route?.params);
    // const fakes = [...Array(Math.ceil(29)).keys()];
    // const contacts = fakes.map((f) => ({
    //     mayaUserId: f + 1,
    //     mayaUserName: `Hahahaha-${f}`,
    //     profilePicUrl: null,
    //     number: `6016274985${f}`,
    // }));
    const [selectedContacts, setContacts] = useState([]);
    const { mobileNumber } = getModel("user");
    const { isTapTasticReady } = getModel("misc");
    const { festiveAssets } = useFestive();

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function onSelect(contact) {
        if (selectedContacts.length === 30) return;
        const isExists = selectedContacts.find((c) => c.mayaUserId === contact.mayaUserId);
        if (isExists) {
            const filtered = selectedContacts.filter((c) => c.mayaUserId !== contact.mayaUserId);
            setContacts([...filtered]);
        } else {
            setContacts([...selectedContacts, contact]);
        }
    }

    function onDone() {
        if (selectedContacts.length > 30) {
            showErrorToast({
                message: "Only 30 maximum contacts are allowed.",
            });

            return;
        } else if (selectedContacts.length <= 0) {
            return;
        }

        navigation.navigate("SendGreetingsSelected", {
            isTapTasticReady,
            ...route?.params,
            selectedContacts,
            eDuitData: null,
            updateContacts,
        });
    }

    function updateContacts(selectedContacts) {
        setContacts(selectedContacts);
    }

    function handleRefresh() {
        console.tron.log("refresh");
    }

    useEffect(() => {
        // return () =>
        //     navigation.setParams({
        //         screen: "",
        //     });
    }, [navigation]);

    return (
        <ContactPicker
            // title="Send e-Greetings"
            title={festiveAssets?.greetingSend.sendGreetingTitle}
            buttonLabel="Add"
            selectedContact={selectedContacts}
            bottomInfo={`${
                selectedContacts?.length ? selectedContacts.length : 0
            }/30 contacts selected.`}
            onSelect={onSelect}
            onDoneEvent={onDone}
            onBackPress={handleBack}
            onRefresh={handleRefresh}
            userMobileNumber={mobileNumber}
            callSync
            filter="maya"
            festiveFlag
            festiveImage={festiveAssets?.greetingSend.topContainer}
            hasWhiteText={festiveAssets?.isWhiteColorOnFestive}
        />
    );
}

SendGreetingsContacts.propTypes = {
    navigation: PropTypes.object,
    getModel: PropTypes.func,
    route: PropTypes.any,
};

export default withModelContext(SendGreetingsContacts);
