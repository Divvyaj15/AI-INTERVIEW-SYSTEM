interface LLMOptions {
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
}
export declare function llmCall(userPrompt: string, systemPrompt: string, options?: LLMOptions): Promise<string>;
export declare function llmCallJSON<T>(userPrompt: string, systemPrompt: string, options?: LLMOptions): Promise<T>;
export {};
//# sourceMappingURL=llm.service.d.ts.map