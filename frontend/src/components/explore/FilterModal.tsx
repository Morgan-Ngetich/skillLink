// import {
//   DialogRoot,
//   DialogContent,
//   DialogHeader,
//   DialogBody,
//   DialogFooter,
//   DialogCloseTrigger,
// } from "@/components/ui/dialog";
// import {
//   Stack,
//   Box,
//   Heading,
//   Button,
//   Flex,
//   Select,
//   createListCollection,
//   type CollectionItem,
// } from "@chakra-ui/react";

// import { CheckboxCard } from "@/components/ui/checkbox-card";

// const FilterModal = ({ isOpen, onClose }) => {

// const priceOptions: CollectionItem[] = [
//   { id: "free", value: "Free only" },
//   { id: "under_50", value: "Under $50/hr" },
//   { id: "50_100", value: "$50-$100/hr" },
//   { id: "over_100", value: "Over $100/hr" },
// ];

// const collection = createListCollection({ items: priceOptions }); 

//   return (
//     <DialogRoot open={isOpen} onOpenChange={(open) => !open && onClose()}>
//       <DialogContent backdrop>
//         <DialogHeader>
//           <Heading size="md">Filters</Heading>
//           <DialogCloseTrigger />
//         </DialogHeader>

//         <DialogBody>
//           <Stack gap={6}>
//             {/* Price Range Filter */}
//             <Box>
//               <Heading size="sm" mb={3}>
//                 Price Range
//               </Heading>
//               <Select.Root collection={collection}>
//                 <Select.HiddenSelect />
//                 <Select.Label>Select Price</Select.Label>
//                 <Select.Control>
//                   <Select.Trigger>
//                     <Select.ValueText placeholder="Filter by price" />
//                     <Select.Indicator />
//                   </Select.Trigger>
//                 </Select.Control>
//                 <Select.Positioner>
//                   <Select.Content>
//                     {priceOptions.map((item) => (
//                       <Select.Item key={item.id} id={item.id} item={item}>
//                         <Select.ItemText>{item.value}</Select.ItemText>
//                       </Select.Item>
//                     ))}
//                   </Select.Content>
//                 </Select.Positioner>
//               </Select.Root>


//             </Box>

//             {/* Availability */}
//             <Box>
//               <Heading size="sm" mb={3}>
//                 Availability
//               </Heading>
//               <CheckboxCard defaultChecked>Available Now</CheckboxCard>
//             </Box>

//             {/* Skills */}
//             <Box>
//               <Heading size="sm" mb={3}>
//                 Skills
//               </Heading>
//               <Flex wrap="wrap" gap={2}>
//                 {[
//                   "Product Strategy",
//                   "System Design",
//                   "UX/UI",
//                   "Agile",
//                   "Interview Prep",
//                 ].map((skill) => (
//                   <Button key={skill} size="sm" variant="outline">
//                     {skill}
//                   </Button>
//                 ))}
//               </Flex>
//             </Box>
//           </Stack>
//         </DialogBody>

//         <DialogFooter justify="flex-end" gap={2}>
//           <Button variant="ghost" onClick={onClose}>
//             Clear All
//           </Button>
//           <Button colorScheme="blue">Apply Filters</Button>
//         </DialogFooter>
//       </DialogContent>
//     </DialogRoot>
//   );
// };

// export default FilterModal;
