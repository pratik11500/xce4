import Layout from "@/components/Layout";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import styles from "./Home.module.css";

export default function Home() {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [userDetails, setUserDetails] = useState({}); // To store user details by email
  const messagesEndRef = useRef(null); // Ref to the end of the messages container

  // Fetch messages from the API when the component mounts and every 1 second
  useEffect(() => {
    let intervalId;

    const fetchMessages = async () => {
      try {
        const response = await fetch("/api/messages");
        if (response.ok) {
          const data = await response.json();
          setMessages(data);

          // Fetch user details for each message
          const emailSet = new Set(data.map((msg) => msg.email));
          for (const email of emailSet) {
            if (email) {
              const userResponse = await fetch(`/api/user?email=${email}`);
              if (userResponse.ok) {
                const userData = await userResponse.json();
                setUserDetails((prevDetails) => ({
                  ...prevDetails,
                  [email]: {
                    name: userData.name,
                    image: userData.image,
                  },
                }));
              }
            }
          }
        } else {
          console.error("Failed to fetch messages");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    // Initial fetch
    fetchMessages();

    // Set interval to fetch messages every 1 second
    intervalId = setInterval(fetchMessages, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this effect runs once when the component mounts

   useEffect(() => {
     const intervalId = setInterval(() => {
       if (messagesEndRef.current) {
         messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
       }
     }, 3000); // Scroll every 3 seconds

     return () => clearInterval(intervalId); // Clean up interval on component unmount
   }, []);

  const handleSendMessage = async () => {
    if (message.trim() !== "") {
      try {
        const response = await fetch("/api/send-message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: session?.user?.email,
            message,
          }),
        });

        if (response.ok) {
          const newMessage = {
            email: session?.user?.email,
            message,
            timestamp: new Date().toISOString(),
          };
          setMessages([...messages, newMessage]);
          setMessage("");

          const userResponse = await fetch(
            `/api/user?email=${session?.user?.email}`
          );
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUserDetails((prevDetails) => ({
              ...prevDetails,
              [session?.user?.email]: {
                name: userData.name,
                image: userData.image,
              },
            }));
          }
        } else {
          console.error("Failed to send message");
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  return (
    <Layout>
      <Head>
        <title>Chat Page</title>
      </Head>

      <div className={styles.container}>
        <div>
          <div className={styles.message}>
            <img
              src={session?.user?.image || "/avatardefault.webp"}
              alt={"User"}
              className={styles.userImage}
            />
            <strong>Signed in as "{session?.user?.name}"</strong>
          </div>
        </div>

        <div className={styles.chatContainer}>
          <div className={styles.messages}>
            {messages.map((msg, index) => (
              <div key={index} className={styles.message}>
                <img
                  src={userDetails[msg.email]?.image || "/avatardefault.webp"}
                  alt={userDetails[msg.email]?.name || "User"}
                  className={styles.userImage}
                />
                <strong>
                  {userDetails[msg.email]?.name || msg.email}
                  {msg.email === session?.user?.email ? " (You)" : ""}
                </strong>
                : {msg.message}
              </div>
            ))}
            <div ref={messagesEndRef} />{" "}
            {/* This empty div helps with scrolling */}
          </div>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={styles.messageInput}
            placeholder="Type a message"
          />
          <button onClick={handleSendMessage} className={styles.sendButton}>
            Send
          </button>
        </div>
      </div>
    </Layout>
  );
}
