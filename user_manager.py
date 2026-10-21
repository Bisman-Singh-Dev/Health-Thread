#!/usr/bin/env python3
"""
HealthThread User Database CLI Manager
View, inspect, or manage users stored in users_data.py
"""

import sys
import json
import os

try:
    import users_data
except ImportError:
    print("Error: users_data.py not found in current directory.")
    sys.exit(1)

def list_users():
    users = users_data.USERS
    print("=" * 60)
    print(f"HealthThread Database: {len(users)} registered users")
    print("=" * 60)
    for email, u in users.items():
        print(f"Name:     {u.get('displayName')}")
        print(f"Email:    {email}")
        print(f"Health ID:{u.get('healthId')}")
        print(f"Timeline: {len(u.get('timeline', []))} events")
        print(f"Diagnoses:{len(u.get('diagnoses', []))} records")
        print("-" * 60)

if __name__ == "__main__":
    list_users()
