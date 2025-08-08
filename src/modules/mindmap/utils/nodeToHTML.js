/*
 * Return the HTML representation of a node.
 * The node is an object that has text, url, and category attributes
 * all of them optional.
 */
export default (node) => {
  return `
  <div class="node-body" style="background-color: #fff;border: 3px solid #bb199a;border-radius: 15px;margin-top: 30px;min-height: 60px;min-width: 125px;padding: 5px 10px;">
    <div class="options">
      <div class="option add-item"><i class="fas fa-plus-circle"></i></div>
      <div class="option edit-item"><i class="fas fa-pencil-alt"></i></div>
      <div class="option remove-item"><i class="fas fa-trash-alt"></i></div>
    </div>
    <div id="${node.id}">
      <a id="node-${
        node.id
      }" class="node-text" style="color: 212121;display: inline-block;font-size: 22px;margin: 10px;padding: 5px;text-align: center;text-decoration: none;transition: background-color 0.2s, color 0.2s ease-out;">
        ${node.text || ""}
      </a>
    </div>
  </div>`;
};
