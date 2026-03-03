<template class="section">
  <div class="page-container">
    <h1>Votre famille</h1>
    <span v-if="persons.length === 0">{{ texts.ancestor }}</span>

    <div class="split-layout">
      <section class="form-section">
        <h2>{{ selectedPerson ? 'Modifier une personne' : 'Ajouter une personne' }}</h2>
        <PersonForm :persons="persons" :person="selectedPerson" @submit="handleSavePerson"
          @cancel="selectedPerson = null" />
      </section>

      <section class="list-section">
        <h2>Personnes actuelles</h2>
        <PersonList :persons="persons" @delete="handleDeletePerson" @edit="handleEditPerson" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import PersonForm from "~/components/PersonForm.vue";
import PersonList from "~/components/PersonList.vue";
import type { Person } from "~/types/person";

const texts = {
  ancestor: "Ajouter l'ancêtre",
  deleteAncestor: "Supprimer l'ancêtre",
  person: "Ajouter un enfant",
  deletePerson: "Supprimer l'enfant",
  relative: "Ajouter un proche",
  deleteRelative: "Supprimer le proche"
};

const persons = ref<Person[]>(await $fetch<Person[]>("/api/persons") || []);

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
      persons.value = await $fetch<Person[]>("/api/persons") || [];
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

<style scoped>
.page-container {
  /* background-color: #E3E4DD; */
  color: #000;
  font-family: sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.split-layout {
  display: flex;
  gap: 4rem;
  margin-top: 2rem;
}

.form-section {
  flex: 1;
}

.list-section {
  flex: 1;
}
</style>