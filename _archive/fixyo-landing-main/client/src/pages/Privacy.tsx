/* FixYo Privacy Policy Page */
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container max-w-3xl mx-auto">
          <div className="mb-8">
            <Link href="/" className="text-amber-600 hover:text-amber-700 text-sm font-medium">
              ← Back to Home
            </Link>
          </div>
          <h1 className="font-['Sora'] font-extrabold text-4xl text-[#1B2B4B] mb-2">Privacy Policy</h1>
          <p className="text-[#64748B] text-sm mb-10">Last updated: March 2025</p>

          <div className="prose prose-slate max-w-none">
            <div className="bg-white rounded-2xl border border-[#1B2B4B]/8 p-8 space-y-8">
              {[
                {
                  title: "1. Information We Collect",
                  content: "We collect information you provide directly to us, such as when you create an account, create jobs, or contact us for support. This includes: business name, ABN, contact details, bank account details for invoicing purposes, job and customer data you enter, and usage data.",
                },
                {
                  title: "2. How We Use Your Information",
                  content: "We use the information we collect to provide, maintain, and improve FixYo, process transactions, send transactional emails (quotes, invoices, contracts), and provide customer support. We do not sell your personal information to third parties.",
                },
                {
                  title: "3. Data Storage & Security",
                  content: "Your data is stored securely using Supabase infrastructure with Row-Level Security (RLS) policies. This means you can only access your own data. All data is encrypted in transit and at rest. We use JWT validation for all authenticated requests.",
                },
                {
                  title: "4. Customer Portal Data",
                  content: "When you send documents to customers via the customer portal, their access is token-based and time-limited. We store customer names, email addresses, and contact details that you provide when creating jobs.",
                },
                {
                  title: "5. Cookies",
                  content: "We use essential cookies for authentication and session management. We also use analytics cookies to understand how FixYo is used, which helps us improve the product.",
                },
                {
                  title: "6. Your Rights",
                  content: "You have the right to access, correct, or delete your personal data. You can export your data at any time from your account settings. To request data deletion, contact us at support@fixyo.ai.",
                },
                {
                  title: "7. Contact Us",
                  content: "For privacy-related questions, contact us at support@fixyo.ai or write to FixYo Pty Ltd, Australia.",
                },
              ].map((section) => (
                <div key={section.title}>
                  <h2 className="font-['Sora'] font-bold text-lg text-[#1B2B4B] mb-2">{section.title}</h2>
                  <p className="text-[#64748B] text-sm leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
