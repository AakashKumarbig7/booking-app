"use client"
import { FilePlus, SquarePen, Trash2 } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import { Table } from "rsuite"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { createClient } from '@/utils/supabase/client';
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

type PermissionItem = {
  name: string;
  value: string;
  status: boolean;
};

type PermissionCategory = {
  dashboard: PermissionItem[];
  userManagement: PermissionItem[];
  courtManagement: PermissionItem[];
  productInventoryManagement: PermissionItem[];
  loyaltyMembership: PermissionItem[];
  discountManagement: PermissionItem[];
  reports: PermissionItem[];
  settings: PermissionItem[];
  bookingManagement: PermissionItem[];
};

type DataItem = {

  role: string;
  permissions: PermissionCategory[];
  id: string;
};

const notify = (message: string, success: boolean) =>
  toast[success ? "success" : "error"](message, {
    style: {
      borderRadius: "10px",
      background: "#fff",
      color: "#000",
    },
    position: "top-right",
    duration: 3000,
  });

const allPermission: PermissionCategory[] = [
  {
    dashboard: [
      { name: "View Dashboard Overview", value: "View Dashboard Overview", status: false },
      { name: "Access Sales Analytics", value: "Access Sales Analytics", status: false },
      { name: "View Notifications", value: "View Notifications", status: false },
    ],
    userManagement: [
      { name: "View Staff List", value: "View Staff List", status: false },
      { name: "Add Staff", value: "Add Staff", status: false },
      { name: "Edit Staff Details", value: "Edit Staff Details", status: false },
      { name: "Delete Staff", value: "Delete Staff", status: false },
      { name: "Assign Access Levels", value: "Assign Access Levels", status: false },
    ],
    courtManagement: [
      { name: "View Courts", value: "View Courts", status: false },
      { name: "Add Courts", value: "Add Courts", status: false },
      { name: "Edit Court Details", value: "Edit Court Details", status: false },
      { name: "Delete Courts", value: "Delete Courts", status: false },
      { name: "Manage Booking Schedules", value: "Manage Booking Schedules", status: false },
      { name: "Set Court Availability", value: "Set Court Availability", status: false },
    ],
    productInventoryManagement: [
      { name: "View Products", value: "View Products", status: false },
      { name: "Add Products", value: "Add Products", status: false },
      { name: "Edit Product Details", value: "Edit Product Details", status: false },
      { name: "Delete Products", value: "Delete Products", status: false },
      { name: "Manage Inventory", value: "Manage Inventory", status: false },
      { name: "View Stock Levels", value: "View Stock Levels", status: false },
    ],
    loyaltyMembership: [
      { name: "View Membership Plans", value: "View Membership Plans", status: false },
      { name: "Add New Membership Plans", value: "Add New Membership Plans", status: false },
      { name: "Edit Membership Plan Details", value: "Edit Membership Plan Details", status: false },
      { name: "Delete Membership Plans", value: "Delete Membership Plans", status: false },
      { name: "Configure Loyalty Rewards", value: "Configure Loyalty Rewards", status: false },
    ],
    discountManagement: [
      { name: "View Discounts", value: "View Discounts", status: false },
      { name: "Add Discounts", value: "Add Discounts", status: false },
      { name: "Edit Discount Details", value: "Edit Discount Details", status: false },
      { name: "Delete Discounts", value: "Delete Discounts", status: false },
    ],
    reports: [
      { name: "View Reports", value: "View Reports", status: false },
      { name: "Generate Sales Reports", value: "Generate Sales Reports", status: false },
      { name: "Generate Booking Reports", value: "Generate Booking Reports", status: false },
      { name: "Export Reports", value: "Export Reports", status: false },
    ],
    settings: [
      { name: "Access General Settings", value: "Access General Settings", status: false },
      { name: "Configure Payment Settings", value: "Configure Payment Settings", status: false },
      { name: "Manage Notification Preferences", value: "Manage Notification Preferences", status: false },
      { name: "Update Branding and Logo", value: "Update Branding and Logo", status: false },
      { name: "Access Integrations", value: "Access Integrations", status: false },
      { name: "Configure Access Permissions", value: "Configure Access Permissions", status: false },
    ],
    bookingManagement: [
      { name: "View All Bookings", value: "View All Bookings", status: false },
      { name: "Add New Bookings", value: "Add New Bookings", status: false },
      { name: "Edit Booking Details", value: "Edit Booking Details", status: false },
      { name: "Cancel Bookings", value: "Cancel Bookings", status: false },
      { name: "Approve/Reject Booking Requests", value: "Approve/Reject Booking Requests", status: false },
    ],
  },
];

