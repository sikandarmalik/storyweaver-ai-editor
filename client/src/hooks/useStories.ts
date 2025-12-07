/**
 * Custom hook for managing story state
 * Provides CRUD operations for stories and scenes, with localStorage persistence
 */
import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Story, Scene, Choice } from '../types/story';

const STORAGE_KEY = 'storyweaver-stories';

export function useStories() {
  const [stories, setStories] = useLocalStorage<Story[]>(STORAGE_KEY, []);

  // Create a new story
  const createStory = useCallback((title: string, description: string) => {
    const newStory: Story = {
      id: generateId(),
      title,
      description,
      scenes: [],
      startSceneId: null,
    };
    setStories((prev) => [...prev, newStory]);
    return newStory;
  }, [setStories]);

  // Update an existing story
  const updateStory = useCallback((storyId: string, updates: Partial<Story>) => {
    setStories((prev) =>
      prev.map((story) =>
        story.id === storyId ? { ...story, ...updates } : story
      )
    );
  }, [setStories]);

  // Delete a story
  const deleteStory = useCallback((storyId: string) => {
    setStories((prev) => prev.filter((story) => story.id !== storyId));
  }, [setStories]);

  // Get a specific story by ID
  const getStory = useCallback((storyId: string): Story | undefined => {
    return stories.find((story) => story.id === storyId);
  }, [stories]);

  // Create a new scene in a story
  const createScene = useCallback((storyId: string, title: string = 'New Scene') => {
    const newScene: Scene = {
      id: generateId(),
      title,
      body: '',
      choices: [],
    };
    
    setStories((prev) =>
      prev.map((story) => {
        if (story.id === storyId) {
          return {
            ...story,
            scenes: [...story.scenes, newScene],
          };
        }
        return story;
      })
    );
    
    return newScene;
  }, [setStories]);

  // Update a scene within a story
  const updateScene = useCallback((storyId: string, sceneId: string, updates: Partial<Scene>) => {
    setStories((prev) =>
      prev.map((story) => {
        if (story.id === storyId) {
          return {
            ...story,
            scenes: story.scenes.map((scene) =>
              scene.id === sceneId ? { ...scene, ...updates } : scene
            ),
          };
        }
        return story;
      })
    );
  }, [setStories]);

  // Delete a scene from a story
  const deleteScene = useCallback((storyId: string, sceneId: string) => {
    setStories((prev) =>
      prev.map((story) => {
        if (story.id === storyId) {
          return {
            ...story,
            scenes: story.scenes.filter((scene) => scene.id !== sceneId),
            // Clear startSceneId if we're deleting the start scene
            startSceneId: story.startSceneId === sceneId ? null : story.startSceneId,
          };
        }
        return story;
      })
    );
  }, [setStories]);

  // Add a choice to a scene
  const addChoice = useCallback((storyId: string, sceneId: string, choiceText: string = 'New choice') => {
    const newChoice: Choice = {
      id: generateId(),
      text: choiceText,
      targetSceneId: null,
    };
    
    setStories((prev) =>
      prev.map((story) => {
        if (story.id === storyId) {
          return {
            ...story,
            scenes: story.scenes.map((scene) => {
              if (scene.id === sceneId) {
                return {
                  ...scene,
                  choices: [...scene.choices, newChoice],
                };
              }
              return scene;
            }),
          };
        }
        return story;
      })
    );
    
    return newChoice;
  }, [setStories]);

  // Update a choice within a scene
  const updateChoice = useCallback((
    storyId: string,
    sceneId: string,
    choiceId: string,
    updates: Partial<Choice>
  ) => {
    setStories((prev) =>
      prev.map((story) => {
        if (story.id === storyId) {
          return {
            ...story,
            scenes: story.scenes.map((scene) => {
              if (scene.id === sceneId) {
                return {
                  ...scene,
                  choices: scene.choices.map((choice) =>
                    choice.id === choiceId ? { ...choice, ...updates } : choice
                  ),
                };
              }
              return scene;
            }),
          };
        }
        return story;
      })
    );
  }, [setStories]);

  // Delete a choice from a scene
  const deleteChoice = useCallback((storyId: string, sceneId: string, choiceId: string) => {
    setStories((prev) =>
      prev.map((story) => {
        if (story.id === storyId) {
          return {
            ...story,
            scenes: story.scenes.map((scene) => {
              if (scene.id === sceneId) {
                return {
                  ...scene,
                  choices: scene.choices.filter((choice) => choice.id !== choiceId),
                };
              }
              return scene;
            }),
          };
        }
        return story;
      })
    );
  }, [setStories]);

  return {
    stories,
    createStory,
    updateStory,
    deleteStory,
    getStory,
    createScene,
    updateScene,
    deleteScene,
    addChoice,
    updateChoice,
    deleteChoice,
  };
}

/**
 * Generate a unique ID for stories, scenes, and choices
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
