import Layout from "@/components/Layout";

function TermsOfService() {
  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto space-y-8 text-gray-800">

        {/* Visible Page Heading */}
        <div className="bg-[#F1F5F9] p-6 rounded-xl shadow-sm border border-gray-200">
          <h1 className="text-4xl font-bold text-[#1A2A3A]">Terms of Service</h1>
          <p className="text-gray-600 mt-1">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">

          {/* Card 1 */}
          <section className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold text-[#1A2A3A]">
              1. Agreement to Terms
            </h2>
            <p>
              By accessing or using our property management platform, you agree to be bound by these Terms of Service.
              If you do not agree, you may not use the service.
            </p>
          </section>

          {/* Card 2 */}
          <section className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold text-[#1A2A3A]">
              2. Use of the Platform
            </h2>
            <p>
              You agree to use the platform only for lawful purposes and in accordance with applicable regulations.
              Unauthorized access or misuse may result in account termination.
            </p>
          </section>

          {/* Card 3 */}
          <section className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold text-[#1A2A3A]">
              3. Accounts & Security
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your login credentials and for all activities
              that occur under your account.
            </p>
          </section>

          {/* Card 4 */}
          <section className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold text-[#1A2A3A]">
              4. Payments & Billing
            </h2>
            <p>
              Any transactions or financial activities within the platform must follow the rules and guidelines set by
              your business and local laws.
            </p>
          </section>

          {/* Card 5 */}
          <section className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold text-[#1A2A3A]">
              5. Limitation of Liability
            </h2>
            <p>
              We are not liable for any losses, damages, or errors resulting from misuse of the platform or issues
              caused by external services or integrations.
            </p>
          </section>

          {/* Card 6 */}
          <section className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold text-[#1A2A3A]">
              6. Changes to Terms
            </h2>
            <p>
              We may update these Terms from time to time. Continued use of the platform after changes indicates
              acceptance of the new Terms.
            </p>
          </section>

        </div>

      </div>
    </Layout>
  );
}

export default TermsOfService;
