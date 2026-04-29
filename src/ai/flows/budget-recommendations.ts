'use server';
/**
 * @fileOverview A financial AI assistant that provides budget recommendations.
 *
 * - budgetRecommendations - A function that handles the budget analysis and recommendation process.
 * - BudgetRecommendationsInput - The input type for the budgetRecommendations function.
 * - BudgetRecommendationsOutput - The return type for the budgetRecommendations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BudgetCategorySchema = z.object({
  name: z.string().describe('The name of the budget category (e.g., "Groceries", "Rent").'),
  allocatedAmount: z.number().describe('The amount allocated to this category in the budget.'),
});

const TransactionSchema = z.object({
  category: z.string().describe('The category of the transaction.'),
  amount: z.number().describe('The amount of the transaction.'),
  date: z.string().describe('The date of the transaction in ISO format (e.g., "2023-10-26").'),
  type: z.enum(['income', 'expense']).describe('The type of transaction (income or expense).'),
  description: z.string().optional().describe('A brief description of the transaction.'),
});

const BudgetRecommendationsInputSchema = z.object({
  currentBudget: z.object({
    totalIncome: z.number().describe('The user\'s total monthly income.'),
    categories: z.array(BudgetCategorySchema).describe('A list of the user\'s current budget categories and their allocated amounts.'),
  }).describe('The user\'s current budget plan.'),
  spendingHistory: z.array(TransactionSchema).describe('A historical list of the user\'s financial transactions.'),
});
export type BudgetRecommendationsInput = z.infer<typeof BudgetRecommendationsInputSchema>;

const BudgetRecommendationsOutputSchema = z.object({
  budgetAdjustments: z.array(z.object({
    category: z.string().describe('The category for which the adjustment is recommended.'),
    recommendation: z.string().describe('A specific recommendation for adjusting the allocated amount, e.g., "Decrease by $50", "Increase by 10%".'),
    reason: z.string().describe('The reason for the suggested adjustment.'),
  })).describe('Specific suggestions for modifying existing budget category allocations.'),
  newCategorySuggestions: z.array(z.object({
    category: z.string().describe('The name of the suggested new category.'),
    reason: z.string().describe('The reason why this new category should be considered.'),
    suggestedAmount: z.number().optional().describe('An optional suggested initial allocated amount for the new category.'),
  })).describe('Suggestions for new budget categories the user might be missing.'),
  overspendingAlerts: z.array(z.object({
    category: z.string().describe('The category where overspending was detected.'),
    message: z.string().describe('A detailed message explaining the overspending.'),
    spentAmount: z.number().describe('The amount spent in this category.'),
    allocatedAmount: z.number().describe('The amount allocated to this category.'),
  })).describe('Alerts for categories where the user has consistently overspent.'),
  optimizationTips: z.array(z.string()).describe('General tips for optimizing financial habits and spending.'),
});
export type BudgetRecommendationsOutput = z.infer<typeof BudgetRecommendationsOutputSchema>;

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

export async function budgetRecommendations(input: BudgetRecommendationsInput): Promise<BudgetRecommendationsOutput> {
  return budgetRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'budgetRecommendationsPrompt',
  input: { schema: BudgetRecommendationsInputSchema },
  output: { schema: BudgetRecommendationsOutputSchema },
  prompt: `You are a financial AI assistant specializing in budget optimization. Your goal is to help users manage their money better by analyzing their spending habits and current budget, and then providing actionable recommendations. Make sure your output matches the specified JSON schema exactly.

Here is the user's current budget plan:
Total Income: {{{currentBudget.totalIncome}}}
Budget Categories:
{{#each currentBudget.categories}}
- {{name}}: {{{allocatedAmount}}}
{{/each}}

Here is the user's spending history:
{{#each spendingHistory}}
- Date: {{date}}, Category: {{category}}, Type: {{type}}, Amount: {{{amount}}}{{#if description}}, Description: {{description}}{{id}}{{/if}}
{{/each}}

Based on the provided current budget and spending history, perform the following tasks:

1.  **Analyze Spending Patterns**: Identify trends, frequent expenses, and any discrepancies between allocated budget and actual spending.
2.  **Identify Overspending**: Pinpoint categories where the user is consistently spending more than allocated.
3.  **Suggest Budget Adjustments**: Recommend specific changes to existing budget categories (e.g., increase, decrease, or reallocate amounts) with clear reasons.
4.  **Recommend New Categories**: Propose any new budget categories that might be useful based on unbudgeted or significant spending patterns.
5.  **Offer Optimization Tips**: Provide general advice on how to improve financial health and avoid overspending.

Structure your response as a JSON object matching the output schema. Ensure all fields ('budgetAdjustments', 'newCategorySuggestions', 'overspendingAlerts', 'optimizationTips') are present, even if empty arrays.

`,
});

const budgetRecommendationsFlow = ai.defineFlow(
  {
    name: 'budgetRecommendationsFlow',
    inputSchema: BudgetRecommendationsInputSchema,
    outputSchema: BudgetRecommendationsOutputSchema,
  },
  async (input) => {
    const response = await callWithRetry(() => prompt(input));
    return response.output!;
  },
);
