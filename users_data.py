# HealthThread Unified User Database
# Automatically updated when users sign up, log in, or update clinical records

USERS = {
    "bisman@healththread.io": {
        "id": "usr_bisman_1001",
        "displayName": "Bisman Singh",
        "email": "bisman@healththread.io",
        "password": "password123",
        "healthId": "HT-GLOBAL-48291",
        "bloodGroup": "O+",
        "role": "patient",
        "isVerified": True,
        "createdAt": "2026-10-21T00:00:00.000Z",
        "emergencyProfile": {
            "bloodGroup": "O+",
            "knownAllergies": "None reported",
            "currentMedications": "None",
            "chronicConditions": "None",
            "previousSurgeries": "None",
            "emergencyContact": "Primary Contact",
            "emergencyPhone": "+1 (555) 019-2831",
            "organDonor": "Yes"
        },
        "timeline": [
            {
                "id": "tl-101",
                "year": "2026",
                "date": "Oct 21, 2026",
                "category": "Prescriptions",
                "title": "Clinical Health Consultation",
                "provider": "Dr. Evelyn Vance",
                "clinicOrHospital": "Universal Health Network",
                "status": "Resolved",
                "iconType": "pill",
                "clinicalSummary": "Routine health checkup with vital assessment and healthy baseline."
            }
        ],
        "diagnoses": []
    },
    "test@healththread.io": {
        "id": "usr_test",
        "displayName": "Test User",
        "email": "test@healththread.io",
        "password": "testpassword",
        "role": "patient",
        "isVerified": True
    },
    "sarah@healththread.io": {
        "id": "usr_sarah_connor_92127",
        "displayName": "Sarah Connor",
        "email": "sarah@healththread.io",
        "password": "securepassword123",
        "healthId": "HT-GLOBAL-92127",
        "bloodGroup": "Not specified",
        "role": "patient",
        "isVerified": True,
        "createdAt": "2026-10-21T18:05:01.101Z",
        "emergencyProfile": {
            "bloodGroup": "Not specified",
            "knownAllergies": "None reported",
            "currentMedications": "None",
            "chronicConditions": "None",
            "previousSurgeries": "None",
            "emergencyContact": "Primary ICE Contact",
            "emergencyPhone": "+1 (555) 019-2831",
            "organDonor": "Yes"
        },
        "timeline": [
            {
                "id": "tl-welcome-1792605901101",
                "year": "2026",
                "date": "Oct 21, 2026",
                "category": "Prescriptions",
                "title": "HealthThread Vault Activated",
                "provider": "System Initializer",
                "status": "Verified",
                "iconType": "pill",
                "clinicalSummary": "Universal personal vault initialized for Sarah Connor. Records and timeline synced."
            }
        ],
        "diagnoses": []
    },
    "alex@healththread.io": {
        "id": "usr_health_member_38717",
        "displayName": "Health Member",
        "email": "alex@healththread.io",
        "password": "mypassword789",
        "healthId": "HT-GLOBAL-38717",
        "bloodGroup": "Not specified",
        "role": "patient",
        "isVerified": True,
        "createdAt": "2026-10-21T18:06:06.203Z",
        "emergencyProfile": {
            "bloodGroup": "Not specified",
            "knownAllergies": "None reported",
            "currentMedications": "None",
            "chronicConditions": "None",
            "previousSurgeries": "None",
            "emergencyContact": "Primary ICE Contact",
            "emergencyPhone": "+1 (555) 019-2831",
            "organDonor": "Yes"
        },
        "timeline": [
            {
                "id": "tl-welcome-1792605966203",
                "year": "2026",
                "date": "Oct 21, 2026",
                "category": "Prescriptions",
                "title": "HealthThread Vault Activated",
                "provider": "System Initializer",
                "status": "Verified",
                "iconType": "pill",
                "clinicalSummary": "Universal personal vault initialized for Health Member. Records and timeline synced."
            }
        ],
        "diagnoses": []
    },
    "watson@healththread.io": {
        "id": "usr_dr__john_watson_51397",
        "displayName": "Dr. John Watson",
        "email": "watson@healththread.io",
        "password": "watsonpass123",
        "healthId": "HT-GLOBAL-51397",
        "bloodGroup": "Not specified",
        "role": "patient",
        "isVerified": True,
        "createdAt": "2026-10-21T18:06:46.506Z",
        "emergencyProfile": {
            "bloodGroup": "Not specified",
            "knownAllergies": "None reported",
            "currentMedications": "None",
            "chronicConditions": "None",
            "previousSurgeries": "None",
            "emergencyContact": "Primary ICE Contact",
            "emergencyPhone": "+1 (555) 019-2831",
            "organDonor": "Yes"
        },
        "timeline": [
            {
                "id": "tl-welcome-1792606006506",
                "year": "2026",
                "date": "Oct 21, 2026",
                "category": "Prescriptions",
                "title": "HealthThread Vault Activated",
                "provider": "System Initializer",
                "status": "Verified",
                "iconType": "pill",
                "clinicalSummary": "Universal personal vault initialized for Dr. John Watson. Records and timeline synced."
            }
        ],
        "diagnoses": [
            {
                "id": "diag-001",
                "condition": "Mild Bronchitis",
                "date": "2026-10-21",
                "severity": "Mild",
                "summary": "Cough observed during routine checkup."
            }
        ],
        "lastSyncedAt": "2026-10-21T18:06:59.186Z"
    }
}
