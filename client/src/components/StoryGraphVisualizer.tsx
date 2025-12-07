/**
 * StoryGraphVisualizer Component
 * Visual representation of story structure showing scenes and connections
 */
import { useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { Story } from "../types/story";
import "../styles/story-graph.css";

interface StoryGraphVisualizerProps {
  story: Story;
  currentSceneId: string | null;
  onSceneClick: (sceneId: string) => void;
  onClose: () => void;
}

export function StoryGraphVisualizer({
  story,
  currentSceneId,
  onSceneClick,
  onClose,
}: StoryGraphVisualizerProps) {
  // Convert story scenes to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    return story.scenes.map((scene, index) => {
      const isStart = scene.id === story.startSceneId;
      const isCurrent = scene.id === currentSceneId;
      const choiceCount = scene.choices.length;

      // Calculate position in a circular layout
      const angle = (index / story.scenes.length) * 2 * Math.PI;
      const radius = 300;
      const x = Math.cos(angle) * radius + 400;
      const y = Math.sin(angle) * radius + 300;

      return {
        id: scene.id,
        type: "default",
        position: { x, y },
        data: {
          label: (
            <div className="graph-node-content">
              <div className="graph-node-title">
                {isStart && <span className="graph-badge start">START</span>}
                {scene.title || "Untitled Scene"}
              </div>
              <div className="graph-node-meta">
                {choiceCount} choice{choiceCount !== 1 ? "s" : ""}
              </div>
            </div>
          ),
        },
        className: `graph-node ${isStart ? "graph-node-start" : ""} ${
          isCurrent ? "graph-node-current" : ""
        } ${choiceCount === 0 ? "graph-node-end" : ""}`,
      };
    });
  }, [story.scenes, story.startSceneId, currentSceneId]);

  // Convert choices to React Flow edges
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    story.scenes.forEach((scene) => {
      scene.choices.forEach((choice) => {
        if (choice.targetSceneId) {
          edges.push({
            id: `${scene.id}-${choice.id}`,
            source: scene.id,
            target: choice.targetSceneId,
            type: "smoothstep",
            animated: true,
            label:
              choice.text.substring(0, 20) +
              (choice.text.length > 20 ? "..." : ""),
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#667eea",
            },
            style: {
              stroke: "#667eea",
              strokeWidth: 2,
            },
            labelStyle: {
              fill: "#fff",
              fontSize: 10,
              fontWeight: 600,
            },
            labelBgStyle: {
              fill: "rgba(102, 126, 234, 0.8)",
              fillOpacity: 0.9,
            },
          });
        }
      });
    });
    return edges;
  }, [story.scenes]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onSceneClick(node.id);
      onClose();
    },
    [onSceneClick, onClose]
  );

  return (
    <div className="graph-overlay" onClick={onClose}>
      <div className="graph-panel" onClick={(e) => e.stopPropagation()}>
        <div className="graph-header">
          <h2>Story Structure</h2>
          <button className="graph-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="graph-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            attributionPosition="bottom-left"
          >
            <Background color="#667eea" gap={16} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                if (node.className?.includes("graph-node-start"))
                  return "#667eea";
                if (node.className?.includes("graph-node-current"))
                  return "#764ba2";
                if (node.className?.includes("graph-node-end"))
                  return "#ff6b6b";
                return "#888";
              }}
              maskColor="rgba(0, 0, 0, 0.6)"
            />
          </ReactFlow>
        </div>
        <div className="graph-legend">
          <span className="legend-item">
            <span className="legend-dot start"></span> Start Scene
          </span>
          <span className="legend-item">
            <span className="legend-dot current"></span> Current Scene
          </span>
          <span className="legend-item">
            <span className="legend-dot end"></span> Dead End
          </span>
        </div>
      </div>
    </div>
  );
}
