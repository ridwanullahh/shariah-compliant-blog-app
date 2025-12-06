// Bismillah Ar-Rahman Ar-Roheem

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Shariah Blog",
  description: "Our privacy policy explains how we collect, use, and protect your information.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
          <h1>Privacy Policy</h1>
          <p className="lead">
            Bismillah Ar-Rahman Ar-Roheem. This Privacy Policy describes how we collect, use, and handle your
            information when you use our services.
          </p>

          <h2>Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you:</p>
          <ul>
            <li>Subscribe to our newsletter</li>
            <li>Leave comments on articles</li>
            <li>Contact us through the contact form</li>
            <li>Participate in polls or surveys</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Send you our newsletter (if subscribed)</li>
            <li>Respond to your comments and questions</li>
            <li>Improve our content and services</li>
            <li>Analyze usage patterns to enhance user experience</li>
          </ul>

          <h2>Cookies and Tracking</h2>
          <p>
            We use cookies to remember your preferences (such as dark mode settings) and to understand how visitors
            interact with our site. You can disable cookies in your browser settings.
          </p>

          <h2>Data Security</h2>
          <p>
            We take reasonable measures to protect your personal information from unauthorized access, use, or
            disclosure. However, no internet transmission is completely secure.
          </p>

          <h2>Third-Party Services</h2>
          <p>
            We may use third-party services for analytics and email delivery. These services have their own privacy
            policies governing their use of your information.
          </p>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Request correction of your personal information</li>
            <li>Unsubscribe from our newsletter at any time</li>
            <li>Request deletion of your data</li>
          </ul>

          <h2>Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us through our contact page.</p>

          <p className="text-sm text-muted-foreground mt-8">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}
