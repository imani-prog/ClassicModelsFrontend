import { useEffect, useRef, useState } from 'react';
import { FaBox, FaBuilding, FaChartBar, FaChevronDown, FaClipboardList, FaDollarSign, FaPlus, FaUsers, FaUserTie } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CustomerForm from './ButtonForms/CustomerForm';
import EmployeeForm from './ButtonForms/EmployeeForm';
import OfficeForm from './ButtonForms/OfficeForm';
import PaymentForm from './ButtonForms/PaymentForm';
import ProductForm from './ButtonForms/ProductForm';

const QuickActions = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [showEmployeeForm, setShowEmployeeForm] = useState(false);
    const [showOfficeForm, setShowOfficeForm] = useState(false);
    const [showCustomerForm, setShowCustomerForm] = useState(false);
    const [showProductForm, setShowProductForm] = useState(false);
    const dropdownRef = useRef(null);

    const actions = [
        {
            label: 'Add Customer',
            icon: FaUsers,
            action: () => {
                setShowCustomerForm(true);
                setIsOpen(false);
            },
            description: 'Manage customers'
        },
        {
            label: 'Add Product',
            icon: FaBox,
            action: () => {
                setShowProductForm(true);
                setIsOpen(false);
            },
            description: 'Manage inventory'
        },
        {
            label: 'Add Payment',
            icon: FaDollarSign,
            action: () => {
                setShowPaymentForm(true);
                setIsOpen(false);
            },
            description: 'Record payment'
        },
        {
            label: 'Add Employee',
            icon: FaUserTie,
            action: () => {
                setShowEmployeeForm(true);
                setIsOpen(false);
            },
            description: 'Add team member'
        },
        {
            label: 'Add Office',
            icon: FaBuilding,
            action: () => {
                setShowOfficeForm(true);
                setIsOpen(false);
            },
            description: 'Register location'
        },
        {
            label: 'View Orders',
            icon: FaClipboardList,
            action: () => {
                navigate('/orders');
                setIsOpen(false);
            },
            description: 'Track orders'
        },
        {
            label: 'Analytics',
            icon: FaChartBar,
            action: () => {
                
                document.getElementById('analytics-section')?.scrollIntoView({ behavior: 'smooth' });
                setIsOpen(false);
            },
            description: 'View reports'
        }
    ];

    // Close dropdown when clicking outside or pressing Escape
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
                setShowPaymentForm(false);
                setShowEmployeeForm(false);
                setShowOfficeForm(false);
                setShowCustomerForm(false);
                setShowProductForm(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscapeKey);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-4 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 flex items-center gap-2 font-medium text-sm"
                aria-expanded={isOpen}
                aria-haspopup="menu"
                aria-label="Quick Actions Menu"
            >
                <FaPlus className="w-4 h-4" />
                <span className="hidden md:inline">Quick Actions</span>
                <span className="md:hidden">Actions</span>
                <FaChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                        <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                            <FaPlus className="text-blue-600" />
                            Quick Actions
                        </h3>
                        <p className="text-sm text-blue-700 mt-1">Select an action to perform</p>
                    </div>
                    
                    <div className="py-2 max-h-96 overflow-y-auto">
                        {actions.map((action, index) => (
                            <button
                                key={index}
                                onClick={action.action}
                                className="w-full px-4 py-3 text-left hover:bg-blue-50 active:bg-blue-100 transition-colors duration-150 flex items-center gap-3 group"
                            >
                                <div className="p-2.5 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-200 group-active:bg-blue-300 transition-colors">
                                    <action.icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 group-hover:text-blue-900">
                                        {action.label}
                                    </div>
                                    <div className="text-sm text-gray-500 group-hover:text-blue-700">
                                        {action.description}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Modal Forms */}
            <PaymentForm 
                showForm={showPaymentForm}
                onClose={() => setShowPaymentForm(false)}
                onSubmit={(result) => {
                    console.log('Payment added:', result);
                }}
            />
            
            <EmployeeForm 
                showForm={showEmployeeForm}
                onClose={() => setShowEmployeeForm(false)}
                onSubmit={(result) => {
                    console.log('Employee added:', result);
                }}
            />
            
            <OfficeForm 
                showForm={showOfficeForm}
                onClose={() => setShowOfficeForm(false)}
                onSubmit={(result) => {
                    console.log('Office added:', result);
                }}
            />
            
            <CustomerForm 
                showForm={showCustomerForm}
                onClose={() => setShowCustomerForm(false)}
                onSubmit={(result) => {
                    console.log('Customer added:', result);
                }}
            />
            
            <ProductForm 
                showForm={showProductForm}
                onClose={() => setShowProductForm(false)}
                onSubmit={(result) => {
                    console.log('Product added:', result);
                }}
            />
        </div>
    );
};

export default QuickActions;
