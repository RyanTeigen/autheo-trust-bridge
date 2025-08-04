# EMR System Architecture

## Overview

This document outlines the architecture of our Electronic Medical Records (EMR) system, designed with security, compliance, and scalability as core principles.

## 🏗️ System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Application]
        PWA[Progressive Web App]
    end
    
    subgraph "Application Layer"
        REACT[React Frontend]
        COMPONENTS[UI Components]
        HOOKS[Custom Hooks]
        SERVICES[Service Layer]
    end
    
    subgraph "Security Layer"
        AUTH[Authentication]
        AUTHZ[Authorization]
        ENCRYPT[Encryption Service]
        AUDIT[Audit Logger]
    end
    
    subgraph "Data Layer"
        SUPABASE[Supabase]
        POSTGRES[PostgreSQL]
        RLS[Row Level Security]
        STORAGE[File Storage]
    end
    
    subgraph "Blockchain Layer"
        ANCHORING[Hash Anchoring]
        AUTHEO[Autheo Network]
        INTEGRITY[Data Integrity]
    end
    
    subgraph "Compliance Layer"
        HIPAA[HIPAA Controls]
        LOGGING[Compliance Logging]
        RETENTION[Data Retention]
        BREACH[Breach Detection]
    end
    
    WEB --> REACT
    PWA --> REACT
    REACT --> COMPONENTS
    REACT --> HOOKS
    HOOKS --> SERVICES
    SERVICES --> AUTH
    SERVICES --> AUTHZ
    SERVICES --> ENCRYPT
    SERVICES --> AUDIT
    
    AUTH --> SUPABASE
    AUTHZ --> RLS
    ENCRYPT --> POSTGRES
    AUDIT --> POSTGRES
    
    POSTGRES --> ANCHORING
    ANCHORING --> AUTHEO
    AUDIT --> LOGGING
    LOGGING --> RETENTION
    BREACH --> HIPAA
```

### Component Architecture

```mermaid
graph LR
    subgraph "Frontend Components"
        DASHBOARD[Patient Dashboard]
        RECORDS[Medical Records]
        SHARING[Data Sharing]
        AUDIT_UI[Audit Interface]
    end
    
    subgraph "Service Layer"
        AUDIT_SVC[Audit Service]
        ENCRYPT_SVC[Encryption Service]
        ANCHOR_SVC[Anchoring Service]
        SECURITY_SVC[Security Service]
    end
    
    subgraph "Data Access Layer"
        PATIENT_API[Patient API]
        PROVIDER_API[Provider API]
        AUDIT_API[Audit API]
        BLOCKCHAIN_API[Blockchain API]
    end
    
    DASHBOARD --> AUDIT_SVC
    RECORDS --> ENCRYPT_SVC
    SHARING --> SECURITY_SVC
    AUDIT_UI --> AUDIT_SVC
    
    AUDIT_SVC --> AUDIT_API
    ENCRYPT_SVC --> PATIENT_API
    ANCHOR_SVC --> BLOCKCHAIN_API
    SECURITY_SVC --> PROVIDER_API
```

## 🔒 Security Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant S as Supabase
    participant D as Database
    participant A as Audit Logger
    
    U->>F: Login Request
    F->>S: Authenticate
    S->>D: Verify Credentials
    D-->>S: User Data
    S-->>F: JWT Token
    F->>A: Log Login Event
    A->>D: Store Audit Log
    F-->>U: Access Granted
```

### Data Access Control

```mermaid
graph TD
    REQUEST[API Request] --> AUTH_CHECK{Authenticated?}
    AUTH_CHECK -->|No| DENY[Access Denied]
    AUTH_CHECK -->|Yes| ROLE_CHECK{Role Check}
    ROLE_CHECK -->|Invalid| DENY
    ROLE_CHECK -->|Valid| RLS_CHECK{RLS Policy}
    RLS_CHECK -->|Fail| DENY
    RLS_CHECK -->|Pass| RESOURCE_CHECK{Resource Access}
    RESOURCE_CHECK -->|Denied| DENY
    RESOURCE_CHECK -->|Allowed| AUDIT_LOG[Log Access]
    AUDIT_LOG --> GRANT[Access Granted]
    DENY --> AUDIT_FAIL[Log Failed Access]
```

## 📊 Data Architecture

### Database Schema Overview

