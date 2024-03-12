# Any Chat Project

Real-time application that allows users to message each other.

![Any Chat Project preview image](https://github.com/elise-bigdevsoon/big-dev-soon-any-chat/blob/main/project-preview.png?raw=true)

Create code that matters! 🤩

## Project brief

Dive into the realm of **Any Chat**, a real-time messaging platform that connects users in an instant digital conversation. With intuitive onboarding, this application offers a smooth and interactive chat experience, merging traditional chat dynamics with contemporary design and functionality.

### What you will learn

- **Real-time Server Integration**: Navigate the intricacies of setting up a Node.js server, using technologies like socket.io and express.js. Understand the complexities of managing real-time data flow between frontend and backend.

- **Intuitive UI/UX Design**: Start with an engaging onboarding process and transition through user validation and chat initiation. Master the art of presenting information attractively, catering to both new and returning users.

- **Dynamic Chat Features**: From displaying online user counts to incorporating emoji libraries and managing chat messages, gain firsthand experience in developing features that enhance user engagement and communication.

- **Error Handling**: Ensure the app's resilience by handling user actions like browser refreshes, chat disconnections, or new connections. Grasp the significance of a seamless experience even in unexpected scenarios.

### Requirements

- Create an onboarding page that includes a logo, a title, and a "Get Started" button. The page should feature a split-view layout with two columns. The right column should have a different background and display an image of a hand holding a phone.
- Navigate the user to a centered page with the logo after clicking the "Get Started" button. On this page, users should be able to enter a nickname for the chat. The nickname should be validated to ensure it is between 4 and 60 characters in length. The "Join Chat" button should only be clickable when the nickname is properly validated. Clicking the button should move the user to the main chat page.
- Set up a simple Node.js server using this [tutorial](https://socket.io/get-started/chat). Integrate the server with both the frontend and backend using socket.io and express.js. Keep track of connected users in an array and messages in an array of objects.
- Enhance the main chat page with a header that displays the logo and the number of online users. Retrieve this information from the connected user's array on the Node.js server.
- Create a chat window as the main content of the main chat page. The chat window should occupy most of the page and display messages from top to bottom. Implement scrolling when the messages exceed the height of the chat window. For now, you can mock the messages.
- Add a footer section to the main chat page. The footer should include an emoji icon on the left, a text input with a placeholder of "Send a message...", and a disabled send icon.
- Allow users to send messages by enabling the send icon when at least one character is entered in the text input. Limit the message length to a maximum of 1000 characters (or more). After sending a message, display its content, the nickname (displayed as "You" for the sender or the user's nickname for others), the date in the format "hh:mm", and the position of the message (your messages on the right, other user messages on the left). Store the messages on the Node.js server and render them in the chat window from top (oldest) to bottom (newest).
- Integrate an external library to add emoji support, allowing users to incorporate emojis into their messages by clicking the emoji icon.
- When a user connects or disconnects, send a system message in the middle of the chat. Merge these system messages with other messages based on the sending date and time. Update the online user counter in the header accordingly.
- Handle edge cases when users refresh the browser to ensure they are redirected to the appropriate page based on their connection status (main chat page when connected, onboarding page when disconnected, or connecting for the first time). Improve the overall user experience and user interface of the chat application. Additionally, ensure all other edge cases are handled properly.

Happy coding! 🚀
