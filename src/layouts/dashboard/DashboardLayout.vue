<script lang="ts" setup>
import DashboardHeader from "@/components/dashboard/DashboardHeader.vue";
</script>

<template>
  <v-app>
    <DashboardHeader />

    <v-main>
      <v-container fluid class="pa-8">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>
