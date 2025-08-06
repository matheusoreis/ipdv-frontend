<script lang="ts" setup>
import MainHeader from "@/components/MainHeader.vue";
</script>

<template>
  <v-app>
    <MainHeader />

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
