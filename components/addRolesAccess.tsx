"use client"
import { FilePlus, SquarePen, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Table } from "rsuite"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { createClient } from "@/utils/supabase/client"
// import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useGlobalContext } from "@/context/store"
import { Input } from "@/components/ui/input"
import toast, { Toaster } from "react-hot-toast"
import RoleSelector from "./role-selector"

const notify = (message: string, success: boolean) =>
  toast[success ? "success" : "error"](message, {
    style: {
      borderRadius: "10px",
      background: "#fff",
      color: "#000",
    },
    position: "top-right",
    duration: 3000,
  })

type DataItem = {
  name: string
  role: string
  permissions: any[]
  id: number
}
type Option = { name: string; permissions: any[] }

const AccessLevel = () => {
  const allPermission = [
    {
      dashboard: [
        {
          name: "View Dashboard Overview",
          value: "View Dashboard Overview",
          status: false,
        },
        {
          name: "Access Sales Analytics",
          value: "Access Sales Analytics",
          status: false,
        },
        {
          name: "View Notifications",
          value: "View Notifications",
          status: false,
        },
      ],
      userManagement: [
        { name: "View Staff List", value: "View Staff List", status: false },
        { name: "Add Staff", value: "Add Staff", status: false },
        {
          name: "Edit Staff Details",
          value: "Edit Staff Details",
          status: false,
        },
        { name: "Delete Staff", value: "Delete Staff", status: false },
        {
          name: "Assign Access Levels",
          value: "Assign Access Levels",
          status: false,
        },
      ],
      courtManagement: [
        { name: "View Courts", value: "View Courts", status: false },
        { name: "Add Courts", value: "Add Courts", status: false },
        {
          name: "Edit Court Details",
          value: "Edit Court Details",
          status: false,
        },
        { name: "Delete Courts", value: "Delete Courts", status: false },
        {
          name: "Manage Booking Schedules",
          value: "Manage Booking Schedules",
          status: false,
        },
        {
          name: "Set Court Availability",
          value: "Set Court Availability",
          status: false,
        },
      ],
      productInventoryManagement: [
        { name: "View Products", value: "View Products", status: false },
        { name: "Add Courts", value: "Add Courts", status: false },
        {
          name: "Edit Court Details",
          value: "Edit Court Details",
          status: false,
        },
        { name: "Delete Courts", value: "Delete Courts", status: false },
        {
          name: "Manage Booking Schedules",
          value: "Manage Booking Schedules",
          status: false,
        },
        {
          name: "Set Court Availability",
          value: "Set Court Availability",
          status: false,
        },
      ],
      loyaltyMembership: [
        {
          name: "View Membership Plans",
          value: "View Membership Plans",
          status: false,
        },
        {
          name: "Add New Membership Plans",
          value: "Add New Membership Plans",
          status: false,
        },
        {
          name: "Edit Membership Plan Details",
          value: "Edit Membership Plan Details",
          status: false,
        },
        {
          name: "Delete Membership Plans",
          value: "Delete Membership Plans",
          status: false,
        },
        {
          name: "Configure Loyalty Rewards",
          value: "Configure Loyalty Rewards",
          status: false,
        },
      ],
      discountManagement: [
        { name: "View Discounts", value: "View Discounts", status: false },
        { name: "Add Discounts", value: "Add Discounts", status: false },
        {
          name: "Edit Discount Details",
          value: "Edit Discount Details",
          status: false,
        },
        { name: "Delete Discounts", value: "Delete Discounts", status: false },
      ],
      reports: [
        { name: "View Reports", value: "View Reports", status: false },
        {
          name: "Generate Sales Reports",
          value: "Generate Sales Reports",
          status: false,
        },
        {
          name: "Generate Booking Reports",
          value: "Generate Booking Reports",
          status: false,
        },
        { name: "Export Reports", value: "Export Reports", status: false },
      ],
      settings: [
        {
          name: "Access General Settings",
          value: "Access General Settings",
          status: false,
        },
        {
          name: "Configure Payment Settings",
          value: "Configure Payment Settings",
          status: false,
        },
        {
          name: "Manage Notification Preferences",
          value: "Manage Notification Preferences",
          status: false,
        },
        {
          name: "Update Branding and Logo",
          value: "Update Branding and Logo",
          status: false,
        },
        {
          name: "Access Integrations",
          value: "Access Integrations",
          status: false,
        },
        {
          name: "Configure Access Permissions",
          value: "Configure Access Permissions",
          status: false,
        },
      ],
      bookingManagement: [
        {
          name: "View All Bookings",
          value: "View All Bookings",
          status: false,
        },
        { name: "Add New Bookings", value: "Add New Bookings", status: false },
        {
          name: "Edit Booking Details",
          value: "Edit Booking Details",
          status: false,
        },
        { name: "Cancel Bookings", value: "Cancel Bookings", status: false },
        {
          name: "Approve/Reject Booking Requests",
          value: "Approve/Reject Booking Requests",
          status: false,
        },
      ],
    },
  ]
  const { user: currentUser } = useGlobalContext()
  const { Column, HeaderCell, Cell } = Table
  const [sortColumn, setSortColumn] = useState()
  const [loading, setLoading] = useState(true)
  //   const { toast } = useToast();
  const [sortType, setSortType] = useState()
  const [openAdd, setOpenAdd] = useState(false)
  const [oldEditData, setOldEditData] = useState<any>()
  const [editData, setEditData] = useState<any>()
  const [openEdit, setOpenEdit] = useState(false)
  const [openLocation, setOpenLocation] = useState(false)
  const [data, setData] = useState<DataItem[]>([])
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const supabase = createClient()
  // const [options, setOptions] = useState<Option[]>([])
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [permissionLists, setPermissionLists] = useState<any[]>(allPermission)
  const [selectAll, setSelectAll] = useState(false)
  const [selectAllChecked, setSelectAllChecked] = useState(false)
  const handleCheckboxChange = (categoryIndex: any, permissionIndex: any, type: any) => {
    const updatedPermissions = [...permissionLists]
    updatedPermissions[categoryIndex][type][permissionIndex].status =
      !updatedPermissions[categoryIndex][type][permissionIndex].status
    setPermissionLists(updatedPermissions)
    // setData(updatedPermissions);
  }

  const handleSelectAll = () => {
    const updatedPermissions = permissionLists.map((category) => {
      const updateCategory = {} as any
      Object.keys(category).forEach((type) => {
        updateCategory[type] = category[type].map((permission: any) => ({
          ...permission,
          status: !selectAll,
        }))
      })
      return updateCategory
    })

    setPermissionLists(updatedPermissions)
    setSelectAll(!selectAll)
  }

  const handleSelectAllUpdate = (e: any) => {
    const isChecked = e.target.checked
    setEditData((prev: any) => {
      const updatedPermissions = { ...prev.permissions[0] }
      Object.keys(updatedPermissions).forEach((type) => {
        updatedPermissions[type] = updatedPermissions[type].map((item: any) => ({
          ...item,
          status: isChecked,
        }))
      })
      setSelectAllChecked(isChecked)
      return { ...prev, permissions: [updatedPermissions] }
    })
  }

  async function fetchData() {
    // const { data: user } = await supabase.auth.getUser();
    const { data: company, error } = await supabase
      .from("companies")
      .select("permissions")
      .eq("store_admin", currentUser?.email)
      .single()
    // setUser(user.user);
    if (company) {
      console.log("company", company)
      setData(company.permissions || [])
    } else {
      // console.log(error),
      // console.log(currentUser)
    }
  }

  useEffect(() => {
    fetchData().then(() => {
      setLoading(false)
    })
  }, [])

  const getData = () => {
    if (sortColumn && sortType) {
      return data.sort((a, b) => {
        const x = a[sortColumn]
        const y = b[sortColumn]
        if (typeof x === "string" && typeof y === "string") {
          return sortType === "asc"
            ? (x as string).localeCompare(y as string)
            : (y as string).localeCompare(x as string)
        }
        if (typeof x === "number" && typeof y === "number") {
          return sortType === "asc" ? x - y : y - x
        }
        return 0
      })
    }
    return data
  }

  const handleSortColumn = (sortColumn: any, sortType: any) => {
    setTimeout(() => {
      setSortColumn(sortColumn)
      setSortType(sortType)
    })
  }

  function AddDepartment() {
    setOldEditData({
      // name: null,
      role: null,
      permissions: permissionLists,
    })
    setEditData({
      // name: null,
      role: null,
      permissions: permissionLists,
    })
    setOpenAdd(true)
  }

  function handleEdit(data: any) {
    setOldEditData(data)
    setEditData(data)
    setOpenEdit(true)
    console.log(data)
  }

  const handleCreate = async (newData: any) => {
    console.log("enterd create", newData)
    const randomId = () => Math.random().toString(36).substring(2, 9)
    newData.id = newData.id || randomId()

    if (newData.role) {
      const updatedData = data.map((item: any) => ({
        ...item,
        id: item.id || randomId(),
      }))

      const finalData = [...updatedData, { ...newData, permissions: permissionLists }]
      setData(finalData)

      await supabase.from("companies").update({ permissions: finalData }).eq("store_admin", currentUser?.email).single()

      setOpenAdd(false)
      setEditData(null)
      setPermissionLists(allPermission)
      setSelectAll(false)
      //   toast({
      //     title: "Created",
      //     description: "Access Level created successfully.",
      //   });
      notify("Access Level created successfully", true)
    }
  }

  const handleCheckboxChange1 = (category: any, categoryIndex: number, type: string) => {
    const updatedPermissions = editData.permissions.map((permission: any) => {
      if (permission[type]) {
        return {
          ...permission,
          [type]: permission[type].map((item: any, index: number) => {
            if (index === categoryIndex) {
              return { ...item, status: !item.status }
            }
            return item
          }),
        }
      }
      return permission
    })

    setEditData((prev: any) => ({ ...prev, permissions: updatedPermissions }))
  }

  const handleUpdate = async () => {
    const filteredData = data.filter((item) => item.id !== editData.id)
    const updatedData = [...filteredData, editData]
    setData(updatedData)

    await supabase.from("companies").update({ permissions: updatedData }).eq("store_admin", currentUser?.email).single()

    setOpenEdit(false)
    setDeleteOpen(false)
    setOpenAdd(false)

    // toast({
    //   title: "Updated",
    //   description: "Permissions updated successfully.",
    // });
    notify("Permissions updated successfully", true)
  }

  const handleDelete = async () => {
    if (!selectedId) return
    const filteredData = data?.filter((item: any) => item.id !== selectedId)

    if (filteredData) {
      await supabase
        .from("companies")
        .update({ permissions: filteredData })
        .eq("store_admin", currentUser?.email)
        .single()
      //   toast({
      //     title: "Deleted",
      //     description: "Access Level deleted successfully.",
      //   });
      notify("Access Level deleted successfully", true)
    }
    setData(filteredData)
    setDeleteOpen(false)
    setSelectedId(null)
  }

  const handleRowClick = (rowData: any) => {
    setEditData(rowData)

    const isAllTrue = Object.values(rowData.permissions[0]).every(
      (items: any) => Array.isArray(items) && items.every((item: any) => item.status === true),
    )
    setSelectAllChecked(isAllTrue)
    console.log(isAllTrue)
  }

  return (
    <>
      <Sheet open={openAdd} onOpenChange={setOpenAdd}>
        <div className="flex justify-end mb-4">
          <Toaster />
          <SheetTrigger>
            <div
              className="bg-teal-800 hover:bg-teal-700 text-white rounded-[12px] w-[130px] h-[40px] flex items-center justify-center text-xs cursor-pointer"
              onClick={() => AddDepartment()}
            >
              <FilePlus size={14} />
              <span className="ml-2">Add Access Level</span>
            </div>
          </SheetTrigger>
        </div>
        <SheetContent
          className="bg-white border-border_color"
          onClick={() => {
            setOpenLocation(false), setIsColorPickerOpen(false)
          }}
          style={{ maxWidth: "800px" }}
        >
          <SheetHeader className="relative h-full">
            <SheetTitle className="text-gray-600 text-sm -mt-1 uppercase">New Access Level</SheetTitle>
            <SheetDescription>
              <div className="flex flex-col gap-2">
                <div className="flex w-full gap-4">
                  {/* <div className="flex flex-col gap-1 py-2 w-1/2">
                    <label className="text-gray-900 text-sm font-medium">
                      Name
                    </label>
                    <div className="relative flex items-center gap-2 w-full">
                      <input
                        type="text"
                        className="border border-border_color w-full rounded-[12px] px-4 h-10 pr-5 text-xs bg-gray-50"
                        value={editData?.name || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                      />
                    </div>
                  </div> */}
                  <div className="flex flex-col gap-1 py-2 w-full">
                    <label className="text-gray-900 text-sm font-medium">Role</label>
                    <div className="relative flex items-center gap-2 w-full">
                      {/* <Select
  value={editData?.role || ""}
  onValueChange={(value) =>
    setEditData({
      ...editData,
      role: value,
    })
  }
>
  <SelectTrigger className="w-full rounded-[12px] h-10 text-xs bg-gray-50 border-border_color">
    <SelectValue placeholder="Select Role" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="Admin">Admin</SelectItem>
    <SelectItem value="Manager">Manager</SelectItem>
    <SelectItem value="Staff">Staff</SelectItem>
    <SelectItem value="Receptionist">Receptionist</SelectItem>
  </SelectContent>
</Select> */}
                      {/* <input
                        type="text"
                        className="border border-border_color w-full rounded-[12px] px-4 h-10 pr-5 text-xs bg-gray-50"
                        value={editData?.role || ""}
                        onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                        placeholder="Select Role"
                      /> */}
                     < RoleSelector
    value={editData?.role || ""}
    onChange={(value) => setEditData({ ...editData, role: value })}
    error={!editData?.role ? "Role is required" : undefined}
    // className="border border-border_color w-full rounded-[12px] px-4 h-10 pr-5 text-xs bg-gray-50"
  />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-3">
                <Input type="checkbox" id="select-all" className="w-4 h-4 cursor-pointer" onChange={handleSelectAll} />
                <label htmlFor="select-all" className="text-sm font-medium text-[#111928] cursor-pointer">
                  Select all
                </label>
              </div>
              <div className="w-full min-h-[75vh] h-[75vh] overflow-y-auto pt-6 pb-20">
                <div className="flex justify-between items-start px-6">
                  <div className="w-1/2">
                    {permissionLists.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="">
                        <p className="font-semibold text-lg text-[#1F2A37] mb-2">Dashboard</p>
                        {category.dashboard.map((permission: any, permissionIndex: any) => (
                          <div key={permission.value} className="flex items-center mb-2 gap-2 pl-6">
                            <input
                              type="checkbox"
                              id={permission.value}
                              checked={permission.status}
                              onChange={() => handleCheckboxChange(categoryIndex, permissionIndex, "dashboard")}
                              className="w-4 h-4 cursor-pointer"
                            />
                            <label
                              htmlFor={permission.value}
                              className="text-sm font-medium text-[#111928] cursor-pointer"
                            >
                              {permission.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="w-1/2">
                    {permissionLists.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="">
                        <p className="font-semibold text-lg text-[#1F2A37] mb-2">User Management</p>
                        {category.userManagement.map((permission: any, permissionIndex: any) => (
                          <div key={permission.value} className="flex items-center mb-2 gap-2 pl-6">
                            <input
                              type="checkbox"
                              id={permission.value}
                              checked={permission.status}
                              onChange={() => handleCheckboxChange(categoryIndex, permissionIndex, "userManagement")}
                              className="w-4 h-4 cursor-pointer"
                            />
                            <label
                              htmlFor={permission.value}
                              className="text-sm font-medium text-[#111928] cursor-pointer"
                            >
                              {permission.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-start px-6 py-6">
                  <div className="w-1/2">
                    {permissionLists.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="">
                        <p className="font-semibold text-lg text-[#1F2A37] mb-2">Court Management</p>
                        {category.courtManagement.map((permission: any, permissionIndex: any) => (
                          <div key={permission.value} className="flex items-center mb-2 gap-2 pl-6">
                            <input
                              type="checkbox"
                              id={permission.value}
                              checked={permission.status}
                              onChange={() => handleCheckboxChange(categoryIndex, permissionIndex, "courtManagement")}
                              className="w-4 h-4 cursor-pointer"
                            />
                            <label
                              htmlFor={permission.value}
                              className="text-sm font-medium text-[#111928] cursor-pointer"
                            >
                              {permission.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="w-1/2">
                    {permissionLists.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="">
                        <p className="font-semibold text-lg text-[#1F2A37] mb-2">Product & Inventory Management</p>
                        {category.productInventoryManagement.map((permission: any, permissionIndex: any) => (
                          <div key={permission.value} className="flex items-center mb-2 gap-2 pl-6">
                            <input
                              type="checkbox"
                              id={permission.value}
                              checked={permission.status}
                              onChange={() =>
                                handleCheckboxChange(categoryIndex, permissionIndex, "productInventoryManagement")
                              }
                              className="w-4 h-4 cursor-pointer"
                            />
                            <label
                              htmlFor={permission.value}
                              className="text-sm font-medium text-[#111928] cursor-pointer"
                            >
                              {permission.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-start px-6 py-6">
                  <div className="w-1/2">
                    {permissionLists.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="">
                        <p className="font-semibold text-lg text-[#1F2A37] mb-2">Loyalty & Membership</p>
                        {category.loyaltyMembership.map((permission: any, permissionIndex: any) => (
                          <div key={permission.value} className="flex items-center mb-2 gap-2 pl-6">
                            <input
                              type="checkbox"
                              id={permission.value}
                              checked={permission.status}
                              onChange={() => handleCheckboxChange(categoryIndex, permissionIndex, "loyaltyMembership")}
                              className="w-4 h-4 cursor-pointer"
                            />
                            <label
                              htmlFor={permission.value}
                              className="text-sm font-medium text-[#111928] cursor-pointer"
                            >
                              {permission.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="w-1/2">
                    {permissionLists.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="">
                        <p className="font-semibold text-lg text-[#1F2A37] mb-2">Discount Management</p>
                        {category.discountManagement.map((permission: any, permissionIndex: any) => (
                          <div key={permission.value} className="flex items-center mb-2 gap-2 pl-6">
                            <input
                              type="checkbox"
                              id={permission.value}
                              checked={permission.status}
                              onChange={() =>
                                handleCheckboxChange(categoryIndex, permissionIndex, "discountManagement")
                              }
                              className="w-4 h-4 cursor-pointer"
                            />
                            <label
                              htmlFor={permission.value}
                              className="text-sm font-medium text-[#111928] cursor-pointer"
                            >
                              {permission.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-start pl-6 pb-6">
                  <div className="w-1/2">
                    {permissionLists.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="">
                        <p className="font-semibold text-lg text-[#1F2A37] mb-2">Reports</p>
                        {category.reports.map((permission: any, permissionIndex: any) => (
                          <div key={permission.value} className="flex items-center mb-2 gap-2 pl-6">
                            <input
                              type="checkbox"
                              id={permission.value}
                              checked={permission.status}
                              onChange={() => handleCheckboxChange(categoryIndex, permissionIndex, "reports")}
                              className="w-4 h-4 cursor-pointer"
                            />
                            <label
                              htmlFor={permission.value}
                              className="text-sm font-medium text-[#111928] cursor-pointer"
                            >
                              {permission.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="w-1/2">
                    {permissionLists.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="">
                        <p className="font-semibold text-lg text-[#1F2A37] mb-2">Settings</p>
                        {category.settings.map((permission: any, permissionIndex: any) => (
                          <div key={permission.value} className="flex items-center mb-2 gap-2 pl-6">
                            <input
                              type="checkbox"
                              id={permission.value}
                              checked={permission.status}
                              onChange={() => handleCheckboxChange(categoryIndex, permissionIndex, "settings")}
                              className="w-4 h-4 cursor-pointer"
                            />
                            <label
                              htmlFor={permission.value}
                              className="text-sm font-medium text-[#111928] cursor-pointer"
                            >
                              {permission.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-start pl-6 pb-6">
                  <div className="w-1/2">
                    {permissionLists.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="">
                        <p className="font-semibold text-lg text-[#1F2A37] mb-2">Booking Management</p>
                        {category.bookingManagement.map((permission: any, permissionIndex: any) => (
                          <div key={permission.value} className="flex items-center mb-2 gap-2 pl-6">
                            <input
                              type="checkbox"
                              id={permission.value}
                              checked={permission.status}
                              onChange={() => handleCheckboxChange(categoryIndex, permissionIndex, "bookingManagement")}
                              className="w-4 h-4 cursor-pointer"
                            />
                            <label
                              htmlFor={permission.value}
                              className="text-sm font-medium text-[#111928] cursor-pointer"
                            >
                              {permission.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* </div> */}
              <div className="flex justify-start gap-2 fixed bottom-0 bg-white w-full p-4 border-border_color z-10">
                <button
                  className="bg-teal-800  hover:bg-teal-700 text-white rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center mt-2"
                  onClick={() => handleCreate(editData)}
                >
                  Save Access Level
                </button>
                <button
                  className="border border-border_color rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center mt-2"
                  //   onClick={() =>
                  //     setOpenAdd(false)}
                  // >
                  onClick={() => {
                    setOpenAdd(false)
                    setPermissionLists(allPermission)
                    setSelectAll(false)
                  }}
                >
                  Cancel
                </button>
              </div>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <div className="w-full border border-border_color rounded-[8px] bg-white text-sm my-2">
        <Table
          data={getData()}
          loading={loading}
          sortColumn={sortColumn}
          sortType={sortType}
          onSortColumn={handleSortColumn}
          onRowClick={(rowData) => {}}
          className="rounded-[8px] "
          autoHeight
        >
          {/* <Column flexGrow={1} sortable>
            <HeaderCell
              className="uppercase select-none"
              style={{ backgroundColor: "#f2f2f2", paddingLeft: "50px" }}
            >
              Name
            </HeaderCell>
            <Cell dataKey="name" className="text-left pl-10 text-black"></Cell>
          </Column> */}
          <Column flexGrow={1} sortable>
            <HeaderCell className="uppercase select-none" style={{ backgroundColor: "#f2f2f2" }}>
              Role
            </HeaderCell>
            <Cell dataKey="role" className="text-left"></Cell>
          </Column>

          <Column flexGrow={1}>
            <HeaderCell className="uppercase select-none" style={{ backgroundColor: "#f2f2f2" }}>
              Permissions
            </HeaderCell>
            <Cell>
              {(rowData) => (
                <div className="flex items-center">
                  <div className="flex items-center">
                    {rowData.permissions.every(
                      (permission: any) =>
                        permission.dashboard.every((item: any) => item.status) &&
                        permission.userManagement.every((item: any) => item.status) &&
                        permission.courtManagement.every((item: any) => item.status) &&
                        permission.productInventoryManagement.every((item: any) => item.status) &&
                        permission.loyaltyMembership.every((item: any) => item.status) &&
                        permission.discountManagement.every((item: any) => item.status) &&
                        permission.reports.every((item: any) => item.status) &&
                        permission.settings.every((item: any) => item.status) &&
                        permission.bookingManagement.every((item: any) => item.status),
                    )
                      ? "Full access"
                      : `${rowData.permissions
                          .reduce(
                            (count: number, permission: any) =>
                              count +
                              permission.dashboard.filter((item: any) => item.status).length +
                              permission.userManagement.filter((item: any) => item.status).length +
                              permission.courtManagement.filter((item: any) => item.status).length +
                              permission.productInventoryManagement.filter((item: any) => item.status).length +
                              permission.loyaltyMembership.filter((item: any) => item.status).length +
                              permission.discountManagement.filter((item: any) => item.status).length +
                              permission.reports.filter((item: any) => item.status).length +
                              permission.settings.filter((item: any) => item.status).length +
                              permission.bookingManagement.filter((item: any) => item.status).length,
                            0,
                          )
                          .toLocaleString()} Default permissions`}
                  </div>
                </div>
              )}
            </Cell>
          </Column>

          <Column width={200} fixed="right">
            <HeaderCell className="uppercase text-center pl-2" style={{ backgroundColor: "#f2f2f2" }}>
              Action
            </HeaderCell>

            <Cell style={{ padding: "6px" }} className="text-center flex align-middle">
              {(rowData) => (
                <div className="flex justify-evenly align-middle items-center h-full text-gray-600">
                  <Sheet open={openEdit} onOpenChange={setOpenEdit}>
                    <SheetTrigger>
                      <div
                        // onClick={() => {
                        //   setEditData(rowData);
                        //   const isAllTrue = Object.values(rowData).every((items: any) =>
                        //     items.every((item: any) => item.status === true)
                        //   );

                        //   console.log(isAllTrue);
                        // }}
                        onClick={() => handleRowClick(rowData)}
                        className="flex items-center hover:text-blue-700 cursor-pointer"
                      >
                        <SquarePen width={16} />
                        <span className="ml-1">Edit</span>
                      </div>
                    </SheetTrigger>
                    <SheetContent
                      className="bg-white border border-border_color"
                      onClick={() => {
                        setOpenLocation(false), setIsColorPickerOpen(false)
                      }}
                      style={{ maxWidth: "800px" }}
                    >
                      <SheetHeader className="relative h-full">
                        <SheetTitle className="text-gray-600 text-sm -mt-1 uppercase">Edit Access Level</SheetTitle>
                        <SheetDescription>
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-4">
                              {/* <div className="flex flex-col gap-1 py-2 w-1/2">
                                <label className="text-gray-800 text-xs">
                                  Name
                                </label>
                                <div className="relative flex items-center gap-2 w-full">
                                  <Input
                                    type="text"
                                    className="border border-border_color w-full rounded-[12px] px-4 h-10 pr-5 text-xs bg-gray-50"
                                    value={editData?.name || ""}
                                    onChange={(e) =>
                                      setEditData({
                                        ...editData,
                                        name: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </div> */}
                              <div className="flex flex-col gap-1 py-2 w-full">
                                <label className="text-gray-800 text-xs">Role</label>
                                {/* <div className="relative flex items-center gap-2 w-full">
                                  <Select
                                    value={editData?.role || ""}
                                    onValueChange={(value) =>
                                      setEditData({
                                        ...editData,
                                        role: value,
                                      })
                                    }
                                  >
                                    <SelectTrigger className="w-full rounded-[12px] h-10 text-xs bg-gray-50 border-border_color">
                                      <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Admin">Admin</SelectItem>
                                      <SelectItem value="Manager">Manager</SelectItem>
                                      <SelectItem value="Staff">Staff</SelectItem>
                                      <SelectItem value="Receptionist">Receptionist</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div> */}
                                {/* <input
                        type="text"
                        className="border border-border_color w-full rounded-[12px] px-4 h-10 pr-5 text-xs bg-gray-50"
                        value={editData?.role || ""}
                        onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                        placeholder="Select Role"
                      /> */}
                      <RoleSelector
    value={editData?.role || ""}
    onChange={(value) => setEditData({ ...editData, role: value })}
    error={!editData?.role ? "Role is required" : undefined}
  />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-3">
                            <Input
                              type="checkbox"
                              id="select-all-update"
                              className="w-4 h-4 cursor-pointer"
                              onChange={handleSelectAllUpdate}
                              checked={selectAllChecked || false}
                            />
                            <label
                              htmlFor="select-all-update"
                              className="text-sm font-medium text-[#111928] cursor-pointer"
                            >
                              Select all
                            </label>
                          </div>
                          <div className="w-full min-h-[75vh] h-[75vh] overflow-y-auto pt-2 pb-20">
                            <div className="flex flex-wrap justify-between items-start px-6 pb-5">
                              {[
                                "dashboard",
                                "userManagement",
                                "courtManagement",
                                "productInventoryManagement",
                                "loyaltyMembership",
                                "discountManagement",
                                "reports",
                                "settings",
                                "bookingManagement",
                              ].map((type) => (
                                <div key={type} className="w-1/2 py-4">
                                  <h3 className="font-semibold text-lg text-[#1F2A37] mb-2">
                                    {type === "userManagement"
                                      ? "User Management"
                                      : type === "courtManagement"
                                        ? "Court Management"
                                        : type === "productInventoryManagement"
                                          ? "Product & Inventory Management"
                                          : type === "loyaltyMembership"
                                            ? "Loyalty & Membership"
                                            : type === "discountManagement"
                                              ? "Discount Management"
                                              : type === "bookingManagement"
                                                ? "Booking Management"
                                                : type.charAt(0).toUpperCase() + type.slice(1)}
                                  </h3>
                                  {editData?.permissions[0][type]?.map((category: any, categoryIndex: number) => (
                                    <div key={category.value} className="flex items-center mb-2 gap-2 pl-6">
                                      <input
                                        type="checkbox"
                                        id={category.value}
                                        checked={category.status || false}
                                        onChange={() => handleCheckboxChange1(category, categoryIndex, type)}
                                        className="w-4 h-4 cursor-pointer"
                                      />
                                      <label
                                        htmlFor={category.value}
                                        className="text-sm font-medium text-[#111928] cursor-pointer"
                                      >
                                        {category.name}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-start gap-2 fixed bottom-0 bg-white w-full p-4  border-border_color z-10">
                              <button
                                className="bg-teal-800 text-white rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center mt-2"
                                onClick={handleUpdate}
                              >
                                Update Access Level
                              </button>
                              <div
                                className="border border-border_color rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center mt-2 cursor-pointer"
                                onClick={() => setOpenEdit(false)}
                              >
                                Cancel
                              </div>
                            </div>
                          </div>
                        </SheetDescription>
                      </SheetHeader>
                    </SheetContent>
                  </Sheet>
                  <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogTrigger className="flex items-center" onClick={() => setSelectedId(rowData.id)}>
                      <Trash2 width={16} />
                      <span className="ml-1">Delete</span>
                    </DialogTrigger>
                    <DialogContent className="w-[350px] rounded-lg">
                      <DialogHeader>
                        <DialogTitle>Delete</DialogTitle>
                        <DialogDescription>Are you absolutely want to delete?</DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-start gap-3">
                        <Button
                          variant={"outline"}
                          className="bg-white text-gray-800 hover:bg-gray-100 hover:text-gray-800 w-1/2"
                          onClick={() => setDeleteOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleDelete()}
                          className="flex items-center hover:text-white hover:bg-red-700 bg-red-600 text-white w-1/2"
                        >
                          <span className="ml-1">Delete</span>
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </Cell>
          </Column>
        </Table>
      </div>
    </>
  )
}
export default AccessLevel
