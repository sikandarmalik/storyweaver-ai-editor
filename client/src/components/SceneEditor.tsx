/**
 * SceneEditor Component
 * Main editor panel for editing a single scene's content and choices
 */
import { Scene, Choice, Story } from '../types/story';

interface SceneEditorProps {
  scene: Scene;
  story: Story;
  onUpdateScene: (updates: Partial<Scene>) => void;
  onAddChoice: () => void;
  onUpdateChoice: (choiceId: string, updates: Partial<Choice>) => void;
  onDeleteChoice: (choiceId: string) => void;
}

export function SceneEditor({
  scene,
  story,
  onUpdateScene,
  onAddChoice,
  onUpdateChoice,
  onDeleteChoice,
}: SceneEditorProps) {
  return (
    <div className="scene-editor">
      <div className="editor-section">
        <label className="editor-label">Scene Title</label>
        <input
          type="text"
          value={scene.title}
          onChange={(e) => onUpdateScene({ title: e.target.value })}
          className="input-text"
          placeholder="Enter scene title..."
        />
      </div>

      <div className="editor-section">
        <label className="editor-label">Scene Body</label>
        <textarea
          value={scene.body}
          onChange={(e) => onUpdateScene({ body: e.target.value })}
          className="input-textarea scene-body-textarea"
          placeholder="Write the scene content here..."
          rows={10}
        />
      </div>

      <div className="editor-section">
        <div className="section-header">
          <label className="editor-label">Choices</label>
          <button onClick={onAddChoice} className="btn btn-small">
            + Add Choice
          </button>
        </div>

        <div className="choices-list">
          {scene.choices.length === 0 ? (
            <p className="empty-message">No choices yet. Add a choice to create branching paths.</p>
          ) : (
            scene.choices.map((choice) => (
              <div key={choice.id} className="choice-item">
                <div className="choice-fields">
                  <input
                    type="text"
                    value={choice.text}
                    onChange={(e) => onUpdateChoice(choice.id, { text: e.target.value })}
                    className="input-text choice-text-input"
                    placeholder="Choice text..."
                  />
                  <select
                    value={choice.targetSceneId || ''}
                    onChange={(e) =>
                      onUpdateChoice(choice.id, {
                        targetSceneId: e.target.value || null,
                      })
                    }
                    className="input-select"
                  >
                    <option value="">None / Unlinked</option>
                    {story.scenes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title || 'Untitled Scene'}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="btn-icon btn-delete"
                  onClick={() => onDeleteChoice(choice.id)}
                  title="Delete choice"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
