"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authAPI } from "../services/api"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (token) {
        const response = await authAPI.verifyToken()
        if (response.data.valid) {
          // Try to get user data from localStorage first, then from API
          const savedUser = localStorage.getItem("user")
          let userData = response.data.user
          
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser)
              // Merge saved data with API data
              userData = { ...parsedUser, ...userData }
            } catch (error) {
              console.error("Error parsing saved user data:", error)
            }
          }
          
          setUser(userData)
          setIsAuthenticated(true)
        } else {
          clearAuth()
        }
      } else {
        // No token found, ensure user is not authenticated
        clearAuth()
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      clearAuth()
    } finally {
      setLoading(false)
    }
  }

  const clearAuth = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    localStorage.removeItem("facultyProfile")
    setUser(null)
    setIsAuthenticated(false)
  }

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      const { user: userData, access, refresh } = response.data

      // Store tokens
      localStorage.setItem("access_token", access)
      localStorage.setItem("refresh_token", refresh)
      
      // Store user data for persistence
      localStorage.setItem("user", JSON.stringify(userData))

      setUser(userData)
      setIsAuthenticated(true)

      return { success: true, user: userData }
    } catch (error) {
      console.error("Login failed:", error)
      return {
        success: false,
        error: error.response?.data?.detail || "Login failed",
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      const { user: newUser, tokens } = response.data

      // Store tokens
      localStorage.setItem("access_token", tokens.access)
      localStorage.setItem("refresh_token", tokens.refresh)
      
      // Store user data for persistence
      localStorage.setItem("user", JSON.stringify(newUser))

      setUser(newUser)
      setIsAuthenticated(true)

      return { success: true, user: newUser }
    } catch (error) {
      console.error("Registration failed:", error)
      return {
        success: false,
        error: error.response?.data || "Registration failed",
      }
    }
  }

  const logout = () => {
    clearAuth()
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData)
      const updatedUser = response.data
      
      // Update user state with new data
      setUser(updatedUser)
      
      // Also update localStorage if it exists
      const currentUser = localStorage.getItem('user')
      if (currentUser) {
        try {
          const parsedUser = JSON.parse(currentUser)
          const mergedUser = { ...parsedUser, ...updatedUser }
          localStorage.setItem('user', JSON.stringify(mergedUser))
        } catch (error) {
          console.error('Error updating localStorage user:', error)
        }
      }
      
      return { success: true, user: updatedUser }
    } catch (error) {
      console.error("Profile update failed:", error)
      return {
        success: false,
        error: error.response?.data || "Profile update failed",
      }
    }
  }

  const changePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData)
      return { success: true }
    } catch (error) {
      console.error("Password change failed:", error)
      return {
        success: false,
        error: error.response?.data || "Password change failed",
      }
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    checkAuthStatus,
    clearAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
