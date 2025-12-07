/**
 * StoryCanvas Component
 * THE CORE: A unified, immersive story experience
 * No sidebars. No clutter. Just pure storytelling.
 */
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Play,
  Pause,
  Music,
  Mic,
  FileText,
  Sparkles,
  Network,
} from "lucide-react";
import { Story, Scene } from "../types/story";
import { useAiApi } from "../hooks/useAiApi";
import { StoryGraphVisualizer } from "./StoryGraphVisualizer";
import "../styles/story-canvas.css";

interface StoryCanvasProps {
  story: Story;
  initialMode?: "play" | "edit";
  onUpdateStory: (updates: Partial<Story>) => void;
  onCreateScene: () => Scene;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
  onAddChoice: (sceneId: string, text?: string) => void;
  onUpdateChoice: (sceneId: string, choiceId: string, updates: any) => void;
  onDeleteChoice: (sceneId: string, choiceId: string) => void;
  onBack: () => void;
}

export function StoryCanvas({
  story,
  initialMode = "play",
  onUpdateStory,
  onCreateScene,
  onUpdateScene,
  onAddChoice,
  onUpdateChoice,
  onDeleteChoice,
  onBack,
}: StoryCanvasProps) {
  const [mode, setMode] = useState<"play" | "edit">(initialMode);

  // Initialize currentSceneId: use startSceneId, or first scene if available, or null
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(() => {
    if (story.startSceneId) return story.startSceneId;
    if (story.scenes.length > 0) return story.scenes[0].id;
    return null;
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [words, setWords] = useState<string[]>([]);
  const [showSceneNav, setShowSceneNav] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { suggestScene, suggestChoices, loading: aiLoading } = useAiApi();

  const currentScene = story.scenes.find((s) => s.id === currentSceneId);

  // Ensure currentSceneId is updated if scenes change and no scene is selected
  useEffect(() => {
    if (!currentSceneId && story.scenes.length > 0) {
      setCurrentSceneId(story.scenes[0].id);
    }
  }, [story.scenes, currentSceneId]);

  // Initialize background music
  useEffect(() => {
    const audio = new Audio("/ambient-music.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Auto-start narration and music in play mode
  useEffect(() => {
    if (currentScene?.body) {
      setWords(currentScene.body.split(/(\s+)/));
      setCurrentWordIndex(-1);
      stopSpeaking();

      // Auto-play in play mode
      if (mode === "play") {
        // Start music
        if (audioRef.current && !isMusicPlaying) {
          audioRef.current.play().catch(() => {});
          setIsMusicPlaying(true);
        }

        // Start narration after a brief delay
        setTimeout(() => {
          if (mode === "play") {
            startSpeaking();
          }
        }, 500);
      }
    }
  }, [currentScene, mode]);

  const stopSpeaking = () => {
    if (speechSynthesis.speaking) speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
    utteranceRef.current = null;
  };

  const startSpeaking = () => {
    if (!currentScene?.body) return;

    const utterance = new SpeechSynthesisUtterance(currentScene.body);
    utterance.rate = 0.85;
    utterance.pitch = 0.95;
    utterance.volume = 1;

    const voices = speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.name.includes("Daniel") || v.name.includes("Samantha")
    );
    if (preferred) utterance.voice = preferred;

    utterance.onboundary = (event) => {
      if (event.name === "word") {
        const textUpToNow = currentScene.body.substring(0, event.charIndex);
        setCurrentWordIndex(textUpToNow.split(/(\s+)/).length - 1);
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentWordIndex(-1);
    };

    utteranceRef.current = utterance;
    setIsSpeaking(true);
    setIsPaused(false);
    speechSynthesis.speak(utterance);
  };

  const toggleSpeech = () => {
    if (!currentScene?.body) return;

    if (isSpeaking && !isPaused) {
      // Pause
      speechSynthesis.pause();
      setIsPaused(true);
    } else if (isSpeaking && isPaused) {
      // Resume
      speechSynthesis.resume();
      setIsPaused(false);
    } else {
      // Start
      startSpeaking();
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsMusicPlaying(true);
    }
  };

  const handleChoice = (targetSceneId: string | null) => {
    if (targetSceneId) {
      setCurrentSceneId(targetSceneId);
      stopSpeaking();
    }
  };

  const handleAiSuggest = async () => {
    if (!currentScene) {
      console.warn("No current scene selected");
      return;
    }

    if (!currentScene.body || currentScene.body.trim().length === 0) {
      alert(
        "Please write some content in the current scene before asking for AI suggestions."
      );
      return;
    }

    console.log("Requesting AI scene suggestion...");

    // Validate story has title and description
    if (!story.title || story.title.trim().length === 0) {
      alert(
        "Please add a title to your story first.\n\nClick the scene navigation button (grid icon) at the top-right to edit Story Info."
      );
      return;
    }

    if (!story.description || story.description.trim().length === 0) {
      alert(
        "Please add a description to your story first.\n\nClick the scene navigation button (grid icon) at the top-right to edit Story Info."
      );
      return;
    }

    try {
      const result = await suggestScene(
        story.title.trim(),
        story.description.trim(),
        currentScene.body.trim()
      );

      if (!result) {
        console.error("No result from AI");
        const errorMsg =
          "Failed to generate scene.\n\nPossible issues:\n" +
          "1. Server is not running (check terminal)\n" +
          "2. GitHub token expired or invalid\n" +
          "3. Network connection issue\n\n" +
          "Check the browser console for details.";
        alert(errorMsg);
        return;
      }

      console.log("AI suggested scene:", result);

      const choicesResult = await suggestChoices(
        result.body,
        story.description
      );

      const newScene = onCreateScene();
      onUpdateScene(newScene.id, { title: result.title, body: result.body });

      if (choicesResult?.choices) {
        choicesResult.choices.forEach((c: { text: string }) =>
          onAddChoice(newScene.id, c.text)
        );
      }

      onAddChoice(currentSceneId!, `Continue to ${result.title}`);
      const scene = story.scenes.find((s) => s.id === currentSceneId);
      if (scene) {
        const lastChoice = scene.choices[scene.choices.length - 1];
        if (lastChoice) {
          onUpdateChoice(currentSceneId!, lastChoice.id, {
            targetSceneId: newScene.id,
          });
        }
      }

      setCurrentSceneId(newScene.id);
      console.log("AI scene created successfully");
    } catch (err) {
      console.error("Error in handleAiSuggest:", err);
      alert(
        "Error generating scene: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  if (!currentScene) {
    return (
      <div className="story-canvas">
        <div className="canvas-empty">
          <p>No scene selected. Create your first scene to begin.</p>
          <button
            onClick={() => setCurrentSceneId(onCreateScene().id)}
            className="canvas-btn-primary"
          >
            ✨ Create First Scene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`story-canvas mode-${mode}`}>
      {/* Floating Controls - Minimal, Contextual */}
      <div className="canvas-controls">
        <button
          onClick={onBack}
          className="canvas-btn-icon"
          title="Back to stories"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="canvas-controls-center">
          <button
            onClick={() => setMode(mode === "play" ? "edit" : "play")}
            className="canvas-mode-toggle"
          >
            {mode === "play" ? (
              <>
                <FileText size={18} /> Edit
              </>
            ) : (
              <>
                <Play size={18} /> Play
              </>
            )}
          </button>
        </div>

        <div className="canvas-controls-right">
          {mode === "play" && (
            <>
              <button
                onClick={toggleMusic}
                className={`canvas-btn-icon ${isMusicPlaying ? "active" : ""}`}
                title="Toggle Music"
              >
                <Music size={20} />
              </button>
              <button
                onClick={toggleSpeech}
                className={`canvas-btn-icon ${isSpeaking ? "active" : ""}`}
                title={
                  isPaused
                    ? "Resume Narration"
                    : isSpeaking
                    ? "Pause Narration"
                    : "Start Narration"
                }
              >
                {isSpeaking && !isPaused ? (
                  <Pause size={20} />
                ) : (
                  <Mic size={20} />
                )}
              </button>
            </>
          )}
          {mode === "edit" && (
            <>
              <button
                onClick={() => setShowSceneNav(!showSceneNav)}
                className="canvas-btn-icon"
                title="Scene Navigation"
              >
                <FileText size={20} />
              </button>
              <button
                onClick={() => setShowGraph(true)}
                className="canvas-btn-icon"
                title="Story Structure"
              >
                <Network size={20} />
              </button>
              <button
                onClick={handleAiSuggest}
                disabled={aiLoading || !currentScene?.body}
                className={`canvas-btn-icon ${aiLoading ? "active" : ""}`}
                title={
                  !currentScene?.body
                    ? "Write some content in the scene first"
                    : aiLoading
                    ? "Generating..."
                    : "AI Scene Suggestion"
                }
              >
                <Sparkles size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Scene Navigation Overlay - Only in Edit Mode */}
      {mode === "edit" && showSceneNav && (
        <div
          className="scene-nav-overlay"
          onClick={() => setShowSceneNav(false)}
        >
          <div className="scene-nav-panel" onClick={(e) => e.stopPropagation()}>
            {/* Story Metadata */}
            <div
              style={{
                marginBottom: "1.5rem",
                paddingBottom: "1rem",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <h3 style={{ marginBottom: "0.5rem" }}>Story Info</h3>
              <input
                type="text"
                value={story.title}
                onChange={(e) => onUpdateStory({ title: e.target.value })}
                placeholder="Story Title"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  marginBottom: "0.5rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "4px",
                  color: "white",
                  fontSize: "0.9rem",
                }}
              />
              <textarea
                value={story.description}
                onChange={(e) => onUpdateStory({ description: e.target.value })}
                placeholder="Story Description"
                rows={2}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "4px",
                  color: "white",
                  fontSize: "0.9rem",
                  resize: "vertical",
                }}
              />
            </div>

            <h3>Scenes</h3>
            {story.scenes.map((scene) => (
              <div
                key={scene.id}
                className={`scene-nav-item ${
                  scene.id === currentSceneId ? "active" : ""
                }`}
                onClick={() => {
                  setCurrentSceneId(scene.id);
                  setShowSceneNav(false);
                }}
              >
                {scene.title || "Untitled"}
              </div>
            ))}
            <button
              onClick={() => setCurrentSceneId(onCreateScene().id)}
              className="scene-nav-add"
            >
              + New Scene
            </button>
          </div>
        </div>
      )}

      {/* THE STORY - Full Screen, Centered, Beautiful */}
      <div className="canvas-story">
        {!currentScene ? (
          // NO SCENE SELECTED - Empty State
          <div className="canvas-empty">
            <p>No scene selected</p>
            <button
              className="canvas-btn-primary"
              onClick={() => {
                const newScene = onCreateScene();
                setCurrentSceneId(newScene.id);
              }}
            >
              <Sparkles size={20} /> Create First Scene
            </button>
          </div>
        ) : mode === "play" ? (
          // PLAY MODE - Pure Reading Experience
          <>
            <h1 className="canvas-scene-title">{currentScene.title}</h1>
            <div className="canvas-scene-body">
              {words.map((word, index) => (
                <span
                  key={index}
                  className={`word ${
                    index === currentWordIndex ? "word-speaking" : ""
                  } ${index < currentWordIndex ? "word-spoken" : ""}`}
                >
                  {word}
                </span>
              ))}
            </div>

            {/* Choices */}
            <div className="canvas-choices">
              {currentScene.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice.targetSceneId)}
                  className="canvas-choice"
                  disabled={!choice.targetSceneId}
                >
                  {choice.text}
                </button>
              ))}
            </div>
          </>
        ) : (
          // EDIT MODE - Inline, Contextual Editing
          <>
            <input
              type="text"
              value={currentScene.title}
              onChange={(e) => {
                if (currentSceneId) {
                  onUpdateScene(currentSceneId, { title: e.target.value });
                }
              }}
              className="canvas-scene-title-edit"
              placeholder="Scene title..."
            />
            <textarea
              value={currentScene.body}
              onChange={(e) => {
                if (currentSceneId) {
                  onUpdateScene(currentSceneId, { body: e.target.value });
                }
              }}
              className="canvas-scene-body-edit"
              placeholder="Write your story here..."
              rows={15}
            />

            {/* Choices Editor */}
            <div className="canvas-choices-edit">
              <h3>Choices</h3>
              {currentScene.choices.map((choice) => (
                <div key={choice.id} className="canvas-choice-edit">
                  <input
                    type="text"
                    value={choice.text}
                    onChange={(e) => {
                      if (currentSceneId) {
                        onUpdateChoice(currentSceneId, choice.id, {
                          text: e.target.value,
                        });
                      }
                    }}
                    placeholder="Choice text..."
                  />
                  <select
                    value={choice.targetSceneId || ""}
                    onChange={(e) => {
                      if (currentSceneId) {
                        onUpdateChoice(currentSceneId, choice.id, {
                          nextSceneId: e.target.value || null,
                        });
                      }
                    }}
                  >
                    <option value="">→ None</option>
                    {story.scenes.map((s) => (
                      <option key={s.id} value={s.id}>
                        → {s.title || "Untitled"}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      if (currentSceneId) {
                        onDeleteChoice(currentSceneId, choice.id);
                      }
                    }}
                    className="canvas-btn-delete"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  if (currentSceneId) {
                    onAddChoice(currentSceneId);
                  }
                }}
                className="canvas-btn-add"
              >
                + Add Choice
              </button>
            </div>
          </>
        )}
      </div>

      {/* Story Graph Visualizer */}
      {showGraph && (
        <StoryGraphVisualizer
          story={story}
          currentSceneId={currentSceneId}
          onSceneClick={(sceneId) => setCurrentSceneId(sceneId)}
          onClose={() => setShowGraph(false)}
        />
      )}
    </div>
  );
}
