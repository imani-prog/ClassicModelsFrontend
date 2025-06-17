import { FaPlus } from 'react-icons/fa';
import { IoSearch } from 'react-icons/io5';

const Customers = () => {
    const customers = [
        { customerId: '001', customer: 'Customer A', fname: 'Customer A', lname: 'Customer A', phone: '01111', Address: 'Address 1A', Address2: 'Address 2A', City: 'City A', State: 'State A', Sales: '001A' },
        { customerId: '002', customer: 'Customer B', fname: 'Customer B', lname: 'Customer B', phone: '02222', Address: 'Address 1B', Address2: 'Address 2B', City: 'City B', State: 'State B', Sales: '001B' },
        { customerId: '003', customer: 'Customer C', fname: 'Customer C', lname: 'Customer C', phone: '03333', Address: 'Address 1C', Address2: 'Address 2C', City: 'City C', State: 'State C', Sales: '001A' },
        { customerId: '004', customer: 'Customer D', fname: 'Customer D', lname: 'Customer D', phone: '04444', Address: 'Address 1D', Address2: 'Address 2D', City: 'City D', State: 'State D', Sales: '001B' },
    ];
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className='items-center justify-center w-full flex flex-col mb-6'>
                <h1 className="text-3xl font-bold text-center mb-6">Customers</h1>
                <button className="bg-[#4a90e2] items-center flex flex-row gap-2 cursor-pointer text-white px-8 py-1.5 
                rounded hover:bg-blue-400 transition">
                    <FaPlus className='text-black text-lg' />
                    Add Customer
                </button>
            </div>

            <div className="flex items-center justify-between mb-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search customers"
                        className="border-2 border-black bg-[#f5f5f5] rounded-md py-2 pl-13 pr-4
                         "
                    />
                    <span className="absolute  left-3 top-2.5 ">
                        <IoSearch className="w-5 h-5" />
                    </span>
                </div>
            </div>
            <table className="w-full border overflow-x-scroll border-blue-300">
                <thead className="bg-[#f5f5f5] border-b-2 border-[#258cbf]">
                    <tr>
                        <th className="px-4 py-2 text-center whitespace-nowrap">Name</th>
                        <th className="px-4 py-2 text-center whitespace-nowrap">Customer ID</th>
                        <th className="px-4 py-2 text-center whitespace-nowrap">Contact First Name</th>
                        <th className="px-4 py-2 text-center whitespace-nowrap">Contact Last Name</th>
                        <th className="px-4 py-2 text-center whitespace-nowrap">Phone</th>
                        <th className="px-4 py-2 text-center whitespace-nowrap">Address Line 1</th>
                        <th className="px-4 py-2 text-center whitespace-nowrap">Address Line 2</th>
                        <th className="px-4 py-2 text-center whitespace-nowrap">City</th>
                        <th className="px-4 py-2 text-center whitespace-nowrap">State</th>
                        <th className="px-4 py-2 text-center whitespace-nowrap">Sales Representative Number</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map((customer, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                            <td className="border-t-2 font-medium text-center border-[#42befb] px-4 py-2 whitespace-nowrap">{customer.customer}</td>
                            <td className="border-t-2 font-medium text-center border-[#42befb] px-4 py-2 whitespace-nowrap">{customer.customerId}</td>
                            <td className="border-t-2 font-medium text-center border-[#42befb] px-4 py-2 whitespace-nowrap">{customer.fname}</td>
                            <td className="border-t-2 font-medium text-center border-[#42befb] px-4 py-2 whitespace-nowrap">{customer.lname}</td>
                            <td className="border-t-2 font-medium text-center border-[#42befb] px-4 py-2 whitespace-nowrap">{customer.phone}</td>
                            <td className="border-t-2 font-medium text-center border-[#42befb] px-4 py-2 whitespace-nowrap">{customer.Address}</td>
                            <td className="border-t-2 font-medium text-center border-[#42befb] px-4 py-2 whitespace-nowrap">{customer.Address2}</td>
                            <td className="border-t-2 font-medium text-center border-[#42befb] px-4 py-2 whitespace-nowrap">{customer.City}</td>
                            <td className="border-t-2 font-medium text-center border-[#42befb] px-4 py-2 whitespace-nowrap">{customer.State}</td>
                            <td className="border-t-2 font-medium text-center border-[#42befb] px-4 py-2 whitespace-nowrap">{customer.Sales}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Customers