export const HeroSection = () => {
  return (
    <div className="relative hidden w-1/2 lg:block">
      <div className="bg-login-image h-screen w-full bg-cover bg-center">
      </div>
    </div>
  );
};

interface SignupHeroProps {
  role: "org" | "corp" | null;
}

const orgFeatures = [
  { icon: "📋", text: "Organizations Profiling" },
  { icon: "🔍", text: "Personalized Partners Recommendations" },
  { icon: "🤝", text: "Connect with aligned Partners" },
];

const corpFeatures = [
  { icon: "📊", text: "Detailed Partnership Insights" },
  { icon: "🔍", text: "Advanced Organization Filtering" },
  { icon: "🎯", text: "Personalized Events Recommendation" },
];

export const SignupHeroSection = ({ role }: SignupHeroProps) => {
  const title =
    role === "corp"
      ? "Sign up as Corporate Partners"
      : "Sign up as Student Organization Administrators";

  const tagline =
    role === "corp"
      ? "Find events. Build partnerships. Drive results."
      : "Connect with brands that align with your organization's values and goals.";

  const features = role === "corp" ? corpFeatures : orgFeatures;

  const roleLabel = role === "corp" ? "Corporation" : "Student Organization";
  const roleDescription =
    role === "corp"
      ? "Find Perfect Candidates to build partnerships with"
      : "Find your dream partners for your organization events and activities";

  const roleIcon =
    role === "corp" ? (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mx-auto mb-2 h-12 w-12 text-gray-800">
        <path d="M3 21V3h8v4h10v14H3zm2-2h4v-2H5v2zm0-4h4v-2H5v2zm0-4h4V9H5v2zm0-4h4V5H5v2zm6 12h8v-2h-8v2zm0-4h8v-2h-8v2zm0-4h8V9h-8v2zm2-4V5h-2v2h2z" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mx-auto mb-2 h-12 w-12 text-gray-800">
        <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58A2.01 2.01 0 000 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85A6.95 6.95 0 0020 14c-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
      </svg>
    );

  return (
    <div className="relative hidden w-1/2 lg:block">
      <div className="bg-signup-image h-screen w-full bg-cover bg-center">
        <div className="flex h-full flex-col items-center justify-center px-12">
          <div className="mb-8 text-center">
            <h1 className="mb-3 text-3xl font-extrabold text-white drop-shadow-lg xl:text-4xl">
              {title}
            </h1>
            <p className="text-lg font-semibold italic text-gray-200 drop-shadow-md">
              {tagline}
            </p>
          </div>

          <div className="w-full max-w-xs rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur-sm">
            {roleIcon}
            <h3 className="mb-1 text-center text-lg font-bold text-gray-800">{roleLabel}</h3>
            <p className="mb-4 text-center text-xs text-gray-500">{roleDescription}</p>
            <ul className="space-y-3">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-semibold text-gray-800">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm">
                    {f.icon}
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
