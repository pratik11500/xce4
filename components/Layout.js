import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import styles from "./Layout.module.css";

export default function Layout({ children }) {
  const router = useRouter();
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className={styles.mainContainer}>
        <Head>
          <title>Sign In</title>
        </Head>
        <header className={styles.header}>
          <div className={styles.logo}>
            <Image src="/avatardefault.webp" alt="Logo" width={40} height={40} />
            <h1>My App</h1>
          </div>
          <div className={styles.authButtons}>
            <button onClick={() => signIn()}>Sign in</button>
          </div>
        </header>
        <main className={styles.mainContent}>
          <p>
            Not signed in <br />{" "}
            <button onClick={() => signIn()}>Sign in</button>
          </p>
        </main>
        <footer className={styles.footer}>
          <Link href="/about">About</Link> |{" "}
          <Link href="/contact">Contact</Link>
        </footer>
      </div>
    );
  }

  return (
    <div className={styles.mainContainer}>
      <header className={styles.header}>
        <div className={styles.logo}>
         <Image src="/avatardefault.webp" alt="Logo" width={40} height={40} />
          <h1>My App</h1>
        </div>
        <div className={styles.authButtons}>
          <button onClick={() => signOut()}>Sign out</button>
        </div>
      </header>
      <main className={styles.mainContent}>{children}</main>
      <footer className={styles.footer}>
        <Link href="/about">About</Link> | <Link href="/contact">Contact</Link>
      </footer>
    </div>
  );
}
