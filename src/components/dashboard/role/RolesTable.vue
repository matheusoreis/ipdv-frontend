<template>
  <v-card style="min-width: 600px">
    <v-card-title class="d-flex justify-end align-center">
      <v-btn color="primary" @click="openCreateDialog">
        <v-icon left>mdi-plus</v-icon>
        Novo Cargo
      </v-btn>
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="roles"
      :loading="loading"
      loading-text="Carregando cargos..."
      class="elevation-0"
      :items-per-page="10"
      dense
    >
      <template #item.description="{ item }">
        <span>{{ item.description || "Sem descrição" }}</span>
      </template>

      <template #item.actions="{ item }">
        <v-btn elevation="0" icon @click="openEditDialog(item)" class="mr-2">
          <v-icon color="blue">mdi-pencil</v-icon>
        </v-btn>
        <v-btn elevation="0" icon @click="openDeleteDialog(item)">
          <v-icon color="red">mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <v-alert v-if="error" type="error" class="mt-4" dense>
      {{ error }}
    </v-alert>

    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{
            isEditing ? "Editar Cargo" : "Novo Cargo"
          }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editForm.name"
                  label="Nome do Cargo*"
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Nome é obrigatório']"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="editForm.description"
                  label="Descrição"
                  outlined
                  dense
                  rows="3"
                  auto-grow
                ></v-textarea>
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
            @click="saveRole"
            :loading="saving"
            :disabled="!editForm.name"
          >
            {{ isEditing ? "Atualizar" : "Criar" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-text>
          <v-alert type="warning" dense class="mt-2">
            Esta ação não pode ser desfeita!
          </v-alert>
          <br />

          Tem certeza que deseja excluir o cargo "<strong>{{
            selectedRole?.name
          }}</strong
          >"?
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDeleteDialog">
            Cancelar
          </v-btn>
          <v-btn
            color="red darken-1"
            text
            @click="deleteRole"
            :loading="deleting"
          >
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import axios from "axios";

interface Role {
  id: number;
  name: string;
  description?: string;
}

const roles = ref<Role[]>([]);
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const error = ref("");

const editDialog = ref(false);
const deleteDialog = ref(false);
const selectedRole = ref<Role | null>(null);
const editForm = ref({
  name: "",
  description: "",
});

const token = localStorage.getItem("token") || "";

const headers = [
  { title: "ID", key: "id" },
  { title: "Nome", key: "name" },
  { title: "Descrição", key: "description" },
  { title: "Ações", key: "actions", sortable: false },
];

const isEditing = computed(() => selectedRole.value !== null);

async function loadRoles() {
  loading.value = true;
  error.value = "";

  try {
    const res = await axios.get("http://127.0.0.1:3001/api/roles", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
        "Content-Type": "application/json",
      },
    });
    roles.value = res.data;
    console.log(roles.value);
  } catch (err: any) {
    error.value =
      err?.response?.data?.error || err.message || "Erro ao carregar cargos.";
  } finally {
    loading.value = false;
  }
}

function openCreateDialog() {
  selectedRole.value = null;
  editForm.value = {
    name: "",
    description: "",
  };
  editDialog.value = true;
}

function openEditDialog(role: Role) {
  selectedRole.value = role;
  editForm.value = {
    name: role.name,
    description: role.description || "",
  };
  editDialog.value = true;
}

function closeEditDialog() {
  editDialog.value = false;
  selectedRole.value = null;
  editForm.value = {
    name: "",
    description: "",
  };
}

function openDeleteDialog(role: Role) {
  selectedRole.value = role;
  deleteDialog.value = true;
}

function closeDeleteDialog() {
  deleteDialog.value = false;
  selectedRole.value = null;
}

async function saveRole() {
  if (!editForm.value.name.trim()) return;

  saving.value = true;
  error.value = "";

  try {
    const roleData = {
      name: editForm.value.name.trim(),
      description: editForm.value.description.trim() || undefined,
    };

    if (isEditing.value && selectedRole.value) {
      await axios.patch(
        `http://127.0.0.1:3001/api/roles/${selectedRole.value.id}`,
        roleData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      const roleIndex = roles.value.findIndex(
        (r) => r.id === selectedRole.value!.id
      );
      if (roleIndex !== -1) {
        roles.value[roleIndex] = {
          ...roles.value[roleIndex],
          ...roleData,
        };
      }
    } else {
      const res = await axios.post(
        "http://127.0.0.1:3001/api/roles",
        roleData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      roles.value.push(res.data);
    }

    closeEditDialog();
  } catch (err: any) {
    error.value =
      err?.response?.data?.error || err.message || "Erro ao salvar cargo.";
  } finally {
    saving.value = false;
  }
}

async function deleteRole() {
  if (!selectedRole.value) return;

  deleting.value = true;
  error.value = "";

  try {
    await axios.delete(
      `http://127.0.0.1:3001/api/roles/${selectedRole.value.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "*/*",
        },
      }
    );

    roles.value = roles.value.filter((r) => r.id !== selectedRole.value!.id);

    closeDeleteDialog();
  } catch (err: any) {
    error.value =
      err?.response?.data?.error || err.message || "Erro ao excluir cargo.";
  } finally {
    deleting.value = false;
  }
}

onMounted(loadRoles);
</script>
