const Toast = ({ show, message, type }) => {
    if (!show) return null;

    return (
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded shadow-lg text-white transition-all ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
            {message}
        </div>
    );
};

export default Toast;
