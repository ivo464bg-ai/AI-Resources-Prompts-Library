import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const p = (title, prompt_text, result_text) => ({ title, prompt_text, result_text });

const USER_CATEGORY_BLUEPRINTS = [
  [
    {
      name: 'Frontend Development',
      description: 'UI implementation patterns, accessibility, and performance for web apps.',
      prompts: [
        p(
          'Accessible Pricing Cards in Bootstrap',
          'Create semantic HTML and Bootstrap classes for a 3-tier pricing section with keyboard-friendly focus states and clear ARIA labels.',
          'Here is an accessible layout: wrap cards in a <section aria-labelledby="pricing-heading">, use a <h2 id="pricing-heading">, place each plan in an <article>, and add visible .focus-ring classes for CTA buttons. I included utility classes for equal-height cards and a "Most Popular" badge announced by screen readers.'
        ),
        p(
          'Refactor Vanilla JS Form Validation',
          'Refactor a long JavaScript function that validates registration forms into small reusable validators with clear error messages.',
          'I split the logic into validators for email, password strength, and required fields, then composed them in a single validateForm() function. Each validator returns { valid, message }, making it easy to show inline feedback and reuse rules across login and signup forms.'
        ),
        p(
          'Optimize Largest Contentful Paint',
          'Give me a practical checklist to improve LCP on a Vite multi-page app that uses Bootstrap and image-heavy hero sections.',
          'Priority actions: preload hero image, serve WebP/AVIF with responsive srcset, inline critical CSS for above-the-fold content, defer non-critical scripts, and avoid render-blocking web fonts. I also suggested using Lighthouse plus WebPageTest to validate LCP improvements by route.'
        ),
        p(
          'Dark Mode Without Framework',
          'Draft a plain JavaScript approach for light/dark theme toggle with localStorage persistence and no UI framework.',
          'Use data-theme on <html>, define CSS variables for both themes, and toggle via a button listener. On load, read localStorage or prefers-color-scheme. This keeps theme logic centralized and avoids duplicating component styles.'
        ),
        p(
          'Reusable Toast Component API',
          'Design a small API for Bootstrap toasts in vanilla JS: success, warning, and error variants with optional auto-close.',
          'Proposed API: showToast({ type, title, message, delay = 4000 }). The helper creates a toast element, maps type to Bootstrap contextual classes, supports aria-live="polite", and removes the element after hidden.bs.toast for memory safety.'
        )
      ]
    },
    {
      name: 'SEO Strategy',
      description: 'Organic traffic planning, technical SEO, and search intent optimization.',
      prompts: [
        p(
          'Keyword Cluster for AI Prompt Library',
          'Build a keyword cluster strategy for an "AI prompts library" product targeting beginners, power users, and teams.',
          'I organized terms into three intent buckets: Learn ("how to write AI prompts"), Compare ("best prompt managers"), and Buy ("prompt library for teams"). For each bucket I suggested pillar pages, internal links, and conversion-focused CTAs.'
        ),
        p(
          'Meta Titles for Feature Pages',
          'Write 10 SEO-friendly meta title and description pairs for pages about categories, saved prompts, and prompt analytics.',
          'I generated concise metadata under recommended length limits, with primary keywords near the beginning and unique value propositions such as "private by default" and "Supabase-secured storage" to improve CTR.'
        ),
        p(
          'Technical SEO Audit Checklist',
          'Create a technical SEO audit checklist for a Vite app deployed on Netlify with multiple HTML pages.',
          'Checklist includes canonical tags per route, XML sitemap generation, robots.txt validation, 301 redirects for renamed pages, structured data where relevant, image alt quality checks, and Core Web Vitals monitoring in Search Console.'
        ),
        p(
          'Content Brief for Comparison Article',
          'Draft a content brief for "AI Prompt Library vs Notion vs Spreadsheets" including headings, audience, and proof points.',
          'The brief defines audience pain points, proposes an H2 structure with objective comparison criteria (searchability, permissions, versioning), and recommends adding screenshots plus a migration checklist to increase trust.'
        ),
        p(
          'Recover Rankings After URL Changes',
          'Give me a step-by-step recovery plan after changing page URLs and losing organic traffic for two weeks.',
          'I suggested mapping old-to-new URLs with 301s, fixing internal links, resubmitting sitemap, checking crawl errors, and updating canonical tags. I also included a 4-week monitoring template for impressions, clicks, and indexed pages.'
        )
      ]
    },
    {
      name: 'Email Marketing',
      description: 'Lifecycle email campaigns, segmentation, and deliverability improvements.',
      prompts: [
        p(
          'Welcome Sequence for New Users',
          'Draft a 4-email onboarding sequence for users who just registered in a prompt management app.',
          'I created a sequence with goals per email: activation, first value moment, habit formation, and upgrade prompt. Each email includes subject line options, body copy, and a single focused CTA.'
        ),
        p(
          'Re-Engagement Campaign for Inactive Accounts',
          'Write a polite re-engagement email for users inactive for 30 days, offering helpful tips instead of aggressive sales language.',
          'Subject: "Still building with AI?" Body: acknowledges busy schedules, shares 3 quick wins, invites users to import one old prompt, and offers a clean unsubscribe option. Tone remains supportive and non-pushy.'
        ),
        p(
          'A/B Test Ideas for CTA Buttons',
          'Suggest 12 A/B test hypotheses for improving click-through rate in product update newsletters.',
          'Tests include first-person CTA copy, button color contrast checks, benefit-first headlines, social proof blocks, and shorter preheader text. I added expected impact and confidence level for each hypothesis.'
        ),
        p(
          'Deliverability Improvement Plan',
          'Create a deliverability plan to reduce spam placement for weekly campaign emails sent to 20,000 subscribers.',
          'Plan covers SPF/DKIM/DMARC validation, list hygiene, sunset policy for inactive contacts, throttled warm-up for sending domains, and plain-text fallback to improve mailbox placement rates.'
        ),
        p(
          'Quarterly Newsletter Editorial Calendar',
          'Build a 12-week editorial calendar for an AI productivity newsletter with educational and case-study content.',
          'I proposed weekly themes, target segment, CTA objective, and content format mix (tutorial, case study, template, community spotlight). Calendar balances value-driven education with periodic product announcements.'
        )
      ]
    }
  ],
  [
    {
      name: 'Python Automation',
      description: 'Python scripts for workflow automation, data extraction, and task scheduling.',
      prompts: [
        p(
          'Automate CSV Cleanup Script',
          'Write a Python script that reads messy CSV sales data, normalizes column names, removes duplicates, and outputs a clean file.',
          'I provided a pandas-based script that lowercases headers, trims whitespace, parses dates safely, drops duplicate invoice rows, and exports to cleaned_sales.csv with a summary log of changed records.'
        ),
        p(
          'Scheduled Invoice Reminder Emails',
          'Generate a Python script that runs daily and emails customers with unpaid invoices older than 14 days.',
          'The solution uses schedule + smtplib, filters unpaid invoices from a local database export, and sends templated reminders with polite wording. It includes retry handling and basic logging for sent vs failed emails.'
        ),
        p(
          'Website Uptime Notifier',
          'Create a Python monitoring script that checks a list of URLs every 5 minutes and alerts in Slack when a site is down.',
          'I used requests with timeout thresholds, tracked consecutive failures to reduce false alarms, and posted structured Slack webhook messages with status code, response time, and incident timestamp.'
        ),
        p(
          'Bulk Rename Files by Pattern',
          'Provide a Python utility to rename hundreds of image files into a consistent pattern like product-001.jpg, product-002.jpg.',
          'The script walks a directory with pathlib, sorts by creation date, preserves file extensions, and supports a dry-run mode before applying renames to prevent accidental changes.'
        ),
        p(
          'Extract Data from PDF Reports',
          'Draft Python code to extract invoice numbers and totals from PDF reports and append them to an Excel sheet.',
          'I suggested pdfplumber for text extraction, regex patterns for invoice fields, and openpyxl for appending rows. The script validates duplicates and writes an error sheet for unparsed pages.'
        )
      ]
    },
    {
      name: 'Creative Writing',
      description: 'Storytelling, narrative prompts, and style experimentation for fiction and nonfiction.',
      prompts: [
        p(
          'Short Story Opening with Tension',
          'Write an opening paragraph for a short story where a museum curator discovers a painting that changes every night.',
          'At closing time, Mara checked the final gallery and froze: the woman in the portrait now held a key she had not held that morning. Security logs showed no one entering the room, yet the brushstrokes were unmistakably fresh.'
        ),
        p(
          'Rewrite Paragraph in Hemingway Style',
          'Rewrite this dense paragraph in a concise Hemingway-like style while preserving meaning and emotional tone.',
          'I trimmed abstract wording, shortened sentence length, and kept concrete sensory details. The revised paragraph reads cleaner, with stronger verbs and less adverb-heavy phrasing.'
        ),
        p(
          'Character Backstory Questionnaire',
          'Create a deep character questionnaire for a fantasy novel protagonist who is both healer and former smuggler.',
          'The questionnaire includes formative memories, moral boundaries, hidden shame, speech patterns, and "pressure tests" for plotting. It helps align character choices with internal conflict across the arc.'
        ),
        p(
          'Poem Revision for Stronger Imagery',
          'Improve this free-verse poem by replacing clichés with concrete imagery and better line breaks.',
          'I replaced generic phrases like "broken heart" with scene-level images, tightened line breaks around emotional pivots, and introduced subtle sound patterns for rhythm without forcing rhyme.'
        ),
        p(
          'Dialogue Pass for Distinct Voices',
          'Edit this dialogue scene so each speaker sounds unique by age, background, and motivation.',
          'I differentiated voices through syntax and diction: the professor speaks in layered clauses, the mechanic uses practical shorthand, and the teen interrupts with quick, uncertain questions to show urgency.'
        )
      ]
    },
    {
      name: 'Data Analysis',
      description: 'Exploratory analysis, metrics interpretation, and business reporting insights.',
      prompts: [
        p(
          'Monthly Revenue Trend Interpretation',
          'Analyze monthly recurring revenue data and explain likely causes for a dip in August and rebound in September.',
          'The analysis links the August dip to seasonal churn in small-business accounts and delayed annual renewals. The September rebound aligns with a pricing campaign and reduced cancellation rate among mid-market customers.'
        ),
        p(
          'Cohort Retention Summary',
          'Create a plain-language summary of cohort retention for product and marketing stakeholders.',
          'I summarized retention by signup month, highlighted where onboarding changes improved week-4 retention, and proposed two experiments targeting the highest-drop segments to raise long-term activation.'
        ),
        p(
          'Anomaly Detection in Support Tickets',
          'Suggest an approach to detect anomalies in daily support ticket volume and categorize root causes quickly.',
          'Recommended approach: rolling baseline with z-score thresholds, alert only on sustained spikes, and auto-tag spikes by topic (billing, login, API errors). This reduces noise while preserving operational visibility.'
        ),
        p(
          'Executive Dashboard KPI Selection',
          'Choose 8 KPIs for a SaaS executive dashboard and justify why each metric belongs there.',
          'I selected MRR growth, net revenue retention, CAC payback, activation rate, churn, gross margin, trial-to-paid conversion, and support backlog. Each KPI is tied to a concrete business decision.'
        ),
        p(
          'SQL Query for Conversion Funnel',
          'Write a SQL query to calculate conversion rates from signup to first prompt saved to paid subscription.',
          'The query builds staged CTEs, counts distinct users per stage, and computes percentage drop-off between steps. I included notes for handling duplicate events and late-arriving timestamps.'
        )
      ]
    }
  ],
  [
    {
      name: 'UX Research',
      description: 'User interviews, usability testing, and evidence-based product decisions.',
      prompts: [
        p(
          'Interview Guide for New Feature Discovery',
          'Draft a 30-minute interview guide to understand how freelancers store and reuse AI prompts.',
          'The guide includes warm-up context questions, current-workflow mapping, pain-point probing, and concept reactions. It avoids leading language and ends with prioritization prompts for unmet needs.'
        ),
        p(
          'Usability Test Script for Search Flow',
          'Create a moderated usability script to test if users can find a saved prompt in under 60 seconds.',
          'I provided task instructions, facilitator prompts, success criteria, and post-task confidence questions. The script captures both completion time and behavioral friction points.'
        ),
        p(
          'Persona Snapshot from Interview Notes',
          'Summarize these interview notes into a concise persona with goals, frustrations, and preferred tools.',
          'Persona output: "Alex, solo consultant" who values speed and trust. Key frustration is losing context across experiments. Preferred tools are keyboard-first interfaces and reusable template libraries.'
        ),
        p(
          'Card Sorting Study Setup',
          'Plan an open card sorting study to validate category labels for prompt organization.',
          'I suggested 20-30 cards, remote unmoderated sessions, and analysis by cluster similarity plus disagreement hotspots. Deliverable includes recommended taxonomy changes and renamed labels.'
        ),
        p(
          'Research Readout for Stakeholders',
          'Write a one-page UX research readout that turns findings into prioritized product recommendations.',
          'The readout structure covers objective, participants, top findings, evidence snapshots, and a ranked action plan with effort/impact scores so engineering and design can align quickly.'
        )
      ]
    },
    {
      name: 'Product Management',
      description: 'Roadmapping, prioritization, and cross-functional planning for feature delivery.',
      prompts: [
        p(
          'PRD for Prompt Templates Feature',
          'Create a product requirements document for a "Prompt Templates" feature including scope, success metrics, and non-goals.',
          'The PRD defines target users, user stories, acceptance criteria, and a rollout plan. Success metrics include template adoption rate and reduction in time-to-first-saved-prompt.'
        ),
        p(
          'RICE Prioritization of Backlog',
          'Score these 10 backlog items using the RICE framework and explain tradeoffs in plain language.',
          'I calculated reach, impact, confidence, and effort for each item, then highlighted why high-confidence onboarding improvements outrank lower-confidence advanced customization work this quarter.'
        ),
        p(
          'Quarterly Roadmap Narrative',
          'Write a roadmap narrative for Q3 that balances growth initiatives with technical debt reduction.',
          'Narrative theme: "Reliability first, then expansion." It sequences auth hardening and performance stabilization before launching collaboration features, reducing execution risk across teams.'
        ),
        p(
          'Release Notes for v1.8',
          'Draft customer-facing release notes for version 1.8 with clear user benefits and migration notes.',
          'Release notes are grouped by "New", "Improved", and "Fixed" sections, each framed in user outcomes. I also included a short migration checklist for renamed settings.'
        ),
        p(
          'Feature Adoption KPI Plan',
          'Design a KPI tracking plan for a new feature from launch day through week 8.',
          'I proposed leading indicators (activation in 24h, first successful use), lagging indicators (retention uplift), instrumentation events, dashboard slices by segment, and weekly decision checkpoints.'
        )
      ]
    },
    {
      name: 'Customer Support Operations',
      description: 'Support workflows, knowledge base quality, and ticket response optimization.',
      prompts: [
        p(
          'Tier-1 Response Macro Library',
          'Generate five support response macros for common issues: login, billing, file upload, search, and account deletion.',
          'I wrote concise macros with empathetic tone, clear next actions, and placeholders for user/account context. Each macro includes escalation criteria when first-line troubleshooting fails.'
        ),
        p(
          'Escalation Matrix Design',
          'Build an escalation matrix that routes urgent technical incidents to the right team within 15 minutes.',
          'The matrix defines severity levels, trigger conditions, ownership by function, and SLA targets. It includes a handoff template to reduce information loss during escalation.'
        ),
        p(
          'Knowledge Base Article Rewrite',
          'Rewrite this long troubleshooting article into a scannable step-by-step guide with troubleshooting branches.',
          'I converted dense paragraphs into ordered steps, added decision points ("If yes / If no"), and included expected outcomes after each step so customers can self-serve more reliably.'
        ),
        p(
          'Support QA Scorecard',
          'Create a QA scorecard for support replies that evaluates accuracy, empathy, and resolution quality.',
          'Scorecard has weighted criteria with examples of strong and weak responses. It supports coachable feedback and monthly calibration among support leads.'
        ),
        p(
          'Shift Handoff Summary Template',
          'Draft a handoff template for support teams changing shifts so unresolved cases keep momentum.',
          'Template includes active incidents, pending customer responses, blockers, owner, and next action with deadline. I added a brief "risk watch" section for emerging issues.'
        )
      ]
    }
  ],
  [
    {
      name: 'Cybersecurity',
      description: 'Security hardening, incident response, and threat reduction practices.',
      prompts: [
        p(
          'Phishing Awareness Training Email',
          'Write a company-wide phishing awareness email that is clear, practical, and non-alarmist.',
          'The message explains recent phishing patterns, gives 5 quick verification checks, and links to a reporting channel. Tone is calm and action-focused to encourage reporting instead of blame.'
        ),
        p(
          'Incident Response Runbook Outline',
          'Create an incident response runbook outline for suspected credential compromise in a SaaS app.',
          'Outline covers detection, containment, communication, forensic evidence handling, customer notices, and post-incident review. It emphasizes rapid session revocation and audit-log preservation.'
        ),
        p(
          'Least-Privilege Access Review',
          'Design a monthly least-privilege access review process for engineering and support tools.',
          'Process includes owner attestations, stale account cleanup, role-rights recertification, and exception tracking with expiry dates. This reduces long-lived excessive permissions.'
        ),
        p(
          'Security Questionnaire Response Draft',
          'Draft concise answers for a customer security questionnaire covering encryption, backups, and access controls.',
          'I produced plain-language responses with placeholders for environment-specific details, avoiding overpromising while still communicating strong baseline controls and monitoring practices.'
        ),
        p(
          'Password Policy Communication',
          'Create a user-friendly announcement for updated password and MFA policy changes.',
          'Announcement explains what changes, why it matters, and a step-by-step setup path for MFA. It includes support contact details and a grace period timeline for smoother adoption.'
        )
      ]
    },
    {
      name: 'DevOps and SRE',
      description: 'Reliability engineering, CI/CD pipelines, and operational resilience.',
      prompts: [
        p(
          'CI Pipeline for Multi-Page App',
          'Design a CI pipeline for a Vite multi-page JavaScript app that runs lint, build, and deployment checks.',
          'Pipeline stages: install dependencies with cache, run lint, run unit tests if present, build production artifacts, and validate generated pages. Fail-fast rules prevent broken deploys.'
        ),
        p(
          'Postmortem Template for Outages',
          'Create an incident postmortem template that encourages learning and avoids blame.',
          'Template sections include timeline, impact, contributing factors, what went well, and corrective actions with owners. It uses neutral language and focuses on systemic improvements.'
        ),
        p(
          'SLO Definition for API Reliability',
          'Propose SLOs and error budget policy for an API used by dashboard and prompt-saving features.',
          'Suggested SLOs: 99.9% successful write operations and p95 latency under 400ms for core endpoints. Error budget policy defines release freeze criteria and exception review workflow.'
        ),
        p(
          'Blue-Green Deployment Playbook',
          'Write a deployment playbook for blue-green releases with health checks and rollback criteria.',
          'Playbook includes pre-flight checks, staged traffic shifting, real-time KPI monitoring, and instant rollback triggers on error-rate thresholds to reduce deployment risk.'
        ),
        p(
          'Alert Fatigue Reduction Strategy',
          'Give me a practical plan to reduce alert noise while keeping critical incident detection strong.',
          'I recommended alert deduplication, severity-based routing, time-window suppression for known maintenance, and periodic alert quality reviews tied to measurable false-positive rates.'
        )
      ]
    },
    {
      name: 'Cloud Architecture',
      description: 'Scalable cloud system design, cost optimization, and resiliency decisions.',
      prompts: [
        p(
          'Design for Multi-Region Availability',
          'Describe a cloud architecture approach for serving users in EU and US with low latency and high availability.',
          'I proposed active-passive regional setup with geo-routing, read replicas near traffic centers, and failover runbooks. Data residency considerations are separated from caching layers.'
        ),
        p(
          'Cost Optimization Review',
          'Create a monthly cloud cost optimization checklist for compute, storage, and data transfer.',
          'Checklist includes rightsizing instances, storage lifecycle policies, reserved capacity review, unused resource cleanup, and anomaly alerts for transfer spikes and idle services.'
        ),
        p(
          'Architecture Decision Record Draft',
          'Draft an ADR comparing managed database services versus self-hosted database clusters.',
          'ADR outlines context, options, tradeoffs, and recommendation criteria across reliability, operational burden, compliance, and long-term cost so teams can make transparent choices.'
        ),
        p(
          'Disaster Recovery Drill Plan',
          'Build a quarterly disaster recovery drill plan for restoring critical services within a 2-hour RTO.',
          'Plan includes scenario selection, restoration steps, role assignments, communication checklist, and success criteria for RTO/RPO verification plus post-drill action items.'
        ),
        p(
          'Secure Network Segmentation Proposal',
          'Write a proposal for network segmentation between public services, internal APIs, and admin-only tooling.',
          'Proposal defines subnet boundaries, least-privilege security groups, jump-host controls, and logging requirements, reducing lateral movement risk while preserving maintainability.'
        )
      ]
    }
  ],
  [
    {
      name: 'HR and Recruiting',
      description: 'Hiring workflows, candidate communication, and people operations playbooks.',
      prompts: [
        p(
          'Job Description for Junior QA Engineer',
          'Draft a clear and inclusive job description for a Junior QA Engineer role in a SaaS company.',
          'I wrote a structured posting with responsibilities, must-have skills, growth expectations, and inclusive language. It avoids inflated requirements and emphasizes mentorship support.'
        ),
        p(
          'Candidate Rejection Email with Feedback',
          'Write a respectful rejection email that includes brief constructive feedback after a technical interview.',
          'Email thanks the candidate, acknowledges effort, and shares focused feedback on one improvement area plus encouragement to reapply. Tone remains kind and professional.'
        ),
        p(
          'Structured Interview Scorecard',
          'Create a scorecard for interviewing frontend candidates with criteria and behavior-based indicators.',
          'Scorecard includes technical fundamentals, debugging approach, communication, and collaboration. Each criterion has anchored ratings to reduce subjective evaluation bias.'
        ),
        p(
          '30-60-90 Day Onboarding Plan',
          'Build a 30-60-90 day onboarding plan for a newly hired customer success manager.',
          'Plan sets milestones by phase: learning product and workflows, owning small accounts, then managing renewal conversations independently with measurable success indicators.'
        ),
        p(
          'Internal Referral Program Announcement',
          'Draft an internal announcement to relaunch employee referrals with clear rewards and timelines.',
          'Announcement explains eligible roles, referral steps, reward tiers, and payout timing. It includes examples of strong referrals and a simple FAQ for common policy questions.'
        )
      ]
    },
    {
      name: 'Financial Planning',
      description: 'Budgeting, forecasting, and finance communication for business operations.',
      prompts: [
        p(
          'Quarterly Budget Variance Analysis',
          'Explain how to present quarterly budget variance to non-finance stakeholders with clear narrative.',
          'I suggested framing by "what changed, why it changed, what we do next," then showing top favorable and unfavorable variances with plain-language drivers and corrective actions.'
        ),
        p(
          'Cash Flow Forecast Template',
          'Create a monthly cash flow forecast template for a startup with subscription and services revenue.',
          'Template separates recurring vs one-time revenue, payroll and vendor obligations, and scenario assumptions. It includes runway calculation and warning thresholds for decision-making.'
        ),
        p(
          'Board Update Financial Summary',
          'Draft a concise board update section summarizing revenue, burn, and runway in one page.',
          'The summary highlights trend context, key risks, and mitigation steps while avoiding raw metric overload. It provides a clean narrative suitable for strategic discussions.'
        ),
        p(
          'Pricing Sensitivity Thought Exercise',
          'Model the impact of a 10% price increase on conversion and retention with scenario assumptions.',
          'I laid out conservative, base, and optimistic scenarios, showing net revenue outcomes after expected conversion decline and churn impact, with recommendations for phased rollout tests.'
        ),
        p(
          'Expense Policy Reminder Email',
          'Write a polite internal email reminding employees about travel and software expense policy.',
          'Email uses friendly language, gives quick examples of reimbursable vs non-reimbursable items, and links approval workflow to reduce delayed submissions and confusion.'
        )
      ]
    },
    {
      name: 'Legal and Compliance',
      description: 'Policy drafting, compliance communication, and governance processes.',
      prompts: [
        p(
          'Privacy Policy Simplification',
          'Rewrite this privacy policy section into plain language without changing legal meaning.',
          'I translated legal jargon into user-friendly terms, preserved key obligations, and organized content by "what we collect, why, how long we keep it, and your choices" for clarity.'
        ),
        p(
          'DPA Negotiation Response Draft',
          'Draft a response to a customer asking for changes in the data processing agreement.',
          'The response acknowledges the request, summarizes accepted edits, flags sections needing legal review, and proposes a timeline. Tone is cooperative and contract-aware.'
        ),
        p(
          'Compliance Evidence Request Checklist',
          'Create a checklist for gathering evidence before a SOC 2 readiness review.',
          'Checklist includes access reviews, incident logs, change management records, backup test proofs, and policy acknowledgments. It maps each item to likely auditor expectations.'
        ),
        p(
          'Terms of Service Update Notice',
          'Write a customer notice for upcoming Terms of Service updates with effective date and key changes.',
          'Notice presents major updates in bullet form, states effective date clearly, links full terms, and offers a support contact for questions, reducing confusion during policy transition.'
        ),
        p(
          'Vendor Risk Assessment Questions',
          'Generate a concise vendor security and compliance questionnaire before signing a SaaS contract.',
          'Questionnaire covers encryption, access controls, subprocessor transparency, breach notification SLAs, data deletion guarantees, and business continuity posture.'
        )
      ]
    }
  ]
];

