import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding enterprise platform data...");

  // ─────────────────────────────────────────────
  // Users (one per role)
  // ─────────────────────────────────────────────
  const superadmin = await prisma.user.upsert({
    where: { email: "superadmin@example.com" },
    create: {
      email: "superadmin@example.com",
      name: "Super Admin",
      password: await bcrypt.hash("super123", 12),
      role: "SUPER_ADMIN"
    },
    update: {}
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    create: {
      email: "admin@example.com",
      name: "Raj Kumar",
      password: await bcrypt.hash("admin123", 12),
      role: "ADMIN"
    },
    update: {}
  });

  const pm = await prisma.user.upsert({
    where: { email: "pm@example.com" },
    create: {
      email: "pm@example.com",
      name: "Priya Sharma",
      password: await bcrypt.hash("pm123", 12),
      role: "PRODUCT_MANAGER"
    },
    update: {}
  });

  const projm = await prisma.user.upsert({
    where: { email: "projm@example.com" },
    create: {
      email: "projm@example.com",
      name: "Arjun Patel",
      password: await bcrypt.hash("projm123", 12),
      role: "PROJECT_MANAGER"
    },
    update: {}
  });

  const ba = await prisma.user.upsert({
    where: { email: "ba@example.com" },
    create: {
      email: "ba@example.com",
      name: "Neha Singh",
      password: await bcrypt.hash("ba123", 12),
      role: "BUSINESS_ANALYST"
    },
    update: {}
  });

  const dev = await prisma.user.upsert({
    where: { email: "dev@example.com" },
    create: {
      email: "dev@example.com",
      name: "Vikram Dev",
      password: await bcrypt.hash("dev123", 12),
      role: "BACKEND_DEVELOPER"
    },
    update: {}
  });

  const designer = await prisma.user.upsert({
    where: { email: "designer@example.com" },
    create: {
      email: "designer@example.com",
      name: "Meera Nair",
      password: await bcrypt.hash("design123", 12),
      role: "UI_UX_DESIGNER"
    },
    update: {}
  });

  const qa = await prisma.user.upsert({
    where: { email: "qa@example.com" },
    create: {
      email: "qa@example.com",
      name: "Rahul QA",
      password: await bcrypt.hash("qa123", 12),
      role: "QA_ENGINEER"
    },
    update: {}
  });

  const employee = await prisma.user.upsert({
    where: { email: "employee@example.com" },
    create: {
      email: "employee@example.com",
      name: "Ravi Kumar",
      password: await bcrypt.hash("emp123", 12),
      role: "EMPLOYEE"
    },
    update: {}
  });

  // suppress unused variable warnings
  void superadmin; void ba; void dev; void designer; void qa; void employee;

  // ─────────────────────────────────────────────
  // Platform
  // ─────────────────────────────────────────────
  const platform = await prisma.platform.upsert({
    where: { slug: "aquawise" },
    create: {
      name: "Aquawise",
      slug: "aquawise",
      description: "Water management and analytics platform"
    },
    update: {}
  });

  // ─────────────────────────────────────────────
  // Products
  // ─────────────────────────────────────────────
  const aquaflood = await prisma.product.upsert({
    where: { slug: "aquaflood" },
    create: {
      name: "Aquaflood",
      slug: "aquaflood",
      description: "Flood monitoring and early warning system",
      platformId: platform.id,
      ownerId: pm.id
    },
    update: {}
  });

  await prisma.product.upsert({
    where: { slug: "aquamind" },
    create: {
      name: "Aquamind",
      slug: "aquamind",
      description: "Intelligent water quality analytics",
      platformId: platform.id,
      ownerId: pm.id
    },
    update: {}
  });

  await prisma.product.upsert({
    where: { slug: "aquairrigation" },
    create: {
      name: "Aquairrigation",
      slug: "aquairrigation",
      description: "Smart irrigation management",
      platformId: platform.id,
      ownerId: pm.id
    },
    update: {}
  });

  // ─────────────────────────────────────────────
  // Projects (under Aquaflood)
  // ─────────────────────────────────────────────
  const apwrims = await prisma.project.upsert({
    where: { slug: "apwrims-2" },
    create: {
      name: "APWRIMS 2.0",
      slug: "apwrims-2",
      description: "Advanced Pradeshiya Water Resources Information and Management System v2.0",
      clientName: "State Water Board",
      status: "ACTIVE",
      startDate: new Date("2024-01-01"),
      productId: aquaflood.id
    },
    update: {}
  });

  await prisma.project.upsert({
    where: { slug: "flood-dashboard-v3" },
    create: {
      name: "Flood Dashboard v3",
      slug: "flood-dashboard-v3",
      description: "Real-time flood monitoring dashboard for national disaster response",
      clientName: "National Disaster Authority",
      status: "ACTIVE",
      productId: aquaflood.id
    },
    update: {}
  });

  // ─────────────────────────────────────────────
  // Environments for APWRIMS 2.0
  // ─────────────────────────────────────────────
  // Delete existing environments for idempotency then recreate
  await prisma.environment.deleteMany({ where: { projectId: apwrims.id } });
  await prisma.environment.createMany({
    data: [
      { name: "dev", url: "https://dev.apwrims.com", projectId: apwrims.id },
      { name: "staging", url: "https://staging.apwrims.com", projectId: apwrims.id },
      { name: "prod", url: "https://apwrims.com", projectId: apwrims.id }
    ]
  });

  // ─────────────────────────────────────────────
  // Modules (under APWRIMS 2.0)
  // ─────────────────────────────────────────────
  const nowcast = await prisma.module.upsert({
    where: { slug: "nowcast" },
    create: {
      name: "Nowcast",
      slug: "nowcast",
      description: "Real-time weather nowcasting and precipitation analysis",
      projectId: apwrims.id,
      ownerId: dev.id
    },
    update: {}
  });

  const miTankAlerts = await prisma.module.upsert({
    where: { slug: "mi-tank-alerts" },
    create: {
      name: "MI Tank Alerts",
      slug: "mi-tank-alerts",
      description: "Monitoring and intelligent alerts for tank water levels",
      projectId: apwrims.id,
      ownerId: dev.id
    },
    update: {}
  });

  const sensorManagement = await prisma.module.upsert({
    where: { slug: "sensor-management" },
    create: {
      name: "Sensor Management",
      slug: "sensor-management",
      description: "IoT sensor device management and data ingestion",
      projectId: apwrims.id,
      ownerId: dev.id
    },
    update: {}
  });

  const userManagement = await prisma.module.upsert({
    where: { slug: "user-management" },
    create: {
      name: "User Management",
      slug: "user-management",
      description: "User roles, permissions, and access control management",
      projectId: apwrims.id,
      ownerId: dev.id
    },
    update: {}
  });

  // Sub-module under MI Tank Alerts
  await prisma.module.upsert({
    where: { slug: "mi-tank-health" },
    create: {
      name: "MI Tank Health",
      slug: "mi-tank-health",
      description: "Health diagnostics and status reporting for MI tanks",
      projectId: apwrims.id,
      parentId: miTankAlerts.id,
      ownerId: dev.id
    },
    update: {}
  });

  // ─────────────────────────────────────────────
  // Features
  // ─────────────────────────────────────────────
  // Features under Nowcast
  await prisma.feature.upsert({
    where: { slug: "precipitation-analysis" },
    create: {
      name: "Precipitation Analysis",
      slug: "precipitation-analysis",
      description: "Quantitative precipitation forecast and analysis engine",
      moduleId: nowcast.id
    },
    update: {}
  });

  await prisma.feature.upsert({
    where: { slug: "weather-map-integration" },
    create: {
      name: "Weather Map Integration",
      slug: "weather-map-integration",
      description: "Interactive weather map overlays and radar visualization",
      moduleId: nowcast.id
    },
    update: {}
  });

  await prisma.feature.upsert({
    where: { slug: "alert-threshold-configuration" },
    create: {
      name: "Alert Threshold Configuration",
      slug: "alert-threshold-configuration",
      description: "Configure alert thresholds for precipitation and weather events",
      moduleId: nowcast.id
    },
    update: {}
  });

  // Features under MI Tank Alerts
  await prisma.feature.upsert({
    where: { slug: "realtime-level-monitoring" },
    create: {
      name: "Real-time Level Monitoring",
      slug: "realtime-level-monitoring",
      description: "Continuous real-time monitoring of tank water levels",
      moduleId: miTankAlerts.id
    },
    update: {}
  });

  await prisma.feature.upsert({
    where: { slug: "alert-rule-engine" },
    create: {
      name: "Alert Rule Engine",
      slug: "alert-rule-engine",
      description: "Configurable rule engine for generating tank level alerts",
      moduleId: miTankAlerts.id
    },
    update: {}
  });

  // ─────────────────────────────────────────────
  // Categories
  // ─────────────────────────────────────────────
  const catGettingStarted = await prisma.category.upsert({
    where: { slug: "getting-started" },
    create: { name: "Getting Started", slug: "getting-started" },
    update: {}
  });

  const catTechnical = await prisma.category.upsert({
    where: { slug: "technical" },
    create: { name: "Technical", slug: "technical" },
    update: {}
  });

  const catBusiness = await prisma.category.upsert({
    where: { slug: "business" },
    create: { name: "Business", slug: "business" },
    update: {}
  });

  const catTraining = await prisma.category.upsert({
    where: { slug: "training" },
    create: { name: "Training", slug: "training" },
    update: {}
  });

  void catBusiness;

  // ─────────────────────────────────────────────
  // Tags
  // ─────────────────────────────────────────────
  const tagNames = ["api", "backend", "frontend", "database", "alerts", "monitoring", "sensor", "weather", "iot", "nowcast"];
  const tagRecords: Record<string, { id: string; name: string }> = {};
  for (const name of tagNames) {
    tagRecords[name] = await prisma.tag.upsert({
      where: { name },
      create: { name },
      update: {}
    });
  }

  // ─────────────────────────────────────────────
  // Documents (5, published)
  // ─────────────────────────────────────────────
  await prisma.document.upsert({
    where: { slug: "nowcast-functional-overview" },
    create: {
      title: "Nowcast Module — Functional Overview",
      slug: "nowcast-functional-overview",
      type: "FUNCTIONAL",
      published: true,
      moduleId: nowcast.id,
      authorId: ba.id,
      tags: { connect: [{ id: tagRecords["weather"].id }, { id: tagRecords["nowcast"].id }] },
      content: `<h2>Nowcast Module — Functional Overview</h2>
<p>The Nowcast module is the real-time meteorological intelligence core of the APWRIMS 2.0 platform. It ingests multi-source weather data streams — including satellite imagery, ground-based rain gauge networks, and numerical weather prediction (NWP) model outputs — to produce actionable short-range precipitation forecasts.</p>
<h3>Key Algorithms</h3>
<p><strong>Quantitative Precipitation Forecast (QPF):</strong> The module employs QPF techniques to estimate rainfall accumulation over configurable time windows (15 minutes to 6 hours). QPF combines radar reflectivity extrapolation with NWP ensemble outputs to derive probabilistic precipitation estimates at 1 km² spatial resolution.</p>
<p><strong>Nowcasting Engine:</strong> Using optical flow algorithms (Lucas–Kanade and TITAN storm tracking), the nowcasting engine extrapolates storm cell movement and intensity. This enables 0–2 hour lead-time warnings with high spatial fidelity, critical for flash flood early warning.</p>
<h3>Business Value</h3>
<p>The Nowcast module enables State Water Board operators to receive up to 2-hour advance warnings of heavy precipitation events, facilitating proactive reservoir management, sluice gate operations, and public evacuation advisories. Integration with the MI Tank Alerts module ensures automated tank overflow risk assessments are triggered as precipitation thresholds are crossed, reducing manual intervention by an estimated 60%.</p>`,
      excerpt: "Real-time weather nowcasting and precipitation analysis for APWRIMS 2.0"
    },
    update: {}
  });

  await prisma.document.upsert({
    where: { slug: "sensor-management-api-reference" },
    create: {
      title: "Sensor Management API Reference",
      slug: "sensor-management-api-reference",
      type: "API_DOC",
      published: true,
      moduleId: sensorManagement.id,
      authorId: dev.id,
      tags: { connect: [{ id: tagRecords["api"].id }, { id: tagRecords["sensor"].id }, { id: tagRecords["iot"].id }] },
      content: `<h2>Sensor Management API Reference</h2>
<p>The Sensor Management API provides RESTful endpoints for managing IoT sensor devices, retrieving telemetry data, and configuring data ingestion pipelines within APWRIMS 2.0.</p>
<h3>Base URL</h3>
<pre><code>https://api.apwrims.com/api/v1/sensors</code></pre>
<h3>Authentication</h3>
<p>All API requests require a Bearer token in the Authorization header: <code>Authorization: Bearer &lt;JWT_TOKEN&gt;</code>. Tokens are obtained via the <code>/api/v1/auth/token</code> endpoint.</p>
<h3>Endpoints</h3>
<h4>GET /api/v1/sensors</h4>
<p>Returns a paginated list of all registered sensors. Query parameters: <code>page</code>, <code>limit</code>, <code>status</code> (active|inactive), <code>type</code> (rain_gauge|water_level|weather_station).</p>
<pre><code>GET /api/v1/sensors?status=active&amp;type=rain_gauge&amp;page=1&amp;limit=20
Response: { "data": [...], "total": 142, "page": 1 }</code></pre>
<h4>POST /api/v1/sensors</h4>
<p>Registers a new sensor device. Requires <code>deviceId</code>, <code>type</code>, <code>latitude</code>, <code>longitude</code>, and <code>name</code> in the request body.</p>
<pre><code>POST /api/v1/sensors
Body: { "deviceId": "RG-001", "type": "rain_gauge", "latitude": 17.385, "longitude": 78.486, "name": "Hyderabad Central RG" }</code></pre>
<h4>GET /api/v1/sensors/:id/telemetry</h4>
<p>Fetches time-series telemetry for a sensor. Supports <code>from</code> and <code>to</code> ISO timestamp parameters for range queries.</p>`,
      excerpt: "Complete API reference for sensor device management and telemetry endpoints"
    },
    update: {}
  });

  await prisma.document.upsert({
    where: { slug: "mi-tank-alerts-technical-architecture" },
    create: {
      title: "MI Tank Alerts — Technical Architecture",
      slug: "mi-tank-alerts-technical-architecture",
      type: "TECHNICAL",
      published: true,
      moduleId: miTankAlerts.id,
      authorId: dev.id,
      tags: { connect: [{ id: tagRecords["backend"].id }, { id: tagRecords["alerts"].id }, { id: tagRecords["monitoring"].id }] },
      content: `<h2>MI Tank Alerts — Technical Architecture</h2>
<p>The MI Tank Alerts module delivers real-time water level monitoring and intelligent alerting for Minor Irrigation (MI) tanks across the state network. The architecture is designed for high-throughput, low-latency alert delivery.</p>
<h3>Real-time Data Pipeline</h3>
<p>Sensor telemetry arrives via MQTT broker (Eclipse Mosquitto) and is processed by a Node.js consumer service. Water level readings are normalized and stored in a TimescaleDB hypertable partitioned by sensor ID and timestamp, enabling sub-second time-series queries across millions of data points.</p>
<h3>WebSocket Notification Layer</h3>
<p>A dedicated WebSocket server (Socket.IO cluster, 3 nodes) maintains persistent connections with dashboard clients. When alert conditions are met, events are published to a Redis pub/sub channel, consumed by all Socket.IO nodes, and broadcast to subscribed dashboard sessions within 200ms.</p>
<h3>Alert Queue and Processing</h3>
<p>Alert rule evaluation runs on a BullMQ worker queue (Redis-backed). Each alert rule check is a lightweight job that evaluates threshold conditions (absolute level, rate-of-change, delta-from-normal). Failed jobs are retried up to 3 times with exponential backoff.</p>
<h3>Database Design</h3>
<p>Alert definitions are stored in PostgreSQL with JSONB condition fields, allowing flexible rule expressions without schema migrations. Alert history is retained for 2 years in TimescaleDB with automated compression after 30 days, achieving 90% storage reduction on historical data.</p>`,
      excerpt: "Technical architecture covering WebSocket, alert queues, and database design for MI Tank Alerts"
    },
    update: {}
  });

  await prisma.document.upsert({
    where: { slug: "apwrims-2-qa-test-cases" },
    create: {
      title: "APWRIMS 2.0 — QA Test Cases",
      slug: "apwrims-2-qa-test-cases",
      type: "QA",
      published: true,
      projectId: apwrims.id,
      authorId: qa.id,
      tags: { connect: [{ id: tagRecords["monitoring"].id }, { id: tagRecords["alerts"].id }] },
      content: `<h2>APWRIMS 2.0 — QA Test Cases</h2>
<p>This document covers the core functional test cases for APWRIMS 2.0 across the primary modules. Each test case includes preconditions, steps, and expected results.</p>
<h3>TC-001: User Login with Valid Credentials</h3>
<p><strong>Steps:</strong> Navigate to /login, enter valid email and password, click Sign In. <strong>Expected:</strong> User is redirected to dashboard, session token is created, last login timestamp updated.</p>
<h3>TC-002: Sensor Data Ingestion via API</h3>
<p><strong>Steps:</strong> POST valid telemetry payload to /api/v1/sensors/:id/telemetry with Bearer token. <strong>Expected:</strong> HTTP 201 response, data stored in TimescaleDB, real-time dashboard chart updates within 3 seconds.</p>
<h3>TC-003: Tank Level Alert Trigger</h3>
<p><strong>Steps:</strong> Set alert rule threshold at 80% capacity, ingest sensor reading of 82%. <strong>Expected:</strong> Alert fired within 5 seconds, WebSocket notification delivered to subscribed clients, alert logged in audit trail.</p>
<h3>TC-004: Nowcast Precipitation Map Render</h3>
<p><strong>Steps:</strong> Open Nowcast module, select 1-hour forecast view. <strong>Expected:</strong> Precipitation overlay renders within 4 seconds, QPF data matches latest model run, colour scale legend displays correctly.</p>
<h3>TC-005: Bulk User Import</h3>
<p><strong>Steps:</strong> Upload a 50-row CSV via User Management bulk import. <strong>Expected:</strong> All valid rows created, invalid rows reported in error summary, import completion notification sent to admin, audit log entry created.</p>`,
      excerpt: "Functional QA test cases for APWRIMS 2.0 covering login, sensors, alerts, nowcast, and user management"
    },
    update: {}
  });

  await prisma.document.upsert({
    where: { slug: "user-management-release-notes-v2-5" },
    create: {
      title: "User Management — Release Notes v2.5",
      slug: "user-management-release-notes-v2-5",
      type: "RELEASE_NOTE",
      published: true,
      moduleId: userManagement.id,
      authorId: admin.id,
      tags: { connect: [{ id: tagRecords["backend"].id }] },
      content: `<h2>User Management — Release Notes v2.5</h2>
<p>Release v2.5 of the User Management module delivers three major capabilities requested by the State Water Board: SSO integration, bulk user provisioning, and comprehensive audit logging.</p>
<h3>New Features</h3>
<h4>SSO Support (SAML 2.0 / OIDC)</h4>
<p>APWRIMS 2.0 now supports Single Sign-On via SAML 2.0 and OpenID Connect protocols. Administrators can configure identity provider metadata via the Settings → SSO Configuration panel. Supported IdPs: Azure Active Directory, Okta, and any SAML 2.0-compliant provider. Users provisioned through SSO are automatically assigned the EMPLOYEE role unless overridden by attribute mapping rules.</p>
<h4>Bulk User Import</h4>
<p>A new CSV import wizard allows administrators to create or update up to 500 users in a single operation. The CSV template supports fields: email, name, role, department, and designation. Validation runs client-side before upload, providing immediate feedback on malformed rows. Import results are emailed to the initiating administrator.</p>
<h4>Audit Logging</h4>
<p>All user management actions — create, update, delete, role change, login, logout, and failed login attempts — are now recorded in an immutable audit log. Logs are queryable by user, action type, and date range via the Admin → Audit Log interface. Audit records are retained for 5 years in compliance with government data retention requirements.</p>`,
      excerpt: "Release notes for User Management v2.5: SSO support, bulk user import, and audit logging"
    },
    update: {}
  });

  // ─────────────────────────────────────────────
  // Articles (2, published)
  // ─────────────────────────────────────────────
  await prisma.article.upsert({
    where: { slug: "getting-started-with-apwrims-2" },
    create: {
      title: "Getting Started with APWRIMS 2.0",
      slug: "getting-started-with-apwrims-2",
      excerpt: "A quick-start guide for new users of the APWRIMS 2.0 platform.",
      published: true,
      authorId: admin.id,
      categoryId: catGettingStarted.id,
      content: `<h2>Getting Started with APWRIMS 2.0</h2>
<p>Welcome to APWRIMS 2.0 — the Advanced Pradeshiya Water Resources Information and Management System. This guide will help you navigate the platform and start using its core features.</p>
<h3>Step 1: Log In</h3>
<p>Visit <strong>https://apwrims.com</strong> and log in with the credentials provided by your administrator. If your organisation uses SSO, click <strong>Sign in with SSO</strong> and enter your corporate email.</p>
<h3>Step 2: Explore the Dashboard</h3>
<p>After login, you will see the main dashboard showing real-time tank levels, active alerts, and weather overlays for your assigned region. Use the left navigation to switch between modules: Nowcast, MI Tank Alerts, Sensor Management, and User Management.</p>
<h3>Step 3: Set Up Notifications</h3>
<p>Go to <strong>Profile → Notification Preferences</strong> to configure email and SMS alerts for tank threshold breaches and weather warnings. Ensure your mobile number is verified to receive SMS alerts.</p>
<h3>Step 4: Review Training</h3>
<p>Enrol in the <strong>APWRIMS 2.0 Onboarding</strong> course in the LMS section to learn module-by-module usage through guided lessons and assessments.</p>`
    },
    update: {}
  });

  await prisma.article.upsert({
    where: { slug: "how-to-configure-sensor-alerts" },
    create: {
      title: "How to Configure Sensor Alerts",
      slug: "how-to-configure-sensor-alerts",
      excerpt: "Step-by-step guide to setting up sensor alert thresholds in MI Tank Alerts.",
      published: true,
      authorId: dev.id,
      categoryId: catTechnical.id,
      tags: { connect: [{ id: tagRecords["alerts"].id }, { id: tagRecords["sensor"].id }] },
      content: `<h2>How to Configure Sensor Alerts</h2>
<p>This guide explains how to configure alert rules for IoT sensors in the MI Tank Alerts module of APWRIMS 2.0.</p>
<h3>Prerequisites</h3>
<p>You must have the <strong>PROJECT_MANAGER</strong>, <strong>ADMIN</strong>, or <strong>SUPER_ADMIN</strong> role to create or modify alert rules. Ensure the target sensor is registered and actively reporting data.</p>
<h3>Step 1: Navigate to MI Tank Alerts</h3>
<p>From the dashboard, click <strong>MI Tank Alerts</strong> in the left navigation. Select the <strong>Alert Rules</strong> tab at the top of the module page.</p>
<h3>Step 2: Create a New Alert Rule</h3>
<p>Click <strong>+ New Rule</strong>. Fill in the rule details:</p>
<ul>
  <li><strong>Rule Name:</strong> A descriptive label (e.g., "Peddacheruvu Tank — Critical High")</li>
  <li><strong>Sensor:</strong> Select the target sensor from the dropdown</li>
  <li><strong>Condition:</strong> Choose from: Above threshold, Below threshold, Rate of change exceeds</li>
  <li><strong>Threshold Value:</strong> Enter the numeric trigger value (e.g., 85 for 85% capacity)</li>
  <li><strong>Severity:</strong> INFO, WARNING, or CRITICAL</li>
  <li><strong>Notification Channels:</strong> Select email, SMS, or WebSocket dashboard alert</li>
</ul>
<h3>Step 3: Test the Rule</h3>
<p>Use the <strong>Simulate</strong> button to inject a test reading and verify the alert fires correctly. Review the alert in the <strong>Alert History</strong> tab before enabling the rule in production.</p>`
    },
    update: {}
  });

  // ─────────────────────────────────────────────
  // Course: APWRIMS 2.0 Onboarding
  // ─────────────────────────────────────────────
  const course = await prisma.course.upsert({
    where: { slug: "apwrims-2-onboarding" },
    create: {
      title: "APWRIMS 2.0 Onboarding",
      slug: "apwrims-2-onboarding",
      description: "A comprehensive onboarding course for new APWRIMS 2.0 users covering platform navigation, module usage, and best practices.",
      published: true,
      instructorId: projm.id,
      categoryId: catTraining.id
    },
    update: {}
  });

  // CourseModule 1: Platform Overview
  const cm1 = await prisma.courseModule.upsert({
    where: { id: "seed-cm-apwrims-1" },
    create: {
      id: "seed-cm-apwrims-1",
      title: "Platform Overview",
      order: 1,
      courseId: course.id
    },
    update: {}
  });

  await prisma.lesson.upsert({
    where: { id: "seed-lesson-apwrims-1-1" },
    create: {
      id: "seed-lesson-apwrims-1-1",
      title: "Introduction to APWRIMS 2.0",
      order: 1,
      type: "TEXT",
      courseModuleId: cm1.id,
      content: `<h2>Introduction to APWRIMS 2.0</h2>
<p>APWRIMS 2.0 is a next-generation water resources management platform developed for the State Water Board. It integrates IoT sensor networks, real-time analytics, and intelligent alerting to enable data-driven decision-making for water resource managers.</p>
<h3>Platform Architecture</h3>
<p>The platform is built on a microservices architecture with four primary modules: Nowcast (real-time weather analytics), MI Tank Alerts (tank level monitoring), Sensor Management (IoT device management), and User Management (access control). Each module can be accessed independently from the main navigation.</p>
<h3>Key Stakeholders</h3>
<p>APWRIMS 2.0 serves three primary user groups: field engineers who manage sensor hardware, operations staff who monitor alerts and respond to events, and administrators who manage users, configure rules, and review audit trails.</p>
<h3>Getting Help</h3>
<p>Use the in-platform Help Centre (? icon, top right) to access this knowledge base directly. For technical issues, raise a support ticket via the Help → Support Tickets menu. Your Project Manager is your primary point of contact for configuration and access requests.</p>`
    },
    update: {}
  });

  await prisma.lesson.upsert({
    where: { id: "seed-lesson-apwrims-1-2" },
    create: {
      id: "seed-lesson-apwrims-1-2",
      title: "Navigating the Dashboard",
      order: 2,
      type: "TEXT",
      courseModuleId: cm1.id,
      content: `<h2>Navigating the Dashboard</h2>
<p>The APWRIMS 2.0 dashboard is your central control centre. It presents a real-time overview of the water resources network in your assigned jurisdiction.</p>
<h3>Dashboard Widgets</h3>
<p>The default dashboard includes four key widgets: the <strong>Alert Summary</strong> (active alerts by severity), the <strong>Tank Level Map</strong> (geographic view of tank fill levels), the <strong>Weather Overlay</strong> (current precipitation radar), and the <strong>Sensor Health</strong> panel (online/offline sensor count).</p>
<h3>Customising Your View</h3>
<p>Click <strong>Customise Dashboard</strong> (gear icon, top right) to add, remove, or rearrange widgets. You can create multiple named dashboard layouts for different monitoring scenarios — for example, a focused layout showing only critical-severity tanks during the monsoon season.</p>
<h3>Time Zone and Regional Settings</h3>
<p>All timestamps on the dashboard reflect your configured time zone (default: IST, UTC+5:30). To change your region or time zone, navigate to <strong>Profile → Settings → Regional Preferences</strong>.</p>`
    },
    update: {}
  });

  // CourseModule 2: Working with Nowcast
  const cm2 = await prisma.courseModule.upsert({
    where: { id: "seed-cm-apwrims-2" },
    create: {
      id: "seed-cm-apwrims-2",
      title: "Working with Nowcast",
      order: 2,
      courseId: course.id
    },
    update: {}
  });

  await prisma.lesson.upsert({
    where: { id: "seed-lesson-apwrims-2-1" },
    create: {
      id: "seed-lesson-apwrims-2-1",
      title: "Understanding Nowcast Forecasts",
      order: 1,
      type: "TEXT",
      courseModuleId: cm2.id,
      content: `<h2>Understanding Nowcast Forecasts</h2>
<p>The Nowcast module generates short-range precipitation forecasts using a combination of radar extrapolation and numerical weather prediction. Understanding how to interpret these forecasts is essential for effective flood risk management.</p>
<h3>Forecast Products</h3>
<p>Nowcast provides three primary forecast products: the <strong>Precipitation Accumulation Map</strong> (total rainfall expected in the next 1–6 hours), the <strong>Storm Track Overlay</strong> (predicted storm cell movement paths), and the <strong>QPF Confidence Bands</strong> (probabilistic uncertainty range around the central forecast).</p>
<h3>Reading the Colour Scale</h3>
<p>The precipitation maps use a standardised IMD colour scale: green (0–5 mm/hr light rain), yellow (5–15 mm/hr moderate), orange (15–35 mm/hr heavy), red (35–65 mm/hr very heavy), violet (>65 mm/hr extremely heavy). These thresholds align with IMD rainfall classification standards.</p>
<h3>Forecast Confidence</h3>
<p>Nowcast accuracy degrades with lead time. 0–30 minute forecasts have approximately 85% accuracy; 1–2 hour forecasts drop to 65–70%. Always treat 2-hour forecasts as indicative, not definitive, and combine with IMD bulletins for major event decision-making.</p>`
    },
    update: {}
  });

  await prisma.lesson.upsert({
    where: { id: "seed-lesson-apwrims-2-2" },
    create: {
      id: "seed-lesson-apwrims-2-2",
      title: "Setting Precipitation Alert Thresholds",
      order: 2,
      type: "TEXT",
      courseModuleId: cm2.id,
      content: `<h2>Setting Precipitation Alert Thresholds</h2>
<p>Configuring appropriate precipitation alert thresholds is critical to balancing early warning effectiveness with alert fatigue. This lesson covers threshold configuration best practices for APWRIMS 2.0.</p>
<h3>Threshold Types</h3>
<p>APWRIMS 2.0 supports three types of precipitation thresholds: <strong>Instantaneous Rate</strong> (mm/hr at a point in time), <strong>Accumulation</strong> (total mm over a configurable window), and <strong>Areal Rainfall</strong> (average over a defined catchment polygon). Areal thresholds are recommended for reservoir inflow alerts.</p>
<h3>Recommended Starting Values</h3>
<p>For most MI tank catchments, a starting configuration of WARNING at 15 mm/hr instantaneous or 25 mm in 3 hours, and CRITICAL at 35 mm/hr or 50 mm in 3 hours, provides a reasonable balance. These values should be tuned based on catchment area, tank capacity, and historical inflow data from at least one full monsoon season.</p>
<h3>Adjusting Thresholds</h3>
<p>Navigate to <strong>Nowcast → Alert Thresholds → Manage Rules</strong>. Click the edit icon next to the rule you wish to modify. Changes take effect immediately for new incoming data. Review alert history after any threshold change to validate the new configuration is performing as expected.</p>`
    },
    update: {}
  });

  // ─────────────────────────────────────────────
  // Assessment: APWRIMS 2.0 Fundamentals
  // ─────────────────────────────────────────────
  const assessment = await prisma.assessment.upsert({
    where: { id: "seed-assessment-apwrims-fundamentals" },
    create: {
      id: "seed-assessment-apwrims-fundamentals",
      title: "APWRIMS 2.0 Fundamentals Assessment",
      description: "Test your understanding of the APWRIMS 2.0 platform core concepts and modules.",
      passingScore: 70,
      moduleId: nowcast.id
    },
    update: {}
  });

  await prisma.question.upsert({
    where: { id: "seed-q-apwrims-1" },
    create: {
      id: "seed-q-apwrims-1",
      text: "What does the acronym QPF stand for in the context of the Nowcast module?",
      type: "MCQ",
      options: [
        "Quantitative Precipitation Forecast",
        "Quick Precipitation Filter",
        "Qualified Precipitation Framework",
        "Queued Predictive Function"
      ],
      answer: "Quantitative Precipitation Forecast",
      marks: 1,
      assessmentId: assessment.id
    },
    update: {}
  });

  await prisma.question.upsert({
    where: { id: "seed-q-apwrims-2" },
    create: {
      id: "seed-q-apwrims-2",
      text: "Which technology does the MI Tank Alerts module use to deliver real-time notifications to dashboard clients?",
      type: "MCQ",
      options: [
        "WebSockets (Socket.IO)",
        "HTTP long polling",
        "Server-Sent Events",
        "Email push notifications"
      ],
      answer: "WebSockets (Socket.IO)",
      marks: 1,
      assessmentId: assessment.id
    },
    update: {}
  });

  await prisma.question.upsert({
    where: { id: "seed-q-apwrims-3" },
    create: {
      id: "seed-q-apwrims-3",
      text: "What is the maximum lead time for Nowcast precipitation forecasts in APWRIMS 2.0?",
      type: "MCQ",
      options: [
        "2 hours",
        "6 hours",
        "12 hours",
        "30 minutes"
      ],
      answer: "2 hours",
      marks: 1,
      assessmentId: assessment.id
    },
    update: {}
  });

  console.log("Seed complete! 9 users, 1 platform, 3 products, 2 projects, 4 modules.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
