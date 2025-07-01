import React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface PasswordRule {
  label: string;
  test: (password: string) => boolean;
}

const passwordRules: PasswordRule[] = [
  {
    label: "Minimal 8 karakter",
    test: (password) => password.length >= 8
  },
  {
    label: "1 huruf besar (A-Z)",
    test: (password) => /[A-Z]/.test(password)
  },
  {
    label: "1 huruf kecil (a-z)",
    test: (password) => /[a-z]/.test(password)
  },
  {
    label: "1 angka (0-9)",
    test: (password) => /[0-9]/.test(password)
  },
  {
    label: "1 karakter khusus (!@#$%^&*)",
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
];

export default function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const getPasswordStrength = (password: string): number => {
    return passwordRules.reduce((score, rule) => {
      return score + (rule.test(password) ? 1 : 0);
    }, 0);
  };

  const strength = getPasswordStrength(password);
  const strengthPercentage = (strength / passwordRules.length) * 100;

  const getStrengthColor = (strength: number): string => {
    if (strength <= 2) return "bg-red-500";
    if (strength <= 3) return "bg-yellow-500";
    if (strength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = (strength: number): string => {
    if (strength <= 2) return "Lemah";
    if (strength <= 3) return "Sedang";
    if (strength <= 4) return "Kuat";
    return "Sangat Kuat";
  };

  if (!password) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Password Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Kekuatan Password:</span>
          <span className={cn(
            "font-medium",
            strength <= 2 ? "text-red-600" : 
            strength <= 3 ? "text-yellow-600" : 
            strength <= 4 ? "text-blue-600" : "text-green-600"
          )}>
            {getStrengthText(strength)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              getStrengthColor(strength)
            )}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
      </div>

      {/* Password Rules */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-700">Persyaratan password:</p>
        {passwordRules.map((rule, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            {rule.test(password) ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )}
            <span className={cn(
              rule.test(password) ? "text-green-700" : "text-red-600"
            )}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}