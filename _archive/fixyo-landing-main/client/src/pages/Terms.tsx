/* FixYo Terms of Service Page */
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";

export default function Terms() {
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
          <h1 className="font-['Sora'] font-extrabold text-4xl text-[#1B2B4B] mb-2">Terms of Service</h1>
          <p className="text-[#64748B] text-sm mb-10">Last updated: March 2025</p>

          <div className="bg-white rounded-2xl border border-[#1B2B4B]/8 p-8 space-y-8">
            {[
              {
                title: "1. Acceptance of Terms",
                content: "By accessing or using FixYo, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use FixYo.",
              },
              {
                title: "2. Description of Service",
                content: "FixYo is a cloud-based job management and quoting platform designed for Australian tradespeople. We provide tools for job management, quoting, invoicing, document generation, and related business functions.",
              },
              {
                title: "3. Account Responsibilities",
                content: "You are responsible for maintaining the confidentiality of your account credentials. You are responsible for all activity that occurs under your account. You must provide accurate business information including your ABN.",
              },
              {
                title: "4. Subscription & Billing",
                content: "Free plan users have access to limited features as described on our pricing page. Pro plan subscribers are billed monthly or annually via Stripe. Prices are in AUD and exclude GST. You may cancel at any time; your subscription remains active until the end of the billing period.",
              },
              {
                title: "5. Data Ownership",
                content: "You retain ownership of all data you enter into FixYo, including job details, customer information, and documents. You grant FixYo a limited licence to store and process this data to provide the service.",
              },
              {
                title: "6. Acceptable Use",
                content: "You agree not to use FixYo for any unlawful purpose, to submit false or misleading information, to attempt to gain unauthorised access to other users' data, or to interfere with the operation of the service.",
              },
              {
                title: "7. Limitation of Liability",
                content: "FixYo is provided 'as is'. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability is limited to the amount you paid in the 12 months prior to the claim.",
              },
              {
                title: "8. Governing Law",
                content: "These terms are governed by the laws of New South Wales, Australia. Any disputes will be resolved in the courts of New South Wales.",
              },
              {
                title: "9. Contact",
                content: "For questions about these terms, contact us at support@fixyo.ai.",
              },
            ].map((section) => (
              <div key={section.title}>
                <h2 className="font-['Sora'] font-bold text-lg text-[#1B2B4B] mb-2">{section.title}</h2>
                <p className="text-[#64748B] text-sm leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
