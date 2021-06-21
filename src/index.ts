import { io, Socket } from "socket.io-client";
const socket: Socket = io("ws://bt-21-playground-vppfc.ondigitalocean.app/");

export interface Users {
   [key: string]: string;
};

export interface Rooms {
   id: string;
   title: string;
};

let arrayUsers: Users;

let allRooms: [];

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
      arrayUsers = users
      const usersList = Object.keys(users);
      console.log(users);
      usersList.forEach((key) => {
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
      // const userN = document.createElement("p");
      // userN.classList.add("user_name_text");
      // userN.textContent = userName + " :";
      const text = document.createElement("p");
      text.textContent = massage;
      divMassages?.append(chatContainer);
      chatContainer.append(textMessage);
      textMessage.append(text);
      socket.emit("send_message", `${userName}, ${text}`);
   } else {
      const chatContainer = document.createElement("div");
      chatContainer.classList.add("d-flex", "flex-row", "p-3");
      const img = document.createElement("img");
      img.src = "https://img.icons8.com/color/48/000000/circled-user-male-skin-type-7.png";
      img.setAttribute("width", "40");
      img.setAttribute("height", "40");
      const textMessage = document.createElement("div");
      textMessage.classList.add("chat", "ml-2", "p-3");
      // const userN = document.createElement("p");
      // userN.classList.add("user_name_text");
      // userN.textContent = userName + " :";
      const text = document.createElement("p");
      text.textContent = massage;
      divMassages?.append(chatContainer);
      chatContainer.append(img, textMessage);
      textMessage.append(text);
   }
};

const buttonSend = document.getElementById("btn_send");
buttonSend?.addEventListener("click", (event: Event) => {
   let input = <HTMLInputElement>document.getElementById("text_message");
   sendMessage(userName, input.value, true);
   socket.emit("send_message", `${userName}, ${input.value}`);
   event.preventDefault();
   input.value = " ";
});



async function GetRooms() {
   let response = await fetch("https://bt-21-playground-vppfc.ondigitalocean.app/rooms");
   if (response.ok) {
      allRooms = await response.json();
      const roomsList = document.getElementById("rooms-list");
      allRooms.forEach((elem: Rooms) => {
         console.log(elem.title);
         const nameRoom = document.createElement("div");
         nameRoom.classList.add("name-room", "p-4");
         nameRoom.textContent = elem.title;
         roomsList?.append(nameRoom);
      });
   } else {
         alert("Ошибка HTTP: " + response.status);
      }
}
GetRooms();




interface IObserver {
    notify(): void;
}
interface IEvent {
    trigger(): void;
    subscribe(observer: IObserver): void
}
class UsersUpdatedEvent implements IEvent {
    private _subscribers: IObserver[] = []
    trigger() {
        this._subscribers.forEach(s => s.notify())
    }
    subscribe(observer: IObserver) {
        this._subscribers.push(observer)
    }
}
class User {
    private _firstName: string;
    private _lastName: string;
    private _nickname: string;
    constructor(firstName: string, lastName: string, nickname: string) {
        this._firstName = firstName;
        this._lastName = lastName;
        this._nickname = nickname;
    }
    get name(): string {
        return `${this._firstName} "${this._nickname}" ${this._lastName}`
    }
}
class UserList {
    private _userList: User[] = []
    private _usersUpdatedEvent: UsersUpdatedEvent;
    constructor(usersUpdatedEvent: UsersUpdatedEvent) {
        this._usersUpdatedEvent = usersUpdatedEvent
    }
    add(newUser: User) {
        this._userList.push(newUser)
        this._usersUpdatedEvent.trigger()
    }
    get users(): User[] {
        return [...this._userList]
    }
}
class UsersView implements IObserver {
    private _usersList: UserList
    constructor(usersList: UserList, usersUpdatedEvent: UsersUpdatedEvent) {
        this._usersList = usersList;
        usersUpdatedEvent.subscribe(this)
    }
    render() {
        this._usersList.users.forEach(user => console.log(user.name))
    }
    notify() {
        this.render()
    }
}
const user1 = new User('User1', 'LastName1', 'nickname 1')
const user2 = new User('User2', 'LastName2', 'nickname 2')
const usersUpdatedEvent = new UsersUpdatedEvent()
const usersList = new UserList(usersUpdatedEvent);
usersList.add(user1)
usersList.add(user2)
const usersView = new UsersView(usersList, usersUpdatedEvent)
usersList.add(new User('John', 'Doe', 'The Killer'))
