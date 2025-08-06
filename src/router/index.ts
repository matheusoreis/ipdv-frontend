import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router/auto";

import MainLayout from "@/layouts/MainLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout.vue";

import HomePage from "@/pages/index.vue";
import SignInPage from "@/pages/auth/sign-in.vue";
import SignUpPage from "@/pages/auth/sign-up.vue";
import DashboardPage from "@/pages/dashboard/index.vue";
import DashboardUsers from "@/pages/dashboard/users/index.vue";
import DashboardRoles from "@/pages/dashboard/roles/index.vue";
import { useAuthStore } from "@/store/auth";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: MainLayout,
    children: [
      {
        path: "",
        name: "Home",
        component: HomePage,
      },
    ],
  },
  {
    path: "/auth",
    component: AuthLayout,
    children: [
      {
        path: "sign-in",
        name: "SignIn",
        component: SignInPage,
      },
      {
        path: "sign-up",
        name: "SignUp",
        component: SignUpPage,
      },
    ],
  },
  {
    path: "/dashboard",
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "DashboardHome",
        component: DashboardPage,
      },
      {
        path: "users",
        name: "DashboardUsers",
        component: DashboardUsers,
      },
      {
        path: "roles",
        name: "DashboardRoles",
        component: DashboardRoles,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isTokenValid) {
    return "/auth/sign-in";
  }
});

router.onError((err, to) => {
  if (err?.message?.includes?.("Failed to fetch dynamically imported module")) {
    if (localStorage.getItem("vuetify:dynamic-reload")) {
      console.error("Dynamic import error, reloading page did not fix it", err);
    } else {
      console.log("Reloading page to fix dynamic import error");
      localStorage.setItem("vuetify:dynamic-reload", "true");
      location.assign(to.fullPath);
    }
  } else {
    console.error(err);
  }
});

router.isReady().then(() => {
  localStorage.removeItem("vuetify:dynamic-reload");
});

export default router;
