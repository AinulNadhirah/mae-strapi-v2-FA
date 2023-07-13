import NavigationService from "@navigation/navigationService";

import { unlinkM2UAccess } from "@utils/dataModel/utilityPartial.5";

export const handleErrorUnlinkM2U = async (controller) => {
    await unlinkM2UAccess(controller.getModel, controller.resetModel);
    controller.updateModel({
        ui: {
            ssoPopup: false,
            rsaLockedPopup: false,
            suspendOrLockedPopup: false,
            suspendOrLockedTitle: "",
            suspendOrLockedMessage: "",
            generalErrorPopup: false,
            secureStorageFailedPopup: false,
        },
        moduleLoader: {
            shouldLoadOnboardingModule: true,
            shouldLoadOtherModule: true,
        },
    });

    NavigationService.resetAndNavigateToModule("Splashscreen", "", {
        skipIntro: true,
    });
};
