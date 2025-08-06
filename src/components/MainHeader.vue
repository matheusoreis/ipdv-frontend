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
  </v-app-bar>
</template>

<script lang="ts" setup>
const menus = [
  {
    title: "Acessar",
    href: "/auth/sign-in",
  },
  {
    title: "Cadastrar",
    href: "/auth/sign-up",
  },
] as const;
</script>
