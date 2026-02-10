'use client';

interface TermsConditionsProps {
  onBack: () => void;
}

export default function TermsConditions({ onBack }: TermsConditionsProps) {
  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-[var(--alu-border)]">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={onBack}
            className="p-1.5 text-alu-text-secondary hover:text-alu-text transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
          </button>
          <h1 className="text-lg font-bold text-alu-text">Terms & Conditions</h1>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto px-4 py-6">
        <p className="text-xs text-alu-text-tertiary mb-6">Effective Date: February 10, 2026</p>

        <div className="space-y-6 text-sm text-alu-text leading-relaxed">
          <p>
            These Terms and Conditions ("Terms") govern your use of the Alu App. By using the App, you agree to these Terms and our Privacy Policy. If you do not agree, do not use the App.
          </p>

          <div>
            <h2 className="text-base font-bold text-alu-text mb-2">1. Acceptance of Terms</h2>
            <p>You must be 18+ or have parental consent. You represent compliance with laws.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-alu-text mb-2">2. User Accounts</h2>
            <p>You are responsible for account security. We may terminate for violations.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-alu-text mb-2">3. User Content and Liability</h2>
            <p className="mb-2">You own your content but grant us a license to use it. You are solely liable for all User Content, including accuracy of AI toggles (is_ai: true/false).</p>
            <p className="mb-2">If you toggle "Normal" (is_ai: false) but content is AI-generated, you approve and warrant it's non-AI - we are not liable for misrepresentations or violations.</p>
            <p>Prohibited: Explicit, illegal, infringing content. We may remove content without liability.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-alu-text mb-2">4. AI Tools</h2>
            <p>AI features filter prompts for celebrities/brands. You are liable for AI outputs. We disclaim liability for copyright infringement, errors, or biases in AI-generated content - you must review before posting.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-alu-text mb-2">5. Intellectual Property</h2>
            <p>App is our property. No unauthorized use.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-alu-text mb-2">6. Disclaimers and Limitation of Liability</h2>
            <p>App "AS IS." We are not liable for User Content, AI outputs, or third-party issues. Total liability capped at $100.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-alu-text mb-2">7. Indemnification</h2>
            <p>You indemnify us for claims from your content or violations (e.g., false AI toggles leading to infringement).</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-alu-text mb-2">8. Governing Law</h2>
            <p>Texas law, arbitration in Texas.</p>
          </div>

          <p className="text-alu-text-tertiary text-xs pt-4 border-t border-alu-border">By using Alu, you agree to these Terms.</p>
        </div>
      </div>
    </div>
  );
}