const AccessLevel = () => {
  const { user: currentUser } = useGlobalContext();
  const { Column, HeaderCell, Cell } = Table;
  const [sortColumn, setSortColumn] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState<'asc' | 'desc'>();
  const [openAdd, setOpenAdd] = useState(false);
  const [editData, setEditData] = useState<DataItem | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [data, setData] = useState<DataItem[]>([]);
  const supabase = createClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [permissionLists, setPermissionLists] = useState<PermissionCategory[]>(allPermission);
  const [selectAll, setSelectAll] = useState(false);
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  const fetchData = useCallback(async () => {
    const { data: company, error } = await supabase
      .from("companies")
      .select("permissions")
      .eq("store_admin", currentUser?.email)
      .single();

    if (company) {
      setData(company.permissions || []);
    }
    if(error)
    {
      
      notify("Failed to fetch data", false);
    }
    setLoading(false);
  }, [currentUser?.email, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getData = () => {
    if (sortColumn && sortType) {
      return [...data].sort((a, b) => {
        const x = a[sortColumn as keyof DataItem];
        const y = b[sortColumn as keyof DataItem];
        if (typeof x === "string" && typeof y === "string") {
          return sortType === "asc" ? x.localeCompare(y) : y.localeCompare(x);
        }
        return 0;
      });
    }
    return data;
  };

  const handleSortColumn = (sortColumn: string, sortType?: 'asc' | 'desc') => {
    if (sortType) {
      setSortColumn(sortColumn);
      setSortType(sortType);
    }
  };

  const AddDepartment = () => {
    
    setEditData({
     
      role: "",
      permissions: allPermission,
      id: Math.random().toString(36).substring(2, 9),
    });
    setOpenAdd(true);
  };

  const handleCheckboxChange = (
    categoryIndex: number,
    permissionIndex: number,
    type: keyof PermissionCategory
  ) => {
    const updatedPermissions = [...permissionLists];
    updatedPermissions[categoryIndex][type][permissionIndex].status =
      !updatedPermissions[categoryIndex][type][permissionIndex].status;
    setPermissionLists(updatedPermissions);
  };

  const handleSelectAll = () => {
    const updatedPermissions = permissionLists.map((category) => {
      const updateCategory = {} as PermissionCategory;
      (Object.keys(category) as Array<keyof PermissionCategory>).forEach((type) => {
        updateCategory[type] = category[type].map((permission) => ({
          ...permission,
          status: !selectAll,
        }));
      });
      return updateCategory;
    });

    setPermissionLists(updatedPermissions);
    setSelectAll(!selectAll);
  };

  const handleSelectAllUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setEditData((prev) => {
      if (!prev) return null;
      const updatedPermissions = { ...prev.permissions[0] };
      (Object.keys(updatedPermissions) as Array<keyof PermissionCategory>).forEach((type) => {
        updatedPermissions[type] = updatedPermissions[type].map((item) => ({
          ...item,
          status: isChecked,
        }));
      });
      setSelectAllChecked(isChecked);
      return { ...prev, permissions: [updatedPermissions] };
    });
  };

  const handleCreate = async (newData: DataItem | null) => {
    if (!newData || !newData.role) {
      notify("Role is required", false);
      return;
    }

    const finalData = [...data, newData];
    setData(finalData);

    await supabase
      .from("companies")
      .update({ permissions: finalData })
      .eq("store_admin", currentUser?.email)
      .single();

    setOpenAdd(false);
    setEditData(null);
    setPermissionLists(allPermission);
    setSelectAll(false);
    notify("Access Level created successfully", true);
  };

  const handleCheckboxChange1 = (
    category: PermissionItem,
    categoryIndex: number,
    type: keyof PermissionCategory
  ) => {
    setEditData((prev) => {
      if (!prev) return null;
      const updatedPermissions = prev.permissions.map((permission) => {
        return {
          ...permission,
          [type]: permission[type].map((item, index) => {
            if (index === categoryIndex) {
              return { ...item, status: !item.status };
            }
            return item;
          }),
        };
      });

      return { ...prev, permissions: updatedPermissions };
    });
  };

  const handleUpdate = async () => {
    if (!editData) return;
    
    const filteredData = data.filter((item) => item.id !== editData.id);
    const updatedData = [...filteredData, editData];
    setData(updatedData);

    await supabase
      .from("companies")
      .update({ permissions: updatedData })
      .eq("store_admin", currentUser?.email)
      .single();

    setOpenEdit(false);
    notify("Permissions updated successfully", true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    const filteredData = data.filter((item) => item.id !== selectedId);

    await supabase
      .from("companies")
      .update({ permissions: filteredData })
      .eq("store_admin", currentUser?.email)
      .single();

    setData(filteredData);
    setDeleteOpen(false);
    setSelectedId(null);
    notify("Access Level deleted successfully", true);
  };

  const handleRowClick = (rowData: DataItem) => {
    setEditData(rowData);
    const isAllTrue = Object.values(rowData.permissions[0]).every(
      (items) => Array.isArray(items) && items.every((item) => item.status === true)
    );
    setSelectAllChecked(isAllTrue);
  };

  const renderPermissionSection = (
    title: string,
    type: keyof PermissionCategory,
    isEditMode: boolean = false
  ) => {
    return (
      <div className="w-1/2 py-4">
        <h3 className="font-semibold text-lg text-[#1F2A37] mb-2">{title}</h3>
        {isEditMode && editData ? (
          editData.permissions[0][type]?.map((category, categoryIndex) => (
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
          ))
        ) : (
          permissionLists[0][type]?.map((permission, permissionIndex) => (
            <div key={permission.value} className="flex items-center mb-2 gap-2 pl-6">
              <input
                type="checkbox"
                id={permission.value}
                checked={permission.status}
                onChange={() => handleCheckboxChange(0, permissionIndex, type)}
                className="w-4 h-4 cursor-pointer"
              />
              <label
                htmlFor={permission.value}
                className="text-sm font-medium text-[#111928] cursor-pointer"
              >
                {permission.name}
              </label>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <>
      <Sheet open={openAdd} onOpenChange={setOpenAdd}>
        <div className="flex justify-end mb-4">
          <Toaster />
          <SheetTrigger>
            <div
              className="bg-teal-800 hover:bg-teal-700 text-white rounded-[12px] w-[130px] h-[40px] flex items-center justify-center text-xs cursor-pointer"
              onClick={AddDepartment}
            >
              <FilePlus size={14} />
              <span className="ml-2">Add Access Level</span>
            </div>
          </SheetTrigger>
        </div>
        <SheetContent className="bg-white border-border_color" style={{ maxWidth: "800px" }}>
          <SheetHeader className="relative h-full">
            <SheetTitle className="text-gray-600 text-sm -mt-1 uppercase">New Access Level</SheetTitle>
            <SheetDescription>
              <div className="flex flex-col gap-2">
                <div className="flex w-full gap-4">
                  <div className="flex flex-col gap-1 py-2 w-full">
                    <label className="text-gray-900 text-sm font-medium">Role</label>
                    <div className="relative flex items-center gap-2 w-full">
                      <RoleSelector
                        value={editData?.role || ""}
                        onChange={(value) =>{
                          console.log("value",value);
                           editData && setEditData({ ...editData, role: value })}}
                        error={!editData?.role ? "Role is required" : undefined}
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
                <div className="flex flex-wrap justify-between items-start px-6">
                  {renderPermissionSection("Dashboard", "dashboard")}
                  {renderPermissionSection("User Management", "userManagement")}
                  {renderPermissionSection("Court Management", "courtManagement")}
                  {renderPermissionSection("Product & Inventory", "productInventoryManagement")}
                  {renderPermissionSection("Loyalty & Membership", "loyaltyMembership")}
                  {renderPermissionSection("Discount Management", "discountManagement")}
                  {renderPermissionSection("Reports", "reports")}
                  {renderPermissionSection("Settings", "settings")}
                  {renderPermissionSection("Booking Management", "bookingManagement")}
                </div>
              </div>
              <div className="flex justify-start gap-2 fixed bottom-0 bg-white w-full p-4 border-border_color z-10">
                <button
                  className="bg-teal-800 hover:bg-teal-700 text-white rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center mt-2"
                  onClick={() => editData && handleCreate(editData)}
                >
                  Save Access Level
                </button>
                <button
                  className="border border-border_color rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center mt-2"
                  onClick={() => {
                    setOpenAdd(false);
                    setPermissionLists(allPermission);
                    setSelectAll(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      {/* <Sheet open={openEdit} onOpenChange={setOpenEdit}>
        <SheetContent className="bg-white border border-border_color" style={{ maxWidth: "800px" }}>
          <SheetHeader className="relative h-full">
            <SheetTitle className="text-gray-600 text-sm -mt-1 uppercase">Edit Access Level</SheetTitle>
            <SheetDescription>
              <div className="flex flex-col gap-2">
                <div className="flex gap-4">
                  <div className="flex flex-col gap-1 py-2 w-full">
                    <label className="text-gray-800 text-xs">Role</label>
                    <RoleSelector
                      value={editData?.role || ""}
                      onChange={(value) => editData && setEditData({ ...editData, role: value })}
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
                <label htmlFor="select-all-update" className="text-sm font-medium text-[#111928] cursor-pointer">
                  Select all
                </label>
              </div>
              <div className="w-full min-h-[75vh] h-[75vh] overflow-y-auto pt-2 pb-20">
                <div className="flex flex-wrap justify-between items-start px-6 pb-5">
                  {renderPermissionSection("Dashboard", "dashboard", true)}
                  {renderPermissionSection("User Management", "userManagement", true)}
                  {renderPermissionSection("Court Management", "courtManagement", true)}
                  {renderPermissionSection("Product & Inventory", "productInventoryManagement", true)}
                  {renderPermissionSection("Loyalty & Membership", "loyaltyMembership", true)}
                  {renderPermissionSection("Discount Management", "discountManagement", true)}
                  {renderPermissionSection("Reports", "reports", true)}
                  {renderPermissionSection("Settings", "settings", true)}
                  {renderPermissionSection("Booking Management", "bookingManagement", true)}
                </div>
                <div className="flex justify-start gap-2 fixed bottom-0 bg-white w-full p-4 border-border_color z-10">
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
      </Sheet> */}

      <div className="w-full border border-border_color rounded-[8px] bg-white text-sm my-2">
        <Table
          data={getData()}
          loading={loading}
          sortColumn={sortColumn}
          sortType={sortType}
          onSortColumn={handleSortColumn}
          className="rounded-[8px]"
          autoHeight
        >
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
              {(rowData: DataItem) => (
                <div className="flex items-center">
                  {rowData.permissions[0] && Object.values(rowData.permissions[0]).every(
                    (items) => Array.isArray(items) && items.every((item) => item.status === true)
                  )
                    ? "Full access"
                    : `${Object.values(rowData.permissions[0])
                        .reduce(
                          (count, items) => 
                            count + (Array.isArray(items) 
                              ? items.filter((item) => item.status).length 
                              : 0),
                          0
                        )
                        .toLocaleString()} permissions`}
                </div>
              )}
            </Cell>
          </Column>

          <Column width={200} fixed="right">
            <HeaderCell className="uppercase text-center pl-2" style={{ backgroundColor: "#f2f2f2" }}>
              Action
            </HeaderCell>

            <Cell style={{ padding: "6px" }} className="text-center flex justify-center items-center">
              {(rowData: DataItem) => (
                <div className="flex gap-4 justify-center align-middle items-center h-full text-gray-600">
                    <Sheet open={openEdit} onOpenChange={setOpenEdit}>
                  <SheetTrigger>
                    <div
                      onClick={() => handleRowClick(rowData)}
                      className="flex items-center hover:text-teal-700 cursor-pointer"
                    >
                      <SquarePen width={16} />
                    </div>
                  </SheetTrigger>
                  <SheetContent className="bg-white border border-border_color" style={{ maxWidth: "800px" }}>
          <SheetHeader className="relative h-full">
            <SheetTitle className="text-gray-600 text-sm -mt-1 uppercase">Edit Access Level</SheetTitle>
            <SheetDescription>
              <div className="flex flex-col gap-2">
                <div className="flex gap-4">
                  <div className="flex flex-col gap-1 py-2 w-full">
                    <label className="text-gray-800 text-xs">Role</label>
                    <RoleSelector
                      value={editData?.role || ""}
                      onChange={(value) => editData && setEditData({ ...editData, role: value })}
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
                <label htmlFor="select-all-update" className="text-sm font-medium text-[#111928] cursor-pointer">
                  Select all
                </label>
              </div>
              <div className="w-full min-h-[75vh] h-[75vh] overflow-y-auto pt-2 pb-20">
                <div className="flex flex-wrap justify-between items-start px-6 pb-5">
                  {renderPermissionSection("Dashboard", "dashboard", true)}
                  {renderPermissionSection("User Management", "userManagement", true)}
                  {renderPermissionSection("Court Management", "courtManagement", true)}
                  {renderPermissionSection("Product & Inventory", "productInventoryManagement", true)}
                  {renderPermissionSection("Loyalty & Membership", "loyaltyMembership", true)}
                  {renderPermissionSection("Discount Management", "discountManagement", true)}
                  {renderPermissionSection("Reports", "reports", true)}
                  {renderPermissionSection("Settings", "settings", true)}
                  {renderPermissionSection("Booking Management", "bookingManagement", true)}
                </div>
                <div className="flex justify-start gap-2 fixed bottom-0 bg-white w-full p-4 border-border_color z-10">
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

                   <DialogTrigger >
                    <div
                    className="flex items-center" 
                    onClick={() => {
                      setSelectedId(rowData.id);
                      setDeleteOpen(true);
                    }}
                    >
                
                    <Trash2 width={16} />
                    </div>
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
              onClick={handleDelete}
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
  );
};

export default AccessLevel;