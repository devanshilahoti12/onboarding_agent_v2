import { useState } from 'react'
import AppLayout from '../components/AppLayout'

/* ── Types ────────────────────────────────────────────────────────────── */
interface PolicyDetail {
  purpose: string
  scope: string
  requirements: string[]
  municipalityResponsibilities: string[]
  stateResponsibilities: string[]
  auditRequirements: string
}

interface Policy {
  id: string
  title: string
  version: string
  effective: string
  appliesTo: string
  summary: string
  detail: PolicyDetail
}

/* ── Policy catalog ───────────────────────────────────────────────────── */
const POLICIES: Policy[] = [
  {
    id: 'responsible-ai',
    title: 'Responsible AI Use Policy',
    version: '1.2',
    effective: 'Jan 15, 2026',
    appliesTo: 'All entities and agents',
    summary: 'Defines acceptable use, prohibited use cases, and required human oversight for state-approved AI agents.',
    detail: {
      purpose: 'Establish guidelines for responsible and ethical use of AI systems by all state entities and municipalities.',
      scope: 'All AI agents, automated systems, and AI-assisted tools deployed by state municipalities and counties.',
      requirements: [
        'Use AI only for approved government functions listed in the state registry',
        'Maintain human oversight for all consequential AI-assisted decisions',
        'Report prohibited use cases to the state AI governance board within 48 hours',
        'Ensure all staff complete mandatory AI ethics training annually',
      ],
      municipalityResponsibilities: [
        'Designate an AI compliance officer for each deployment',
        'Submit quarterly usage and compliance reports to the state',
        'Confirm staff training completion records are maintained',
      ],
      stateResponsibilities: [
        'Maintain and publish the approved AI use case registry',
        'Provide compliance templates and training materials',
        'Conduct annual policy review and publish updates',
      ],
      auditRequirements: 'Quarterly internal audits required; annual third-party review by state-approved auditor.',
    },
  },
  {
    id: 'data-privacy',
    title: 'Data Privacy and Protection Policy',
    version: '2.0',
    effective: 'Feb 1, 2026',
    appliesTo: 'All entities',
    summary: 'Defines how resident, financial, and operational data is handled, masked, and retained.',
    detail: {
      purpose: 'Protect resident data privacy and ensure compliant handling of sensitive information processed by AI systems.',
      scope: 'All resident data processed, stored, or transmitted through AI-enabled government systems.',
      requirements: [
        'Encrypt all personally identifiable information (PII) at rest and in transit',
        'Apply data minimization principles — collect only what is necessary',
        'Obtain informed consent where legally required before AI processing',
        'Implement automatic data retention limits and deletion schedules',
      ],
      municipalityResponsibilities: [
        'Classify all data categories before enabling AI processing',
        'Conduct privacy impact assessments for new AI deployments',
        'Report data breaches to the state within 72 hours of discovery',
      ],
      stateResponsibilities: [
        'Maintain and publish approved encryption and masking standards',
        'Provide breach notification templates and response playbooks',
        'Conduct annual municipality data compliance audits',
      ],
      auditRequirements: 'Annual privacy audit required; breach-specific review must complete within 30 days of incident.',
    },
  },
  {
    id: 'public-records',
    title: 'Public Records and Retention Guidance',
    version: '1.0',
    effective: 'Nov 1, 2025',
    appliesTo: 'Clerks, IT, Records officers',
    summary: 'Aligns AI-generated content with New Jersey public records retention schedules.',
    detail: {
      purpose: 'Align AI-generated records with New Jersey public records law and approved retention schedules.',
      scope: 'Clerks, IT departments, and Records officers managing AI-generated or AI-assisted documents.',
      requirements: [
        'Tag all AI-generated documents with the correct retention classification',
        'Apply NJ Division of Archives retention schedules to all AI outputs',
        'Ensure public discoverability and OPRA compliance for AI-generated records',
        'Retain AI interaction logs in accordance with applicable schedules',
      ],
      municipalityResponsibilities: [
        'Maintain a current inventory of AI-generated records by category',
        'Train records staff on AI document identification and classification',
        'Enable and respond to public records requests for AI-generated outputs',
      ],
      stateResponsibilities: [
        'Publish and maintain AI records retention schedule guidelines',
        'Support municipalities in classification and tagging implementation',
        'Conduct annual compliance audits through State Archives',
      ],
      auditRequirements: 'Annual compliance review conducted by NJ State Archives.',
    },
  },
  {
    id: 'human-oversight',
    title: 'Human Oversight and Review Policy',
    version: '1.1',
    effective: 'Dec 10, 2025',
    appliesTo: 'All entities',
    summary: 'Requires authorized human review for AI output used in official action.',
    detail: {
      purpose: 'Ensure qualified human review of all AI outputs before they are used in official government actions or communications.',
      scope: 'All government decisions, communications, and documents produced with AI assistance.',
      requirements: [
        'A qualified human reviewer must approve AI outputs before official use',
        'AI-only decisions are strictly prohibited for enforcement or legal actions',
        'Maintain a full audit trail for all human-AI review interactions',
        'Reviewers must be trained and certified under the state AI reviewer program',
      ],
      municipalityResponsibilities: [
        'Assign qualified reviewers to each AI-assisted workflow',
        'Log all human-AI review interactions in the municipality records system',
        'Report oversight violations to the state board within 24 hours',
      ],
      stateResponsibilities: [
        'Define and publish reviewer qualification standards',
        'Provide approved review workflow templates and checklists',
        'Maintain a registry of reported oversight violations and outcomes',
      ],
      auditRequirements: 'Quarterly review of oversight logs; annual policy compliance assessment by state board.',
    },
  },
  {
    id: 'ai-transparency',
    title: 'AI Transparency and Resident Disclosure Policy',
    version: '1.0',
    effective: 'Mar 1, 2026',
    appliesTo: 'Resident-facing agents',
    summary: 'Requires clear disclosure when residents interact with AI.',
    detail: {
      purpose: 'Maintain public trust through transparent and clear disclosure of AI interactions with residents.',
      scope: 'Chat, voice, and all resident-facing AI agents deployed by state municipalities.',
      requirements: [
        'Display a visible AI notice at the start of every resident interaction',
        'Provide a clear opt-out path to a human staff member at any time',
        'Disclose agent capabilities and limitations in plain language',
      ],
      municipalityResponsibilities: [
        'Confirm state-approved disclosure language is placed correctly in the agent UI',
        'Test disclosure visibility on all deployment surfaces before go-live',
      ],
      stateResponsibilities: [
        'Provide and maintain the approved AI disclosure language templates',
        'Review disclosure language annually for clarity and legal compliance',
      ],
      auditRequirements: 'Annual review of all resident-facing disclosure implementations.',
    },
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity and Access Control Policy',
    version: '1.3',
    effective: 'Jan 1, 2026',
    appliesTo: 'All entities',
    summary: 'Defines minimum access controls, MFA, and credential handling for AI agents.',
    detail: {
      purpose: 'Define minimum cybersecurity standards for AI system access, identity management, and credential security.',
      scope: 'All entities deploying, accessing, or administering AI agents and automated government systems.',
      requirements: [
        'Enforce multi-factor authentication (MFA) for all AI system administrative access',
        'Apply role-based access control (RBAC) to all AI data and configuration interfaces',
        'Rotate API keys and service credentials every 90 days',
        'Log and monitor all access events, flagging anomalies within 15 minutes',
      ],
      municipalityResponsibilities: [
        'Implement state-approved identity and access management (IAM) solutions',
        'Review access logs and anomaly reports on a monthly basis',
        'Report security incidents to the state security team within 24 hours',
      ],
      stateResponsibilities: [
        'Maintain and publish the approved security vendor and tool list',
        'Conduct annual penetration testing on state-hosted AI infrastructure',
        'Publish and maintain the security incident response guide',
      ],
      auditRequirements: 'Semi-annual security audit; immediate review required upon any confirmed breach.',
    },
  },
  {
    id: 'vendor-security',
    title: 'Vendor and Connector Security Policy',
    version: '1.0',
    effective: 'Feb 15, 2026',
    appliesTo: 'IT, Procurement',
    summary: 'Defines security requirements for third-party connectors and platforms.',
    detail: {
      purpose: 'Establish security and vetting requirements for all third-party vendors and data connectors integrated with state AI systems.',
      scope: 'IT and Procurement departments managing external vendor relationships and API-based data connectors.',
      requirements: [
        'All vendors must pass a state security review before onboarding or integration',
        'Connectors must use encrypted, authenticated API connections at all times',
        'Vendor contracts must include state-mandated data protection and liability clauses',
        'Annual vendor security recertification is required to maintain active status',
      ],
      municipalityResponsibilities: [
        'Submit all new vendor requests through the state procurement portal',
        'Maintain an up-to-date inventory of all active vendor integrations',
        'Report vendor security incidents to the state immediately upon discovery',
      ],
      stateResponsibilities: [
        'Maintain and publish the approved vendor and connector registry',
        'Conduct independent security assessments for Tier 1 vendors annually',
        'Publish and update connector security standards and API guidelines',
      ],
      auditRequirements: 'Annual vendor compliance review; immediate audit triggered by any reported vendor incident.',
    },
  },
  {
    id: 'model-output',
    title: 'Model Output Review and Disclaimer Policy',
    version: '1.0',
    effective: 'Mar 15, 2026',
    appliesTo: 'All entities',
    summary: 'Requires standard disclaimer and review for AI-generated outputs used externally.',
    detail: {
      purpose: 'Require standard review and mandatory disclaimers for all AI-generated content published externally or used in official communications.',
      scope: 'All entities producing AI-generated content for external publication, resident-facing use, or official government communications.',
      requirements: [
        'Apply the state-approved AI disclaimer to all externally-used AI-generated outputs',
        'Review and verify AI outputs for factual accuracy before any publication',
        'Flag and label AI-generated content clearly in all official communications',
        'Maintain a log of all reviewed and published AI-generated content',
      ],
      municipalityResponsibilities: [
        'Train all publishing staff on disclaimer requirements and placement',
        'Include required disclaimers in every public AI-assisted communication',
        'Report inaccurate or harmful AI outputs to the state review board promptly',
      ],
      stateResponsibilities: [
        'Provide and maintain the approved disclaimer language templates',
        'Set and enforce AI output quality and accuracy standards',
        'Review and address flagged inaccuracy reports within 10 business days',
      ],
      auditRequirements: 'Quarterly review of published AI communications; annual policy update and reissuance.',
    },
  },
]

