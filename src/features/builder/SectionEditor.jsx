import { Plus, Trash2 } from "lucide-react";
import { getSectionDef } from "./sectionRegistry.js";
import { uploadAsset } from "../../services/invitationApi.js";
import "./SectionEditor.css";

/**
 * Renders an edit form for one section, generated from its registry `fields`
 * metadata. Supports text / textarea / select / color controls, and `list`
 * fields (e.g. Our Story chapters, Schedule events) with add / remove / edit.
 *
 * Edits are reported up via onChange(nextProps) so the builder updates the one
 * document in state and the live preview re-renders.
 *
 * @param {{ section: any, onChange: (props:any)=>void }} props
 */
export default function SectionEditor({ section, onChange }) {
  const def = getSectionDef(section.type);
  if (!def) return null;

  const props = section.props ?? {};

  // update a single top-level prop
  const setField = (key, value) => onChange({ ...props, [key]: value });

  // ---- list helpers (operate on props[listKey]) ----
  const setItem = (listKey, index, itemKey, value) => {
    const list = [...(props[listKey] ?? [])];
    // itemKey === "" means the list holds primitives (e.g. palette colors)
    list[index] = itemKey === "" ? value : { ...list[index], [itemKey]: value };
    onChange({ ...props, [listKey]: list });
  };
  const addItem = (field) => {
    const list = [...(props[field.key] ?? [])];
    // seed a blank item shaped by itemFields (or "" for primitive lists)
    const primitive =
      field.itemFields?.length === 1 && field.itemFields[0].key === "";
    const blank = primitive
      ? ""
      : Object.fromEntries((field.itemFields ?? []).map((f) => [f.key, ""]));
    list.push(blank);
    onChange({ ...props, [field.key]: list });
  };
  const removeItem = (listKey, index) => {
    const list = [...(props[listKey] ?? [])];
    list.splice(index, 1);
    onChange({ ...props, [listKey]: list });
  };

  return (
    <div className="seditor">
      {def.fields.map((field) =>
        field.control === "list" ? (
          <ListField
            key={field.key}
            field={field}
            items={props[field.key] ?? []}
            onAdd={() => addItem(field)}
            onRemove={(i) => removeItem(field.key, i)}
            onItemChange={(i, itemKey, v) => setItem(field.key, i, itemKey, v)}
          />
        ) : (
          <Control
            key={field.key}
            field={field}
            value={props[field.key]}
            onChange={(v) => setField(field.key, v)}
          />
        ),
      )}
    </div>
  );
}

/** A single primitive control (text / textarea / select / color). */
function Control({ field, value, onChange }) {
  const common = {
    id: field.key,
    value: value ?? "",
    onChange: (e) => onChange(e.target.value),
  };
  return (
    <label className="seditor-field">
      <span className="seditor-label">{field.label}</span>

      {field.control === "textarea" && <textarea rows={2} {...common} />}

      {field.control === "select" && (
        <select {...common}>
          {(field.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      )}

      {field.control === "color" && (
        <input type="color" {...common} className="seditor-color" />
      )}

      {field.control === "image" && (
        <div className="seditor-image">
          {value ? (
            <div
              className="seditor-image-thumb"
              style={{ backgroundImage: `url(${value})` }}
            />
          ) : (
            <div className="seditor-image-thumb seditor-image-empty">
              default
            </div>
          )}
          <div className="seditor-image-actions">
            <label className="seditor-upload">
              Upload
              <input
                type="file"
                accept="image/*,.svg"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const ref = await uploadAsset(file);
                  onChange(ref.url);
                }}
              />
            </label>
            {value && (
              <button
                type="button"
                className="seditor-img-clear"
                onClick={() => onChange("")}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {(!field.control ||
        field.control === "text" ||
        field.control === "date") && (
        <input type={field.control === "date" ? "date" : "text"} {...common} />
      )}

      {field.help && <small className="seditor-help">{field.help}</small>}
    </label>
  );
}

/** A repeatable list of items with add/remove and per-item subfields. */
function ListField({ field, items, onAdd, onRemove, onItemChange }) {
  const primitive =
    field.itemFields?.length === 1 && field.itemFields[0].key === "";

  return (
    <div className="seditor-list">
      <div className="seditor-list-head">
        <span className="seditor-label">{field.label}</span>
        <button type="button" className="seditor-add" onClick={onAdd}>
          <Plus size={14} /> Add
        </button>
      </div>

      {items.length === 0 && <p className="seditor-empty">No items yet.</p>}

      {items.map((item, i) => (
        <div className="seditor-item" key={i}>
          <button
            type="button"
            className="seditor-remove"
            title="Remove"
            onClick={() => onRemove(i)}
          >
            <Trash2 size={14} />
          </button>

          {primitive ? (
            <Control
              field={{ ...field.itemFields[0], label: `#${i + 1}` }}
              value={item}
              onChange={(v) => onItemChange(i, "", v)}
            />
          ) : (
            (field.itemFields ?? []).map((sub) => (
              <Control
                key={sub.key}
                field={sub}
                value={item?.[sub.key]}
                onChange={(v) => onItemChange(i, sub.key, v)}
              />
            ))
          )}
        </div>
      ))}
    </div>
  );
}
