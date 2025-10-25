import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Input,
  Textarea,
  VStack,
  HStack,
  Text,
  IconButton,
  Image,
  Tag,
  Grid,
  Flex,
} from "@chakra-ui/react";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  Field,
} from "@/components/ui";
import { LuPlus, LuUpload, LuTrash2 } from "react-icons/lu";
import { useMentorServices } from "@/hooks/mentor/useMentorServices";
import { useAuth } from "@/hooks/auth/useAuth";
import type { MentorServicePublic } from "@/client";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";
import { BiX } from "react-icons/bi";

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: MentorServicePublic | null;
}

const CATEGORIES = [
  "Career Guidance",
  "Technical Skills",
  "Interview Prep",
  "Resume Review",
  "Portfolio Review",
  "Code Review",
  "Leadership",
  "Other",
];

const ServiceFormModal = ({ isOpen, onClose, service }: ServiceFormModalProps) => {
  const { user } = useAuth();
  const { saveService, isSubmitting } = useMentorServices();
  const { uploadFile, isUploading } = useSupabaseStorage();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    banner_url: "",
    price_usd: "",
    estimated_duration_minutes: "",
    category: "",
    highlights: [] as string[],
  });

  const [newHighlight, setNewHighlight] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");

  // Load existing service data
  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title || "",
        description: service.description || "",
        banner_url: service.banner_url || "",
        price_usd: service.price_usd?.toString() || "",
        estimated_duration_minutes: service.estimated_duration_minutes?.toString() || "",
        category: service.category || "",
        highlights: service.highlights || [],
      });
      setBannerPreview(service.banner_url || "");
    } else {
      // Reset for new service
      setFormData({
        title: "",
        description: "",
        banner_url: "",
        price_usd: "",
        estimated_duration_minutes: "",
        category: "",
        highlights: [],
      });
      setBannerPreview("");
      setBannerFile(null);
    }
  }, [service, isOpen]);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview("");
    setFormData((prev) => ({ ...prev, banner_url: "" }));
  };

  const addHighlight = () => {
    if (newHighlight.trim() && formData.highlights.length < 5) {
      setFormData((prev) => ({
        ...prev,
        highlights: [...prev.highlights, newHighlight.trim()],
      }));
      setNewHighlight("");
    }
  };

  const removeHighlight = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    let banner_url = formData.banner_url;

    // Upload banner if new file selected
    if (bannerFile && user?.uuid) {
      try {
        const result = await new Promise<{ url: string }>((resolve, reject) => {
          uploadFile(
            {
              bucket: "mentor-services",
              file: bannerFile,
              options: {
                userUuid: user.uuid,
                serviceUuid: service?.uuid || crypto.randomUUID(),
              },
            },
            {
              onSuccess: (data) => resolve(data as { url: string }),
              onError: reject,
            }
          );
        });
        banner_url = result.url;
      } catch (error) {
        console.error("Banner upload failed:", error);
        return;
      }
    }

    const payload = {
      ...(service && { id: service.id }),
      mentor_id: user?.id || 0,
      title: formData.title,
      description: formData.description || undefined,
      banner_url: banner_url || undefined,
      price_usd: formData.price_usd ? parseFloat(formData.price_usd) : undefined,
      estimated_duration_minutes: formData.estimated_duration_minutes
        ? parseInt(formData.estimated_duration_minutes)
        : undefined,
      category: formData.category || undefined,
      highlights: formData.highlights.length > 0 ? formData.highlights : undefined,
    };

    await saveService(payload, {
      onSuccess: onClose,
    });
  };

  const isValid = formData.title.trim().length > 0;

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="lg">
      <DialogContent border="1px solid" borderColor={"border.emphasized"}>
        <DialogHeader>
          <DialogTitle>
            {service ? "Edit Service" : "Create New Service"}
          </DialogTitle>
        </DialogHeader>

        <DialogBody maxH="70vh" overflowY="auto">
          <VStack gap={6} align="stretch">
            {/* Banner Upload */}
            <Field label="Service Banner (Optional)" >
              {bannerPreview ? (
                <Box position="relative"  mx="auto">
                  <Image
                    src={bannerPreview}
                    alt="Banner preview"
                    w="full"
                    h="200px"
                    objectFit="cover"
                    borderRadius="lg"
                  />
                  <IconButton
                    aria-label="Remove banner"
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
                  p={8}
                  border="2px dashed"
                  borderColor="border.emphasized"
                  borderRadius="lg"
                  textAlign="center"
                  cursor="pointer"
                  _hover={{ borderColor: "border.muted" }}
                  w="full"
                >
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleBannerChange}
                  />
                  <LuUpload size={24} style={{ margin: "0 auto 8px" }} />
                  <Text fontSize="sm">Click to upload banner image</Text>
                </Box>
              )}
            </Field>

            {/* Title */}
            <Field label="Service Title" required>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., 1-on-1 Career Coaching"
              />
            </Field>

            {/* Description */}
            <Field label="Description">
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what you'll provide..."
                rows={4}
              />
            </Field>

            {/* Category */}
            <Field label="Category">
              <Flex flexWrap="wrap" gap={2}>
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat}
                    size="sm"
                    variant={formData.category === cat ? "solid" : "outline"}
                    onClick={() => setFormData({ ...formData, category: cat })}
                  >
                    {cat}
                  </Button>
                ))}
              </Flex>

            </Field>

            {/* Price and Duration */}
            <Grid templateColumns="repeat(2, 1fr)" gap={3}>
              <Field label="Price (USD)">
                <Input
                  type="number"
                  value={formData.price_usd}
                  onChange={(e) => setFormData({ ...formData, price_usd: e.target.value })}
                  placeholder="0 for free"
                  min="0"
                  step="0.01"
                />
              </Field>

              <Field label="Duration (minutes)">
                <Input
                  type="number"
                  value={formData.estimated_duration_minutes}
                  onChange={(e) =>
                    setFormData({ ...formData, estimated_duration_minutes: e.target.value })
                  }
                  placeholder="e.g., 60"
                  min="15"
                  step="15"
                />
              </Field>
            </Grid>

            {/* Highlights */}
            <Field label="Highlights" helperText="Add up to 5 key points">
              <VStack align="stretch" gap={2} w="full">
                <HStack w="full">
                  <Input
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    placeholder="e.g., Personalized feedback"
                    onKeyDown={(e) => e.key === "Enter" && addHighlight()}
                    disabled={formData.highlights.length >= 5}
                  />
                  <IconButton
                    aria-label="Add highlight"
                    onClick={addHighlight}
                    disabled={!newHighlight.trim() || formData.highlights.length >= 5}
                  >
                    <LuPlus />
                  </IconButton>
                </HStack>

                {formData.highlights.length > 0 && (
                  <HStack wrap="wrap" gap={2}>
                    {formData.highlights.map((highlight, i) => (
                      <Tag.Root key={i} colorPalette="blue" size="lg">
                        <Tag.Label>{highlight}</Tag.Label>
                        <Tag.CloseTrigger onClick={() => removeHighlight(i)} >
                          < BiX/>
                        </Tag.CloseTrigger>
                      </Tag.Root>
                    ))}
                  </HStack>
                )}
              </VStack>
            </Field>
          </VStack>
        </DialogBody>

        <DialogFooter>
          <HStack justify="space-between" w="full">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorPalette="green"
              onClick={handleSubmit}
              loading={isSubmitting || isUploading}
              disabled={!isValid}
            >
              {service ? "Update Service" : "Create Service"}
            </Button>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default ServiceFormModal;