const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

const generateViableConfig = () => {
    const gridSize = 4;
    const nodes = [];
    const edges = [];
  
    // Generate nodes and edges
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        nodes.push([r, c]);
        if (r < gridSize - 1) edges.push([[r, c], [r + 1, c]]); // Vertical walls
        if (c < gridSize - 1) edges.push([[r, c], [r, c + 1]]); // Horizontal walls
      }
    }
  
    // Calculate the score for a configuration
    const calculateScore = (walls) => {
      const adjacencyList = new Map(nodes.map((node) => [node.toString(), []]));
  
      // Build adjacency list without walls
      edges.forEach(([a, b]) => {
        if (!walls.some((wall) => (wall[0].toString() === a.toString() && wall[1].toString() === b.toString()) || 
                                  (wall[0].toString() === b.toString() && wall[1].toString() === a.toString()))) {
          adjacencyList.get(a.toString()).push(b.toString());
          adjacencyList.get(b.toString()).push(a.toString());
        }
      });
  
      // Count dead ends
      let deadEnds = 0;
      adjacencyList.forEach((neighbors) => {
        if (neighbors.length === 1) deadEnds++;
      });
  
      // Identify and penalize long linear paths
      const visited = new Set();
      let pathPenalty = 0;
  
      const traversePath = (startNode) => {
        let current = startNode;
        let prev = null;
        let length = 0;
  
        while (true) {
          visited.add(current.toString());
          const neighbors = adjacencyList.get(current.toString()).filter((n) => n !== (prev || "").toString());
          if (neighbors.length !== 1) break;
  
          prev = current;
          current = neighbors[0].split(",").map(Number);
          length++;
        }
  
        if (length > 2) pathPenalty += length; // Penalize paths longer than 2 tiles
      };
  
      nodes.forEach((node) => {
        if (!visited.has(node.toString()) && adjacencyList.get(node.toString()).length === 2) {
          traversePath(node);
        }
      });
  
      return deadEnds + pathPenalty;
    };
  
    // Check if the configuration is connected
    const isConnected = (walls) => {
      const adjacencyList = new Map(nodes.map((node) => [node.toString(), []]));
  
      // Build adjacency list without walls
      edges.forEach(([a, b]) => {
        if (!walls.some((wall) => (wall[0].toString() === a.toString() && wall[1].toString() === b.toString()) || 
                                  (wall[0].toString() === b.toString() && wall[1].toString() === a.toString()))) {
          adjacencyList.get(a.toString()).push(b.toString());
          adjacencyList.get(b.toString()).push(a.toString());
        }
      });
  
      // Use BFS to check connectivity
      const visited = new Set();
      const queue = [nodes[0].toString()]; // Start from the top-left corner
  
      while (queue.length > 0) {
        const current = queue.shift();
        if (!visited.has(current)) {
          visited.add(current);
          adjacencyList.get(current).forEach((neighbor) => {
            if (!visited.has(neighbor)) queue.push(neighbor);
          });
        }
      }
  
      return visited.size === nodes.length;
    };
  
    let bestConfig = null;
    let bestScore = Infinity;
  
    // Generate configurations and select the best one
    for (let i = 0; i < 100; i++) {
      const walls = [];
      const shuffledEdges = [...edges].sort(() => Math.random() - 0.5);
      for (let j = 0; j < 8; j++) {
        walls.push(shuffledEdges[j]);
      }
  
      if (isConnected(walls)) {
        const score = calculateScore(walls);
        if (score < bestScore) {
          bestScore = score;
          bestConfig = walls;
        }
      }
    }
  
    return bestConfig;
  };
  
// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// API to get a new layout
app.get("/api/layout", (req, res) => {
  const layout = generateViableConfig();
  res.json({ layout });
});

// Start the server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));