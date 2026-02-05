import purchaseService from "../services/purchaseService";

const purchaseController = {
  async fetchPurchases() {
    try {
      const purchases = await purchaseService.getAllPurchases();
      return { success: true, data: purchases };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createPurchase(purchaseData) {
    try {
      const purchaseId = await purchaseService.addPurchase(purchaseData);
      return { success: true, data: purchaseId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updatePurchase(purchaseId, purchaseData) {
    try {
      await purchaseService.updatePurchase(purchaseId, purchaseData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deletePurchase(purchaseId) {
    try {
      await purchaseService.deletePurchase(purchaseId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default purchaseController;
