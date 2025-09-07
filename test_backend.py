#!/usr/bin/env python3
"""
Quick API test and fix for TI Chess backend
"""
import requests
import json
import time

def test_api():
    """Test the TI Chess API endpoints"""
    base_url = "http://localhost:8001"
    
    print("🧪 Testing TI Chess API...")
    print("=" * 50)
    
    try:
        # Test health endpoint
        print("1. Testing health endpoint...")
        response = requests.get(f"{base_url}/healthz/", timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
        
        # Test API root
        print("\n2. Testing API root...")
        response = requests.get(f"{base_url}/root/", timeout=5)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Message: {data.get('message', 'N/A')}")
        
        # Test active games endpoint
        print("\n3. Testing active games...")
        response = requests.get(f"{base_url}/api/games/", timeout=5)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            games = response.json()
            print(f"   Games count: {len(games) if isinstance(games, list) else 'Invalid response'}")
        else:
            print(f"   Error: {response.text}")
        
        # Test moves endpoint (should return empty list for new games)
        print("\n4. Testing moves endpoint...")
        response = requests.get(f"{base_url}/api/moves/", timeout=5)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            moves = response.json()
            print(f"   Moves type: {type(moves)}")
            print(f"   Moves data: {moves}")
        else:
            print(f"   Error: {response.text}")
            
        # Test API documentation
        print("\n5. Testing API docs...")
        response = requests.get(f"{base_url}/api/docs/", timeout=5)
        print(f"   Status: {response.status_code}")
        
        print("\n✅ API tests completed!")
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - is the server running?")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    # Wait a moment for server to start
    print("⏳ Waiting for server to start...")
    time.sleep(3)
    test_api()#!/usr/bin/env python3
"""
Quick API test and fix for TI Chess backend
"""
import requests
import json
import time

def test_api():
    """Test the TI Chess API endpoints"""
    base_url = "http://localhost:8001"
    
    print("🧪 Testing TI Chess API...")
    print("=" * 50)
    
    try:
        # Test health endpoint
        print("1. Testing health endpoint...")
        response = requests.get(f"{base_url}/healthz/", timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
        
        # Test API root
        print("\n2. Testing API root...")
        response = requests.get(f"{base_url}/root/", timeout=5)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Message: {data.get('message', 'N/A')}")
        
        # Test active games endpoint
        print("\n3. Testing active games...")
        response = requests.get(f"{base_url}/api/games/", timeout=5)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            games = response.json()
            print(f"   Games count: {len(games) if isinstance(games, list) else 'Invalid response'}")
        else:
            print(f"   Error: {response.text}")
        
        # Test moves endpoint (should return empty list for new games)
        print("\n4. Testing moves endpoint...")
        response = requests.get(f"{base_url}/api/moves/", timeout=5)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            moves = response.json()
            print(f"   Moves type: {type(moves)}")
            print(f"   Moves data: {moves}")
        else:
            print(f"   Error: {response.text}")
            
        # Test API documentation
        print("\n5. Testing API docs...")
        response = requests.get(f"{base_url}/api/docs/", timeout=5)
        print(f"   Status: {response.status_code}")
        
        print("\n✅ API tests completed!")
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - is the server running?")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    # Wait a moment for server to start
    print("⏳ Waiting for server to start...")
    time.sleep(3)
    test_api()