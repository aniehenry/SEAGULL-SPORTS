import partyService from "../services/partyService";
import { Party } from "../models/Party";

class PartyController {
  // Fetch all parties
  async fetchParties() {
    try {
      const parties = await partyService.getAllParties();
      return { success: true, data: parties };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Add a new party
  async createParty(partyData) {
    try {
      // Create and validate party model
      const party = new Party(partyData);
      const validation = party.validate();

      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      const newParty = await partyService.addParty(party.toFirestore());
      return { success: true, data: newParty };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update an existing party
  async updateParty(partyId, partyData) {
    try {
      // Create and validate party model
      const party = new Party(partyData);
      const validation = party.validate();

      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      const updatedParty = await partyService.updateParty(
        partyId,
        party.toFirestore(),
      );
      return { success: true, data: updatedParty };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Delete a party
  async deleteParty(partyId) {
    try {
      await partyService.deleteParty(partyId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get parties by type
  async fetchPartiesByType(partyType) {
    try {
      const parties = await partyService.getPartiesByType(partyType);
      return { success: true, data: parties };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new PartyController();
