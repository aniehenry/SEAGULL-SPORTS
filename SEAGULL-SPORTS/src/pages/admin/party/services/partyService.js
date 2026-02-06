import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "../../../../firebasecongif";

class PartyService {
  // Get the parties collection reference for the current admin user
  getPartiesCollectionRef() {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error("User not authenticated");
    }
    return collection(db, "Admin", userId, "parties");
  }

  // Get all parties
  async getAllParties() {
    try {
      const partiesRef = this.getPartiesCollectionRef();
      const q = query(partiesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching parties:", error);
      throw error;
    }
  }

  // Get a single party by ID
  async getPartyById(partyId) {
    try {
      const partiesRef = this.getPartiesCollectionRef();
      const partyDoc = await getDoc(doc(partiesRef, partyId));

      if (partyDoc.exists()) {
        return {
          id: partyDoc.id,
          ...partyDoc.data(),
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching party:", error);
      throw error;
    }
  }

  // Add a new party
  async addParty(partyData) {
    try {
      const partiesRef = this.getPartiesCollectionRef();
      const newParty = {
        ...partyData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(partiesRef, newParty);
      return {
        id: docRef.id,
        ...newParty,
      };
    } catch (error) {
      console.error("Error adding party:", error);
      throw error;
    }
  }

  // Update an existing party
  async updateParty(partyId, partyData) {
    try {
      const partiesRef = this.getPartiesCollectionRef();
      const partyRef = doc(partiesRef, partyId);

      const updateData = {
        ...partyData,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(partyRef, updateData);
      return {
        id: partyId,
        ...updateData,
      };
    } catch (error) {
      console.error("Error updating party:", error);
      throw error;
    }
  }

  // Delete a party
  async deleteParty(partyId) {
    try {
      const partiesRef = this.getPartiesCollectionRef();
      const partyRef = doc(partiesRef, partyId);
      await deleteDoc(partyRef);
      return true;
    } catch (error) {
      console.error("Error deleting party:", error);
      throw error;
    }
  }

  // Get parties by type
  async getPartiesByType(partyType) {
    try {
      const allParties = await this.getAllParties();
      return allParties.filter((party) => party.partyType === partyType);
    } catch (error) {
      console.error("Error fetching parties by type:", error);
      throw error;
    }
  }
}

export default new PartyService();
