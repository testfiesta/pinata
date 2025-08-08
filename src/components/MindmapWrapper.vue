<template>
  <v-container>
    <div class="wrapper">
      <svg
        v-if="nodes.length"
        class="mindmap-wrapper-svg"
        ref="mindmapWrapper"
      ></svg>
      <div v-else class="center text-theme-label">
        {{ $tc("message.empty_workspace") }}
      </div>

      <v-menu
        v-model="showMenu"
        :position-x="menuX"
        :position-y="menuY"
        absolute
      >
        <v-list density="compact">
          <v-list-item
            v-for="(action, i) in contextMenuActions"
            :key="i"
            :value="action"
            @click="handleActionClick(action)"
            color="primary"
            class="context-menu-item"
            v-shortkey="action.key"
            @shortkey="handleActionClick(action)"
            :style="{ borderRadius: '4px', cursor: 'pointer' }"
          >
            <!-- <template v-slot:prepend> -->
            <!-- <span @click="handleActionClick(action)" class="text-caption">{{
                action.label
              }}</span> -->
            <!-- </template> -->
            <!-- <img
              :src="require('../assets/icon/' + action.icon + '.svg')"
              width="24"
              height="24"
            /> -->
            <strong>
              <v-list-item-title
                v-text="action.label"
                class="ml-2 mr-8"
              ></v-list-item-title>
            </strong>
            <v-list-item-title v-text="action.hotkey"></v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <div class="mindmap-detail-bar" v-if="selectedNodes.length > 0">
        <div class="control-btns mx-1 mt-2 cursor-pointer">
          <NodeDetailPad
            :currentColor="currentNode.color ? currentNode.color : '#e2e7fe'"
            :currentShape="currentNode.shape ? currentNode.shape : 'rectangle'"
            :currentCommentType="
              currentNode.comment.type ? currentNode.comment.type : ''
            "
            :currentTags="currentNode.tags ? currentNode.tags : []"
            :currentId="currentNode.id ? currentNode.id : ''"
            :currentAttachments="
              currentNode.attachments ? currentNode.attachments : []
            "
          />
        </div>
      </div>
      <div class="mindmap-control-btn-wrapper">
        <div>
          <div
            class="detail-bar mindmap-control-btn control-btns mx-1 mt-2 cursor-pointer"
            v-if="isDetail"
          >
            <ColorPicker :colorType="'shape'" />
            <v-divider vertical></v-divider>
            <ShapePad v-if="detailType === 'shape'" />
            <MarkerPad v-if="detailType === 'marker'" />
            <TextPad v-if="detailType === 'text'" />
            <LinkPad v-if="detailType === 'link'" />
          </div>
          <div class="flex justify-center">
            <div
              class="mindmap-control-btn control-btns mx-1 mt-2 cursor-pointer fit-content"
            >
              <!-- <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <div
                  class="mindmap-ctrl-btn"
                  v-on="on"
                  @click="handleSelect('marker')"
                >
                  <img
                    :src="require('../assets/icon/edit.svg')"
                    width="24"
                    height="24"
                  />
                </div>
              </template>
              <span>{{ $tc("caption.marker", 1) }}</span>
            </v-tooltip> -->
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <div
                    class="mindmap-ctrl-btn"
                    v-on="on"
                    @click="handleSelect('shape')"
                  >
                    <img
                      :src="require('../assets/icon/shape.svg')"
                      width="24"
                      height="24"
                    />
                  </div>
                </template>
                <span>{{ $tc("caption.shapes", 1) }}</span>
              </v-tooltip>

              <!-- <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <div
                    class="mindmap-ctrl-btn"
                    v-on="on"
                    @click="handleSelect('link')"
                  >
                    <img
                      :src="require('../assets/icon/link.svg')"
                      width="24"
                      height="24"
                    />
                  </div>
                </template>
                <span>{{ $tc("caption.connector", 1) }}</span>
              </v-tooltip> -->
              <!-- <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <div
                  class="mindmap-ctrl-btn"
                  v-on="on"
                  @click="handleSelect('text')"
                >
                  <img
                    :src="require('../assets/icon/text.svg')"
                    width="24"
                    height="24"
                  />
                </div>
              </template>
              <span>{{ $tc("caption.text", 1) }}</span>
            </v-tooltip> -->
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <div
                    class="mindmap-ctrl-btn"
                    v-on="on"
                    @click="uploadEvidence"
                  >
                    <img
                      :src="require('../assets/icon/upload.svg')"
                      width="24"
                      height="24"
                    />
                  </div>
                </template>
                <span>{{ $tc("caption.upload_evidence", 1) }}</span>
              </v-tooltip>
            </div>
          </div>
        </div>
      </div>

      <div class="mindmap-btn-wrapper">
        <v-tooltip right>
          <template v-slot:activator="{ on }">
            <div
              class="mindmap-control-btn mx-1 cursor-pointer"
              v-on="on"
              @click="resetZoom()"
            >
              <img
                :src="require('../assets/icon/compass.svg')"
                width="24"
                height="24"
              />
            </div>
          </template>
          <span>{{ $tc("caption.zoom_in_to_flow", 1) }}</span>
        </v-tooltip>

        <div class="mindmap-control-btn mx-1 mt-4">
          <div class="zoom-control">
            <v-tooltip right>
              <template v-slot:activator="{ on }">
                <div class="cursor-pointer" @click="zoomInOut(1.25)" v-on="on">
                  <img
                    :src="require('../assets/icon/zoom-in.svg')"
                    width="24"
                    height="24"
                  />
                </div>
              </template>
              <span>{{ $tc("caption.zoom_in", 1) }}</span>
            </v-tooltip>
            <v-tooltip right>
              <template v-slot:activator="{ on }">
                <div class="cursor-pointer" @click="zoomInOut(0.8)" v-on="on">
                  <img
                    :src="require('../assets/icon/zoom-out.svg')"
                    width="24"
                    height="24"
                  />
                </div>
              </template>
              <span>{{ $tc("caption.zoom_out", 1) }}</span>
            </v-tooltip>
          </div>
        </div>
      </div>
    </div>
    <AddEvidenceDialog
      v-if="evidenceData"
      v-model="addEvidenceDialog"
      :item-data="evidenceData"
      @close="
        addEvidenceDialog = false;
        evidenceData = null;
      "
    />
    <EditEvidenceDialog
      v-if="itemToEdit"
      v-model="editEvidenceDialog"
      :item-data="itemToEdit"
      @close="
        editEvidenceDialog = false;
        itemToEdit = null;
      "
    />
  </v-container>
