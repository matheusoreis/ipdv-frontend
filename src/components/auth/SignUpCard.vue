<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();

const isLoading = ref(false);
const errorMessage = ref("");

const name = ref("");
const email = ref("");
const password = ref("");
const rePassword = ref("");

async function handleSignUp() {
  isLoading.value = true;
  errorMessage.value = "";

  if (password.value !== rePassword.value) {
    errorMessage.value = "As senhas informadas estão inválidas.";
    isLoading.value = false;
    return;
  }

  if (
    !name.value.trim() ||
    !email.value.trim() ||
    !password.value ||
    !rePassword.value
  ) {
    errorMessage.value = "Preencha o nome, email a senha a repetição da senha.";
    isLoading.value = false;
    return;
  }

  console.log({
    name: name.value.trim(),
    email: email.value.trim(),
    password: password.value,
  });

  try {
    const res = await axios.post(
      "http://127.0.0.1:3001/api/auth/signup",
      {
        name: name.value.trim(),
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

    if (!data) {
      throw new Error("Resposta inválida do servidor.");
    }

    router.push("/auth/sign-in");
  } catch (error: any) {
    errorMessage.value = error.message || "Erro ao fazer login";
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
        <v-form @submit.prevent="handleSignUp">
          <v-text-field
            label="Nome"
            type="txt"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            v-model="name"
          />

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

          <v-text-field
            label="Repetir a Senha"
            type="password"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            v-model="rePassword"
          />

          <v-btn
            type="submit"
            color="secondary"
            rounded="lg"
            block
            elevation="0"
            :loading="isLoading"
          >
            Cadastrar
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
