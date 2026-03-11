import invoiceService from "../services/invoiceService";
import Invoice from "../models/Invoice";

const invoiceController = {
  async fetchInvoices() {
    try {
      const invoices = await invoiceService.getAllInvoices();
      return { success: true, data: invoices };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createInvoice(invoiceData) {
    try {
      const invoice = new Invoice(invoiceData);
      const validation = invoice.validate();

      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      const invoiceId = await invoiceService.addInvoice(invoiceData);
      return { success: true, data: invoiceId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateInvoice(invoiceId, invoiceData) {
    try {
      const invoice = new Invoice(invoiceData);
      const validation = invoice.validate();

      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      await invoiceService.updateInvoice(invoiceId, invoiceData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteInvoice(invoiceId) {
    try {
      await invoiceService.deleteInvoice(invoiceId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default invoiceController;
