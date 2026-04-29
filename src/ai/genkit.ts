import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit initialization for the application.
 * This file is intended for server-side use only.
 */

export const ai = genkit({
  plugins: [
    googleAI()
  ],
  model: 'googleai/gemini-2.5-flash',
});
