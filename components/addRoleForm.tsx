// "use client"

// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { SheetClose, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"

// export function AddRoleForm() {
//   return (
//     <>
//       <SheetHeader>
//         <SheetTitle>Add</SheetTitle>
//       </SheetHeader>
//       <div className="overflow-y-auto pr-1 pb-4 mt-1">
//       <div className="grid gap-4 pt-2">
//         <div className="grid grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <Label htmlFor="name">Name</Label>
//             <Input id="name" placeholder="Level 03" />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="role">Role</Label>
//             <Input id="role" placeholder="Manager" />
//           </div>
//         </div>

//         <div className="space-y-2">
//           <Input id="search" placeholder="Search" className="mb-4" />

//           <div className="grid grid-cols-2 gap-6">
//             <div className="space-y-4">
//               <div>
//                 <h3 className="font-medium mb-2">Dashboard</h3>
//                 <div className="space-y-1 text-sm">
//                   <div>View Dashboard Overview</div>
//                   <div>Access Sales Analytics</div>
//                   <div>View Notifications</div>
//                 </div>
//               </div>

//               <div>
//                 <h3 className="font-medium mb-2">Court Management</h3>
//                 <div className="space-y-1 text-sm">
//                   <div>View Courts</div>
//                   <div>Add Courts</div>
//                   <div>Edit Court Details</div>
//                   <div>Delete Courts</div>
//                   <div>Manage Booking Schedules</div>
//                   <div>Set Court Availability</div>
//                 </div>
//               </div>

//               <div>
//                 <h3 className="font-medium mb-2">Loyalty & Membership</h3>
//                 <div className="space-y-1 text-sm">
//                   <div>View Membership Plans</div>
//                   <div>Add New Membership Plans</div>
//                   <div>Edit Membership Plans</div>
//                   <div>Delete Membership Plans</div>
//                   <div>Configure Loyalty Benefits</div>
//                 </div>
//               </div>

//               <div>
//                 <h3 className="font-medium mb-2">Reports</h3>
//                 <div className="space-y-1 text-sm">
//                   <div>View Reports</div>
//                   <div>Generate Sales Reports</div>
//                   <div>Generate Booking Reports</div>
//                   <div>Export Reports</div>
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <div>
//                 <h3 className="font-medium mb-2">User Management</h3>
//                 <div className="space-y-1 text-sm">
//                   <div>View Staff List</div>
//                   <div>Add Staff</div>
//                   <div>Edit Staff Details</div>
//                   <div>Delete Staff</div>
//                   <div>Assign Access Levels</div>
//                 </div>
//               </div>

//               <div>
//                 <h3 className="font-medium mb-2">Product & Inventory Management</h3>
//                 <div className="space-y-1 text-sm">
//                   <div>View Products</div>
//                   <div>Add Products</div>
//                   <div>Edit Product Details</div>
//                   <div>Delete Products</div>
//                   <div>Manage Inventory</div>
//                   <div>Manage Booking Schedules</div>
//                   <div>Set Court Availability</div>
//                 </div>
//               </div>

//               <div>
//                 <h3 className="font-medium mb-2">Discount Management</h3>
//                 <div className="space-y-1 text-sm">
//                   <div>View Discounts</div>
//                   <div>Add Discounts</div>
//                   <div>Edit Discounts</div>
//                   <div>Delete Discounts</div>
//                 </div>
//               </div>

//               <div>
//                 <h3 className="font-medium mb-2">Settings</h3>
//                 <div className="space-y-1 text-sm">
//                   <div>Access General Settings</div>
//                   <div>Configure Payment Settings</div>
//                   <div>Manage Notification Settings</div>
//                   <div>Update Branding and Logo</div>
//                   <div>Access Integrations</div>
//                   <div>Configure Access Permissions</div>
//                 </div>
//               </div>

//               <div>
//                 <h3 className="font-medium mb-2">Booking Management</h3>
//                 <div className="space-y-1 text-sm">
//                   <div>View All Bookings</div>
//                   <div>Add New Bookings</div>
//                   <div>Edit Booking Details</div>
//                   <div>Cancel Bookings</div>
//                   <div>Approve/Reject Booking Requests</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       <SheetFooter>
//         <SheetClose asChild>
//           <Button variant="outline">Cancel</Button>
//         </SheetClose>
//         <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
//           Save Access Level
//         </Button>
//       </SheetFooter>
//       </div>
//     </>
//   )
// }
