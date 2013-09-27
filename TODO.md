# TODOs: 

- src/broker.js: Take host header into consideration.
- src/broker.js: Remove temporary hack once https://github.com/gdaws/node-stomp/pull/5 is implemented.
- src/frameutil.js: Should allow for adding to a buffer if a Frame is incomplete.
- src/frameutil.js: Allow for content-length in the buildBuffer.
- src/frameutil.js: Should raise fatal error on undefined escape sequences.
- src/middleware/stomp12.js: Need to allow adding to a buffer for a session before we can implement this.
- test/frameutil.js: More tests! 
- test/stringbuffer.js: Test with different encodings.
