// Bismillah Ar-Rahman Ar-Roheem

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | Shariah Blog",
  description: "Terms and conditions for using our blog platform.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
          <h1>Terms of Service</h1>
          <p className="lead">
            Bismillah Ar-Rahman Ar-Roheem. By accessing and using this website, you agree to be bound by these terms and
            conditions.
          </p>

          <h2>Acceptance of Terms</h2>
          <p>
            By accessing this website, you acknowledge that you have read, understood, and agree to be bound by these
            Terms of Service.
          </p>

          <h2>Use of Content</h2>
          <p>All content on this website is provided for educational and informational purposes. You may:</p>
          <ul>
            <li>Read and share our articles with proper attribution</li>
            <li>Quote portions of our content with a link back to the original</li>
            <li>Use our content for personal, non-commercial purposes</li>
          </ul>
          <p>
            You may not reproduce, distribute, or create derivative works from our content without prior written
            permission.
          </p>

          <h2>User Conduct</h2>
          <p>When participating in our community (comments, discussions), you agree to:</p>
          <ul>
            <li>Be respectful and maintain Islamic adab in all interactions</li>
            <li>Not post offensive, harmful, or misleading content</li>
            <li>Not spam or engage in promotional activities</li>
            <li>Not impersonate others or provide false information</li>
          </ul>

          <h2>Comment Policy</h2>
          <p>
            All comments are moderated before publication. We reserve the right to remove any comments that violate our
            guidelines or are deemed inappropriate.
          </p>

          <h2>Disclaimer</h2>
          <p>
            The content on this website is provided "as is" without warranties of any kind. While we strive for
            accuracy, we recommend consulting qualified scholars for specific religious rulings.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            We shall not be liable for any damages arising from your use of this website or reliance on its content.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the website after changes
            constitutes acceptance of the new terms.
          </p>

          <h2>Contact</h2>
          <p>For questions about these Terms of Service, please contact us through our contact page.</p>

          <p className="text-sm text-muted-foreground mt-8">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}
