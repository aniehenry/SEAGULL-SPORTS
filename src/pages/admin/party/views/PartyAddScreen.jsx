import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import partyController from "../controllers/partyController";
import partyService from "../services/partyService";
import "./PartyAddScreen.css";

const PartyAddScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    gstNumber: "",
    panNumber: "",
    partyType: "Customer",
    address: "",
    pincode: "",
    city: "",
    state: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingParty, setFetchingParty] = useState(false);

  const fetchParty = useCallback(async () => {
    setFetchingParty(true);
    try {
      const party = await partyService.getPartyById(id);
      if (party) {
        setFormData({
          name: party.name || "",
          phone: party.phone || "",
          email: party.email || "",
          gstNumber: party.gstNumber || "",
          panNumber: party.panNumber || "",
          partyType: party.partyType || "Customer",
          address: party.address || "",
          pincode: party.pincode || "",
          city: party.city || "",
          state: party.state || "",
        });
      } else {
        alert("Party not found");
        navigate("/admin/parties");
      }
    } catch {
      alert("Failed to fetch party");
      navigate("/admin/parties");
    } finally {
      setFetchingParty(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (isEditMode) {
      fetchParty();
    }
  }, [isEditMode, fetchParty]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Client-side validation
    const newErrors = {};

    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Party name is required";
    }

    if (!formData.phone || formData.phone.trim() === "") {
      newErrors.phone = "Mobile number is required";
    } else if (
      formData.phone.length !== 10 ||
      !/^\d{10}$/.test(formData.phone)
    ) {
      newErrors.phone = "Mobile number must be exactly 10 digits";
    }

    if (!formData.email || formData.email.trim() === "") {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.partyType) {
      newErrors.partyType = "Party type is required";
    }

    // If there are validation errors, stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      let result;
      if (isEditMode) {
        result = await partyController.updateParty(id, formData);
      } else {
        result = await partyController.createParty(formData);
      }

      if (result.success) {
        navigate("/admin/parties");
      } else if (result.errors) {
        setErrors(result.errors);
      } else {
        alert(result.error || "Failed to save party");
      }
    } catch {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingParty) {
    return (
      <div className="party-add-screen">
        <div className="loading">Loading party details...</div>
      </div>
    );
  }

  return (
    <div className="party-add-screen">
      <button className="back-btn" onClick={() => navigate("/admin/parties")}>
        ← {isEditMode ? "Edit Party" : "Create Party"}
      </button>

      <div className="header-actions">
        <button
          type="button"
          className="btn-outline"
          onClick={handleSubmit}
          disabled={loading}
        >
          Save & New
        </button>
        <button
          type="submit"
          className="btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="party-form">
          {/* General Details */}
          <div className="section-header">General Details</div>

          <div className="form-row-3">
            <div className="form-group">
              <label htmlFor="name">
                Party Name<span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "error" : ""}
                placeholder="Enter name"
                required
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                Mobile Number<span className="required">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? "error" : ""}
                placeholder="Enter mobile number"
                maxLength="10"
                required
              />
              {errors.phone && (
                <span className="error-text">{errors.phone}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email<span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
                placeholder="Enter email"
                required
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="gstNumber">
                GSTIN <span className="optional">(Optional)</span>
              </label>
              <input
                type="text"
                id="gstNumber"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                className={errors.gstNumber ? "error" : ""}
                placeholder="ex: 29XXXXX9438X1XX"
                maxLength="15"
              />
              <small className="field-note">
                Note: You can auto populate party details from GSTIN
              </small>
              {errors.gstNumber && (
                <span className="error-text">{errors.gstNumber}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="panNumber">
                PAN Number <span className="optional">(Optional)</span>
              </label>
              <input
                type="text"
                id="panNumber"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                className={errors.panNumber ? "error" : ""}
                placeholder="Enter party PAN Number"
                maxLength="10"
              />
              {errors.panNumber && (
                <span className="error-text">{errors.panNumber}</span>
              )}
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="partyType">
                Party Type<span className="required">*</span>
              </label>
              <select
                id="partyType"
                name="partyType"
                value={formData.partyType}
                onChange={handleChange}
                className={errors.partyType ? "error" : ""}
                required
              >
                <option value="Customer">Customer</option>
                <option value="Vendor">Vendor</option>
              </select>
              {errors.partyType && (
                <span className="error-text">{errors.partyType}</span>
              )}
            </div>
          </div>

          {/* Address Section */}
          <div className="section-header">Address</div>

          <div className="form-group">
            <label htmlFor="address">
              Address <span className="optional">(Optional)</span>
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={errors.address ? "error" : ""}
              placeholder="Enter address"
              rows="3"
            />
            {errors.address && (
              <span className="error-text">{errors.address}</span>
            )}
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label htmlFor="pincode">
                Pincode <span className="optional">(Optional)</span>
              </label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className={errors.pincode ? "error" : ""}
                placeholder="Enter pincode"
                maxLength="6"
              />
              {errors.pincode && (
                <span className="error-text">{errors.pincode}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="city">
                City <span className="optional">(Optional)</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={errors.city ? "error" : ""}
                placeholder="Enter city"
              />
              {errors.city && <span className="error-text">{errors.city}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="state">
                State <span className="optional">(Optional)</span>
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={errors.state ? "error" : ""}
                placeholder="Enter state"
              />
              {errors.state && (
                <span className="error-text">{errors.state}</span>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartyAddScreen;
