import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Button,
  Tabs,
  VStack,
  HStack,
  Grid,
  Flex,
  Image,
  IconButton,
  Box,
  Text,
  Stack,
  Separator,
} from "@chakra-ui/react";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  Field,
  StyledInput,
  StyledTextarea,
  Switch,
} from "@/components/ui";
import { useMentorSessions } from "@/hooks/mentor/useMentorSessions";
import { useAuth } from "@/hooks/auth/useAuth";
import type { MentorSessionPublic, PreparationMaterial } from "@/client";
import { SessionApproach, type LocationType } from "@/client";
import { useSupabaseStorage } from "@/hooks/supabase/useSupabaseStorage";
import { LuTrash2, LuUpload, LuPlus, LuX, LuFileText } from "react-icons/lu";
import { formatDuration } from "@/utils/calendarDataTransformer";

interface SessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  session?: MentorSessionPublic | null;
}

const SESSION_TYPES = Object.values(SessionApproach);
const MATERIAL_TYPES = ["pdf", "video", "article", "link", "other"];

interface SessionFormData {
  title: string;
  description: string;
  cover_image: string;
  session_type: string;
  price_usd: string;
  max_bookings: string;
  location_type: LocationType;
  meeting_link: string;
  physical_address: string;
  timezone: string;
  start_time: string;
  end_time: string;
  tags: string[];
  is_public: boolean;
  preparation_materials: PreparationMaterial[];
}

