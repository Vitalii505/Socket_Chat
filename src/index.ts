// import { io, Socket } from "socket.io-client";
// const socket: Socket = io("ws://bt-21-playground-vppfc.ondigitalocean.app/");
// socket.on("connect", () => {
//   socket.emit("send_message", "Hi");
//   socket.emit("get_users");
//   socket.on("users_list", console.log);
//   socket.on("name_error", console.error);
//   socket.emit("register", "Michael");
//   socket.on("registration_completed", () => {
//     console.log("I'm registered");
//     socket.emit("send_message", "Hi");
//   });
//   socket.on("new_user_connected", (socketId) => {
//     console.log(`${socketId} connected`);
//   });
//   socket.on("user_registered", (username, socketId) => {
//     console.log(`${socketId} registered as ${username}`);
//   });
//   socket.on("new_message", (message, socketId) => {
//     console.log(`Message from ${socketId}: ${message}`);
//   });
// });
 
import { io, Socket } from "socket.io-client";
const socket: Socket = io("ws://bt-21-playground-vppfc.ondigitalocean.app/");

export interface Users {
   key: string;
};


let arrayUsers: string[];

const btnRegistration = document.getElementById("btn_registration");
let registrationContent = document.getElementById("content-registration");

let userName: string;

btnRegistration?.addEventListener("click", () => {
   userName = (<HTMLInputElement>document.getElementById("recipient-name")).value;
   console.log(userName);
   registrationContent?.setAttribute("style", "display: none;")
});

socket.on("connect", () => {
   socket.on("users_list", (users: Users) => {
      arrayUsers = Object.keys(users);
      console.log(users);
      arrayUsers.forEach((key) => {
         const registrationUsersContainer = document.getElementById("registration_users");
         const allUsersContainer = document.getElementById("all_users");
         const getUser = document.createElement("p");
         getUser.classList.add("card-text");
         getUser.textContent = `User name: ${users[key]}`;
         allUsersContainer?.append(getUser);
         if (users[key] !== "Anonymous") {
            const getRegistrUser = document.createElement("p");
            getRegistrUser.classList.add("card-text");
            getRegistrUser.textContent = `User name: ${users[key]}`;
            registrationUsersContainer?.append(getRegistrUser);
         };
      }); 
   });
   socket.on("name_error", console.error);
   socket.emit("register", "Vitalii");
   socket.on("registration_completed", () => {
      console.log("I'm registered");
   });
   socket.emit("get_users", (user: string) => {
      console.log(user);
   });
   socket.on("new_user_connected", (socketId) => {
      console.log(`${socketId} connected`);
   });
   socket.on("user_registered", (username, socketId) => {
      console.log(`${socketId} registered as ${username}`);
   });
   socket.on("new_message", (message, socketId) => {
      sendMessage(socketId, message, false);
      console.log(`Message from ${socketId}: ${message}`);
   });
});

const sendMessage = (userName: string, massage: string, userComp: boolean): void => {
   const date = new Date();
   const divMassages = document.getElementById("div-massages");
   if (userComp) {
      const chatContainer = document.createElement("div");
      chatContainer.classList.add("d-flex", "flex-row", "p-3", "justify-content-end");
      const textMessage = document.createElement("div");
      textMessage.classList.add("chat", "ml-2", "p-3", "text-secondary");
      const userN = document.createElement("p");
      userN.classList.add("user_name_text");
      userN.textContent = userName + " :";
      const text = document.createElement("p");
      text.textContent = massage;
      divMassages?.append(chatContainer);
      chatContainer.append(textMessage);
      textMessage.append(userN, text);
      socket.emit("send_message", `${userName}`, `${text}`);
   } else {
      const chatContainer = document.createElement("div");
      chatContainer.classList.add("d-flex", "flex-row", "p-3");
      const img = document.createElement("img");
      img.src = "https://img.icons8.com/color/48/000000/circled-user-male-skin-type-7.png";
      img.setAttribute("width", "40");
      img.setAttribute("height", "40");
      const textMessage = document.createElement("div");
      textMessage.classList.add("chat", "ml-2", "p-3");
      const userN = document.createElement("p");
      userN.classList.add("user_name_text");
      userN.textContent = userName + " :";
      const text = document.createElement("p");
      text.textContent = massage;
      divMassages?.append(chatContainer);
      chatContainer.append(img, textMessage);
      textMessage.append(userN, text);
   }
};

const buttonSend = document.getElementById("btn_send");
buttonSend?.addEventListener("click", (event: Event) => {
   let input = <HTMLInputElement>document.getElementById("text_message");
   sendMessage(userName, input.value, true);
   socket.emit("send_message", `${userName}`, `${input.value}`);
   event.preventDefault();
   input.value = " ";
});

