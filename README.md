db.inventory.find( { tags: { \$all: ["red", "blank"] } } )
db.inventory.find( { tags: "red" } )
