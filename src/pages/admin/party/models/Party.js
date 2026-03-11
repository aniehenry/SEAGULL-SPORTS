// Party Model
export class Party {
  constructor(data) {
    this.id = data.id || null;
    this.name = data.name || "";
    this.phone = data.phone || "";
    this.address = data.address || "";
    this.partyType = data.partyType || "Customer"; // Customer or Vendor
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toFirestore() {
    return {
      name: this.name,
      phone: this.phone,
      address: this.address,
      partyType: this.partyType,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Party({
      id: doc.id,
      ...data,
    });
  }

  validate() {
    const errors = {};

    if (!this.name || this.name.trim() === "") {
      errors.name = "Name is required";
    }

    if (!this.phone || this.phone.trim() === "") {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(this.phone.replace(/\D/g, ""))) {
      errors.phone = "Phone number must be 10 digits";
    }

    if (!this.address || this.address.trim() === "") {
      errors.address = "Address is required";
    }

    if (!["Customer", "Vendor"].includes(this.partyType)) {
      errors.partyType = "Party type must be Customer or Vendor";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
