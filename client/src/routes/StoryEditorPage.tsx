/**
 * StoryEditorPage - REDESIGNED
 * Now uses unified StoryCanvas component
 */
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { StoryCanvas } from "../components/StoryCanvas";
import { useStories } from "../contexts/StoriesContext";

export function StoryEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = (searchParams.get("mode") as "play" | "edit") || "edit";

  const {
    getStory,
    updateStory,
    createScene,
    updateScene,
    deleteScene,
    addChoice,
    updateChoice,
    deleteChoice,
  } = useStories();

  const story = id ? getStory(id) : undefined;

  if (!story) {
    return (
      <div className="canvas-empty">
        <p>Story not found</p>
        <button className="canvas-btn-primary" onClick={() => navigate("/")}>
          Back to Stories
        </button>
      </div>
    );
  }

  return (
    <StoryCanvas
      story={story}
      initialMode={initialMode}
      onUpdateStory={(updates) => updateStory(story.id, updates)}
      onCreateScene={() => createScene(story.id)}
      onUpdateScene={(sceneId, updates) =>
        updateScene(story.id, sceneId, updates)
      }
      onDeleteScene={(sceneId) => deleteScene(story.id, sceneId)}
      onAddChoice={(sceneId, text) => addChoice(story.id, sceneId, text)}
      onUpdateChoice={(sceneId, choiceId, updates) =>
        updateChoice(story.id, sceneId, choiceId, updates)
      }
      onDeleteChoice={(sceneId, choiceId) =>
        deleteChoice(story.id, sceneId, choiceId)
      }
      onBack={() => navigate("/")}
    />
  );
}
