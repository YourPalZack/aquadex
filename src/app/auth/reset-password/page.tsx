import ResetPasswordForm from "@/components/auth/ResetPasswordForm"

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <ResetPasswordForm />
      </div>
    </div>
  )
}

export const metadata = {
  title: "Reset Password - AquaDex",
  description: "Set a new password for your AquaDex account.",
}