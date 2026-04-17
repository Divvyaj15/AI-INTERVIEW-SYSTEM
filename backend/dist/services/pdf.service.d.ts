export interface ParsedResume {
    text: string;
    pageCount: number;
}
export declare function extractTextFromPDF(buffer: Buffer): Promise<ParsedResume>;
//# sourceMappingURL=pdf.service.d.ts.map