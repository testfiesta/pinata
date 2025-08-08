const { Menu } = require("electron");

const { SESSION_STATUSES } = require("./constants");

module.exports.changeMenuItemStatus = ({ sessionStatus }) => {
  const mainMenu = Menu.getApplicationMenu();
  const fileMenu = mainMenu.items.find((item) => item.id === "menu_file");
  const fileSubMenus = fileMenu.submenu.items;

  if (sessionStatus === SESSION_STATUSES.PENDING) {
    fileSubMenus.find(
      (item) => item.id === "menu_save_session"
    ).enabled = false;
    // fileSubMenus.find(
    //   (item) => item.id === "menu_save_as_charter"
    // ).enabled = false;
    fileSubMenus.find(
      (item) => item.id === "menu_reset_session"
    ).enabled = false;
  } else {
    fileSubMenus.find((item) => item.id === "menu_save_session").enabled = true;
    // fileSubMenus.find(
    //   (item) => item.id === "menu_save_as_charter"
    // ).enabled = true;
    fileSubMenus.find(
      (item) => item.id === "menu_reset_session"
    ).enabled = true;
  }
};
