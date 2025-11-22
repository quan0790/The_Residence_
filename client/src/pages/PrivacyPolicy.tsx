import Layout from "@/components/Layout";

function PrivacyPolicy() {
  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto space-y-8 text-gray-800">

        {/* Visible Page Heading */}
        <div className="bg-[#F1F5F9] p-6 rounded-xl shadow-sm border border-gray-200">
          <h1 className="text-4xl font-bold text-[#1A2A3A]">Privacy Policy</h1>
          <p className="text-gray-600 mt-1">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content Cards */}
        <div className="space-y-6">

          {/* Card 1 */}
          <div className="bg-white shadow-sm rounded-xl p-6 space-y-3">
            <h2 className="text-2xl font-semibold text-[#1A2A3A]">
              1. Information We Collect
            </h2>
            <p>
              We collect personal and business information necessary to operate your rental management system, including names, emails, property details, and payment history.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white shadow-sm rounded-xl p-6 space-y-3">
            <h2 className="text-2xl font-semibold text-[#1A2A3A]">
              2. How We Use Your Information
            </h2>
            <p>
              Your data is used to operate, improve, and secure the platform. We do not sell your information to third parties.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white shadow-sm rounded-xl p-6 space-y-3">
            <h2 className="text-2xl font-semibold text-[#1A2A3A]">
              3. Data Storage & Security
            </h2>
            <p>
              We use industry-standard security practices to protect your information. However, no system is 100% secure, and we cannot guarantee absolute protection.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white shadow-sm rounded-xl p-6 space-y-3">
            <h2 className="text-2xl font-semibold text-[#1A2A3A]">
              4. Sharing of Information
            </h2>
            <p>
              We may share information with third-party services that support platform operations, such as analytics or hosting providers.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-white shadow-sm rounded-xl p-6 space-y-3">
            <h2 className="text-2xl font-semibold text-[#1A2A3A]">
              5. Your Rights
            </h2>
            <p>
              You may request deletion, correction, or access to your data at any time by contacting support.
            </p>
          </div>

        </div>

      </div>
    </Layout>
  );
}

export default PrivacyPolicy;
