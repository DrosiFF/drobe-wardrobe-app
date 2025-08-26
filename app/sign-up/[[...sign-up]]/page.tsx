'use client'

import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen bg-[#0b0b0d] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Join Drobe</h1>
          <p className="text-gray-400">Create your account and start organizing your wardrobe</p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-[#121216] border border-gray-800 shadow-2xl",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton: "bg-[#1a1a1e] border-gray-700 hover:bg-[#22222a] text-white transition-colors",
              socialButtonsBlockButtonText: "text-white font-medium",
              socialButtonsProviderIcon: "brightness-0 invert",
              formButtonPrimary: "bg-[#22c55e] hover:bg-[#16a34a] text-white border-0 transition-colors",
              formFieldInput: "bg-[#1a1a1e] border-gray-700 text-white focus:border-[#22c55e]",
              formFieldLabel: "text-gray-300",
              footerActionLink: "text-[#22c55e] hover:text-[#16a34a] transition-colors",
              dividerText: "text-gray-400",
              dividerLine: "bg-gray-700",
              identityPreviewText: "text-white",
              identityPreviewEditButtonIcon: "text-gray-400",
              socialButtonsBlockButtonArrow: "text-white",
              socialButtonsBlock: "space-y-2"
            }
          }}
          routing="path"
          path="/sign-up"
          redirectUrl="/upload"
          forceRedirectUrl="/upload"
        />
      </div>
    </div>
  )
}
