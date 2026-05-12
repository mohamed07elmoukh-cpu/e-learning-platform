export const endpoints = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    me: "/auth/me",
    profile: "/auth/profile",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password"
  },
  courses: {
    list: "/courses",
    details: (id: string) => `/courses/${encodeURIComponent(id)}`
  }
};

