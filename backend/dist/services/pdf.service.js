import pdfParse from 'pdf-parse';
export async function extractTextFromPDF(buffer) {
    try {
        const data = await pdfParse(buffer);
        const cleaned = cleanText(data.text);
        if (!cleaned || cleaned.length < 50) {
            throw new Error('PDF appears to be empty or unreadable');
        }
        return {
            text: cleaned,
            pageCount: data.numpages,
        };
    }
    catch (err) {
        throw new Error(`PDF parsing failed: ${err.message}`);
    }
}
function cleanText(raw) {
    return raw
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]{2,}/g, ' ')
        .trim();
}
//# sourceMappingURL=pdf.service.js.map