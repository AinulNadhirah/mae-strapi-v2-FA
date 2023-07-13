import {
    FINANCIAL_OBJECTIVE_ACTION,
    SECURITIES_ACTION,
    RELEVANT_KNOWLEDGE_ACTION,
    INVESTMENT_EXPERIENCE_ACTION,
    UNDERSTAND_ACCOUNT_ACTION,
    UNDERSTAND_TERMS_ACTION,
    SUITABILITY_CONTINUE_BUTTON_DISABLED_ACTION,
    SUITABILITY_ASSESSMENT_CLEAR,
} from "@redux/actions/ZestCASA/suitabilityAssessmentAction";

// Suitability assessment default value
const initialState = {
    financialObjectiveIndex: null,
    financialObjectiveValue: null,
    hasDealtWithSecurities: null,
    hasRelevantKnowledge: null,
    hasInvestmentExperience: null,
    hasUnderstoodInvestmentAccount: null,
    hasUnderstoodAccountTerms: null,
    isSuitabilityAssessmentContinueButtonEnabled: false,
};

// Suitability assessment reducer
export default function suitabilityAssessmentReducer(state = initialState, action) {
    switch (action.type) {
        case FINANCIAL_OBJECTIVE_ACTION:
            return {
                ...state,
                financialObjectiveIndex: action.financialObjectiveIndex,
                financialObjectiveValue: action.financialObjectiveValue,
            };

        case SECURITIES_ACTION:
            return {
                ...state,
                hasDealtWithSecurities: action.hasDealtWithSecurities,
            };

        case RELEVANT_KNOWLEDGE_ACTION:
            return {
                ...state,
                hasRelevantKnowledge: action.hasRelevantKnowledge,
            };

        case INVESTMENT_EXPERIENCE_ACTION:
            return {
                ...state,
                hasInvestmentExperience: action.hasInvestmentExperience,
            };

        case UNDERSTAND_ACCOUNT_ACTION:
            return {
                ...state,
                hasUnderstoodInvestmentAccount: action.hasUnderstoodInvestmentAccount,
            };

        case UNDERSTAND_TERMS_ACTION:
            return {
                ...state,
                hasUnderstoodAccountTerms: action.hasUnderstoodAccountTerms,
            };

        case SUITABILITY_CONTINUE_BUTTON_DISABLED_ACTION:
            return {
                ...state,
                isSuitabilityAssessmentContinueButtonEnabled:
                    checkSuitabilityAssessmentContinueButtonStatus(state),
            };

        case SUITABILITY_ASSESSMENT_CLEAR:
            return {
                ...state,
                financialObjectiveIndex: null,
                financialObjectiveValue: null,
                hasDealtWithSecurities: null,
                hasRelevantKnowledge: null,
                hasInvestmentExperience: null,
                hasUnderstoodInvestmentAccount: null,
                hasUnderstoodAccountTerms: null,
                isSuitabilityAssessmentContinueButtonEnabled: false,
            };

        default:
            return state;
    }
}

// Button enable or disable check
export const checkSuitabilityAssessmentContinueButtonStatus = (state) => {
    return (
        state.financialObjectiveIndex !== null &&
        state.financialObjectiveValue !== null &&
        state.hasDealtWithSecurities !== null &&
        state.hasRelevantKnowledge !== null &&
        state.hasInvestmentExperience !== null &&
        state.hasUnderstoodInvestmentAccount !== null &&
        state.hasUnderstoodAccountTerms !== null
    );
};
