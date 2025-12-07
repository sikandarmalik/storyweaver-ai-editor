/**
 * StoryListPage - REDESIGNED
 * Story-first experience. Large immersive cards. Zero clutter.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Play, Edit, Trash2, BookOpen } from "lucide-react";
import { useStories } from "../contexts/StoriesContext";
import "../styles/story-home.css";

export function StoryListPage() {
  const navigate = useNavigate();
  const { stories, createStory, deleteStory } = useStories();
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const handleCreateStory = () => {
    if (newTitle.trim()) {
      const finalDescription =
        newDescription.trim() || "An interactive story adventure";
      const newStory = createStory(newTitle.trim(), finalDescription);
      navigate(`/stories/${newStory.id}`);
    }
  };

  const handlePlayStory = (storyId: string) => {
    navigate(`/stories/${storyId}?mode=play`);
  };

  const handleEditStory = (storyId: string) => {
    navigate(`/stories/${storyId}?mode=edit`);
  };

  const handleDeleteStory = (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation();
    if (window.confirm("Delete this story? This cannot be undone.")) {
      deleteStory(storyId);
    }
  };

  return (
    <div className="story-home">
      {/* Hero Section */}
      <div className="story-hero">
        <h1 className="hero-title">Your Stories</h1>
        <p className="hero-subtitle">Adventures waiting to be told</p>
        <button className="hero-create-btn" onClick={() => setShowCreate(true)}>
          <Sparkles size={20} /> Create New Story
        </button>
      </div>

      {/* Stories Grid */}
      <div className="stories-grid">
        {stories.map((story) => (
          <div key={story.id} className="story-card-large">
            <div className="story-card-content">
              <h2 className="story-card-title">{story.title}</h2>
              <p className="story-card-description">{story.description}</p>
              <div className="story-card-meta">
                {story.scenes.length} scene
                {story.scenes.length !== 1 ? "s" : ""}
              </div>
            </div>
            <div className="story-card-actions">
              <button
                className="story-card-btn story-card-btn-play"
                onClick={() => handlePlayStory(story.id)}
              >
                <Play size={18} /> Play
              </button>
              <button
                className="story-card-btn story-card-btn-edit"
                onClick={() => handleEditStory(story.id)}
              >
                <Edit size={18} /> Edit
              </button>
              <button
                className="story-card-btn story-card-btn-delete"
                onClick={(e) => handleDeleteStory(e, story.id)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {stories.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <BookOpen size={80} strokeWidth={1.5} />
          </div>
          <h2>No stories yet</h2>
          <p>Start your first adventure</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div
          className="create-modal-overlay"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="create-modal-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>New Story</h2>
            <input
              type="text"
              placeholder="Story Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="create-input"
              autoFocus
            />
            <textarea
              placeholder="Brief description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="create-textarea"
              rows={3}
            />
            <div className="create-modal-actions">
              <button
                className="create-modal-btn create-modal-btn-cancel"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button
                className="create-modal-btn create-modal-btn-create"
                onClick={handleCreateStory}
                disabled={!newTitle.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
