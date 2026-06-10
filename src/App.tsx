import { useState } from "react";
import Home from "./pages/Home";
import RepositoryView from "./pages/RepositoryView";

export default function App() {
  const [currentRepo, setCurrentRepo] = useState<string | null>(null);

  if (currentRepo) {
    return (
      <RepositoryView
        repoPath={currentRepo}
        onClose={() => setCurrentRepo(null)}
      />
    );
  }

  return <Home onOpenRepo={(path) => setCurrentRepo(path)} />;
}
