interface FeatureSpec {
  text: string;
  logo: string;
}

interface RoleCardProps {
  role: string;
  description: string;
  features: FeatureSpec[];
}

export const RoleCard = ({ role, description, features }: RoleCardProps) => {
  return (
    <div className="flex h-full w-full max-w-100 flex-col items-center justify-center gap-4 bg-white">
      <h1>{role}</h1>
      <p>{description}</p>
      <ul>
        {features.map((item, index) => (
          <li
            className="flex flex-row items-center justify-center gap-2"
            key={index}
          >
            <img className="text-xs" src={item.logo} alt={item.text} />
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
};