async function fetchExistingUsers(limit = 5) {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });

  if (error) {
    throw new Error(`Failed to fetch existing users: ${error.message}`);
  }

  const users = (data?.users ?? [])
    .slice()
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  if (users.length < limit) {
    throw new Error(`Expected at least ${limit} users, found ${users.length}`);
  }

  return users.slice(0, limit);
}

function buildCategoryRows(userId, categories) {
  return categories.map((category) => ({
    user_id: userId,
    name: category.name,
    description: category.description
  }));
}

function buildPromptRows(userId, insertedCategories, categoryBlueprints) {
  const categoryIdByName = new Map(insertedCategories.map((category) => [category.name, category.id]));
  const promptRows = [];

  for (const categoryBlueprint of categoryBlueprints) {
    const categoryId = categoryIdByName.get(categoryBlueprint.name);

    if (!categoryId) {
      throw new Error(`Category mapping failed for "${categoryBlueprint.name}"`);
    }

    for (const prompt of categoryBlueprint.prompts) {
      promptRows.push({
        user_id: userId,
        category_id: categoryId,
        title: prompt.title,
        prompt_text: prompt.prompt_text,
        result_text: prompt.result_text,
        file_url: null
      });
    }
  }

  return promptRows;
}

function validateBlueprints() {
  if (USER_CATEGORY_BLUEPRINTS.length !== 5) {
    throw new Error('Seed blueprint must contain exactly 5 user groups.');
  }

  const categoryNames = new Set();
  const promptTitles = new Set();

  for (const userBlueprint of USER_CATEGORY_BLUEPRINTS) {
    if (userBlueprint.length !== 3) {
      throw new Error('Each user group must contain exactly 3 categories.');
    }

    for (const category of userBlueprint) {
      if (categoryNames.has(category.name)) {
        throw new Error(`Duplicate category detected: ${category.name}`);
      }
      categoryNames.add(category.name);

      if (!Array.isArray(category.prompts) || category.prompts.length !== 5) {
        throw new Error(`Category "${category.name}" must contain exactly 5 prompts.`);
      }

      for (const prompt of category.prompts) {
        if (promptTitles.has(prompt.title)) {
          throw new Error(`Duplicate prompt title detected: ${prompt.title}`);
        }
        promptTitles.add(prompt.title);
      }
    }
  }
}

