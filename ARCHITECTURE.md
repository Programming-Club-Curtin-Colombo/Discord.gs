# Google Apps Script Architecture Standard

This document defines the mandatory file structure and responsibilities for all Google Apps Script projects in the organization.

---

# Core Principle

Google Apps Script does not support modules or imports.  
Architecture is enforced through file separation, naming conventions, and strict responsibility boundaries.

---

# Required File Structure

```

Code.gs
Services.gs
Utils.gs
Config.gs
Triggers.gs
Api.gs (optional)

```

---

# File Responsibilities

---

## Code.gs - Entry Layer

### Purpose

Handles all entry points into the system.

### Why it exists

Google Apps Script exposes functions globally. Without a controlled entry layer, logic becomes scattered and untraceable.

### Rules

- Only entry points (doGet, doPost, onOpen, triggers)
- No business logic
- Must delegate immediately to Services layer

---

## Services.gs - Business Logic Layer

### Purpose

Contains all core application workflows and decision-making logic.

### Why it exists

Separates business logic from triggers and utilities, ensuring maintainability in a global execution environment.

### Rules

- Owns all business logic
- Calls Utils and Api layers
- Must NOT handle UI or triggers directly

---

## Utils.gs - Helper Layer

### Purpose

Reusable, stateless helper functions.

### Why it exists

Prevents duplication of logic and ensures consistency across Services.

### Rules

- No side effects
- No API calls
- Prefer pure functions

---

## Config.gs - Configuration Layer

### Purpose

Central place for constants and environment configuration.

### Why it exists

GAS has no environment variable system; this file replaces that need.

### Rules

- Immutable values only
- No logic
- No runtime mutation

---

## Triggers.gs - Event Layer

### Purpose

Handles Google Apps Script event triggers.

### Why it exists

Separates event handling from business logic.

### Rules

- Must delegate to Services immediately
- No embedded logic

---

## Api.gs - External Integration Layer (Optional)

### Purpose

Handles all external API communication.

### Why it exists

Isolates external dependencies from core logic for maintainability.

### Rules

- Only API communication
- No business logic
- No transformation beyond response normalization

---

# Execution Flow

```

Triggers / Code.gs
↓
Services.gs
↓
Utils.gs / Api.gs

```

---

# Non-Negotiable Rules

- Code.gs contains NO business logic
- Services.gs contains ALL business logic
- Utils.gs contains ONLY pure helpers
- Config.gs is IMMUTABLE
- Triggers MUST route through Services
- Api.gs MUST isolate external calls

---

# Design Intent

This structure exists because:

- Google Apps Script has no module system
- Everything is global scope
- File separation is the only architectural control
- Large GAS projects become unmanageable without strict rules

---

# Outcome

Following this standard ensures:

- predictable project structure
- scalable collaboration
- reduced coupling
- consistent engineering practices across all repositories
