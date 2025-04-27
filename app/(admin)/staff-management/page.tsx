import AccessLevel from "@/components/addRolesAccess";
import EmployeeAdd from "@/components/employeeAdd";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const StaffManagement = () => {
  return (
    <div className="w-full p-4 bg-white">
      <div className="px-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-950">Staff Management</h1>
          <p className="text-sm text-zinc-500">
          Add & manage staff details.
          </p>
        </div>
        <div className="mt-4">
          <Tabs defaultValue="Employee List" className="w-full">
            <TabsList> 
            <TabsTrigger value="Employee List">Employee List </TabsTrigger>
            <TabsTrigger value="Roles & Access">Roles & Access</TabsTrigger>
            </TabsList>
            <TabsContent value="Employee List">
              <div className="">
               <EmployeeAdd />
              </div>
              </TabsContent>
              <TabsContent value="Roles & Access">
               <AccessLevel /> 
                </TabsContent>
            </Tabs>
          </div>
      </div>
    </div>
  );
}
export default StaffManagement;