const SessionFormModal = ({ isOpen, onClose, session }: SessionFormModalProps) => {
  const { user } = useAuth();
  const { saveSession, isSubmitting } = useMentorSessions();
  const { uploadFile, isUploading } = useSupabaseStorage();

  console.log("SESSION_TYPES", SESSION_TYPES[0])

  const defaultMaxBookings = user?.profile?.mentor_profile?.settings?.max_mentees?.toString() ?? "5";

  // React Hook Form setup
  const { register, handleSubmit, reset, watch, setValue, control, formState: { errors } } = useForm<SessionFormData>({
    defaultValues: {
      title: "",
      description: "",
      cover_image: "",
      session_type: SESSION_TYPES[0],
      price_usd: "",
      max_bookings: defaultMaxBookings,
      location_type: "online",
      meeting_link: "",
      physical_address: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      start_time: "",
      end_time: "",
      tags: [],
      is_public: true,
      preparation_materials: [],
    }
  });

  // Watch form values for reactive updates
  const tags = watch("tags");
  const preparationMaterials = watch("preparation_materials");
  const startTime = watch("start_time");
  const endTime = watch("end_time");
  // const locationType = watch("location_type");
  // const sessionType = watch("session_type");
  // const isPublic = watch("is_public");
  // const coverImage = watch("cover_image");
  watch("location_type");
  watch("session_type");
  watch("is_public");
  watch("cover_image");

  // Local state for UI-only concerns
  const [newMaterial, setNewMaterial] = useState<PreparationMaterial>({
    title: "",
    description: "",
    url: "",
    type: "link",
  });
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");

  // Calculate duration automatically
  const calculatedDuration = startTime && endTime
    ? Math.round(
      (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60)
    )
    : 0;

  // Initialize form when modal opens or session changes
  useEffect(() => {
    if (!isOpen) return;

    if (session) {
      // Load existing session data
      const startDate = new Date(session.start_time);
      const endDate = new Date(session.end_time);
      console.log("session_type", session.session_type)

      reset({
        title: session.title || "",
        description: session.description || "",
        cover_image: session.cover_image || "",
        session_type: SessionApproach[session.session_type as keyof typeof SessionApproach] || SESSION_TYPES[0],
        price_usd: session.price_usd?.toString() || "",
        max_bookings: session.max_bookings?.toString() ?? defaultMaxBookings,
        location_type: session.location_type || "online",
        meeting_link: session.meeting_link || "",
        physical_address: session.physical_address || "",
        timezone: session.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        start_time: startDate.toISOString().slice(0, 16),
        end_time: endDate.toISOString().slice(0, 16),
        tags: session.tags || [],
        is_public: session.is_public ?? true,
        preparation_materials: session.preparation_materials || [],
      });
      setCoverImagePreview(session.cover_image || "");
    } else {
      // Reset for new session
      reset({
        title: "",
        description: "",
        cover_image: "",
        session_type: SESSION_TYPES[0],
        price_usd: "",
        max_bookings: defaultMaxBookings,
        location_type: "online",
        meeting_link: "",
        physical_address: "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        start_time: "",
        end_time: "",
        tags: [],
        is_public: true,
        preparation_materials: [],
      });
      setCoverImagePreview("");
      setCoverImageFile(null);
    }
  }, [isOpen, session, reset, defaultMaxBookings]);

  // Handle cover image upload
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeBanner = () => {
    setCoverImageFile(null);
    setCoverImagePreview("");
    setValue("cover_image", "");
  };

  // Tag management
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue("tags", [...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue("tags", tags.filter((tag) => tag !== tagToRemove));
  };

  // Preparation material management
  const addPreparationMaterial = () => {
    if (newMaterial.title.trim() && newMaterial.url.trim()) {
      setValue("preparation_materials", [...preparationMaterials, { ...newMaterial }]);
      setNewMaterial({ title: "", description: "", url: "", type: "link" });
      setShowMaterialForm(false);
    }
  };

  const removeMaterial = (index: number) => {
    setValue("preparation_materials", preparationMaterials.filter((_, i) => i !== index));
  };

  // Form submission
  const onSubmit = async (data: SessionFormData) => {
    let cover_image = data.cover_image;

    // Upload cover image if new file is selected
    if (coverImageFile && user?.uuid) {
      try {
        const result = await new Promise<{ url: string }>((resolve, reject) => {
          uploadFile(
            {
              bucket: "mentor_sessions",
              file: coverImageFile,
              options: {
                userUuid: user.uuid,
                sessionUuid: session?.uuid || crypto.randomUUID(),
              },
            },
            {
              onSuccess: (uploadData) => resolve(uploadData as { url: string }),
              onError: reject,
            }
          );
        });
        cover_image = result.url;
      } catch (error) {
        console.error("Cover image upload failed:", error);
        return;
      }
    }

    const payload = {
      ...(session && { id: session.id }),
      mentor_id: user?.id || 0,
      title: data.title,
      description: data.description || undefined,
      cover_image: cover_image || undefined,
      session_type: data.session_type,
      duration_minutes: calculatedDuration,
      price_usd: data.price_usd ? parseFloat(data.price_usd) : undefined,
      max_bookings: data.max_bookings ? parseInt(data.max_bookings) : undefined,
      location_type: data.location_type,
      meeting_link: data.meeting_link || undefined,
      timezone: data.timezone,
      start_time: new Date(data.start_time).toISOString(),
      end_time: new Date(data.end_time).toISOString(),
      is_public: data.is_public,
      is_cancelled: false,
      is_active: true,
      tags: data.tags.length > 0 ? data.tags : undefined,
      preparation_materials: data.preparation_materials.length > 0 ? data.preparation_materials : undefined,
    };

    await saveSession(payload, {
      onSuccess: onClose,
    });
  };

  const isValid = watch("title").trim().length > 0 && startTime && endTime && calculatedDuration > 0;

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} size={{ base: "full", md: "xl" }}>
      <DialogContent
        border="1px solid"
        borderColor="border.emphasized"
        maxH={{ base: "100vh", md: "95vh" }}
        display="flex"
        flexDirection="column"
      >
        <DialogHeader pb={3}>
          <DialogTitle fontSize={{ base: "lg", md: "xl" }}>
            {session ? "Edit Session" : "Create New Session"}
          </DialogTitle>
        </DialogHeader>

        <Box flex="1" overflowY="auto" px={{ base: 4, md: 6 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogBody px={0}>
              <VStack gap={6} align="stretch">
                {/* Cover Image Upload */}
                <Field label="Session Cover Image (Optional)">
                  {coverImagePreview ? (
                    <Box position="relative" w="full">
                      <Image
                        src={coverImagePreview}
                        alt="Cover image preview"
                        w="full"
                        h={{ base: "150px", md: "200px" }}
                        objectFit="cover"
                        borderRadius="lg"
                      />
                      <IconButton
                        aria-label="Remove cover image"
                        position="absolute"
                        top={2}
                        right={2}
                        size="sm"
                        colorPalette="red"
                        onClick={removeBanner}
                      >
                        <LuTrash2 />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box
                      as="label"
                      p={{ base: 6, md: 8 }}
                      border="2px dashed"
                      borderColor="border.emphasized"
                      borderRadius="lg"
                      textAlign="center"
                      cursor="pointer"
                      _hover={{ borderColor: "colorPalette.emphasized", bg: "bg.subtle" }}
                      transition="all 0.2s"
                      w="full"
                    >
                      <input type="file" accept="image/*" hidden onChange={handleBannerChange} />
                      <VStack gap={2}>
                        <LuUpload size={24} />
                        <Text fontSize="sm" fontWeight="medium">
                          Click to upload cover image
                        </Text>
                        <Text fontSize="xs" color="fg.muted">
                          PNG, JPG up to 5MB
                        </Text>
                      </VStack>
                    </Box>
                  )}
                </Field>

                <Separator />

                {/* Title */}
                <Field label="Session Title" required invalid={!!errors.title}>
                  <StyledInput
                    {...register("title", { required: "Title is required" })}
                    placeholder="e.g., System Design Mock Interview"
                  />
                </Field>

                {/* Description */}
                <Field label="Description" helperText="Explain what participants will learn">
                  <StyledTextarea
                    {...register("description")}
                    placeholder="Describe what mentees will learn and what to expect..."
                    rows={4}
                    fontSize={{ base: "sm", md: "md" }}
                  />
                </Field>

                {/* Session Type */}
                <Field label="Session Type">
                  <Controller
                    name="session_type"
                    control={control}
                    render={({ field }) => (
                      <Flex flexWrap="wrap" gap={2}>
                        {SESSION_TYPES.map((type) => (
                          <Button
                            key={type}
                            size={{ base: "sm", md: "md" }}
                            variant={field.value === type ? "solid" : "outline"}
                            type="button"
                            onClick={() => {
                              field.onChange(type);
                            }}
                          >
                            {type}
                          </Button>
                        ))}
                      </Flex>
                    )}
                  />
                </Field>


                {/* Tags */}
                <Field label="Tags (Optional)" helperText="Add relevant topics or skills">
                  <VStack align="stretch" gap={3} w="80%">
                    <HStack>
                      <StyledInput
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="e.g., React, Career, Leadership"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <Button size={{ base: "sm", md: "md" }} onClick={addTag} variant="outline" type="button">
                        <LuPlus /> Add
                      </Button>
                    </HStack>
                    {tags.length > 0 && (
                      <HStack gap={2} flexWrap="wrap">
                        {tags.map((tag) => (
                          <HStack
                            key={tag}
                            bg="blue.muted"
                            pl={3}
                            pr={1}
                            py={1}
                            rounded="full"
                            fontSize="sm"
                            border="1px solid"
                            borderColor="border.emphasized"
                            gap={2}
                          >
                            <Text>{tag}</Text>
                            <IconButton
                              aria-label={`Remove ${tag}`}
                              size="2xs"
                              variant="ghost"
                              onClick={() => removeTag(tag)}
                              type="button"
                            >
                              <LuX size={14} />
                            </IconButton>
                          </HStack>
                        ))}
                      </HStack>
                    )}
                  </VStack>
                </Field>

                <Separator />

                {/* Price & Max Bookings */}
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                  <Field label="Price (USD)" helperText="Leave empty or 0 for free">
                    <StyledInput
                      type="number"
                      {...register("price_usd")}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </Field>

                  <Field label="Maximum Participants" required>
                    <StyledInput
                      type="number"
                      {...register("max_bookings", { required: true })}
                      min="1"
                    />
                  </Field>
                </Grid>

                {/* Date & Time with Auto Duration */}
                <Box>
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                    <Field label="Start Time" required>
                      <StyledInput
                        type="datetime-local"
                        {...register("start_time", { required: true })}
                      />
                    </Field>

                    <Field label="End Time" required>
                      <StyledInput
                        type="datetime-local"
                        {...register("end_time", { required: true })}
                      />
                    </Field>
                  </Grid>

                  {/* Duration Display */}
                  {calculatedDuration > 0 && (
                    <Box mt={3} p={3} bg="bg.subtle" rounded="md" border="1px solid">
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="fg.muted">
                          Session Duration:
                        </Text>
                        <Text fontSize="md" fontWeight="semibold" color="colorPalette.fg">
                          {formatDuration(calculatedDuration)}
                        </Text>
                      </HStack>
                    </Box>
                  )}
                </Box>

                <Separator />

                {/* Location Type */}
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={3}>
                    Session Location
                  </Text>
                  <Controller
                    name="location_type"
                    control={control}
                    render={({ field }) => (
                      <Tabs.Root
                        value={field.value}
                        onValueChange={(details) => field.onChange(details.value as LocationType)}
                        variant="outline"
                      >
                        <Tabs.List mb={4}>
                          <Tabs.Trigger value="online">Online</Tabs.Trigger>
                          <Tabs.Trigger value="physical">In-Person</Tabs.Trigger>
                          <Tabs.Indicator />
                        </Tabs.List>

                        <Tabs.Content value="online">
                          <Field label="Meeting Link" helperText="Zoom, Google Meet, or other platform">
                            <StyledInput
                              {...register("meeting_link")}
                              placeholder="https://meet.google.com/..."
                            />
                          </Field>
                        </Tabs.Content>

                        <Tabs.Content value="physical">
                          <Field label="Physical Location" helperText="Full address or landmark">
                            <StyledInput
                              {...register("physical_address")}
                              placeholder="e.g., Sarit Centre, Westlands, Nairobi"
                            />
                          </Field>
                        </Tabs.Content>
                      </Tabs.Root>
                    )}
                  />
                </Box>

                <Field label="Visibility">
                  <Controller
                    name="is_public"
                    control={control}
                    render={({ field }) => (
                      <HStack gap={4}>
                        <Switch
                          colorPalette="green"
                          checked={field.value}
                          onCheckedChange={(e) => field.onChange(e.checked)}
                        />
                        <Box>
                          <Text fontSize="sm" fontWeight="medium">
                            {field.value ? "Public Session" : "Private Session"}
                          </Text>
                          <Text fontSize="xs" color="fg.muted">
                            {field.value
                              ? "Visible to all users on the platform"
                              : "Only visible to you and invited participants"}
                          </Text>
                        </Box>
                      </HStack>
                    )}
                  />
                </Field>

                <Separator />

                {/* Preparation Materials */}
                <Box>
                  <HStack justify="space-between" mb={3}>
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold">
                        Preparation Materials (Optional)
                      </Text>
                      <Text fontSize="xs" color="fg.muted">
                        Resources for participants to review before the session
                      </Text>
                    </Box>
                    {!showMaterialForm && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowMaterialForm(true)}
                        type="button"
                      >
                        <LuPlus /> Add Material
                      </Button>
                    )}
                  </HStack>

                  {/* Existing Materials */}
                  {preparationMaterials.length > 0 && (
                    <VStack align="stretch" gap={2} mb={3}>
                      {preparationMaterials.map((material, index) => (
                        <Box
                          key={index}
                          p={3}
                          bg="bg.muted"
                          rounded="md"
                          borderWidth="1px"
                          borderColor="border.muted"
                        >
                          <HStack justify="space-between" align="start">
                            <HStack align="start" gap={2} flex="1">
                              <Box mt={1}>
                                <LuFileText size={16} />
                              </Box>
                              <Box flex="1">
                                <Text fontSize="sm" fontWeight="medium">
                                  {material.title}
                                </Text>
                                {material.description && (
                                  <Text fontSize="xs" color="fg.muted" mt={1}>
                                    {material.description}
                                  </Text>
                                )}
                                <Text fontSize="xs" color="colorPalette.fg" mt={1} truncate>
                                  {material.url}
                                </Text>
                              </Box>
                            </HStack>
                            <IconButton
                              aria-label="Remove material"
                              size="sm"
                              variant="ghost"
                              colorPalette="red"
                              onClick={() => removeMaterial(index)}
                              type="button"
                            >
                              <LuTrash2 size={16} />
                            </IconButton>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  )}

                  {/* Add Material Form */}
                  {showMaterialForm && (
                    <Box
                      p={4}
                      border="1px solid"
                      borderColor="border.emphasized"
                      borderRadius="md"
                      bg={{ base: "gray.50", _dark: "gray.900" }}
                    >
                      <VStack align="stretch" gap={3}>
                        <Field label="Material Title" required>
                          <StyledInput
                            value={newMaterial.title}
                            onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                            placeholder="e.g., Pre-reading: System Design Basics"
                          />
                        </Field>

                        <Field label="Description (Optional)">
                          <StyledTextarea
                            value={newMaterial.description}
                            onChange={(e) =>
                              setNewMaterial({ ...newMaterial, description: e.target.value })
                            }
                            placeholder="Brief description of this material"
                            rows={2}
                            fontSize="sm"
                          />
                        </Field>

                        <Field label="URL" required>
                          <StyledInput
                            value={newMaterial.url}
                            onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                            placeholder="https://..."
                          />
                        </Field>

                        <Field label="Type">
                          <Flex gap={2} flexWrap="wrap">
                            {MATERIAL_TYPES.map((type) => (
                              <Button
                                key={type}
                                borderRadius="lg"
                                variant={newMaterial.type === type ? "solid" : "outline"}
                                onClick={() => setNewMaterial({ ...newMaterial, type })}
                                type="button"
                              >
                                {type}
                              </Button>
                            ))}
                          </Flex>
                        </Field>

                        <HStack justify="end" gap={2}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setShowMaterialForm(false);
                              setNewMaterial({ title: "", description: "", url: "", type: "link" });
                            }}
                            type="button"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            colorPalette="blue"
                            onClick={addPreparationMaterial}
                            disabled={!newMaterial.title.trim() || !newMaterial.url.trim()}
                            type="button"
                          >
                            Add Material
                          </Button>
                        </HStack>
                      </VStack>
                    </Box>
                  )}
                </Box>
              </VStack>
            </DialogBody>

            <DialogFooter pt={4} borderTopWidth="1px" borderColor="border.muted">
              <Stack direction={{ base: "column", sm: "row" }} justify="space-between" w="full" gap={3}>
                <Button
                  variant="outline"
                  onClick={onClose}
                  w={{ base: "full", sm: "auto" }}
                  order={{ base: 2, sm: 1 }}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  colorPalette="green"
                  type="submit"
                  loading={isSubmitting || isUploading}
                  disabled={!isValid}
                  w={{ base: "full", sm: "auto" }}
                  order={{ base: 1, sm: 2 }}
                >
                  {session ? "Update Session" : "Create Session"}
                </Button>
              </Stack>
            </DialogFooter>
          </form>
        </Box>
      </DialogContent>
    </DialogRoot>
  );
};

export default SessionFormModal;