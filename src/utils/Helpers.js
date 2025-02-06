export function getNodeColor(node) {
    return /\d/.test(node.name) ? "#FF5733" : "#00BFFF";
  }
  
  export function getNodeSize(node) {
    return /\d/.test(node.name) ? 12 : 8;
  }
  
  export function getLinkColor(link, nodes) {
    const sourceNode = nodes.find((node) => node.id === link.source);
    const targetNode = nodes.find((node) => node.id === link.target);
  
    if (!sourceNode || !targetNode) {
      console.error("One of the nodes in the link is undefined:", link);
      return "#808080";
    }
  
    return /\d/.test(sourceNode.name) && /\d/.test(targetNode.name)
      ? "#FFC300"
      : "#808080";
  }