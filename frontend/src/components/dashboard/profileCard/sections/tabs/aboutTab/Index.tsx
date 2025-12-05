import { Box, Separator } from '@chakra-ui/react';
import type { UserProfilePublic } from '@/client';
import About from './aboutSections/About';
import ExperienceSection from './aboutSections/ExperienceSection';
import EducationSection from './aboutSections/EducationSection';
import Goals from './aboutSections/Goals';
import SkillsOrInterests from './aboutSections/SkillsOrInterests';

interface AboutTabProps {
  profile?: UserProfilePublic;
}

const AboutTab = ({ profile }: AboutTabProps) => {
  if (!profile) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Section = ({ Component, ...props }: any) => (
    <>
      <Component {...props} />
      <Separator my={4} />
    </>
  );

  return (
    <Box>
      {profile.about && <Section Component={About} about={profile.about} />}
      {profile.experience && <Section Component={ExperienceSection} experience={profile.experience} />}
      {profile.education && <Section Component={EducationSection} education={profile.education} />}
      {profile.goals && <Section Component={Goals} goals={profile.goals} />}
      {profile.skills && <Section Component={SkillsOrInterests} skillsOrinterests={profile.skills} section="skillsSection" />}
      {profile.interests && <Section Component={SkillsOrInterests} skillsOrinterests={profile.interests} />}
    </Box>
  );
};

export default AboutTab;