/**
 * User Store
 * Manages global user state and authentication using Zustand
 * Handles user authentication, session persistence, and token refresh
 * Author: Suraj
 * Created: February 2024
 */

import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

/**
 * Main user store with authentication state and methods
 * Uses Zustand for simple and efficient state management
 */
export const useUserStore = create((set, get) => ({
	user: null,
	loading: false,
	checkingAuth: true,

	// User registration with input validation
	signup: async ({ name, email, password, confirmPassword }) => {
		set({ loading: true });

		if (password !== confirmPassword) {
			set({ loading: false });
			return toast.error("Passwords do not match");
		}

		try {
			const res = await axios.post("/auth/signup", { name, email, password });
			set({ user: res.data, loading: false });
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.message || "An error occurred");
		}
	},

	// User login with error handling
	login: async (email, password) => {
		set({ loading: true });

		try {
			const res = await axios.post("/auth/login", { email, password });

			set({ user: res.data, loading: false });
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.message || "An error occurred");
		}
	},

	// Clean logout with token cleanup
	logout: async () => {
		try {
			await axios.post("/auth/logout");
			set({ user: null });
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred during logout");
		}
	},

	// Check authentication status on app load
	checkAuth: async () => {
		set({ checkingAuth: true });
		try {
			const response = await axios.get("/auth/profile");
			set({ user: response.data, checkingAuth: false });
		} catch (error) {
			console.log(error.message);
			set({ checkingAuth: false, user: null });
		}
	},

	// Handle token refresh with concurrency control
	refreshToken: async () => {
		// Prevent multiple simultaneous refresh attempts
		if (get().checkingAuth) return;

		set({ checkingAuth: true });
		try {
			const response = await axios.post("/auth/refresh-token");
			set({ checkingAuth: false });
			return response.data;
		} catch (error) {
			set({ user: null, checkingAuth: false });
			throw error;
		}
	},
}));

/**
 * Axios interceptor for automatic token refresh
 * Implements queue mechanism to handle concurrent requests during refresh
 * Prevents token refresh race conditions
 */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
	failedQueue.forEach(prom => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve();
		}
	});
	failedQueue = [];
};

axios.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then(() => axios(originalRequest))
					.catch(err => Promise.reject(err));
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				await useUserStore.getState().refreshToken();
				processQueue(null);
				return axios(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError, null);
				useUserStore.getState().logout();
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}
		return Promise.reject(error);
	}
);
