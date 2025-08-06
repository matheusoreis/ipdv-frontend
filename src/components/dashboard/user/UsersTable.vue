<template>
  <v-card style="min-width: 600px">
    <v-data-table
      :headers="headers"
      :items="users"
      :loading="loading"
      loading-text="Carregando usuários..."
      class="elevation-0"
      :items-per-page="10"
      dense
    >
      <template #item.isActive="{ item }">
        <v-chip :color="item.isActive ? 'green' : 'red'" dark small>
          {{ item.isActive ? "Ativo" : "Inativo" }}
        </v-chip>
      </template>

      <template #item.roleName="{ item }">
        <span>{{ item.roleName || "Sem cargo" }}</span>
      </template>

      <template #item.actions="{ item }">
        <v-btn elevation="0" icon @click="openEditDialog(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <v-alert v-if="error" type="error" class="mt-4" dense>
      {{ error }}
    </v-alert>

    <!-- Dialog de Edição -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Editar Usuário</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <h4>{{ selectedUser?.name }}</h4>
                <p class="text-caption text-grey">{{ selectedUser?.email }}</p>
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="editForm.roleId"
                  :items="roles"
                  item-title="name"
                  item-value="id"
                  label="Cargo"
                  clearable
                  outlined
                  dense
                ></v-select>
              </v-col>

              <v-col cols="12">
                <v-switch
                  v-model="editForm.isActive"
                  :label="
                    editForm.isActive ? 'Usuário Ativo' : 'Usuário Inativo'
                  "
                  color="primary"
                ></v-switch>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeEditDialog">
            Cancelar
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="updateUser"
            :loading="updating"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";

interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  roleId: number;
  roleName: string;
}

interface Role {
  id: number;
  name: string;
}

const users = ref<User[]>([]);
const roles = ref<Role[]>([]);
const loading = ref(false);
const updating = ref(false);
const error = ref("");

const editDialog = ref(false);
const selectedUser = ref<User | null>(null);
const editForm = ref({
  roleId: null as number | null,
  isActive: true,
});

const token = localStorage.getItem("token") || "";

const headers = [
  { title: "ID", key: "id" },
  { title: "Nome", key: "name" },
  { title: "Email", key: "email" },
  { title: "Status", key: "isActive" },
  { title: "Cargo", key: "roleName" },
  { title: "Ações", key: "actions", sortable: false },
];

async function load() {
  loading.value = true;
  error.value = "";

  try {
    const res = await axios.get("http://127.0.0.1:3001/api/users", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
        "Content-Type": "application/json",
      },
    });
    users.value = res.data;
    console.log(users.value);
  } catch (err: any) {
    error.value =
      err?.response?.data?.error || err.message || "Erro ao carregar usuários.";
  } finally {
    loading.value = false;
  }
}

async function loadRoles() {
  try {
    const res = await axios.get("http://127.0.0.1:3001/api/roles", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
        "Content-Type": "application/json",
      },
    });
    roles.value = res.data;
  } catch (err) {
    console.error("Erro ao carregar cargos:", err);
    error.value = "Erro ao carregar lista de cargos.";
  }
}

function openEditDialog(user: User) {
  selectedUser.value = user;
  editForm.value = {
    roleId: user.roleId || null,
    isActive: user.isActive,
  };
  editDialog.value = true;
}

function closeEditDialog() {
  editDialog.value = false;
  selectedUser.value = null;
  editForm.value = {
    roleId: null,
    isActive: true,
  };
}

async function updateUser() {
  if (!selectedUser.value) return;

  updating.value = true;
  error.value = "";

  try {
    const updateData: any = {
      roleId: editForm.value.roleId,
      isActive: editForm.value.isActive,
      name: selectedUser.value.name,
      email: selectedUser.value.email,
    };

    await axios.patch(
      `http://127.0.0.1:3001/api/users/${selectedUser.value.id}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    const userIndex = users.value.findIndex(
      (u) => u.id === selectedUser.value!.id
    );
    if (userIndex !== -1) {
      users.value[userIndex] = {
        ...users.value[userIndex],
        roleId: editForm.value.roleId || 0,
        isActive: editForm.value.isActive,
        roleName:
          roles.value.find((r) => r.id === editForm.value.roleId)?.name ||
          "Sem cargo",
      };
    }

    closeEditDialog();
  } catch (err: any) {
    error.value =
      err?.response?.data?.error || err.message || "Erro ao atualizar usuário.";
  } finally {
    updating.value = false;
  }
}

onMounted(() => {
  load();
  loadRoles();
});
</script>
