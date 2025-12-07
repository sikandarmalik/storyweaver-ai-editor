/**
 * OpenAI configuration and client setup
 * Supports both OpenAI API and GitHub Models (Azure OpenAI)
 */
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Determine which API to use
const useGitHubModels = process.env.USE_GITHUB_MODELS === 'true';
const apiKey = useGitHubModels ? process.env.GITHUB_TOKEN : process.env.OPENAI_API_KEY;

// Validate that the API key is present
if (!apiKey) {
  if (useGitHubModels) {
    console.warn('⚠️  GITHUB_TOKEN environment variable is not set. AI features will not work.');
    console.warn('   Please set GITHUB_TOKEN in your .env file to enable AI features.');
    console.warn('   Get your token from: https://github.com/settings/tokens');
  } else {
    console.warn('⚠️  OPENAI_API_KEY environment variable is not set. AI features will not work.');
    console.warn('   Please set OPENAI_API_KEY in your .env file to enable AI features.');
  }
}

// Initialize OpenAI client with appropriate configuration
export const openai = new OpenAI({
  apiKey: apiKey || 'placeholder-key',
  ...(useGitHubModels && {
    baseURL: 'https://models.inference.ai.azure.com',
  }),
});

/**
 * Default model to use for completions
 * GitHub Models: gpt-4o, gpt-4o-mini (recommended for Hong Kong users with GitHub Copilot)
 * OpenAI: gpt-3.5-turbo, gpt-4
 */
export const DEFAULT_MODEL = useGitHubModels ? 'gpt-4o-mini' : 'gpt-3.5-turbo';

/**
 * Temperature setting for creative writing
 */
export const CREATIVE_TEMPERATURE = 0.8;

/**
 * Temperature setting for improvement tasks
 */
export const IMPROVEMENT_TEMPERATURE = 0.7;
