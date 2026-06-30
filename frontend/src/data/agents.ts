export interface Agent {
  id: string
  name: string
  category: string
  deploymentType: string
  setup: string
  description: string
  icon: 'chat' | 'phone' | 'chart' | 'headset' | 'shield' | 'doc'
  integrations?: string[]
  useCases?: string[]
  supportedDepts?: string[]
  dataSources?: string[]
  compliance?: string[]
  setupReqs?: string[]
  implSteps?: string[]
  sampleQ?: string
  sampleA?: string
  deptCount?: number
  sourceCount?: number
}

export const AGENTS: Agent[] = [
  {
    id: 'igna-chat',
    name: 'IGNA Chat',
    category: 'Resident Services',
    deploymentType: 'Website Script Tag',
    setup: '1–3 days',
    description:
      'AI-powered website chat assistant that helps residents find answers, complete service requests, and navigate municipal information.',
    icon: 'chat',
    useCases: [
      'Resident FAQ support',
      'Form guidance',
      'After-hours support',
      'Website navigation support',
      'Department routing',
      'Multilingual readiness (preview)',
    ],
    supportedDepts: ['Clerk', 'Public Works', 'Permits', 'Customer Service'],
    dataSources: ['Municipal website pages', 'Department FAQs', 'Forms library', 'Public notices'],
    compliance: [
      'Responses reference approved public content only',
      'No personal resident data is stored in chat',
      'Emergency questions are routed to official channels',
      'Transcript retention follows state policy',
    ],
    setupReqs: [
      'Municipality details',
      'Public website URL',
      'Source URLs to be indexed',
      'Department contacts',
      'Escalation rules',
    ],
    implSteps: [
      'Submit a deployment request and provide entity details.',
      'Configure data sources, connectors, or integration settings.',
      'Acknowledge applicable state AI policies.',
      'State team validates the request and generates a deployment package.',
      'Install or activate the package and verify operation.',
      'Monitor adoption through the Deployment Center.',
    ],
    sampleQ: 'How do I apply for a block party permit?',
    sampleA:
      "To apply for a block party permit in Trenton, complete the Special Event Application at least 30 days before the event. You can download the form at trentonnj.org/permits. Need help? I can connect you with the Clerk's office.",
    deptCount: 4,
    sourceCount: 4,
  },
  {
    id: 'igna-voice',
    name: 'IGNA Voice',
    category: 'Voice Automation',
    deploymentType: 'Phone / Voice Integration',
    setup: '3–5 days',
    description:
      'AI voice assistant for handling resident calls, routing requests, answering FAQs, and supporting after-hours service.',
    icon: 'phone',
    useCases: [
      'Inbound call handling',
      'FAQ automation',
      'Department routing',
      'After-hours IVR',
      'Callback scheduling',
    ],
    supportedDepts: ['Main Office', 'Public Works', 'Permits', 'Parks & Recreation'],
    dataSources: ['Call scripts', 'Department directories', 'FAQ database'],
    compliance: [
      'Voice interactions are logged per state policy',
      'No sensitive personal data retained after session',
      'Emergency calls are routed to 911',
    ],
    setupReqs: ['Phone system access', 'Department routing rules', 'FAQ content'],
    implSteps: [
      'Submit deployment request with entity and contact details.',
      'Configure call routing and IVR scripts.',
      'Connect to existing phone infrastructure.',
      'Run test calls and validate routing.',
      'Go live and monitor call metrics.',
    ],
    deptCount: 4,
    sourceCount: 3,
  },
  {
    id: 'igna-finance',
    name: 'IGNA Insight Finance',
    category: 'Finance Intelligence',
    deploymentType: 'Connector Configuration + Deployment',
    setup: '3–7 days',
    description:
      'AI finance intelligence agent for budget analysis, revenue trends, cash flow, vendor spend, duplicate payments, and financial anomaly detection.',
    icon: 'chart',
    integrations: ['MSI', 'Edmunds', 'SDL', 'GovPilot'],
    useCases: [
      'Budget variance analysis',
      'Revenue forecasting',
      'Vendor spend tracking',
      'Duplicate payment detection',
      'Anomaly alerts',
    ],
    supportedDepts: ['Finance', 'Accounting', 'Budget Office'],
    dataSources: ['ERP system', 'Budget files', 'Vendor invoices', 'Bank feeds'],
    compliance: [
      'Financial data processed within secure enclave',
      'No raw data stored beyond session',
      'Audit logs retained per state policy',
    ],
    setupReqs: ['ERP connector credentials', 'Budget data access', 'Finance team contacts'],
    implSteps: [
      'Submit request and provide finance system details.',
      'Configure connector to ERP or financial system.',
      'Define budget categories and anomaly thresholds.',
      'Run validation with sample data.',
      'Deploy and monitor dashboards.',
    ],
    deptCount: 3,
    sourceCount: 4,
  },
  {
    id: 'igna-helpdesk',
    name: 'IGNA Insight Helpdesk',
    category: 'Helpdesk Intelligence',
    deploymentType: 'Ticketing System Connector',
    setup: '2–5 days',
    description:
      'AI agent for analyzing helpdesk activity, ticket trends, service gaps, staff workload, and recurring support issues.',
    icon: 'headset',
    integrations: ['Zendesk', 'ServiceNow'],
    useCases: [
      'Ticket trend analysis',
      'Staff workload monitoring',
      'SLA compliance tracking',
      'Recurring issue detection',
      'Auto-categorization',
    ],
    supportedDepts: ['IT', 'Customer Service', 'Facilities'],
    dataSources: ['Helpdesk tickets', 'SLA records', 'Staff schedules'],
    compliance: [
      'Ticket data processed per state data handling policy',
      'PII fields are masked in analysis outputs',
    ],
    setupReqs: ['Ticketing system API access', 'SLA definitions', 'Department mapping'],
    implSteps: [
      'Submit request and provide ticketing system details.',
      'Configure connector (Zendesk or ServiceNow).',
      'Map department and category fields.',
      'Run analysis on historical data.',
      'Deploy dashboards and set alert thresholds.',
    ],
    deptCount: 3,
    sourceCount: 3,
  },
  {
    id: 'igna-secure',
    name: 'IGNA Secure',
    category: 'Security and Compliance',
    deploymentType: 'Platform Integration',
    setup: '5–10 days',
    description:
      'AI governance and security assistant for monitoring AI usage across municipal systems, generating compliance reports, and enforcing state AI policies.',
    icon: 'shield',
    useCases: [
      'AI usage monitoring',
      'Compliance reporting',
      'Policy enforcement',
      'Risk flagging',
      'Audit trail generation',
    ],
    supportedDepts: ['IT Security', 'Compliance', 'Administration'],
    dataSources: ['System logs', 'AI platform APIs', 'Policy documents'],
    compliance: [
      'Operates under state cybersecurity framework',
      'All findings retained in secure audit log',
    ],
    setupReqs: ['System access credentials', 'Policy framework', 'Security team contacts'],
    implSteps: [
      'Submit request and inventory AI systems in use.',
      'Configure monitoring connectors.',
      'Define policy rules and alert thresholds.',
      'Run initial compliance scan.',
      'Deploy dashboards and schedule reports.',
    ],
    deptCount: 3,
    sourceCount: 3,
  },
  {
    id: 'minutesiq',
    name: 'MinutesIQ',
    category: 'Meeting Intelligence',
    deploymentType: 'Meeting Integration',
    setup: '1–2 days',
    description:
      'AI meeting intelligence platform for automated transcription, action item extraction, vote tracking, and compliance reporting for public meetings.',
    icon: 'doc',
    useCases: [
      'Meeting transcription',
      'Action item extraction',
      'Vote tracking',
      'Minutes generation',
      'Public record compliance',
    ],
    supportedDepts: ['Clerk', 'Council', 'Boards & Commissions'],
    dataSources: ['Meeting recordings', 'Agenda documents', 'Prior minutes'],
    compliance: [
      'Transcripts stored per state public records law',
      'Personal data handled per OPRA guidelines',
    ],
    setupReqs: ['Meeting platform access', 'Recording storage credentials', 'Agenda templates'],
    implSteps: [
      'Submit request and connect meeting platform.',
      'Configure transcription and output templates.',
      'Run pilot on a recorded meeting.',
      'Deploy and train staff on outputs.',
    ],
    deptCount: 3,
    sourceCount: 3,
  },
]

export const CATEGORIES = [
  'All',
  'Resident Services',
  'Voice Automation',
  'Finance Intelligence',
  'Helpdesk Intelligence',
  'Security and Compliance',
  'Meeting Intelligence',
]

export const DEPLOYMENT_TYPES = [
  'Website Script Tag',
  'Connector Package',
  'Voice Integration',
  'Meeting Integration',
]
