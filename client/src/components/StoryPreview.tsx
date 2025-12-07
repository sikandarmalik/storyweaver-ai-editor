/**
 * StoryPreview Component
 * Play mode for previewing and testing the interactive story
 * Features: Text-to-speech narration, word highlighting, custom input, AI assistance
 */
import { useState, useEffect, useRef } from "react";
import { Story, Scene } from "../types/story";
import { useAiApi } from "../hooks/useAiApi";

interface StoryPreviewProps {
  story: Story;
  onClose: () => void;
}

export function StoryPreview({ story, onClose }: StoryPreviewProps) {
  const startScene = story.scenes.find((s) => s.id === story.startSceneId);
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(
    story.startSceneId
  );
  const [customInput, setCustomInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [words, setWords] = useState<string[]>([]);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { suggestScene, loading: aiLoading } = useAiApi();

  const currentScene = story.scenes.find((s) => s.id === currentSceneId);

  // Initialize background music
  useEffect(() => {
    // Note: For a real implementation, you'd need an actual music file
    // For now, this is a placeholder that can be replaced with real ambient music
    const audio = new Audio("/ambient-music.mp3");
    audio.loop = true;
    audio.volume = 0.15; // Low volume for background ambience
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Split scene body into words for highlighting
  useEffect(() => {
    if (currentScene?.body) {
      const splitWords = currentScene.body.split(/(\s+)/);
      setWords(splitWords);
      setCurrentWordIndex(-1);
      stopSpeaking();
    }
  }, [currentScene]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleRestart = () => {
    setCurrentSceneId(story.startSceneId);
    setCustomInput("");
    stopSpeaking();
  };

  const handleChoice = (targetSceneId: string | null) => {
    if (targetSceneId) {
      setCurrentSceneId(targetSceneId);
      setCustomInput("");
      stopSpeaking();
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play().catch(() => {
        // Handle autoplay restrictions
        console.log("Music autoplay blocked by browser");
      });
      setIsMusicPlaying(true);
    }
  };

  const stopSpeaking = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCurrentWordIndex(-1);
  };

  const toggleSpeech = () => {
    if (!currentScene?.body) return;

    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    // Create speech synthesis
    const utterance = new SpeechSynthesisUtterance(currentScene.body);
    speechRef.current = utterance;

    // Configure voice for adventure storytelling
    utterance.rate = 0.85; // Slightly slower for dramatic effect
    utterance.pitch = 0.95; // Slightly deeper for storytelling
    utterance.volume = 1;

    // Try to find a better voice for storytelling
    const voices = speechSynthesis.getVoices();
    const preferredVoices = voices.filter(
      (voice) =>
        voice.name.includes("Daniel") ||
        voice.name.includes("Samantha") ||
        voice.name.includes("Karen") ||
        voice.name.includes("male") ||
        voice.lang.startsWith("en")
    );
    if (preferredVoices.length > 0) {
      utterance.voice = preferredVoices[0];
    }

    // Track word highlighting with smooth transitions
    utterance.onboundary = (event) => {
      if (event.name === "word") {
        // Calculate which word index we're at
        const textUpToNow = currentScene.body.substring(0, event.charIndex);
        const wordsSoFar = textUpToNow.split(/(\s+)/).length - 1;
        setCurrentWordIndex(wordsSoFar);
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentWordIndex(-1);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentWordIndex(-1);
    };

    setIsSpeaking(true);
    speechSynthesis.speak(utterance);
  };

  const handleCustomInput = async () => {
    if (!customInput.trim() || !currentScene) return;

    setIsGenerating(true);
    stopSpeaking();

    // Generate new scene based on player's custom input
    const result = await suggestScene(
      story.title,
      story.description,
      `${currentScene.body}\n\nPlayer action: ${customInput}`,
      `The player chose to: "${customInput}"`
    );

    if (result) {
      // Create a temporary new scene
      const newScene: Scene = {
        id: `temp-${Date.now()}`,
        title: result.title,
        body: result.body,
        choices: [],
      };

      // Add to story temporarily
      story.scenes.push(newScene);
      setCurrentSceneId(newScene.id);
      setCustomInput("");
    }

    setIsGenerating(false);
  };

  if (!story.startSceneId || !startScene) {
    return (
      <div className="story-preview">
        <div className="preview-header">
          <h2>Play Story: {story.title}</h2>
          <button onClick={onClose} className="btn btn-secondary">
            Close Preview
          </button>
        </div>
        <div className="preview-content">
          <div className="preview-error">
            <p>Cannot start story: No start scene is set.</p>
            <p>
              Go back to the editor and set a start scene from the Story
              Settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentScene) {
    return (
      <div className="story-preview">
        <div className="preview-header">
          <h2>Play Story: {story.title}</h2>
          <button onClick={onClose} className="btn btn-secondary">
            Close Preview
          </button>
        </div>
        <div className="preview-content">
          <div className="preview-error">
            <p>Scene not found. The story structure may be incomplete.</p>
            <button onClick={handleRestart} className="btn btn-primary">
              Restart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="story-preview">
      <div className="preview-header">
        <h2>Play Story: {story.title}</h2>
        <div className="preview-actions">
          <button
            onClick={toggleMusic}
            className={`btn-music ${isMusicPlaying ? "playing" : ""}`}
            title={isMusicPlaying ? "Stop ambient music" : "Play ambient music"}
          >
            {isMusicPlaying ? "🎵 Music On" : "🎵 Music"}
          </button>
          <button onClick={handleRestart} className="btn btn-small">
            🔄 Restart
          </button>
          <button onClick={onClose} className="btn btn-secondary">
            ✕ Close
          </button>
        </div>
      </div>

      <div className="preview-content">
        <div className="scene-display">
          <div className="scene-header-controls">
            <h3 className="scene-title">{currentScene.title}</h3>
            <button
              onClick={toggleSpeech}
              className={`btn-narration ${isSpeaking ? "speaking" : ""}`}
              title={isSpeaking ? "Stop narration" : "Read aloud"}
            >
              {isSpeaking ? "⏸ Pause" : "🎙️ Narrate"}
            </button>
          </div>

          <div className="scene-body narration-text">
            {words.map((word, index) => {
              const isCurrentWord = index === currentWordIndex;
              const isPastWord = index < currentWordIndex;
              return (
                <span
                  key={index}
                  className={`
                    word
                    ${isCurrentWord ? "word-speaking" : ""}
                    ${isPastWord ? "word-spoken" : ""}
                  `}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>

        <div className="choices-display">
          <div className="choice-prompt-section">
            <p className="choice-prompt">✨ What do you do?</p>
          </div>

          {/* Predefined choices */}
          {currentScene.choices.length > 0 && (
            <div className="choice-buttons">
              {currentScene.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice.targetSceneId)}
                  className="btn btn-choice"
                  disabled={!choice.targetSceneId || isGenerating}
                >
                  {choice.text}
                  {!choice.targetSceneId && " (Not linked)"}
                </button>
              ))}
            </div>
          )}

          {/* Custom input section */}
          <div className="custom-input-section">
            <div className="custom-input-header">
              <span className="custom-input-label">
                🎭 Or type your own action:
              </span>
            </div>
            <div className="custom-input-group">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !isGenerating && handleCustomInput()
                }
                placeholder="Describe what you want to do..."
                className="custom-input-field"
                disabled={isGenerating}
              />
              <button
                onClick={handleCustomInput}
                className="btn btn-primary custom-input-btn"
                disabled={!customInput.trim() || isGenerating || aiLoading}
              >
                {isGenerating ? "✨ Generating..." : "🚀 Go"}
              </button>
            </div>
            <p className="custom-input-hint">
              💡 AI will generate the next scene based on your action!
            </p>
          </div>

          {/* End of story */}
          {currentScene.choices.length === 0 && (
            <div className="end-of-story">
              <p>🎬 The End</p>
              <button onClick={handleRestart} className="btn btn-primary">
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
