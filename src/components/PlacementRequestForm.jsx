import React, { useState, useEffect } from "react";
import Select from "react-select";
import { getSpecializations, getDomains, submitPlacementRequest } from "./../utils/api";
import "./PlacementRequestForm.css";

export default function PlacementRequestForm() {
  const [organization, setOrganization] = useState("");
  const [profile, setProfile] = useState("");
  const [description, setDescription] = useState("");
  const [intake, setIntake] = useState("");
  const [minimumGrade, setMinimumGrade] = useState("");
  const [specializationIds, setSpecializationIds] = useState([]);
  const [domainIds, setDomainIds] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [domains, setDomains] = useState([]);
  const [responseMessage, setResponseMessage] = useState("");
  const [isResponseVisible, setIsResponseVisible] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setResponseMessage("You are not authenticated.");
      return;
    }

    getSpecializations(token)
      .then((specializations) => setSpecializations(specializations))
      .catch((error) => console.error("Error fetching specializations:", error));

    getDomains(token)
      .then((domains) => setDomains(domains))
      .catch((error) => console.error("Error fetching domains:", error));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      setResponseMessage("You are not authenticated.");
      setIsResponseVisible(true);
      return;
    }

    if (!organization || !profile || !description) {
      setResponseMessage("Please fill out all required fields.");
      setIsResponseVisible(true);
      return;
    }

    const parsedIntake = parseInt(intake);
    const parsedMinimumGrade = parseFloat(minimumGrade);

    if (parsedMinimumGrade < 0 || parsedMinimumGrade > 4) {
      setResponseMessage("Minimum Grade (CGPA) must be between 0 and 4.");
      setIsResponseVisible(true);
      return;
    }

    const placementRequest = {
      organization,
      profile,
      description,
      intake: parsedIntake,
      minimumGrade: parsedMinimumGrade,
      specialization_id: specializationIds.map((id) => parseInt(id.value)),
      domain_id: domainIds.map((id) => parseInt(id.value)),
    };

    submitPlacementRequest(placementRequest, token)
      .then(() => {
        setResponseMessage("Placement request submitted successfully!");
        setIsResponseVisible(true);

        setOrganization("");
        setProfile("");
        setDescription("");
        setIntake("");
        setMinimumGrade("");
        setSpecializationIds([]);
        setDomainIds([]);
      })
      .catch((error) => {
        console.error("Error submitting placement request:", error);
        setResponseMessage("Failed to submit placement request.");
        setIsResponseVisible(true);
      });
  };

  return (
    <div>
      {/* Navbar */}
      <div className="navbar">
        <div className="logo">SuperSet</div>
        <ul className="nav-links">
          <li><a href="/login" onClick={() => localStorage.removeItem("token")}>Logout</a></li>
        </ul>
      </div>

      {/* Background and Form */}
      <div className="background-container">
        <div className="form-container">
          <h3>Placement Opportunity Portal</h3>
          {isResponseVisible && (
            <div className="response-message">{responseMessage}</div>
          )}
          <form onSubmit={handleSubmit} className="placement-form">
            <label>
              Organization
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Enter organization name"
              />
            </label>
            <label>
              Profile
              <input
                type="text"
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                placeholder="Enter profile"
              />
            </label>
            <label>
              Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
              ></textarea>
            </label>
            <div className="row">
              <label>
                Intake
                <input
                  type="number"
                  value={intake}
                  onChange={(e) => setIntake(e.target.value)}
                  placeholder="Enter intake"
                />
              </label>
              <label>
                Minimum Grade (CGPA)
                <input
                  type="number"
                  step="0.01"
                  value={minimumGrade}
                  onChange={(e) => setMinimumGrade(e.target.value)}
                  placeholder="Enter minimum grade (0-4)"
                />
              </label>
            </div>
            <div className="row">
              <label>
                Specializations
                <Select
                  isMulti
                  options={specializations}
                  value={specializationIds}
                  onChange={setSpecializationIds}
                  classNamePrefix="react-select"
                />
              </label>
              <label>
                Domains
                <Select
                  isMulti
                  options={domains}
                  value={domainIds}
                  onChange={setDomainIds}
                  classNamePrefix="react-select"
                />
              </label>
            </div>
            <button type="submit" className="submit-button">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
