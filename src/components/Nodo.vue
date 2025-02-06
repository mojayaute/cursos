<template>
    <div ref="graphContainer" class="w-full h-screen"></div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import ForceGraph2D from 'force-graph';
  import { nodes, links } from '../data';
  import { getNodeColor, getNodeSize } from '../utils/Helpers';
  import * as d3 from 'd3';
  
  const graphContainer = ref<HTMLElement | null>(null);
  let graph: any = null;
  let hoverNode: any = null;
  
  const connectedNodes = new Set();
  links.forEach(link => {
    connectedNodes.add(link.source); 
    connectedNodes.add(link.target);
  });

const nodeDegrees = new Map();

nodes.forEach(node => nodeDegrees.set(node.id, 0));

links.forEach(link => {
  nodeDegrees.set(link.source, nodeDegrees.get(link.source) + 1);
  nodeDegrees.set(link.target, nodeDegrees.get(link.target) + 1);
});

const centralNodes = new Set();
const degreeThreshold = 2;  
nodeDegrees.forEach((degree, nodeId) => {
  if (degree >= degreeThreshold) {
    centralNodes.add(nodeId);
  }
});

  onMounted(() => {
    if (!graphContainer.value) return;
  
    const width = window.innerWidth;
    const height = window.innerHeight;
    graph = ForceGraph2D()(graphContainer.value)
    .width(width)
    .height(height)
      .graphData({ nodes, links })
      .nodeCanvasObjectMode(() => 'before')
      .nodeCanvasObject((node: any, ctx: CanvasRenderingContext2D) => {
        const size = getNodeSize(node);
        const isConnected = connectedNodes.has(node.id);
        const color = isConnected ? getNodeColor(node) : '#000'; 
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
        ctx.fillStyle = node === hoverNode ? "#e9cd02" : color;
        ctx.fill();
        
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = "#000000";
        ctx.fillText(node.name, node.x, node.y + size + 15);
      })
      .onNodeHover((node: any) => {
        hoverNode = node;
        graphContainer.value?.style.setProperty('cursor', node ? 'pointer' : 'default');
      })
      .linkColor((link: any) => {
        const sourceIsCentral = centralNodes.has(link.source.id);
        const targetIsCentral = centralNodes.has(link.target.id);
      if (sourceIsCentral && targetIsCentral) {
        return '#FF5733'; 
      }
      return '#E0E0E0'; 
    })
      .linkDirectionalArrowLength(3.5)
      .linkDirectionalArrowRelPos(1)
      .autoPauseRedraw(false)
      .d3Force('charge', d3.forceManyBody().strength(-100)) 
      .d3Force('centerX', d3.forceX(width / 2).strength(0.05)) 
      .d3Force('centerY', d3.forceY(height / 2).strength(0.05)) 
      .d3Force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .d3Force('collision', d3.forceCollide(30));  
  
    const handleResize = () => {
      graph.width(window.innerWidth).height(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
    });
  });
  
  onUnmounted(() => {
    if (graph) {
      graph._destructor();
    }
  });
  </script>