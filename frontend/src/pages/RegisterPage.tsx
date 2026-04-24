import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import emailLogo from "../assets/images/email-logo.png";
import passwordLogo from "../assets/images/password-logo.png";
import { InputField } from "../components/fields/InputField";
import { SelectField } from "../components/fields/SelectField";
import { SignupHeroSection } from "../components/sections/AuthSection";

type Role = "org" | "corp";

const CATEGORIES = [
  "Tech",
  "Finance",
  "Healthcare",
  "Education",
  "Gaming",
  "Retail",
  "Energy",
  "Automotive",
  "Logistics",
  "Real Estate",
];

/* ──────────────────────────────────────────────
   Step indicator dots
   ────────────────────────────────────────────── */
const StepDots = ({ current, total }: { current: number; total: number }) => (
  <div className="flex items-center justify-center gap-2">
    {Array.from({ length: total }).map((_, i) => (
      <span
        key={i}
        className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
          i === current
            ? "scale-110 bg-[#2563EB]"
            : i < current
              ? "bg-[#2563EB]/50"
              : "bg-gray-300"
        }`}
      />
    ))}
  </div>
);

/* ──────────────────────────────────────────────
   Stage 0 — Role Selection
   ────────────────────────────────────────────── */
const RoleSelection = ({ onSelect }: { onSelect: (role: Role) => void }) => {
  const roles: { role: Role; label: string; description: string; features: string[]; icon: React.ReactNode }[] = [
    {
      role: "org",
      label: "Student Organization",
      description: "Find your dream sponsor with AI-powered recommendations",
      features: [
        "Personalized Sponsor Recommendations",
        "Create Events",
        "Showcase Your Organization",
      ],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mx-auto mb-3 h-16 w-16 text-gray-800">
          <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58A2.01 2.01 0 000 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85A6.95 6.95 0 0020 14c-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
        </svg>
      ),
    },
    {
      role: "corp",
      label: "Corporation",
      description: "Find Perfect Event Candidates to Sponsor with AI-Powered Matching",
      features: [
        "Detailed Analytics Reports",
        "Advance Candidate Filtering",
        "AI Powered Candidate Rankings",
      ],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mx-auto mb-3 h-16 w-16 text-gray-800">
          <path d="M3 21V3h8v4h10v14H3zm2-2h4v-2H5v2zm0-4h4v-2H5v2zm0-4h4V9H5v2zm0-4h4V5H5v2zm6 12h8v-2h-8v2zm0-4h8v-2h-8v2zm0-4h8V9h-8v2zm2-4V5h-2v2h2z" />
        </svg>
      ),
    },
  ];

  const featureIcons = ["📄", "🔍", "🎯"];

  return (
    <div className="font-roboto flex min-h-screen w-full flex-col items-center bg-[#E6F6FF] text-gray-800">
      {/* Header */}
      <div className="mt-16 mb-10 text-center sm:mt-20">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
          Please select your role
        </h1>
      </div>

      {/* Role cards */}
      <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-8 px-6 md:flex-row md:items-stretch">
        {roles.map((r) => (
          <div
            key={r.role}
            className="group flex w-full max-w-sm cursor-pointer flex-col items-center rounded-3xl border-2 border-transparent bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#2563EB]/30 hover:shadow-xl"
            onClick={() => onSelect(r.role)}
          >
            {r.icon}
            <h2 className="mb-2 text-xl font-bold text-gray-900">{r.label}</h2>
            <p className="mb-6 text-center text-sm text-gray-500">{r.description}</p>
            <ul className="mb-6 w-full space-y-3">
              {r.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-semibold text-gray-800">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm">
                    {featureIcons[i]}
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              className="mt-auto w-full rounded-full bg-[#005a8d] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#004a75] group-hover:shadow-lg"
            >
              Continue as {r.role === "org" ? "Organization" : "Corporation"}
            </button>
          </div>
        ))}
      </div>

      {/* Platform features */}
      <div className="mt-16 mb-12 w-full max-w-3xl px-6">
        <h2 className="mb-8 text-center text-2xl font-extrabold text-gray-900">
          Platform Features
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { icon: "📄", title: "CV Parsing", desc: "Advanced AI extracts skills, experience, and education" },
            { icon: "🎯", title: "Smart Matching", desc: "Intelligent algorithms match candidates to perfect opportunities" },
            { icon: "📊", title: "Analytics", desc: "Comprehensive insights and performance metrics" },
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <span className="mb-2 text-3xl">{f.icon}</span>
              <h3 className="mb-1 text-base font-bold text-gray-900">{f.title}</h3>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Step dots */}
      <div className="mb-10">
        <StepDots current={0} total={3} />
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────
   Stage 1 — Credentials Form
   ────────────────────────────────────────────── */
interface CredentialsProps {
  role: Role;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
  errorMessage: string;
}

const CredentialsForm = ({
  role,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  category,
  setCategory,
  onNext,
  onBack,
  errorMessage,
}: CredentialsProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="font-roboto flex min-h-screen w-full text-gray-800">
      <SignupHeroSection role={role} />

      <div className="flex w-full flex-col justify-center bg-[#E6F6FF] p-8 sm:p-12 lg:w-1/2 xl:p-24">
        <div className="mx-auto w-full max-w-md">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col rounded-[2.5rem] bg-white p-8 shadow-sm sm:p-10"
          >
            {errorMessage && (
              <div className="mb-4 text-center text-sm font-medium text-red-500">
                {errorMessage}
              </div>
            )}

            <InputField
              label="Email"
              type="email"
              placeholder="example.@gmail.com"
              iconSrc={emailLogo}
              iconAlt="Email icon"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <InputField
              label="Password"
              type="password"
              placeholder="Your Password"
              iconSrc={passwordLogo}
              iconAlt="Password icon"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              rightElement={
                <button type="button" className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              }
            />

            <InputField
              label="Confirm Password"
              type="password"
              placeholder="Re-enter Your Password"
              iconSrc={passwordLogo}
              iconAlt="Password icon"
              containerClassName={role === "corp" ? "mb-6" : "mb-3"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              rightElement={
                <button type="button" className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              }
            />

            {role === "corp" && (
              <SelectField
                label="Category"
                iconSrc={emailLogo}
                iconAlt="Category icon"
                options={CATEGORIES}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Select a category"
                containerClassName="mb-3"
                required
              />
            )}

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={onBack}
                className="text-sm font-medium text-gray-500 underline transition-colors hover:text-gray-700"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#005a8d] px-8 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#004a75]"
              >
                Next
              </button>
            </div>
          </form>

          {/* Step dots */}
          <div className="mt-6">
            <StepDots current={1} total={3} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────
   Stage 2 — Organization / Company Details
   ────────────────────────────────────────────── */
interface DetailsProps {
  role: Role;
  name: string;
  setName: (v: string) => void;
  details: string;
  setDetails: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  errorMessage: string;
  isLoading: boolean;
}

const DetailsForm = ({
  role,
  name,
  setName,
  details,
  setDetails,
  onSubmit,
  onBack,
  errorMessage,
  isLoading,
}: DetailsProps) => {
  const entityLabel = role === "corp" ? "Company" : "Organization";

  return (
    <div className="font-roboto flex min-h-screen w-full text-gray-800">
      <SignupHeroSection role={role} />

      <div className="flex w-full flex-col justify-center bg-[#E6F6FF] p-8 sm:p-12 lg:w-1/2 xl:p-24">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-[#2563EB] sm:text-4xl leading-tight">
              Tell us about <br />your {entityLabel}
            </h2>
            <p className="mt-2 text-base font-semibold text-[#659BDF]">
              Help us understand your {entityLabel.toLowerCase()} better for smarter AI matching.
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="flex flex-col rounded-[2.5rem] bg-white p-8 shadow-sm sm:p-10"
          >
            {errorMessage && (
              <div className="mb-4 text-center text-sm font-medium text-red-500">
                {errorMessage}
              </div>
            )}

            {/* Name field */}
            <div className="mb-6">
              <h2 className="mb-2 ml-1 text-sm font-semibold text-gray-800">{entityLabel} Name</h2>
              <input
                type="text"
                placeholder={`Enter your ${entityLabel.toLowerCase()} name`}
                className="w-full rounded-full border border-gray-400 bg-white px-5 py-2.5 text-sm text-gray-800 transition-all duration-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Details textarea */}
            <div className="mb-6">
              <h2 className="mb-2 ml-1 text-sm font-semibold text-gray-800">About / Description</h2>
              <textarea
                placeholder={`Describe what your ${entityLabel.toLowerCase()} does, its mission, and what kind of partnerships you're looking for...`}
                className="h-32 w-full resize-none rounded-2xl border border-gray-400 bg-white px-5 py-3 text-sm text-gray-800 transition-all duration-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                required
              />
            </div>

            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={onBack}
                className="text-sm font-medium text-gray-500 underline transition-colors hover:text-gray-700"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-full bg-[#005a8d] px-8 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#004a75] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing up...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </button>
            </div>

            <div className="mt-4 text-center text-sm text-gray-800">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-500 underline transition-colors hover:text-blue-600"
              >
                Log In
              </Link>
            </div>
          </form>

          {/* Step dots */}
          <div className="mt-6">
            <StepDots current={2} total={3} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────
   Main RegisterPage — orchestrates stages
   ────────────────────────────────────────────── */
export const RegisterPage = () => {
  const navigate = useNavigate();

  // Stage: 0 = role select, 1 = credentials, 2 = details
  const [stage, setStage] = useState(0);
  const [role, setRole] = useState<Role | null>(null);

  // Credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [category, setCategory] = useState("");

  // Details
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");

  // UI
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /* ── Stage 0 → 1 ── */
  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setErrorMessage("");
    setStage(1);
  };

  /* ── Stage 1 → 2 (validate credentials) ── */
  const handleCredentialsNext = () => {
    setErrorMessage("");
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
    if (role === "corp" && !category) {
      setErrorMessage("Please select a category.");
      return;
    }
    setStage(2);
  };

  /* ── Stage 2 → Submit ── */
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const endpoint =
      role === "corp"
        ? "http://localhost:3000/auth/corp/register"
        : "http://localhost:3000/auth/org/register";

    const body: Record<string, string> =
      role === "corp"
        ? { email, password, name, details, category }
        : { email, password, name, details };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/login");
      } else {
        setErrorMessage(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Network error:", error);
      setErrorMessage("Unable to connect to the server. Please ensure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Render current stage ── */
  if (stage === 0) {
    return <RoleSelection onSelect={handleRoleSelect} />;
  }

  if (stage === 1 && role) {
    return (
      <CredentialsForm
        role={role}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        category={category}
        setCategory={setCategory}
        onNext={handleCredentialsNext}
        onBack={() => {
          setErrorMessage("");
          setStage(0);
        }}
        errorMessage={errorMessage}
      />
    );
  }

  if (stage === 2 && role) {
    return (
      <DetailsForm
        role={role}
        name={name}
        setName={setName}
        details={details}
        setDetails={setDetails}
        onSubmit={handleFinalSubmit}
        onBack={() => {
          setErrorMessage("");
          setStage(1);
        }}
        errorMessage={errorMessage}
        isLoading={isLoading}
      />
    );
  }

  return null;
};
