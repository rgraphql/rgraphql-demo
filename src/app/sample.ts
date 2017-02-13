export const SAMPLE_QUERY_SRC = `
# Welcome to rGraphiQL!
#
# GraphiQL is an in-browser tool for writing, validating, and
# testing GraphQL queries. This version has been modified to use
# rGraphQL's Soyuz client. Your queries are interpreted and executed
# in real-time.
#
# Your browser will connect to a Go server running Magellan, which
# responds to your real-time queries with live data. Note the "steps"
# field is incrementing over time - this is done on the server.
#
# The source code is available at the "GitHub Source" button above. Enjoy!
#
# Keyboard shortcuts:
#
#   Auto Complete:  Ctrl-Space (or just start typing)
#

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
