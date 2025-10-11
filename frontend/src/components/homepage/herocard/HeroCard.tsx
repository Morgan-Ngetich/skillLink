import { Box, Flex } from '@chakra-ui/react';
import { FiYoutube, FiUserCheck, FiGlobe, FiBookOpen } from 'react-icons/fi';
import MentorSessionInfo from './MentorSessionInfo';
import InfoPanelContent from './InfoPanelContent';
import { useState } from 'react';

// All session data
const allSessionsData = [
  {
    mentor: {
      name: "Jane Doe",
      avatar: "https://i.pravatar.cc/40?img=1",
      company: "Meta",
      role: "Senior Engineer",
      bio: "passionate about helping mentees ace tech interviews."
    },
    session: {
      title: "System Design",
      fullTitle: "Live Mock Interview: System Design",
      description: "Practice a real-world system design interview. Get structured feedback, tips, and real-time mentoring.",
      date: "Wed, July 24 — 9:30 PM EAT",
      startTime: "25m",
      bookedSlots: 3,
      totalSlots: 5,
      image: "https://picsum.photos/seed/systemdesign/800"
    },
    avatarGroup: [
      { name: "Alex K.", location: "Nairobi", avatar: "https://i.pravatar.cc/40?img=11" },
      { name: "Priya R.", location: "Mumbai", avatar: "https://i.pravatar.cc/40?img=12" },
      { name: "John M.", location: "New York", avatar: "https://i.pravatar.cc/40?img=13" }
    ],
    preparationMaterials: [
      {
        icon: FiBookOpen,
        title: "Designing Scalable Systems",
        description: "Read this primer before the session. It's a great breakdown of scaling fundamentals.",
        link: "https://assets/scalable-systems.pdf",
        linkText: "View PDF ↗",
        color: "blue.500"
      },
      {
        icon: FiYoutube,
        title: "System Design Fundamentals (Video)",
        description: "A walkthrough of load balancers, caching, and the CAP theorem.",
        link: "https://www.youtube.com/watch?v=vvhC7DoHiq0",
        linkText: "Watch on YouTube ↗",
        color: "red.500"
      }
    ]
  },
  {
    mentor: {
      name: "John Smith",
      avatar: "https://i.pravatar.cc/40?img=2",
      company: "Google",
      role: "Staff Engineer",
      bio: "experienced in distributed systems and scalable architecture."
    },
    session: {
      title: "Data Structures",
      fullTitle: "Advanced Data Structures Workshop",
      description: "Deep dive into complex data structures and their real-world applications with hands-on practice.",
      date: "Thu, July 25 — 7:00 PM EAT",
      startTime: "2h 15m",
      bookedSlots: 2,
      totalSlots: 6,
      image: "https://picsum.photos/seed/datastructures/800"
    },
    avatarGroup: [
      { name: "Maria S.", location: "São Paulo", avatar: "https://i.pravatar.cc/40?img=14" },
      { name: "Ahmed T.", location: "Cairo", avatar: "https://i.pravatar.cc/40?img=15" },
      { name: "Lisa C.", location: "Toronto", avatar: "https://i.pravatar.cc/40?img=16" }
    ],
    preparationMaterials: [
      {
        icon: FiGlobe,
        title: "Explore: Real System Case Studies",
        description: "Go through detailed system designs used by Netflix, Uber, and Stripe.",
        link: "https://github.com/donnemartin/system-design-primer",
        linkText: "Visit GitHub ↗",
        color: "green.500"
      }
    ]
  },
  {
    mentor: {
      name: "Sarah Wilson",
      avatar: "https://i.pravatar.cc/40?img=3",
      company: "Amazon",
      role: "Principal Engineer",
      bio: "specializing in system design and engineering leadership."
    },
    session: {
      title: "Algorithms",
      fullTitle: "Algorithm Design Patterns",
      description: "Master common algorithm patterns and problem-solving techniques used in technical interviews.",
      date: "Fri, July 26 — 8:00 PM EAT",
      startTime: "45m",
      bookedSlots: 4,
      totalSlots: 4,
      image: "https://picsum.photos/seed/algorithms/800"
    },
    avatarGroup: [
      { name: "Alex K.", location: "Nairobi", avatar: "https://i.pravatar.cc/40?img=11" },
      { name: "John M.", location: "New York", avatar: "https://i.pravatar.cc/40?img=13" },
      { name: "Lisa C.", location: "Toronto", avatar: "https://i.pravatar.cc/40?img=16" }
    ],
    preparationMaterials: [
      {
        icon: FiUserCheck,
        title: "Bring Your Own System",
        description: "Come ready to discuss a system you've designed or a challenging problem you faced.",
        link: null,
        linkText: null,
        color: "purple.500"
      }
    ]
  }
];

interface HeroCardProps {
  variant?: 'responsive' | 'card';
}

const HeroCard = ({ variant = 'responsive' }: HeroCardProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allSessionsData.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + allSessionsData.length) % allSessionsData.length);
  };

  const currentData = allSessionsData[currentIndex];
  const isMobileLayout = variant === 'card';

  // ✅ return goes here
  return (
    <Flex
      direction={isMobileLayout ? 'column' : { base: 'column', md: 'row' }}
      w="full"
      maxW={isMobileLayout ? '100%' : { base: '100%', md: '960px', lg: '1200px' }}
      minH={isMobileLayout ? 'auto' : { base: 'auto', md: '20rem', lg: '24rem' }}
      h={isMobileLayout ? 'auto' : { base: 'full', md: '20rem', lg: '24rem' }}
      rounded="xl"
      shadow="md"
      overflow="hidden"
      border="1px solid"
      borderColor="gray.200"
    >
      {/* Mentor Session Card */}
      <Box
        w={isMobileLayout ? '100%' : { base: '100%', md: '45%' }}
        minH={isMobileLayout ? { base: 'full' } : { base: '20rem', sm: '22rem', md: 'auto' }}
        h={isMobileLayout ? 'auto' : { base: 'auto', md: '100%' }}
        flexShrink={0}
      >
        <MentorSessionInfo
          data={currentData}
          onPrevious={handlePrevious}
          onNext={handleNext}
          currentIndex={currentIndex}
          totalSlides={allSessionsData.length}
          isMobileLayout={isMobileLayout}
        />
      </Box>

      {/* Desktop Info Panel */}
      <Box
        w={isMobileLayout ? '0%' : { base: '0%', md: '55%' }}
        h="full"
        display={isMobileLayout ? 'none' : { base: 'none', md: 'block' }}
        overflow="auto"
      >
        <InfoPanelContent data={currentData} isMobileLayout={isMobileLayout} />
      </Box>
    </Flex>
  );
};


export default HeroCard