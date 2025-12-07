/**
 * Custom hook for AI API interactions
 * Provides methods to call backend AI endpoints
 */
import { useState } from 'react';

const API_BASE_URL = 'http://localhost:3000/api/ai';

export interface SuggestSceneResult {
  title: string;
  body: string;
}

export interface SuggestChoicesResult {
  choices: Array<{ text: string }>;
}

export interface ImproveTextResult {
  improvedBody: string;
}

export function useAiApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Request a suggestion for the next scene
   */
  const suggestScene = async (
    storyTitle: string,
    storyDescription: string,
    currentSceneBody: string,
    storySummary?: string
  ): Promise<SuggestSceneResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/suggest-scene`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyTitle,
          storyDescription,
          currentSceneBody,
          storySummary,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error || `Server error: ${response.status}`;
        console.error('AI API Error:', errorMessage, errorData);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to connect to AI service. Is the server running?';
      console.error('suggestScene error:', errorMessage, err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Request choice suggestions for a scene
   */
  const suggestChoices = async (
    sceneBody: string,
    storyContext?: string
  ): Promise<SuggestChoicesResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/suggest-choices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sceneBody,
          storyContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to suggest choices');
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Request text improvement for a scene
   */
  const improveText = async (
    sceneBody: string
  ): Promise<ImproveTextResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/improve-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sceneBody,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to improve text');
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    suggestScene,
    suggestChoices,
    improveText,
  };
}
