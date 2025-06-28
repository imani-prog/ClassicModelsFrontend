import { useEffect, useState } from 'react';

const useAllCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch('http://localhost:8081/customers')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch customers');
                return res.json();
            })
            .then(data => {
                console.log('Fetched all customers:', data.length);
                setCustomers(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching customers:', err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const refreshCustomers = () => {
        setLoading(true);
        fetch('http://localhost:8081/customers')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch customers');
                return res.json();
            })
            .then(data => {
                setCustomers(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    return {
        customers,
        loading,
        error,
        refreshCustomers
    };
};

export default useAllCustomers;
