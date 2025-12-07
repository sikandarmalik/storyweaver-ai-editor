/**
 * StoryCard Component
 * Displays a single story in the list with edit/delete actions
 */
import { Story } from '../types/story';

interface StoryCardProps {
  story: Story;
  onEdit: (storyId: string) => void;
  onDelete: (storyId: string) => void;
}

export function StoryCard({ story, onEdit, onDelete }: StoryCardProps) {
  return (
    <div className="story-card">
      <div className="story-card-content">
        <h3>{story.title}</h3>
        <p className="story-description">{story.description}</p>
        <p className="story-meta">
          {story.scenes.length} scene{story.scenes.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="story-card-actions">
        <button onClick={() => onEdit(story.id)} className="btn btn-primary">
          Edit
        </button>
        <button
          onClick={() => {
            if (window.confirm(`Delete "${story.title}"? This cannot be undone.`)) {
              onDelete(story.id);
            }
          }}
          className="btn btn-danger"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
