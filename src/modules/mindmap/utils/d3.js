import { drag, event, zoom, mouse, select } from "d3";
import { getViewBox } from "./dimensions";

/**
 * Bind data to a <TAG>, inside a G element, inside the given root element.
 * Root is a D3 selection, data is an object or array, tag is a string.
 */
const bindData = (root, data, tag) =>
  root.append("g").selectAll(tag).data(data).enter().append(tag);

/**
 * Bind connection labels to text on the given SVG
 */
export const d3Labels = (svg, connections) =>
  bindData(svg, connections, "text")
    .attr("class", "mindmap-label")
    .text((connection) => connection.label ?? "");

/**
 * Bind connections to PATH tags on the given SVG
 */
export const d3Connections = (svg, connections, labels) =>
  bindData(svg, connections, "path")
    .attr("class", "mindmap-connection")
    .on("dblclick", (clickedConn) => {
      // Prevent event propagation to the document
      event.stopPropagation();
      // Get the clicked connection index
      const clickedConnectionIndex = connections.indexOf(clickedConn);

      // Get the label text for the clicked connection
      const label = prompt("Enter the label for the connection:");
      clickedConn.label = label;

      // Update the connection labels data with the label
      labels
        .data(connections)
        .text((_, index) => (index === clickedConnectionIndex ? label : ""));
    })
    .on("click", () => {
      // Prevent event propagation to the document
      event.stopPropagation();
    });

/**
 * Bind rodes to FOREIGNOBJECT tags on the given SVG
 */
export const d3Nodes = (svg, data) =>
  bindData(svg, data, "foreignObject")
    .attr("class", "mindmap-node")
    .attr("width", (node) => node.width)
    .attr("height", (node) => node.height);

/**
 * connect nodes
 */
export const d3Connector = (svg, source) => {
  // Function to handle mousemove event for connector line
  function handleMouseMove() {
    select(".mindmap-connector-line")
      .attr("x2", mouse(this)[0] - 10)
      .attr("y2", mouse(this)[1] - 10);
  }

  if (!source) {
    // link icons' inactive color
    svg.selectAll(".fa-link").style("color", "unset");

    // Remove the connector line from the SVG
    svg.select(".mindmap-connector-line").remove();
    // Remove the mousemove and mouseup event listeners
    svg.on("mousemove", null);
  }

  if (source) {
    svg.on("mousemove", handleMouseMove);

    svg
      .append("g")
      .append("line")
      .attr("class", "mindmap-connector-line")
      .attr("x1", source.x + source.width / 2 - 20)
      .attr("y1", source.y - source.height / 2 + 20);

    // link icons' active color
    svg.selectAll(".fa-link").style("color", "#22c55e");
  }
};

/**
 * Callback for forceSimulation tick event.
 */
export const onTick = (conns, nodes, labels) => {
  const d = (conn) =>
    [
      "M",
      conn.source.x,
      ",",
      conn.source.y,
      " ",
      "C",
      (conn.source.x + conn.target.x) / 2,
      ",",
      conn.source.y,
      " ",
      (conn.source.x + conn.target.x) / 2,
      ",",
      conn.target.y,
      " ",
      conn.target.x,
      ",",
      conn.target.y,
    ].join("");

  // Set the connections path.
  conns.attr("d", d);

  // Set nodes position.
  nodes
    .attr("x", (node) => node.x - node.width / 2)
    .attr("y", (node) => node.y - node.height / 2);

  // Re-position the connection labels
  labels
    .attr("x", (d) => (d.source.x + d.target.x) / 2)
    .attr("y", (d) => (d.source.y + d.target.y) / 2 - 4);
};

export const onNextTick = (conns, nodes, labels) => {
  const d = (conn) =>
    [
      "M",
      conn.source.x,
      ",",
      conn.source.y - 100,
      " ",
      "C",
      (conn.source.x + conn.target.x) / 2,
      ",",
      conn.source.y,
      " ",
      (conn.source.x + conn.target.x) / 2,
      ",",
      conn.target.y,
      " ",
      conn.target.x,
      ",",
      conn.target.y - 100,
    ].join("");

  // Set the connections path.
  conns.attr("d", d);

  // Set nodes position.
  nodes
    .attr("x", (node) => node.x - node.width / 2)
    .attr("y", (node) => node.y - node.height / 2);

  // Re-position the connection labels
  labels
    .attr("x", (d) => (d.source.x + d.target.x) / 2)
    .attr("y", (d) => (d.source.y + d.target.y) / 2 - 4);
};

