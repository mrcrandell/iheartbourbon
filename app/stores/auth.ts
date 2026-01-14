import { defineStore } from "pinia";

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
  }),

  persist: true,

  getters: {
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    login(user: User, token?: string) {
      this.user = user;
      if (token) {
        this.token = token;
      }
    },
    setUser(user: User) {
      this.user = user;
    },
    setToken(token: string) {
      this.token = token;
    },
    logout() {
      this.user = null;
      this.token = null;
    },
  },
});
