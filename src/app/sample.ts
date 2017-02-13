export const SAMPLE_QUERY_SRC = `
fragment PersonInfo on Person {
  name
  steps
}

query myQuery($name: String) {
  allPeople {
    ...PersonInfo
  }
  person(name: $name) {
    ...PersonInfo
  }
}
`;

export const SAMPLE_VARIABLES_SRC = `
{
  "name": "Varby"
}
`;
