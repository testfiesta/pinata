/*
 * Return the HTML representation of a node.
 * The node is an object that has text, url, and category attributes
 * all of them optional.
 */
const subnodesToHTML = (subnodes = [], fcolor) => {
  let color = fcolor || "";

  if (!fcolor && subnodes.length > 0 && subnodes[0].color) {
    color = `style="border-left-color: ${subnodes[0].color}"`;
  }

  return subnodes
    .map((subnode) => {
      let href = `href="${subnode.url}"`;

      if (!subnode.url) {
        href = "";
      }

      return `<div class="mindmap-subnode-group" ${color}>
                <a ${href}>${subnode.text || ""}</a>
                <div>${subnodesToHTML(subnode.nodes, color)}</div>
              </div>`;
    })
    .join("");
};

export default subnodesToHTML;
