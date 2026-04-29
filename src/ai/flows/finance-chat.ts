'use server';
/**
 * @fileOverview A financial AI chat assistant that can extract transactions from natural language.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FinanceChatInputSchema = z.object({
  message: z.string().describe('The user\'s message to the financial assistant.'),
  accounts: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
  })).describe('The user\'s current financial accounts.'),
  categories: z.object({
    expense: z.array(z.string()),
    income: z.array(z.string()),
  }).describe('Available transaction categories.'),
});
export type FinanceChatInput = z.infer<typeof FinanceChatInputSchema>;

const FinanceChatOutputSchema = z.object({
  text: z.string().describe('The assistant\'s text response.'),
  extractedTransaction: z.object({
    amount: z.number(),
    type: z.enum(['income', 'expense', 'transfer']),
    category: z.string(),
    accountId: z.string(),
    description: z.string(),
  }).optional().describe('A transaction extracted from the user\'s message, if any.'),
});
export type FinanceChatOutput = z.infer<typeof FinanceChatOutputSchema>;

export async function financeChat(input: FinanceChatInput): Promise<FinanceChatOutput> {
  return financeChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'financeChatPrompt',
  input: { schema: FinanceChatInputSchema },
  output: { schema: FinanceChatOutputSchema },
  prompt: `You are a helpful and expert financial AI assistant called "SmartBot".
Your goal is to help users manage their money and answer their questions.

CRITICAL TASK:
If the user mentions a new transaction they just made (e.g., "I spent $30 on lunch" or "received 1000 salary"), you MUST extract the transaction details and include them in the 'extractedTransaction' field of your response.

Context:
- Accounts: {{#each accounts}}{{name}} (ID: {{id}}, Type: {{type}}), {{/each}}
- Expense Categories: {{#each categories.expense}}{{this}}, {{/each}}
- Income Categories: {{#each categories.income}}{{this}}, {{/each}}

Instructions for Transaction Extraction:
1. Amount: Identify the numerical value.
2. Type: Determine if it's an 'expense' (spent, paid) or 'income' (earned, received).
3. Account: Try to match the mentioned account to one of the provided accounts. If not specified, default to the first 'Bank' or 'Cash' account found.
4. Category: Match to the closest category provided. If it doesn't fit, use 'Other' or 'Food' as a safe default for expenses.
5. Description: A brief note about what it was.

If the user is just asking a question without a transaction, leave 'extractedTransaction' empty.

User Message: {{{message}}}`,
});

const financeChatFlow = ai.defineFlow(
  {
    name: 'financeChatFlow',
    inputSchema: FinanceChatInputSchema,
    outputSchema: FinanceChatOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  },
);
