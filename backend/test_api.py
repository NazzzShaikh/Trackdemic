import requests
import json

# Test registration
def test_registration():
    url = "http://localhost:8000/api/auth/register/"
    data = {
        "username": "testuser123",
        "email": "test123@test.com",
        "password": "testpass123",
        "password_confirm": "testpass123",
        "first_name": "Test",
        "last_name": "User",
        "user_type": "student"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Registration Status: {response.status_code}")
        print(f"Response: {response.text}")
        return response
    except Exception as e:
        print(f"Registration Error: {e}")
        return None

# Test login
def test_login():
    url = "http://localhost:8000/api/auth/login/"
    data = {
        "username": "testuser123",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Login Status: {response.status_code}")
        print(f"Response: {response.text}")
        return response
    except Exception as e:
        print(f"Login Error: {e}")
        return None

if __name__ == "__main__":
    print("Testing Django API...")
    print("=" * 50)
    
    print("\n1. Testing Registration:")
    reg_response = test_registration()
    
    print("\n2. Testing Login:")
    login_response = test_login()
    
    print("\n" + "=" * 50)
    print("Test completed!")
