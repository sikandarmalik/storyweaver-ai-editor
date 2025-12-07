/**
 * StoryList Component
 * Displays all stories with create new story functionality
 */
import { useState } from 'react';
import { Story } from '../types/story';
import { StoryCard } from './StoryCard';

interface StoryListProps {
  stories: Story[];
  onCreateStory: (title: string, description: string) => void;
  onEditStory: (storyId: string) => void;
  onDeleteStory: (storyId: string) => void;
}

export function StoryList({ stories, onCreateStory, onEditStory, onDeleteStory }: StoryListProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleCreate = () => {
    if (newTitle.trim() && newDescription.trim()) {
      onCreateStory(newTitle, newDescription);
      setNewTitle('');
      setNewDescription('');
      setIsCreating(false);
    }
  };

  return (
    <div className="story-list-container">
      <div className="story-list-header">
        <h2>My Stories</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="btn btn-primary"
        >
          {isCreating ? 'Cancel' : 'New Story'}
        </button>
      </div>

      {isCreating && (
        <div className="create-story-form">
          <h3>Create New Story</h3>
          <input
            type="text"
            placeholder="Story Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="input-text"
          />
          <textarea
            placeholder="Story Description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="input-textarea"
            rows={3}
          />
          <button onClick={handleCreate} className="btn btn-primary">
            Create Story
          </button>
        </div>
      )}

      <div className="story-list">
        {stories.length === 0 ? (
          <div className="empty-state">
            <p>No stories yet. Create your first story to get started!</p>
          </div>
        ) : (
          stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onEdit={onEditStory}
              onDelete={onDeleteStory}
            />
          ))
        )}
      </div>
    </div>
  );
}
