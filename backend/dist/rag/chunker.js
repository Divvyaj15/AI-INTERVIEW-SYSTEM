import { v4 as uuid } from 'uuid';
const RESUME_SECTION_PATTERNS = {
    summary: [/summary|objective|profile|about/i],
    experience: [/experience|employment|work history|career/i],
    skills: [/skills|technologies|tools|competencies|expertise/i],
    education: [/education|degree|university|college|academic/i],
    projects: [/projects|portfolio|work samples/i],
    other: [],
};
export function chunkResume(text, candidateId, interviewId) {
    const lines = text.split('\n');
    const chunks = [];
    let currentSection = 'other';
    let currentLines = [];
    const flush = () => {
        const content = currentLines.join('\n').trim();
        if (content.length > 30) {
            chunks.push({
                id: uuid(),
                content,
                metadata: { section: currentSection, source: 'resume' },
                candidate_id: candidateId,
                interview_id: interviewId,
                section_type: currentSection,
            });
        }
        currentLines = [];
    };
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed)
            continue;
        // Detect section headers — short lines in caps or matching known patterns
        const isHeader = trimmed.length < 40 && (trimmed === trimmed.toUpperCase() ||
            Object.entries(RESUME_SECTION_PATTERNS).some(([, patterns]) => patterns.some(p => p.test(trimmed))));
        if (isHeader) {
            flush();
            currentSection = detectSectionType(trimmed);
        }
        else {
            currentLines.push(trimmed);
        }
    }
    flush();
    // If no structure detected, fall back to sliding window chunks
    if (chunks.length === 0) {
        return slidingWindowChunks(text, candidateId, interviewId);
    }
    return chunks;
}
export function chunkJD(text, interviewId) {
    const paragraphs = text.split(/\n{2,}/).filter(p => p.trim().length > 20);
    const chunks = [];
    for (const para of paragraphs) {
        const requirementType = detectJDRequirementType(para);
        // Split bullet-heavy paragraphs into individual bullets
        const bullets = para.split(/\n/).filter(l => l.trim().startsWith('•') || l.trim().startsWith('-') || l.trim().startsWith('*'));
        if (bullets.length > 2) {
            // Group bullets into chunks of 3-4
            for (let i = 0; i < bullets.length; i += 3) {
                const content = bullets.slice(i, i + 3).join('\n').trim();
                if (content.length > 20) {
                    chunks.push({
                        id: uuid(),
                        content,
                        metadata: { type: requirementType, source: 'job_description' },
                        interview_id: interviewId,
                        requirement_type: requirementType,
                    });
                }
            }
        }
        else {
            chunks.push({
                id: uuid(),
                content: para.trim(),
                metadata: { type: requirementType, source: 'job_description' },
                interview_id: interviewId,
                requirement_type: requirementType,
            });
        }
    }
    return chunks;
}
function detectSectionType(header) {
    for (const [type, patterns] of Object.entries(RESUME_SECTION_PATTERNS)) {
        if (patterns.some(p => p.test(header))) {
            return type;
        }
    }
    return 'other';
}
function detectJDRequirementType(text) {
    if (/required|must have|mandatory|essential/i.test(text))
        return 'required';
    if (/preferred|nice to have|bonus|plus|ideally/i.test(text))
        return 'preferred';
    if (/responsibilit|duties|you will|role involves/i.test(text))
        return 'responsibility';
    return 'other';
}
function slidingWindowChunks(text, candidateId, interviewId, chunkSize = 500, overlap = 100) {
    const words = text.split(' ');
    const chunks = [];
    for (let i = 0; i < words.length; i += chunkSize - overlap) {
        const content = words.slice(i, i + chunkSize).join(' ').trim();
        if (content.length > 30) {
            chunks.push({
                id: uuid(),
                content,
                metadata: { source: 'resume', method: 'sliding_window' },
                candidate_id: candidateId,
                interview_id: interviewId,
                section_type: 'other',
            });
        }
    }
    return chunks;
}
//# sourceMappingURL=chunker.js.map