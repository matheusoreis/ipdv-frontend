<script lang="ts" setup>
import DashboardHeader from "@/components/dashboard/DashboardHeader.vue";
</script>

<template>
  <v-app>
    <DashboardHeader />

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
