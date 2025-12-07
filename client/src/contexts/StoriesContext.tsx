/**
 * Stories Context
 * Provides global state management for stories across the application
 */
import { createContext, useContext, ReactNode } from 'react';
import { useStories as useStoriesHook } from '../hooks/useStories';
import { Story, Scene, Choice } from '../types/story';

interface StoriesContextType {
  stories: Story[];
  createStory: (title: string, description: string) => Story;
  updateStory: (storyId: string, updates: Partial<Story>) => void;
  deleteStory: (storyId: string) => void;
  getStory: (storyId: string) => Story | undefined;
  createScene: (storyId: string, title?: string) => Scene;
  updateScene: (storyId: string, sceneId: string, updates: Partial<Scene>) => void;
  deleteScene: (storyId: string, sceneId: string) => void;
  addChoice: (storyId: string, sceneId: string, text?: string) => Choice;
  updateChoice: (storyId: string, sceneId: string, choiceId: string, updates: Partial<Choice>) => void;
  deleteChoice: (storyId: string, sceneId: string, choiceId: string) => void;
}

const StoriesContext = createContext<StoriesContextType | undefined>(undefined);

export function StoriesProvider({ children }: { children: ReactNode }) {
  const storiesHook = useStoriesHook();

  return (
    <StoriesContext.Provider value={storiesHook}>
      {children}
    </StoriesContext.Provider>
  );
}

export function useStories() {
  const context = useContext(StoriesContext);
  if (context === undefined) {
    throw new Error('useStories must be used within a StoriesProvider');
  }
  return context;
}
