// Suitability assessment actions

export const FINANCIAL_OBJECTIVE_ACTION = (financialObjectiveIndex, financialObjectiveValue) => ({
    financialObjectiveIndex: financialObjectiveIndex,
    financialObjectiveValue: financialObjectiveValue,
});

export const SECURITIES_ACTION = (hasDealtWithSecurities) => ({
    hasDealtWithSecurities: hasDealtWithSecurities,
});

export const RELEVANT_KNOWLEDGE_ACTION = (hasRelevantKnowledge) => ({
    hasRelevantKnowledge: hasRelevantKnowledge,
});

export const INVESTMENT_EXPERIENCE_ACTION = (hasInvestmentExperience) => ({
    hasInvestmentExperience: hasInvestmentExperience,
});

export const UNDERSTAND_ACCOUNT_ACTION = (hasUnderstoodInvestmentAccount) => ({
    hasUnderstoodInvestmentAccount: hasUnderstoodInvestmentAccount,
});

export const UNDERSTAND_TERMS_ACTION = (hasUnderstoodAccountTerms) => ({
    hasUnderstoodAccountTerms: hasUnderstoodAccountTerms,
});

export const SUITABILITY_CONTINUE_BUTTON_DISABLED_ACTION = () => ({});

export const SUITABILITY_ASSESSMENT_CLEAR = () => ({});
