import SignUpForm from "@/components/auth/SignUpForm"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <SignUpForm />
      </div>
    </div>
  )
}

export const metadata = {
  title: "Sign Up - AquaDex",
  description: "Create your AquaDex account to start managing your aquariums with AI-powered tools.",
}