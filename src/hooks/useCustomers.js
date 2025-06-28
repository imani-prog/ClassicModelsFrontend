import { useEffect, useRef, useState } from 'react';

const useCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editCustomerId, setEditCustomerId] = useState(null);
    const [form, setForm] = useState({
        customerName: '',
        contactLastName: '',
        contactFirstName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        creditLimit: '',
        salesRepEmployeeNumber: ''
    });
    const [searchNumber, setSearchNumber] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searchError, setSearchError] = useState('');
    const [searchEditMode, setSearchEditMode] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const toastTimeout = useRef(null);
    const [confirmDialog, setConfirmDialog] = useState({ show: false, customerId: null });
    const [visibleColumnStart, setVisibleColumnStart] = useState(0);

    const columns = [
        { key: 'customerName', label: 'Customer Name' },
        { key: 'id', label: 'Customer Number' },
        { key: 'contactFirstName', label: 'Contact First Name' },
        { key: 'contactLastName', label: 'Contact Last Name' },
        { key: 'phone', label: 'Phone' },
        { key: 'addressLine1', label: 'Address Line 1' },
        { key: 'addressLine2', label: 'Address Line 2' },
        { key: 'city', label: 'City' },
        { key: 'state', label: 'State' },
        { key: 'country', label: 'Country' },
        { key: 'postalCode', label: 'Postal Code' },
        { key: 'creditLimit', label: 'Credit Limit' },
        { key: 'salesRepEmployeeNumber', label: 'Sales Rep Employee Number' }
    ];
    const columnsPerView = 13;
    const maxStart = columns.length - columnsPerView;

    const fetchCustomers = () => {
        setLoading(true);
        fetch('http://localhost:8081/customers')
            .then((res) => res.json())
            .then((data) => {
                setCustomers(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        toastTimeout.current = setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditClick = (customer) => {
        setForm({
            customerName: customer.customerName || '',
            contactLastName: customer.contactLastName || '',
            contactFirstName: customer.contactFirstName || '',
            phone: customer.phone || '',
            addressLine1: customer.addressLine1 || '',
            addressLine2: customer.addressLine2 || '',
            city: customer.city || '',
            state: customer.state || '',
            postalCode: customer.postalCode || '',
            country: customer.country || '',
            creditLimit: customer.creditLimit || '',
            salesRepEmployeeNumber: customer.salesRepEmployeeNumber ? customer.salesRepEmployeeNumber.id : ''
        });
        setEditCustomerId(customer.id);
        setEditMode(true);
        setShowAddForm(true);
    };

    const handleDeleteClick = (customerId) => {
        setConfirmDialog({ show: true, customerId });
    };

    const confirmDelete = () => {
        const customerId = confirmDialog.customerId;
        setConfirmDialog({ show: false, customerId: null });
        fetch(`http://localhost:8081/customers/${customerId}`, {
            method: 'DELETE'
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to delete customer');
                showToast('Customer deleted successfully!', 'success');
                fetchCustomers();
            })
            .catch((err) => {
                showToast(err.message, 'error');
            });
    };

    const cancelDelete = () => {
        setConfirmDialog({ show: false, customerId: null });
    };

    const handleAddCustomer = (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = {
            ...form,
            creditLimit: form.creditLimit ? parseFloat(form.creditLimit) : null,
            salesRepEmployeeNumber: form.salesRepEmployeeNumber
                ? { employeeNumber: parseInt(form.salesRepEmployeeNumber) }
                : null
        };
        let url = 'http://localhost:8081/customers/save';
        let method = 'POST';
        if (editMode && editCustomerId) {
            url = `http://localhost:8081/customers/${editCustomerId}`;
            method = 'PUT';
        }
        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to save customer');
                return res.json();
            })
            .then(() => {
                handleCloseForm();
                fetchCustomers();
                showToast(editMode ? 'Customer updated successfully!' : 'Customer added successfully!', 'success');
            })
            .catch((err) => {
                showToast(err.message, 'error');
            })
            .finally(() => setSaving(false));
    };

    const handleCloseForm = () => {
        setShowAddForm(false);
        setEditMode(false);
        setEditCustomerId(null);
        setForm({
            customerName: '',
            contactLastName: '',
            contactFirstName: '',
            phone: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
            creditLimit: '',
            salesRepEmployeeNumber: ''
        });
    };

    const handleSearch = () => {
        setSearchError('');
        setSearchResult(null);
        if (!searchNumber) return;
        fetch(`http://localhost:8081/customers/${searchNumber}`)
            .then(res => {
                if (!res.ok) throw new Error('Customer not found');
                return res.json();
            })
            .then(data => {
                setSearchResult(data);
                setSearchEditMode(false);
            })
            .catch(err => {
                setSearchError(err.message);
            });
    };

    const handleSearchEditClick = () => {
        setSearchEditMode(true);
    };

    const handleSearchInputChange = (e) => {
        const { name, value } = e.target;
        setSearchResult(prev => ({ ...prev, [name]: value }));
    };

    const handleSearchSave = (e) => {
        e.preventDefault();
        fetch(`http://localhost:8081/customers/${searchResult.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...searchResult,
                creditLimit: searchResult.creditLimit ? parseFloat(searchResult.creditLimit) : null,
                salesRepEmployeeNumber: searchResult.salesRepEmployeeNumber ? { id: parseInt(searchResult.salesRepEmployeeNumber.id || searchResult.salesRepEmployeeNumber) } : null
            })
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to save changes');
                return res.json();
            })
            .then(() => {
                setSearchEditMode(false);
                fetchCustomers();
                showToast('Customer updated successfully!', 'success');
            })
            .catch(err => {
                showToast(err.message, 'error');
            });
    };

    const handleSearchClose = () => {
        setSearchResult(null);
        setSearchEditMode(false);
        setSearchError('');
    };

    const handleScrollLeft = () => {
        setVisibleColumnStart((prev) => Math.max(0, prev - columnsPerView));
    };

    const handleScrollRight = () => {
        setVisibleColumnStart((prev) => Math.min(maxStart, prev + columnsPerView));
    };

    const handleOpenForm = () => {
        setShowAddForm(true);
        setEditMode(false);
        setEditCustomerId(null);
    };

    return {
        // State
        customers,
        loading,
        error,
        showAddForm,
        form,
        editMode,
        saving,
        searchNumber,
        searchResult,
        searchError,
        searchEditMode,
        toast,
        confirmDialog,
        visibleColumnStart,
        columns,
        columnsPerView,
        maxStart,
        
        // Actions
        handleInputChange,
        handleAddCustomer,
        handleEditClick,
        handleDeleteClick,
        confirmDelete,
        cancelDelete,
        handleCloseForm,
        handleOpenForm,
        handleSearch,
        handleSearchEditClick,
        handleSearchInputChange,
        handleSearchSave,
        handleSearchClose,
        handleScrollLeft,
        handleScrollRight,
        setSearchNumber
    };
};

export default useCustomers;
