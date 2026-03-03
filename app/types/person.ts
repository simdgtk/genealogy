export interface Person {
  _id: string;
  surname: string;
  name: string;
  birthDate: string;
  deathDate: string;
  gender: string;
  parent1Id: string | null;
  relativeId: string | null;
  mediaUrl: string | null;
}