/* Initial acknowledged set (matches reference screenshot) */
const INITIALLY_ACKNOWLEDGED = new Set([
  'responsible-ai', 'data-privacy', 'public-records', 'human-oversight', 'cybersecurity',
])

/* ── Policy card ──────────────────────────────────────────────────────── */
function PolicyCard({
  policy,
  acknowledged,
  onAcknowledge,
  onView,
}: {
  policy: Policy
  acknowledged: boolean
  onAcknowledge: () => void
  onView: () => void
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-[14px] leading-snug mb-1.5">{policy.title}</h3>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border" style={{ background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' }}>
              Approved
            </span>
            {acknowledged && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border" style={{ background: '#f0fdfa', color: '#0d9488', borderColor: '#99f6e4' }}>
                Acknowledged
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="mb-3">
        <p className="text-xs text-slate-400">Version {policy.version} · Effective {policy.effective}</p>
        <p className="text-xs text-slate-400 mt-0.5">Applies to: {policy.appliesTo}</p>
      </div>

      {/* Summary */}
      <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-4">{policy.summary}</p>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={onView}
          className="flex-1 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          View Policy
        </button>
        <button
          onClick={onAcknowledge}
          disabled={acknowledged}
          className="flex-1 py-2 text-sm font-semibold rounded-lg transition-colors"
          style={{
            background: acknowledged ? '#e0f2fe' : '#0ea5e9',
            color: acknowledged ? '#0369a1' : '#ffffff',
            cursor: acknowledged ? 'default' : 'pointer',
          }}
        >
          {acknowledged ? 'Acknowledged' : 'Acknowledge'}
        </button>
      </div>
    </div>
  )
}

/* ── Policy detail modal ──────────────────────────────────────────────── */
function PolicyModal({ policy, onClose }: { policy: Policy; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,30,50,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full flex flex-col"
        style={{ maxWidth: 660, maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="px-7 pt-6 pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="font-bold text-slate-900 text-lg leading-tight">{policy.title}</h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0" style={{ background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' }}>
                  Approved
                </span>
              </div>
              <p className="text-xs text-slate-400">Version {policy.version} · Effective {policy.effective}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-5">
          <Section title="Purpose">
            <p className="text-sm text-slate-600 leading-relaxed">{policy.detail.purpose}</p>
          </Section>

          <Section title="Scope">
            <p className="text-sm text-slate-600 leading-relaxed">{policy.detail.scope}</p>
          </Section>

          <Section title="Requirements">
            <BulletList items={policy.detail.requirements} />
          </Section>

          <Section title="Municipality Responsibilities">
            <BulletList items={policy.detail.municipalityResponsibilities} />
          </Section>

          <Section title="State Responsibilities">
            <BulletList items={policy.detail.stateResponsibilities} />
          </Section>

          <Section title="Audit Requirements">
            <p className="text-sm text-slate-600 leading-relaxed">{policy.detail.auditRequirements}</p>
          </Section>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-bold text-slate-900 mb-1.5">{title}</p>
      {children}
    </div>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map(item => (
        <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"/>
          {item}
        </li>
      ))}
    </ul>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────── */
export default function PolicyLibraryPage() {
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set(INITIALLY_ACKNOWLEDGED))
  const [viewing, setViewing]           = useState<Policy | null>(null)

  function toggle(id: string) {
    setAcknowledged(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <AppLayout>
      {viewing && <PolicyModal policy={viewing} onClose={() => setViewing(null)} />}

      <div className="flex flex-col min-h-full">
        <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">State AI Policy Library</h1>
            <p className="text-slate-500 text-sm mt-1 max-w-2xl">
              Approved policy guidance for responsible, secure, and transparent AI adoption across New Jersey municipalities and counties.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {POLICIES.map(p => (
              <PolicyCard
                key={p.id}
                policy={p}
                acknowledged={acknowledged.has(p.id)}
                onAcknowledge={() => toggle(p.id)}
                onView={() => setViewing(p)}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="font-semibold text-slate-900 text-[15px]">State of New Jersey AI Enablement Portal</p>
                <p className="text-sky-600 text-sm font-medium mt-1">Powered by TechForGov</p>
                <p className="text-slate-400 text-xs mt-3 leading-relaxed max-w-xs">
                  AI-generated outputs should be reviewed by authorized staff before official action.
                </p>
              </div>
              <div className="space-y-2">
                {['Privacy', 'Accessibility', 'Security'].map(l => (
                  <p key={l}><a href="#" className="text-slate-500 hover:text-slate-800 text-sm transition-colors">{l}</a></p>
                ))}
              </div>
              <div className="space-y-2">
                {['Policy Library', 'Support'].map(l => (
                  <p key={l}><a href="#" className="text-slate-500 hover:text-slate-800 text-sm transition-colors">{l}</a></p>
                ))}
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100">
              <p className="text-slate-400 text-xs">© 2026 State of New Jersey. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </AppLayout>
  )
}