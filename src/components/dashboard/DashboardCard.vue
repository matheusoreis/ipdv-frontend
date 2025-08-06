<template>
  <div class="dashboard-cards">
    <v-row dense>
      <v-col cols="12" md="4">
        <v-card class="pa-4">
          <div class="card-header">Usuários</div>
          <div class="card-body">
            <v-skeleton-loader v-if="loading" type="heading" />
            <div v-else class="stat-value">{{ counts.users }}</div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4">
          <div class="card-header">Usuários desativados</div>
          <div class="card-body">
            <v-skeleton-loader v-if="loading" type="heading" />
            <div v-else class="stat-value">{{ counts.disabledUsers }}</div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4">
          <div class="card-header">Cargos</div>
          <div class="card-body">
            <v-skeleton-loader v-if="loading" type="heading" />
            <div v-else class="stat-value">{{ counts.roles }}</div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-alert v-if="error" type="error" class="mt-4">
      {{ error }}
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { useAuthStore } from "@/store/auth";

const auth = useAuthStore();

const loading = ref(false);
const error = ref("");
const counts = ref({
  users: 0,
  disabledUsers: 0,
  roles: 0,
});

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const headers = {
      Authorization: `Bearer ${auth.token}`,
      Accept: "application/json",
    };

    const [usersRes, rolesRes] = await Promise.all([
      axios.get("http://127.0.0.1:3001/api/users", { headers }),
      axios.get("http://127.0.0.1:3001/api/roles", { headers }),
    ]);

    const users = usersRes.data;
    const roles = rolesRes.data;

    counts.value.users = users.length;
    counts.value.roles = roles.length;

    counts.value.disabledUsers = users.filter((u: any) => {
      if (typeof u.active === "boolean") return !u.active;
      if (typeof u.enabled === "number") return u.enabled === 0;
      if (typeof u.status === "string")
        return ["disabled", "inactive", "blocked"].includes(
          u.status.toLowerCase()
        );
      if (u.deletedAt) return true;
      return false;
    }).length;
  } catch (err: any) {
    error.value =
      err?.response?.data?.error ||
      err.message ||
      "Erro ao carregar indicadores.";
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.dashboard-cards {
  width: 100%;
}
.card-header {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}
.card-body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.stat-value {
  font-size: 2rem;
  font-weight: 700;
}
.stat-sub {
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.85rem;
}
</style>
