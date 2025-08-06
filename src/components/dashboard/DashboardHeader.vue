<template>
  <v-app-bar app color="primary">
    <v-app-bar-title>
      <v-img
        :width="180"
        src="https://www.ipdvonline.com.br/wp-content/uploads/2024/11/logo-ipdv-15-branca.svg"
      />
    </v-app-bar-title>

    <v-btn
      v-for="menu in menus"
      :key="menu.href"
      :to="menu.href"
      text
      class="mx-2"
      color="secondary"
      variant="flat"
    >
      {{ menu.title }}
    </v-btn>

    <v-spacer></v-spacer>

    <v-btn
      @click="logout"
      text
      color="secondary"
      variant="flat"
      prepend-icon="mdi-logout"
    >
      Sair
    </v-btn>
  </v-app-bar>
</template>

<script lang="ts" setup>
import { useAuthStore } from "@/store/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const menus = [
  {
    title: "Home",
    description: "Ir para a dashboard do sistema.",
    href: "/dashboard",
  },

  {
    title: "Usuários",
    description: "Gerência dos usuários do sistema.",
    href: "/dashboard/users",
  },
  {
    title: "Cargos",
    description: "Gerência dos cargos do sistema.",
    href: "/dashboard/roles",
  },
] as const;

function logout() {
  auth.clearToken();
  router.push("/");
}
</script>
