import paymentService from "../services/paymentService";

const paymentController = {
  async fetchPayments() {
    try {
      const payments = await paymentService.getAllPayments();
      return { success: true, data: payments };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createPayment(paymentData) {
    try {
      const paymentId = await paymentService.addPayment(paymentData);
      return { success: true, data: paymentId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deletePayment(paymentId) {
    try {
      await paymentService.deletePayment(paymentId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default paymentController;
