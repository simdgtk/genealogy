<template>
  <div>
    <span v-if="persons.length === 0">{{ texts.ancestor }}</span>
    <form @submit.prevent="addPerson">
      <label>Surname</label>
      <input type="text" v-model="surname" placeholder="Surname" />
      <label>Name</label>
      <input type="text" v-model="name" placeholder="Name" />
      <label>Birth Date</label>
      <input type="date" v-model="birthDate" placeholder="Birth Date" />
      <label>Death Date</label>
      <input type="date" v-model="deathDate" placeholder="Death Date" />
      <label>Gender</label>
      <select v-model="gender">
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other / Unknown / Not specified</option>
      </select>
      <button type="submit">Add Person</button>
    </form>

    <div v-for="person in persons" :key="person._id">
      {{ person.surname }} {{ person.name }}
      <button @click="deletePerson(person._id)">Delete</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const texts = {
  ancestor: "Add the ancestor",
  deleteAncestor: "Delete the ancestor",
  person: "Add a child",
  deletePerson: "Delete the child",
  relative: "Add a relative",
  deleteRelative: "Delete the relative"
};

const surname = ref("");
const name = ref("");
const birthDate = ref(new Date());
const deathDate = ref(new Date());
const gender = ref("");
const persons = ref<Person[]>(await $fetch<Person[]>("/api/persons") || []);

interface Person {
  _id: string;
  surname: string;
  name: string;
  birthDate: Date;
  deathDate: Date;
  gender: string;
  parent1Id: string;
  parent2Id: string;
  relativeId: string;
}

const addPerson = async () => {
  await $fetch("/api/person", {
    method: "POST",
    body: {
      surname: surname.value,
      name: name.value,
      birthDate: birthDate.value,
      deathDate: deathDate.value,
      gender: gender.value,
      parent1Id: null,
      parent2Id: null,
      relativeId: null,
    },
  });
};

const deletePerson = async (id: string) => {
  await $fetch(`/api/person`, {
    method: "DELETE",
    body: { id },
  });
  persons.value = persons.value.filter((person: Person) => person._id !== id);
};

</script>

<style lang="scss" scoped></style>