"use client";
import { FilePlus, SquarePen, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Table } from "rsuite";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createClient } from "@/utils/supabase/client";
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
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

interface Holiday {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

const Holidays = () => {
  const supabase = createClient();
  const { user: currentUser } = useGlobalContext();
  const [openAdd, setOpenAdd] = useState(false);
  const [editData, setEditData] = useState<Holiday | null>(null);
  const [oldEditData, setOldEditData] = useState<Holiday | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Holiday[]>([]);
  const { Column, HeaderCell, Cell } = Table;
  const [sortColumn, setSortColumn] = useState<string>();
  const [sortType, setSortType] = useState<'asc' | 'desc'>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [dateFormat, setDateFormat] = useState<string>("MM/DD/YYYY");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Fetch holidays data
  async function fetchData() {
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
  }

  // Handle table sorting
  const handleSortColumn = (sortColumn: string, sortType?: 'asc' | 'desc') => {
    setTimeout(() => {
      setSortColumn(sortColumn);
      setSortType(sortType);
    });
  };

  useEffect(() => {
    if (currentUser?.email) {
      fetchData();
    }
  }, [currentUser]);

  // Create new holiday
  async function handleCreate(newData: Holiday) {
    if (!newData.name || !newData.startDate || !newData.endDate) return;

    // Parse dates using the appropriate format
    const antdFormat = dateFormat === "dd/MMM/yyyy" ? "DD/MM/YYYY" : "MM/DD/YYYY";
    const startDate = dayjs(newData.startDate, antdFormat);
    const endDate = dayjs(newData.endDate, antdFormat);
    
    if (!startDate.isValid() || !endDate.isValid()) {
      alert('Please enter valid dates');
      return;
    }

    if (endDate.isBefore(startDate)) {
      alert('End date cannot be before start date');
      return;
    }

    const randomId = () => Math.random().toString(36).substring(2, 9);

    const updatedData: Holiday = {
      ...newData,
      id: newData.id || randomId(),
      // Store dates in the database format
      startDate: startDate.format(dateFormat),
      endDate: endDate.format(dateFormat),
    };

    const updatedHolidays = data.map(holiday => ({
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

    setOpenAdd(false);
    setEditData(null);
  }

  // Update existing holiday
  const handleUpdate = async (newData: Holiday) => {
    if (!newData.name || !newData.startDate || !newData.endDate) return;

    // Parse dates using the appropriate format
    const antdFormat = dateFormat === "dd/MMM/yyyy" ? "DD/MM/YYYY" : "MM/DD/YYYY";
    const startDate = dayjs(newData.startDate, antdFormat);
    const endDate = dayjs(newData.endDate, antdFormat);
    
    if (!startDate.isValid() || !endDate.isValid()) {
      alert('Please enter valid dates');
      return;
    }

    if (endDate.isBefore(startDate)) {
      alert('End date cannot be before start date');
      return;
    }

    const filteredData = data.filter(item => item.id !== oldEditData?.id);
    const formattedData: Holiday = {
      ...newData,
      // Store dates in the database format
      startDate: startDate.format(dateFormat),
      endDate: endDate.format(dateFormat),
    };

    const datas = [...filteredData, formattedData];
    setData(datas);

    await supabase
      .from("companies")
      .update({ holidays: datas })
      .eq("store_admin", currentUser?.email)
      .single();

    setOpenEdit(false);
    setEditData(null);
  };

  // Delete holiday
  const handleDelete = async () => {
    if (!selectedId) return;
    const filteredData = data.filter(item => item.id !== selectedId);

    await supabase
      .from("companies")
      .update({ holidays: filteredData })
      .eq("store_admin", currentUser?.email)
      .single();

    setData(filteredData);
    setDeleteOpen(false);
    setSelectedId(null);
  };

  // Sort data for table
  const getSortedData = () => {
    if (!sortColumn || !sortType) return data;

    return [...data].sort((a, b) => {
      const x = a[sortColumn as keyof Holiday];
      const y = b[sortColumn as keyof Holiday];
      
      if (typeof x === 'string' && typeof y === 'string') {
        return sortType === 'asc' ? x.localeCompare(y) : y.localeCompare(x);
      }
      return 0;
    });
  };

  // Initialize edit form
  const handleEdit = (data: Holiday) => {
    setOldEditData(data);
    // Convert dates from database format to Ant Design format for editing
    const antdFormat = dateFormat === "dd/MMM/yyyy" ? "DD/MM/YYYY" : "MM/DD/YYYY";
    const startDate = dayjs(data.startDate, dateFormat);
    const endDate = dayjs(data.endDate, dateFormat);
    
    setEditData({
      ...data,
      startDate: startDate.isValid() ? startDate.format(antdFormat) : data.startDate,
      endDate: endDate.isValid() ? endDate.format(antdFormat) : data.endDate
    });
    setOpenEdit(true);
  };

  // Initialize add form
  const AddHoliday = () => {
    setEditData({
      id: '',
      name: '',
      startDate: '',
      endDate: ''
    });
    setOpenAdd(true);
  };

  return (
    <div className="">
      <Sheet open={openAdd} onOpenChange={setOpenAdd}>
        <div className="flex justify-end mb-4">
          <SheetTrigger>
            <button
              className="bg-teal-800 text-white rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center"
              onClick={AddHoliday}
            >
              <FilePlus size={14} />
              <span className="ml-2">Add Holiday</span>
            </button>
          </SheetTrigger>
        </div>
        
        <SheetContent className="bg-white border-border_color" style={{ maxWidth: "460px" }}>
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
                    value={editData?.name || ''}
                    onChange={(e) => setEditData({ ...editData!, name: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-6 mt-3 w-full">
                  <div className="w-1/2">
                    <label className="text-gray-800 text-xs font-medium">
                      Start Date
                    </label>
                    <DatePicker
                      format={dateFormat === "dd/MMM/yyyy" ? "DD/MM/YYYY" : "MM/DD/YYYY"}
                      value={editData?.startDate ? dayjs(editData.startDate, dateFormat === "dd/MMM/yyyy" ? "DD/MM/YYYY" : "MM/DD/YYYY") : null}
                      onChange={(date) => {
                        setEditData({ 
                          ...editData!, 
                          startDate: date ? date.format(dateFormat === "dd/MMM/yyyy" ? "DD/MM/YYYY" : "MM/DD/YYYY") : '' 
                        });
                      }}
                      className="w-full"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="text-gray-800 text-xs font-medium">
                      End Date
                    </label>
                    <DatePicker
                      format={dateFormat === "dd/MMM/yyyy" ? "DD/MM/YYYY" : "MM/DD/YYYY"}
                      value={editData?.endDate ? dayjs(editData.endDate, dateFormat === "dd/MMM/yyyy" ? "DD/MM/YYYY" : "MM/DD/YYYY") : null}
                      onChange={(date) => {
                        setEditData({ 
                          ...editData!, 
                          endDate: date ? date.format(dateFormat === "dd/MMM/yyyy" ? "DD/MM/YYYY" : "MM/DD/YYYY") : '' 
                        });
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-start gap-2 absolute bottom-0">
                <button
                  className="bg-primary-700 text-white rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center mt-2"
                  onClick={() => handleCreate(editData!)}
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
          data={getSortedData()}
          loading={loading}
          sortColumn={sortColumn}
          sortType={sortType}
          onSortColumn={handleSortColumn}
          className="rounded-[8px]"
          autoHeight
        >
          <Column width={300} sortable>
            <HeaderCell className="uppercase select-none text-left font-bold" style={{ backgroundColor: "#f2f2f2", paddingLeft: "50px" }}>
              Reason
            </HeaderCell>
            <Cell className="text-left pl-10" dataKey="name" />
          </Column>

          <Column flexGrow={1}>
            <HeaderCell className="uppercase select-none text-left font-bold" style={{ backgroundColor: "#f2f2f2" }}>
              Start Date
            </HeaderCell>
            <Cell>
              {(rowData: Holiday) => {
                const date = dayjs(rowData.startDate, dateFormat);
                return date.isValid() ? date.format(dateFormat) : rowData.startDate;
              }}
            </Cell>
          </Column>

          <Column flexGrow={1}>
            <HeaderCell className="uppercase select-none text-left font-bold" style={{ backgroundColor: "#f2f2f2" }}>
              End Date
            </HeaderCell>
            <Cell>
              {(rowData: Holiday) => {
                const date = dayjs(rowData.endDate, dateFormat);
                return date.isValid() ? date.format(dateFormat) : rowData.endDate;
              }}
            </Cell>
          </Column>

          <Column width={200} fixed="right">
            <HeaderCell className="uppercase text-center font-bold pl-2" style={{ backgroundColor: "#f2f2f2" }}>
              Action
            </HeaderCell>

            <Cell style={{ padding: "6px" }} className="text-left flex align-middle">
              {(rowData: Holiday) => (
                <div className="flex justify-evenly align-middle items-center h-full text-gray-600">
                  <Sheet open={openEdit} onOpenChange={setOpenEdit}>
                    <SheetTrigger>
                      <div
                        onClick={() => handleEdit(rowData)}
                        className="flex items-center hover:text-primary-700 cursor-pointer"
                      >
                        <SquarePen width={16} />
                        <span className="ml-1">Edit</span>
                      </div>
                    </SheetTrigger>
                    <SheetContent className="bg-white border-border_color" style={{ maxWidth: "460px" }}>
                      <SheetHeader className="relative h-full">
                        <SheetTitle className="text-gray-600 text-sm -mt-1 uppercase">
                          Edit Holiday
                        </SheetTitle>
                        <SheetDescription>
                          <div className="flex flex-col gap-2">
                            <div>
                              <label className="text-gray-800 text-xs">
                                Description
                              </label>
                              <input
                                type="text"
                                className="border border-border_color w-full rounded-[12px] px-4 h-10 pr-5 text-xs bg-gray-50"
                                value={editData?.name || ''}
                                onChange={(e) => setEditData({ ...editData!, name: e.target.value })}
                              />
                            </div>
                            <div className="flex items-center gap-6 mt-3 w-full">
                              <div className="w-1/2">
                                <label className="text-gray-800 text-xs font-medium">
                                  Start Date
                                </label>
                                <DatePicker
                                  format={dateFormat === "dd/MMM/yyyy" ? "DD/MM/YYYY" : "MM/DD/YYYY"}
                                  value={editData?.startDate ? dayjs(editData.startDate, dateFormat === "dd/MMM/yyyy" ? "DD/MM/YYYY" : "MM/DD/YYYY") : null}
                                  onChange={(date) => {
                                    setEditData({ 
                                      ...editData!, 
                                      startDate: date ? date.format(dateFormat === "dd/MMM/yyyy" ? "DD/MM/YYYY" : "MM/DD/YYYY") : '' 
                                    });
                                  }}
                                  className="w-full"
                                />
                              </div>
                              <div className="w-1/2">
                                <label className="text-gray-800 text-xs font-medium">
                                  End Date
                                </label>
                                <DatePicker
                                  format={dateFormat === "dd/MMM/yyyy" ? "DD/MM/YYYY" : "MM/DD/YYYY"}
                                  value={editData?.endDate ? dayjs(editData.endDate, dateFormat === "dd/MMM/yyyy" ? "DD/MM/YYYY" : "MM/DD/YYYY") : null}
                                  onChange={(date) => {
                                    setEditData({ 
                                      ...editData!, 
                                      endDate: date ? date.format(dateFormat === "dd/MMM/yyyy" ? "DD/MM/YYYY" : "MM/DD/YYYY") : '' 
                                    });
                                  }}
                                  className="w-full"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-start gap-2 absolute bottom-0">
                            <button
                              className="bg-teal-800 text-white rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center mt-2"
                              onClick={() => handleUpdate(editData!)}
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
                      className="flex items-center hover:text-red-700 cursor-pointer"
                      onClick={() => setSelectedId(rowData.id)}
                    >
                      <Trash2 width={16} />
                      <span className="ml-1">Delete</span>
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
                          className="flex items-center hover:text-white hover:bg-primary-700 bg-primary-700 text-white w-1/2"
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