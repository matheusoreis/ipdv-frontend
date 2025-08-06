<script lang="ts" setup>
import AuthHeader from "@/components/AuthHeader.vue";
</script>

<template>
  <v-app>
    <AuthHeader />

    <v-main class="d-flex align-center justify-center">
      <router-view />
    </v-main>
  </v-app>
</template>
