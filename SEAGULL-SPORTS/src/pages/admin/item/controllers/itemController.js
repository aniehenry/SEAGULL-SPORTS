import itemService from "../services/itemService";
import Item from "../models/Item";

const itemController = {
  async fetchItems() {
    try {
      const items = await itemService.getAllItems();
      return { success: true, data: items };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createItem(itemData) {
    try {
      const item = new Item(itemData);
      const validation = item.validate();

      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      const itemId = await itemService.addItem(itemData);
      return { success: true, data: itemId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateItem(itemId, itemData) {
    try {
      const item = new Item(itemData);
      const validation = item.validate();

      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      await itemService.updateItem(itemId, itemData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteItem(itemId) {
    try {
      await itemService.deleteItem(itemId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default itemController;
