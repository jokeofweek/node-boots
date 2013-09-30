# TODOs: 

- src/broker.js: Take host header into consideration.
- src/broker.js: Remove temporary hack once https://github.com/gdaws/node-stomp/pull/5 is implemented.
- src/frame.js: Add a getHeader(key) method.
- src/frameutil.js: Allow for content-length in the buildBuffer.
- src/frameutil.js: Should raise fatal error on undefined escape sequences.
- src/middleware/stomp12.js: Move subscriptions to broker.
- test/frameutil.js: More tests! 
- test/stringbuffer.js: Test with different encodings.
