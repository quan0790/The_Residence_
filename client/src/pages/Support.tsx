import Layout from "@/components/Layout";

function Support() {
  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto space-y-8 text-gray-800">

        {/* Visible Page Heading */}
        <div className="bg-[#F1F5F9] p-6 rounded-xl shadow-sm border border-gray-200">
          <h1 className="text-4xl font-bold text-[#1A2A3A]">Support</h1>
          <p className="text-gray-600 mt-1">
            Need help? We're here for you.
          </p>
        </div>

        <div className="space-y-6">

          {/* Card 1 */}
          <section className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold text-[#1A2A3A]">
              1. Contact Information
            </h2>
            <p>If you have questions or need assistance, please reach out.</p>

            <p>
              📧 Email:{" "}
              <span className="font-semibold">support@theresidence.com</span>
            </p>

            <p>
              📞 Phone:{" "}
              <span className="font-semibold">+1 (800) 123-4567</span>
            </p>
          </section>

          {/* Card 2 */}
          <section className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold text-[#1A2A3A]">
              2. Common Issues
            </h2>
            <p className="leading-relaxed">
              • Login issues <br />
              • Tenant or unit data corrections <br />
              • Payment questions <br />
              • Bug reports or feature requests
            </p>
          </section>

          {/* Card 3 */}
          <section className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold text-[#1A2A3A]">
              3. Response Time
            </h2>
            <p>
              Support requests are usually answered within{" "}
              <strong>24–48 hours</strong>.
            </p>
          </section>

          {/* Card 4 */}
          <section className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold text-[#1A2A3A]">
              4. Emergency Maintenance
            </h2>
            <p>
              For urgent property emergencies, please contact your property
              manager directly.
              <br />
              <span className="font-semibold text-red-600">
                Emergency cases should NOT be sent through support email.
              </span>
            </p>
          </section>

        </div>

      </div>
    </Layout>
  );
}

export default Support;
