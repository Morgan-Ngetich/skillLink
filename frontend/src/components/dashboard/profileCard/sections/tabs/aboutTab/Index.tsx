import { Box, Separator } from '@chakra-ui/react';
import type { UserProfilePublic } from '@/client';
import About from './aboutSections/About';
import ExperienceSection from './aboutSections/ExperienceSection';
import EducationSection from './aboutSections/EducationSection';
import Goals from './aboutSections/Goals';
import SkillsOrInterests from './aboutSections/SkillsOrInterests';

interface AboutTabProps {
  profile?: UserProfilePublic;
  onEdit?: {
    basic?: () => void;
    experience?: () => void;
    education?: () => void;
    goals?: () => void;
    skills?: () => void;
    interests?: () => void;
  };
}

const AboutTab = ({ profile, onEdit }: AboutTabProps) => {
  if (!profile) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Section = ({ Component, editHandler, ...props }: any) => (
    <>
      <Component {...props} onEditClick={editHandler} />
      <Separator my={4} />
    </>
  );

  return (
    <Box>
      {profile.about && <Section Component={About} editHandler={onEdit?.basic} about={profile.about} />}
      {profile.experience && <Section Component={ExperienceSection} editHandler={onEdit?.experience} experience={profile.experience} />}
      {profile.education && <Section Component={EducationSection} editHandler={onEdit?.education} education={profile.education} />}
      {profile.goals && <Section Component={Goals} editHandler={onEdit?.goals} goals={profile.goals} />}
      {profile.skills && <Section Component={SkillsOrInterests} editHandler={onEdit?.skills} skillsOrinterests={profile.skills} section="skillsSection" />}
      {profile.interests && <Section Component={SkillsOrInterests} editHandler={onEdit?.interests} skillsOrinterests={profile.interests} />}
    </Box>
  );
};

export default AboutTab;
