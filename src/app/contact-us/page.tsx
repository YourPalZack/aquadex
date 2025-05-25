import ContactForm from "@/components/contact/ContactForm"

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Whether you're a fishkeeper looking for help, a brand interested in partnering with us, 
            or just want to share feedback, we're here to help.
          </p>
        </div>
        
        <ContactForm />
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">For Fishkeepers</h3>
            <p className="text-gray-600">
              Get help with water testing, fish care, and using AquaDex features.
            </p>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">For Brands & Stores</h3>
            <p className="text-gray-600">
              Interested in partnerships, advertising, or listing your products?
            </p>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">For Developers</h3>
            <p className="text-gray-600">
              Technical questions, API access, or integration opportunities.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: "Contact Us - AquaDex",
  description: "Get in touch with the AquaDex team for support, partnerships, or feedback.",
}