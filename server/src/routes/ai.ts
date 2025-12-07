/**
 * AI-powered story assistance routes
 * Handles scene suggestions, choice generation, and text improvement
 */
import express, { Request, Response } from 'express';
import { openai, DEFAULT_MODEL, CREATIVE_TEMPERATURE, IMPROVEMENT_TEMPERATURE } from '../config/openai';
import {
  SuggestSceneRequest,
  SuggestSceneResponse,
  SuggestChoicesRequest,
  SuggestChoicesResponse,
  ImproveTextRequest,
  ImproveTextResponse,
} from '../types/aiTypes';

const router = express.Router();

/**
 * POST /api/ai/suggest-scene
 * Generates a suggestion for the next scene in the story
 */
router.post('/suggest-scene', async (req: Request<{}, {}, SuggestSceneRequest>, res: Response) => {
  try {
    const { storyTitle, storyDescription, currentSceneBody, storySummary } = req.body;

    // Validate required fields
    if (!storyTitle || !storyDescription || !currentSceneBody) {
      return res.status(400).json({
        error: 'Missing required fields: storyTitle, storyDescription, and currentSceneBody are required',
      });
    }

    // Construct the prompt for OpenAI
    const prompt = `You are a creative writing assistant helping to continue an interactive story.

Story Title: ${storyTitle}
Story Description: ${storyDescription}
${storySummary ? `Story Summary: ${storySummary}` : ''}

Current Scene:
${currentSceneBody}

Please suggest the next scene that naturally continues this story. The scene should:
- Maintain consistency with the story's tone and style
- Create interesting narrative progression
- Leave room for branching choices

Return your response as valid JSON with this exact structure:
{
  "title": "Scene Title Here",
  "body": "Scene body text here with narrative description..."
}`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a creative writing assistant. Always respond with valid JSON only, no additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: CREATIVE_TEMPERATURE,
      response_format: { type: 'json_object' },
    });

    // Parse the response
    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const suggestion: SuggestSceneResponse = JSON.parse(content);

    // Validate response structure
    if (!suggestion.title || !suggestion.body) {
      throw new Error('Invalid response format from OpenAI');
    }

    res.json(suggestion);
  } catch (error: any) {
    console.error('Error in suggest-scene:', error);
    res.status(500).json({
      error: 'Failed to generate scene suggestion',
      details: error.message,
    });
  }
});

/**
 * POST /api/ai/suggest-choices
 * Generates branching choice suggestions for a scene
 */
router.post('/suggest-choices', async (req: Request<{}, {}, SuggestChoicesRequest>, res: Response) => {
  try {
    const { sceneBody, storyContext } = req.body;

    // Validate required fields
    if (!sceneBody) {
      return res.status(400).json({
        error: 'Missing required field: sceneBody',
      });
    }

    // Construct the prompt
    const prompt = `You are a creative writing assistant helping to create branching choices for an interactive story.

${storyContext ? `Story Context: ${storyContext}` : ''}

Current Scene:
${sceneBody}

Please suggest 2-4 distinct choices that the reader could make at this point in the story. Each choice should:
- Lead to a different narrative direction
- Be clear and actionable
- Create interesting story possibilities
- Be concise (one sentence each)

Return your response as valid JSON with this exact structure:
{
  "choices": [
    { "text": "Choice text 1" },
    { "text": "Choice text 2" },
    { "text": "Choice text 3" }
  ]
}`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a creative writing assistant. Always respond with valid JSON only, no additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: CREATIVE_TEMPERATURE,
      response_format: { type: 'json_object' },
    });

    // Parse the response
    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const suggestion: SuggestChoicesResponse = JSON.parse(content);

    // Validate response structure
    if (!suggestion.choices || !Array.isArray(suggestion.choices)) {
      throw new Error('Invalid response format from OpenAI');
    }

    res.json(suggestion);
  } catch (error: any) {
    console.error('Error in suggest-choices:', error);
    res.status(500).json({
      error: 'Failed to generate choice suggestions',
      details: error.message,
    });
  }
});

/**
 * POST /api/ai/improve-text
 * Improves the writing quality of a scene while maintaining its content
 */
router.post('/improve-text', async (req: Request<{}, {}, ImproveTextRequest>, res: Response) => {
  try {
    const { sceneBody } = req.body;

    // Validate required fields
    if (!sceneBody) {
      return res.status(400).json({
        error: 'Missing required field: sceneBody',
      });
    }

    // Construct the prompt
    const prompt = `You are a professional editor helping to improve story prose.

Original Text:
${sceneBody}

Please rewrite this text to improve:
- Clarity and readability
- Style and flow
- Pacing and rhythm
- Word choice and variety

Important: Keep the same meaning, events, and story beats. Only improve the writing quality.

Return your response as valid JSON with this exact structure:
{
  "improvedBody": "The improved version of the text here..."
}`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a professional editor. Always respond with valid JSON only, no additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: IMPROVEMENT_TEMPERATURE,
      response_format: { type: 'json_object' },
    });

    // Parse the response
    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const result: ImproveTextResponse = JSON.parse(content);

    // Validate response structure
    if (!result.improvedBody) {
      throw new Error('Invalid response format from OpenAI');
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error in improve-text:', error);
    res.status(500).json({
      error: 'Failed to improve text',
      details: error.message,
    });
  }
});

export default router;
