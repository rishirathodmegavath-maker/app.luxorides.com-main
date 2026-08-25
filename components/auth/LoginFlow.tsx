"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import MobileInputStep from "./MobileInputStep";
import OtpInputStep from "./OtpInputStep";
import ProfileSetupStep from "./ProfileSetupStep";
import { AuthService } from "@/services/auth.service";
import { useClientAuth } from "./ClientAuthContext";
import { Client } from "@/types/client";

type Step = "mobile" | "otp" | "profile";

export type PhoneInput = {
  countryCode: string;
  localNumber: string;
};

export default function LoginFlow() {
  const [step, setStep] = useState<Step>("mobile");
  const [phoneData, setPhoneData] = useState<PhoneInput | null>(null);

  const router = useRouter();
  const { setClient } = useClientAuth();

  const completeLogin = useCallback(
    (client: Client) => {
      setClient(client);
      router.replace("/");
    },
    [router, setClient],
  );

  return (
    <>
      {step === "mobile" && (
        <MobileInputStep
          onNext={async (data) => {
            setPhoneData(data);

            // 🔑 SEND OTP IMMEDIATELY
            await AuthService.generateOtp({
              mobileNumber: `${data.countryCode}${data.localNumber}`,
            });

            setStep("otp");
          }}
        />
      )}

      {step === "otp" && phoneData && (
        <OtpInputStep
          phone={phoneData}
          onVerified={() => {
            setStep("profile");
          }}
        />
      )}

      {step === "profile" && (
        <ProfileSetupStep
          onComplete={completeLogin}
        />
      )}
    </>
  );
}
