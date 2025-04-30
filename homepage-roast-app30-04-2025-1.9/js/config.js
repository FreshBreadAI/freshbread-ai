// Configuration settings

const Config = {
    webhookUrl: 'https://hook.eu2.make.com/fifbpm3zs7gw23j6wky83jkmbskv1xf1',
    
    // Category mapping (full API name to short display name)
    CATEGORY_MAP: {
        'Clarity_and_Value_Proposition_(MECLABS_C_StoryBrand)': 'Clarity & Value',
        'Motivation_and_Persuasion_(AIDA_InterestDesire_MECLABS_M)': 'Motivation',
        'Trust_and_Credibility_(MECLABS_A_SocialProof)': 'Trust',
        'Call_to_Action_Effectiveness_(AIDA_Action_MECLABS_I)': 'CTA Effectiveness',
        'User_Experience_and_Usability_(Heuristics_MECLABS_F)': 'UX & Usability',
        'Overall_Narrative_and_Flow_(AIDA_Flow_StoryBrand)': 'Narrative Flow'
    },

    // Categories expected to have scores for the summary circles
    scoredCategories: [
        'Clarity_and_Value_Proposition_(MECLABS_C_StoryBrand)',
        'Motivation_and_Persuasion_(AIDA_InterestDesire_MECLABS_M)',
        'Trust_and_Credibility_(MECLABS_A_SocialProof)',
        'Call_to_Action_Effectiveness_(AIDA_Action_MECLABS_I)',
        'User_Experience_and_Usability_(Heuristics_MECLABS_F)',
        'Overall_Narrative_and_Flow_(AIDA_Flow_StoryBrand)'
    ]
};

// Freeze the object to prevent accidental modification
Object.freeze(Config);
Object.freeze(Config.CATEGORY_MAP);
Object.freeze(Config.scoredCategories);
