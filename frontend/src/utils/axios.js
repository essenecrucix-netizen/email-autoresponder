import axios from 'axios';

// No need for baseURL since frontend and backend are served from same origin
// axios.defaults.baseURL = 'http://54.213.58.183:3000';

// Add auth token to requests if it exists
const token = localStorage.getItem('authToken');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default axios; 