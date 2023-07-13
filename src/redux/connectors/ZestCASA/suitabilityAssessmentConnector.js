import { connect } from "react-redux";

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

const mapStateToProps = function (state) {
    const { zestCasaReducer } = state;
    const { suitabilityAssessmentReducer } = zestCasaReducer;

    return {
        // Local reducer
        financialObjectiveIndex: suitabilityAssessmentReducer.financialObjectiveIndex,
        financialObjectiveValue: suitabilityAssessmentReducer.financialObjectiveValue,
        hasDealtWithSecurities: suitabilityAssessmentReducer.hasDealtWithSecurities,
        hasRelevantKnowledge: suitabilityAssessmentReducer.hasRelevantKnowledge,
        hasInvestmentExperience: suitabilityAssessmentReducer.hasInvestmentExperience,
        hasUnderstoodInvestmentAccount: suitabilityAssessmentReducer.hasUnderstoodInvestmentAccount,
        hasUnderstoodAccountTerms: suitabilityAssessmentReducer.hasUnderstoodAccountTerms,
        isSuitabilityAssessmentContinueButtonEnabled:
            suitabilityAssessmentReducer.isSuitabilityAssessmentContinueButtonEnabled,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateFinancialObjective: (index, value) =>
            dispatch({
                type: FINANCIAL_OBJECTIVE_ACTION,
                financialObjectiveIndex: index,
                financialObjectiveValue: value,
            }),
        updateSecuritiesAnswer: (value) =>
            dispatch({ type: SECURITIES_ACTION, hasDealtWithSecurities: value }),
        updateRelevantKnowledgeAnswer: (value) =>
            dispatch({ type: RELEVANT_KNOWLEDGE_ACTION, hasRelevantKnowledge: value }),
        updateInvestmentExperienceAnswer: (value) =>
            dispatch({ type: INVESTMENT_EXPERIENCE_ACTION, hasInvestmentExperience: value }),
        updateUnderstandInvestmentAccountAnswer: (value) =>
            dispatch({ type: UNDERSTAND_ACCOUNT_ACTION, hasUnderstoodInvestmentAccount: value }),
        updateUnderstandAccountTermsAnswer: (value) =>
            dispatch({ type: UNDERSTAND_TERMS_ACTION, hasUnderstoodAccountTerms: value }),
        checkButtonEnabled: () => dispatch({ type: SUITABILITY_CONTINUE_BUTTON_DISABLED_ACTION }),
        clearSuitabilityAssessmentReducer: () => dispatch({ type: SUITABILITY_ASSESSMENT_CLEAR }),
    };
};

const suitabilityAssessmentProps = connect(mapStateToProps, mapDispatchToProps);
export default suitabilityAssessmentProps;
