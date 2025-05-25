import SignInForm from "@/components/auth/SignInForm"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <SignInForm />
      </div>
    </div>
  )
}

export const metadata = {
  title: "Sign In - AquaDex",
  description: "Sign in to your AquaDex account to manage your aquariums and access all features.",
}