</template>

<script>
import Vue from "vue";
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  select,
  event,
  zoom,
  zoomIdentity,
} from "d3";
import { v4 as uuidv4 } from "uuid";
import NewNode from "./NewNode.vue";
import ColorPicker from "./mindmap/ColorPicker.vue";
import ShapePad from "./mindmap/ShapePad.vue";
import MarkerPad from "./mindmap/MarkerPad.vue";
import TextPad from "./mindmap/TextPad.vue";
import LinkPad from "./mindmap/LinkPad.vue";
import NodeDetailPad from "./mindmap/NodeDetailPad.vue";
import "@fortawesome/fontawesome-free/css/all.min.css";
import vuetify from "@/plugins/vuetify";
import i18n from "@/i18n";
import store from "@/store";

// mindmap import
import {
  d3Labels,
  d3Connections,
  d3Nodes,
  d3Drag,
  d3PanZoom,
  onTick,
  d3Connector,
  d3Selection,
} from "../modules/mindmap/utils/d3";
import AddEvidenceDialog from "./dialogs/AddEvidenceDialog.vue";
import EditEvidenceDialog from "./dialogs/EditEvidenceDialog.vue";
// import { createImageForWeb } from "@/helpers/WebHelpers";
import { getViewBox } from "../modules/mindmap/utils/dimensions";
import "../modules/mindmap/sass/mindmap.sass";
import domtoimage from "dom-to-image-more";
import dayjs from "dayjs";
import { STATUSES, FILE_TYPES } from "@/modules/constants";
import { mapGetters } from "vuex";

