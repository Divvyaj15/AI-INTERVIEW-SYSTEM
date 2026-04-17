import { supabase } from '../lib/supabase.js';
export async function getOverallScore(interviewId) {
    const { data, error } = await supabase
        .from('evaluations')
        .select('score')
        .eq('interview_id', interviewId);
    if (error)
        throw new Error(`Failed to fetch evaluations: ${error.message}`);
    if (!data || data.length === 0)
        return 0;
    const scores = data.map(e => e.score);
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    return Math.round(avg * 10) / 10;
}
export function scoreToGrade(score) {
    if (score >= 90)
        return 'Exceptional';
    if (score >= 75)
        return 'Strong';
    if (score >= 60)
        return 'Competent';
    if (score >= 45)
        return 'Developing';
    return 'Needs Improvement';
}
export function scoreToMarketPosition(score) {
    if (score >= 90)
        return 'Top 5% candidate — strongly recommend advancing';
    if (score >= 75)
        return 'Top 25% candidate — recommend advancing';
    if (score >= 60)
        return 'Average candidate — consider with reservations';
    if (score >= 45)
        return 'Below average — further assessment recommended';
    return 'Not recommended at this time';
}
//# sourceMappingURL=evaluation.service.js.map