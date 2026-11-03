import { useState } from "react";
import TemplatePicker from "./components/TemplatePicker.jsx";
import Invitation from "./components/Invitation.jsx";
import { invitation } from "./data/invitation.js";
import "./App.css";

/**
 * App host: pick a template, then render the invitation built from that
 * template + the invitation data. "Back to designs" returns to the picker.
 *
 * The flow is: TemplatePicker -> (select template) -> Invitation(template,data)
 * Later, a data-entry form could sit between the two to supply `invitation`.
 */
export default function App() {
  const [template, setTemplate] = useState(null);

  if (!template) {
    return <TemplatePicker onSelect={setTemplate} />;
  }

  return (
    <>
      <button
        type="button"
        className="back-to-designs"
        onClick={() => setTemplate(null)}
      >
        ← Designs
      </button>
      {/* key forces a fresh mount (restart the open animation) per template */}
      <Invitation key={template.id} template={template} data={invitation} />
    </>
  );
}
