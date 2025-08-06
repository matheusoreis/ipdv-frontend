<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { useAuthStore } from "@/store/auth";

const router = useRouter();

const isLoading = ref(false);
const errorMessage = ref("");
const isUserDeactivated = ref(false);

const email = ref("");
const password = ref("");

const auth = useAuthStore();

function parseJwtExp(token: string): number | null {
  try {
    const base64Payload = token.split(".")[1];
    const payload = JSON.parse(atob(base64Payload));
    return payload.exp ?? null;
  } catch {
    return null;
  }
}

async function handleSignIn() {
  isLoading.value = true;
  errorMessage.value = "";
  isUserDeactivated.value = false;

  if (!email.value.trim() || !password.value) {
    errorMessage.value = "Preencha o email e a senha.";
    isLoading.value = false;
    return;
  }

  try {
    const res = await axios.post(
      "http://127.0.0.1:3001/api/auth/signin",
      {
        email: email.value.trim(),
        password: password.value,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 10000,
      }
    );

    const data = res.data;

    if (!data || !data.token) {
      throw new Error("Resposta inválida do servidor.");
    }

    console.log(data);

    const exp = parseJwtExp(data.token);

    auth.setToken(data.token);
    router.push("/dashboard");
  } catch (error: any) {
    // Isso aqui não se deve fazer, o correto é fazer como fiz no backend que é tirar um Error e pegar a partir do typeof;
    // Porém para ficar dentro do prazo, estou fazendo harded coded.
    if (error.response?.data?.error === "Usuário está desativado!") {
      isUserDeactivated.value = true;
      errorMessage.value =
        "Sua conta foi desativada. Entre em contato com o administrador do sistema.";
    } else {
      errorMessage.value =
        error.response?.data?.error || error.message || "Erro ao fazer login";
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="login-container">
    <v-card class="login-card" elevation="2">
      <v-card-title class="justify-center pb-2">
        <v-img src="/logo.png" />
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="handleSignIn">
          <v-text-field
            label="Email"
            type="email"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            v-model="email"
          />

          <v-text-field
            label="Senha"
            type="password"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            v-model="password"
          />

          <v-btn
            type="submit"
            color="secondary"
            rounded="lg"
            block
            elevation="0"
            :loading="isLoading"
          >
            Entrar
          </v-btn>

          <p v-if="errorMessage" class="text-red text-sm mt-2">
            {{ errorMessage }}
          </p>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.login-card {
  min-width: 300px;
  width: 100%;
  border-radius: 1rem;
  padding: 1rem;
}
</style>
