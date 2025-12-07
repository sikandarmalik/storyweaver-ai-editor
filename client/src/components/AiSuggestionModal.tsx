/**
 * AiSuggestionModal Component
 * Modal for displaying AI suggestions with apply/cancel actions
 */
import { ReactNode } from 'react';

interface AiSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function AiSuggestionModal({ isOpen, onClose, title, children }: AiSuggestionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="btn-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

interface SceneSuggestionProps {
  title: string;
  body: string;
  onAddAsNew: () => void;
  onReplaceCurrent: () => void;
  onCancel: () => void;
}

export function SceneSuggestion({
  title,
  body,
  onAddAsNew,
  onReplaceCurrent,
  onCancel,
}: SceneSuggestionProps) {
  return (
    <div className="ai-suggestion">
      <div className="suggestion-content">
        <h4>{title}</h4>
        <p className="suggestion-body">{body}</p>
      </div>
      <div className="suggestion-actions">
        <button onClick={onAddAsNew} className="btn btn-primary">
          Add as New Scene
        </button>
        <button onClick={onReplaceCurrent} className="btn btn-secondary">
          Replace Current Scene
        </button>
        <button onClick={onCancel} className="btn btn-text">
          Cancel
        </button>
      </div>
    </div>
  );
}

interface ChoiceSuggestionsProps {
  choices: Array<{ text: string }>;
  onAddChoice: (text: string) => void;
  onCancel: () => void;
}

export function ChoiceSuggestions({ choices, onAddChoice, onCancel }: ChoiceSuggestionsProps) {
  return (
    <div className="ai-suggestion">
      <div className="suggestion-content">
        <p className="suggestion-label">Suggested Choices:</p>
        <div className="choice-suggestions">
          {choices.map((choice, index) => (
            <div key={index} className="choice-suggestion-item">
              <span className="choice-text">{choice.text}</span>
              <button onClick={() => onAddChoice(choice.text)} className="btn btn-small">
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="suggestion-actions">
        <button onClick={onCancel} className="btn btn-text">
          Close
        </button>
      </div>
    </div>
  );
}

interface TextImprovementProps {
  originalText: string;
  improvedText: string;
  onApply: () => void;
  onCancel: () => void;
}

export function TextImprovement({
  originalText,
  improvedText,
  onApply,
  onCancel,
}: TextImprovementProps) {
  return (
    <div className="ai-suggestion">
      <div className="suggestion-content">
        <div className="text-comparison">
          <div className="text-comparison-section">
            <h4>Original</h4>
            <p className="comparison-text">{originalText}</p>
          </div>
          <div className="text-comparison-section">
            <h4>Improved</h4>
            <p className="comparison-text improved">{improvedText}</p>
          </div>
        </div>
      </div>
      <div className="suggestion-actions">
        <button onClick={onApply} className="btn btn-primary">
          Apply
        </button>
        <button onClick={onCancel} className="btn btn-text">
          Cancel
        </button>
      </div>
    </div>
  );
}
