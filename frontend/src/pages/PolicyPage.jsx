import { useLocation, Link } from 'react-router-dom';
import { FiFileText, FiShield, FiRefreshCw, FiTruck, FiChevronRight } from 'react-icons/fi';

const PolicyPage = () => {
  const location = useLocation();
  const path = location.pathname;

  // Declared without initial assignment to resolve ESLint 'no-useless-assignment'
  let title;
  let icon;
  let content;

  if (path === '/terms-and-conditions') {
    title = 'Terms and Conditions';
    icon = <FiFileText className="text-amber-500" size={42} />;
    content = (
      <div className="space-y-8 text-zinc-300 text-sm leading-relaxed">
        <p className="text-xs text-amber-500 font-bold uppercase tracking-wider">
          Effective Date: August 4, 2026
        </p>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">1. Introduction and Acceptance of Terms</h3>
          <p>
            Welcome to The Royal Tailor. This document constitutes a legally binding agreement made between you, whether personally or on behalf of an entity ("you," "user," or "customer"), and The Royal Tailor ("we," "us," or "our"), concerning your access to and use of the www.royaltailors.net website as well as any other media form, media channel, mobile website, or mobile application related, linked, or otherwise connected thereto (collectively, the "Site"). By accessing the Site, you agree that you have read, understood, and agreed to be bound by all of these Terms and Conditions. If you do not agree with all of these Terms and Conditions, then you are expressly prohibited from using the Site and must discontinue use immediately.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">2. Definitions</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>"Account"</strong> refers to a unique profile created for you to access our Site or parts of our Site.</li>
            <li><strong>"Products"</strong> refers to the goods, bespoke apparel, clothing, accessories, or services offered for sale on the Site.</li>
            <li><strong>"Order"</strong> means a request by you to purchase Products from us.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">3. User Eligibility</h3>
          <p>
            The Site is intended for users who are at least 18 years old. Persons under the age of 18 are not permitted to use or register for the Site. By using the Site, you represent and warrant that you are of legal age to form a binding contract and meet all of the foregoing eligibility requirements. If you do not meet all of these requirements, you must not access or use the Site.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">4. User Account, Password, and Security</h3>
          <p>
            To purchase Products or access certain features of the Site, you may be required to register for an Account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding the password that you use to access the Site and for any activities or actions under your password. We cannot and will not be liable for any loss or damage arising from your failure to comply with these security obligations. We reserve the right to suspend or terminate your account if any information provided proves to be inaccurate, not current, or incomplete.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">5. Products, Services, and Pricing</h3>
          <p>
            All features, content, specifications, products, and prices of products and services described or depicted on the Site are subject to change at any time without notice. We make all reasonable efforts to accurately display the attributes of our Products, including the applicable colors and fabrics. However, the actual color you see will depend on your computer system, and we cannot guarantee that your computer will accurately display such colors. The inclusion of any Products on the Site at a particular time does not imply or warrant that these Products will be available at any time.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">6. Orders and Financial Transactions</h3>
          <p>
            We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. These restrictions may include orders placed by or under the same customer account, the same credit card, and/or orders that use the same billing and/or shipping address. In the event that we make a change to or cancel an order, we may attempt to notify you by contacting the email and/or billing address/phone number provided at the time the order was made.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">7. Payment Gateway and Billing</h3>
          <p>
            You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site. All payments are securely processed through our authorized payment gateway partners. You agree to pay all charges at the prices then in effect for your purchases and any applicable shipping fees, and you authorize us to charge your chosen payment provider for any such amounts upon placing your order. We reserve the right to correct any errors or mistakes in pricing, even if we have already requested or received payment.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">8. Prohibited Activities</h3>
          <p>
            You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us. As a user of the Site, you agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Systematically retrieve data or other content from the Site to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
            <li>Make any unauthorized use of the Site, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email, or creating user accounts by automated means or under false pretenses.</li>
            <li>Circumvent, disable, or otherwise interfere with security-related features of the Site.</li>
            <li>Engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">9. Intellectual Property Rights</h3>
          <p>
            Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">10. Limitation of Liability</h3>
          <p>
            In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site, even if we have been advised of the possibility of such damages.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">11. Indemnification</h3>
          <p>
            You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand, including reasonable attorneys’ fees and expenses, made by any third party due to or arising out of your use of the Site, breach of these Terms and Conditions, or any breach of your representations and warranties set forth in these Terms and Conditions.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">12. Governing Law and Jurisdiction</h3>
          <p>
            These Terms and Conditions and your use of the Site are governed by and construed in accordance with the laws of India. Any legal action or proceeding related to your access to, or use of, the Site or these Terms and Conditions shall be instituted exclusively in the courts of Patna, Bihar. You and The Royal Tailor agree to submit to the jurisdiction of, and agree that venue is proper in, these courts in any such legal action or proceeding.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">13. Severability</h3>
          <p>
            If any provision or part of a provision of these Terms and Conditions is determined to be unlawful, void, or unenforceable, that provision or part of the provision is deemed severable from these Terms and Conditions and does not affect the validity and enforceability of any remaining provisions.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">14. Contact Us</h3>
          <p>
            In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please <Link to="/contact" className="text-amber-500 hover:text-amber-400 font-bold underline transition-colors">visit our Contact Us page</Link> or reach out directly via:
          </p>
          <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 space-y-2 mt-4 text-sm text-zinc-400">
            <p><strong className="text-zinc-300">Business Name:</strong> The Royal Tailor</p>
            <p><strong className="text-zinc-300">Website:</strong> www.royaltailors.net</p>
            <p><strong className="text-zinc-300">Email:</strong> support@royaltailors.net</p>
            <p><strong className="text-zinc-300">Phone:</strong> 9576793770</p>
            <p><strong className="text-zinc-300">Address:</strong> Danapur, Patna, Bihar, India</p>
          </div>
        </section>
      </div>
    );
  } else if (path === '/privacy-policy') {
    title = 'Privacy Policy';
    icon = <FiShield className="text-amber-500" size={42} />;
    content = (
      <div className="space-y-8 text-zinc-300 text-sm leading-relaxed">
        <p className="text-xs text-amber-500 font-bold uppercase tracking-wider">
          Effective Date: August 4, 2026
        </p>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">1. Introduction</h3>
          <p>
            Welcome to The Royal Tailor ("we," "us," or "our"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website www.royaltailors.net (the "Site") and utilize our services, including purchasing our bespoke apparel, clothing, and accessories. Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the Site.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">2. Information We Collect</h3>
          <p>
            We collect personal information that you voluntarily provide to us when you register on the Site, express an interest in obtaining information about us or our products, or otherwise contact us. The personal information that we collect depends on the context of your interactions with us and the Site, and may include:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Personal Identification Data:</strong> First name, maiden name, last name, phone number, email address, shipping address, and billing address.</li>
            <li><strong>Credentials:</strong> Passwords, password hints, and similar security information used for authentication and account access.</li>
            <li><strong>Payment Data:</strong> We may collect data necessary to process your payment if you make purchases. However, all payment processing is handled by our secure, third-party payment gateways (e.g., PhonePe). We do not store, retain, or process your actual credit card numbers, CVV codes, or UPI PINs on our servers.</li>
            <li><strong>Automatically Collected Information:</strong> When you visit, use, or navigate the Site, we automatically collect certain information. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, and information about how and when you use our Site.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">3. How We Use Your Information</h3>
          <p>
            We use personal information collected via our Site for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations. We use the information we collect or receive to:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Facilitate account creation and logon processes.</li>
            <li>Fulfill and manage your orders, payments, returns, and exchanges made through the Site.</li>
            <li>Deliver the products and services you have requested.</li>
            <li>Send administrative information to you, such as product, service, and new feature information, and/or information about changes to our terms, conditions, and policies.</li>
            <li>Protect our Site and keep it safe and secure (for example, for fraud monitoring and prevention).</li>
            <li>Enforce our terms, conditions, and policies for business purposes, legal reasons, and contractual obligations.</li>
            <li>Respond to user inquiries and offer customer support.</li>
            <li>Administer prize draws, competitions, and promotional campaigns.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">4. Sharing Your Information</h3>
          <p>
            We do not sell, trade, or rent your personal identification information to others. We may share your data with third parties only in the ways that are described in this Privacy Policy:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Service Providers:</strong> We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf and require access to such information to do that work. Examples include: payment processing, data analysis, email delivery, hosting services, customer service, and logistics/shipping partners (to deliver your physical orders).</li>
            <li><strong>Legal Obligations:</strong> We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process, such as in response to a court order or a subpoena.</li>
            <li><strong>Vital Interests and Legal Rights:</strong> We may disclose your information where we believe it is necessary to investigate, prevent, or take action regarding potential violations of our policies, suspected fraud, situations involving potential threats to the safety of any person, and illegal activities, or as evidence in litigation in which we are involved.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">5. Cookies and Tracking Technologies</h3>
          <p>
            We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. Cookies are small data files placed on your computer or mobile device when you visit a website. We use cookies to enable core functionality on the Site, such as remembering your login session or items in your shopping cart. You can usually choose to set your browser to remove cookies and to reject cookies. If you choose to remove cookies or reject cookies, this could affect certain features or services of our Site.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">6. Data Retention</h3>
          <p>
            We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Policy, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements). When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">7. Data Security</h3>
          <p>
            We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. Although we will do our best to protect your personal information, transmission of personal information to and from our Site is at your own risk. You should only access the Site within a secure environment.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">8. Your Privacy Rights</h3>
          <p>
            Depending on your location and applicable data protection laws, you may have the right to:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Request access and obtain a copy of your personal information.</li>
            <li>Request rectification or erasure of your data.</li>
            <li>Restrict the processing of your personal information.</li>
            <li>Object to the processing of your personal information.</li>
          </ul>
          <p>
            To make such a request, please contact us using the contact details provided below. We will consider and act upon any request in accordance with applicable data protection laws.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">9. Modifications to this Policy</h3>
          <p>
            We may update this Privacy Policy from time to time. The updated version will be indicated by an updated "Effective Date" and the updated version will be effective as soon as it is accessible. We encourage you to review this Privacy Policy frequently to be informed of how we are protecting your information.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">10. Contact Us</h3>
          <p>
            If you have questions or comments about this Privacy Policy or our privacy practices, please <Link to="/contact" className="text-amber-500 hover:text-amber-400 font-bold underline transition-colors">visit our Contact Us page</Link> to get in touch with our team.
          </p>
        </section>
      </div>
    );
  } else if (path === '/refund-policy') {
    title = 'Cancellation and Refund Policy';
    icon = <FiRefreshCw className="text-amber-500" size={42} />;
    content = (
      <div className="space-y-8 text-zinc-300 text-sm leading-relaxed">
        <p className="text-xs text-amber-500 font-bold uppercase tracking-wider">
          Effective Date: August 4, 2026
        </p>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">1. Introduction</h3>
          <p>
            At The Royal Tailor ("we," "us," or "our"), we strive to provide our customers with the highest quality apparel and an exceptional shopping experience at www.royaltailors.net (the "Site"). We understand that occasionally, you may need to cancel an order or seek a refund. This Cancellation and Refund Policy outlines the terms and conditions under which cancellations, returns, and refunds are processed. By making a purchase on our Site, you explicitly agree to the terms laid out in this policy.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">2. Order Cancellations by the Customer</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Standard (Ready-to-Wear) Orders:</strong> You may cancel an order for standard, non-customized products free of charge, provided the cancellation request is made before the order has been processed and dispatched from our facility. To request a cancellation, you must immediately contact our support team with your Order ID. Once an order has been handed over to our shipping partner, it cannot be cancelled, and you will need to follow the Return Policy outlined below.</li>
            <li><strong>Bespoke, Custom, and Altered Orders:</strong> Due to the personalized nature of made-to-measure, customized, or specifically altered garments, cancellation requests for these items will only be accepted within 24 hours of placing the order. After this 24-hour window, production and fabric cutting will have commenced, and the order can no longer be cancelled or fully refunded.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">3. Order Cancellations by The Royal Tailor</h3>
          <p>
            We reserve the right to cancel any order at our sole discretion, under circumstances including but not limited to:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Inaccuracies or errors in product pricing or detail information.</li>
            <li>Limitations on quantities available for purchase.</li>
            <li>Defects detected in the product quality prior to dispatch.</li>
            <li>Issues identified by our fraud and payment security department.</li>
          </ul>
          <p>
            If your order is cancelled by us after your chosen payment method has been charged, the said amount will be fully reversed back to your original payment method.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">4. Return Eligibility</h3>
          <p>
            For standard, non-customized products, we accept returns within 7 days from the date of delivery, subject to the following strict conditions:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>The garment must be unworn, unwashed, unaltered, and completely free of any stains, odors, or damages (e.g., makeup, perfume, or deodorant marks).</li>
            <li>The item must be in its original packaging with all brand tags, price tags, and labels fully intact and attached.</li>
            <li>You must provide the original invoice or proof of purchase.</li>
          </ul>
          <p>
            Items that do not meet these criteria will not be eligible for a return or refund and will be shipped back to you at your expense.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">5. Non-Returnable and Non-Refundable Items</h3>
          <p>
            The following categories of items are strictly non-returnable and non-refundable:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Bespoke, made-to-measure, or customized garments crafted specifically to your measurements.</li>
            <li>Any ready-to-wear items that you have requested to be altered prior to shipping.</li>
            <li>Undergarments, shapewear, and personal hygiene accessories (for health and safety reasons).</li>
            <li>Items purchased during promotional sales, clearance events, or using special discount codes.</li>
            <li>Gift cards.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">6. The Return Process</h3>
          <p>To initiate a return, please follow these steps:</p>
          <ul className="list-decimal pl-5 space-y-2">
            <li>Contact our customer support team within 7 days of receiving your order, detailing your Order ID and the reason for the return. Please include clear photographs if you are reporting a defect or damage.</li>
            <li>Upon approval of your return request, you will receive instructions on how and where to send your package.</li>
            <li>You will be responsible for paying for your own shipping costs for returning the item, unless the return is due to a defect or an error on our part (e.g., wrong item shipped). Shipping costs are non-refundable. We strongly recommend using a trackable shipping service.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">7. Inspection and Refund Processing</h3>
          <p>
            Once your return is received at our facility, it will undergo a thorough quality inspection. We will notify you via email regarding the approval or rejection of your refund based on the condition of the returned item.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Approved Refunds:</strong> If approved, your refund will be processed immediately by us. The credit will automatically be applied to your original method of payment (via PhonePe or the respective banking partner).</li>
            <li><strong>Timeline:</strong> Please allow 5 to 7 business days for the refunded amount to reflect in your bank account or credit card statement, depending on your card issuer's or bank's processing times.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">8. Exchanges</h3>
          <p>
            We only replace items if they are materially defective, damaged upon arrival, or if the incorrect size was shipped due to our error. If you need an exchange for the same item, please follow the standard return process and specify your request for an exchange. Standard items cannot be exchanged for bespoke items.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">9. Late or Missing Refunds</h3>
          <p>If you have not received a refund within the specified 5-7 business days:</p>
          <ul className="list-decimal pl-5 space-y-2">
            <li>First, re-check your bank account or credit card statement.</li>
            <li>Contact your credit card company or bank, as it may take some time before your refund is officially posted to their systems.</li>
            <li>If you have done all of this and you still have not received your refund, please contact us immediately.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">10. Contact Us</h3>
          <p>
            To initiate a return or inquire about an exchange or refund, please <Link to="/contact" className="text-amber-500 hover:text-amber-400 font-bold underline transition-colors">visit our Contact Us page</Link> to connect with our support team.
          </p>
        </section>
      </div>
    );
  } else if (path === '/shipping-policy') {
    title = 'Shipping and Delivery Policy';
    icon = <FiTruck className="text-amber-500" size={42} />;
    content = (
      <div className="space-y-8 text-zinc-300 text-sm leading-relaxed">
        <p className="text-xs text-amber-500 font-bold uppercase tracking-wider">
          Effective Date: August 4, 2026
        </p>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">1. Introduction</h3>
          <p>
            The Royal Tailor ("we," "us," or "our") is dedicated to delivering your purchases in a timely and secure manner. This Shipping and Delivery Policy details the procedures, timelines, and terms regarding the dispatch and delivery of products purchased through our website, www.royaltailors.net (the "Site"). By placing an order with us, you agree to the terms set forth in this policy.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">2. Order Processing Timelines</h3>
          <p>
            We meticulously process all orders to ensure quality and accuracy. Processing times vary based on the nature of the items ordered:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Ready-to-Wear (Standard) Apparel:</strong> Orders for standard, non-customized items are typically processed and dispatched within 1 to 3 business days from the date of order confirmation.</li>
            <li><strong>Bespoke and Custom-Tailored Apparel:</strong> Because these items are crafted specifically to your measurements, they require additional time for pattern creation, cutting, sewing, and quality assurance. Custom orders are typically processed and dispatched within 7 to 14 business days.</li>
            <li><strong>Mixed Orders:</strong> If your order contains both ready-to-wear and bespoke items, the entire order will be dispatched together once the custom items are completed. If you require the ready-to-wear items sooner, please place two separate orders.</li>
          </ul>
          <p>
            Please note that order processing occurs on standard business days (Monday through Friday). Orders are not processed, shipped, or delivered on weekends or recognized public holidays. If we are experiencing a high volume of orders, shipments may be delayed by a few days. If there is a significant delay in the shipment of your order, we will contact you via email or telephone.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">3. Shipping Rates and Delivery Estimates</h3>
          <p>
            Shipping charges for your order will be calculated dynamically and displayed at checkout before you complete your payment.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Standard Delivery:</strong> Typically takes 4 to 7 business days for transit after dispatch.</li>
            <li><strong>Expedited Delivery (If applicable):</strong> Typically takes 2 to 4 business days for transit after dispatch.</li>
            <li><strong>Free Shipping:</strong> We may offer free standard shipping on domestic orders exceeding a specific monetary threshold (e.g., ₹1,999). This threshold will be explicitly stated on the Site and automatically applied at checkout.</li>
          </ul>
          <p className="text-zinc-400 italic">
            Note: Delivery delays can occasionally occur due to unforeseen circumstances beyond our control, such as severe weather, natural disasters, or logistical disruptions experienced by our courier partners.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">4. Shipment Confirmation and Order Tracking</h3>
          <p>
            Once your order has been handed over to our logistics partner, you will receive a Shipment Confirmation email and/or SMS containing your tracking number(s) and a link to the courier's tracking portal. The tracking number typically becomes active within 24 hours of the dispatch notification. You can use this information to monitor the real-time progress of your delivery.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">5. Delivery Attempts and Undeliverable Packages</h3>
          <p>
            Our courier partners will typically make up to three (3) delivery attempts. If you are unavailable to receive the package, the courier may try to contact you via the phone number provided at checkout.
          </p>
          <p>
            If a package is returned to us as undeliverable due to a customer error (e.g., incorrect or incomplete shipping address provided, refusal to accept delivery, or failure to collect the package from a local depot after missed attempts), the customer will be responsible for any secondary shipping charges required to re-ship the order. We do not issue refunds for bespoke items that are returned to us as undeliverable.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">6. Incorrect Shipping Addresses</h3>
          <p>
            You are solely responsible for ensuring that the shipping address entered at checkout is completely accurate and formatted correctly. We cannot be held liable for shipments that are lost, delayed, or misdelivered due to an incorrect or incomplete address provided by the customer. If you realize you have made an error in your shipping address, you must contact our customer support immediately. We can only amend shipping details if the order has not yet been processed for dispatch.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">7. Damaged, Lost, or Stolen Packages</h3>
          <p>
            We take great care in packaging our garments securely. However, damages during transit can occasionally occur.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Damaged on Arrival:</strong> If you receive a parcel that appears visibly damaged, crushed, or tampered with, please refuse the delivery from the courier if possible. If you accept it, you must take clear photographs of the unboxing process and the damaged items, and contact us within 24 hours. We will work with the courier to file a claim and arrange for a replacement.</li>
            <li><strong>Lost in Transit:</strong> If your tracking information indicates no movement for more than 7 business days past the estimated delivery date, please contact us. We will initiate an investigation with the courier.</li>
            <li><strong>Stolen Packages:</strong> Once the tracking indicates that a package has been "Delivered" to the address provided, our liability ceases. We are not responsible for packages stolen from porches, mailboxes, or lobbies after a confirmed delivery.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">8. International Shipping</h3>
          <p>
            At this time, we primarily ship within India. If we expand to offer international shipping, the available destinations, associated shipping fees, and estimated transit times will be populated at checkout. For international orders, the customer is solely responsible for any customs duties, import taxes, or local clearance fees levied by the destination country.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">9. Contact Us</h3>
          <p>
            If you need assistance tracking a package or need to report a delivery issue, please <Link to="/contact" className="text-amber-500 hover:text-amber-400 font-bold underline transition-colors">visit our Contact Us page</Link> to connect with our logistics support team.
          </p>
        </section>
      </div>
    );
  } else {
    title = 'Legal Policy';
    icon = <FiFileText className="text-amber-500" size={42} />;
    content = <p className="text-zinc-400">Policy document not found.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center text-xs font-bold uppercase tracking-wider text-zinc-500 mb-8">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <FiChevronRight className="mx-2" />
        <Link to="/user-profile" className="hover:text-white transition-colors">Account</Link>
        <FiChevronRight className="mx-2" />
        <span className="text-amber-500">{title}</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center gap-6 shadow-2xl">
        <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest">{title}</h1>
          <p className="text-sm text-zinc-400 mt-2">
            The Royal Tailor Legal and Compliance Documentation
          </p>
        </div>
      </div>

      {/* Document Content */}
      <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 md:p-10 shadow-2xl">
        {content}
      </div>
    </div>
  );
};

export default PolicyPage;