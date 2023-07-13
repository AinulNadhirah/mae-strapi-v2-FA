import { ENDPOINT_BASE_V2 } from "@constants/url";

const ONBOARDING_LOGIN = `${ENDPOINT_BASE_V2}/users/login`;
const ONBOARDING_OTP = `${ENDPOINT_BASE_V2}/users/requestotp`;
const ONBOARDING_VALIDATE_OTP = `${ENDPOINT_BASE_V2}/users/validateotpRegistration`;
const ONBOARDING_UPDATE_PROFILE = `${ENDPOINT_BASE_V2}/users/secure/updateUserProfile`;

export { ONBOARDING_LOGIN, ONBOARDING_OTP, ONBOARDING_VALIDATE_OTP, ONBOARDING_UPDATE_PROFILE };
