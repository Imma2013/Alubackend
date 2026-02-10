'use client';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
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
          <h1 className="text-lg font-bold text-alu-text">Privacy Policy</h1>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto px-4 py-6">
        <p className="text-xs text-alu-text-tertiary mb-6">Effective Date: February 10, 2026</p>

        <div className="space-y-6 text-sm text-alu-text leading-relaxed">
          <p>
            Alu ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website (collectively, the "App"). By using the App, you consent to the practices described in this Policy. If you do not agree, please do not use the App. We may update this Policy at any time, and your continued use constitutes acceptance of changes. We will notify you of material changes via in-App notice or email.
          </p>

          <div>
            <h2 className="text-base font-bold text-alu-text mb-2">1. Information We Collect</h2>
            <p className="mb-2">We prioritize a local-first approach, meaning much of your data (e.g., drafts, content edits) is stored on your device rather than our servers. We collect minimal information necessary for the App's functionality:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Personal Information:</strong> When you create an account, we collect your username, email address, and password (hashed for security). Optional: Profile picture, bio, or location (if you enable sharing).</li>
              <li><strong>User Content:</strong> Videos, images, text, and metadata you upload or create. For AI-generated content, we use prompts to filter out celebrity names and brands, but we do not collect or store unfiltered prompts. Content is tagged as AI (is_ai: true/false) based on your toggle selection.</li>
              <li><strong>Device and Usage Data:</strong> Automatically collected: Device type, OS version, IP address, browser type, App usage (e.g., pages viewed, time spent), and logs for troubleshooting (e.g., error reports, session IDs). This helps improve performance and security.</li>
              <li><strong>AI Interaction Data:</strong> Prompts and outputs for AI tools (e.g., text-to-video/image), stored locally where possible. We may log anonymized usage for service improvement.</li>
              <li><strong>Payment Information:</strong> If you subscribe to premium features, we use third-party processors (e.g., Stripe) and do not store your card details.</li>
            </ul>
            <p className="mt-2">We do not collect sensitive data (e.g., health, race, religion) unless you voluntarily provide it in content, and even then, it's user-controlled.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-alu-text mb-2">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To provide and maintain the App (e.g., account management, content sharing, AI features).</li>
              <li>To improve the App (e.g., analyze usage logs for bugs or features).</li>
              <li>To ensure safety and compliance (e.g., moderate content via AI filters and user reports).</li>
              <li>For communication (e.g., notifications, support responses).</li>
              <li>For legal purposes (e.g., comply with laws or protect rights).</li>
              <li>Local storage prioritizes your privacy - data like drafts remains on-device unless you choose cloud sync (optional for backups or sharing).</li>
            </ul>
            <p className="mt-2">We do not sell your data. Anonymized aggregates may be used for analytics.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-alu-text mb-2">3. How We Share Your Information</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>With Service Providers:</strong> Third parties for hosting (e.g., Render.com), AI processing (e.g., Gemini), payments (e.g., Stripe), and analytics - bound by strict confidentiality.</li>
              <li><strong>For Legal Reasons:</strong> If required by law, subpoena, or to prevent harm (e.g., illegal content).</li>
              <li><strong>In Business Transfers:</strong> If we merge/sell, your data may transfer but remains protected.</li>
              <li><strong>User Content:</strong> Publicly visible if you post it (e.g., in feeds) - you control privacy settings.</li>
            </ul>
            <p className="mt-2">We do not share with advertisers or third parties for marketing without consent.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-alu-text mb-2">4. Data Security</h2>
            <p>We use industry-standard measures (e.g., encryption, firewalls) to protect data. Local-first design minimizes server risks. However, no system is 100% secure - you're responsible for your device/account security. Report breaches to us immediately.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-alu-text mb-2">5. Data Retention</h2>
            <p>We retain data as needed for the App (e.g., accounts active until deletion). Local data stays on-device until you delete. Upon account deletion, we remove server data within 30 days, except for legal requirements.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-alu-text mb-2">6. Your Privacy Rights</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Access, update, or delete your data via App settings.</li>
              <li>Opt out of non-essential data collection (e.g., analytics).</li>
              <li>For EU/UK users (GDPR/UK GDPR): Rights to access, rectify, erase, restrict, object, or port data - contact us.</li>
              <li>California users (CCPA/CPRA): Rights to know, delete, opt-out of sales (we don't sell data).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-bold text-alu-text mb-2">7. Children's Privacy</h2>
            <p>The App is not for users under 13 (COPPA). We do not knowingly collect data from children. If discovered, we delete it.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-alu-text mb-2">8. International Transfers</h2>
            <p>Data may transfer to the US or other countries with adequate protections (e.g., EU Standard Contractual Clauses).</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-alu-text mb-2">9. Contact Us</h2>
            <p>For questions, contact us through the App.</p>
          </div>

          <p className="text-alu-text-tertiary text-xs pt-4 border-t border-alu-border">By using Alu, you acknowledge this Policy.</p>
        </div>
      </div>
    </div>
  );
}
