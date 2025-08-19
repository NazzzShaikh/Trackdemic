"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { facultyAPI } from "../../services/api"
import { toast } from "react-toastify"

const FacultyProfile = () => {
  const { user, updateProfile } = useAuth()
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    bio: "",
    designation: "",
    educationalQualifications: "",
    certificationsAwards: "",
    degreeCertificate: null,
    subjectExpertise: ""
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const designationOptions = [
    "Professor",
    "Lecturer", 
    "Adjunct Faculty",
    "Assistant Professor"
  ]

  // Function to test backend connectivity
  const testBackendConnection = async () => {
    try {
      const response = await facultyAPI.getProfile()
      return true
    } catch (error) {
      console.error("Backend connection test failed:", error)
      return false
    }
  }

  // Function to load profile data from backend
  const loadProfileFromBackend = async () => {
    setRefreshing(true)
    try {
      // Use the faculty profile endpoint
      const response = await facultyAPI.getProfile()
      if (response.data) {
        const backendData = response.data
        setProfile(prev => ({
          ...prev,
          firstName: backendData.user?.first_name || backendData.user?.firstName || "",
          lastName: backendData.user?.last_name || backendData.user?.lastName || "",
          email: backendData.user?.email || "",
          phoneNumber: backendData.user?.phone_number || backendData.user?.phoneNumber || "",
          dateOfBirth: backendData.user?.date_of_birth || backendData.user?.dateOfBirth || "",
          bio: backendData.user?.bio || "",
          designation: backendData.designation || "",
          educationalQualifications: backendData.educational_qualifications || backendData.educationalQualifications || "",
          certificationsAwards: backendData.certifications_awards || backendData.certificationsAwards || "",
          subjectExpertise: backendData.subject_expertise || backendData.subjectExpertise || ""
        }))
        toast.success("Profile refreshed from server!")
        return true
      }
    } catch (error) {
      console.error("Failed to load profile from backend:", error)
      toast.error("Failed to refresh profile from server")
      return false
    } finally {
      setRefreshing(false)
    }
    return false
  }

  // Function to reset form after successful submission
  const resetForm = () => {
    setProfile({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      dateOfBirth: "",
      bio: "",
      designation: "",
      educationalQualifications: "",
      certificationsAwards: "",
      degreeCertificate: null,
      subjectExpertise: ""
    })
  }

  useEffect(() => {
    // Load existing profile data from backend, localStorage, and user data
    const loadProfileData = async () => {
      if (user) {
        // Try to load from backend first
        const backendLoaded = await loadProfileFromBackend()
        
        if (!backendLoaded) {
          // If backend fails, try localStorage
          const savedProfile = localStorage.getItem('facultyProfile')
          if (savedProfile) {
            try {
              const parsedProfile = JSON.parse(savedProfile)
              setProfile(prev => ({
                ...prev,
                ...parsedProfile,
                email: user.email || parsedProfile.email || ""
              }))
            } catch (error) {
              console.error('Error parsing saved profile:', error)
            }
          } else {
            // Load from user data if available
            setProfile(prev => ({
              ...prev,
              firstName: user.first_name || user.firstName || "",
              lastName: user.last_name || user.lastName || "",
              email: user.email || "",
              phoneNumber: user.phone_number || user.phoneNumber || "",
              dateOfBirth: user.date_of_birth || user.dateOfBirth || "",
              bio: user.bio || "",
              designation: user.designation || "",
              educationalQualifications: user.educational_qualifications || user.educationalQualifications || "",
              certificationsAwards: user.certifications_awards || user.certificationsAwards || "",
              subjectExpertise: user.subject_expertise || user.subjectExpertise || ""
            }))
          }
        }
      }
    }

    loadProfileData()
    
    // Cleanup function to clear profile data when user changes
    return () => {
      if (!user) {
        localStorage.removeItem('facultyProfile')
      }
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type === "application/pdf") {
      setProfile(prev => ({
        ...prev,
        degreeCertificate: file
      }))
    } else {
      toast.error("Please select a valid PDF file")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!profile.firstName.trim() || !profile.lastName.trim() || !profile.email.trim() || !profile.designation) {
      toast.error("Please fill in all required fields (First Name, Last Name, Email, and Designation)")
      return
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(profile.email)) {
      toast.error("Please enter a valid email address")
      return
    }
    
    setLoading(true)
    
    console.log("Submitting faculty profile:", profile)
    
    try {
      // Save to localStorage immediately for backup
      const profileToSave = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        dateOfBirth: profile.dateOfBirth,
        bio: profile.bio,
        designation: profile.designation,
        educationalQualifications: profile.educationalQualifications,
        certificationsAwards: profile.certificationsAwards,
        subjectExpertise: profile.subjectExpertise
      }
      
      localStorage.setItem('facultyProfile', JSON.stringify(profileToSave))
      console.log("Saved to localStorage as backup:", profileToSave)
      
      // Prepare data for backend (send all fields to faculty profile endpoint)
      const backendData = {
        first_name: profile.firstName,
        last_name: profile.lastName,
        email: profile.email,
        phone_number: profile.phoneNumber,
        date_of_birth: profile.dateOfBirth,
        bio: profile.bio,
        designation: profile.designation,
        educational_qualifications: profile.educationalQualifications,
        certifications_awards: profile.certificationsAwards,
        subject_expertise: profile.subjectExpertise
      }
      
      console.log("Sending to backend:", backendData)
      console.log("All faculty profile data will be saved to database!")
      
      // Try to send to backend using the faculty profile API
      try {
        console.log("Attempting to update faculty profile with data:", backendData)
        
        // Use the faculty profile update API
        const response = await facultyAPI.updateProfile(backendData)
        console.log("Backend response:", response)
        
        if (response.data) {
          toast.success("Faculty profile updated successfully in database!")
          console.log("Profile update successful, faculty data:", response.data)
          
          // Also save the updated data to localStorage as backup
          const updatedProfileToSave = {
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            phoneNumber: profile.phoneNumber,
            dateOfBirth: profile.dateOfBirth,
            bio: profile.bio,
            designation: profile.designation,
            educationalQualifications: profile.educationalQualifications,
            certificationsAwards: profile.certificationsAwards,
            subjectExpertise: profile.subjectExpertise
          }
          localStorage.setItem('facultyProfile', JSON.stringify(updatedProfileToSave))
        }
      } catch (backendError) {
        console.error("Backend update failed:", backendError)
        console.error("Error details:", {
          message: backendError.message,
          response: backendError.response,
          status: backendError.response?.status,
          data: backendError.response?.data
        })
        
        // Test backend connectivity to provide better error message
        const isBackendConnected = await testBackendConnection()
        
        if (!isBackendConnected) {
          toast.error("Cannot connect to server. Profile saved locally only.")
        } else if (backendError.response?.status === 400) {
          toast.error("Invalid data format. Please check your input.")
        } else if (backendError.response?.status === 401) {
          toast.error("Authentication failed. Please login again.")
        } else if (backendError.response?.status === 403) {
          toast.error("Permission denied. You may not have access to update this profile.")
        } else if (backendError.response?.status >= 500) {
          toast.error("Server error. Please try again later.")
        } else {
          toast.warning("Profile saved locally only. Server update failed. Please try again later.")
        }
        
        // Ensure we still save to localStorage even if backend fails
        const fallbackProfileToSave = {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phoneNumber: profile.phoneNumber,
          dateOfBirth: profile.dateOfBirth,
          bio: profile.bio,
          designation: profile.designation,
          educationalQualifications: profile.educationalQualifications,
          certificationsAwards: profile.certificationsAwards,
          subjectExpertise: profile.subjectExpertise
        }
        localStorage.setItem('facultyProfile', JSON.stringify(fallbackProfileToSave))
        toast.info("All profile data saved locally and will persist across sessions.")
      }
      
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form to last saved values from localStorage
    const savedProfile = localStorage.getItem('facultyProfile')
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile)
        setProfile(prev => ({
          ...prev,
          ...parsedProfile,
          email: user?.email || parsedProfile.email || ""
        }))
      } catch (error) {
        console.error('Error parsing saved profile:', error)
      }
    } else if (user) {
      // Reset to user data if no saved profile
      setProfile(prev => ({
        ...prev,
        firstName: user.first_name || user.firstName || "",
        lastName: user.last_name || user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phone_number || user.phoneNumber || "",
        dateOfBirth: user.date_of_birth || user.dateOfBirth || "",
        bio: user.bio || "",
        designation: user.designation || "",
        educationalQualifications: user.educational_qualifications || user.educationalQualifications || "",
        certificationsAwards: user.certifications_awards || user.certificationsAwards || "",
        subjectExpertise: user.subject_expertise || user.subjectExpertise || ""
      }))
    }
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Faculty Profile</h4>
              <div className="d-flex gap-2">
                {!isEditing && (
                  <>
                    <button
                      className="btn btn-outline-light btn-sm"
                      onClick={loadProfileFromBackend}
                      title="Refresh from server"
                      disabled={refreshing}
                    >
                      <i className="fas fa-sync-alt me-2"></i>
                      Refresh
                      {refreshing && (
                        <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
                      )}
                    </button>
                    <button
                      className="btn btn-light btn-sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <i className="fas fa-edit me-2"></i>
                      Edit Profile
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="card-body">
              {/* Information about data storage */}
              <div className="alert alert-info mb-4">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Note:</strong> All faculty profile information will be saved to the database and will persist across sessions. 
                Your data is securely stored on our servers.
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* First Name */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">First Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  {/* Last Name */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Last Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phoneNumber"
                      value={profile.phoneNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Date of Birth</label>
                    <input
                      type="date"
                      className="form-control"
                      name="dateOfBirth"
                      value={profile.dateOfBirth}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  {/* Designation */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Designation *</label>
                    <select
                      className="form-select"
                      name="designation"
                      value={profile.designation}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    >
                      <option value="">Select Designation</option>
                      {designationOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bio */}
                  <div className="col-12 mb-3">
                    <label className="form-label fw-bold">Bio</label>
                    <textarea
                      className="form-control"
                      name="bio"
                      value={profile.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows="3"
                      placeholder="Tell us about yourself, your teaching philosophy, and experience..."
                    />
                  </div>

                  {/* Educational Qualifications */}
                  <div className="col-12 mb-3">
                    <label className="form-label fw-bold">Educational Qualifications</label>
                    <textarea
                      className="form-control"
                      name="educationalQualifications"
                      value={profile.educationalQualifications}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows="3"
                      placeholder="List your degrees, institutions, and graduation years..."
                    />
                  </div>

                  {/* Certifications & Awards */}
                  <div className="col-12 mb-3">
                    <label className="form-label fw-bold">Certifications & Awards</label>
                    <textarea
                      className="form-control"
                      name="certificationsAwards"
                      value={profile.certificationsAwards}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows="3"
                      placeholder="List your professional certifications, awards, and honors..."
                    />
                  </div>

                  {/* Subject Expertise */}
                  <div className="col-12 mb-3">
                    <label className="form-label fw-bold">Subject Expertise</label>
                    <textarea
                      className="form-control"
                      name="subjectExpertise"
                      value={profile.subjectExpertise}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows="3"
                      placeholder="List your areas of expertise, subjects you teach, and research interests..."
                    />
                  </div>

                  {/* Degree Certificate */}
                  <div className="col-12 mb-3">
                    <label className="form-label fw-bold">Degree Certificate (Optional)</label>
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="file"
                        className="form-control"
                        accept=".pdf"
                        onChange={handleFileChange}
                        disabled={!isEditing}
                      />
                      {profile.degreeCertificate && (
                        <span className="text-success">
                          <i className="fas fa-check-circle me-2"></i>
                          {profile.degreeCertificate.name}
                        </span>
                      )}
                    </div>
                    <small className="text-muted">
                      Only PDF files are accepted. Maximum size: 10MB
                    </small>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="d-flex gap-2 justify-content-end mt-4">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FacultyProfile
