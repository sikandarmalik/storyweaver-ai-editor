/**
 * SceneSidebar Component
 * Left sidebar showing list of scenes with add/select functionality
 */
import { Scene } from '../types/story';

interface SceneSidebarProps {
  scenes: Scene[];
  selectedSceneId: string | null;
  onSelectScene: (sceneId: string) => void;
  onAddScene: () => void;
  onDeleteScene: (sceneId: string) => void;
}

export function SceneSidebar({
  scenes,
  selectedSceneId,
  onSelectScene,
  onAddScene,
  onDeleteScene,
}: SceneSidebarProps) {
  return (
    <div className="scene-sidebar">
      <div className="sidebar-header">
        <h3>Scenes</h3>
        <button onClick={onAddScene} className="btn btn-small">
          + Add Scene
        </button>
      </div>
      
      <div className="scene-list">
        {scenes.length === 0 ? (
          <p className="empty-message">No scenes yet. Add your first scene!</p>
        ) : (
          scenes.map((scene) => (
            <div
              key={scene.id}
              className={`scene-item ${selectedSceneId === scene.id ? 'active' : ''}`}
              onClick={() => onSelectScene(scene.id)}
            >
              <div className="scene-item-content">
                <span className="scene-title">{scene.title || 'Untitled Scene'}</span>
              </div>
              <button
                className="btn-icon btn-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete scene "${scene.title}"?`)) {
                    onDeleteScene(scene.id);
                  }
                }}
                title="Delete scene"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
