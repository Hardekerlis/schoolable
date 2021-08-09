db.inventory.find( { tags: { \$all: ["red", "blank"] } } )
db.inventory.find( { tags: "red" } )


Is it locked/visible for user should be middleware

### Course
* Students need to be able to see courses assigned to them
* They need an owner
* They need a name
* Once a user has entered a course they should be presented with a custom menu for the course
* A course needs phases
* Is course finished for student (Checkmark to show this)
* End date for course. This should be visible for students and guardians
* Is it locked for student?
* Is it visible student
* Course overview once entered
* Cover picture. Kind of like icon (maybe)
* Course Page. Subdoc of Course. Fetched when in course

### CoursePage
* Subdocument of course
* Customizable menu

### Phase
* Subdocument of CoursePage
* Phase items (array)
* Is the phase unlocked for students. aka interactive or not
  * Date to be unlocked
* Is the phase hidden
  * Date to be visible
* End date of phase. (Some kind of icon to show this)
* Are all tasks/assignments finished in phase (Checkmark to show this to student)
* Name
* Unlocked after finishing or interacting with... This can be a link, task or phase

### Phase item
* Subdocument of Phase
* What happens when user right or left clicks
* Name
* Is it locked for user
* Is it visible for user
* Date to be unlocked on
* needs tasks/assignments
  * Different types of tasks. (quiz, text, sound, video)
  * links
  * Text
  * Embedded links. (Youtube videos, tweets (maybe), wikipedia pages, pdf, articles, etc)
* Completed icon (checkmark)
* Unlocked after finishing or interacting with... This can be a link or task
