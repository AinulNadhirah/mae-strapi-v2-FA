/**
 * API services
 *
 * Old services broke into multi files ranging around 1000 loc to decrease the
 * format on save configuration and also to keep it tidy.
 * the naming convention are very much simplified since I don't have the time
 * nor the knowledge of each API to group it by anything, except for eKyc which
 * was nicely group already.
 *
 * Rule of guide once the service definition exceed 1000 LOC, create a new file.
 */
export * from "./apiServiceDefinition.1";
export * from "./apiServiceDefinition.2";
export * from "./apiServiceDefinition.3";
export * from "./apiServiceDefinition.4";
export * from "./apiServiceDefinition.5";
export * from "./apiServiceDefinition.6";
export * from "./apiServiceDefinition.7";
export * from "./apiServiceDefinition.8";
export * from "./apiServiceDefinition.9";
export * from "./apiServiceEkyc";
export * from "./apiServicePfm";
export * from "./apiServiceBalanceTransfer";
export * from "./apiServiceEzPay";
export * from "./apiServiceCardsStp";
export * from "./apiServiceS2U";
export * from "./apiServiceBakong";
export * from "./apiServiceFD";
export * from "./apiServiceGaming";
export * from "./apiServiceReferral";
export * from "./apiServiceProperty";
export * from "./apiServicePropertyCloud";
export * from "./apiServiceSSL";
export * from "./apiServiceDataPower";
export * from "./apiServiceSSLCloud";
export * from "./apiServiceQrWithdrawal";
export * from "./apiServiceFinancialGoals";
export * from "./apiServiceZakatDebit";
export * from "./apiServiceCmsCloud";
export * from "./apiServiceOverseas";
export * from "./apiServiceAsb";
export * from "./apiChallenge";
