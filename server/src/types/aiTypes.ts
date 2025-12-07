/**
 * Type definitions for AI API requests and responses
 */

export interface SuggestSceneRequest {
  storyTitle: string;
  storyDescription: string;
  currentSceneBody: string;
  storySummary?: string;
}

export interface SuggestSceneResponse {
  title: string;
  body: string;
}

export interface SuggestChoicesRequest {
  sceneBody: string;
  storyContext?: string;
}

export interface SuggestChoicesResponse {
  choices: Array<{
    text: string;
  }>;
}

export interface ImproveTextRequest {
  sceneBody: string;
}

export interface ImproveTextResponse {
  improvedBody: string;
}
