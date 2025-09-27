// handleGoogleLoginResponse.js
export const handleGoogleLoginResponse = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
        localStorage.setItem('token', token);
        window.location.href = 'http://localhost:3000/modules/products';
    } else {
        console.error('Token tidak ditemukan');
    }
};
