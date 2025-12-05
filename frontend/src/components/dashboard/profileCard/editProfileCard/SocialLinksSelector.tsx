import { useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Input,
  Text,
  VStack,
  HStack,
  IconButton,
} from '@chakra-ui/react'
import {
  FaLinkedin,
  FaGithub,
  FaInstagram,
  FaYoutube,
  FaDribbble,
  FaBehance,
  FaMedium,
  FaStackOverflow,
  FaFacebook,
  FaTiktok,
  FaTwitch,
  FaDiscord,
  FaSlack,
  FaTelegram,
  FaWhatsapp,
  FaEdit,
} from 'react-icons/fa'
import { 
  FaXTwitter,
  FaThreads,
  FaMastodon,
} from 'react-icons/fa6'
import { 
  LuCheck, 
  LuX, 
  LuSearch, 
  LuMail, 
  LuPhone,
  LuGlobe,
} from 'react-icons/lu'
import { Field } from '@/components/ui/field'
import { DialogRoot, DialogContent, DialogHeader, DialogBody, DialogFooter } from '@/components/ui/dialog'
import type { IconBaseProps } from 'react-icons/lib'

interface SocialPlatform {
  id: string
  name: string
  icon: React.ComponentType<IconBaseProps>
  color: string
  placeholder: string
  prefix?: string
  category: 'social' | 'professional' | 'creative' | 'messaging' | 'contact'
}

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  // Professional
  { id: 'linkedin', name: 'LinkedIn', icon: FaLinkedin, color: '#0A66C2', placeholder: 'https://linkedin.com/in/yourprofile', prefix: 'https://linkedin.com/in/', category: 'professional' },
  { id: 'github', name: 'GitHub', icon: FaGithub, color: '#181717', placeholder: 'https://github.com/username', prefix: 'https://github.com/', category: 'professional' },
  { id: 'stackoverflow', name: 'Stack Overflow', icon: FaStackOverflow, color: '#F58025', placeholder: 'stackoverflow.com/users/...', prefix: 'https://stackoverflow.com/users/', category: 'professional' },
  
  // Social
  { id: 'twitter', name: 'X (Twitter)', icon: FaXTwitter, color: '#000000', placeholder: 'https://x.com/handle', prefix: 'https://x.com/', category: 'social' },
  { id: 'instagram', name: 'Instagram', icon: FaInstagram, color: '#E4405F', placeholder: 'https://instagram.com/username', prefix: 'https://instagram.com/', category: 'social' },
  { id: 'facebook', name: 'Facebook', icon: FaFacebook, color: '#1877F2', placeholder: 'https://facebook.com/username', prefix: 'https://facebook.com/', category: 'social' },
  { id: 'threads', name: 'Threads', icon: FaThreads, color: '#000000', placeholder: 'https://threads.net/@username', prefix: 'https://threads.net/@', category: 'social' },
  { id: 'mastodon', name: 'Mastodon', icon: FaMastodon, color: '#6364FF', placeholder: 'https://mastodon.social/@username', prefix: 'https://mastodon.social/@', category: 'social' },
  { id: 'tiktok', name: 'TikTok', icon: FaTiktok, color: '#000000', placeholder: 'https://tiktok.com/@username', prefix: 'https://tiktok.com/@', category: 'social' },
  
  // Creative
  { id: 'youtube', name: 'YouTube', icon: FaYoutube, color: '#FF0000', placeholder: 'https://youtube.com/@channel', prefix: 'https://youtube.com/@', category: 'creative' },
  { id: 'dribbble', name: 'Dribbble', icon: FaDribbble, color: '#EA4C89', placeholder: 'https://dribbble.com/username', prefix: 'https://dribbble.com/', category: 'creative' },
  { id: 'behance', name: 'Behance', icon: FaBehance, color: '#1769FF', placeholder: 'https://behance.net/username', prefix: 'https://behance.net/', category: 'creative' },
  { id: 'medium', name: 'Medium', icon: FaMedium, color: '#000000', placeholder: 'https://medium.com/@username', prefix: 'https://medium.com/@', category: 'creative' },
  { id: 'twitch', name: 'Twitch', icon: FaTwitch, color: '#9146FF', placeholder: 'https://twitch.tv/username', prefix: 'https://twitch.tv/', category: 'creative' },
  
  // Messaging
  { id: 'whatsapp', name: 'WhatsApp', icon: FaWhatsapp, color: '#25D366', placeholder: 'https://wa.me/1234567890', prefix: 'https://wa.me/', category: 'messaging' },
  { id: 'telegram', name: 'Telegram', icon: FaTelegram, color: '#26A5E4', placeholder: 'https://t.me/username', prefix: 'https://t.me/', category: 'messaging' },
  { id: 'discord', name: 'Discord', icon: FaDiscord, color: '#5865F2', placeholder: 'https://discord.gg/invite', prefix: 'https://discord.gg/', category: 'messaging' },
  { id: 'slack', name: 'Slack', icon: FaSlack, color: '#4A154B', placeholder: 'https://workspace.slack.com', prefix: 'https://', category: 'messaging' },
]

