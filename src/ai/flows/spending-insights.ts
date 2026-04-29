'use server';
/**
 * @fileOverview This file implements a Genkit flow for analyzing user spending habits.
 *
 * - analyzeSpendingHabits - A function that analyzes past transaction data and provides spending habit insights.
 * - SpendingInsightsInput - The input type for the analyzeSpendingHabits function.
 * - SpendingInsightsOutput - The return type for the analyzeSpendingHabits function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SpendingInsightsInputSchema = z.array(
  z.object({
    id: z.string().describe('Unique ID of the transaction.'),
    date: z.string().describe('Date of the transaction in YYYY-MM-DD format.'),
    description: z.string().optional().describe('Description of the transaction.'),
    amount: z.number().describe('Amount of the transaction.'),
    type: z.enum(['income', 'expense']).describe('Type of transaction (income or expense).'),
    category: z.string().describe('Category of the transaction.'),
    account: z.string().describe('Account from which the transaction was made.'),
  })
).describe('A list of past transactions for analysis.');

export type SpendingInsightsInput = z.infer<typeof SpendingInsightsInputSchema>;

const SpendingInsightsOutputSchema = z.object({
  summary: z.string().describe('A personalized summary of spending habits, highlighting overall financial health, and any key takeaways.'),
  spendingTrends: z.array(
    z.string().describe('A descriptive sentence about a spending trend (e.g., "Your grocery spending increased by 15% last month.").')
  ).describe('Key trends observed in spending patterns.'),
  significantExpenditures: z.array(
    z.object({
      category: z.string().describe('The category of the significant expenditure.'),
      amount: z.number().describe('The amount of the significant expenditure.'),
      description: z.string().optional().describe('Description of the expenditure, if available.'),
      date: z.string().describe('Date of the significant expenditure.'),
    })
  ).describe('A list of notable individual expenditures.'),
  categoryBreakdown: z.array(
    z.object({
      category: z.string().describe('The category name.'),
      totalSpent: z.number().describe('Total amount spent in this category.'),
      percentageOfTotalExpenses: z.number().describe('Percentage of total expenses this category represents.'),
    })
  ).describe('A breakdown of total spending by category.'),
  suggestions: z.array(
    z.string().describe('Actionable suggestions for improving financial habits based on the analysis (e.g., "Consider reducing dining out to save more.").')
  ).describe('Actionable suggestions for improving financial habits.'),
});

export type SpendingInsightsOutput = z.infer<typeof SpendingInsightsOutputSchema>;

async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error?.message?.includes('503') || error?.message?.includes('UNAVAILABLE'))) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function analyzeSpendingHabits(input: SpendingInsightsInput): Promise<SpendingInsightsOutput> {
  return spendingInsightsFlow(input);
}

const analyzeSpendingPrompt = ai.definePrompt({
  name: 'analyzeSpendingPrompt',
  input: { schema: SpendingInsightsInputSchema },
  output: { schema: SpendingInsightsOutputSchema },
  prompt: `You are a smart financial assistant designed to analyze user spending habits.
Your goal is to provide a comprehensive, personalized summary of the user's financial activities based on their past transaction data.
Identify key spending trends, significant expenditures, and provide actionable suggestions for improving financial health.

Analyze the following transaction data:

Transactions:
{{#each this}}
  - Date: {{{date}}}, Description: {{{description}}}, Amount: {{{amount}}}, Type: {{{type}}}, Category: {{{category}}}, Account: {{{account}}}
{{/each}}

Based on the transactions provided, generate a JSON object with the following structure:
- 'summary': A personalized summary of spending habits, highlighting overall financial health, and any key takeaways.
- 'spendingTrends': An array of strings, each describing a key trend (e.g., "Your dining out expenses increased by 20% compared to last month.").
- 'significantExpenditures': An array of objects, each detailing a notable individual expense, including 'category', 'amount', 'description', and 'date'. Focus on high-value or unusual transactions.
- 'categoryBreakdown': An array of objects, each showing 'category', 'totalSpent' (total amount spent in that category), and 'percentageOfTotalExpenses' (percentage of total expenses this category represents).
- 'suggestions': An array of actionable suggestions for improving financial habits based on the analysis.

Ensure the output is valid JSON and directly reflects the spending data.`,
});

const spendingInsightsFlow = ai.defineFlow(
  {
    name: 'spendingInsightsFlow',
    inputSchema: SpendingInsightsInputSchema,
    outputSchema: SpendingInsightsOutputSchema,
  },
  async (input) => {
    const response = await callWithRetry(() => analyzeSpendingPrompt(input));
    return response.output!;
  }
);
