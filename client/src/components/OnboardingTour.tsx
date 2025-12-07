/**
 * OnboardingTour Component
 * Interactive guided tour for new users with spotlights and arrows
 */
import { useState, useEffect } from "react";
import "../styles/onboarding.css";

interface TourStep {
  target: string; // CSS selector
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
}

const tourSteps: TourStep[] = [
  {
    target: ".story-list-header",
    title: "Welcome to StoryWeaver! ✨",
    description:
      "Create amazing interactive stories with AI assistance. Let's take a quick tour!",
    position: "bottom",
  },
  {
    target: '[data-tour="new-story"]',
    title: "Create Your First Story",
    description:
      "Click here to start a new interactive adventure. Give it a title and description!",
    position: "bottom",
  },
  {
    target: ".scene-sidebar",
    title: "Scene Management",
    description:
      "Add and organize your story scenes here. Each scene is a chapter in your adventure!",
    position: "right",
  },
  {
    target: ".scene-editor",
    title: "Scene Editor",
    description:
      "Write your story content here. Add choices that branch to other scenes!",
    position: "top",
  },
  {
    target: ".ai-actions",
    title: "AI Assistant 🤖",
    description:
      "Use AI to suggest scenes, generate choices, or improve your writing!",
    position: "top",
  },
  {
    target: '[data-tour="play-story"]',
    title: "Preview Your Story",
    description:
      "Test your story with text-to-speech narration and interactive choices!",
    position: "bottom",
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Check if user has completed tour before
    const hasCompletedTour = localStorage.getItem("storyweaver-tour-completed");
    if (!hasCompletedTour) {
      // Delay tour start slightly
      setTimeout(() => setIsActive(true), 1000);
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const step = tourSteps[currentStep];
    if (!step) return;

    // Find target element
    const element = document.querySelector(step.target) as HTMLElement;
    setTargetElement(element);

    // Scroll element into view
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentStep, isActive]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem("storyweaver-tour-completed", "true");
    setIsActive(false);
    onComplete();
  };

  if (!isActive || !targetElement) return null;

  const step = tourSteps[currentStep];
  const rect = targetElement.getBoundingClientRect();

  // Calculate tooltip position
  let tooltipStyle: React.CSSProperties = {};
  const position = step.position || "bottom";

  switch (position) {
    case "top":
      tooltipStyle = {
        left: rect.left + rect.width / 2,
        top: rect.top - 20,
        transform: "translate(-50%, -100%)",
      };
      break;
    case "bottom":
      tooltipStyle = {
        left: rect.left + rect.width / 2,
        top: rect.bottom + 20,
        transform: "translateX(-50%)",
      };
      break;
    case "left":
      tooltipStyle = {
        left: rect.left - 20,
        top: rect.top + rect.height / 2,
        transform: "translate(-100%, -50%)",
      };
      break;
    case "right":
      tooltipStyle = {
        left: rect.right + 20,
        top: rect.top + rect.height / 2,
        transform: "translateY(-50%)",
      };
      break;
  }

  return (
    <>
      {/* Overlay */}
      <div className="tour-overlay" onClick={handleSkip} />

      {/* Spotlight */}
      <div
        className="tour-spotlight"
        style={{
          left: rect.left - 10,
          top: rect.top - 10,
          width: rect.width + 20,
          height: rect.height + 20,
        }}
      />

      {/* Tooltip */}
      <div className="tour-tooltip" style={tooltipStyle}>
        <div className="tour-tooltip-header">
          <h3>{step.title}</h3>
          <button className="tour-close" onClick={handleSkip}>
            ×
          </button>
        </div>
        <p className="tour-tooltip-description">{step.description}</p>
        <div className="tour-tooltip-footer">
          <span className="tour-progress">
            {currentStep + 1} of {tourSteps.length}
          </span>
          <div className="tour-buttons">
            <button className="tour-btn tour-btn-skip" onClick={handleSkip}>
              Skip Tour
            </button>
            <button className="tour-btn tour-btn-next" onClick={handleNext}>
              {currentStep < tourSteps.length - 1 ? "Next →" : "Finish"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