async function seedData() {
  console.log('Starting database seeding with diverse and unique demo data...');

  validateBlueprints();

  const users = await fetchExistingUsers(5);
  let categoriesInsertedTotal = 0;
  let promptsInsertedTotal = 0;

  for (let userIndex = 0; userIndex < users.length; userIndex += 1) {
    const user = users[userIndex];
    const categoryBlueprints = USER_CATEGORY_BLUEPRINTS[userIndex];

    console.log(`\nSeeding user ${userIndex + 1}/5: ${user.email} (${user.id})`);

    const categoryRows = buildCategoryRows(user.id, categoryBlueprints);

    const { data: insertedCategories, error: categoryError } = await supabase
      .from('categories')
      .insert(categoryRows)
      .select('id, name');

    if (categoryError) {
      throw new Error(`Failed to insert categories for ${user.email}: ${categoryError.message}`);
    }

    categoriesInsertedTotal += insertedCategories.length;
    console.log(`Inserted ${insertedCategories.length} categories for ${user.email}`);

    const promptRows = buildPromptRows(user.id, insertedCategories, categoryBlueprints);

    const { error: promptsError } = await supabase
      .from('prompts')
      .insert(promptRows);

    if (promptsError) {
      throw new Error(`Failed to insert prompts for ${user.email}: ${promptsError.message}`);
    }

    promptsInsertedTotal += promptRows.length;
    console.log(`Inserted ${promptRows.length} prompts for ${user.email}`);
  }

  console.log('\nSeeding completed successfully.');
  console.log(`Total categories inserted: ${categoriesInsertedTotal}`);
  console.log(`Total prompts inserted: ${promptsInsertedTotal}`);
}

seedData().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
