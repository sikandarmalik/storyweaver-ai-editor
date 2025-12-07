/**
 * StoryEditor Component
 * Main story editing interface with scene editing and AI integration
 */
import { useState } from "react";
import { Story, Scene } from "../types/story";
import { SceneSidebar } from "./SceneSidebar";
import { SceneEditor } from "./SceneEditor";
import { StoryPreview } from "./StoryPreview";
import {
  AiSuggestionModal,
  SceneSuggestion,
  ChoiceSuggestions,
  TextImprovement,
} from "./AiSuggestionModal";
import { useAiApi } from "../hooks/useAiApi";

interface StoryEditorProps {
  story: Story;
  onUpdateStory: (updates: Partial<Story>) => void;
  onCreateScene: () => Scene;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
  onDeleteScene: (sceneId: string) => void;
  onAddChoice: (sceneId: string, text?: string) => void;
  onUpdateChoice: (sceneId: string, choiceId: string, updates: any) => void;
  onDeleteChoice: (sceneId: string, choiceId: string) => void;
  onBack: () => void;
}

type ModalType =
  | "none"
  | "scene-suggestion"
  | "choice-suggestions"
  | "text-improvement";

export function StoryEditor({
  story,
  onUpdateStory,
  onCreateScene,
  onUpdateScene,
  onDeleteScene,
  onAddChoice,
  onUpdateChoice,
  onDeleteChoice,
  onBack,
}: StoryEditorProps) {
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(
    story.scenes[0]?.id || null
  );
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("none");
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);

  const { loading, error, suggestScene, suggestChoices, improveText } =
    useAiApi();

  const selectedScene = story.scenes.find((s) => s.id === selectedSceneId);

  const handleAddScene = () => {
    const newScene = onCreateScene();
    setSelectedSceneId(newScene.id);
  };

  const handleDeleteScene = (sceneId: string) => {
    onDeleteScene(sceneId);
    // Select another scene if the deleted one was selected
    if (selectedSceneId === sceneId) {
      const remainingScenes = story.scenes.filter((s) => s.id !== sceneId);
      setSelectedSceneId(remainingScenes[0]?.id || null);
    }
  };

  // AI Suggestion Handlers
  const handleSuggestScene = async () => {
    if (!selectedScene) return;

    const result = await suggestScene(
      story.title,
      story.description,
      selectedScene.body,
      story.description
    );

    if (result) {
      // Also get suggested choices for the new scene
      const choicesResult = await suggestChoices(
        result.body,
        story.description
      );

      setAiSuggestion({
        ...result,
        suggestedChoices: choicesResult?.choices || [],
      });
      setModalType("scene-suggestion");
    }
  };

  const handleSuggestChoices = async () => {
    if (!selectedScene) return;

    const result = await suggestChoices(selectedScene.body, story.description);

    if (result) {
      setAiSuggestion(result);
      setModalType("choice-suggestions");
    }
  };

  const handleImproveText = async () => {
    if (!selectedScene || !selectedScene.body) return;

    const result = await improveText(selectedScene.body);

    if (result) {
      setAiSuggestion({
        original: selectedScene.body,
        improved: result.improvedBody,
      });
      setModalType("text-improvement");
    }
  };

  // AI Suggestion Actions
  const handleAddSceneAsNew = () => {
    if (!aiSuggestion || !selectedSceneId) return;

    const newScene = onCreateScene();
    onUpdateScene(newScene.id, {
      title: aiSuggestion.title,
      body: aiSuggestion.body,
    });

    // Auto-add suggested choices to the new scene
    if (
      aiSuggestion.suggestedChoices &&
      aiSuggestion.suggestedChoices.length > 0
    ) {
      aiSuggestion.suggestedChoices.forEach((choice: { text: string }) => {
        onAddChoice(newScene.id, choice.text);
      });
    }

    // Add a choice from current scene to the new scene
    onAddChoice(selectedSceneId, `Continue to ${aiSuggestion.title}`);
    const currentScene = story.scenes.find((s) => s.id === selectedSceneId);
    if (currentScene) {
      const lastChoice = currentScene.choices[currentScene.choices.length - 1];
      if (lastChoice) {
        onUpdateChoice(selectedSceneId, lastChoice.id, {
          targetSceneId: newScene.id,
        });
      }
    }

    setModalType("none");
    setAiSuggestion(null);
    setSelectedSceneId(newScene.id);
  };

  const handleReplaceSceneBody = () => {
    if (!aiSuggestion || !selectedSceneId) return;

    onUpdateScene(selectedSceneId, { body: aiSuggestion.body });
    setModalType("none");
    setAiSuggestion(null);
  };

  const handleAddSuggestedChoice = (text: string) => {
    if (!selectedSceneId) return;
    onAddChoice(selectedSceneId, text);
  };

  const handleApplyImprovedText = () => {
    if (!aiSuggestion || !selectedSceneId) return;

    onUpdateScene(selectedSceneId, { body: aiSuggestion.improved });
    setModalType("none");
    setAiSuggestion(null);
  };

  const closeModal = () => {
    setModalType("none");
    setAiSuggestion(null);
  };

  if (isPreviewMode) {
    return (
      <StoryPreview story={story} onClose={() => setIsPreviewMode(false)} />
    );
  }

  return (
    <div className="story-editor-container">
      {/* Header */}
      <div className="editor-header">
        <div className="header-left">
          <button onClick={onBack} className="btn btn-secondary">
            ← Back to Stories
          </button>
          <h2>{story.title}</h2>
        </div>
        <div className="header-right">
          <button
            onClick={() => setIsPreviewMode(true)}
            className="btn btn-primary"
            disabled={!story.startSceneId}
          >
            Play Story
          </button>
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="editor-layout">
        {/* Left Sidebar - Scene List */}
        <SceneSidebar
          scenes={story.scenes}
          selectedSceneId={selectedSceneId}
          onSelectScene={setSelectedSceneId}
          onAddScene={handleAddScene}
          onDeleteScene={handleDeleteScene}
        />

        {/* Main Editor Panel */}
        <div className="editor-main">
          {selectedScene ? (
            <>
              {/* Scene Editor */}
              <SceneEditor
                scene={selectedScene}
                story={story}
                onUpdateScene={(updates) =>
                  onUpdateScene(selectedScene.id, updates)
                }
                onAddChoice={() => onAddChoice(selectedScene.id)}
                onUpdateChoice={(choiceId, updates) =>
                  onUpdateChoice(selectedScene.id, choiceId, updates)
                }
                onDeleteChoice={(choiceId) =>
                  onDeleteChoice(selectedScene.id, choiceId)
                }
              />

              {/* AI Actions */}
              <div className="ai-actions">
                <h3>AI Assistance</h3>
                {error && <div className="error-message">{error}</div>}
                <div className="ai-buttons">
                  <button
                    onClick={handleSuggestScene}
                    className="btn btn-ai"
                    disabled={loading || !selectedScene.body}
                  >
                    {loading ? "Loading..." : "🤖 Suggest Next Scene"}
                  </button>
                  <button
                    onClick={handleSuggestChoices}
                    className="btn btn-ai"
                    disabled={loading || !selectedScene.body}
                  >
                    {loading ? "Loading..." : "🤖 Suggest Choices"}
                  </button>
                  <button
                    onClick={handleImproveText}
                    className="btn btn-ai"
                    disabled={loading || !selectedScene.body}
                  >
                    {loading ? "Loading..." : "🤖 Improve Writing"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-editor">
              <p>
                Select a scene from the sidebar or create a new one to start
                editing.
              </p>
            </div>
          )}

          {/* Story Settings */}
          <div className="story-settings">
            <h3>Story Settings</h3>
            <div className="setting-item">
              <label>Start Scene:</label>
              <select
                value={story.startSceneId || ""}
                onChange={(e) =>
                  onUpdateStory({ startSceneId: e.target.value || null })
                }
                className="input-select"
              >
                <option value="">Select start scene...</option>
                {story.scenes.map((scene) => (
                  <option key={scene.id} value={scene.id}>
                    {scene.title || "Untitled Scene"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestion Modals */}
      <AiSuggestionModal
        isOpen={modalType === "scene-suggestion"}
        onClose={closeModal}
        title="Scene Suggestion"
      >
        {aiSuggestion && (
          <SceneSuggestion
            title={aiSuggestion.title}
            body={aiSuggestion.body}
            onAddAsNew={handleAddSceneAsNew}
            onReplaceCurrent={handleReplaceSceneBody}
            onCancel={closeModal}
          />
        )}
      </AiSuggestionModal>

      <AiSuggestionModal
        isOpen={modalType === "choice-suggestions"}
        onClose={closeModal}
        title="Choice Suggestions"
      >
        {aiSuggestion && (
          <ChoiceSuggestions
            choices={aiSuggestion.choices}
            onAddChoice={handleAddSuggestedChoice}
            onCancel={closeModal}
          />
        )}
      </AiSuggestionModal>

      <AiSuggestionModal
        isOpen={modalType === "text-improvement"}
        onClose={closeModal}
        title="Improved Writing"
      >
        {aiSuggestion && (
          <TextImprovement
            originalText={aiSuggestion.original}
            improvedText={aiSuggestion.improved}
            onApply={handleApplyImprovedText}
            onCancel={closeModal}
          />
        )}
      </AiSuggestionModal>
    </div>
  );
}
