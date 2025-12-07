/**
 * Main App Component - REDESIGNED
 * Story-first experience with minimal chrome
 */
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { StoriesProvider } from "./contexts/StoriesContext";
import { StoryListPage } from "./routes/StoryListPage";
import { StoryEditorPage } from "./routes/StoryEditorPage";
import "./styles/global.css";
import "./styles/story-canvas.css";
import "./styles/story-home.css";

function App() {
  return (
    <Router>
      <StoriesProvider>
        <Routes>
          <Route path="/" element={<StoryListPage />} />
          <Route path="/stories/:id" element={<StoryEditorPage />} />
        </Routes>
      </StoriesProvider>
    </Router>
  );
}

export default App;
