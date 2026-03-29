import { RoleCard } from "../components/cards/RoleCard";

export const SelectRolePage = () => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-start bg-[#E6F6FF] px-40 py-8">
      <h2 className="font-roboto text-3xl font-bold">
        Please Select Your Role
      </h2>
      <div className="flex flex-row items-center justify-center gap-4">
        <RoleCard
          role={"Student Organization"}
          description={
            "Find your dream sponsor with AI-powered recommendations"
          }
          features={[
            {
              text: "Smart CV parsing and optimization",
              logo: "",
            },
            {
              text: "Personalized Job Recommendations",
              logo: "",
            },
            {
              text: "Skill gap analysis and improvement",
              logo: "",
            },
          ]}
        />
        <RoleCard
          role={"Corporation"}
          description={"Find Perfect Candidates with Intelligent matching"}
          features={[
            { text: "Detailed Analytics Reports", logo: "" },
            { text: "Advance Candidate Filtering", logo: "" },
            { text: "AI Powered Candidate Rankings", logo: "" },
          ]}
        />
      </div>
    </div>
  );
};
