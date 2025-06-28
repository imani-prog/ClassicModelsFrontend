import { useMemo, useState } from 'react';

const useCustomerEnhancements = (customers) => {
    // Enhanced features state
    const [sortBy, setSortBy] = useState('customerName');
    const [filterCountry, setFilterCountry] = useState('');
    const [filterState, setFilterState] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [globalSearch, setGlobalSearch] = useState('');

    // Enhanced filtering and sorting logic
    const filteredCustomers = useMemo(() => {
        return customers
            .filter(customer => {
                // Global search filter
                const searchMatch = !globalSearch || 
                    customer.customerName?.toLowerCase().includes(globalSearch.toLowerCase()) ||
                    customer.contactFirstName?.toLowerCase().includes(globalSearch.toLowerCase()) ||
                    customer.contactLastName?.toLowerCase().includes(globalSearch.toLowerCase()) ||
                    customer.phone?.toLowerCase().includes(globalSearch.toLowerCase()) ||
                    customer.city?.toLowerCase().includes(globalSearch.toLowerCase()) ||
                    customer.country?.toLowerCase().includes(globalSearch.toLowerCase()) ||
                    String(customer.id || '').toLowerCase().includes(globalSearch.toLowerCase());
                
                // Country filter
                const countryMatch = !filterCountry || customer.country === filterCountry;
                
                // State filter
                const stateMatch = !filterState || customer.state === filterState;
                
                return searchMatch && countryMatch && stateMatch;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'customerName':
                        return (a.customerName || '').localeCompare(b.customerName || '');
                    case 'country':
                        return (a.country || '').localeCompare(b.country || '');
                    case 'creditLimit':
                        return (parseFloat(b.creditLimit) || 0) - (parseFloat(a.creditLimit) || 0);
                    default:
                        return 0;
                }
            });
    }, [customers, globalSearch, filterCountry, filterState, sortBy]);

    // Get unique countries and states for filters
    const countries = useMemo(() => {
        return [...new Set(customers.map(customer => customer.country).filter(Boolean))].sort();
    }, [customers]);

    const states = useMemo(() => {
        return [...new Set(customers.map(customer => customer.state).filter(Boolean))].sort();
    }, [customers]);

    return {
        // State
        sortBy,
        filterCountry,
        filterState,
        showFilters,
        globalSearch,
        filteredCustomers,
        countries,
        states,
        
        // Actions
        setSortBy,
        setFilterCountry,
        setFilterState,
        setShowFilters,
        setGlobalSearch
    };
};

export default useCustomerEnhancements;
