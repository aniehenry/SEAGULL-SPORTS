import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import partyController from "../controllers/partyController";
import "./PartyManagement.css";

const PartyManagement = () => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await partyController.fetchParties();
      if (result.success) {
        setParties(result.data);
      } else {
        setError(result.error);
      }
    } catch {
      setError("Failed to fetch parties");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (partyId) => {
    if (window.confirm("Are you sure you want to delete this party?")) {
      const result = await partyController.deleteParty(partyId);
      if (result.success) {
        setParties(parties.filter((party) => party.id !== partyId));
      } else {
        alert("Failed to delete party: " + result.error);
      }
    }
  };

  const filteredParties = parties.filter((party) => {
    const matchesFilter = filter === "All" || party.partyType === filter;
    const matchesSearch =
      searchQuery === "" ||
      party.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      party.phone.includes(searchQuery) ||
      party.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN");
  };

  return (
    <div className="party-management">
      <div className="filter-section">
        <button
          className={`filter-btn ${filter === "All" ? "active" : ""}`}
          onClick={() => setFilter("All")}
        >
          All ({parties.length})
        </button>
        <button
          className={`filter-btn ${filter === "Customer" ? "active" : ""}`}
          onClick={() => setFilter("Customer")}
        >
          Customers ({parties.filter((p) => p.partyType === "Customer").length})
        </button>
        <button
          className={`filter-btn ${filter === "Vendor" ? "active" : ""}`}
          onClick={() => setFilter("Vendor")}
        >
          Vendors ({parties.filter((p) => p.partyType === "Vendor").length})
        </button>
        <input
          type="text"
          className="search-input"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <button
        className="floating-add-btn"
        onClick={() => navigate("/admin/parties/add")}
      >
        + Add
      </button>

      {loading ? (
        <div className="loading">Loading parties...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="table-container">
          <table className="party-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Type</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParties.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    No parties found. Click "+ Add" to create one.
                  </td>
                </tr>
              ) : (
                filteredParties.map((party) => (
                  <tr key={party.id}>
                    <td className="party-name">{party.name}</td>
                    <td>{party.phone}</td>
                    <td className="party-address">{party.address}</td>
                    <td>
                      <span
                        className={`party-badge ${party.partyType.toLowerCase()}`}
                      >
                        {party.partyType}
                      </span>
                    </td>
                    <td>{formatDate(party.createdAt)}</td>
                    <td className="actions">
                      <button
                        className="btn-edit"
                        onClick={() =>
                          navigate(`/admin/parties/edit/${party.id}`)
                        }
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(party.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PartyManagement;
