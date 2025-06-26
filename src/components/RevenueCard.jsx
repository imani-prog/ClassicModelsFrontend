import { FaMoneyBillWave, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const RevenueCard = ({ revenue }) => {
    return (
    <div>
        <div className="border-3 border-[#57acee] rounded-lg p-10 text-center w-60">
            <div className="flex justify-center items-center text-gray-700 mb-2 text-lg">
                <FaMoneyBillWave className="mr-2" />
                Total Revenue
            </div>
            <p className="text-3xl font-bold">Kshs {revenue?.totalRevenue?.toLocaleString()}</p>
            <p className={`text-sm mt-2 ${revenue?.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenue?.trend >= 0 ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(revenue?.trend ?? 0)}% this month
            </p>
        </div>
         <div className='w-full cursor-pointer items-center justify-center text-center'>
                <button className='bg-[#4a90e2] mt-5 rounded-lg text-white py-2 px-8'>
                    View Revenue
                </button>
            </div>
    </div>
        
    );
};

export default RevenueCard;
