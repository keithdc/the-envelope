import Landing from "../features/landing/Landing.jsx";

/**
 * / — public landing (server-rendered shell). The interactive Landing (reads
 * published templates from the client API) hydrates inside it.
 */
export default function HomePage() {
  return <Landing />;
}