interface SocialLinksSelectorProps {
  socialLinks?: Record<string, string>
  contactDetails?: Record<string, string>
  onChange: (socialLinks: Record<string, string>, contactDetails: Record<string, string>) => void
}

export default function SocialLinksSelector({
  socialLinks = {},
  contactDetails = {},
  onChange
}: SocialLinksSelectorProps) {
  const [search, setSearch] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null)
  const [linkValue, setLinkValue] = useState('')
  const [editingKey, setEditingKey] = useState<string | null>(null)

  // Filter platforms by search
  const filteredPlatforms = SOCIAL_PLATFORMS.filter(platform =>
    platform.name.toLowerCase().includes(search.toLowerCase()) ||
    platform.id.toLowerCase().includes(search.toLowerCase())
  )

  // Group by category
  const groupedPlatforms = filteredPlatforms.reduce((acc, platform) => {
    if (!acc[platform.category]) {
      acc[platform.category] = []
    }
    acc[platform.category].push(platform)
    return acc
  }, {} as Record<string, SocialPlatform[]>)

  // !Check the use of the this Editing Key.
  console.log(editingKey)
  const handlePlatformClick = (platform: SocialPlatform) => {
    setSelectedPlatform(platform)
    setLinkValue(socialLinks[platform.id] || '')
    setEditingKey(platform.id)
  }

  const handleSaveLink = () => {
    if (selectedPlatform && linkValue.trim()) {
      onChange(
        { ...socialLinks, [selectedPlatform.id]: linkValue },
        contactDetails
      )
    }
    setSelectedPlatform(null)
    setLinkValue('')
    setEditingKey(null)
  }

  const handleRemoveLink = (key: string) => {
    const newLinks = { ...socialLinks }
    delete newLinks[key]
    onChange(newLinks, contactDetails)
  }

  const handleContactChange = (field: string, value: string) => {
    onChange(socialLinks, { ...contactDetails, [field]: value })
  }

  const categoryNames = {
    professional: 'Professional',
    social: 'Social Media',
    creative: 'Creative Platforms',
    messaging: 'Messaging',
    contact: 'Contact Info'
  }

  return (
    <VStack align="stretch" gap={6}>
      {/* Added Links */}
      {Object.keys(socialLinks).length > 0 && (
        <Box>
          <Text fontSize="sm" fontWeight="semibold" color="fg.muted" mb={3}>
            Your Connected Profiles ({Object.keys(socialLinks).length})
          </Text>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={3}>
            {Object.entries(socialLinks).map(([key, value]) => {
              const platform = SOCIAL_PLATFORMS.find(p => p.id === key)
              if (!platform) return null
              const Icon = platform.icon
              
              return (
                <HStack
                  key={key}
                  p={3}
                  bg="bg.subtle"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="border"
                  justify="space-between"
                >
                  <HStack flex={1} minW={0}>
                    <Box
                      p={2}
                      bg="white"
                      borderRadius="md"
                      color={platform.color}
                      flexShrink={0}
                    >
                      <Icon size={20} />
                    </Box>
                    <VStack align="start" gap={0} flex={1} minW={0}>
                      <Text fontSize="sm" fontWeight="medium">
                        {platform.name}
                      </Text>
                      <Text fontSize="xs" color="fg.muted" truncate>
                        {value}
                      </Text>
                    </VStack>
                  </HStack>
                  <HStack flexShrink={0}>
                    <IconButton
                      aria-label="Edit"
                      size="xs"
                      variant="ghost"
                      onClick={() => handlePlatformClick(platform)}
                    >
                      <FaEdit />
                    </IconButton>
                    <IconButton
                      aria-label="Remove"
                      size="xs"
                      variant="ghost"
                      colorPalette="red"
                      onClick={() => handleRemoveLink(key)}
                    >
                      <LuX />
                    </IconButton>
                  </HStack>
                </HStack>
              )
            })}
          </Grid>
        </Box>
      )}

      {/* Search */}
      <Box w="100%">
        <Field>
          <HStack  w="100%">
            <Box position="relative" flex={1}>
              <Input
                placeholder="Search platforms... (e.g., LinkedIn, GitHub)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                pl="40px"
              />
              <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" color="fg.muted">
                <LuSearch size={18} />
              </Box>
            </Box>
          </HStack>
        </Field>
      </Box>

      {/* Platform Grid */}
      {Object.entries(groupedPlatforms).map(([category, platforms]) => (
        <Box key={category}>
          <Text fontSize="sm" fontWeight="semibold" color="fg.muted" mb={3}>
            {categoryNames[category as keyof typeof categoryNames]}
          </Text>
          <Grid
            templateColumns={{ base: 'repeat(4, 1fr)', md: 'repeat(7, 1fr)' }}
            gap={3}
          >
            {platforms.map((platform) => {
              const Icon = platform.icon
              const isConnected = !!socialLinks[platform.id]
              
              return (
                <Box
                  key={platform.id}
                  position="relative"
                  cursor="pointer"
                  onClick={() => handlePlatformClick(platform)}
                  role="button"
                  tabIndex={0}
                >
                  <VStack
                    gap={2}
                    p={2}
                    bg={isConnected ? {base: 'green.50', _dark: 'white'} : {base: 'bg.subtle', _dark: "gray.700"}}
                    border="2px solid"
                    borderColor={isConnected ? 'green.500' : 'border'}
                    color={isConnected ? "black" : "" }
                    borderRadius="lg"
                    _hover={{
                      borderColor: isConnected ? 'green.500' : 'teal.500',
                      transform: 'translateY(-2px)',
                      boxShadow: 'md'
                    }}
                    transition="all 0.2s"
                  >
                    <Box color={platform.color}>
                      <Icon size={28} />
                    </Box>
                    <Text fontSize="xs" fontWeight="medium" textAlign="center" lineClamp={1}>
                      {platform.name}
                    </Text>
                    
                    {isConnected && (
                      <Box
                        position="absolute"
                        top="-6px"
                        right="-6px"
                        bg="green.500"
                        borderRadius="full"
                        p={1}
                        border="2px solid white"
                      >
                        <LuCheck size={12} color="white" />
                      </Box>
                    )}
                  </VStack>
                </Box>
              )
            })}
          </Grid>
        </Box>
      ))}

      {/* Contact Info Section */}
      <Box mt={6} w="100%">
        <Text fontSize="sm" fontWeight="semibold" color="fg.muted" mb={3}>
          Contact Information
        </Text>
        <VStack gap={3} w="100%">
          <Field label="Email (optional)">
            <HStack w="100%">
              <Box color="fg.muted">
                <LuMail size={20} />
              </Box>
              <Input
                type="email"
                value={contactDetails?.email || ''}
                onChange={(e) => handleContactChange('email', e.target.value)}
                placeholder="your.email@example.com"
              />
            </HStack>
          </Field>

          <Field label="Phone (optional)">
            <HStack  w="100%">
              <Box color="fg.muted">
                <LuPhone size={20} />
              </Box>
              <Input
                type="tel"
                value={contactDetails?.phone || ''}
                onChange={(e) => handleContactChange('phone', e.target.value)}
                placeholder="+1234567890"
              />
            </HStack>
          </Field>

          <Field label="Website (optional)">
            <HStack w="100%">
              <Box color="fg.muted">
                <LuGlobe size={20} />
              </Box>
              <Input
                type="url"
                value={contactDetails?.website || ''}
                onChange={(e) => handleContactChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </HStack>
          </Field>
        </VStack>
      </Box>

      {/* Link Input Dialog */}
      <DialogRoot
        open={!!selectedPlatform}
        onOpenChange={(e) => !e.open && setSelectedPlatform(null)}
      >
        <DialogContent>
          <DialogHeader>
            <Flex align="center" gap={3}>
              {selectedPlatform && (
                <>
                  <Box
                    p={2}
                    bg="bg.subtle"
                    borderRadius="md"
                    color={selectedPlatform.color}
                  >
                    {<selectedPlatform.icon size={24} />}
                  </Box>
                  <Box>
                    <Heading size="md">{selectedPlatform.name}</Heading>
                    <Text fontSize="sm" color="fg.muted">
                      {socialLinks[selectedPlatform.id] ? 'Edit' : 'Add'} your profile link
                    </Text>
                  </Box>
                </>
              )}
            </Flex>
          </DialogHeader>

          <DialogBody>
            <Field label="Profile URL" required>
              <Input
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
                placeholder={selectedPlatform?.placeholder}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveLink()
                  }
                }}
              />
              {selectedPlatform?.prefix && (
                <Text fontSize="xs" color="fg.muted" mt={1}>
                  💡 Tip: Paste the full URL
                </Text>
              )}
            </Field>
          </DialogBody>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedPlatform(null)}
            >
              Cancel
            </Button>
            <Button
              colorPalette="green"
              onClick={handleSaveLink}
              disabled={!linkValue.trim()}
            >
              <LuCheck />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </VStack>
  )
}