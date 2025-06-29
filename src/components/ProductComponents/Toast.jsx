const Toast = ({ show, message, type = 'success' }) => {
    if (!show) return null;

    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    
    return (
        <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300`}>
            {message}
        </div>
    );
};

export default Toast;