/*
 * Return drag behavior to use on d3.selection.call().
 */
export const d3Drag = (
  simulation,
  svg,
  nodes,
  isWrapper,
  dragging,
  updateNodes
) => {
  const dragStart = (node) => {
    dragging = false;
    if (!event.active) {
      simulation.alphaTarget(0.2).restart();
    }

    node.fx = node.x;
    node.fy = node.y;
  };

  const dragged = (node) => {
    dragging = true;
    node.fx = event.x;
    node.fy = event.y;
  };

  const dragEnd = () => {
    if (!event.active) {
      simulation.alphaTarget(0);
    }
    if (isWrapper && dragging) {
      updateNodes();
      dragging = false;
    }
    svg.attr("viewBox", getViewBox(nodes.data()));
  };

  return drag().on("start", dragStart).on("drag", dragged).on("end", dragEnd);
};

/**
 * select the nodes by draging
 */
export const d3Selection = (svg, nodes) => {
  // Add the drag overlay
  const overlay = svg
    .append("rect")
    .attr("class", "mindmap-overlay")
    .style("opacity", 0)
    .style("pointer-events", "none");

  svg.on("mousedown", mouseDown);
  svg.on("mousemove", dragMove);
  svg.on("mouseup", mouseUp);

  let startX,
    startY,
    isSelecting = false;
  let mouseButton = "left",
    mouseClicked = false;
  function mouseDown() {
    // Check if Ctrl or Cmd key is pressed
    // const isKeyPressed = event.ctrlKey || event.metaKey;
    // if (!isKeyPressed) return;
    mouseClicked = true;
    if (event.button === 2) {
      mouseButton = "right";
      select("body").style("cursor", "auto");
      const [relativeX, relativeY] = mouse(this);
      startX = relativeX;
      startY = relativeY;
      isSelecting = true;

      // Enable the overlay
      overlay.style("opacity", 0.5).style("pointer-events", "all");
    } else if (event.button === 0) {
      mouseButton = "left";
      select("body").style("cursor", "auto");
    }
  }

  function dragMove() {
    if (mouseClicked) {
      if (mouseButton === "right") {
        if (!isSelecting) return;
        const [relativeX, relativeY] = mouse(this);
        const mouseX = relativeX;
        const mouseY = relativeY;

        // Calculate the position and size of the box
        const minX = Math.min(startX, mouseX);
        const minY = Math.min(startY, mouseY);
        const maxX = Math.max(startX, mouseX);
        const maxY = Math.max(startY, mouseY);
        const width = maxX - minX;
        const height = maxY - minY;
        // Update the overlay attributes
        select("body").style("cursor", "auto");
        overlay
          .attr("x", minX)
          .attr("y", minY)
          .attr("width", width)
          .attr("height", height);
      } else if (mouseButton === "left") {
        // select("body").style("cursor", "crosshair");
        // select("body").style("cursor", "grabbing");
        select("body").style("cursor", "auto");
      }
    }
  }

  function mouseUp() {
    select("body").style("cursor", "auto");
    mouseClicked = false;
    if (event.button === 2) {
      isSelecting = false;
      // Hide the overlay
      overlay.style("opacity", 0).style("pointer-events", "none");

      const selectedNodes = [];

      // Iterate through each node's coordinates
      // and check if it falls within the box
      nodes.forEach((node) => {
        if (
          node.x >= overlay.attr("x") &&
          node.x <= +overlay.attr("x") + +overlay.attr("width") &&
          node.y >= overlay.attr("y") &&
          node.y <= +overlay.attr("y") + +overlay.attr("height")
        ) {
          selectedNodes.push(node);
        }
      });

      // callback(selectedNodes);
    }
  }

  return svg;
};

/* eslint-enable no-param-reassign */

/*
 * Return pan and zoom behavior to use on d3.selection.call().
 */
export const d3PanZoom = (el) =>
  zoom()
    .scaleExtent([0.3, 5])
    .on("zoom", () =>
      el.selectAll("svg > g").attr("transform", event.transform)
    );