export default {
  name: "MindmapWrapper",
  components: {
    ColorPicker,
    ShapePad,
    MarkerPad,
    TextPad,
    LinkPad,
    NodeDetailPad,
    AddEvidenceDialog,
    EditEvidenceDialog,
  },
  props: {
    edit: {
      type: Boolean,
      default: true,
    },
    triggerSave: {
      type: Boolean,
      default: () => false,
    },
    autoSave: {
      type: Boolean,
      default: () => false,
    },
  },
  watch: {
    sessionItems: {
      async handler() {
        this.items = structuredClone(this.sessionItems);
        this.nodes = structuredClone(this.sessionNodes);
        this.connections = structuredClone(this.sessionConnections);
        await this.renderMap();
      },
    },
    sessionNodes: {
      async handler() {
        this.items = structuredClone(this.sessionItems);
        this.nodes = structuredClone(this.sessionNodes);
        this.connections = structuredClone(this.sessionConnections);
        await this.renderMap();
      },
    },
    sessionConnections: {
      async handler() {
        this.items = structuredClone(this.sessionItems);
        this.nodes = structuredClone(this.sessionNodes);
        this.connections = structuredClone(this.sessionConnections);
        await this.renderMap();
      },
    },
    selectedNodes: function (newValue) {
      if (newValue.length === 0) this.isDetail = false;
    },
    triggerSave: function (newValue) {
      if (newValue) {
        this.handleMindmap(true);
      }
    },
  },
  data() {
    return {
      simulation: null,
      items: [],
      nodes: [],
      connections: [],
      itemToEdit: null,
      evidenceData: null,
      editEvidenceDialog: false,
      addEvidenceDialog: false,
      posterUrl: null,
      mindmapURL: null,
      clicked: [],
      editable: this.edit,
      selectedNodes: [],
      title: "",
      isDetail: false,
      detailType: "",
      clicks: 0,
      timer: null,
      nodeDialog: false,
      content: "",
      commentType: "",
      shape: "rectangle",
      color: "#e2e7fe",
      type: "fill",
      menuX: 0,
      menuY: 0,
      currentNode: null,
      targetNode: null,
      contextMenuActions: [
        {
          label: "Copy",
          action: "copy",
          hotkey: "Alt+C",
          icon: "delete",
        },
        {
          label: "Paste",
          action: "paste",
          hotkey: "Alt+V",
          icon: "delete",
        },
        {
          label: "Edit",
          action: "edit",
          hotkey: "Alt+E",
          icon: "pencil",
        },
        {
          label: "Delete",
          action: "delete",
          hotkey: "Delete",
          icon: "delete",
        },
      ],
      showMenu: false,
    };
  },
  computed: {
    ...mapGetters({
      sessionItems: "sessionItems",
      sessionNodes: "sessionNodes",
      sessionConnections: "sessionConnections",
      hotkeys: "config/hotkeys",
    }),
    currentStatus() {
      return this.$store.state.session.status;
    },
    current() {
      return dayjs().format("MM-DD-YYYY");
    },
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
    deleteHotkey() {
      return this.$hotkeyHelpers.findBinding("workspace.delete", this.hotkeys);
    },
    copyHotkey() {
      return this.$hotkeyHelpers.findBinding("workspace.copy", this.hotkeys);
    },
    pasteHotkey() {
      return this.$hotkeyHelpers.findBinding("workspace.paste", this.hotkeys);
    },
  },
  created() {
    // Create force simulation to position nodes that have
    // no coordinate, and add it to the component state
    this.simulation = forceSimulation()
      .force(
        "link",
        forceLink().id((node) => node.id)
      )
      .force("charge", forceManyBody())
      .force("collide", forceCollide().radius(100));
  },
  mounted() {
    this.$root.$on("update-color", this.handleUpdateColor);
    this.$root.$on("update:shape", this.handleUpdateShape);
    this.$root.$on("add-node:shape", this.handleAddNodeShape);
    this.$root.$on("update:commentType", this.handleUpdateCommentType);
    this.$root.$on("update:tags", this.handleUpdateTags);
    this.$root.$on("update:attachments", this.handleUpdateAttachments);
    this.$root.$on("render-mindmap", this.renderMindmap);
    this.nodes = structuredClone(this.sessionNodes);
    this.connections = structuredClone(this.sessionConnections);
    this.renderMap();
    this.contextMenuActions.map((action) => {
      action.key = this.$hotkeyHelpers.findBinding(
        "workspace." + action.action,
        this.hotkeys
      );
    });
  },
  updated() {
    zoom().transform(select(this.$refs.mindmapWrapper), zoomIdentity);

    this.renderMap();
  },
  methods: {
    getType(type) {
      return FILE_TYPES[type];
    },
    async uploadEvidence() {
      // todo add relative handler for web app
      if (this.$isElectron) {
        const { status, message, item } =
          await this.$electronService.uploadEvidence();

        if (status === STATUSES.ERROR) {
          this.$root.$emit("set-snackbar", message);
        } else {
          const data = {
            ...item,
            timer_mark: this.$store.state.session.timer,
          };
          this.evidenceData = data;
          this.addEvidenceDialog = true;
        }
      }
    },

    prepareNodes() {
      const render = (node) => {
        node.selected =
          this.selectedNodes.find((ele) => ele.id === node.id) !== undefined;
        node.width = node.width ?? 200;
        node.height = node.height ?? 100;
      };

      this.nodes.forEach((node) => render(node));
    },
    /**
     * Get the color of the node and update the color
     */

    handleUpdateColor(data) {
      let currentNode = this.selectedNodes[0];
      if (currentNode) {
        this.items.forEach((item) => {
          if (item.id === currentNode.id) {
            item.color = data.color;
            item.fillType = data.type;
          }
        });
        currentNode.color = data.color;
        currentNode.fillType = data.type;
      } else {
        this.color = data.color;
        this.type = data.type;
      }
      let updatedItems = structuredClone(this.items);
      let updatedNodes = structuredClone(this.nodes);
      this.$store.commit("setSessionItems", updatedItems);
      this.$store.commit("setSessionNodes", updatedNodes);
      this.renderMap();
    },
    /**
     * Get the shape of the node and update the shape
     */
    handleUpdateShape(shape) {
      let currentNode = this.selectedNodes[0];
      if (currentNode) {
        this.items.forEach((item) => {
          if (item.id === currentNode.id) {
            item.shape = shape;
            if (shape === "rectangle") {
              item.width = 200;
              item.height = 100;
            } else {
              item.width = 100;
              item.height = 100;
            }
          }
        });
        currentNode.shape = shape;
        if (shape === "rectangle") {
          currentNode.width = 200;
          currentNode.height = 100;
        } else {
          currentNode.width = 100;
          currentNode.height = 100;
        }
        let updatedItems = structuredClone(this.items);
        let updatedNodes = structuredClone(this.nodes);
        this.$store.commit("setSessionItems", updatedItems);
        this.$store.commit("setSessionNodes", updatedNodes);
        this.renderMap();
      }
    },

    /**
     * Add new node with this shape
     * @param shape shape of the node
     */
    handleAddNodeShape(shape) {
      this.shape = shape;
      this.addNewNode();
    },
    /**
     * Get the status of the node and update the status
     */
    handleUpdateCommentType(commentType) {
      let currentNode = this.selectedNodes[0];
      if (currentNode) {
        this.items.forEach((item) => {
          if (item.id === currentNode.id) {
            item.comment.type = commentType;
          }
        });
        currentNode.comment.type = commentType;
        let updatedItems = structuredClone(this.items);
        let updatedNodes = structuredClone(this.nodes);
        this.$store.commit("setSessionItems", updatedItems);
        this.$store.commit("setSessionNodes", updatedNodes);
        this.renderMap();
      }
    },

    /**
     * Get the tags of the node and update the tags
     */
    handleUpdateTags(tags) {
      let currentNode = this.selectedNodes[0];
      if (currentNode) {
        this.items.forEach((item) => {
          if (item.id === currentNode.id) {
            item.tags = tags;
          }
        });
        currentNode.tags = tags;
        let updatedItems = structuredClone(this.items);
        let updatedNodes = structuredClone(this.nodes);
        this.$store.commit("setSessionItems", updatedItems);
        this.$store.commit("setSessionNodes", updatedNodes);
        this.renderMap();
      }
    },

    /**
     * Get the attachments of the node and update the attachments
     */
    handleUpdateAttachments(nodeId, attachments) {
      let currentNode = this.nodes.find((item) => item.id === nodeId);
      if (currentNode) {
        this.items.forEach((item) => {
          if (item.id === currentNode.id) {
            item.attachments = attachments;
          }
        });
        currentNode.attachments = attachments;
        let updatedItems = structuredClone(this.items);
        let updatedNodes = structuredClone(this.nodes);
        this.$store.commit("setSessionItems", updatedItems);
        this.$store.commit("setSessionNodes", updatedNodes);
        this.renderMap();
      }
    },

    /**
     * Add new class to nodes, attach `drag` behevior,
     * and start simulation.
     */
    prepareEditor(svg, conns, nodes, labels) {
      nodes
        .attr("class", "mindmap-node mindmap-node--editable")
        .attr("id", (d) => d.id);

      nodes.call(d3Drag(this.simulation, svg, nodes));
      // Tick the simulation 100 times
      for (let i = 0; i < 100; i += 1) {
        this.simulation.tick();
      }

      setTimeout(() => {
        this.simulation
          .alphaTarget(0.5)
          .on("tick", () => onTick(conns, nodes, labels));
      }, 200);
    },

    renderMindmap() {
      this.selectedNodes = [];
      this.nodes = structuredClone(this.sessionNodes);
      this.connections = structuredClone(this.sessionConnections);
      setTimeout(() => {
        this.renderMap();
      }, 200);
    },

    /**
     * Render mind map using D3
     */
    renderMap() {
      this.simulation = forceSimulation()
        .force(
          "link",
          forceLink().id((node) => node.id)
        )
        .force("charge", forceManyBody())
        .force("collide", forceCollide().radius(200));

      let svg = select(this.$refs.mindmapWrapper).on("click", () => {
        // Check if the left mouse button is clicked
        event.preventDefault();
        this.selectedNodes = [];
        this.renderMap();
      });
      svg.selectAll("*").remove();

      this.prepareNodes();
      // Bind data to SVG elements and set all the properties to render them
      const labels = d3Labels(svg, this.connections);
      const connections = d3Connections(svg, this.connections, labels);

      const nodes = d3Nodes(svg, this.nodes);
      // Bind vue component to the node
      const self = this;
      nodes.each(function (node) {
        const container = select(this);
        const vueComponent = new Vue({
          vuetify,
          i18n,
          store,
          render: (h) =>
            h(NewNode, {
              props: {
                node,
                editable: self.editable,
                onRemove: () => self.removeNode(node),
                onConnect: () => self.connectNode(svg, node),
                onClick: (isAltKeyPressed) =>
                  self.clickNode(isAltKeyPressed, node),
                onAttachmentClick: (isAltKeyPressed) =>
                  self.clickNodeAttachment(isAltKeyPressed, node),
                onContextmenu: (x, y) => self.contextmenuNode(node, x, y),
              },
              vuetify,
              i18n,
              store,
            }),
          mounted() {
            this.$nextTick(() => {
              const width = this.$el.offsetWidth;
              const height = this.$el.offsetHeight;
              node.width = width; // Store the computed size in your node's data
              node.height = height; // Store the computed size in your node's data
              container.attr("width", width).attr("height", height);
            });
            // TODO: need a function to resize the node
          },
        });

        vueComponent.$mount();

        container.node().appendChild(vueComponent.$el);
      });
      d3Selection(svg, this.nodes, this.onSelectedByDrag);
      // Bind nodes and connections to the simulation
      this.simulation.nodes(this.nodes).force("link").links(this.connections);

      if (this.editable) {
        this.prepareEditor(svg, connections, nodes, labels);
      }

      // Tick the simulation 100 times
      for (let i = 0; i < 100; i += 1) {
        this.simulation.tick();
      }

      this.simulation
        .alphaTarget(0.5)
        .on("tick", () => onTick(connections, nodes, labels));

      svg
        .attr("viewBox", getViewBox(nodes.data()))
        .call(d3PanZoom(svg))
        .on("dblClick.zoom", null);
    },

    onSelectedByDrag(selectedNodes) {
      this.selectedNodes = [...selectedNodes];
      // this.renderMap();
    },
    /**
     * Zoom in and out the mind map using D3
     */
    zoomInOut(scale) {
      let svg = select(this.$refs.mindmapWrapper);
      svg.transition().call(d3PanZoom(svg).scaleBy, scale);
    },

    resetZoom() {
      let svg = select(this.$refs.mindmapWrapper);
      svg.transition().call(d3PanZoom(svg).scaleTo, 1);
      this.selectedNodes = [];
      this.renderMap();
    },

    handleActionClick(action) {
      if (action.action === "copy") {
        this.copyNode(this.targetNode);
      } else if (action.action === "paste") {
        this.pasteNode(this.targetNode);
      } else if (action.action === "edit") {
        this.handleActivateEditSession(this.targetNode.id);
      } else if (action.action === "delete") {
        if (this.showMenu) this.removeNode(this.targetNode);
        else this.removeNode();
      }
    },

    async addNewNode() {
      const nodeId = uuidv4();
      const newItem = {
        id: nodeId,
        stepID: nodeId,
        content: this.content,
        comment: {
          text: this.content,
          type: this.commentType,
          content: "<p>" + this.content + "</p>",
        },
        shape: this.shape,
        color: this.color,
        fillType: this.type,
        width: this.shape === "rectangle" ? 200 : 100,
        height: 100,
        fileType: "text/plain",
        selected: false,
        tags: [],
        emoji: [],
        followUp: false,
        createdAt: Date.now(),
        uploaded: false,
      };
      let tempItems = structuredClone(this.sessionItems);
      for (let i = 0; i < this.sessionNodes.length; i++) {
        tempItems[i].fx = this.sessionNodes[i].fx;
        tempItems[i].fy = this.sessionNodes[i].fy;
      }
      const updatedItems = [...tempItems];
      let updatedNodes = [];
      let updatedConnections = [...this.sessionConnections];
      if (this.sessionNodes.length == 0) {
        newItem.fx = Math.floor(Math.random() * 1001) - 500;
        newItem.fy = Math.floor(Math.random() * 1001) - 500;
      } else {
        let random_offset_x, random_offset_y;
        do {
          random_offset_x = Math.floor(Math.random() * 800) - 400;
          random_offset_y = Math.floor(Math.random() * 800) - 400;
        } while (
          (random_offset_x >= -200 && random_offset_x <= -100) ||
          (random_offset_x >= 100 && random_offset_x <= 200)
        );
        newItem.fx =
          this.sessionNodes[this.sessionNodes.length - 1].fx + random_offset_x;
        newItem.fy =
          this.sessionNodes[this.sessionNodes.length - 1].fy + random_offset_y;
      }

      updatedItems.push(newItem);
      tempItems = updatedItems
        .slice()
        .filter((item) => item?.comment?.type !== "Summary");

      tempItems.forEach((item) => {
        item.id = item.stepID;
        updatedNodes.push({ ...item, content: item.comment.text });
      });

      if (this.nodes.length > 0) {
        if (this.selectedNodes.length) {
          this.selectedNodes.forEach((node) => {
            updatedConnections.push({
              source: node.stepID,
              target: newItem.stepID,
            });
          });
        } else {
          updatedConnections.push({
            source: this.nodes[this.nodes.length - 1].stepID,
            target: newItem.stepID,
          });
        }
      }
      await this.$store.commit("setSessionItems", [...updatedItems]);
      await this.$store.commit("setSessionNodes", [...updatedNodes]);
      await this.$store.commit("setSessionConnections", [
        ...updatedConnections,
      ]);
      this.$root.$emit("render-mindmap");
    },

    /**
     * * add new nodes
     */

    /**
     * remove a node
     * todo: before remove nodes check all link
     */
    removeNode(node) {
      if (!node && this.selectedNodes.length === 0) return;
      if (!node) node = this.selectedNodes[0];

      this.items = this.items.filter((item) => item.id !== node.id);
      this.nodes = this.nodes.filter((item) => item.id !== node.id);
      this.connections = this.connections.filter(
        (item) => item.source.id !== node.id && item.target.id !== node.id
      );
      let updatedItems = structuredClone(this.items);
      let updatedNodes = structuredClone(this.nodes);
      let updatedConnections = structuredClone(this.connections);
      this.$store.commit("setSessionItems", updatedItems);
      this.$store.commit("setSessionNodes", updatedNodes);
      this.$store.commit("setSessionConnections", updatedConnections);
      this.renderMap();
      if (this.autoSave) {
        this.handleMindmap();
      }
    },

    copyNode(node) {
      this.content = node.content;
      this.commentType = node.comment.type;
      this.shape = node.shape;
      this.color = node.color;
    },

    pasteNode(node) {
      this.selectedNodes[0] = node;
      this.addNewNode();
    },

    async handleActivateEditSession(id) {
      this.itemToEdit = await this.$storageService.getItemById(id);
      console.log(this.itemToEdit);
      this.editEvidenceDialog = true;
    },
    /**
     * click on node
     */
    clickNode(isAltKeyPressed, node) {
      this.currentNode = node;
      // Toggle the selection of the clicked node
      this.clicks++;
      if (this.clicks === 1) {
        var self = this;
        this.timer = setTimeout(function () {
          self.clicks = 0;
          self.renderMap();
        }, 300);
      } else {
        clearTimeout(this.timer);
        this.updateNodes();
        this.handleActivateEditSession(node.id);
        this.clicks = 0;
        this.renderMap();
      }
      if (isAltKeyPressed) {
        const index = this.selectedNodes.indexOf(node);
        if (index === -1) {
          this.selectedNodes.push(node);
        } else {
          this.selectedNodes.splice(index, 1);
        }
        this.renderMap();
      } else {
        // If Ctrl/Cmd is not pressed, clear the selection and select only the clicked node
        this.selectedNodes = [node];
      }
    },

    /**
     * click on node attachment chip
     */
    clickNodeAttachment(isAltKeyPressed, node) {
      if (isAltKeyPressed) {
        this.clickNode(isAltKeyPressed, node);
      } else {
        this.currentNode = node;
        clearTimeout(this.timer);
        this.updateNodes();
        this.handleActivateEditSession(node.id);
        this.clicks = 0;
        this.renderMap();
        this.selectedNodes = [node];
      }
    },

    contextmenuNode(node, x, y) {
      this.menuX = x;
      this.menuY = y;
      this.showMenu = true;
      this.targetNode = node;
    },
    /**
     * link on node
     */
    connectNode(svg, node) {
      this.clicked.push(node);

      if (this.clicked.length === 2) {
        // check if the previous connection exists
        const previousConnection = this.connections.find(
          ({ source, target }) =>
            (source.id === this.clicked[0].id &&
              target.id === this.clicked[1].id) ||
            (source.id === this.clicked[1].id &&
              target.id === this.clicked[0].id)
        );
        if (!previousConnection) {
          this.connections.push({
            source: this.clicked[0].id,
            target: this.clicked[1].id,
          });
        }
        this.clicked = [];
      }
      this.renderMap();
      d3Connector(svg, this.clicked[0]);
    },

    updateNodes() {
      let updatedNodes, tempItems;
      updatedNodes = structuredClone(this.nodes);
      tempItems = structuredClone(this.sessionItems);
      for (let i = 0; i < tempItems.length; i++) {
        let node = updatedNodes.find((ele) => ele.id === tempItems[i].id);
        if (node) {
          tempItems[i].fx = node.fx;
          tempItems[i].fy = node.fy;
          tempItems[i].x = node.x;
          tempItems[i].y = node.y;
        }
      }
      this.$store.commit("setSessionItems", tempItems);
      this.$store.commit("setSessionNodes", updatedNodes);
    },
    handleSelect(type) {
      if (this.detailType !== type) {
        this.detailType = type;
        this.isDetail = true;
      } else {
        this.isDetail = false;
        this.detailType = "";
      }
      if (type === "upload") this.isDetail = false;
    },
    async handleMindmap() {
      var svgElement = document.querySelector(`.mindmap-svg`);
      var mainDom = document.createElement("div");
      // var importedNode = document.importNode(svgElement.cloneNode(true), true);
      mainDom.append(svgElement.cloneNode(true));
      document.getElementsByTagName("BODY")[0].append(mainDom);
      const quality = 2;
      const rect = svgElement.getBoundingClientRect();
      const imageUrl = await domtoimage.toPng(mainDom, {
        bgcolor: "#FAFAFA",
        height: rect.height * quality,
        width: rect.width * quality,
      });
      let new_nodes = structuredClone(this.nodes);
      let new_connections = structuredClone(this.connections);

      this.$emit("submit-mindmap", {
        nodes: new_nodes,
        connections: new_connections,
        imgURI: imageUrl,
      });
      mainDom.remove();
    },
  },
};
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: 100%;
  height: 65vh;
  background-image: url("../assets/mindmap-workspace.png");
  background-repeat: no-repeat;
  background-size: cover;
  /* height: 100vh; */
  /* background: linear-gradient(90deg, #1d8bdd 20%, #6d61b1 80%); */
  position: relative;
}

.mindmap-wrapper-svg {
  width: 100%;
  height: 80%;
}

.center {
  margin-top: 10rem;
  align-items: center;
  justify-content: center;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
}

.mindmap-btn-wrapper {
  position: absolute;
  bottom: 10px;
  right: 10px;
}
.mindmap-ctrl-btn {
  background-color: #f9fafb;
  margin-left: 8px;
  margin-right: 8px;
}
.mindmap-control-btn-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  position: absolute;
  bottom: 10px;
  left: 10px;
}
.mindmap-detail-bar {
  position: absolute;
  width: 100%;
  left: 0;
  top: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
.control-btns {
  display: flex !important;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.zoom-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.context-menu-item {
  cursor: pointer;
}

.context-menu-item:hover {
  background-color: #f0f0f0;
}
.detail-bar,
.mindmap-detail-bar,
.mindmap-control-btn-wrapper {
  animation: pop-in 0.5s;
}
@keyframes pop-in {
  0% {
    opacity: 0;
    transform: scale(0.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