```mermaid
erDiagram
    USERS ||--o{ PATIENTS : owns
    USERS ||--o{ PROFILES : has
    PATIENTS ||--o{ MEDICAL_RECORDS : has
    USERS ||--o{ AUDIT_LOGS : generates
    MEDICAL_RECORDS ||--o{ SHARING_PERMISSIONS : shared_via
    SHARING_PERMISSIONS ||--o{ ACCESS_LOGS : generates
    AUDIT_LOGS ||--o{ AUDIT_HASH_ANCHORS : anchored_in
    USERS ||--o{ CROSS_HOSPITAL_REQUESTS : requests
    
    USERS {
        uuid id PK
        string email
        timestamp created_at
    }
    
    PROFILES {
        uuid id PK
        uuid user_id FK
        string role
        string first_name
        string last_name
    }
    
    PATIENTS {
        uuid id PK
        uuid user_id FK
        string full_name
        date date_of_birth
        jsonb metadata
    }
    
    MEDICAL_RECORDS {
        uuid id PK
        uuid patient_id FK
        uuid provider_id FK
        string record_type
        text encrypted_data
        string iv
        timestamp created_at
    }
    
    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        string action
        string resource
        uuid resource_id
        string status
        boolean phi_accessed
        timestamp timestamp
    }
```

### Encryption Strategy

```mermaid
graph LR
    PLAINTEXT[Patient Data] --> ENCRYPT[AES-256-CBC]
    ENCRYPT --> CIPHERTEXT[Encrypted Data]
    CIPHERTEXT --> STORE[Database Storage]
    
    KEY_DERIVE[Key Derivation] --> ENCRYPT
    IV_GEN[IV Generation] --> ENCRYPT
    
    STORE --> RETRIEVE[Data Retrieval]
    RETRIEVE --> DECRYPT[AES Decryption]
    DECRYPT --> PLAINTEXT_OUT[Decrypted Data]
    
    KEY_DERIVE --> DECRYPT
    IV_STORED[Stored IV] --> DECRYPT
```

## ⛓️ Blockchain Integration

### Audit Hash Anchoring

```mermaid
sequenceDiagram
    participant AL as Audit Logs
    participant HS as Hash Service
    participant BA as Blockchain Anchor
    participant AN as Autheo Network
    participant GH as GitHub Actions
    
    Note over AL,GH: Automated Anchoring Process
    
    GH->>AL: Check New Logs
    AL-->>GH: Log Count
    GH->>HS: Generate Hash
    HS->>AL: Retrieve Recent Logs
    AL-->>HS: Log Data
    HS->>HS: Generate SHA-256 Hash
    HS->>BA: Store Anchor Record
    BA->>AN: Submit to Blockchain
    AN-->>BA: Transaction Hash
    BA->>AL: Update Anchor Status
```

### Smart Anchoring Logic

```mermaid
graph TD
    START[Start Anchoring Process] --> CHECK[Check for New Logs]
    CHECK --> NEWLOGS{New Logs?}
    NEWLOGS -->|No| SKIP[Skip Anchoring]
    NEWLOGS -->|Yes| GENERATE[Generate Hash]
    GENERATE --> SUBMIT[Submit to Blockchain]
    SUBMIT --> SUCCESS{Success?}
    SUCCESS -->|Yes| STORE[Store Anchor Record]
    SUCCESS -->|No| RETRY[Retry Logic]
    STORE --> AUDIT[Log Anchoring Event]
    SKIP --> END[End Process]
    AUDIT --> END
    RETRY --> SUBMIT
```

## 🏥 HIPAA Compliance Architecture

### Privacy Controls

```mermaid
graph TB
    subgraph "Administrative Safeguards"
        ASSIGNED[Assigned Security Responsibility]
        WORKFORCE[Workforce Training]
        ACCESS_MGT[Access Management]
        SANCTIONS[Sanction Policy]
    end
    
    subgraph "Physical Safeguards"
        FACILITY[Facility Access]
        WORKSTATION[Workstation Security]
        MEDIA[Media Controls]
    end
    
    subgraph "Technical Safeguards"
        ACCESS_CTRL[Access Control]
        AUDIT_CTRL[Audit Controls]
        INTEGRITY[Data Integrity]
        TRANSMISSION[Transmission Security]
    end
    
    ACCESS_MGT --> ACCESS_CTRL
    WORKFORCE --> AUDIT_CTRL
    FACILITY --> WORKSTATION
    AUDIT_CTRL --> INTEGRITY
    ACCESS_CTRL --> TRANSMISSION
```

### Audit Trail Architecture

