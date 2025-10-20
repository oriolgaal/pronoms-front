This file should be shared between front and back teams. 
Don't edit this file. It is read only.

Rules that should always apply:

- To start a new game the front calls /api/new and gets the session id and the next sentence
- To check a user attempt the front makes a post request to /api/check/ with the session id and the sentence info
- The back checks the sentence and returns result to the front. If the check passes it also includes the next sentence
- A call to check should include the number of attempts. If the check is correct the backend should save the session sentence and attempts in a table.
- After a correct check the front shows a it's correct message with a button to advance to the next sentence, if it exists.
- After a correct check to the 5th sentence intead of a next sentence button it should be a message that says that's all for today come tomorrow for new sentences. And a button to restart the game that calls to /api/new/
- A user can retry indefinitely. The front should keep track of the number of attempts for the current sentence and add the info to the check calls 