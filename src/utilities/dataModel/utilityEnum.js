import { WHITE } from "@constants/colors";

export const S2UFlowEnum = Object.freeze({
    s2u: "S2U",
    s2uReg: "S2UReg",
    tac: "TAC",
    s2uPush: "SECURE2U_PUSH",
    s2uPull: "SECURE2U_PULL",
    s2uCooling: "S2UCooling",
});

export const logoutTypeEnum = Object.freeze({
    DEACTIVATE: "deactivate",
    DELETE: "delete",
});

// Tabung Haji Enum
export const switchEnum = Object.freeze({
    self: 0,
    dependent: 1,
});

export const switchOptions = Object.freeze([
    {
        label: "SELF",
        value: switchEnum.self,
        activeColor: WHITE,
    },
    {
        label: "DEPENDENT",
        value: switchEnum.dependent,
        activeColor: WHITE,
    },
]);

export const transferFlowEnum = Object.freeze({
    sendMoney: 15,
    requestMoney: 16,
});
/**
 *  S2U Validate Responses : 
 * 
 * User Registered S2U IN RMBP
    ===========================
    s2uFavTxnFlag:Y
    s2uFavTxnLimit:0
    pull:N
    s2u_enabled:true
    action_flow:S2U
    s2u_registered:false

    User Registered S2U In MAE
    ===========================
    pull:Y
    s2uFavTxnFlag:Y
    s2uFavTxnLimit:0
    s2u_enabled:true
    action_flow:S2U
    s2u_registered:true

    User Not registered S2U
    =======================
    pull:NA
    s2uFavTxnFlag:Y
    s2uFavTxnLimit:0
    s2u_enabled:true
    action_flow:S2U
    s2u_registered:false
 */
