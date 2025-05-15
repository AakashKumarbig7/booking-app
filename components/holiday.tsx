"use client";
import { FilePlus, SquarePen, Trash2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Table } from "rsuite";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createClient } from '@/utils/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGlobalContext } from "@/context/store";
import DatePickerComponent from "./datePicker";
import { format } from "date-fns";
import dayjs from "dayjs";

interface Holiday {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface HolidayFormData {
  id?: string;
  name: string | null;
  startDate: string | null;
  endDate: string | null;
}

const Holidays = () => {
  const supabase = createClient();
  const { user: currentUser } = useGlobalContext();
  const [openAdd, setOpenAdd] = useState(false);
  const [editData, setEditData] = useState<HolidayFormData | null>(null);
  const [oldEditData, setOldEditData] = useState<HolidayFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Holiday[]>([]);
  const { Column, HeaderCell, Cell } = Table;
  const [sortColumn, setSortColumn] = useState<string>();
  const [sortType, setSortType] = useState<"asc" | "desc">();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [dateFormat, setDateFormat] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const convertDateFormat = (format: string): string => {
    return format
      .replace(/DD/g, "dd")
      .replace(/MM/g, "MM")
      .replace(/MMM/g, "MMM")
      .replace(/YYYY/g, "yyyy");
  };

  const fetchData = useCallback(async () => {
    const { data: company } = await supabase
      .from("companies")
      .select("holidays, date_format")
      .eq("store_admin", currentUser?.email)
      .single();

    if (company) {
      setData(company.holidays || []);
      setDateFormat(company.date_format || "MM/DD/YYYY");
    }
    setLoading(false);
  }, [currentUser?.email, supabase]);

  const handleSortColumn = (sortColumn: string, sortType?: "asc" | "desc") => {
    setTimeout(() => {
      setSortColumn(sortColumn);
      setSortType(sortType);
    });
  };

  useEffect(() => {
    if (currentUser?.email) {
      fetchData();
    }
  }, [currentUser, fetchData]);

  async function handleCreate(newData: HolidayFormData) {
    if (newData.name && newData.startDate && newData.endDate) {
      const randomId = () => Math.random().toString(36).substring(2, 9);

      const updatedData: Holiday = {
        id: newData.id || randomId(),
        name: newData.name,
        startDate: new Date(newData.startDate).toString(),
        endDate: new Date(newData.endDate).toString(),
      };

      const updatedHolidays = data.map((holiday) => ({
        ...holiday,
        id: holiday.id || randomId(),
      }));

      const datas = [...updatedHolidays, updatedData];
      setData(datas);

      await supabase
        .from("companies")
        .update({ holidays: datas })
        .eq("store_admin", currentUser?.email)
        .single();

      setOpenEdit(false);
      setDeleteOpen(false);
      setOpenAdd(false);
      setEditData(null);
    }
  }

  const handleUpdate = async (newData: HolidayFormData) => {
    if (!oldEditData?.id || !newData.name || !newData.startDate || !newData.endDate) return;
    
    const filteredData = data.filter((item) => item.id !== oldEditData.id);
    const updatedData: Holiday = {
      id: oldEditData.id,
      name: newData.name,
      startDate: new Date(newData.startDate).toString(),
      endDate: new Date(newData.endDate).toString(),
    };

    setData([...filteredData, updatedData]);
    const datas = [...filteredData, updatedData];
    
    await supabase
      .from("companies")
      .update({ holidays: datas })
      .eq("store_admin", currentUser?.email)
      .single();
      
    setOpenEdit(false);
    setDeleteOpen(false);
    setOpenAdd(false);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    const filteredData = data.filter((item) => item.id !== selectedId);

    await supabase
      .from("companies")
      .update({ holidays: filteredData })
      .eq("store_admin", currentUser?.email)
      .single();

    setData(filteredData);
    setDeleteOpen(false);
    setSelectedId(null);
  };

  const getData = () => {
    if (sortColumn && sortType) {
      return [...data].sort((a, b) => {
        const x = a[sortColumn as keyof Holiday];
        const y = b[sortColumn as keyof Holiday];
        if (typeof x === "string" && typeof y === "string") {
          return sortType === "asc" ? x.localeCompare(y) : y.localeCompare(x);
        }
        return 0;
      });
    }
    return data;
  };

  function handleEdit(data: Holiday) {
    setOldEditData(data);
    setEditData(data);
    setOpenEdit(true);
  }

  const AddHoliday = () => {
    setOldEditData({
      name: null,
      startDate: null,
      endDate: null,
    });
    setEditData({
      name: null,
      startDate: null,
      endDate: null,
    });
    setOpenAdd(true);
  };

  return (
    <div className="">
      <Sheet open={openAdd} onOpenChange={setOpenAdd}>
        <div className="flex justify-end mb-4">
          <SheetTrigger>
            <button
              className="bg-teal-800 text-white rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center hover:bg-teal-700"
              onClick={AddHoliday}
            >
              <FilePlus size={14} />
              <span className="ml-2">Add Holiday</span>
            </button>
          </SheetTrigger>
        </div>

        <SheetContent
          className="bg-white border-border_color"
          style={{ maxWidth: "460px" }}
        >
          <SheetHeader className="relative h-full">
            <SheetTitle className="text-gray-600 text-sm -mt-1 uppercase">
              Add new Holiday
            </SheetTitle>
            <SheetDescription>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1 py-2">
                  <label className="text-gray-800 text-xs font-medium">
                    Reason
                  </label>
                  <input
                    type="text"
                    className="border border-border_color w-full rounded-[12px] px-4 h-10 pr-5 text-xs bg-gray-50"
                    value={editData?.name || ""}
                    onChange={(e) =>
                      setEditData({ ...editData!, name: e.target.value })
                    }
                  />
                </div>
                <div className="flex items-center gap-6 mt-3 w-full">
                  <div className="w-1/2">
                    <label className="text-gray-900 text-sm font-medium">
                      Start Date
                    </label>
                    <DatePickerComponent
                      value={editData?.startDate ? dayjs(editData.startDate) : null}
                      onChange={(e) => {
                        setEditData({
                          ...editData!,
                          startDate: e?.toString() || null,
                        });
                      }}
                      className="border border-border_color w-full rounded-[12px] px-4 h-10 pr-5 text-xs bg-gray-50"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="text-gray-900 text-sm font-medium">
                      End Date
                    </label>
                    <DatePickerComponent
                      value={editData?.endDate ? dayjs(editData.endDate) : null}
                      onChange={(e) => {
                        setEditData({
                          ...editData!,
                          endDate: e?.toString() || null,
                        });
                      }}
                      className="border border-border_color w-full rounded-[12px] px-4 h-10 pr-5 text-xs bg-gray-50"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-start gap-2 absolute bottom-0">
                <button
                  className="bg-teal-800 hover:bg-teal-700 text-white rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center mt-2"
                  onClick={() => editData && handleCreate(editData)}
                >
                  Save Holiday
                </button>
                <button
                  className="border border-border_color rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center mt-2"
                  onClick={() => setOpenAdd(false)}
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
          className="rounded-[8px]"
          autoHeight
        >
          <Column width={300} sortable>
            <HeaderCell
              className="uppercase select-none text-left font-bold"
              style={{ backgroundColor: "#f2f2f2", paddingLeft: "50px" }}
            >
              Reason
            </HeaderCell>
            <Cell className="text-left pl-10" dataKey="name" />
          </Column>

          <Column flexGrow={1}>
            <HeaderCell
              className="uppercase select-none text-left font-bold"
              style={{ backgroundColor: "#f2f2f2" }}
            >
              Start Date
            </HeaderCell>
            <Cell>
              {(rowData: Holiday) => {
                try {
                  const date = new Date(rowData.startDate);
                  if (isNaN(date.getTime())) {
                    return "Invalid date";
                  }
                  return format(date, convertDateFormat(dateFormat));
                } catch (error) {
                  console.error("Error formatting date:", error);
                  return "Invalid date";
                }
              }}
            </Cell>
          </Column>

          <Column flexGrow={1}>
            <HeaderCell
              className="uppercase select-none text-left font-bold"
              style={{ backgroundColor: "#f2f2f2" }}
            >
              End Date
            </HeaderCell>
            <Cell>
              {(rowData: Holiday) => {
                try {
                  const date = new Date(rowData.endDate);
                  if (isNaN(date.getTime())) {
                    return "Invalid date";
                  }
                  return format(date, convertDateFormat(dateFormat));
                } catch (error) {
                  console.error("Error formatting date:", error);
                  return "Invalid date";
                }
              }}
            </Cell>
          </Column>

          <Column width={200} fixed="right">
            <HeaderCell
              className="uppercase text-center font-bold pl-2"
              style={{ backgroundColor: "#f2f2f2" }}
            >
              Action
            </HeaderCell>

            <Cell
              style={{ padding: "6px" }}
              className="text-left flex  justify-center"
            >
              {(rowData: Holiday) => (
                <div className="flex gap-3 justify-center  align-middle items-center h-full text-gray-600">
                  <Sheet open={openEdit} onOpenChange={setOpenEdit}>
                    <SheetTrigger>
                      <div
                        onClick={() => handleEdit(rowData)}
                        className="hover:text-teal-800 cursor-pointer"
                      >
                        <SquarePen width={16} />
                      </div>
                    </SheetTrigger>
                    <SheetContent
                      className="bg-white border-border_color"
                      style={{ maxWidth: "460px" }}
                    >
                      <SheetHeader className="relative h-full">
                        <SheetTitle className="text-gray-600 text-sm -mt-1 uppercase">
                          Edit Holiday
                        </SheetTitle>
                        <SheetDescription>
                          <div className="flex flex-col gap-2">
                            <div>
                              <label className="text-gray-900 text-sm font-medium">
                                Description
                              </label>
                              <input
                                type="text"
                                className="border border-border_color w-full rounded-[12px] px-4 h-10 pr-5 text-xs bg-gray-50"
                                value={editData?.name || ""}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData!,
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="flex items-center gap-6 mt-3 w-full">
                              <div className="w-1/2">
                                <label className="text-gray-900 text-sm font-medium">
                                  Start Date
                                </label>
                                <DatePickerComponent
                                  value={editData?.startDate ? dayjs(editData.startDate) : null}
                                  onChange={(e) => {
                                    setEditData({
                                      ...editData!,
                                      startDate: e?.toString() || null,
                                    });
                                  }}
                                  className="border border-border_color w-full rounded-[12px] px-4 h-10 pr-5 text-xs bg-gray-50"
                                />
                              </div>
                              <div className="w-1/2">
                                <label className="text-gray-900 text-sm font-medium">
                                  End Date
                                </label>
                                <DatePickerComponent
                                  value={editData?.endDate ? dayjs(editData.endDate) : null}
                                  onChange={(e) => {
                                    setEditData({
                                      ...editData!,
                                      endDate: e?.toString() || null,
                                    });
                                  }}
                                  className="border border-border_color w-full rounded-[12px] px-4 h-10 pr-5 text-xs bg-gray-50"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-start gap-2 absolute bottom-0">
                            <button
                              className="bg-teal-800 text-white rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center mt-2"
                              onClick={() => editData && handleUpdate(editData)}
                            >
                              Update
                            </button>
                            <button
                              className="border border-border_color rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center mt-2"
                              onClick={() => setOpenEdit(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </SheetDescription>
                      </SheetHeader>
                    </SheetContent>
                  </Sheet>

                  <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogTrigger
                      className=" hover:text-red-700 cursor-pointer"
                      onClick={() => setSelectedId(rowData.id)}
                    >
                      <Trash2 width={16} />
                    </DialogTrigger>
                    <DialogContent className="w-[350px] rounded-lg">
                      <DialogHeader>
                        <DialogTitle>Delete</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this holiday?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-start gap-3">
                        <Button
                          className="bg-red-600 text-white hover:bg-red-400 hover:text-white w-1/2"
                          onClick={() => setDeleteOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleDelete}
                          className="flex items-center hover:text-white hover:bg-teal-700 bg-teal-700 text-white w-1/2"
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
    </div>
  );
};

export default Holidays;