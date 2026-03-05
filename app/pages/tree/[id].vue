<template>
  <div class="genealogy-auth">
    <header class="genealogy-header">
      <div class="header-left">
        <NuxtLink to="/dashboard" class="nav-btn">← Tableau de bord</NuxtLink>
      </div>
      <nav class="genealogy-nav">
        <NuxtLink :to="`/famille/${familyId}`" class="btn-genealogy-primary">Voir l'arbre</NuxtLink>
      </nav>
    </header>

    <main class="genealogy-content">
      <div class="auth-box wide-box">
        <div class="auth-stage">
          <h2>Gestion de la famille</h2>
          <p class="subtitle">Gérez les membres de cette famille</p>
        </div>

        <div class="split-layout">
          <section class="auth-grid form-section">
            <h3 class="section-title">{{ selectedPerson ? 'Modifier une personne' : 'Ajouter une personne' }}</h3>
            <span v-if="persons.length === 0" class="ancestor-message">{{ texts.ancestor }}</span>
            <PersonForm :persons="persons" :person="selectedPerson" @submit="handleSavePerson"
              @cancel="selectedPerson = null" />
          </section>

          <section class="auth-grid list-section">
            <h3 class="section-title">Personnes actuelles</h3>
            <PersonList :persons="persons" @delete="handleDeletePerson" @edit="handleEditPerson" />
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import PersonForm from "~/components/PersonForm.vue";
import PersonList from "~/components/PersonList.vue";
import type { Person } from "~/types/person";

const route = useRoute();
const familyId = route.params.id as string;

if (!familyId) {
  navigateTo("/dashboard");
}

const texts = {
  ancestor: "Ajouter l'ancêtre",
  deleteAncestor: "Supprimer l'ancêtre",
  person: "Ajouter un enfant",
  deletePerson: "Supprimer l'enfant",
  relative: "Ajouter un proche",
  deleteRelative: "Supprimer le proche"
};

const persons = ref<Person[]>(await $fetch<Person[]>(`/api/persons?familyId=${familyId}`) || []);

const selectedPerson = ref<Person | null>(null);

const handleEditPerson = (person: Person) => {
  selectedPerson.value = person;
};

const handleSavePerson = async (personData: any) => {
  try {
    const formData = new FormData();

    if (personData.surname) formData.append("surname", personData.surname);
    if (personData.name) formData.append("name", personData.name);
    if (personData.birthDate) formData.append("birthDate", personData.birthDate);
    if (personData.deathDate) formData.append("deathDate", personData.deathDate);
    if (personData.gender) formData.append("gender", personData.gender);
    if (personData.parent1Id) formData.append("parent1Id", String(personData.parent1Id));
    formData.append("familyId", familyId);

    if (personData.image) {
      formData.append("image", personData.image);
    }

    let result: Person;
    if (selectedPerson.value?._id) {
      formData.append("id", selectedPerson.value._id);
      result = await $fetch<Person>("/api/person", {
        method: "PUT",
        body: formData,
      });
    } else {
      result = await $fetch<Person>("/api/person", {
        method: "POST",
        body: formData,
      });
    }

    if (result) {
      if (selectedPerson.value) {
        const index = persons.value.findIndex(p => p._id === result._id);
        if (index !== -1) {
          persons.value[index] = result;
        }
      } else {
        persons.value.push(result);
      }
    } else {
      persons.value = await $fetch<Person[]>(`/api/persons?familyId=${familyId}`) || [];
    }

    selectedPerson.value = null;
  } catch (err) {
    console.error("Error saving person:", err);
  }
};

const handleDeletePerson = async (id: string) => {
  try {
    await $fetch(`/api/person`, {
      method: "DELETE",
      body: { id },
    });
    persons.value = persons.value.filter((person: Person) => person._id !== id);
  } catch (err) {
    console.error("Error deleting person:", err);
  }
};
</script>

<style lang="scss" scoped>
.genealogy-auth {
  background-color: $color-bg;
  color: $color-text;
  font-family: $font-sans;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.genealogy-header {
  height: toRem(64);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 toRem(40);
  border-bottom: 1px solid $color-border;
  background: $color-bg;
}

.nav-btn {
  background: transparent;
  border: 1px solid $color-border;
  padding: toRem(8) toRem(16);
  font-size: toRem(11);
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  color: $color-text;
  transition: background 0.2s;
    height: fit-content;
}

.nav-btn:hover {
  background: $color-surface;
}

.btn-genealogy-primary {
  padding: toRem(8) toRem(16);
  background: $color-accent;
  color: $color-surface;
  border: 1px solid $color-border;
  font-size: toRem(11);
  font-weight: 800;
  letter-spacing: 0.05em;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.1s;
}

.btn-genealogy-primary:hover {
  filter: brightness(1.1);
}

.genealogy-content {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: toRem(40);
}

.auth-box {
  width: 100%;
}

.wide-box {
  max-width: toRem(1200);
}

.auth-stage {
  margin-bottom: toRem(48);
  text-align: center;
}

.auth-stage h2 {
  font-size: toRem(48);
  letter-spacing: -0.04em;
  margin: 0;
  line-height: 1;
}

.subtitle {
  font-size: toRem(16);
  color: $color-muted;
  margin-top: toRem(12);
}

.split-layout {
  display: flex;
  gap: toRem(32);
  align-items: flex-start;
}

.auth-grid {
  background: $color-surface;
  border: 1px solid $color-border;
  padding: toRem(40);
}

.form-section {
  flex: 1;
  position: sticky;
  top: toRem(40);
}

.list-section {
  flex: 2;
}

.section-title {
  font-size: toRem(24);
  margin-top: 0;
  margin-bottom: toRem(24);
  letter-spacing: -0.02em;
}

.ancestor-message {
  display: block;
  font-family: $font-mono;
  font-size: toRem(12);
  color: $color-accent;
  margin-bottom: toRem(24);
}

* {
  border-radius: 0 !important;
}

@media (max-width: toRem(900)) {
  .split-layout {
    flex-direction: column;
  }

  .form-section {
    position: static;
  }
}
</style>
