import { FaBuilding, FaGlobe, FaMoneyBillWave, FaUsers } from 'react-icons/fa';

const CustomerStats = ({ customers }) => {
    const totalCustomers = customers.length;
    const uniqueCountries = [...new Set(customers.map(customer => customer.country).filter(Boolean))].length;
    const uniqueStates = [...new Set(customers.map(customer => customer.state).filter(Boolean))].length;
    const totalCreditLimit = customers.reduce((sum, customer) => sum + (parseFloat(customer.creditLimit) || 0), 0);

    const statsData = [
        {
            icon: FaUsers,
            value: totalCustomers,
            label: 'Total Customers',
            color: 'blue'
        },
        {
            icon: FaGlobe,
            value: uniqueCountries,
            label: 'Countries',
            color: 'green'
        },
        {
            icon: FaBuilding,
            value: uniqueStates,
            label: 'States/Regions',
            color: 'yellow'
        },
        {
            icon: FaMoneyBillWave,
            value: `Ksh ${totalCreditLimit.toLocaleString()}`,
            label: 'Total Credit',
            color: 'purple'
        }
    ];

    const colorClasses = {
        blue: 'bg-blue-50 border-blue-200 text-blue-600',
        green: 'bg-green-50 border-green-200 text-green-600',
        yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
        purple: 'bg-purple-50 border-purple-200 text-purple-600'
    };

    return (
        <div className="flex gap-4">
            {statsData.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                    <div key={index} className={`border rounded-lg px-4 py-2 text-center ${colorClasses[stat.color]}`}>
                        <div className="flex items-center gap-2">
                            <IconComponent className="text-lg" />
                            <div>
                                <div className="text-xl font-bold">{stat.value}</div>
                                <div className="text-xs">{stat.label}</div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CustomerStats;
