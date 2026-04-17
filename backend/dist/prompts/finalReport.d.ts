export declare function buildFinalReportPrompt(params: {
    candidateName: string;
    jobTitle: string;
    overallScore: number;
    evaluationSummary: string;
    resumeHighlights: string;
}): {
    system: string;
    user: string;
};
export declare function buildFinalThanksPrompt(candidateName: string): {
    system: string;
    user: string;
};
//# sourceMappingURL=finalReport.d.ts.map