import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import itemController from "../controllers/itemController";
import itemService from "../services/itemService";
import "./ItemAddScreen.css";

// Configure Cloudinary
const CLOUDINARY_CONFIG = {
  cloudName: "dwhjwkopp",
  uploadPreset: "seagull_items", // You need to create this preset in Cloudinary
  apiKey: "755862577596328", // Your API key from the screenshot
};

const ItemAddScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    size: "",
    color: "",
    material: "",
    weight: "",
    stockQuantity: "",
    purchasePrice: "",
    sellingPrice: "",
    gstPercentage: "",
    description: "",
    images: [], // Array of image URLs
  });

  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      if (isEditMode) {
        try {
          const item = await itemService.getItemById(id);
          if (item) {
            setFormData({
              name: item.name || "",
              category: item.category || "",
              brand: item.brand || "",
              size: item.size || "",
              color: item.color || "",
              material: item.material || "",
              weight: item.weight || "",
              stockQuantity: item.stockQuantity || "",
              purchasePrice: item.purchasePrice || "",
              sellingPrice: item.sellingPrice || "",
              gstPercentage: item.gstPercentage || "",
              description: item.description || "",
              images: item.images || [],
            });
          }
        } catch (error) {
          console.error("Error fetching item:", error);
        }
      }
    };
    fetchItem();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle image upload to Cloudinary
  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB limit

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        alert(
          `Invalid file type: ${file.name}. Please upload JPEG, PNG, or WebP images.`,
        );
        return;
      }
      if (file.size > maxSize) {
        alert(`File too large: ${file.name}. Maximum size is 5MB.`);
        return;
      }
    }

    setUploading(true);
    const uploadedImages = [];
    let errorCount = 0;

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
        formData.append("cloud_name", CLOUDINARY_CONFIG.cloudName);
        formData.append("folder", "seagull-sports/items"); // Organize in folders

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (response.ok) {
          const data = await response.json();
          uploadedImages.push({
            url: data.secure_url,
            public_id: data.public_id,
            originalName: file.name,
            width: data.width,
            height: data.height,
          });
          console.log("✅ Image uploaded:", data.secure_url);
        } else {
          errorCount++;
          console.error("❌ Upload failed for:", file.name);
        }
      }

      if (uploadedImages.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedImages],
        }));

        const successMsg = `${uploadedImages.length} image(s) uploaded successfully!`;
        const errorMsg =
          errorCount > 0 ? ` ${errorCount} upload(s) failed.` : "";
        alert(successMsg + errorMsg);
      } else {
        alert("All uploads failed. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      alert(
        "Failed to upload images. Please check your connection and try again.",
      );
    } finally {
      setUploading(false);
      // Clear the file input
      event.target.value = "";
    }
  };

  // Remove image from the list
  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Item name is required";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }

    if (!formData.stockQuantity.trim()) {
      newErrors.stockQuantity = "Stock quantity is required";
    } else if (
      isNaN(formData.stockQuantity) ||
      Number(formData.stockQuantity) < 0
    ) {
      newErrors.stockQuantity = "Stock quantity must be a non-negative number";
    }

    if (!formData.purchasePrice.trim()) {
      newErrors.purchasePrice = "Purchase price is required";
    } else if (
      isNaN(formData.purchasePrice) ||
      Number(formData.purchasePrice) <= 0
    ) {
      newErrors.purchasePrice = "Purchase price must be greater than 0";
    }

    if (!formData.sellingPrice.trim()) {
      newErrors.sellingPrice = "Selling price is required";
    } else if (
      isNaN(formData.sellingPrice) ||
      Number(formData.sellingPrice) <= 0
    ) {
      newErrors.sellingPrice = "Selling price must be greater than 0";
    }

    if (!formData.gstPercentage.trim()) {
      newErrors.gstPercentage = "GST percentage is required";
    } else if (
      isNaN(formData.gstPercentage) ||
      Number(formData.gstPercentage) < 0 ||
      Number(formData.gstPercentage) > 100
    ) {
      newErrors.gstPercentage = "GST percentage must be between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (saveAndNew = false) => {
    if (!validateForm()) {
      return;
    }

    try {
      const itemData = {
        ...formData,
        stockQuantity: Number(formData.stockQuantity),
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice),
        gstPercentage: Number(formData.gstPercentage),
      };

      if (isEditMode) {
        const result = await itemController.updateItem(id, itemData);
        if (result.success) {
          alert("Item updated successfully!");
          navigate("/admin/items");
        } else {
          alert(result.error || "Failed to update item");
        }
      } else {
        const result = await itemController.createItem(itemData);
        if (result.success) {
          alert("Item added successfully!");
          if (saveAndNew) {
            setFormData({
              name: "",
              category: "",
              stockQuantity: "",
              purchasePrice: "",
              sellingPrice: "",
              gstPercentage: "",
              description: "",
              images: [],
            });
            setErrors({});
          } else {
            navigate("/admin/items");
          }
        } else {
          alert(result.error || "Failed to add item");
        }
      }
    } catch (error) {
      console.error("Error saving item:", error);
      alert("An error occurred while saving the item");
    }
  };

  return (
    <div className="item-add-screen">
      <button className="back-btn" onClick={() => navigate("/admin/items")}>
        ← {isEditMode ? "Edit Item" : "Create Item"}
      </button>

      <div className="header-actions">
        {!isEditMode && (
          <button
            type="button"
            className="btn-outline"
            onClick={() => handleSubmit(true)}
          >
            Save & New
          </button>
        )}
        <button
          type="button"
          className="btn-primary"
          onClick={() => handleSubmit(false)}
        >
          Save
        </button>
      </div>

      <div className="form-container">
        <form className="item-form">
          {/* General Details */}
          <div className="section-header">Item Details</div>

          <div className="form-row-3">
            <div className="form-group">
              <label htmlFor="name">
                Item Name<span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "error" : ""}
                placeholder="Enter item name"
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="category">
                Category<span className="required">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category ? "error" : ""}
              >
                <option value="">Select category</option>
                <option value="Cricket">Cricket</option>
                <option value="Football">Football</option>
                <option value="Basketball">Basketball</option>
                <option value="Tennis">Tennis</option>
                <option value="Badminton">Badminton</option>
                <option value="Swimming">Swimming</option>
                <option value="Running">Running</option>
                <option value="Cycling">Cycling</option>
                <option value="Gym/Fitness">Gym/Fitness</option>
                <option value="Yoga">Yoga</option>
                <option value="Team Sports">Team Sports</option>
                <option value="Outdoor Sports">Outdoor Sports</option>
                <option value="Water Sports">Water Sports</option>
                <option value="Winter Sports">Winter Sports</option>
                <option value="Sports Accessories">Sports Accessories</option>
                <option value="Sports Nutrition">Sports Nutrition</option>
              </select>
              {errors.category && (
                <span className="error-text">{errors.category}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="brand">Brand</label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Enter brand name"
              />
            </div>
          </div>

          {/* Sports Specific Details */}
          <div className="section-header">Sports Details</div>

          <div className="form-row-3">
            <div className="form-group">
              <label htmlFor="size">Size</label>
              <input
                type="text"
                id="size"
                name="size"
                value={formData.size}
                onChange={handleChange}
                placeholder="Enter size (e.g., XL, 42, 10)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="color">Color</label>
              <input
                type="text"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="Enter color"
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="material">Material</label>
              <input
                type="text"
                id="material"
                name="material"
                value={formData.material}
                onChange={handleChange}
                placeholder="Enter material (e.g., Cotton, Polyester, Leather)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="weight">Weight</label>
              <input
                type="text"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="Enter weight (e.g., 500g, 1.2kg)"
              />
            </div>
          </div>

          {/* Inventory & Pricing */}
          <div className="section-header">Inventory & Pricing</div>

          <div className="form-row-3">
            <div className="form-group">
              <label htmlFor="stockQuantity">
                Stock Quantity<span className="required">*</span>
              </label>
              <input
                type="number"
                id="stockQuantity"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                className={errors.stockQuantity ? "error" : ""}
                placeholder="Enter stock quantity"
                min="0"
              />
              {errors.stockQuantity && (
                <span className="error-text">{errors.stockQuantity}</span>
              )}
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="purchasePrice">
                Purchase Price<span className="required">*</span>
              </label>
              <input
                type="number"
                id="purchasePrice"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                className={errors.purchasePrice ? "error" : ""}
                placeholder="Enter purchase price"
                min="0"
                step="0.01"
              />
              {errors.purchasePrice && (
                <span className="error-text">{errors.purchasePrice}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="sellingPrice">
                Selling Price<span className="required">*</span>
              </label>
              <input
                type="number"
                id="sellingPrice"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                className={errors.sellingPrice ? "error" : ""}
                placeholder="Enter selling price"
                min="0"
                step="0.01"
              />
              {errors.sellingPrice && (
                <span className="error-text">{errors.sellingPrice}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="gstPercentage">
                GST %<span className="required">*</span>
              </label>
              <input
                type="number"
                id="gstPercentage"
                name="gstPercentage"
                value={formData.gstPercentage}
                onChange={handleChange}
                className={errors.gstPercentage ? "error" : ""}
                placeholder="Enter GST percentage"
                min="0"
                max="100"
                step="0.01"
              />
              {errors.gstPercentage && (
                <span className="error-text">{errors.gstPercentage}</span>
              )}
            </div>
          </div>

          {/* Price Summary */}
          {(formData.purchasePrice ||
            formData.sellingPrice ||
            formData.gstPercentage) && (
            <div className="price-summary">
              <div className="summary-header">Price Summary</div>
              <div className="summary-content">
                <div className="summary-row">
                  <span className="summary-label">Purchase Price (Base):</span>
                  <span className="summary-value">
                    ₹{Number(formData.purchasePrice || 0).toFixed(2)}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Selling Price (Base):</span>
                  <span className="summary-value">
                    ₹{Number(formData.sellingPrice || 0).toFixed(2)}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">GST Amount:</span>
                  <span className="summary-value">
                    ₹
                    {(
                      (Number(formData.sellingPrice || 0) *
                        Number(formData.gstPercentage || 0)) /
                      100
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="summary-row highlight">
                  <span className="summary-label">
                    Total Selling Price (Inc. GST):
                  </span>
                  <span className="summary-value">
                    ₹
                    {(
                      Number(formData.sellingPrice || 0) +
                      (Number(formData.sellingPrice || 0) *
                        Number(formData.gstPercentage || 0)) /
                        100
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="summary-row profit">
                  <span className="summary-label">Profit per Unit:</span>
                  <span className="summary-value">
                    ₹
                    {(
                      Number(formData.sellingPrice || 0) -
                      Number(formData.purchasePrice || 0)
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="summary-row profit">
                  <span className="summary-label">Profit Margin:</span>
                  <span className="summary-value">
                    {formData.sellingPrice &&
                    formData.purchasePrice &&
                    Number(formData.purchasePrice) > 0
                      ? (
                          ((Number(formData.sellingPrice) -
                            Number(formData.purchasePrice)) /
                            Number(formData.purchasePrice)) *
                          100
                        ).toFixed(2)
                      : "0.00"}
                    %
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="description">
              Description <span className="optional">(Optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter item description"
              rows="4"
            />
          </div>

          {/* Image Upload Section */}
          <div className="section-header">Product Images</div>
          <div className="image-upload-section">
            <div className="form-group">
              <label htmlFor="images">
                Upload Images <span className="optional">(Optional)</span>
              </label>
              <div className="file-input-container">
                <input
                  type="file"
                  id="images"
                  name="images"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="file-input"
                />
                <div className="file-input-help">
                  <small>
                    📝 Supported formats: JPEG, PNG, WebP • Max size: 5MB per
                    image • Multiple images allowed
                  </small>
                </div>
              </div>
              {uploading && (
                <div className="upload-status">
                  <div className="upload-spinner"></div>
                  Uploading images to Cloudinary...
                </div>
              )}
            </div>

            {/* Display uploaded images */}
            {formData.images.length > 0 && (
              <div className="uploaded-images">
                <h4>Uploaded Images ({formData.images.length})</h4>
                <div className="images-grid">
                  {formData.images.map((image, index) => (
                    <div key={index} className="image-preview">
                      <img
                        src={image.url}
                        alt={`Product ${index + 1}`}
                        className="preview-img"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                        title="Remove image"
                      >
                        ×
                      </button>
                      <div className="image-info">
                        <div className="image-name" title={image.originalName}>
                          {image.originalName}
                        </div>
                        {image.width && image.height && (
                          <div className="image-dimensions">
                            {image.width} × {image.height}px
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemAddScreen;
