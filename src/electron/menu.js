import { app, Menu } from "electron";
import i18n from "./i18n";
import open from "open";

const createMenu = (win) => {
  const template = [
    {
      label: i18n.t("menu.file"),
      id: "menu_file",
      submenu: [
        {
          label: i18n.t("menu.new_session"),
          accelerator: "Ctrl+Shift+C",
          click: () => win.webContents.send("NEW_SESSION", true),
        },
        // {
        //   label: i18n.t("menu.new_session_test"),
        //   accelerator: "Ctrl+Shift+T",
        //   click: () => win.webContents.send("NEW_SESSION_TEST", true),
        // },
        // {
        //   label: i18n.t("menu.new_session_charter"),
        //   accelerator: "Ctrl+Shift+B",
        //   click: () => win.webContents.send("NEW_SESSION_CHARTER", true),
        // },
        {
          label: i18n.t("menu.open_session"),
          accelerator: "Ctrl+Shift+O",
          click: () => win.webContents.send("OPEN_SESSION", true),
        },
        { type: "separator" },
        {
          label: i18n.t("menu.save_session"),
          accelerator: "Alt+Ctrl+S",
          enabled: false,
          id: "menu_save_session",
          click: () => win.webContents.send("SAVE_SESSION", true),
        },
        // {
        //   label: i18n.t("menu.save_as_charter"),
        //   accelerator: "Ctrl+Shift+X",
        //   enabled: false,
        //   id: "menu_save_as_charter",
        //   click: () => win.webContents.send("SAVE_AS_CHARTER", true),
        // },
        {
          label: i18n.t("menu.reset_session"),
          enabled: false,
          id: "menu_reset_session",
          click: () => win.webContents.send("RESET_SESSION", true),
        },
        { type: "separator" },
        {
          label: i18n.tc("menu.app_setting", 1),
          click: () => win.webContents.send("APP_SETTING", true),
        },
        { type: "separator" },
        {
          label: i18n.tc("menu.take_survey", 1),
          click() {
            open("https://testfiesta.com/pinata-survey/", (err) => {
              console.log(err);
            });
          },
        },
        { type: "separator" },
        {
          label: i18n.t("menu.exit"),
          accelerator: "Alt+F4",
          click: () => app.quit(),
        },
      ],
    },
    {
      label: i18n.t("menu.edit"),
      submenu: [
        {
          label: i18n.t("menu.undo"),
          accelerator: "CmdOrCtrl+Z",
          role: "undo",
        },
        {
          label: i18n.t("menu.redo"),
          accelerator: "CmdOrCtrl+Y",
          role: "redo",
        },
        { type: "separator" },
        { label: i18n.t("menu.cut"), accelerator: "CmdOrCtrl+X", role: "cut" },
        {
          label: i18n.t("menu.copy"),
          accelerator: "CmdOrCtrl+C",
          role: "copy",
        },
        {
          label: i18n.t("menu.paste"),
          accelerator: "CmdOrCtrl+V",
          role: "paste",
        },
        {
          label: i18n.t("menu.select_all"),
          accelerator: "CmdOrCtrl+A",
          role: "selectAll",
        },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: i18n.t("menu.online_doc"),
          click() {
            open("https://docs.testfiesta.com/", (err) => {
              console.log(err);
            });
          },
        },
        {
          label: i18n.t("menu.get_support"),
          click() {
            open("https://github.com/dacoaster/pinata/issues/", (err) => {
              console.log(err);
            });
          },
        },
        //{
        //  label: i18n.t("menu.check_update"),
        //  click() {
        //    open('', (err) => {
        //      console.log(err);
        //    });
        //  }
        //},
        {
          label: i18n.t("menu.about"),
          click: () => win.webContents.send("ABOUT_DIALOG", app.getVersion()),
        },
      ],
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

export default createMenu;
