import SonarCloudLogo from '@/assets/sonarcloud.svg';
import JiraLogo from '@/assets/jira.svg';
import DynamicHeroIcon from './dynamicIcon';
import * as HIcons from '@heroicons/react/24/solid';

export function Header({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-purple-700 text-white p-4">
      <div className="flex items-center mb-2">
        {icon === 'sonarcloud' && (
          <img src={SonarCloudLogo} alt="SonarCloud" className="h-8 w-8 mr-2" />
        )}
        {icon === 'jira' && (
          <img src={JiraLogo} alt="Jira" className="h-8 w-8 mr-2" />
        )}
        {icon && (
          <DynamicHeroIcon
            icon={icon as keyof typeof HIcons}
            className="h-8 w-8 mr-2"
          />
        )}
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>
      <p className="text-white">{description}</p>
    </div>
  );
}
