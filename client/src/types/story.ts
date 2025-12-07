/**
 * Core data models for StoryWeaver
 * Defines the structure of Stories, Scenes, and Choices
 */

export type Choice = {
  id: string;
  text: string;
  targetSceneId: string | null;
};

export type Scene = {
  id: string;
  title: string;
  body: string;
  choices: Choice[];
};

export type Story = {
  id: string;
  title: string;
  description: string;
  scenes: Scene[];
  startSceneId: string | null;
};