```mermaid
graph LR
    subgraph "Event Sources"
        LOGIN[User Login/Logout]
        ACCESS[Data Access]
        MODIFY[Data Modification]
        SHARE[Data Sharing]
        BREACH[Security Events]
    end
    
    subgraph "Audit Processing"
        COLLECTOR[Event Collector]
        VALIDATOR[Data Validator]
        ENRICHER[Context Enricher]
        STORAGE[Secure Storage]
    end
    
    subgraph "Compliance Reporting"
        HIPAA_RPT[HIPAA Reports]
        BREACH_RPT[Breach Reports]
        ACCESS_RPT[Access Reports]
        RETENTION[Retention Policy]
    end
    
    LOGIN --> COLLECTOR
    ACCESS --> COLLECTOR
    MODIFY --> COLLECTOR
    SHARE --> COLLECTOR
    BREACH --> COLLECTOR
    
    COLLECTOR --> VALIDATOR
    VALIDATOR --> ENRICHER
    ENRICHER --> STORAGE
    
    STORAGE --> HIPAA_RPT
    STORAGE --> BREACH_RPT
    STORAGE --> ACCESS_RPT
    STORAGE --> RETENTION
```

## 🔧 Deployment Architecture

### GitHub Actions Workflow

```mermaid
graph TD
    COMMIT[Code Commit] --> TRIGGER[Trigger Workflows]
    TRIGGER --> SECURITY[Security Scan]
    TRIGGER --> AUDIT[Audit Check]
    TRIGGER --> ANCHOR[Anchoring Process]
    
    SECURITY --> TESTS[Run Tests]
    AUDIT --> TESTS
    ANCHOR --> TESTS
    
    TESTS --> SUCCESS{All Pass?}
    SUCCESS -->|Yes| DEPLOY[Deploy to Staging]
    SUCCESS -->|No| NOTIFY[Notify Team]
    
    DEPLOY --> VALIDATE[Validate Deployment]
    VALIDATE --> PROD{Ready for Prod?}
    PROD -->|Yes| PRODUCTION[Deploy to Production]
    PROD -->|No| ROLLBACK[Rollback]
    
    PRODUCTION --> MONITOR[Monitor Health]
    MONITOR --> ALERTS[Health Alerts]
```

### Environment Architecture

```mermaid
graph TB
    subgraph "Development"
        DEV_APP[Dev Application]
        DEV_DB[Local Database]
        DEV_MOCK[Mock Services]
    end
    
    subgraph "Staging"
        STG_APP[Staging Application]
        STG_DB[Staging Database]
        STG_BC[Testnet Blockchain]
    end
    
    subgraph "Production"
        PROD_APP[Production Application]
        PROD_DB[Production Database]
        PROD_BC[Mainnet Blockchain]
        PROD_MONITOR[Monitoring]
    end
    
    DEV_APP --> STG_APP
    STG_APP --> PROD_APP
    DEV_DB --> STG_DB
    STG_DB --> PROD_DB
    DEV_MOCK --> STG_BC
    STG_BC --> PROD_BC
```

## 📈 Monitoring and Observability

### Health Monitoring

```mermaid
graph LR
    subgraph "Application Metrics"
        RESPONSE[Response Times]
        ERRORS[Error Rates]
        THROUGHPUT[Throughput]
        AVAILABILITY[Availability]
    end
    
    subgraph "Security Metrics"
        AUTH_FAIL[Failed Logins]
        BREACH_EVENTS[Breach Events]
        ACCESS_ANOMALY[Access Anomalies]
        PERMISSION_CHANGES[Permission Changes]
    end
    
    subgraph "Compliance Metrics"
        AUDIT_COMPLETENESS[Audit Completeness]
        DATA_RETENTION[Data Retention]
        POLICY_ADHERENCE[Policy Adherence]
        ANCHOR_STATUS[Anchoring Status]
    end
    
    subgraph "Alerting"
        CRITICAL[Critical Alerts]
        WARNING[Warning Alerts]
        INFO[Info Alerts]
    end
    
    RESPONSE --> CRITICAL
    ERRORS --> CRITICAL
    AUTH_FAIL --> WARNING
    BREACH_EVENTS --> CRITICAL
    AUDIT_COMPLETENESS --> WARNING
    ANCHOR_STATUS --> INFO
```

## 🚀 Scalability Considerations

### Horizontal Scaling

- Supabase handles database scaling automatically
- Frontend can be deployed to CDN for global distribution
- Edge functions scale automatically with demand
- Blockchain anchoring is asynchronous and can be batched

### Performance Optimization

- Database indexing for frequent queries
- Caching strategies for read-heavy operations
- Lazy loading for large datasets
- Optimistic updates for better UX

### Future Enhancements

- Multi-region deployment
- Advanced analytics and ML
- Enhanced blockchain features
- Integration with external systems

---

This architecture ensures our EMR system meets the highest standards for security, compliance, and performance while remaining scalable and maintainable.